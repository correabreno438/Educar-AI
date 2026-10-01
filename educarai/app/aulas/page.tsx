"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Search,
  BookOpen,
  Users,
  HelpCircle,
  Sparkles,
  PlayCircle,
  Clock,
  UserCheck,
  Video,
  PlusCircle,
  X,
  Trash2,
  Award,
  Upload,
  Image as ImageIcon,
  Calculator,
  Landmark,
  FlaskConical,
  Atom,
  Globe,
  Languages,
  Microscope,
  AlertTriangle,
  Download,
  Loader2,
} from "lucide-react";

const supabase = createClient();

type CurrentUser = {
  id: string;
};

type Sala = {
  id: string | number;
  materia?: string;
  topico?: string;
  nome?: string;
  descricao?: string;
  criador_id?: string;
  isOwner?: boolean;
  preview_img?: string;
  previewImg?: string;
  status?: string;
  membros_count?: number;
  membros?: number;
  arquivos?: number;
  adm?: string;
  admAvatar?: string;
  profiles?: {
    nome?: string;
    avatar_url?: string;
  };
};

type AulaPostada = {
  id: string | number;
  titulo?: string;
  materia?: string;
  postadoPor?: string;
  autor?: string;
  tipoUsuario?: string;
  duracao?: string;
  avaliacoes?: number;
  thumb?: string;
  preview_img?: string;
};

const categoryStyles: Record<
  string,
  { icon: React.ReactNode; bg: string; text: string }
> = {
  Matemática: { icon: <Calculator className="w-4 h-4" />, bg: "bg-blue-100", text: "text-blue-600" },
  Português: { icon: <BookOpen className="w-4 h-4" />, bg: "bg-emerald-100", text: "text-emerald-600" },
  História: { icon: <Landmark className="w-4 h-4" />, bg: "bg-amber-100", text: "text-amber-600" },
  Química: { icon: <FlaskConical className="w-4 h-4" />, bg: "bg-purple-100", text: "text-purple-600" },
  Física: { icon: <Atom className="w-4 h-4" />, bg: "bg-cyan-100", text: "text-cyan-600" },
  Biologia: { icon: <Microscope className="w-4 h-4" />, bg: "bg-green-100", text: "text-green-600" },
  Geografia: { icon: <Globe className="w-4 h-4" />, bg: "bg-orange-100", text: "text-orange-600" },
  Inglês: { icon: <Languages className="w-4 h-4" />, bg: "bg-indigo-100", text: "text-indigo-600" },
};

