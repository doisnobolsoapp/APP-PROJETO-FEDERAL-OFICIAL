import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, metadata } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash-latest"
});

    const prompt = `Você é o Arquiteto de Sistemas do Projeto Federal. Sua missão é estruturar dados para um web app focado em carreiras policiais.

[OBJETIVO]
Transformar textos de editais brutos em um JSON estruturado que contenha:
metadados: Info do concurso.
dashboard: Resumo quantitativo por matéria.
verticalizado: Lista detalhada de tópicos com campos de status.

[METADADOS FORNECIDOS]
Cargo: ${metadata.cargo}
Órgão: ${metadata.orgao}
Banca: ${metadata.banca}
Data da Prova: ${metadata.data_prova}

[CONTEÚDO PROGRAMÁTICO]
${text}

[ESTRUTURA DO OUTPUT (JSON)]
O retorno deve seguir rigorosamente este esquema:
{
  "metadados": {
    "cargo": "string",
    "orgao": "string",
    "banca": "string",
    "data_prova": "string"
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

[RESTRITORES]
Responda apenas com JSON.
Mantenha a hierarquia do edital intacta.
Se o usuário não informar a Data da Prova, defina como "Pré-Edital".
IMPORTANTE: Certifique-se de que o JSON é válido.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const data = JSON.parse(response.text());

    res.status(200).json(data);
  } catch (error) {
    console.error('Error parsing edital:', error);
    res.status(500).json({ error: 'Failed to parse edital', details: error.message });
  }
}
