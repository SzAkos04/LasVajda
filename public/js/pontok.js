// js/pontok.js
import { db } from "./firebase-init.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js";
import { renderLeaderboard, updateTimestamp } from "./leaderboard.js";

const osztalyokRef = ref(db, "osztalyok");
const ctx = document.getElementById('myChart');
const leaderboard = document.getElementById('leaderboard');
const lastUpdated = document.getElementById('lastUpdated');

Chart.defaults.color = 'rgba(245, 240, 232, 0.55)';
Chart.defaults.font.family = "'JetBrains Mono', monospace";
Chart.defaults.font.size = 11;

const PALETTE = [
    { bg: 'rgba(212, 175, 55, 0.85)',  border: 'rgba(245, 216, 122, 1)' },
    { bg: 'rgba(139, 0, 0, 0.75)',     border: 'rgba(192, 57, 43, 1)'   },
    { bg: 'rgba(46, 139, 87, 0.75)',   border: 'rgba(52, 152, 219, 1)'  },
    { bg: 'rgba(142, 68, 173, 0.75)',  border: 'rgba(155, 89, 182, 1)'  },
    { bg: 'rgba(211, 84, 0, 0.75)',    border: 'rgba(230, 126, 34, 1)'  }
];

export function getClassTotal(classObj) {
    if (!classObj.pontok || typeof classObj.pontok !== 'object') return 0;
    return Object.values(classObj.pontok).reduce((sum, pObj) => {
        return sum + (pObj?.pont ?? 0);
    }, 0);
}

function sortEntries(data) {
    return Object.entries(data).sort(([, a], [, b]) => {
        const diff = getClassTotal(b) - getClassTotal(a);
        if (diff !== 0) return diff;
        return (a.nev ?? '').localeCompare(b.nev ?? '', undefined, { numeric: true, sensitivity: 'base' });
    });
}

let chart = null;
let animDelayed = false;

function buildChart(labels, datasets) {
    if (chart) {
        chart.data.labels = labels;
        chart.data.datasets = datasets;
        chart.update('active');
        return;
    }

    chart = new Chart(ctx, {
        type: 'bar',
        data: { labels, datasets },
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
                    callbacks: {
                        footer: (items) => `Összesen: ${items.reduce((s, i) => s + i.parsed.y, 0)}`
                    }
                }
            },
            scales: {
                x: { stacked: true, grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false }, ticks: { maxRotation: 30, color: 'rgba(245, 240, 232, 0.6)' } },
                y: { stacked: true, beginAtZero: true, grid: { color: 'rgba(255,255,255,0.06)', drawBorder: false }, ticks: { color: 'rgba(245, 240, 232, 0.5)', precision: 0 } }
            }
        }
    });
}

function makeChipsHtml(projectKeysWithNames) {
    return (val) => {
        const chips = Object.entries(projectKeysWithNames).map(([key, beautifulName], index) => {
            const pts = val.pontok?.[key]?.pont ?? 0;
            const { bg, border } = PALETTE[index % PALETTE.length];
            const colorStyle = `background:${bg.replace('0.85','0.12').replace('0.75','0.12')};border:1px solid ${border};color:rgba(245,240,232,0.8);`;
            return `<span class="pg-bar-chip" style="${colorStyle}" title="${beautifulName}">${pts}</span>`;
        }).join('');
        return `<div class="pg-bars">${chips}</div>`;
    };
}

onValue(osztalyokRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) {
        leaderboard.innerHTML = '<div class="pg-loading">Adatok nem találhatóak.</div>';
        return;
    }

    // Collect all project keys → display names
    const projectKeysWithNames = {};
    Object.values(data).forEach(classObj => {
        if (classObj?.pontok && typeof classObj.pontok === 'object') {
            Object.entries(classObj.pontok).forEach(([key, pObj]) => {
                if (pObj?.nev) projectKeysWithNames[key] = pObj.nev;
            });
        }
    });

    const sorted = sortEntries(data);
    const labels = sorted.map(([, v]) => v.nev ?? '?');

    const datasets = Object.entries(projectKeysWithNames).map(([key, beautifulName], index) => {
        const { bg, border } = PALETTE[index % PALETTE.length];
        return {
            label: beautifulName,
            data: sorted.map(([, v]) => v.pontok?.[key]?.pont ?? 0),
            backgroundColor: bg,
            borderColor: border,
            borderWidth: 1.5,
            borderRadius: 4,
            borderSkipped: false,
        };
    });

    buildChart(labels, datasets);

    const maxTotal = getClassTotal(sorted[0]?.[1] ?? {}) || 1;
    renderLeaderboard(leaderboard, sorted, maxTotal, getClassTotal, makeChipsHtml(projectKeysWithNames));
    updateTimestamp(lastUpdated);
});

document.getElementById('leaderboard').addEventListener('wheel', (evt) => {
    const barsContainer = evt.target.closest('.pg-bars');
    if (barsContainer) {
        evt.preventDefault();
        barsContainer.scrollTo({ left: barsContainer.scrollLeft + evt.deltaY, behavior: 'smooth' });
    }
}, { passive: false });
