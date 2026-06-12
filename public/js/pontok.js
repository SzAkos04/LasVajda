import { db } from "./firebase-init.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js";
import { renderLeaderboard, updateTimestamp } from "./leaderboard.js";
import { setChartDefaults, buildChart } from "./chart-utils.js";

const osztalyokRef = ref(db, "osztalyok");
const ctx          = document.getElementById('myChart');
const leaderboard  = document.getElementById('leaderboard');
const lastUpdated  = document.getElementById('lastUpdated');

setChartDefaults();

const chartRef = { current: null };

const PALETTE = [
    { bg: 'rgba(212, 175, 55, 0.85)',  border: 'rgba(245, 216, 122, 1)' },
    { bg: 'rgba(139, 0, 0, 0.75)',     border: 'rgba(192, 57, 43, 1)'   },
    { bg: 'rgba(139, 105, 20, 0.75)',  border: 'rgba(212, 175, 55, 1)'  },
    { bg: 'rgba(245, 240, 232, 0.75)', border: 'rgba(245, 240, 232, 1)' },
    { bg: 'rgba(17, 17, 17, 0.75)',    border: 'rgba(245, 216, 122, 1)' },
];

const FELADATOK_CONFIG = {
    palackgyujtes: { nev: "Palackgyűjtés", max: 75  },
    elofeladat:    { nev: "Előfeladat",    max: 50  },
    foci:          { nev: "Foci",          max: 75  },
    vetelkedo:     { nev: "Vetélkedő",     max: 150 },
    osztalymusor:  { nev: "Osztályműsor",  max: 150 },
};

export function getClassTotal(classObj) {
    if (!classObj.feladatok || typeof classObj.feladatok !== 'object') return 0;
    return Object.values(classObj.feladatok).reduce((sum, pts) => sum + (pts ?? 0), 0);
}

function sortEntries(data) {
    return Object.entries(data).sort(([, a], [, b]) => {
        const diff = getClassTotal(b) - getClassTotal(a);
        return diff !== 0 ? diff : (a.nev ?? '').localeCompare(b.nev ?? '', undefined, {
            numeric: true, sensitivity: 'base',
        });
    });
}

function makeChipsHtml(val) {
    const chips = Object.entries(FELADATOK_CONFIG).map(([key, config], i) => {
        const pts = val.feladatok?.[key] ?? 0;
        const { bg, border } = PALETTE[i % PALETTE.length];
        const chipBg = bg.replace(/0\.\d+\)$/, '0.12)');
        const style  = `background:${chipBg};border:1px solid ${border};color:rgba(245,240,232,0.8);`;
        return `<span class="pg-bar-chip" style="${style}" title="${config.nev} (Max: ${config.max})">${pts} / ${config.max}</span>`;
    }).join('');
    return `<div class="pg-bars pg-bars--scroll">${chips}</div>`;
}

const STACKED_AXES = {
    scales: {
        x: { stacked: true },
        y: { stacked: true },
    },
    plugins: {
        tooltip: {
            callbacks: {
                footer: (items) => `Összesen: ${items.reduce((s, i) => s + i.parsed.y, 0)}`,
            },
        },
    },
};

onValue(osztalyokRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) {
        leaderboard.innerHTML = '<div class="pg-loading">Adatok nem találhatóak.</div>';
        return;
    }

    const sorted = sortEntries(data);
    const labels = sorted.map(([, v]) => v.nev ?? '?');

    const datasets = Object.entries(FELADATOK_CONFIG).map(([key, config], i) => {
        const { bg, border } = PALETTE[i % PALETTE.length];
        return {
            label:           config.nev,
            data:            sorted.map(([, v]) => v.feladatok?.[key] ?? 0),
            backgroundColor: bg,
            borderColor:     border,
            borderWidth:     1.5,
            borderRadius:    4,
            borderSkipped:   false,
        };
    });

    buildChart(chartRef, ctx, labels, datasets, STACKED_AXES);

    const maxTotal = getClassTotal(sorted[0]?.[1] ?? {}) || 1;
    renderLeaderboard(leaderboard, sorted, maxTotal, getClassTotal, makeChipsHtml);
    updateTimestamp(lastUpdated);
});

/* Horizontal scroll on the chips bar via mouse wheel */
leaderboard.addEventListener('wheel', (evt) => {
    const barsContainer = evt.target.closest('.pg-bars--scroll');
    if (barsContainer) {
        evt.preventDefault();
        barsContainer.scrollBy({ left: evt.deltaY, behavior: 'smooth' });
    }
}, { passive: false });