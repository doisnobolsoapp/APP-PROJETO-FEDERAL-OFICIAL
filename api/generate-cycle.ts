import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const disciplinas = req.body;

  // Validação de segurança
  if (!disciplinas || !Array.isArray(disciplinas) || disciplinas.length === 0) {
    return res.status(400).json({ error: 'Nenhuma disciplina fornecida para gerar o ciclo.' });
  }

  try {
    // CORREÇÃO: Removido o "!" (syntax sugar de TS)
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const systemPrompt = `
Você é o motor de inteligência estratégica do aplicativo Projeto Federal.
Sua missão é gerar um ciclo de estudos adaptativo (Ciclo de Estudo) para o concurso de Policial Legislativo Federal.

[DIRETRIZES PEDAGÓGICAS]
1. Spaced Repetition: Inclua revisões periódicas.
2. Interleaving: Alterne entre disciplinas jurídicas e exatas/gerais para evitar fadiga mental.
3. Foco em Fraquezas: Se o acerto for < 60%, priorize Teoria. Se > 80%, priorize Questões e Simulados.
4. Carga Horária: Distribua o tempo de forma lógica (blocos de 60 a 90 min).

📦 FORMATO DO OUTPUT (JSON):
{
  "tipo": "ciclo_estudos_adaptativo",
  "resumo": {
    "disciplinas_prioritarias": ["string"],
    "foco_principal": "string"
  },
  "ciclo": [
    {
      "ordem": 1,
      "disciplina": "string",
      "formato": "teoria | revisao | questoes",
      "descricao": "string",
      "tempo_min": 60,
      "prioridade": "alta | media | baixa"
    }
  ],
  "analise_IA": "Explicação estratégica do porquê desta ordem."
}`;

    // Chamada formatada para maior estabilidade
    const result = await model.generateContent([
      { text: systemPrompt },
      { text: `Gere um ciclo com base nestes dados de desempenho: ${JSON.stringify(disciplinas)}` }
    ]);

    const response = await result.response;
    const cycleData = JSON.parse(response.text());

    res.status(200).json(cycleData);
  } catch (error) {
    console.error('Error generating cycle:', error);
    res.status(500).json({ 
      error: 'Erro ao gerar ciclo', 
      details: error.message 
    });
  }
}
