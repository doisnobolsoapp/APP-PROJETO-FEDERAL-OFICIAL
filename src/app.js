import './style.css';
/**
 * Projeto Federal - Application Logic
 * Versão Final: Sincronizada com Vite, Style.css e Vercel API
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
        this.initApiHandlers(); // Nova lógica para chamadas de IA
        
        // 3. Renderização Inicial
        this.navigateTo('dashboard');
        this.updateDashboardStats();
        
        // 4. Recuperação do Cronômetro
        if (this.timer.running) this.startTimer();
    }

    initElements() {
        this.sidebar = document.querySelector('.sidebar');
        this.sidebarOverlay = document.querySelector('.sidebar-overlay');
        this.toggleSidebarBtn = document.getElementById('toggleSidebar'); 
        this.mobileMenuBtn = document.getElementById('mobileMenuBtn');   
        
        this.navItems = document.querySelectorAll('.nav-item');
        this.pages = document.querySelectorAll('.page');
        this.pageTitle = document.getElementById('pageTitle');

        this.timerPanel = document.querySelector('.timer-panel');
        this.toggleTimerBtn = document.getElementById('toggleTimerBtn');
        this.timerDisplay = document.getElementById('timerDisplay');
        this.startTimerBtn = document.getElementById('startTimerBtn');
        this.pauseTimerBtn = document.getElementById('pauseTimerBtn');

        // Elementos do Parser (Edital)
        this.editalTextArea = document.getElementById('editalText');
        this.startParsingBtn = document.getElementById('startParsingBtn');
    }

    initEventListeners() {
        // Sidebar & Mobile
        this.toggleSidebarBtn?.addEventListener('click', () => this.sidebar.classList.toggle('collapsed'));
        this.mobileMenuBtn?.addEventListener('click', () => {
            this.sidebar.classList.add('active');
            this.sidebarOverlay?.classList.add('active');
        });
        this.sidebarOverlay?.addEventListener('click', () => {
            this.sidebar.classList.remove('active');
            this.sidebarOverlay.classList.remove('active');
        });

        // Navegação
        this.navItems.forEach(item => {
            item.addEventListener('click', () => {
                const pageId = item.getAttribute('data-page');
                if (pageId) {
                    this.navigateTo(pageId);
                    if (window.innerWidth <= 768) {
                        this.sidebar.classList.remove('active');
                        this.sidebarOverlay?.classList.remove('active');
                    }
                }
            });
        });

        // Timer
        this.toggleTimerBtn?.addEventListener('click', () => this.timerPanel?.classList.toggle('active'));
        this.startTimerBtn?.addEventListener('click', () => this.startTimer());
        this.pauseTimerBtn?.addEventListener('click', () => this.pauseTimer());
    }

    // --- Lógica de Integração com a API (Vercel Functions) ---
    initApiHandlers() {
        this.startParsingBtn?.addEventListener('click', async () => {
            const text = this.editalTextArea?.value;
            if (!text) return this.showToast('Cole o texto do edital primeiro!');

            this.startParsingBtn.disabled = true;
            this.startParsingBtn.textContent = 'Processando com IA...';

            try {
                // Chamada para a rota da Vercel que corrigimos no Vite
                const response = await fetch('/api/parse-edital', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text })
                });

                const data = await response.json();

                if (data && data.subjects && Array.isArray(data.subjects)) {
                    console.log("✅ Dados recebidos:", data);
                    localStorage.setItem('pf_subjects', JSON.stringify(this.subjects));
                    this.showToast('Edital processado com sucesso!');
                    this.navigateTo('dashboard');
                    this.updateDashboardStats();
                }
            } catch (error) {
                console.error('Erro na API:', error);
                this.showToast('Erro ao conectar com a IA.');
            } finally {
                this.startParsingBtn.disabled = false;
                this.startParsingBtn.textContent = 'Processar Edital';
            }
        });
    }

    navigateTo(pageId) {
        this.pages.forEach(page => {
            page.id === `${pageId}-page` ? page.classList.remove('hidden') : page.classList.add('hidden');
        });

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

    // --- Dashboard & Stats ---
    updateDashboardStats() {
        const timeEl = document.getElementById('totalStudyTime');
        const perfEl = document.getElementById('overallPerformance');
        
        if (timeEl) {
            const h = Math.floor(this.timer.seconds / 3600);
            const m = Math.floor((this.timer.seconds % 3600) / 60);
            timeEl.textContent = `${h}h ${m}min`;
        }
    }

    // --- Cronômetro ---
    startTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timer.running = true;
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

    showToast(message) {
        const toast = document.getElementById('toast');
        const msg = document.getElementById('toastMessage');
        if (toast && msg) {
            msg.textContent = message;
            toast.classList.add('active');
            setTimeout(() => toast.classList.remove('active'), 3000);
        }
    }
}

// Inicializa a aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.app = new StudyApp();
});
