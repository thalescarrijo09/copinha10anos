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

// ============================================================
// VALIDATION HELPERS
// ============================================================

/**
 * Validates email format
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Escapes HTML special characters to prevent XSS
 * @param {string} text
 * @returns {string}
 */
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Validates modality against whitelist
 * @param {string} modality
 * @returns {boolean}
 */
function isValidModality(modality) {
  return ['futsal', 'queimada'].includes(modality);
}

/**
 * Validates category against whitelist
 * @param {string} category
 * @returns {boolean}
 */
function isValidCategory(category) {
  return ['sub09', 'sub11'].includes(category);
}

/**
 * Validates gender against whitelist
 * @param {string} gender
 * @returns {boolean}
 */
function isValidGender(gender) {
  return ['masculino', 'feminino'].includes(gender);
}

// ============================================================
// ERROR HANDLING HELPERS
// ============================================================

/**
 * Shows error alert to user with console log
 * @param {string} message
 * @param {Error} error
 */
function showError(message, error) {
  console.error(message, error);
  alert(`❌ ${message}\n${error?.message || ''}`);
}

const state = {
  currentUser: null, userRole: null,
  schools: [], professors: [], teams: [], tournaments: [],
  currentTournament: null, currentTeam: null,
  profTeams: [], profTournaments: [], isLoading: false
};
window.state = state;

const MODALITY_LABELS = { futsal: 'Futsal', queimada: 'Queimada' };
const CATEGORY_LABELS = { sub09: 'Sub-09', sub11: 'Sub-11' };
const GENDER_LABELS = { masculino: 'Masculino', feminino: 'Feminino' };

/* ============================================================
   MAPAS FIXOS DE DUPLA ELIMINAÇÃO (7 a 10 times)
   ============================================================ */
const SEEDS = ['A','B','C','D','E','F','G','H','I','J'];

const MAPS = {
  7:{
    winners:[
      [ {id:1,label:'Jogo 1',s:[{seed:'C'},{seed:'I'}]},
        {id:2,label:'Jogo 2',s:[{seed:'F'},{seed:'B'}]},
        {id:3,label:'Jogo 3',s:[{seed:'H'},{seed:'E'}]} ],
      [ {id:5,label:'Jogo 5',s:[{seed:'A'},{win:1}]},
        {id:6,label:'Jogo 6',s:[{win:2},{win:3}]} ],
      [ {id:10,label:'Semifinal',s:[{win:5},{win:6}]} ],
      [ {id:12,label:'Final',s:[{win:10},{win:11}]} ],
    ],
    losers:[
      [ {id:4,label:'Jogo 4',s:[{lose:2},{lose:3}]} ],
      [ {id:7,label:'Jogo 7',s:[{lose:6},{lose:1}]},
        {id:8,label:'Jogo 8',s:[{lose:5},{win:4}]} ],
      [ {id:9,label:'Jogo 9',s:[{win:7},{win:8}]} ],
      [ {id:11,label:'Final perd.',s:[{lose:10},{win:9}]} ],
    ]
  },
  8:{
    winners:[
      [ {id:1,label:'Jogo 1',s:[{seed:'A'},{seed:'H'}]},
        {id:2,label:'Jogo 2',s:[{seed:'D'},{seed:'E'}]},
        {id:3,label:'Jogo 3',s:[{seed:'C'},{seed:'F'}]},
        {id:4,label:'Jogo 4',s:[{seed:'B'},{seed:'G'}]} ],
      [ {id:7,label:'Jogo 7',s:[{win:1},{win:2}]},
        {id:8,label:'Jogo 8',s:[{win:3},{win:4}]} ],
      [ {id:12,label:'Semifinal',s:[{win:7},{win:8}]} ],
      [ {id:14,label:'Final',s:[{win:12},{win:13}]} ],
    ],
    losers:[
      [ {id:5,label:'Jogo 5',s:[{lose:1},{lose:2}]},
        {id:6,label:'Jogo 6',s:[{lose:3},{lose:4}]} ],
      [ {id:10,label:'Jogo 10',s:[{lose:8},{win:5}]},
        {id:9,label:'Jogo 9',s:[{lose:7},{win:6}]} ],
      [ {id:11,label:'Jogo 11',s:[{win:10},{win:9}]} ],
      [ {id:13,label:'Final perd.',s:[{lose:12},{win:11}]} ],
    ]
  },
  9:{
    winners:[
      [ {id:1,label:'Jogo 1',s:[{seed:'B'},{seed:'G'}]} ],
      [ {id:5,label:'Jogo 5',s:[{seed:'D'},{win:1}]},
        {id:2,label:'Jogo 2',s:[{seed:'H'},{seed:'C'}]},
        {id:3,label:'Jogo 3',s:[{seed:'A'},{seed:'E'}]},
        {id:4,label:'Jogo 4',s:[{seed:'F'},{seed:'I'}]} ],
      [ {id:10,label:'Jogo 10',s:[{win:5},{win:2}]},
        {id:9,label:'Jogo 9',s:[{win:3},{win:4}]} ],
      [ {id:14,label:'Semifinal',s:[{win:10},{win:9}]} ],
      [ {id:16,label:'Final',s:[{win:14},{win:15}]} ],
    ],
    losers:[
      [ {id:6,label:'Jogo 6',s:[{lose:4},{lose:1}]} ],
      [ {id:8,label:'Jogo 8',s:[{lose:3},{win:6}]},
        {id:7,label:'Jogo 7',s:[{lose:2},{lose:5}]} ],
      [ {id:12,label:'Jogo 12',s:[{lose:10},{win:8}]},
        {id:11,label:'Jogo 11',s:[{lose:9},{win:7}]} ],
      [ {id:13,label:'Jogo 13',s:[{win:12},{win:11}]} ],
      [ {id:15,label:'Final perd.',s:[{lose:14},{win:13}]} ],
    ]
  },
  10:{
    winners:[
      [ {id:1,label:'Jogo 1',s:[{seed:'B'},{seed:'G'}]},
        {id:2,label:'Jogo 2',s:[{seed:'E'},{seed:'J'}]} ],
      [ {id:3,label:'Jogo 3',s:[{seed:'A'},{win:1}]},
        {id:4,label:'Jogo 4',s:[{seed:'D'},{seed:'I'}]},
        {id:5,label:'Jogo 5',s:[{seed:'C'},{seed:'H'}]},
        {id:6,label:'Jogo 6',s:[{seed:'F'},{win:2}]} ],
      [ {id:11,label:'Jogo 11',s:[{win:3},{win:4}]},
        {id:12,label:'Jogo 12',s:[{win:5},{win:6}]} ],
      [ {id:16,label:'Semifinal',s:[{win:11},{win:12}]} ],
      [ {id:18,label:'Final',s:[{win:16},{win:17}]} ],
    ],
    losers:[
      [ {id:8,label:'Jogo 8',s:[{lose:4},{lose:1}]},
        {id:7,label:'Jogo 7',s:[{lose:3},{lose:2}]} ],
      [ {id:10,label:'Jogo 10',s:[{lose:6},{win:8}]},
        {id:9,label:'Jogo 9',s:[{lose:5},{win:7}]} ],
      [ {id:13,label:'Jogo 13',s:[{lose:11},{win:10}]},
        {id:14,label:'Jogo 14',s:[{lose:12},{win:9}]} ],
      [ {id:15,label:'Jogo 15',s:[{win:13},{win:14}]} ],
      [ {id:17,label:'Final perd.',s:[{lose:16},{win:15}]} ],
    ]
  }
};

