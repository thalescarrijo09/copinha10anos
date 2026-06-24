import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, writeBatch } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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
const auth = getAuth(fbApp);
const db = getFirestore(fbApp);
const API_KEY = firebaseConfig.apiKey;

const state = {
  currentUser: null, userRole: null,
  schools: [], professors: [], teams: [], tournaments: [],
  currentTournament: null, currentTeam: null, currentSquadTeam: null,
  profTeams: [], profTournaments: [],
  currentSumula: null 
};
window.state = state;

const MODALITY_LABELS = { futsal: 'Futsal', queimada: 'Queimada' };
const CATEGORY_LABELS = { sub09: 'Sub-09', sub11: 'Sub-11' };
const GENDER_LABELS = { masculino: 'Masculino', feminino: 'Feminino' };

/* ============================================================
   ÁUDIO SINTETIZADO (Alertas Sonoros sem Ficheiros Externos)
   ============================================================ */
let audioCtx = null;
function initAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
}
function playBeep(freq = 440, duration = 200, type = 'sine') {
  if(!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type; osc.frequency.value = freq;
  osc.connect(gain); gain.connect(audioCtx.destination);
  osc.start();
  gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + duration/1000);
  osc.stop(audioCtx.currentTime + duration/1000);
}
function playOneMinuteWarning() {
  playBeep(880, 200); setTimeout(() => playBeep(880, 200), 300);
}
function playEndWarning() {
  playBeep(600, 1500, 'square');
}

/* ============================================================
   MAPAS FIXOS DE DUPLA ELIMINAÇÃO (7 a 10 times)
   ============================================================ */
const SEEDS = ['A','B','C','D','E','F','G','H','I','J'];

const MAPS = {
  7:{
    winners:[
      [ {id:1,label:'Jogo 1',s:[{seed:'C'},{seed:'I'}]}, {id:2,label:'Jogo 2',s:[{seed:'F'},{seed:'B'}]}, {id:3,label:'Jogo 3',s:[{seed:'H'},{seed:'E'}]} ],
      [ {id:5,label:'Jogo 5',s:[{seed:'A'},{win:1}]}, {id:6,label:'Jogo 6',s:[{win:2},{win:3}]} ],
      [ {id:10,label:'Semifinal',s:[{win:5},{win:6}]} ],
      [ {id:12,label:'Final',s:[{win:10},{win:11}]} ],
    ],
    losers:[
      [ {id:4,label:'Jogo 4',s:[{lose:2},{lose:3}]} ],
      [ {id:7,label:'Jogo 7',s:[{lose:6},{lose:1}]}, {id:8,label:'Jogo 8',s:[{lose:5},{win:4}]} ],
      [ {id:9,label:'Jogo 9',s:[{win:7},{win:8}]} ],
      [ {id:11,label:'Final perd.',s:[{lose:10},{win:9}]} ],
    ]
  },
  8:{
    winners:[
      [ {id:1,label:'Jogo 1',s:[{seed:'A'},{seed:'H'}]}, {id:2,label:'Jogo 2',s:[{seed:'D'},{seed:'E'}]}, {id:3,label:'Jogo 3',s:[{seed:'C'},{seed:'F'}]}, {id:4,label:'Jogo 4',s:[{seed:'B'},{seed:'G'}]} ],
      [ {id:7,label:'Jogo 7',s:[{win:1},{win:2}]}, {id:8,label:'Jogo 8',s:[{win:3},{win:4}]} ],
      [ {id:12,label:'Semifinal',s:[{win:7},{win:8}]} ],
      [ {id:14,label:'Final',s:[{win:12},{win:13}]} ],
    ],
    losers:[
      [ {id:5,label:'Jogo 5',s:[{lose:1},{lose:2}]}, {id:6,label:'Jogo 6',s:[{lose:3},{lose:4}]} ],
      [ {id:10,label:'Jogo 10',s:[{lose:8},{win:5}]}, {id:9,label:'Jogo 9',s:[{lose:7},{win:6}]} ],
      [ {id:11,label:'Jogo 11',s:[{win:10},{win:9}]} ],
      [ {id:13,label:'Final perd.',s:[{lose:12},{win:11}]} ],
    ]
  },
  9:{
    winners:[
      [ {id:1,label:'Jogo 1',s:[{seed:'B'},{seed:'G'}]} ],
      [ {id:5,label:'Jogo 5',s:[{seed:'D'},{win:1}]}, {id:2,label:'Jogo 2',s:[{seed:'H'},{seed:'C'}]}, {id:3,label:'Jogo 3',s:[{seed:'A'},{seed:'E'}]}, {id:4,label:'Jogo 4',s:[{seed:'F'},{seed:'I'}]} ],
      [ {id:10,label:'Jogo 10',s:[{win:5},{win:2}]}, {id:9,label:'Jogo 9',s:[{win:3},{win:4}]} ],
      [ {id:14,label:'Semifinal',s:[{win:10},{win:9}]} ],
      [ {id:16,label:'Final',s:[{win:14},{win:15}]} ],
    ],
    losers:[
      [ {id:6,label:'Jogo 6',s:[{lose:4},{lose:1}]} ],
      [ {id:8,label:'Jogo 8',s:[{lose:3},{win:6}]}, {id:7,label:'Jogo 7',s:[{lose:2},{lose:5}]} ],
      [ {id:12,label:'Jogo 12',s:[{lose:10},{win:8}]}, {id:11,label:'Jogo 11',s:[{lose:9},{win:7}]} ],
      [ {id:13,label:'Jogo 13',s:[{win:12},{win:11}]} ],
      [ {id:15,label:'Final perd.',s:[{lose:14},{win:13}]} ],
    ]
  },
  10:{
    winners:[
      [ {id:1,label:'Jogo 1',s:[{seed:'B'},{seed:'G'}]}, {id:2,label:'Jogo 2',s:[{seed:'E'},{seed:'J'}]} ],
      [ {id:3,label:'Jogo 3',s:[{seed:'A'},{win:1}]}, {id:4,label:'Jogo 4',s:[{seed:'D'},{seed:'I'}]}, {id:5,label:'Jogo 5',s:[{seed:'C'},{seed:'H'}]}, {id:6,label:'Jogo 6',s:[{seed:'F'},{win:2}]} ],
      [ {id:11,label:'Jogo 11',s:[{win:3},{win:4}]}, {id:12,label:'Jogo 12',s:[{win:5},{win:6}]} ],
      [ {id:16,label:'Semifinal',s:[{win:11},{win:12}]} ],
      [ {id:18,label:'Final',s:[{win:16},{win:17}]} ],
    ],
    losers:[
      [ {id:8,label:'Jogo 8',s:[{lose:4},{lose:1}]}, {id:7,label:'Jogo 7',s:[{lose:3},{lose:2}]} ],
      [ {id:10,label:'Jogo 10',s:[{lose:6},{win:8}]}, {id:9,label:'Jogo 9',s:[{lose:5},{win:7}]} ],
      [ {id:13,label:'Jogo 13',s:[{lose:11},{win:10}]}, {id:14,label:'Jogo 14',s:[{lose:12},{win:9}]} ],
      [ {id:15,label:'Jogo 15',s:[{win:13},{win:14}]} ],
      [ {id:17,label:'Final perd.',s:[{lose:16},{win:15}]} ],
    ]
  }
};

onAuthStateChanged(auth, async (user) => {
  if (user) {
    const snap = await getDoc(doc(db, 'users', user.uid));
    if (snap.exists()) {
      state.currentUser = { uid: user.uid, ...snap.data() };
      state.currentUser.schoolIds = state.currentUser.schoolIds || (state.currentUser.schoolId ? [state.currentUser.schoolId] : []);
      state.userRole = snap.data().role;
      document.getElementById('userName').textContent = snap.data().name || user.email;
      document.getElementById('loginView').style.display = 'none';
      document.getElementById('appView').style.display = 'flex';
      
      if (state.userRole === 'admin') {
        document.getElementById('navAdmin').classList.remove('hidden');
        await init();
      } else {
        document.getElementById('navProfessor').classList.remove('hidden');
        show('profTeams');
      }
    } else {
      alert('Usuário não cadastrado no sistema.');
      await signOut(auth);
    }
  } else {
    state.currentUser = null; state.userRole = null;
    document.getElementById('loginView').style.display = 'flex';
    document.getElementById('appView').style.display = 'none';
    document.getElementById('navAdmin').classList.add('hidden');
    document.getElementById('navProfessor').classList.add('hidden');
  }
});

async function init() {
  await loadSchools(); await loadProfessors(); await loadTeams(); await loadTournaments();
  renderDashboard(); renderSchoolsTable(); renderProfessorsTable();
  loadSchoolsForChecklist(); renderTournamentsList();
  show('dashboard');
}

function show(viewId) {
  document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
  const el = document.getElementById('view-' + viewId);
  if (el) el.classList.remove('hidden');
  
  if (viewId === 'teams') { loadSchoolsForChecklist(); }
  if (viewId === 'tournaments') { renderTournamentsList(); }
  if (viewId === 'profTeams') { loadProfTeams(); }
  if (viewId === 'profTournaments') { loadProfTournaments(); }
  if (viewId === 'generalStandings') { renderGeneralStandings(); }
  
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.sidebar-overlay');
  if(sidebar && sidebar.classList.contains('active')) {
    toggleSidebar();
  }
}

