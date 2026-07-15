/**
 * مخزن الجلسة (Zustand) — يعادل src/lib/auth.ts في الويب.
 *
 * الويب يستخدم sessionStorage بمفتاحي "subh:auth" و"subh:phone"؛
 * هنا نستخدم SecureStore (والتوكن Mock حتى ربط الـ API الحقيقي يوم 6)
 * وAsyncStorage لعلم «شاهد الـ Onboarding».
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { deleteSecureItem, getSecureItem, setSecureItem } from "./storage";

const TOKEN_KEY = "subh.auth.token";
const PHONE_KEY = "subh.auth.phone";
const ONBOARDING_KEY = "subh.onboarding.seen";

type AuthStatus = "loading" | "guest" | "authenticated";

type AuthState = {
  status: AuthStatus;
  /** بصيغة +9665XXXXXXXX */
  phone: string | null;
  onboardingSeen: boolean;
  /** قراءة الجلسة المخزّنة عند فتح التطبيق (تُستدعى من شاشة Splash) */
  hydrate: () => Promise<void>;
  /** يحفظ الرقم مؤقتًا بين شاشتي الدخول والتحقق */
  setPhone: (phone: string) => void;
  /** بعد نجاح التحقق من OTP */
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
  markOnboardingSeen: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  status: "loading",
  phone: null,
  onboardingSeen: false,

  hydrate: async () => {
    const [token, phone, seen] = await Promise.all([
      getSecureItem(TOKEN_KEY),
      getSecureItem(PHONE_KEY),
      AsyncStorage.getItem(ONBOARDING_KEY).catch(() => null),
    ]);
    set({
      status: token ? "authenticated" : "guest",
      phone: phone ?? null,
      onboardingSeen: seen === "1",
    });
  },

  setPhone: (phone) => {
    set({ phone });
    void setSecureItem(PHONE_KEY, phone);
  },

  signIn: async (token) => {
    await setSecureItem(TOKEN_KEY, token);
    set({ status: "authenticated" });
  },

  signOut: async () => {
    await Promise.all([deleteSecureItem(TOKEN_KEY), deleteSecureItem(PHONE_KEY)]);
    set({ status: "guest", phone: null, onboardingSeen: get().onboardingSeen });
  },

  markOnboardingSeen: async () => {
    set({ onboardingSeen: true });
    await AsyncStorage.setItem(ONBOARDING_KEY, "1").catch(() => undefined);
  },
}));
