/**
 * Projeto Federal - Application Logic
 * Corrigido para estabilidade de layout e navegação
 */

class StudyApp {
    constructor() {
        console.log("Projeto Federal: Initializing App...");
        
        // Estado inicial (LocalStorage)
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

        // Inicialização
        this.initElements();
        this.initEventListeners();
        this.renderAll();

        // Recuperar Timer se estava a correr
        if (this.timer.running && this.timer.lastUpdate) {
            const now = Date.now();
            const elapsed = Math.floor((now - this.timer.lastUpdate) / 1000);
            this.timer.seconds += elapsed;
            this.startTimer();
        }

        console.log("Projeto Federal: App Ready.");
    }

    initElements() {
        // Elementos de Layout (Essenciais para o CSS)
        this.sidebar = document.getElementById('sidebar');
        this.sidebarOverlay = document.getElementById('sidebarOverlay');
        this.toggleSidebarBtn = document.getElementById('toggleSidebar');
        this.mobileMenuBtn = document.getElementById('mobileMenuBtn');
        this.pageTitle = document.getElementById('pageTitle');
        
        // Coleções
        this.navItems = document.querySelectorAll('.nav-item');
        this.pages = document.querySelectorAll('.page');
        this.allModals = document.querySelectorAll('.modal');
        this.modalOverlay = document.getElementById('modalOverlay');

        // Dashboard/Stats
        this.totalStudyTimeEl = document.getElementById('totalStudyTime');
        this.overallPerformanceEl = document.getElementById('overallPerformance');
        this.overallProgressEl = document.getElementById('overallProgress');

        // Timer
        this.timerDisplay = document.getElementById('timerDisplay');
        this.startTimerBtn = document.getElementById('startTimerBtn');
        this.pauseTimerBtn = document.getElementById('pauseTimerBtn');
        this.timerPanel = document.getElementById('timerPanel');
    }

    initEventListeners() {
        // Sidebar Desktop
        if (this.toggleSidebarBtn) {
            this.toggleSidebarBtn.addEventListener('click', () => {
                this.sidebar.classList.toggle('collapsed');
            });
        }

        // Menu Mobile (Garante que o layout não quebre em telemóveis)
        if (this.mobileMenuBtn) {
            this.mobileMenuBtn.addEventListener('click', () => {
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

        // Navegação entre Páginas
        this.navItems.forEach(item => {
            item.addEventListener('click', () => {
                const pageId = item.getAttribute('data-page');
                if (pageId) this.navigateTo(pageId);
                
                // Fecha menu mobile após clicar
                this.sidebar.classList.remove('active');
                if (this.sidebarOverlay) this.sidebarOverlay.classList.remove('active');
            });
        });

        // Controles do Timer
        if (this.startTimerBtn) this.startTimerBtn.addEventListener('click', () => this.startTimer());
        if (this.pauseTimerBtn) this.pauseTimerBtn.addEventListener('click', () => this.pauseTimer());
        
        const toggleTimerBtn = document.getElementById('toggleTimerBtn');
        if (toggleTimerBtn) {
            toggleTimerBtn.addEventListener('click', () => {
                if (this.timerPanel) this.timerPanel.classList.toggle('active');
            });
        }

        // Fechar Modais
        document.querySelectorAll('.close-modal, .cancel-modal').forEach(btn => {
            btn.addEventListener('click', () => this.closeModals());
        });
    }

    navigateTo(pageId) {
        // Esconde todas as páginas e remove 'active' dos links
        this.pages.forEach(page => page.classList.remove('active'));
        this.navItems.forEach(item => item.classList.remove('active'));

        // Ativa a página correta
        const targetPage = document.getElementById(`${pageId}-page`);
        if (targetPage) targetPage.classList.add('active');

        // Ativa o link correto na sidebar
        const targetNav = document.querySelector(`.nav-item[data-page="${pageId}"]`);
        if (targetNav) {
            targetNav.classList.add('active');
            if (this.pageTitle) this.pageTitle.textContent = targetNav.querySelector('span').textContent;
        }
    }

    // --- Gestão de Modais ---
    closeModals() {
        this.allModals.forEach(modal => modal.classList.add('hidden'));
        if (this.modalOverlay) this.modalOverlay.classList.remove('active');
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
            if (this.modalOverlay) this.modalOverlay.classList.add('active');
        }
    }

    // --- Timer Logic ---
    startTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timer.running = true;
        
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

    // --- Data Persistence ---
    saveTimer() {
        localStorage.setItem('pf_timer', JSON.stringify(this.timer));
    }

    renderAll() {
        this.renderStats();
        this.updateTimerDisplay();
        // Adicione aqui as outras funções de renderização (renderSubjects, etc)
    }

    renderStats() {
        if (!this.totalStudyTimeEl) return;
        const totalMinutes = this.history.reduce((acc, curr) => acc + (curr.minutes || 0), 0);
        const h = Math.floor(totalMinutes / 60);
        const m = totalMinutes % 60;
        this.totalStudyTimeEl.textContent = `${h}h ${m.toString().padStart(2, '0')}m`;
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
}

// Inicialização Global
document.addEventListener('DOMContentLoaded', () => { 
    window.app = new StudyApp(); 
});
