"use strict";

const STORAGE_KEY = "nostalgia-draw-game-v1";
const DEFAULT_COUNTS = [1, 2, 3, 4, 5, 5, 10, 10, 10, 0];

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
let setupMode = "simple";
const modeDrafts = {};
const isRankGame = () => !state?.mode || state.mode === "rank";
const outcomeLabel = outcome => isRankGame() ? `${outcome.rank}등` : outcome.name;

function changeMode(mode) {
  modeDrafts[setupMode] = {
    value: elements.rankCount.value,
    rows: [...elements.prizeRows.children].map(row => ({
      name: row.querySelector(".prize-name").value,
      count: row.querySelector(".prize-count").value
    }))
  };
  setupMode = mode;
  const descriptions = {
    simple: ["당첨 개수", "나머지는 자동으로 꽝", "개", 1, 500, 1, "당첨 개수를 정하면 나머지는 꽝이 됩니다."],
    content: ["내용 종류", "1~10종 · 남은 수량은 꽝", "종", 1, 10, 2, "내용과 개수를 입력하세요. 남은 칸은 꽝으로 채웁니다."],
    rank: ["몇 등까지?", "2~10등 · 마지막 등수 자동 수량", "등", 2, 10, 7, "등수별 이름과 개수를 입력하세요. 마지막 등수는 남은 개수입니다."]
  };
  const [label, help, unit, min, max, initial, description] = descriptions[mode];
  document.querySelector("#option-label").textContent = label;
  document.querySelector("#option-help").textContent = help;
  document.querySelector("#option-unit").textContent = unit;
  document.querySelector("#mode-help").textContent = description;
  elements.rankCount.setAttribute("aria-label", label);
  elements.rankCount.min = min;
  elements.rankCount.max = max;
  elements.rankCount.value = modeDrafts[mode]?.value ?? initial;
  elements.prizeRows.replaceChildren();
  elements.setupForm.dataset.mode = mode;
  elements.formError.textContent = "";
  refreshSetupFields();
  modeDrafts[mode]?.rows.forEach((value, index) => {
    const row = elements.prizeRows.children[index];
    if (!row) return;
    row.querySelector(".prize-name").value = value.name;
    if (!row.querySelector(".prize-count").readOnly) row.querySelector(".prize-count").value = value.count;
  });
  updateSetupSummary();
}

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
    row.querySelector(".rank-chip").textContent = setupMode === "rank" ? `${rank}등` : (rank === rankCount ? "꽝" : `내용 ${rank}`);
    const nameInput = row.querySelector(".prize-name");
    const countInput = row.querySelector(".prize-count");
    const isLast = rank === rankCount;
    row.classList.toggle("last-rank", isLast);
    const previous = existingValues[index];
    const total = Number(elements.totalCount.value);
    const defaultCount = setupMode === "content" ? 1 : (total < 20 ? (index === 0 ? 1 : 0) : DEFAULT_COUNTS[index]);
    nameInput.value = previous && !previous.wasAutomatic ? previous.name : (setupMode === "rank" ? `${rank}등` : (isLast ? "꽝" : ""));
    nameInput.placeholder = setupMode === "content" ? "뽑힐 내용을 입력하세요" : "상품 이름";
    nameInput.readOnly = setupMode === "content" && isLast;
    nameInput.setAttribute("aria-label", setupMode === "rank" ? `${rank}등 이름` : `내용 ${rank}`);
    countInput.value = isLast ? "0" : (previous && !previous.wasAutomatic ? previous.count : String(defaultCount));
    countInput.readOnly = isLast;
    countInput.tabIndex = isLast ? -1 : 0;
    countInput.setAttribute("aria-label", setupMode === "rank" ? `${rank}등 수량` : `내용 ${rank} 수량`);
    elements.prizeRows.appendChild(fragment);
  }
}

function refreshSetupFields() {
  const total = Number(elements.totalCount.value);
  const option = Number(elements.rankCount.value);
  const ready = Number.isInteger(total) && total >= 2 && total <= 500 &&
    Number.isInteger(option) && option >= Number(elements.rankCount.min) && option <= Number(elements.rankCount.max);
  const rankCount = setupMode === "content" ? option + 1 : option;
  elements.prizeTable.classList.toggle("hidden", !ready || setupMode === "simple");
  elements.setupSummary.classList.toggle("hidden", !ready);
  if (!ready) return;
  if (setupMode !== "simple" && elements.prizeRows.children.length !== rankCount) createPrizeRows(rankCount);
  updateSetupSummary();
}

