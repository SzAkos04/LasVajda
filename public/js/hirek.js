import { db } from "./firebase-init.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js";

const newsRef = ref(db, "hirek");
const container = document.getElementById('news-container');

function parseMarkdown(text) {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\\n/g, '<br>')
        .replace(/\n/g, '<br>');
}

try {
    const snapshot = await get(newsRef);
    const data = snapshot.val();
    container.innerHTML = "";

    if (data) {
        Object.entries(data).reverse().forEach(([key, val]) => {
            const newsCard = document.createElement('div');
            newsCard.className = 'news-card animate-fade-up';

            const imageHtml = val.kepek
                ? `<div class="news-image-grid">
                    ${Object.values(val.kepek).slice(0, 4)
                    .map(img => `<img src="${img}" alt="${val.cim}" class="news-image" loading="lazy">`)
                    .join("")}
                   </div>`
                : "";

            newsCard.innerHTML = `
                ${imageHtml}
                <div class="news-content-padding">
                    <div class="news-header">
                        <span class="news-date">${val.datum}</span>
                    </div>
                    <div class="news-body">
                        <h3 class="news-title">${val.cim}</h3>
                        <p class="news-text">${parseMarkdown(val.szoveg)}</p>
                    </div>
                </div>
            `;

            container.appendChild(newsCard);
        });
    } else {
        container.innerHTML = '<div class="loading">Nincsenek hírek.</div>';
    }
} catch (err) {
    console.error("Hiba a hírek betöltésekor:", err);
    container.innerHTML = '<div class="loading">Hiba történt a betöltés során.</div>';
}

// amikor egy hírcard láthatóvá válik, hozzáadunk egy osztályt, ami elindítja a CSS animációt
const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.classList.add('visible');
            observer.unobserve(e.target);
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.news-card').forEach(c => observer.observe(c));