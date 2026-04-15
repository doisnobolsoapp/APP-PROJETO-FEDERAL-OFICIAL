parseEdital() {
  const text = this.editalText?.value?.trim();
  if (!text) return alert("Cole o edital");

  const linhas = text.split('\n');

  const disciplinas = [];
  let atual = null;

  linhas.forEach(linha => {
    linha = linha.trim();
    if (!linha) return;

    // 🔥 Detecta disciplina (aceita número antes e letras maiúsculas)
    const match = linha.match(/^\d*\s*([A-ZÇÃÕÉÍÓÚ\s]+):/);

    if (match) {
      if (atual) disciplinas.push(atual);

      atual = {
        id: crypto.randomUUID(), // 🔥 ID PROFISSIONAL
        title: match[1].trim(),  // 🔥 só o nome da disciplina
        content: linha.replace(match[0], '').trim(), // 🔥 conteúdo separado
        progress: 0
      };
    } else if (atual) {
      // continua conteúdo
      atual.content += " " + linha;
    }
  });

  if (atual) disciplinas.push(atual);

  // 🔥 fallback (caso não detecte disciplinas)
  if (disciplinas.length === 0) {
    this.subjects = [{
      id: crypto.randomUUID(),
      title: "Conteúdo Geral",
      content: text,
      progress: 0
    }];
  } else {
    this.subjects = disciplinas;
  }

  this.save();
  this.renderSubjects();

  if (this.jsonOutput) {
    this.jsonOutput.textContent = JSON.stringify(this.subjects, null, 2);
  }
}
