// app/mainscreen/main.tsx
import React, { useMemo } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  useWindowDimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";
import { signOut } from "firebase/auth";
import { auth } from "../config/firebase";

export default function MainScreen() {
  const { width } = useWindowDimensions();
  const twoCols = width >= 820;
  const navigation = useNavigation<any>();

  const user = auth.currentUser;
  const email = user?.email ?? "alex@example.com";
  const firstName = useMemo(() => email.split("@")[0], [email]);
  const avatarInitial = useMemo(() => (email[0] || "A").toUpperCase(), [email]);

  async function handleLogout() {
    try {
      await signOut(auth);
    } catch (err) {
      console.log("Signout error:", err);
    } finally {
      navigation.replace("Signup"); // ⬅️ endre til din auth/login route om nødvendig
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Topbar */}
        <View style={styles.topbar}>
          {/* Venstre: Brand */}
          <View style={styles.topbarLeft}>
            <Text style={styles.brand}>Study Buddy</Text>
          </View>

          {/* Midten: Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsContent}
            style={styles.tabsScroll}
          >
            <Pressable style={[styles.tab, styles.tabActive]}>
              <Text style={[styles.tabText, styles.tabTextActive]}>Dashboard</Text>
            </Pressable>
            <Pressable style={styles.tab}>
              <Text style={styles.tabText}>Flashcards</Text>
            </Pressable>
            <Pressable style={styles.tab}>
              <Text style={styles.tabText}>Planner</Text>
            </Pressable>
          </ScrollView>

          {/* Høyre: Avatar + Logg ut */}
          <View style={styles.topbarRight}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{avatarInitial}</Text>
            </View>
            <Pressable style={styles.logoutBtn} onPress={handleLogout} hitSlop={8}>
              <Text style={styles.logoutText}>Logg ut</Text>
            </Pressable>
          </View>
        </View>

        {/* Welcome */}
        <View style={styles.welcomeWrap}>
          <Text style={styles.h1}>Welcome back, {firstName}!</Text>
          <Text style={styles.subtle}>Signed in as {email}</Text>
        </View>

        {/* Grid */}
        <View style={[styles.grid, twoCols ? styles.gridRow : undefined]}>
          {/* Venstre kolonne */}
          <View style={[styles.col, twoCols ? styles.colLeft : styles.colFull]}>
            {/* My Boards */}
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardTitle}>My Boards</Text>
                <Pressable style={styles.pill}>
                  <Text style={styles.pillText}>+ New Board</Text>
                </Pressable>
              </View>

              <View style={styles.boardsRow}>
                <View style={[styles.boardCard, { backgroundColor: "#D7E8FB" }]}>
                  <Text style={styles.boardTitle}>Mathematics</Text>
                  <Text style={styles.boardMeta}>5 Notes</Text>
                  <Text style={styles.boardMeta}>8 Flashcards</Text>
                </View>

                <View style={[styles.boardCard, { backgroundColor: "#FAD8C9" }]}>
                  <Text style={styles.boardTitle}>Psychology</Text>
                  <Text style={styles.boardMeta}>3 Notes</Text>
                  <Text style={styles.boardMeta}>4 Flashcards</Text>
                </View>

                <View style={[styles.boardCard, { backgroundColor: "#F7E4B0" }]}>
                  <Text style={styles.boardTitle}>Design</Text>
                  <Text style={styles.boardMeta}>3 Notes</Text>
                  <Text style={styles.boardMeta}>2 Flashcards</Text>
                </View>
              </View>

              <Pressable style={[styles.pill, styles.pillGhost]}>
                <Text style={[styles.pillText, styles.pillGhostText]}>+ New Board</Text>
              </Pressable>
            </View>

            {/* Flashcards */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Flashcards</Text>
              <View style={styles.flashInner}>
                <Text style={styles.flashQuestion}>What is the capital of France?</Text>
                <Pressable style={styles.flashBtn}>
                  <Text style={styles.flashBtnText}>Show Answer</Text>
                </Pressable>
              </View>
            </View>
          </View>

          {/* Høyre kolonne */}
          <View style={[styles.col, twoCols ? styles.colRight : styles.colFull]}>
            {/* Upcoming Tasks */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Upcoming Tasks</Text>

              <View style={styles.task}>
                <View style={styles.bullet} />
                <View style={styles.taskTextWrap}>
                  <Text style={styles.taskTitle}>Review algebra flashcards</Text>
                  <Text style={styles.taskMeta}>Tomorrow</Text>
                </View>
              </View>

              <View style={styles.task}>
                <View style={styles.bullet} />
                <View style={styles.taskTextWrap}>
                  <Text style={styles.taskTitle}>Read chapters 3 & 4</Text>
                  <Text style={styles.taskMeta}>Psychology</Text>
                </View>
              </View>

              <View style={styles.task}>
                <View style={styles.bullet} />
                <View style={styles.taskTextWrap}>
                  <Text style={styles.taskTitle}>Complete poster assignment</Text>
                  <Text style={styles.taskMeta}>Friday</Text>
                </View>
              </View>
            </View>

            {/* Study Planner */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Study Planner</Text>

              <View style={styles.weekRow}>
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                  <Text key={d} style={styles.weekDay}>
                    {d}
                  </Text>
                ))}
              </View>

              <View style={styles.plannerBoard}>
                <View style={styles.planChipWrap}>
                  <View style={[styles.planChip, { backgroundColor: "#D7E8FB" }]}>
                    <Text style={styles.planChipText}>Review algebra flashcards</Text>
                  </View>
                  <Text style={styles.planMeta}>Monday</Text>
                </View>

                <View style={styles.planChipWrap}>
                  <View style={[styles.planChip, { backgroundColor: "#FAD8C9" }]}>
                    <Text style={styles.planChipText}>Chapters 3 & 4</Text>
                  </View>
                  <Text style={styles.planMeta}>Wednesday</Text>
                </View>

                <View style={styles.planChipWrap}>
                  <View style={[styles.planChip, { backgroundColor: "#F7E4B0" }]}>
                    <Text style={styles.planChipText}>Poster assignment</Text>
                  </View>
                  <Text style={styles.planMeta}>Friday</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---- styles ---- */
const BG = "#F8F5EF";
const CARD = "#FFFFFF";
const TEXT = "#1F2937";
const MUTED = "#6B7280";
const R = 16;

const shadow = {
  shadowColor: "#000",
  shadowOpacity: 0.06,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 6 },
  elevation: 3,
} as const;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  scroll: { padding: 16, gap: 16 },

  /* Topbar */
  topbar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CARD,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: R + 4,
    ...shadow,
  },
  topbarLeft: { flexShrink: 0, marginRight: 8 },
  brand: { fontSize: 20, fontWeight: "700", color: TEXT },

  // Tabs
  tabsScroll: { flexGrow: 0, flexShrink: 1, flexBasis: "auto", maxWidth: "70%" },
  tabsContent: {
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 4,
  },
  tab: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999 },
  tabActive: { backgroundColor: "#F2EADF" },
  tabText: { color: MUTED, fontSize: 14, fontWeight: "600" },
  tabTextActive: { color: TEXT },

  topbarRight: {
    flexShrink: 0,
    marginLeft: "auto",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#F2EADF",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontWeight: "700", color: TEXT },

  logoutBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#F4F4F5",
  },
  logoutText: { fontSize: 13, fontWeight: "700", color: TEXT },

  /* Welcome */
  welcomeWrap: { gap: 6, paddingHorizontal: 4 },
  h1: { fontSize: 24, fontWeight: "800", color: TEXT },
  subtle: { color: MUTED, fontSize: 14 },

  /* Grid */
  grid: { gap: 16 },
  gridRow: { flexDirection: "row" },
  col: { gap: 16 },
  colLeft: { flex: 1, paddingRight: 8 },
  colRight: { flex: 1, paddingLeft: 8 },
  colFull: { width: "100%" },

  /* Cards */
  card: {
    backgroundColor: CARD,
    borderRadius: R,
    padding: 16,
    gap: 12,
    ...shadow,
  },
  cardHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cardTitle: { fontSize: 16, fontWeight: "700", color: TEXT },

  /* Boards */
  boardsRow: { flexDirection: "row", gap: 12, flexWrap: "wrap" },
  boardCard: {
    flexGrow: 1,
    minWidth: 130,
    padding: 14,
    borderRadius: R,
    gap: 6,
  },
  boardTitle: { fontSize: 15, fontWeight: "700", color: TEXT },
  boardMeta: { fontSize: 12, color: MUTED },

  pill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#F2EADF",
  },
  pillText: { fontSize: 13, fontWeight: "700", color: TEXT },
  pillGhost: { backgroundColor: "#F4F4F5", alignSelf: "flex-start", marginTop: 8 },
  pillGhostText: { color: TEXT },

  /* Tasks */
  task: { flexDirection: "row", alignItems: "center", gap: 10 },
  bullet: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#A4B3C7" },
  taskTextWrap: { flexShrink: 1 },
  taskTitle: { fontSize: 14, fontWeight: "600", color: TEXT },
  taskMeta: { fontSize: 12, color: MUTED },

  /* Flashcards */
  flashInner: {
    backgroundColor: "#F9F7F3",
    borderRadius: R,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "#EFE7DB",
  },
  flashQuestion: { fontSize: 16, fontWeight: "700", color: TEXT },
  flashBtn: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#111827",
  },
  flashBtnText: { color: "#fff", fontWeight: "700" },

  /* Planner */
  weekRow: {
    flexDirection: "row",
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE6DA",
    paddingBottom: 8,
  },
  weekDay: { color: MUTED, fontSize: 12, fontWeight: "700" },
  plannerBoard: { gap: 12, paddingTop: 8 },
  planChipWrap: { gap: 4 },
  planChip: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  planChipText: { fontWeight: "700", color: TEXT },
  planMeta: { fontSize: 12, color: MUTED },
});
