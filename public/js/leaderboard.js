const MEDALS = ['🥇', '🥈', '🥉'];

/**
 * Render a sorted leaderboard into `container`.
 *
 * @param {HTMLElement} container
 * @param {Array}       sorted        - Array of [key, classObj] pairs, pre-sorted descending.
 * @param {number}      maxTotal      - The highest total (for the background-bar percentage).
 * @param {function}    getTotal      - (classObj) => number
 * @param {function}    [getChipsHtml] - (classObj) => HTML string for the chips cell.
 *                                       Defaults to an empty `.pg-bars` div.
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
        const rankHtml = rank <= 3
            ? `<span class="pg-rank-medal">${MEDALS[i]}</span>`
            : `<span class="pg-rank">${rank}</span>`;
        const chipsHtml = getChipsHtml ? getChipsHtml(val) : '<div class="pg-bars"></div>';

        return `
            <div class="pg-row${getChipsHtml ? ' pg-row--detailed' : ''}" data-rank="${rank}">
                <div class="pg-row-bar" style="width:${pct}%"></div>
                ${rankHtml}
                <div class="pg-name">${val.nev ?? '—'}</div>
                ${chipsHtml}
                <div class="pg-total">${total}</div>
            </div>`;
    }).join('');
}

/**
 * Write the current HH:MM:SS into an element.
 * @param {HTMLElement} el
 */
export function updateTimestamp(el) {
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    el.textContent = `Frissítve: ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}