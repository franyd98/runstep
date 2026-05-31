"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { generatePlan } from "@/lib/plan";
import type { Profile } from "@/lib/types";
import Logo from "@/components/Logo";

const STEPS = ["Tus datos", "Nivel", "Objetivo", "Disponibilidad"];

const levels = [
  { value: "beginner", emoji: "🌱", title: "Principiante", desc: "Nunca he corrido o llevo mucho tiempo sin hacerlo" },
  { value: "intermediate", emoji: "🏃", title: "Intermedio", desc: "Corro de vez en cuando, entre 3-15 km/semana" },
  { value: "advanced", emoji: "⚡", title: "Avanzado", desc: "Entreno regularmente, más de 15 km/semana" },
];

const goals = [
  { value: "weight_loss", emoji: "⚖️", title: "Perder peso", desc: "Usar el running para quemar calorías y estar más en forma" },
  { value: "complete_5k", emoji: "🏅", title: "Completar un 5K", desc: "Mi primera carrera, quiero terminarla sin parar" },
  { value: "habit", emoji: "📅", title: "Crear un hábito", desc: "Correr como parte de mi rutina de salud semanal" },
  { value: "race", emoji: "🎽", title: "Prepararme para una carrera", desc: "Tengo un objetivo de tiempo o distancia específico" },
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

  const inputClass = "w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl px-4 py-3.5 text-sm focus:border-[#CAFF00] transition-colors placeholder:text-[#444]";

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex flex-col px-4 py-8">
      {/* Logo */}
      <div className="flex justify-center mb-8">
        <Logo size={26} />
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              i < step ? "bg-[#CAFF00] text-black" :
              i === step ? "bg-[#CAFF00] text-black neon-glow" :
              "bg-[#1a1a1a] border border-[#2a2a2a] text-[#555]"
            }`}>
              {i < step ? "✓" : i + 1}
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-8 h-0.5 rounded ${i < step ? "bg-[#CAFF00]" : "bg-[#222]"}`}/>
            )}
          </div>
        ))}
      </div>

      <div className="flex-1 flex flex-col max-w-md mx-auto w-full">
        <div className="bg-[#111] border border-[#222] rounded-3xl p-6 flex-1">

          {/* STEP 0 */}
          {step === 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-1">Hola, ¿cómo te llamas?</h2>
              <p className="text-[#555] text-sm mb-6">Vamos a personalizar tu experiencia</p>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-xs text-[#666] mb-2 block font-medium uppercase tracking-wider">Tu nombre</label>
                  <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="Fran" className={inputClass} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-[#666] mb-2 block font-medium uppercase tracking-wider">Edad</label>
                    <input type="number" value={form.age} onChange={e => set("age", e.target.value)} placeholder="30" min={10} max={90} className={inputClass} />
                  </div>
                  <div>
                    <label className="text-xs text-[#666] mb-2 block font-medium uppercase tracking-wider">Sexo</label>
                    <select value={form.sex} onChange={e => set("sex", e.target.value)} className={inputClass}>
                      <option value="male">Hombre</option>
                      <option value="female">Mujer</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-[#666] mb-2 block font-medium uppercase tracking-wider">Peso (kg)</label>
                    <input type="number" value={form.weight} onChange={e => set("weight", e.target.value)} placeholder="75" className={inputClass} />
                  </div>
                  <div>
                    <label className="text-xs text-[#666] mb-2 block font-medium uppercase tracking-wider">Altura (cm)</label>
                    <input type="number" value={form.height} onChange={e => set("height", e.target.value)} placeholder="175" className={inputClass} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 1 */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold mb-1">¿Cuál es tu nivel?</h2>
              <p className="text-[#555] text-sm mb-6">Sé honesto — así el plan se adapta mejor a ti</p>
              <div className="flex flex-col gap-3">
                {levels.map(l => (
                  <button key={l.value} onClick={() => set("level", l.value)}
                    className={`flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${
                      form.level === l.value ? "border-[#CAFF00] bg-[#CAFF00]/10" : "border-[#222] bg-[#1a1a1a] hover:border-[#333]"
                    }`}>
                    <span className="text-3xl">{l.emoji}</span>
                    <div className="flex-1">
                      <div className="font-bold">{l.title}</div>
                      <div className="text-xs text-[#555] mt-0.5">{l.desc}</div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      form.level === l.value ? "border-[#CAFF00] bg-[#CAFF00]" : "border-[#333]"
                    }`}>
                      {form.level === l.value && <span className="text-black text-xs font-bold">✓</span>}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold mb-1">¿Cuál es tu objetivo?</h2>
              <p className="text-[#555] text-sm mb-6">Tu plan de 12 semanas se adaptará a esto</p>
              <div className="flex flex-col gap-3">
                {goals.map(g => (
                  <button key={g.value} onClick={() => set("goal", g.value)}
                    className={`flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${
                      form.goal === g.value ? "border-[#CAFF00] bg-[#CAFF00]/10" : "border-[#222] bg-[#1a1a1a] hover:border-[#333]"
                    }`}>
                    <span className="text-3xl">{g.emoji}</span>
                    <div className="flex-1">
                      <div className="font-bold">{g.title}</div>
                      <div className="text-xs text-[#555] mt-0.5">{g.desc}</div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      form.goal === g.value ? "border-[#CAFF00] bg-[#CAFF00]" : "border-[#333]"
                    }`}>
                      {form.goal === g.value && <span className="text-black text-xs font-bold">✓</span>}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold mb-1">¿Cuántos días puedes?</h2>
              <p className="text-[#555] text-sm mb-6">Deja siempre al menos un día de descanso entre sesiones</p>
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[2, 3, 4].map(d => (
                  <button key={d} onClick={() => set("days_per_week", d)}
                    className={`flex flex-col items-center py-6 rounded-2xl border transition-all ${
                      form.days_per_week === d ? "border-[#CAFF00] bg-[#CAFF00]/10 neon-glow" : "border-[#222] bg-[#1a1a1a] hover:border-[#333]"
                    }`}>
                    <span className={`text-3xl font-black ${form.days_per_week === d ? "text-[#CAFF00]" : "text-white"}`}>{d}</span>
                    <span className="text-xs text-[#555] mt-1">días/semana</span>
                  </button>
                ))}
              </div>

              <div className={`rounded-2xl p-4 text-sm border ${
                form.days_per_week === 2 ? "bg-blue-500/10 border-blue-500/20 text-blue-300" :
                form.days_per_week === 3 ? "bg-[#CAFF00]/10 border-[#CAFF00]/20 text-[#CAFF00]" :
                "bg-orange-500/10 border-orange-500/20 text-orange-300"
              }`}>
                {form.days_per_week === 2 && "💡 2 días es perfecto para empezar sin sobrecargar el cuerpo."}
                {form.days_per_week === 3 && "✅ 3 días es el estándar recomendado para progresar de forma segura."}
                {form.days_per_week === 4 && "🔥 4 días da progreso rápido — asegúrate de descansar y dormir bien."}
              </div>

              {/* Plan preview */}
              <div className="mt-5 bg-[#1a1a1a] rounded-2xl p-4 border border-[#222]">
                <p className="text-xs text-[#555] uppercase tracking-wider font-medium mb-3">Tu plan incluirá</p>
                <div className="flex flex-col gap-2">
                  {[
                    { icon: "📋", text: "12 semanas de entrenamiento progresivo" },
                    { icon: "🎯", text: "Sesiones adaptadas a tu nivel y objetivo" },
                    { icon: "📊", text: "Seguimiento de km, ritmo y frecuencia cardíaca" },
                    { icon: "⚡", text: "Consejos específicos para cada entrenamiento" },
                  ].map(i => (
                    <div key={i.text} className="flex items-center gap-3 text-sm text-[#888]">
                      <span>{i.icon}</span> {i.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-3 mt-4">
          {step > 0 && (
            <button onClick={back}
              className="flex-1 bg-[#111] border border-[#222] text-[#666] font-semibold py-4 rounded-2xl hover:bg-[#1a1a1a] transition-colors">
              ← Atrás
            </button>
          )}
          {step < 3 ? (
            <button onClick={next} disabled={!canNext()}
              className="flex-1 bg-[#CAFF00] hover:bg-[#b8e600] disabled:opacity-30 text-black font-bold py-4 rounded-2xl transition-all active:scale-95 neon-glow">
              Continuar →
            </button>
          ) : (
            <button onClick={submit} disabled={loading}
              className="flex-1 bg-[#CAFF00] hover:bg-[#b8e600] disabled:opacity-50 text-black font-bold py-4 rounded-2xl transition-all active:scale-95 neon-glow">
              {loading ? "Creando tu plan..." : "🚀 Empezar mi plan"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
