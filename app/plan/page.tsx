"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import AppShell from "@/components/AppShell";

const typeColors: Record<string, string> = {
  easy: "bg-green-500/15 text-green-400 border-green-500/20",
  tempo: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  interval: "bg-red-500/15 text-red-400 border-red-500/20",
  fartlek: "bg-sky-500/15 text-sky-400 border-sky-500/20",
  long: "bg-orange-500/15 text-orange-400 border-orange-500/20",
  recovery: "bg-teal-500/15 text-teal-400 border-teal-500/20",
};
const typeLabels: Record<string, string> = {
  easy: "Easy run", tempo: "Tempo", interval: "Intervalos",
  fartlek: "Fartlek", long: "Tirada larga", recovery: "Recuperación",
};

interface PlanSession {
  id: string;
  week: number;
  day: string;
  type: string;
  description: string;
  target_distance: number;
  target_duration: number;
  completed: boolean;
}

export default function PlanPage() {
  const router = useRouter();
  const [plan, setPlan] = useState<PlanSession[]>([]);
  const [activeWeek, setActiveWeek] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.replace("/auth"); return; }
    const { data } = await supabase
      .from("training_plan")
      .select("*")
      .eq("user_id", user.id)
      .order("week").order("id");
    setPlan(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggleComplete = async (id: string, completed: boolean) => {
    const supabase = createClient();
    await supabase.from("training_plan").update({ completed: !completed }).eq("id", id);
    load();
  };

  const weeks = Array.from(new Set(plan.map(s => s.week))).sort((a, b) => a - b);
  const weekSessions = plan.filter(s => s.week === activeWeek);
  const completedCount = plan.filter(s => s.completed).length;
  const totalSessions = plan.length;

  return (
    <AppShell>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Mi Plan de 12 Semanas</h1>
          <p className="text-[#8b90b0] text-sm mt-1">
            {completedCount} de {totalSessions} sesiones completadas
          </p>
          <div className="mt-3 h-2 bg-[#1e1e30] rounded-full overflow-hidden max-w-sm">
            <div
              className="h-full bg-[#FF4D00] rounded-full transition-all"
              style={{ width: totalSessions ? `${(completedCount / totalSessions) * 100}%` : "0%" }}
            />
          </div>
        </div>

        {loading ? (
          <div className="text-[#8b90b0]">Cargando plan...</div>
        ) : plan.length === 0 ? (
          <div className="text-[#8b90b0]">No hay plan generado. Completa el onboarding.</div>
        ) : (
          <div className="flex gap-6">
            {/* Week selector */}
            <div className="flex flex-col gap-1.5 min-w-[80px]">
              {weeks.map(w => {
                const wSessions = plan.filter(s => s.week === w);
                const wDone = wSessions.filter(s => s.completed).length;
                const allDone = wDone === wSessions.length;
                return (
                  <button
                    key={w}
                    onClick={() => setActiveWeek(w)}
                    className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-between gap-2 ${
                      activeWeek === w
                        ? "bg-[#FF4D00] text-white"
                        : "bg-[#141420] border border-[#2a2a42] text-[#8b90b0] hover:border-[#3a3a58]"
                    }`}
                  >
                    <span>S{w}</span>
                    {allDone && <span className="text-xs">✓</span>}
                    {!allDone && wDone > 0 && <span className="text-xs">{wDone}/{wSessions.length}</span>}
                  </button>
                );
              })}
            </div>

            {/* Sessions */}
            <div className="flex-1 flex flex-col gap-3">
              <h2 className="text-lg font-bold mb-1">Semana {activeWeek}</h2>
              {weekSessions.map(session => (
                <div
                  key={session.id}
                  className={`bg-[#141420] border rounded-2xl p-5 transition-all ${
                    session.completed ? "border-[#FF4D00]/40 opacity-70" : "border-[#2a2a42]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-semibold text-[#8b90b0]">{session.day}</span>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${typeColors[session.type]}`}>
                          {typeLabels[session.type]}
                        </span>
                      </div>
                      <p className="text-sm">{session.description}</p>
                      <div className="flex gap-4 mt-3">
                        <span className="text-xs text-[#8b90b0]">🎯 {session.target_distance} km</span>
                        <span className="text-xs text-[#8b90b0]">⏱ ~{session.target_duration} min</span>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleComplete(session.id, session.completed)}
                      className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                        session.completed
                          ? "bg-[#FF4D00] border-[#FF4D00] text-white"
                          : "border-[#2a2a42] hover:border-[#FF4D00]"
                      }`}
                    >
                      {session.completed ? "✓" : ""}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
