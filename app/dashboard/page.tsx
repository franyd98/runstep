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
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.replace("/auth"); return; }
    setUser(user);

    const [{ data: profile }, { data: runs }] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", user.id).single(),
      supabase.from("runs").select("*").eq("user_id", user.id).order("date", { ascending: false }),
    ]);

    if (!profile?.onboarding_done) { router.replace("/onboarding"); return; }
    setProfile(profile);
    setRuns(runs || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-[#8b90b0]">Cargando...</div>
    </div>
  );

  // Week stats
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

  // Week grid
  const days = ["L", "M", "X", "J", "V", "S", "D"];
  const activeDays = new Set(weekRuns.map(r => (new Date(r.date + "T12:00:00").getDay() + 6) % 7));
  const todayIdx = (now.getDay() + 6) % 7;

  const lastRun = runs[0];

  return (
    <AppShell>
      <div className="p-8">
        {/* Greeting */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Hola, {profile?.name?.split(" ")[0]} 👋</h1>
            <p className="text-[#8b90b0] text-sm mt-1">
              {levelLabels[profile?.level || ""] || ""} · {goalLabels[profile?.goal || ""] || ""}
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="bg-[#FF4D00] hover:bg-[#cc3d00] text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors flex items-center gap-2"
          >
            + Nueva carrera
          </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Distancia semana", value: `${weekDist.toFixed(1)} km` },
            { label: "Tiempo semana", value: weekTime >= 60 ? `${Math.floor(weekTime/60)}h ${weekTime%60}min` : `${weekTime} min` },
            { label: "Carreras semana", value: `${weekRuns.length}` },
            { label: "Total km", value: `${totalDist.toFixed(0)} km` },
          ].map(k => (
            <div key={k.label} className="bg-[#141420] border border-[#2a2a42] rounded-2xl p-5">
              <div className="text-xs text-[#8b90b0] uppercase tracking-wide mb-2">{k.label}</div>
              <div className="text-2xl font-bold">{k.value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Week grid */}
          <div className="bg-[#141420] border border-[#2a2a42] rounded-2xl p-5">
            <div className="font-semibold mb-4">Días activos esta semana</div>
            <div className="flex gap-2 mb-4">
              {days.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className="text-xs text-[#8b90b0]">{d}</div>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-all ${
                    activeDays.has(i)
                      ? "bg-[#FF4D00] border-[#FF4D00] text-white"
                      : i === todayIdx
                      ? "border-[#FF4D00] text-[#FF4D00]"
                      : "border-[#2a2a42] text-[#8b90b0]"
                  }`}>
                    {activeDays.has(i) ? "✓" : ""}
                  </div>
                </div>
              ))}
            </div>
            {/* Goal bar */}
            <div className="mt-2">
              <div className="flex justify-between text-xs text-[#8b90b0] mb-1.5">
                <span>Meta semanal</span>
                <span>{weekDist.toFixed(1)} / {goalKm} km</span>
              </div>
              <div className="h-2 bg-[#1e1e30] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#FF4D00] rounded-full transition-all duration-500"
                  style={{ width: `${goalPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Last run */}
          <div className="bg-[#141420] border border-[#2a2a42] rounded-2xl p-5">
            <div className="font-semibold mb-4">Última carrera</div>
            {lastRun ? (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${typeColors[lastRun.type]}`}>
                    {typeLabels[lastRun.type]}
                  </span>
                  <span className="text-xs text-[#8b90b0]">{lastRun.date}</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Distancia", value: `${lastRun.distance} km` },
                    { label: "Tiempo", value: `${lastRun.duration} min` },
                    { label: "Ritmo", value: pace(lastRun.distance, lastRun.duration) + " /km" },
                    { label: "FC media", value: lastRun.hr_avg ? `${lastRun.hr_avg} ppm` : "—" },
                    { label: "FC máx", value: lastRun.hr_max ? `${lastRun.hr_max} ppm` : "—" },
                    { label: "Cadencia", value: lastRun.cadence ? `${lastRun.cadence} ppm` : "—" },
                  ].map(s => (
                    <div key={s.label} className="bg-[#1e1e30] rounded-xl p-3">
                      <div className="text-xs text-[#8b90b0] mb-1">{s.label}</div>
                      <div className="text-sm font-semibold">{s.value}</div>
                    </div>
                  ))}
                </div>
                {lastRun.notes && (
                  <p className="text-sm text-[#8b90b0] mt-3 italic">"{lastRun.notes}"</p>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 text-[#8b90b0]">
                <div className="text-3xl mb-2">🏃</div>
                <p className="text-sm">Aún no has registrado ninguna carrera</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent runs */}
        {runs.length > 0 && (
          <div className="bg-[#141420] border border-[#2a2a42] rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#2a2a42] font-semibold">Carreras recientes</div>
            <div className="divide-y divide-[#2a2a42]">
              {runs.slice(0, 5).map(run => (
                <div key={run.id} className="flex items-center gap-4 px-6 py-4 hover:bg-[#1e1e30] transition-colors">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#1e1e30] rounded-xl flex items-center justify-center text-lg">
                    {run.type === "easy" ? "🟢" : run.type === "long" ? "🟠" : run.type === "interval" ? "🔴" : run.type === "tempo" ? "🟣" : run.type === "fartlek" ? "🔵" : "⚪"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColors[run.type]}`}>
                        {typeLabels[run.type]}
                      </span>
                      <span className="text-xs text-[#8b90b0]">{run.date}</span>
                    </div>
                    {run.notes && <p className="text-xs text-[#8b90b0] mt-0.5 truncate">{run.notes}</p>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-semibold">{run.distance} km</div>
                    <div className="text-xs text-[#8b90b0]">{pace(run.distance, run.duration)} /km</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <RunModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={load}
        userId={user?.id || ""}
      />
    </AppShell>
  );
}
