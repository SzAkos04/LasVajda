import { db } from "./firebase-init.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js";

const newsRef = ref(db, "hirek");
const container = document.getElementById('news-container');

function parseMarkdown(text) {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\\n|\n/g, '<br>');
}

function createNewsCard(val) {
    const imageHtml = val.kepek
        ? `<div class="news-image-grid">
               ${Object.values(val.kepek).slice(0, 4)
            .map(src => `<img src="${src}" alt="${val.cim}" class="news-image" loading="lazy">`)
            .join('')}
           </div>`
        : '';

    const card = document.createElement('div');
    card.className = 'news-card animate-fade-up';
    card.innerHTML = `
        ${imageHtml}
        <div class="news-content-padding">
            <div class="news-header">
                <span class="news-date">${val.datum}</span>
            </div>
            <div class="news-body">
                <h3 class="news-title">${val.cim}</h3>
                <p class="news-text">${parseMarkdown(val.szoveg)}</p>
            </div>
        </div>`;
    return card;
}

function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.news-card').forEach(card => observer.observe(card));
}

(async () => {
    try {
        const snapshot = await get(newsRef);
        const data = snapshot.val();
        container.innerHTML = '';

        if (!data) {
            container.innerHTML = '<div class="loading">Nincsenek hírek.</div>';
            return;
        }

        Object.entries(data).reverse().forEach(([, val]) => {
            container.appendChild(createNewsCard(val));
        });

        initScrollReveal();
    } catch (err) {
        console.error('Hiba a hírek betöltésekor:', err);
        container.innerHTML = '<div class="loading">Hiba történt a betöltés során.</div>';
    }
})();