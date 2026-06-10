// js/leaderboard.js
// Shared leaderboard renderer for pontok.js and palackgyujtes.js

const MEDALS = ['🥇', '🥈', '🥉'];

/**
 * Renders a leaderboard into the given container element.
 *
 * @param {HTMLElement} container - The element to render into
 * @param {Array} sorted - Sorted array of [key, classObj] entries
 * @param {number} maxTotal - The highest total (for progress bar width)
 * @param {(classObj: object) => number} getTotal - Function to get total for a class
 * @param {(classObj: object) => string} getChipsHtml - Function to get chips HTML for a class (optional)
 */
export function renderLeaderboard(container, sorted, maxTotal, getTotal, getChipsHtml = null) {
    if (!sorted.length) {
        container.innerHTML = '<div class="pg-loading">Nincs adat.</div>';
        return;
    }

    container.innerHTML = sorted.map(([, val], i) => {
        const total = getTotal(val);
        const pct = maxTotal > 0 ? Math.round((total / maxTotal) * 100) : 0;
        const rank = i + 1;
        const rankDisplay = rank <= 3
            ? `<span class="pg-rank-medal">${MEDALS[i]}</span>`
            : `<span class="pg-rank">${rank}</span>`;

        const chipsHtml = getChipsHtml ? getChipsHtml(val) : '<div class="pg-bars"></div>';

        return `
            <div class="pg-row" data-rank="${rank}">
                <div class="pg-row-bar" style="width:${pct}%"></div>
                ${rankDisplay}
                <div class="pg-name">${val.nev ?? '—'}</div>
                ${chipsHtml}
                <div class="pg-total">${total}</div>
            </div>
        `;
    }).join('');
}

/**
 * Updates the "last updated" timestamp element.
 * @param {HTMLElement} el
 */
export function updateTimestamp(el) {
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    el.textContent = `Frissítve: ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}
