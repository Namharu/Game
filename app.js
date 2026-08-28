"use strict";

const STORAGE_KEY = "nostalgia-draw-game-v1";

const elements = {
  startScreen: document.querySelector("#start-screen"),
  gameScreen: document.querySelector("#game-screen"),
  setupForm: document.querySelector("#setup-form"),
  totalCount: document.querySelector("#total-count"),
  rankCount: document.querySelector("#rank-count"),
  prizeTable: document.querySelector("#prize-table"),
  prizeRows: document.querySelector("#prize-rows"),
  setupSummary: document.querySelector("#setup-summary"),
  winnerTotal: document.querySelector("#winner-total"),
  blankTotal: document.querySelector("#blank-total"),
  lastRankLabel: document.querySelector("#last-rank-label"),
  configuredTotal: document.querySelector("#configured-total"),
  saveMode: document.querySelector("#save-mode"),
  formError: document.querySelector("#form-error"),
  continueCard: document.querySelector("#continue-card"),
  continueButton: document.querySelector("#continue-button"),
  savedSummary: document.querySelector("#saved-summary"),
  board: document.querySelector("#draw-board"),
  emptyBoard: document.querySelector("#empty-board"),
  statusTotal: document.querySelector("#status-total"),
  statusOpened: document.querySelector("#status-opened"),
  statusRemaining: document.querySelector("#status-remaining"),
  saveStatus: document.querySelector("#save-status"),
  remainingPrizes: document.querySelector("#remaining-prizes"),
  remainingBlanks: document.querySelector("#remaining-blanks"),
  lastRankRemainingLabel: document.querySelector("#last-rank-remaining-label"),
  history: document.querySelector("#draw-history"),
  historyEmpty: document.querySelector("#history-empty"),
  clearHistory: document.querySelector("#clear-history-button"),
  newGame: document.querySelector("#new-game-button"),
  modal: document.querySelector("#result-modal"),
  resultCard: document.querySelector(".result-card"),
  resultKicker: document.querySelector("#result-kicker"),
  resultBadge: document.querySelector("#result-badge"),
  resultTitle: document.querySelector("#result-title"),
  resultMessage: document.querySelector("#result-message"),
  resultClose: document.querySelector("#result-close")
};

let state = null;
let historyVisible = true;

function createPrizeRows(rankCount) {
  const template = document.querySelector("#prize-row-template");
  const existingValues = [...elements.prizeRows.querySelectorAll(".prize-row")].map((row) => ({
    name: row.querySelector(".prize-name").value,
    count: row.querySelector(".prize-count").value,
    wasAutomatic: row.querySelector(".prize-count").readOnly
  }));
  elements.prizeRows.textContent = "";
  for (let index = 0; index < rankCount; index += 1) {
    const fragment = template.content.cloneNode(true);
    const row = fragment.querySelector(".prize-row");
    const rank = index + 1;
    row.dataset.rank = String(rank);
    row.querySelector(".rank-chip").textContent = `${rank}등`;
    const nameInput = row.querySelector(".prize-name");
    const countInput = row.querySelector(".prize-count");
    const isLast = rank === rankCount;
    row.classList.toggle("last-rank", isLast);
    const previous = existingValues[index];
    nameInput.value = previous?.name || "";
    nameInput.setAttribute("aria-label", `${rank}등 상품 이름`);
    countInput.value = isLast ? "0" : (previous?.wasAutomatic ? "0" : (previous?.count || "0"));
    countInput.readOnly = isLast;
    countInput.tabIndex = isLast ? -1 : 0;
    countInput.setAttribute("aria-label", `${rank}등 수량`);
    elements.prizeRows.appendChild(fragment);
  }
}

function refreshSetupFields() {
  const total = Number.parseInt(elements.totalCount.value, 10);
  const rankCount = Number.parseInt(elements.rankCount.value, 10);
  const ready = total >= 10 && total <= 500 && rankCount >= 3 && rankCount <= 10;
  elements.prizeTable.classList.toggle("hidden", !ready);
  elements.setupSummary.classList.toggle("hidden", !ready);
  if (!ready) return;
  if (elements.prizeRows.children.length !== rankCount) createPrizeRows(rankCount);
  updateSetupSummary();
}

function getSetupValues() {
  const total = Number.parseInt(elements.totalCount.value, 10) || 0;
  const rows = [...elements.prizeRows.querySelectorAll(".prize-row")];
  const manualTotal = rows.slice(0, -1).reduce((sum, row) => sum + Math.max(0, Number.parseInt(row.querySelector(".prize-count").value, 10) || 0), 0);
  const prizes = rows.map((row, index) => ({
    rank: index + 1,
    name: row.querySelector(".prize-name").value.trim(),
    count: index === rows.length - 1 ? Math.max(0, total - manualTotal) : Math.max(0, Number.parseInt(row.querySelector(".prize-count").value, 10) || 0)
  }));
  return { total, prizes, manualTotal };
}

