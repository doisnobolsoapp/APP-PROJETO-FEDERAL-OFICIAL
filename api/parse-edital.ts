export default async function handler(req: any, res: any) {
  // 1. Validação de método
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const { text } = req.body;

  if (!apiKey) {
    return res.status(500).json({ error: "Chave API não configurada na Vercel" });
  }

  // 2. URL Direta (v1beta é mais estável para JSON mode)
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Analise este edital e retorne em JSON: " + text }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    // 3. Extrair apenas o texto da resposta do Gemini
    const aiText = data.candidates[0].content.parts[0].text;
    return res.status(200).json(JSON.parse(aiText));

  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