onAuthStateChanged(auth, async (user) => {
  if (user) {
    try {
      const snap = await getDoc(doc(db, 'users', user.uid));
      if (snap.exists()) {
        state.currentUser = { uid: user.uid, ...snap.data() };
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
    } catch (e) {
      showError('Erro ao carregar usuário', e);
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
  try {
    await loadSchools(); await loadProfessors(); await loadTeams(); await loadTournaments();
    renderDashboard(); renderSchoolsTable(); renderProfessorsTable();
    loadSchoolsForChecklist(); renderTournamentsList();
    show('dashboard');
  } catch (e) {
    showError('Erro ao inicializar aplicação', e);
  }
}

function show(viewId) {
  document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
  const el = document.getElementById('view-' + viewId);
  if (el) el.classList.remove('hidden');
  if (viewId === 'teams') { loadSchoolsForChecklist(); }
  if (viewId === 'tournaments') { renderTournamentsList(); }
  if (viewId === 'profTeams') { loadProfTeams(); }
  if (viewId === 'profTournaments') { loadProfTournaments(); }
}

async function login() {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  document.getElementById('loginError').textContent = '';
  try { 
    await signInWithEmailAndPassword(auth, email, password); 
  }
  catch (e) { 
    document.getElementById('loginError').textContent = 'E-mail ou senha inválidos.'; 
  }
}

async function logout() { 
  try {
    await signOut(auth); 
    state.currentUser = null; 
    state.userRole = null; 
  } catch (e) {
    showError('Erro ao fazer logout', e);
  }
}

function renderDashboard() {
  document.getElementById('dashSchools').textContent = state.schools.length;
  document.getElementById('dashProfessors').textContent = state.professors.length;
  document.getElementById('dashTeams').textContent = state.teams.length;
  document.getElementById('dashTournaments').textContent = state.tournaments.length;
}

async function loadSchools() {
  try {
    const snap = await getDocs(query(collection(db, 'schools'), orderBy('name')));
    state.schools = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    showError('Erro ao carregar escolas', e);
  }
}

function renderSchoolsTable() {
  const tbody = document.getElementById('schoolsTable');
  if (state.schools.length === 0) { tbody.innerHTML = '<tr><td colspan="2" class="empty">Nenhuma escola cadastrada.</td></tr>'; return; }
  tbody.innerHTML = state.schools.map(s => `
    <tr><td>${escapeHtml(s.name)}</td>
      <td><button class="edit-school-btn" data-school-id="${s.id}">Editar</button>
      <button class="danger delete-school-btn" data-school-id="${s.id}">Excluir</button></td></tr>`).join('');
  
  // Add event listeners (prevents XSS)
  document.querySelectorAll('.edit-school-btn').forEach(btn => {
    btn.addEventListener('click', () => openSchoolModal(btn.dataset.schoolId));
  });
  document.querySelectorAll('.delete-school-btn').forEach(btn => {
    btn.addEventListener('click', () => deleteSchool(btn.dataset.schoolId));
  });
}

function openSchoolModal(id) {
  const isEdit = !!id;
  const school = isEdit ? state.schools.find(s => s.id === id) : null;
  openModal(`<div class="modal-header"><h3>${isEdit ? 'Editar' : 'Nova'} Escola</h3><button class="close-btn" onclick="app.closeModal()">×</button></div>
    <input id="schoolName" value="${school ? escapeHtml(school.name) : ''}" placeholder="Nome da escola">
    <button class="save-school-btn">Salvar</button>`);
  
  document.querySelector('.save-school-btn').addEventListener('click', () => saveSchool(id || ''));
}

async function saveSchool(id) {
  try {
    const name = document.getElementById('schoolName').value.trim();
    if (!name) return alert('Informe o nome da escola.');
    const ref = doc(db, 'schools', id || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
    await setDoc(ref, { name }, { merge: true });
    closeModal(); await loadSchools(); renderSchoolsTable(); loadSchoolsForChecklist(); renderDashboard();
    alert('✅ Escola salva com sucesso!');
  } catch (e) {
    showError('Erro ao salvar escola', e);
  }
}

async function deleteSchool(id) {
  try {
    if (!confirm('Tem certeza que deseja excluir esta escola? Esta ação não pode ser desfeita.')) return;
    await deleteDoc(doc(db, 'schools', id));
    await loadSchools(); renderSchoolsTable(); loadSchoolsForChecklist(); renderDashboard();
    alert('✅ Escola excluída com sucesso!');
  } catch (e) {
    showError('Erro ao excluir escola', e);
  }
}

async function loadProfessors() {
  try {
    const snap = await getDocs(query(collection(db, 'users'), where('role', '==', 'professor')));
    state.professors = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    showError('Erro ao carregar professores', e);
  }
}

function renderProfessorsTable() {
  const tbody = document.getElementById('professorsTable');
  if (state.professors.length === 0) { tbody.innerHTML = '<tr><td colspan="3" class="empty">Nenhum professor.</td></tr>'; return; }
  tbody.innerHTML = state.professors.map(p => `
    <tr><td>${escapeHtml(p.name)}</td><td>${escapeHtml(p.email)}</td>
      <td><button class="edit-prof-btn" data-prof-id="${p.id}">Editar</button>
      <button class="danger delete-prof-btn" data-prof-id="${p.id}">Excluir</button></td></tr>`).join('');
  
  // Add event listeners (prevents XSS)
  document.querySelectorAll('.edit-prof-btn').forEach(btn => {
    btn.addEventListener('click', () => openProfessorModal(btn.dataset.profId));
  });
  document.querySelectorAll('.delete-prof-btn').forEach(btn => {
    btn.addEventListener('click', () => deleteProfessor(btn.dataset.profId));
  });
}

async function saveProfessor(id) {
  try {
    const name = document.getElementById('profName').value.trim();
    const email = document.getElementById('profEmail').value.trim();
    const password = document.getElementById('profPassword').value;
    const schoolId = document.getElementById('profSchool').value;
    
    // Validation (#6)
    if (!name || !email || !schoolId) return alert('Preencha nome, e-mail e escola.');
    if (!isValidEmail(email)) return alert('E-mail inválido. Use o formato: usuario@dominio.com');
    if (name.length > 100) return alert('Nome muito longo (máximo 100 caracteres).');
    
    if (!id) {
      if (!password) return alert('Defina uma senha para o novo professor.');
      const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, returnSecureToken: false })
      });
      const data = await res.json();
      if (!res.ok) return alert('Erro ao criar usuário: ' + (data.error?.message || 'Erro desconhecido'));
      id = data.localId;
      await setDoc(doc(db, 'users', id), { email, name, role: 'professor', schoolId });
    } else {
      await updateDoc(doc(db, 'users', id), { name, email, schoolId });
      if (password) alert('A senha só pode ser redefinida pelo administrador do Firebase ou pelo professor usando "Esqueci minha senha".');
    }
    await setDoc(doc(db, 'professors', id), { name, email, schoolId }, { merge: true });
    closeModal(); await loadProfessors(); renderProfessorsTable(); renderDashboard();
    alert('✅ Professor salvo com sucesso!');
  } catch (e) {
    showError('Erro ao salvar professor', e);
  }
}

function openProfessorModal(id) {
  const isEdit = !!id;
  const prof = isEdit ? state.professors.find(p => p.id === id) : null;
  openModal(`<div class="modal-header"><h3>${isEdit ? 'Editar' : 'Novo'} Professor</h3><button class="close-btn" onclick="app.closeModal()">×</button></div>
    <input id="profName" value="${prof ? escapeHtml(prof.name) : ''}" placeholder="Nome completo">
    <input id="profEmail" value="${prof ? escapeHtml(prof.email) : ''}" placeholder="E-mail">
    <input id="profPassword" type="password" placeholder="${isEdit ? 'Nova senha (deixe em branco para não alterar)' : 'Senha de acesso'}">
    <select id="profSchool"><option value="">Selecione a escola...</option>
      ${state.schools.map(s => `<option value="${s.id}" ${prof && prof.schoolId === s.id ? 'selected' : ''}>${escapeHtml(s.name)}</option>`).join('')}
    </select>
    <button class="save-prof-btn">Salvar</button>`);
  
  document.querySelector('.save-prof-btn').addEventListener('click', () => saveProfessor(id || ''));
}

async function deleteProfessor(id) {
  try {
    if (!confirm('Tem certeza que deseja excluir este professor? Esta ação não pode ser desfeita.')) return;
    await deleteDoc(doc(db, 'professors', id)); 
    await deleteDoc(doc(db, 'users', id));
    await loadProfessors(); renderProfessorsTable(); renderDashboard();
    alert('✅ Professor excluído com sucesso!');
  } catch (e) {
    showError('Erro ao excluir professor', e);
  }
}

async function loadTeams() {
  try {
    const snap = await getDocs(collection(db, 'teams'));
    state.teams = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    showError('Erro ao carregar times', e);
  }
}

function loadSchoolsForChecklist() {
  const container = document.getElementById('schoolsChecklist');
  if (state.schools.length === 0) { container.innerHTML = '<div class="empty">Nenhuma escola cadastrada. Cadastre escolas primeiro.</div>'; return; }
  container.innerHTML = state.schools.map(s => `
    <div class="school-check-item">
      <input type="checkbox" value="${s.id}" id="chk_${s.id}" data-name="${escapeHtml(s.name)}">
      <label for="chk_${s.id}">${escapeHtml(s.name)}</label>
    </div>`).join('');
}

function toggleSelectAllSchools() {
  const all = document.getElementById('selectAllSchools').checked;
  document.querySelectorAll('#schoolsChecklist input[type="checkbox"]').forEach(c => c.checked = all);
}

async function createBatchTeams() {
  try {
    const modality = document.getElementById('teamBatchModality').value;
    const category = document.getElementById('teamBatchCategory').value;
    const gender = document.getElementById('teamBatchGender').value;
    
    // Validation (#18) - whitelist validation
    if (!isValidModality(modality)) { alert('Modalidade inválida.'); return; }
    if (!isValidCategory(category)) { alert('Categoria inválida.'); return; }
    if (!isValidGender(gender)) { alert('Gênero inválido.'); return; }
    
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
      const schoolName = school ? school.name : 'Escola';
      const teamName = `${schoolName} - ${MODALITY_LABELS[modality]} ${GENDER_LABELS[gender]} ${CATEGORY_LABELS[category]}`;
      const teamRef = doc(collection(db, 'teams'));
      batch.set(teamRef, { name: teamName, schoolId, modality, category, gender, tournamentId, createdAt: new Date().toISOString(), athletes: [] });
      newTeamIds.push(teamRef.id);
    });
    const allTeamIds = [...existingTeamIds, ...newTeamIds];
    const tournamentName = `${MODALITY_LABELS[modality]} ${GENDER_LABELS[gender]} ${CATEGORY_LABELS[category]}`;
    batch.set(tournamentRef, { name: tournamentName, modality, category, gender, teamIds: allTeamIds, status: 'pending', createdAt: tSnap.exists() ? tSnap.data().createdAt : new Date().toISOString() }, { merge: true });
    await batch.commit();
    alert(`✅ ${checked.length} time(s) cadastrado(s)! Torneio "${tournamentName}" atualizado.`);
    await loadTeams(); await loadTournaments(); renderTournamentsList(); renderDashboard();
  } catch (e) {
    showError('Erro ao criar times em lote', e);
  }
}

