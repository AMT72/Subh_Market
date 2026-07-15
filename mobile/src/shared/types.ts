/**
 * نماذج البيانات المشتركة لمنصة «صبح».
 *
 * ⚠️ هذا الملف مرآة لأنواع الويب في `src/lib/customer-data.ts` (مشروع الويب).
 * عند نقل المشروع إلى monorepo (حسب خطة الـ Frontend — قسم 6) تنتقل هذه
 * الملفات كما هي إلى `packages/shared/types` ويستوردها الويب والموبايل معًا.
 *
 * الفرق الوحيد عن نسخة الويب: الأيقونات تُخزَّن كأسماء نصية
 * (MaterialCommunityIcons) بدل مكوّنات React حتى تبقى البيانات قابلة
 * للمشاركة عبر أي منصة.
 */

export type Category = {
  id: string;
  name: string;
  /** اسم أيقونة من MaterialCommunityIcons */
  icon: string;
  /** ألوان بطاقة الفئة { خلفية، نص } — تعادل tone في الويب */
  tone: { bg: string; fg: string };
  description?: string;
};

export type Product = {
  id: string;
  name: string;
  merchant: string;
  categoryId: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviews: number;
  badge?: string;
  /** درجة اللون لصورة المنتج المؤقتة (نفس قيم الويب) */
  hue: number;
  description?: string;
};

export type CartLine = {
  product: Product;
  qty: number;
};

export type PaymentMethodKey = "card" | "apple" | "stc";

export type OpsOrderStatus =
  | "new"
  | "preparing"
  | "ready"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type OrderStatus = "processing" | "shipped" | "delivered" | "cancelled";

export type Order = {
  id: string;
  date: string;
  status: OrderStatus;
  opsStatus?: OpsOrderStatus;
  total: number;
  itemCount: number;
  items: { product: Product; qty: number }[];
  delivery?: Address;
  payment?: PaymentMethodKey;
};

export type Address = {
  id: string;
  label: string;
  recipient: string;
  phone: string;
  city: string;
  district: string;
  street: string;
  isDefault?: boolean;
};

export type Notification = {
  id: string;
  title: string;
  body: string;
  time: string;
  type: "order" | "promo" | "system";
  unread?: boolean;
};
