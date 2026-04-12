/**
 * Projeto Federal - Application Logic
 * Versão Corrigida: Estabilidade de Layout e Navegação
 */

class StudyApp {
    constructor() {
        // 1. Estado (Data)
        this.subjects = JSON.parse(localStorage.getItem('pf_subjects')) || [];
        this.history = JSON.parse(localStorage.getItem('pf_history')) || [];
        this.timer = JSON.parse(localStorage.getItem('pf_timer')) || { seconds: 0, running: false, lastUpdate: null };
        this.timerInterval = null;

        // 2. Inicialização
        this.initElements();
        this.initEventListeners();
        this.renderAll();

        // 3. Recuperar Timer se estivesse ativo
        if (this.timer.running) this.startTimer();
    }

    initElements() {
        // Seletores de Layout
        this.sidebar = document.getElementById('sidebar');
        this.sidebarOverlay = document.getElementById('sidebarOverlay');
        this.toggleSidebarBtn = document.getElementById('toggleSidebar');
        this.mobileMenuBtn = document.getElementById('mobileMenuBtn');
        this.pageTitle = document.getElementById('pageTitle');
        
        // Navegação e Páginas
        this.navItems = document.querySelectorAll('.nav-item');
        this.pages = document.querySelectorAll('.page');

        // Timer
        this.timerDisplay = document.getElementById('timerDisplay');
        this.startTimerBtn = document.getElementById('startTimerBtn');
        this.pauseTimerBtn = document.getElementById('pauseTimerBtn');
        this.timerPanel = document.getElementById('timerPanel');
    }

    initEventListeners() {
        // Toggle Sidebar Desktop (Ajusta a largura do conteúdo automaticamente via CSS)
        if (this.toggleSidebarBtn) {
            this.toggleSidebarBtn.addEventListener('click', () => {
                this.sidebar.classList.toggle('collapsed');
            });
        }

        // Menu Mobile (Garante que a sidebar apareça por cima com o overlay)
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

        // Navegação entre Páginas (Corrige sobreposição de conteúdo)
        this.navItems.forEach(item => {
            item.addEventListener('click', () => {
                const pageId = item.getAttribute('data-page');
                if (pageId) this.navigateTo(pageId);
                
                // No mobile, fecha a sidebar ao clicar num item
                if (window.innerWidth <= 768) {
                    this.sidebar.classList.remove('active');
                    if (this.sidebarOverlay) this.sidebarOverlay.classList.remove('active');
                }
            });
        });

        // Controles do Timer
        if (this.startTimerBtn) this.startTimerBtn.addEventListener('click', () => this.startTimer());
        if (this.pauseTimerBtn) this.pauseTimerBtn.addEventListener('click', () => this.pauseTimer());
    }

    navigateTo(pageId) {
        // 1. Remove active de tudo
        this.pages.forEach(p => p.classList.remove('active'));
        this.navItems.forEach(n => n.classList.remove('active'));

        // 2. Adiciona active apenas ao alvo
        const targetPage = document.getElementById(`${pageId}-page`);
        const targetNav = document.querySelector(`.nav-item[data-page="${pageId}"]`);

        if (targetPage) targetPage.classList.add('active');
        if (targetNav) {
            targetNav.classList.add('active');
            if (this.pageTitle) this.pageTitle.textContent = targetNav.querySelector('span').textContent;
        }
        
        // Força o scroll para o topo ao mudar de página
        window.scrollTo(0, 0);
    }

    // --- Lógica do Cronómetro ---
    startTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timer.running = true;
        
        // UI Feedback
        if (this.startTimerBtn) this.startTimerBtn.style.display = 'none';
        if (this.pauseTimerBtn) this.pauseTimerBtn.style.display = 'flex';

        this.timerInterval = setInterval(() => {
            this.timer.seconds++;
            this.updateTimerDisplay();
            localStorage.setItem('pf_timer', JSON.stringify(this.timer));
        }, 1000);
    }

    pauseTimer() {
        this.timer.running = false;
        clearInterval(this.timerInterval);
        if (this.startTimerBtn) this.startTimerBtn.style.display = 'flex';
        if (this.pauseTimerBtn) this.pauseTimerBtn.style.display = 'none';
        localStorage.setItem('pf_timer', JSON.stringify(this.timer));
    }

    updateTimerDisplay() {
        if (!this.timerDisplay) return;
        const h = Math.floor(this.timer.seconds / 3600);
        const m = Math.floor((this.timer.seconds % 3600) / 60);
        const s = this.timer.seconds % 60;
        this.timerDisplay.textContent = 
            `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }

    renderAll() {
        this.updateTimerDisplay();
        // Chame aqui outras funções de preenchimento de dados se necessário
    }
}

document.addEventListener('DOMContentLoaded', () => { window.app = new StudyApp(); });
