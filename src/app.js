/**
 * Projeto Federal - Application Logic
 * Pure JavaScript (Vanilla JS)
 */

class StudyApp {
    constructor() {
        console.log("Projeto Federal: Initializing App...");
        
        // State FIRST
        this.subjects = JSON.parse(localStorage.getItem('pf_subjects')) || [];
        this.history = JSON.parse(localStorage.getItem('pf_history')) || [];
        this.mockExams = JSON.parse(localStorage.getItem('pf_mock_exams')) || [];
        this.planning = JSON.parse(localStorage.getItem('pf_planning')) || null;
        this.settings = JSON.parse(localStorage.getItem('pf_settings')) || {
            autoRecalculatePlanning: false,
            autoFollowPlanning: true
        };
        this.timer = JSON.parse(localStorage.getItem('pf_timer')) || {
            seconds: 0,
            running: false,
            lastUpdate: null,
            currentTaskIndex: null
        };
        this.timerInterval = null;
        this.parsedData = null;
        this.currentMockDisciplines = [];
        this.deferredPrompt = null;

        // DOM Elements
        this.initElements();
        this.initEventListeners();

        // Initial Render
        this.renderAll();
        console.log("Projeto Federal: App Ready.");
    }

    initElements() {
        // Layout
        this.sidebar = document.getElementById('sidebar');
        this.sidebarOverlay = document.getElementById('sidebarOverlay');
        this.toggleSidebarBtn = document.getElementById('toggleSidebar');
        this.mobileMenuBtn = document.getElementById('mobileMenuBtn');
        this.navItems = document.querySelectorAll('.nav-item');
        this.pageTitle = document.getElementById('pageTitle');
        this.pages = document.querySelectorAll('.page');

        // Parser Elements
        this.editalText = document.getElementById('editalText');
        this.cargoName = document.getElementById('cargoName');
        this.orgaoName = document.getElementById('orgaoName');
        this.bancaName = document.getElementById('bancaName');
        this.provaDate = document.getElementById('provaDate');
        this.startParsingBtn = document.getElementById('startParsingBtn');
        this.parserResult = document.getElementById('parserResult');
        this.jsonOutput = document.getElementById('jsonOutput');
        this.importParsedDataBtn = document.getElementById('importParsedDataBtn');

        // Modals
        this.modalOverlay = document.getElementById('modalOverlay');
        this.subjectModal = document.getElementById('subjectModal');
        this.studyModal = document.getElementById('studyModal');
        this.mockModal = document.getElementById('mockModal');
        this.closeModalBtns = document.querySelectorAll('.close-modal, .cancel-modal');

        // Forms
        this.subjectForm = document.getElementById('subjectForm');
        this.studyForm = document.getElementById('studyForm');
        this.mockForm = document.getElementById('mockForm');
        this.studySubjectSelect = document.getElementById('studySubject');

        // Dashboard Elements
        this.totalStudyTimeEl = document.getElementById('totalStudyTime');
        this.overallPerformanceEl = document.getElementById('overallPerformance');
        this.overallProgressEl = document.getElementById('overallProgress');
        this.subjectsGrid = document.getElementById('subjectsGrid');
        this.recentActivities = document.getElementById('recentActivities');

        // Mock Exams Elements
        this.mockExamsTableBody = document.getElementById('mockExamsTableBody');
        this.mockDisciplinesBody = document.getElementById('mockDisciplinesBody');
        this.addMockDisciplineBtn = document.getElementById('addMockDisciplineBtn');
        this.mockTypeSelect = document.getElementById('mockType');
        this.mockBancaSelect = document.getElementById('mockBanca');
        this.mockTimeInput = document.getElementById('mockTime');
        this.mockCommentsInput = document.getElementById('mockComments');
        this.mockFinalScoreEl = document.getElementById('mockFinalScore');
        
        // Totals
        this.totalMockQuestionsEl = document.getElementById('totalMockQuestions');
        this.totalMockCorrectEl = document.getElementById('totalMockCorrect');
        this.totalMockErrorsEl = document.getElementById('totalMockErrors');
        this.totalMockBlanksEl = document.getElementById('totalMockBlanks');
        this.totalMockPercentEl = document.getElementById('totalMockPercent');

        this.planningContainer = document.getElementById('planningContainer');
        this.generatePlanningBtn = document.getElementById('generatePlanningBtn');

        // AI Analysis Modal
        this.analysisModal = document.getElementById('analysisModal');
        this.analysisContent = document.getElementById('analysisContent');

        // Settings & Timer
        this.autoRecalculateToggle = document.getElementById('autoRecalculateToggle');
        this.autoFollowPlanningToggle = document.getElementById('autoFollowPlanningToggle');
        this.floatingTimer = document.getElementById('floatingTimer');
        this.timerPanel = document.getElementById('timerPanel');
        this.timerDisplay = document.getElementById('timerDisplay');
        this.timerTaskInfo = document.getElementById('timerTaskInfo');
        this.timerTaskSubject = document.getElementById('timerTaskSubject');
        this.timerTaskType = document.getElementById('timerTaskType');
        this.timerTaskProgress = document.getElementById('timerTaskProgress');
        this.timerTaskElapsed = document.getElementById('timerTaskElapsed');
        this.timerTaskPlanned = document.getElementById('timerTaskPlanned');
        this.toggleTimerBtn = document.getElementById('toggleTimerBtn');
        this.closeTimerPanelBtn = document.getElementById('closeTimerPanel');
        this.startTimerBtn = document.getElementById('startTimerBtn');
        this.pauseTimerBtn = document.getElementById('pauseTimerBtn');
        this.resetTimerBtn = document.getElementById('resetTimerBtn');

        // PWA Elements
        this.installContainer = document.getElementById('installContainer');
        this.installBtn = document.getElementById('installBtn');

        // Verify all critical elements exist
        const criticalElements = [
            'sidebar', 'sidebarOverlay', 'toggleSidebarBtn', 'mobileMenuBtn', 'pageTitle',
            'modalOverlay', 'subjectModal', 'studyModal', 'mockModal', 'analysisModal',
            'subjectForm', 'studyForm', 'mockForm', 'studySubjectSelect',
            'totalStudyTimeEl', 'overallPerformanceEl', 'overallProgressEl',
            'subjectsGrid', 'recentActivities', 'mockExamsTableBody'
        ];

        criticalElements.forEach(el => {
            if (!this[el]) {
                console.warn(`Elemento não encontrado: ${el}`);
            }
        });
    }

