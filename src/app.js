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

        // Verificação de elementos críticos
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
                    const td = e.target.closest('td');
                    const field = td ? td.getAttribute('data-label') : null;
                    
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

        if (this.startTimerBtn) this.startTimerBtn.addEventListener('click', () => this.startTimer());
        if (this.pauseTimerBtn) this.pauseTimerBtn.addEventListener('click', () => this.pauseTimer());
        if (this.resetTimerBtn) this.resetTimerBtn.addEventListener('click', () => this.resetTimer());

        // PWA
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            if (this.installContainer) this.installContainer.style.display = 'block';
        });

        if (this.installBtn) {
            this.installBtn.addEventListener('click', async () => {
                if (!this.deferredPrompt) return;
                this.deferredPrompt.prompt();
                await this.deferredPrompt.userChoice;
                this.deferredPrompt = null;
                if (this.installContainer) this.installContainer.style.display = 'none';
            });
        }

        if (this.timer.running) {
            const now = Date.now();
            const elapsed = Math.floor((now - this.timer.lastUpdate) / 1000);
            this.timer.seconds += elapsed;
            this.startTimer();
        } else {
            this.updateTimerDisplay();
            if (this.settings.autoFollowPlanning) this.syncTimerWithPlanning();
        }
    }

    // --- Core Logic ---

    async handleParsing() {
        const text = this.editalText.value.trim();
        if (!text) {
            this.showToast('Por favor, cole o conteúdo do edital.', 'error');
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
            // Garantir que a chamada aponte para a rota correta do Vercel Serverless
            const response = await fetch('/api/parse-edital', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, metadata })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Erro ${response.status}: Servidor indisponível`);
            }

            const result = await response.json();
            this.parsedData = result;
            
            this.jsonOutput.textContent = JSON.stringify(result, null, 2);
            this.parserResult.classList.remove('hidden');
            this.showToast('Edital processado com sucesso!');
        } catch (error) {
            console.error('Erro no parsing:', error);
            this.showToast(error.message, 'error');
        } finally {
            this.startParsingBtn.disabled = false;
            this.startParsingBtn.innerHTML = '<i class="fas fa-bolt"></i> Processar com IA';
        }
    }

    importParsedData() {
        if (!this.parsedData) return;

        const newSubjects = this.parsedData.verticalizado.map(item => ({
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
        }));

        this.subjects = [...this.subjects, ...newSubjects];
        this.saveData();
        this.renderAll();
        this.navigateTo('dashboard');
        this.showToast('Dados importados com sucesso!');
        this.parserResult.classList.add('hidden');
        this.parsedData = null;
    }

    navigateTo(pageId) {
        this.navItems.forEach(item => {
            const itemPage = item.getAttribute('data-page');
            if (itemPage === pageId) {
                item.classList.add('active');
                this.pageTitle.textContent = item.querySelector('span').textContent;
            } else {
                item.classList.remove('active');
            }
        });

        this.pages.forEach(page => {
            page.classList.toggle('active', page.id === `${pageId}-page`);
        });
    }

    saveData() {
        localStorage.setItem('pf_subjects', JSON.stringify(this.subjects));
        localStorage.setItem('pf_history', JSON.stringify(this.history));
        localStorage.setItem('pf_mock_exams', JSON.stringify(this.mockExams));
        localStorage.setItem('pf_planning', JSON.stringify(this.planning));
    }

    saveSettings() { localStorage.setItem('pf_settings', JSON.stringify(this.settings)); }
    saveTimer() { localStorage.setItem('pf_timer', JSON.stringify(this.timer)); }

    handleSubjectSubmit(e) {
        e.preventDefault();
        const id = document.getElementById('editSubjectId').value;
        const name = document.getElementById('subjectName').value;
        const goal = parseFloat(document.getElementById('subjectGoal').value) || 0;

        if (id) {
            const index = this.subjects.findIndex(s => s.id === id);
            if (index !== -1) this.subjects[index] = { ...this.subjects[index], name, goal };
        } else {
            this.subjects.push({
                id: Date.now().toString(),
                name, goal, totalMinutes: 0, totalQuestions: 0, totalCorrect: 0
            });
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

        this.history.unshift({
            id: Date.now().toString(), subjectId, subjectName: subject.name,
            minutes, date, questions, correct
        });
        
        subject.totalMinutes += minutes;
        subject.totalQuestions += questions;
        subject.totalCorrect += correct;

        this.saveData();
        this.renderAll();
        this.closeModals();
        this.showToast('Estudo registrado!');
    }

    // --- Rendering Helpers ---

    renderAll() {
        this.renderStats();
        this.renderSubjects();
        this.renderHistory();
        this.renderMockExams();
        this.renderPlanning();
        this.renderAnnouncement();
        this.updateSubjectSelect();
    }

    renderStats() {
        const totalMinutes = this.history.reduce((acc, curr) => acc + curr.minutes, 0);
        this.totalStudyTimeEl.textContent = `${Math.floor(totalMinutes / 60)}h ${(totalMinutes % 60).toString().padStart(2, '0')}m`;

        const totalQ = this.history.reduce((acc, curr) => acc + curr.questions, 0);
        const totalC = this.history.reduce((acc, curr) => acc + curr.correct, 0);
        this.overallPerformanceEl.textContent = `${totalQ > 0 ? Math.round((totalC / totalQ) * 100) : 0}%`;
    }

    // --- Timer & Utils ---

    startTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
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
    }

    updateTimerDisplay() {
        const h = Math.floor(this.timer.seconds / 3600);
        const m = Math.floor((this.timer.seconds % 3600) / 60);
        const s = this.timer.seconds % 60;
        this.timerDisplay.textContent = [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        const toastMsg = document.getElementById('toastMessage');
        if (toast && toastMsg) {
            toastMsg.textContent = message;
            toast.className = `toast active ${type}`;
            setTimeout(() => toast.classList.remove('active'), 3000);
        }
    }

    // Nota: Removi métodos repetitivos de render para brevidade, 
    // mantenha os que você já tinha funcionais no seu arquivo original.
}

document.addEventListener('DOMContentLoaded', () => { window.app = new StudyApp(); });