function getSetupValues() {
  const total = Number(elements.totalCount.value);
  if (setupMode === "simple") {
    const winners = Number(elements.rankCount.value);
    return { total, manualTotal: winners, prizes: [
      { rank: 1, name: "당첨", count: winners },
      { rank: 2, name: "꽝", count: Math.max(0, total - winners) }
    ] };
  }
  const rows = [...elements.prizeRows.querySelectorAll(".prize-row")];
  const manualTotal = rows.slice(0, -1).reduce((sum, row) => sum + Number(row.querySelector(".prize-count").value), 0);
  const prizes = rows.map((row, index) => ({
    rank: index + 1,
    name: row.querySelector(".prize-name").value.trim(),
    count: index === rows.length - 1 ? Math.max(0, total - manualTotal) : Number(row.querySelector(".prize-count").value)
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
  elements.lastRankLabel.textContent = setupMode === "rank" ? `${prizes.length}등 자동` : "꽝 자동";
  elements.blankTotal.style.color = manualTotal > total ? "var(--red-dark)" : "";
}

function validateSetup(total, prizes) {
  if (!Number.isInteger(total) || total < 2 || total > 500) return "전체 뽑기 수는 2개부터 500개까지 정수로 입력해 주세요.";
  const option = Number(elements.rankCount.value);
  if (!Number.isInteger(option) || option < Number(elements.rankCount.min) || option > Number(elements.rankCount.max)) return "설정 범위 안의 정수를 입력해 주세요.";
  const expectedRows = setupMode === "simple" ? 2 : (setupMode === "content" ? option + 1 : option);
  if (prizes.length !== expectedRows) return "내용 설정을 확인해 주세요.";
  if (prizes.some(prize => !Number.isInteger(prize.count) || prize.count < 0 || prize.count > 500)) return "각 수량은 0~500 사이의 정수로 입력해 주세요.";
  const upperRanks = prizes.slice(0, -1).reduce((sum, prize) => sum + prize.count, 0);
  if (upperRanks > total) return `입력한 수량이 전체 뽑기 수보다 ${upperRanks - total}개 많습니다.`;
  const unnamed = prizes.find((prize) => prize.count > 0 && !prize.name);
  if (unnamed) return `${unnamed.rank}번째 이름 또는 내용을 입력해 주세요.`;
  if (setupMode === "rank" && prizes[0].count === 0) return "1등은 최소 1개 이상 설정해 주세요.";
  if (upperRanks === 0) return "뽑을 내용 또는 당첨 수량을 1개 이상 입력해 주세요.";
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
    mode: setupMode,
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
  if (!state) return;
  try {
    if (state.saveMode) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      window.saveDrawPresetProgress?.(state);
    }
    else localStorage.removeItem(STORAGE_KEY);
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
  const columns = Math.min(state.total, Math.ceil(Math.sqrt(state.total * 1.7)));
  elements.board.style.setProperty("--board-columns", String(columns));
  elements.board.style.setProperty("--board-rows", String(Math.ceil(state.total / columns)));
  elements.board.textContent = "";
  state.outcomes.forEach((outcome, index) => {
    const button = document.createElement("button");
    const opened = openedSet.has(index);
    button.type = "button";
    const isLastRank = outcome.rank === state.prizes.length;
    button.className = `draw-ticket${opened ? " opened" : ""}${opened && isLastRank ? " last-result" : ""}`;
    button.textContent = opened ? outcomeLabel(outcome) : String(index + 1).padStart(2, "0");
    button.title = opened ? outcomeLabel(outcome) : `${index + 1}번`;
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
  elements.resultBadge.textContent = isRankGame() ? `${outcome.rank}등` : (isLastRank ? "꽝" : "선택");
  elements.resultTitle.textContent = outcome.name;
  elements.resultMessage.textContent = isLastRank ? "다음 번호에는 더 큰 행운이 있을 거예요." : "뽑힌 결과를 확인해 주세요.";
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
    item.innerHTML = `<span class="rank">${isRankGame() ? prize.rank + "등" : prize.rank}</span><span class="name"></span><strong>${remaining}개</strong>`;
    item.querySelector(".name").textContent = prize.name || "미설정";
    elements.remainingPrizes.appendChild(item);
  });
  const lastPrize = state.prizes.at(-1);
  const usedLastRank = openedOutcomes.filter((outcome) => outcome.rank === lastPrize.rank).length;
  elements.lastRankRemainingLabel.textContent = isRankGame() ? `남은 ${lastPrize.rank}등` : "남은 꽝";
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
    const resultText = isRankGame() ? `${entry.rank}등 · ${entry.name}` : entry.name;
    item.innerHTML = `<span class="history-number">#${String(entry.index + 1).padStart(2, "0")}</span><span class="history-rank"></span>`;
    item.querySelector(".history-rank").textContent = resultText;
    elements.history.appendChild(item);
  });
}

function returnToSetup() {
  const hasProgress = state && state.opened.length > 0;
  if (hasProgress && !window.confirm("현재 뽑기판을 삭제하고 새로 만들까요? 저장된 진행 기록도 함께 삭제됩니다.")) return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    // 저장소를 사용할 수 없는 환경에서도 새 설정 화면으로 이동합니다.
  }
  window.clearDrawPresetProgress?.(state);
  state = null;
  elements.gameScreen.classList.add("hidden");
  elements.startScreen.classList.remove("hidden");
  refreshContinueCard();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

elements.setupForm.dataset.mode = setupMode;
document.querySelectorAll('[name="draw-mode"]').forEach(input => input.addEventListener("change", () => changeMode(input.value)));
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

