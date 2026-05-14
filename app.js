// Import the functions I need from the SDKs you need
import { initializeApp, getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC_yr7SB4Guyy5Q2t4XqmHdZ0tE6LXPkoA",
  authDomain: "usc-it-ideas.firebaseapp.com",
  projectId: "usc-it-ideas",
  storageBucket: "usc-it-ideas.firebasestorage.app",
  messagingSenderId: "754003756286",
  appId: "1:754003756286:web:0ac230fa79d642e25451af",
  measurementId: "G-25K8Z5MHC9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics (commented out if causing issues)
try {
  const analytics = getAnalytics(app);
} catch (error) {
  console.log("Analytics initialization skipped:", error.message);
}
