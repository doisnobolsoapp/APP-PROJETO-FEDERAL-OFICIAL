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

        console.log("📄 Páginas encontradas:", this.pages.length);
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

    // ✅ CORREÇÃO PRINCIPAL AQUI
    navigateTo(pageId) {
        console.log("➡️ Navegando para:", pageId);

        // ativa menu
        this.navItems.forEach(item => {
            item.classList.toggle(
                'active',
                item.getAttribute('data-page') === pageId
            );
        });

        // 🔥 CORREÇÃO: usa "active" (não hidden)
        this.pages.forEach(page => {
            if (page.id === `${pageId}-page`) {
                page.classList.add('active');
            } else {
                page.classList.remove('active');
            }
        });

        // título dinâmico
        if (this.pageTitle) {
            const titles = {
                dashboard: "Dashboard",
                parser: "Importar Edital",
                disciplinas: "Disciplinas",
                planejamento: "Planejamento",
                simulados: "Simulados"
            };

            this.pageTitle.textContent = titles[pageId] || "Projeto Federal";
        }
    }

    renderAll() {
        this.navigateTo('dashboard');
    }

    // 🔥 PARSER LOCAL (SEM IA)
    handleParsing() {
        const text = this.editalText?.value?.trim();

        if (!text) {
            alert("Cole o edital primeiro");
            return;
        }

        try {
            const disciplinas = text
                .split(/\n|,|;/)
                .map(l => l.trim())
                .filter(l => l.length > 3);

            const resultado = {
                verticalizado: disciplinas.map((d, i) => ({
                    disciplina: d,
                    topicos: [
                        {
                            id: String(i + 1),
                            descricao: "Tópico geral"
                        }
                    ]
                }))
            };

            if (this.jsonOutput) {
                this.jsonOutput.textContent = JSON.stringify(resultado, null, 2);
            }

            console.log("✅ Edital processado:", resultado);

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
