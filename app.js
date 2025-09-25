// Global state
let currentUser = null;
let currentUserType = null;
let currentSection = 'dashboard';

// Data from the provided JSON
const initialData = {
    torneios: [
        {id: 1, nome: "Futsal Masculino - Sub11", sigla: "F.MASC - Sub11"},
        {id: 2, nome: "Futsal Feminino - Sub11", sigla: "F.FEM - Sub11"},
        {id: 3, nome: "Futsal Masculino - Sub09", sigla: "F.MASC - Sub09"},
        {id: 4, nome: "Queimada Feminina - Sub11", sigla: "Q.FEM - Sub11"},
        {id: 5, nome: "Queimada Masculina - Sub11", sigla: "Q.MASC - Sub11"},
        {id: 6, nome: "Queimada Feminina - Sub09", sigla: "Q.FEM - Sub09"}
    ],
    escolas: [
        {id: 1, nome: "EM Juarez Távora de Carvalho"},
        {id: 2, nome: "EM Mª Aparecida de Almeida Paniago"},
        {id: 3, nome: "EM Padre Maximino Alvarez Gutierrez"},
        {id: 4, nome: "EM Dom Bosco"},
        {id: 5, nome: "EM Tonico Corredeira"},
        {id: 6, nome: "EM Sto. Antônio"},
        {id: 7, nome: "EM Reverendo Eudóxio"},
        {id: 8, nome: "EM Professor Salviano Neves Amorim"},
        {id: 9, nome: "EM Otalecio Alves Irineu"},
        {id: 10, nome: "EM Mª Eduarda Condinho Filgueiras"},
        {id: 11, nome: "EM Elias Carrijo de Sousa"},
        {id: 12, nome: "EM Comecinho de Vida Mirian de Rezende"},
        {id: 13, nome: "EM Castelo Branco"}
    ],
    professores: [
        {id: 1, nome: "Cristiane Pereira", escola: 1, senha: "123456"},
        {id: 2, nome: "Cristiane Alves", escola: 2, senha: "123456"},
        {id: 3, nome: "Lindonei Junior", escola: 3, senha: "123456"},
        {id: 4, nome: "Alberto", escola: 4, senha: "123456"},
        {id: 5, nome: "Ana Mireile", escola: 5, senha: "123456"},
        {id: 6, nome: "Daiana", escola: 6, senha: "123456"},
        {id: 7, nome: "Domingos", escola: 7, senha: "123456"},
        {id: 8, nome: "Hugo", escola: 8, senha: "123456"},
        {id: 9, nome: "Lorena", escola: 9, senha: "123456"},
        {id: 10, nome: "Poliane Vilela", escola: 10, senha: "123456"},
        {id: 11, nome: "Ana Paula", escola: 11, senha: "123456"},
        {id: 12, nome: "Fernando", escola: 12, senha: "123456"},
        {id: 13, nome: "Mariany", escola: 13, senha: "123456"}
    ]
};

// Initialize data if not exists
function initializeData() {
    if (!localStorage.getItem('escolas')) {
        localStorage.setItem('escolas', JSON.stringify(initialData.escolas));
    }
    if (!localStorage.getItem('professores')) {
        localStorage.setItem('professores', JSON.stringify(initialData.professores));
    }
    if (!localStorage.getItem('torneios')) {
        localStorage.setItem('torneios', JSON.stringify(initialData.torneios));
    }
    if (!localStorage.getItem('times')) {
        localStorage.setItem('times', JSON.stringify([]));
    }
    if (!localStorage.getItem('tournament-instances')) {
        localStorage.setItem('tournament-instances', JSON.stringify([]));
    }
    if (!localStorage.getItem('recursos')) {
        localStorage.setItem('recursos', JSON.stringify([]));
    }
}

// Data access functions
function getEscolas() {
    return JSON.parse(localStorage.getItem('escolas') || '[]');
}

function getProfessores() {
    return JSON.parse(localStorage.getItem('professores') || '[]');
}

function getTorneios() {
    return JSON.parse(localStorage.getItem('torneios') || '[]');
}

function getTimes() {
    return JSON.parse(localStorage.getItem('times') || '[]');
}

function getTournamentInstances() {
    return JSON.parse(localStorage.getItem('tournament-instances') || '[]');
}

