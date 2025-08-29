// app/auth/SignupInfo.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Keyboard,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export default function SignupInfo({ navigation }: any) {
  const insets = useSafeAreaInsets();

  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [confirm,   setConfirm]   = useState("");
  const [err,       setErr]       = useState<string|null>(null);
  const [showPw, setShowPw] = useState(false);
  const [focusField, setFocusField] =
    useState<null | "first" | "last" | "email" | "password" | "confirm">(null);

  // Dynamisk keyboard-padding så bunnelementer ikke "forsvinner"
  const [kbHeight, setKbHeight] = useState(0);
  useEffect(() => {
    const showEvt = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvt = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const showSub = Keyboard.addListener(showEvt, (e) => {
      setKbHeight(e?.endCoordinates?.height ?? 0);
    });
    const hideSub = Keyboard.addListener(hideEvt, () => setKbHeight(0));
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  const isEmail = (e:string)=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  // Kun for styrkeindikator (ikke progress)
  const pwScore = useMemo(() => {
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d|[^A-Za-z0-9]/.test(password)) score++;
    return Math.min(score, 4);
  }, [password]);

  // ✅ Likt vektede felter (20% hver)
  const totalProgress = useMemo(() => {
    const first = firstName.trim().length > 0 ? 1 : 0;
    const last  = lastName.trim().length  > 0 ? 1 : 0;
    const mail  = isEmail(email) ? 1 : 0;
    const pass  = password.length >= 6 ? 1 : 0;
    const conf  = confirm.length > 0 && confirm === password ? 1 : 0;
    const vals  = [first, last, mail, pass, conf];
    const pct   = Math.round((vals.reduce((a,b)=>a+b,0) / vals.length) * 100);
    return Math.max(0, Math.min(100, pct));
  }, [firstName, lastName, email, password, confirm]);

  const pwColor = ["#E5E7EB", "#F59E0B", "#84CC16", "#22C55E", "#059669"][pwScore];
  const pwLabel = ["Svært svakt", "Svakt", "OK", "Sterkt", "Veldig sterkt"][pwScore];

  function next() {
    if (!firstName.trim() || !lastName.trim()) return setErr("Fyll inn fornavn og etternavn.");
    if (!isEmail(email)) return setErr("Bruk en gyldig e-postadresse.");
    if (password.length < 6) return setErr("Passord må være minst 6 tegn.");
    if (password !== confirm) return setErr("Passordene matcher ikke.");
    setErr(null);
    navigation.navigate("SignupPlan", { firstName, lastName, email, password });
  }

  return (
    <SafeAreaView style={[st.safe, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      {/* Subtile bakgrunnsblobs */}
      <View pointerEvents="none" style={st.blobsWrap}>
        <View style={st.blobTop} />
        <View style={st.blobBottom} />
      </View>

      <KeyboardAvoidingView
        style={{flex:1}}
        behavior={Platform.OS==="ios" ? "padding" : undefined}
        keyboardVerticalOffset={insets.top}
      >
        {/* Hovedcontainer uten ScrollView */}
        <View
          style={[
            st.container,
            { paddingBottom: Math.max(insets.bottom, 16) + (kbHeight ? kbHeight + 12 : 0) }
          ]}
        >
          {/* Toppstripe med logo */}
          <View style={st.topBar}>
            <View style={st.logoBox}><Text style={st.logoText}>SB</Text></View>
            <Text style={st.brand}>StudyBuddy</Text>
          </View>

          {/* Kort */}
          <View style={st.card}>
            {/* Overskrift + dynamisk progress */}
            <View style={st.headerRow}>
              <View>
                <Text style={st.h1}>Opprett konto</Text>
                <Text style={st.sub}>Steg 1 av 2 · Din info</Text>
              </View>
              <Text style={st.stepPct}>{totalProgress}%</Text>
            </View>
            <View style={st.progressTrack}>
              <View style={[st.progressFill, { width: `${totalProgress}%` }]} />
            </View>

            {/* Navn — større felter, like bredder (50/50) */}
            <View style={st.row}>
              <Field
                label="Fornavn"
                value={firstName}
                placeholder="Fornavn"
                onChange={(v)=>{setFirstName(v); if(err) setErr(null);}}
                onFocus={()=>setFocusField("first")}
                onBlur={()=>setFocusField(null)}
                focused={focusField==="first"}
                big
                flex
              />
              <Field
                label="Etternavn"
                value={lastName}
                placeholder="Etternavn"
                onChange={(v)=>{setLastName(v); if(err) setErr(null);}}
                onFocus={()=>setFocusField("last")}
                onBlur={()=>setFocusField(null)}
                focused={focusField==="last"}
                big
                flex
              />
            </View>

            {/* E-post */}
            <Field
              label="E-post"
              value={email}
              placeholder="navn@skole.no"
              onChange={(v)=>{setEmail(v); if(err) setErr(null);}} 
              onFocus={()=>setFocusField("email")}
              onBlur={()=>setFocusField(null)}
              focused={focusField==="email"}
              autoCapitalize="none"
              autoCorrect={false}
              inputMode="email"
              hint="Bruk en adresse du sjekker ofte."
            />

            {/* Passord */}
            <Field
              label="Passord"
              value={password}
              placeholder="••••••••"
              onChange={(v)=>{setPassword(v); if(err) setErr(null);}}
              onFocus={()=>setFocusField("password")}
              onBlur={()=>setFocusField(null)}
              focused={focusField==="password"}
              secureTextEntry={!showPw}
              rightIcon={
                <Pressable onPress={()=>setShowPw(v=>!v)} hitSlop={8} accessibilityLabel={showPw ? "Skjul passord" : "Vis passord"}>
                  <Text style={st.eyeIcon}>{showPw ? "🙈" : "👁️"}</Text>
                </Pressable>
              }
              hint={
                <View style={st.strengthRow}>
                  {[0,1,2,3].map(i=>(
                    <View key={i} style={[
                      st.strengthBar,
                      { backgroundColor: i < pwScore ? pwColor : "#E5E7EB" }
                    ]}/>
                  ))}
                  <Text style={st.mutedSmall}>{pwLabel}</Text>
                </View>
              }
            />

            {/* Bekreft passord */}
            <Field
              label="Bekreft passord"
              value={confirm}
              placeholder="••••••••"
              onChange={(v)=>{setConfirm(v); if(err) setErr(null);}}
              onFocus={()=>setFocusField("confirm")}
              onBlur={()=>setFocusField(null)}
              focused={focusField==="confirm"}
              secureTextEntry
              onSubmitEditing={next}
            />

            {err ? <Text style={st.error} accessibilityLiveRegion="polite">{err}</Text> : null}

            <View style={st.actions}>
              <Pressable style={st.secondary} onPress={()=>navigation.replace("Signup")}>
                <Text style={st.secondaryText}>Til innlogging</Text>
              </Pressable>
              <Pressable style={st.primary} onPress={next}>
                <Text style={st.primaryText}>Neste</Text>
              </Pressable>
            </View>

            <View style={st.footNotes}>
              <Text style={st.note}>• Vi deler aldri e-posten din.</Text>
              <Text style={st.note}>• Du kan endre navn og e-post senere.</Text>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/** Reusable Field component */
function Field({
  label,
  value,
  onChange,
  placeholder,
  focused,
  secureTextEntry,
  rightIcon,
  hint,
  onFocus,
  onBlur,
  inputMode,
  autoCapitalize,
  autoCorrect,
  onSubmitEditing,
  big,
  flex,
}: {
  label: string;
  value: string;
  onChange: (v: string)=>void;
  placeholder?: string;
  focused?: boolean;
  secureTextEntry?: boolean;
  rightIcon?: React.ReactNode;
  hint?: React.ReactNode | string;
  onFocus?: ()=>void;
  onBlur?: ()=>void;
  inputMode?: "email" | "numeric" | "decimal" | "tel" | "url" | "search" | "none" | "text";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  autoCorrect?: boolean;
  onSubmitEditing?: ()=>void;
  big?: boolean;
  flex?: boolean;
}) {
  return (
    <View style={[st.inputWrap, focused ? st.inputFocus : st.inputIdle, big && st.inputBig, flex && { flex: 1 }]}>
      <Text style={st.label}>{label}</Text>
      <View style={{ position:"relative" }}>
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          style={[st.input, big && st.inputTall]}
          secureTextEntry={secureTextEntry}
          onFocus={onFocus}
          onBlur={onBlur}
          inputMode={inputMode}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          returnKeyType="next"
          onSubmitEditing={onSubmitEditing}
        />
        {rightIcon ? <View style={st.rightIcon}>{rightIcon}</View> : null}
      </View>
      {typeof hint === "string" ? <Text style={st.hint}>{hint}</Text> : hint}
    </View>
  );
}

/* Design tokens */
const BG="#F7F3ED",
      CARD="#FFFFFF",
      TEXT="#0F172A",
      MUTED="#6B7280",
      BORDER="#E5E7EB",
      INP_BG="#F6F7FA",
      FOCUS="#EEF5FF",
      ACCENT="#111827",
      LOGO_BG="#CDE3F5",
      ERROR_BG="#FDE2E1";

/* Styles */
const st = StyleSheet.create({
  safe:{ flex:1, backgroundColor: BG },

  // Uten ScrollView: bruk container med flex og padding
  container:{
    flex:1,
    justifyContent:"center",
    paddingHorizontal:20,
  },

  // Bakgrunnsblobs
  blobsWrap:{ ...StyleSheet.absoluteFillObject, overflow:"hidden" },
  blobTop:{
    position:"absolute", top:-120, right:-80, width:240, height:240, borderRadius:240,
    backgroundColor:"rgba(235, 200, 255, 0.35)",
  },
  blobBottom:{
    position:"absolute", bottom:-100, left:-60, width:220, height:220, borderRadius:220,
    backgroundColor:"rgba(197, 232, 255, 0.45)",
  },

  // Toppstripe + logo
  topBar:{
    flexDirection:"row",
    alignItems:"center",
    gap:10,
    alignSelf:"center",
    marginBottom:12,
  },
  logoBox:{
    width:42, height:42, borderRadius:12, backgroundColor:LOGO_BG,
    alignItems:"center", justifyContent:"center",
    shadowColor:"#000", shadowOpacity:0.06, shadowRadius:8, elevation:2
  },
  logoText:{ fontWeight:"900", color:TEXT, letterSpacing:0.3 },
  brand:{ color:TEXT, fontWeight:"900", fontSize:18, letterSpacing:0.3 },

  // Card
  card:{
    backgroundColor:CARD,
    borderRadius:22,
    padding:20,
    gap:14,
    shadowColor:"#000",
    shadowOpacity:0.08,
    shadowRadius:12,
    elevation:3,
    borderWidth:1,
    borderColor:"#F0EFEA",
  },

  // Header + progress
  headerRow:{ flexDirection:"row", alignItems:"flex-end", justifyContent:"space-between" },
  h1:{ fontSize:22, fontWeight:"900", color:TEXT },
  sub:{ color:MUTED, marginTop:2 },
  stepPct:{ color:MUTED, fontWeight:"800" },
  progressTrack:{ height:8, backgroundColor:"#EFEFEA", borderRadius:999, overflow:"hidden" },
  progressFill:{ height:"100%", backgroundColor:ACCENT, width:"0%" },

  // Inputs (like bredde/høyde)
  row:{ flexDirection:"row", gap:10 },
  inputWrap:{
    backgroundColor:INP_BG,
    borderRadius:14,
    paddingHorizontal:12,
    paddingTop:12,
    paddingBottom:12,
    borderWidth:1,
    minHeight:84, // konsekvent høyde
  },
  inputBig:{ minHeight:96 }, // større for fornavn/etternavn
  inputIdle:{ borderColor:"transparent" },
  inputFocus:{ borderColor:"#C9DEFF", backgroundColor:FOCUS },
  label:{ color:TEXT, fontWeight:"700", marginBottom:8 },
  input:{ color:TEXT, padding:0, paddingVertical:12, fontSize:17 },
  inputTall:{ paddingVertical:16, fontSize:18 },
  rightIcon:{ position:"absolute", right:6, top:6, height:32, width:32, alignItems:"center", justifyContent:"center" },

  eyeIcon:{ fontSize:16 },
  hint:{ color:MUTED, fontSize:12, marginTop:6 },
  mutedSmall:{ color:MUTED, fontSize:12 },

  // Passord-styrke
  strengthRow:{ flexDirection:"row", alignItems:"center", gap:6, marginTop:8 },
  strengthBar:{ flex:1, height:6, borderRadius:6, backgroundColor:BORDER },

  // Feil
  error:{ color:"#8A1C1C", backgroundColor:ERROR_BG, fontWeight:"600", paddingHorizontal:10, paddingVertical:8, borderRadius:10 },

  // Actions
  actions:{ flexDirection:"row", justifyContent:"space-between", gap:10, marginTop:6 },
  primary:{ backgroundColor:ACCENT, paddingVertical:14, borderRadius:14, alignItems:"center", flex:1 },
  primaryText:{ color:"#fff", fontWeight:"900" },
  secondary:{ backgroundColor:"#E5E7EB", paddingVertical:14, borderRadius:14, alignItems:"center", flex:1 },
  secondaryText:{ color:TEXT, fontWeight:"800" },

  // Footer notes
  footNotes:{ gap:4, marginTop:10 },
  note:{ color:MUTED, fontSize:12 },
});
