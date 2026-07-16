/**
 * AI product-search business logic.
 *
 * Two-step semantic search:
 *   1) analyzeSearchIntent() — ask OpenAI to turn the shopper's free-text
 *      Arabic query into a small, validated JSON filter object.
 *   2) searchProducts() — run that filter against the catalog with a normal,
 *      indexed Sequelize query. The DB (not the LLM) decides results, so we
 *      stay cheap, fast, and deterministic.
 *
 * This separation means the model only ever does language understanding; it
 * never touches the database or returns product rows directly.
 */
import { Op } from 'sequelize';

import logger from '../../../config/logger.js';
import env from '../../../config/env.js';
import { chatCompletion } from './openaiClient.js';
import { aiParseError, aiNotConfigured } from '../utils/aiErrors.js';

// Guard rails so a bad/crafted model output can never produce a pathological
// DB query.
const MAX_KEYWORDS = 5; // cap OR-of-ILIKE clauses per request
const MAX_KEYWORD_LEN = 60; // ignore absurdly long single tokens
const PRICE_FLOOR = 0;
const PRICE_CEIL = 10_000_000; // 10M SAR — sanity ceiling, not a business rule

/**
 * Build the system prompt that constrains the model to JSON-only output.
 * Kept in one place so it's easy to review/tune.
 */
function buildSystemPrompt() {
  return [
    'أنت مسؤول عن تحليل استعلام بحث من عميل في متجر إلكتروني سعودي.',
    'حلّل النص العربي واستخرج قصد البحث، ثم أعد النتيجة كـ JSON صالح فقط (بدون أي شرح أو نص خارج كائن JSON).',
    '',
    'مخطط JSON المطلوب (كل الحقول اختيارية إلا keywords):',
    '{',
    '  "keywords": ["كلمة1", "كلمة2"],     // كلمات/عبارات مفتاحية للبحث، حتى 5، بدون رموز زائدة',
    '  "category_slug": "coffee",          // slug التصنيف إن أمكن استنباطه، وإلا احذفه',
    '  "price_min": 0,                     // أدنى سعر بالريال السعودي إن ذُكر، وإلا احذفه',
    '  "price_max": 100                     // أقصى سعر بالريال السعودي إن ذُكر، وإلا احذفه',
    '}',
    '',
    'قواعد صارمة:',
    '- أعد JSON فقط. لا علامات اقتباس خارجية، لا ```، لا تفسير.',
    '- keywords: كلمات دالة على المنتج (مثل اسمه أو وصفه) وليست كلمات وقف أو أرقام صرف.',
    '- price_min <= price_max دائمًا.',
    '- إن لم تستطع استنباط حقل فاحذفه بدل وضع قيمة فارغة أو صفر.',
  ].join('\n');
}

/**
 * Extract a JSON object from a model completion that *should* be JSON-only,
 * but defensively strips stray code fences / surrounding prose first.
 */
function extractJson(content) {
  let text = content.trim();

  // Strip ```json ... ``` fences if the model added them despite instructions.
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) text = fence[1].trim();

  // If there is still surrounding prose, grab the outermost {...} block.
  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  if (first !== -1 && last !== -1 && last > first) {
    text = text.slice(first, last + 1);
  }

  return JSON.parse(text);
}

/**
 * Validate + sanitize the parsed intent. Coerces types, drops garbage, and
 * enforces the guard rails. Always returns a well-shaped object.
 */
