/**
 * Projeto Federal - Application Logic
 * Versão Final: Correção de Layout e Navegação
 */

class StudyApp {
    constructor() {
        // Inicialização de Dados
        this.subjects = JSON.parse(localStorage.getItem('pf_subjects')) || [];
        this.history = JSON.parse(localStorage.getItem('pf_history')) || [];
        this.timer = JSON.parse(localStorage.getItem('pf_timer')) || { seconds: 0, running: false, lastUpdate: null };
        this.timerInterval = null;

        // Inicialização de Elementos e Eventos
        this.initElements();
        this.initEventListeners();
        
        // Estado Inicial de Renderização
        this.renderAll();

        // Se o timer estava a correr, retoma
        if (this.timer.running) this.startTimer();
    }

    initElements() {
        // Elementos Estruturais (Críticos para o Layout)
        this.sidebar = document.getElementById('sidebar');
        this.sidebarOverlay = document.getElementById('sidebarOverlay');
        this.toggleSidebarBtn = document.getElementById('toggleSidebar');
        this.mobileMenuBtn = document.getElementById('mobileMenuBtn');
        this.pageTitle = document.getElementById('pageTitle');
        
        // Navegação
        this.navItems = document.querySelectorAll('.nav-item');
        this.pages = document.querySelectorAll('.page');

        // Timer e Modais
        this.timerDisplay = document.getElementById('timerDisplay');
        this.startTimerBtn = document.getElementById('startTimerBtn');
        this.pauseTimerBtn = document.getElementById('pauseTimerBtn');
        this.modalOverlay = document.getElementById('modalOverlay');
    }

    initEventListeners() {
        // 1. Sidebar Desktop (Encolher/Expandir)
        if (this.toggleSidebarBtn) {
            this.toggleSidebarBtn.addEventListener('click', () => {
                // Esta classe 'collapsed' deve existir no seu CSS para ajustar o margin-left do conteúdo
                this.sidebar.classList.toggle('collapsed');
            });
        }

        // 2. Menu Mobile (Abrir sidebar lateral)
        if (this.mobileMenuBtn) {
            this.mobileMenuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.sidebar.classList.add('active');
                if (this.sidebarOverlay) this.sidebarOverlay.classList.add('active');
            });
        }

        // 3. Fechar Sidebar Mobile (Overlay)
        if (this.sidebarOverlay) {
            this.sidebarOverlay.addEventListener('click', () => {
                this.sidebar.classList.remove('active');
                this.sidebarOverlay.classList.remove('active');
            });
        }

        // 4. Navegação entre Páginas (Garante que o conteúdo não se sobreponha)
        this.navItems.forEach(item => {
            item.addEventListener('click', () => {
                const pageId = item.getAttribute('data-page');
                if (pageId) {
                    this.navigateTo(pageId);
                    
                    // No mobile, fecha a sidebar automaticamente após escolher
                    if (window.innerWidth <= 768) {
                        this.sidebar.classList.remove('active');
                        if (this.sidebarOverlay) this.sidebarOverlay.classList.remove('active');
                    }
                }
            });
        });

        // 5. Timer Controls
        if (this.startTimerBtn) this.startTimerBtn.addEventListener('click', () => this.startTimer());
        if (this.pauseTimerBtn) this.pauseTimerBtn.addEventListener('click', () => this.pauseTimer());
    }

    navigateTo(pageId) {
        // Remove 'active' de todas as páginas e botões de navegação
        this.pages.forEach(page => page.classList.remove('active'));
        this.navItems.forEach(nav => nav.classList.remove('active'));

        // Ativa apenas o alvo
        const targetPage = document.getElementById(`${pageId}-page`);
        const targetNav = document.querySelector(`.nav-item[data-page="${pageId}"]`);

        if (targetPage) {
            targetPage.classList.add('active');
            // Força o scroll para o topo para evitar layouts "cortados"
            window.scrollTo(0, 0);
        }

        if (targetNav) {
            targetNav.classList.add('active');
            if (this.pageTitle) {
                const span = targetNav.querySelector('span');
                this.pageTitle.textContent = span ? span.textContent : pageId;
            }
        }
    }

    // --- Lógica de Apoio ---

    startTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timer.running = true;
        
        // UI: Alterna visibilidade dos botões
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
        // Garante que a primeira página (Dashboard) está visível ao carregar
        const activeNav = document.querySelector('.nav-item.active');
        if (activeNav) {
            this.navigateTo(activeNav.getAttribute('data-page'));
        } else {
            this.navigateTo('dashboard');
        }
    }
}

// Inicializa a aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.app = new StudyApp();
});
