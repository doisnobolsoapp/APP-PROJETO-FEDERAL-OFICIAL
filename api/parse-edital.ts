import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { text, metadata } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "Chave API não encontrada nas variáveis da Vercel." });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // AJUSTE: Usando o nome completo do modelo e configurações de segurança
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash", 
      generationConfig: { 
        responseMimeType: "application/json",
        temperature: 0.1, // Menor temperatura para extração de dados mais fiel
      },
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ],
    });

    const prompt = `
      Você é um especialista em análise de editais para concursos policiais.
      Transforme o texto abaixo em um JSON estruturado para estudo verticalizado.
      Retorne APENAS o JSON, sem textos explicativos.

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

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonString = response.text();

    // Tenta limpar o Markdown se a IA insistir em colocar ```json ... ```
    const cleanJson = jsonString.replace(/```json/g, "").replace(/```/g, "").trim();

    return res.status(200).json(JSON.parse(cleanJson));

  } catch (error: any) {
    console.error("ERRO NO SERVIDOR:", error);
    return res.status(500).json({ 
      error: "Falha ao processar edital", 
      details: error.message 
    });
  }
}
