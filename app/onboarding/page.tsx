"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { generatePlan } from "@/lib/plan";
import type { Profile } from "@/lib/types";

const STEPS = ["Tus datos", "Nivel", "Objetivo", "Disponibilidad"];

const levels = [
  { value: "beginner", emoji: "🌱", title: "Principiante", desc: "Nunca he corrido o hace mucho que no lo hago" },
  { value: "intermediate", emoji: "🏃", title: "Intermedio", desc: "Corro de vez en cuando, entre 3-15 km/semana" },
  { value: "advanced", emoji: "⚡", title: "Avanzado", desc: "Entreno regularmente, +15 km/semana" },
];

const goals = [
  { value: "weight_loss", emoji: "⚖️", title: "Perder peso", desc: "Usar el running como herramienta para quemar calorías" },
  { value: "complete_5k", emoji: "🏅", title: "Completar un 5K", desc: "Mi primera carrera, quiero terminarla sin parar" },
  { value: "habit", emoji: "📅", title: "Crear un hábito", desc: "Correr como parte de mi rutina de salud" },
  { value: "race", emoji: "🎽", title: "Prepararme para una carrera", desc: "Tengo un objetivo de tiempo o distancia" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", age: "", weight: "", height: "", sex: "male",
    level: "", goal: "", days_per_week: 3,
  });

  const set = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }));

  const next = () => setStep(s => Math.min(s + 1, 3));
  const back = () => setStep(s => Math.max(s - 1, 0));

  const canNext = () => {
    if (step === 0) return form.name && form.age && form.weight && form.height;
    if (step === 1) return form.level;
    if (step === 2) return form.goal;
    return true;
  };

  const submit = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.replace("/auth"); return; }

    const profile: Omit<Profile, "id" | "created_at"> = {
      user_id: user.id,
      name: form.name,
      age: parseInt(form.age),
      weight: parseFloat(form.weight),
      height: parseFloat(form.height),
      sex: form.sex as "male" | "female",
      level: form.level as Profile["level"],
      goal: form.goal as Profile["goal"],
      days_per_week: form.days_per_week,
      onboarding_done: true,
    };

    await supabase.from("profiles").upsert({ ...profile });

    // Generate and store plan
    const plan = generatePlan(profile as Profile);
    const planRows = plan.flatMap(week =>
      week.sessions.map(session => ({
        user_id: user.id,
        week: week.week,
        day: session.day,
        type: session.type,
        description: session.description,
        target_distance: session.target_distance,
        target_duration: session.target_duration,
        completed: false,
      }))
    );
    await supabase.from("training_plan").insert(planRows);

    router.replace("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-4xl">🏃</span>
          <h1 className="text-2xl font-bold mt-3">Configura tu plan</h1>
          <p className="text-[#8b90b0] text-sm mt-1">Paso {step + 1} de {STEPS.length}</p>
        </div>

        {/* Progress bar */}
        <div className="flex gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={i} className="flex-1 h-1.5 rounded-full overflow-hidden bg-[#2a2a42]">
              <div
                className="h-full bg-[#FF4D00] rounded-full transition-all duration-500"
                style={{ width: i <= step ? "100%" : "0%" }}
              />
            </div>
          ))}
        </div>

        <div className="bg-[#141420] border border-[#2a2a42] rounded-2xl p-8">
          {/* STEP 0 - Personal data */}
          {step === 0 && (
            <div>
              <h2 className="text-xl font-bold mb-6">Cuéntanos sobre ti</h2>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-sm text-[#8b90b0] mb-1.5 block">Tu nombre</label>
                  <input
                    value={form.name} onChange={e => set("name", e.target.value)}
                    placeholder="Fran"
                    className="w-full bg-[#1e1e30] border border-[#2a2a42] rounded-xl px-4 py-3 text-sm focus:border-[#FF4D00] transition-colors"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-[#8b90b0] mb-1.5 block">Edad</label>
                    <input
                      type="number" value={form.age} onChange={e => set("age", e.target.value)}
                      placeholder="30" min={10} max={90}
                      className="w-full bg-[#1e1e30] border border-[#2a2a42] rounded-xl px-4 py-3 text-sm focus:border-[#FF4D00] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-[#8b90b0] mb-1.5 block">Sexo</label>
                    <select
                      value={form.sex} onChange={e => set("sex", e.target.value)}
                      className="w-full bg-[#1e1e30] border border-[#2a2a42] rounded-xl px-4 py-3 text-sm focus:border-[#FF4D00] transition-colors"
                    >
                      <option value="male">Hombre</option>
                      <option value="female">Mujer</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-[#8b90b0] mb-1.5 block">Peso (kg)</label>
                    <input
                      type="number" value={form.weight} onChange={e => set("weight", e.target.value)}
                      placeholder="75" min={30} max={200}
                      className="w-full bg-[#1e1e30] border border-[#2a2a42] rounded-xl px-4 py-3 text-sm focus:border-[#FF4D00] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-[#8b90b0] mb-1.5 block">Altura (cm)</label>
                    <input
                      type="number" value={form.height} onChange={e => set("height", e.target.value)}
                      placeholder="175" min={100} max={250}
                      className="w-full bg-[#1e1e30] border border-[#2a2a42] rounded-xl px-4 py-3 text-sm focus:border-[#FF4D00] transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 1 - Level */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold mb-2">¿Cuál es tu nivel?</h2>
              <p className="text-[#8b90b0] text-sm mb-6">Sé honesto, así el plan se adapta mejor a ti</p>
              <div className="flex flex-col gap-3">
                {levels.map(l => (
                  <button
                    key={l.value}
                    onClick={() => set("level", l.value)}
                    className={`flex items-start gap-4 p-4 rounded-xl border transition-all text-left ${
                      form.level === l.value
                        ? "border-[#FF4D00] bg-[#FF4D00]/10"
                        : "border-[#2a2a42] bg-[#1e1e30] hover:border-[#3a3a58]"
                    }`}
                  >
                    <span className="text-2xl mt-0.5">{l.emoji}</span>
                    <div>
                      <div className="font-semibold">{l.title}</div>
                      <div className="text-sm text-[#8b90b0] mt-0.5">{l.desc}</div>
                    </div>
                    {form.level === l.value && (
                      <span className="ml-auto text-[#FF4D00] mt-1">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2 - Goal */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold mb-2">¿Cuál es tu objetivo?</h2>
              <p className="text-[#8b90b0] text-sm mb-6">Tu plan de 12 semanas se adaptará a esto</p>
              <div className="flex flex-col gap-3">
                {goals.map(g => (
                  <button
                    key={g.value}
                    onClick={() => set("goal", g.value)}
                    className={`flex items-start gap-4 p-4 rounded-xl border transition-all text-left ${
                      form.goal === g.value
                        ? "border-[#FF4D00] bg-[#FF4D00]/10"
                        : "border-[#2a2a42] bg-[#1e1e30] hover:border-[#3a3a58]"
                    }`}
                  >
                    <span className="text-2xl mt-0.5">{g.emoji}</span>
                    <div>
                      <div className="font-semibold">{g.title}</div>
                      <div className="text-sm text-[#8b90b0] mt-0.5">{g.desc}</div>
                    </div>
                    {form.goal === g.value && (
                      <span className="ml-auto text-[#FF4D00] mt-1">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3 - Availability */}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-bold mb-2">¿Cuántos días puedes entrenar?</h2>
              <p className="text-[#8b90b0] text-sm mb-6">Lo ideal es dejar descanso entre sesiones</p>
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[2, 3, 4].map(d => (
                  <button
                    key={d}
                    onClick={() => set("days_per_week", d)}
                    className={`flex flex-col items-center py-5 rounded-xl border transition-all ${
                      form.days_per_week === d
                        ? "border-[#FF4D00] bg-[#FF4D00]/10"
                        : "border-[#2a2a42] bg-[#1e1e30] hover:border-[#3a3a58]"
                    }`}
                  >
                    <span className="text-2xl font-bold">{d}</span>
                    <span className="text-xs text-[#8b90b0] mt-1">días/sem</span>
                  </button>
                ))}
              </div>
              <div className={`rounded-xl p-4 text-sm ${
                form.days_per_week === 2 ? "bg-blue-500/10 text-blue-300" :
                form.days_per_week === 3 ? "bg-green-500/10 text-green-300" :
                "bg-orange-500/10 text-orange-300"
              }`}>
                {form.days_per_week === 2 && "💡 2 días es perfecto para empezar sin sobrecargar el cuerpo."}
                {form.days_per_week === 3 && "✅ 3 días es el estándar recomendado para progresar bien."}
                {form.days_per_week === 4 && "🔥 4 días da progreso rápido, asegúrate de descansar bien."}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <button
                onClick={back}
                className="flex-1 bg-[#1e1e30] border border-[#2a2a42] text-[#8b90b0] font-semibold py-3 rounded-xl hover:bg-[#2a2a42] transition-colors"
              >
                Atrás
              </button>
            )}
            {step < 3 ? (
              <button
                onClick={next}
                disabled={!canNext()}
                className="flex-1 bg-[#FF4D00] hover:bg-[#cc3d00] disabled:opacity-40 text-white font-bold py-3 rounded-xl transition-colors"
              >
                Continuar
              </button>
            ) : (
              <button
                onClick={submit}
                disabled={loading}
                className="flex-1 bg-[#FF4D00] hover:bg-[#cc3d00] disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors"
              >
                {loading ? "Creando tu plan..." : "🚀 Empezar mi plan"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