    initEventListeners() {
        console.log("Initializing Event Listeners...");

        if (this.toggleSidebarBtn && this.sidebar) {
            this.toggleSidebarBtn.addEventListener('click', () => {
                this.sidebar.classList.toggle('collapsed');
            });
        }

        if (this.mobileMenuBtn) {
            this.mobileMenuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMobileMenu();
            });
        }

        if (this.sidebarOverlay) {
            this.sidebarOverlay.addEventListener('click', () => {
                this.toggleMobileMenu(false);
            });
        }

        // Navigation
        this.navItems.forEach(item => {
            item.addEventListener('click', () => {
                const pageId = item.getAttribute('data-page');
                if (pageId) this.navigateTo(pageId);
                this.toggleMobileMenu(false);
            });
        });

        // Modal Controls
        const newSubjectBtn = document.getElementById('newSubjectBtn');
        if (newSubjectBtn) newSubjectBtn.addEventListener('click', () => this.openSubjectModal());
        
        const addStudyBtn = document.getElementById('addStudyBtn');
        if (addStudyBtn) addStudyBtn.addEventListener('click', () => this.openStudyModal());
        
        const addMockBtn = document.getElementById('addMockBtn');
        if (addMockBtn) addMockBtn.addEventListener('click', () => this.openMockModal());

        if (this.generatePlanningBtn) {
            this.generatePlanningBtn.addEventListener('click', () => this.generateCycle());
        }

        this.closeModalBtns.forEach(btn => {
            btn.addEventListener('click', () => this.closeModals());
        });

        if (this.modalOverlay) {
            this.modalOverlay.addEventListener('click', (e) => {
                if (e.target === this.modalOverlay) this.closeModals();
            });
        }

        // Handle window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && this.sidebar && this.sidebar.classList.contains('active')) {
                this.toggleMobileMenu(false);
            }
        });

        // Form Submissions
        if (this.subjectForm) this.subjectForm.addEventListener('submit', (e) => this.handleSubjectSubmit(e));
        if (this.studyForm) this.studyForm.addEventListener('submit', (e) => this.handleStudySubmit(e));
        if (this.mockForm) this.mockForm.addEventListener('submit', (e) => this.handleMockSubmit(e));

        // Parser Listeners
        if (this.startParsingBtn) {
            this.startParsingBtn.addEventListener('click', () => this.handleParsing());
        }
        if (this.importParsedDataBtn) {
            this.importParsedDataBtn.addEventListener('click', () => this.importParsedData());
        }

        // Advanced Mock Listeners
        if (this.addMockDisciplineBtn) {
            this.addMockDisciplineBtn.addEventListener('click', () => this.addMockDiscipline());
        }

        if (this.mockTypeSelect) {
            this.mockTypeSelect.addEventListener('change', () => this.updateMockCalculations());
        }

        if (this.mockDisciplinesBody) {
            this.mockDisciplinesBody.addEventListener('input', (e) => {
                if (e.target.tagName === 'INPUT') {
                    const row = e.target.closest('tr');
                    const index = parseInt(row.getAttribute('data-index'));
                    const field = e.target.closest('td').getAttribute('data-label');
                    
                    let fieldName = '';
                    if (field === 'Disciplina') fieldName = 'name';
                    else if (field === 'Peso') fieldName = 'weight';
                    else if (field === 'Quest.') fieldName = 'questions';
                    else if (field === 'Acertos') fieldName = 'correct';
                    else if (field === 'Erros') fieldName = 'errors';
                    else if (field === 'Brancos') fieldName = 'blanks';

                    if (fieldName) {
                        let value = e.target.value;
                        if (fieldName !== 'name') {
                            value = fieldName === 'weight' ? parseFloat(value) || 0 : parseInt(value) || 0;
                        }
                        this.currentMockDisciplines[index][fieldName] = value;
                    }

                    this.updateRowCalculations(index);
                    this.updateMockCalculations();
                }
            });
        }

        // Settings
        if (this.autoRecalculateToggle) {
            this.autoRecalculateToggle.checked = this.settings.autoRecalculatePlanning;
            this.autoRecalculateToggle.addEventListener('change', (e) => {
                this.settings.autoRecalculatePlanning = e.target.checked;
                this.saveSettings();
                this.showToast(`Auto-recalculo ${this.settings.autoRecalculatePlanning ? 'ativado' : 'desativado'}.`, 'info');
            });
        }

        if (this.autoFollowPlanningToggle) {
            this.autoFollowPlanningToggle.checked = this.settings.autoFollowPlanning;
            this.autoFollowPlanningToggle.addEventListener('change', (e) => {
                this.settings.autoFollowPlanning = e.target.checked;
                this.saveSettings();
                this.showToast(`Modo Inteligente ${this.settings.autoFollowPlanning ? 'ativado' : 'desativado'}.`, 'info');
                this.syncTimerWithPlanning();
            });
        }

        // Timer Listeners
        if (this.toggleTimerBtn) {
            this.toggleTimerBtn.addEventListener('click', () => {
                this.timerPanel.classList.toggle('active');
            });
        }

        if (this.closeTimerPanelBtn) {
            this.closeTimerPanelBtn.addEventListener('click', () => {
                this.timerPanel.classList.remove('active');
            });
        }

        if (this.startTimerBtn) {
            this.startTimerBtn.addEventListener('click', () => this.startTimer());
        }

        if (this.pauseTimerBtn) {
            this.pauseTimerBtn.addEventListener('click', () => this.pauseTimer());
        }

        if (this.resetTimerBtn) {
            this.resetTimerBtn.addEventListener('click', () => this.resetTimer());
        }

        // PWA Installation
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            if (this.installContainer) this.installContainer.style.display = 'block';
        });

        if (this.installBtn) {
            this.installBtn.addEventListener('click', async () => {
                if (!this.deferredPrompt) return;
                this.deferredPrompt.prompt();
                const { outcome } = await this.deferredPrompt.userChoice;
                this.deferredPrompt = null;
                if (this.installContainer) this.installContainer.style.display = 'none';
            });
        }

        window.addEventListener('appinstalled', (evt) => {
            if (this.installContainer) this.installContainer.style.display = 'none';
            this.showToast('App instalado com sucesso!', 'success');
        });

        // Resume timer if it was running
        if (this.timer.running) {
            const now = Date.now();
            const elapsed = Math.floor((now - this.timer.lastUpdate) / 1000);
            this.timer.seconds += elapsed;
            this.startTimer();
        } else {
            this.updateTimerDisplay();
            if (this.settings.autoFollowPlanning) {
                this.syncTimerWithPlanning();
            }
        }
    }

    // --- Parser Logic (CORRIGIDO PARA VERCEL) ---
    async handleParsing() {
        const text = this.editalText.value.trim();
        if (!text) {
            this.showToast('Por favor, cole o conteúdo do edital.');
            return;
        }

        const metadata = {
            cargo: this.cargoName.value.trim(),
            orgao: this.orgaoName.value.trim(),
            banca: this.bancaName.value.trim(),
            data_prova: this.provaDate.value.trim() || "Pré-Edital"
        };

        this.startParsingBtn.disabled = true;
        this.startParsingBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...';

        try {
            // CORREÇÃO: Adicionada barra "/" no início para rota absoluta
            const response = await fetch('/api/parse-edital', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, metadata })
            });

            if (!response.ok) throw new Error('Falha na resposta da API');

            const result = await response.json();
            this.parsedData = result;
            
            this.jsonOutput.textContent = JSON.stringify(result, null, 2);
            this.parserResult.classList.remove('hidden');
            this.showToast('Edital processado com sucesso!');
        } catch (error) {
            console.error('Erro no parsing:', error);
            this.showToast('Erro ao processar o edital. Verifique se a API Key está configurada na Vercel.');
        } finally {
            this.startParsingBtn.disabled = false;
            this.startParsingBtn.innerHTML = '<i class="fas fa-bolt"></i> Processar com IA';
        }
    }

    importParsedData() {
        if (!this.parsedData) return;

        const newSubjects = this.parsedData.verticalizado.map(item => {
            return {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                name: item.disciplina,
                goal: 100,
                totalMinutes: 0,
                totalQuestions: 0,
                totalCorrect: 0,
                topics: item.topicos.map(t => ({
                    id: t.id,
                    description: t.descricao,
                    completed: false
                }))
            };
        });

        this.subjects = [...this.subjects, ...newSubjects];
        
        const planNameEl = document.querySelector('.plan-name');
        if (planNameEl) {
            planNameEl.textContent = `[${this.parsedData.metadados.data_prova}] ${this.parsedData.metadados.cargo}`;
        }

        this.saveData();
        this.renderAll();
        this.navigateTo('dashboard');
        this.showToast('Dados importados com sucesso!');
        
        this.parserResult.classList.add('hidden');
        this.editalText.value = '';
        this.parsedData = null;
    }

    // --- Navigation ---
    toggleMobileMenu(force) {
        if (!this.sidebar) return;
        
        const isActive = force !== undefined ? force : !this.sidebar.classList.contains('active');
        
        if (isActive) {
            this.sidebar.classList.remove('collapsed');
            this.sidebar.classList.add('active');
            if (this.sidebarOverlay) this.sidebarOverlay.classList.add('active');
            document.body.style.overflow = 'hidden'; 
        } else {
            this.sidebar.classList.remove('active');
            if (this.sidebarOverlay) this.sidebarOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    navigateTo(pageId) {
        this.navItems.forEach(item => {
            if (item.getAttribute('data-page') === pageId) {
                item.classList.add('active');
                this.pageTitle.textContent = item.querySelector('span').textContent;
            } else {
                item.classList.remove('active');
            }
        });

        this.pages.forEach(page => {
            if (page.id === `${pageId}-page`) {
                page.classList.add('active');
            } else {
                page.classList.remove('active');
            }
        });
    }

    // --- Data Management ---
    saveData() {
        localStorage.setItem('pf_subjects', JSON.stringify(this.subjects));
        localStorage.setItem('pf_history', JSON.stringify(this.history));
        localStorage.setItem('pf_mock_exams', JSON.stringify(this.mockExams));
        localStorage.setItem('pf_planning', JSON.stringify(this.planning));
    }

    saveSettings() {
        localStorage.setItem('pf_settings', JSON.stringify(this.settings));
    }

    saveTimer() {
        localStorage.setItem('pf_timer', JSON.stringify(this.timer));
    }

    handleSubjectSubmit(e) {
        e.preventDefault();
        const id = document.getElementById('editSubjectId').value;
        const name = document.getElementById('subjectName').value;
        const goal = parseFloat(document.getElementById('subjectGoal').value) || 0;

        if (id) {
            const index = this.subjects.findIndex(s => s.id === id);
            if (index !== -1) {
                this.subjects[index] = { ...this.subjects[index], name, goal };
            }
        } else {
            const newSubject = {
                id: Date.now().toString(),
                name,
                goal,
                totalMinutes: 0,
                totalQuestions: 0,
                totalCorrect: 0
            };
            this.subjects.push(newSubject);
        }

        this.saveData();
        this.renderAll();
        this.closeModals();
        this.showToast(id ? 'Disciplina atualizada!' : 'Disciplina cadastrada!');
    }

    handleStudySubmit(e) {
        e.preventDefault();
        const subjectId = this.studySubjectSelect.value;
        const minutes = parseInt(document.getElementById('studyTime').value);
        const date = document.getElementById('studyDate').value;
        const questions = parseInt(document.getElementById('studyQuestions').value) || 0;
        const correct = parseInt(document.getElementById('studyCorrect').value) || 0;

        const subject = this.subjects.find(s => s.id === subjectId);
        if (!subject) return;

        const currentTask = this.getCurrentTask();
        if (currentTask && currentTask.formato === "questoes") {
            if (questions <= 0 || correct < 0) {
                this.showToast("Preencha questões e acertos!", "error");
                return;
            }
            if (correct > questions) {
                this.showToast("Acertos não podem ser maiores que questões!", "error");
                return;
            }
        }

        const session = {
            id: Date.now().toString(),
            subjectId,
            subjectName: subject.name,
            minutes,
            date,
            questions,
            correct
        };

        this.history.unshift(session);
        
        subject.totalMinutes += minutes;
        subject.totalQuestions += questions;
        subject.totalCorrect += correct;

        this.saveData();
        this.renderAll();
        this.closeModals();
        this.showToast('Estudo registrado com sucesso!');

        if (this.timer.currentTaskIndex !== null) {
            this.timer.seconds = 0;
            this.saveTimer();
            this.syncTimerWithPlanning();
        }
    }

    deleteSubject(id) {
        if (confirm('Deseja realmente excluir esta disciplina? Os registros de estudo serão mantidos no histórico geral.')) {
            this.subjects = this.subjects.filter(s => s.id !== id);
            this.saveData();
            this.renderAll();
            this.showToast('Disciplina removida.', 'info');
        }
    }

    // --- CRUD: Mock Exams ---
    handleMockSubmit(e) {
        e.preventDefault();
        const name = document.getElementById('mockName').value;
        const date = document.getElementById('mockDate').value;
        const type = this.mockTypeSelect.value;
        const banca = this.mockBancaSelect.value;
        const time = this.mockTimeInput.value;
        const comments = this.mockCommentsInput.value;

        if (this.currentMockDisciplines.length === 0) {
            this.showToast('Adicione pelo menos uma disciplina.', 'error');
            return;
        }

        let hasError = false;
        this.currentMockDisciplines.forEach(d => {
            if (d.questions !== (d.correct + d.errors + d.blanks)) {
                hasError = true;
            }
        });

        if (hasError) {
            this.showToast('Verifique a soma das questões (Acertos + Erros + Brancos).', 'error');
            return;
        }

        const totals = this.calculateTotals();

        const newMock = {
            id: Date.now().toString(),
            name,
            date,
            type,
            banca,
            time,
            comments,
            disciplines: [...this.currentMockDisciplines],
            summary: totals
        };

        this.mockExams.unshift(newMock);
        this.saveData();
        this.renderAll();
        this.closeModals();
        this.showToast('Simulado registrado com sucesso!');

        if (this.settings?.autoRecalculatePlanning) {
            this.generateCycleWithAI();
        }
    }

    calculateTotals() {
        let totalQ = 0, totalC = 0, totalE = 0, totalB = 0, weightedScore = 0;
        
        this.currentMockDisciplines.forEach(d => {
            totalQ += d.questions;
            totalC += d.correct;
            totalE += d.errors;
            totalB += d.blanks;
            
            if (this.mockTypeSelect.value === 'certo_errado') {
                weightedScore += (d.correct - d.errors);
            } else {
                weightedScore += (d.correct * d.weight);
            }
        });

        const percent = totalQ > 0 ? ((totalC / totalQ) * 100).toFixed(2) : 0;

        return {
            totalQuestions: totalQ,
            correct: totalC,
            errors: totalE,
            blanks: totalB,
            percent,
            score: weightedScore.toFixed(2)
        };
    }

    openMockModal() {
        this.mockForm.reset();
        document.getElementById('mockDate').valueAsDate = new Date();
        
        this.currentMockDisciplines = this.subjects.map(s => ({
            name: s.name,
            weight: 1,
            questions: 0,
            correct: 0,
            errors: 0,
            blanks: 0,
            percent: 0
        }));

        if (this.currentMockDisciplines.length === 0) {
            this.addMockDiscipline();
        }

        this.renderMockModalTable();
        this.updateMockCalculations();
        
        this.modalOverlay.classList.add('active');
        this.mockModal.classList.add('active');
    }

    renderMockModalTable() {
        this.mockDisciplinesBody.innerHTML = '';
        this.currentMockDisciplines.forEach((d, index) => {
            const tr = document.createElement('tr');
            tr.setAttribute('data-index', index);
            tr.innerHTML = `
                <td data-label="Disciplina"><input type="text" value="${d.name}"></td>
                <td data-label="Peso"><input type="number" value="${d.weight}" min="0.1" step="0.1"></td>
                <td data-label="Quest."><input type="number" value="${d.questions}" min="0"></td>
                <td data-label="Acertos"><input type="number" class="text-green" value="${d.correct}" min="0"></td>
                <td data-label="Erros"><input type="number" class="text-red" value="${d.errors}" min="0"></td>
                <td data-label="Brancos"><input type="number" value="${d.blanks}" min="0"></td>
                <td data-label="%" class="font-bold">${d.percent}%</td>
                <td>
                    <button type="button" class="btn-icon-sm delete" onclick="app.removeMockDiscipline(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            this.mockDisciplinesBody.appendChild(tr);
        });
    }

    addMockDiscipline() {
        this.currentMockDisciplines.push({
            name: 'Nova Disciplina',
            weight: 1,
            questions: 0,
            correct: 0,
            errors: 0,
            blanks: 0,
            percent: 0
        });
        this.renderMockModalTable();
    }

    removeMockDiscipline(index) {
        this.currentMockDisciplines.splice(index, 1);
        this.renderMockModalTable();
        this.updateMockCalculations();
    }

    updateRowCalculations(index) {
        const d = this.currentMockDisciplines[index];
        d.percent = d.questions > 0 ? Math.round((d.correct / d.questions) * 100) : 0;
        
        const row = this.mockDisciplinesBody.querySelector(`tr[data-index="${index}"]`);
        if (row) {
            const percentCell = row.querySelector('td[data-label="%"]');
            if (percentCell.textContent !== `${d.percent}%`) {
                percentCell.textContent = `${d.percent}%`;
                percentCell.classList.remove('value-update');
                void percentCell.offsetWidth;
                percentCell.classList.add('value-update');
            }
        }
    }

    updateMockCalculations() {
        const totals = this.calculateTotals();
        
        const updateWithAnimation = (el, newValue) => {
            if (el.textContent !== newValue.toString()) {
                el.textContent = newValue;
                el.classList.remove('value-update');
                void el.offsetWidth;
                el.classList.add('value-update');
            }
        };

        updateWithAnimation(this.totalMockQuestionsEl, totals.totalQuestions);
        updateWithAnimation(this.totalMockCorrectEl, totals.correct);
        updateWithAnimation(this.totalMockErrorsEl, totals.errors);
        updateWithAnimation(this.totalMockBlanksEl, totals.blanks);
        updateWithAnimation(this.totalMockPercentEl, `${totals.percent}%`);
        updateWithAnimation(this.mockFinalScoreEl, totals.score);

        this.currentMockDisciplines.forEach((d, index) => {
            const row = this.mockDisciplinesBody.querySelector(`tr[data-index="${index}"]`);
            if (row) {
                const isValid = d.questions === (d.correct + d.errors + d.blanks);
                row.style.backgroundColor = isValid ? 'transparent' : 'rgba(239, 68, 68, 0.05)';
            }
        });
    }

    deleteMockExam(id) {
        if (confirm('Excluir este registro de simulado?')) {
            this.mockExams = this.mockExams.filter(m => m.id !== id);
            this.saveData();
            this.renderAll();
            this.showToast('Simulado removido.', 'info');
        }
    }

    // --- AI Analysis Logic (CORRIGIDO PARA VERCEL) ---
    async analyzeMockExam(id) {
        const mock = this.mockExams.find(m => m.id === id);
        if (!mock) return;

        this.analysisModal.classList.add('active');
        this.modalOverlay.classList.add('active');
        this.analysisContent.innerHTML = `
            <div class="loading-state">
                <i class="fas fa-spinner fa-spin"></i>
                <p>A inteligência artificial está analisando seu desempenho...</p>
            </div>
        `;

        try {
            // CORREÇÃO: Adicionada barra "/" no início para rota absoluta
            const response = await fetch('/api/analyze-mock', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(mock)
            });

            if (!response.ok) throw new Error('Falha na resposta da API');

            const analysis = await response.json();
            this.renderAnalysisResult(analysis);

        } catch (error) {
            console.error("Erro na análise IA:", error);
            this.analysisContent.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Erro ao processar análise. Verifique as variáveis de ambiente na Vercel.</p>
                </div>
            `;
        }
    }

    renderAnalysisResult(data) {
        let html = `
            <div class="analysis-result">
                <div class="analysis-summary-grid">
                    <div class="summary-item">
                        <span class="label">Nota Final</span>
                        <span class="value highlight">${data.resumo_geral.nota_final.toFixed(2)}</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">Aproveitamento</span>
                        <span class="value">${data.resumo_geral.percentual}%</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">Acertos/Erros</span>
                        <span class="value">${data.resumo_geral.acertos} / ${data.resumo_geral.erros}</span>
                    </div>
                </div>

                <div class="analysis-text">
                    <h4><i class="fas fa-lightbulb"></i> Análise Estratégica</h4>
                    <p>${data.analise_IA.replace(/\n/g, '<br>')}</p>
                </div>

                <div class="analysis-disciplines">
                    <h4>Desempenho por Disciplina</h4>
                    <div class="table-responsive">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Disciplina</th>
                                    <th>Qst.</th>
                                    <th>Nota</th>
                                    <th>%</th>
                                    <th>Nível</th>
                                </tr>
                            </thead>
                            <tbody>
        `;

        data.disciplinas.forEach(d => {
            const nivelClass = d.nivel === 'forte' ? 'text-green' : (d.nivel === 'fraco' ? 'text-red' : 'text-orange');
            html += `
                <tr>
                    <td>${d.nome}</td>
                    <td>${d.questoes}</td>
                    <td>${d.nota.toFixed(2)}</td>
                    <td>${d.percentual}%</td>
                    <td class="font-bold ${nivelClass}">${d.nivel.toUpperCase()}</td>
                </tr>
            `;
        });

        html += `
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        this.analysisContent.innerHTML = html;
    }

    // --- Rendering ---
    renderAll() {
        this.renderStats();
        this.renderSubjects();
        this.renderHistory();
        this.renderMockExams();
        this.renderPlanning();
        this.renderAnnouncement();
        this.updateSubjectSelect();
    }

    renderAnnouncement() {
        const announcementPage = document.getElementById('announcement-page');
        if (!announcementPage) return;

        if (this.subjects.length === 0) {
            announcementPage.innerHTML = `
                <div class="card">
                    <h3>Edital Verticalizado</h3>
                    <p>Importe um edital ou cadastre disciplinas para ver o controle verticalizado.</p>
                </div>
            `;
            return;
        }

        let html = `<div class="section-header"><h2>Edital Verticalizado</h2></div>`;

        this.subjects.forEach(subject => {
            if (!subject.topics || subject.topics.length === 0) return;

            const completedTopics = subject.topics.filter(t => t.completed).length;
            const progress = Math.round((completedTopics / subject.topics.length) * 100);

            html += `
                <div class="card" style="margin-bottom: 1.5rem;">
                    <div class="subject-header" style="margin-bottom: 1rem;">
                        <h3>${subject.name}</h3>
                        <span class="plan-name">${progress}% concluído</span>
                    </div>
                    <div class="progress-bar" style="margin-bottom: 1.5rem;">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <div class="topics-list">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th style="width: 50px;">Status</th>
                                    <th style="width: 100px;">ID</th>
                                    <th>Descrição do Assunto</th>
                                </tr>
                            </thead>
                            <tbody>
            `;

            subject.topics.forEach((topic, idx) => {
                html += `
                    <tr>
                        <td data-label="Status">
                            <button class="btn-icon-sm ${topic.completed ? 'text-green' : ''}" onclick="app.toggleTopicStatus('${subject.id}', ${idx})">
                                <i class="fas ${topic.completed ? 'fa-check-square' : 'fa-square'}"></i>
                            </button>
                        </td>
                        <td data-label="ID"><code style="background: #f1f5f9; padding: 2px 4px; border-radius: 4px;">${topic.id}</code></td>
                        <td data-label="Assunto" style="${topic.completed ? 'text-decoration: line-through; opacity: 0.6;' : ''}">${topic.description}</td>
                    </tr>
                `;
            });

            html += `</tbody></table></div></div>`;
        });

        announcementPage.innerHTML = html;
    }

    toggleTopicStatus(subjectId, topicIdx) {
        const subject = this.subjects.find(s => s.id === subjectId);
        if (subject && subject.topics[topicIdx]) {
            subject.topics[topicIdx].completed = !subject.topics[topicIdx].completed;
            this.saveData();
            this.renderAll();
        }
    }

    renderPlanning() {
        if (!this.planningContainer) return;

        if (!this.planning) {
            this.planningContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-alt"></i>
                    <p>Clique em "Gerar Novo Ciclo" para criar seu planejamento.</p>
                </div>
            `;
            return;
        }

        let html = '';

        if (this.planning.analise_IA) {
            html += `
                <div class="card" style="margin-bottom: 1.5rem; border-left: 4px solid var(--secondary);">
                    <div class="card-header">
                        <h3><i class="fas fa-brain"></i> Análise Estratégica do Ciclo</h3>
                    </div>
                    <div class="analysis-text" style="background: none; padding: 0; border: none; margin: 0;">
                        <p>${this.planning.analise_IA.replace(/\n/g, '<br>')}</p>
                        ${this.planning.resumo ? `
                            <div style="margin-top: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
                                ${this.planning.resumo.disciplinas_prioritarias.map(d => `
                                    <span class="btn-sm" style="background: #fee2e2; color: #991b1b; border-radius: 4px; padding: 2px 8px; font-size: 0.7rem;">
                                        <i class="fas fa-exclamation-circle"></i> ${d}
                                    </span>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }

        html += `
            <div class="card">
                <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h3><i class="fas fa-sync-alt"></i> Ciclo Atual: ${this.planning.total_tarefas} Tarefas</h3>
                    <span class="plan-name">${this.planning.duracao_ciclo}</span>
                </div>
                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Ordem</th>
                                <th>Disciplina</th>
                                <th>Formato</th>
                                <th>Descrição</th>
                                <th>Tempo</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
        `;

        this.planning.tarefas.forEach((task, index) => {
            const status = task.status || 'pendente';
            const isCompleted = status === 'concluido';
            const isInProgress = status === 'em_andamento';
            const isActive = this.timer.currentTaskIndex === index;
            
            const rowClass = isCompleted ? 'task-row-completed' : (isInProgress || isActive ? 'task-row-active' : '');
            
            let statusText = isCompleted ? 'Concluído' : (isInProgress || isActive ? 'Em andamento' : 'Pendente');
            let statusColor = isCompleted ? 'text-green' : (isInProgress || isActive ? 'text-blue' : 'text-muted');
            let statusDotClass = isCompleted ? 'completed' : (isInProgress || isActive ? 'active' : 'pending');

            const icon = task.formato === 'teoria' ? 'fa-book' : (task.formato === 'revisao' ? 'fa-history' : 'fa-pencil-alt');
            const priorityColor = task.prioridade === 'alta' ? '#fee2e2' : (task.prioridade === 'media' ? '#ffedd5' : '#f1f5f9');
            const priorityTextColor = task.prioridade === 'alta' ? '#991b1b' : (task.prioridade === 'media' ? '#9a3412' : '#475569');
            
            html += `
                <tr class="${rowClass}">
                    <td data-label="Ordem"><strong>${index + 1}</strong></td>
                    <td data-label="Disciplina">
                        ${task.disciplina}
                        ${task.prioridade ? `<span style="display: block; font-size: 0.65rem; color: ${priorityTextColor}; background: ${priorityColor}; width: fit-content; padding: 0 4px; border-radius: 2px; text-transform: uppercase;">${task.prioridade}</span>` : ''}
                    </td>
                    <td data-label="Formato">
                        <span class="btn-sm" style="background: #f1f5f9; border-radius: 4px; padding: 2px 8px;">
                            <i class="fas ${icon}"></i> ${task.formato.charAt(0).toUpperCase() + task.formato.slice(1)}
                        </span>
                    </td>
                    <td data-label="Descrição">${task.descricao}</td>
                    <td data-label="Tempo">${task.tempo_previsto_minutos} min</td>
                    <td data-label="Status">
                        <div class="status-indicator ${statusColor}">
                            <span class="status-dot ${statusDotClass}"></span>
                            <span>${statusText}</span>
                        </div>
                    </td>
                    <td data-label="Ações">
                        <div style="display: flex; gap: 0.5rem;">
                            ${!isCompleted ? `<button class="btn btn-primary btn-sm" onclick="app.startTask(${index})"><i class="fas fa-play"></i> Iniciar</button>` : ''}
                            <button class="btn-icon-sm" onclick="app.toggleTaskStatus(${index})"><i class="fas fa-sync-alt"></i></button>
                        </div>
                    </td>
                </tr>
            `;
        });

        html += `</tbody></table></div></div>`;
        this.planningContainer.innerHTML = html;
    }

    // --- Cycle AI Logic (CORRIGIDO PARA VERCEL) ---
    async generateCycleWithAI() {
        try {
            if (this.planningContainer) {
                this.planningContainer.innerHTML = `
                    <div class="card">
                        <div class="loading-state">
                            <i class="fas fa-spinner fa-spin"></i>
                            <p>Atualizando seu ciclo de estudos automaticamente...</p>
                        </div>
                    </div>
                `;
            }

            const disciplinas = this.subjects.map(s => ({
                nome: s.name,
                desempenho: s.totalQuestions > 0 ? Math.round((s.totalCorrect / s.totalQuestions) * 100) : 0
            }));

            // CORREÇÃO: Adicionada barra "/" no início para rota absoluta
            const response = await fetch('/api/generate-cycle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(disciplinas)
            });

            if (!response.ok) throw new Error('Falha na resposta da API');

            const cycleData = await response.json();

            this.planning = {
                tipo: cycleData.tipo,
                duracao_ciclo: cycleData.resumo.foco_principal,
                total_tarefas: cycleData.ciclo.length,
                tarefas: cycleData.ciclo.map(t => ({
                    disciplina: t.disciplina,
                    formato: t.formato,
                    descricao: t.descricao,
                    tempo_previsto_minutos: t.tempo_min,
                    status: 'pendente',
                    prioridade: t.prioridade
                })),
                resumo: cycleData.resumo,
                analise_IA: cycleData.analise_IA
            };

            this.saveData();
            this.renderPlanning();
            this.showToast("Ciclo atualizado estrategicamente.", "info");

        } catch (error) {
            console.error("Erro ao gerar ciclo com IA:", error);
            this.showToast("Erro ao gerar ciclo. Verifique a configuração da API na Vercel.", "error");
            this.renderPlanning();
        }
    }

    async generateCycle() {
        await this.generateCycleWithAI();
    }

    toggleTaskStatus(index) {
        if (!this.planning) return;
        const task = this.planning.tarefas[index];
        task.status = task.status === 'concluido' ? 'pendente' : 'concluido';
        this.saveData();
        this.renderPlanning();
    }

    renderStats() {
        const totalMinutes = this.history.reduce((acc, curr) => acc + curr.minutes, 0);
        this.totalStudyTimeEl.textContent = `${Math.floor(totalMinutes / 60)}h ${(totalMinutes % 60).toString().padStart(2, '0')}min`;

        const totalQ = this.history.reduce((acc, curr) => acc + curr.questions, 0);
        const totalC = this.history.reduce((acc, curr) => acc + curr.correct, 0);
        this.overallPerformanceEl.textContent = `${totalQ > 0 ? Math.round((totalC / totalQ) * 100) : 0}%`;

        let overallProgress = 0;
        const subjectsWithTopics = this.subjects.filter(s => s.topics && s.topics.length > 0);
        if (subjectsWithTopics.length > 0) {
            const totalTopics = subjectsWithTopics.reduce((acc, curr) => acc + curr.topics.length, 0);
            const completedTopics = subjectsWithTopics.reduce((acc, curr) => acc + curr.topics.filter(t => t.completed).length, 0);
            overallProgress = Math.round((completedTopics / totalTopics) * 100);
        }
        this.overallProgressEl.textContent = `${overallProgress}%`;
    }

    renderSubjects() {
        this.subjectsGrid.innerHTML = '';
        if (this.subjects.length === 0) {
            this.subjectsGrid.innerHTML = '<div class="empty-state"><i class="fas fa-book-open"></i><p>Nenhuma disciplina cadastrada.</p></div>';
            return;
        }

        this.subjects.forEach(s => {
            const hours = (s.totalMinutes / 60).toFixed(1);
            let progress = 0;
            let progressLabel = '';
            
            if (s.topics && s.topics.length > 0) {
                const completed = s.topics.filter(t => t.completed).length;
                progress = Math.round((completed / s.topics.length) * 100);
                progressLabel = `${completed}/${s.topics.length} tópicos`;
            } else {
                progress = s.goal > 0 ? Math.min(100, (parseFloat(hours) / s.goal) * 100) : 0;
                progressLabel = `${hours}h/${s.goal}h`;
            }

            const card = document.createElement('div');
            card.className = 'subject-card';
            card.innerHTML = `
                <div class="subject-header">
                    <div><h4 class="subject-title">${s.name}</h4><span class="subject-meta">${s.totalQuestions} questões • ${s.totalQuestions > 0 ? Math.round((s.totalCorrect / s.totalQuestions) * 100) : 0}% acerto</span></div>
                    <div class="subject-actions">
                        <button class="btn-icon-sm" onclick="app.openSubjectModal('${s.id}')"><i class="fas fa-edit"></i></button>
                        <button class="btn-icon-sm delete" onclick="app.deleteSubject('${s.id}')"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
                <div class="subject-progress"><div class="progress-bar"><div class="progress-fill" style="width: ${progress}%"></div></div><div class="progress-info"><span>Progresso</span><span>${progressLabel}</span></div></div>
            `;
            this.subjectsGrid.appendChild(card);
        });
    }

    renderHistory() {
        this.recentActivities.innerHTML = '';
        const recent = this.history.slice(0, 5);
        if (recent.length === 0) {
            this.recentActivities.innerHTML = '<div class="empty-state-sm">Sem atividades recentes.</div>';
            return;
        }
        recent.forEach(item => {
            const div = document.createElement('div');
            div.className = 'activity-item';
            div.innerHTML = `<span class="activity-subject">${item.subjectName}</span><span class="activity-time">${item.minutes} min</span>`;
            this.recentActivities.appendChild(div);
        });
    }

    renderMockExams() {
        this.mockExamsTableBody.innerHTML = '';
        if (this.mockExams.length === 0) {
            this.mockExamsTableBody.innerHTML = '<tr><td colspan="6" class="text-center">Nenhum simulado registrado.</td></tr>';
            return;
        }

        this.mockExams.forEach(m => {
            const summary = m.summary || { totalQuestions: 0, correct: 0, percent: 0 };
            const date = new Date(m.date + 'T12:00:00').toLocaleDateString('pt-BR');
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td data-label="Data">${date}</td>
                <td data-label="Nome/Órgão"><strong>${m.name}</strong></td>
                <td data-label="Questões">${summary.totalQuestions}</td>
                <td data-label="Acertos">${summary.correct}</td>
                <td data-label="Aproveitamento"><div class="progress-bar"><div class="progress-fill" style="width: ${summary.percent}%"></div></div><span>${summary.percent}%</span></td>
                <td data-label="Ações">
                    <button class="btn-icon-sm" onclick="app.analyzeMockExam('${m.id}')"><i class="fas fa-brain"></i></button>
                    <button class="btn-icon-sm delete" onclick="app.deleteMockExam('${m.id}')"><i class="fas fa-trash"></i></button>
                </td>
            `;
            this.mockExamsTableBody.appendChild(tr);
        });
    }

    updateSubjectSelect() {
        this.studySubjectSelect.innerHTML = '<option value="">Selecione...</option>';
        this.subjects.forEach(s => {
            const opt = document.createElement('option');
            opt.value = s.id;
            opt.textContent = s.name;
            this.studySubjectSelect.appendChild(opt);
        });
    }

    openSubjectModal(id = null) {
        const title = document.getElementById('subjectModalTitle');
        const idInput = document.getElementById('editSubjectId');
        if (id) {
            const s = this.subjects.find(sub => sub.id === id);
            title.textContent = 'Editar Disciplina';
            idInput.value = s.id;
            document.getElementById('subjectName').value = s.name;
            document.getElementById('subjectGoal').value = s.goal;
        } else {
            title.textContent = 'Nova Disciplina';
            idInput.value = '';
            this.subjectForm.reset();
        }
        this.modalOverlay.classList.add('active');
        this.subjectModal.classList.add('active');
    }

    openStudyModal() {
        if (this.subjects.length === 0) {
            this.showToast('Cadastre uma disciplina primeiro!', 'info');
            return;
        }
        this.studyForm.reset();
        document.getElementById('studyDate').valueAsDate = new Date();
        this.modalOverlay.classList.add('active');
        this.studyModal.classList.add('active');
    }

    closeModals() {
        this.modalOverlay.classList.remove('active');
        this.subjectModal.classList.remove('active');
        this.studyModal.classList.remove('active');
        this.mockModal.classList.remove('active');
        if (this.analysisModal) this.analysisModal.classList.remove('active');
    }

    // --- Timer Logic ---
    startTask(index) {
        if (!this.planning || !this.planning.tarefas[index]) return;
        this.planning.tarefas.forEach(t => { if (t.status === 'em_andamento') t.status = 'pendente'; });
        const task = this.planning.tarefas[index];
        task.status = 'em_andamento';
        this.timer.currentTaskIndex = index;
        this.timer.seconds = 0;
        this.saveData();
        this.saveTimer();
        this.renderPlanning();
        this.syncTimerWithTask();
        this.startTimer();
        if (this.timerPanel) this.timerPanel.classList.add('active');
    }

    syncTimerWithTask() {
        const task = this.getCurrentTask();
        if (task && this.timerTaskInfo) {
            this.timerTaskInfo.classList.remove('hidden');
            this.timerTaskSubject.textContent = task.disciplina;
            this.timerTaskType.textContent = task.formato;
            this.timerTaskPlanned.textContent = this.formatMinutes(task.tempo_previsto_minutos);
            this.updateTimerDisplay();
        } else if (this.timerTaskInfo) {
            this.timerTaskInfo.classList.add('hidden');
        }
        this.saveTimer();
    }

    getCurrentTask() {
        return (this.planning && this.timer.currentTaskIndex !== null) ? this.planning.tarefas[this.timer.currentTaskIndex] : null;
    }

    syncTimerWithPlanning() {
        if (!this.settings.autoFollowPlanning || !this.planning) {
            this.timer.currentTaskIndex = null;
            return;
        }
        const taskObj = this.getNextPendingTask();
        if (taskObj) {
            this.timer.currentTaskIndex = taskObj.index;
            this.syncTimerWithTask();
        }
    }

    getNextPendingTask() {
        if (!this.planning) return null;
        const index = this.planning.tarefas.findIndex(t => t.status === 'pendente');
        return index !== -1 ? { ...this.planning.tarefas[index], index } : null;
    }

    startTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        if (this.settings.autoFollowPlanning && this.timer.currentTaskIndex === null) this.syncTimerWithPlanning();
        this.timer.running = true;
        this.timer.lastUpdate = Date.now();
        this.startTimerBtn.style.display = 'none';
        this.pauseTimerBtn.style.display = 'flex';
        this.timerInterval = setInterval(() => {
            this.timer.seconds++;
            this.timer.lastUpdate = Date.now();
            this.updateTimerDisplay();
            this.saveTimer();
        }, 1000);
    }

    pauseTimer() {
        this.timer.running = false;
        clearInterval(this.timerInterval);
        this.startTimerBtn.style.display = 'flex';
        this.pauseTimerBtn.style.display = 'none';
        this.saveTimer();
        if (this.timer.currentTaskIndex !== null) this.completeTaskFromTimer();
    }

    resetTimer() {
        if (this.timer.seconds > 0 && confirm('Deseja registrar este tempo como uma sessão de estudo?')) {
            const task = this.getCurrentTask();
            this.openStudyModalWithTime(this.timer.seconds, task ? task.disciplina : '');
            this.pauseTimer();
        } else {
            this.pauseTimer();
            this.timer.seconds = 0;
            this.updateTimerDisplay();
            this.syncTimerWithPlanning();
        }
    }

    completeTaskFromTimer() {
        if (!this.planning || this.timer.currentTaskIndex === null) return;
        const task = this.planning.tarefas[this.timer.currentTaskIndex];
        const progress = (this.timer.seconds / (task.tempo_previsto_minutos * 60)) * 100;
        task.status = progress >= 70 ? 'concluido' : 'pendente';
        this.saveData();
        this.renderPlanning();
        if (task.status === 'concluido' && this.settings.autoRecalculatePlanning) this.generateCycleWithAI();
    }

    updateTimerDisplay() {
        const h = Math.floor(this.timer.seconds / 3600);
        const m = Math.floor((this.timer.seconds % 3600) / 60);
        const s = this.timer.seconds % 60;
        this.timerDisplay.textContent = [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
        
        if (this.timer.currentTaskIndex !== null && this.planning) {
            const task = this.planning.tarefas[this.timer.currentTaskIndex];
            const progress = Math.min((this.timer.seconds / (task.tempo_previsto_minutos * 60)) * 100, 100);
            if (this.timerTaskProgress) this.timerTaskProgress.style.width = `${progress}%`;
            if (this.timerTaskElapsed) this.timerTaskElapsed.textContent = this.formatSeconds(this.timer.seconds);
        }
    }

    formatSeconds(s) { return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`; }
    formatMinutes(m) { return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}min`; }

    openStudyModalWithTime(seconds, subjectName = '') {
        this.openStudyModal();
        setTimeout(() => {
            document.getElementById('studyTime').value = Math.ceil(seconds / 60);
            if (subjectName) {
                const opt = Array.from(this.studySubjectSelect.options).find(o => o.text === subjectName);
                if (opt) this.studySubjectSelect.value = opt.value;
            }
        }, 100);
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        document.getElementById('toastMessage').textContent = message;
        toast.className = `toast active ${type}`;
        setTimeout(() => toast.classList.remove('active'), 3000);
    }
}

document.addEventListener('DOMContentLoaded', () => { window.app = new StudyApp(); });
