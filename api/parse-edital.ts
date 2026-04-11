import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { text, metadata } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) return res.status(500).json({ error: "Chave API não configurada." });

    const genAI = new GoogleGenerativeAI(apiKey);

    // Testaremos com o flash, que costuma ter maior disponibilidade imediata
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `Analise o edital e retorne JSON:
    Texto: ${text}
    Estrutura: {
      "metadados": {"cargo": "${metadata?.cargo || ""}", "orgao": "${metadata?.orgao || ""}"},
      "dashboard": [{"disciplina": "string", "total_topicos": 0}],
      "verticalizado": [{"disciplina": "string", "topicos": [{"id": "1", "descricao": "string"}]}]
    }`;

    // Adicionamos um timeout manual para evitar que a Vercel mate a função antes da hora
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textRes = response.text();

    return res.status(200).json(JSON.parse(textRes));

  } catch (error: any) {
    console.error("ERRO COMPLETO:", error);
    
    // Se ainda der 404, o problema pode ser a região do servidor da Vercel (iad1) 
    // ou sua API Key que ainda não tem acesso aos modelos 1.5
    return res.status(500).json({
      error: "O Google retornou erro 404 ou 500",
      message: error.message,
      check: "Verifique se sua API Key no Google AI Studio tem acesso ao modelo Gemini 1.5 Flash."
    });
  }
}
