class StudyApp {
  constructor() {
    console.log("🚀 App PRO iniciando...");

    // ================= STORAGE =================
    this.subjects = JSON.parse(localStorage.getItem('pf_subjects')) || [];
    this.history = JSON.parse(localStorage.getItem('pf_history')) || [];
    this.simulados = JSON.parse(localStorage.getItem('pf_simulados')) || [];
    this.contest = JSON.parse(localStorage.getItem('pf_contest')) || {};

    this.initElements();
    this.initEvents();
    this.renderAll();

    console.log("✅ App PRO pronto");
  }

  // ================= ELEMENTOS =================
  initElements() {
    this.navItems = document.querySelectorAll('.nav-item');
    this.pages = document.querySelectorAll('.page');
    this.pageTitle = document.getElementById('pageTitle');

    this.editalText = document.getElementById('editalText');
    this.jsonOutput = document.getElementById('jsonOutput');

    this.subjectsGrid = document.getElementById('subjectsGrid');
    this.planningContainer = document.getElementById('planningContainer');
    this.mockTable = document.getElementById('mockExamsTableBody');
  }

  // ================= EVENTOS =================
  initEvents() {
    this.navItems.forEach(item => {
      item.addEventListener('click', () => {
        const page = item.dataset.page;
        this.navigate(page);
      });
    });

    const btnParse = document.getElementById('startParsingBtn');
    if (btnParse) btnParse.onclick = () => this.parseEdital();

    const btnNew = document.getElementById('newSubjectBtn');
    if (btnNew) btnNew.onclick = () => this.addSubject();

    const btnPlan = document.getElementById('generatePlanningBtn');
    if (btnPlan) btnPlan.onclick = () => this.generatePlanning();

    const btnMock = document.getElementById('addMockBtn');
    if (btnMock) btnMock.onclick = () => this.addMock();

    const btnContest = document.getElementById('saveContestBtn');
    if (btnContest) btnContest.onclick = () => this.saveContest();
  }

  // ================= NAVEGAÇÃO =================
  navigate(page) {
    this.navItems.forEach(i =>
      i.classList.toggle('active', i.dataset.page === page)
    );

    this.pages.forEach(p => p.classList.remove('active'));

    const target = document.getElementById(page + '-page');
    if (target) target.classList.add('active');

    const titles = {
      dashboard: "Dashboard",
      parser: "Importar Edital",
      subjects: "Disciplinas",
      planning: "Planejamento",
      'mock-exams': "Simulados",
      contest: "Concurso"
    };

    if (this.pageTitle) {
      this.pageTitle.textContent = titles[page] || "Projeto Federal";
    }
  }

  // ================= PARSER (PRO) =================
  parseEdital() {
    const text = this.editalText?.value?.trim();
    if (!text) {
      alert("Cole o edital");
      return;
    }

    const linhas = text.split('\n');
    const disciplinas = [];
    let atual = null;

    const generateId = () => {
      if (typeof crypto !== "undefined" && crypto.randomUUID) {
        return crypto.randomUUID();
      }
      return 'id-' + Date.now() + '-' + Math.floor(Math.random() * 100000);
    };

    linhas.forEach(raw => {
      let linha = raw.trim();
      if (!linha) return;

      const match = linha.match(/^\d*\.?\s*([A-ZÇÃÕÉÍÓÚ\s]+):/);

      if (match) {
        if (atual) disciplinas.push(atual);

        atual = {
          id: generateId(),
          title: match[1].trim(),
          content: linha.replace(match[0], '').trim(),
          progress: 0
        };

      } else if (atual) {
        atual.content += (atual.content ? ' ' : '') + linha;
      }
    });

    if (atual) disciplinas.push(atual);

    this.subjects = disciplinas.length > 0
      ? disciplinas
      : [{
          id: generateId(),
          title: "Conteúdo Geral",
          content: text,
          progress: 0
        }];

    this.save();
    this.renderSubjects();

    if (this.jsonOutput) {
      this.jsonOutput.textContent = JSON.stringify(this.subjects, null, 2);
    }
  }

