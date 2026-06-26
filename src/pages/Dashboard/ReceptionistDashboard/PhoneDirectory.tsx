import { useState } from "react";
import { Search, Phone, Copy, Check, Star, Building2, Smartphone } from "lucide-react";

type Department = "Administration" | "Academics" | "Front Office" | "Maintenance" | "Finance" | "IT";

interface Contact {
  id: number;
  name: string;
  role: string;
  department: Department;
  extension: string;
  mobile: string | null;
  status: "Available" | "Busy" | "Out";
  favorite: boolean;
}

const initialContacts: Contact[] = [
  { id: 1, name: "Mrs. Alvarez", role: "Principal", department: "Administration", extension: "101", mobile: "+1 555-201-3344", status: "Available", favorite: true },
  { id: 2, name: "Mr. Patel", role: "Vice Principal", department: "Administration", extension: "102", mobile: "+1 555-201-7788", status: "Busy", favorite: true },
  { id: 3, name: "Sara Kim", role: "Front Desk Lead", department: "Front Office", extension: "100", mobile: null, status: "Available", favorite: false },
  { id: 4, name: "David Romero", role: "Math Department Head", department: "Academics", extension: "214", mobile: "+1 555-201-9981", status: "Out", favorite: false },
  { id: 5, name: "Lily Chen", role: "Counselor", department: "Academics", extension: "208", mobile: "+1 555-201-4420", status: "Available", favorite: true },
  { id: 6, name: "Tom Becker", role: "Facilities Manager", department: "Maintenance", extension: "150", mobile: "+1 555-201-6612", status: "Available", favorite: false },
  { id: 7, name: "Priya Nair", role: "Accounts Officer", department: "Finance", extension: "120", mobile: null, status: "Busy", favorite: false },
  { id: 8, name: "Marcus Lee", role: "IT Support", department: "IT", extension: "180", mobile: "+1 555-201-3300", status: "Available", favorite: false },
];

const departments: Department[] = ["Administration", "Academics", "Front Office", "Maintenance", "Finance", "IT"];

const statusStyles: Record<Contact["status"], string> = {
  Available: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  Busy: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  Out: "bg-slate-100 text-slate-500 ring-1 ring-slate-200",
};

const statusDot: Record<Contact["status"], string> = {
  Available: "bg-emerald-500",
  Busy: "bg-amber-500",
  Out: "bg-slate-400",
};

function initials(name: string) {
  return name
    .replace(/^(Mrs\.|Mr\.|Ms\.|Dr\.)\s*/i, "")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const PhoneDirectory = () => {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState<"All" | Department>("All");
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const filtered = contacts.filter((c) => {
    const matchesQuery =
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.role.toLowerCase().includes(query.toLowerCase()) ||
      c.extension.includes(query);
    const matchesDept = department === "All" || c.department === department;
    return matchesQuery && matchesDept;
  });

  const favorites = filtered.filter((c) => c.favorite);
  const rest = filtered.filter((c) => !c.favorite);

  const toggleFavorite = (id: number) => {
    setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, favorite: !c.favorite } : c)));
  };

  const copyNumber = (id: number, number: string) => {
    navigator.clipboard?.writeText(number).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const ContactRow = ({ c }: { c: Contact }) => (
    <div className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-slate-50 transition">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-full bg-slate-700 text-white text-xs font-semibold flex items-center justify-center shrink-0">
          {initials(c.name)}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-slate-700 truncate">{c.name}</p>
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold ${statusStyles[c.status]}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusDot[c.status]}`} />
              {c.status}
            </span>
          </div>
          <p className="text-xs text-slate-400 truncate">
            {c.role} · {c.department}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-slate-700">Ext. {c.extension}</p>
          {c.mobile && <p className="text-xs text-slate-400">{c.mobile}</p>}
        </div>

        <button
          onClick={() => toggleFavorite(c.id)}
          className="text-slate-300 hover:text-amber-400 transition"
          title={c.favorite ? "Remove from quick dial" : "Add to quick dial"}
        >
          <Star className={`w-4 h-4 ${c.favorite ? "fill-amber-400 text-amber-400" : ""}`} />
        </button>

        <button
          onClick={() => copyNumber(c.id, c.mobile ?? c.extension)}
          className="text-slate-300 hover:text-slate-500 transition"
          title="Copy number"
        >
          {copiedId === c.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
        </button>

        <a
          href={`tel:${c.mobile ?? c.extension}`}
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition"
        >
          <Phone className="w-3.5 h-3.5" />
          Call
        </a>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Phone Directory</h1>
        <p className="text-sm text-slate-500 mt-1">{contacts.length} staff contacts on record</p>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, role, or extension..."
            className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto">
          {(["All", ...departments] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDepartment(d)}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                department === d ? "bg-slate-800 text-white" : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Quick dial */}
      {favorites.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-3 bg-amber-50/60 border-b border-slate-200">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <p className="text-xs font-semibold uppercase text-amber-700">Quick Dial</p>
          </div>
          <div className="divide-y divide-slate-100">
            {favorites.map((c) => (
              <ContactRow key={c.id} c={c} />
            ))}
          </div>
        </div>
      )}

      {/* Full directory */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-3 bg-slate-50 border-b border-slate-200">
          <Building2 className="w-3.5 h-3.5 text-slate-400" />
          <p className="text-xs font-semibold uppercase text-slate-500">All Contacts</p>
        </div>
        <div className="divide-y divide-slate-100">
          {rest.map((c) => (
            <ContactRow key={c.id} c={c} />
          ))}
          {filtered.length === 0 && (
            <div className="px-6 py-10 text-center text-sm text-slate-400 flex flex-col items-center gap-2">
              <Smartphone className="w-5 h-5 text-slate-300" />
              No contacts match this search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhoneDirectory;