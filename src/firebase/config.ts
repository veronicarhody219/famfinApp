// src/firebase/config.ts

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Lấy các biến môi trường từ Vite
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
};

export const appId = import.meta.env.VITE_APP_ID;

// Khởi tạo Firebase App
const app = initializeApp(firebaseConfig);

// Khởi tạo các dịch vụ Firebase
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
