/**
 * البيانات الوهمية (Mock) — نفس بيانات الويب حرفيًا.
 *
 * ⚠️ مرآة لـ `src/lib/customer-data.ts` في مشروع الويب: نفس المنتجات
 * والفئات والأسعار والتقييمات، حتى يرى العميل هوية واحدة على المنصتين.
 * تُستبدل بالـ API الحقيقي في اليوم 6 حسب الخطة (انظر api.ts).
 */
import type { Category, CartLine, Notification, Order, PaymentMethodKey, Product } from "./types";

export const categories: Category[] = [
  { id: "fashion", name: "أزياء", icon: "tshirt-crew-outline", tone: { bg: "#FFF1F2", fg: "#E11D48" }, description: "ملابس رجالية ونسائية وأطفال" },
  { id: "electronics", name: "إلكترونيات", icon: "cellphone", tone: { bg: "#F0F9FF", fg: "#0284C7" }, description: "هواتف، حواسيب، وإكسسوارات" },
  { id: "home", name: "منزل وأثاث", icon: "sofa-outline", tone: { bg: "#FFFBEB", fg: "#D97706" }, description: "أثاث وديكور وأدوات منزلية" },
  { id: "beauty", name: "جمال وعناية", icon: "star-four-points-outline", tone: { bg: "#FDF4FF", fg: "#C026D3" }, description: "عطور، مكياج، والعناية الشخصية" },
  { id: "grocery", name: "بقالة", icon: "silverware-fork-knife", tone: { bg: "#ECFDF5", fg: "#059669" }, description: "أطعمة ومشروبات ومنتجات يومية" },
  { id: "kids", name: "أطفال", icon: "baby-carriage", tone: { bg: "#FFF7ED", fg: "#EA580C" }, description: "ألعاب ومستلزمات الأطفال" },
  { id: "sports", name: "رياضة", icon: "dumbbell", tone: { bg: "#F7FEE7", fg: "#4D7C0F" }, description: "معدات ولياقة ورياضات مختلفة" },
  { id: "books", name: "كتب", icon: "book-open-outline", tone: { bg: "#EEF2FF", fg: "#4F46E5" }, description: "كتب أدبية وعلمية ودينية" },
];

export function getCategory(id: string): Category | undefined {
  return categories.find((c) => c.id === id);
}

export const featured: Product[] = [
  { id: "p1", name: "سمّاعات لاسلكية بخاصية عزل الضوضاء", merchant: "متجر النخبة", categoryId: "electronics", price: 349, oldPrice: 499, rating: 4.7, reviews: 128, badge: "الأكثر مبيعًا", hue: 190 },
  { id: "p2", name: "عباءة سوداء بتطريز فاخر", merchant: "أناقة الرياض", categoryId: "fashion", price: 289, rating: 4.9, reviews: 86, hue: 260 },
  { id: "p3", name: "ساعة ذكية للياقة البدنية", merchant: "تِك ستور", categoryId: "electronics", price: 599, oldPrice: 749, rating: 4.6, reviews: 240, badge: "خصم ٢٠٪", hue: 20 },
  { id: "p4", name: "حقيبة ظهر جلدية", merchant: "بيت الجلود", categoryId: "fashion", price: 179, rating: 4.5, reviews: 54, hue: 30 },
];

export const bestSellers: Product[] = [
  { id: "b1", name: "قهوة عربية مختصة ٢٥٠ج", merchant: "محامص الجزيرة", categoryId: "grocery", price: 65, rating: 4.9, reviews: 512, badge: "الأعلى تقييمًا", hue: 35 },
  { id: "b2", name: "مبخرة كهربائية فاخرة", merchant: "دار العود", categoryId: "home", price: 220, rating: 4.8, reviews: 301, hue: 320 },
  { id: "b3", name: "طقم كاسات شاي زجاجي", merchant: "بيت البلور", categoryId: "home", price: 95, rating: 4.7, reviews: 189, hue: 210 },
  { id: "b4", name: "سجادة صلاة مطرّزة", merchant: "متجر الأصيل", categoryId: "home", price: 140, rating: 4.9, reviews: 402, hue: 155 },
];

export const newArrivals: Product[] = [
  { id: "n1", name: "قميص قطن كلاسيكي", merchant: "أزياء الوطن", categoryId: "fashion", price: 129, rating: 4.4, reviews: 12, badge: "جديد", hue: 220 },
  { id: "n2", name: "منظّم مكتب خشبي", merchant: "خشب وصنعة", categoryId: "home", price: 175, rating: 4.6, reviews: 8, badge: "جديد", hue: 40 },
  { id: "n3", name: "زجاجة ماء حرارية", merchant: "متجر الرحلة", categoryId: "sports", price: 89, rating: 4.5, reviews: 24, badge: "جديد", hue: 180 },
  { id: "n4", name: "شمعة معطّرة برائحة العود", merchant: "لمسة", categoryId: "home", price: 75, rating: 4.8, reviews: 17, badge: "جديد", hue: 350 },
];

export const offers: Product[] = [
  { id: "o1", name: "خلاط كهربائي متعدد الاستخدامات", merchant: "بيت المطبخ", categoryId: "home", price: 199, oldPrice: 349, rating: 4.5, reviews: 96, badge: "‎-٤٣٪", hue: 10 },
  { id: "o2", name: "طقم مناشف قطن مصري", merchant: "نسيج", categoryId: "home", price: 149, oldPrice: 229, rating: 4.6, reviews: 71, badge: "‎-٣٥٪", hue: 200 },
  { id: "o3", name: "لعبة تركيب للأطفال", merchant: "عالم الصغار", categoryId: "kids", price: 79, oldPrice: 129, rating: 4.7, reviews: 143, badge: "‎-٣٩٪", hue: 100 },
  { id: "o4", name: "مصباح مكتبي LED", merchant: "إنارة بلس", categoryId: "home", price: 119, oldPrice: 189, rating: 4.4, reviews: 58, badge: "‎-٣٧٪", hue: 50 },
];

export const allProducts: Product[] = [...featured, ...bestSellers, ...newArrivals, ...offers];

export function getProduct(id: string): Product | undefined {
  return allProducts.find((p) => p.id === id);
}

export function getProductsByCategory(categoryId: string): Product[] {
  return allProducts.filter((p) => p.categoryId === categoryId);
}

export const paymentMethodLabels: Record<PaymentMethodKey, string> = {
  card: "بطاقة ائتمانية",
  apple: "Apple Pay",
  stc: "STC Pay",
};

/**
 * الطلبات تبدأ فارغة — العميل الجديد لا يملك سجلّ طلبات حتى ينفّذ طلبًا
 * في الجلسة الحالية (نفس سلوك الويب).
 */
export const orders: Order[] = [];

export const notifications: Notification[] = [
  { id: "n1", title: "طلبك في الطريق", body: "طلب SUBH-10245 خرج للتوصيل وسيصلك اليوم.", time: "قبل ساعتين", type: "order", unread: true },
  { id: "n2", title: "عروض صبح الأسبوعية", body: "خصومات تصل إلى ٥٠٪ على مئات المنتجات.", time: "أمس", type: "promo", unread: true },
  { id: "n3", title: "تم تأكيد طلبك", body: "استلمنا طلبك SUBH-10245 وسيتم تجهيزه قريبًا.", time: "قبل يومين", type: "order" },
  { id: "n4", title: "شكرًا لتقييمك", body: "تم نشر تقييمك على منتج «قهوة عربية مختصة».", time: "الأسبوع الماضي", type: "system" },
];

export type { CartLine };
