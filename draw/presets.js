"use strict";
(() => {
  const KEY = "namharu-draw-presets-v1";
  const dialog = document.querySelector("#preset-dialog");
  const nameInput = document.querySelector("#preset-name");
  const list = document.querySelector("#preset-list");
  const message = document.querySelector("#preset-message");
  const detail = document.querySelector("#preset-detail");
  const loadButton = document.querySelector("#preset-load");
  const deleteButton = document.querySelector("#preset-delete");
  const modeNames = { simple: "당첨·꽝", content: "내용 뽑기", rank: "등수 뽑기" };
  let presets = [];
  const resumeBox = document.querySelector("#preset-resume");
  const signature = p => JSON.stringify([p.mode || "rank", p.total, p.prizes.map(x => [x.rank, x.name, x.count])]);
  function matchingProgress(p) {
    const progress = p.progress;
    return progress && signature(progress) === signature(p) && progress.version === 2 &&
      Array.isArray(progress.outcomes) && progress.outcomes.length === p.total &&
      Array.isArray(progress.opened) && progress.opened.length > 0 && Array.isArray(progress.history) ? progress : null;
  }
  window.saveDrawPresetProgress = progress => {
    if (!read()) throw Error("설정 기록 읽기 실패");
    const key = signature(progress);
    if (!presets.some(p => signature(p) === key)) return;
    if (!write(presets.map(p => signature(p) === key ? { ...p, progress: JSON.parse(JSON.stringify(progress)) } : p))) throw Error("설정 기록 저장 실패");
  };
  window.clearDrawPresetProgress = progress => {
    if (!progress || !read()) return;
    write(presets.map(p => signature(p) === signature(progress) ? { ...p, progress: null } : p));
  };

  function validPreset(p) {
    return p && typeof p.name === "string" && typeof p.id === "string" &&
      Object.hasOwn(modeNames, p.mode) && Number.isInteger(p.total) && p.total >= 2 && p.total <= 500 &&
      Array.isArray(p.prizes) && p.prizes.length >= 2 && p.prizes.length <= (p.mode === "content" ? 11 : 10) &&
      (p.mode !== "simple" || p.prizes.length === 2) &&
      p.prizes.every((x, i) => x.rank === i + 1 && typeof x.name === "string" && x.name.length <= 30 &&
        Number.isInteger(x.count) && x.count >= 0 && (x.count === 0 || x.name.trim())) &&
      p.prizes.reduce((sum, x) => sum + x.count, 0) === p.total;
  }
  function read() {
    try {
      const stored = JSON.parse(localStorage.getItem(KEY) || "[]");
      if (!Array.isArray(stored) || !stored.every(validPreset)) throw Error();
      presets = stored;
      return true;
    } catch {
      message.textContent = "저장된 설정을 읽지 못했습니다. 기존 데이터를 덮어쓰지 않았습니다.";
      return false;
    }
  }
  function write(next) {
    try { localStorage.setItem(KEY, JSON.stringify(next)); presets = next; return true; }
    catch { message.textContent = "설정 저장에 실패했습니다. 브라우저 저장 공간을 확인해 주세요."; return false; }
  }
  function selected() { return presets.find(p => p.id === list.value); }
  function describe() {
    const p = selected();
    loadButton.disabled = deleteButton.disabled = !p;
    const progress = p && matchingProgress(p);
    resumeBox.hidden = !progress;
    if (progress) document.querySelector("#preset-progress-summary").textContent = `마지막 기록: ${progress.opened.length}개 뽑음 · ${p.total - progress.opened.length}개 남음`;
    document.querySelector('[name="preset-start"][value="resume"]').checked = true;
    detail.textContent = p ? modeNames[p.mode] + " · " + p.total + "개 · " +
      p.prizes.filter(x => x.count > 0).map(x => x.name + " " + x.count + "개").join(" / ") : "저장된 설정을 선택하세요.";
  }
  function render(id) {
    list.replaceChildren();
    for (const p of presets) {
      const option = document.createElement("option");
      option.value = p.id;
      option.textContent = p.name + " — " + modeNames[p.mode] + " · " + p.total + "개";
      list.append(option);
    }
    list.value = id || "";
    describe();
  }
  document.querySelectorAll("[data-open-presets]").forEach(button => button.addEventListener("click", () => {
    message.textContent = "";
    if (read()) render(list.value);
    dialog.showModal();
  }));
  document.querySelector("#preset-close").addEventListener("click", () => dialog.close());
  list.addEventListener("change", () => {
    describe();
    if (selected()) nameInput.value = selected().name;
  });
  document.querySelector("#preset-save").addEventListener("click", () => {
    const name = nameInput.value.trim();
    if (!name) { message.textContent = "저장할 이름을 입력해 주세요."; nameInput.focus(); return; }
    if (!read()) return;
    const config = state ? { mode: state.mode || "rank", total: state.total, prizes: state.prizes } :
      { mode: setupMode, ...getSetupValues() };
    if (!state) {
      const error = validateSetup(config.total, config.prizes);
      if (error) { message.textContent = error; return; }
    }
    const existing = presets.find(p => p.name === name);
    if (existing && !confirm('"' + name + '" 설정을 덮어쓸까요?')) return;
    const saved = { id: existing?.id || crypto.randomUUID(), name, mode: config.mode, total: config.total,
      prizes: config.prizes.map(p => ({ rank: p.rank, name: p.name, count: p.count })) };
    if (!validPreset(saved)) { message.textContent = "설정 내용을 확인해 주세요."; return; }
    const previous = presets.find(p => signature(p) === signature(saved) && matchingProgress(p));
    saved.progress = state ? JSON.parse(JSON.stringify(state)) : previous?.progress || null;
    const next = presets.filter(p => p.id !== saved.id).concat(saved);
    if (write(next)) { render(saved.id); message.textContent = '"' + name + '" 설정을 저장했습니다.'; }
  });
  loadButton.addEventListener("click", () => {
    const id = list.value;
    if (!read()) return;
    const p = presets.find(p => p.id === id);
    if (!p) { render(); return; }
    if (state?.opened.length && !state.saveMode && !confirm("자동 저장이 꺼진 현재 진행을 끝내고 불러올까요? 저장하지 않은 기록은 사라집니다.")) return;
    if (state?.saveMode) {
      try { window.saveDrawPresetProgress(state); }
      catch { return; }
    }
    const target = presets.find(item => item.id === id);
    const progress = matchingProgress(target);
    if (progress && document.querySelector('[name="preset-start"]:checked').value === "resume") {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); }
      catch { message.textContent = "진행 기록을 저장할 수 없습니다."; return; }
      state = JSON.parse(JSON.stringify(progress));
      elements.modal.classList.add("hidden");
      showGame();
      dialog.close();
      return;
    }
    if (!write(presets.map(item => signature(item) === signature(p) ? { ...item, progress: null } : item))) return;
    try { localStorage.removeItem(STORAGE_KEY); }
    catch { message.textContent = "진행 기록을 갱신할 수 없어 불러오기를 중단했습니다."; return; }
    state = null;
    elements.modal.classList.add("hidden");
    elements.gameScreen.classList.add("hidden");
    elements.startScreen.classList.remove("hidden");
    elements.totalCount.value = p.total;
    changeMode(p.mode);
    document.querySelector('[name="draw-mode"][value="' + p.mode + '"]').checked = true;
    elements.rankCount.value = p.mode === "simple" ? p.prizes[0].count : p.mode === "content" ? p.prizes.length - 1 : p.prizes.length;
    elements.prizeRows.replaceChildren();
    refreshSetupFields();
    if (p.mode !== "simple") p.prizes.forEach((prize, index) => {
      const row = elements.prizeRows.children[index];
      row.querySelector(".prize-name").value = prize.name;
      row.querySelector(".prize-count").value = prize.count;
    });
    updateSetupSummary();
    refreshContinueCard();
    elements.formError.textContent = '"' + p.name + '" 설정을 불러왔습니다. 시작 버튼을 눌러주세요.';
    dialog.close();
  });
  deleteButton.addEventListener("click", () => {
    const id = list.value;
    if (!read()) return;
    const p = presets.find(p => p.id === id);
    if (!p || !confirm('"' + p.name + '" 저장 설정을 삭제할까요?')) return;
    if (write(presets.filter(item => item.id !== id))) { render(); message.textContent = "선택한 설정을 삭제했습니다."; }
  });
})();
