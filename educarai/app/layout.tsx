import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import SupportButton from "@/components/SupportButton";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Educar AI - Plataforma de Apoio à Aprendizagem",
  description:
    "Organização escolar, estudo colaborativo e reforço com Inteligência Artificial",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body
        className={`${inter.className} bg-slate-50 text-slate-900 min-h-screen flex flex-col relative`}
      >
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
          {children}
        </main>
        <Footer />
        <SupportButton />
      </body>
    </html>
  );
}