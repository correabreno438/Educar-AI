"use client";

import { useState, useEffect, ChangeEvent, useRef, FormEvent, KeyboardEvent, ClipboardEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  User,
  Mail,
  Shield,
  BookOpen,
  Clock,
  Camera,
  CheckCircle2,
  AlertTriangle,
  PlayCircle,
  Users,
  Edit2,
  Check,
  Plus,
  ArrowRight,
  KeyRound,
  X,
  Lock,
  Send,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface AulaAssistida {
  id: string;
  materia: string;
  titulo: string;
  duracao: string;
  progresso: string;
}

interface SalaCriada {
  id: string;
  nome: string;
  codigo: string;
  membros_count: number;
}

// Instância do client mantida fora do render para evitar recriações desnecessárias
const supabase = createClient();

export default function PerfilPage() {
  // Estados do perfil
  const [userId, setUserId] = useState<string | null>(null);
  const [nome, setNome] = useState("Carregando...");
  const [emailAtual, setEmailAtual] = useState("");
  const [editandoNome, setEditandoNome] = useState(false);
  const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);
  const [carregandoFoto, setCarregandoFoto] = useState(false);

  // Estados Dinâmicos do Banco
  const [aulasAssistidas, setAulasAssistidas] = useState<AulaAssistida[]>([]);
  const [salasCriadas, setSalasCriadas] = useState<SalaCriada[]>([]);
  const [horasAcumuladas, setHorasAcumuladas] = useState(0);
  const [atividadesFeitas, setAtividadesFeitas] = useState(0);

  // Estados dos Modais
  const [modalEmail, setModalEmail] = useState(false);
  const [passoEmail, setPassoEmail] = useState<"form" | "codigo">("form");
  const [novoEmailInput, setNovoEmailInput] = useState("");
  const [codigoEmail, setCodigoEmail] = useState("");

  const [modalSenha, setModalSenha] = useState(false);
  const [passoSenha, setPassoSenha] = useState<"form" | "codigo" | "sucesso">("form");
  const [novaSenhaInput, setNovaSenhaInput] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const [codigoSenha, setCodigoSenha] = useState<string[]>(["", "", "", "", "", ""]);
  const [erroApenasNumeros, setErroApenasNumeros] = useState(false);
  const [carregandoAcao, setCarregandoAcao] = useState(false);

  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Carregar dados reais do usuário do Supabase
  useEffect(() => {
    async function carregarDadosUsuario() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        setEmailAtual(user.email || "");
        setNome(user.user_metadata?.full_name || user.user_metadata?.name || "Estudante Educar AI");
        setFotoPerfil(user.user_metadata?.avatar_url || null);

        // Busca histórico de aulas
        const { data: aulas } = await supabase
          .from("historico_aulas")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(3);

        if (aulas) setAulasAssistidas(aulas);

        // Busca salas criadas pelo usuário
        const { data: salas } = await supabase
          .from("salas")
          .select("*")
          .eq("criador_id", user.id);

        if (salas) setSalasCriadas(salas);
      }
    }
    carregarDadosUsuario();
  }, []);

  // Upload da Foto de Perfil via Supabase Storage
  const handleFotoChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    try {
      setCarregandoFoto(true);
      const fileExt = file.name.split('.').pop();
      const filePath = `avatars/${userId}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Adiciona parâmetro de timestamp para forçar re-render sem cache do browser
      const publicUrlComCache = `${publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrlComCache }
      });

      if (updateError) throw updateError;

      setFotoPerfil(publicUrlComCache);
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : "Erro ao atualizar a foto de perfil.");
    } finally {
      setCarregandoFoto(false);
    }
  };

  // Atualização do Nome do Usuário
  const handleSalvarNome = async () => {
    try {
      setCarregandoAcao(true);
      const { error } = await supabase.auth.updateUser({
        data: { full_name: nome }
      });
      if (error) throw error;
      setEditandoNome(false);
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : "Erro ao atualizar o nome.");
    } finally {
      setCarregandoAcao(false);
    }
  };

  const calcularForcaSenha = (senha: string) => {
    let pontuacao = 0;
    if (senha.length >= 8) pontuacao++;
    if (/[A-Z]/.test(senha)) pontuacao++;
    if (/[0-9]/.test(senha)) pontuacao++;
    if (/[^A-Za-z0-9]/.test(senha)) pontuacao++;

    if (senha.length < 8) return { nivel: "Fraca (mínimo 8 caracteres)", cor: "bg-rose-500", porcentagem: "25%" };
    if (pontuacao <= 2) return { nivel: "Fraca", cor: "bg-rose-500", porcentagem: "33%" };
    if (pontuacao === 3) return { nivel: "Média", cor: "bg-amber-500", porcentagem: "66%" };
    return { nivel: "Forte", cor: "bg-emerald-500", porcentagem: "100%" };
  };

  // Tratamento do PIN com navegação por teclado e colagem
  const handlePinChange = (index: number, value: string) => {
    if (value && !/^\d+$/.test(value)) {
      setErroApenasNumeros(true);
      return;
    }
    setErroApenasNumeros(false);

    const novoCodigo = [...codigoSenha];
    novoCodigo[index] = value.slice(-1);
    setCodigoSenha(novoCodigo);

    if (value && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handlePinKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !codigoSenha[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handlePinPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digitos = pastedData.split("");
      setCodigoSenha(digitos);
      inputRefs[5].current?.focus();
      setErroApenasNumeros(false);
    } else {
      setErroApenasNumeros(true);
    }
  };

  const handleSolicitarTrocaEmail = async (e: FormEvent) => {
    e.preventDefault();
    if (!novoEmailInput) return;

    try {
      setCarregandoAcao(true);
      const { error } = await supabase.auth.updateUser({ email: novoEmailInput });
      if (error) throw error;
      setPassoEmail("codigo");
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : "Erro ao solicitar troca de e-mail.");
    } finally {
      setCarregandoAcao(false);
    }
  };

  const handleConfirmarTrocaEmail = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setCarregandoAcao(true);
      const { error } = await supabase.auth.verifyOtp({
        email: novoEmailInput,
        token: codigoEmail,
        type: "email_change",
      });

      if (error) throw error;

      setEmailAtual(novoEmailInput);
      setModalEmail(false);
      setPassoEmail("form");
      setNovoEmailInput("");
      setCodigoEmail("");
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : "Código inválido ou expirado.");
    } finally {
      setCarregandoAcao(false);
    }
  };

  const handleSolicitarTrocaSenha = async (e: FormEvent) => {
    e.preventDefault();
    if (novaSenhaInput.length < 8) return;

    try {
      setCarregandoAcao(true);
      const { error } = await supabase.auth.resetPasswordForEmail(emailAtual);
      if (error) throw error;
      setPassoSenha("codigo");
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : "Erro ao enviar código de verificação.");
    } finally {
      setCarregandoAcao(false);
    }
  };

  const handleConfirmarTrocaSenha = async (e: FormEvent) => {
    e.preventDefault();
    const token = codigoSenha.join("");
    if (token.length < 6) return;

    try {
      setCarregandoAcao(true);
      
      const { error: otpError } = await supabase.auth.verifyOtp({
        email: emailAtual,
        token,
        type: "recovery",
      });

      if (otpError) throw otpError;

      const { error: updateError } = await supabase.auth.updateUser({
        password: novaSenhaInput,
      });

      if (updateError) throw updateError;

      setPassoSenha("sucesso");
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : "Código de recuperação inválido.");
    } finally {
      setCarregandoAcao(false);
    }
  };

  const fecharModalSenha = () => {
    setModalSenha(false);
    setPassoSenha("form");
    setNovaSenhaInput("");
    setCodigoSenha(["", "", "", "", "", ""]);
    setErroApenasNumeros(false);
  };

  const forcaSenha = calcularForcaSenha(novaSenhaInput);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <h1 className="text-2xl font-bold text-slate-900">Perfil do Estudante</h1>

      {/* Cartão Principal */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center gap-6">
        <div className="relative group">
          <div className="w-28 h-28 bg-blue-50 border-2 border-blue-600 text-blue-600 rounded-full flex items-center justify-center overflow-hidden shadow-inner">
            {carregandoFoto ? (
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            ) : fotoPerfil ? (
              <img src={fotoPerfil} alt="Perfil" className="w-full h-full object-cover" />
            ) : (
              <User className="w-14 h-14" />
            )}
          </div>
          <label
            htmlFor="foto-input"
            className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors shadow-md border-2 border-white"
          >
            <Camera className="w-4 h-4" />
          </label>
          <input id="foto-input" type="file" accept="image/*" onChange={handleFotoChange} className="hidden" disabled={carregandoFoto} />
        </div>

        <div className="space-y-3 text-center sm:text-left flex-1">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            {editandoNome ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="text-lg font-bold text-slate-900 border-b-2 border-blue-600 focus:outline-none bg-slate-50 px-2 py-0.5 rounded-md"
                />
                <button
                  onClick={handleSalvarNome}
                  disabled={carregandoAcao}
                  className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold text-slate-900">{nome}</h2>
                <button onClick={() => setEditandoNome(true)} className="text-slate-400 hover:text-blue-600">
                  <Edit2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

          <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-xs text-slate-600">
            <span className="flex items-center gap-1.5 font-medium">
              <Mail className="w-4 h-4 text-blue-600" /> {emailAtual || "Sem e-mail"}
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Shield className="w-4 h-4 text-blue-600" /> Rede Pública de Ensino
            </span>
          </div>

          <div className="pt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
            <button
              onClick={() => { setPassoEmail("form"); setModalEmail(true); }}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-blue-600" /> Alterar E-mail
            </button>
            <button
              onClick={() => { setPassoSenha("form"); setModalSenha(true); }}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5 text-blue-600" /> Alterar Senha
            </button>
          </div>
        </div>
      </div>

      {/* Métricas Dinâmicas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Horas de Estudo</p>
            <p className="text-lg font-bold text-slate-800">{horasAcumuladas}h acumuladas</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Feitas</p>
            <p className="text-lg font-bold text-slate-800">{atividadesFeitas} Atividades</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Pendentes</p>
            <p className="text-lg font-bold text-slate-800">0 Atividades</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Atrasadas</p>
            <p className="text-lg font-bold text-slate-800">0 Atividades</p>
          </div>
        </div>
      </div>

      {/* Histórico e Salas (Conectadas ao Supabase) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Aulas Assistidas */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <PlayCircle className="w-4 h-4 text-blue-600" /> Aulas Assistidas
            </h2>
            <span className="text-xs text-slate-400 font-medium">Últimas</span>
          </div>

          <div className="space-y-3">
            {aulasAssistidas.length > 0 ? (
              aulasAssistidas.map((aula) => (
                <div key={aula.id} className="p-3.5 bg-slate-50 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-100/60 px-2 py-0.5 rounded-md">
                      {aula.materia}
                    </span>
                    <h3 className="text-xs font-bold text-slate-800 mt-1">{aula.titulo}</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Duração: {aula.duracao}</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-xl">
                    {aula.progresso}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                Você ainda não assistiu a nenhuma aula.
              </div>
            )}
          </div>
        </div>

        {/* Salas Criadas */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" /> Salas Criadas
            </h2>
            <button className="text-xs text-blue-600 font-bold flex items-center gap-1 hover:underline">
              <Plus className="w-3.5 h-3.5" /> Nova Sala
            </button>
          </div>

          <div className="space-y-3">
            {salasCriadas.length > 0 ? (
              salasCriadas.map((sala) => (
                <div key={sala.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-slate-800">{sala.nome}</h3>
                      <span className="text-[9px] font-bold bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded-md">
                        {sala.codigo}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                      <Users className="w-3 h-3 text-blue-600" /> {sala.membros_count || 0} participantes
                    </p>
                  </div>
                  <button className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs">
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                Você ainda não criou nenhuma sala de estudo.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL ALTERAR E-MAIL */}
      {modalEmail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-800">Alterar Endereço de E-mail</h3>
              <button onClick={() => setModalEmail(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {passoEmail === "form" ? (
              <form onSubmit={handleSolicitarTrocaEmail} className="space-y-4">
                <p className="text-xs text-slate-500">
                  Digite seu novo e-mail. Enviaremos um código para confirmação.
                </p>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Novo E-mail</label>
                  <input
                    type="email"
                    placeholder="novoemail@escola.gov.br"
                    value={novoEmailInput}
                    onChange={(e) => setNovoEmailInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={carregandoAcao}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2"
                >
                  {carregandoAcao ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Enviar Código
                </button>
              </form>
            ) : (
              <form onSubmit={handleConfirmarTrocaEmail} className="space-y-4">
                <p className="text-xs text-slate-500">
                  Enviamos o código para <strong className="text-slate-800">{novoEmailInput}</strong>.
                </p>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Código de Verificação</label>
                  <input
                    type="text"
                    placeholder="Ex: 849201"
                    value={codigoEmail}
                    onChange={(e) => setCodigoEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-center text-base tracking-widest font-bold text-slate-800 focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={carregandoAcao}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2"
                >
                  {carregandoAcao && <Loader2 className="w-4 h-4 animate-spin" />} Confirmar E-mail
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL ALTERAR SENHA */}
      {modalSenha && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-800">
                {passoSenha === "sucesso" ? "Sucesso!" : "Alterar Senha"}
              </h3>
              <button onClick={fecharModalSenha} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {passoSenha === "form" && (
              <form onSubmit={handleSolicitarTrocaSenha} className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-700">Nova Senha (mín. 8 dígitos)</label>
                    <button
                      type="button"
                      onClick={() => setMostrarSenha(!mostrarSenha)}
                      className="text-slate-400 hover:text-blue-600 flex items-center gap-1 text-[11px]"
                    >
                      {mostrarSenha ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      {mostrarSenha ? "Ocultar" : "Mostrar"}
                    </button>
                  </div>
                  <input
                    type={mostrarSenha ? "text" : "password"}
                    placeholder="••••••••"
                    value={novaSenhaInput}
                    onChange={(e) => setNovaSenhaInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-blue-600"
                    required
                    minLength={8}
                  />

                  {novaSenhaInput.length > 0 && (
                    <div className="pt-2 space-y-1">
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${forcaSenha.cor}`}
                          style={{ width: forcaSenha.porcentagem }}
                        />
                      </div>
                      <p className="text-[10px] font-bold text-slate-500">
                        Força: <span className="text-slate-700">{forcaSenha.nivel}</span>
                      </p>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={novaSenhaInput.length < 8 || carregandoAcao}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  {carregandoAcao ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />} Enviar Código de Confirmação
                </button>
              </form>
            )}

            {passoSenha === "codigo" && (
              <form onSubmit={handleConfirmarTrocaSenha} className="space-y-5">
                <p className="text-xs text-slate-500 text-center">
                  Digite o código de 6 dígitos enviado para <strong className="text-slate-800">{emailAtual}</strong>
                </p>

                {erroApenasNumeros && (
                  <div className="bg-rose-50 border border-rose-200 p-2.5 rounded-xl flex items-center gap-2 text-rose-600 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Digite apenas números no código.</span>
                  </div>
                )}

                <div className="flex justify-center gap-2">
                  {codigoSenha.map((digito, index) => (
                    <input
                      key={index}
                      ref={inputRefs[index]}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digito}
                      onChange={(e) => handlePinChange(index, e.target.value)}
                      onKeyDown={(e) => handlePinKeyDown(index, e)}
                      onPaste={handlePinPaste}
                      className="w-10 h-12 bg-slate-50 border-2 border-slate-200 focus:border-blue-600 text-center text-lg font-bold text-slate-800 rounded-xl focus:outline-none transition-colors"
                      required
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={codigoSenha.join("").length < 6 || carregandoAcao}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  {carregandoAcao && <Loader2 className="w-4 h-4 animate-spin" />} Confirmar Nova Senha
                </button>
              </form>
            )}

            {passoSenha === "sucesso" && (
              <div className="text-center space-y-4 py-3">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">Senha alterada com sucesso!</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Sua nova senha já está ativa no sistema Educar AI.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={fecharModalSenha}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs transition-colors"
                >
                  Fechar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}