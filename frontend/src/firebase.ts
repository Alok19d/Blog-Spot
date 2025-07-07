// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "meet-app-8a459.firebaseapp.com",
  projectId: "meet-app-8a459",
  storageBucket: "meet-app-8a459.firebasestorage.app",
  messagingSenderId: "261616196614",
  appId: "1:261616196614:web:d28b625c10c3a236eaf787"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);