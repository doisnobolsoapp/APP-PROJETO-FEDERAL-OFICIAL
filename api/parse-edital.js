export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const body =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    const { text } = body;

    if (!text) {
      return res.status(400).json({ error: "Texto obrigatório" });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // 🔥 Se não tiver API → fallback direto
    if (!apiKey) {
      return fallback(text, res);
    }

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Extraia disciplinas do edital e retorne JSON no formato:
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

Texto:
${text}`
                  }
                ]
              }
            ]
          })
        }
      );

      if (!response.ok) {
        throw new Error("IA falhou");
      }

      const data = await response.json();

      let raw =
        data.candidates?.[0]?.content?.parts?.[0]?.text || "";

      raw = raw.replace(/```json/g, "").replace(/```/g, "").trim();

      const parsed = JSON.parse(raw);

      if (!parsed.verticalizado) {
        return fallback(text, res);
      }

      return res.status(200).json(parsed);

    } catch (err) {
      console.error("❌ ERRO IA:", err.message);
      return fallback(text, res);
    }

  } catch (error) {
    console.error("❌ ERRO GERAL:", error);
    return fallback("", res);
  }
}

// ✅ FALLBACK (NUNCA QUEBRA)
function fallback(text, res) {
  const disciplinas = text
    .split(/,|\n/)
    .map(d => d.trim())
    .filter(d => d.length > 2);

  return res.status(200).json({
    verticalizado: disciplinas.map((d, i) => ({
      disciplina: d,
      topicos: [
        {
          id: String(i + 1),
          descricao: "Tópico geral"
        }
      ]
    }))
  });
}
