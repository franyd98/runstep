"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

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
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="text-6xl mb-4">🏃</div>
          <h1 className="text-3xl font-bold text-white">RunStep</h1>
          <p className="text-[#8b90b0] mt-2">Tu entrenador personal de running</p>
        </div>

        {/* Card */}
        <div className="bg-[#141420] border border-[#2a2a42] rounded-2xl p-8">
          <h2 className="text-xl font-bold mb-6">
            {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
          </h2>

          <form onSubmit={handle} className="flex flex-col gap-4">
            <div>
              <label className="text-sm text-[#8b90b0] mb-1.5 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="tu@email.com"
                className="w-full bg-[#1e1e30] border border-[#2a2a42] rounded-xl px-4 py-3 text-sm focus:border-[#FF4D00] transition-colors"
              />
            </div>
            <div>
              <label className="text-sm text-[#8b90b0] mb-1.5 block">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="Mínimo 6 caracteres"
                minLength={6}
                className="w-full bg-[#1e1e30] border border-[#2a2a42] rounded-xl px-4 py-3 text-sm focus:border-[#FF4D00] transition-colors"
              />
            </div>

            {error && <p className="text-red-400 text-sm bg-red-400/10 rounded-xl px-4 py-3">{error}</p>}
            {success && <p className="text-green-400 text-sm bg-green-400/10 rounded-xl px-4 py-3">{success}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FF4D00] hover:bg-[#cc3d00] disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors mt-2"
            >
              {loading ? "..." : mode === "login" ? "Entrar" : "Crear cuenta"}
            </button>
          </form>

          <p className="text-center text-sm text-[#8b90b0] mt-6">
            {mode === "login" ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}
            {" "}
            <button
              onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); setSuccess(""); }}
              className="text-[#FF4D00] hover:underline font-medium"
            >
              {mode === "login" ? "Regístrate gratis" : "Inicia sesión"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
