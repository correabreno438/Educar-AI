"use client";

import { usePathname } from "next/navigation";
import { MessageCircleQuestion } from "lucide-react";

export default function SupportButton() {
  const pathname = usePathname();

  // Páginas onde o botão NÃO deve aparecer
  const hiddenRoutes = ["/login", "/cadastro", "/perfil", "/gemini", "/sobre"];

  if (hiddenRoutes.includes(pathname)) {
    return null;
  }

  const handleSupportClick = () => {
    // Ação ao clicar no suporte (ex: abrir modal, WhatsApp, etc)
    alert("Redirecionando para o suporte...");
  };

  return (
    <button
      onClick={handleSupportClick}
      aria-label="Precisa de ajuda?"
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold px-4 py-3 rounded-full border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 group"
    >
      <div className="bg-brand-blue/10 text-brand-blue p-1.5 rounded-full group-hover:bg-brand-blue group-hover:text-white transition-colors">
        <MessageCircleQuestion className="w-5 h-5" />
      </div>
      <span className="text-xs pr-1">Precisa de ajuda?</span>
    </button>
  );
}