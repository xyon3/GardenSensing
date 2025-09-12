import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Replace with your Firebase project config
const firebaseConfig = {
    apiKey: "AIzaSyC-bQFfs6VIPv0P639rOiq1oGl7iNockto",
    authDomain: "dhtsensing-54264.firebaseapp.com",
    databaseURL:
        "https://dhtsensing-54264-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "dhtsensing-54264",
    storageBucket: "dhtsensing-54264.firebasestorage.app",
    messagingSenderId: "970090691538",
    appId: "1:970090691538:web:84b7f514a778b0233aa60b",
    measurementId: "G-F8ZH1442Z6",
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
