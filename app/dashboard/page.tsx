"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import AppShell from "@/components/AppShell";
import RunModal from "@/components/RunModal";
import type { Run, Profile } from "@/lib/types";
import { goalLabels, levelLabels } from "@/lib/plan";

const typeColors: Record<string, string> = {
  easy: "bg-green-500/15 text-green-400",
  tempo: "bg-purple-500/15 text-purple-400",
  interval: "bg-red-500/15 text-red-400",
  fartlek: "bg-sky-500/15 text-sky-400",
  long: "bg-orange-500/15 text-orange-400",
  recovery: "bg-teal-500/15 text-teal-400",
};
const typeLabels: Record<string, string> = {
  easy: "Easy run", tempo: "Tempo", interval: "Intervalos",
  fartlek: "Fartlek", long: "Tirada larga", recovery: "Recuperación",
};
const typeEmoji: Record<string, string> = {
  easy: "🟢", tempo: "🟣", interval: "🔴", fartlek: "🔵", long: "🟠", recovery: "⚪",
};

function pace(dist: number, time: number) {
  const p = time / dist;
  const min = Math.floor(p);
  const sec = Math.round((p - min) * 60);
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [runs, setRuns] = useState<Run[]>([]);
  const [nextSession, setNextSession] = useState<Record<string, unknown> | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.replace("/auth"); return; }
    setUser(user);

    const [{ data: profile }, { data: runs }, { data: plan }] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", user.id).single(),
      supabase.from("runs").select("*").eq("user_id", user.id).order("date", { ascending: false }),
      supabase.from("training_plan").select("*").eq("user_id", user.id).eq("completed", false).order("week").limit(1),
    ]);

    if (!profile?.onboarding_done) { router.replace("/onboarding"); return; }
    setProfile(profile);
    setRuns(runs || []);
    setNextSession(plan?.[0] || null);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#0d0d0d]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-2 border-[#CAFF00] border-t-transparent rounded-full animate-spin"/>
        <p className="text-[#555] text-sm">Cargando...</p>
      </div>
    </div>
  );

  const now = new Date();
  const dayOfWeek = (now.getDay() + 6) % 7;
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - dayOfWeek);
  weekStart.setHours(0, 0, 0, 0);

  const weekRuns = runs.filter(r => new Date(r.date + "T12:00:00") >= weekStart);
  const weekDist = weekRuns.reduce((s, r) => s + r.distance, 0);
  const weekTime = weekRuns.reduce((s, r) => s + r.duration, 0);
  const totalDist = runs.reduce((s, r) => s + r.distance, 0);
  const goalKm = (profile?.days_per_week || 3) * 8;
  const goalPct = Math.min(100, (weekDist / goalKm) * 100);

  const days = ["L", "M", "X", "J", "V", "S", "D"];
  const activeDays = new Set(weekRuns.map(r => (new Date(r.date + "T12:00:00").getDay() + 6) % 7));
  const todayIdx = (now.getDay() + 6) % 7;
  const lastRun = runs[0];

  const hour = now.getHours();
  const greeting = hour < 13 ? "Buenos días" : hour < 20 ? "Buenas tardes" : "Buenas noches";

  return (
    <AppShell>
      <div className="px-4 py-6 max-w-2xl mx-auto">
        {/* Greeting */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-[#555] text-sm font-medium">{greeting} 👋</p>
            <h1 className="text-2xl font-black mt-0.5">{profile?.name?.split(" ")[0]}</h1>
            <p className="text-xs text-[#444] mt-1">{levelLabels[profile?.level || ""]} · {goalLabels[profile?.goal || ""]}</p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="bg-[#CAFF00] text-black font-bold px-4 py-2.5 rounded-2xl text-sm neon-glow active:scale-95 transition-transform"
          >
            + Añadir
          </button>
        </div>

        {/* Next session banner */}
        {nextSession && (
          <div className="bg-[#CAFF00]/10 border border-[#CAFF00]/25 rounded-3xl p-5 mb-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-[#CAFF00] font-bold uppercase tracking-wider">Próxima sesión</span>
              <span className="text-xs text-[#555]">Semana {nextSession.week as number}</span>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-[#CAFF00]/20 rounded-2xl flex items-center justify-center text-lg">
                {typeEmoji[nextSession.type as string] || "🏃"}
              </div>
              <div>
                <div className="font-bold text-white">{typeLabels[nextSession.type as string]}</div>
                <div className="text-xs text-[#555]">{nextSession.day as string}</div>
              </div>
              <div className="ml-auto text-right">
                <div className="text-[#CAFF00] font-bold">{nextSession.target_distance as number} km</div>
                <div className="text-xs text-[#555]">~{nextSession.target_duration as number} min</div>
              </div>
            </div>
            <p className="text-sm text-[#888]">{nextSession.description as string}</p>
          </div>
        )}

        {/* Week stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: "Esta semana", value: `${weekDist.toFixed(1)}`, unit: "km" },
            { label: "Tiempo", value: weekTime >= 60 ? `${Math.floor(weekTime/60)}h${weekTime%60}` : `${weekTime}`, unit: "min" },
            { label: "Total", value: `${totalDist.toFixed(0)}`, unit: "km" },
          ].map(k => (
            <div key={k.label} className="bg-[#111] border border-[#222] rounded-2xl p-4 text-center">
              <div className="text-xs text-[#444] mb-1 font-medium">{k.label}</div>
              <div className="text-xl font-black text-white">{k.value}</div>
              <div className="text-xs text-[#555]">{k.unit}</div>
            </div>
          ))}
        </div>

        {/* Week grid */}
        <div className="bg-[#111] border border-[#222] rounded-3xl p-5 mb-5">
          <div className="flex items-center justify-between mb-4">
            <span className="font-bold text-sm">Semana actual</span>
            <span className="text-xs text-[#555]">{weekRuns.length} salidas</span>
          </div>
          <div className="flex gap-2 mb-4">
            {days.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="text-xs text-[#444] font-medium">{d}</div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                  activeDays.has(i) ? "bg-[#CAFF00] border-[#CAFF00] text-black" :
                  i === todayIdx ? "border-[#CAFF00] text-[#CAFF00]" :
                  "border-[#222] text-[#333]"
                }`}>
                  {activeDays.has(i) ? "✓" : ""}
                </div>
              </div>
            ))}
          </div>
          <div>
            <div className="flex justify-between text-xs text-[#444] mb-1.5">
              <span>Meta semanal</span>
              <span className="text-[#CAFF00] font-semibold">{weekDist.toFixed(1)} / {goalKm} km</span>
            </div>
            <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
              <div className="h-full bg-[#CAFF00] rounded-full transition-all duration-700" style={{ width: `${goalPct}%` }}/>
            </div>
          </div>
        </div>

        {/* Last run */}
        {lastRun && (
          <div className="bg-[#111] border border-[#222] rounded-3xl p-5 mb-5">
            <div className="flex items-center justify-between mb-4">
              <span className="font-bold text-sm">Última carrera</span>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${typeColors[lastRun.type]}`}>
                {typeLabels[lastRun.type]}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Distancia", value: `${lastRun.distance} km` },
                { label: "Tiempo", value: `${lastRun.duration} min` },
                { label: "Ritmo", value: `${pace(lastRun.distance, lastRun.duration)} /km` },
                { label: "FC media", value: lastRun.hr_avg ? `${lastRun.hr_avg} ppm` : "—" },
                { label: "FC máx", value: lastRun.hr_max ? `${lastRun.hr_max} ppm` : "—" },
                { label: "Cadencia", value: lastRun.cadence ? `${lastRun.cadence} ppm` : "—" },
              ].map(s => (
                <div key={s.label} className="bg-[#1a1a1a] rounded-2xl p-3">
                  <div className="text-xs text-[#444] mb-1">{s.label}</div>
                  <div className="text-sm font-bold">{s.value}</div>
                </div>
              ))}
            </div>
            {lastRun.notes && (
              <p className="text-sm text-[#555] mt-3 italic">"{lastRun.notes}"</p>
            )}
          </div>
        )}

        {/* Recent runs */}
        {runs.length > 1 && (
          <div className="bg-[#111] border border-[#222] rounded-3xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#1a1a1a]">
              <span className="font-bold text-sm">Carreras recientes</span>
            </div>
            {runs.slice(1, 6).map(run => (
              <div key={run.id} className="flex items-center gap-3 px-5 py-3.5 border-b border-[#1a1a1a] last:border-0">
                <span className="text-xl">{typeEmoji[run.type]}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold">{run.distance} km</div>
                  <div className="text-xs text-[#444]">{run.date} · {run.duration} min</div>
                </div>
                <div className="text-sm font-bold text-[#CAFF00]">{pace(run.distance, run.duration)}<span className="text-xs text-[#444] font-normal"> /km</span></div>
              </div>
            ))}
          </div>
        )}

        {runs.length === 0 && (
          <div className="bg-[#111] border border-[#222] rounded-3xl p-10 text-center">
            <div className="text-5xl mb-3">🏃</div>
            <p className="font-bold mb-1">¡Aún no has registrado ninguna carrera!</p>
            <p className="text-sm text-[#555] mb-5">Pulsa "+ Añadir" después de cada entrenamiento</p>
            <button onClick={() => setModalOpen(true)} className="bg-[#CAFF00] text-black font-bold px-6 py-3 rounded-2xl text-sm neon-glow">
              Registrar primera carrera
            </button>
          </div>
        )}
      </div>

      <RunModal open={modalOpen} onClose={() => setModalOpen(false)} onSaved={load} userId={user?.id || ""} />
    </AppShell>
  );
}
