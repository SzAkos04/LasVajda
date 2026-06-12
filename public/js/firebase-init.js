import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyDoTMPOmlfDZFaXdnrWUqVEHszosjeX0Wc",
    authDomain: "lasvajda.firebaseapp.com",
    databaseURL: "https://lasvajda-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "lasvajda",
    storageBucket: "lasvajda.firebasestorage.app",
    messagingSenderId: "840727326336",
    appId: "1:840727326336:web:d6d8956f3713b084120065",
    measurementId: "G-DWGE2QK3TX",
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);