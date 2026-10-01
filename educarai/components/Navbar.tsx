"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, GraduationCap, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export default function Navbar() {
  const pathname = usePathname();
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const [usuario, setUsuario] = useState<SupabaseUser | null>(null);
  const supabase = createClient();

  // Escuta autenticação para atualizar estado em tempo real
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUsuario(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUsuario(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const navItems = [
    { name: "Início", href: "/" },
    { name: "Agendamento", href: "/agendamento" },
    { name: "Aulas", href: "/aulas" },
    { name: "Gemini", href: "/gemini" },
    { name: "Sobre", href: "/sobre" },
  ];

  const activeTab = hoveredTab || pathname;

  const handleSair = async () => {
    await supabase.auth.signOut();
  };

  // Extrai a URL da foto (compatível com upload customizado e login Google)
  const fotoPerfilUrl = usuario?.user_metadata?.avatar_url || usuario?.user_metadata?.picture;

  return (
    <header className="w-full bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
      {/* 1. LADO ESQUERDO: Logo */}
      <Link href="/" className="flex items-center gap-2 font-bold text-2xl shrink-0">
        <div className="bg-brand-blue text-white p-2 rounded-xl shadow-md">
          <GraduationCap className="w-6 h-6" />
        </div>
        <span className="text-slate-900 font-extrabold tracking-tight">
          Educar <span className="text-brand-blue">AI</span>
        </span>
      </Link>

      {/* 2. CENTRO: Links de Navegação */}
      <nav 
        className="hidden md:flex items-center gap-8 relative mx-auto"
        onMouseLeave={() => setHoveredTab(null)}
      >
        {navItems.map((item) => {
          const isActive = activeTab === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onMouseEnter={() => setHoveredTab(item.href)}
              className={`relative font-semibold text-sm transition-colors py-1 ${
                pathname === item.href ? "text-brand-blue" : "text-slate-600 hover:text-brand-blue"
              }`}
            >
              {item.name}

              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute bottom-0 left-0 right-0 h-[3px] bg-brand-blue rounded-full"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* 3. LADO DIREITO: Condicional com base no estado do usuário */}
      <div 
        className="flex items-center gap-3 shrink-0"
        onMouseLeave={() => setHoveredTab(null)}
      >
        {!usuario ? (
          /* Exibe Botão Entrar se NÃO estiver logado */
          <Link
            href="/login"
            onMouseEnter={() => setHoveredTab("/login")}
            className="relative px-4 py-2 text-xs font-semibold rounded-xl transition-colors z-10"
          >
            <span
              className={
                activeTab === "/login"
                  ? "text-white font-bold transition-colors duration-150"
                  : "text-slate-600 hover:text-brand-blue transition-colors duration-150"
              }
            >
              Entrar
            </span>

            {activeTab === "/login" && (
              <motion.div
                layoutId="activeIndicator"
                className="absolute inset-0 rounded-xl bg-brand-blue -z-10 shadow-sm"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </Link>
        ) : (
          /* Se estiver logado, oculta o 'Entrar' e mostra a Foto/Avatar e o Logout */
          <div className="flex items-center gap-3">
            <Link
              href="/perfil"
              onMouseEnter={() => setHoveredTab("/perfil")}
              className="relative p-1 rounded-full transition-colors z-10 flex items-center justify-center"
              title="Meu Perfil"
            >
              {fotoPerfilUrl ? (
                <img
                  src={fotoPerfilUrl}
                  alt="Perfil"
                  className="w-8 h-8 rounded-full object-cover border-2 border-brand-blue"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-100 text-brand-blue flex items-center justify-center font-bold text-xs border border-blue-200">
                  <User className="w-4 h-4" />
                </div>
              )}

              {activeTab === "/perfil" && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute inset-0 rounded-full border-2 border-brand-blue bg-blue-50/30 -z-10 scale-110"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </Link>

            <button
              onClick={handleSair}
              className="p-2 text-slate-400 hover:text-rose-600 rounded-xl transition-colors"
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}