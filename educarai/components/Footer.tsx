import Link from "next/link";
import { GraduationCap, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* COLUNA 1: LOGO E SOBRE */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2 font-bold text-lg text-white">
              <div className="bg-brand-blue text-white p-2 rounded-xl shadow-md">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="tracking-tight">
                Educar <span className="text-brand-blue">AI</span>
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Plataforma inteligente de apoio à aprendizagem. Unimos organização escolar, estudo colaborativo e reforço personalizado powered por IA.
            </p>
          </div>

          {/* COLUNA 2: NAVEGAÇÃO RÁPIDA */}
          <div className="space-y-3">
            <h3 className="font-semibold text-white text-sm">Plataforma</h3>
            <ul className="space-y-2 text-[11px]">
              <li>
                <Link href="/sobre" className="hover:text-white transition-colors">
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link href="/funcionalidades" className="hover:text-white transition-colors">
                  Funcionalidades
                </Link>
              </li>
              <li>
                <Link href="/gemini" className="hover:text-white transition-colors">
                  Tutor IA
                </Link>
              </li>
              <li>
                <Link href="/cadastro" className="hover:text-white transition-colors">
                  Cadastre-se
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUNA 3: CONTATO E SUPORTE */}
          <div className="space-y-3">
            <h3 className="font-semibold text-white text-sm">Atendimento</h3>
            <ul className="space-y-2.5 text-[11px]">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-blue shrink-0" />
                <span>(11) 4002-8922</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-blue shrink-0" />
                <span>suporte@educarai.com.br</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-blue shrink-0" />
                <span>São Paulo - SP, Brasil</span>
              </li>
            </ul>
          </div>

          {/* COLUNA 4: REDES SOCIAIS */}
          <div className="space-y-3">
            <h3 className="font-semibold text-white text-sm">Siga o Educar AI</h3>
            <p className="text-[11px] text-slate-400">
              Fique por dentro das novidades, dicas de estudos e atualizações da plataforma.
            </p>
            <div className="flex items-center gap-3 pt-1">
              {/* INSTAGRAM */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-brand-blue hover:text-white flex items-center justify-center transition-colors text-slate-300"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>

              {/* X (ANTIGO TWITTER) */}
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                aria-label="X (Twitter)"
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-brand-blue hover:text-white flex items-center justify-center transition-colors text-slate-300"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* LINHA DE DIVISÃO E COPYRIGHT */}
        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} Educar AI. Todos os direitos reservados.</p>
          <div className="flex gap-4">
            <Link href="/termos" className="hover:text-slate-400 transition-colors">
              Termos de Uso
            </Link>
            <Link href="/privacidade" className="hover:text-slate-400 transition-colors">
              Política de Privacidade
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}