async function loadTournaments() {
  try {
    const snap = await getDocs(collection(db, 'tournaments'));
    state.tournaments = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    showError('Erro ao carregar torneios', e);
  }
}

function renderTournamentsList() {
  const container = document.getElementById('tournamentsList');
  if (state.tournaments.length === 0) { container.innerHTML = '<div class="empty">Nenhum torneio criado. Cadastre times na aba "Times" para gerar torneios automaticamente.</div>'; return; }
  container.innerHTML = state.tournaments.map(t => {
    const statusLabel = statusToLabel(t.status);
    return `<div class="card tournament-list-card">
      <div style="cursor:pointer;" class="open-tournament-detail" data-tournament-id="${t.id}">
        <h4><span class="badge ${t.modality}">${MODALITY_LABELS[t.modality]}</span> ${escapeHtml(t.name)}</h4>
        <p class="small">${(t.teamIds || []).length} times · <span class="badge" style="text-transform:capitalize; background:#fff3e0; color:#e65100;">${statusLabel}</span></p>
      </div>
      <div class="tournament-card-actions">
        <button class="secondary edit-tournament-btn" data-tournament-id="${t.id}">✏️ Editar</button>
        <button class="secondary manage-teams-btn" data-tournament-id="${t.id}">👥 Times</button>
        <button class="danger delete-tournament-btn" data-tournament-id="${t.id}">🗑️ Excluir</button>
      </div>
    </div>`;
  }).join('');
  
  // Add event listeners
  document.querySelectorAll('.open-tournament-detail').forEach(el => {
    el.addEventListener('click', () => openTournamentDetail(el.dataset.tournamentId));
  });
  document.querySelectorAll('.edit-tournament-btn').forEach(btn => {
    btn.addEventListener('click', (e) => { e.stopPropagation(); openEditTournamentModal(btn.dataset.tournamentId); });
  });
  document.querySelectorAll('.manage-teams-btn').forEach(btn => {
    btn.addEventListener('click', (e) => { e.stopPropagation(); openManageTeamsModal(btn.dataset.tournamentId); });
  });
  document.querySelectorAll('.delete-tournament-btn').forEach(btn => {
    btn.addEventListener('click', (e) => { e.stopPropagation(); deleteTournament(btn.dataset.tournamentId); });
  });
}

