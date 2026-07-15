import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/EmptyState";
import { useCartStore } from "@/lib/cart-store";
import { colors, productTone, radius } from "@/lib/theme";
import { CURRENCY_LABEL, getCategory, getProduct } from "@/shared";

/**
 * تفاصيل المنتج — نسخة مبدئية تكفي لترابط رحلة اليوم 4
 * (البطاقات تفتح صفحة حقيقية)، وتُستكمل صورًا وتقييمات في اليوم 9.
 * كما في الويب: اسم التاجر يظهر هنا فقط، والضمان باسم صبح.
 */
export default function ProductScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width } = useWindowDimensions();
  const addItem = useCartStore((s) => s.addItem);

  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const addedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (addedTimer.current) clearTimeout(addedTimer.current);
    };
  }, []);

  const product = getProduct(id ?? "");
  if (!product) {
    return (
      <SafeAreaView style={styles.screen}>
        <EmptyState
          icon="alert-circle-outline"
          title="المنتج غير موجود"
          actionLabel="العودة"
          onAction={() => router.back()}
        />
      </SafeAreaView>
    );
  }

  const [toneStart, toneEnd] = productTone(product.hue);
  const discounted = !!product.oldPrice && product.oldPrice > product.price;
  const category = getCategory(product.categoryId);

  function handleAdd() {
    addItem(product!.id, qty);
    setAdded(true);
    if (addedTimer.current) clearTimeout(addedTimer.current);
    addedTimer.current = setTimeout(() => setAdded(false), 1800);
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View>
          <LinearGradient
            colors={[toneStart, toneEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.hero, { height: Math.min(width, 420) }]}
          >
            <View style={styles.heroIcon}>
              <Ionicons name="bag-handle-outline" size={54} color="#FFFFFF" />
            </View>
          </LinearGradient>
          {/* زر الرجوع — السهم لليمين لأن التنقل عربي RTL */}
          <Pressable
            onPress={() => router.back()}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel="رجوع"
          >
            <Ionicons name="arrow-forward" size={20} color={colors.foreground} />
          </Pressable>
          {product.badge ? (
            <View
              style={[
                styles.badge,
                { backgroundColor: discounted ? colors.destructive : colors.background },
              ]}
            >
              <AppText
                weight="bold"
                size={11}
                color={discounted ? colors.destructiveForeground : colors.foreground}
              >
                {product.badge}
              </AppText>
            </View>
          ) : null}
        </View>

        <View style={styles.body}>
          <View style={styles.trustRow}>
            <Ionicons name="shield-checkmark-outline" size={14} color={colors.primary} />
            <AppText weight="semibold" size={12} color={colors.primary}>
              شحن وضمان من صبح
            </AppText>
            {category ? (
              <AppText size={12} color={colors.mutedForeground}>
                · {category.name}
              </AppText>
            ) : null}
          </View>

          <AppText weight="extrabold" size={20}>
            {product.name}
          </AppText>

          <AppText size={12.5} color={colors.mutedForeground}>
            يُباع عبر {product.merchant} — بضمان منصة صبح وأسعارها الموحّدة.
          </AppText>

          <View style={styles.ratingRow}>
            <Ionicons name="star" size={15} color={colors.warning} />
            <AppText weight="semibold" size={13} ltr>
              {product.rating.toFixed(1)}
            </AppText>
            <AppText size={13} color={colors.mutedForeground} ltr>
              ({product.reviews})
            </AppText>
            <AppText size={12} color={colors.mutedForeground}>
              تقييم العملاء
            </AppText>
          </View>

          <View style={styles.priceRow}>
            <AppText weight="black" size={26}>
              {product.price}{" "}
              <AppText weight="bold" size={14}>
                {CURRENCY_LABEL}
              </AppText>
            </AppText>
            {discounted ? (
              <AppText
                size={14}
                color={colors.mutedForeground}
                style={{ textDecorationLine: "line-through" }}
              >
                {product.oldPrice} {CURRENCY_LABEL}
              </AppText>
            ) : null}
          </View>

          <AppText size={13} color={colors.mutedForeground} style={styles.description}>
            {product.description ??
              "منتج مختار بعناية ضمن تشكيلة صبح، بجودة معتمدة وسعر موحّد تحدّده المنصة. التفاصيل الكاملة والصور تُستكمل عند الربط بالـ API في اليوم 6."}
          </AppText>

          <View style={styles.actionRow}>
            <View style={styles.stepper}>
              <Pressable onPress={() => setQty((q) => q + 1)} style={styles.stepBtn} accessibilityRole="button">
                <Ionicons name="add" size={18} color={colors.foreground} />
              </Pressable>
              <AppText weight="bold" size={16} ltr style={styles.qty}>
                {qty}
              </AppText>
              <Pressable
                onPress={() => setQty((q) => Math.max(1, q - 1))}
                style={styles.stepBtn}
                accessibilityRole="button"
              >
                <Ionicons name="remove" size={18} color={colors.foreground} />
              </Pressable>
            </View>
            <Button
              title={added ? "تمت الإضافة ✓" : "أضف إلى السلّة"}
              onPress={handleAdd}
              icon={
                added ? undefined : (
                  <Ionicons name="cart-outline" size={18} color={colors.primaryForeground} />
                )
              }
              style={styles.addBtn}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingBottom: 32,
  },
  hero: {
    alignItems: "center",
    justifyContent: "center",
  },
  heroIcon: {
    width: 110,
    height: 110,
    borderRadius: radius.x3,
    backgroundColor: "rgba(255,255,255,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  backBtn: {
    position: "absolute",
    top: 14,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    bottom: 14,
    right: 16,
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 3,
  },
  body: {
    padding: 20,
    gap: 8,
  },
  trustRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
  },
  ratingRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 5,
  },
  priceRow: {
    flexDirection: "row-reverse",
    alignItems: "flex-end",
    gap: 10,
    marginTop: 4,
  },
  description: {
    marginTop: 6,
  },
  actionRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
    marginTop: 16,
  },
  stepper: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: 4,
  },
  stepBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.lg,
    backgroundColor: colors.muted,
    alignItems: "center",
    justifyContent: "center",
  },
  qty: {
    minWidth: 26,
    textAlign: "center",
  },
  addBtn: {
    flex: 1,
  },
});
