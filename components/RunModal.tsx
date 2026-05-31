"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import type { Run, RunType } from "@/lib/types";

const typeOptions: { value: RunType; label: string }[] = [
  { value: "easy", label: "Easy run" },
  { value: "tempo", label: "Tempo run" },
  { value: "interval", label: "Intervalos" },
  { value: "fartlek", label: "Fartlek" },
  { value: "long", label: "Tirada larga" },
  { value: "recovery", label: "Recuperación" },
];

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  editRun?: Run | null;
  userId: string;
}

export default function RunModal({ open, onClose, onSaved, editRun, userId }: Props) {
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    type: "easy" as RunType,
    distance: "",
    duration: "",
    hr_avg: "",
    hr_max: "",
    elevation: "",
    cadence: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editRun) {
      setForm({
        date: editRun.date,
        type: editRun.type,
        distance: String(editRun.distance),
        duration: String(editRun.duration),
        hr_avg: editRun.hr_avg ? String(editRun.hr_avg) : "",
        hr_max: editRun.hr_max ? String(editRun.hr_max) : "",
        elevation: editRun.elevation ? String(editRun.elevation) : "",
        cadence: editRun.cadence ? String(editRun.cadence) : "",
        notes: editRun.notes || "",
      });
    } else {
      setForm(f => ({ ...f, date: new Date().toISOString().split("T")[0] }));
    }
  }, [editRun, open]);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const pace = () => {
    const d = parseFloat(form.distance);
    const t = parseFloat(form.duration);
    if (!d || !t) return null;
    const p = t / d;
    const min = Math.floor(p);
    const sec = Math.round((p - min) * 60);
    return `${min}:${sec.toString().padStart(2, "0")} min/km`;
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();

    const run = {
      user_id: userId,
      date: form.date,
      type: form.type,
      distance: parseFloat(form.distance),
      duration: parseInt(form.duration),
      hr_avg: form.hr_avg ? parseInt(form.hr_avg) : null,
      hr_max: form.hr_max ? parseInt(form.hr_max) : null,
      elevation: form.elevation ? parseInt(form.elevation) : null,
      cadence: form.cadence ? parseInt(form.cadence) : null,
      notes: form.notes || null,
    };

    if (editRun) {
      await supabase.from("runs").update(run).eq("id", editRun.id);
    } else {
      await supabase.from("runs").insert(run);
    }

    setLoading(false);
    onSaved();
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-[#141420] border border-[#2a2a42] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#2a2a42]">
          <h2 className="text-lg font-bold">{editRun ? "Editar carrera" : "Nueva carrera"}</h2>
          <button onClick={onClose} className="text-[#8b90b0] hover:text-white text-xl">✕</button>
        </div>

        <form onSubmit={save} className="p-6 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[#8b90b0] mb-1.5 block">Fecha</label>
              <input type="date" value={form.date} onChange={e => set("date", e.target.value)} required
                className="w-full bg-[#1e1e30] border border-[#2a2a42] rounded-xl px-3 py-2.5 text-sm focus:border-[#FF4D00] transition-colors" />
            </div>
            <div>
              <label className="text-xs text-[#8b90b0] mb-1.5 block">Tipo</label>
              <select value={form.type} onChange={e => set("type", e.target.value)} required
                className="w-full bg-[#1e1e30] border border-[#2a2a42] rounded-xl px-3 py-2.5 text-sm focus:border-[#FF4D00] transition-colors">
                {typeOptions.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-[#8b90b0] mb-1.5 block">Distancia (km)</label>
              <input type="number" step="0.01" min="0" value={form.distance} onChange={e => set("distance", e.target.value)}
                placeholder="10.5" required
                className="w-full bg-[#1e1e30] border border-[#2a2a42] rounded-xl px-3 py-2.5 text-sm focus:border-[#FF4D00] transition-colors" />
            </div>
            <div>
              <label className="text-xs text-[#8b90b0] mb-1.5 block">Duración (min)</label>
              <input type="number" min="0" value={form.duration} onChange={e => set("duration", e.target.value)}
                placeholder="55" required
                className="w-full bg-[#1e1e30] border border-[#2a2a42] rounded-xl px-3 py-2.5 text-sm focus:border-[#FF4D00] transition-colors" />
            </div>
          </div>

          {pace() && (
            <div className="bg-[#FF4D00]/10 border border-[#FF4D00]/30 rounded-xl px-4 py-2.5 text-sm text-center">
              🏃 Ritmo calculado: <span className="font-bold text-[#FF4D00]">{pace()}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[#8b90b0] mb-1.5 block">FC media (ppm)</label>
              <input type="number" value={form.hr_avg} onChange={e => set("hr_avg", e.target.value)} placeholder="145"
                className="w-full bg-[#1e1e30] border border-[#2a2a42] rounded-xl px-3 py-2.5 text-sm focus:border-[#FF4D00] transition-colors" />
            </div>
            <div>
              <label className="text-xs text-[#8b90b0] mb-1.5 block">FC máxima (ppm)</label>
              <input type="number" value={form.hr_max} onChange={e => set("hr_max", e.target.value)} placeholder="175"
                className="w-full bg-[#1e1e30] border border-[#2a2a42] rounded-xl px-3 py-2.5 text-sm focus:border-[#FF4D00] transition-colors" />
            </div>
            <div>
              <label className="text-xs text-[#8b90b0] mb-1.5 block">Desnivel (m)</label>
              <input type="number" value={form.elevation} onChange={e => set("elevation", e.target.value)} placeholder="120"
                className="w-full bg-[#1e1e30] border border-[#2a2a42] rounded-xl px-3 py-2.5 text-sm focus:border-[#FF4D00] transition-colors" />
            </div>
            <div>
              <label className="text-xs text-[#8b90b0] mb-1.5 block">Cadencia (ppm)</label>
              <input type="number" value={form.cadence} onChange={e => set("cadence", e.target.value)} placeholder="172"
                className="w-full bg-[#1e1e30] border border-[#2a2a42] rounded-xl px-3 py-2.5 text-sm focus:border-[#FF4D00] transition-colors" />
            </div>
          </div>

          <div>
            <label className="text-xs text-[#8b90b0] mb-1.5 block">Notas</label>
            <textarea value={form.notes} onChange={e => set("notes", e.target.value)} rows={3}
              placeholder="Sensaciones, condiciones, observaciones..."
              className="w-full bg-[#1e1e30] border border-[#2a2a42] rounded-xl px-3 py-2.5 text-sm focus:border-[#FF4D00] transition-colors resize-none" />
          </div>

          <div className="flex gap-3 mt-2">
            <button type="button" onClick={onClose}
              className="flex-1 bg-[#1e1e30] border border-[#2a2a42] text-[#8b90b0] py-3 rounded-xl text-sm font-medium hover:bg-[#2a2a42] transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-[#FF4D00] hover:bg-[#cc3d00] disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm transition-colors">
              {loading ? "Guardando..." : "Guardar carrera"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
