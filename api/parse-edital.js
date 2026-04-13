import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Método não permitido" });
    }

    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ error: "Texto obrigatório" });
        }

        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: "API Key não configurada" });
        }

        const genAI = new GoogleGenerativeAI(apiKey);

        // ✅ MODELO CORRETO
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash-latest",
        });

        const prompt = `
Extraia disciplinas e tópicos do edital abaixo.

TEXTO:
${text}

FORMATO OBRIGATÓRIO:
{
  "subjects": [
    {
      "name": "string",
      "topics": ["string"]
    }
  ]
}

REGRAS:
- Retorne apenas JSON
- Sem explicações
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;

        let raw = response.text();

        // 🔥 LIMPEZA (ESSENCIAL)
        raw = raw
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        const data = JSON.parse(raw);

        return res.status(200).json(data);

    } catch (error) {
        console.error("Erro:", error);

        return res.status(500).json({
            error: "Erro no parser",
            details: error.message
        });
    }
}
