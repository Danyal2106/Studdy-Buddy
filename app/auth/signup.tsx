// app/auth/signup.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StatusBar,
  ColorSchemeName,
  useColorScheme,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import * as Google from "expo-auth-session/providers/google";
import {
  signInWithEmailAndPassword,
  signInWithCredential,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "../config/firebase";

export default function Signup({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const scheme: ColorSchemeName = useColorScheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [focusField, setFocusField] = useState<"email" | "password" | null>(null);

  // Google (legg inn dine faktiske klient-IDer for å aktivere)
  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: "PASTE_IOS_CLIENT_ID.apps.googleusercontent.com",
    androidClientId: "PASTE_ANDROID_CLIENT_ID.apps.googleusercontent.com",
    webClientId: "PASTE_WEB_CLIENT_ID.apps.googleusercontent.com",
    scopes: ["profile", "email"],
  });

  useEffect(() => {
    (async () => {
      if (response?.type === "success" && response.authentication) {
        try {
          setErr(null);
          setLoading(true);
          const { idToken, accessToken } = response.authentication;
          const cred = GoogleAuthProvider.credential(
            idToken ?? undefined,
            accessToken ?? undefined
          );
          await signInWithCredential(auth, cred);
          navigation.replace("Dashboard");
        } catch {
          setErr("Noe gikk galt med Google-innlogging. Prøv igjen.");
        } finally {
          setLoading(false);
        }
      }
    })();
  }, [response, navigation]);

  // Demo fallback
  const DUMMY_EMAIL = "test@gmail.com";
  const DUMMY_PASS = "123456";
  const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  async function handleLogin() {
    setErr(null);
    if (!isValidEmail(email)) return setErr("Skriv inn en gyldig e-postadresse.");
    if (password.length < 6) return setErr("Passord må være minst 6 tegn.");
    try {
      setLoading(true);
      if (email.trim().toLowerCase() === DUMMY_EMAIL && password === DUMMY_PASS) {
        navigation.replace("Dashboard");
        return;
      }
      await signInWithEmailAndPassword(auth, email.trim(), password);
      navigation.replace("Dashboard");
    } catch {
      setErr("Feil brukernavn eller passord.");
    } finally {
      setLoading(false);
    }
  }

  // Tema (lys/mørk)
  const T = scheme === "dark" ? darkTokens : lightTokens;

  return (
    <SafeAreaView style={[st.safe, { backgroundColor: T.BG, paddingTop: insets.top }]}>
      <StatusBar barStyle={scheme === "dark" ? "light-content" : "dark-content"} />

      {/* Dekor: subtile blobs i bakgrunnen */}
      <View pointerEvents="none" style={st.blobsWrap}>
        <View style={[st.blob, { backgroundColor: T.BLOB1 }]} />
        <View style={[st.blobSm, { backgroundColor: T.BLOB2 }]} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[st.center, { paddingBottom: Math.max(insets.bottom, 16) }]}
          keyboardShouldPersistTaps="always"
        >
          {/* LOGO / BRAND */}
          <View style={st.header} accessible accessibilityRole="header">
            <View style={[st.logoBox, { backgroundColor: T.LOGO_BG, shadowColor: T.SHADOW }]}>
              <Text style={[st.logoText, { color: T.TEXT }]}>SB</Text>
            </View>
            <View style={{ gap: 2 }}>
              <Text style={[st.brand, { color: T.TEXT }]}>StudyBuddy</Text>
              <Text style={[st.tagline, { color: T.MUTED }]}>Organiser, lær, lever.</Text>
            </View>
          </View>

          {/* CARD */}
          <View
            style={[
              st.card,
              { backgroundColor: T.CARD, shadowColor: T.SHADOW, borderColor: T.CARD_BORDER },
            ]}
          >
            <View style={{ gap: 4 }}>
              <Text style={[st.title, { color: T.TEXT }]}>Logg inn</Text>
              <Text style={[st.subtitle, { color: T.MUTED }]}>Hyggelig å se deg igjen 👋</Text>
            </View>

            {/* EMAIL */}
            <View style={st.group}>
              <Text style={[st.label, { color: T.TEXT }]}>E-post</Text>
              <View
                style={[
                  st.inputRow,
                  focusField === "email"
                    ? { borderColor: T.ACCENT, backgroundColor: T.INPUT_FOCUS }
                    : { borderColor: "transparent", backgroundColor: T.INPUT_BG },
                ]}
              >
                <TextInput
                  testID="email"
                  value={email}
                  onChangeText={(v) => {
                    setEmail(v);
                    if (err) setErr(null);
                  }}
                  onFocus={() => setFocusField("email")}
                  onBlur={() => setFocusField(null)}
                  inputMode="email"
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholder="navn@skole.no"
                  placeholderTextColor={T.PLACEHOLDER}
                  style={[st.input, { color: T.TEXT }]}
                  accessibilityLabel="E-postadresse"
                  returnKeyType="next"
                />
              </View>
            </View>

            {/* PASSORD */}
            <View style={st.group}>
              <View style={st.rowBetween}>
                <Text style={[st.label, { color: T.TEXT }]}>Passord</Text>
                <Pressable hitSlop={8} onPress={() => { /* TODO: reset-pass */ }}>
                  <Text style={[st.link, { color: T.TEXT }]}>Glemt?</Text>
                </Pressable>
              </View>
              <View
                style={[
                  st.inputRow,
                  focusField === "password"
                    ? { borderColor: T.ACCENT, backgroundColor: T.INPUT_FOCUS }
                    : { borderColor: "transparent", backgroundColor: T.INPUT_BG },
                ]}
              >
                <TextInput
                  testID="password"
                  value={password}
                  onChangeText={(v) => {
                    setPassword(v);
                    if (err) setErr(null);
                  }}
                  onFocus={() => setFocusField("password")}
                  onBlur={() => setFocusField(null)}
                  secureTextEntry={!showPw}
                  placeholder="••••••••"
                  placeholderTextColor={T.PLACEHOLDER}
                  style={[st.input, { color: T.TEXT, paddingRight: 44 }]}
                  accessibilityLabel="Passord"
                  returnKeyType="go"
                  onSubmitEditing={handleLogin}
                />
                <Pressable
                  onPress={() => setShowPw((v) => !v)}
                  style={st.eye}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={showPw ? "Skjul passord" : "Vis passord"}
                >
                  <Text style={[st.eyeText, { color: T.MUTED }]}>{showPw ? "🙈" : "👁️"}</Text>
                </Pressable>
              </View>
            </View>

            {/* FEIL */}
            {err ? (
              <Text
                style={[st.error, { backgroundColor: T.ERROR_BG, color: T.ERROR_TEXT }]}
                accessibilityLiveRegion="polite"
              >
                {err}
              </Text>
            ) : null}

            {/* CTA */}
            <Pressable
              testID="login"
              style={[
                st.primary,
                { backgroundColor: T.PRIMARY_BG, shadowColor: T.SHADOW },
                loading && { opacity: 0.7 },
              ]}
              onPress={handleLogin}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel="Logg inn"
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={st.primaryText}>Logg inn</Text>}
            </Pressable>

            {/* DELER */}
            <View style={st.divRow}>
              <View style={[st.div, { backgroundColor: T.DIVIDER }]} />
              <Text style={[st.divText, { color: T.MUTED }]}>eller</Text>
              <View style={[st.div, { backgroundColor: T.DIVIDER }]} />
            </View>

            {/* GOOGLE */}
            <Pressable
              testID="google"
              style={[
                st.google,
                { borderColor: T.BORDER, backgroundColor: T.CARD },
                (!request || loading) && { opacity: 0.6 },
              ]}
              onPress={() => {
                if (!request) {
                  setErr("Google-innlogging er ikke konfigurert enda.");
                  return;
                }
                promptAsync();
              }}
              disabled={!request || loading}
              accessibilityRole="button"
              accessibilityLabel="Fortsett med Google"
            >
              <View style={[st.googleIcon, { borderColor: T.BORDER, backgroundColor: T.CARD }]}>
                <Text style={[st.g, { color: T.TEXT }]}>G</Text>
              </View>
              <Text style={[ { color: T.TEXT }]}>Fortsett med Google</Text>
            </Pressable>

            {/* BUNN-LINK */}
            <View  style={st.bottomRow}>
              <Text style={[st.mutedSmall, { color: T.MUTED }]}>Ny her?</Text>
              <Pressable onPress={() => navigation.navigate("SignupInfo")} hitSlop={8}>
                <Text style={[st.link, { color: T.TEXT }]}>Opprett konto</Text>
              </Pressable>
            </View>

            <Text style={[st.hint, { backgroundColor: T.HINT_BG, color: T.MUTED }]}>
              Demo: test@gmail.com / 123456
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ====== TEMAER ====== */
const lightTokens = {
  BG: "#F7F3ED",
  CARD: "#FFFFFF",
  CARD_BORDER: "#F0EFEA",
  TEXT: "#0F172A",
  MUTED: "#6B7280",
  BORDER: "#E5E7EB",
  DIVIDER: "#E8E6E2",
  INPUT_BG: "#F6F7FA",
  INPUT_FOCUS: "#EEF5FF",
  PLACEHOLDER: "#9CA3AF",
  PRIMARY_BG: "#111827",
  LOGO_BG: "#CDE3F5",
  HINT_BG: "#FFE5DC",
  ERROR_BG: "#FDE2E1",
  ERROR_TEXT: "#8A1C1C",
  BLOB1: "rgba(235, 200, 255, 0.45)", // lilla-rosa
  BLOB2: "rgba(197, 232, 255, 0.55)", // lys blå
  SHADOW: "#000",
  ACCENT: "#2563EB", // ✅ focus-kantlinje
};