export default function AulasPage() {
  const router = useRouter();
  
  // Estado do Usuário e Carregamento
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Filtros e Modais
  const [busca, setBusca] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [salaParaDeletar, setSalaParaDeletar] = useState<string | number | null>(null);

  // Listas de Dados
  const [salas, setSalas] = useState<Sala[]>([]);
  const [aulasPostadas, setAulasPostadas] = useState<AulaPostada[]>([]);

  // Formulário de Nova Sala
  const [novaMateria, setNovaMateria] = useState("Matemática");
  const [novoTitulo, setNovoTitulo] = useState("");
  const [novoTema, setNovoTema] = useState("");
  const [novaDescricao, setNovaDescricao] = useState("");
  const [capaFile, setCapaFile] = useState<File | null>(null);
  const [previewThumb, setPreviewThumb] = useState<string | null>(null);
  const [criandoSala, setCriandoSala] = useState(false);

  // Carrega usuário e dados do Supabase
  useEffect(() => {
    async function carregarDados() {
      setLoading(true);

      // 1. Pega usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      // 2. Busca salas no Supabase com metadados do criador
      const { data: salasBanco } = await supabase
        .from("salas")
        .select("*, profiles:criador_id(nome, avatar_url)")
        .order("created_at", { ascending: false });

      if (salasBanco && salasBanco.length > 0) {
        setSalas(salasBanco);
      } else {
        // Fallback para exibição inicial caso o banco ainda esteja sem registros
        setSalas([
          {
            id: "1",
            materia: "Matemática",
            topico: "Resolução de Questões ENEM & Equações",
            descricao: "Revisão prática dos principais modelos de questões do ENEM sobre funções e equações de 2º grau.",
            adm: "Prof. Ricardo",
            admAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
            membros: 12,
            arquivos: 5,
            previewImg: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80",
            status: "Ao Vivo",
            criador_id: "outro",
          },
        ]);
      }

      // 3. Busca videoaulas gravadas
      const { data: aulasBanco } = await supabase
        .from("videoaulas")
        .select("*")
        .order("created_at", { ascending: false });

      if (aulasBanco && aulasBanco.length > 0) {
        setAulasPostadas(aulasBanco);
      } else {
        setAulasPostadas([
          {
            id: "1",
            titulo: "Dominando Trigonometria no Triângulo Retângulo",
            materia: "Matemática",
            postadoPor: "Prof. Carlos",
            tipoUsuario: "Professor",
            duracao: "18 min",
            avaliacoes: 142,
            thumb: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=500&auto=format&fit=crop&q=80",
          },
          {
            id: "2",
            titulo: "Resumo Prático: Estequiometria sem Complicação",
            materia: "Química",
            postadoPor: "Fernanda Costa",
            tipoUsuario: "Aluno",
            duracao: "12 min",
            avaliacoes: 98,
            thumb: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=500&auto=format&fit=crop&q=80",
          },
        ]);
      }

      setLoading(false);
    }

    carregarDados();
  }, []);

  // Regra: Verifica se o usuário logado já possui uma sala criada
  const usuarioJaTemSala = currentUser
    ? salas.some((s) => s.criador_id === currentUser.id)
    : false;

  // Pré-visualização da Capa selecionada
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCapaFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewThumb(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Criação de Nova Sala com Supabase Storage e Insert na Tabela `salas`
  const handleCriarSala = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoTitulo || !currentUser || usuarioJaTemSala) return;

    try {
      setCriandoSala(true);
      let capaUrl = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80";

      // Upload da capa se um arquivo foi enviado
      if (capaFile) {
        const fileExt = capaFile.name.split(".").pop();
        const filePath = `capas-salas/${currentUser.id}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, capaFile, { upsert: true });

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from("avatars")
            .getPublicUrl(filePath);
          capaUrl = publicUrl;
        }
      }

      // Inserção no banco de dados
      const topicoFormatado = novoTema ? `${novoTitulo} — ${novoTema}` : novoTitulo;
      const { data: novaSala, error } = await supabase
        .from("salas")
        .insert({
          materia: novaMateria,
          nome: novoTitulo,
          topico: topicoFormatado,
          descricao: novaDescricao || "Sem descrição detalhada.",
          criador_id: currentUser.id,
          preview_img: capaUrl,
          status: "Ao Vivo",
          membros_count: 1,
        })
        .select("*, profiles:criador_id(nome, avatar_url)")
        .single();

      if (error) throw error;

      setSalas([novaSala, ...salas]);
      setIsModalOpen(false);
      setNovoTitulo("");
      setNovoTema("");
      setNovaDescricao("");
      setPreviewThumb(null);
      setCapaFile(null);

      // Redireciona para a sala criada
      router.push(`/aulas/sala/${novaSala.id}`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro ao criar a sala no Supabase.";
      alert(message);
    } finally {
      setCriandoSala(false);
    }
  };

  // Exclusão de Sala no Supabase
  const confirmarDeletarSala = async () => {
    if (!salaParaDeletar) return;

    try {
      const { error } = await supabase
        .from("salas")
        .delete()
        .eq("id", salaParaDeletar);

      if (error) throw error;

      setSalas(salas.filter((sala) => sala.id !== salaParaDeletar));
      setSalaParaDeletar(null);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro ao deletar sala.";
      alert(message);
    }
  };

  // Filtragem pela busca
  const salasFiltradas = salas.filter((s) =>
    (s.topico || s.nome || "").toLowerCase().includes(busca.toLowerCase()) ||
    (s.materia || "").toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="space-y-10 relative">
      {/* Banner Principal */}
      <div className="relative overflow-hidden rounded-3xl min-h-[260px] flex items-center p-8 md:p-12 shadow-2xl border border-slate-800">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&auto=format&fit=crop&q=80"
          alt="Estudantes em grupo"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-blue-950/60 backdrop-blur-[2px]" />

        <div className="relative z-10 max-w-2xl space-y-4 text-white">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 backdrop-blur-md border border-blue-400/30 px-3.5 py-1 rounded-full text-blue-300 text-xs font-semibold">
            <Award className="w-4 h-4 text-amber-400" /> Destaque da Semana Educar
          </div>
          <h1 className="text-2xl md:text-4xl font-black tracking-tight leading-tight">
            Aulão Especial: Redação e Interpretação para o ENEM
          </h1>
          <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
            Aprenda a estruturar teses perfeitas e repertórios socioculturais com os melhores mentores da plataforma.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl text-xs transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2">
              <PlayCircle className="w-4 h-4" /> Assistir Aula
            </button>
            <span className="text-xs text-slate-300 flex items-center gap-1 font-medium">
              <Clock className="w-3.5 h-3.5 text-blue-400" /> Duração: 45 min
            </span>
          </div>
        </div>
      </div>

      {/* Pesquisa + Ações */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full max-w-2xl">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Pesquise o assunto (ex: Equação do 2º Grau)..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs focus:outline-none focus:border-blue-600 shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => !usuarioJaTemSala && setIsModalOpen(true)}
            disabled={usuarioJaTemSala}
            title={
              usuarioJaTemSala
                ? "Você já possui uma sala ativa. Delete sua sala atual para criar uma nova."
                : "Criar uma nova sala de estudos colaborativa"
            }
            className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 font-semibold px-5 py-3 rounded-2xl text-xs transition-all shadow-md ${
              usuarioJaTemSala
                ? "bg-slate-200 text-slate-500 cursor-not-allowed opacity-80"
                : "bg-emerald-600 hover:bg-emerald-700 text-white"
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            {usuarioJaTemSala ? "Sala Já Criada (1/1)" : "Criar Nova Sala"}
          </button>

          <button
            onClick={() => alert(`Buscando com Gemini para: ${busca || "todos"}`)}
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-3 rounded-2xl text-xs transition-all shadow-md shrink-0"
          >
            <Sparkles className="w-4 h-4 text-blue-200" />
            Gemini
          </button>
        </div>
      </div>

      {/* SEÇÃO 1: Salas Colaborativas */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" /> Salas Colaborativas ao Vivo
          </h2>
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> {salasFiltradas.length} salas ativas
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center p-12 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {salasFiltradas.map((sala) => {
              const style = (sala.materia ? categoryStyles[sala.materia] : undefined) || {
                icon: <BookOpen className="w-4 h-4" />,
                bg: "bg-slate-100",
                text: "text-slate-600",
              };

              const isOwner = currentUser && (sala.criador_id === currentUser.id || sala.isOwner);
              const admNome = sala.profiles?.nome || sala.adm || "Professor";
              const admAvatar = sala.profiles?.avatar_url || sala.admAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80";

              return (
                <div
                  key={sala.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={sala.preview_img || sala.previewImg}
                      alt={sala.topico || sala.nome}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />

                    <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-600 text-white font-bold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md shadow-md">
                      <Video className="w-3 h-3" /> {sala.status || "Ao Vivo"}
                    </div>

                    <div className="absolute top-3 right-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold backdrop-blur-md ${style.bg} ${style.text}`}>
                        {style.icon}
                        {sala.materia}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 text-white space-y-1">
                      <h3 className="font-bold text-sm line-clamp-1 text-slate-100">
                        {sala.topico || sala.nome}
                      </h3>
                    </div>
                  </div>

                  <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {sala.descricao}
                    </p>

                    <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                      <div className="flex items-center gap-2.5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={admAvatar}
                          alt={admNome}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                            <UserCheck className="w-3 h-3 text-blue-500" /> Criador / ADM
                          </p>
                          <p className="text-xs font-semibold text-slate-800 line-clamp-1">
                            {isOwner ? "Você (Aluno ADM)" : admNome}
                          </p>
                        </div>
                      </div>

                      {isOwner && (
                        <button
                          onClick={() => setSalaParaDeletar(sala.id)}
                          className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="Deletar minha sala"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-medium bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                        <Users className="w-3.5 h-3.5 text-blue-600" /> {sala.membros_count || sala.membros || 1} alunos
                      </span>
                      <span className="flex items-center gap-1 font-medium bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                        <Download className="w-3.5 h-3.5 text-emerald-600" /> {sala.arquivos || 0} docs
                      </span>
                    </div>

                    <div className="pt-2 flex gap-2">
                      <button
                        onClick={() => router.push(`/aulas/sala/${sala.id}`)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl text-xs transition-colors shadow-sm"
                      >
                        Entrar na Sala
                      </button>
                      <button className="bg-blue-50 text-blue-600 p-2.5 rounded-xl hover:bg-blue-100 transition-colors">
                        <HelpCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SEÇÃO 2: Videoaulas Compartilhadas */}
      <div className="space-y-4 pt-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <PlayCircle className="w-5 h-5 text-blue-600" /> Videoaulas Compartilhadas
          </h2>
          <p className="text-xs text-slate-500">
            Aulas gravadas e postadas por professores e alunos para assistir a qualquer momento
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {aulasPostadas.map((aula) => {
            const style = categoryStyles[aula.materia ?? ""] || {
              icon: <BookOpen className="w-4 h-4" />,
              bg: "bg-slate-100",
              text: "text-slate-600",
            };

            return (
              <div
                key={aula.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group cursor-pointer"
              >
                <div className="relative h-36 w-full bg-slate-900 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={aula.thumb || aula.preview_img}
                    alt={aula.titulo}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center text-blue-600 shadow-lg group-hover:scale-110 transition-transform">
                      <PlayCircle className="w-6 h-6 fill-current" />
                    </div>
                  </div>
                  <span className="absolute bottom-2 right-2 bg-slate-900/80 text-white text-[10px] font-semibold px-2 py-0.5 rounded backdrop-blur-sm flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {aula.duracao}
                  </span>
                </div>

                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${style.bg} ${style.text}`}>
                      {style.icon}
                      {aula.materia}
                    </span>
                    <h3 className="font-semibold text-slate-800 text-xs line-clamp-2 leading-relaxed group-hover:text-blue-600 transition-colors">
                      {aula.titulo}
                    </h3>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <div>
                      <p className="font-medium text-slate-700">{aula.postadoPor || aula.autor}</p>
                      <span className="text-[9px] text-slate-400">{aula.tipoUsuario || "Aluno"}</span>
                    </div>
                    <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md font-semibold border border-amber-200">
                      ★ {aula.avaliacoes || 0} reco.
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL PARA CRIAR SALA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-slate-100 space-y-6 relative my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                  <PlusCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Criar Sala de Estudo</h3>
                  <p className="text-xs text-slate-500">
                    Defina os detalhes da sua sala (Limite: 1 sala por ADM)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCriarSala} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Disciplina / Matéria *
                  </label>
                  <select
                    value={novaMateria}
                    onChange={(e) => setNovaMateria(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Matemática">Matemática</option>
                    <option value="Português">Português</option>
                    <option value="História">História</option>
                    <option value="Química">Química</option>
                    <option value="Física">Física</option>
                    <option value="Biologia">Biologia</option>
                    <option value="Geografia">Geografia</option>
                    <option value="Inglês">Inglês</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tema do Assunto *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: MUV e Cinemática Vetorial"
                    value={novoTema}
                    onChange={(e) => setNovoTema(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Título da Sala *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Resolução de Lista de Exercícios para a Prova"
                  value={novoTitulo}
                  onChange={(e) => setNovoTitulo(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Descrição do Conteúdo *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Descreva o roteiro da aula..."
                  value={novaDescricao}
                  onChange={(e) => setNovaDescricao(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Capa / Thumbnail da Sala
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex-1 border-2 border-dashed border-slate-200 hover:border-emerald-500 bg-slate-50 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors group">
                    <Upload className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                    <span className="text-xs text-slate-600 font-medium group-hover:text-emerald-600">
                      Clique para escolher uma imagem
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>

                  {previewThumb ? (
                    <div className="w-20 h-20 rounded-2xl overflow-hidden border border-slate-200 relative shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={previewThumb} alt="Preview Capa" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-slate-400 text-[10px] gap-1 shrink-0">
                      <ImageIcon className="w-5 h-5" />
                      <span>Sem capa</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={criandoSala}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all shadow-md flex items-center gap-2"
                >
                  {criandoSala && <Loader2 className="w-4 h-4 animate-spin" />}
                  Publicar e Entrar Direto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE EXCLUSÃO DE SALA */}
      {salaParaDeletar !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 relative">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-3 bg-red-50 rounded-2xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Deletar Sala de Estudo</h3>
                <p className="text-xs text-slate-500">Essa ação não poderá ser desfeita.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Tem certeza que deseja encerrar e excluir esta sala do Supabase?
            </p>

            <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
              <button
                onClick={() => setSalaParaDeletar(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarDeletarSala}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors shadow-md"
              >
                Sim, Excluir Sala
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}