function getRecursos() {
    return JSON.parse(localStorage.getItem('recursos') || '[]');
}

function saveEscolas(escolas) {
    localStorage.setItem('escolas', JSON.stringify(escolas));
}

function saveProfessores(professores) {
    localStorage.setItem('professores', JSON.stringify(professores));
}

function saveTimes(times) {
    localStorage.setItem('times', JSON.stringify(times));
}

function saveTournamentInstances(instances) {
    localStorage.setItem('tournament-instances', JSON.stringify(instances));
}

function saveRecursos(recursos) {
    localStorage.setItem('recursos', JSON.stringify(recursos));
}

// Navigation functions
function showLoginSelection() {
    hideAllPages();
    document.getElementById('login-selection').classList.add('active');
}

function showAdminLogin() {
    hideAllPages();
    document.getElementById('admin-login').classList.remove('hidden');
}

function showProfessorLogin() {
    hideAllPages();
    document.getElementById('professor-login').classList.remove('hidden');
    loadProfessorSelect();
}

function showMainInterface() {
    hideAllPages();
    document.getElementById('main-interface').classList.remove('hidden');
}

function hideAllPages() {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
        page.classList.add('hidden');
    });
}

function loadProfessorSelect() {
    const select = document.getElementById('professor-select');
    const professores = getProfessores();
    select.innerHTML = '<option value="">Selecione seu nome</option>';
    professores.forEach(professor => {
        const option = document.createElement('option');
        option.value = professor.id;
        option.textContent = professor.nome;
        select.appendChild(option);
    });
}

// Authentication functions
function handleAdminLogin(e) {
    e.preventDefault();
    const username = document.getElementById('admin-username').value.trim();
    const password = document.getElementById('admin-password').value.trim();
    
    // Simple admin authentication
    if (username === 'admin' && password === 'admin123') {
        currentUser = { id: 'admin', nome: 'Administrador' };
        currentUserType = 'admin';
        showMainInterface();
        setupAdminInterface();
        showSection('admin-dashboard');
        
        // Clear form
        document.getElementById('admin-login-form').reset();
    } else {
        alert('Credenciais inválidas! Use: admin / admin123');
    }
}

function handleProfessorLogin(e) {
    e.preventDefault();
    const professorId = parseInt(document.getElementById('professor-select').value);
    const password = document.getElementById('professor-password').value.trim();
    
    if (!professorId) {
        alert('Selecione um professor!');
        return;
    }
    
    const professores = getProfessores();
    const professor = professores.find(p => p.id === professorId);
    
    if (professor && professor.senha === password) {
        currentUser = professor;
        currentUserType = 'professor';
        showMainInterface();
        setupProfessorInterface();
        showSection('professor-dashboard');
        
        // Clear form
        document.getElementById('professor-login-form').reset();
    } else {
        alert('Senha inválida! Use: 123456');
    }
}

function setupAdminInterface() {
    document.getElementById('current-user-name').textContent = 'Administrador';
    document.getElementById('current-user-type').textContent = 'Admin';
    
    const navMenu = document.getElementById('nav-menu');
    navMenu.innerHTML = `
        <li><a href="#" onclick="showSection('admin-dashboard')" class="nav-link">Dashboard</a></li>
        <li><a href="#" onclick="showSection('admin-escolas')" class="nav-link">Escolas</a></li>
        <li><a href="#" onclick="showSection('admin-times')" class="nav-link">Times</a></li>
        <li><a href="#" onclick="showSection('admin-professores')" class="nav-link">Professores</a></li>
        <li><a href="#" onclick="showSection('admin-torneios')" class="nav-link">Torneios</a></li>
        <li><a href="#" onclick="showSection('admin-tabelas')" class="nav-link">Tabelas</a></li>
        <li><a href="#" onclick="showSection('admin-recursos')" class="nav-link">Recursos</a></li>
    `;
    
    loadAdminDashboard();
}

