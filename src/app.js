class StudyApp {
  constructor() {
    this.subjects = JSON.parse(localStorage.getItem('pf_subjects')) || [];
    this.planning = JSON.parse(localStorage.getItem('pf_planning')) || [];
    this.simulados = JSON.parse(localStorage.getItem('pf_simulados')) || [];
    this.history = [];

    this.init();
  }

  init() {
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.onclick = () => this.navigate(btn.dataset.page);
    });

    document.getElementById('generatePlanningBtn').onclick = () => this.generatePlanning();

    this.renderAll();
  }

  navigate(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(page + '-page').classList.add('active');
  }

  // 🔥 CICLO INTELIGENTE
  generatePlanning() {
    let tarefas = [];
    let ordem = [...this.subjects];

    let i = 1;

    ordem.forEach(s => {
      tarefas.push(this.task(i++, s.title, "Teórico", 60));
      tarefas.push(this.task(i++, s.title, "Questões", 45));
      tarefas.push(this.task(i++, s.title, "Revisão", 30));
    });

    this.planning = tarefas;
    localStorage.setItem('pf_planning', JSON.stringify(tarefas));

    this.renderPlanning();
  }

  task(n, disc, tipo, tempo) {
    return {
      numero: n,
      disciplina: disc,
      formato: tipo,
      descricao: `${disc} - ${tipo}`,
      tempo,
      desempenho: 0,
      status: "pendente"
    };
  }

  // 🔥 TABELA INTERATIVA
  renderPlanning() {
    const tbody = document.getElementById('planningTable');
    if (!tbody) return;

    tbody.innerHTML = this.planning.map(t => `
      <tr onclick="app.toggleTask(${t.numero})">
        <td>${t.numero}</td>
        <td>${t.disciplina}</td>
        <td>${t.formato}</td>
        <td>${t.descricao}</td>
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

  toggleTask(num) {
    const t = this.planning.find(x => x.numero === num);
    if (!t) return;

    t.status = t.status === "pendente" ? "concluido" : "pendente";
    t.desempenho = t.status === "concluido" ? 80 : 0;

    localStorage.setItem('pf_planning', JSON.stringify(this.planning));
    this.renderPlanning();
    this.renderDashboard();
  }

  // DASHBOARD
  renderDashboard() {
    const total = this.planning.filter(t => t.status === "concluido").length;
    const percent = this.planning.length ? Math.round((total / this.planning.length) * 100) : 0;

    document.getElementById('progressFill').style.width = percent + '%';
    document.getElementById('progressPercent').innerText = percent + '%';
  }

  renderAll() {
    this.renderPlanning();
    this.renderDashboard();
  }
}

window.app = new StudyApp();
