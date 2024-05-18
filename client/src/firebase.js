// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "xspark-blog.firebaseapp.com",
  projectId: "xspark-blog",
  storageBucket: "xspark-blog.appspot.com",
  messagingSenderId: "1035307993414",
  appId: "1:1035307993414:web:e6e8bb2aca86ec8a0dbd47",
  measurementId: "G-TDR0WV75GD"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
