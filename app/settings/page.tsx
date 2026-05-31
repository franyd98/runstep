"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase";
import AppShell from "@/components/AppShell";

export default function SettingsPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [stravaConnected, setStravaConnected] = useState(false);
  const [athleteName, setAthleteName] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ imported: number; total: number } | null>(null);
  const [profile, setProfile] = useState<{ name: string; level: string; goal: string } | null>(null);

  const stravaStatus = params.get("strava");

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/auth"); return; }

      const [{ data: tokenRow }, { data: prof }] = await Promise.all([
        supabase.from("strava_tokens").select("athlete_id").eq("user_id", user.id).single(),
        supabase.from("profiles").select("name, level, goal").eq("user_id", user.id).single(),
      ]);

      setStravaConnected(!!tokenRow);
      if (prof) setProfile(prof);
    };
    load();
  }, [router]);

  const connectStrava = () => {
    const clientId = process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID;
    const redirect = `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/api/strava/callback`;
    const url = `https://www.strava.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirect)}&response_type=code&approval_prompt=auto&scope=activity:read_all`;
    window.location.href = url;
  };

  const disconnectStrava = async () => {
    if (!confirm("¿Desconectar Strava?")) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) await supabase.from("strava_tokens").delete().eq("user_id", user.id);
    setStravaConnected(false);
    setSyncResult(null);
  };

  const syncStrava = async () => {
    setSyncing(true);
    setSyncResult(null);
    const res = await fetch("/api/strava/sync", { method: "POST" });
    const data = await res.json();
    setSyncResult(data);
    setSyncing(false);
  };

  return (
    <AppShell>
      <div className="px-4 py-6 max-w-lg mx-auto">
        <h1 className="text-2xl font-black mb-2">Ajustes</h1>
        <p className="text-[#555] text-sm mb-8">Gestiona tu cuenta y conexiones</p>

        {/* Profile card */}
        {profile && (
          <div className="bg-[#111] border border-[#222] rounded-3xl p-5 mb-5">
            <div className="text-xs text-[#555] uppercase tracking-wider font-medium mb-3">Perfil</div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#CAFF00]/20 rounded-2xl flex items-center justify-center text-2xl">🏃</div>
              <div>
                <div className="font-bold text-lg">{profile.name}</div>
                <div className="text-sm text-[#555] capitalize">{profile.level} · {profile.goal?.replace("_", " ")}</div>
              </div>
            </div>
          </div>
        )}

        {/* Strava connection */}
        <div className="bg-[#111] border border-[#222] rounded-3xl p-5 mb-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#FC4C02]/15 rounded-2xl flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#FC4C02">
                <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.599h4.172L10.463 0l-7 13.828h4.169"/>
              </svg>
            </div>
            <div>
              <div className="font-bold">Strava</div>
              <div className="text-xs text-[#555]">Importa tus carreras automáticamente</div>
            </div>
            <div className={`ml-auto text-xs px-2.5 py-1 rounded-full font-bold ${
              stravaConnected ? "bg-green-500/15 text-green-400" : "bg-[#1a1a1a] text-[#555]"
            }`}>
              {stravaConnected ? "● Conectado" : "○ Desconectado"}
            </div>
          </div>

          {stravaStatus === "error" && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-3 text-red-400 text-sm mb-4">
              Error al conectar con Strava. Inténtalo de nuevo.
            </div>
          )}
          {stravaStatus === "connected" && (
            <div className="bg-[#CAFF00]/10 border border-[#CAFF00]/20 rounded-2xl p-3 text-[#CAFF00] text-sm mb-4">
              ✅ Strava conectado correctamente.
            </div>
          )}

          {syncResult && (
            <div className="bg-[#CAFF00]/10 border border-[#CAFF00]/20 rounded-2xl p-3 text-[#CAFF00] text-sm mb-4">
              ✅ {syncResult.imported} carreras importadas de {syncResult.total} encontradas en Strava.
            </div>
          )}

          {stravaConnected ? (
            <div className="flex flex-col gap-3">
              <button
                onClick={syncStrava}
                disabled={syncing}
                className="w-full bg-[#CAFF00] hover:bg-[#b8e600] disabled:opacity-50 text-black font-black py-3.5 rounded-2xl text-sm transition-all neon-glow active:scale-95"
              >
                {syncing ? "Importando carreras..." : "🔄 Sincronizar con Strava"}
              </button>
              <button
                onClick={disconnectStrava}
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-[#555] py-3 rounded-2xl text-sm hover:bg-[#222] transition-colors"
              >
                Desconectar Strava
              </button>
            </div>
          ) : (
            <button
              onClick={connectStrava}
              className="w-full bg-[#FC4C02] hover:bg-[#e04400] text-white font-black py-3.5 rounded-2xl text-sm transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.599h4.172L10.463 0l-7 13.828h4.169"/>
              </svg>
              Conectar con Strava
            </button>
          )}

          <div className="mt-4 bg-[#1a1a1a] rounded-2xl p-4">
            <p className="text-xs text-[#555] leading-relaxed">
              Al conectar Strava, RunStep importará automáticamente tus carreras incluyendo distancia, tiempo, frecuencia cardíaca y ruta GPS. Solo se importan actividades de tipo running.
            </p>
          </div>
        </div>

        {/* What Strava imports */}
        <div className="bg-[#111] border border-[#222] rounded-3xl p-5">
          <div className="text-xs text-[#555] uppercase tracking-wider font-medium mb-3">Qué importa Strava</div>
          <div className="flex flex-col gap-2">
            {[
              { icon: "📍", text: "Ruta GPS con mapa" },
              { icon: "📏", text: "Distancia y tiempo exactos" },
              { icon: "❤️", text: "Frecuencia cardíaca media y máxima" },
              { icon: "⛰️", text: "Desnivel acumulado" },
              { icon: "📅", text: "Historial completo de carreras" },
            ].map(i => (
              <div key={i.text} className="flex items-center gap-3 text-sm text-[#888]">
                <span>{i.icon}</span> {i.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
