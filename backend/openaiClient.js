/**
 * Low-level OpenAI client.
 *
 * Single responsibility: call the OpenAI Chat Completions endpoint with a
 * reliable timeout and translate provider/network failures into AiProviderError.
 * No business logic lives here.
 *
 * Why fetch + AbortController (not the `openai` SDK / axios):
 *  - Node >= 18 ships a global fetch, so we add zero dependencies.
 *  - AbortController gives us a clean, cancellation-aware timeout that also
 *    releases the underlying socket — better than racing setTimeout alone.
 *
 * Security: the API key is read from env only and is NEVER accepted as a
 * parameter, logged, or returned. Provider error bodies are trimmed before
 * being attached to errors.
 */
import env from '../../../config/env.js';
import logger from '../../../config/logger.js';
import { aiTimeout, aiProviderError, aiNotConfigured } from '../utils/aiErrors.js';

const OPENAI_CHAT_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * Call OpenAI Chat Completions with a system+user turn.
 *
 * @param {object} params
 * @param {string} params.system    System prompt.
 * @param {string} params.user      User turn content.
 * @param {object} [params.options]
 * @param {string} [params.options.model]     Override env.aiModel.
 * @param {number} [params.options.maxTokens] Override env.aiMaxTokens.
 * @param {number} [params.options.timeoutMs] Override env.aiTimeoutMs.
 * @returns {Promise<{ content: string, usage: object|null }>}
 *   `content` is the assistant message text; `usage` is the token usage object
 *   from OpenAI (or null when absent).
 * @throws {AiProviderError} on timeout, non-2xx response, or network failure.
 */
export async function chatCompletion({ system, user, options = {} }) {
  // Refuse to call without a key — callers gate on this too, but defend here.
  if (!env.aiApiKeyConfigured) {
    throw aiNotConfigured();
  }

  const model = options.model || env.aiModel;
  const maxTokens = options.maxTokens || env.aiMaxTokens;
  const timeoutMs = options.timeoutMs || env.aiTimeoutMs;

  const body = {
    model,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    max_tokens: maxTokens,
    temperature: 0, // deterministic extraction — we want stable structured output
  };

  // --- Timeout via AbortController -----------------------------------------
  // setTimeout fires once; if the fetch resolves first we clear it in finally.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response;
  try {
    response = await fetch(OPENAI_CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.aiApiKey}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (err) {
    // AbortError => our timeout fired (or the client aborted).
    if (err && err.name === 'AbortError') {
      logger.warn(`[ai] OpenAI call timed out after ${timeoutMs}ms (model=${model})`);
      throw aiTimeout(timeoutMs);
    }
    // Any other throw (DNS, connection reset, etc.) is a provider/network error.
    logger.error('[ai] OpenAI network failure:', err.message);
    throw aiProviderError(0, err.message);
  } finally {
    clearTimeout(timer);
  }

  // --- Non-2xx handling -----------------------------------------------------
  if (!response.ok) {
    let providerMessage = `HTTP ${response.status}`;
    try {
      const errJson = await response.json();
      providerMessage = errJson?.error?.message || providerMessage;
    } catch {
      /* ignore JSON parse errors on error bodies */
    }
    logger.error(`[ai] OpenAI error ${response.status}: ${providerMessage}`);
    throw aiProviderError(response.status, providerMessage);
  }

  // --- Parse success body ---------------------------------------------------
  let data;
  try {
    data = await response.json();
  } catch (err) {
    logger.error('[ai] Failed to parse OpenAI success body:', err.message);
    throw aiProviderError(response.status, 'invalid JSON in success response');
  }

  const content = data?.choices?.[0]?.message?.content;
  const usage = data?.usage ?? null;

  if (typeof content !== 'string' || content.trim() === '') {
    logger.error('[ai] OpenAI returned an empty completion');
    throw aiProviderError(response.status, 'empty completion');
  }

  if (!env.isProd) {
    logger.debug(`[ai] OpenAI ok (model=${model}, tokens=${usage?.total_tokens ?? '?'})`);
  }

  return { content, usage };
}

export default chatCompletion;
