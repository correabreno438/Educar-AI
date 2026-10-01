"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import {
  Bot,
  Send,
  User,
  Sparkles,
  HelpCircle,
  BookOpen,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Loader2,
} from "lucide-react";

const supabase = createClient();

type QuizOption = {
  id: string;
  texto: string;
};

type QuizData = {
  pergunta: string;
  opcoes: QuizOption[];
  respostaCorreta: string;
  explicacao: string;
};

type Mensagem = {
  id: string;
  remetente: "user" | "ia";
  texto: string;
  tipo?: "texto" | "quiz";
  quizData?: QuizData;
};

export default function GeminiPage() {
  const [currentUser, setCurrentUser] = useState<SupabaseUser | null>(null);
  const [mensagens, setMensagens] = useState<Mensagem[]>([
    {
      id: "1",
      remetente: "ia",
      tipo: "texto",
      texto:
        "Olá! Sou o seu Tutor IA Educar. Posso te ajudar com orientações de estudo, explicações de conteúdos ou gerar quizzes interativos para você praticar. Como posso te ajudar hoje?",
    },
  ]);
  const [input, setInput] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [respostasQuiz, setRespostasQuiz] = useState<{ [quizId: string]: string }>({});
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Carrega usuário atual
  useEffect(() => {
    async function initUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    }
    initUser();
  }, []);

  // Auto-scroll para a última mensagem
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens, carregando]);

  // Função de Envio Real com Tratamento de Erros Detalhado
  const enviarMensagem = async (textoEnviar?: string) => {
    const mensagemTexto = textoEnviar || input;
    if (!mensagemTexto.trim() || carregando) return;

    const novaMensagemUser: Mensagem = {
      id: Date.now().toString(),
      remetente: "user",
      tipo: "texto",
      texto: mensagemTexto,
    };

    setMensagens((prev) => [...prev, novaMensagemUser]);
    if (!textoEnviar) setInput("");
    setCarregando(true);

    try {
      // Chamada real para a API Route do Gemini
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: mensagemTexto }),
      });

      const data = await response.json();

      // Tratamento de erros retornados pela API
      if (!response.ok || data.error) {
        const mensagemErro = data.error || `Erro HTTP no servidor (${response.status})`;
        setMensagens((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            remetente: "ia",
            tipo: "texto",
            texto: `⚠️ [Erro no Servidor]: ${mensagemErro}`,
          },
        ]);
        return;
      }

      const respostaIA: Mensagem = {
        id: (Date.now() + 1).toString(),
        remetente: "ia",
        tipo: data.tipo || "texto",
        texto: data.texto || "A IA respondeu sem um texto definido.",
        quizData: data.quizData,
      };

      setMensagens((prev) => [...prev, respostaIA]);

      // Salva a conversa no Supabase se o usuário estiver autenticado
      if (currentUser) {
        await supabase.from("historico_chat").insert([
          { user_id: currentUser.id, remetente: "user", texto: mensagemTexto },
          { user_id: currentUser.id, remetente: "ia", texto: respostaIA.texto },
        ]);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Falha na requisição ao servidor.";
      setMensagens((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          remetente: "ia",
          tipo: "texto",
          texto: `⚠️ Erro de conexão com o servidor: ${msg}`,
        },
      ]);
    } finally {
      setCarregando(false);
    }
  };

  const responderQuiz = (msgId: string, opcaoId: string) => {
    if (respostasQuiz[msgId]) return;
    setRespostasQuiz((prev) => ({ ...prev, [msgId]: opcaoId }));
  };

  return (
    <div className="max-w-4xl mx-auto h-[85vh] flex flex-col bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header do Chat */}
      <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600 rounded-2xl">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-sm flex items-center gap-2">
              Tutor IA Educar <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </h1>
            <p className="text-[10px] text-emerald-400">Orientação Pedagógica & Quizzes</p>
          </div>
        </div>

        <button
          onClick={() =>
            setMensagens([
              {
                id: Date.now().toString(),
                remetente: "ia",
                tipo: "texto",
                texto: "Conversa reiniciada! Como posso te ajudar com seus estudos agora?",
              },
            ])
          }
          className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors text-xs flex items-center gap-1"
          title="Reiniciar Chat"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Prompts Prontos / Sugestões Rápidas */}
      <div className="bg-slate-50 border-b border-slate-200/80 p-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 px-1">
          Sugestões:
        </span>
        <button
          onClick={() => enviarMensagem("Me dê um resumo rápido sobre a Revolução Industrial.")}
          className="px-3 py-1.5 bg-white border border-slate-200 hover:border-blue-500 hover:text-blue-600 rounded-xl text-xs text-slate-600 font-medium whitespace-nowrap transition-colors flex items-center gap-1.5"
        >
          <BookOpen className="w-3.5 h-3.5 text-blue-600" /> Resumo de História
        </button>
        <button
          onClick={() => enviarMensagem("Gere um quiz com 1 pergunta sobre Biologia.")}
          className="px-3 py-1.5 bg-white border border-slate-200 hover:border-blue-500 hover:text-blue-600 rounded-xl text-xs text-slate-600 font-medium whitespace-nowrap transition-colors flex items-center gap-1.5"
        >
          <HelpCircle className="w-3.5 h-3.5 text-amber-500" /> Gerar Quiz
        </button>
        <button
          onClick={() => enviarMensagem("Como posso organizar meu cronograma de estudos para o ENEM?")}
          className="px-3 py-1.5 bg-white border border-slate-200 hover:border-blue-500 hover:text-blue-600 rounded-xl text-xs text-slate-600 font-medium whitespace-nowrap transition-colors flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-600" /> Plano de Estudos
        </button>
      </div>

      {/* Histórico de Mensagens */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        {mensagens.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 max-w-[85%] ${
              msg.remetente === "user" ? "ml-auto flex-row-reverse" : ""
            }`}
          >
            <div
              className={`p-2 rounded-2xl text-white text-xs shrink-0 ${
                msg.remetente === "user" ? "bg-blue-600" : "bg-slate-900"
              }`}
            >
              {msg.remetente === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`p-4 rounded-3xl text-xs leading-relaxed ${
                msg.remetente === "user"
                  ? "bg-blue-600 text-white rounded-tr-none"
                  : "bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/60"
              }`}
            >
              <p className="whitespace-pre-line">{msg.texto}</p>

              {/* Renderizador de Quiz Interativo */}
              {msg.tipo === "quiz" && msg.quizData && (
                <div className="mt-3 bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                  <p className="font-bold text-slate-900 text-xs">{msg.quizData.pergunta}</p>

                  <div className="space-y-2">
                    {msg.quizData.opcoes.map((opcao) => {
                      const respondido = !!respostasQuiz[msg.id];
                      const foiSelecionada = respostasQuiz[msg.id] === opcao.id;
                      const ehCorreta = opcao.id === msg.quizData?.respostaCorreta;

                      let estiloBotao = "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700";
                      if (respondido) {
                        if (ehCorreta) estiloBotao = "bg-emerald-50 border-emerald-300 text-emerald-800 font-bold";
                        else if (foiSelecionada) estiloBotao = "bg-rose-50 border-rose-300 text-rose-800 font-bold";
                        else estiloBotao = "bg-slate-50 border-slate-100 text-slate-400 opacity-60";
                      }

                      return (
                        <button
                          key={opcao.id}
                          disabled={respondido}
                          onClick={() => responderQuiz(msg.id, opcao.id)}
                          className={`w-full text-left p-2.5 rounded-xl border text-xs flex items-center justify-between transition-all ${estiloBotao}`}
                        >
                          <span>
                            <strong className="mr-2">{opcao.id})</strong> {opcao.texto}
                          </span>
                          {respondido && ehCorreta && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                          {respondido && foiSelecionada && !ehCorreta && <XCircle className="w-4 h-4 text-rose-600" />}
                        </button>
                      );
                    })}
                  </div>

                  {respostasQuiz[msg.id] && (
                    <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl text-[11px] text-blue-900 mt-2 space-y-1">
                      <p className="font-bold flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Explicação Pedagógica:
                      </p>
                      <p>{msg.quizData.explicacao}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {carregando && (
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-slate-900 text-white">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 bg-slate-100 rounded-3xl rounded-tl-none border border-slate-200 flex items-center gap-2 text-xs text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <span>O Tutor Educar AI está elaborando a resposta...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Form de Envio */}
      <form onSubmit={(e) => { e.preventDefault(); enviarMensagem(); }} className="p-4 border-t border-slate-200 flex gap-3 bg-slate-50">
        <input
          type="text"
          placeholder="Tire uma dúvida, peça um resumo ou peça 'Gere um quiz'..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={carregando}
          className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs focus:outline-none focus:border-blue-600 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={carregando || !input.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-3 rounded-2xl transition-colors flex items-center justify-center"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}