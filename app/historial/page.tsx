"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import AppShell from "@/components/AppShell";
import RunModal from "@/components/RunModal";
import type { Run } from "@/lib/types";

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

export default function HistorialPage() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [runs, setRuns] = useState<Run[]>([]);
  const [filtered, setFiltered] = useState<Run[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editRun, setEditRun] = useState<Run | null>(null);

  const load = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.replace("/auth"); return; }
    setUserId(user.id);
    const { data } = await supabase.from("runs").select("*").eq("user_id", user.id).order("date", { ascending: false });
    setRuns(data || []);
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    let f = runs;
    if (typeFilter !== "all") f = f.filter(r => r.type === typeFilter);
    if (search) {
      const q = search.toLowerCase();
      f = f.filter(r =>
        r.date.includes(q) ||
        (typeLabels[r.type] || "").toLowerCase().includes(q) ||
        (r.notes || "").toLowerCase().includes(q)
      );
    }
    setFiltered(f);
  }, [runs, search, typeFilter]);

  const deleteRun = async (id: string) => {
    if (!confirm("¿Eliminar esta carrera?")) return;
    const supabase = createClient();
    await supabase.from("runs").delete().eq("id", id);
    load();
  };

  const openEdit = (run: Run) => { setEditRun(run); setModalOpen(true); };

  return (
    <AppShell>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Historial</h1>
            <p className="text-[#8b90b0] text-sm mt-1">{runs.length} carrera{runs.length !== 1 ? "s" : ""} registradas</p>
          </div>
          <button
            onClick={() => { setEditRun(null); setModalOpen(true); }}
            className="bg-[#CAFF00] hover:bg-[#b8e600] text-black font-bold px-5 py-2.5 rounded-2xl text-sm transition-colors neon-glow"
          >
            + Nueva carrera
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-5 flex-wrap">
          <input
            type="search"
            placeholder="🔍 Buscar..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-[#141420] border border-[#2a2a42] rounded-xl px-4 py-2 text-sm focus:border-[#CAFF00] transition-colors w-52"
          />
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="bg-[#141420] border border-[#2a2a42] rounded-xl px-4 py-2 text-sm focus:border-[#CAFF00] transition-colors"
          >
            <option value="all">Todos los tipos</option>
            {Object.entries(typeLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-[#8b90b0]">
            <div className="text-5xl mb-4">🏃</div>
            <p>{runs.length === 0 ? "Aún no has registrado ninguna carrera." : "No hay resultados para este filtro."}</p>
          </div>
        ) : (
          <div className="bg-[#141420] border border-[#2a2a42] rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-[#1e1e30]">
                  {["Fecha", "Tipo", "Distancia", "Tiempo", "Ritmo", "FC Media", "FC Máx", "Desnivel", "Cadencia", ""].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs text-[#8b90b0] uppercase tracking-wide font-semibold border-b border-[#2a2a42]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(run => (
                  <tr key={run.id} className="hover:bg-[#1e1e30] transition-colors border-b border-[#2a2a42] last:border-0">
                    <td className="px-4 py-3 text-sm">{run.date}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${typeColors[run.type]}`}>
                        {typeLabels[run.type]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">{run.distance} km</td>
                    <td className="px-4 py-3 text-sm">{run.duration} min</td>
                    <td className="px-4 py-3 text-sm font-medium text-[#CAFF00]">{pace(run.distance, run.duration)} /km</td>
                    <td className="px-4 py-3 text-sm">{run.hr_avg ? `${run.hr_avg} ppm` : "—"}</td>
                    <td className="px-4 py-3 text-sm">{run.hr_max ? `${run.hr_max} ppm` : "—"}</td>
                    <td className="px-4 py-3 text-sm">{run.elevation ? `${run.elevation} m` : "—"}</td>
                    <td className="px-4 py-3 text-sm">{run.cadence ? `${run.cadence} ppm` : "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(run)} className="p-1.5 text-[#8b90b0] hover:text-white rounded-lg hover:bg-[#2a2a42] transition-all">✏️</button>
                        <button onClick={() => deleteRun(run.id)} className="p-1.5 text-[#8b90b0] hover:text-red-400 rounded-lg hover:bg-red-400/10 transition-all">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <RunModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditRun(null); }}
        onSaved={load}
        editRun={editRun}
        userId={userId}
      />
    </AppShell>
  );
}
