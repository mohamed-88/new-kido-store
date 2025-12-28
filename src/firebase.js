import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDMLt5ummt1AxJ-do7PXc9wqmh45csiJqY",
  authDomain: "windy-orb-450823-c4.firebaseapp.com",
  databaseURL: "https://windy-orb-450823-c4-default-rtdb.firebaseio.com",
  projectId: "windy-orb-450823-c4",
  storageBucket: "windy-orb-450823-c4.firebasestorage.app",
  messagingSenderId: "964628645871",
  appId: "1:964628645871:web:d783b91f114a385218181a",
  measurementId: "G-C5J6T61PMV"
};

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);
export const auth = getAuth(app);