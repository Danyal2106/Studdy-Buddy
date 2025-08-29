// screens/SignupPlan.tsx
import React, { useEffect, useState, useMemo } from "react";
import {
  SafeAreaView, View, Text, Pressable, StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform, ActivityIndicator
} from "react-native";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../config/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

// NB: Hvis du bruker Expo Router, se kommentar ved navigateToMain()

type Plan = "free" | "medium" | "premium";

export default function SignupPlan({ navigation, route }: any) {
  const { firstName, lastName, email, password } = route.params ?? {};
  const [plan, setPlan] = useState<Plan | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [debug, setDebug] = useState<string | null>(null);

  useEffect(() => {
    if (!email || !password) {
      setErr("Manglende registreringsdata. Start på nytt.");
    }
  }, [email, password]);

  // Map priser per måned (vises også i Checkout)
  const PLAN_PRICES: Record<Plan, number> = {
    free: 0,
    medium: 50,
    premium: 200,
  };

  function navigateToMain() {
    // Hvis du bruker React Navigation:
    navigation.replace("Main"); // sørg for at "Main" peker til app/main.tsx-skjermen i stacken

    // Hvis du bruker Expo Router, bruk i stedet:
    // import { router } from "expo-router";
    // router.replace("/main");
  }

  function mapAuthError(e: any): string {
    const code = String(e?.code ?? "");
    if (code.includes("auth/email-already-in-use")) return "E-posten er allerede i bruk.";
    if (code.includes("auth/invalid-email")) return "Ugyldig e-postadresse.";
    if (code.includes("auth/weak-password")) return "Passordet er for svakt (minst 6 tegn).";
    if (code.includes("auth/operation-not-allowed")) return "E-post/passord er ikke aktivert i Firebase-prosjektet.";
    if (code.includes("auth/network-request-failed")) return "Nettverksfeil. Sjekk tilkoblingen.";
    if (code.includes("auth/invalid-api-key")) return "Ugyldig Firebase API-nøkkel i konfig.";
    return "Kunne ikke opprette konto. Prøv igjen.";
  }

  // FREE: opprett konto -> Main
  async function createFreeAndGo() {
    try {
      setLoading(true);
      setErr(null);
      setDebug(null);

      const cred = await createUserWithEmailAndPassword(auth, String(email).trim(), String(password));

      if (firstName || lastName) {
        try {
          await updateProfile(cred.user, { displayName: `${firstName ?? ""} ${lastName ?? ""}`.trim() });
        } catch (e) {
          console.log("updateProfile error:", e);
        }
      }

      try {
        await setDoc(doc(db, "users", cred.user.uid), {
          firstName: firstName ?? null,
          lastName: lastName ?? null,
          email: cred.user.email,
          plan: "free",
          createdAt: serverTimestamp(),
        });
      } catch (e) {
        console.log("Firestore save error:", e);
      }

      navigateToMain();
    } catch (e: any) {
      console.log("Signup error:", e);
      setErr(mapAuthError(e));
      setDebug(`${e?.code ?? ""} ${e?.message ?? ""}`);
    } finally {
      setLoading(false);
    }
  }

  // BETALT: send til Checkout (ikke opprett konto ennå)
  function goToCheckout() {
    if (!plan || plan === "free") return;
    navigation.navigate("Checkout", {
      firstName,
      lastName,
      email,
      password,
      plan,
      price: PLAN_PRICES[plan],
    });
    // Expo Router alternativ:
    // router.push({ pathname: "/checkout", params: { ... } });
  }

  async function submit() {
    if (!plan) return setErr("Velg en plan.");
    if (!email || !password) return setErr("Manglende registreringsdata. Start på nytt.");

    if (plan === "free") {
      await createFreeAndGo();
    } else {
      goToCheckout();
    }
  }

  const plans = useMemo(
    () => [
      {
        id: "free" as Plan,
        name: "Basic",
        price: "0 kr/mnd",
        badge: undefined as "Populær" | "Best verdi" | undefined,
        tagline: "Ubegrenset tilgang – kun Flashcards & Notater",
        features: [
          "✅ Ubegrenset bruk",
          "✅ Flashcards",
          "✅ Notater",
          "— Kalender & planlegging",
          "— Påminnelser for gjenværende oppgaver",
          "— Deling & samarbeid",
          "— AI: noter-oppsummering & generer flashcards",
        ],
        testID: "plan-basic",
      },
      {
        id: "medium" as Plan,
        name: "Medium",
        price: "50 kr/mnd",
        badge: "Populær" as const,
        tagline: "Strukturer hverdagen med kalender og påminnelser",
        features: [
          "✅ Ubegrenset bruk",
          "✅ Flashcards",
          "✅ Notater",
          "✅ Kalender & planlegging",
          "✅ Påminnelser for gjenværende oppgaver",
          "— Deling & samarbeid",
          "— AI: noter-oppsummering & generer flashcards",
        ],
        testID: "plan-medium",
      },
      {
        id: "premium" as Plan,
        name: "Premium",
        price: "200 kr/mnd",
        badge: "Best verdi" as const,
        tagline: "Alt + AI, deling og samarbeid for studenter",
        features: [
          "✅ Ubegrenset bruk",
          "✅ Flashcards",
          "✅ Notater",
          "✅ Kalender & planlegging",
          "✅ Påminnelser for gjenværende oppgaver",
          "✅ Deling & samarbeid",
          "✅ AI: kort oppsummering av notater",
          "✅ AI: genererer flashcards automatisk",
        ],
        testID: "plan-premium",
      },
    ],
    []
  );

  const PlanCard = ({
    id, name, price, tagline, badge, features, testID,
  }: {
    id: Plan; name: string; price: string; tagline: string;
    badge?: "Populær" | "Best verdi"; features: string[]; testID?: string;
  }) => {
    const active = plan === id;
    return (
      <Pressable
        testID={testID}
        accessibilityRole="button"
        accessibilityState={{ selected: active }}
        accessibilityLabel={`${name} – ${price}`}
        onPress={() => setPlan(id)}
        hitSlop={8}
        style={[st.planCard, active && st.planActive]}
      >
        <View style={st.planHead}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text style={[st.planName, active && st.planNameActive]}>{name}</Text>
            {badge ? <Text style={[st.badge, badge === "Best verdi" && st.badgeAlt]}>{badge}</Text> : null}
          </View>
          <Text style={[st.price, active && st.priceActive]}>{price}</Text>
        </View>
        <Text style={st.tagline}>{tagline}</Text>
        <View style={st.features}>
          {features.map((f, i) => (
            <Text key={i} style={f.startsWith("✅") ? st.featureOk : st.featureMuted}>{f}</Text>
          ))}
        </View>
        <View style={st.selectRow}>
          <Text style={[st.selectText, active && st.selectTextActive]}>{active ? "Valgt" : "Velg"}</Text>
          <View style={[st.radio, active && st.radioActive]} />
        </View>
      </Pressable>
    );
  };

  const primaryCtaLabel =
    !plan ? "Opprett konto" :
    plan === "free" ? "Opprett gratis konto" :
    "Fortsett til betaling";

  return (
    <SafeAreaView style={st.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={st.center} keyboardShouldPersistTaps="always">
          <View style={st.card}>
            <Text style={st.h1}>Opprett konto — Steg 2</Text>
            <Text style={st.sub}>Velg abonnement som passer deg</Text>

            <View style={st.planCol}>
              {plans.map((p) => (<PlanCard key={p.id} {...p} />))}
            </View>

            <Text style={st.note}>Du kan oppgradere eller nedgradere når som helst.</Text>

            {err ? <Text style={st.error} accessibilityLiveRegion="polite">{err}</Text> : null}
            {debug ? <Text style={st.debug}>{debug}</Text> : null}

            <View style={st.rowBetween}>
              <Pressable testID="to-login" style={st.secondary} onPress={() => navigation.replace("Signup")} accessibilityRole="button">
                <Text style={st.secondaryText}>Til innlogging</Text>
              </Pressable>
              <Pressable
                testID="create-account"
                style={[st.primary, loading && { opacity: 0.7 }]}
                onPress={submit}
                disabled={loading}
                accessibilityRole="button"
              >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={st.primaryText}>{primaryCtaLabel}</Text>}
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const BG = "#0F172A",
  CARD = "#ffffff",
  TEXT = "#111827",
  MUTED = "#6B7280",
  ACCENT = "#2563EB",
  ACCENT_SOFT = "#E6F0FF",
  BORDER = "#E5E7EB";

const st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  center: { flexGrow: 1, justifyContent: "center", padding: 20 },
  card: { backgroundColor: CARD, borderRadius: 20, padding: 20, gap: 14, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 12, elevation: 3 },
  h1: { fontSize: 22, fontWeight: "800", color: TEXT },
  sub: { color: MUTED, marginTop: -4 },
  planCol: { gap: 12 },
  planCard: { padding: 16, borderRadius: 16, backgroundColor: "#F9FAFB", borderWidth: 1, borderColor: BORDER, gap: 10 },
  planActive: { backgroundColor: ACCENT_SOFT, borderColor: "#C9DEFF" },
  planHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  planName: { fontSize: 16, fontWeight: "800", color: TEXT },
  planNameActive: { color: "#0B1220" },
  price: { fontSize: 16, fontWeight: "900", color: TEXT },
  priceActive: { color: ACCENT },
  badge: { paddingVertical: 2, paddingHorizontal: 8, borderRadius: 999, backgroundColor: "#FEE2E2", color: "#991B1B", fontWeight: "800", fontSize: 11 },
  badgeAlt: { backgroundColor: "#DCFCE7", color: "#166534" },
  tagline: { color: MUTED },
  features: { gap: 6 },
  featureOk: { color: "#0B4A2F", fontWeight: "600" },
  featureMuted: { color: "#9CA3AF" },
  selectRow: { marginTop: 6, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  selectText: { fontWeight: "700", color: TEXT },
  selectTextActive: { color: ACCENT },
  radio: { width: 18, height: 18, borderRadius: 999, borderWidth: 2, borderColor: MUTED, backgroundColor: "transparent" },
  radioActive: { borderColor: ACCENT, backgroundColor: ACCENT },
  note: { color: MUTED, fontSize: 12, marginTop: 2 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", gap: 10, marginTop: 8 },
  primary: { backgroundColor: "#111827", paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12 },
  primaryText: { color: "#fff", fontWeight: "700" },
  secondary: { backgroundColor: "#E5E7EB", paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12 },
  secondaryText: { color: TEXT, fontWeight: "700" },
  error: { color: "#B00020", fontWeight: "600" },
  debug: { color: "#6B7280", fontSize: 12, marginTop: 4 },
});
