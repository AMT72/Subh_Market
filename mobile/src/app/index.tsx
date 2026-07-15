import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { BrandMark } from "@/components/BrandMark";
import { useAuthStore } from "@/lib/auth-store";
import { colors } from "@/lib/theme";

const MIN_SPLASH_MS = 900;

/**
 * شاشة Splash + بوابة التوجيه:
 * يقرأ الجلسة المخزّنة ثم يوجّه إلى Onboarding (أول مرة) أو الدخول
 * أو الرئيسية مباشرة إن كانت الجلسة سارية.
 */
export default function SplashGate() {
  const router = useRouter();
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    let alive = true;
    (async () => {
      const startedAt = Date.now();
      await hydrate();
      const remaining = Math.max(0, MIN_SPLASH_MS - (Date.now() - startedAt));
      await new Promise((r) => setTimeout(r, remaining));
      if (!alive) return;

      const { status, onboardingSeen } = useAuthStore.getState();
      if (!onboardingSeen) {
        router.replace("/onboarding");
      } else if (status === "authenticated") {
        router.replace("/(tabs)");
      } else {
        router.replace("/login");
      }
    })();
    return () => {
      alive = false;
    };
  }, [hydrate, router]);

  return (
    <View style={styles.screen}>
      <View style={styles.brandWrap}>
        <BrandMark size={96} color="#FFFFFF" />
        <AppText weight="black" size={40} color="#FFFFFF" center>
          صبح
        </AppText>
        <AppText weight="semibold" size={14} color="rgba(255,255,255,0.85)" center>
          أسواق المملكة بين يديك
        </AppText>
      </View>
      <ActivityIndicator size="small" color="rgba(255,255,255,0.9)" style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  brandWrap: {
    alignItems: "center",
    gap: 8,
  },
  spinner: {
    position: "absolute",
    bottom: 64,
  },
});
