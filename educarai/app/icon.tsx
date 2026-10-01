import { ImageResponse } from "next/og";

// Configurações da imagem da aba (favicon)
export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

// Geração dinâmica da Logo Educar AI via código
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 18,
          background: "#2563eb", // Azul padrão da marca
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          borderRadius: "8px",
        }}
      >
        {/* Ícone de Chapéu de Formatura (GraduationCap) desenhado em SVG nativo */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21.42 10.94l-8.38-4.67a2 2 0 0 0-2.08 0l-8.38 4.67a1.2 1.2 0 0 0 0 2.12l8.38 4.67a2 2 0 0 0 2.08 0l8.38-4.67a1.2 1.2 0 0 0 0-2.12z" />
          <path d="M4.99 13.68V17a2 2 0 0 0 1.57 1.95l4.44 1.11a2 2 0 0 0 2 0l4.44-1.11A2 2 0 0 0 19 17v-3.32" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}