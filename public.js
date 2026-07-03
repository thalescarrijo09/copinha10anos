import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, doc, getDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { MAPS, MODALITY_LABELS, CATEGORY_LABELS, GENDER_LABELS, resolveSlot, allMatches } from './bracket-utils.js';

const firebaseConfig = {
  apiKey: "AIzaSyCVs5lG9cjrI8nsVrqlzCCZNp5vn4DHlkw",
  authDomain: "copinha10anos.firebaseapp.com",
  projectId: "copinha10anos",
  storageBucket: "copinha10anos.firebasestorage.app",
  messagingSenderId: "469533203742",
  appId: "1:469533203742:web:2aa73048d82ed6ac20fd0f",
  measurementId: "G-JPYLHH2QDM"
};

const fbApp = initializeApp(firebaseConfig);
const db = getFirestore(fbApp);

const state = { tournaments: [], teams: [] };

async function loadData() {
  const [tSnap, teamSnap] = await Promise.all([
    getDocs(collection(db, 'tournaments')),
    getDocs(collection(db, 'teams'))
  ]);
  state.tournaments = tSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  state.teams = teamSnap.docs.map(d => ({ id: d.id, ...d.data() }));
}

function teamName(id) {
  if (!id) return '—';
  const t = state.teams.find(x => x.id === id);
  return t ? t.name : 'Equipa';
}

function statusToLabel(s) {
  return s === 'pending' ? 'Pendente' : s === 'active' ? 'Em andamento' : s === 'finished' ? 'Finalizado' : 'Pendente';
}

function renderTournamentsList() {
  const container = document.getElementById('publicTournamentsList');
  if (state.tournaments.length === 0) { container.innerHTML = '<div class="empty">Nenhum torneio criado.</div>'; return; }
  container.innerHTML = state.tournaments.map(t => `
    <div class="card tournament-list-card" style="cursor:pointer;" onclick="publicApp.openDetail('${t.id}')">
      <h4><span class="badge ${t.modality}">${MODALITY_LABELS[t.modality]}</span> ${t.name}</h4>
      <p class="small">${(t.teamIds || []).length} times · <span class="badge" style="background:#fff3e0; color:#e65100;">${statusToLabel(t.status)}</span></p>
    </div>`).join('');
}

function renderMatchCardReadOnly(map, m, seeds, results) {
  const a = resolveSlot(map, m.s[0], seeds, results);
  const b = resolveSlot(map, m.s[1], seeds, results);
  const resultData = results[m.id];
  const winnerIdx = resultData !== undefined ? (typeof resultData === 'object' ? resultData.winner : resultData) : undefined;
  const scoreA = resultData !== undefined && typeof resultData === 'object' ? resultData.scoreA : (winnerIdx === 0 ? '✓' : '-');
  const scoreB = resultData !== undefined && typeof resultData === 'object' ? resultData.scoreB : (winnerIdx === 1 ? '✓' : '-');
  const isFinal = m.label === 'Final' || m.label === 'Final perd.';
  const cardClass = isFinal ? 'grand-final' : (m.label.startsWith('Final perd') ? 'loser-bracket' : 'winner-bracket');

  const side = (info, idx, score) => {
    const isWin = winnerIdx === idx;
    const label = info.decided
      ? `<span class="team-name ${isWin ? 'winner' : ''}">${teamName(info.teamId)}</span>`
      : `<span class="pending-feed">${info.feedLabel}</span>`;
    const scoreHtml = resultData !== undefined ? `<span class="score-display">${score}</span>` : '';
    return `<div class="match-side">${label} ${scoreHtml}</div>`;
  };

  return `
    <div class="match-card ${cardClass}">
      <div class="match-teams">
        <div style="font-size:0.7rem; color:#999; margin-bottom:6px;">${m.label}</div>
        ${side(a, 0, scoreA)}
        <div class="match-vs">vs</div>
        ${side(b, 1, scoreB)}
      </div>
    </div>`;
}

