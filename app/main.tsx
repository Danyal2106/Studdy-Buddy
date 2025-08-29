// app/main.tsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// ⚠️ Sjekk filnavn/sti og stor/liten bokstav hos deg
import Signup from "./auth/signup";          // eller "./auth/signup"
import SignupInfo from "./auth/SignupInfo";  // ny side (steg 1: navn+epost+passord)
import SignupPlan from "./auth/SignupPlan";  // ny side (steg 2: planvalg)
import MainScreen from "./mainscreen/MainScreen";
import Checkout from "./auth/Checkout";
import Onboarding from "./onboarding/Onboarding"; // ✅

export type RootStackParamList = {
  Onboarding: undefined;
  Signup: undefined;
  SignupInfo: undefined;
  SignupPlan: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  } | undefined;
  Dashboard: undefined;

  Checkout: {
    firstName?: string | null;
    lastName?: string | null;
    email: string;
    password: string;
    plan: "medium" | "premium";
    price: number; // 50 eller 200
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Onboarding">
      <Stack.Screen name="Onboarding" component={Onboarding} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="SignupInfo" component={SignupInfo} />
        <Stack.Screen name="SignupPlan" component={SignupPlan} />
        <Stack.Screen name="Dashboard" component={MainScreen} />
        <Stack.Screen name="Checkout" component={Checkout}/>

      </Stack.Navigator>
    </NavigationContainer>
  );
}
