const SECRET = "vajdanapok2026";
const BLOCKED_PATH = "/";

const params = new URLSearchParams(window.location.search);
if (params.get("bypass") === SECRET) {
    sessionStorage.setItem("lv_access", SECRET);
}

const hasAccess = sessionStorage.getItem("lv_access") === SECRET;

if (!hasAccess) {
    window.location.replace(BLOCKED_PATH);
}