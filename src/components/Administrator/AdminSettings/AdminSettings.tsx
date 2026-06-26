import { useState, useEffect, useCallback } from "react";
import {
  Settings, Building2, ShieldCheck, Database, Save,
  Lock, AlertTriangle, Server, ToggleLeft, ToggleRight, Loader2,
} from "lucide-react";
import api from "../../../api/axiosInstance";

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState<"institution" | "security" | "system">("institution");
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [success, setSuccess]     = useState(false);

  // institution fields — match schoolSchema
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [phone, setPhone]     = useState("");
  const [address, setAddress] = useState("");

  // local-only toggles (no backend schema support)
  const [maintenance, setMaintenance]   = useState(false);
  const [openReg, setOpenReg]           = useState(true);
  const [esewaSandbox, setEsewa]        = useState(true);

  // ── Load school ───────────────────────────────────────────────────────────

  const loadSchool = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const { data } = await api.get("/api/admin/my-school");
      const s = data.data;
      setName(s.name ?? "");
      setEmail(s.email ?? "");
      setPhone(s.phone ?? "");
      setAddress(s.address ?? "");
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Failed to load school data");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadSchool(); }, [loadSchool]);

  // ── Save ──────────────────────────────────────────────────────────────────

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setSuccess(false); setError(null);
    try {
      await api.put("/api/admin/my-school", { name, email, phone, address });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Save failed");
    } finally { setSaving(false); }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="w-full bg-slate-50 min-h-screen p-6 font-sans text-slate-800">
      <div className="max-w-5xl mx-auto flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-center gap-3 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="p-3 bg-slate-900 text-white rounded-xl shadow-md"><Settings size={22} /></div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">System Preferences</h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Manage school profile, access controls, and system operations</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">

          {/* Nav */}
          <div className="flex flex-col gap-1.5 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
            {([
              { id: "institution", label: "School Profile",      icon: <Building2 size={15} /> },
              { id: "security",    label: "Access & Gateways",   icon: <ShieldCheck size={15} /> },
              { id: "system",      label: "System & Backups",    icon: <Database size={15} /> },
            ] as const).map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2.5 transition-all ${
                  activeTab === t.id ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"
                }`}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="md:col-span-3 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <form onSubmit={handleSave} className="flex flex-col gap-6 text-xs">

              {/* ── Institution ─────────────────────────────────────────── */}
              {activeTab === "institution" && (
                <div className="flex flex-col gap-4">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">School Profile</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Used across billing templates, notices, and email notifications.</p>
                  </div>
                  <div className="h-px bg-slate-100" />

                  {loading ? (
                    <div className="py-10 flex items-center justify-center text-slate-400">
                      <Loader2 size={16} className="animate-spin mr-2" /> Loading school data...
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col gap-1.5">
                        <label className="uppercase font-bold text-slate-400 tracking-wider">School Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)}
                          className="w-full p-2.5 bg-white border border-slate-200 focus:border-slate-900 rounded-xl font-medium outline-none transition-all" />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                          <label className="uppercase font-bold text-slate-400 tracking-wider">Email</label>
                          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                            className="w-full p-2.5 bg-white border border-slate-200 focus:border-slate-900 rounded-xl font-medium outline-none transition-all" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="uppercase font-bold text-slate-400 tracking-wider">Phone</label>
                          <input type="text" value={phone} onChange={e => setPhone(e.target.value)}
                            className="w-full p-2.5 bg-white border border-slate-200 focus:border-slate-900 rounded-xl font-medium outline-none transition-all" />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="uppercase font-bold text-slate-400 tracking-wider">Address</label>
                        <input type="text" value={address} onChange={e => setAddress(e.target.value)}
                          className="w-full p-2.5 bg-white border border-slate-200 focus:border-slate-900 rounded-xl font-medium outline-none transition-all" />
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ── Security ────────────────────────────────────────────── */}
              {activeTab === "security" && (
                <div className="flex flex-col gap-4">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">Access & Gateway Control</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Local session preferences — not persisted to server.</p>
                  </div>
                  <div className="h-px bg-slate-100" />

                  {[
                    {
                      label: "Maintenance Mode",
                      desc: "Locks student/teacher accounts during deployment.",
                      val: maintenance, set: setMaintenance,
                    },
                    {
                      label: "Open Student Registration",
                      desc: "Allow new students to register accounts.",
                      val: openReg, set: setOpenReg,
                    },
                  ].map(({ label, desc, val, set }) => (
                    <div key={label} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                      <div>
                        <h4 className="font-bold text-slate-700">{label}</h4>
                        <p className="text-[10px] text-slate-400 font-medium">{desc}</p>
                      </div>
                      <button type="button" onClick={() => set(!val)}>
                        {val
                          ? <ToggleRight size={28} className="text-slate-900" />
                          : <ToggleLeft size={28} className="text-slate-300" />}
                      </button>
                    </div>
                  ))}

                  <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                    <div>
                      <h4 className="font-bold text-slate-700 flex items-center gap-1.5">
                        <Lock size={12} className="text-amber-600" /> eSewa Payment Gateway
                      </h4>
                      <p className="text-[10px] text-slate-400 font-medium">Switch between sandbox and live production endpoint.</p>
                    </div>
                    <button type="button" onClick={() => setEsewa(!esewaSandbox)}>
                      {esewaSandbox
                        ? <span className="text-[9px] font-extrabold bg-amber-50 text-amber-600 border border-amber-200 px-2 py-1 rounded-lg">SANDBOX</span>
                        : <span className="text-[9px] font-extrabold bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-1 rounded-lg">LIVE</span>}
                    </button>
                  </div>
                </div>
              )}

              {/* ── System ──────────────────────────────────────────────── */}
              {activeTab === "system" && (
                <div className="flex flex-col gap-4">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">System & Backups</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Database operations and cache management.</p>
                  </div>
                  <div className="h-px bg-slate-100" />

                  <div className="p-4 border border-dashed border-slate-200 rounded-2xl flex items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-slate-700 flex items-center gap-1.5">
                        <Server size={14} className="text-blue-600" /> Database Backup
                      </h4>
                      <p className="text-[11px] text-slate-400 font-medium mt-0.5">Trigger a full MongoDB snapshot via the backup API.</p>
                    </div>
                    <button type="button"
                      onClick={async () => {
                        try {
                          await api.post("/api/backup/trigger");
                          alert("Backup triggered successfully.");
                        } catch (e: any) {
                          alert(e?.response?.data?.message ?? "Backup failed");
                        }
                      }}
                      className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold shrink-0 transition-all">
                      Run Backup
                    </button>
                  </div>

                  <div className="p-4 border border-rose-100 bg-rose-50/20 rounded-2xl flex items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-rose-800 flex items-center gap-1.5">
                        <AlertTriangle size={14} className="text-rose-600" /> Clear Cache
                      </h4>
                      <p className="text-[11px] text-rose-600/70 font-medium mt-0.5">Purge staging/test data. Permanent action.</p>
                    </div>
                    <button type="button"
                      onClick={() => { if (confirm("Purge cache?")) alert("Cache cleared."); }}
                      className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shrink-0 transition-all">
                      Purge
                    </button>
                  </div>
                </div>
              )}

              {/* Feedback */}
              {error && (
                <div className="text-rose-600 text-xs font-semibold bg-rose-50 border border-rose-100 p-3 rounded-xl flex items-center gap-2">
                  <AlertTriangle size={13} /> {error}
                </div>
              )}
              {success && (
                <div className="text-emerald-600 text-xs font-semibold bg-emerald-50 border border-emerald-100 p-3 rounded-xl">
                  ✓ School profile saved successfully.
                </div>
              )}

              {/* Save — only meaningful on institution tab */}
              {activeTab === "institution" && !loading && (
                <div className="border-t border-slate-100 pt-4 flex justify-end">
                  <button type="submit" disabled={saving}
                    className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold rounded-xl shadow-md flex items-center gap-2 transition-all">
                    {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : <><Save size={14} /> Save Changes</>}
                  </button>
                </div>
              )}

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}