  // ================= DISCIPLINAS =================
  addSubject() {
    const name = prompt("Nome da disciplina:");
    if (!name) return;

    this.subjects.push({
      id: Date.now(),
      title: name,
      content: "",
      progress: 0
    });

    this.save();
    this.renderSubjects();
  }

  renderSubjects() {
    if (!this.subjectsGrid) return;

    this.subjectsGrid.innerHTML = this.subjects.map(s => `
      <div class="card">
        <h3>${s.title}</h3>
        <p style="font-size:12px;color:#666;">
          ${(s.content || "").substring(0, 150)}...
        </p>
        <p><strong>Progresso:</strong> ${s.progress}%</p>
        <button onclick="app.study('${s.id}')">Estudar</button>
      </div>
    `).join('');
  }

  study(id) {
    const subject = this.subjects.find(s => s.id == id);
    if (!subject) return;

    subject.progress = Math.min(100, subject.progress + 10);

    this.history.push({
      subject: subject.title,
      date: new Date().toLocaleDateString()
    });

    this.save();
    this.renderAll();
  }

  // ================= PLANEJAMENTO =================
  generatePlanning() {
    if (!this.planningContainer) return;

    const plano = this.subjects.map((s, i) =>
      `Dia ${i + 1}: ${s.title}`
    );

    this.planningContainer.innerHTML = plano
      .map(p => `<div class="card">${p}</div>`)
      .join('');
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
      percent
    });

    this.save();
    this.renderMocks();
  }

  renderMocks() {
    if (!this.mockTable) return;

    this.mockTable.innerHTML = this.simulados.map(m => `
      <tr>
        <td>${new Date().toLocaleDateString()}</td>
        <td>${m.nome}</td>
        <td>${m.total}</td>
        <td>${m.acertos}</td>
        <td>${m.percent}%</td>
      </tr>
    `).join('');
  }

  // ================= CONCURSO =================
  saveContest() {
    this.contest = {
      nome: document.getElementById('contestName')?.value || '',
      cargo: document.getElementById('contestCargo')?.value || '',
      orgao: document.getElementById('contestOrgao')?.value || '',
      banca: document.getElementById('contestBanca')?.value || '',
      data: document.getElementById('contestDate')?.value || ''
    };

    localStorage.setItem('pf_contest', JSON.stringify(this.contest));
    this.renderContest();
  }

  renderContest() {
    const el = document.getElementById('contestInfo');
    if (!el || !this.contest.nome) return;

    el.innerHTML = `
      <div class="card">
        <h3>${this.contest.nome}</h3>
        <p><strong>Cargo:</strong> ${this.contest.cargo}</p>
        <p><strong>Órgão:</strong> ${this.contest.orgao}</p>
        <p><strong>Banca:</strong> ${this.contest.banca}</p>
        <p><strong>Prova:</strong> ${this.contest.data}</p>
      </div>
    `;
  }

  // ================= DASHBOARD =================
  renderDashboard() {
    const totalStudy = this.history.length * 30;

    const performance = this.simulados.length
      ? (this.simulados.reduce((a, b) => a + Number(b.percent), 0) / this.simulados.length).toFixed(1)
      : 0;

    const t = document.getElementById('totalStudyTime');
    const p = document.getElementById('overallPerformance');

    if (t) t.innerText = totalStudy + ' min';
    if (p) p.innerText = performance + '%';
  }

  // ================= SAVE =================
  save() {
    localStorage.setItem('pf_subjects', JSON.stringify(this.subjects));
    localStorage.setItem('pf_history', JSON.stringify(this.history));
    localStorage.setItem('pf_simulados', JSON.stringify(this.simulados));
  }

  // ================= RENDER =================
  renderAll() {
    this.renderSubjects();
    this.renderMocks();
    this.renderDashboard();
    this.renderContest();
    this.navigate('dashboard');
  }
}

// INIT
window.addEventListener('DOMContentLoaded', () => {
  window.app = new StudyApp();
});
