/**
 * Projeto Federal - Recuperação de Layout
 */

class StudyApp {
    constructor() {
        // Recuperar dados
        this.subjects = JSON.parse(localStorage.getItem('pf_subjects')) || [];
        this.history = JSON.parse(localStorage.getItem('pf_history')) || [];
        this.timer = JSON.parse(localStorage.getItem('pf_timer')) || { seconds: 0, running: false };

        this.initElements();
        this.initEventListeners();
        
        // Garantir que o app comece na Dashboard sem quebrar o visual
        this.navigateTo('dashboard');
        console.log("Layout Restaurado.");
    }

    initElements() {
        // Elementos que controlam o visual (NÃO ALTERAR IDs)
        this.sidebar = document.getElementById('sidebar');
        this.sidebarOverlay = document.getElementById('sidebarOverlay');
        this.toggleSidebarBtn = document.getElementById('toggleSidebar');
        this.mobileMenuBtn = document.getElementById('mobileMenuBtn');
        this.pageTitle = document.getElementById('pageTitle');
        
        this.navItems = document.querySelectorAll('.nav-item');
        this.pages = document.querySelectorAll('.page');
    }

    initEventListeners() {
        // Desktop: Toggle que ajusta a largura (--sidebar-width)
        if (this.toggleSidebarBtn) {
            this.toggleSidebarBtn.addEventListener('click', () => {
                this.sidebar.classList.toggle('collapsed');
            });
        }

        // Mobile: Abre a gaveta lateral
        if (this.mobileMenuBtn) {
            this.mobileMenuBtn.addEventListener('click', () => {
                this.sidebar.classList.add('active');
                if (this.sidebarOverlay) this.sidebarOverlay.classList.add('active');
            });
        }

        // Mobile: Fecha ao clicar fora
        if (this.sidebarOverlay) {
            this.sidebarOverlay.addEventListener('click', () => {
                this.sidebar.classList.remove('active');
                this.sidebarOverlay.classList.remove('active');
            });
        }

        // Navegação: Troca de página sem sobreposição
        this.navItems.forEach(item => {
            item.addEventListener('click', () => {
                const pageId = item.getAttribute('data-page');
                if (pageId) {
                    this.navigateTo(pageId);
                    // No mobile, fecha a barra ao clicar
                    if (window.innerWidth <= 768) {
                        this.sidebar.classList.remove('active');
                        if (this.sidebarOverlay) this.sidebarOverlay.classList.remove('active');
                    }
                }
            });
        });
    }

    navigateTo(pageId) {
        // 1. Esconde todas as páginas (Garante que não fiquem uma sobre a outra)
        this.pages.forEach(p => p.classList.remove('active'));
        this.navItems.forEach(n => n.classList.remove('active'));

        // 2. Mostra a página alvo
        const targetPage = document.getElementById(`${pageId}-page`);
        const targetNav = document.querySelector(`.nav-item[data-page="${pageId}"]`);

        if (targetPage) {
            targetPage.classList.add('active');
        }

        if (targetNav) {
            targetNav.classList.add('active');
            if (this.pageTitle) {
                const span = targetNav.querySelector('span');
                this.pageTitle.textContent = span ? span.textContent : pageId;
            }
        }
        
        window.scrollTo(0, 0);
    }
}

// Inicia o sistema
document.addEventListener('DOMContentLoaded', () => {
    window.app = new StudyApp();
});
