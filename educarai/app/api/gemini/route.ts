import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const prompt = body?.prompt;
    const history = body?.history || []; // Aceita o histórico do chat se enviado pelo frontend

    if (!prompt) {
      return NextResponse.json({ error: "Prompt não fornecido." }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "A chave GEMINI_API_KEY não foi encontrada no .env.local" },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey: apiKey.trim() });

    const isQuizRequest = prompt.toLowerCase().includes("quiz") || prompt.toLowerCase().includes("pergunta");

    const systemInstruction = isQuizRequest
      ? `Você é o Tutor IA Educar. O usuário pediu um quiz ou perguntas.
        
REGRAS OBRIGATÓRIAS:
1. Responda EXCLUSIVAMENTE em formato JSON.
2. Mantenha estritamente o assunto/matéria solicitada no histórico e na última mensagem.
3. NUNCA repita perguntas que já foram feitas anteriormente.
4. Gere perguntas inéditas e criativas.

Estrutura EXATA do JSON:
{
  "tipo": "quiz",
  "texto": "Aqui está uma pergunta para você testar seus conhecimentos:",
  "quizData": {
    "pergunta": "Texto da pergunta aqui",
    "opcoes": [
      {"id": "A", "texto": "Opção A"},
      {"id": "B", "texto": "Opção B"},
      {"id": "C", "texto": "Opção C"},
      {"id": "D", "texto": "Opção D"}
    ],
    "respostaCorreta": "A",
    "explicacao": "Explicação pedagógica detalhada."
  }
}`
      : `Você é o Tutor IA Educar, um assistente pedagógico amigável, didático e focado no tema solicitado pelo aluno.`;

    // Constrói o histórico da conversa para manter a continuidade do tema
    let contextPrompt = "";
    if (history.length > 0) {
      contextPrompt = "Histórico da conversa recente:\n" + 
        history.map((m: any) => `${m.role === "user" ? "Aluno" : "Tutor"}: ${m.content}`).join("\n") + "\n\n";
    }

    const finalInput = `${systemInstruction}\n\n${contextPrompt}Mensagem atual do Aluno: ${prompt}`;

    const interaction = await ai.interactions.create({
      model: "gemini-3.6-flash",
      input: finalInput,
    });

    const responseText = interaction.output_text;

    if (!responseText) {
      return NextResponse.json(
        { error: "A API do Gemini retornou uma resposta sem texto." },
        { status: 500 }
      );
    }

    if (isQuizRequest) {
      try {
        const cleanJson = responseText
          .replace(/```json/gi, "")
          .replace(/```/g, "")
          .trim();
        const parsed = JSON.parse(cleanJson);
        return NextResponse.json({
          tipo: "quiz",
          texto: parsed.texto || "Aqui está seu quiz:",
          quizData: parsed.quizData,
        });
      } catch {
        return NextResponse.json({ tipo: "texto", texto: responseText });
      }
    }

    return NextResponse.json({ tipo: "texto", texto: responseText });
  } catch (error: any) {
    console.error("Erro na rota /api/gemini:", error);
    return NextResponse.json(
      { error: error?.message || "Erro interno ao processar a resposta do Gemini." },
      { status: 500 }
    );
  }
}