function renderBracketReadOnly(tournament, containerId) {
  const container = document.getElementById(containerId);
  const size = tournament.bracketSize;
  if (!size || !MAPS[size]) { container.innerHTML = '<div class="empty">Torneio ainda não iniciado.</div>'; return; }
  const map = MAPS[size];
  const seeds = tournament.seeds || {};
  const results = tournament.results || {};

  let html = '<div class="bracket-round"><h4>🏅 Chave dos Vencedores</h4><div class="bracket-cols">';
  map.winners.forEach((col, i) => {
    html += `<div class="bracket-col"><div class="col-label">Fase ${i+1}</div>`;
    col.forEach(m => { html += renderMatchCardReadOnly(map, m, seeds, results); });
    html += '</div>';
  });
  html += '</div></div>';

  html += '<div class="bracket-round"><h4>🔄 Chave dos Perdedores (Repescagem)</h4><div class="bracket-cols">';
  map.losers.forEach((col, i) => {
    html += `<div class="bracket-col"><div class="col-label">Fase ${i+1}</div>`;
    col.forEach(m => { html += renderMatchCardReadOnly(map, m, seeds, results); });
    html += '</div>';
  });
  html += '</div></div>';

  container.innerHTML = html;
}

function openDetail(id) {
  const t = state.tournaments.find(x => x.id === id);
  if (!t) return;
  document.getElementById('view-publicTournamentList').classList.add('hidden');
  document.getElementById('view-publicTournamentDetail').classList.remove('hidden');
  document.getElementById('pubTdName').textContent = t.name;
  document.getElementById('pubTdInfo').innerHTML = `
    <span class="badge ${t.modality}">${MODALITY_LABELS[t.modality]}</span>
    <span class="badge ${t.category}">${CATEGORY_LABELS[t.category]}</span>
    <span class="badge ${t.gender}">${GENDER_LABELS[t.gender]}</span>
    <span class="badge" style="margin-left:6px;">${statusToLabel(t.status)}</span>`;
  renderBracketReadOnly(t, 'pubTdBracket');
}

function backToList() {
  document.getElementById('view-publicTournamentDetail').classList.add('hidden');
  document.getElementById('view-publicTournamentList').classList.remove('hidden');
}

// ---------------- Jogos do Dia ----------------
async function loadScheduleForDate(dateStr) {
  const container = document.getElementById('publicScheduleList');
  if (!dateStr) { container.innerHTML = ''; return; }
  const snap = await getDoc(doc(db, 'dailySchedule', dateStr));
  if (!snap.exists() || !(snap.data().items || []).length) {
    container.innerHTML = '<div class="empty">Nenhum jogo agendado para esta data.</div>';
    return;
  }
  const items = snap.data().items;
  container.innerHTML = items.map((item, i) => {
    const t = state.tournaments.find(x => x.id === item.tournamentId);
    if (!t || !MAPS[t.bracketSize]) return '';
    const map = MAPS[t.bracketSize];
    const m = allMatches(map).find(x => x.id === item.matchId);
    if (!m) return '';
    const a = resolveSlot(map, m.s[0], t.seeds || {}, t.results || {});
    const b = resolveSlot(map, m.s[1], t.seeds || {}, t.results || {});
    const result = (t.results || {})[m.id];
    const placar = result ? `<span class="score-display" style="margin-left:8px;">${result.scoreA} x ${result.scoreB}</span>` : '';
    return `<div class="match-card">
      <div class="match-teams">
        <div style="font-size:0.75rem; color:#999;">${i+1}º Jogo · ${t.name} · ${m.label}</div>
        <div class="match-side"><span class="team-name">${teamName(a.teamId)} vs ${teamName(b.teamId)}</span> ${placar}</div>
      </div>
    </div>`;
  }).join('');
}

document.getElementById('publicScheduleDate').addEventListener('change', (e) => {
  loadScheduleForDate(e.target.value);
});

window.publicApp = { openDetail, backToList };

(async function initPublic() {
  await loadData();
  renderTournamentsList();
})();
