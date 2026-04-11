export default async function handler(req: any, res: any) {
  // 1. Validação de segurança
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const { text, metadata } = req.body;

  if (!apiKey) {
    return res.status(500).json({ error: "API KEY não configurada na Vercel." });
  }

  // 2. Configuração da URL e do Prompt Estruturado
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const prompt = `
    Analise o texto do edital abaixo e transforme-o em um JSON estruturado para um sistema de estudo verticalizado.
    
    ESTRUTURA DESEJADA:
    {
      "metadados": {
        "cargo": "${metadata?.cargo || ""}",
        "orgao": "${metadata?.orgao || ""}",
        "banca": "${metadata?.banca || ""}",
        "data_prova": "${metadata?.data_prova || ""}"
      },
      "dashboard": [
        { "disciplina": "Nome da Matéria", "total_topicos": 0 }
      ],
      "verticalizado": [
        {
          "disciplina": "Nome da Matéria",
          "topicos": [
            { "id": "1", "descricao": "Descrição do tópico" }
          ]
        }
      ]
    }

    TEXTO DO EDITAL:
    ${text}
  `;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });

    const data = await response.json();

    // 3. Verificação de erro do Google
    if (!response.ok) {
      console.error("ERRO GOOGLE:", JSON.stringify(data));
      return res.status(response.status).json({
        error: "Erro na API do Gemini",
        details: data
      });
    }

    // 4. Extração e Parse do conteúdo gerado
    const aiResponseText = data.candidates[0].content.parts[0].text;
    
    // Retorna o JSON processado diretamente para o seu frontend
    return res.status(200).json(JSON.parse(aiResponseText));

  } catch (err: any) {
    console.error("ERRO NO HANDLER:", err.message);
    return res.status(500).json({ 
      error: "Falha interna ao processar o edital", 
      details: err.message 
    });
  }
}