function setupProfessorInterface() {
    const escolas = getEscolas();
    const escola = escolas.find(e => e.id === currentUser.escola);
    
    document.getElementById('current-user-name').textContent = currentUser.nome;
    document.getElementById('current-user-type').textContent = `Professor - ${escola?.nome || 'Escola não encontrada'}`;
    
    const navMenu = document.getElementById('nav-menu');
    navMenu.innerHTML = `
        <li><a href="#" onclick="showSection('professor-dashboard')" class="nav-link">Dashboard</a></li>
        <li><a href="#" onclick="showSection('professor-times')" class="nav-link">Meus Times</a></li>
        <li><a href="#" onclick="showSection('professor-torneios')" class="nav-link">Torneios</a></li>
        <li><a href="#" onclick="showSection('professor-recursos')" class="nav-link">Recursos</a></li>
    `;
    
    loadProfessorDashboard();
}

function showSection(sectionId) {
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Find the clicked link and make it active
    const clickedLink = event?.target?.closest('.nav-link');
    if (clickedLink) {
        clickedLink.classList.add('active');
    } else {
        // If called programmatically, find the correct link
        const targetLink = document.querySelector(`a[onclick*="${sectionId}"]`);
        if (targetLink) {
            targetLink.classList.add('active');
        }
    }
    
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        currentSection = sectionId;
        
        // Update page title
        const titles = {
            'admin-dashboard': 'Dashboard',
            'admin-escolas': 'Gestão de Escolas',
            'admin-times': 'Gestão de Times',
            'admin-professores': 'Gestão de Professores',
            'admin-torneios': 'Gestão de Torneios',
            'admin-tabelas': 'Tabelas e Resultados',
            'admin-recursos': 'Recursos e Solicitações',
            'professor-dashboard': 'Dashboard',
            'professor-times': 'Meus Times',
            'professor-torneios': 'Torneios',
            'professor-recursos': 'Recursos'
        };
        
        document.getElementById('page-title').textContent = titles[sectionId] || 'Dashboard';
        
        // Load section-specific data
        loadSectionData(sectionId);
    }
}

function loadSectionData(sectionId) {
    try {
        switch(sectionId) {
            case 'admin-dashboard':
                loadAdminDashboard();
                break;
            case 'admin-escolas':
                loadEscolasTable();
                break;
            case 'admin-times':
                loadTimesTable();
                break;
            case 'admin-professores':
                loadProfessoresTable();
                break;
            case 'admin-torneios':
                loadTorneiosList();
                break;
            case 'admin-tabelas':
                loadTabelasSection();
                break;
            case 'admin-recursos':
                loadRecursosAdmin();
                break;
            case 'professor-dashboard':
                loadProfessorDashboard();
                break;
            case 'professor-times':
                loadProfessorTimes();
                break;
            case 'professor-torneios':
                loadProfessorTorneios();
                break;
            case 'professor-recursos':
                loadProfessorRecursos();
                break;
        }
    } catch (error) {
        console.error('Error loading section data:', error);
    }
}

function loadAdminDashboard() {
    const escolas = getEscolas();
    const professores = getProfessores();
    const torneios = getTorneios();
    const times = getTimes();
    
    document.getElementById('total-schools').textContent = escolas.length;
    document.getElementById('total-teachers').textContent = professores.length;
    document.getElementById('total-tournaments').textContent = torneios.length;
    document.getElementById('total-teams').textContent = times.length;
}

function loadProfessorDashboard() {
    const times = getTimes().filter(time => time.escola === currentUser.escola);
    const tournamentInstances = getTournamentInstances();
    const recursos = getRecursos().filter(r => r.professorId === currentUser.id);
    
    // Count active tournaments where professor's teams participate
    let activeTournaments = 0;
    tournamentInstances.forEach(tournament => {
        if (tournament.teams.some(team => team.escola === currentUser.escola)) {
            activeTournaments++;
        }
    });
    
    document.getElementById('my-schools').textContent = '1';
    document.getElementById('my-teams').textContent = times.length;
    document.getElementById('my-tournaments').textContent = activeTournaments;
    document.getElementById('my-resources').textContent = recursos.length;
}

