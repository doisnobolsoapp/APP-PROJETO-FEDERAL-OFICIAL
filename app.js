/**
 * Projeto Federal - Application Logic
 * Versão Final Sincronizada com Vite & Style.css
 */

class StudyApp {
    constructor() {
        // 1. Estado (LocalStorage)
        this.subjects = JSON.parse(localStorage.getItem('pf_subjects')) || [];
        this.history = JSON.parse(localStorage.getItem('pf_history')) || [];
        this.timer = JSON.parse(localStorage.getItem('pf_timer')) || { seconds: 0, running: false };
        this.timerInterval = null;

        // 2. Inicialização de Elementos e Eventos
        this.initElements();
        this.initEventListeners();
        
        // 3. Estado Inicial: Dashboard visível por padrão
        this.navigateTo('dashboard');
        
        // 4. Retoma Timer se necessário
        if (this.timer.running) this.startTimer();
    }

    initElements() {
        // Seletores principais baseados no seu Style.css
        this.sidebar = document.querySelector('.sidebar');
        this.sidebarOverlay = document.querySelector('.sidebar-overlay');
        
        // IDs do HTML
        this.toggleSidebarBtn = document.getElementById('toggleSidebar'); 
        this.mobileMenuBtn = document.getElementById('mobileMenuBtn');   
        this.pageTitle = document.getElementById('pageTitle');

        // Coleções para Navegação
        this.navItems = document.querySelectorAll('.nav-item');
        this.pages = document.querySelectorAll('.page');

        // Timer Panel (Floating Timer)
        this.timerPanel = document.querySelector('.timer-panel');
        this.toggleTimerBtn = document.getElementById('toggleTimerBtn');
        this.timerDisplay = document.getElementById('timerDisplay');
        this.startTimerBtn = document.getElementById('startTimerBtn');
        this.pauseTimerBtn = document.getElementById('pauseTimerBtn');
    }

    initEventListeners() {
        // Toggle Sidebar Desktop (Classe .collapsed conforme style.css)
        if (this.toggleSidebarBtn) {
            this.toggleSidebarBtn.addEventListener('click', () => {
                this.sidebar.classList.toggle('collapsed');
            });
        }

        // Sidebar Mobile (Classe .active conforme style.css)
        if (this.mobileMenuBtn) {
            this.mobileMenuBtn.addEventListener('click', () => {
                this.sidebar.classList.add('active');
                if (this.sidebarOverlay) this.sidebarOverlay.classList.add('active');
            });
        }

        // Overlay Mobile
        if (this.sidebarOverlay) {
            this.sidebarOverlay.addEventListener('click', () => {
                this.sidebar.classList.remove('active');
                this.sidebarOverlay.classList.remove('active');
            });
        }

        // Navegação de Páginas
        this.navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const pageId = item.getAttribute('data-page');
                if (pageId) {
                    this.navigateTo(pageId);
                    
                    // Fecha sidebar no mobile após clique
                    if (window.innerWidth <= 768) {
                        this.sidebar.classList.remove('active');
                        if (this.sidebarOverlay) this.sidebarOverlay.classList.remove('active');
                    }
                }
            });
        });

        // Timer Toggle (.active conforme style.css)
        if (this.toggleTimerBtn) {
            this.toggleTimerBtn.addEventListener('click', () => {
                this.timerPanel.classList.toggle('active');
            });
        }

        // Controles do Timer
        if (this.startTimerBtn) this.startTimerBtn.addEventListener('click', () => this.startTimer());
        if (this.pauseTimerBtn) this.pauseTimerBtn.addEventListener('click', () => this.pauseTimer());
    }

    navigateTo(pageId) {
        // Aplica a classe .hidden definida no final do seu CSS
        this.pages.forEach(page => {
            if (page.id === `${pageId}-page`) {
                page.classList.remove('hidden');
            } else {
                page.classList.add('hidden');
            }
        });

        // Atualiza estado visual da sidebar
        this.navItems.forEach(nav => {
            if (nav.getAttribute('data-page') === pageId) {
                nav.classList.add('active');
                if (this.pageTitle) {
                    const span = nav.querySelector('span');
                    this.pageTitle.textContent = span ? span.textContent : pageId;
                }
            } else {
                nav.classList.remove('active');
            }
        });

        window.scrollTo(0, 0);
    }

    // --- Cronômetro ---
    startTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timer.running = true;
        
        if (this.startTimerBtn) this.startTimerBtn.classList.add('hidden');
        if (this.pauseTimerBtn) this.pauseTimerBtn.classList.remove('hidden');

        this.timerInterval = setInterval(() => {
            this.timer.seconds++;
            this.updateTimerDisplay();
            localStorage.setItem('pf_timer', JSON.stringify(this.timer));
        }, 1000);
    }

    pauseTimer() {
        this.timer.running = false;
        clearInterval(this.timerInterval);
        if (this.startTimerBtn) this.startTimerBtn.classList.remove('hidden');
        if (this.pauseTimerBtn) this.pauseTimerBtn.classList.add('hidden');
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
}

// Inicializa quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.app = new StudyApp();
});
