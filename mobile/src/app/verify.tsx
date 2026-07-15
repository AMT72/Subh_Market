import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { AuthHeader } from "@/components/AuthHeader";
import { OtpInput } from "@/components/OtpInput";
import { useAuthStore } from "@/lib/auth-store";
import { colors, radius } from "@/lib/theme";
import { API_MODE, OTP_LENGTH, OTP_RESEND_SECONDS, requestOtp, verifyOtp } from "@/shared";

/**
 * التحقق من رمز OTP — مطابق لصفحة /verify في الويب:
 * 6 خانات، عدّاد إعادة إرسال 45 ثانية، والرمز 000000 يفشل دائمًا (Mock).
 */
export default function VerifyScreen() {
  const router = useRouter();
  const phone = useAuthStore((s) => s.phone);
  const signIn = useAuthStore((s) => s.signIn);

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(OTP_RESEND_SECONDS);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [seconds]);

  async function onSubmit() {
    if (code.length !== OTP_LENGTH) {
      setError("يرجى إدخال الرمز المكوّن من 6 أرقام.");
      return;
    }
    setError(null);
    setLoading(true);
    const res = await verifyOtp(phone ?? "", code);
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      setCode("");
      return;
    }
    await signIn(res.data.token);
    router.replace("/(tabs)");
  }

  async function handleResend() {
    if (seconds > 0 || resending) return;
    setResending(true);
    setError(null);
    await requestOtp(phone ?? "");
    setResending(false);
    setCode("");
    setSeconds(OTP_RESEND_SECONDS);
  }

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <AuthHeader step={{ current: 2, total: 2 }} />

          <View style={styles.form}>
            <View style={styles.titleWrap}>
              <AppText weight="extrabold" size={26} center>
                أدخل رمز التحقق
              </AppText>
              <AppText size={13} color={colors.mutedForeground} center>
                أرسلنا رمزًا مكوّنًا من 6 أرقام إلى{" "}
                <AppText size={13} weight="semibold" ltr>
                  {phone || "رقمك"}
                </AppText>
              </AppText>
              <Pressable
                onPress={() => router.back()}
                accessibilityRole="button"
                style={styles.changeNumber}
                hitSlop={8}
              >
                <AppText weight="semibold" size={12} color={colors.primary}>
                  تغيير الرقم
                </AppText>
                <Ionicons name="arrow-back" size={13} color={colors.primary} />
              </Pressable>
            </View>

            <OtpInput value={code} onChange={(v) => { setCode(v); if (error) setError(null); }} disabled={loading} error={!!error} />

            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle-outline" size={18} color={colors.destructive} />
                <AppText weight="medium" size={12.5} color={colors.destructive} style={styles.errorText}>
                  {error}
                </AppText>
              </View>
            ) : null}

            <Button
              title="تحقّق ومتابعة"
              loadingTitle="جارٍ التحقق…"
              onPress={onSubmit}
              loading={loading}
              disabled={code.length !== OTP_LENGTH}
            />

            <View style={styles.resendRow}>
              {seconds > 0 ? (
                <AppText size={13} color={colors.mutedForeground} center>
                  يمكنك طلب رمز جديد خلال{" "}
                  <AppText size={13} weight="semibold" ltr>
                    {mm}:{ss}
                  </AppText>
                </AppText>
              ) : (
                <Pressable onPress={handleResend} disabled={resending} accessibilityRole="button">
                  <AppText
                    weight="semibold"
                    size={13}
                    color={colors.primary}
                    center
                    style={resending && { opacity: 0.6 }}
                  >
                    {resending ? "جارٍ الإرسال…" : "إعادة إرسال الرمز"}
                  </AppText>
                </Pressable>
              )}
            </View>

            {API_MODE === "mock" ? (
              <AppText size={11} color={colors.mutedForeground} center>
                وضع تجريبي (Mock): أي رمز يقبل ما عدا 000000
              </AppText>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    padding: 20,
  },
  form: {
    flex: 1,
    justifyContent: "center",
    gap: 22,
    maxWidth: 420,
    width: "100%",
    alignSelf: "center",
    paddingBottom: 48,
  },
  titleWrap: {
    gap: 4,
    alignItems: "center",
  },
  changeNumber: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
    paddingTop: 6,
  },
  errorBox: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.destructiveSoft,
    borderRadius: radius.xl,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  errorText: {
    flex: 1,
  },
  resendRow: {
    alignItems: "center",
  },
});
