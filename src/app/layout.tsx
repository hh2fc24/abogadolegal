import "./globals.css";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Chatbot from "@/app/components/Chatbot";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = {
  title: "Abogado Legal | Defensa y Asesoría Experta",
  description: "Protegemos tus derechos con experiencia en causas de familia, laborales, civiles y penales. Abogados expertos en Chile.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className={`${inter.variable} font-sans bg-white text-gray-900 relative`}>
        {/* Global Noise Texture */}
        <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-[9999] mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />

        <Navbar />
        {children}
        <Footer />
        <Chatbot />


      </body>
    </html>
  );
}
