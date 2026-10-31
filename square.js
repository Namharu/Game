/* Arrange the fixed-size game and its controls before game initialization. */
(() => {
  if (!document.documentElement.classList.contains('embedded')) return;
  document.documentElement.classList.add('square-layout');
  const main = document.querySelector('main');
  const layout = document.createElement('div');
  layout.className = 'square-shell';
  const stage = document.createElement('section');
  stage.className = 'square-stage';
  stage.setAttribute('aria-label', '게임 진행 및 결과');
  const controls = document.createElement('aside');
  controls.className = 'square-controls';
  controls.setAttribute('aria-label', '게임 설정 및 조작');
  main.before(layout);
  stage.append(main);
  layout.append(stage, controls);
  function move(selector) { document.querySelectorAll(selector).forEach(node => controls.append(node)); }
  const root = document.documentElement;
  if (root.classList.contains('embed-draw')) {
    const setupActions = document.createElement('div');
    setupActions.className = 'square-draw-setup';
    document.querySelectorAll('#setup-form .setup-summary, #setup-form .save-option, #setup-form .form-error, #setup-form button[type="submit"]').forEach(node => {
      if (node.matches('button')) node.setAttribute('form', 'setup-form');
      setupActions.append(node);
    });
    controls.append(setupActions);
    move('.prize-panel, .history-section');
  }
  if (root.classList.contains('embed-animal-race')) move('.game > aside');
  if (root.classList.contains('embed-lotto')) move('.guide');
  if (root.classList.contains('embed-high-low')) move('.choices, .restart');
  if (root.classList.contains('embed-pinball')) move('.console-panel');
  if (root.classList.contains('embed-cannon')) move('#startButton, #soundButton');
  if (!controls.children.length) {
    const note = document.createElement('p');
    note.textContent = '게임 화면에서 인원과 결과를 설정하고 시작하세요.';
    controls.append(note);
  }
})();
