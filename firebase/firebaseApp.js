// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
console.log(process.env.NEXT_PUBLIC_API_KEY);

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
  authDomain: "remapp-aef97.firebaseapp.com",
  projectId: "remapp-aef97",
  storageBucket: "remapp-aef97.appspot.com",
  messagingSenderId: "269298844083",
  appId: "1:269298844083:web:1f8848295debadc24c0bc6",
};

export const app = initializeApp(firebaseConfig);

export const initFirebase = () => {
  return app;
};

export const db = getFirestore(app);
