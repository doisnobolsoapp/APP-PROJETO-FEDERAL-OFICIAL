import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req: any, res: any) {
  // 1. Só aceita POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { text, metadata } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "Chave API (GEMINI_API_KEY) não encontrada nas variáveis da Vercel." });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // CORREÇÃO AQUI: Nome exato do modelo e configuração de JSON puro
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash", // Flash é mais rápido para editais longos
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
      Você é um especialista em análise de editais para concursos policiais.
      Transforme o texto abaixo em um JSON estruturado para estudo verticalizado.

      ESTRUTURA:
      {
        "metadados": {
          "cargo": "${metadata?.cargo || "Não informado"}",
          "orgao": "${metadata?.orgao || "Não informado"}",
          "banca": "${metadata?.banca || "Não informado"}",
          "data_prova": "${metadata?.data_prova || "Pré-Edital"}"
        },
        "dashboard": [
          { "disciplina": "string", "total_topicos": 0 }
        ],
        "verticalizado": [
          {
            "disciplina": "string",
            "topicos": [
              { "id": "1.1", "descricao": "string" }
            ]
          }
        ]
      }

      TEXTO DO EDITAL:
      ${text}
    `;

    // 2. Chama a IA
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonString = response.text();

    // 3. Retorna o JSON processado
    return res.status(200).json(JSON.parse(jsonString));

  } catch (error: any) {
    console.error("ERRO NO SERVIDOR:", error);
    return res.status(500).json({ 
      error: "Falha ao processar edital", 
      details: error.message 
    });
  }
}
