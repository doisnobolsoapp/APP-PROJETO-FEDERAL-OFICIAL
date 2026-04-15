class StudyApp {
    constructor() {
        console.log("🚀 App inicializando...");

        this.subjects = JSON.parse(localStorage.getItem('pf_subjects')) || [];
        this.history = JSON.parse(localStorage.getItem('pf_history')) || [];

        this.initElements();
        this.initEventListeners();
        this.renderAll();

        console.log("✅ App pronto");
    }

    initElements() {
        this.navItems = document.querySelectorAll('.nav-item');
        this.pages = document.querySelectorAll('.page');
        this.pageTitle = document.getElementById('pageTitle');

        this.editalText = document.getElementById('editalText');
        this.startParsingBtn = document.getElementById('startParsingBtn');
        this.jsonOutput = document.getElementById('jsonOutput');
    }

    initEventListeners() {
        console.log("🎯 Eventos iniciados");

        this.navItems.forEach(item => {
            item.addEventListener('click', () => {
                const pageId = item.getAttribute('data-page');
                this.navigateTo(pageId);
            });
        });

        if (this.startParsingBtn) {
            this.startParsingBtn.addEventListener('click', () => {
                this.handleParsing();
            });
        }
    }

    // 🔥 CORREÇÃO PRINCIPAL AQUI
    navigateTo(pageId) {
        console.log("➡️ Navegando para:", pageId);

        // ativa menu
        this.navItems.forEach(item => {
            item.classList.toggle(
                'active',
                item.getAttribute('data-page') === pageId
            );
        });

        // mostra/esconde páginas (SEM QUEBRAR CSS)
        this.pages.forEach(page => {
            if (page.id === `${pageId}-page`) {
                page.classList.remove('hidden');
            } else {
                page.classList.add('hidden');
            }
        });

        // título
        if (this.pageTitle) {
            this.pageTitle.textContent =
                pageId === 'parser'
                    ? 'Importar Edital'
                    : 'Dashboard';
        }
    }

    renderAll() {
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

// INIT
document.addEventListener('DOMContentLoaded', () => {
    window.app = new StudyApp();
});
