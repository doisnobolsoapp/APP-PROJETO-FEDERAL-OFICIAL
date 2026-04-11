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
      return res.status(500).json({ error: "API Key não encontrada no ambiente." });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // SOLUÇÃO DO ERRO 404: Usar o nome estável "gemini-1.5-pro-latest" ou "gemini-1.5-pro"
    // e garantir que o modelo existe.
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro", 
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const prompt = `
      Você é um especialista em análise de editais para concursos policiais.
      Transforme o texto abaixo em um JSON estruturado para estudo verticalizado.

      TEXTO:
      ${text}

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
              { "id": "string", "descricao": "string" }
            ]
          }
        ]
      }
    `;

    console.log("🚀 Enviando requisição para o Google Gemini...");
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textResponse = response.text();

    if (!textResponse) {
      throw new Error("A IA retornou uma resposta vazia.");
    }

    return res.status(200).json(JSON.parse(textResponse));

  } catch (error: any) {
    console.error("❌ ERRO DETALHADO:", error);

    // Se o erro for 404 de novo, vamos dar uma pista melhor
    if (error.message?.includes("404")) {
      return res.status(500).json({
        error: "Modelo não encontrado ou API fora de serviço nesta região.",
        details: "Verifique se a versão do @google/generative-ai está atualizada.",
      });
    }

    return res.status(500).json({
      error: "Falha ao processar edital",
      details: error.message,
    });
  }
}
