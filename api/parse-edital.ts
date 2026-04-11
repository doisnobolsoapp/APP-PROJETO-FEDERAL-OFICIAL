export default async function handler(req: any, res: any) {
  // 1. Só aceita requisições do tipo POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { text, metadata } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "API KEY não configurada na Vercel." });
    }

    // 2. Chamada Direta via URL (Evita o erro 404 da biblioteca)
    // Usamos o modelo 'gemini-1.5-flash' por ser mais estável e rápido
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const bodyPayload = {
      contents: [
        {
          parts: [
            {
              text: `Você é um analista de editais. Transforme o texto abaixo em JSON puro.
              
              TEXTO:
              ${text}

              FORMATO REQUERIDO:
              {
                "metadados": {
                  "cargo": "${metadata?.cargo || ""}",
                  "orgao": "${metadata?.orgao || ""}",
                  "banca": "${metadata?.banca || ""}",
                  "data_prova": "${metadata?.data_prova || ""}"
                },
                "dashboard": [
                  { "disciplina": "string", "total_topicos": 0 }
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
              Retorne apenas o JSON, sem markdown.`
            }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: "application/json"
      }
    };

    // 3. Executa a requisição
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(bodyPayload)
    });

    const data = await response.json();

    // 4. Verifica se o Google aceitou a chave e o modelo
    if (!response.ok) {
      console.error("Erro detalhado do Google:", data);
      return res.status(response.status).json({
        error: "Erro na resposta do Google Gemini",
        details: data
      });
    }

    // 5. Extrai o texto da resposta e envia para o seu app
    const textResponse = data.candidates[0].content.parts[0].text;
    
    return res.status(200).json(JSON.parse(textResponse));

  } catch (error: any) {
    console.error("ERRO GERAL:", error);
    return res.status(500).json({
      error: "Falha interna no servidor",
      message: error.message
    });
  }
}
