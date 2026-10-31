"use strict";

const FRAME_WIDTH = 1280;
const FRAME_HEIGHT = 720;
const OUTER_GAP = 24;
const LAST_GAME_KEY = "namharu-game-hub-last-game-v1";
const games = {
  "draw": { number: "01", title: "추억의 뽑기" },
  "lucky-board": { number: "02", title: "뽑기판 2" },
  "ladder": { number: "03", title: "사다리" },
  "high-low": { number: "04", title: "하이로우" },
  "pinball": { number: "05", title: "컬러볼 핀볼" },
  "animal-race": { number: "06", title: "동물경주" },
  "cannon": { number: "07", title: "대포" },
  "lotto": { number: "08", title: "로또번호 추첨기" }
};

const frame = document.querySelector("#game-frame");
const loadingCover = document.querySelector("#loading-cover");
const gameTitle = document.querySelector("#game-title");
const gameNumber = document.querySelector("#game-number");
const standaloneLink = document.querySelector("#standalone-link");
const gameButtons = [...document.querySelectorAll("[data-game]")];

function fitBroadcastFrame() {
  const availableWidth = Math.max(320, window.innerWidth - OUTER_GAP);
  const availableHeight = Math.max(180, window.innerHeight - OUTER_GAP);
  const scale = Math.min(1, availableWidth / FRAME_WIDTH, availableHeight / FRAME_HEIGHT);
  document.documentElement.style.setProperty("--frame-scale", String(scale));
  document.documentElement.style.setProperty("--frame-viewport-width", `${FRAME_WIDTH * scale}px`);
  document.documentElement.style.setProperty("--frame-viewport-height", `${FRAME_HEIGHT * scale}px`);
}

function gameFromLocation() {
  const hashGame = location.hash.replace(/^#\/?/, "");
  if (games[hashGame]) return hashGame;
  try {
    const saved = localStorage.getItem(LAST_GAME_KEY);
    if (games[saved]) return saved;
  } catch (error) {}
  return "draw";
}

function selectGame(slug, updateHistory = true) {
  const selected = games[slug] ? slug : "draw";
  const game = games[selected];
  const url = `./${selected}/`;
  gameButtons.forEach((button) => {
    if (button.dataset.game === selected) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });
  gameNumber.textContent = `GAME ${game.number}`;
  gameTitle.textContent = game.title;
  frame.title = game.title;
  standaloneLink.href = url;
  loadingCover.classList.remove("hidden");
  frame.src = `${url}?embed=1`;
  if (updateHistory) history.replaceState(null, "", `#${selected}`);
  document.title = `${game.title} — NAMHARU GAME`;
  try { localStorage.setItem(LAST_GAME_KEY, selected); } catch (error) {}
}

gameButtons.forEach((button) => button.addEventListener("click", () => selectGame(button.dataset.game)));
frame.addEventListener("load", () => loadingCover.classList.add("hidden"));
window.addEventListener("resize", fitBroadcastFrame, { passive: true });
window.addEventListener("hashchange", () => selectGame(gameFromLocation(), false));
fitBroadcastFrame();
selectGame(gameFromLocation(), !location.hash);
