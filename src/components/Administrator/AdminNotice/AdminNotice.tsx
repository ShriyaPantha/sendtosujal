import { useState, useEffect, useCallback } from "react";
import {
  Megaphone, Search, SlidersHorizontal, Plus, Trash2,
  Calendar, Users, X, CheckCircle, Clock, Loader2, AlertTriangle,
} from "lucide-react";
import api from "../../../api/axiosInstance";

// ── Types ─────────────────────────────────────────────────────────────────────

interface NoticeRecord {
  _id: string;
  title: string;
  description: string;
  audience: "all" | "students" | "teachers" | "parents";
  isImportant: boolean;
  expiryDate: string | null;
  createdAt: string;
  createdBy?: { fullName: string; email: string };
}

const AUDIENCE_LABEL: Record<string, string> = {
  all: "All Members",
  students: "Students",
  teachers: "Teachers",
  parents: "Parents",
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminNotice() {
  const [notices, setNotices]           = useState<NoticeRecord[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [search, setSearch]             = useState("");
  const [audienceFilter, setAudFilter]  = useState("all-filter");
  const [viewing, setViewing]           = useState<NoticeRecord | null>(null);

  // modal
  const [showModal, setShowModal]       = useState(false);
  const [submitting, setSubmitting]     = useState(false);

  // form
  const [title, setTitle]               = useState("");
  const [description, setDesc]          = useState("");
  const [audience, setAudience]         = useState<"all" | "students" | "teachers" | "parents">("all");
  const [isImportant, setImportant]     = useState(false);
  const [expiryDate, setExpiry]         = useState("");

  // ── Loaders ──────────────────────────────────────────────────────────────

  const loadNotices = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const { data } = await api.get("/api/notices");
      setNotices(data.data ?? []);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Failed to load notices");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadNotices(); }, [loadNotices]);

  // ── Create ────────────────────────────────────────────────────────────────

  const handleCreate = async () => {
    if (!title || !description) return;
    setSubmitting(true);
    try {
      await api.post("/api/notices", {
        title,
        description,
        audience,
        isImportant,
        expiryDate: expiryDate || null,
      });
      resetModal();
      setShowModal(false);
      await loadNotices();
    } catch (e: any) {
      alert(e?.response?.data?.message ?? "Create failed");
    } finally { setSubmitting(false); }
  };

  // ── Delete ────────────────────────────────────────────────────────────────

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this notice?")) return;
    try {
      await api.delete(`/api/notices/${id}`);
      setViewing(null);
      await loadNotices();
    } catch (e: any) { alert(e?.response?.data?.message ?? "Delete failed"); }
  };

  const resetModal = () => {
    setTitle(""); setDesc(""); setAudience("all");
    setImportant(false); setExpiry("");
  };

  // ── Derived ───────────────────────────────────────────────────────────────

  const filtered = notices.filter(n => {
    const q = search.toLowerCase();
    const matchSearch = n.title.toLowerCase().includes(q) || n.description.toLowerCase().includes(q);
    const matchAud = audienceFilter === "all-filter" || n.audience === audienceFilter;
    return matchSearch && matchAud;
  });

  const isExpired = (n: NoticeRecord) =>
    n.expiryDate ? new Date(n.expiryDate) < new Date() : false;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="w-full bg-slate-50 min-h-screen p-6 font-sans text-slate-800">
      <div className="max-w-5xl mx-auto flex flex-col gap-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-600 text-white rounded-xl shadow-md"><Megaphone size={22} /></div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Notices & Communications</h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Publish notices — students, parents & teachers notified automatically</p>
            </div>
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all self-start sm:self-center">
            <Plus size={15} /> Compose Notice
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: <Megaphone size={18} />, color: "indigo",  label: "Total",    value: `${notices.length}` },
            { icon: <CheckCircle size={18} />, color: "emerald", label: "Active", value: `${notices.filter(n => !isExpired(n)).length}` },
            { icon: <AlertTriangle size={18} />, color: "rose", label: "Important", value: `${notices.filter(n => n.isImportant).length}` },
            { icon: <Users size={18} />, color: "purple", label: "Expired",       value: `${notices.filter(n => isExpired(n)).length}` },
          ].map(({ icon, color, label, value }) => (
            <div key={label} className="bg-white border border-slate-100 shadow-sm rounded-2xl p-4 flex items-center gap-3.5">
              <div className={`p-3 bg-${color}-50 text-${color}-600 rounded-xl shrink-0`}>{icon}</div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">{label}</span>
                <h4 className="text-base font-bold text-slate-800">{value}</h4>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-8 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input type="text" placeholder="Search notices..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-xs font-medium outline-none transition-all shadow-sm" />
          </div>
          <div className="md:col-span-4 relative">
            <select value={audienceFilter} onChange={e => setAudFilter(e.target.value)}
              className="w-full pl-4 pr-8 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl text-xs outline-none cursor-pointer shadow-sm appearance-none">
              <option value="all-filter">All Audiences</option>
              <option value="all">All Members</option>
              <option value="students">Students</option>
              <option value="teachers">Teachers</option>
              <option value="parents">Parents</option>
            </select>
            <SlidersHorizontal className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
          </div>
        </div>

        {/* Feed */}
        {loading ? (
          <div className="py-16 flex items-center justify-center text-slate-400 text-sm bg-white rounded-2xl border border-slate-100">
            <Loader2 size={18} className="animate-spin mr-2" /> Loading notices...
          </div>
        ) : error ? (
          <div className="py-12 text-center text-rose-500 text-sm font-semibold bg-white rounded-2xl border border-slate-100">
            {error}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map(notice => (
              <div key={notice._id} onClick={() => setViewing(notice)}
                className={`bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col md:flex-row md:items-start justify-between gap-4 group relative ${
                  notice.isImportant ? "border-rose-200 bg-rose-50/10" : "border-slate-100"
                } ${isExpired(notice) ? "opacity-60" : ""}`}>

                <div className="flex items-start gap-4 min-w-0">
                  <div className={`p-3 rounded-xl shrink-0 ${notice.isImportant ? "bg-rose-50 text-rose-600" : "bg-indigo-50 text-indigo-600"}`}>
                    <Megaphone size={18} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {notice.isImportant && (
                        <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 border border-rose-100">
                          ⚠️ Important
                        </span>
                      )}
                      <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600">
                        To: {AUDIENCE_LABEL[notice.audience]}
                      </span>
                      {isExpired(notice) && (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-400">Expired</span>
                      )}
                    </div>
                    <h3 className="font-bold text-slate-800 text-sm mt-2 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {notice.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-1 line-clamp-2 leading-relaxed">
                      {notice.description}
                    </p>
                    <div className="flex items-center gap-4 text-[10px] text-slate-400 font-semibold mt-3">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} /> {new Date(notice.createdAt).toLocaleDateString("en-NP")}
                      </span>
                      {notice.expiryDate && (
                        <span className="flex items-center gap-1">
                          <Clock size={12} /> Expires: {new Date(notice.expiryDate).toLocaleDateString("en-NP")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button onClick={e => handleDelete(notice._id, e)}
                  className="p-1.5 border border-slate-100 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all self-end md:self-start shrink-0">
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-16 bg-white border border-slate-100 rounded-2xl text-slate-400 font-medium text-xs">
                No notices found.
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Create Modal ───────────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between sticky top-0">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Megaphone size={15} className="text-indigo-600" /> Compose Notice
              </h3>
              <button onClick={() => { setShowModal(false); resetModal(); }} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>

            <div className="p-5 flex flex-col gap-4 text-xs">
              <div>
                <label className="block uppercase font-bold text-slate-400 tracking-wider mb-1.5">Title</label>
                <input type="text" placeholder="e.g., Mid-term Exam Schedule" value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 focus:border-indigo-500 rounded-xl font-medium outline-none transition-all" />
              </div>

              <div>
                <label className="block uppercase font-bold text-slate-400 tracking-wider mb-1.5">Description</label>
                <textarea rows={4} placeholder="Notice content..." value={description}
                  onChange={e => setDesc(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 focus:border-indigo-500 rounded-xl font-medium outline-none transition-all resize-none leading-relaxed" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase font-bold text-slate-400 tracking-wider mb-1.5">Audience</label>
                  <select value={audience} onChange={e => setAudience(e.target.value as any)}
                    className="w-full p-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl outline-none cursor-pointer">
                    <option value="all">All (Students + Teachers + Parents)</option>
                    <option value="students">Students Only</option>
                    <option value="teachers">Teachers Only</option>
                    <option value="parents">Parents Only</option>
                  </select>
                </div>
                <div>
                  <label className="block uppercase font-bold text-slate-400 tracking-wider mb-1.5">Expiry Date</label>
                  <input type="date" value={expiryDate} onChange={e => setExpiry(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 focus:border-indigo-500 rounded-xl font-medium outline-none transition-all" />
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <input type="checkbox" id="important" checked={isImportant}
                  onChange={e => setImportant(e.target.checked)}
                  className="w-4 h-4 text-rose-600 border-slate-300 rounded cursor-pointer" />
                <label htmlFor="important" className="font-bold text-slate-600 cursor-pointer">
                  Mark as Important — shown with ⚠️ alert badge
                </label>
              </div>

              <div className="text-[10px] text-slate-400 bg-slate-50 p-3 rounded-xl border border-slate-100">
                ✉️ Selected audience will receive in-app notification + email automatically after publishing.
              </div>

              <button onClick={handleCreate}
                disabled={submitting || !title || !description}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl font-bold shadow-md transition-all">
                {submitting ? "Publishing..." : "Publish & Notify"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── View Modal ─────────────────────────────────────────────────────── */}
      {viewing && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-xl w-full">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                {viewing.isImportant && (
                  <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-rose-50 text-rose-600">⚠️ Important</span>
                )}
                <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600">
                  {AUDIENCE_LABEL[viewing.audience]}
                </span>
              </div>
              <button onClick={() => setViewing(null)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <h2 className="text-base font-bold text-slate-800">{viewing.title}</h2>
              <p className="text-xs text-slate-600 font-medium leading-relaxed bg-slate-50 border border-slate-100 p-4 rounded-xl whitespace-pre-line">
                {viewing.description}
              </p>
              <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-400 font-semibold">
                <span>Published: <strong>{new Date(viewing.createdAt).toLocaleDateString("en-NP")}</strong></span>
                {viewing.expiryDate && (
                  <span>Expires: <strong>{new Date(viewing.expiryDate).toLocaleDateString("en-NP")}</strong></span>
                )}
                {viewing.createdBy && (
                  <span>By: <strong>{viewing.createdBy.fullName}</strong></span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}