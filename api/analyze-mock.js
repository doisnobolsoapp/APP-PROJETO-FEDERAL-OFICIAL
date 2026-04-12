import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  // 1. Verificação de Método
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const mock = req.body;

  // 2. Validação básica dos dados recebidos
  if (!mock || !mock.disciplines) {
    return res.status(400).json({ error: 'Dados do simulado não fornecidos corretamente.' });
  }

  try {
    // CORREÇÃO: Removido o "!" de GEMINI_API_KEY (sintaxe de TS que causa erro no Node.js puro)
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const systemPrompt = `
Você é o motor de inteligência analítica do aplicativo web Projeto Federal, focado em concursos de alto nível (Policial Legislativo Federal).

Sua função é:
Interpretar dados de simulados, adaptar cálculos conforme a banca e produzir análise estratégica.

🏛️ REGRA DE CÁLCULO POR BANCA:
- Cebraspe (Certo/Errado) -> nota = acertos - erros.
- Cebraspe (Múltipla Escolha) -> nota = acertos.
- FGV / FCC / IDECAN -> nota = acertos × peso (se peso não informado, considere 1).

📦 FORMATO DE RESPOSTA (JSON APENAS):
{
  "resumo_geral": {
    "total_questoes": 0, "acertos": 0, "erros": 0, "brancos": 0, "percentual": 0, "nota_final": 0
  },
  "disciplinas": [
    { "nome": "string", "questoes": 0, "acertos": 0, "erros": 0, "brancos": 0, "percentual": 0, "nota": 0, "nivel": "forte | medio | fraco" }
  ],
  "analise_IA": "texto estratégico detalhado e motivador"
}`;

    const inputData = {
      nome: mock.name,
      data: mock.date,
      banca: mock.banca || (mock.type === 'certo_errado' ? 'Cebraspe' : 'FGV'),
      disciplinas: mock.disciplines.map(d => ({
        nome: d.name,
        questoes: Number(d.questions),
        acertos: Number(d.correct),
        erros: Number(d.errors),
        brancos: Number(d.blanks),
        peso: Number(d.weight || 1)
      }))
    };

    const result = await model.generateContent([
      { text: systemPrompt },
      { text: `Analise este simulado: ${JSON.stringify(inputData)}` }
    ]);

    const response = await result.response;
    const text = response.text();
    
    // Tenta parsear o JSON retornado pela IA
    const analysis = JSON.parse(text);

    res.status(200).json(analysis);
  } catch (error) {
    console.error('Error analyzing mock:', error);
    res.status(500).json({ 
      error: 'Erro na análise da IA', 
      details: error.message 
    });
  }
}
