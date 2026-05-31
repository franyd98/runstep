import type { Profile, TrainingWeek, TrainingSession, RunType } from "./types";

// Generates a 12-week training plan based on user profile
export function generatePlan(profile: Profile): TrainingWeek[] {
  const { level, goal, days_per_week } = profile;

  // Base weekly structures per level
  const templates: Record<string, { type: RunType; distMult: number; desc: string }[][]> = {
    beginner: [
      // Week 1-3: walk/run intervals
      [
        { type: "easy", distMult: 0.6, desc: "Caminar 5 min + alternar 1 min corriendo / 2 min caminando × 8" },
        { type: "recovery", distMult: 0.4, desc: "Caminata suave 20 min" },
        { type: "easy", distMult: 0.7, desc: "Alternar 2 min corriendo / 2 min caminando × 6" },
      ],
      // Week 4-6
      [
        { type: "easy", distMult: 0.8, desc: "Alternar 3 min corriendo / 1 min caminando × 6" },
        { type: "recovery", distMult: 0.5, desc: "Caminata activa 25 min" },
        { type: "easy", distMult: 1.0, desc: "Correr 10 min continuo + 2 min caminando × 2" },
      ],
      // Week 7-9
      [
        { type: "easy", distMult: 1.1, desc: "Correr 15 min continuo" },
        { type: "tempo", distMult: 0.7, desc: "5 min calentamiento + 8 min ritmo medio + 5 min vuelta calma" },
        { type: "long", distMult: 1.3, desc: "Tirada suave 20 min" },
      ],
      // Week 10-12
      [
        { type: "easy", distMult: 1.2, desc: "Carrera fácil 20 min" },
        { type: "tempo", distMult: 0.9, desc: "10 min calentamiento + 12 min ritmo umbral + 8 min vuelta calma" },
        { type: "long", distMult: 1.6, desc: "Tirada larga suave 28-30 min" },
      ],
    ],
    intermediate: [
      [
        { type: "easy", distMult: 1.0, desc: "Carrera fácil conversacional" },
        { type: "tempo", distMult: 0.8, desc: "Tempo run 25 min" },
        { type: "easy", distMult: 1.0, desc: "Rodaje suave" },
        { type: "long", distMult: 1.5, desc: "Tirada larga" },
      ],
      [
        { type: "easy", distMult: 1.1, desc: "Carrera fácil" },
        { type: "interval", distMult: 0.7, desc: "6 × 400m con 90s descanso" },
        { type: "easy", distMult: 1.0, desc: "Recuperación activa" },
        { type: "long", distMult: 1.8, desc: "Tirada larga progresiva" },
      ],
      [
        { type: "easy", distMult: 1.2, desc: "Rodaje base" },
        { type: "fartlek", distMult: 0.9, desc: "Fartlek 30 min" },
        { type: "tempo", distMult: 1.0, desc: "Tempo run 30 min" },
        { type: "long", distMult: 2.0, desc: "Tirada larga 90 min" },
      ],
      [
        { type: "easy", distMult: 1.3, desc: "Rodaje fácil" },
        { type: "interval", distMult: 0.8, desc: "8 × 400m con 90s descanso" },
        { type: "tempo", distMult: 1.1, desc: "Tempo progresivo" },
        { type: "long", distMult: 2.2, desc: "Tirada larga 100 min" },
      ],
    ],
    advanced: [
      [
        { type: "easy", distMult: 1.5, desc: "Rodaje suave 50 min" },
        { type: "interval", distMult: 1.0, desc: "10 × 400m al 90% FC máx" },
        { type: "tempo", distMult: 1.2, desc: "Tempo run 40 min" },
        { type: "easy", distMult: 1.3, desc: "Rodaje regenerativo" },
        { type: "long", distMult: 2.5, desc: "Tirada larga 110 min" },
      ],
    ],
  };

  // Base distance km
  const baseDist: Record<string, number> = {
    beginner: 3,
    intermediate: 6,
    advanced: 10,
  };

  const base = baseDist[level] || 3;
  const tmpl = templates[level] || templates.beginner;

  const weeks: TrainingWeek[] = [];

  for (let w = 0; w < 12; w++) {
    const phaseIdx = Math.floor(w / 3);
    const phase = tmpl[Math.min(phaseIdx, tmpl.length - 1)];
    const progression = 1 + w * 0.07; // 7% weekly increase
    const weekDays = ["Lunes", "Miércoles", "Viernes", "Domingo"];

    const sessions: TrainingSession[] = phase.slice(0, days_per_week).map((s, i) => ({
      day: weekDays[i] || `Día ${i + 1}`,
      type: s.type,
      description: s.desc,
      target_distance: parseFloat((base * s.distMult * progression).toFixed(1)),
      target_duration: Math.round(base * s.distMult * progression * (goal === "weight_loss" ? 7 : 6)),
    }));

    weeks.push({ week: w + 1, sessions });
  }

  return weeks;
}

export const goalLabels: Record<string, string> = {
  weight_loss: "Perder peso",
  complete_5k: "Completar 5K",
  habit: "Crear hábito",
  race: "Prepararme para una carrera",
};

export const levelLabels: Record<string, string> = {
  beginner: "Principiante",
  intermediate: "Intermedio",
  advanced: "Avanzado",
};
