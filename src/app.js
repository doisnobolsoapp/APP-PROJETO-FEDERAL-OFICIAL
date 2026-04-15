class StudyApp {
  constructor() {
    console.log("🚀 App PRO iniciando...");

    this.subjects = JSON.parse(localStorage.getItem('pf_subjects')) || [];
    this.history = JSON.parse(localStorage.getItem('pf_history')) || [];
    this.simulados = JSON.parse(localStorage.getItem('pf_simulados')) || [];
    this.contest = JSON.parse(localStorage.getItem('pf_contest')) || {};
    this.planning = JSON.parse(localStorage.getItem('pf_planning')) || null;

    this.initElements();
    this.initEvents();
    this.renderAll();

    console.log("✅ App PRO pronto");
  }

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

  initEvents() {
    this.navItems.forEach(item => {
      item.addEventListener('click', () => this.navigate(item.dataset.page));
    });

    document.getElementById('startParsingBtn')?.addEventListener('click', () => this.parseEdital());
    document.getElementById('newSubjectBtn')?.addEventListener('click', () => this.addSubject());
    document.getElementById('generatePlanningBtn')?.addEventListener('click', () => this.generatePlanning());
    document.getElementById('addMockBtn')?.addEventListener('click', () => this.addMock());
    document.getElementById('saveContestBtn')?.addEventListener('click', () => this.saveContest());
  }

  navigate(page) {
    this.navItems.forEach(i => i.classList.toggle('active', i.dataset.page === page));
    this.pages.forEach(p => p.classList.remove('active'));
    document.getElementById(page + '-page')?.classList.add('active');

    const titles = {
      dashboard: "Dashboard",
      parser: "Importar Edital",
      subjects: "Disciplinas",
      planning: "Planejamento",
      'mock-exams': "Simulados",
      contest: "Concurso"
    };

    this.pageTitle.textContent = titles[page] || "Projeto Federal";
  }

  parseEdital() {
    const text = this.editalText?.value?.trim();
    if (!text) return alert("Cole o edital");

    const linhas = text.split('\n');
    const disciplinas = [];
    let atual = null;

    const generateId = () => 'id-' + Date.now() + '-' + Math.random();

    linhas.forEach(linha => {
      linha = linha.trim();
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
        atual.content += " " + linha;
      }
    });

    if (atual) disciplinas.push(atual);

    this.subjects = disciplinas.length ? disciplinas : [{
      id: generateId(),
      title: "Conteúdo Geral",
      content: text,
      progress: 0
    }];

    this.save();
    this.renderSubjects();
  }

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
        <p>${(s.content || "").substring(0, 100)}...</p>
        <p><strong>${s.progress}%</strong></p>
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

  // 🔥 PLANEJAMENTO PRO TABELA
  generatePlanning() {
    if (!this.subjects.length) {
      alert("Importe disciplinas primeiro");
      return;
    }

    const tarefas = [];
    let ciclo = 1;

    this.subjects.forEach(s => {
      tarefas.push(this.createTask(ciclo++, s.title, "teoria", 60));
      tarefas.push(this.createTask(ciclo++, s.title, "questoes", 45));
      tarefas.push(this.createTask(ciclo++, s.title, "revisao", 30, "24h"));
      tarefas.push(this.createTask(ciclo++, s.title, "revisao", 30, "7d"));
    });

    this.planning = {
      tarefas
    };

    localStorage.setItem('pf_planning', JSON.stringify(this.planning));
    this.renderPlanning();
  }

  createTask(ciclo, disciplina, formato, tempo, extra = "") {
    return {
      ciclo,
      disciplina,
      formato,
      descricao: `${disciplina} - ${formato} ${extra}`,
      tempo_previsto_minutos: tempo,
      desempenho_percentual: 0,
      status: "pendente"
    };
  }

  renderPlanning() {
    if (!this.planningContainer || !this.planning) return;

    this.planningContainer.innerHTML = `
      <table class="planning-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Disciplina</th>
            <th>Formato</th>
            <th>Descrição</th>
            <th>Tempo</th>
            <th>Desempenho</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${this.planning.tarefas.map((t, i) => `
            <tr>
              <td>${i + 1}</td>
              <td>${t.disciplina}</td>
              <td>${t.formato}</td>
              <td>${t.descricao}</td>
              <td>${t.tempo_previsto_minutos} min</td>
              <td class="danger">${t.desempenho_percentual}%</td>
              <td><span class="status ${t.status}">${t.status}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  addMock() {
    const nome = prompt("Nome:");
    const total = Number(prompt("Total:"));
    const acertos = Number(prompt("Acertos:"));

    if (!nome || !total) return;

    const percent = ((acertos / total) * 100).toFixed(1);
    this.simulados.push({ nome, percent });

    this.save();
    this.renderMocks();
  }

  renderMocks() {
    if (!this.mockTable) return;

    this.mockTable.innerHTML = this.simulados.map(m => `
      <tr>
        <td>${new Date().toLocaleDateString()}</td>
        <td>${m.nome}</td>
        <td>${m.percent}%</td>
      </tr>
    `).join('');
  }

  saveContest() {
    this.contest = {
      nome: document.getElementById('contestName')?.value || '',
      cargo: document.getElementById('contestCargo')?.value || '',
      orgao: document.getElementById('contestOrgao')?.value || '',
      banca: document.getElementById('contestBanca')?.value || '',
      data: document.getElementById('contestDate')?.value || ''
    };

    localStorage.setItem('pf_contest', JSON.stringify(this.contest));
  }

  renderDashboard() {
    const totalStudy = this.history.length * 30;
    const performance = this.simulados.length
      ? (this.simulados.reduce((a, b) => a + Number(b.percent), 0) / this.simulados.length).toFixed(1)
      : 0;

    document.getElementById('totalStudyTime').innerText = totalStudy + ' min';
    document.getElementById('overallPerformance').innerText = performance + '%';
  }

  save() {
    localStorage.setItem('pf_subjects', JSON.stringify(this.subjects));
    localStorage.setItem('pf_history', JSON.stringify(this.history));
    localStorage.setItem('pf_simulados', JSON.stringify(this.simulados));
  }

  renderAll() {
    this.renderSubjects();
    this.renderMocks();
    this.renderDashboard();
    this.renderPlanning();
    this.navigate('dashboard');
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.app = new StudyApp();
});
