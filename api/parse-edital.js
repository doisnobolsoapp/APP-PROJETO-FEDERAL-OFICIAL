parseEdital() {
  const text = this.editalText.value.trim();
  if (!text) return alert("Cole o edital");

  const linhas = text.split('\n');

  const disciplinas = [];
  let atual = null;

  linhas.forEach(linha => {
    linha = linha.trim();

    // 🔥 Detecta NOVA DISCIPLINA (TUDO MAIÚSCULO + :)
    if (/^[A-ZÇÃÕÉÍÓÚ\s]+:/.test(linha)) {
      if (atual) disciplinas.push(atual);

      atual = {
        id: Date.now() + Math.random(),
        name: linha,
        progress: 0
      };
    } else if (atual) {
      // 🔥 Continua conteúdo da disciplina
      atual.name += " " + linha;
    }
  });

  if (atual) disciplinas.push(atual);

  this.subjects = disciplinas;

  this.save();
  this.renderSubjects();

  this.jsonOutput.textContent = JSON.stringify(this.subjects, null, 2);
}
