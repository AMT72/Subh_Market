import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText } from "@/components/ui/AppText";
import { EmptyState } from "@/components/EmptyState";
import { ProductCard } from "@/components/ProductCard";
import { colors } from "@/lib/theme";
import { getCategory, getProductsByCategory } from "@/shared";

/** منتجات فئة — تعادل صفحة /customer/category/$id في الويب */
export default function CategoryScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const category = getCategory(id ?? "");
  const products = getProductsByCategory(id ?? "");

  return (
    <SafeAreaView edges={["top"]} style={styles.screen}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="رجوع"
          style={styles.backBtn}
        >
          <Ionicons name="arrow-forward" size={20} color={colors.foreground} />
        </Pressable>
        <View style={styles.headerText}>
          <AppText weight="extrabold" size={18}>
            {category?.name ?? "الفئة"}
          </AppText>
          {category?.description ? (
            <AppText size={11.5} color={colors.mutedForeground}>
              {category.description}
            </AppText>
          ) : null}
        </View>
      </View>

      {products.length === 0 ? (
        <EmptyState
          icon="cube-outline"
          title="لا توجد منتجات في هذه الفئة حاليًا"
          body="تُضاف المنتجات مركزيًا من إدارة صبح — عد قريبًا."
          actionLabel="العودة"
          onAction={() => router.back()}
        />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(p) => p.id}
          numColumns={2}
          columnWrapperStyle={styles.rowWrap}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <ProductCard product={item} style={styles.card} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.muted,
  },
  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    gap: 0,
    flex: 1,
  },
  list: {
    padding: 20,
    gap: 12,
  },
  rowWrap: {
    flexDirection: "row-reverse",
    gap: 12,
  },
  card: {
    flex: 1,
  },
});