function statusToLabel(s) {
  return s === 'pending' ? 'Pendente' : s === 'active' ? 'Em andamento' : s === 'finished' ? 'Finalizado' : 'Pendente';
}

function openModal(html) {
  document.getElementById('modalContent').innerHTML = html;
  document.getElementById('modalOverlay').style.display = 'flex';
}
function closeModal() { document.getElementById('modalOverlay').style.display = 'none'; }

// ============================================================
// GERENCIAMENTO DE TORNEIOS
// ============================================================

function openEditTournamentModal(id) {
  const t = state.tournaments.find(x => x.id === id) || state.currentTournament;
  if (!t) return;
  openModal(`
    <div class="modal-header"><h3>Editar Torneio</h3><button class="close-btn" onclick="app.closeModal()">×</button></div>
    <label style="font-weight:600; display:block; margin-bottom:6px;">Nome do torneio</label>
    <input id="editTournamentName" value="${escapeHtml(t.name)}" placeholder="Nome do torneio">
    <button class="save-tournament-name-btn">Salvar</button>`);
  
  document.querySelector('.save-tournament-name-btn').addEventListener('click', () => saveTournamentName(id));
}

async function saveTournamentName(id) {
  try {
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
      if (tdName) tdName.textContent = escapeHtml(name);
    }
    alert('✅ Nome do torneio atualizado!');
  } catch (e) {
    showError('Erro ao salvar nome do torneio', e);
  }
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
        <label for="mng_${team.id}">${escapeHtml(team.name)}</label>
      </div>`).join('');

  openModal(`
    <div class="modal-header"><h3>Gerenciar Times</h3><button class="close-btn" onclick="app.closeModal()">×</button></div>
    ${warn}
    <p class="small mb">Marque os times que devem participar deste torneio.</p>
    <div class="schools-checklist" id="manageTeamsChecklist">${listHtml}</div>
    <button class="save-tournament-teams-btn">Salvar Times</button>`);
  
  document.querySelector('.save-tournament-teams-btn').addEventListener('click', () => saveTournamentTeams(id));
}

async function saveTournamentTeams(id) {
  try {
    const t = state.tournaments.find(x => x.id === id) || state.currentTournament;
    if (!t) return;
    const checked = document.querySelectorAll('#manageTeamsChecklist input[type="checkbox"]:checked');
    const newTeamIds = Array.from(checked).map(c => c.value);

    const wasStarted = t.status !== 'pending';
    if (wasStarted) {
      if (!confirm('Alterar os times irá RESETAR o chaveamento (resultados serão apagados). Continuar?')) return;
    }

    const updateData = {
      teamIds: newTeamIds,
      updatedAt: new Date().toISOString()
    };
    if (wasStarted) {
      updateData.status = 'pending';
      updateData.seeds = {};
      updateData.results = {};
      updateData.bracketSize = null;
    }

    await updateDoc(doc(db, 'tournaments', id), updateData);
    closeModal();
    await loadTournaments();
    renderTournamentsList();
    renderDashboard();

    if (state.currentTournament && state.currentTournament.id === id) {
      const fresh = await getDoc(doc(db, 'tournaments', id));
      state.currentTournament = { id: fresh.id, ...fresh.data() };
      renderTournamentDetail(state.currentTournament);
    }
    alert('✅ Times do torneio atualizados!');
  } catch (e) {
    showError('Erro ao salvar times do torneio', e);
  }
}

async function deleteTournament(id) {
  try {
    const t = state.tournaments.find(x => x.id === id) || state.currentTournament;
    const name = t ? t.name : 'este torneio';
    if (!confirm(`Excluir o torneio "${name}"?\n\nOs TIMES NÃO serão excluídos, apenas o torneio.\nEsta ação não pode ser desfeita.`)) return;
    await deleteDoc(doc(db, 'tournaments', id));
    await loadTournaments();
    renderTournamentsList();
    renderDashboard();
    if (state.currentTournament && state.currentTournament.id === id) {
      state.currentTournament = null;
      show('tournaments');
    }
    alert('✅ Torneio excluído!');
  } catch (e) {
    showError('Erro ao excluir torneio', e);
  }
}

// ============================================================
// CHAVEAMENTO DUPLA ELIMINAÇÃO
// ============================================================

function teamName(id) {
  if (!id) return '<span class="bye">—</span>';
  const t = state.teams.find(x => x.id === id);
  return t ? escapeHtml(t.name) : 'Time';
}

function matchById(map, id) {
  let found = null;
  ['winners','losers'].forEach(k => map[k].forEach(col => col.forEach(m => { if (m.id === id) found = m; })));
  return found;
}

/**
 * Resolve slot recursively to determine team and status
 * @param {Object} map - The bracket map
 * @param {Object} slot - The slot reference (seed/win/lose)
 * @param {Object} seeds - Team seeds mapping
 * @param {Object} results - Match results mapping
 * @returns {Object} Team info and status
 */
function resolveSlot(map, slot, seeds, results) {
  if (slot.seed !== undefined) {
    return { teamId: seeds[slot.seed] || null, decided: true, feedLabel: null };
  }
  if (slot.win !== undefined) {
    const r = results[slot.win];
    if (r !== undefined) {
      const m = matchById(map, slot.win);
      return resolveSlot(map, m.s[r], seeds, results);
    }
    return { teamId: null, decided: false, feedLabel: 'Vencedor do Jogo ' + slot.win };
  }
  if (slot.lose !== undefined) {
    const r = results[slot.lose];
    if (r !== undefined) {
      const m = matchById(map, slot.lose);
      return resolveSlot(map, m.s[1 - r], seeds, results);
    }
    return { teamId: null, decided: false, feedLabel: 'Perdedor do Jogo ' + slot.lose };
  }
  return { teamId: null, decided: false, feedLabel: '?' };
}

function isFinalGame(label) {
  return label === 'Final' || label === 'Final perd.';
}

function renderMatchCardDE(map, m, seeds, results, readOnly, tournamentId) {
  const a = resolveSlot(map, m.s[0], seeds, results);
  const b = resolveSlot(map, m.s[1], seeds, results);
  const winnerIdx = results[m.id];
  const bothDecided = a.decided && b.decided;
  const isFinal = isFinalGame(m.label);
  const cardClass = isFinal ? 'grand-final' : (m.label.startsWith('Final perd') ? 'loser-bracket' : 'winner-bracket');

  const sideHtml = (info, idx) => {
    const isWin = winnerIdx === idx;
    const label = info.decided
      ? `<span class="${isWin ? 'winner' : ''}">${teamName(info.teamId)}</span>`
      : `<span class="pending-feed">${info.feedLabel}</span>`;
    return `<div>${label} ${isWin ? '✓' : ''}</div>`;
  };

  const canEdit = !readOnly && bothDecided && winnerIdx === undefined;
  const actionHtml = winnerIdx !== undefined
    ? '<span class="badge">Finalizado</span>'
    : canEdit
      ? `<button class="open-match-modal-btn" data-tournament-id="${tournamentId}" data-match-id="${m.id}">Resultado</button>`
      : '<span class="badge" style="background:#fffde7;">Aguardando</span>';

  return `
    <div class="match-card ${cardClass}">
      <div class="match-teams">
        <div style="font-size:0.7rem; color:#999; margin-bottom:4px;">${m.label}</div>
        ${sideHtml(a, 0)}
        <div style="color:#999; font-size:0.75rem; margin:2px 0;">vs</div>
        ${sideHtml(b, 1)}
      </div>
      <div>${actionHtml}</div>
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
  
  // Add event listeners for match modals
  document.querySelectorAll('.open-match-modal-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      openMatchModalDE(btn.dataset.tournamentId, parseInt(btn.dataset.matchId));
    });
  });
}

