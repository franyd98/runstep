"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import AppShell from "@/components/AppShell";

const typeColors: Record<string, string> = {
  easy: "text-green-400 bg-green-400/10 border-green-400/20",
  tempo: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  interval: "text-red-400 bg-red-400/10 border-red-400/20",
  fartlek: "text-sky-400 bg-sky-400/10 border-sky-400/20",
  long: "text-orange-400 bg-orange-400/10 border-orange-400/20",
  recovery: "text-teal-400 bg-teal-400/10 border-teal-400/20",
};
const typeLabels: Record<string, string> = {
  easy: "Easy run", tempo: "Tempo", interval: "Intervalos",
  fartlek: "Fartlek", long: "Tirada larga", recovery: "Recuperación",
};
const typeEmoji: Record<string, string> = {
  easy: "🟢", tempo: "🟣", interval: "🔴", fartlek: "🔵", long: "🟠", recovery: "⚪",
};
const tipsByType: Record<string, string> = {
  easy: "Corre a un ritmo en el que puedas mantener una conversación. No te preocupes por el tiempo, el objetivo es acumular km de forma suave.",
  tempo: "Ritmo moderado-alto que puedas sostener. Debes sentirte 'cómodamente incómodo'. Mejora tu umbral de lactato.",
  interval: "Series cortas a alta intensidad. Descansa el tiempo indicado entre cada una. Mejoran velocidad y VO2máx.",
  fartlek: "Alterna tramos rápidos y lentos de forma libre. Sin presión de ritmo exacto — escucha tu cuerpo.",
  long: "Ritmo muy suave, el más fácil de todos. El objetivo es el tiempo en pies, no la velocidad. Clave para la resistencia.",
  recovery: "Muy suave, casi caminar. El objetivo es activar la circulación y recuperarse del entrenamiento anterior.",
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
    const { data } = await supabase.from("training_plan").select("*").eq("user_id", user.id).order("week").order("id");
    const plan = data || [];
    setPlan(plan);
    // Auto-select first week with incomplete sessions
    const firstIncomplete = plan.find(s => !s.completed);
    if (firstIncomplete) setActiveWeek(firstIncomplete.week);
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
  const progressPct = totalSessions ? Math.round((completedCount / totalSessions) * 100) : 0;

  return (
    <AppShell>
      <div className="px-4 py-6 max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-black">Mi Plan</h1>
          <p className="text-[#555] text-sm mt-1">12 semanas · Progresivo · Personalizado para ti</p>
        </div>

        {/* Global progress */}
        <div className="bg-[#111] border border-[#222] rounded-3xl p-5 mb-5">
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-sm">Progreso total</span>
            <span className="text-[#CAFF00] font-black text-lg">{progressPct}%</span>
          </div>
          <div className="h-3 bg-[#1a1a1a] rounded-full overflow-hidden mb-2">
            <div className="h-full bg-[#CAFF00] rounded-full transition-all duration-700 neon-glow" style={{ width: `${progressPct}%` }}/>
          </div>
          <p className="text-xs text-[#444]">{completedCount} de {totalSessions} sesiones completadas</p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-[#555]">Cargando tu plan...</div>
        ) : plan.length === 0 ? (
          <div className="text-center py-12 text-[#555]">No hay plan. Completa el onboarding primero.</div>
        ) : (
          <>
            {/* Week selector - horizontal scroll */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
              {weeks.map(w => {
                const wSessions = plan.filter(s => s.week === w);
                const wDone = wSessions.filter(s => s.completed).length;
                const allDone = wDone === wSessions.length;
                const hasCurrent = wSessions.some(s => !s.completed) && (w === weeks.find(ww => plan.filter(s => s.week === ww).some(s => !s.completed)));
                return (
                  <button key={w} onClick={() => setActiveWeek(w)}
                    className={`flex-shrink-0 flex flex-col items-center px-4 py-3 rounded-2xl text-sm font-bold border transition-all min-w-[64px] ${
                      activeWeek === w
                        ? "bg-[#CAFF00] border-[#CAFF00] text-black neon-glow"
                        : allDone
                        ? "bg-[#CAFF00]/10 border-[#CAFF00]/20 text-[#CAFF00]"
                        : "bg-[#111] border-[#222] text-[#555]"
                    }`}>
                    <span>S{w}</span>
                    {allDone && <span className="text-xs mt-0.5">{activeWeek === w ? "✓" : "✓"}</span>}
                    {!allDone && <span className="text-xs mt-0.5 font-normal">{wDone}/{wSessions.length}</span>}
                  </button>
                );
              })}
            </div>

            {/* Week header */}
            <div className="mb-4">
              <h2 className="text-lg font-black">Semana {activeWeek}</h2>
              <p className="text-xs text-[#444] mt-0.5">
                {weekSessions.filter(s => s.completed).length} de {weekSessions.length} sesiones completadas
              </p>
            </div>

            {/* Sessions */}
            <div className="flex flex-col gap-4">
              {weekSessions.map((session, idx) => (
                <div key={session.id}
                  className={`bg-[#111] border rounded-3xl overflow-hidden transition-all ${
                    session.completed ? "border-[#CAFF00]/20 opacity-60" : "border-[#222]"
                  }`}>
                  {/* Session header */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a1a1a]">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black border ${
                        session.completed ? "bg-[#CAFF00] border-[#CAFF00] text-black" : "border-[#333] text-[#555]"
                      }`}>
                        {session.completed ? "✓" : idx + 1}
                      </div>
                      <div>
                        <div className="font-bold text-sm">{session.day}</div>
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${typeColors[session.type]}`}>
                          {typeEmoji[session.type]} {typeLabels[session.type]}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleComplete(session.id, session.completed)}
                      className={`px-4 py-2 rounded-2xl text-xs font-bold border transition-all active:scale-95 ${
                        session.completed
                          ? "bg-[#CAFF00]/10 border-[#CAFF00]/20 text-[#CAFF00]"
                          : "bg-[#1a1a1a] border-[#2a2a2a] text-[#666] hover:border-[#CAFF00] hover:text-[#CAFF00]"
                      }`}>
                      {session.completed ? "✓ Hecho" : "Marcar"}
                    </button>
                  </div>

                  {/* Session body */}
                  <div className="px-5 py-4">
                    {/* Targets */}
                    <div className="flex gap-3 mb-4">
                      <div className="flex-1 bg-[#1a1a1a] rounded-2xl p-3 text-center">
                        <div className="text-[#CAFF00] font-black text-lg">{session.target_distance} km</div>
                        <div className="text-xs text-[#444]">Distancia objetivo</div>
                      </div>
                      <div className="flex-1 bg-[#1a1a1a] rounded-2xl p-3 text-center">
                        <div className="text-white font-black text-lg">~{session.target_duration} min</div>
                        <div className="text-xs text-[#444]">Duración estimada</div>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="bg-[#1a1a1a] rounded-2xl p-4 mb-3">
                      <p className="text-xs text-[#666] uppercase tracking-wider font-medium mb-2">¿Qué tienes que hacer?</p>
                      <p className="text-sm text-white leading-relaxed">{session.description}</p>
                    </div>

                    {/* Tip */}
                    <div className="bg-[#CAFF00]/5 border border-[#CAFF00]/10 rounded-2xl p-4">
                      <p className="text-xs text-[#CAFF00]/70 uppercase tracking-wider font-medium mb-1.5">💡 Consejo</p>
                      <p className="text-xs text-[#888] leading-relaxed">{tipsByType[session.type]}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
