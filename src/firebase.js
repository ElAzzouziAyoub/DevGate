// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBXuDNYnRy3MLrItTnKAztYRx3e8KlUH3U",
    authDomain: "devgate-73bd8.firebaseapp.com",
    projectId: "devgate-73bd8",
    storageBucket: "devgate-73bd8.firebasestorage.app",
    messagingSenderId: "878460174637",
    appId: "1:878460174637:web:42a35e3ca68a43595b53a4"
  };

const app = initializeApp(firebaseConfig);


const auth = getAuth(app);
const db = getFirestore(app);   

export { auth , db};

