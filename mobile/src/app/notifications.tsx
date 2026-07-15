import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText } from "@/components/ui/AppText";
import { colors, radius } from "@/lib/theme";
import { notifications, type Notification } from "@/shared";

const TYPE_META: Record<Notification["type"], { icon: keyof typeof Ionicons.glyphMap; bg: string; fg: string }> = {
  order: { icon: "cube-outline", bg: "#DEF3F0", fg: "#0F766E" },
  promo: { icon: "pricetag-outline", bg: "#FEF3C7", fg: "#B45309" },
  system: { icon: "information-circle-outline", bg: "#F4F5F7", fg: "#64748B" },
};

/** الإشعارات — تعادل صفحة /customer/notifications في الويب (بيانات Mock) */
export default function NotificationsScreen() {
  const router = useRouter();

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
        <AppText weight="extrabold" size={18}>
          الإشعارات
        </AppText>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(n) => n.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const meta = TYPE_META[item.type];
          return (
            <View style={[styles.card, item.unread && styles.cardUnread]}>
              <View style={[styles.iconTile, { backgroundColor: meta.bg }]}>
                <Ionicons name={meta.icon} size={20} color={meta.fg} />
              </View>
              <View style={styles.cardBody}>
                <View style={styles.titleRow}>
                  <AppText weight="bold" size={13.5} style={{ flexShrink: 1 }}>
                    {item.title}
                  </AppText>
                  {item.unread ? <View style={styles.unreadDot} /> : null}
                </View>
                <AppText size={12} color={colors.mutedForeground}>
                  {item.body}
                </AppText>
                <AppText size={10.5} color={colors.mutedForeground}>
                  {item.time}
                </AppText>
              </View>
            </View>
          );
        }}
      />
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
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  list: {
    padding: 20,
    gap: 10,
  },
  card: {
    flexDirection: "row-reverse",
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: radius.x2,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  cardUnread: {
    borderColor: colors.primary + "40",
    backgroundColor: "#FBFEFD",
  },
  iconTile: {
    width: 42,
    height: 42,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  cardBody: {
    flex: 1,
    gap: 2,
  },
  titleRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: radius.full,
    backgroundColor: colors.destructive,
  },
});
