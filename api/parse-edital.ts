import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    const { text, metadata } = body;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error("❌ API KEY NÃO ENCONTRADA");
      return res.status(500).json({ error: "API Key não configurada" });
    }

    console.log("🔥 INICIANDO GEMINI...");
    console.log("🔥 MODEL USADO: gemini-1.5-pro-latest");

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro", // ✅ MODELO CORRETO
    });

    const prompt = `
Você é um sistema que retorna APENAS JSON válido.

Transforme o texto abaixo em JSON estruturado.

TEXTO:
${text}

FORMATO:
{
  "metadados": {
    "cargo": "${metadata?.cargo || ""}",
    "orgao": "${metadata?.orgao || ""}",
    "banca": "${metadata?.banca || ""}",
    "data_prova": "${metadata?.data_prova || "Pré-Edital"}"
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

REGRAS:
- Retorne apenas JSON puro
- Não use markdown
- Não use crases
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;

    const textResponse = response.text();

    console.log("🔥 RESPOSTA BRUTA:", textResponse);

    const cleaned = textResponse
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let data;

    try {
      data = JSON.parse(cleaned);
    } catch (e) {
      console.error("❌ JSON INVÁLIDO:", cleaned);

      return res.status(500).json({
        error: "Resposta da IA não é JSON válido",
        raw: cleaned,
      });
    }

    return res.status(200).json(data);

  } catch (error: any) {
    console.error("❌ ERRO GERAL:", error);

    return res.status(500).json({
      error: "Failed to parse edital",
      details: error.message,
    });
  }
}
