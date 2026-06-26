import { useState, useRef, useEffect } from "react";
import { Plus, Search, Filter, MoreVertical, Trash2, Edit2, X, Calendar, Clock, User } from "lucide-react";

const INITIAL_APPOINTMENTS = [
  { id: 1, visitor: "Mr. Rajesh Kumar", staff: "Dr. Sarah Johnson", date: "2026-06-17", time: "10:00 AM", status: "Confirmed" },
  { id: 2, visitor: "Ms. Anita Desai", staff: "Principal's Office", date: "2026-06-17", time: "02:30 PM", status: "Pending" },
  { id: 3, visitor: "Arjun's Parent", staff: "Finance Dept", date: "2026-06-18", time: "11:00 AM", status: "Completed" },
];

const Appointments = () => {
  const [appointments, setAppointments] = useState(INITIAL_APPOINTMENTS);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ visitor: "", staff: "", date: "", time: "", status: "Pending" });

  const menuRef = useRef<HTMLDivElement>(null);

  // Close Action Menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setActiveMenuId(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter & Search Logic
  const filteredData = appointments.filter((app) => {
    const matchesSearch = app.visitor.toLowerCase().includes(search.toLowerCase()) || 
                          app.staff.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "All" || app.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleSave = () => {
    if (editingId) {
      setAppointments(appointments.map(a => a.id === editingId ? { ...formData, id: editingId } : a));
    } else {
      setAppointments([...appointments, { ...formData, id: Date.now() }]);
    }
    setIsModalOpen(false);
    setEditingId(null);
  };

  const startEdit = (app: any) => {
    setFormData(app);
    setEditingId(app.id);
    setIsModalOpen(true);
    setActiveMenuId(null);
  };

  const handleDelete = (id: number) => {
    setAppointments(appointments.filter(a => a.id !== id));
    setActiveMenuId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Appointments</h1>
        <button onClick={() => { setFormData({ visitor: "", staff: "", date: "", time: "", status: "Pending" }); setIsModalOpen(true); }} className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-emerald-700">
          + New Appointment
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input 
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by visitor or staff..." 
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>
        <button onClick={() => setIsFilterOpen(!isFilterOpen)} className={`px-4 py-2 border rounded-lg text-sm flex items-center gap-2 ${isFilterOpen ? 'bg-emerald-50 border-emerald-500' : 'bg-white'}`}>
          <Filter size={18} /> Filter
        </button>
      </div>

      {/* Status Filter Chips */}
      {isFilterOpen && (
        <div className="flex gap-2 animate-in slide-in-from-top-2">
          {["All", "Confirmed", "Pending", "Completed"].map(status => (
            <button key={status} onClick={() => setFilterStatus(status)} className={`px-3 py-1 rounded-full text-xs border ${filterStatus === status ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600'}`}>
              {status}
            </button>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr><th className="px-6 py-4">Visitor</th><th className="px-6 py-4">Staff</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredData.map((app) => (
              <tr key={app.id}>
                <td className="px-6 py-4 font-medium text-slate-800">{app.visitor}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{app.staff}</td>
                <td className="px-6 py-4"><span className="text-[10px] font-bold px-2 py-1 rounded bg-slate-100 text-slate-700">{app.status}</span></td>
                <td className="px-6 py-4 relative text-right">
                  <button onClick={() => setActiveMenuId(app.id)} className="p-2 hover:bg-slate-100 rounded-lg"><MoreVertical size={18} /></button>
                  {activeMenuId === app.id && (
                    <div ref={menuRef} className="absolute right-4 mt-2 w-36 bg-white border rounded-xl shadow-xl z-20">
                      <button onClick={() => startEdit(app)} className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-slate-50"><Edit2 size={14}/> Edit</button>
                      <button onClick={() => handleDelete(app.id)} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"><Trash2 size={14}/> Delete</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-sm space-y-4">
            <h2 className="font-bold text-lg">{editingId ? "Edit" : "New"} Appointment</h2>
            <input className="w-full p-2 border rounded-lg" placeholder="Visitor Name" value={formData.visitor} onChange={e => setFormData({...formData, visitor: e.target.value})} />
            <input className="w-full p-2 border rounded-lg" placeholder="Staff Name" value={formData.staff} onChange={e => setFormData({...formData, staff: e.target.value})} />
            <select className="w-full p-2 border rounded-lg" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
              <option>Pending</option><option>Confirmed</option><option>Completed</option>
            </select>
            <div className="flex gap-2 justify-end pt-4">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-500">Cancel</button>
              <button onClick={handleSave} className="bg-emerald-600 text-white px-4 py-2 rounded-lg">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;