function seedsEmUso(map) {
  const usados = new Set();
  ['winners','losers'].forEach(k => map[k].forEach(col => col.forEach(m => m.s.forEach(slot => { if (slot.seed !== undefined) usados.add(slot.seed); }))));
  return SEEDS.filter(s => usados.has(s));
}

async function openTournamentDetail(id) {
  try {
    const snap = await getDoc(doc(db, 'tournaments', id));
    if (!snap.exists()) return alert('Torneio não encontrado.');
    const tournament = { id: snap.id, ...snap.data() };
    state.currentTournament = tournament;
    state.tournaments = state.tournaments.map(t => t.id === id ? tournament : t);
    renderTournamentDetail(tournament);
    show('tournament-detail');
  } catch (e) {
    showError('Erro ao abrir torneio', e);
  }
}

function renderTournamentDetail(tournament) {
  document.getElementById('tdName').textContent = escapeHtml(tournament.name);
  document.getElementById('tdInfo').innerHTML = `
    <span class="badge ${tournament.modality}">${MODALITY_LABELS[tournament.modality]}</span>
    <span class="badge ${tournament.category}">${CATEGORY_LABELS[tournament.category]}</span>
    <span class="badge ${tournament.gender}">${GENDER_LABELS[tournament.gender]}</span>
    <span class="badge" style="text-transform:capitalize; margin-left:6px;">${statusToLabel(tournament.status)}</span>`;
  const teamsList = document.getElementById('tdTeamsList');
  const teamIds = tournament.teamIds || [];
  teamsList.innerHTML = teamIds.length === 0
    ? '<div class="empty">Nenhum time.</div>'
    : teamIds.map(tid => { const t = state.teams.find(x => x.id === tid); return `<span class="badge" style="background:#e3f2fd; margin:2px; display:inline-block;">${t ? escapeHtml(t.name) : tid}</span>`; }).join('');
  const actions = document.getElementById('tournamentActionButtons');
  if (tournament.status === 'pending' && state.userRole === 'admin') actions.classList.remove('hidden'); else actions.classList.add('hidden');
  renderBracketDE(tournament, 'tdBracket', state.userRole !== 'admin');
}

