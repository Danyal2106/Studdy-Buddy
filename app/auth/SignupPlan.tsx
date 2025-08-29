// screens/Checkout.tsx
import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  TextInput,
  Alert,
} from "react-native";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../config/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

type Plan = "free" | "medium" | "premium";

export default function Checkout({ navigation, route }: any) {
  const { firstName, lastName, email, password, plan, price } = route.params ?? {};

  const [nameOnCard, setNameOnCard] = useState(`${firstName ?? ""} ${lastName ?? ""}`.trim());
  const [address, setAddress] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Innhold/ikon/badge for valgt plan
  const planCopy = useMemo(() => {
    const title = plan === "premium" ? "Premium" : plan === "medium" ? "Medium" : "Basic";
    const icon = plan === "premium" ? "🤖" : plan === "medium" ? "📅" : "✨";
    const badge = plan === "premium" ? "Best verdi" : plan === "medium" ? "Populær" : undefined;
    const perks =
      plan === "premium"
        ? ["Alt i appen", "AI: oppsummer notater", "AI: generer flashcards", "Del & samarbeid", "Kalender + påminnelser"]
        : plan === "medium"
        ? ["Flashcards & Notater", "Kalender & planlegging", "Påminnelser"]
        : ["Flashcards & Notater (gratis)"];
    return { title, perks, icon, badge };
  }, [plan]);

  function navigateToMain() {
    navigation.replace("Dashboard");
  }

  async function completeSignupAfterPayment() {
    const cred = await createUserWithEmailAndPassword(auth, String(email).trim(), String(password));
    if (firstName || lastName) {
      try {
        await updateProfile(cred.user, { displayName: `${firstName ?? ""} ${lastName ?? ""}`.trim() });
      } catch {}
    }
    try {
      await setDoc(doc(db, "users", cred.user.uid), {
        firstName: firstName ?? null,
        lastName: lastName ?? null,
        email: cred.user.email,
        plan, // medium | premium
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      console.log("Firestore save error:", e);
    }
    navigateToMain();
  }

  async function handlePay() {
    setError(null);

    if (!email || !password || !plan) return setError("Manglende data. Gå tilbake og prøv igjen.");
    if (!nameOnCard) return setError("Fyll inn navn på kortet.");
    if (cardNumber.replace(/\s/g, "").length < 12) return setError("Skriv inn et gyldig kortnummer.");
    if (!/^\d{2}\/\d{2}$/.test(expiry)) return setError("Utløpsdato må være MM/ÅÅ.");
    if (cvc.length < 3) return setError("Skriv inn en gyldig CVC.");

    try {
      setProcessing(true);
      // Her ville du normalt kalt backend + Stripe for ekte betaling.
      await completeSignupAfterPayment();
    } catch (e: any) {
      console.log("checkout error", e);
      setError(e?.message || "Noe gikk galt under betalingen.");
      Alert.alert("Betaling feilet", e?.message || "Prøv igjen.");
    } finally {
      setProcessing(false);
    }
  }

  const priceText = `${price ?? 0} kr/mnd`;
  const isDisabled = processing;

  return (
    <SafeAreaView style={st.safe}>
      {/* Bakgrunnsdekor (samme stil som login) */}
      <View pointerEvents="none" style={st.blobsWrap}>
        <View style={st.blobTop} />
        <View style={st.blobBottom} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={st.center} keyboardShouldPersistTaps="handled">
          {/* Brand / logo */}
          <View style={st.topBar}>
            <View style={st.logoBox}><Text style={st.logoText}>SB</Text></View>
            <Text style={st.brand}>StudyBuddy</Text>
          </View>

          {/* Kort */}
          <View style={st.card}>
            {/* Header + progress (100%) */}
            <View style={st.headerRow}>
              <View>
                <Text style={st.h1}>Betaling</Text>
                <Text style={st.sub}>Fullfør kjøpet for å aktivere kontoen</Text>
              </View>
              <Text style={st.stepPct}>100%</Text>
            </View>
            <View style={st.progressTrack}>
              <View style={[st.progressFill, { width: "100%" }]} />
            </View>

            {/* Sammendrag av plan */}
            <View style={st.summary}>
              <View style={st.summaryHeader}>
                <View style={st.planIconBubble}><Text style={st.planIconText}>{planCopy.icon}</Text></View>
                {planCopy.badge ? (
                  <Text style={[st.badge, planCopy.badge === "Best verdi" && st.badgeAlt]}>{planCopy.badge}</Text>
                ) : <View />}
              </View>

              <View style={st.rowBetween}>
                <View style={{ gap: 2 }}>
                  <Text style={st.planName}>{planCopy.title}</Text>
                  <Text style={st.muted}>Månedlig abonnement</Text>
                </View>
                <Text style={st.price}>{priceText}</Text>
              </View>

              <View style={{ marginTop: 10 }}>
                {planCopy.perks.map((p, i) => (
                  <Text key={i} style={st.perk}>• {p}</Text>
                ))}
              </View>
            </View>

            {/* Betalingsinfo */}
            <Text style={st.sectionTitle}>Kortinformasjon</Text>

            {/* (Stripe CardField kan plasseres her – kommentert ut) */}

            {/* Fallback inputs for realistisk UI */}
            <TextInput
              placeholder="Kortnummer"
              placeholderTextColor={PLACEHOLDER}
              keyboardType="number-pad"
              value={cardNumber}
              onChangeText={setCardNumber}
              style={[st.input, st.inputIdle]}
            />
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TextInput
                placeholder="MM/ÅÅ"
                placeholderTextColor={PLACEHOLDER}
                keyboardType="number-pad"
                value={expiry}
                onChangeText={setExpiry}
                style={[st.input, st.inputIdle, { flex: 1 }]}
              />
              <TextInput
                placeholder="CVC"
                placeholderTextColor={PLACEHOLDER}
                keyboardType="number-pad"
                value={cvc}
                onChangeText={setCvc}
                style={[st.input, st.inputIdle, { flex: 1 }]}
              />
            </View>
            <TextInput
              placeholder="Navn på kort"
              placeholderTextColor={PLACEHOLDER}
              value={nameOnCard}
              onChangeText={setNameOnCard}
              style={[st.input, st.inputIdle]}
            />
            <TextInput
              placeholder="Fakturaadresse (valgfritt)"
              placeholderTextColor={PLACEHOLDER}
              value={address}
              onChangeText={setAddress}
              style={[st.input, st.inputIdle]}
            />

            <Text style={st.legal}>
              Ved å betale godtar du våre vilkår. Abonnementet fornyes automatisk hver måned. Du kan si opp når som helst.
            </Text>

            {error ? <Text style={st.error}>{error}</Text> : null}

            {/* CTA-rad */}
            <View style={st.rowBetween}>
              <Pressable style={st.secondary} onPress={() => navigation.goBack()}>
                <Text style={st.secondaryText}>Tilbake</Text>
              </Pressable>

              <Pressable
                style={[st.primary, isDisabled && { opacity: 0.7 }]}
                onPress={handlePay}
                disabled={isDisabled}
              >
                {processing ? <ActivityIndicator color="#fff" /> : <Text style={st.primaryText}>Betal {priceText}</Text>}
              </Pressable>
            </View>

            {/* Trust / sikkerhet */}
            <View style={st.secureRow}>
              <Text style={st.lock}>🔒</Text>
              <Text style={st.secureText}>Sikker betaling (Stripe)</Text>
            </View>

            <Text style={st.noteSmall}>Vi lagrer aldri kortdetaljer.</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ====== SAMME FARGER SOM INNLOGGING ====== */
const BG = "#F7F3ED";
const CARD = "#FFFFFF";
const TEXT = "#0F172A";
const MUTED = "#6B7280";
const BORDER = "#F0EFEA";
const DIVIDER = "#E8E6E2";
const INPUT_BG = "#F6F7FA";
const INPUT_FOCUS = "#EEF5FF";
const PLACEHOLDER = "#9CA3AF";
const PRIMARY_BG = "#111827"; // samme primærknapp som login
const LOGO_BG = "#CDE3F5";
const ERROR_BG = "#FDE2E1";
const ERROR_TEXT = "#8A1C1C";

/* ====== STYLES ====== */
const st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },

  // Bakgrunnsblobs som på login
  blobsWrap: { ...StyleSheet.absoluteFillObject, overflow: "hidden" },
  blobTop: {
    position: "absolute",
    top: -120,
    right: -80,
    width: 240,
    height: 240,
    borderRadius: 240,
    backgroundColor: "rgba(235, 200, 255, 0.45)",
  },
  blobBottom: {
    position: "absolute",
    bottom: -90,
    left: -60,
    width: 200,
    height: 200,
    borderRadius: 200,
    backgroundColor: "rgba(197, 232, 255, 0.55)",
  },

  center: { flexGrow: 1, justifyContent: "center", padding: 20 },

  // Brand
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    alignSelf: "center",
    marginBottom: 12,
  },
  logoBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: LOGO_BG,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  logoText: { fontWeight: "900", color: TEXT, letterSpacing: 0.3 },
  brand: { color: TEXT, fontWeight: "900", fontSize: 20, letterSpacing: 0.3 },

  // Kort
  card: {
    backgroundColor: CARD,
    borderRadius: 22,
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },

  // Header + progress
  headerRow: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" },
  h1: { fontSize: 22, fontWeight: "900", color: TEXT },
  sub: { color: MUTED, marginTop: 2 },
  stepPct: { color: MUTED, fontWeight: "800" },
  progressTrack: { height: 8, backgroundColor: DIVIDER, borderRadius: 999, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: PRIMARY_BG, width: "0%" },

  // Sammendrag
  summary: {
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 14,
    gap: 8,
  },
  summaryHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  planIconBubble: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#E6EEF9",
    alignItems: "center",
    justifyContent: "center",
  },
  planIconText: { fontSize: 18 },
  badge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 999,
    backgroundColor: "#FEE2E2",
    color: "#991B1B",
    fontWeight: "800",
    fontSize: 11,
  },
  badgeAlt: { backgroundColor: "#DCFCE7", color: "#166534" },

  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  planName: { fontSize: 16, fontWeight: "800", color: TEXT },
  price: { fontSize: 16, fontWeight: "900", color: "#111827" },
  perk: { color: "#374151" },
  muted: { color: MUTED, fontSize: 12 },

  sectionTitle: { fontWeight: "900", color: TEXT, marginTop: 8 },

  // Inputs (samme følelse som login)
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: INPUT_BG,
    color: TEXT,
  },
  inputIdle: { borderColor: "transparent", backgroundColor: INPUT_BG },

  legal: { color: MUTED, fontSize: 12, marginTop: 8 },

  // CTA
  primary: {
    backgroundColor: PRIMARY_BG,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignItems: "center",
    flex: 1,
  },
  primaryText: { color: "#fff", fontWeight: "900" },
  secondary: {
    backgroundColor: "#E5E7EB",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignItems: "center",
    flex: 1,
  },
  secondaryText: { color: TEXT, fontWeight: "800" },

  error: {
    color: ERROR_TEXT,
    backgroundColor: ERROR_BG,
    fontWeight: "700",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },

  // Trust
  secureRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6, marginTop: 10 },
  lock: { fontSize: 14 },
  secureText: { color: MUTED, fontSize: 12 },

  noteSmall: { color: MUTED, fontSize: 11, marginTop: 8, textAlign: "center" },
});
