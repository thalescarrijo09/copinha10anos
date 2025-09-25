// Sistema de Competições Escolares Municipais
class CompetitionSystem {
    constructor() {
        this.currentUser = null;
        this.currentPage = 'dashboard';
        this.initializeData();
        this.bindEvents();
        this.hideLoading(); // Esconder loading imediatamente
        this.checkAuth();
    }

    initializeData() {
        // Dados iniciais do sistema
        const initialData = {
            escolas: [
                {id: 1, nome: "EM Juarez Távora de Carvalho", endereco: "Endereço não informado", contato: ""},
                {id: 2, nome: "EM Mª Aparecida de Almeida Paniago", endereco: "Endereço não informado", contato: ""},
                {id: 3, nome: "EM Padre Maximino Alvarez Gutierrez", endereco: "Endereço não informado", contato: ""},
                {id: 4, nome: "EM Dom Bosco", endereco: "Endereço não informado", contato: ""},
                {id: 5, nome: "EM Tonico Corredeira", endereco: "Endereço não informado", contato: ""},
                {id: 6, nome: "EM Sto. Antônio", endereco: "Endereço não informado", contato: ""},
                {id: 7, nome: "EM Reverendo Eudóxio", endereco: "Endereço não informado", contato: ""},
                {id: 8, nome: "EM Professor Salviano Neves Amorim", endereco: "Endereço não informado", contato: ""},
                {id: 9, nome: "EM Otalecio Alves Irineu", endereco: "Endereço não informado", contato: ""},
                {id: 10, nome: "EM Mª Eduarda Condinho Filgueiras", endereco: "Endereço não informado", contato: ""},
                {id: 11, nome: "EM Elias Carrijo de Sousa", endereco: "Endereço não informado", contato: ""},
                {id: 12, nome: "EM Comecinho de Vida Mirian de Rezende", endereco: "Endereço não informado", contato: ""},
                {id: 13, nome: "EM Castelo Branco", endereco: "Endereço não informado", contato: ""}
            ],
            professores: [
                {id: 1, nome: "Cristiane Pereira", email: "cristiane.pereira@educacao.go.gov.br", escolas: [1, 2], ativo: true},
                {id: 2, nome: "Cristiane Alves", email: "cristiane.alves@educacao.go.gov.br", escolas: [3], ativo: true},
                {id: 3, nome: "Lindonei Junior", email: "lindonei.junior@educacao.go.gov.br", escolas: [4, 5], ativo: true},
                {id: 4, nome: "Alberto", email: "alberto@educacao.go.gov.br", escolas: [6], ativo: true},
                {id: 5, nome: "Ana Mireile", email: "ana.mireile@educacao.go.gov.br", escolas: [7, 8], ativo: true},
                {id: 6, nome: "Daiana", email: "daiana@educacao.go.gov.br", escolas: [9], ativo: true},
                {id: 7, nome: "Domingos", email: "domingos@educacao.go.gov.br", escolas: [10], ativo: true},
                {id: 8, nome: "Hugo", email: "hugo@educacao.go.gov.br", escolas: [11], ativo: true},
                {id: 9, nome: "Lorena", email: "lorena@educacao.go.gov.br", escolas: [12], ativo: true},
                {id: 10, nome: "Poliane Vilela", email: "poliane.vilela@educacao.go.gov.br", escolas: [13], ativo: true},
                {id: 11, nome: "Ana Paula", email: "ana.paula@educacao.go.gov.br", escolas: [1, 3], ativo: true},
                {id: 12, nome: "Fernando", email: "fernando@educacao.go.gov.br", escolas: [2, 4], ativo: true},
                {id: 13, nome: "Mariany", email: "mariany@educacao.go.gov.br", escolas: [5, 6], ativo: true}
            ],
            torneios: [
                {id: "f-masc-sub11", nome: "Futsal Masculino - Sub11", categoria: "Sub11", modalidade: "Futsal", genero: "Masculino", ativo: true, times: [], bracket: null},
                {id: "f-fem-sub11", nome: "Futsal Feminino - Sub11", categoria: "Sub11", modalidade: "Futsal", genero: "Feminino", ativo: true, times: [], bracket: null},
                {id: "f-masc-sub09", nome: "Futsal Masculino - Sub09", categoria: "Sub09", modalidade: "Futsal", genero: "Masculino", ativo: true, times: [], bracket: null},
                {id: "q-fem-sub11", nome: "Queimada Feminina - Sub11", categoria: "Sub11", modalidade: "Queimada", genero: "Feminino", ativo: true, times: [], bracket: null},
                {id: "q-masc-sub11", nome: "Queimada Masculina - Sub11", categoria: "Sub11", modalidade: "Queimada", genero: "Masculino", ativo: true, times: [], bracket: null},
                {id: "q-fem-sub09", nome: "Queimada Feminina - Sub09", categoria: "Sub09", modalidade: "Queimada", genero: "Feminino", ativo: true, times: [], bracket: null}
            ],
            times: [
                {id: 1, nome: "Time Futsal Masculino - Juarez Távora", escolaId: 1, modalidade: "Futsal", genero: "Masculino", categoria: "Sub11", professorId: 1, ativo: true},
                {id: 2, nome: "Time Queimada Feminina - Dom Bosco", escolaId: 4, modalidade: "Queimada", genero: "Feminino", categoria: "Sub11", professorId: 3, ativo: true},
                {id: 3, nome: "Time Futsal Feminino - Sto. Antônio", escolaId: 6, modalidade: "Futsal", genero: "Feminino", categoria: "Sub09", professorId: 4, ativo: true}
            ],
            recursos: [
                {id: 1, professorId: 1, assunto: "Erro na classificação", descricao: "Preciso verificar a pontuação do meu time no torneio de futsal.", status: "aberto", data: new Date().toISOString(), resposta: null},
                {id: 2, professorId: 3, assunto: "Solicitação de remarcação", descricao: "Gostaria de solicitar remarcação de partida devido a problemas de transporte.", status: "analise", data: new Date(Date.now() - 86400000).toISOString(), resposta: null}
            ],
            usuarios: [
                {email: "admin@mineiros.go.gov.br", password: "admin123", type: "admin", nome: "Administrador"},
                {email: "cristiane.pereira@educacao.go.gov.br", password: "prof123", type: "professor", nome: "Cristiane Pereira", professorId: 1}
            ]
        };

        // Inicializar dados se não existirem
        Object.keys(initialData).forEach(key => {
            if (!localStorage.getItem(key)) {
                localStorage.setItem(key, JSON.stringify(initialData[key]));
            }
        });
    }

