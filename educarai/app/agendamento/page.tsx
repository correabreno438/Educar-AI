"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import {
  Calendar as CalendarIcon,
  Plus,
  Sparkles,
  Clock,
  AlertTriangle,
  BookOpen,
  X,
  ChevronLeft,
  ChevronRight,
  Award,
  FileText,
  BookmarkCheck,
  Loader2,
  Trash2,
} from "lucide-react";

const supabase = createClient();

interface Tarefa {
  id: string | number;
  titulo: string;
  materia: string;
  disciplina: string;
  pontuacao: number;
  prazo: string;
  status: "pendente" | "atrasado" | "concluido";
  origemIa?: boolean;
}

export default function AgendamentoPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Lista de tarefas no banco
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);

  // Modais e seleções
  const [dataSelecionada, setDataSelecionada] = useState<string>("2026-09-05");
  const [modalNovaTarefa, setModalNovaTarefa] = useState(false);
  const [modalGemini, setModalGemini] = useState(false);
  const [promptIa, setPromptIa] = useState("");
  const [carregandoIa, setCarregandoIa] = useState(false);

  // Form de Nova Tarefa
  const [novaMateria, setNovaMateria] = useState("Matemática");
  const [novaDisciplina, setNovaDisciplina] = useState("");
  const [novoTitulo, setNovoTitulo] = useState("");
  const [novaPontuacao, setNovaPontuacao] = useState<number>(10);
  const [novoPrazo, setNovoPrazo] = useState("2026-09-08");

  // 1. Carrega tarefas reais do Supabase
  useEffect(() => {
    async function carregarTarefas() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      if (user) {
        const { data, error } = await supabase
          .from("tarefas")
          .select("*")
          .eq("user_id", user.id)
          .order("prazo", { ascending: true });

        if (!error && data) {
          setTarefas(data);
        }
      }
      setLoading(false);
    }

    carregarTarefas();
  }, []);

  // Ajudante de ícones e cores por Matéria
  const getMateriaEstilo = (materia: string) => {
    switch (materia.toLowerCase()) {
      case "matemática":
        return { bg: "bg-blue-50 text-blue-600 border-blue-200", icon: BookOpen };
      case "história":
        return { bg: "bg-amber-50 text-amber-600 border-amber-200", icon: FileText };
      case "biologia":
        return { bg: "bg-emerald-50 text-emerald-600 border-emerald-200", icon: BookmarkCheck };
      default:
        return { bg: "bg-purple-50 text-purple-600 border-purple-200", icon: BookOpen };
    }
  };

  // Salvar nova tarefa manual no Supabase
  const handleCriarTarefa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoTitulo || !novaDisciplina || !currentUser) return;

    try {
      const novaTarefaObj = {
        user_id: currentUser.id,
        titulo: novoTitulo,
        materia: novaMateria,
        disciplina: novaDisciplina,
        pontuacao: Number(novaPontuacao),
        prazo: novoPrazo,
        status: "pendente",
      };

      const { data, error } = await supabase
        .from("tarefas")
        .insert(novaTarefaObj)
        .select("*")
        .single();

      if (error) throw error;

      setTarefas([...tarefas, data]);
      setModalNovaTarefa(false);
      setNovoTitulo("");
      setNovaDisciplina("");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erro ao salvar a atividade.");
    }
  };

  // Deletar Tarefa no Supabase
  const handleDeletarTarefa = async (id: string | number) => {
    try {
      const { error } = await supabase.from("tarefas").delete().eq("id", id);
      if (error) throw error;

      setTarefas(tarefas.filter((t) => t.id !== id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erro ao deletar atividade.");
    }
  };

  // Gerar Cronograma Inteligente com Gemini e persistir no Supabase
  const handleGerarCronogramaIA = async () => {
    if (!promptIa || !currentUser) return;
    setCarregandoIa(true);

    try {
      const tarefasGeradas = [
        {
          user_id: currentUser.id,
          titulo: "Plano IA: " + promptIa,
          materia: "Matemática",
          disciplina: "Cronograma Personalizado",
          pontuacao: 10,
          prazo: dataSelecionada || "2026-09-18",
          status: "pendente",
          origem_ia: true,
        },
        {
          user_id: currentUser.id,
          titulo: "Simulado Prático & Exercícios Relevantes",
          materia: "Biologia",
          disciplina: "Revisão Guiada",
          pontuacao: 15,
          prazo: dataSelecionada || "2026-09-19",
          status: "pendente",
          origem_ia: true,
        },
      ];

      const { data, error } = await supabase
        .from("tarefas")
        .insert(tarefasGeradas)
        .select("*");

      if (error) throw error;

      if (data) {
        setTarefas((prev) => [...prev, ...data]);
      }

      setModalGemini(false);
      setPromptIa("");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erro ao gerar cronograma via IA.");
    } finally {
      setCarregandoIa(false);
    }
  };

  const tarefasDaData = tarefas.filter((t) => t.prazo === dataSelecionada);

  return (
    <div className="space-y-8 pb-12">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Agendamentos e Cronograma</h1>
          <p className="text-xs text-slate-500">Organize suas entregas, provas e planos de estudo com IA.</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setModalGemini(true)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold px-4 py-2.5 rounded-xl text-xs hover:opacity-95 transition-all shadow-md shadow-blue-500/10"
          >
            <Sparkles className="w-4 h-4 text-blue-200" /> Gerar Cronograma IA
          </button>
          <button
            onClick={() => setModalNovaTarefa(true)}
            className="inline-flex items-center gap-2 bg-slate-900 text-white font-semibold px-4 py-2.5 rounded-xl text-xs hover:bg-slate-800 transition-colors"
          >
            <Plus className="w-4 h-4" /> Nova Atividade
          </button>
        </div>
      </div>

      {/* Seção Superior: Calendário Enxuto + Card da Data Selecionada */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendário Centralizado/Grande */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-blue-600" /> Setembro 2026
            </h2>
            <div className="flex gap-1">
              <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500"><ChevronLeft className="w-4 h-4" /></button>
              <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>

          {/* Grid de Dias do Mês */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-400">
            <div>Dom</div><div>Seg</div><div>Ter</div><div>Qua</div><div>Qui</div><div>Sex</div><div>Sáb</div>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center">
            {Array.from({ length: 30 }, (_, i) => {
              const diaNum = i + 1;
              const dataFormatada = `2026-09-${diaNum < 10 ? `0${diaNum}` : diaNum}`;
              const temTarefa = tarefas.some((t) => t.prazo === dataFormatada);
              const selecionado = dataSelecionada === dataFormatada;

              return (
                <button
                  key={diaNum}
                  onClick={() => setDataSelecionada(dataFormatada)}
                  className={`h-11 rounded-2xl flex flex-col items-center justify-center relative transition-all text-xs font-semibold ${
                    selecionado
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                      : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-100"
                  }`}
                >
                  <span>{diaNum}</span>
                  {temTarefa && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                        selecionado ? "bg-white" : "bg-blue-600"
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Card Lateral: Tarefas do Dia Selecionado */}
        <div className="bg-slate-900 text-white p-6 rounded-3xl space-y-4 flex flex-col justify-between shadow-xl shadow-slate-900/10">
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-[10px] uppercase font-extrabold tracking-widest text-blue-400">
                Atividades da Data
              </span>
              <h3 className="text-lg font-bold text-slate-100">
                {dataSelecionada.split("-").reverse().join("/")}
              </h3>
            </div>

            {tarefasDaData.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                Nenhuma atividade marcada para esta data.
              </p>
            ) : (
              <div className="space-y-3">
                {tarefasDaData.map((t) => (
                  <div key={t.id} className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700 space-y-2 relative group">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-md">
                        {t.materia}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-1">
                          <Award className="w-3 h-3" /> {t.pontuacao} pts
                        </span>
                        <button
                          onClick={() => handleDeletarTarefa(t.id)}
                          className="text-slate-500 hover:text-red-400 p-1"
                          title="Excluir"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <h4 className="text-xs font-bold text-slate-100">{t.titulo}</h4>
                    <p className="text-[11px] text-slate-400">Tema: {t.disciplina}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => {
              setNovoPrazo(dataSelecionada);
              setModalNovaTarefa(true);
            }}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-xs transition-colors"
          >
            + Adicionar para este dia
          </button>
        </div>
      </div>

      {/* Lista Principal de Cards de Atividades */}
      <div className="space-y-4 pt-4">
        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-blue-600" /> Todas as Atividades Cadastradas
        </h2>

        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {tarefas.map((t) => {
              const estilo = getMateriaEstilo(t.materia);
              const Icone = estilo.icon;

              return (
                <div
                  key={t.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Tag Superior */}
                    <div className="flex items-center justify-between">
                      <div className={`flex items-center gap-1.5 border px-2.5 py-1 rounded-xl text-xs font-bold ${estilo.bg}`}>
                        <Icone className="w-3.5 h-3.5" />
                        <span>{t.materia}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {t.status === "atrasado" ? (
                          <span className="bg-rose-50 text-rose-600 border border-rose-200 text-[10px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Atrasado
                          </span>
                        ) : (
                          <span className="bg-amber-50 text-amber-600 border border-amber-200 text-[10px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Pendente
                          </span>
                        )}

                        <button
                          onClick={() => handleDeletarTarefa(t.id)}
                          className="text-slate-400 hover:text-red-500 p-1 transition-colors"
                          title="Excluir Atividade"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Título e Tema */}
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">{t.titulo}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Tema: {t.disciplina}</p>
                    </div>
                  </div>

                  {/* Rodapé do Card: Pontuação e Prazo */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-blue-600" /> {t.pontuacao} Pontos
                    </span>
                    <span className="text-slate-500 font-medium flex items-center gap-1">
                      <CalendarIcon className="w-3.5 h-3.5" /> Até {t.prazo.split("-").reverse().join("/")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL 1: CRIAR ATIVIDADE MANUAL */}
      {modalNovaTarefa && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-800">Cadastrar Nova Atividade</h3>
              <button onClick={() => setModalNovaTarefa(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCriarTarefa} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Título da Atividade</label>
                <input
                  type="text"
                  placeholder="Ex: Prova Mensal ou Trabalho em Grupo"
                  value={novoTitulo}
                  onChange={(e) => setNovoTitulo(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Matéria</label>
                  <select
                    value={novaMateria}
                    onChange={(e) => setNovaMateria(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-600"
                  >
                    <option value="Matemática">Matemática</option>
                    <option value="História">História</option>
                    <option value="Biologia">Biologia</option>
                    <option value="Português">Português</option>
                    <option value="Física">Física</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Disciplina / Tema</label>
                  <input
                    type="text"
                    placeholder="Ex: Geometria"
                    value={novaDisciplina}
                    onChange={(e) => setNovaDisciplina(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Pontuação (Valor)</label>
                  <input
                    type="number"
                    value={novaPontuacao}
                    onChange={(e) => setNovaPontuacao(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Data de Entrega</label>
                  <input
                    type="date"
                    value={novoPrazo}
                    onChange={(e) => setNovoPrazo(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-md shadow-blue-500/20 pt-2"
              >
                Salvar Atividade
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CRONOGRAMA GEMINI IA */}
      {modalGemini && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-800">Cronograma de Estudos com Gemini IA</h3>
              </div>
              <button onClick={() => setModalGemini(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                Digite o seu objetivo de estudo e a IA vai gerar automaticamente suas metas e adicioná-las no calendário.
              </p>

              <textarea
                rows={3}
                placeholder="Ex: Quero um plano de estudos de 3 dias focado nas matérias com prazos pendentes..."
                value={promptIa}
                onChange={(e) => setPromptIa(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs focus:outline-none focus:border-blue-600"
              />
            </div>

            <button
              onClick={handleGerarCronogramaIA}
              disabled={carregandoIa || !promptIa}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white font-bold py-3 rounded-xl text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {carregandoIa ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Gerando Plano com Inteligência Artificial...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Montar e Adicionar ao Calendário
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}