import { db } from "./firebase-init.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js";

const osztalyokRef = ref(db, "osztalyok");
const ctx = document.getElementById('myChart');
const leaderboard = document.getElementById('leaderboard');
const lastUpdated = document.getElementById('lastUpdated');

const GOLD = 'rgba(212, 175, 55, 0.85)';
const GOLD_BORDER = 'rgba(245, 216, 122, 1)';

Chart.defaults.color = 'rgba(245, 240, 232, 0.55)';
Chart.defaults.font.family = "'JetBrains Mono', monospace";
Chart.defaults.font.size = 11;

function sortEntries(data) {
    return Object.entries(data).sort(([, a], [, b]) => {
        const palackA = a.palackok ?? 0;
        const palackB = b.palackok ?? 0;
        
        if (palackB !== palackA) return palackB - palackA;
        
        const nevA = a.nev ?? '';
        const nevB = b.nev ?? '';
        return nevA.localeCompare(nevB, undefined, { numeric: true, sensitivity: 'base' });
    });
}

let chart = null;
let animDelayed = false;

function buildChart(labels, pontok) {
    if (chart) {
        chart.data.labels = labels;
        chart.data.datasets[0].data = pontok;
        chart.update('active');
        return;
    }

    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [
                {
                    label: 'Palackok',
                    data: pontok,
                    backgroundColor: GOLD,
                    borderColor: GOLD_BORDER,
                    borderWidth: 1.5,
                    borderRadius: 4,
                    borderSkipped: false,
                },
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,

            animation: {
                onComplete: () => { animDelayed = true; },
                delay: (ctx) => {
                    if (ctx.type === 'data' && ctx.mode === 'default' && !animDelayed) {
                        return ctx.dataIndex * 120 + ctx.datasetIndex * 60;
                    }
                    return 0;
                },
            },

            interaction: {
                mode: 'index',
                intersect: false,
            },

            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        padding: 20,
                        boxWidth: 14,
                        boxHeight: 14,
                        borderRadius: 4,
                        useBorderRadius: true,
                        color: 'rgba(245, 240, 232, 0.75)',
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(10, 10, 10, 0.92)',
                    borderColor: 'rgba(212, 175, 55, 0.3)',
                    borderWidth: 1,
                    titleColor: '#f5d87a',
                    bodyColor: 'rgba(245, 240, 232, 0.8)',
                    padding: 12,
                }
            },

            scales: {
                x: {
                    grid: {
                        color: 'rgba(255,255,255,0.04)',
                        drawBorder: false,
                    },
                    ticks: {
                        maxRotation: 30,
                        color: 'rgba(245, 240, 232, 0.6)',
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255,255,255,0.06)',
                        drawBorder: false,
                    },
                    ticks: {
                        color: 'rgba(245, 240, 232, 0.5)',
                        precision: 0,
                    }
                }
            }
        }
    });
}

const MEDALS = ['🥇', '🥈', '🥉'];

function buildLeaderboard(sorted) {
    if (!sorted.length) {
        leaderboard.innerHTML = '<div class="pg-loading">Nincs adat.</div>';
        return;
    }

    const maxTotal = sorted[0][1].palackok ?? 1;

    leaderboard.innerHTML = sorted.map(([, val], i) => {
        const total = val.palackok ?? 0;
        const pct = maxTotal > 0 ? Math.round((total / maxTotal) * 100) : 0;
        const rank = i + 1;
        const rankDisplay = rank <= 3
            ? `<span class="pg-rank-medal">${MEDALS[i]}</span>`
            : `<span class="pg-rank">${rank}</span>`;

        return `
            <div class="pg-row" data-rank="${rank}">
                <div class="pg-row-bar" style="width:${pct}%"></div>
                ${rankDisplay}
                <div class="pg-name">${val.nev ?? '—'}</div> 
                <div class="pg-bars"></div>
                <div class="pg-total">${total}</div>
            </div>
        `;
    }).join('');
}

function updateTimestamp() {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    lastUpdated.textContent = `Frissítve: ${hh}:${mm}:${ss}`;
}

onValue(osztalyokRef, (snapshot) => {
    const data = snapshot.val();

    if (!data) {
        leaderboard.innerHTML = '<div class="pg-loading">Adatok nem találhatóak.</div>';
        return;
    }

    const sorted = sortEntries(data);

    const labels = sorted.map(([, v]) => v.nev ?? '?');
    const pontok = sorted.map(([, v]) => v.palackok ?? 0);

    buildChart(labels, pontok);
    buildLeaderboard(sorted);
    updateTimestamp();
});