// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-analytics.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDoTMPOmlfDZFaXdnrWUqVEHszosjeX0Wc",
    authDomain: "lasvajda.firebaseapp.com",
    projectId: "lasvajda",
    storageBucket: "lasvajda.firebasestorage.app",
    messagingSenderId: "840727326336",
    appId: "1:840727326336:web:d6d8956f3713b084120065",
    measurementId: "G-DWGE2QK3TX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);