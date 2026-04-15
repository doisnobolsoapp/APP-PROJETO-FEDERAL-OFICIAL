class StudyApp {
  constructor() {
    this.subjects = JSON.parse(localStorage.getItem('subjects')) || [];
    this.simulados = JSON.parse(localStorage.getItem('simulados')) || [];
    this.history = JSON.parse(localStorage.getItem('history')) || [];

    this.init();
  }

  init() {
    this.bindEvents();
    this.renderAll();
  }

  bindEvents() {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.onclick = () => this.navigate(item.dataset.page);
    });

    document.getElementById('startParsingBtn')?.onclick = () => this.parse();
    document.getElementById('newSubjectBtn')?.onclick = () => this.addSubject();
    document.getElementById('generatePlanningBtn')?.onclick = () => this.generatePlanning();
    document.getElementById('addMockBtn')?.onclick = () => this.addMock();
  }

  navigate(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(page + '-page')?.classList.add('active');

    document.querySelectorAll('.nav-item').forEach(i =>
      i.classList.toggle('active', i.dataset.page === page)
    );
  }

  parse() {
    const text = document.getElementById('editalText').value;
    const disciplinas = text.split(/\n|,/).filter(x => x.length > 3);

    this.subjects = disciplinas.map(d => ({
      id: Date.now() + Math.random(),
      name: d,
      progress: 0
    }));

    this.save();
    this.renderSubjects();
  }

  addSubject() {
    const name = prompt("Disciplina:");
    if (!name) return;

    this.subjects.push({ id: Date.now(), name, progress: 0 });
    this.save();
    this.renderSubjects();
  }

  renderSubjects() {
    const el = document.getElementById('subjectsGrid');
    if (!el) return;

    el.innerHTML = this.subjects.map(s => `
      <div class="subject-card">
        <strong>${s.name}</strong>
        <br>
        ${s.progress}%
        <br>
        <button onclick="app.study(${s.id})">+10%</button>
      </div>
    `).join('');
  }

  study(id) {
    const s = this.subjects.find(x => x.id == id);
    if (!s) return;

    s.progress = Math.min(100, s.progress + 10);
    this.history.push({ date: new Date() });

    this.save();
    this.renderAll();
  }

  generatePlanning() {
    const el = document.getElementById('planningContainer');

    el.innerHTML = this.subjects.map((s,i) =>
      `<div class="card">Dia ${i+1}: ${s.name}</div>`
    ).join('');
  }

  addMock() {
    const nome = prompt("Nome:");
    const score = prompt("%:");

    this.simulados.push({ nome, score, date: new Date().toLocaleDateString() });
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
        <td>${m.score}%</td>
      </tr>
    `).join('');
  }

  renderDashboard() {
    document.getElementById('totalStudyTime').innerText =
      this.history.length * 30 + " min";

    const avg = this.simulados.length
      ? this.simulados.reduce((a,b)=>a+Number(b.score),0)/this.simulados.length
      : 0;

    document.getElementById('overallPerformance').innerText =
      avg.toFixed(1) + "%";
  }

  renderAll() {
    this.renderSubjects();
    this.renderMocks();
    this.renderDashboard();
  }

  save() {
    localStorage.setItem('subjects', JSON.stringify(this.subjects));
    localStorage.setItem('simulados', JSON.stringify(this.simulados));
    localStorage.setItem('history', JSON.stringify(this.history));
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.app = new StudyApp();
});