async function login() {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  document.getElementById('loginError').textContent = '';
  try { await signInWithEmailAndPassword(auth, email, password); }
  catch (e) { document.getElementById('loginError').textContent = 'E-mail ou senha inválidos.'; }
}

async function logout() { await signOut(auth); state.currentUser = null; state.userRole = null; }

function renderDashboard() {
  document.getElementById('dashSchools').textContent = state.schools.length;
  document.getElementById('dashProfessors').textContent = state.professors.length;
  document.getElementById('dashTeams').textContent = state.teams.length;
  document.getElementById('dashTournaments').textContent = state.tournaments.length;
}

async function loadSchools() {
  const snap = await getDocs(query(collection(db, 'schools'), orderBy('name')));
  state.schools = snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

function renderSchoolsTable() {
  const tbody = document.getElementById('schoolsTable');
  if (state.schools.length === 0) { tbody.innerHTML = '<tr><td colspan="2" class="empty">Nenhuma escola cadastrada.</td></tr>'; return; }
  tbody.innerHTML = state.schools.map(s => `
    <tr><td>${s.name}</td>
      <td><button onclick="app.openSchoolModal('${s.id}')">Editar</button>
      <button class="danger" onclick="app.deleteSchool('${s.id}')">Excluir</button></td></tr>`).join('');
}

// ----------------------------------------------------
// SISTEMA DE MODAL
// ----------------------------------------------------
function openModal(html, isWide = false) {
  const content = document.getElementById('modalContent');
  content.innerHTML = html;
  if(isWide) {
    content.classList.add('modal-wide');
  } else {
    content.classList.remove('modal-wide');
  }
  document.getElementById('modalOverlay').style.display = 'flex';
}

function closeModal() { 
  if (state.currentSumula && state.currentSumula.timer && state.currentSumula.timer.interval) {
    clearInterval(state.currentSumula.timer.interval);
  }
  document.getElementById('modalOverlay').style.display = 'none'; 
}

function openSchoolModal(id) {
  const isEdit = !!id;
  const school = isEdit ? state.schools.find(s => s.id === id) : null;
  openModal(`<div class="modal-header"><h3>${isEdit ? 'Editar' : 'Nova'} Escola</h3><button class="close-btn" onclick="app.closeModal()">×</button></div>
    <input id="schoolName" value="${school ? school.name : ''}" placeholder="Nome da escola">
    <button onclick="app.saveSchool('${id || ''}')">Salvar</button>`);
}

async function saveSchool(id) {
  const name = document.getElementById('schoolName').value.trim();
  if (!name) return alert('Informe o nome da escola.');
  const ref = doc(db, 'schools', id || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
  await setDoc(ref, { name }, { merge: true });
  closeModal(); await loadSchools(); renderSchoolsTable(); loadSchoolsForChecklist(); renderDashboard();
}

async function deleteSchool(id) {
  if (!confirm('Excluir esta escola?')) return;
  await deleteDoc(doc(db, 'schools', id));
  await loadSchools(); renderSchoolsTable(); loadSchoolsForChecklist(); renderDashboard();
}

async function loadProfessors() {
  const snap = await getDocs(query(collection(db, 'users'), where('role', '==', 'professor')));
  state.professors = snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

function renderProfessorsTable() {
  const tbody = document.getElementById('professorsTable');
  if (state.professors.length === 0) { tbody.innerHTML = '<tr><td colspan="3" class="empty">Nenhum professor.</td></tr>'; return; }
  tbody.innerHTML = state.professors.map(p => `
    <tr><td>${p.name}</td><td>${p.email}</td>
      <td><button onclick="app.openProfessorModal('${p.id}')">Editar</button>
      <button class="danger" onclick="app.deleteProfessor('${p.id}')">Excluir</button></td></tr>`).join('');
}

async function saveProfessor(id) {
  const name = document.getElementById('profName').value.trim();
  const email = document.getElementById('profEmail').value.trim();
  const password = document.getElementById('profPassword').value;
  
  const checked = document.querySelectorAll('#profSchoolsChecklist input[type="checkbox"]:checked');
  const schoolIds = Array.from(checked).map(c => c.value);

  if (!name || !email || schoolIds.length === 0) return alert('Preencha nome, e-mail e selecione pelo menos uma escola.');
  
  if (!id) {
    if (!password) return alert('Defina uma senha para o novo professor.');
    const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: false })
    });
    const data = await res.json();
    if (!res.ok) return alert('Erro ao criar usuário: ' + (data.error?.message || 'Erro desconhecido'));
    id = data.localId;
    await setDoc(doc(db, 'users', id), { email, name, role: 'professor', schoolIds });
  } else {
    await updateDoc(doc(db, 'users', id), { name, email, schoolIds });
    if (password) alert('A senha só pode ser redefinida pelo administrador do Firebase ou pelo professor usando "Esqueci minha senha".');
  }
  await setDoc(doc(db, 'professors', id), { name, email, schoolIds }, { merge: true });
  closeModal(); await loadProfessors(); renderProfessorsTable(); renderDashboard();
}

function openProfessorModal(id) {
  const isEdit = !!id;
  const prof = isEdit ? state.professors.find(p => p.id === id) : null;
  const pSchools = prof ? (prof.schoolIds || (prof.schoolId ? [prof.schoolId] : [])) : [];

  const schoolsHtml = state.schools.map(s => `
    <div class="school-check-item">
      <input type="checkbox" value="${s.id}" id="pschk_${s.id}" ${pSchools.includes(s.id) ? 'checked' : ''}>
      <label for="pschk_${s.id}">${s.name}</label>
    </div>
  `).join('');

  openModal(`
    <div class="modal-header"><h3>${isEdit ? 'Editar' : 'Novo'} Professor</h3><button class="close-btn" onclick="app.closeModal()">×</button></div>
    <input id="profName" value="${prof ? prof.name : ''}" placeholder="Nome completo">
    <input id="profEmail" value="${prof ? prof.email : ''}" placeholder="E-mail">
    <input id="profPassword" type="password" placeholder="${isEdit ? 'Nova senha (deixe em branco para não alterar)' : 'Senha de acesso'}">
    
    <label style="font-weight:600; display:block; margin-bottom:8px; margin-top:10px;">Escolas Vinculadas:</label>
    <div class="schools-checklist" id="profSchoolsChecklist" style="margin-bottom:16px;">
      ${schoolsHtml || '<div class="empty">Nenhuma escola cadastrada.</div>'}
    </div>
    
    <button onclick="app.saveProfessor('${id || ''}')">Salvar</button>
  `);
}

async function deleteProfessor(id) {
  if (!confirm('Excluir professor?')) return;
  await deleteDoc(doc(db, 'professors', id)); await deleteDoc(doc(db, 'users', id));
  await loadProfessors(); renderProfessorsTable(); renderDashboard();
}

