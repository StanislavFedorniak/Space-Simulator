import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAiaKF1SxsME-8fW3w2UsMqzf7pRN-NRYQ",
  authDomain: "cosmic-simulator-21e8d.firebaseapp.com",
  projectId: "cosmic-simulator-21e8d",
  storageBucket: "cosmic-simulator-21e8d.firebasestorage.app",
  messagingSenderId: "53156116904",
  appId: "1:53156116904:web:60d486428b35e8185d459d"
};

// Ініціалізація Firebase
const app = initializeApp(firebaseConfig);

// Експорт сервісів для використання в інших частинах додатку
export const auth = getAuth(app);
export const db = getFirestore(app);
