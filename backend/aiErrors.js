/**
 * AI-specific errors.
 *
 * These extend ApiError so the centralized error handler in app.js already
 * understands them, but they carry an extra `code` so the handler (and the
 * client) can distinguish WHY an AI call failed:
 *
 *   'not_configured'  → 503  (AI_API_KEY missing; feature is off)
 *   'timeout'         → 504  (the provider did not answer in time)
 *   'provider_error'  → 502  (OpenAI returned a non-2xx / network failure)
 *   'parse_error'     → 502  (the model replied, but we couldn't parse it)
 *
 * Security: these never include the API key or the raw provider body in the
 * response — only a short, safe message. The raw detail is logged server-side.
 */
import { ApiError } from '../../../utils/ApiError.js';

export class AiProviderError extends ApiError {
  /**
   * @param {number} status   HTTP status to send to the client.
   * @param {string} message  Safe, user-facing message (Arabic).
   * @param {object} [opts]
   * @param {string} opts.code        Machine-readable error code.
   * @param {object} [opts.details]   Extra structured details for the response.
   */
  constructor(status, message, { code, details = null } = {}) {
    super(status, message, details);
    this.name = 'AiProviderError';
    this.code = code || 'provider_error';
  }
}

/** AI feature is disabled because AI_API_KEY is not set. → 503 */
export const aiNotConfigured = () =>
  new AiProviderError(503, 'خدمة البحث الذكي غير مهيأة حاليًا', {
    code: 'not_configured',
    details: { hint: 'لم يتم ضبط مفتاح الذكاء الاصطناعي (AI_API_KEY).' },
  });

/** The provider did not respond before the timeout elapsed. → 504 */
export const aiTimeout = (timeoutMs) =>
  new AiProviderError(504, 'انتهت مهلة انتظار مزود الذكاء الاصطناعي، حاول لاحقًا', {
    code: 'timeout',
    details: { timeout_ms: timeoutMs },
  });

/** The provider answered with an error status or was unreachable. → 502 */
export const aiProviderError = (status, message) =>
  new AiProviderError(502, 'تعذّر الحصول على نتيجة من مزود الذكاء الاصطناعي', {
    code: 'provider_error',
    details: {
      provider_status: status || null,
      // Keep the provider message short and sanitized; logged in full elsewhere.
      provider_message: message ? String(message).slice(0, 200) : null,
    },
  });

/** The provider replied but we could not parse a valid result. → 502 */
export const aiParseError = (reason) =>
  new AiProviderError(502, 'تعذّر معالجة استجابة مزود الذكاء الاصطناعي', {
    code: 'parse_error',
    details: reason ? { reason: String(reason).slice(0, 200) } : null,
  });

export default AiProviderError;
