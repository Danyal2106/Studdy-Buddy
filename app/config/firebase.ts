// app/config/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSy...DIN_NØKKEL...",
  authDomain: "ditt-prosjekt.firebaseapp.com",
  projectId: "ditt-prosjekt",
  storageBucket: "ditt-prosjekt.appspot.com",
  messagingSenderId: "###########",
  appId: "1:###########:web:############",
};



const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
export { app, auth, db };
