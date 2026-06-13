import { db } from "./firebase-init.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js";

const MAINTENANCE_PATH = "/maintenance.html";
const SECRET = "vajdanapok2026";

const params = new URLSearchParams(window.location.search);
if (params.get("bypass") === SECRET) {
    sessionStorage.setItem("lv_bypass", SECRET);
}

const hasAccess = sessionStorage.getItem("lv_bypass") === SECRET;
const isMaintenance = window.location.pathname.includes("maintenance");

if (!hasAccess && !isMaintenance) {
    get(ref(db, "config/maintenance")).then(snap => {
        if (snap.val() === true) {
            window.location.replace(MAINTENANCE_PATH);
        }
    });
}