async function loadTeams() {
  const snap = await getDocs(collection(db, 'teams'));
  state.teams = snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

function loadSchoolsForChecklist() {
  const container = document.getElementById('schoolsChecklist');
  if (state.schools.length === 0) { container.innerHTML = '<div class="empty">Nenhuma escola cadastrada. Cadastre escolas primeiro.</div>'; return; }
  container.innerHTML = state.schools.map(s => `
    <div class="school-check-item">
      <input type="checkbox" value="${s.id}" id="chk_${s.id}" data-name="${s.name}">
      <label for="chk_${s.id}">${s.name}</label>
    </div>`).join('');
}

function toggleSelectAllSchools() {
  const all = document.getElementById('selectAllSchools').checked;
  document.querySelectorAll('#schoolsChecklist input[type="checkbox"]').forEach(c => c.checked = all);
}

async function createBatchTeams() {
  const modality = document.getElementById('teamBatchModality').value;
  const category = document.getElementById('teamBatchCategory').value;
  const gender = document.getElementById('teamBatchGender').value;
  if (!modality || !category || !gender) { alert('Preencha modalidade, categoria e naipe.'); return; }
  const checked = document.querySelectorAll('#schoolsChecklist input[type="checkbox"]:checked');
  if (checked.length === 0) { alert('Selecione pelo menos uma escola.'); return; }
  const batch = writeBatch(db);
  const tournamentId = `${modality}_${category}_${gender}`;
  const tournamentRef = doc(db, 'tournaments', tournamentId);
  const tSnap = await getDoc(tournamentRef);
  let existingTeamIds = [];
  if (tSnap.exists()) existingTeamIds = tSnap.data().teamIds || [];
  const newTeamIds = [];
  checked.forEach(cb => {
    const schoolId = cb.value;
    const school = state.schools.find(s => s.id === schoolId);
    const teamName = school ? school.name : 'Escola';
    
    const teamRef = doc(collection(db, 'teams'));
    batch.set(teamRef, { name: teamName, schoolId, modality, category, gender, tournamentId, createdAt: new Date().toISOString(), athletes: [] });
    newTeamIds.push(teamRef.id);
  });
  const allTeamIds = [...existingTeamIds, ...newTeamIds];
  const tournamentName = `${MODALITY_LABELS[modality]} ${GENDER_LABELS[gender]} ${CATEGORY_LABELS[category]}`;
  batch.set(tournamentRef, { name: tournamentName, modality, category, gender, teamIds: allTeamIds, status: 'pending', createdAt: tSnap.exists() ? tSnap.data().createdAt : new Date().toISOString() }, { merge: true });
  await batch.commit();
  alert(`${checked.length} time(s) cadastrado(s)! Torneio "${tournamentName}" atualizado.`);
  await loadTeams(); await loadTournaments(); renderTournamentsList(); renderDashboard();
}

async function loadTournaments() {
  const snap = await getDocs(collection(db, 'tournaments'));
  state.tournaments = snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

function renderTournamentsList() {
  const container = document.getElementById('tournamentsList');
  if (state.tournaments.length === 0) { container.innerHTML = '<div class="empty">Nenhum torneio criado. Cadastre times na aba "Times" para gerar torneios automaticamente.</div>'; return; }
  container.innerHTML = state.tournaments.map(t => {
    const statusLabel = statusToLabel(t.status);
    return `<div class="card tournament-list-card">
      <div style="cursor:pointer;" onclick="app.openTournamentDetail('${t.id}')">
        <h4><span class="badge ${t.modality}">${MODALITY_LABELS[t.modality]}</span> ${t.name}</h4>
        <p class="small">${(t.teamIds || []).length} times · <span class="badge" style="text-transform:capitalize; background:#fff3e0; color:#e65100;">${statusLabel}</span></p>
      </div>
      <div class="tournament-card-actions">
        <button class="secondary" onclick="event.stopPropagation(); app.openEditTournamentModal('${t.id}')">✏️ Editar</button>
        <button class="secondary" onclick="event.stopPropagation(); app.openManageTeamsModal('${t.id}')">👥 Times</button>
        <button class="danger" onclick="event.stopPropagation(); app.deleteTournament('${t.id}')">🗑️ Excluir</button>
      </div>
    </div>`;
  }).join('');
}

function statusToLabel(s) {
  return s === 'pending' ? 'Pendente' : s === 'active' ? 'Em andamento' : s === 'finished' ? 'Finalizado' : 'Pendente';
}

function openEditTournamentModal(id) {
  const t = state.tournaments.find(x => x.id === id) || state.currentTournament;
  if (!t) return;
  openModal(`
    <div class="modal-header"><h3>Editar Torneio</h3><button class="close-btn" onclick="app.closeModal()">×</button></div>
    <label style="font-weight:600; display:block; margin-bottom:6px;">Nome do torneio</label>
    <input id="editTournamentName" value="${t.name}" placeholder="Nome do torneio">
    <button onclick="app.saveTournamentName('${id}')">Salvar</button>`);
}

async function saveTournamentName(id) {
  const name = document.getElementById('editTournamentName').value.trim();
  if (!name) return alert('Informe o nome do torneio.');
  await updateDoc(doc(db, 'tournaments', id), { name, updatedAt: new Date().toISOString() });
  closeModal();
  await loadTournaments();
  renderTournamentsList();
  renderDashboard();
  if (state.currentTournament && state.currentTournament.id === id) {
    state.currentTournament.name = name;
    const tdName = document.getElementById('tdName');
    if (tdName) tdName.textContent = name;
  }
  alert('Nome do torneio atualizado!');
}

function openManageTeamsModal(id) {
  const t = state.tournaments.find(x => x.id === id) || state.currentTournament;
  if (!t) return;
  const currentTeamIds = t.teamIds || [];
  const eligibleTeams = state.teams.filter(team =>
    team.modality === t.modality && team.category === t.category && team.gender === t.gender
  );
  currentTeamIds.forEach(tid => {
    if (!eligibleTeams.some(e => e.id === tid)) {
      const extra = state.teams.find(x => x.id === tid);
      if (extra) eligibleTeams.push(extra);
    }
  });

  const warn = t.status !== 'pending'
    ? `<p class="small" style="color:var(--danger); margin-bottom:12px;">⚠️ Este torneio já foi iniciado. Alterar os times <b>resetará o chaveamento</b> (resultados serão apagados).</p>`
    : '';

  const listHtml = eligibleTeams.length === 0
    ? '<div class="empty">Nenhum time elegível. Cadastre times nesta modalidade/categoria/naipe.</div>'
    : eligibleTeams.map(team => `
      <div class="school-check-item">
        <input type="checkbox" value="${team.id}" id="mng_${team.id}" ${currentTeamIds.includes(team.id) ? 'checked' : ''}>
        <label for="mng_${team.id}">${team.name}</label>
      </div>`).join('');

  openModal(`
    <div class="modal-header"><h3>Gerenciar Times</h3><button class="close-btn" onclick="app.closeModal()">×</button></div>
    ${warn}
    <p class="small mb">Marque os times que devem participar deste torneio.</p>
    <div class="schools-checklist" id="manageTeamsChecklist">${listHtml}</div>
    <button onclick="app.saveTournamentTeams('${id}')">Salvar Times</button>`);
}

async function saveTournamentTeams(id) {
  const t = state.tournaments.find(x => x.id === id) || state.currentTournament;
  if (!t) return;
  const checked = document.querySelectorAll('#manageTeamsChecklist input[type="checkbox"]:checked');
  const newTeamIds = Array.from(checked).map(c => c.value);

  const wasStarted = t.status !== 'pending';
  if (wasStarted) {
    if (!confirm('Alterar os times irá RESETAR o chaveamento (resultados serão apagados). Continuar?')) return;
  }

  const updateData = { teamIds: newTeamIds, updatedAt: new Date().toISOString() };
  if (wasStarted) {
    updateData.status = 'pending';
    updateData.seeds = {};
    updateData.results = {};
    updateData.bracketSize = null;
  }

  await updateDoc(doc(db, 'tournaments', id), updateData);
  closeModal(); await loadTournaments(); renderTournamentsList(); renderDashboard();

  if (state.currentTournament && state.currentTournament.id === id) {
    const fresh = await getDoc(doc(db, 'tournaments', id));
    state.currentTournament = { id: fresh.id, ...fresh.data() };
    renderTournamentDetail(state.currentTournament);
  }
  alert('Times do torneio atualizados!');
}

async function deleteTournament(id) {
  const t = state.tournaments.find(x => x.id === id) || state.currentTournament;
  const name = t ? t.name : 'este torneio';
  if (!confirm(`Excluir o torneio "${name}"?\n\nOs TIMES NÃO serão excluídos, apenas o torneio.`)) return;
  await deleteDoc(doc(db, 'tournaments', id));
  await loadTournaments(); renderTournamentsList(); renderDashboard();
  if (state.currentTournament && state.currentTournament.id === id) {
    state.currentTournament = null; show('tournaments');
  }
  alert('Torneio excluído!');
}

// ============================================================
// MODAL DE PLANTEL SIMPLES (CLIQUE NO NOME NO CHAVEAMENTO)
// ============================================================

async function openTeamSquadModal(teamId) {
  if (!teamId) return;
  const tSnap = await getDoc(doc(db, 'teams', teamId));
  if (!tSnap.exists()) return;
  const team = { id: tSnap.id, ...tSnap.data() };
  state.currentSquadTeam = team;

  const userSchools = state.currentUser ? (state.currentUser.schoolIds || (state.currentUser.schoolId ? [state.currentUser.schoolId] : [])) : [];
  const isOwnerProfessor = state.userRole === 'professor' && userSchools.includes(team.schoolId);
  const isEditable = isOwnerProfessor;

  let html = `
    <div class="modal-header">
      <h3 style="display:flex; align-items:center; gap:8px;">📋 Plantel <span style="font-size:1rem; font-weight:normal; color:#666;">(${team.name})</span></h3>
      <button class="close-btn" style="width: auto !important; margin: 0 !important;" onclick="app.closeModal()">×</button>
    </div>`;
  
  html += `<p class="small mb"><span class="badge ${team.modality}">${MODALITY_LABELS[team.modality]}</span> <span class="badge ${team.category}">${CATEGORY_LABELS[team.category]}</span> <span class="badge ${team.gender}">${GENDER_LABELS[team.gender]}</span></p>`;

  if (isEditable) {
    html += `
      <div class="athlete-inputs mt mb">
        <input type="text" id="squadAthleteName" placeholder="Nome do atleta">
        <input type="number" id="squadAthleteNumber" placeholder="Nº">
        <button class="accent" onclick="app.addAthleteToSquad('${team.id}')">Adicionar</button>
      </div>
    `;
  } else {
    html += `<p class="small mb mt" style="color:var(--primary); font-weight:500;">Visualização de Plantel (Apenas leitura)</p>`;
  }

  html += `
    <div class="table-responsive mt">
      <table>
        <thead><tr><th style="width: 50px; text-align:center;">Nº</th><th>Nome do Atleta</th>${isEditable ? '<th style="width: 90px; text-align:center;">Ações</th>' : ''}</tr></thead>
        <tbody id="squadAthletesTable"></tbody>
      </table>
    </div>
  `;

  openModal(html);
  renderSquadTable(team, isEditable);
}

function renderSquadTable(team, isEditable) {
  const tbody = document.getElementById('squadAthletesTable');
  if (!tbody) return;
  const athletes = team.athletes || [];
  if (athletes.length === 0) {
    tbody.innerHTML = `<tr><td colspan="${isEditable ? 3 : 2}" class="empty">Nenhum atleta registado nesta equipa.</td></tr>`;
    return;
  }

  tbody.innerHTML = athletes
    .map((a, i) => ({ ...a, _idx: i }))
    .sort((x, y) => (x.number || 0) - (y.number || 0))
    .map(a => `
      <tr>
        <td style="text-align:center; font-weight:bold;">${a.number ?? '-'}</td>
        <td>${a.name}</td>
        ${isEditable ? `<td style="text-align:center; white-space:nowrap;">
          <button class="secondary small-btn" style="padding:4px 8px; margin:2px;" onclick="app.editAthleteFromSquad('${team.id}', ${a._idx})" title="Editar Nº">✏️</button>
          <button class="danger small-btn" style="padding:4px 8px; margin:2px;" onclick="app.removeAthleteFromSquad('${team.id}', ${a._idx})" title="Excluir">🗑️</button>
        </td>` : ''}
      </tr>`).join('');
}

async function editAthleteFromSquad(teamId, idx) {
  const team = state.currentSquadTeam;
  if (!team || team.id !== teamId) return;
  const athlete = team.athletes[idx];
  
  const newNumberStr = prompt(`Digite o novo número para o(a) atleta ${athlete.name}:`, athlete.number || '');
  if (newNumberStr === null) return; 
  
  const newNumber = newNumberStr.trim() === '' ? null : parseInt(newNumberStr);
  const athletes = [...team.athletes];
  athletes[idx].number = newNumber;
  
  await updateDoc(doc(db, 'teams', teamId), { athletes });
  team.athletes = athletes;
  
  const tIdx = state.teams.findIndex(t => t.id === teamId);
  if(tIdx > -1) state.teams[tIdx].athletes = athletes;
  const ptIdx = state.profTeams.findIndex(t => t.id === teamId);
  if(ptIdx > -1) state.profTeams[ptIdx].athletes = athletes;

  renderSquadTable(team, true);

  if (state.currentTeam && state.currentTeam.id === teamId) {
    state.currentTeam.athletes = athletes;
    if(document.getElementById('athletesTable')) renderAthletes();
  }
}

async function addAthleteToSquad(teamId) {
  const name = document.getElementById('squadAthleteName').value.trim();
  const number = document.getElementById('squadAthleteNumber').value;
  if (!name) return alert('Informe o nome do atleta.');

  const team = state.currentSquadTeam;
  if (!team || team.id !== teamId) return;

  const athletes = team.athletes ? [...team.athletes] : [];
  athletes.push({ name, number: number ? parseInt(number) : null });

  await updateDoc(doc(db, 'teams', teamId), { athletes });
  team.athletes = athletes;

  const tIdx = state.teams.findIndex(t => t.id === teamId);
  if(tIdx > -1) state.teams[tIdx].athletes = athletes;
  const ptIdx = state.profTeams.findIndex(t => t.id === teamId);
  if(ptIdx > -1) state.profTeams[ptIdx].athletes = athletes;

  document.getElementById('squadAthleteName').value = '';
  document.getElementById('squadAthleteNumber').value = '';
  renderSquadTable(team, true);

  if (state.currentTeam && state.currentTeam.id === teamId) {
    state.currentTeam.athletes = athletes;
    if(document.getElementById('athletesTable')) renderAthletes();
  }
}

async function removeAthleteFromSquad(teamId, idx) {
  if (!confirm('Remover este atleta?')) return;
  const team = state.currentSquadTeam;
  if (!team || team.id !== teamId) return;

  const athletes = (team.athletes || []).filter((_, i) => i !== idx);
  await updateDoc(doc(db, 'teams', teamId), { athletes });
  team.athletes = athletes;

  const tIdx = state.teams.findIndex(t => t.id === teamId);
  if(tIdx > -1) state.teams[tIdx].athletes = athletes;
  const ptIdx = state.profTeams.findIndex(t => t.id === teamId);
  if(ptIdx > -1) state.profTeams[ptIdx].athletes = athletes;

  renderSquadTable(team, true);

  if (state.currentTeam && state.currentTeam.id === teamId) {
    state.currentTeam.athletes = athletes;
    if(document.getElementById('athletesTable')) renderAthletes();
  }
}

// ============================================================
// CHAVEAMENTO DUPLA ELIMINAÇÃO & SALVAMENTO
// ============================================================

function teamNameClickable(id) {
  if (!id) return '<span class="bye">—</span>';
  const t = state.teams.find(x => x.id === id);
  const name = t ? t.name : 'Equipa';
  return `<span style="cursor:pointer; display:inline-flex; align-items:center; gap:4px; color:var(--primary); transition:opacity 0.2s;" onmouseover="this.style.opacity=0.7" onmouseout="this.style.opacity=1" onclick="app.openTeamSquadModal('${id}')" title="Ver Súmula / Plantel">
    <span style="font-size:0.85rem;">📋</span> 
    <span style="text-decoration:underline; text-decoration-color:#b0bec5; text-underline-offset:3px;">${name}</span>
  </span>`;
}

function matchById(map, id) {
  let found = null;
  ['winners','losers'].forEach(k => map[k].forEach(col => col.forEach(m => { if (m.id === id) found = m; })));
  return found;
}

function resolveSlot(map, slot, seeds, results) {
  if (slot.seed !== undefined) return { teamId: seeds[slot.seed] || null, decided: true, feedLabel: null };
  if (slot.win !== undefined) {
    const r = results[slot.win];
    if (r !== undefined) {
      const m = matchById(map, slot.win);
      const wIdx = typeof r === 'object' ? r.winner : r; 
      return resolveSlot(map, m.s[wIdx], seeds, results);
    }
    return { teamId: null, decided: false, feedLabel: 'Venc. Jogo ' + slot.win };
  }
  if (slot.lose !== undefined) {
    const r = results[slot.lose];
    if (r !== undefined) {
      const m = matchById(map, slot.lose);
      const wIdx = typeof r === 'object' ? r.winner : r;
      return resolveSlot(map, m.s[1 - wIdx], seeds, results);
    }
    return { teamId: null, decided: false, feedLabel: 'Perd. Jogo ' + slot.lose };
  }
  return { teamId: null, decided: false, feedLabel: '?' };
}

function isFinalGame(label) { return label === 'Final' || label === 'Final perd.'; }

function renderMatchCardDE(map, m, seeds, results, readOnly, tournamentId) {
  const a = resolveSlot(map, m.s[0], seeds, results);
  const b = resolveSlot(map, m.s[1], seeds, results);
  const resultData = results[m.id];
  const winnerIdx = resultData !== undefined ? (typeof resultData === 'object' ? resultData.winner : resultData) : undefined;
  
  const scoreA = resultData !== undefined && typeof resultData === 'object' ? resultData.scoreA : (winnerIdx === 0 ? '✓' : '-');
  const scoreB = resultData !== undefined && typeof resultData === 'object' ? resultData.scoreB : (winnerIdx === 1 ? '✓' : '-');
  
  const bothDecided = a.decided && b.decided;
  const isFinal = isFinalGame(m.label);
  const cardClass = isFinal ? 'grand-final' : (m.label.startsWith('Final perd') ? 'loser-bracket' : 'winner-bracket');
  const canEdit = !readOnly && bothDecided && winnerIdx === undefined;

  const sideHtml = (info, idx, score) => {
    const isWin = winnerIdx === idx;
    const label = info.decided
      ? `<span class="team-name ${isWin ? 'winner' : ''}">${teamNameClickable(info.teamId)}</span>`
      : `<span class="pending-feed">${info.feedLabel}</span>`;
    
    const inputHtml = canEdit 
      ? `<input type="number" id="match_${m.id}_score${idx}" class="inline-score" placeholder="-">`
      : (resultData !== undefined ? `<span class="score-display">${score}</span>` : '');

    return `<div class="match-side">${label} ${inputHtml}</div>`;
  };

  const actionHtml = winnerIdx !== undefined && !readOnly
    ? `<button class="secondary small-btn" onclick="app.undoMatchResultDE('${tournamentId}', ${m.id})">Desfazer</button>`
    : canEdit
      ? `<div style="display:flex; flex-direction:column; gap:4px;">
           <button class="secondary small-btn" style="background:#e0e0e0; color:#333; border: 1px solid #ccc;" onclick="app.openSumulaModal('${tournamentId}', ${m.id})">⚽ Súmula</button>
           <button class="accent small-btn" onclick="app.saveInlineResultDE('${tournamentId}', ${m.id})">Salvar</button>
         </div>`
      : bothDecided && readOnly 
        ? '<span class="badge" style="background:#fffde7;">Aguardando</span>'
        : '';

  return `
    <div class="match-card ${cardClass}">
      <div class="match-teams">
        <div style="font-size:0.7rem; color:#999; margin-bottom:6px;">${m.label}</div>
        ${sideHtml(a, 0, scoreA)}
        <div class="match-vs">vs</div>
        ${sideHtml(b, 1, scoreB)}
      </div>
      ${actionHtml ? `<div class="match-actions">${actionHtml}</div>` : ''}
    </div>`;
}

function renderBracketDE(tournament, containerId, readOnly) {
  const container = document.getElementById(containerId);
  const size = tournament.bracketSize;
  if (!size || !MAPS[size]) { container.innerHTML = '<div class="empty">Torneio ainda não iniciado.</div>'; return; }
  const map = MAPS[size];
  const seeds = tournament.seeds || {};
  const results = tournament.results || {};

  let html = '<div class="bracket-round"><h4>🏅 Chave dos Vencedores</h4><div class="bracket-cols">';
  map.winners.forEach((col, i) => {
    html += `<div class="bracket-col"><div class="col-label">Fase ${i+1}</div>`;
    col.forEach(m => { html += renderMatchCardDE(map, m, seeds, results, readOnly, tournament.id); });
    html += '</div>';
  });
  html += '</div></div>';

  html += '<div class="bracket-round"><h4>🔄 Chave dos Perdedores (Repescagem)</h4><div class="bracket-cols">';
  map.losers.forEach((col, i) => {
    html += `<div class="bracket-col"><div class="col-label">Fase ${i+1}</div>`;
    col.forEach(m => { html += renderMatchCardDE(map, m, seeds, results, readOnly, tournament.id); });
    html += '</div>';
  });
  html += '</div></div>';

  container.innerHTML = html;
}

function seedsEmUso(map) {
  const usados = new Set();
  ['winners','losers'].forEach(k => map[k].forEach(col => col.forEach(m => m.s.forEach(slot => { if (slot.seed !== undefined) usados.add(slot.seed); }))));
  return SEEDS.filter(s => usados.has(s));
}

async function openTournamentDetail(id) {
  const snap = await getDoc(doc(db, 'tournaments', id));
  if (!snap.exists()) return;
  const tournament = { id: snap.id, ...snap.data() };
  state.currentTournament = tournament;
  state.tournaments = state.tournaments.map(t => t.id === id ? tournament : t);
  renderTournamentDetail(tournament);
  show('tournament-detail');
}

function renderTournamentDetail(tournament) {
  document.getElementById('tdName').textContent = tournament.name;
  document.getElementById('tdInfo').innerHTML = `
    <span class="badge ${tournament.modality}">${MODALITY_LABELS[tournament.modality]}</span>
    <span class="badge ${tournament.category}">${CATEGORY_LABELS[tournament.category]}</span>
    <span class="badge ${tournament.gender}">${GENDER_LABELS[tournament.gender]}</span>
    <span class="badge" style="text-transform:capitalize; margin-left:6px;">${statusToLabel(tournament.status)}</span>`;
  const teamsList = document.getElementById('tdTeamsList');
  const teamIds = tournament.teamIds || [];
  teamsList.innerHTML = teamIds.length === 0
    ? '<div class="empty">Nenhum time.</div>'
    : teamIds.map(tid => { const t = state.teams.find(x => x.id === tid); return `<span class="badge" style="background:#e3f2fd; margin:2px; display:inline-block;">${t ? t.name : tid}</span>`; }).join('');
  
  const actions = document.getElementById('tournamentActionButtons');
  if (tournament.status === 'pending' && state.userRole === 'admin') actions.classList.remove('hidden'); else actions.classList.add('hidden');
  
  renderStandings(tournament, 'tdStandings');
  renderBracketDE(tournament, 'tdBracket', state.userRole !== 'admin');
}

async function shuffleTournamentTeams() {
  const tournament = state.currentTournament;
  if (!tournament || tournament.status !== 'pending') return alert('Só pode embaralhar antes de iniciar.');
  const shuffled = [...tournament.teamIds].sort(() => Math.random() - 0.5);
  tournament.teamIds = shuffled;
  await updateDoc(doc(db, 'tournaments', tournament.id), { teamIds: shuffled, updatedAt: new Date().toISOString() });
  renderTournamentDetail(tournament);
  alert('Ordem das equipes embaralhada!');
}

async function startTournament() {
  let tournament = state.currentTournament;
  if (!tournament) return alert('Torneio não carregado.');
  const fresh = await getDoc(doc(db, 'tournaments', tournament.id));
  if (!fresh.exists()) return alert('Torneio não encontrado.');
  tournament = { id: fresh.id, ...fresh.data() };
  if (tournament.status !== 'pending') return alert('Torneio já iniciado.');

  const teamIds = tournament.teamIds || [];
  const n = teamIds.length;
  if (n < 7 || n > 10) return alert(`Este sistema suporta apenas torneios de 7 a 10 times. Este torneio tem ${n}.`);

  const map = MAPS[n];
  const seedKeys = seedsEmUso(map);
  const seeds = {};
  seedKeys.forEach((k, i) => { seeds[k] = teamIds[i] || null; });

  await updateDoc(doc(db, 'tournaments', tournament.id), {
    bracketSize: n, seeds, results: {}, status: 'active',
    startedAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  });
  alert('Torneio iniciado!'); openTournamentDetail(tournament.id);
}

async function saveInlineResultDE(tournamentId, jogoId) {
  const scoreAInput = document.getElementById(`match_${jogoId}_score0`);
  const scoreBInput = document.getElementById(`match_${jogoId}_score1`);
  
  if (!scoreAInput || !scoreBInput || scoreAInput.value === '' || scoreBInput.value === '') {
    return alert('Preencha o placar das duas equipes antes de salvar.');
  }

  const scoreA = parseInt(scoreAInput.value);
  const scoreB = parseInt(scoreBInput.value);

  if (scoreA === scoreB) {
    return alert('Em fases eliminatórias, não pode haver empate. Caso o jogo tenha ido para penáltis, registe o placar final considerando o vencedor.');
  }

  const winnerIdx = scoreA > scoreB ? 0 : 1;
  await executeSaveResult(tournamentId, jogoId, scoreA, scoreB, winnerIdx, null);
}

async function executeSaveResult(tournamentId, jogoId, scoreA, scoreB, winnerIdx, detailsObj) {
  const t = state.tournaments.find(x => x.id === tournamentId) || state.currentTournament;
  const results = { ...(t.results || {}) };
  
  results[jogoId] = { scoreA, scoreB, winner: winnerIdx };
  if (detailsObj) results[jogoId].details = detailsObj;
  
  t.results = results;

  const map = MAPS[t.bracketSize];
  const finalGame = matchById(map, MAPS[t.bracketSize].winners.flat().find(g => g.label === 'Final').id);
  const newStatus = results[finalGame.id] !== undefined ? 'finished' : 'active';

  await updateDoc(doc(db, 'tournaments', tournamentId), {
    results, status: newStatus, updatedAt: new Date().toISOString()
  });
  t.status = newStatus;
  renderTournamentDetail(t);
}

async function undoMatchResultDE(tournamentId, jogoId) {
  if(!confirm('Desfazer o resultado deste jogo? (Atenção: se outras partidas já dependerem deste resultado, voltarão ao estado "Aguardando").')) return;
  
  const tournament = state.tournaments.find(t => t.id === tournamentId) || state.currentTournament;
  let results = { ...(tournament.results || {}) };
  
  delete results[jogoId];
  tournament.results = results;

  await updateDoc(doc(db, 'tournaments', tournamentId), {
    results, status: 'active', updatedAt: new Date().toISOString()
  });
  tournament.status = 'active';
  renderTournamentDetail(tournament);
}

// ============================================================
// LÓGICA DA SÚMULA ONLINE, TEMPORIZADOR E AUTO-SAVE
// ============================================================

function saveSumulaLocal() {
  if (!state.currentSumula) return;
  const s = state.currentSumula;
  
  const backup = {
    tournamentId: s.tournamentId, matchId: s.matchId, modality: s.modality,
    dataA: s.dataA, dataB: s.dataB, scoreA: s.scoreA, scoreB: s.scoreB,
    faltantesA: s.faltantesA, faltantesB: s.faltantesB,
    timer: { totalSeconds: s.timer.totalSeconds, isRunning: false, interval: null }
  };
  
  localStorage.setItem('sumulaBackup_' + s.matchId, JSON.stringify(backup));
  
  const autoSaveText = document.getElementById('autoSaveText');
  if(autoSaveText) {
     const now = new Date();
     autoSaveText.textContent = `🟢 Salvo localmente às ${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
  }
}

function formatTime(secs) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function toggleTimer() {
  initAudio(); 
  const t = state.currentSumula.timer;
  if (!t) return;
  
  if (t.isRunning) {
    clearInterval(t.interval);
    t.isRunning = false;
  } else {
    t.isRunning = true;
    t.interval = setInterval(() => {
      if (t.totalSeconds > 0) {
        t.totalSeconds--;
        
        if (t.totalSeconds === 60) playOneMinuteWarning();
        if (t.totalSeconds === 0) playEndWarning();

        const display = document.getElementById('timerDisplay');
        if (display) display.textContent = formatTime(t.totalSeconds);
      } else {
        clearInterval(t.interval);
        t.isRunning = false;
        renderSumulaModal(); 
      }
      
      if(t.totalSeconds % 5 === 0) saveSumulaLocal();
      
    }, 1000);
  }
  renderSumulaModal();
}

function adjustTimer(mins) {
  const t = state.currentSumula.timer;
  if (!t) return;
  t.totalSeconds += mins * 60;
  if (t.totalSeconds < 0) t.totalSeconds = 0;
  const display = document.getElementById('timerDisplay');
  if (display) display.textContent = formatTime(t.totalSeconds);
  saveSumulaLocal();
}

function resetTimer() {
  if(!confirm('Deseja reiniciar o relógio para 15:00?')) return;
  const t = state.currentSumula.timer;
  if (t.isRunning) {
    clearInterval(t.interval);
    t.isRunning = false;
  }
  t.totalSeconds = 15 * 60;
  renderSumulaModal();
  saveSumulaLocal();
}

function openSumulaModal(tournamentId, matchId) {
  const t = state.tournaments.find(x => x.id === tournamentId);
  if (!t) return;
  const map = MAPS[t.bracketSize];
  const match = matchById(map, matchId);
  const slotA = resolveSlot(map, match.s[0], t.seeds, t.results || {});
  const slotB = resolveSlot(map, match.s[1], t.seeds, t.results || {});
  
  if (!slotA.decided || !slotB.decided) return alert('As equipes ainda não estão definidas para este jogo.');

  const teamA = state.teams.find(x => x.id === slotA.teamId);
  const teamB = state.teams.find(x => x.id === slotB.teamId);

  const backupStr = localStorage.getItem('sumulaBackup_' + matchId);
  if (backupStr) {
    if (confirm('Foi encontrada uma súmula em andamento salva no seu dispositivo para este jogo.\n\nDeseja restaurá-la de onde parou?')) {
      const backup = JSON.parse(backupStr);
      state.currentSumula = {
        tournamentId, matchId, modality: t.modality,
        teamA, teamB, 
        dataA: backup.dataA, dataB: backup.dataB,
        scoreA: backup.scoreA, scoreB: backup.scoreB,
        faltantesA: backup.faltantesA, faltantesB: backup.faltantesB,
        timer: { totalSeconds: backup.timer.totalSeconds, isRunning: false, interval: null }
      };
      renderSumulaModal();
      return;
    } else {
      localStorage.removeItem('sumulaBackup_' + matchId);
    }
  }

  state.currentSumula = {
    tournamentId, matchId, modality: t.modality,
    teamA, teamB, dataA: {}, dataB: {},
    scoreA: 0, scoreB: 0,
    timer: { totalSeconds: 15 * 60, isRunning: false, interval: null }
  };

  const isQueimada = t.modality === 'queimada';
  const initAtleta = () => isQueimada ? { burned: false, base: false, returned: false, yellow: 0, red: 0 } : { goals: 0, yellow: 0, red: 0 };
  
  (teamA.athletes || []).forEach(a => state.currentSumula.dataA[a.name] = initAtleta());
  (teamB.athletes || []).forEach(b => state.currentSumula.dataB[b.name] = initAtleta());

  if (isQueimada) {
    const faltantesA = Math.max(0, 12 - (teamA.athletes || []).length);
    const faltantesB = Math.max(0, 12 - (teamB.athletes || []).length);
    state.currentSumula.scoreA = faltantesB; 
    state.currentSumula.scoreB = faltantesA;
    state.currentSumula.faltantesA = faltantesA;
    state.currentSumula.faltantesB = faltantesB;
  }

  renderSumulaModal();
}

function calcSumulaScore() {
  const s = state.currentSumula;
  let ptsA = 0, ptsB = 0;
  
  if (s.modality === 'queimada') {
    ptsA = s.faltantesB || 0; ptsB = s.faltantesA || 0;
    Object.values(s.dataB).forEach(v => { if(v.burned) ptsA++; });
    Object.values(s.dataA).forEach(v => { if(v.burned) ptsB++; });
  } else {
    Object.values(s.dataA).forEach(v => { ptsA += v.goals; });
    Object.values(s.dataB).forEach(v => { ptsB += v.goals; });
  }
  
  s.scoreA = ptsA; s.scoreB = ptsB;
  
  const pA = document.getElementById('sumScoreA');
  const pB = document.getElementById('sumScoreB');
  if(pA) pA.textContent = ptsA;
  if(pB) pB.textContent = ptsB;
}

function updateSum(teamStr, athName, field, increment = true) {
  const s = state.currentSumula;
  const d = s[teamStr][athName];
  const isQ = s.modality === 'queimada';
  
  if (field === 'base') {
    if (!d.base) {
      Object.values(s[teamStr]).forEach(v => { v.base = false; v.returned = false; });
      d.base = true;
    } else {
      d.base = false; d.returned = false;
    }
  } else if (field === 'returned') {
    d.returned = !d.returned;
  } else if (field === 'yellow') {
    if (increment) {
      d.yellow++;
      if (isQ) {
        const totalY = Object.values(s[teamStr]).reduce((sum, a) => sum + a.yellow, 0);
        if (totalY >= 4 && !d.burned) {
          d.burned = true;
          setTimeout(() => alert(`⚠️ Limite de Cartões da Equipe!\nEste é o ${totalY}º cartão amarelo.\nO atleta ${athName} foi queimado automaticamente.`), 50);
        }
      }
    } else {
      if (d.yellow > 0) d.yellow--;
    }
  } else if (typeof d[field] === 'boolean') {
    d[field] = !d[field];
  } else {
    if(increment) d[field]++;
    else if(d[field] > 0) d[field]--;
  }
  
  renderSumulaModal(); 
  saveSumulaLocal(); 
}

function renderSumulaModal() {
  const s = state.currentSumula;
  const isQ = s.modality === 'queimada';
  calcSumulaScore();

  const buildRows = (team, dataObj, teamStr) => {
    return (team.athletes || [])
      .sort((x, y) => {
        const dx = dataObj[x.name];
        const dy = dataObj[y.name];
        if (dx.base && !dy.base) return 1;
        if (!dx.base && dy.base) return -1;
        return (x.number || 0) - (y.number || 0);
      })
      .map(a => {
        const d = dataObj[a.name];
        if (isQ) {
          let returnHtml = '';
          if (d.base) {
            returnHtml = `<label style="margin-left:10px; font-size:0.75rem; cursor:pointer; color:#555; background:#eee; padding:2px 6px; border-radius:4px; border:1px solid #ccc; display:inline-flex; align-items:center; gap:4px;">
              <input type="checkbox" ${d.returned ? 'checked' : ''} onchange="app.updateSum('${teamStr}', '${a.name}', 'returned')"> Ao meio
            </label>`;
          }

          const baseBtnClass = d.base ? 'active-base' : 'empty-btn';
          const baseBtnContent = d.base ? '👑' : '';

          return `<tr>
            <td style="text-align:center; font-weight:bold;">${a.number||'-'}</td>
            <td style="${d.burned ? 'text-decoration:line-through; color:#aaa;' : ''}">
              ${a.name} ${returnHtml}
            </td>
            <td style="text-align:center;"><button class="action-btn ${baseBtnClass}" style="min-width:32px; height:28px;" onclick="app.updateSum('${teamStr}', '${a.name}', 'base')">${baseBtnContent}</button></td>
            <td style="text-align:center;"><button class="action-btn ${d.burned?'active-burn':''}" onclick="app.updateSum('${teamStr}', '${a.name}', 'burned')">☠️</button></td>
            <td style="text-align:center;">
              <button class="action-btn ${d.yellow>0?'active-yellow':''}" onclick="app.updateSum('${teamStr}', '${a.name}', 'yellow')">🟨 ${d.yellow>0?d.yellow:''}</button>
            </td>
          </tr>`;
        } else {
          return `<tr>
            <td style="text-align:center; font-weight:bold;">${a.number||'-'}</td>
            <td>${a.name}</td>
            <td style="text-align:center; white-space:nowrap;">
              <button class="action-btn" onclick="app.updateSum('${teamStr}', '${a.name}', 'goals', false)">-</button>
              <span style="display:inline-block; width:20px; font-weight:bold;">${d.goals}</span>
              <button class="action-btn" style="color:var(--sidebar);" onclick="app.updateSum('${teamStr}', '${a.name}', 'goals', true)">+</button>
            </td>
            <td style="text-align:center; white-space:nowrap;">
              <button class="action-btn ${d.yellow>0?'active-yellow':''}" onclick="app.updateSum('${teamStr}', '${a.name}', 'yellow')">🟨 ${d.yellow>0?d.yellow:''}</button>
              <button class="action-btn ${d.red>0?'active-red':''}" onclick="app.updateSum('${teamStr}', '${a.name}', 'red')">🟥 ${d.red>0?d.red:''}</button>
            </td>
          </tr>`;
        }
      }).join('');
  };

  const html = `
    <div class="modal-header" style="margin-bottom: 10px; display: flex; justify-content: space-between; align-items: flex-start;">
      <h3 style="margin:0; font-size: 1.2rem;">⚽ Súmula Digital - ${MODALITY_LABELS[s.modality]}</h3>
      <button class="close-btn" style="width: auto !important; margin: 0 !important; padding: 6px 15px !important; flex-shrink: 0;" onclick="app.closeModal()">×</button>
    </div>
    
    <div style="display:flex; flex-direction:column; justify-content:center; align-items:center; gap:8px; margin-bottom: 15px;">
      
      <div class="timer-box">
        <button class="timer-btn" style="width: auto !important; margin: 0 !important;" onclick="app.adjustTimer(-1)">-1m</button>
        <div class="timer-display" id="timerDisplay">${formatTime(s.timer.totalSeconds)}</div>
        <button class="timer-btn" style="width: auto !important; margin: 0 !important;" onclick="app.adjustTimer(1)">+1m</button>
        <button class="timer-btn" style="width: auto !important; margin: 0 0 0 10px !important; background: ${s.timer.isRunning ? '#f44336' : '#4caf50'}; min-width: 100px;" onclick="app.toggleTimer()">
          ${s.timer.isRunning ? '⏸ Pausar' : '▶ Iniciar'}
        </button>
        <button class="timer-btn-reset" style="width: auto !important; margin: 0 0 0 5px !important; padding: 6px 12px; border-radius: 4px;" onclick="app.resetTimer()">⟲</button>
      </div>

      <div class="sumula-scoreboard" style="margin:0;">
        <span id="sumScoreA">${s.scoreA}</span> <span class="vs">X</span> <span id="sumScoreB">${s.scoreB}</span>
      </div>

    </div>

    <div class="sumula-container">
      <div class="sumula-team team-a">
        <h4>${s.teamA.name}</h4>
        <div class="sumula-table-wrapper">
          <table class="sumula-table">
            <thead>
              <tr><th style="width:30px;">Nº</th><th>Atleta</th>${isQ ? '<th style="text-align:center; width:50px;">Base</th><th style="text-align:center; width:50px;">Queim.</th><th style="text-align:center; width:50px;">Cartão</th>' : '<th style="text-align:center; width:100px;">Golos</th><th style="text-align:center; width:90px;">Cartões</th>'}</tr>
            </thead>
            <tbody>${buildRows(s.teamA, s.dataA, 'dataA')}</tbody>
          </table>
        </div>
      </div>

      <div class="sumula-team team-b">
        <h4>${s.teamB.name}</h4>
        <div class="sumula-table-wrapper">
          <table class="sumula-table">
            <thead>
              <tr><th style="width:30px;">Nº</th><th>Atleta</th>${isQ ? '<th style="text-align:center; width:50px;">Base</th><th style="text-align:center; width:50px;">Queim.</th><th style="text-align:center; width:50px;">Cartão</th>' : '<th style="text-align:center; width:100px;">Golos</th><th style="text-align:center; width:90px;">Cartões</th>'}</tr>
            </thead>
            <tbody>${buildRows(s.teamB, s.dataB, 'dataB')}</tbody>
          </table>
        </div>
      </div>
    </div>
    
    <div class="sumula-footer">
      <span id="autoSaveText" style="font-size: 0.8rem; color: #4caf50;"></span>
      <button class="accent" style="font-size: 1.1rem; padding: 10px 30px;" onclick="app.finishSumula()">Salvar Súmula Oficial</button>
    </div>
  `;

  openModal(html, true); 
}

async function finishSumula() {
  const s = state.currentSumula;
  calcSumulaScore();
  
  if (s.scoreA === s.scoreB) {
    return alert('Não pode haver empates nas eliminatórias. Assinale o ponto de desempate antes de fechar a súmula.');
  }
  
  const winnerIdx = s.scoreA > s.scoreB ? 0 : 1;
  const detailsObj = { dataA: s.dataA, dataB: s.dataB };
  
  await executeSaveResult(s.tournamentId, s.matchId, s.scoreA, s.scoreB, winnerIdx, detailsObj);
  
  localStorage.removeItem('sumulaBackup_' + s.matchId);
  closeModal();
}

// ============================================================
// LÓGICA DE CLASSIFICAÇÃO (POR TORNEIO)
// ============================================================
function calculateStandings(tournament) {
  if (tournament.status !== 'finished') return [];
  const size = tournament.bracketSize;
  const map = MAPS[size];
  const results = tournament.results || {};
  const seeds = tournament.seeds || {};

  const getLoser = (matchId) => {
    const res = results[matchId];
    if (!res) return null;
    const m = matchById(map, matchId);
    const a = resolveSlot(map, m.s[0], seeds, results);
    const b = resolveSlot(map, m.s[1], seeds, results);
    const wIdx = typeof res === 'object' ? res.winner : res;
    return wIdx === 0 ? b.teamId : a.teamId;
  };

  const getWinner = (matchId) => {
    const res = results[matchId];
    if (!res) return null;
    const m = matchById(map, matchId);
    const a = resolveSlot(map, m.s[0], seeds, results);
    const b = resolveSlot(map, m.s[1], seeds, results);
    const wIdx = typeof res === 'object' ? res.winner : res;
    return wIdx === 0 ? a.teamId : b.teamId;
  };

  const standings = [];
  
  const finalGameMatch = map.winners.flat().find(g => g.label === 'Final');
  if (finalGameMatch) {
    const championId = getWinner(finalGameMatch.id);
    const runnerUpId = getLoser(finalGameMatch.id);
    if (championId) standings.push({ pos: '1º Lugar', teamId: championId });
    if (runnerUpId) standings.push({ pos: '2º Lugar', teamId: runnerUpId });
  }

  const losersCols = map.losers;
  const numCols = losersCols.length;

  if (numCols >= 1) {
    losersCols[numCols - 1].forEach(m => {
      const loserId = getLoser(m.id);
      if (loserId) standings.push({ pos: '3º Lugar', teamId: loserId });
    });
  }

  if (numCols >= 2) {
    losersCols[numCols - 2].forEach(m => {
      const loserId = getLoser(m.id);
      if (loserId) standings.push({ pos: '4º Lugar', teamId: loserId });
    });
  }

  if (numCols >= 3) {
    const col = losersCols[numCols - 3];
    const losers = [];
    col.forEach(m => { const id = getLoser(m.id); if (id) losers.push(id); });
    const label = losers.length === 1 ? '5º Lugar' : '5º - 6º Lugar';
    losers.forEach(id => standings.push({ pos: label, teamId: id }));
  }

  if (numCols >= 4) {
    const col = losersCols[numCols - 4];
    const losers = [];
    col.forEach(m => { const id = getLoser(m.id); if (id) losers.push(id); });
    const label = losers.length === 1 ? '7º Lugar' : '7º - 8º Lugar';
    losers.forEach(id => standings.push({ pos: label, teamId: id }));
  }

  if (numCols >= 5) {
    const col = losersCols[numCols - 5];
    const losers = [];
    col.forEach(m => { const id = getLoser(m.id); if (id) losers.push(id); });
    const label = losers.length === 1 ? '9º Lugar' : '9º - 10º Lugar';
    losers.forEach(id => standings.push({ pos: label, teamId: id }));
  }

  return standings;
}

function renderStandings(tournament, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  if (tournament.status !== 'finished') {
    container.innerHTML = '';
    container.classList.add('hidden');
    return;
  }

  const standings = calculateStandings(tournament);
  if (!standings || standings.length === 0) return;

  let html = '<div class="standings-box"><h4 class="mb" style="color: var(--sidebar);">🏆 Classificação Final</h4><div class="standings-list">';
  
  standings.forEach(item => {
    let medal = '';
    let extraClass = '';
    if (item.pos === '1º Lugar') { medal = '🥇'; extraClass = 'first-place'; }
    else if (item.pos === '2º Lugar') { medal = '🥈'; extraClass = 'second-place'; }
    else if (item.pos === '3º Lugar') { medal = '🥉'; extraClass = 'third-place'; }
    else { medal = '🏅'; extraClass = 'other-place'; }

    html += `
      <div class="standing-item ${extraClass}">
        <div class="standing-pos">${medal} ${item.pos}</div>
        <div class="standing-team">${teamNameClickable(item.teamId)}</div>
      </div>
    `;
  });
  
  html += '</div></div>';
  container.innerHTML = html;
  container.classList.remove('hidden');
}

// ============================================================
// CLASSIFICAÇÃO GERAL DAS ESCOLAS
// ============================================================
function renderGeneralStandings() {
  const tbody = document.getElementById('generalStandingsTable');
  if (!tbody) return;

  const schoolStats = {};
  
  state.schools.forEach(s => {
    schoolStats[s.id] = {
      id: s.id, name: s.name, points: 0,
      places: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }
    };
  });

  state.tournaments.filter(t => t.status === 'finished').forEach(tournament => {
    const standings = calculateStandings(tournament);
    
    standings.forEach(item => {
      const team = state.teams.find(x => x.id === item.teamId);
      if (!team) return;
      const schoolId = team.schoolId;
      if (!schoolStats[schoolId]) return;

      let posNum = parseInt(item.pos); 
      
      if (posNum === 1) schoolStats[schoolId].points += 10;
      else if (posNum === 2) schoolStats[schoolId].points += 7;
      else if (posNum === 3) schoolStats[schoolId].points += 4;
      else if (posNum === 4) schoolStats[schoolId].points += 2;
      else if (posNum >= 5 && posNum <= 9) schoolStats[schoolId].points += 1;
      
      if (posNum >= 1 && posNum <= 6) {
        schoolStats[schoolId].places[posNum] += 1;
      }
    });
  });

  const sortedSchools = Object.values(schoolStats).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;             
    if (b.places[1] !== a.places[1]) return b.places[1] - a.places[1]; 
    if (b.places[2] !== a.places[2]) return b.places[2] - a.places[2]; 
    if (b.places[3] !== a.places[3]) return b.places[3] - a.places[3]; 
    if (b.places[4] !== a.places[4]) return b.places[4] - a.places[4]; 
    if (b.places[5] !== a.places[5]) return b.places[5] - a.places[5]; 
    if (b.places[6] !== a.places[6]) return b.places[6] - a.places[6]; 
    return a.name.localeCompare(b.name); 
  });

  if (sortedSchools.length === 0) {
    tbody.innerHTML = '<tr><td colspan=\"4\" class=\"empty\">Nenhuma escola cadastrada ou torneios finalizados.</td></tr>';
    return;
  }

  tbody.innerHTML = sortedSchools.map((s, index) => {
    let medal = '';
    let extraStyle = '';
    if (index === 0 && s.points > 0) { medal = '🏆 '; extraStyle = 'font-size:1.1rem; color:var(--primary);'; }
    else if (index === 1 && s.points > 0) { medal = '🥈 '; }
    else if (index === 2 && s.points > 0) { medal = '🥉 '; }
    
    return `<tr>
      <td style=\"font-weight:bold; text-align:center; ${extraStyle}\">${index + 1}º</td>
      <td style=\"${extraStyle}\">${medal}${s.name}</td>
      <td style=\"font-weight:900; color:var(--primary); text-align:center; font-size:1.1rem;\">${s.points} pts</td>
      <td class=\"small\" style=\"text-align:center; color:#666;\">
        ${s.places[1]} 🥇 | ${s.places[2]} 🥈 | ${s.places[3]} 🥉
      </td>
    </tr>`;
  }).join('');
}


// ============================================================
// ÁREA DO PROFESSOR (Gestão Geral e Histórico)
// ============================================================

async function loadProfTeams() {
  const userSchools = state.currentUser ? (state.currentUser.schoolIds || (state.currentUser.schoolId ? [state.currentUser.schoolId] : [])) : [];
  
  if (userSchools.length === 0) {
    state.profTeams = [];
    renderProfTeams();
    return;
  }

  if (state.teams.length === 0) await loadTeams();
  state.profTeams = state.teams.filter(t => userSchools.includes(t.schoolId));
  renderProfTeams();
}

function renderProfTeams() {
  const container = document.getElementById('profTeamsList');
  const teams = state.profTeams || [];
  if (teams.length === 0) { container.innerHTML = '<div class="empty">Nenhuma equipa para a sua escola.</div>'; return; }
  container.innerHTML = teams.map(t => `
    <div class="card" style="cursor:pointer;" onclick="app.openAthletes('${t.id}')">
      <h4>${t.name}</h4>
      <p class="small">
        <span class="badge ${t.modality}">${MODALITY_LABELS[t.modality]}</span>
        <span class="badge ${t.category}">${CATEGORY_LABELS[t.category]}</span>
        <span class="badge ${t.gender}">${GENDER_LABELS[t.gender]}</span>
        · ${(t.athletes || []).length} atletas
      </p>
    </div>`).join('');
}

function openAthletes(teamId) {
  const team = state.profTeams.find(t => t.id === teamId);
  if (!team) return;
  state.currentTeam = team;
  document.getElementById('athTeamName').textContent = team.name;
  document.getElementById('athTeamInfo').innerHTML = `
    <span class="badge ${team.modality}">${MODALITY_LABELS[team.modality]}</span>
    <span class="badge ${team.category}">${CATEGORY_LABELS[team.category]}</span>
    <span class="badge ${team.gender}">${GENDER_LABELS[team.gender]}</span>`;
  renderAthletes();
  show('profAthletes');
}

function renderAthletes() {
  const team = state.currentTeam;
  const tbody = document.getElementById('athletesTable');
  const athletes = (team && team.athletes) ? team.athletes : [];
  if (athletes.length === 0) { tbody.innerHTML = '<tr><td colspan="3" class="empty">Nenhum atleta registado.</td></tr>'; return; }
  tbody.innerHTML = athletes
    .map((a, i) => ({ ...a, _idx: i }))
    .sort((x, y) => (x.number || 0) - (y.number || 0))
    .map(a => `
      <tr>
        <td style="text-align:center; font-weight:bold;">${a.number ?? '-'}</td>
        <td>${a.name}</td>
        <td style="text-align:center;">
          <button class="secondary small-btn" style="padding:4px 8px; margin:0;" onclick="app.editAthlete(${a._idx})" title="Editar Nº">✏️</button>
          <button class="danger small-btn" style="padding:4px 8px; margin:0;" onclick="app.removeAthlete(${a._idx})" title="Excluir">🗑️</button>
        </td>
      </tr>`).join('');
}

async function editAthlete(idx) {
  const team = state.currentTeam;
  if (!team) return;
  const athlete = team.athletes[idx];
  
  const newNumberStr = prompt(`Digite o novo número para o(a) atleta ${athlete.name}:`, athlete.number || '');
  if (newNumberStr === null) return; 
  
  const newNumber = newNumberStr.trim() === '' ? null : parseInt(newNumberStr);
  const athletes = [...team.athletes];
  athletes[idx].number = newNumber;
  
  await updateDoc(doc(db, 'teams', team.id), { athletes });
  team.athletes = athletes;
  
  const tIdx = state.teams.findIndex(t => t.id === team.id);
  if(tIdx > -1) state.teams[tIdx].athletes = athletes;
  const ptIdx = state.profTeams.findIndex(t => t.id === team.id);
  if(ptIdx > -1) state.profTeams[ptIdx].athletes = athletes;

  renderAthletes();
}

async function addAthlete() {
  const name = document.getElementById('athleteName').value.trim();
  const number = document.getElementById('athleteNumber').value;
  if (!name) return alert('Informe o nome do atleta.');
  const team = state.currentTeam;
  if (!team) return;
  const athletes = team.athletes ? [...team.athletes] : [];
  athletes.push({ name, number: number ? parseInt(number) : null });
  await updateDoc(doc(db, 'teams', team.id), { athletes });
  team.athletes = athletes;
  document.getElementById('athleteName').value = '';
  document.getElementById('athleteNumber').value = '';
  renderAthletes();
}

async function removeAthlete(idx) {
  const team = state.currentTeam;
  if (!team) return;
  if (!confirm('Remover este atleta?')) return;
  const athletes = (team.athletes || []).filter((_, i) => i !== idx);
  await updateDoc(doc(db, 'teams', team.id), { athletes });
  team.athletes = athletes;
  renderAthletes();
}

async function loadProfTournaments() {
  const snap = await getDocs(collection(db, 'tournaments'));
  const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  if (state.teams.length === 0) await loadTeams();
  state.profTournaments = all;
  renderProfTournaments();
}

function renderProfTournaments() {
  const container = document.getElementById('profTournamentsList');
  const list = state.profTournaments || [];
  if (list.length === 0) { container.innerHTML = '<div class="empty">Nenhum torneio disponível.</div>'; return; }
  container.innerHTML = list.map(t => `
    <div class="card tournament-list-card" style="cursor:pointer;" onclick="app.openProfTournamentDetail('${t.id}')">
      <h4><span class="badge ${t.modality}">${MODALITY_LABELS[t.modality]}</span> ${t.name}</h4>
      <p class="small">${(t.teamIds || []).length} equipes · <span class="badge" style="text-transform:capitalize; background:#fff3e0; color:#e65100;">${statusToLabel(t.status)}</span></p>
    </div>`).join('');
}

async function openProfTournamentDetail(id) {
  const snap = await getDoc(doc(db, 'tournaments', id));
  if (!snap.exists()) return;
  const tournament = { id: snap.id, ...snap.data() };
  state.currentTournament = tournament;
  if (state.teams.length === 0) await loadTeams();
  document.getElementById('ptdName').textContent = tournament.name;
  document.getElementById('ptdInfo').innerHTML = `
    <span class="badge ${tournament.modality}">${MODALITY_LABELS[tournament.modality]}</span>
    <span class="badge ${tournament.category}">${CATEGORY_LABELS[tournament.category]}</span>
    <span class="badge ${tournament.gender}">${GENDER_LABELS[tournament.gender]}</span>
    <span class="badge" style="text-transform:capitalize; margin-left:6px;">${statusToLabel(tournament.status)}</span>`;
  
  renderStandings(tournament, 'ptdStandings');
  renderBracketDE(tournament, 'ptdBracket', true);
  show('profTournament-detail');
}

function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.sidebar-overlay');
  if (sidebar) sidebar.classList.toggle('active');
  if (overlay) overlay.classList.toggle('active');
}

window.app = {
  login, logout, show,
  openSchoolModal, saveSchool, deleteSchool,
  openProfessorModal, saveProfessor, deleteProfessor,
  toggleSelectAllSchools, createBatchTeams,
  openTournamentDetail, openEditTournamentModal, saveTournamentName,
  openManageTeamsModal, saveTournamentTeams, deleteTournament,
  shuffleTournamentTeams, startTournament,
  saveInlineResultDE, undoMatchResultDE, executeSaveResult,
  openTeamSquadModal, addAthleteToSquad, removeAthleteFromSquad, editAthleteFromSquad, 
  closeModal,
  openAthletes, addAthlete, removeAthlete, editAthlete,
  loadProfTournaments, openProfTournamentDetail, toggleSidebar,
  renderGeneralStandings,
  openSumulaModal, updateSum, finishSumula, toggleTimer, adjustTimer, resetTimer
};
