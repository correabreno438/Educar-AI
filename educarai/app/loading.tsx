import { GraduationCap } from "lucide-react";

export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50/90 backdrop-blur-md">
      {/* Contêiner da Animação do Logo / Chapéu */}
      <div className="relative flex items-center justify-center">
        {/* Onda de brilho/pulso ao fundo */}
        <div className="absolute w-28 h-28 bg-blue-500/20 rounded-full animate-ping" />
        <div className="absolute w-20 h-20 bg-blue-600/10 rounded-full animate-pulse" />

        {/* Card do Chapéu de Formatura com Animação Bounce (saltando) */}
        <div className="relative bg-white border border-slate-200/80 p-5 rounded-3xl shadow-2xl shadow-blue-500/10 animate-bounce">
          <GraduationCap className="w-12 h-12 text-blue-600 -rotate-12" />
        </div>
      </div>

      {/* Nome do Projeto e Pontos Digitando */}
      <div className="mt-8 text-center space-y-2">
        <h2 className="text-xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">
          Educar AI
        </h2>
        
        {/* Indicador de carregamento em 3 pontinhos animados */}
        <div className="flex items-center gap-1.5 justify-center pt-1">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:-0.3s]" />
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:-0.15s]" />
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" />
        </div>
      </div>
    </div>
  );
}