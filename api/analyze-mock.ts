import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const mock = req.body;

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const systemPrompt = `
Você é o motor de inteligência analítica do aplicativo web Projeto Federal, uma plataforma avançada de preparação para concursos públicos.

Sua função é:
Interpretar dados de simulados
Adaptar cálculos conforme a banca organizadora
Gerar métricas de desempenho
Produzir análise estratégica personalizada

🎯 OBJETIVO PRINCIPAL
Receber dados de simulados e retornar um JSON estruturado com:
Métricas detalhadas por disciplina
Métricas globais
Cálculo correto conforme a banca
Análise estratégica baseada no estilo da prova

🏛️ REGRA CRÍTICA – ADAPTAÇÃO POR BANCA
Você DEVE ajustar automaticamente os cálculos conforme a banca:
🔵 Cebraspe (Certo/Errado) -> nota = acertos - erros
🔵 Cebraspe (Múltipla Escolha) -> nota = acertos
🟣 FGV -> nota = acertos
🟠 FCC -> nota = acertos × peso
🟢 IDECAN (ou padrão genérico) -> nota = acertos

🧠 ANÁLISE ESTRATÉGICA (ESSENCIAL)
Identificar disciplinas fortes/fracas, padrão de erro e adaptar à banca.

📦 FORMATO FINAL (OBRIGATÓRIO)
Responder APENAS com JSON:
{
  "resumo_geral": {
    "total_questoes": 0, "acertos": 0, "erros": 0, "brancos": 0, "percentual": 0, "nota_final": 0
  },
  "disciplinas": [
    { "nome": "string", "questoes": 0, "acertos": 0, "erros": 0, "brancos": 0, "percentual": 0, "nota": 0, "nivel": "forte | medio | fraco" }
  ],
  "analise_IA": "texto estratégico detalhado"
}`;

    const inputData = {
      nome: mock.name,
      data: mock.date,
      banca: mock.banca || (mock.type === 'certo_errado' ? 'Cebraspe' : 'Outra'),
      disciplinas: mock.disciplines.map(d => ({
        nome: d.name,
        questoes: d.questions,
        acertos: d.correct,
        erros: d.errors,
        brancos: d.blanks,
        peso: d.weight
      }))
    };

    const result = await model.generateContent([systemPrompt, JSON.stringify(inputData)]);
    const response = await result.response;
    const analysis = JSON.parse(response.text());

    res.status(200).json(analysis);
  } catch (error) {
    console.error('Error analyzing mock:', error);
    res.status(500).json({ error: 'Failed to analyze mock', details: error.message });
  }
}
