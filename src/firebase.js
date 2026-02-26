import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  FacebookAuthProvider, 
  OAuthProvider 
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// زانیاریێن پڕۆژێ تە یێ نوی یێ Firebase (kido-store-14e4e)
const firebaseConfig = {
  apiKey: "AIzaSyD1o_1wnuhsxAumNQJkS-DcHHmTCCGH0kA",
  authDomain: "kido-store-14e4e.firebaseapp.com",
  databaseURL: "https://kido-store-14e4e-default-rtdb.firebaseio.com",
  projectId: "kido-store-14e4e",
  storageBucket: "kido-store-14e4e.firebasestorage.app",
  messagingSenderId: "635487282183",
  appId: "1:635487282183:web:38cc5c447cf534b1bc76a2",
  measurementId: "G-YEJN059SK3"
};

// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig);

// Export کرنا خزمەتگوزاریێن پێدڤی
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);

// Providers بۆ لۆگینێ (ئەگەر تە بڤێت بکاربینی)
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();
export const appleProvider = new OAuthProvider('apple.com');





// import { initializeApp } from "firebase/app";
// import { 
//   getAuth, 
//   GoogleAuthProvider, 
//   FacebookAuthProvider, 
//   OAuthProvider 
// } from "firebase/auth";
// import { getFirestore } from "firebase/firestore"; // ✅ گوهۆڕین بۆ Firestore
// import { getStorage } from "firebase/storage";

// // ئەڤە زانیاریێن پڕۆژێ تە یێ نوو نە (Kido Store)
// const firebaseConfig = {
//   apiKey: "AIzaSyAXPn3CYkH-GDpjkLzPUiO6ewNrkgThT3U",
//   authDomain: "kido-store-a2c3c.firebaseapp.com",
//   projectId: "kido-store-a2c3c",
//   storageBucket: "kido-store-a2c3c.firebasestorage.app",
//   messagingSenderId: "874195532458",
//   appId: "1:874195532458:web:dd6b0ba06f987ae5156ed3",
//   measurementId: "G-2Z24Q5XR5M"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);

// // Export کرنا خزمەتگوزارییان
// export const auth = getAuth(app);
// export const db = getFirestore(app); // ✅ نوکە db دێ ل سەر Firestore کار کەت
// export const storage = getStorage(app);

// // Providers بۆ لۆگینێ
// export const googleProvider = new GoogleAuthProvider();
// export const facebookProvider = new FacebookAuthProvider();
// export const appleProvider = new OAuthProvider('apple.com');