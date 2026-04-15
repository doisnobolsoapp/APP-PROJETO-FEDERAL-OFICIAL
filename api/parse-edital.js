export default function handler(req, res) {
  try {
    const { text } = req.body || {};

    if (!text) {
      return res.status(200).json({
        verticalizado: []
      });
    }

    // 🔥 SIMPLES E NUNCA QUEBRA
    const disciplinas = text
      .split(/,|\n/)
      .map(d => d.trim())
      .filter(Boolean);

    return res.status(200).json({
      verticalizado: disciplinas.map((d, i) => ({
        disciplina: d,
        topicos: [
          {
            id: String(i + 1),
            descricao: "Tópico geral"
          }
        ]
      }))
    });

  } catch (err) {
    return res.status(200).json({
      verticalizado: []
    });
  }
}
