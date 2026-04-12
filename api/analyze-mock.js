import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    // 1. Verificação de Método
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    const mock = req.body;

    // 2. Validação básica dos dados recebidos
    if (!mock || !mock.disciplines) {
        return res.status(400).json({ error: 'Dados do simulado não fornecidos corretamente.' });
    }

    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'Chave API não configurada na Vercel.' });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        const systemPrompt = `
        Você é o motor analítico do Projeto Federal para o concurso de Policial Legislativo.
        Interprete os dados e retorne um JSON com análise estratégica.

        [REGRAS DE CÁLCULO]
        - Cebraspe (Certo/Errado): Nota = Acertos - Erros.
        - FGV/FCC/Outras: Nota = Acertos * Peso.

        [ESTRUTURA JSON]
        {
          "resumo_geral": {
            "total_questoes": 0, "acertos": 0, "erros": 0, "brancos": 0, "percentual": 0, "nota_final": 0
          },
          "disciplinas": [
            { "nome": "", "questoes": 0, "acertos": 0, "erros": 0, "brancos": 0, "percentual": 0, "nota": 0, "nivel": "forte|medio|fraco" }
          ],
          "analise_IA": "Texto detalhado com orientações para os próximos estudos."
        }`;

        const inputData = {
            nome: mock.name,
            banca: mock.banca || "FGV",
            disciplinas:
