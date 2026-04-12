/**
 * Projeto Federal - Application Logic
 * Versão Final: Sincronizada com Vite, Style.css e Vercel Build
 */

class StudyApp {
    constructor() {
        // 1. Estado da Aplicação (LocalStorage)
        this.subjects = JSON.parse(localStorage.getItem('pf_subjects')) || [];
        this.history = JSON.parse(localStorage.getItem('pf_history')) || [];
        this.timer = JSON.parse(localStorage.getItem('pf_timer')) || { seconds: 0, running: false };
        this.timerInterval = null;

        // 2. Inicialização
        this.initElements();
        this.initEventListeners();
        
        // 3. Renderização Inicial (Dashboard)
        this.navigateTo('dashboard');
        
        // 4. Recuperação do Cronômetro
        if (this.timer.running) this.startTimer();
    }

    initElements() {
        // Elementos de Layout (Essenciais para o style.css)
        this.sidebar = document.querySelector('.sidebar');
        this.sidebarOverlay = document.querySelector('.sidebar-overlay');
        this.toggleSidebarBtn = document.getElementById('toggleSidebar'); 
        this.mobileMenuBtn = document.getElementById('mobileMenuBtn');   
        
        // Navegação e Páginas
        this.navItems = document.querySelectorAll('.nav-item');
        this.pages = document.querySelectorAll('.page');
        this.pageTitle = document.getElementById('pageTitle');

        // Timer Panel (Usa a classe .active do seu CSS)
        this.timerPanel = document.querySelector('.timer-panel');
        this.toggleTimerBtn = document.getElementById('toggleTimerBtn');
        this.timerDisplay = document.getElementById('timerDisplay');
        this.startTimerBtn = document.getElementById('startTimerBtn');
        this.pauseTimerBtn = document.getElementById('pauseTimerBtn');
    }

    initEventListeners() {
        // Toggle Sidebar Desktop (.collapsed)
        if (this.toggleSidebarBtn) {
            this.toggleSidebarBtn.addEventListener('click', () => {
                this.sidebar.classList.toggle('collapsed');
            });
        }

        // Menu Mobile (.active)
        if (this.mobileMenuBtn) {
            this.mobileMenuBtn.addEventListener('click', () => {
                this.sidebar.classList.add('active');
                if (this.sidebarOverlay) this.sidebarOverlay.classList.add('active');
            });
        }

        // Overlay do Mobile
        if (this.sidebarOverlay) {
            this.sidebarOverlay.addEventListener('click', () => {
                this.sidebar.classList.remove('active');
                this.sidebarOverlay.classList.remove('active');
            });
        }

        // Navegação entre Páginas
        this.navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const pageId = item.getAttribute('data-page');
                if (pageId) {
                    this.navigateTo(pageId);
                    
                    // Fecha sidebar no mobile ao clicar em um link
                    if (window.innerWidth <= 768) {
                        this.sidebar.classList.remove('active');
                        if (this.sidebarOverlay) this.sidebarOverlay.classList.remove('active');
                    }
                }
            });
        });

        // Botão para abrir o painel do Timer
        if (this.toggleTimerBtn) {
            this.toggleTimerBtn.addEventListener('click', () => {
                if (this.timerPanel) this.timerPanel.classList.toggle('active');
            });
        }

        // Controles de Iniciar/Pausar
        if (this.startTimerBtn) this.startTimerBtn.addEventListener('click', () => this.startTimer());
        if (this.pauseTimerBtn) this.pauseTimerBtn.addEventListener('click', () => this.pauseTimer());
    }

    navigateTo(pageId) {
        // Usa a classe .hidden do seu style.css para esconder páginas inativas
        this.pages.forEach(page => {
            if (page.id === `${pageId}-page`) {
                page.classList.remove('hidden');
            } else {
                page.classList.add('hidden');
            }
        });

        // Gerencia qual item da sidebar está com estilo .active
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

    // --- Lógica do Cronômetro ---
    startTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timer.running = true;
        
        // Alterna os botões (Usa a classe .hidden ou style.display)
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
        const s = this.timer.
