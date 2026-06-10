// js/palackgyujtes.js
import { db } from "./firebase-init.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js";
import { renderLeaderboard, updateTimestamp } from "./leaderboard.js";

const osztalyokRef = ref(db, "osztalyok");
const ctx = document.getElementById('myChart');
const leaderboard = document.getElementById('leaderboard');
const lastUpdated = document.getElementById('lastUpdated');

const GOLD = 'rgba(212, 175, 55, 0.85)';
const GOLD_BORDER = 'rgba(245, 216, 122, 1)';

Chart.defaults.color = 'rgba(245, 240, 232, 0.55)';
Chart.defaults.font.family = "'JetBrains Mono', monospace";
Chart.defaults.font.size = 11;

function getTotal(classObj) {
    return classObj.palackok ?? 0;
}

function sortEntries(data) {
    return Object.entries(data).sort(([, a], [, b]) => {
        const diff = getTotal(b) - getTotal(a);
        if (diff !== 0) return diff;
        return (a.nev ?? '').localeCompare(b.nev ?? '', undefined, { numeric: true, sensitivity: 'base' });
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
            datasets: [{
                label: 'Palackok',
                data: pontok,
                backgroundColor: GOLD,
                borderColor: GOLD_BORDER,
                borderWidth: 1.5,
                borderRadius: 4,
                borderSkipped: false,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                onComplete: () => { animDelayed = true; },
                delay: (ctx) => {
                    if (ctx.type === 'data' && ctx.mode === 'default' && !animDelayed)
                        return ctx.dataIndex * 120 + ctx.datasetIndex * 60;
                    return 0;
                },
            },
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        padding: 20, boxWidth: 14, boxHeight: 14,
                        borderRadius: 4, useBorderRadius: true,
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
                x: { grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false }, ticks: { maxRotation: 30, color: 'rgba(245, 240, 232, 0.6)' } },
                y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.06)', drawBorder: false }, ticks: { color: 'rgba(245, 240, 232, 0.5)', precision: 0 } }
            }
        }
    });
}

onValue(osztalyokRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) {
        leaderboard.innerHTML = '<div class="pg-loading">Adatok nem találhatóak.</div>';
        return;
    }

    const sorted = sortEntries(data);
    const labels = sorted.map(([, v]) => v.nev ?? '?');
    const pontok = sorted.map(([, v]) => getTotal(v));
    const maxTotal = getTotal(sorted[0]?.[1] ?? {}) || 1;

    buildChart(labels, pontok);
    renderLeaderboard(leaderboard, sorted, maxTotal, getTotal);
    updateTimestamp(lastUpdated);
});
