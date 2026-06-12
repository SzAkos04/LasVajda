export function setChartDefaults() {
    Chart.defaults.color = 'rgba(245, 240, 232, 0.55)';
    Chart.defaults.font.family = "'JetBrains Mono', monospace";
    Chart.defaults.font.size = 11;
}

const BASE_OPTIONS = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
        legend: {
            position: 'top',
            labels: {
                padding: 20, boxWidth: 14, boxHeight: 14,
                borderRadius: 4, useBorderRadius: true,
                color: 'rgba(245, 240, 232, 0.75)',
            },
        },
        tooltip: {
            backgroundColor: 'rgba(10, 10, 10, 0.92)',
            borderColor: 'rgba(212, 175, 55, 0.3)',
            borderWidth: 1,
            titleColor: '#f5d87a',
            bodyColor: 'rgba(245, 240, 232, 0.8)',
            padding: 12,
        },
    },
    scales: {
        x: {
            grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
            ticks: {
                autoSkip: false,
                minRotation: 0,
                maxRotation: 45,
                color: 'rgba(245, 240, 232, 0.6)'
            },
        },
        y: {
            beginAtZero: true,
            grid: { color: 'rgba(255,255,255,0.06)', drawBorder: false },
            ticks: { color: 'rgba(245, 240, 232, 0.5)', precision: 0 },
        },
    },
};

/**
 * Create or update a Chart.js bar chart.
 *
 * @param {{ current: Chart|null }} chartRef  - Object whose `.current` holds the chart instance.
 * @param {CanvasRenderingContext2D} ctx
 * @param {string[]}  labels
 * @param {object[]}  datasets
 * @param {object}    [extraOptions]           - Merged on top of BASE_OPTIONS (e.g. stacked axes, footer callback).
 * @returns {Chart}
 */
export function buildChart(chartRef, ctx, labels, datasets, extraOptions = {}) {
    if (chartRef.current) {
        chartRef.current.data.labels = labels;
        chartRef.current.data.datasets = datasets;
        chartRef.current.update('active');
        return chartRef.current;
    }

    let animDelayed = false;

    const options = mergeDeep({}, BASE_OPTIONS, {
        animation: {
            onComplete: () => { animDelayed = true; },
            delay: (context) => {
                if (context.type === 'data' && context.mode === 'default' && !animDelayed)
                    return context.dataIndex * 120 + context.datasetIndex * 60;
                return 0;
            },
        },
    }, extraOptions);

    chartRef.current = new Chart(ctx, { type: 'bar', data: { labels, datasets }, options });
    return chartRef.current;
}

function mergeDeep(target, ...sources) {
    for (const source of sources) {
        if (!source) continue;
        for (const key of Object.keys(source)) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                target[key] = mergeDeep(target[key] ?? {}, source[key]);
            } else {
                target[key] = source[key];
            }
        }
    }
    return target;
}