import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    const disciplinas = req.body;

    // Validação de entrada
    if (!disciplinas || !Array.isArray(disciplinas) || disciplinas.length === 0) {
        return res.status(400).json({ error: 'Dados das disciplinas são necessários.' });
    }

    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'Chave API não configurada.' });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        const systemPrompt = `
        Você é o motor de inteligência do Projeto Federal. 
        Gere um ciclo de estudos adaptativo para Policial Legislativo Federal.
        Use os dados de desempenho: ${JSON.stringify(disciplinas)}.

        [DIRETRIZES]
        1. Intercale matérias jurídicas com gerais.
        2. Performance < 60%: Foco em Teoria.
        3. Performance > 80%: Foco em Questões.
        4. Blocos de 60 a 90 minutos.

        [JSON FORMAT]
        {
          "tipo": "ciclo_estudos_adaptativo",
          "resumo": { "disciplinas_prioritarias": [], "foco_principal": "" },
          "ciclo": [
            { "ordem": 1, "disciplina": "", "formato": "teoria|revisao|questoes", "descricao": "", "tempo_min": 60, "prioridade": "alta" }
          ],
          "analise_IA": ""
        }`;

        const result = await model.generateContent(systemPrompt);
        const response = await result.response;
        const data = JSON.parse(response.text());

        return res.status(200).json(data);
    } catch (error) {
        console.error('Erro no Ciclo:', error);
        return res.status(500).json({ error: 'Erro ao gerar ciclo', details: error.message });
    }
}
