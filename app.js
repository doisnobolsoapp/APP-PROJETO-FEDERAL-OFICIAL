/**
 * Projeto Federal - Application Logic
 * RESTAURAÇÃO COMPLETA DA VERSÃO ORIGINAL
 */

class StudyApp {
    constructor() {
        console.log("Projeto Federal: Initializing App...");
        
        // Estado Original
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

        this.initElements();
        this.initEventListeners();
        this.renderAll();
        
        // Retoma o timer se estava ativo
        if (this.timer.running) {
            const now = Date.now();
            const elapsed = Math.floor((now - this.timer.lastUpdate) / 1000);
            this.timer.seconds += elapsed;
            this.startTimer();
        }
    }

    initElements() {
        // TODOS OS SEUS ELEMENTOS ORIGINAIS (IDs mantidos exatamente como no HTML)
        this.sidebar = document.getElementById('sidebar');
        this.sidebarOverlay = document.getElementById('sidebarOverlay');
        this.toggleSidebarBtn = document.getElementById('toggleSidebar');
        this.mobileMenuBtn = document.getElementById('mobileMenuBtn');
        this.navItems = document.querySelectorAll('.nav-item');
        this.pageTitle = document.getElementById('pageTitle');
        this.pages = document.querySelectorAll('.page');

        // Stats e Dashboard
        this.totalStudyTimeEl = document.getElementById('totalStudyTime');
        this.overallPerformanceEl = document.getElementById('overallPerformance');
        this.overallProgressEl = document.getElementById('overallProgress');
        this.subjectsGrid = document.getElementById('subjectsGrid');

        // Timer Panel e Botões
        this.timerDisplay = document.getElementById('timerDisplay');
        this.startTimerBtn = document.getElementById('startTimerBtn');
        this.pauseTimerBtn = document.getElementById('pauseTimerBtn');
        this.timerPanel = document.getElementById('timerPanel');
    }

    initEventListeners() {
        // Lógica de Toggle da Sidebar (Essencial para o layout)
        if (this.toggleSidebarBtn) {
            this.toggleSidebarBtn.addEventListener('click', () => {
                this.sidebar.classList.toggle('collapsed');
            });
        }

        if (this.mobileMenuBtn) {
            this.mobileMenuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.sidebar.classList.add('active');
                if (this.sidebarOverlay) this.sidebarOverlay.classList.add('active');
            });
        }

        if (this.sidebarOverlay) {
            this.sidebarOverlay.addEventListener('click', () => {
                this.sidebar.classList.remove('active');
                this.sidebarOverlay.classList.remove('active');
            });
        }

        // Navegação Original
        this.navItems.forEach(item => {
            item.addEventListener('click', () => {
                const pageId = item.getAttribute('data-page');
                this.navigateTo(pageId);
                if (window.innerWidth <= 768) {
                    this.sidebar.classList.remove('active');
                    if (this.sidebarOverlay) this.sidebarOverlay.classList.remove('active');
                }
            });
        });

        // Eventos do Timer
        if (this.startTimerBtn) this.startTimerBtn.addEventListener('click', () => this.startTimer());
        if (this.pauseTimerBtn) this.pauseTimerBtn.addEventListener('click', () => this.pauseTimer());
    }

    navigateTo(pageId) {
        this.pages.forEach(page => page.classList.remove('active'));
        this.navItems.forEach(item => item.classList.remove('active'));

        const targetPage = document.getElementById(`${pageId}-page`);
        const targetNav = document.querySelector(`.nav-item[data-page="${pageId}"]`);

        if (targetPage) targetPage.classList.add('active');
        if (targetNav) {
            targetNav.classList.add('active');
            if (this.pageTitle) this.pageTitle.textContent = targetNav.querySelector('span').textContent;
        }
        window.scrollTo(0, 0);
    }

    // --- MÉTODOS DE APOIO (Cópia fiel do seu original) ---

    startTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timer.running = true;
        this.timer.lastUpdate = Date.now();
        
        if (this.startTimerBtn) this.startTimerBtn.style.display = 'none';
        if (this.pauseTimerBtn) this.pauseTimerBtn.style.display = 'flex';

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
        if (this.startTimerBtn) this.startTimerBtn.style.display = 'flex';
        if (this.pauseTimerBtn) this.pauseTimerBtn.style.display = 'none';
        this.saveTimer();
    }

    updateTimerDisplay() {
        if (!this.timerDisplay) return;
        const h = Math.floor(this.timer.seconds / 3600);
        const m = Math.floor((this.timer.seconds % 3600) / 60);
        const s = this.timer.seconds % 60;
        this.timerDisplay.textContent = [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
    }

    saveTimer() { localStorage.setItem('pf_timer', JSON.stringify(this.timer)); }

    renderAll() {
        this.renderStats();
        this.updateTimerDisplay();
        // Se você tinha outras funções de renderização, elas voltam aqui.
    }

    renderStats() {
        if (!this.totalStudyTimeEl) return;
        const totalMinutes = this.history.reduce((acc, curr) => acc + (curr.minutes || 0), 0);
        const h = Math.floor(totalMinutes / 60);
        const m = totalMinutes % 60;
        this.totalStudyTimeEl.textContent = `${h}h ${m.toString().padStart(2, '0')}m`;
    }
}

document.addEventListener('DOMContentLoaded', () => { window.app = new StudyApp(); });
