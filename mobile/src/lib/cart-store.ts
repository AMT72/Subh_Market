/**
 * مخزن السلّة (Zustand + AsyncStorage) — يعادل src/lib/cart-context.tsx في الويب.
 *
 * متطلب الوثيقة: «لا فقدان للسلة» في حالات الاتصال الضعيف — لذلك تُحفَظ
 * السلّة محليًا وتبقى بعد إغلاق التطبيق. نخزّن المعرّف والكمية فقط
 * ونشتق بيانات المنتج من طبقة shared حتى تبقى الأسعار مصدرها واحدًا.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { getProduct } from "@/shared";
import type { CartLine } from "@/shared";

type StoredLine = { productId: string; qty: number };

type CartState = {
  lines: StoredLine[];
  addItem: (productId: string, qty?: number) => void;
  removeItem: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],

      addItem: (productId, qty = 1) => {
        const lines = [...get().lines];
        const existing = lines.find((l) => l.productId === productId);
        if (existing) {
          existing.qty += qty;
        } else {
          lines.push({ productId, qty });
        }
        set({ lines });
      },

      removeItem: (productId) => {
        set({ lines: get().lines.filter((l) => l.productId !== productId) });
      },

      setQty: (productId, qty) => {
        if (qty <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          lines: get().lines.map((l) => (l.productId === productId ? { ...l, qty } : l)),
        });
      },

      clear: () => set({ lines: [] }),
    }),
    {
      name: "subh.cart",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

/** عدد القطع الكلي (لشارة تبويب السلّة) */
export function useCartCount(): number {
  return useCartStore((s) => s.lines.reduce((sum, l) => sum + l.qty, 0));
}

/** أسطر السلّة ببيانات المنتج الكاملة، مع تجاهل أي منتج لم يعد موجودًا */
export function useCartLines(): CartLine[] {
  const lines = useCartStore((s) => s.lines);
  return lines.flatMap((l) => {
    const product = getProduct(l.productId);
    return product ? [{ product, qty: l.qty }] : [];
  });
}

/** المجموع الفرعي */
export function useCartSubtotal(): number {
  return useCartLines().reduce((sum, l) => sum + l.product.price * l.qty, 0);
}
