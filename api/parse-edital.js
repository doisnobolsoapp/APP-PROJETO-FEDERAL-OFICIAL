import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const body =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    const { text, metadata } = body;

    if (!text) {
      return res.status(400).json({ error: "Texto obrigatório" });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("❌ GEMINI_API_KEY não encontrada");
      return fallbackResponse(text, res);
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash"
    });

    console.log("🔥 MODEL USADO: gemini-2.0-flash");

    const prompt = `
Você é um especialista em análise de editais de concursos públicos.

Extraia disciplinas e tópicos do edital.

Retorne EXATAMENTE neste formato JSON:

{
  "verticalizado": [
    {
      "disciplina": "string",
      "topicos": [
        { "id": "1", "descricao": "string" }
      ]
    }
  ]
}

Regras:
- Apenas JSON
- Sem markdown
- Sem explicação

Texto:
${text}
`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;

      let raw = response.text();

      raw = raw
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      let data;

      try {
        data = JSON.parse(raw);
      } catch (err) {
        console.error("❌ JSON inválido:", raw);
        return fallbackResponse(text, res);
      }

      // 🔥 GARANTE FORMATO CORRETO
      if (!data.verticalizado) {
        return fallbackResponse(text, res);
      }

      return res.status(200).json(data);

    } catch (aiError) {
      console.error("❌ ERRO IA:", aiError.message);

      return fallbackResponse(text, res);
    }

  } catch (error) {
    console.error("❌ ERRO GERAL:", error);
    return fallbackResponse("", res);
  }
}

// ✅ FALLBACK (NUNCA QUEBRA)
function fallbackResponse(text, res) {
  console.log("⚠️ USANDO FALLBACK");

  const disciplinas = text
    .split(/,|\n/)
    .map(d => d.trim())
    .filter(d => d.length > 2);

  const verticalizado = disciplinas.map((d, i) => ({
    disciplina: d,
    topicos: [
      {
        id: String(i + 1),
        descricao: "Tópico geral"
      }
    ]
  }));

  return res.status(200).json({
    verticalizado
  });
}
