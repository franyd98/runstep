"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import AppShell from "@/components/AppShell";
import type { Run } from "@/lib/types";
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler,
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);

const chartOpts = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { color: "rgba(255,255,255,0.05)" }, ticks: { color: "#8b90b0", font: { size: 11 } } },
    y: { grid: { color: "rgba(255,255,255,0.05)" }, ticks: { color: "#8b90b0", font: { size: 11 } } },
  },
} as const;

const typeLabels: Record<string, string> = {
  easy: "Easy", tempo: "Tempo", interval: "Intervalos",
  fartlek: "Fartlek", long: "Largo", recovery: "Recuper.",
};
const typeColorMap: Record<string, string> = {
  easy: "#4ade80", tempo: "#a78bfa", interval: "#f87171",
  fartlek: "#38bdf8", long: "#fb923c", recovery: "#2dd4bf",
};

function pace(dist: number, time: number) {
  const p = time / dist;
  return parseFloat(p.toFixed(2));
}

export default function ProgresoPage() {
  const router = useRouter();
  const [runs, setRuns] = useState<Run[]>([]);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/auth"); return; }
      const { data } = await supabase.from("runs").select("*").eq("user_id", user.id).order("date");
      setRuns(data || []);
    };
    load();
  }, []);

  if (runs.length === 0) return (
    <AppShell>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Progreso</h1>
        <div className="flex flex-col items-center justify-center py-24 text-[#8b90b0]">
          <div className="text-5xl mb-4">📈</div>
          <p>Registra carreras para ver tu progreso aquí.</p>
        </div>
      </div>
    </AppShell>
  );

  // Monthly distance
  const byMonth: Record<string, number> = {};
  runs.forEach(r => {
    const m = r.date.slice(0, 7);
    byMonth[m] = (byMonth[m] || 0) + r.distance;
  });
  const months = Object.keys(byMonth).sort();

  // Pace evolution (last 15 runs)
  const last15 = runs.slice(-15);

  // Type distribution
  const byType: Record<string, number> = {};
  runs.forEach(r => { byType[r.type] = (byType[r.type] || 0) + 1; });
  const typeKeys = Object.keys(byType);

  // HR Zones
  const hrRun = [...runs].reverse().find(r => r.hr_max);
  const maxHR = hrRun?.hr_max || 190;
  const zones = [
    { name: "Zona 1 — Recuperación activa", range: [50, 60], color: "#38bdf8" },
    { name: "Zona 2 — Base aeróbica", range: [60, 70], color: "#4ade80" },
    { name: "Zona 3 — Aeróbico", range: [70, 80], color: "#facc15" },
    { name: "Zona 4 — Umbral láctico", range: [80, 90], color: "#fb923c" },
    { name: "Zona 5 — Máximo esfuerzo", range: [90, 100], color: "#f43f5e" },
  ];

  // Stats
  const totalKm = runs.reduce((s, r) => s + r.distance, 0);
  const totalTime = runs.reduce((s, r) => s + r.duration, 0);
  const avgPace = totalTime / totalKm;
  const avgPaceStr = `${Math.floor(avgPace)}:${Math.round((avgPace % 1) * 60).toString().padStart(2, "0")}`;
  const longestRun = Math.max(...runs.map(r => r.distance));

  return (
    <AppShell>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-8">Progreso</h1>

        {/* Summary stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total km", value: `${totalKm.toFixed(0)} km` },
            { label: "Total tiempo", value: `${Math.floor(totalTime / 60)}h ${totalTime % 60}min` },
            { label: "Ritmo medio", value: `${avgPaceStr} /km` },
            { label: "Mayor tirada", value: `${longestRun} km` },
          ].map(s => (
            <div key={s.label} className="bg-[#141420] border border-[#2a2a42] rounded-2xl p-5">
              <div className="text-xs text-[#8b90b0] uppercase tracking-wide mb-2">{s.label}</div>
              <div className="text-2xl font-bold">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Charts grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly km */}
          <div className="bg-[#141420] border border-[#2a2a42] rounded-2xl p-5 lg:col-span-2">
            <div className="font-semibold mb-4">Distancia por mes (km)</div>
            <Bar
              data={{
                labels: months,
                datasets: [{
                  data: months.map(m => parseFloat(byMonth[m].toFixed(2))),
                  backgroundColor: "#FF4D0099",
                  borderColor: "#FF4D00",
                  borderWidth: 2,
                  borderRadius: 6,
                }],
              }}
              options={chartOpts}
            />
          </div>

          {/* Pace evolution */}
          <div className="bg-[#141420] border border-[#2a2a42] rounded-2xl p-5">
            <div className="font-semibold mb-4">Evolución del ritmo (min/km)</div>
            <Line
              data={{
                labels: last15.map(r => r.date.slice(5)),
                datasets: [{
                  data: last15.map(r => pace(r.distance, r.duration)),
                  borderColor: "#4ade80",
                  backgroundColor: "rgba(74,222,128,0.1)",
                  borderWidth: 2,
                  pointBackgroundColor: "#4ade80",
                  pointRadius: 4,
                  tension: 0.35,
                  fill: true,
                }],
              }}
              options={chartOpts}
            />
          </div>

          {/* Type distribution */}
          <div className="bg-[#141420] border border-[#2a2a42] rounded-2xl p-5">
            <div className="font-semibold mb-4">Distribución por tipo</div>
            <Doughnut
              data={{
                labels: typeKeys.map(t => typeLabels[t] || t),
                datasets: [{
                  data: typeKeys.map(t => byType[t]),
                  backgroundColor: typeKeys.map(t => typeColorMap[t] || "#888"),
                  borderWidth: 0,
                }],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: "bottom",
                    labels: { color: "#8b90b0", font: { size: 11 }, boxWidth: 12, padding: 12 },
                  },
                },
              }}
            />
          </div>

          {/* HR Zones */}
          <div className="bg-[#141420] border border-[#2a2a42] rounded-2xl p-5 lg:col-span-2">
            <div className="font-semibold mb-1">Zonas de frecuencia cardíaca</div>
            <p className="text-xs text-[#8b90b0] mb-4">Basadas en tu FC máxima registrada: {maxHR} ppm</p>
            <div className="flex flex-col gap-2">
              {zones.map(z => (
                <div key={z.name} className="flex items-center gap-4 py-3 border-b border-[#2a2a42] last:border-0">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: z.color }} />
                  <div className="flex-1 text-sm">{z.name}</div>
                  <div className="text-sm font-semibold" style={{ color: z.color }}>
                    {Math.round(maxHR * z.range[0] / 100)}–{Math.round(maxHR * z.range[1] / 100)} ppm
                  </div>
                  <div className="w-24 h-2 bg-[#1e1e30] rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ background: z.color, width: `${z.range[1] - z.range[0]}%`, marginLeft: `${z.range[0] - 50}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
