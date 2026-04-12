import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

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

    // PLANO B: Usando 'gemini-pro' para máxima compatibilidade com a API estável
    const model = genAI.getGenerativeModel({ 
      model: "gemini-pro", 
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ],
    });

    const prompt = `
      Você é um especialista em análise de editais para concursos policiais brasileiros.
      Transforme o texto fornecido em um JSON estruturado para estudo verticalizado.
      Retorne APENAS o código JSON puro, sem explicações.

      ESTRUTURA DESEJADA:
      {
        "metadados": {
          "cargo": "${metadata?.cargo || "Não informado"}",
          "orgao": "${metadata?.orgao || "Não informado"}",
          "banca": "${metadata?.banca || "Não informado"}",
          "data_prova": "${metadata?.data_prova || "Pré-Edital"}"
        },
        "dashboard": [
          { "disciplina": "NOME DA MATÉRIA", "total_topicos": 0 }
        ],
        "verticalizado": [
          {
            "disciplina": "NOME DA MATÉRIA",
            "topicos": [
              { "id": "1", "descricao": "TÓPICO DO EDITAL" }
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

    // 3. Limpeza rigorosa para garantir que seja um JSON válido
    const cleanJson = jsonString
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return res.status(200).json(JSON.parse(cleanJson));

  } catch (error: any) {
    console.error("ERRO NO SERVIDOR:", error);
    return res.status(500).json({ 
      error: "Falha ao processar edital", 
      details: error.message 
    });
  }
}
