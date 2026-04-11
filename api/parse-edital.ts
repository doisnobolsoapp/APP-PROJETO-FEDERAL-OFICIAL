import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req: any, res: any) {
  // 1. Validação de Método
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // 2. Extração de dados (Vercel já faz o parse do JSON automaticamente no req.body)
    const { text, metadata } = req.body;

    if (!text) {
      return res.status(400).json({ error: "O campo 'text' é obrigatório." });
    }

    // 3. Verificação da Chave de API
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("❌ ERRO: GEMINI_API_KEY não configurada na Vercel.");
      return res.status(500).json({ error: "API Key não configurada no servidor." });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // 4. Configuração do Modelo com Resposta JSON Forçada
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      generationConfig: {
        responseMimeType: "application/json", // Isso garante que a IA não mande textos extras ou markdown
      },
    });

    const prompt = `
Transforme o texto de edital abaixo em um JSON estruturado para estudo verticalizado.

TEXTO:
${text}

ESTRUTURA DE DADOS REQUERIDA:
{
  "metadados": {
    "cargo": "${metadata?.cargo || "Não informado"}",
    "orgao": "${metadata?.orgao || "Não informado"}",
    "banca": "${metadata?.banca || "Não informado"}",
    "data_prova": "${metadata?.data_prova || "Pré-Edital"}"
  },
  "dashboard": [
    { "disciplina": "Nome da Matéria", "total_topicos": 0 }
  ],
  "verticalizado": [
    {
      "disciplina": "Nome da Matéria",
      "topicos": [
        { "id": "1.1", "descricao": "Descrição do tópico do edital" }
      ]
    }
  ]
}

REGRAS:
- Extraia todas as disciplinas e tópicos fielmente ao texto.
- O campo 'id' deve seguir a numeração do edital se houver.
`;

    console.log("🔥 Chamando Gemini 1.5 Pro...");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textResponse = response.text();

    // 5. Parse e Retorno
    // Graças ao responseMimeType, o texto já vem como JSON puro
    const data = JSON.parse(textResponse);

    return res.status(200).json(data);

  } catch (error: any) {
    console.error("❌ ERRO NO SERVIDOR:", error);

    return res.status(500).json({
      error: "Falha ao processar o edital",
      details: error.message,
    });
  }
}
