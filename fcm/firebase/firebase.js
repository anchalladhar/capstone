

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging, isSupported } from 'firebase/messaging';
import { getStorage } from "firebase/storage";

// Configure Firebase.
export const firebaseConfig = {
    apiKey: "AIzaSyB8xMPCyes3GGvxz0-ig2jbwqdpBDKB1Rk",
    authDomain: "expensetracker-5501a.firebaseapp.com",
    projectId: "expensetracker-5501a",
    storageBucket: "expensetracker-5501a.appspot.com",
    messagingSenderId: "989666135103",
    appId: "1:989666135103:web:a69eef7ce191eb52dffc8a",
    measurementId: "G-YVP679EBHY"
  };

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const messaging = async () => await isSupported() && getMessaging(app);
export const storage = getStorage(app); 