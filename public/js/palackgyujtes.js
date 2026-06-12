import { db } from "./firebase-init.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js";
import { renderLeaderboard, updateTimestamp } from "./leaderboard.js";
import { setChartDefaults, buildChart } from "./chart-utils.js";

const osztalyokRef = ref(db, "osztalyok");
const ctx          = document.getElementById('myChart');
const leaderboard  = document.getElementById('leaderboard');
const lastUpdated  = document.getElementById('lastUpdated');

const GOLD        = 'rgba(212, 175, 55, 0.85)';
const GOLD_BORDER = 'rgba(245, 216, 122, 1)';

setChartDefaults();

const chartRef = { current: null };

function getTotal(classObj) {
    return classObj.palackok ?? 0;
}

function sortEntries(data) {
    return Object.entries(data).sort(([, a], [, b]) => {
        const diff = getTotal(b) - getTotal(a);
        return diff !== 0 ? diff : (a.nev ?? '').localeCompare(b.nev ?? '', undefined, {
            numeric: true, sensitivity: 'base',
        });
    });
}

onValue(osztalyokRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) {
        leaderboard.innerHTML = '<div class="pg-loading">Adatok nem találhatóak.</div>';
        return;
    }

    const sorted  = sortEntries(data);
    const labels  = sorted.map(([, v]) => v.nev ?? '?');
    const pontok  = sorted.map(([, v]) => getTotal(v));
    const maxTotal = getTotal(sorted[0]?.[1] ?? {}) || 1;

    buildChart(chartRef, ctx, labels, [{
        label:           'Palackok',
        data:            pontok,
        backgroundColor: GOLD,
        borderColor:     GOLD_BORDER,
        borderWidth:     1.5,
        borderRadius:    4,
        borderSkipped:   false,
    }]);

    renderLeaderboard(leaderboard, sorted, maxTotal, getTotal);
    updateTimestamp(lastUpdated);
});