// Schools management
function loadEscolasTable() {
    const escolas = getEscolas();
    const times = getTimes();
    const professores = getProfessores();
    const tbody = document.getElementById('schools-table');
    
    tbody.innerHTML = '';
    
    escolas.forEach(escola => {
        const schoolTimes = times.filter(time => time.escola === escola.id);
        const schoolTeachers = professores.filter(prof => prof.escola === escola.id);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${escola.id}</td>
            <td>${escola.nome}</td>
            <td>${schoolTimes.length}</td>
            <td>${schoolTeachers.length}</td>
            <td>
                <button class="btn btn--sm btn--outline" onclick="deleteEscola(${escola.id})">Excluir</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function handleAddSchool(e) {
    e.preventDefault();
    const nome = document.getElementById('school-name').value.trim();
    
    if (!nome) {
        alert('Nome da escola é obrigatório!');
        return;
    }
    
    const escolas = getEscolas();
    const newId = Math.max(...escolas.map(e => e.id), 0) + 1;
    
    escolas.push({ id: newId, nome: nome });
    saveEscolas(escolas);
    
    hideModal('add-school-modal');
    document.getElementById('add-school-form').reset();
    loadEscolasTable();
    loadAdminDashboard();
}

function deleteEscola(id) {
    if (!confirm('Tem certeza que deseja excluir esta escola?')) return;
    
    const escolas = getEscolas().filter(escola => escola.id !== id);
    saveEscolas(escolas);
    
    // Also delete related teams and update professors
    const times = getTimes().filter(time => time.escola !== id);
    saveTimes(times);
    
    const professores = getProfessores().map(prof => {
        if (prof.escola === id) {
            delete prof.escola;
        }
        return prof;
    });
    saveProfessores(professores);
    
    loadEscolasTable();
    loadAdminDashboard();
}

// Teams management
function loadTimesTable() {
    const times = getTimes();
    const escolas = getEscolas();
    const tbody = document.getElementById('teams-table');
    
    tbody.innerHTML = '';
    
    if (times.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="6" style="text-align: center; padding: 32px; color: #666;">Nenhum time cadastrado</td>';
        tbody.appendChild(row);
        loadSchoolOptions();
        return;
    }
    
    times.forEach(time => {
        const escola = escolas.find(e => e.id === time.escola);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${time.id}</td>
            <td>${time.nome}</td>
            <td>${escola ? escola.nome : 'Escola não encontrada'}</td>
            <td>${time.modalidade}</td>
            <td>${time.categoria}</td>
            <td>
                <button class="btn btn--sm btn--outline" onclick="deleteTime(${time.id})">Excluir</button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    // Load school options for add team modal
    loadSchoolOptions();
}

function loadSchoolOptions() {
    const escolas = getEscolas();
    const selects = ['team-school', 'teacher-school'];
    
    selects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (select) {
            select.innerHTML = '<option value="">Selecione</option>';
            escolas.forEach(escola => {
                const option = document.createElement('option');
                option.value = escola.id;
                option.textContent = escola.nome;
                select.appendChild(option);
            });
        }
    });
}

function handleAddTeam(e) {
    e.preventDefault();
    const nome = document.getElementById('team-name').value.trim();
    const escola = parseInt(document.getElementById('team-school').value);
    const modalidade = document.getElementById('team-modality').value;
    const categoria = document.getElementById('team-category').value;
    
    if (!nome || !escola || !modalidade || !categoria) {
        alert('Todos os campos são obrigatórios!');
        return;
    }
    
    const times = getTimes();
    const newId = Math.max(...times.map(t => t.id), 0) + 1;
    
    times.push({
        id: newId,
        nome: nome,
        escola: escola,
        modalidade: modalidade,
        categoria: categoria
    });
    saveTimes(times);
    
    hideModal('add-team-modal');
    document.getElementById('add-team-form').reset();
    loadTimesTable();
    loadAdminDashboard();
}

function deleteTime(id) {
    if (!confirm('Tem certeza que deseja excluir este time?')) return;
    
    const times = getTimes().filter(time => time.id !== id);
    saveTimes(times);
    
    loadTimesTable();
    loadAdminDashboard();
}

// Teachers management
function loadProfessoresTable() {
    const professores = getProfessores();
    const escolas = getEscolas();
    const tbody = document.getElementById('teachers-table');
    
    tbody.innerHTML = '';
    
    professores.forEach(professor => {
        const escola = escolas.find(e => e.id === professor.escola);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${professor.id}</td>
            <td>${professor.nome}</td>
            <td>${escola ? escola.nome : 'Não vinculado'}</td>
            <td>
                <button class="btn btn--sm btn--outline" onclick="deleteProfessor(${professor.id})">Excluir</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function handleAddTeacher(e) {
    e.preventDefault();
    const nome = document.getElementById('teacher-name').value.trim();
    const escola = parseInt(document.getElementById('teacher-school').value);
    
    if (!nome || !escola) {
        alert('Todos os campos são obrigatórios!');
        return;
    }
    
    const professores = getProfessores();
    const newId = Math.max(...professores.map(p => p.id), 0) + 1;
    
    professores.push({
        id: newId,
        nome: nome,
        escola: escola,
        senha: '123456' // Default password
    });
    saveProfessores(professores);
    
    hideModal('add-teacher-modal');
    document.getElementById('add-teacher-form').reset();
    loadProfessoresTable();
    loadAdminDashboard();
}

function deleteProfessor(id) {
    if (!confirm('Tem certeza que deseja excluir este professor?')) return;
    
    const professores = getProfessores().filter(professor => professor.id !== id);
    saveProfessores(professores);
    
    loadProfessoresTable();
    loadAdminDashboard();
}

// Tournament management
function loadTorneiosList() {
    const torneios = getTorneios();
    const tournamentInstances = getTournamentInstances();
    const container = document.getElementById('tournaments-list');
    
    container.innerHTML = '';
    
    if (tournamentInstances.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>Nenhum torneio criado</h3>
                <p>Crie seu primeiro torneio clicando no botão "Criar Torneio"</p>
            </div>
        `;
        loadTournamentOptions();
        return;
    }
    
    tournamentInstances.forEach(tournament => {
        const torneio = torneios.find(t => t.id === tournament.torneioId);
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="card__body">
                <h3>${torneio ? torneio.nome : 'Torneio desconhecido'}</h3>
                <p><strong>Times:</strong> ${tournament.teams.length}</p>
                <p><strong>Status:</strong> <span class="tournament-status ${tournament.status}">${getStatusText(tournament.status)}</span></p>
                <div class="action-buttons" style="margin-top: 16px;">
                    <button class="btn btn--primary btn--sm" onclick="viewTournament(${tournament.id})">Ver Chaveamento</button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
    
    // Load tournament options for create modal
    loadTournamentOptions();
}

function getStatusText(status) {
    const statusMap = {
        'draft': 'Rascunho',
        'active': 'Ativo',
        'completed': 'Finalizado'
    };
    return statusMap[status] || status;
}

function loadTournamentOptions() {
    const torneios = getTorneios();
    const select = document.getElementById('tournament-name');
    
    if (!select) return;
    
    select.innerHTML = '<option value="">Selecione</option>';
    torneios.forEach(torneio => {
        const option = document.createElement('option');
        option.value = torneio.id;
        option.textContent = torneio.nome;
        select.appendChild(option);
    });
}

function viewTournament(tournamentId) {
    // Switch to tabelas section
    showSection('admin-tabelas');
    // Set the tournament in the select
    const select = document.getElementById('tournament-select');
    if (select) {
        select.value = tournamentId;
        loadTournamentBracket();
    }
}

function handleCreateTournament(e) {
    e.preventDefault();
    const torneioId = parseInt(document.getElementById('tournament-name').value);
    const selectedTeams = Array.from(document.querySelectorAll('#team-selection input[type="checkbox"]:checked'))
        .map(checkbox => parseInt(checkbox.value));
    
    if (!torneioId || selectedTeams.length < 2) {
        alert('Selecione um torneio e pelo menos 2 times!');
        return;
    }
    
    const times = getTimes();
    const teamsData = selectedTeams.map(teamId => times.find(t => t.id === teamId)).filter(Boolean);
    
    const tournamentInstances = getTournamentInstances();
    const newId = Math.max(...tournamentInstances.map(t => t.id), 0) + 1;
    
    const newTournament = {
        id: newId,
        torneioId: torneioId,
        teams: teamsData,
        status: 'active',
        bracket: generateDoubleEliminationBracket(teamsData),
        createdAt: new Date().toISOString()
    };
    
    tournamentInstances.push(newTournament);
    saveTournamentInstances(tournamentInstances);
    
    hideModal('create-tournament-modal');
    document.getElementById('create-tournament-form').reset();
    loadTorneiosList();
}

// Simplified double elimination bracket generation
function generateDoubleEliminationBracket(teams) {
    const numTeams = teams.length;
    const upperBracket = [];
    const lowerBracket = [];
    
    // First round of upper bracket
    const firstRound = [];
    for (let i = 0; i < numTeams; i += 2) {
        if (i + 1 < numTeams) {
            firstRound.push({
                id: `UB-R1-${Math.floor(i/2) + 1}`,
                round: 1,
                bracket: 'upper',
                team1: teams[i],
                team2: teams[i + 1],
                winner: null,
                completed: false
            });
        } else {
            // Odd number of teams - bye
            firstRound.push({
                id: `UB-R1-${Math.floor(i/2) + 1}`,
                round: 1,
                bracket: 'upper',
                team1: teams[i],
                team2: null,
                winner: teams[i].id,
                completed: true
            });
        }
    }
    upperBracket.push(firstRound);
    
    return {
        upper: upperBracket,
        lower: lowerBracket,
        final: {
            id: 'FINAL',
            bracket: 'final',
            team1: null,
            team2: null,
            winner: null,
            completed: false
        }
    };
}

// Tournament display and management
function loadTabelasSection() {
    const tournamentInstances = getTournamentInstances();
    const torneios = getTorneios();
    const select = document.getElementById('tournament-select');
    
    if (!select) return;
    
    select.innerHTML = '<option value="">Selecione um torneio</option>';
    tournamentInstances.forEach(tournament => {
        const torneio = torneios.find(t => t.id === tournament.torneioId);
        const option = document.createElement('option');
        option.value = tournament.id;
        option.textContent = torneio ? torneio.nome : 'Torneio desconhecido';
        select.appendChild(option);
    });
}

function loadTournamentBracket() {
    const tournamentId = parseInt(document.getElementById('tournament-select').value);
    const container = document.getElementById('tournament-bracket');
    
    if (!tournamentId) {
        container.innerHTML = '';
        return;
    }
    
    const tournamentInstances = getTournamentInstances();
    const tournament = tournamentInstances.find(t => t.id === tournamentId);
    
    if (!tournament) {
        container.innerHTML = '<p>Torneio não encontrado</p>';
        return;
    }
    
    container.innerHTML = renderTournamentBracket(tournament);
}

function renderTournamentBracket(tournament) {
    let html = '<div class="tournament-bracket">';
    
    // Upper Bracket
    html += '<div class="bracket-section">';
    html += '<h3>Upper Bracket (Chave Principal)</h3>';
    
    tournament.bracket.upper.forEach((round, roundIndex) => {
        html += `<div class="bracket-round">`;
        html += `<h4>Rodada ${roundIndex + 1}</h4>`;
        
        round.forEach(match => {
            html += renderMatchCard(match);
        });
        
        html += '</div>';
    });
    html += '</div>';
    
    // Final
    html += '<div class="bracket-section">';
    html += '<h3>Grande Final</h3>';
    html += renderMatchCard(tournament.bracket.final);
    html += '</div>';
    
    html += '</div>';
    
    return html;
}

function renderMatchCard(match) {
    const team1Name = match.team1 ? match.team1.nome : 'TBD';
    const team2Name = match.team2 ? match.team2.nome : 'TBD';
    const winnerClass1 = match.winner && match.winner === match.team1?.id ? 'winner' : '';
    const winnerClass2 = match.winner && match.winner === match.team2?.id ? 'winner' : '';
    
    return `
        <div class="match-card">
            <div class="match-teams">
                <div class="match-team ${winnerClass1}">${team1Name}</div>
                <div class="match-team ${winnerClass2}">${team2Name}</div>
            </div>
            <div class="match-actions">
                ${match.team1 && match.team2 && !match.completed && currentUserType === 'admin' ? 
                    `<button class="btn btn--sm btn--primary" onclick="setMatchResult('${match.id}')">Resultado</button>` 
                    : ''}
                ${match.completed ? '<span class="status status--success">Finalizado</span>' : ''}
            </div>
        </div>
    `;
}

// Resources management
function loadRecursosAdmin() {
    const recursos = getRecursos();
    const professores = getProfessores();
    const container = document.getElementById('resources-list');
    
    if (!container) return;
    
    if (recursos.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>Nenhum recurso enviado</h3>
                <p>Os recursos enviados pelos professores aparecerão aqui</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    recursos.forEach(recurso => {
        const professor = professores.find(p => p.id === recurso.professorId);
        const card = document.createElement('div');
        card.className = 'resource-card';
        card.innerHTML = `
            <div class="resource-header">
                <div class="resource-type">${recurso.tipo}</div>
                <div class="resource-status ${recurso.status}">${recurso.status === 'pending' ? 'Pendente' : 'Resolvido'}</div>
            </div>
            <div class="resource-description">${recurso.descricao}</div>
            <div class="resource-meta">
                <span><strong>Professor:</strong> ${professor ? professor.nome : 'Professor não encontrado'}</span>
                <span><strong>Data:</strong> ${new Date(recurso.createdAt).toLocaleDateString('pt-BR')}</span>
            </div>
            ${recurso.status === 'pending' ? `
                <div style="margin-top: 16px;">
                    <button class="btn btn--success btn--sm" onclick="resolveResource(${recurso.id})">Marcar como Resolvido</button>
                </div>
            ` : ''}
        `;
        container.appendChild(card);
    });
}

function resolveResource(id) {
    const recursos = getRecursos();
    const resourceIndex = recursos.findIndex(r => r.id === id);
    
    if (resourceIndex !== -1) {
        recursos[resourceIndex].status = 'resolved';
        recursos[resourceIndex].resolvedAt = new Date().toISOString();
        saveRecursos(recursos);
        loadRecursosAdmin();
    }
}

function loadProfessorRecursos() {
    const recursos = getRecursos().filter(r => r.professorId === currentUser.id);
    const container = document.getElementById('professor-resources-list');
    
    if (!container) return;
    
    if (recursos.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>Nenhum recurso enviado</h3>
                <p>Você ainda não enviou nenhum recurso</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    recursos.forEach(recurso => {
        const card = document.createElement('div');
        card.className = 'resource-card';
        card.innerHTML = `
            <div class="resource-header">
                <div class="resource-type">${recurso.tipo}</div>
                <div class="resource-status ${recurso.status}">${recurso.status === 'pending' ? 'Pendente' : 'Resolvido'}</div>
            </div>
            <div class="resource-description">${recurso.descricao}</div>
            <div class="resource-meta">
                <span><strong>Data:</strong> ${new Date(recurso.createdAt).toLocaleDateString('pt-BR')}</span>
                ${recurso.resolvedAt ? `<span><strong>Resolvido em:</strong> ${new Date(recurso.resolvedAt).toLocaleDateString('pt-BR')}</span>` : ''}
            </div>
        `;
        container.appendChild(card);
    });
}

function handleAddResource(e) {
    e.preventDefault();
    const tipo = document.getElementById('resource-type').value;
    const descricao = document.getElementById('resource-description').value.trim();
    
    if (!tipo || !descricao) {
        alert('Todos os campos são obrigatórios!');
        return;
    }
    
    const recursos = getRecursos();
    const newId = Math.max(...recursos.map(r => r.id), 0) + 1;
    
    recursos.push({
        id: newId,
        professorId: currentUser.id,
        tipo: tipo,
        descricao: descricao,
        status: 'pending',
        createdAt: new Date().toISOString()
    });
    saveRecursos(recursos);
    
    hideModal('add-resource-modal');
    document.getElementById('add-resource-form').reset();
    loadProfessorRecursos();
    loadProfessorDashboard();
}

// Professor views
function loadProfessorTimes() {
    const times = getTimes().filter(time => time.escola === currentUser.escola);
    const container = document.getElementById('professor-teams-list');
    
    if (!container) return;
    
    if (times.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>Nenhum time cadastrado</h3>
                <p>Sua escola ainda não possui times cadastrados</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    times.forEach(time => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="card__body">
                <h3>${time.nome}</h3>
                <p><strong>Modalidade:</strong> ${time.modalidade}</p>
                <p><strong>Categoria:</strong> ${time.categoria}</p>
            </div>
        `;
        container.appendChild(card);
    });
}

function loadProfessorTorneios() {
    const tournamentInstances = getTournamentInstances();
    const torneios = getTorneios();
    const container = document.getElementById('professor-tournaments-list');
    
    if (!container) return;
    
    // Find tournaments where professor's teams participate
    const participatingTournaments = tournamentInstances.filter(tournament => 
        tournament.teams.some(team => team.escola === currentUser.escola)
    );
    
    if (participatingTournaments.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>Nenhum torneio ativo</h3>
                <p>Seus times ainda não estão participando de nenhum torneio</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    participatingTournaments.forEach(tournament => {
        const torneio = torneios.find(t => t.id === tournament.torneioId);
        const myTeams = tournament.teams.filter(team => team.escola === currentUser.escola);
        
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="card__body">
                <h3>${torneio ? torneio.nome : 'Torneio desconhecido'}</h3>
                <p><strong>Meus times:</strong> ${myTeams.map(team => team.nome).join(', ')}</p>
                <p><strong>Total de times:</strong> ${tournament.teams.length}</p>
                <p><strong>Status:</strong> <span class="tournament-status ${tournament.status}">${getStatusText(tournament.status)}</span></p>
            </div>
        `;
        container.appendChild(card);
    });
}

// Modal management
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Mobile sidebar toggle
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.classList.toggle('open');
    }
}

// Logout
function logout() {
    currentUser = null;
    currentUserType = null;
    currentSection = 'dashboard';
    showLoginSelection();
}

// Team selection for tournaments
function updateTeamSelection() {
    const torneioId = parseInt(document.getElementById('tournament-name').value);
    const container = document.getElementById('team-selection');
    
    if (!container) return;
    
    if (!torneioId) {
        container.innerHTML = '';
        return;
    }
    
    const torneios = getTorneios();
    const times = getTimes();
    const torneio = torneios.find(t => t.id === torneioId);
    
    if (!torneio) {
        container.innerHTML = '<p>Torneio não encontrado</p>';
        return;
    }
    
    // Filter teams by tournament category and modality
    const [modalidade, categoria] = torneio.sigla.split(' - ');
    const eligibleTeams = times.filter(time => {
        const timeModalidade = time.modalidade.includes('Futsal') ? 
            (time.modalidade.includes('Masculino') ? 'F.MASC' : 'F.FEM') :
            (time.modalidade.includes('Masculino') ? 'Q.MASC' : 'Q.FEM');
        return timeModalidade === modalidade && time.categoria === categoria;
    });
    
    if (eligibleTeams.length === 0) {
        container.innerHTML = '<p>Nenhum time elegível encontrado para este torneio</p>';
        return;
    }
    
    const escolas = getEscolas();
    container.innerHTML = '';
    
    eligibleTeams.forEach(time => {
        const escola = escolas.find(e => e.id === time.escola);
        const checkbox = document.createElement('div');
        checkbox.className = 'team-checkbox';
        checkbox.innerHTML = `
            <input type="checkbox" value="${time.id}" id="team-${time.id}">
            <label for="team-${time.id}">${time.nome} (${escola ? escola.nome : 'Escola não encontrada'})</label>
        `;
        container.appendChild(checkbox);
    });
}

// Event listeners setup
function setupEventListeners() {
    // Login forms
    const adminLoginForm = document.getElementById('admin-login-form');
    const professorLoginForm = document.getElementById('professor-login-form');
    
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', handleAdminLogin);
    }
    if (professorLoginForm) {
        professorLoginForm.addEventListener('submit', handleProfessorLogin);
    }
    
    // CRUD forms
    const forms = [
        { id: 'add-school-form', handler: handleAddSchool },
        { id: 'add-team-form', handler: handleAddTeam },
        { id: 'add-teacher-form', handler: handleAddTeacher },
        { id: 'create-tournament-form', handler: handleCreateTournament },
        { id: 'add-resource-form', handler: handleAddResource }
    ];
    
    forms.forEach(({ id, handler }) => {
        const form = document.getElementById(id);
        if (form) {
            form.addEventListener('submit', handler);
        }
    });
    
    // Tournament selection change
    const tournamentNameSelect = document.getElementById('tournament-name');
    if (tournamentNameSelect) {
        tournamentNameSelect.addEventListener('change', updateTeamSelection);
    }
    
    // Close modals when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    });
    
    // Mobile menu
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.sidebar') && !e.target.closest('.mobile-menu-toggle')) {
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) {
                sidebar.classList.remove('open');
            }
        }
    });
}

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    try {
        initializeData();
        setupEventListeners();
        showLoginSelection();
    } catch (error) {
        console.error('Error initializing application:', error);
    }
});