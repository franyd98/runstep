import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RunStep — Tu entrenador de running",
  description: "Registra tus carreras, sigue tu plan y mejora cada semana",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-[#0a0a0f] text-[#e8eaf6] min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