const darkTokens = {
  BG: "#0B0F19",
  CARD: "#121826",
  CARD_BORDER: "#1C2437",
  TEXT: "#F8FAFC",
  MUTED: "#9CA3AF",
  BORDER: "#2B3448",
  DIVIDER: "#1F2636",
  INPUT_BG: "#151B2B",
  INPUT_FOCUS: "#122033",
  PLACEHOLDER: "#6B7280",
  PRIMARY_BG: "#2563EB",
  LOGO_BG: "#0F2138",
  HINT_BG: "#1A2334",
  ERROR_BG: "#3B1B1B",
  ERROR_TEXT: "#FCA5A5",
  BLOB1: "rgba(67, 56, 202, 0.35)",  // indigo
  BLOB2: "rgba(2, 132, 199, 0.35)", // cyan
  SHADOW: "#000",
  ACCENT: "#60A5FA", // ✅ focus-kantlinje
};

/* ====== STYLES ====== */
const st = StyleSheet.create({
  safe: { flex: 1 },
  center: { flexGrow: 1, justifyContent: "center", padding: 20 },

  /* Bakgrunnsblobs */
  blobsWrap: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  blob: {
    position: "absolute",
    top: -120,
    right: -80,
    width: 240,
    height: 240,
    borderRadius: 240,
  },
  blobSm: {
    position: "absolute",
    bottom: -80,
    left: -60,
    width: 200,
    height: 200,
    borderRadius: 200,
  },

  /* Header / Logo */
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    alignSelf: "center",
    marginBottom: 18,
  },
  logoBox: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  logoText: { fontWeight: "900", letterSpacing: 0.3 },
  brand: { fontWeight: "900", fontSize: 20, letterSpacing: 0.3 },
  tagline: { fontSize: 12 },

  /* Card */
  card: {
    borderRadius: 22,
    padding: 20,
    gap: 14,
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 3,
    borderWidth: 1,
  },
  title: { fontSize: 24, fontWeight: "900" },
  subtitle: { marginTop: -2 },

  /* Inputs */
  group: { gap: 8, marginTop: 6 },
  label: { fontWeight: "700" },
  inputRow: { borderWidth: 1, borderRadius: 14 },
  input: { paddingHorizontal: 14, paddingVertical: 14, fontSize: 16 },
  eye: {
    position: "absolute",
    right: 10,
    top: 10,
    height: 28,
    width: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  eyeText: { fontSize: 16 },

  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  link: { fontWeight: "800" },

  error: {
    marginTop: 2,
    fontWeight: "600",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },

  /* Buttons */
  primary: {
    marginTop: 6,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
  },
  primaryText: { color: "#fff", fontWeight: "900" },

  divRow: { flexDirection: "row", alignItems: "center", gap: 10, marginVertical: 10 },
  div: { flex: 1, height: 1 },
  divText: { fontSize: 12 },

  google: {
    borderWidth: 1,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  googleIcon: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  g: { fontWeight: "900" },

  bottomRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6 },
  mutedSmall: { fontSize: 12 },

  hint: {
    fontSize: 11,
    textAlign: "center",
    marginTop: 6,
    paddingVertical: 6,
    borderRadius: 10,
  },
});
