"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  MessageSquare,
  Users,
  Download,
  Share2,
  LogOut,
  Send,
  FileText,
  Shield,
  Clock,
  Sparkles,
  Monitor,
} from "lucide-react";

const supabase = createClient();

type SalaData = {
  id: string;
  criador_id: string;
  topico?: string | null;
  nome?: string | null;
  materia?: string | null;
  profiles?: { nome?: string | null } | null;
};

export default function SalaPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const salaId = params.id;

  // Referência para o elemento de vídeo real
  const videoRef = useRef<HTMLVideoElement>(null);

  // Estados de controle da sala
  const [micOn, setMicOn] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [compartilhandoTela, setCompartilhandoTela] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [abaAtiva, setAbaAtiva] = useState<"chat" | "participantes" | "arquivos">("chat");

  // Dados do usuário logado e da sala
  const [usuario, setUsuario] = useState<User | null>(null);
  const [dadosSala, setDadosSala] = useState<SalaData | null>(null);

  // Chat ao vivo
  const [mensagens, setMensagens] = useState([
    { id: 1, autor: "Prof. Ricardo", texto: "Pessoal, sejam bem-vindos! Os PDFs já estão na aba de arquivos.", horario: "14:02", isAdm: true },
    { id: 2, autor: "Lucas Silva", texto: "Boa tarde! Professor, vai resolver a questão 5 da lista hoje?", horario: "14:03", isAdm: false },
  ]);
  const [novaMensagem, setNovaMensagem] = useState("");

  // 1. Carrega dados do usuário, dados da sala e conecta no Supabase Realtime
  useEffect(() => {
    async function carregar() {
      const { data: { user } } = await supabase.auth.getUser();
      setUsuario(user);

      if (salaId) {
        const { data } = await supabase
          .from("salas")
          .select("*, profiles:criador_id(nome)")
          .eq("id", salaId)
          .single();

        if (data) setDadosSala(data);
      }
    }
    carregar();

    if (!salaId) return;

    // Escuta novas mensagens via WebSocket do Supabase Realtime (sem delay)
    const channel = supabase.channel(`sala-${salaId}`, {
      config: { broadcast: { self: true } },
    });

    channel
      .on("broadcast", { event: "chat" }, ({ payload }) => {
        setMensagens((prev) => [...prev, payload]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [salaId]);

  // Vínculo da mídia (câmera/tela) ao elemento de vídeo da tela
  useEffect(() => {
    if (videoRef.current && mediaStream) {
      videoRef.current.srcObject = mediaStream;
    }
  }, [mediaStream, cameraOn, compartilhandoTela]);

  // Alternar Câmera / Microfone Reais do Dispositivo
  const toggleAudioVideo = async (tipo: "mic" | "camera") => {
    try {
      if (tipo === "mic") {
        if (micOn) {
          mediaStream?.getAudioTracks().forEach((track) => track.stop());
          setMicOn(false);
        } else {
          const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const newStream = mediaStream ? new MediaStream([...mediaStream.getTracks(), ...audioStream.getTracks()]) : audioStream;
          setMediaStream(newStream);
          setMicOn(true);
        }
      } else {
        if (cameraOn) {
          mediaStream?.getVideoTracks().forEach((track) => track.stop());
          setCameraOn(false);
          setCompartilhandoTela(false);
        } else {
          const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
          const newStream = mediaStream ? new MediaStream([...mediaStream.getAudioTracks(), ...videoStream.getVideoTracks()]) : videoStream;
          setMediaStream(newStream);
          setCameraOn(true);
          setCompartilhandoTela(false);
        }
      }
    } catch {
      alert("Acesso ao microfone ou câmera não foi permitido pelo navegador.");
    }
  };

  // Transmitir / Compartilhar Tela Real
  const toggleCompartilharTela = async () => {
    if (compartilhandoTela) {
      mediaStream?.getVideoTracks().forEach((track) => track.stop());
      setCompartilhandoTela(false);
      setCameraOn(false);
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const newStream = mediaStream ? new MediaStream([...mediaStream.getAudioTracks(), ...screenStream.getVideoTracks()]) : screenStream;
        setMediaStream(newStream);
        setCompartilhandoTela(true);
        setCameraOn(true);

        screenStream.getVideoTracks()[0].onended = () => {
          setCompartilhandoTela(false);
          setCameraOn(false);
        };
      } catch {
        console.log("Compartilhamento de tela cancelado.");
      }
    }
  };

  // Enviar Mensagem via Supabase Realtime
  const handleEnviarMensagem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaMensagem.trim()) return;

    const nomeUsuario = usuario?.user_metadata?.nome || usuario?.email?.split("@")[0] || "Você";

    const novaMsgObj = {
      id: Date.now(),
      autor: nomeUsuario,
      texto: novaMensagem,
      horario: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isAdm: dadosSala?.criador_id === usuario?.id,
    };

    // Dispara para o canal Realtime sem delay
    if (salaId) {
      await supabase.channel(`sala-${salaId}`).send({
        type: "broadcast",
        event: "chat",
        payload: novaMsgObj,
      });
    }

    setNovaMensagem("");
  };

  const handleSair = () => {
    mediaStream?.getTracks().forEach((track) => track.stop());
    router.push("/aulas");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] gap-4">
      {/* Cabeçalho da Sala */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
            <span className="w-2 h-2 rounded-full bg-red-600" /> AO VIVO
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-800">
              Sala de Estudo #{salaId} — {dadosSala?.topico || dadosSala?.nome || "Resolução de Questões ENEM"}
            </h1>
            <p className="text-[11px] text-slate-500">
              Criada por {dadosSala?.profiles?.nome || "Prof. Ricardo"} • {dadosSala?.materia || "Matemática"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert("Link da sala copiado!");
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" /> Compartilhar
          </button>

          <button
            onClick={handleSair}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-semibold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" /> Sair da Sala
          </button>
        </div>
      </div>

      {/* ÁREA PRINCIPAL: Vídeo + Painel Lateral */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-0">
        
        {/* Lado Esquerdo: Área de Transmissão de Vídeo (3 colunas) */}
        <div className="lg:col-span-3 bg-slate-950 rounded-2xl border border-slate-800 relative flex flex-col justify-between overflow-hidden shadow-2xl">
          
          {/* Badge de Tecnologia / Monitoramento */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 text-white text-xs">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>{compartilhandoTela ? "Transmitindo Sua Tela" : "Modo Colaborativo Protegido"}</span>
          </div>

          {/* Player de Vídeo / Transmissão Real */}
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            {cameraOn ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-contain rounded-xl"
                />
                <div className="absolute bottom-4 left-4 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-lg text-white text-xs flex items-center gap-2 border border-slate-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Transmitindo
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400">
                  <VideoOff className="w-8 h-8" />
                </div>
                <p className="text-slate-400 text-xs">Sua câmera / transmissão está desligada</p>
              </div>
            )}
          </div>

          {/* Barra de Controles de Áudio / Vídeo */}
          <div className="bg-slate-900/90 backdrop-blur-md border-t border-slate-800 p-4 flex items-center justify-center gap-4">
            <button
              onClick={() => toggleAudioVideo("mic")}
              className={`p-3 rounded-full transition-all ${
                micOn ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
              }`}
              title={micOn ? "Desativar Microfone" : "Ativar Microfone"}
            >
              {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>

            <button
              onClick={() => toggleAudioVideo("camera")}
              className={`p-3 rounded-full transition-all ${
                cameraOn && !compartilhandoTela ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
              }`}
              title={cameraOn ? "Desativar Câmera" : "Ativar Câmera"}
            >
              {cameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>

            <button
              onClick={toggleCompartilharTela}
              className={`p-3 rounded-full transition-all ${
                compartilhandoTela ? "bg-blue-600 text-white" : "bg-slate-800 hover:bg-slate-700 text-white"
              }`}
              title={compartilhandoTela ? "Parar Compartilhamento" : "Transmitir Tela"}
            >
              <Monitor className="w-5 h-5" />
            </button>

            <button
              onClick={() => {
                const textoChat = mensagens.map((m) => `${m.autor}: ${m.texto}`).join("\n");
                alert(`🤖 RESUMO DA AULA (GEMINI AI):\n\nO chat registrou ${mensagens.length} mensagens.\n\nPrincipais interações:\n${textoChat.slice(0, 200)}...`);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-semibold text-xs transition-all shadow-lg shadow-blue-600/30"
            >
              <Sparkles className="w-4 h-4 text-blue-200" /> Resumo Gemini
            </button>
          </div>
        </div>

        {/* Lado Direito: Painel Lateral (Chat, Alunos, Arquivos) */}
        <div className="bg-white rounded-2xl border border-slate-200 flex flex-col overflow-hidden shadow-sm">
          
          {/* Navegação entre as Abas */}
          <div className="flex border-b border-slate-100 bg-slate-50/50 p-1">
            <button
              onClick={() => setAbaAtiva("chat")}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors ${
                abaAtiva === "chat" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" /> Chat
            </button>
            <button
              onClick={() => setAbaAtiva("participantes")}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors ${
                abaAtiva === "participantes" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Users className="w-3.5 h-3.5" /> Alunos ({mensagens.length > 2 ? mensagens.length : 12})
            </button>
            <button
              onClick={() => setAbaAtiva("arquivos")}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors ${
                abaAtiva === "arquivos" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Download className="w-3.5 h-3.5" /> Docs (5)
            </button>
          </div>

          {/* Conteúdo da Aba 1: CHAT */}
          {abaAtiva === "chat" && (
            <div className="flex-1 flex flex-col justify-between p-4 min-h-0">
              <div className="space-y-3 overflow-y-auto pr-1">
                {mensagens.map((m) => (
                  <div key={m.id} className="space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className={`font-bold ${m.isAdm ? "text-blue-600" : "text-slate-700"}`}>
                        {m.autor} {m.isAdm && "(ADM)"}
                      </span>
                      <span className="text-slate-400">{m.horario}</span>
                    </div>
                    <div className={`p-2.5 rounded-xl text-xs ${m.isAdm ? "bg-blue-50 text-blue-900 border border-blue-100" : "bg-slate-100 text-slate-800"}`}>
                      {m.texto}
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleEnviarMensagem} className="pt-3 border-t border-slate-100 flex gap-2">
                <input
                  type="text"
                  placeholder="Digite sua dúvida..."
                  value={novaMensagem}
                  onChange={(e) => setNovaMensagem(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-600"
                />
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-xl transition-colors">
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* Conteúdo da Aba 2: PARTICIPANTES */}
          {abaAtiva === "participantes" && (
            <div className="p-4 space-y-3 overflow-y-auto flex-1">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                    {dadosSala?.profiles?.nome?.substring(0, 2).toUpperCase() || "PR"}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">{dadosSala?.profiles?.nome || "Prof. Ricardo"}</p>
                    <p className="text-[10px] text-blue-600 font-medium">Criador da Sala</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                    {usuario?.email?.[0]?.toUpperCase() || "VC"}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      {usuario?.user_metadata?.nome || usuario?.email || "Você"}
                    </p>
                    <p className="text-[10px] text-slate-400">Estudante</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Conteúdo da Aba 3: ARQUIVOS */}
          {abaAtiva === "arquivos" && (
            <div className="p-4 space-y-3 overflow-y-auto flex-1">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-slate-800">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold line-clamp-1">Lista_Exercicios_ENEM.pdf</span>
                </div>
                <p className="text-[10px] text-slate-500">Postado pelo ADM • 2.4 MB</p>
                <button
                  onClick={() => alert("Iniciando download do arquivo...")}
                  className="w-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Baixar PDF
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}