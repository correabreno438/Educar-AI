"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Bot,
  Calendar,
  PlaySquare,
  ArrowRight,
  Sparkles,
  Users,
  PlayCircle,
  Clock,
  Calculator,
  BookOpen,
  Landmark,
  FlaskConical,
  Atom,
  Globe,
  Languages,
  Microscope,
  Loader2,
} from "lucide-react";

const supabase = createClient();
const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

type RecentClass = {
  id: string | number;
  title: string;
  subject: string;
  duration: string;
  date: string;
  instructor: string;
};

type CollaborativeRoom = {
  id: string | number;
  subject: string;
  topic: string;
  activeUsers: number;
  status: string;
};

const categoryStyles: Record<
  string,
  { icon: React.ReactNode; bg: string; text: string }
> = {
  Matemática: {
    icon: <Calculator className="w-4 h-4" />,
    bg: "bg-blue-100",
    text: "text-blue-600",
  },
  Português: {
    icon: <BookOpen className="w-4 h-4" />,
    bg: "bg-emerald-100",
    text: "text-emerald-600",
  },
  História: {
    icon: <Landmark className="w-4 h-4" />,
    bg: "bg-amber-100",
    text: "text-amber-600",
  },
  Química: {
    icon: <FlaskConical className="w-4 h-4" />,
    bg: "bg-purple-100",
    text: "text-purple-600",
  },
  Física: {
    icon: <Atom className="w-4 h-4" />,
    bg: "bg-cyan-100",
    text: "text-cyan-600",
  },
  Biologia: {
    icon: <Microscope className="w-4 h-4" />,
    bg: "bg-green-100",
    text: "text-green-600",
  },
  Geografia: {
    icon: <Globe className="w-4 h-4" />,
    bg: "bg-orange-100",
    text: "text-orange-600",
  },
  Inglês: {
    icon: <Languages className="w-4 h-4" />,
    bg: "bg-indigo-100",
    text: "text-indigo-600",
  },
};

