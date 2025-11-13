// js/pontok.js
import { db } from "./firebase-init.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js";

const osztalyokRef = ref(db, "osztalyok");

onValue(osztalyokRef, (snapshot) => {
  const data = snapshot.val();

  if (data) {
    Object.entries(data).forEach(([key, value]) => {
      console.log(`${key}:`, value);
    });
  } else {
    console.log("No data found.");
  }
});
