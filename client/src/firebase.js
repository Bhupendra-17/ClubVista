// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';  // Firestore import
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC6hr0gSajkImyMbBIp9BqUWxi5WCsqVII",
  authDomain: "schedule-3fe75.firebaseapp.com",
  projectId: "schedule-3fe75",
  storageBucket: "schedule-3fe75.appspot.com",
  messagingSenderId: "640645888126",
  appId: "1:640645888126:web:9948591168264a7c3a402f",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Authentication and Firestore
const auth = getAuth(app);
const db = getFirestore(app); // Firestore instance
const storage = getStorage(app); 
export { auth, db, storage };