async function shuffleTournamentTeams() {
  try {
    const tournament = state.currentTournament;
    if (!tournament || tournament.status !== 'pending') return alert('Só pode embaralhar antes de iniciar.');
    if (!confirm('Tem certeza que deseja embaralhar a ordem dos times?')) return;
    const shuffled = [...tournament.teamIds].sort(() => Math.random() - 0.5);
    tournament.teamIds = shuffled;
    await updateDoc(doc(db, 'tournaments', tournament.id), { teamIds: shuffled, updatedAt: new Date().toISOString() });
    renderTournamentDetail(tournament);
    alert('✅ Ordem dos times embaralhada!');
  } catch (e) {
    showError('Erro ao embaralhar times', e);
  }
}

async function startTournament() {
  try {
    let tournament = state.currentTournament;
    if (!tournament) return alert('Torneio não carregado.');
    const fresh = await getDoc(doc(db, 'tournaments', tournament.id));
    if (!fresh.exists()) return alert('Torneio não encontrado.');
    tournament = { id: fresh.id, ...fresh.data() };
    if (tournament.status !== 'pending') return alert('Torneio já iniciado.');

    const teamIds = tournament.teamIds || [];
    const n = teamIds.length;
    if (n < 7 || n > 10) return alert(`Este sistema suporta apenas torneios de 7 a 10 times. Este torneio tem ${n}.`);

    if (!confirm(`Iniciar torneio com ${n} times? Esta ação não pode ser desfeita.`)) return;

    const map = MAPS[n];
    const seedKeys = seedsEmUso(map);
    const seeds = {};
    seedKeys.forEach((k, i) => { seeds[k] = teamIds[i] || null; });

    await updateDoc(doc(db, 'tournaments', tournament.id), {
      bracketSize: n,
      seeds,
      results: {},
      status: 'active',
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    alert('✅ Torneio iniciado!');
    openTournamentDetail(tournament.id);
  } catch (e) {
    showError('Erro ao iniciar torneio', e);
  }
}

function openMatchModalDE(tournamentId, jogoId) {
  try {
    const tournament = state.tournaments.find(t => t.id === tournamentId) || state.currentTournament;
    if (!tournament) return;
    const map = MAPS[tournament.bracketSize];
    const m = matchById(map, jogoId);
    if (!m) return;
    const a = resolveSlot(map, m.s[0], tournament.seeds, tournament.results || {});
    const b = resolveSlot(map, m.s[1], tournament.seeds, tournament.results || {});
    if (!a.decided || !b.decided) return alert('Este jogo ainda não tem os dois times definidos.');

    openModal(`
      <div class="modal-header"><h3>Lançar Resultado — ${m.label}</h3><button class="close-btn" onclick="app.closeModal()">×</button></div>
      <div style="margin-bottom:16px;">
        <div style="display:flex; justify-content:space-between; align-items:center; gap:20px;">
          <div style="text-align:center; flex:1;"><div style="font-weight:bold; margin-bottom:8px;">${teamName(a.teamId)}</div><input type="number" id="scoreA" value="0" min="0" style="width:80px; text-align:center; font-size:1.2rem; padding:6px;">
          <div style="font-weight:bold; color:#777;">vs</div>
          <div style="text-align:center; flex:1;"><div style="font-weight:bold; margin-bottom:8px;">${teamName(b.teamId)}</div><input type="number" id="scoreB" value="0" min="0" style="width:80px; text-align:center; font-size:1.2rem; padding:6px;">
        </div>
      </div>
      <div style="margin-bottom:16px;">
        <label style="display:block; margin-bottom:6px; font-weight:600;">Vencedor:</label>
        <select id="matchWinner"><option value="">Selecione...</option>
          <option value="0">${teamName(a.teamId)}</option>
          <option value="1">${teamName(b.teamId)}</option>
        </select>
      </div>
      <button class="save-match-result-btn" data-tournament-id="${tournamentId}" data-match-id="${jogoId}">Salvar Resultado</button>`);
    
    document.querySelector('.save-match-result-btn').addEventListener('click', (e) => {
      saveMatchResultDE(e.target.dataset.tournamentId, parseInt(e.target.dataset.matchId));
    });
  } catch (e) {
    showError('Erro ao abrir modal de resultado', e);
  }
}

async function saveMatchResultDE(tournamentId, jogoId) {
  try {
    const winnerIdx = document.getElementById('matchWinner').value;
    if (winnerIdx === '') return alert('Selecione o vencedor.');
    const tournament = state.tournaments.find(t => t.id === tournamentId) || state.currentTournament;
    const results = { ...(tournament.results || {}) };
    results[jogoId] = parseInt(winnerIdx);
    tournament.results = results;

    const map = MAPS[tournament.bracketSize];
    const finalGame = matchById(map, MAPS[tournament.bracketSize].winners.flat().find(g => g.label === 'Final').id);
    const newStatus = results[finalGame.id] !== undefined ? 'finished' : 'active';

    await updateDoc(doc(db, 'tournaments', tournamentId), {
      results, status: newStatus, updatedAt: new Date().toISOString()
    });
    tournament.status = newStatus;
    closeModal();
    openTournamentDetail(tournamentId);
    alert('✅ Resultado salvo!');
  } catch (e) {
    showError('Erro ao salvar resultado', e);
  }
}

// ============================================================
// ÁREA DO PROFESSOR
// ============================================================

async function loadProfTeams() {
  try {
    const snap = await getDocs(query(collection(db, 'teams'), where('schoolId', '==', state.currentUser.schoolId)));
    state.profTeams = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderProfTeams();
  } catch (e) {
    showError('Erro ao carregar seus times', e);
  }
}

function renderProfTeams() {
  const container = document.getElementById('profTeamsList');
  const teams = state.profTeams || [];
  if (teams.length === 0) { container.innerHTML = '<div class="empty">Nenhum time para sua escola.</div>'; return; }
  container.innerHTML = teams.map(t => `
    <div class="card open-athletes-card" style="cursor:pointer;" data-team-id="${t.id}">
      <h4>${escapeHtml(t.name)}</h4>
      <p class="small">
        <span class="badge ${t.modality}">${MODALITY_LABELS[t.modality]}</span>
        <span class="badge ${t.category}">${CATEGORY_LABELS[t.category]}</span>
        <span class="badge ${t.gender}">${GENDER_LABELS[t.gender]}</span>
        · ${(t.athletes || []).length} atletas
      </p>
    </div>`).join('');
  
  document.querySelectorAll('.open-athletes-card').forEach(el => {
    el.addEventListener('click', () => openAthletes(el.dataset.teamId));
  });
}

function openAthletes(teamId) {
  const team = state.profTeams.find(t => t.id === teamId);
  if (!team) return;
  state.currentTeam = team;
  document.getElementById('athTeamName').textContent = escapeHtml(team.name);
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
  if (athletes.length === 0) { tbody.innerHTML = '<tr><td colspan="3" class="empty">Nenhum atleta cadastrado.</td></tr>'; return; }
  tbody.innerHTML = athletes
    .map((a, i) => ({ ...a, _idx: i }))
    .sort((x, y) => (x.number || 0) - (y.number || 0))
    .map(a => `
      <tr>
        <td>${a.number ?? '-'}</td>
        <td>${escapeHtml(a.name)}</td>
        <td><button class="danger remove-athlete-btn" data-athlete-idx="${a._idx}">Excluir</button></td>
      </tr>`).join('');
  
  document.querySelectorAll('.remove-athlete-btn').forEach(btn => {
    btn.addEventListener('click', () => removeAthlete(parseInt(btn.dataset.athleteIdx)));
  });
}

async function addAthlete() {
  try {
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
    alert('✅ Atleta adicionado!');
  } catch (e) {
    showError('Erro ao adicionar atleta', e);
  }
}

async function removeAthlete(idx) {
  try {
    const team = state.currentTeam;
    if (!team) return;
    if (!confirm('Tem certeza que deseja remover este atleta? Esta ação não pode ser desfeita.')) return;
    const athletes = (team.athletes || []).filter((_, i) => i !== idx);
    await updateDoc(doc(db, 'teams', team.id), { athletes });
    team.athletes = athletes;
    renderAthletes();
    alert('✅ Atleta removido!');
  } catch (e) {
    showError('Erro ao remover atleta', e);
  }
}

async function loadProfTournaments() {
  try {
    const snap = await getDocs(collection(db, 'tournaments'));
    const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    // garante que os times estejam carregados para resolver nomes no chaveamento
    if (state.teams.length === 0) await loadTeams();
    state.profTournaments = all;
    renderProfTournaments();
  } catch (e) {
    showError('Erro ao carregar torneios', e);
  }
}

function renderProfTournaments() {
  const container = document.getElementById('profTournamentsList');
  const list = state.profTournaments || [];
  if (list.length === 0) { container.innerHTML = '<div class="empty">Nenhum torneio disponível.</div>'; return; }
  container.innerHTML = list.map(t => `
    <div class="card tournament-list-card open-prof-tournament-detail" style="cursor:pointer;" data-tournament-id="${t.id}">
      <h4><span class="badge ${t.modality}">${MODALITY_LABELS[t.modality]}</span> ${escapeHtml(t.name)}</h4>
      <p class="small">${(t.teamIds || []).length} times · <span class="badge" style="text-transform:capitalize; background:#fff3e0; color:#e65100;">${statusToLabel(t.status)}</span></p>
    </div>`).join('');
  
  document.querySelectorAll('.open-prof-tournament-detail').forEach(el => {
    el.addEventListener('click', () => openProfTournamentDetail(el.dataset.tournamentId));
  });
}

async function openProfTournamentDetail(id) {
  try {
    const snap = await getDoc(doc(db, 'tournaments', id));
    if (!snap.exists()) return alert('Torneio não encontrado.');
    const tournament = { id: snap.id, ...snap.data() };
    state.currentTournament = tournament;
    if (state.teams.length === 0) await loadTeams();
    document.getElementById('ptdName').textContent = escapeHtml(tournament.name);
    document.getElementById('ptdInfo').innerHTML = `
      <span class="badge ${tournament.modality}">${MODALITY_LABELS[tournament.modality]}</span>
      <span class="badge ${tournament.category}">${CATEGORY_LABELS[tournament.category]}</span>
      <span class="badge ${tournament.gender}">${GENDER_LABELS[tournament.gender]}</span>
      <span class="badge" style="text-transform:capitalize; margin-left:6px;">${statusToLabel(tournament.status)}</span>`;
    // readOnly = true: professor só visualiza
    renderBracketDE(tournament, 'ptdBracket', true);
    show('profTournament-detail');
  } catch (e) {
    showError('Erro ao abrir torneio', e);
  }
}

// ============================================================
// EXPOSIÇÃO GLOBAL (window.app)
// ============================================================
window.app = {
  login, logout, show,
  openSchoolModal, saveSchool, deleteSchool,
  openProfessorModal, saveProfessor, deleteProfessor,
  toggleSelectAllSchools, createBatchTeams,
  openTournamentDetail, openEditTournamentModal, saveTournamentName,
  openManageTeamsModal, saveTournamentTeams, deleteTournament,
  shuffleTournamentTeams, startTournament,
  openMatchModalDE, saveMatchResultDE,
  closeModal,
  openAthletes, addAthlete, removeAthlete,
  loadProfTournaments, openProfTournamentDetail
};
