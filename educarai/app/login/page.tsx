"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  ArrowRight,
  Eye,
  EyeOff,
  X,
  CheckCircle2,
  KeyRound,
  Mail,
  AlertCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  // Estados de Login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);

  // Modal de Recuperação
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState<1 | 2 | 3>(1);
  const [recoveryEmail, setRecoveryEmail] = useState("");

  // Estado das 6 caixas de código (OTP)
  const [codeDigits, setCodeDigits] = useState(["", "", "", "", "", ""]);
  const [codeError, setCodeError] = useState("");
  const [modalLoading, setModalLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Estado das senhas
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordMismatch, setPasswordMismatch] = useState(false);

  // Medidor de força da senha
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (pass.length === 0) return { label: "", color: "bg-slate-200", width: "w-0" };
    if (pass.length < 8) return { label: "Muito Fraca", color: "bg-rose-500", width: "w-1/4" };
    if (score <= 2) return { label: "Fraca", color: "bg-amber-500", width: "w-2/4" };
    if (score === 3) return { label: "Média", color: "bg-blue-500", width: "w-3/4" };
    return { label: "Forte", color: "bg-emerald-500", width: "w-full" };
  };

  const strength = getPasswordStrength(newPassword);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoginError(error.message);
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  const handleSocialLogin = async (provider: "google") => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value && !/^\d+$/.test(value)) {
      setCodeError("Apenas números são permitidos!");
      return;
    }

    setCodeError("");
    const lastDigit = value.slice(-1);
    const newCode = [...codeDigits];
    newCode[index] = lastDigit;
    setCodeDigits(newCode);

    if (lastDigit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const newCode = [...codeDigits];

      if (codeDigits[index]) {
        newCode[index] = "";
        setCodeDigits(newCode);
      } else if (index > 0) {
        newCode[index - 1] = "";
        setCodeDigits(newCode);
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setCodeError("");
    setModalLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(recoveryEmail);

    setModalLoading(false);
    if (error) {
      setCodeError(error.message);
    } else {
      setRecoveryStep(2);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = codeDigits.join("");

    if (token.length < 6) {
      setCodeError("Preencha as 6 caixas com o código.");
      return;
    }

    setModalLoading(true);
    setCodeError("");

    const { error } = await supabase.auth.verifyOtp({
      email: recoveryEmail,
      token,
      type: "recovery",
    });

    setModalLoading(false);
    if (error) {
      setCodeError("Código inválido ou expirado.");
    } else {
      setRecoveryStep(3);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setPasswordMismatch(true);
      return;
    }

    setModalLoading(true);
    setCodeError("");

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    setModalLoading(false);
    if (error) {
      setCodeError(error.message);
    } else {
      alert("Senha alterada com sucesso!");
      setIsModalOpen(false);
      setRecoveryStep(1);
      setNewPassword("");
      setConfirmPassword("");
      setCodeDigits(["", "", "", "", "", ""]);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 relative">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 font-bold text-2xl">
          <div className="bg-brand-blue text-white p-2.5 rounded-2xl shadow-md">
            <GraduationCap className="w-7 h-7" />
          </div>
          <span className="text-slate-900 font-extrabold tracking-tight">
            Educar <span className="text-brand-blue">AI</span>
          </span>
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Bem-vindo de volta!</h1>
          <p className="text-xs text-slate-500 mt-1">Acesse sua conta para continuar seus estudos</p>
        </div>
      </div>

      <div className="space-y-3">
        <button
          type="button"
          onClick={() => handleSocialLogin("google")}
          className="w-full flex items-center justify-center gap-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 font-semibold py-2.5 px-4 rounded-xl text-xs text-slate-700 transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          Continuar com o Google
        </button>
      </div>

      <div className="relative flex items-center justify-center">
        <div className="border-t border-slate-200 w-full" />
        <span className="bg-white px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider absolute">
          ou acesse com e-mail
        </span>
      </div>

      {loginError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-600 text-xs font-semibold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {loginError}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-slate-700">E-mail</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="estudante@escola.gov.br"
            className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-brand-blue"
          />
        </div>

        <div>
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-slate-700">Senha</label>
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(true);
                setRecoveryStep(1);
              }}
              className="text-[10px] text-brand-blue font-semibold hover:underline"
            >
              Esqueceu a senha?
            </button>
          </div>
          <div className="relative mt-1">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-3 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-brand-blue"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-blue hover:bg-blue-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-xs transition-colors shadow-md flex items-center justify-center gap-2 group"
        >
          {loading ? "Entrando..." : "Entrar na Conta"}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </form>

      <p className="text-center text-xs text-slate-500">
        Ainda não tem uma conta?{" "}
        <Link href="/cadastro" className="text-brand-blue font-semibold hover:underline">
          Cadastre-se aqui
        </Link>
      </p>

      {/* Modal Esqueceste a Senha */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-5 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-full bg-slate-50"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Passo 1: Solicitar E-mail */}
            {recoveryStep === 1 && (
              <form onSubmit={handleSendCode} className="space-y-4">
                <div className="text-center space-y-2">
                  <div className="w-10 h-10 bg-blue-50 text-brand-blue rounded-2xl flex items-center justify-center mx-auto">
                    <Mail className="w-5 h-5" />
                  </div>
                  <h2 className="font-bold text-slate-800 text-base">Recuperar Senha</h2>
                  <p className="text-[11px] text-slate-500">Digite seu e-mail cadastrado para receber o código.</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">E-mail Cadastrado</label>
                  <input
                    type="email"
                    required
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    placeholder="estudante@escola.gov.br"
                    className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-brand-blue"
                  />
                </div>
                {codeError && (
                  <p className="text-[11px] text-rose-500 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {codeError}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="w-full bg-brand-blue hover:bg-blue-600 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-xs transition-colors"
                >
                  {modalLoading ? "Enviando..." : "Enviar Código"}
                </button>
              </form>
            )}

            {/* Passo 2: Código PIN */}
            {recoveryStep === 2 && (
              <form onSubmit={handleVerifyCode} className="space-y-4">
                <div className="text-center space-y-2">
                  <div className="w-10 h-10 bg-blue-50 text-brand-blue rounded-2xl flex items-center justify-center mx-auto">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <h2 className="font-bold text-slate-800 text-base">Digite o Código</h2>
                  <p className="text-[11px] text-slate-500">
                    Enviamos o código para <span className="font-semibold text-slate-700">{recoveryEmail}</span>
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between gap-1.5">
                    {codeDigits.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => { inputRefs.current[index] = el; }}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onFocus={handleFocus}
                        onChange={(e) => handleCodeChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className="w-11 h-12 text-center text-lg font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-blue focus:bg-white transition-colors"
                      />
                    ))}
                  </div>

                  {codeError && (
                    <p className="text-[11px] text-rose-500 font-semibold flex items-center justify-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {codeError}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={modalLoading}
                  className="w-full bg-brand-blue hover:bg-blue-600 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-xs transition-colors"
                >
                  {modalLoading ? "Verificando..." : "Confirmar Código"}
                </button>
              </form>
            )}

            {/* Passo 3: Definir Nova Senha */}
            {recoveryStep === 3 && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="text-center space-y-2">
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <h2 className="font-bold text-slate-800 text-base">Nova Senha</h2>
                  <p className="text-[11px] text-slate-500">Crie sua nova senha para acessar a plataforma.</p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Nova Senha</label>
                    <div className="relative mt-1">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        required
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          if (passwordMismatch) setPasswordMismatch(false);
                        }}
                        placeholder="Mínimo 8 caracteres"
                        className="w-full p-3 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-brand-blue"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {newPassword.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full ${strength.color} ${strength.width} transition-all duration-300 ease-out`} />
                        </div>
                        <p className="text-[10px] font-medium text-slate-500 flex justify-between">
                          <span>Força da senha:</span>
                          <span className="font-bold">{strength.label}</span>
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700">Confirmar Nova Senha</label>
                    <input
                      type={showNewPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (passwordMismatch) setPasswordMismatch(false);
                      }}
                      placeholder="••••••••"
                      className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-brand-blue"
                    />
                  </div>

                  {passwordMismatch && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-600 text-xs font-semibold">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      As senhas não coincidem.
                    </div>
                  )}

                  {codeError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-600 text-xs font-semibold">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {codeError}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={modalLoading}
                  className="w-full bg-brand-blue hover:bg-blue-600 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-xs transition-colors"
                >
                  {modalLoading ? "Salvando..." : "Salvar Nova Senha"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}