function updateSetupSummary() {
  const { total, prizes, manualTotal } = getSetupValues();
  if (!prizes.length) return;
  const lastPrize = prizes.at(-1);
  const lastCountInput = elements.prizeRows.querySelector(".prize-row:last-child .prize-count");
  if (lastCountInput) lastCountInput.value = String(Math.max(0, total - manualTotal));
  elements.winnerTotal.textContent = `${manualTotal}개`;
  elements.blankTotal.textContent = manualTotal > total ? "수량 초과" : `${lastPrize?.count || 0}개`;
  elements.configuredTotal.textContent = `${total}개`;
  elements.lastRankLabel.textContent = `${prizes.length}등 자동`;
  elements.blankTotal.style.color = manualTotal > total ? "var(--red-dark)" : "";
}

function validateSetup(total, prizes) {
  if (total < 10 || total > 500) return "전체 뽑기 수는 10개 이상 500개 이하로 입력해 주세요.";
  const rankCount = Number.parseInt(elements.rankCount.value, 10);
  if (rankCount < 3 || rankCount > 10 || prizes.length !== rankCount) return "마지막 등수는 3등부터 10등까지 입력해 주세요.";
  const upperRanks = prizes.slice(0, -1).reduce((sum, prize) => sum + prize.count, 0);
  if (upperRanks > total) return `마지막 등수 전까지의 수량이 전체 뽑기 수보다 ${upperRanks - total}개 많습니다.`;
  const unnamed = prizes.find((prize) => prize.count > 0 && !prize.name);
  if (unnamed) return `${unnamed.rank}등 상품 이름을 입력해 주세요.`;
  if (prizes[0].count === 0) return "1등은 최소 1개 이상 설정해 주세요.";
  return "";
}

function secureShuffle(items) {
  const result = [...items];
  const random = new Uint32Array(1);
  for (let index = result.length - 1; index > 0; index -= 1) {
    crypto.getRandomValues(random);
    const target = random[0] % (index + 1);
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}

function buildOutcomes(total, prizes) {
  const outcomes = [];
  prizes.forEach((prize) => {
    for (let count = 0; count < prize.count; count += 1) {
      outcomes.push({ rank: prize.rank, name: prize.name });
    }
  });
  return secureShuffle(outcomes);
}

function startGame(event) {
  event.preventDefault();
  const { total, prizes } = getSetupValues();
  const error = validateSetup(total, prizes);
  elements.formError.textContent = error;
  if (error) return;

  state = {
    version: 2,
    createdAt: new Date().toISOString(),
    saveMode: elements.saveMode.checked,
    total,
    prizes,
    outcomes: buildOutcomes(total, prizes),
    opened: [],
    history: []
  };
  persistState();
  showGame();
}

function persistState() {
  if (!state || !state.saveMode) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    elements.saveStatus.textContent = "저장 공간을 사용할 수 없습니다";
  }
}

function loadSavedState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved || saved.version !== 2 || !Array.isArray(saved.outcomes) || saved.outcomes.length !== saved.total) return null;
    return saved;
  } catch (error) {
    return null;
  }
}

function refreshContinueCard() {
  const saved = loadSavedState();
  if (!saved) {
    elements.continueCard.classList.add("hidden");
    return;
  }
  const opened = saved.opened.length;
  elements.savedSummary.textContent = `전체 ${saved.total}개 중 ${opened}개 진행 · ${saved.total - opened}개 남음`;
  elements.continueCard.classList.remove("hidden");
}

