import { Code2, Target, Users } from "lucide-react";

export default function SobrePage() {
  const equipe = ["Breno Gabriel", "Bruce William", "Jonatan Silva", "Raoni Masaharu"];
  const tecnologias = ["Next.js", "Tailwind CSS", "API Google Gemini", "PostgreSQL", "Prisma ORM"];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900">Sobre o Educar AI</h1>
        <p className="text-slate-600 text-xs max-w-2xl mx-auto">
          Plataforma web criada para enfrentar a desorganização de prazos e as dificuldades de aprendizagem dos estudantes da rede pública[cite: 1].
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <Target className="w-8 h-8 text-brand-blue" />
          <h2 className="font-bold text-slate-800 text-sm">Objetivo</h2>
          <p className="text-xs text-slate-600">Oferecer estudo colaborativo, gestão visual de tarefas e suporte pedagógico por Inteligência Artificial[cite: 1].</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <Code2 className="w-8 h-8 text-brand-blue" />
          <h2 className="font-bold text-slate-800 text-sm">Tecnologias</h2>
          <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
            {tecnologias.map((tech) => <li key={tech}>{tech}</li>)}
          </ul>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <Users className="w-8 h-8 text-brand-blue" />
          <h2 className="font-bold text-slate-800 text-sm">Equipe Los Tcholas[cite: 1]</h2>
          <ul className="text-xs text-slate-600 space-y-1">
            {equipe.map((membro) => <li key={membro}>• {membro}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}