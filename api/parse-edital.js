import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    // 🔥 Corrige problema comum do Vercel (body como string)
    const body =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    const { text, metadata } = body;

    // 🔥 Validação
    if (!text) {
      return res.status(400).json({ error: "Texto obrigatório" });
    }

    // 🔥 API KEY
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("❌ GEMINI_API_KEY não encontrada");
      return res.status(500).json({ error: "API Key não configurada" });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // ✅ MODELO FUNCIONAL (SEM -latest)
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-002"
    });

    console.log("🔥 MODEL USADO: gemini-1.5-flash-002");

    const prompt = `
Você é um especialista em análise de editais de concursos públicos.

[OBJETIVO]
Extrair disciplinas e seus respectivos tópicos do texto abaixo.

[METADADOS]
Cargo: ${metadata?.cargo || "Não informado"}

[TEXTO DO EDITAL]
${text}

[FORMATO OBRIGATÓRIO]
{
  "subjects": [
    {
      "name": "string",
      "topics": ["string"]
    }
  ]
}

[REGRAS]
- Retorne apenas JSON válido
- Não use markdown
- Não use crases
- Não explique nada
`;

    // 🔥 Chamada segura
    const result = await model.generateContent(prompt);
    const response = await result.response;

    let raw = response.text();

    // 🔥 LIMPEZA FUNDAMENTAL
    raw = raw
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let data;

    try {
      data = JSON.parse(raw);
    } catch (err) {
      console.error("❌ JSON inválido vindo da IA:", raw);

      return res.status(500).json({
        error: "Resposta inválida da IA",
        raw: raw
      });
    }

    return res.status(200).json(data);

  } catch (error) {
    console.error("❌ ERRO GERAL:", error);

    return res.status(500).json({
      error: "Erro no parser",
      details: error.message
    });
  }
}