function showGame() {
  elements.startScreen.classList.add("hidden");
  elements.gameScreen.classList.remove("hidden");
  historyVisible = true;
  renderGame();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderGame() {
  if (!state) return;
  const openedSet = new Set(state.opened);
  elements.board.textContent = "";
  state.outcomes.forEach((outcome, index) => {
    const button = document.createElement("button");
    const opened = openedSet.has(index);
    button.type = "button";
    const isLastRank = outcome.rank === state.prizes.length;
    button.className = `draw-ticket${opened ? " opened" : ""}${opened && isLastRank ? " last-result" : ""}`;
    button.textContent = opened ? `${outcome.rank}등` : String(index + 1).padStart(2, "0");
    button.disabled = opened;
    button.setAttribute("aria-label", opened ? `${index + 1}번, 이미 뽑음` : `${index + 1}번 뽑기`);
    if (!opened) button.addEventListener("click", () => revealTicket(index));
    elements.board.appendChild(button);
  });

  elements.statusTotal.textContent = String(state.total);
  elements.statusOpened.textContent = String(state.opened.length);
  elements.statusRemaining.textContent = String(state.total - state.opened.length);
  elements.saveStatus.textContent = state.saveMode ? "● 자동 저장 중" : "저장하지 않는 게임";
  elements.emptyBoard.classList.toggle("hidden", state.opened.length !== state.total);
  renderRemaining();
  renderHistory();
}

function revealTicket(index) {
  if (!state || state.opened.includes(index)) return;
  const outcome = state.outcomes[index];
  state.opened.push(index);
  state.history.unshift({
    index,
    rank: outcome.rank,
    name: outcome.name,
    drawnAt: new Date().toISOString()
  });
  persistState();
  renderGame();
  showResult(outcome);
}

function showResult(outcome) {
  const isLastRank = outcome.rank === state.prizes.length;
  elements.resultCard.classList.toggle("blank", isLastRank);
  elements.resultKicker.textContent = isLastRank ? "결과는" : "당첨!";
  elements.resultBadge.textContent = `${outcome.rank}등`;
  elements.resultTitle.textContent = outcome.name;
  elements.resultMessage.textContent = isLastRank ? "다음 번호에는 더 큰 행운이 있을 거예요." : "축하합니다! 상품을 확인해 주세요.";
  elements.modal.classList.remove("hidden");
  elements.resultClose.focus();
}

function closeResult() {
  elements.modal.classList.add("hidden");
  const firstAvailable = elements.board.querySelector(".draw-ticket:not(:disabled)");
  if (firstAvailable) firstAvailable.focus();
}

function renderRemaining() {
  const openedOutcomes = state.opened.map((index) => state.outcomes[index]);
  elements.remainingPrizes.textContent = "";
  state.prizes.slice(0, -1).forEach((prize) => {
    const used = openedOutcomes.filter((outcome) => outcome.rank === prize.rank).length;
    const remaining = prize.count - used;
    const item = document.createElement("div");
    item.className = `remaining-item${remaining === 0 ? " sold-out" : ""}`;
    item.innerHTML = `<span class="rank">${prize.rank}등</span><span class="name"></span><strong>${remaining}개</strong>`;
    item.querySelector(".name").textContent = prize.name || "미설정";
    elements.remainingPrizes.appendChild(item);
  });
  const lastPrize = state.prizes.at(-1);
  const usedLastRank = openedOutcomes.filter((outcome) => outcome.rank === lastPrize.rank).length;
  elements.lastRankRemainingLabel.textContent = `남은 ${lastPrize.rank}등`;
  elements.remainingBlanks.textContent = `${lastPrize.count - usedLastRank}개`;
}

function renderHistory() {
  elements.history.textContent = "";
  elements.history.classList.toggle("hidden", !historyVisible);
  elements.historyEmpty.classList.toggle("hidden", state.history.length > 0 || !historyVisible);
  elements.clearHistory.textContent = historyVisible ? "기록만 숨기기" : "기록 보기";
  if (!historyVisible) return;
  state.history.forEach((entry) => {
    const item = document.createElement("li");
    const resultText = `${entry.rank}등 · ${entry.name}`;
    item.innerHTML = `<span class="history-number">#${String(entry.index + 1).padStart(2, "0")}</span><span class="history-rank"></span>`;
    item.querySelector(".history-rank").textContent = resultText;
    elements.history.appendChild(item);
  });
}

function returnToSetup() {
  const hasProgress = state && state.opened.length > 0;
  if (hasProgress && !window.confirm("현재 뽑기판을 나가고 새로 만들까요? 자동 저장된 기록은 새 게임을 시작할 때 교체됩니다.")) return;
  state = null;
  elements.gameScreen.classList.add("hidden");
  elements.startScreen.classList.remove("hidden");
  refreshContinueCard();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

refreshSetupFields();
const savedOnLoad = loadSavedState();
if (savedOnLoad) {
  state = savedOnLoad;
  showGame();
} else {
  refreshContinueCard();
}

elements.setupForm.addEventListener("input", (event) => {
  if (event.target === elements.totalCount || event.target === elements.rankCount) refreshSetupFields();
  else updateSetupSummary();
});
elements.setupForm.addEventListener("submit", startGame);
elements.continueButton.addEventListener("click", () => {
  state = loadSavedState();
  if (state) showGame();
  else refreshContinueCard();
});
elements.newGame.addEventListener("click", returnToSetup);
elements.clearHistory.addEventListener("click", () => {
  historyVisible = !historyVisible;
  renderHistory();
});
elements.resultClose.addEventListener("click", closeResult);
elements.modal.querySelector(".modal-backdrop").addEventListener("click", closeResult);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !elements.modal.classList.contains("hidden")) closeResult();
});

