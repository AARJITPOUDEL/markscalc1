import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB-HUEL41awgdhOLVb6ekvw_WcQISswxOE",
  authDomain: "markscalc-b9547.firebaseapp.com",
  projectId: "markscalc-b9547",
  storageBucket: "markscalc-b9547.appspot.com",
  messagingSenderId: "380227445627",
  appId: "1:380227445627:web:79e0a5c946b63a706d13de",
  measurementId: "G-7R80H734MZ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, collection, addDoc, getDocs}; 
export const auth = getAuth(app);
export default app;