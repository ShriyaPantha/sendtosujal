import { useState } from "react";
import { Plus, Search, FileText, FileCheck, Send, X, PenLine, Archive } from "lucide-react";

type DocType = "Letter" | "Form" | "Invoice" | "Certificate" | "Memo" | "Other";
type DocStatus = "Pending Review" | "Awaiting Signature" | "Filed" | "Dispatched";

interface Document {
  id: number;
  title: string;
  type: DocType;
  from: string;
  to: string;
  dateReceived: string;
  status: DocStatus;
}

const initialDocuments: Document[] = [
  { id: 1, title: "Field Trip Consent Forms", type: "Form", from: "Mrs. Alvarez", to: "Front Office", dateReceived: "Jun 17, 9:00 AM", status: "Filed" },
  { id: 2, title: "Vendor Invoice - BrightPath Supplies", type: "Invoice", from: "BrightPath Supplies", to: "Finance Office", dateReceived: "Jun 17, 9:20 AM", status: "Pending Review" },
  { id: 3, title: "Staff Leave Request - D. Romero", type: "Letter", from: "David Romero", to: "Mr. Patel", dateReceived: "Jun 17, 10:05 AM", status: "Awaiting Signature" },
  { id: 4, title: "Graduation Certificates - Batch 4", type: "Certificate", from: "Registrar", to: "Mrs. Alvarez", dateReceived: "Jun 16, 2:40 PM", status: "Dispatched" },
  { id: 5, title: "Staff Meeting Memo - June", type: "Memo", from: "Administration", to: "All Staff", dateReceived: "Jun 16, 4:15 PM", status: "Filed" },
];

const docTypes: DocType[] = ["Letter", "Form", "Invoice", "Certificate", "Memo", "Other"];

const statusStyles: Record<DocStatus, string> = {
  "Pending Review": "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  "Awaiting Signature": "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
  Filed: "bg-slate-100 text-slate-500 ring-1 ring-slate-200",
  Dispatched: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
};

const statusDot: Record<DocStatus, string> = {
  "Pending Review": "bg-amber-500",
  "Awaiting Signature": "bg-sky-500",
  Filed: "bg-slate-400",
  Dispatched: "bg-emerald-500",
};

function currentDateTime() {
  const now = new Date();
  const date = now.toLocaleDateString([], { month: "short", day: "numeric" });
  const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return `${date}, ${time}`;
}

const emptyForm = { title: "", type: "Letter" as DocType, from: "", to: "" };

const Documents = () => {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"All" | DocStatus>("All");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const today = new Date().toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });

  const filtered = documents.filter((d) => {
    const matchesQuery =
      d.title.toLowerCase().includes(query.toLowerCase()) ||
      d.from.toLowerCase().includes(query.toLowerCase()) ||
      d.to.toLowerCase().includes(query.toLowerCase());
    const matchesFilter = filter === "All" || d.status === filter;
    return matchesQuery && matchesFilter;
  });

  const counts = {
    total: documents.length,
    pending: documents.filter((d) => d.status === "Pending Review" || d.status === "Awaiting Signature").length,
    dispatched: documents.filter((d) => d.status === "Dispatched").length,
  };

  const advanceStatus = (id: number, next: DocStatus) => {
    setDocuments((prev) => prev.map((d) => (d.id === id ? { ...d, status: next } : d)));
  };

  const handleAddDocument = () => {
    if (!form.title.trim() || !form.to.trim()) return;
    const newDoc: Document = {
      id: Date.now(),
      title: form.title.trim(),
      type: form.type,
      from: form.from.trim() || "—",
      to: form.to.trim(),
      dateReceived: currentDateTime(),
      status: "Pending Review",
    };
    setDocuments((prev) => [newDoc, ...prev]);
    setForm(emptyForm);
    setShowForm(false);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Documents</h1>
          <p className="text-sm text-slate-500 mt-1">{today}</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-700 transition"
        >
          <Plus className="w-4 h-4" />
          Log Document
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center">
            <FileText className="w-5 h-5 text-slate-500" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">On Record</p>
            <p className="text-xl font-bold text-slate-800">{counts.total} documents</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-amber-50 flex items-center justify-center">
            <PenLine className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">Needs Action</p>
            <p className="text-xl font-bold text-slate-800">{counts.pending} pending</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-emerald-50 flex items-center justify-center">
            <Send className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">Completed</p>
            <p className="text-xl font-bold text-slate-800">{counts.dispatched} dispatched</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, sender, or recipient..."
            className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto">
          {(["All", "Pending Review", "Awaiting Signature", "Filed", "Dispatched"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                filter === f ? "bg-slate-800 text-white" : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold">
            <tr>
              <th className="px-6 py-4">Document</th>
              <th className="px-6 py-4">From</th>
              <th className="px-6 py-4">To</th>
              <th className="px-6 py-4">Received</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((d) => (
              <tr key={d.id} className="hover:bg-slate-50 transition">
                <td className="px-6 py-4">
                  <p className="font-medium text-slate-700">{d.title}</p>
                  <p className="text-xs text-slate-400">{d.type}</p>
                </td>
                <td className="px-6 py-4 text-slate-600">{d.from}</td>
                <td className="px-6 py-4 text-slate-600">{d.to}</td>
                <td className="px-6 py-4 text-slate-600">{d.dateReceived}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyles[d.status]}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusDot[d.status]}`} />
                    {d.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {d.status === "Pending Review" && (
                    <button
                      onClick={() => advanceStatus(d.id, "Awaiting Signature")}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 hover:text-sky-700"
                    >
                      <PenLine className="w-3.5 h-3.5" />
                      Route for Signature
                    </button>
                  )}
                  {d.status === "Awaiting Signature" && (
                    <button
                      onClick={() => advanceStatus(d.id, "Filed")}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-700"
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      Mark Signed
                    </button>
                  )}
                  {d.status === "Filed" && (
                    <button
                      onClick={() => advanceStatus(d.id, "Dispatched")}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Dispatch
                    </button>
                  )}
                  {d.status === "Dispatched" && (
                    <span className="text-xs text-slate-300 inline-flex items-center gap-1">
                      <Archive className="w-3.5 h-3.5" />
                      Complete
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-400">
                  No documents match this search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Log document modal */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Log Document</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-500">Document Title</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Staff Leave Request"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as DocType })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-white"
                >
                  {docTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500">From</label>
                  <input
                    value={form.from}
                    onChange={(e) => setForm({ ...form, from: e.target.value })}
                    placeholder="Sender"
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">To</label>
                  <input
                    value={form.to}
                    onChange={(e) => setForm({ ...form, to: e.target.value })}
                    placeholder="Recipient"
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-500 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddDocument}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-slate-800 hover:bg-slate-700"
              >
                Log It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;