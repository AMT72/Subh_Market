import {
  Cairo_400Regular,
  Cairo_500Medium,
  Cairo_600SemiBold,
  Cairo_700Bold,
  Cairo_800ExtraBold,
  Cairo_900Black,
  useFonts,
} from "@expo-google-fonts/cairo";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { colors } from "@/lib/theme";

SplashScreen.preventAutoHideAsync();

/**
 * الجذر: تحميل خط Cairo (نفس خط الويب) ثم عرض الـ Stack.
 * كل الشاشات بلا ترويسة نظام — الترويسات مبنية داخل الشاشات بهوية صبح.
 */
export default function RootLayout() {
  const hydrate = useAuthStore((s) => s.hydrate);
  const [fontsLoaded] = useFonts({
    Cairo_400Regular,
    Cairo_500Medium,
    Cairo_600SemiBold,
    Cairo_700Bold,
    Cairo_800ExtraBold,
    Cairo_900Black,
  });

  // قراءة الجلسة من هنا (وليس من Splash فقط) حتى تعمل الروابط العميقة
  // وإعادة تحميل الويب دون فقدان حالة الدخول.
  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      />
    </>
  );
}
