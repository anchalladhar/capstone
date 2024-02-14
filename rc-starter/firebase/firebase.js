
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getRemoteConfig, isSupported } from 'firebase/remote-config';
import { getAnalytics, isSupported as isSupportedAnalytics } from "firebase/analytics";

// Configure Firebase.
export const firebaseConfig = {
  // Insert your Firebase project's configuration here
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
