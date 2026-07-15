import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText } from "@/components/ui/AppText";
import { EmptyState } from "@/components/EmptyState";
import { colors } from "@/lib/theme";
import { orders } from "@/shared";

/**
 * طلباتي — تعادل صفحة /customer/orders في الويب.
 * كما في الويب: العميل الجديد يبدأ بلا طلبات، وتُعبّأ القائمة بعد أول
 * عملية شراء (تكتمل الرحلة في اليوم 9: الدفع والتتبع).
 */
export default function OrdersScreen() {
  const router = useRouter();

  return (
    <SafeAreaView edges={["top"]} style={styles.screen}>
      <View style={styles.header}>
        <AppText weight="extrabold" size={22}>
          طلباتي
        </AppText>
        <AppText size={12.5} color={colors.mutedForeground}>
          تتبّع حالة طلباتك وفواتيرك
        </AppText>
      </View>

      {orders.length === 0 ? (
        <EmptyState
          icon="receipt-outline"
          title="لا توجد طلبات بعد"
          body="بعد إتمام أول عملية شراء ستجد هنا طلباتك وحالتها خطوة بخطوة حتى باب المنزل."
          actionLabel="تصفّح المنتجات"
          onAction={() => router.push("/(tabs)")}
        />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.muted,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 2,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
});
