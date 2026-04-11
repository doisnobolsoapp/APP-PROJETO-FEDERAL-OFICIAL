import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { text, metadata } = req.body;

    if (!text) {
      return res.status(400).json({ error: "O campo 'text' é obrigatório." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "API Key não configurada na Vercel." });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // AJUSTE AQUI: Nome exato do modelo
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro", 
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const prompt = `
      Analise o edital abaixo e organize as disciplinas e tópicos de forma verticalizada.
      Retorne APENAS o JSON conforme a estrutura solicitada.

      TEXTO DO EDITAL:
      ${text}

      ESTRUTURA:
      {
        "metadados": {
          "cargo": "${metadata?.cargo || ""}",
          "orgao": "${metadata?.orgao || ""}",
          "banca": "${metadata?.banca || ""}",
          "data_prova": "${metadata?.data_prova || ""}"
        },
        "dashboard": [
          { "disciplina": "string", "total_topicos": 0 }
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
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textResponse = response.text();

    return res.status(200).json(JSON.parse(textResponse));

  } catch (error: any) {
    console.error("ERRO NO SERVIDOR:", error);
    return res.status(500).json({
      error: "Erro ao processar o edital",
      details: error.message
    });
  }
}
