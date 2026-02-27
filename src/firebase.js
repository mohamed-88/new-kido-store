import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  FacebookAuthProvider, 
  OAuthProvider 
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // بارکرنا خزمەتگوزاریا ستۆرێج بۆ وێنەیان

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

// Initialize Services
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp); // ئەڤە بۆ وێنەیێن پڕۆفایلی پێدڤییە

// Providers
export const googleProvider = new GoogleAuthProvider();
// ئەڤ دێرە دێ هاریکار بیت کو هەمی جاران پەنجەرا هەلبژارتنا جیمەیڵی بۆ یوزەری ڤەبیت
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const facebookProvider = new FacebookAuthProvider();
export const appleProvider = new OAuthProvider('apple.com');

// زمانێ فایەربەیس دگەل زمانێ مۆبایل یان کۆمپیۆتەری ڕێک دێخیت
auth.useDeviceLanguage();

export default firebaseApp;



// import { initializeApp } from "firebase/app";
// import { 
//   getAuth, 
//   GoogleAuthProvider, 
//   FacebookAuthProvider, 
//   OAuthProvider 
// } from "firebase/auth";
// import { getFirestore } from "firebase/firestore";
// import { getStorage } from "firebase/storage";

// // زانیاریێن پڕۆژێ تە یێ نوی یێ Firebase (kido-store-14e4e)
// const firebaseConfig = {
//   apiKey: "AIzaSyD1o_1wnuhsxAumNQJkS-DcHHmTCCGH0kA",
//   authDomain: "kido-store-14e4e.firebaseapp.com",
//   databaseURL: "https://kido-store-14e4e-default-rtdb.firebaseio.com",
//   projectId: "kido-store-14e4e",
//   storageBucket: "kido-store-14e4e.firebasestorage.app",
//   messagingSenderId: "635487282183",
//   appId: "1:635487282183:web:38cc5c447cf534b1bc76a2",
//   measurementId: "G-YEJN059SK3"
// };

// // Initialize Firebase
// export const firebaseApp = initializeApp(firebaseConfig);

// // Export کرنا خزمەتگوزاریێن پێدڤی
// export const auth = getAuth(firebaseApp);
// export const db = getFirestore(firebaseApp);
// export const storage = getStorage(firebaseApp);

// // Providers بۆ لۆگینێ (ئەگەر تە بڤێت بکاربینی)
// export const googleProvider = new GoogleAuthProvider();
// export const facebookProvider = new FacebookAuthProvider();
// export const appleProvider = new OAuthProvider('apple.com');