    bindEvents() {
        // Login
        document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
        
        // Modal
        document.getElementById('modalClose').addEventListener('click', () => this.closeModal());
        document.getElementById('modal').addEventListener('click', (e) => {
            if (e.target.id === 'modal') this.closeModal();
        });
    }

    hideLoading() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.classList.add('hidden');
        }
    }

    showLoading() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.classList.remove('hidden');
        }
    }

    checkAuth() {
        const user = localStorage.getItem('currentUser');
        if (user) {
            this.currentUser = JSON.parse(user);
            this.showMainApp();
        } else {
            this.showLogin();
        }
    }

    handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const userType = document.getElementById('userType').value;

        const usuarios = JSON.parse(localStorage.getItem('usuarios'));
        const user = usuarios.find(u => u.email === email && u.password === password && u.type === userType);

        if (user) {
            this.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.showMessage('Login realizado com sucesso!', 'success');
            setTimeout(() => this.showMainApp(), 1000);
        } else {
            this.showMessage('Credenciais inválidas!', 'error');
        }
    }

    logout() {
        localStorage.removeItem('currentUser');
        this.currentUser = null;
        this.showLogin();
    }

    showLogin() {
        document.getElementById('loginContainer').classList.remove('hidden');
        document.getElementById('mainApp').classList.add('hidden');
    }

    showMainApp() {
        document.getElementById('loginContainer').classList.add('hidden');
        document.getElementById('mainApp').classList.remove('hidden');
        this.setupNavigation();
        this.updateUserInfo();
        this.navigateTo('dashboard');
    }

    setupNavigation() {
        const navMenu = document.getElementById('navMenu');
        let menuItems = [];

        if (this.currentUser.type === 'admin') {
            menuItems = [
                {id: 'dashboard', text: 'Dashboard'},
                {id: 'escolas', text: 'Escolas'},
                {id: 'times', text: 'Times'},
                {id: 'professores', text: 'Professores'},
                {id: 'torneios', text: 'Torneios'},
                {id: 'resultados', text: 'Resultados'},
                {id: 'recursos', text: 'Recursos'}
            ];
        } else {
            menuItems = [
                {id: 'dashboard', text: 'Dashboard'},
                {id: 'escolas', text: 'Minhas Escolas'},
                {id: 'times', text: 'Meus Times'},
                {id: 'torneios', text: 'Torneios'},
                {id: 'resultados', text: 'Tabelas'},
                {id: 'recursos', text: 'Recursos'}
            ];
        }

        navMenu.innerHTML = menuItems.map(item => 
            `<li><a href="#" data-page="${item.id}">${item.text}</a></li>`
        ).join('');

        navMenu.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                e.preventDefault();
                const page = e.target.dataset.page;
                this.navigateTo(page);
            }
        });
    }

    updateUserInfo() {
        document.getElementById('userInfo').textContent = 
            `${this.currentUser.nome} (${this.currentUser.type === 'admin' ? 'Administrador' : 'Professor'})`;
    }

    navigateTo(page) {
        this.currentPage = page;
        document.querySelectorAll('.nav-menu a').forEach(a => a.classList.remove('active'));
        const activeLink = document.querySelector(`[data-page="${page}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
        
        this.updateBreadcrumb(page);
        this.loadPageContent(page);
    }

    updateBreadcrumb(page) {
        const breadcrumb = document.getElementById('breadcrumb');
        const pageNames = {
            dashboard: 'Dashboard',
            escolas: this.currentUser.type === 'admin' ? 'Escolas' : 'Minhas Escolas',
            times: this.currentUser.type === 'admin' ? 'Times' : 'Meus Times',
            professores: 'Professores',
            torneios: 'Torneios',
            resultados: this.currentUser.type === 'admin' ? 'Resultados' : 'Tabelas',
            recursos: 'Recursos'
        };
        breadcrumb.innerHTML = `<span>${pageNames[page]}</span>`;
    }

    loadPageContent(page) {
        const contentArea = document.getElementById('contentArea');
        
        switch(page) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'escolas':
                this.loadEscolas();
                break;
            case 'times':
                this.loadTimes();
                break;
            case 'professores':
                this.loadProfessores();
                break;
            case 'torneios':
                this.loadTorneios();
                break;
            case 'resultados':
                this.loadResultados();
                break;
            case 'recursos':
                this.loadRecursos();
                break;
        }
    }

    loadDashboard() {
        const escolas = JSON.parse(localStorage.getItem('escolas'));
        const professores = JSON.parse(localStorage.getItem('professores'));
        const times = JSON.parse(localStorage.getItem('times'));
        const torneios = JSON.parse(localStorage.getItem('torneios'));
        const recursos = JSON.parse(localStorage.getItem('recursos'));

        let stats = [];
        let recentRecursos = recursos.slice(-5);

        if (this.currentUser.type === 'admin') {
            stats = [
                {title: escolas.length, label: 'Escolas'},
                {title: times.length, label: 'Times'},
                {title: professores.filter(p => p.ativo).length, label: 'Professores'},
                {title: torneios.filter(t => t.ativo).length, label: 'Torneios Ativos'}
            ];
        } else {
            const professor = professores.find(p => p.id === this.currentUser.professorId);
            const minhasEscolas = professor ? professor.escolas.length : 0;
            const meusTimes = times.filter(t => professor && professor.escolas.includes(t.escolaId)).length;
            
            stats = [
                {title: minhasEscolas, label: 'Minhas Escolas'},
                {title: meusTimes, label: 'Meus Times'},
                {title: torneios.filter(t => t.ativo).length, label: 'Torneios Ativos'},
                {title: recursos.filter(r => r.professorId === this.currentUser.professorId).length, label: 'Meus Recursos'}
            ];
        }

        document.getElementById('contentArea').innerHTML = `
            <div class="dashboard">
                <div class="stats-grid">
                    ${stats.map(stat => `
                        <div class="stat-card">
                            <h3>${stat.title}</h3>
                            <p>${stat.label}</p>
                        </div>
                    `).join('')}
                </div>
                
                ${recentRecursos.length > 0 ? `
                <div class="card">
                    <div class="card__body">
                        <h3>Recursos Recentes</h3>
                        <div class="table-container">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Professor</th>
                                        <th>Assunto</th>
                                        <th>Status</th>
                                        <th>Data</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${recentRecursos.map(recurso => {
                                        const professor = professores.find(p => p.id === recurso.professorId);
                                        return `
                                            <tr>
                                                <td>${professor ? professor.nome : 'N/A'}</td>
                                                <td>${recurso.assunto}</td>
                                                <td><span class="status-badge ${recurso.status}">${recurso.status}</span></td>
                                                <td>${new Date(recurso.data).toLocaleDateString('pt-BR')}</td>
                                            </tr>
                                        `;
                                    }).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                ` : ''}
            </div>
        `;
    }

    loadEscolas() {
        const escolas = JSON.parse(localStorage.getItem('escolas'));
        let escolasToShow = escolas;

        if (this.currentUser.type === 'professor') {
            const professores = JSON.parse(localStorage.getItem('professores'));
            const professor = professores.find(p => p.id === this.currentUser.professorId);
            if (professor) {
                escolasToShow = escolas.filter(e => professor.escolas.includes(e.id));
            }
        }

        document.getElementById('contentArea').innerHTML = `
            <div>
                ${this.currentUser.type === 'admin' ? `
                    <div class="flex justify-between items-center" style="margin-bottom: 2rem;">
                        <h2>Gerenciar Escolas</h2>
                        <button class="btn btn--primary" onclick="app.openEscolaModal()">Nova Escola</button>
                    </div>
                ` : '<h2>Minhas Escolas</h2>'}
                
                <div class="grid grid-3">
                    ${escolasToShow.map(escola => `
                        <div class="entity-card">
                            <h3>${escola.nome}</h3>
                            <p><strong>Endereço:</strong> ${escola.endereco}</p>
                            <p><strong>Contato:</strong> ${escola.contato || 'Não informado'}</p>
                            ${this.currentUser.type === 'admin' ? `
                                <div class="card-actions">
                                    <button class="btn btn--sm btn--secondary" onclick="app.editEscola(${escola.id})">Editar</button>
                                    <button class="btn btn--sm btn--danger" onclick="app.deleteEscola(${escola.id})">Excluir</button>
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    loadTimes() {
        const times = JSON.parse(localStorage.getItem('times'));
        const escolas = JSON.parse(localStorage.getItem('escolas'));
        const professores = JSON.parse(localStorage.getItem('professores'));
        
        let timesToShow = times;

        if (this.currentUser.type === 'professor') {
            const professor = professores.find(p => p.id === this.currentUser.professorId);
            if (professor) {
                timesToShow = times.filter(t => professor.escolas.includes(t.escolaId));
            }
        }

        document.getElementById('contentArea').innerHTML = `
            <div>
                ${this.currentUser.type === 'admin' ? `
                    <div class="flex justify-between items-center" style="margin-bottom: 2rem;">
                        <h2>Gerenciar Times</h2>
                        <button class="btn btn--primary" onclick="app.showMessage('Funcionalidade em desenvolvimento', 'error')">Novo Time</button>
                    </div>
                ` : '<h2>Meus Times</h2>'}
                
                <div class="grid grid-3">
                    ${timesToShow.map(time => {
                        const escola = escolas.find(e => e.id === time.escolaId);
                        const professor = professores.find(p => p.id === time.professorId);
                        return `
                            <div class="entity-card">
                                <h3>${time.nome}</h3>
                                <p><strong>Escola:</strong> ${escola ? escola.nome : 'N/A'}</p>
                                <p><strong>Modalidade:</strong> ${time.modalidade} ${time.genero}</p>
                                <p><strong>Categoria:</strong> ${time.categoria}</p>
                                <p><strong>Professor:</strong> ${professor ? professor.nome : 'N/A'}</p>
                                <p><strong>Status:</strong> ${time.ativo ? 'Ativo' : 'Inativo'}</p>
                                ${this.currentUser.type === 'admin' ? `
                                    <div class="card-actions">
                                        <button class="btn btn--sm btn--secondary" onclick="app.showMessage('Funcionalidade em desenvolvimento', 'error')">Editar</button>
                                        <button class="btn btn--sm btn--danger" onclick="app.showMessage('Funcionalidade em desenvolvimento', 'error')">Excluir</button>
                                    </div>
                                ` : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    loadProfessores() {
        if (this.currentUser.type !== 'admin') return;

        const professores = JSON.parse(localStorage.getItem('professores'));
        const escolas = JSON.parse(localStorage.getItem('escolas'));

        document.getElementById('contentArea').innerHTML = `
            <div>
                <div class="flex justify-between items-center" style="margin-bottom: 2rem;">
                    <h2>Gerenciar Professores</h2>
                    <button class="btn btn--primary" onclick="app.showMessage('Funcionalidade em desenvolvimento', 'error')">Novo Professor</button>
                </div>
                
                <div class="table-container">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Email</th>
                                <th>Escolas Vinculadas</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${professores.map(professor => `
                                <tr>
                                    <td>${professor.nome}</td>
                                    <td>${professor.email}</td>
                                    <td>${professor.escolas.map(escolaId => {
                                        const escola = escolas.find(e => e.id === escolaId);
                                        return escola ? escola.nome : 'N/A';
                                    }).join(', ')}</td>
                                    <td><span class="status-badge ${professor.ativo ? 'resolvido' : 'aberto'}">${professor.ativo ? 'Ativo' : 'Inativo'}</span></td>
                                    <td>
                                        <button class="btn btn--sm btn--secondary" onclick="app.showMessage('Funcionalidade em desenvolvimento', 'error')">Editar</button>
                                        <button class="btn btn--sm btn--danger" onclick="app.showMessage('Funcionalidade em desenvolvimento', 'error')">Excluir</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    loadTorneios() {
        const torneios = JSON.parse(localStorage.getItem('torneios'));
        
        document.getElementById('contentArea').innerHTML = `
            <div>
                <h2>Torneios Disponíveis</h2>
                
                <div class="grid grid-2">
                    ${torneios.map(torneio => `
                        <div class="entity-card">
                            <h3>${torneio.nome}</h3>
                            <p><strong>Modalidade:</strong> ${torneio.modalidade}</p>
                            <p><strong>Categoria:</strong> ${torneio.categoria}</p>
                            <p><strong>Gênero:</strong> ${torneio.genero}</p>
                            <p><strong>Times Inscritos:</strong> ${torneio.times.length}</p>
                            <p><strong>Status:</strong> ${torneio.ativo ? 'Ativo' : 'Inativo'}</p>
                            ${this.currentUser.type === 'admin' ? `
                                <div class="card-actions">
                                    <button class="btn btn--sm btn--primary" onclick="app.showMessage('Funcionalidade em desenvolvimento', 'error')">Gerenciar</button>
                                    <button class="btn btn--sm btn--accent" onclick="app.showMessage('Funcionalidade em desenvolvimento', 'error')">Ver Chaveamento</button>
                                </div>
                            ` : `
                                <div class="card-actions">
                                    <button class="btn btn--sm btn--primary" onclick="app.showMessage('Funcionalidade em desenvolvimento', 'error')">Ver Chaveamento</button>
                                </div>
                            `}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    loadResultados() {
        const torneios = JSON.parse(localStorage.getItem('torneios'));
        const times = JSON.parse(localStorage.getItem('times'));
        
        document.getElementById('contentArea').innerHTML = `
            <div>
                <h2>${this.currentUser.type === 'admin' ? 'Gerenciar Resultados' : 'Tabelas e Resultados'}</h2>
                
                ${torneios.filter(t => t.times.length > 0).map(torneio => `
                    <div class="card" style="margin-bottom: 2rem;">
                        <div class="card__body">
                            <h3>${torneio.nome}</h3>
                            ${this.renderClassificacao(torneio, times)}
                        </div>
                    </div>
                `).join('')}
                
                ${torneios.filter(t => t.times.length > 0).length === 0 ? '<p>Nenhum torneio com times cadastrados encontrado.</p>' : ''}
            </div>
        `;
    }

    renderClassificacao(torneio, times) {
        if (torneio.times.length === 0) {
            return '<p>Nenhum time inscrito neste torneio.</p>';
        }

        // Simular uma classificação básica
        const timesTorneio = torneio.times.map(timeId => {
            const time = times.find(t => t.id === timeId);
            return {
                ...time,
                vitorias: Math.floor(Math.random() * 5),
                derrotas: Math.floor(Math.random() * 3),
                pontos: Math.floor(Math.random() * 15)
            };
        }).sort((a, b) => b.pontos - a.pontos);

        return `
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Pos.</th>
                            <th>Time</th>
                            <th>Vitórias</th>
                            <th>Derrotas</th>
                            <th>Pontos</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${timesTorneio.map((time, index) => `
                            <tr>
                                <td>${index + 1}º</td>
                                <td>${time ? time.nome : 'N/A'}</td>
                                <td>${time.vitorias}</td>
                                <td>${time.derrotas}</td>
                                <td><strong>${time.pontos}</strong></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    loadRecursos() {
        const recursos = JSON.parse(localStorage.getItem('recursos'));
        const professores = JSON.parse(localStorage.getItem('professores'));
        
        let recursosToShow = recursos;
        if (this.currentUser.type === 'professor') {
            recursosToShow = recursos.filter(r => r.professorId === this.currentUser.professorId);
        }

        document.getElementById('contentArea').innerHTML = `
            <div>
                <div class="flex justify-between items-center" style="margin-bottom: 2rem;">
                    <h2>Recursos e Solicitações</h2>
                    <button class="btn btn--primary" onclick="app.openRecursoModal()">
                        ${this.currentUser.type === 'admin' ? 'Novo Recurso' : 'Abrir Solicitação'}
                    </button>
                </div>
                
                <div class="table-container">
                    <table class="table">
                        <thead>
                            <tr>
                                ${this.currentUser.type === 'admin' ? '<th>Professor</th>' : ''}
                                <th>Assunto</th>
                                <th>Descrição</th>
                                <th>Status</th>
                                <th>Data</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${recursosToShow.map(recurso => {
                                const professor = professores.find(p => p.id === recurso.professorId);
                                return `
                                    <tr>
                                        ${this.currentUser.type === 'admin' ? `<td>${professor ? professor.nome : 'N/A'}</td>` : ''}
                                        <td>${recurso.assunto}</td>
                                        <td>${recurso.descricao.substring(0, 50)}${recurso.descricao.length > 50 ? '...' : ''}</td>
                                        <td><span class="status-badge ${recurso.status}">${recurso.status}</span></td>
                                        <td>${new Date(recurso.data).toLocaleDateString('pt-BR')}</td>
                                        <td>
                                            <button class="btn btn--sm btn--secondary" onclick="app.showMessage('Funcionalidade em desenvolvimento', 'error')">Ver</button>
                                            ${this.currentUser.type === 'admin' ? `
                                                <button class="btn btn--sm btn--success" onclick="app.showMessage('Funcionalidade em desenvolvimento', 'error')">Responder</button>
                                            ` : ''}
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    // Modal Functions
    openModal(title, content) {
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalBody').innerHTML = content;
        document.getElementById('modal').classList.remove('hidden');
    }

    closeModal() {
        document.getElementById('modal').classList.add('hidden');
    }

    openEscolaModal(escolaId = null) {
        const escolas = JSON.parse(localStorage.getItem('escolas'));
        const escola = escolaId ? escolas.find(e => e.id === escolaId) : null;
        
        this.openModal(
            escola ? 'Editar Escola' : 'Nova Escola',
            `
                <form id="escolaForm">
                    <div class="form-group">
                        <label class="form-label">Nome da Escola</label>
                        <input type="text" class="form-control" name="nome" value="${escola ? escola.nome : ''}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Endereço</label>
                        <input type="text" class="form-control" name="endereco" value="${escola ? escola.endereco : ''}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Contato</label>
                        <input type="text" class="form-control" name="contato" value="${escola ? escola.contato : ''}">
                    </div>
                    <button type="submit" class="btn btn--primary">${escola ? 'Atualizar' : 'Criar'}</button>
                </form>
            `
        );

        document.getElementById('escolaForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveEscola(escolaId, new FormData(e.target));
        });
    }

    saveEscola(escolaId, formData) {
        const escolas = JSON.parse(localStorage.getItem('escolas'));
        const escolaData = {
            nome: formData.get('nome'),
            endereco: formData.get('endereco'),
            contato: formData.get('contato')
        };

        if (escolaId) {
            const index = escolas.findIndex(e => e.id === escolaId);
            escolas[index] = { ...escolas[index], ...escolaData };
        } else {
            const newId = Math.max(...escolas.map(e => e.id)) + 1;
            escolas.push({ id: newId, ...escolaData });
        }

        localStorage.setItem('escolas', JSON.stringify(escolas));
        this.closeModal();
        this.loadEscolas();
        this.showMessage('Escola salva com sucesso!', 'success');
    }

    editEscola(id) {
        this.openEscolaModal(id);
    }

    deleteEscola(id) {
        if (confirm('Tem certeza que deseja excluir esta escola?')) {
            const escolas = JSON.parse(localStorage.getItem('escolas'));
            const filtered = escolas.filter(e => e.id !== id);
            localStorage.setItem('escolas', JSON.stringify(filtered));
            this.loadEscolas();
            this.showMessage('Escola excluída com sucesso!', 'success');
        }
    }

    openRecursoModal() {
        this.openModal(
            'Nova Solicitação',
            `
                <form id="recursoForm">
                    <div class="form-group">
                        <label class="form-label">Assunto</label>
                        <input type="text" class="form-control" name="assunto" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Descrição</label>
                        <textarea class="form-control" name="descricao" rows="4" required></textarea>
                    </div>
                    <button type="submit" class="btn btn--primary">Enviar Solicitação</button>
                </form>
            `
        );

        document.getElementById('recursoForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveRecurso(new FormData(e.target));
        });
    }

    saveRecurso(formData) {
        const recursos = JSON.parse(localStorage.getItem('recursos'));
        const newId = recursos.length > 0 ? Math.max(...recursos.map(r => r.id)) + 1 : 1;
        
        const newRecurso = {
            id: newId,
            professorId: this.currentUser.professorId || 1,
            assunto: formData.get('assunto'),
            descricao: formData.get('descricao'),
            status: 'aberto',
            data: new Date().toISOString(),
            resposta: null
        };

        recursos.push(newRecurso);
        localStorage.setItem('recursos', JSON.stringify(recursos));
        this.closeModal();
        this.loadRecursos();
        this.showMessage('Solicitação enviada com sucesso!', 'success');
    }

    showMessage(text, type) {
        // Criar elemento de mensagem temporário
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = text;
        messageDiv.style.position = 'fixed';
        messageDiv.style.top = '20px';
        messageDiv.style.right = '20px';
        messageDiv.style.zIndex = '9999';
        messageDiv.style.maxWidth = '300px';
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            document.body.removeChild(messageDiv);
        }, 3000);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.app = new CompetitionSystem();
});