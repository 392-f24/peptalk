// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBotGH7V8qXLd4rtn4N1-8-zEZn5W2U3KI",
  authDomain: "peptalk-navy.firebaseapp.com",
  databaseURL: "https://peptalk-navy-default-rtdb.firebaseio.com",
  projectId: "peptalk-navy",
  storageBucket: "peptalk-navy.firebasestorage.app",
  messagingSenderId: "176820162749",
  appId: "1:176820162749:web:ea240d2d497ad81828e7d4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);