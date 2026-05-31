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

const inputClass = "w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl px-3 py-3 text-sm focus:border-[#CAFF00] transition-colors placeholder:text-[#444]";

export default function RunModal({ open, onClose, onSaved, editRun, userId }: Props) {
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    type: "easy" as RunType,
    distance: "", duration: "", hr_avg: "", hr_max: "", elevation: "", cadence: "", notes: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editRun) {
      setForm({
        date: editRun.date, type: editRun.type,
        distance: String(editRun.distance), duration: String(editRun.duration),
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
    const d = parseFloat(form.distance), t = parseFloat(form.duration);
    if (!d || !t) return null;
    const p = t / d, min = Math.floor(p), sec = Math.round((p - min) * 60);
    return `${min}:${sec.toString().padStart(2, "0")} min/km`;
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const run = {
      user_id: userId, date: form.date, type: form.type,
      distance: parseFloat(form.distance), duration: parseInt(form.duration),
      hr_avg: form.hr_avg ? parseInt(form.hr_avg) : null,
      hr_max: form.hr_max ? parseInt(form.hr_max) : null,
      elevation: form.elevation ? parseInt(form.elevation) : null,
      cadence: form.cadence ? parseInt(form.cadence) : null,
      notes: form.notes || null,
    };
    if (editRun) await supabase.from("runs").update(run).eq("id", editRun.id);
    else await supabase.from("runs").insert(run);
    setLoading(false);
    onSaved();
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-[#111] border border-[#222] rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg max-h-[92vh] overflow-y-auto">

        {/* Handle bar (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-[#333] rounded-full"/>
        </div>

        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a1a1a]">
          <h2 className="text-lg font-black">{editRun ? "Editar carrera" : "Nueva carrera"}</h2>
          <button onClick={onClose} className="text-[#444] hover:text-white text-xl w-8 h-8 flex items-center justify-center rounded-xl hover:bg-[#1a1a1a] transition-all">✕</button>
        </div>

        <form onSubmit={save} className="p-5 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[#555] mb-1.5 block font-medium uppercase tracking-wider">Fecha</label>
              <input type="date" value={form.date} onChange={e => set("date", e.target.value)} required className={inputClass} />
            </div>
            <div>
              <label className="text-xs text-[#555] mb-1.5 block font-medium uppercase tracking-wider">Tipo</label>
              <select value={form.type} onChange={e => set("type", e.target.value)} required className={inputClass}>
                {typeOptions.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-[#555] mb-1.5 block font-medium uppercase tracking-wider">Distancia (km)</label>
              <input type="number" step="0.01" min="0" value={form.distance} onChange={e => set("distance", e.target.value)} placeholder="10.5" required className={inputClass} />
            </div>
            <div>
              <label className="text-xs text-[#555] mb-1.5 block font-medium uppercase tracking-wider">Duración (min)</label>
              <input type="number" min="0" value={form.duration} onChange={e => set("duration", e.target.value)} placeholder="55" required className={inputClass} />
            </div>
          </div>

          {pace() && (
            <div className="bg-[#CAFF00]/10 border border-[#CAFF00]/20 rounded-2xl px-4 py-3 text-sm text-center">
              🏃 Ritmo: <span className="font-black text-[#CAFF00]">{pace()}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "FC media (ppm)", key: "hr_avg", placeholder: "145" },
              { label: "FC máxima (ppm)", key: "hr_max", placeholder: "175" },
              { label: "Desnivel (m)", key: "elevation", placeholder: "120" },
              { label: "Cadencia (ppm)", key: "cadence", placeholder: "172" },
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs text-[#555] mb-1.5 block font-medium uppercase tracking-wider">{f.label}</label>
                <input type="number" value={form[f.key as keyof typeof form]} onChange={e => set(f.key, e.target.value)} placeholder={f.placeholder} className={inputClass} />
              </div>
            ))}
          </div>

          <div>
            <label className="text-xs text-[#555] mb-1.5 block font-medium uppercase tracking-wider">Notas</label>
            <textarea value={form.notes} onChange={e => set("notes", e.target.value)} rows={3}
              placeholder="Sensaciones, condiciones, observaciones..."
              className={`${inputClass} resize-none`} />
          </div>

          <div className="flex gap-3 mt-1">
            <button type="button" onClick={onClose}
              className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] text-[#555] py-3.5 rounded-2xl text-sm font-medium hover:bg-[#222] transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-[#CAFF00] hover:bg-[#b8e600] disabled:opacity-50 text-black font-black py-3.5 rounded-2xl text-sm transition-all neon-glow active:scale-95">
              {loading ? "Guardando..." : "Guardar carrera"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
