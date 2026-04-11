import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { text, metadata } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "Falta a chave GEMINI_API_KEY na Vercel." });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // Usando o modelo flash que é mais estável para evitar o erro 404
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `Analise o edital abaixo e retorne um JSON com metadados, dashboard e verticalizado. 
    Texto: ${text}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textRes = response.text();

    return res.status(200).json(JSON.parse(textRes));

  } catch (error: any) {
    console.error("Erro:", error);
    return res.status(500).json({ error: error.message });
  }
}
