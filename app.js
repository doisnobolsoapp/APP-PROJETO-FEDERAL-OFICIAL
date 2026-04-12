/**
 * Projeto Federal - Application Logic
 * Sincronizado com o build do Vite e Style.css
 */

class StudyApp {
    constructor() {
        // Inicialização de Dados com Fallback
        this.subjects = JSON.parse(localStorage.getItem('pf_subjects')) || [];
        this.history = JSON.parse(localStorage.getItem('pf_history')) || [];
        this.timer = JSON.parse(localStorage.getItem('pf_timer')) || { seconds: 0, running: false };
        this.timerInterval = null;

        this.initElements();
        this.initEventListeners();
        
        // Estado Inicial: Força a página de Dashboard
        this.navigateTo('dashboard');
        
        // Recupera Timer se estivesse rodando
        if (this.timer.running) this.startTimer();
    }

    initElements() {
        // Elementos Estruturais (Críticos para o Layout no Style.css)
        this.sidebar = document.querySelector('.sidebar');
        this.sidebarOverlay = document.querySelector('.sidebar-overlay');
        this.mainContent = document.querySelector('.main-content');
        
        // Botões de Controle (Devem existir no seu HTML)
        this.toggleSidebarBtn = document.getElementById('toggleSidebar'); 
        this.mobileMenuBtn = document.getElementById('mobileMenuBtn');   
        
        // Navegação
        this.navItems = document.querySelectorAll('.nav-item');
        this.pages = document.querySelectorAll('.page');
        this.pageTitle = document.getElementById('pageTitle');

        // Timer e Modais
        this.timerPanel = document.querySelector('.timer-panel');
        this.toggleTimerBtn = document.getElementById('toggleTimerBtn');
        this.timerDisplay = document.getElementById('timerDisplay');
        this.startTimerBtn = document.getElementById('startTimerBtn');
        this.pauseTimerBtn = document.getElementById('pauseTimerBtn');
    }

    initEventListeners() {
        // 1. Sidebar Desktop (Toggle class .collapsed)
        if (this.toggleSidebarBtn) {
            this.toggleSidebarBtn.addEventListener('click', () => {
                this.sidebar.classList.toggle('collapsed');
            });
        }

        // 2. Sidebar Mobile (Toggle class .active)
        if (this.mobileMenuBtn) {
            this.mobileMenuBtn.addEventListener('click', () => {
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

        // 4. Navegação entre Páginas (Usa a classe .hidden do seu CSS)
        this.navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const pageId = item.getAttribute('data-page');
                if (pageId) {
                    this.navigateTo(pageId);
                    
                    // No mobile, fecha a sidebar ao selecionar
                    if (window.innerWidth <= 768) {
                        this.sidebar.classList.remove('active');
                        if (this.sidebarOverlay) this.sidebarOverlay.classList.remove('active');
                    }
                }
            });
        });

        // 5. Timer Panel (Abre/Fecha usando .active)
        if (this.toggleTimerBtn) {
            this.toggleTimerBtn.addEventListener('click', () => {
                if (this.timerPanel) this.timerPanel.classList.toggle('active');
            });
        }

        // 6. Controles do Cronômetro
        if (this.startTimerBtn) this.startTimerBtn.addEventListener('click', () => this.startTimer());
        if (this.pauseTimerBtn) this.pauseTimerBtn.addEventListener('click', () => this.pauseTimer());
    }

    navigateTo(pageId) {
        // Gerencia visibilidade das páginas usando .hidden do style.css
        this.pages.forEach(page => {
            if (page.id === `${pageId}-page`) {
                page.classList.remove('hidden');
            } else {
                page.classList.add('hidden');
            }
        });

        // Gerencia estado visual dos botões na sidebar
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

    // --- Funcionalidades do Timer ---
    startTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timer.running = true;
        
        // UI: Troca botões usando display ou hidden
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
}

// Inicialização segura após o carregamento do DOM
document.addEventListener('DOMContentLoaded', () => {
    window.app = new StudyApp();
});
