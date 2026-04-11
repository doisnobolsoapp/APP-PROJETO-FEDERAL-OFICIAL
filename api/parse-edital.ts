import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  // Permitir apenas POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 🔥 Garantir parsing correto do body (Vercel bug comum)
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    const { text, metadata } = body;

    // 🔥 Validação
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // 🔥 Verificar API KEY
    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY não encontrada");
      return res.status(500).json({ error: 'API Key não configurada' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro-latest"
    });

    // 🔥 Prompt corrigido (com crase)
    const prompt = `
Você é o Arquiteto de Sistemas do Projeto Federal. Sua missão é estruturar dados para um web app focado em carreiras policiais.

[OBJETIVO]
Transformar textos de editais brutos em um JSON estruturado que contenha:
- metadados: Info do concurso.
- dashboard: Resumo quantitativo por matéria.
- verticalizado: Lista detalhada de tópicos.

[METADADOS FORNECIDOS]
Cargo: ${metadata?.cargo || ""}
Órgão: ${metadata?.orgao || ""}
Banca: ${metadata?.banca || ""}
Data da Prova: ${metadata?.data_prova || "Pré-Edital"}

[CONTEÚDO PROGRAMÁTICO]
${text}

[ESTRUTURA DO OUTPUT (JSON)]
{
  "metadados": {
    "cargo": "string",
    "orgao": "string",
    "banca": "string",
    "data_prova": "string"
  },
  "dashboard": [
    { "disciplina": "string", "total_topicos": number }
  ],
  "verticalizado": [
    {
      "disciplina": "string",
      "topicos": [
        { "id": "string", "descricao": "string" }
      ]
    }
  ]
}

[REGRAS]
- Responda APENAS com JSON válido
- Não adicione explicações
- Mantenha a hierarquia do edital
`;

    // 🔥 Chamada da IA
    const result = await model.generateContent(prompt);
    const response = await result.response;

    const textResponse = response.text();

    // 🔥 Segurança contra JSON inválido
    let data;
    try {
      data = JSON.parse(textResponse);
    } catch (e) {
      console.error("Resposta inválida da IA:", textResponse);
      return res.status(500).json({
        error: "Resposta da IA não é JSON válido",
        raw: textResponse
      });
    }

    return res.status(200).json(data);

  } catch (error) {
    console.error('Erro geral:', error);

    return res.status(500).json({
      error: 'Failed to parse edital',
      details: error.message
    });
  }
}
