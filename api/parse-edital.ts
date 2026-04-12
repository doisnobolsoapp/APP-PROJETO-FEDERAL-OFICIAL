import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

export default async function handler(req, res) {
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

    // Atualizado para gemini-1.5-flash: mais rápido e eficiente para extração de texto
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" },
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ],
    });

    const prompt = `
      Você é um especialista em análise de editais para concursos policiais brasileiros (foco em Policial Legislativo).
      Transforme o texto fornecido em um JSON estruturado para estudo verticalizado.

      ESTRUTURA DESEJADA:
      {
        "metadados": {
          "cargo": "${metadata?.cargo || "Policial Legislativo"}",
          "orgao": "${metadata?.orgao || "Câmara dos Deputados"}",
          "banca": "${metadata?.banca || "FGV"}",
          "data_prova": "${metadata?.data_prova || "26/04/2026"}"
        },
        "dashboard": [
          { "disciplina": "NOME DA MATÉRIA", "total_topicos": 0 }
        ],
        "verticalizado": [
          {
            "disciplina": "NOME DA MATÉRIA",
            "topicos": [
              { "id": "1.1", "descricao": "TÓPICO DETALHADO" }
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

    // 3. Parse e Retorno
    // Nota: gemini-1.5-flash com responseMimeType já entrega o JSON limpo
    return res.status(200).json(JSON.parse(jsonString));

  } catch (error) {
    console.error("ERRO NO SERVIDOR:", error);
    return res.status(500).json({ 
      error: "Falha ao processar edital", 
      details: error.message 
    });
  }
}
