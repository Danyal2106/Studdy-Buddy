// screens/Checkout.tsx
import React, { useMemo, useState } from "react";
import {
  SafeAreaView, View, Text, Pressable, StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform, ActivityIndicator, TextInput, Alert
} from "react-native";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../config/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

// Hvis du bruker Stripe:
// import { CardField, useConfirmPayment } from "@stripe/stripe-react-native";
// Husk å wrappe appen i <StripeProvider publishableKey="..."> i rotkomponenten.

type Plan = "free" | "medium" | "premium";

export default function Checkout({ navigation, route }: any) {
  const { firstName, lastName, email, password, plan, price } = route.params ?? {};
  const [nameOnCard, setNameOnCard] = useState(`${firstName ?? ""} ${lastName ?? ""}`.trim());
  const [address, setAddress] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // const { confirmPayment } = useConfirmPayment(); // Stripe

  const planCopy = useMemo(() => {
    const title = plan === "premium" ? "Premium"
                : plan === "medium" ? "Medium"
                : "Basic";
    const perks =
      plan === "premium"
        ? [
            "Alt i appen",
            "AI: oppsummer notater",
            "AI: generer flashcards",
            "Del & samarbeid",
            "Kalender + påminnelser",
          ]
        : plan === "medium"
        ? [
            "Flashcards & Notater",
            "Kalender & planlegging",
            "Påminnelser",
          ]
        : ["Flashcards & Notater (gratis)"];
    return { title, perks };
  }, [plan]);

  function navigateToMain() {
    // React Navigation:
    navigation.replace("Main");
    // Expo Router:
    // router.replace("/main");
  }

  async function completeSignupAfterPayment() {
    // Opprett bruker + lagre plan, deretter til hovedside:
    const cred = await createUserWithEmailAndPassword(auth, String(email).trim(), String(password));
    if (firstName || lastName) {
      try { await updateProfile(cred.user, { displayName: `${firstName ?? ""} ${lastName ?? ""}`.trim() }); } catch {}
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

    // Enkel validering
    if (!email || !password || !plan) {
      setError("Manglende data. Gå tilbake og prøv igjen.");
      return;
    }
    if (!nameOnCard) {
      setError("Fyll inn navn på kortet.");
      return;
    }

    try {
      setProcessing(true);

      // 1) Kall backend for å lage PaymentIntent og få clientSecret
      // TODO: Bytt ut med din fetch til backend
      // const res = await fetch("https://<din-backend>/create-payment-intent", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ amount: price * 100, currency: "nok", plan }),
      // });
      // const { clientSecret, error: beError } = await res.json();
      // if (beError || !clientSecret) throw new Error(beError || "Kunne ikke starte betaling.");

      // 2) Bekreft betaling med Stripe
      // const { paymentIntent, error: stripeError } = await confirmPayment(clientSecret, {
      //   paymentMethodType: "Card",
      //   paymentMethodData: { billingDetails: { name: nameOnCard, address: { line1: address || undefined } } },
      // });
      // if (stripeError || !paymentIntent) throw new Error(stripeError?.message || "Betalingen feilet.");

      // 3) Suksess: opprett konto i Firebase og gå til Main
      await completeSignupAfterPayment();
    } catch (e: any) {
      console.log("checkout error", e);
      setError(e?.message || "Noe gikk galt under betalingen.");
      Alert.alert("Betaling feilet", e?.message || "Prøv igjen.");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <SafeAreaView style={st.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={st.center} keyboardShouldPersistTaps="always">
          <View style={st.card}>
            <Text style={st.h1}>Betaling</Text>
            <Text style={st.sub}>Fullfør kjøpet for å aktivere kontoen</Text>

            <View style={st.summary}>
              <Text style={st.sumTitle}>Valgt pakke</Text>
              <View style={st.rowBetween}>
                <Text style={st.planName}>{planCopy.title}</Text>
                <Text style={st.price}>{price} kr/mnd</Text>
              </View>
              <View style={{ marginTop: 8 }}>
                {planCopy.perks.map((p, i) => (
                  <Text key={i} style={st.perk}>• {p}</Text>
                ))}
              </View>
            </View>

            <View style={st.sep} />

            <View style={{ gap: 10 }}>
              <Text style={st.sectionTitle}>Kortinformasjon</Text>

              {/* Hvis du bruker Stripe: vis CardField her */}
              {/* 
              <CardField
                postalCodeEnabled={false}
                placeholders={{ number: "1234 1234 1234 1234" }}
                cardStyle={{ textColor: "#111827" }}
                style={{ height: 48, marginVertical: 8 }}
                onCardChange={(details) => {/* optional */ /*}}
              />
              */}

              {/* Fallback inputs for realistisk UI når Stripe ikke er koblet til ennå */}
              <TextInput placeholder="Kortnummer" keyboardType="number-pad" style={st.input} />
              <View style={{ flexDirection: "row", gap: 10 }}>
                <TextInput placeholder="MM/ÅÅ" keyboardType="number-pad" style={[st.input, { flex: 1 }]} />
                <TextInput placeholder="CVC" keyboardType="number-pad" style={[st.input, { flex: 1 }]} />
              </View>
              <TextInput placeholder="Navn på kort" value={nameOnCard} onChangeText={setNameOnCard} style={st.input} />
              <TextInput placeholder="Fakturaadresse (valgfritt)" value={address} onChangeText={setAddress} style={st.input} />

              <Text style={st.legal}>
                Ved å betale godtar du våre vilkår. Abonnementet fornyes automatisk hver måned. Du kan si opp når som helst.
              </Text>
            </View>

            {error ? <Text style={st.error}>{error}</Text> : null}

            <View style={st.rowBetween}>
              <Pressable style={st.secondary} onPress={() => navigation.goBack()}>
                <Text style={st.secondaryText}>Tilbake</Text>
              </Pressable>
              <Pressable style={[st.primary, processing && { opacity: 0.7 }]} onPress={handlePay} disabled={processing}>
                {processing ? <ActivityIndicator color="#fff" /> : <Text style={st.primaryText}>Betal {price} kr/mnd</Text>}
              </Pressable>
            </View>

            <Text style={st.noteSmall}>Betaling sikres av Stripe. Vi lagrer ikke kortdetaljer.</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const BG = "#0F172A", CARD = "#ffffff", TEXT = "#111827", MUTED = "#6B7280", BORDER = "#E5E7EB", ACCENT = "#2563EB";

const st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  center: { flexGrow: 1, justifyContent: "center", padding: 20 },
  card: { backgroundColor: CARD, borderRadius: 20, padding: 20, gap: 16, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 12, elevation: 3 },
  h1: { fontSize: 22, fontWeight: "800", color: TEXT },
  sub: { color: MUTED, marginTop: -4 },
  summary: { backgroundColor: "#F9FAFB", borderRadius: 14, borderWidth: 1, borderColor: BORDER, padding: 12, gap: 6 },
  sumTitle: { color: MUTED, fontWeight: "700" },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  planName: { fontSize: 16, fontWeight: "800", color: TEXT },
  price: { fontSize: 16, fontWeight: "900", color: ACCENT },
  perk: { color: "#374151" },
  sep: { height: 1, backgroundColor: BORDER, marginVertical: 8 },
  sectionTitle: { fontWeight: "800", color: TEXT },
  input: { borderWidth: 1, borderColor: BORDER, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: "#fff" },
  legal: { color: MUTED, fontSize: 12 },
  noteSmall: { color: MUTED, fontSize: 11, marginTop: 8, textAlign: "center" },
  primary: { backgroundColor: "#111827", paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12 },
  primaryText: { color: "#fff", fontWeight: "700" },
  secondary: { backgroundColor: "#E5E7EB", paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12 },
  secondaryText: { color: TEXT, fontWeight: "700" },
  error: { color: "#B00020", fontWeight: "600" },
});
