// js/pontok.js
import { db } from "./firebase-init.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js";

const osztalyokRef = ref(db, "osztalyok");

// Get the canvas element
const ctx = document.getElementById('myChart');

onValue(osztalyokRef, (snapshot) => {
  const data = snapshot.val();

  if (data) {
    const sortedEntries = Object.entries(data).sort((a, b) => b[1].pont - a[1].pont);

    const labels = [];
    const palack_pontok = [];
    const pontok = [];

    sortedEntries.forEach(([key, value]) => {
      labels.push(value.nev);
      palack_pontok.push(value.palack_pont);
      pontok.push(value.pont);
    });

    console.log(labels);
    console.log(pontok);

    new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Pontok",
            data: pontok,
            borderWidth: 2
          },
          {
            label: "Palackok",
            data: palack_pontok,
            borderWidth: 2
          },
          {
            label: "nigga balls",
            data: null,
            borderWidth: 2
          },
        ]
      },
      options: {
        responsive: true, // TODO: !
        scales: {
          x: {
            stacked: true
          },
          y: {
            beginAtZero: true
          }
        }
      }
    })

  } else {
    console.log("No data found.");
  }
});
