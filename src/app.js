class StudyApp {
  constructor() {
    console.log("🚀 App PRO iniciando...");

    this.subjects = JSON.parse(localStorage.getItem('subjects')) || [];
    this.simulados = JSON.parse(localStorage.getItem('simulados')) || [];
    this.history = JSON.parse(localStorage.getItem('history')) || [];

    this.init();
  }

  // ================= INIT =================
  init() {
    this.bindEvents();
    this.renderAll();
  }

  // ================= EVENTOS =================
  bindEvents() {
    // MENU
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        const page = item.dataset.page;
        this.navigate(page);
      });
    });

    // BOTÕES (SEM OPTIONAL CHAINING ❌)
    const btnParse = document.getElementById('startParsingBtn');
    if (btnParse) {
      btnParse.addEventListener('click', () => this.parse());
    }

    const btnSubject = document.getElementById('newSubjectBtn');
    if (btnSubject) {
      btnSubject.addEventListener('click', () => this.addSubject());
    }

    const btnPlanning = document.getElementById('generatePlanningBtn');
    if (btnPlanning) {
      btnPlanning.addEventListener('click', () => this.generatePlanning());
    }

    const btnMock = document.getElementById('addMockBtn');
    if (btnMock) {
      btnMock.addEventListener('click', () => this.addMock());
    }
  }

  // ================= NAVEGAÇÃO =================
  navigate(page) {
    document.querySelectorAll('.page').forEach(p => {
      p.classList.remove('active');
    });

    const activePage = document.getElementById(`${page}-page`);
    if (activePage) {
      activePage.classList.add('active');
    }

    document.querySelectorAll('.nav-item').forEach(i => {
      i.classList.toggle('active', i.dataset.page === page);
    });

    const titles = {
      dashboard: "Dashboard",
      parser: "Importar Edital",
      subjects: "Disciplinas",
      planning: "Planejamento",
      "mock-exams": "Simulados"
    };

    const titleEl = document.getElementById('pageTitle');
    if (titleEl) {
      titleEl.textContent = titles[page] || "Projeto Federal";
    }
  }

  // ================= PARSER =================
  parse() {
    const textarea = document.getElementById('editalText');
    if (!textarea) return;

    const text = textarea.value.trim();

    if (!text) {
      alert("Cole o edital");
      return;
    }

    const disciplinas = text
      .split(/\n|,|;/)
      .map(t => t.trim())
      .filter(t => t.length > 3);

    this.subjects = disciplinas.map((d, i) => ({
      id: Date.now() + i,
      name: d,
      progress: 0
    }));

    this.save();
    this.renderSubjects();

    const output = document.getElementById('jsonOutput');
    if (output) {
      output.textContent = JSON.stringify(this.subjects, null, 2);
    }
  }

  // ================= DISCIPLINAS =================
  addSubject() {
    const name = prompt("Nome da disciplina:");
    if (!name) return;

    this.subjects.push({
      id: Date.now(),
      name,
      progress: 0
    });

    this.save();
    this.renderSubjects();
  }

  renderSubjects() {
    const el = document.getElementById('subjectsGrid');
    if (!el) return;

    el.innerHTML = this.subjects.map(s => `
      <div class="subject-card">
        <strong>${s.name}</strong>
        <div class="progress-bar">
          <div class="progress" style="width:${s.progress}%"></div>
        </div>
        <small>${s.progress}%</small>
        <br>
        <button onclick="app.study(${s.id})">Estudar</button>
      </div>
    `).join('');
  }

  study(id) {
    const subject = this.subjects.find(s => s.id == id);
    if (!subject) return;

    subject.progress = Math.min(100, subject.progress + 10);

    this.history.push({
      subject: subject.name,
      date: new Date().toLocaleDateString()
    });

    this.save();
    this.renderAll();
  }

  // ================= PLANEJAMENTO =================
  generatePlanning() {
    const el = document.getElementById('planningContainer');
    if (!el) return;

    el.innerHTML = this.subjects.map((s, i) => `
      <div class="card">
        Dia ${i + 1}: ${s.name}
      </div>
    `).join('');
  }

  // ================= SIMULADOS =================
  addMock() {
    const nome = prompt("Nome do simulado:");
    const total = Number(prompt("Total de questões:"));
    const acertos = Number(prompt("Acertos:"));

    if (!nome || !total) return;

    const percent = ((acertos / total) * 100).toFixed(1);

    this.simulados.push({
      nome,
      total,
      acertos,
      percent,
      date: new Date().toLocaleDateString()
    });

    this.save();
    this.renderMocks();
  }

  renderMocks() {
    const el = document.getElementById('mockExamsTableBody');
    if (!el) return;

    el.innerHTML = this.simulados.map(m => `
      <tr>
        <td>${m.date}</td>
        <td>${m.nome}</td>
        <td>${m.percent}%</td>
      </tr>
    `).join('');
  }

  // ================= DASHBOARD =================
  renderDashboard() {
    const timeEl = document.getElementById('totalStudyTime');
    const perfEl = document.getElementById('overallPerformance');

    if (timeEl) {
      timeEl.textContent = this.history.length * 30 + " min";
    }

    if (perfEl) {
      const avg = this.simulados.length
        ? this.simulados.reduce((a, b) => a + Number(b.percent), 0) / this.simulados.length
        : 0;

      perfEl.textContent = avg.toFixed(1) + "%";
    }
  }

  // ================= SAVE =================
  save() {
    localStorage.setItem('subjects', JSON.stringify(this.subjects));
    localStorage.setItem('simulados', JSON.stringify(this.simulados));
    localStorage.setItem('history', JSON.stringify(this.history));
  }

  // ================= RENDER =================
  renderAll() {
    this.renderSubjects();
    this.renderMocks();
    this.renderDashboard();
    this.navigate('dashboard');
  }
}

// INIT
window.addEventListener('DOMContentLoaded', () => {
  window.app = new StudyApp();
});