export default function HomePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [tarefasAgenda, setTarefasAgenda] = useState<Record<string, string>>({});
  const [recentClasses, setRecentClasses] = useState<RecentClass[]>([]);
  const [collaborativeRooms, setCollaborativeRooms] = useState<CollaborativeRoom[]>([]);

  useEffect(() => {
    async function carregarDadosHome() {
      setLoading(true);

      // 1. Pega usuário atual
      const { data: { user } } = await supabase.auth.getUser();

      // 2. Busca compromissos do usuário na tabela `tarefas` para preencher a Agenda da Semana
      if (user) {
        const { data: tarefas } = await supabase
          .from("tarefas")
          .select("prazo, titulo, materia")
          .eq("user_id", user.id);

        if (tarefas && tarefas.length > 0) {
          const mapaAgenda: Record<string, string> = {};
          tarefas.forEach((t) => {
            if (t.prazo) {
              const dataObj = new Date(t.prazo + "T00:00:00");
              const diaIndice = dataObj.getDay();
              const nomeDia = diasSemana[diaIndice];
              mapaAgenda[nomeDia] = `${t.materia}: ${t.titulo}`;
            }
          });
          setTarefasAgenda(mapaAgenda);
        }
      }

      // 3. Busca Aulas Recentes na tabela `videoaulas`
      const { data: aulasBanco } = await supabase
        .from("videoaulas")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(4);

      if (aulasBanco && aulasBanco.length > 0) {
        setRecentClasses(
          aulasBanco.map((a) => ({
            id: a.id,
            title: a.titulo,
            subject: a.materia,
            duration: a.duracao || "25 min",
            date: "Postado recente",
            instructor: a.postadoPor || a.autor || "Professor",
          }))
        );
      } else {
        // Fallback idêntico ao código visual original
        setRecentClasses([
          {
            id: 1,
            title: "Introdução às Equações de 2º Grau",
            subject: "Matemática",
            duration: "25 min",
            date: "Postado hoje",
            instructor: "Prof. Ricardo",
          },
          {
            id: 2,
            title: "Sintaxe e Análise Sintática Completa",
            subject: "Português",
            duration: "40 min",
            date: "Postado ontem",
            instructor: "Profª. Ana Maria",
          },
          {
            id: 3,
            title: "Revolução Industrial e suas Consequências",
            subject: "História",
            duration: "30 min",
            date: "Há 2 dias",
            instructor: "Prof. Carlos",
          },
          {
            id: 4,
            title: "Tabela Periódica: Ligações Químicas",
            subject: "Química",
            duration: "35 min",
            date: "Há 3 dias",
            instructor: "Profª. Fernanda",
          },
        ]);
      }

      // 4. Busca Salas Colaborativas na tabela `salas`
      const { data: salasBanco } = await supabase
        .from("salas")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(4);

      if (salasBanco && salasBanco.length > 0) {
        setCollaborativeRooms(
          salasBanco.map((s) => ({
            id: s.id,
            subject: s.materia,
            topic: s.topico || s.nome,
            activeUsers: s.membros_count || s.membros || 1,
            status: s.status || "Ao Vivo",
          }))
        );
      } else {
        // Fallback idêntico ao código visual original
        setCollaborativeRooms([
          {
            id: 1,
            subject: "Física",
            topic: "Cinemática & Leis de Newton (Resolução de Lista)",
            activeUsers: 8,
            status: "Ao Vivo",
          },
          {
            id: 2,
            subject: "Matemática",
            topic: "Geometria Espacial para o ENEM",
            activeUsers: 14,
            status: "Ao Vivo",
          },
          {
            id: 3,
            subject: "Biologia",
            topic: "Genética & Primeira Lei de Mendel",
            activeUsers: 6,
            status: "Em breve",
          },
          {
            id: 4,
            subject: "Geografia",
            topic: "Geopolítica e Globalização Século XXI",
            activeUsers: 11,
            status: "Ao Vivo",
          },
        ]);
      }

      setLoading(false);
    }

    carregarDadosHome();
  }, []);

  return (
    <div className="space-y-8">
      {/* Banner Gemini */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-slate-900 via-blue-950 to-slate-900 p-8 text-white shadow-2xl border border-slate-800">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
          <div className="space-y-4 max-w-xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-400/20 px-3 py-1 rounded-full text-blue-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" /> Novo Recurso de Inteligência Artificial
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
              <span className="text-blue-400">Gemini</span> agora <span className="text-blue-400">auxilia</span> você no Educar. Entre no chat agora!
            </h1>
            <p className="text-slate-300 text-sm md:text-base">
              Obtenha sugestões de tópicos, resumos de textos e tire suas dúvidas pedagógicas em tempo real com nosso Tutor IA.
            </p>
            <div className="pt-2">
              <Link
                href="/gemini"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-blue-500/25"
              >
                <Bot className="w-5 h-5" />
                Abrir Tutor IA
              </Link>
            </div>
          </div>

          {/* Miniatura do Chat */}
          <div className="bg-slate-900/90 border border-slate-700/80 p-5 rounded-2xl max-w-md w-full shadow-2xl backdrop-blur-sm space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="p-2 bg-blue-600 text-white rounded-lg">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Gemini AI</p>
                <p className="text-[10px] text-emerald-400 flex items-center gap-1">● Online agora</p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-slate-300 font-semibold">Resumo das Anotações sobre a Revolução Industrial:</p>
              <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
                <li>Ocorreu no Reino Unido no final do século XVIII.</li>
                <li>Mudança de produção manual para máquinas a vapor.</li>
                <li>Impactos sociais: urbanização e surgimento do capitalismo industrial.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Agenda + Histórico */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Agenda */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" /> Agenda da Semana
            </h2>
            <Link href="/agendamento" className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1">
              Ver tudo <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {diasSemana.map((dia) => {
              const compromisso = tarefasAgenda[dia];
              return (
                <div key={dia} className="flex items-center gap-4 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="font-bold text-xs text-slate-600 w-8 text-center">{dia}</span>
                  <div className={`flex-1 border-l-2 pl-3 text-xs ${compromisso ? "border-blue-600 text-slate-800 font-semibold" : "border-slate-300 text-slate-400"}`}>
                    {compromisso || "Sem compromissos"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Histórico */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <PlaySquare className="w-5 h-5 text-blue-600" /> Histórico de Aulas
            </h2>
            <Link href="/aulas" className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1">
              Ir para Aulas <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-4">
              <div className="w-16 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold text-xs shrink-0">
                AULA
              </div>
              <div className="flex-1">
                <h3 className="text-xs font-semibold text-slate-800">Como reforçar os estudos de forma eficaz</h3>
                <p className="text-[10px] text-slate-500">Assistido recentemente</p>
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-4">
              <div className="w-16 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold text-xs shrink-0">
                AULA
              </div>
              <div className="flex-1">
                <h3 className="text-xs font-semibold text-slate-800">Aprendendo a ler e interpretar textos</h3>
                <p className="text-[10px] text-slate-500">Assistido recentemente</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Aulas Novas & Adicionadas Recente */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <PlayCircle className="w-5 h-5 text-blue-600" /> Aulas Novas & Adicionadas Recente
            </h2>
            <p className="text-xs text-slate-500">
              Assista aos últimos vídeos postados na plataforma
            </p>
          </div>
          <Link
            href="/aulas"
            className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1"
          >
            Ver catálogo completo <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentClasses.map((item) => {
              const style = categoryStyles[item.subject] || {
                icon: <BookOpen className="w-4 h-4" />,
                bg: "bg-slate-100",
                text: "text-slate-600",
              };

              return (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
                  onClick={() => router.push("/aulas")}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${style.bg} ${style.text}`}
                      >
                        {style.icon}
                        {item.subject}
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {item.duration}
                      </span>
                    </div>

                    <h3 className="font-semibold text-slate-800 text-xs group-hover:text-blue-600 transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>{item.instructor}</span>
                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                      {item.date}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Salas Colaborativas por Assunto */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" /> Salas Colaborativas por Assunto
            </h2>
            <p className="text-xs text-slate-500">
              Estude em grupo e discuta matérias específicas ao vivo
            </p>
          </div>
          <Link
            href="/aulas"
            className="text-xs text-indigo-600 font-semibold hover:underline flex items-center gap-1"
          >
            Ver todas as salas <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {collaborativeRooms.map((room) => {
              const style = categoryStyles[room.subject] || {
                icon: <BookOpen className="w-4 h-4" />,
                bg: "bg-slate-100",
                text: "text-slate-600",
              };

              return (
                <div
                  key={room.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-indigo-300 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${style.bg} ${style.text}`}
                      >
                        {style.icon}
                        {room.subject}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          room.status === "Ao Vivo"
                            ? "bg-emerald-100 text-emerald-700 font-semibold"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        ● {room.status}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-800 text-sm">
                      {room.topic}
                    </h3>
                  </div>

                  <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                      <Users className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{room.activeUsers} alunos estudando</span>
                    </div>
                    <Link
                      href={`/aulas/sala/${room.id}`}
                      className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-semibold px-3.5 py-1.5 rounded-lg text-xs transition-colors"
                    >
                      Entrar na Sala
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}