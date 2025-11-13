// js/pontok.js
import { db } from "./firebase-init.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js";

const osztalyokRef = ref(db, "osztalyok");

// Get the canvas element
const ctx = document.getElementById('myChart');

onValue(osztalyokRef, (snapshot) => {
  const data = snapshot.val();

  if (data) {
    const sortedEntries = Object.entries(data).sort(([keyA, a], [keyB, b]) => {
      if (b.pont !== a.pont) return b.pont - a.pont;

      // If pont is 0, sort naturally by nev
      if (a.pont === 0 && b.pont === 0) {
        return a.nev.localeCompare(b.nev, undefined, { numeric: true, sensitivity: 'base' });
      }

      return 0;
    });

    const labels = [];
    const pontok1 = [];
    const pontok2 = [];

    sortedEntries.forEach(([key, value]) => {
      labels.push(value.nev);
      pontok1.push(value.pont1);
      pontok2.push(value.pont2);
    });

    let delayed;

    new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Pontok 1",
            data: pontok1,
            borderWidth: 2,
            backgroundColor: "rgba(0, 0, 255, 1)",
            borderColor: "rgba(128, 128, 255, 1)"
          },
          {
            label: "Pontok 2",
            data: pontok2,
            borderWidth: 2,
            backgroundColor: "rgba(255, 0, 0, 1)",
            borderColor: "rgba(255, 128, 128, 1)"
          },
          {
            label: "nigga balls",
            data: null,
            borderWidth: 2,
            backgroundColor: "rgba(0, 255, 0, 1)",
            borderColor: "rgba(128, 255, 128, 1)"
          },
        ]
      },
      options: {

        animation: {
          onComplete: () => {
            delayed = true;
          },
          delay: (context) => {
            let delay = 0;
            if (context.type === 'data' && context.mode === 'default' && !delayed) {
              delay = context.dataIndex * 300 + context.datasetIndex * 100;
            }
            return delay;
          },
        },


        responsive: true, // TODO: !
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        },
        scales: {
          x: {
            stacked: true
          },
          y: {
            stacked: true,
            beginAtZero: true
          }
        }
      }
    })

  } else {
    console.log("No data found.");
  }
});
