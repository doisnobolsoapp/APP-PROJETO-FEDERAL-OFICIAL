import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { text } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) return res.status(500).json({ error: "Chave API não encontrada." });

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `Analise o edital e retorne um JSON estruturado: ${text}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    // Retorna o JSON diretamente para o frontend
    return res.status(200).json(JSON.parse(response.text()));

  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
