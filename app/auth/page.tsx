"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import Logo from "@/components/Logo";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const supabase = createClient();

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess(""); setLoading(true);
    if (mode === "register") {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) { setError(error.message); setLoading(false); return; }
      setSuccess("¡Cuenta creada! Revisa tu email para confirmar.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setError("Email o contraseña incorrectos."); setLoading(false); return; }
      router.replace("/");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex flex-col">
      {/* Top decoration */}
      <div className="absolute top-0 left-0 right-0 h-64 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-[#CAFF00] rounded-full opacity-5 blur-3xl"/>
        <div className="absolute -top-10 right-10 w-48 h-48 bg-[#CAFF00] rounded-full opacity-5 blur-3xl"/>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-5 py-12 relative">
        {/* Logo */}
        <div className="mb-10 flex flex-col items-center gap-4">
          <Logo size={36} />
          <p className="text-[#555] text-sm font-medium tracking-wide">ENTRENA. REGISTRA. MEJORA.</p>
        </div>

        {/* Card */}
        <div className="w-full max-w-sm bg-[#111] border border-[#222] rounded-3xl p-7">
          <h2 className="text-xl font-bold mb-6">
            {mode === "login" ? "Bienvenido de nuevo" : "Crea tu cuenta"}
          </h2>

          <form onSubmit={handle} className="flex flex-col gap-4">
            <div>
              <label className="text-xs text-[#666] mb-2 block font-medium uppercase tracking-wider">Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="tu@email.com"
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl px-4 py-3.5 text-sm focus:border-[#CAFF00] transition-colors placeholder:text-[#444]"
              />
            </div>
            <div>
              <label className="text-xs text-[#666] mb-2 block font-medium uppercase tracking-wider">Contraseña</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)} required
                placeholder="Mínimo 6 caracteres" minLength={6}
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl px-4 py-3.5 text-sm focus:border-[#CAFF00] transition-colors placeholder:text-[#444]"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3 text-red-400 text-sm">{error}</div>
            )}
            {success && (
              <div className="bg-[#CAFF00]/10 border border-[#CAFF00]/20 rounded-2xl px-4 py-3 text-[#CAFF00] text-sm">{success}</div>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full bg-[#CAFF00] hover:bg-[#b8e600] disabled:opacity-50 text-black font-bold py-4 rounded-2xl transition-all mt-2 text-sm neon-glow active:scale-95"
            >
              {loading ? "..." : mode === "login" ? "Entrar →" : "Crear cuenta →"}
            </button>
          </form>

          <p className="text-center text-sm text-[#555] mt-6">
            {mode === "login" ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
            <button
              onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); setSuccess(""); }}
              className="text-[#CAFF00] font-semibold hover:underline"
            >
              {mode === "login" ? "Regístrate gratis" : "Inicia sesión"}
            </button>
          </p>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 w-full max-w-sm">
          {[
            { icon: "📅", text: "Plan 12 semanas" },
            { icon: "📊", text: "Estadísticas" },
            { icon: "🎯", text: "Objetivos" },
          ].map(f => (
            <div key={f.text} className="flex flex-col items-center gap-1.5 bg-[#111] border border-[#222] rounded-2xl py-3 px-2">
              <span className="text-xl">{f.icon}</span>
              <span className="text-xs text-[#555] text-center font-medium">{f.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
