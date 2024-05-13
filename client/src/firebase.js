// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "thousand-winters.firebaseapp.com",
  databaseURL: "https://thousand-winters-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "thousand-winters",
  storageBucket: "thousand-winters.appspot.com",
  messagingSenderId: "769730150065",
  appId: "1:769730150065:web:27bbbd24ed3b4e81aeac90",
  measurementId: "G-ZFW1J44LW6"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
