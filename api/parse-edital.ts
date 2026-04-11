export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  const apiKey = process.env.GEMINI_API_KEY;
  const { text } = req.body;

  // URL usando a versão estável V1 e o modelo Flash (mais compatível)
  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Retorne este edital em JSON: " + text }] }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      // Isso vai cuspir o erro real no log da Vercel para sabermos o motivo
      console.error("ERRO GOOGLE:", JSON.stringify(data));
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
