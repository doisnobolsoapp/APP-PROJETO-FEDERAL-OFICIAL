class StudyApp {
  constructor() {
    this.subjects = JSON.parse(localStorage.getItem('pf_subjects')) || [];
    this.planning = JSON.parse(localStorage.getItem('pf_planning')) || [];
    this.simulados = JSON.parse(localStorage.getItem('pf_simulados')) || [];

    this.init();
  }

  init() {
    this.bindEvents();
    this.renderAll();
  }

  bindEvents() {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => this.navigate(item.dataset.page));
    });

    document.getElementById('generatePlanningBtn')?.addEventListener('click', () => this.generatePlanning());
    document.getElementById('addMockBtn')?.addEventListener('click', () => this.addMock());
  }

  navigate(page) {
    document.querySelectorAll('.nav-item').forEach(i =>
      i.classList.toggle('active', i.dataset.page === page)
    );

    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(page + '-page')?.classList.add('active');

    document.getElementById('pageTitle').innerText = page.toUpperCase();
  }

  // 🔥 CICLO INTELIGENTE INTERCALADO
  generatePlanning() {
    if (!this.subjects.length) {
      alert("Adicione disciplinas primeiro");
      return;
    }

    let tarefas = [];
    let ciclo = 1;

    const formatos = ["Teoria", "Questões", "Revisão"];

    for (let i = 0; i < this.subjects.length; i++) {
      const s = this.subjects[i];

      formatos.forEach((f, index) => {
        tarefas.push({
          numero: ciclo++,
          disciplina: s.title,
          formato: f,
          descricao: `${s.title} - ${f}`,
          tempo: f === "Teoria" ? 60 : f === "Questões" ? 45 : 30,
          desempenho: 0,
          status: "pendente"
        });
      });
    }

    this.planning = tarefas;
    localStorage.setItem('pf_planning', JSON.stringify(tarefas));

    this.renderPlanning();
  }

  renderPlanning() {
    const tbody = document.getElementById('planningTable');
    if (!tbody) return;

    tbody.innerHTML = this.planning.map(t => `
      <tr onclick="app.toggleTask(${t.numero})">
        <td>${t.numero}</td>
        <td>${t.disciplina}</td>
        <td>${t.formato}</td>
        <td style="max-width:250px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
          ${t.descricao}
        </td>
        <td>${t.tempo} min</td>
        <td>${t.desempenho}%</td>
        <td>
          <span class="status ${t.status === 'pendente' ? 'pendente' : 'concluido'}">
            ${t.status}
          </span>
        </td>
      </tr>
    `).join('');
  }

  toggleTask(numero) {
    const tarefa = this.planning.find(t => t.numero === numero);
    if (!tarefa) return;

    tarefa.status = tarefa.status === "pendente" ? "concluido" : "pendente";
    tarefa.desempenho = tarefa.status === "concluido" ? 80 : 0;

    localStorage.setItem('pf_planning', JSON.stringify(this.planning));

    this.renderPlanning();
    this.renderDashboard();
  }

  // 🔥 DASHBOARD REAL
  renderDashboard() {
    const total = this.planning.length;
    const concluidas = this.planning.filter(t => t.status === "concluido").length;

    const percent = total ? Math.round((concluidas / total) * 100) : 0;

    document.getElementById('progressPercent').innerText = percent + '%';
    document.getElementById('progressFill').style.width = percent + '%';

    document.getElementById('totalStudyTime').innerText = (concluidas * 45) + " min";
  }

  addMock() {
    const nome = prompt("Nome:");
    const total = Number(prompt("Total:"));
    const acertos = Number(prompt("Acertos:"));

    if (!nome || !total) return;

    const percent = ((acertos / total) * 100).toFixed(1);

    this.simulados.push({ nome, percent });

    localStorage.setItem('pf_simulados', JSON.stringify(this.simulados));
    this.renderMocks();
  }

  renderMocks() {
    const tbody = document.getElementById('mockExamsTableBody');
    if (!tbody) return;

    tbody.innerHTML = this.simulados.map(m => `
      <tr>
        <td>${new Date().toLocaleDateString()}</td>
        <td>${m.nome}</td>
        <td>${m.percent}%</td>
      </tr>
    `).join('');
  }

  renderAll() {
    this.renderPlanning();
    this.renderDashboard();
    this.renderMocks();
  }
}

window.app = new StudyApp();
