import { useState, useEffect, useCallback } from "react";
import {
  FileSpreadsheet, Calendar, Clock, Award, Search, SlidersHorizontal,
  Plus, ArrowLeft, FileText, CheckCircle, X, ChevronRight,
  BookOpen, Loader2, Trash2, AlertTriangle,
} from "lucide-react";
import api from "../../../api/axiosInstance";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Subject {
  name: string;
  fullMarks: number;
  passMarks: number;
  examDate: string;
  examTime: string;
  room: string;
}

interface ExamRecord {
  _id: string;
  title: string;
  className: string;
  section: string | null;
  subjects: Subject[];
  examDate: string;
  status: "upcoming" | "ongoing" | "completed" | "published";
  createdAt: string;
}

const STATUS_BADGE: Record<string, string> = {
  upcoming:  "bg-slate-100 text-slate-500 border-slate-200",
  ongoing:   "bg-amber-50 text-amber-600 border-amber-100",
  completed: "bg-blue-50 text-blue-600 border-blue-100",
  published: "bg-emerald-50 text-emerald-600 border-emerald-100",
};

const EMPTY_SUBJECT = (): Subject => ({
  name: "", fullMarks: 100, passMarks: 40,
  examDate: "", examTime: "", room: "",
});

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminExam() {
  const [exams, setExams]               = useState<ExamRecord[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [selected, setSelected]         = useState<ExamRecord | null>(null);
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // modal
  const [showModal, setShowModal]       = useState(false);
  const [submitting, setSubmitting]     = useState(false);

  // form fields
  const [title, setTitle]       = useState("");
  const [className, setClass]   = useState("");
  const [section, setSection]   = useState("");
  const [examDate, setExamDate] = useState("");
  const [subjects, setSubjects] = useState<Subject[]>([EMPTY_SUBJECT()]);

  // ── Loaders ──────────────────────────────────────────────────────────────

  const loadExams = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const { data } = await api.get("/api/exams");
      setExams(data.data ?? []);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Failed to load exams");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadExams(); }, [loadExams]);

  // ── Subject helpers ───────────────────────────────────────────────────────

  const updateSubject = (i: number, field: keyof Subject, val: string | number) => {
    setSubjects(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: val } : s));
  };

  const addSubject    = () => setSubjects(p => [...p, EMPTY_SUBJECT()]);
  const removeSubject = (i: number) => setSubjects(p => p.filter((_, idx) => idx !== i));

  // ── Create exam ───────────────────────────────────────────────────────────

  const handleCreate = async () => {
    if (!title || !className || !examDate || subjects.some(s => !s.name || !s.examDate)) return;
    setSubmitting(true);
    try {
      await api.post("/api/exams", {
        title,
        className,
        section: section || null,
        examDate,
        subjects: subjects.map(s => ({
          name: s.name,
          fullMarks: Number(s.fullMarks),
          passMarks: Number(s.passMarks),
          examDate: s.examDate,
          examTime: s.examTime || null,
          room: s.room || null,
        })),
      });
      resetModal();
      setShowModal(false);
      await loadExams();
    } catch (e: any) {
      alert(e?.response?.data?.message ?? "Create failed");
    } finally { setSubmitting(false); }
  };

  // ── Update status ─────────────────────────────────────────────────────────

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await api.put(`/api/exams/${id}`, { status });
      setExams(p => p.map(e => e._id === id ? { ...e, status: status as ExamRecord["status"] } : e));
      if (selected?._id === id) setSelected(s => s ? { ...s, status: status as ExamRecord["status"] } : s);
    } catch (e: any) { alert(e?.response?.data?.message ?? "Update failed"); }
  };

  // ── Delete exam ───────────────────────────────────────────────────────────

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this exam?")) return;
    try {
      await api.delete(`/api/exams/${id}`);
      setSelected(null);
      await loadExams();
    } catch (e: any) { alert(e?.response?.data?.message ?? "Delete failed"); }
  };

  const resetModal = () => {
    setTitle(""); setClass(""); setSection(""); setExamDate("");
    setSubjects([EMPTY_SUBJECT()]);
  };

  // ── Derived ───────────────────────────────────────────────────────────────

  const filtered = exams.filter(e => {
    const q = search.toLowerCase();
    return (
      (e.title.toLowerCase().includes(q) || e.className.toLowerCase().includes(q)) &&
      (statusFilter === "All" || e.status === statusFilter)
    );
  });


  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="w-full bg-slate-50 min-h-screen p-6 font-sans text-slate-800">

      {!selected ? (
        <div className="max-w-5xl mx-auto flex flex-col gap-6">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-600 text-white rounded-xl shadow-md"><FileSpreadsheet size={22} /></div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Examination Registry</h2>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Schedule exams — students, parents & staff notified automatically</p>
              </div>
            </div>
            <button onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all self-start sm:self-center">
              <Plus size={15} /> Schedule Exam
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: <FileText size={18} />, color: "blue",    label: "Total Exams",   value: `${exams.length}` },
              { icon: <Clock size={18} />,    color: "amber",   label: "Upcoming",      value: `${exams.filter(e => e.status === "upcoming").length}` },
              { icon: <Award size={18} />,    color: "purple",  label: "Ongoing",       value: `${exams.filter(e => e.status === "ongoing").length}` },
              { icon: <CheckCircle size={18} />, color: "emerald", label: "Published",  value: `${exams.filter(e => e.status === "published").length}` },
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
              <input type="text" placeholder="Search by title or class..."
                value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 focus:border-blue-500 rounded-xl text-xs font-medium outline-none transition-all shadow-sm" />
            </div>
            <div className="md:col-span-4 relative">
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                className="w-full pl-4 pr-8 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl text-xs outline-none cursor-pointer shadow-sm appearance-none">
                <option value="All">All Status</option>
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="published">Published</option>
              </select>
              <SlidersHorizontal className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {loading ? (
              <div className="py-16 flex items-center justify-center text-slate-400 text-sm">
                <Loader2 size={18} className="animate-spin mr-2" /> Loading exams...
              </div>
            ) : error ? (
              <div className="py-12 text-center text-rose-500 text-sm font-semibold flex items-center justify-center gap-2">
                <AlertTriangle size={16} /> {error}
              </div>
            ) : (
              <div className="w-full overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-175">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 text-xs uppercase tracking-wider">
                      <th className="py-3 px-5 font-medium">Exam</th>
                      <th className="py-3 font-medium">Class</th>
                      <th className="py-3 font-medium">Date</th>
                      <th className="py-3 font-medium">Subjects</th>
                      <th className="py-3 text-center font-medium">Status</th>
                      <th className="py-3 pr-5 text-right font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-xs">
                    {filtered.map(exam => (
                      <tr key={exam._id} onClick={() => setSelected(exam)}
                        className="hover:bg-slate-50/40 group cursor-pointer transition-colors">
                        <td className="py-3.5 px-5">
                          <div className="font-bold text-slate-700 group-hover:text-blue-600 transition-colors">{exam.title}</div>
                        </td>
                        <td className="py-3.5 font-semibold text-slate-600">
                          Class {exam.className}{exam.section ? `-${exam.section}` : ""}
                        </td>
                        <td className="py-3.5 text-slate-500">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={12} className="text-slate-400" />
                            {new Date(exam.examDate).toLocaleDateString("en-NP")}
                          </div>
                        </td>
                        <td className="py-3.5 text-slate-500">{exam.subjects.length} subject{exam.subjects.length !== 1 ? "s" : ""}</td>
                        <td className="py-3.5 text-center">
                          <span className={`font-bold px-2.5 py-0.5 rounded-full border text-[10px] capitalize ${STATUS_BADGE[exam.status]}`}>
                            {exam.status}
                          </span>
                        </td>
                        <td className="py-3.5 pr-5 text-right">
                          <span className="text-blue-600 font-bold group-hover:underline inline-flex items-center gap-0.5">
                            View <ChevronRight size={13} />
                          </span>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr><td colSpan={6} className="text-center py-12 text-slate-400 font-medium">No exams found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      ) : (
        /* ── Detail View ──────────────────────────────────────────────────── */
        <div className="max-w-5xl mx-auto flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <button onClick={() => setSelected(null)}
              className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-sm transition-all">
              <ArrowLeft size={14} /> Back
            </button>
            <button onClick={() => handleDelete(selected._id)}
              className="flex items-center gap-2 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 border border-rose-200 px-3.5 py-2 rounded-xl shadow-sm transition-all">
              <Trash2 size={14} /> Delete Exam
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col gap-6">

            {/* Title block */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <span className="text-[10px] text-blue-600 font-extrabold uppercase tracking-wider block">
                  Class {selected.className}{selected.section ? `-${selected.section}` : ""}
                </span>
                <h3 className="text-base font-bold text-slate-800 mt-0.5">{selected.title}</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Main date: {new Date(selected.examDate).toLocaleDateString("en-NP")}
                </p>
              </div>
              <span className={`font-bold px-3 py-1 rounded-full border text-xs capitalize self-start ${STATUS_BADGE[selected.status]}`}>
                {selected.status}
              </span>
            </div>

            {/* Status controls */}
            <div className="border border-dashed border-slate-200 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                  <Award size={15} className="text-purple-600" /> Update Status
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">Changing to "published" notifies students & parents with results.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {(["upcoming", "ongoing", "completed"] as const).map(s => (
                  <button key={s} onClick={() => handleStatusUpdate(selected._id, s)}
                    className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all capitalize ${selected.status === s ? STATUS_BADGE[s] : "bg-white hover:bg-slate-50 text-slate-600 border-slate-200"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Subjects table */}
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <BookOpen size={13} /> Subjects
              </h4>
              <div className="rounded-xl border border-slate-100 overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 uppercase tracking-wider text-[10px]">
                      <th className="py-2.5 px-4 font-medium">Subject</th>
                      <th className="py-2.5 font-medium">Full Marks</th>
                      <th className="py-2.5 font-medium">Pass Marks</th>
                      <th className="py-2.5 font-medium">Date</th>
                      <th className="py-2.5 font-medium">Time</th>
                      <th className="py-2.5 font-medium">Room</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {selected.subjects.map((s, i) => (
                      <tr key={i} className="text-slate-600">
                        <td className="py-2.5 px-4 font-bold text-slate-700">{s.name}</td>
                        <td className="py-2.5">{s.fullMarks}</td>
                        <td className="py-2.5 text-rose-600 font-semibold">{s.passMarks}</td>
                        <td className="py-2.5">{new Date(s.examDate).toLocaleDateString("en-NP")}</td>
                        <td className="py-2.5">{s.examTime || "—"}</td>
                        <td className="py-2.5">{s.room || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ── Create Modal ───────────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between sticky top-0">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <FileSpreadsheet size={15} /> Schedule New Exam
              </h3>
              <button onClick={() => { setShowModal(false); resetModal(); }} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 flex flex-col gap-4 text-xs">

              {/* Exam meta */}
              <div>
                <label className="block uppercase font-bold text-slate-400 tracking-wider mb-1.5">Exam Title</label>
                <input type="text" placeholder="e.g., First Term Examination 2026"
                  value={title} onChange={e => setTitle(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 focus:border-blue-500 rounded-xl font-medium outline-none transition-all" />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block uppercase font-bold text-slate-400 tracking-wider mb-1.5">Class</label>
                  <input type="text" placeholder="e.g., 10" value={className} onChange={e => setClass(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 focus:border-blue-500 rounded-xl font-bold outline-none transition-all" />
                </div>
                <div>
                  <label className="block uppercase font-bold text-slate-400 tracking-wider mb-1.5">Section</label>
                  <input type="text" placeholder="e.g., A (optional)" value={section} onChange={e => setSection(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 focus:border-blue-500 rounded-xl font-medium outline-none transition-all" />
                </div>
                <div>
                  <label className="block uppercase font-bold text-slate-400 tracking-wider mb-1.5">Main Exam Date</label>
                  <input type="date" value={examDate} onChange={e => setExamDate(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 focus:border-blue-500 rounded-xl font-medium outline-none transition-all" />
                </div>
              </div>

              {/* Subjects */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="uppercase font-bold text-slate-400 tracking-wider">Subjects</label>
                  <button onClick={addSubject}
                    className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                    <Plus size={11} /> Add Subject
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  {subjects.map((s, i) => (
                    <div key={i} className="border border-slate-200 rounded-xl p-3 bg-slate-50/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-slate-500 text-[10px] uppercase">Subject {i + 1}</span>
                        {subjects.length > 1 && (
                          <button onClick={() => removeSubject(i)} className="text-rose-400 hover:text-rose-600">
                            <X size={13} />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        <div className="md:col-span-1">
                          <label className="block text-[9px] text-slate-400 font-bold uppercase mb-1">Name *</label>
                          <input type="text" placeholder="e.g., Mathematics" value={s.name}
                            onChange={e => updateSubject(i, "name", e.target.value)}
                            className="w-full p-2 bg-white border border-slate-200 focus:border-blue-500 rounded-lg font-medium outline-none" />
                        </div>
                        <div>
                          <label className="block text-[9px] text-slate-400 font-bold uppercase mb-1">Full Marks</label>
                          <input type="number" value={s.fullMarks}
                            onChange={e => updateSubject(i, "fullMarks", Number(e.target.value))}
                            className="w-full p-2 bg-white border border-slate-200 focus:border-blue-500 rounded-lg font-bold outline-none" />
                        </div>
                        <div>
                          <label className="block text-[9px] text-slate-400 font-bold uppercase mb-1">Pass Marks</label>
                          <input type="number" value={s.passMarks}
                            onChange={e => updateSubject(i, "passMarks", Number(e.target.value))}
                            className="w-full p-2 bg-white border border-slate-200 focus:border-blue-500 rounded-lg font-bold outline-none" />
                        </div>
                        <div>
                          <label className="block text-[9px] text-slate-400 font-bold uppercase mb-1">Exam Date *</label>
                          <input type="date" value={s.examDate}
                            onChange={e => updateSubject(i, "examDate", e.target.value)}
                            className="w-full p-2 bg-white border border-slate-200 focus:border-blue-500 rounded-lg font-medium outline-none" />
                        </div>
                        <div>
                          <label className="block text-[9px] text-slate-400 font-bold uppercase mb-1">Time</label>
                          <input type="text" placeholder="e.g., 10:00 AM" value={s.examTime}
                            onChange={e => updateSubject(i, "examTime", e.target.value)}
                            className="w-full p-2 bg-white border border-slate-200 focus:border-blue-500 rounded-lg font-medium outline-none" />
                        </div>
                        <div>
                          <label className="block text-[9px] text-slate-400 font-bold uppercase mb-1">Room</label>
                          <input type="text" placeholder="e.g., Hall A" value={s.room}
                            onChange={e => updateSubject(i, "room", e.target.value)}
                            className="w-full p-2 bg-white border border-slate-200 focus:border-blue-500 rounded-lg font-medium outline-none" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-[10px] text-slate-400 bg-slate-50 p-3 rounded-xl border border-slate-100">
                ✉️ Students in this class, their parents, and all teachers will be notified automatically after scheduling.
              </div>

              <button onClick={handleCreate}
                disabled={submitting || !title || !className || !examDate || subjects.some(s => !s.name || !s.examDate)}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl font-bold shadow-md transition-all">
                {submitting ? "Scheduling..." : "Schedule & Notify All"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}