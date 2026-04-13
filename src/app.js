class StudyApp {
    constructor() {
        console.log("🚀 App inicializando...");

        // Estado básico
        this.subjects = JSON.parse(localStorage.getItem('pf_subjects')) || [];
        this.history = JSON.parse(localStorage.getItem('pf_history')) || [];

        // Inicialização segura
        this.initElements();
        this.initEventListeners();

        // Render inicial
        this.renderAll();

        console.log("✅ App pronto");
    }

    initElements() {
        // 🔥 SEM QUEBRAR SE NÃO EXISTIR
        this.navItems = document.querySelectorAll('.nav-item');
        this.pages = document.querySelectorAll('.page');
        this.pageTitle = document.getElementById('pageTitle');

        this.editalText = document.getElementById('editalText');
        this.startParsingBtn = document.getElementById('startParsingBtn');
        this.jsonOutput = document.getElementById('jsonOutput');
    }

    initEventListeners() {
        console.log("🎯 Eventos iniciados");

        // Navegação
        this.navItems.forEach(item => {
            item.addEventListener('click', () => {
                const pageId = item.getAttribute('data-page');
                this.navigateTo(pageId);
            });
        });

        // Parser
        if (this.startParsingBtn) {
            this.startParsingBtn.addEventListener('click', () => {
                this.handleParsing();
            });
        }
    }

    navigateTo(pageId) {
        this.navItems.forEach(item => {
            item.classList.toggle(
                'active',
                item.getAttribute('data-page') === pageId
            );
        });

        this.pages.forEach(page => {
            page.style.display =
                page.id === `${pageId}-page` ? 'block' : 'none';
        });

        if (this.pageTitle) {
            this.pageTitle.textContent =
                pageId === 'parser' ? 'Importar Edital' : 'Dashboard';
        }
    }

    renderAll() {
        // Mostra dashboard por padrão
        this.navigateTo('dashboard');
    }

    async handleParsing() {
        const text = this.editalText?.value?.trim();

        if (!text) {
            alert("Cole o edital primeiro");
            return;
        }

        try {
            const res = await fetch('/api/parse-edital', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text,
                    metadata: { cargo: "Teste" }
                })
            });

            const data = await res.json();

            if (this.jsonOutput) {
                this.jsonOutput.textContent = JSON.stringify(data, null, 2);
            }

        } catch (err) {
            console.error(err);
            alert("Erro ao processar edital");
        }
    }
}

// 🔥 GARANTE EXECUÇÃO
document.addEventListener('DOMContentLoaded', () => {
    window.app = new StudyApp();
});
