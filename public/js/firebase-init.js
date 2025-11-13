import firebase from "firebase/app";
import "firebase/compat/database";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDoTMPOmlfDZFaXdnrWUqVEHszosjeX0Wc",
  authDomain: "lasvajda.firebaseapp.com",
  databaseURL: "https://lasvajda-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "lasvajda",
  storageBucket: "lasvajda.firebasestorage.app",
  messagingSenderId: "840727326336",
  appId: "1:840727326336:web:d6d8956f3713b084120065",
  measurementId: "G-DWGE2QK3TX"
};

const app = firebase.initializeApp(firebaseConfig);
const db = firebase.database();