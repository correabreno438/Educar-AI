"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap, ArrowRight, Eye, EyeOff, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function CadastroPage() {
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      setErrorMsg(error.message);
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
          <h1 className="text-xl font-bold text-slate-800">Crie sua conta gratuita</h1>
          <p className="text-xs text-slate-500 mt-1">Comece seus estudos agora mesmo</p>
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
          Cadastrar com o Google
        </button>
      </div>

      <div className="relative flex items-center justify-center">
        <div className="border-t border-slate-200 w-full" />
        <span className="bg-white px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider absolute">
          ou cadastre com e-mail
        </span>
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-600 text-xs font-semibold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-slate-700">Nome Completo</label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Maria Silva"
            className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-brand-blue"
          />
        </div>

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
          <label className="text-xs font-semibold text-slate-700">Senha</label>
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
          {loading ? "Criando conta..." : "Criar Minha Conta"}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </form>

      <p className="text-center text-xs text-slate-500">
        Já possui uma conta?{" "}
        <Link href="/login" className="text-brand-blue font-semibold hover:underline">
          Faça login aqui
        </Link>
      </p>
    </div>
  );
}