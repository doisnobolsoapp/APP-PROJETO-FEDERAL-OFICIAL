class StudyApp {
  constructor() {
    this.subjects = JSON.parse(localStorage.getItem('pf_subjects')) || [];
    this.planning = JSON.parse(localStorage.getItem('pf_planning')) || null;

    this.initElements();
    this.initEvents();
    this.renderAll();
  }

  initElements() {
    this.planningContainer = document.getElementById('planningContainer');
  }

  initEvents() {
    document.getElementById('generatePlanningBtn')
      ?.addEventListener('click', () => this.generatePlanning());
  }

  // ================= CICLO INTELIGENTE =================
  generatePlanning() {
    if (!this.subjects.length) {
      alert("Importe disciplinas primeiro");
      return;
    }

    const tarefas = [];
    let numero = 1;

    const formatos = [
      { tipo: "Teórico e Exercícios", tempo: 60 },
      { tipo: "Exercícios", tempo: 45 },
      { tipo: "Revisão", tempo: 30 }
    ];

    // 🔥 INTERCALAÇÃO INTELIGENTE
    for (let rodada = 0; rodada < 3; rodada++) {
      this.subjects.forEach((disciplina) => {

        const formato = formatos[rodada];

        tarefas.push({
          id: Date.now() + Math.random(),
          numero: numero++,
          disciplina: disciplina.title,
          formato: formato.tipo,
          descricao: `${disciplina.title} - ${formato.tipo}`,
          tempo_previsto_minutos: formato.tempo,
          tempo_estudado_minutos: 0,
          desempenho_percentual: 0,
          status: "pendente",
          data: new Date().toISOString()
        });

      });
    }

    this.planning = { tarefas };

    localStorage.setItem('pf_planning', JSON.stringify(this.planning));

    this.renderPlanning();
  }

  // ================= AÇÃO DE ESTUDO =================
  concluirTarefa(id) {
    const tarefa = this.planning.tarefas.find(t => t.id == id);
    if (!tarefa) return;

    tarefa.status = "concluido";
    tarefa.tempo_estudado_minutos = tarefa.tempo_previsto_minutos;

    // simulação desempenho
    tarefa.desempenho_percentual = Math.floor(Math.random() * 41) + 60;

    // 🔥 REORGANIZAÇÃO INTELIGENTE (NEUROCIÊNCIA)
    this.reordenarCiclo(tarefa.disciplina);

    localStorage.setItem('pf_planning', JSON.stringify(this.planning));

    this.renderPlanning();
  }

  // ================= REORGANIZAÇÃO DO CICLO =================
  reordenarCiclo(disciplina) {
    const tarefas = this.planning.tarefas;

    // remove próximas tarefas da mesma disciplina
    const restantes = tarefas.filter(t => t.disciplina !== disciplina || t.status === "concluido");

    const futuras = tarefas.filter(t => t.disciplina === disciplina && t.status === "pendente");

    // joga para o final (efeito de espaçamento)
    this.planning.tarefas = [...restantes, ...futuras];

    // reindexa
    this.planning.tarefas.forEach((t, i) => t.numero = i + 1);
  }

  // ================= RENDER =================
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
          ${this.planning.tarefas.map(t => `
            <tr onclick="app.concluirTarefa('${t.id}')">
              <td>${t.numero}</td>
              <td>${t.disciplina}</td>
              <td>${t.formato}</td>
              <td>${t.descricao}</td>
              <td>${this.formatTime(t.tempo_previsto_minutos)}</td>
              <td class="perf">${t.desempenho_percentual}%</td>
              <td>
                <span class="status ${t.status}">
                  ${t.status}
                </span>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  formatTime(min) {
    const h = String(Math.floor(min / 60)).padStart(2, '0');
    const m = String(min % 60).padStart(2, '0');
    return `${h}:${m}`;
  }

  renderAll() {
    this.renderPlanning();
  }
}

window.onload = () => window.app = new StudyApp();
