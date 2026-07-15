/**
 * ثوابت مشتركة — تعادل قسم constants في `packages/shared` حسب خطة الـ Frontend.
 * حالات الطلب هنا هي المرجع الموحّد (Enum مشترك) بين الويب والموبايل.
 */
import type { OpsOrderStatus, OrderStatus } from "./types";

export const orderStatusLabels: Record<OrderStatus, string> = {
  processing: "قيد التجهيز",
  shipped: "في الطريق",
  delivered: "تم التوصيل",
  cancelled: "ملغى",
};

export const opsOrderStatusLabels: Record<OpsOrderStatus, string> = {
  new: "جديد",
  preparing: "قيد التجهيز",
  ready: "جاهز للشحن",
  out_for_delivery: "خرج للتوصيل",
  delivered: "تم التوصيل",
  cancelled: "ملغى",
};

/** تحويل الحالة التشغيلية إلى الحالة الظاهرة للعميل (نفس دالة الويب). */
export function opsToBaseStatus(op: OpsOrderStatus): OrderStatus {
  switch (op) {
    case "new":
    case "preparing":
      return "processing";
    case "ready":
    case "out_for_delivery":
      return "shipped";
    case "delivered":
      return "delivered";
    case "cancelled":
      return "cancelled";
  }
}

/** عملة العرض */
export const CURRENCY_LABEL = "ر.س";

/** مهلة إعادة إرسال رمز التحقق (نفس قيمة الويب في verify.tsx) */
export const OTP_RESEND_SECONDS = 45;

/** طول رمز التحقق */
export const OTP_LENGTH = 6;
