"use strict";
const games = {
  draw: "통합 뽑기", ladder: "사다리",
  "high-low": "하이로우", pinball: "핀볼", "animal-race": "동물경주",
  cannon: "대포", lotto: "로또번호 추첨기"
};
const playWindow = document.querySelector('.play-window');
const homeScreen = document.querySelector('#home-screen');
const standalone = document.querySelector('#standalone-link');
let current = null;
let frame = null;
function normalize(slug) {
  if (slug === 'lucky-board') slug = 'draw';
  return Object.hasOwn(games, slug) ? slug : '';
}
function renderGame(slug) {
  slug = normalize(slug);
  if (current === slug) return;
  current = slug;
  playWindow.dataset.game = slug;
  document.querySelectorAll('[data-game]').forEach(button => {
    if (button.dataset.game === slug) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  });
  const title = games[slug] || '남하루 미니게임';
  document.querySelector('#game-title').textContent = title;
  document.querySelector('#game-number').textContent = slug ? 'GAME ' + String(Object.keys(games).indexOf(slug) + 1).padStart(2, '0') : 'HOME';
  document.title = title + ' — NAMHARU GAME';
  standalone.hidden = !slug;
  frame = null;
  if (!slug) { playWindow.replaceChildren(homeScreen); return; }
  standalone.href = './' + slug + '/?embed=1&layout=11';
  // A fresh iframe has no previous game in its own navigation history.
  // Parent history is the single source of truth for both title and content.
  frame = document.createElement('iframe');
  frame.id = 'game-frame';
  frame.title = title;
  frame.allow = 'autoplay; fullscreen';
  frame.setAttribute('scrolling', 'no');
  frame.addEventListener('load', () => {
    frame?.contentDocument?.addEventListener('click', event => {
      const link = event.target.closest('a[href]');
      if (!link) return;
      const destination = new URL(link.href);
      if (destination.origin === location.origin && destination.pathname === location.pathname) {
        event.preventDefault();
        navigate('');
      }
    });
  });
  frame.src = standalone.href;
  playWindow.replaceChildren(frame);
}
function navigate(slug) {
  slug = normalize(slug);
  if (current === slug) return;
  history.pushState(null, '', location.pathname + location.search + (slug ? '#' + slug : ''));
  renderGame(slug);
}
document.querySelectorAll('[data-game]').forEach(button => button.addEventListener('click', () => navigate(button.dataset.game)));
document.querySelector('.brand').addEventListener('click', event => { event.preventDefault(); navigate(''); });
const syncRoute = () => renderGame(location.hash.slice(1));
addEventListener('popstate', syncRoute);
addEventListener('hashchange', syncRoute);
addEventListener('message', event => {
  if (event.origin === location.origin && event.source === frame?.contentWindow && event.data?.type === 'namharu-home') navigate('');
});
standalone.addEventListener('click', event => {
  event.preventDefault();
  if (!current) return;
  const popup = window.open(standalone.href, 'namharu-broadcast-game', 'popup=yes,width=880,height=600,resizable=yes,scrollbars=no');
  if (popup) popup.focus();
});
syncRoute();
