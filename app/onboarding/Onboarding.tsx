// app/onboarding/Onboarding.tsx
import React from "react";
import { View, Text, Pressable, StyleSheet, StatusBar, Platform } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export default function Onboarding({ navigation }: any) {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView
      // Ikke reserver top—da dekker bakgrunnen helt opp til toppen.
      edges={["left", "right", "bottom"]}
      style={st.safe}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor={CARD} // Android
        translucent={false}
      />

      <View
        style={[
          st.container,
          {
            // Legg kun innhold under notchen, men la bakgrunnen dekke helt opp.
            paddingTop: insets.top + 8,
            paddingBottom: Math.max(insets.bottom, 12),
          },
        ]}
      >
        {/* HEADER */}
        <View style={st.headerRow}>
          <View style={st.avatar}>
            <Text style={st.avatarText}>SB</Text>
          </View>
          <Text style={st.brand}>StudyBuddy</Text>
        </View>

        {/* MIDT (fyller all ledig plass) */}
        <View style={st.middle}>
          <View style={st.hero}>
            <Text style={st.h1}>Velkommen{"\n"}til StudyBuddy!</Text>
            <Text style={st.sub}>
              Organiser notater, lag flashcards,{"\n"}
              og hold styr på oppgaver – alt på{"\n"}
              ett sted
            </Text>
          </View>

          <View style={st.bookWrap}>
            <Text accessibilityRole="image" style={st.bookIcon}>
              📖
            </Text>
          </View>
        </View>

        {/* BUNN (sticky CTA + footer) */}
        <View style={st.bottom}>
          <Pressable
            onPress={() => navigation.replace("Signup")}
            style={({ pressed }) => [st.cta, pressed && { opacity: 0.9 }]}
            accessibilityRole="button"
            accessibilityLabel="Kom i gang"
          >
            <Text style={st.ctaText}>Kom i gang</Text>
          </Pressable>
          <Text style={st.footer}>Laget for studenter, av studenter</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const CARD = "#FFFFFF";
const TEXT = "#111827";
const MUTED = "#6B7280";
const ACCENT = "#F7C4B6";
const AVATAR = "#CDE3F5";

const st = StyleSheet.create({
  // Hele skjermen fylles med hvitt (ingen topp-luft)
  safe: { flex: 1, backgroundColor: CARD },

  // Full-bleed layout – ingen margin/avrunding
  container: {
    flex: 1,
    backgroundColor: CARD,
    paddingHorizontal: 24,
  },

  // TOPP
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: AVATAR,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: { fontWeight: "800", fontSize: 16, color: "#1F2937" },
  brand: { fontWeight: "900", fontSize: 20, color: TEXT },

  // MIDT (tar all ledig plass)
  middle: { flex: 1, justifyContent: "center" },
  hero: { alignItems: "center", paddingTop: 8 },
  h1: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "900",
    color: TEXT,
    textAlign: "center",
    marginBottom: 12,
  },
  sub: { color: MUTED, fontSize: 16, textAlign: "center" },
  bookWrap: { alignItems: "center", marginTop: 28 },
  bookIcon: { fontSize: 180 },

  // BUNN
  bottom: { gap: 10, paddingTop: 12 },
  cta: {
    backgroundColor: ACCENT,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  ctaText: { color: TEXT, fontWeight: "800", fontSize: 18 },
  footer: { textAlign: "center", color: MUTED, fontSize: 12 },
});
