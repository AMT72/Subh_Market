/**
 * طبقة الـ API — وضع Mock (اليوم 4).
 *
 * حسب خطة الـ Frontend (قسم 8): طبقة قابلة للتبديل بين mock و live عبر
 * متغير البيئة EXPO_PUBLIC_API_MODE. اليوم 6 تُستبدل الدوال هنا بنداءات
 * حقيقية إلى نفس الـ endpoints الموثقة في الخطة (قسم 7):
 *
 *   requestOtp  → POST /auth/otp/request
 *   verifyOtp   → POST /auth/otp/verify
 *   getHomeFeed → GET  /products + GET /categories
 *
 * سلوك الـ Mock يحاكي التأخير والأخطاء (رمز 000000 يفشل دائمًا)
 * لاختبار حالات الاتصال الضعيف — نفس سلوك الويب.
 */
import { bestSellers, categories, featured, newArrivals, offers } from "./mock-data";
import type { Category, Product } from "./types";

export const API_MODE: "mock" | "live" =
  process.env.EXPO_PUBLIC_API_MODE === "live" ? "live" : "mock";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string };

/** طلب إرسال رمز تحقق إلى رقم جوال (بصيغة +9665XXXXXXXX) */
export async function requestOtp(phone: string): Promise<ApiResult<{ sent: boolean }>> {
  await delay(700);
  if (!phone.startsWith("+9665")) {
    return { ok: false, error: "رقم الجوال غير صالح." };
  }
  return { ok: true, data: { sent: true } };
}

/** التحقق من رمز OTP — في وضع Mock أي رمز صحيح ما عدا 000000 (نفس الويب) */
export async function verifyOtp(
  phone: string,
  code: string,
): Promise<ApiResult<{ token: string }>> {
  await delay(800);
  if (code === "000000") {
    return { ok: false, error: "رمز التحقق غير صحيح. يرجى المحاولة مرة أخرى." };
  }
  return { ok: true, data: { token: `mock-token-${phone}-${Date.now()}` } };
}

export type HomeFeed = {
  categories: Category[];
  featured: Product[];
  bestSellers: Product[];
  newArrivals: Product[];
  offers: Product[];
};

/** محتوى الشاشة الرئيسية */
export async function getHomeFeed(): Promise<ApiResult<HomeFeed>> {
  await delay(300);
  return { ok: true, data: { categories, featured, bestSellers, newArrivals, offers } };
}
