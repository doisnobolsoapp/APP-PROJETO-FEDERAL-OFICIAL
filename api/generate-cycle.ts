import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const disciplinas = req.body;

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const systemPrompt = `
Você é o motor de inteligência estratégica do aplicativo Projeto Federal.
Sua missão é gerar um ciclo de estudos adaptativo e inteligente baseado no desempenho do aluno.

[DIRETRIZES PEDAGÓGICAS]
1. Spaced Repetition: Inclua revisões periódicas (24h, 7d).
2. Interleaving: Alterne entre disciplinas diferentes para melhorar a retenção.
3. Foco em Fraquezas: Disciplinas com desempenho < 50% devem ter mais carga horária e foco em Teoria.
4. Manutenção: Disciplinas com desempenho > 80% devem focar em Questões e Revisão rápida.

📦 FORMATO DO OUTPUT (OBRIGATÓRIO)
Responder APENAS com JSON:
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
  "analise_IA": "texto estratégico explicando o ciclo"
}`;

    const result = await model.generateContent([systemPrompt, JSON.stringify(disciplinas)]);
    const response = await result.response;
    const cycleData = JSON.parse(response.text());

    res.status(200).json(cycleData);
  } catch (error) {
    console.error('Error generating cycle:', error);
    res.status(500).json({ error: 'Failed to generate cycle', details: error.message });
  }
}
