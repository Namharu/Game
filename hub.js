"use strict";
const games = {
  draw: "통합 뽑기", ladder: "사다리",
  "high-low": "하이로우", pinball: "컬러볼 핀볼", "animal-race": "동물경주",
  cannon: "대포", lotto: "로또번호 추첨기"
};
const frame = document.querySelector("#game-frame");
const key = "namharu-game-hub-last-game-v1";
let current = "";
function fitBroadcastFrame() {
  const scale = Math.min(1, (innerWidth - 24) / 1280, (innerHeight - 24) / 720);
  const style = document.documentElement.style;
  style.setProperty("--frame-scale", scale);
  style.setProperty("--frame-viewport-width", 1280 * scale + "px");
  style.setProperty("--frame-viewport-height", 720 * scale + "px");
}
function selectGame(slug) {
  if (slug === "lucky-board") slug = "draw";
  if (!Object.hasOwn(games, slug)) slug = "draw";
  if (current === slug) return;
  current = slug;
  document.querySelectorAll("[data-game]").forEach(button => {
    if (button.dataset.game === slug) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });
  document.querySelector("#game-title").textContent = games[slug];
  document.querySelector("#game-number").textContent = "GAME " + String(Object.keys(games).indexOf(slug) + 1).padStart(2, "0");
  document.querySelector("#standalone-link").href = "./" + slug + "/?embed=1&layout=5";
  frame.title = games[slug];
  frame.src = "./" + slug + "/?embed=1&layout=6";
  history.replaceState(null, "", "#" + slug);
  document.title = games[slug] + " — NAMHARU GAME";
  try { localStorage.setItem(key, slug); } catch {}
}
document.querySelectorAll("[data-game]").forEach(button => button.addEventListener("click", () => selectGame(button.dataset.game)));
addEventListener("hashchange", () => selectGame(location.hash.slice(1)));
addEventListener("resize", fitBroadcastFrame, { passive: true });
document.querySelector("#standalone-link").addEventListener("click", event => {
  event.preventDefault();
  const popup = window.open(event.currentTarget.href, "namharu-broadcast-game",
    "popup=yes,width=1054,height=634,resizable=yes,scrollbars=no");
  if (popup) popup.focus();
});
let initial = location.hash.slice(1);
if (!initial) { try { initial = localStorage.getItem(key); } catch {} }
fitBroadcastFrame();
selectGame(initial);
