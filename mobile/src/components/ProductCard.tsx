import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, View, type ViewStyle } from "react-native";
import { AppText } from "./ui/AppText";
import { useCartStore } from "@/lib/cart-store";
import { colors, productTone, radius, shadow } from "@/lib/theme";
import { CURRENCY_LABEL, type Product } from "@/shared";

/**
 * بطاقة المنتج — مطابقة لبطاقة الويب (ProductCard.tsx):
 * صورة مؤقتة متدرجة حسب hue، شارة، سطر ثقة «شحن وضمان من صبح»،
 * الاسم، التقييم، السعر مع زر إضافة دائري.
 *
 * كما في الويب: معلومات التاجر لا تظهر على البطاقة — تظهر فقط في صفحة
 * تفاصيل المنتج، لأن صبح هي واجهة السوق وضمانه.
 */
export function ProductCard({ product, style }: { product: Product; style?: ViewStyle }) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const discounted = !!product.oldPrice && product.oldPrice > product.price;
  const [toneStart, toneEnd] = productTone(product.hue);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={product.name}
      onPress={() => router.push(`/product/${product.id}`)}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.92 }, style]}
    >
      <LinearGradient
        colors={[toneStart, toneEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.image}
      >
        <View style={styles.imageIcon}>
          <Ionicons name="bag-handle-outline" size={30} color="#FFFFFF" />
        </View>
        {product.badge ? (
          <View
            style={[
              styles.badge,
              { backgroundColor: discounted ? colors.destructive : colors.background },
            ]}
          >
            <AppText
              weight="bold"
              size={10}
              color={discounted ? colors.destructiveForeground : colors.foreground}
            >
              {product.badge}
            </AppText>
          </View>
        ) : null}
      </LinearGradient>

      <View style={styles.body}>
        <AppText weight="semibold" size={10.5} color={colors.primary}>
          شحن وضمان من صبح
        </AppText>
        <AppText weight="bold" size={13} numberOfLines={2} style={styles.name}>
          {product.name}
        </AppText>

        <View style={styles.ratingRow}>
          <Ionicons name="star" size={13} color={colors.warning} />
          <AppText weight="semibold" size={11.5} ltr>
            {product.rating.toFixed(1)}
          </AppText>
          <AppText size={11.5} color={colors.mutedForeground} ltr>
            ({product.reviews})
          </AppText>
        </View>

        <View style={styles.priceRow}>
          <View>
            <AppText weight="black" size={17}>
              {product.price}{" "}
              <AppText weight="bold" size={11}>
                {CURRENCY_LABEL}
              </AppText>
            </AppText>
            {discounted ? (
              <AppText
                size={11}
                color={colors.mutedForeground}
                style={{ textDecorationLine: "line-through" }}
              >
                {product.oldPrice} {CURRENCY_LABEL}
              </AppText>
            ) : null}
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`أضف ${product.name} إلى السلّة`}
            onPress={(e) => {
              e.stopPropagation();
              addItem(product.id, 1);
            }}
            style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.8 }]}
          >
            <Ionicons name="add" size={20} color={colors.primaryForeground} />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.x2,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    ...shadow.soft,
  },
  image: {
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  imageIcon: {
    width: 64,
    height: 64,
    borderRadius: radius.x2,
    backgroundColor: "rgba(255,255,255,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: 12,
    right: 12,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 2,
    ...shadow.soft,
  },
  body: {
    padding: 14,
    gap: 4,
  },
  name: {
    minHeight: 44,
  },
  ratingRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
  },
  priceRow: {
    flexDirection: "row-reverse",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingTop: 6,
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...shadow.soft,
  },
});