function sanitizeIntent(parsed) {
  const intent = { keywords: [] };

  if (Array.isArray(parsed.keywords)) {
    const seen = new Set();
    for (const kwRaw of parsed.keywords) {
      if (typeof kwRaw !== 'string') continue;
      const kw = kwRaw.trim();
      if (kw.length === 0 || kw.length > MAX_KEYWORD_LEN) continue;
      const lower = kw.toLowerCase();
      if (seen.has(lower)) continue; // de-dup
      seen.add(lower);
      intent.keywords.push(kw);
      if (intent.keywords.length >= MAX_KEYWORDS) break;
    }
  }

  if (typeof parsed.category_slug === 'string' && parsed.category_slug.trim()) {
    // slugs are URL-safe by convention; allow only a conservative charset.
    const slug = parsed.category_slug.trim().slice(0, 100);
    if (/^[a-z0-9-]+$/i.test(slug)) intent.category_slug = slug;
  }

  const clamp = (v) => {
    const n = typeof v === 'number' && Number.isFinite(v) ? v : Number.parseFloat(v);
    if (!Number.isFinite(n)) return null;
    return Math.min(Math.max(n, PRICE_FLOOR), PRICE_CEIL);
  };

  const pMin = clamp(parsed.price_min);
  const pMax = clamp(parsed.price_max);
  if (pMin !== null) intent.price_min = pMin;
  if (pMax !== null) intent.price_max = pMax;
  // Drop an inverted/contradictory range rather than letting it match nothing
  // silently in surprising ways — keep whichever bound is most informative.
  if (intent.price_min != null && intent.price_max != null && intent.price_min > intent.price_max) {
    delete intent.price_max;
  }

  return intent;
}

/**
 * Step 1 — Turn a free-text query into a structured search intent.
 *
 * @param {object} params
 * @param {string} params.query  The shopper's search text.
 * @param {object} [params.options] Forwarded to the OpenAI client.
 * @returns {Promise<object>} Sanitized intent: { keywords, category_slug?, price_min?, price_max? }
 */
export async function analyzeSearchIntent({ query, options }) {
  if (!env.aiApiKeyConfigured) throw aiNotConfigured();

  const { content } = await chatCompletion({
    system: buildSystemPrompt(),
    user: query,
    options,
  });

  let parsed;
  try {
    parsed = extractJson(content);
  } catch (err) {
    logger.error('[ai] Failed to parse intent JSON:', err.message);
    throw aiParseError(err.message);
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw aiParseError('model did not return a JSON object');
  }

  const intent = sanitizeIntent(parsed);
  logger.debug('[ai] Intent analyzed:', JSON.stringify(intent));
  return intent;
}

/**
 * Step 2 — Run the (sanitized) intent against the catalog.
 *
 * Uses standard indexed ILIKE on name/description/sku. Keywords are OR-ed;
 * price and category are AND-ed. Active products only.
 *
 * @param {object} params
 * @param {import('sequelize').Model} params.Product
 * @param {import('sequelize').Model} params.Category
 * @param {object} params.intent       Output of analyzeSearchIntent.
 * @param {object} params.pagination   { page, limit, offset } from parsePagination.
 * @returns {Promise<{ rows: any[], count: number }>}
 */
export async function searchProducts({ Product, Category, intent, pagination }) {
  const { page, limit, offset } = pagination;

  const where = { status: 'active' };

  // --- Keyword matching (OR over fields) -----------------------------------
  const keywords = (intent.keywords || []).filter(Boolean);
  if (keywords.length > 0) {
    const fields = ['name_ar', 'description_ar', 'sku'];
    where[Op.and] = [
      {
        [Op.or]: keywords.flatMap((kw) =>
          fields.map((field) => ({ [field]: { [Op.iLike]: `%${kw}%` } })),
        ),
      },
    ];
  }

  // --- Price band (AND) ----------------------------------------------------
  if (intent.price_min != null || intent.price_max != null) {
    where.price_sar = {};
    if (intent.price_min != null) where.price_sar[Op.gte] = intent.price_min;
    if (intent.price_max != null) where.price_sar[Op.lte] = intent.price_max;
  }

  // --- Category via slug (AND) --------------------------------------------
  // Resolve the slug to an id once, then filter. Kept simple for the MVP.
  let categoryInclude = [];
  if (intent.category_slug) {
    const category = await Category.findOne({
      where: { slug: intent.category_slug, is_active: true },
      attributes: ['id'],
    });
    if (category) {
      where.category_id = category.id;
    } else {
      // Unknown slug => no category match; don't silently broaden to everything.
      // Instead return an empty page rather than guessing.
      return { rows: [], count: 0, page, limit };
    }
  }

  const { rows, count } = await Product.findAndCountAll({
    where,
    include: categoryInclude,
    limit,
    offset,
    order: [['created_at', 'DESC']],
    distinct: true,
  });

  return { rows, count, page, limit };
}

export default { analyzeSearchIntent, searchProducts };
