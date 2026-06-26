import React, { useState, useEffect, useCallback } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import {
  BookOpen,
  Award,
  CreditCard,
  AlertCircle,
  Search,
  SlidersHorizontal,
  Download,
  Plus,
  ArrowLeft,
  Eye,
  Trash2,
  ShieldAlert,
  CheckCircle,
  X,
  Briefcase,
  Layers,
  Loader2,
} from 'lucide-react';
import axiosInstance from '../../../api/axiosInstance'; // adjust path as needed

// ─── Types ────────────────────────────────────────────────────────────────────

// Shape returned by GET /api/teachers (populated)
interface TeacherFromAPI {
  _id: string;
  employeeId: string;
  department: string;
  designation?: string;
  qualification?: string;
  subjects?: string[];
  experience?: number;
  joiningDate?: string;
  salary?: number;
  address?: string;
  phone?: string;
  status?: 'active' | 'inactive' | 'on_leave';
  profileImage?: string;
  userId: {
    _id: string;
    fullName: string;
    email: string;
    role: string;
  };
  schoolId: {
    _id: string;
    name: string;
    email: string;
  };
}

// Shape used in the UI (mapped from TeacherFromAPI)
interface InstructorProfile {
  _id: string;           // mongo _id — used for all API calls
  id: string;            // employeeId — display only
  name: string;
  email: string;
  status: 'Active' | 'On Leave' | 'Suspended';
  department: string;
  designation: string;
  qualification: string;
  phone: string;
  address: string;
  joiningDate: string;
  salary: number;
  subjects: string[];
  // UI-only fields — backend doesn't have these yet, shown as N/A
  dob: string;
  gender: string;
  nationality: string;
  roomNo: string;
  assignedClassesCount: number;
  averageRating: number;
  syllabusCoverage: number;
  payrollStatus: 'Disbursed' | 'Pending' | 'On Hold';
  assignedModules: Array<{ code: string; name: string; studentCount: number; room: string; schedule: string }>;
  performanceHistory: Array<{ semester: string; reviewScore: number }>;
  logs: Array<{ date: string; type: 'system' | 'payroll' | 'academic' | 'notice'; text: string }>;
}

interface AvailableUser {
  _id: string;
  fullName: string;
  email: string;
}

// ─── Mapper ───────────────────────────────────────────────────────────────────

const mapAPIToProfile = (t: TeacherFromAPI): InstructorProfile => {
  const statusMap: Record<string, InstructorProfile['status']> = {
    active: 'Active',
    on_leave: 'On Leave',
    inactive: 'Suspended',
  };

  return {
    _id: t._id,
    id: t.employeeId,
    name: t.userId?.fullName ?? 'Unknown',
    email: t.userId?.email ?? '',
    status: statusMap[t.status ?? 'active'] ?? 'Active',
    department: t.department,
    designation: t.designation ?? 'Lecturer',
    qualification: t.qualification ?? 'N/A',
    phone: t.phone ?? 'N/A',
    address: t.address ?? 'N/A',
    joiningDate: t.joiningDate
      ? new Date(t.joiningDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : 'N/A',
    salary: t.salary ?? 0,
    subjects: t.subjects ?? [],
    // UI-only — not stored in backend yet
    dob: 'N/A',
    gender: 'N/A',
    nationality: 'N/A',
    roomNo: 'N/A',
    assignedClassesCount: t.subjects?.length ?? 0,
    averageRating: 0,
    syllabusCoverage: 0,
    payrollStatus: 'Pending',
    assignedModules: [],
    performanceHistory: [],
    logs: [],
  };
};

const mapStatusToAPI = (status: InstructorProfile['status']): string => {
  const map: Record<InstructorProfile['status'], string> = {
    Active: 'active',
    'On Leave': 'on_leave',
    Suspended: 'inactive',
  };
  return map[status];
};

// ─── Toast ────────────────────────────────────────────────────────────────────

type ToastType = 'success' | 'error' | 'info';

const Toast = ({ message, type, onClose }: { message: string; type: ToastType; onClose: () => void }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const colors: Record<ToastType, string> = {
    success: 'bg-emerald-600',
    error: 'bg-rose-600',
    info: 'bg-blue-600',
  };

  return (
    <div className={`fixed bottom-6 right-6 z-100 flex items-center gap-3 px-4 py-3 rounded-xl text-white text-xs font-semibold shadow-xl ${colors[type]}`}>
      {message}
      <button onClick={onClose} className="opacity-70 hover:opacity-100"><X size={13} /></button>
    </div>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function TeacherManager() {
  const [instructors, setInstructors] = useState<InstructorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInstructor, setSelectedInstructor] = useState<InstructorProfile | null>(null);
  const [activeProfileTab, setActiveProfileTab] = useState<'personal' | 'professional' | 'contact'>('personal');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Toast
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    setToast({ message, type });
  }, []);

  // Add modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<AvailableUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [newEmployeeId, setNewEmployeeId] = useState('');
  const [newDept, setNewDept] = useState('Computer Science');
  const [newDesignation, setNewDesignation] = useState('Lecturer');
  const [newQualification, setNewQualification] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newSalary, setNewSalary] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // ─── Fetch all teachers ──────────────────────────────────────────────────

  const fetchTeachers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get('/api/teachers');
      const mapped = (data.data as TeacherFromAPI[]).map(mapAPIToProfile);
      setInstructors(mapped);
    } catch (err: any) {
      showToast(err.response?.data?.message ?? 'Failed to load teachers', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchTeachers(); }, [fetchTeachers]);

  // ─── Open add modal — fetch available users ──────────────────────────────

  const openAddModal = async () => {
    setIsAddModalOpen(true);
    setUsersLoading(true);
    try {
      const { data } = await axiosInstance.get('/api/teachers/available-users');
      setAvailableUsers(data.data);
      if (data.data.length > 0) setSelectedUserId(data.data[0]._id);
    } catch (err: any) {
      showToast(err.response?.data?.message ?? 'Failed to load users', 'error');
    } finally {
      setUsersLoading(false);
    }
  };

  // ─── Create teacher ──────────────────────────────────────────────────────

  const handleOnboardInstructor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !newEmployeeId || !newDept) return;

    setSubmitting(true);
    try {
      await axiosInstance.post('/api/teachers', {
        userId: selectedUserId,
        employeeId: newEmployeeId,
        department: newDept,
        designation: newDesignation,
        qualification: newQualification || undefined,
        phone: newPhone || undefined,
        salary: newSalary ? Number(newSalary) : undefined,
      });

      showToast('Teacher onboarded successfully', 'success');
      setIsAddModalOpen(false);
      setNewEmployeeId('');
      setNewQualification('');
      setNewPhone('');
      setNewSalary('');
      await fetchTeachers();
    } catch (err: any) {
      showToast(err.response?.data?.message ?? 'Failed to onboard teacher', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Update status ───────────────────────────────────────────────────────

  const handleUpdateStatus = async (mongoId: string, newStatus: InstructorProfile['status']) => {
    try {
      await axiosInstance.put(`/api/teachers/${mongoId}`, { status: mapStatusToAPI(newStatus) });

      setInstructors(prev =>
        prev.map(i => i._id === mongoId ? { ...i, status: newStatus } : i)
      );
      if (selectedInstructor?._id === mongoId) {
        setSelectedInstructor(prev => prev ? { ...prev, status: newStatus } : prev);
      }
      showToast(`Status updated to ${newStatus}`, 'success');
    } catch (err: any) {
      showToast(err.response?.data?.message ?? 'Failed to update status', 'error');
    }
  };

  // ─── Delete teacher ──────────────────────────────────────────────────────

  const handlePurgeRecord = async (mongoId: string) => {
    if (!window.confirm('Delete this teacher record permanently? This will revert their role to user.')) return;

    try {
      await axiosInstance.delete(`/api/teachers/${mongoId}`);
      setInstructors(prev => prev.filter(i => i._id !== mongoId));
      if (selectedInstructor?._id === mongoId) setSelectedInstructor(null);
      showToast('Teacher record deleted', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.message ?? 'Failed to delete teacher', 'error');
    }
  };

  // ─── Export (stub — backend has no export endpoint) ──────────────────────

  const handleExportRoster = () => {
    const rows = [
      ['Employee ID', 'Name', 'Email', 'Department', 'Designation', 'Status', 'Joining Date'],
      ...filteredInstructors.map(i => [i.id, i.name, i.email, i.department, i.designation, i.status, i.joiningDate]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'faculty-roster.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // ─── Filter ──────────────────────────────────────────────────────────────

  const filteredInstructors = instructors.filter(instructor => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      instructor.name.toLowerCase().includes(q) ||
      instructor.id.toLowerCase().includes(q) ||
      instructor.email.toLowerCase().includes(q);
    const matchesDept = deptFilter === 'All' || instructor.department === deptFilter;
    const matchesStatus = statusFilter === 'All' || instructor.status === statusFilter;
    return matchesSearch && matchesDept && matchesStatus;
  });

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="w-full bg-slate-50 min-h-screen p-6 font-sans text-slate-800 relative">

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      {/* ── LIST VIEW ─────────────────────────────────────────────────────── */}
      {!selectedInstructor ? (
        <div className="max-w-5xl mx-auto flex flex-col gap-5">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-slate-900 text-white rounded-xl shadow-md">
                <Briefcase size={22} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Faculty & Instructor Registry</h2>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Administrative oversight of institutional tenure, classes, and performance ratings
                </p>
              </div>
            </div>
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all self-start sm:self-center"
            >
              <Plus size={15} /> Onboard New Faculty
            </button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            <div className="md:col-span-5 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search by name, employee ID, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl text-xs font-medium outline-none transition-all shadow-sm"
              />
            </div>

            <div className="md:col-span-3 relative">
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="w-full pl-4 pr-8 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl text-xs outline-none cursor-pointer shadow-sm appearance-none"
              >
                <option value="All">All Departments</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Information Technology">Information Technology</option>
              </select>
              <SlidersHorizontal className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
            </div>

            <div className="md:col-span-2 relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-4 pr-8 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl text-xs outline-none cursor-pointer shadow-sm appearance-none"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Suspended">Suspended</option>
              </select>
              <SlidersHorizontal className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
            </div>

            <button
              onClick={handleExportRoster}
              className="md:col-span-2 flex items-center justify-center gap-1.5 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <Download size={13} /> Export CSV
            </button>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-20 gap-2 text-slate-400 text-sm font-medium">
                <Loader2 size={18} className="animate-spin" /> Loading teachers...
              </div>
            ) : filteredInstructors.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Briefcase size={32} className="mb-3 opacity-30" />
                <p className="text-sm font-semibold">No teachers found</p>
                <p className="text-xs mt-1">Try adjusting your filters or onboard a new faculty member</p>
              </div>
            ) : (
              <div className="w-full overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                      <th className="py-3 px-5 font-medium">Instructor Profile</th>
                      <th className="py-3 font-medium">Department</th>
                      <th className="py-3 text-center font-medium">Subjects</th>
                      <th className="py-3 text-center font-medium">Salary</th>
                      <th className="py-3 text-center font-medium">Status</th>
                      <th className="py-3 pr-5 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-xs">
                    {filteredInstructors.map((instructor) => (
                      <tr key={instructor._id} className="hover:bg-slate-50/40 group transition-colors duration-150">
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                              {instructor.name.split(' ').filter(Boolean).map(n => n[0]).join('').substring(0, 2)}
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-700 group-hover:text-blue-600 transition-colors">{instructor.name}</h4>
                              <span className="text-[10px] text-slate-400 font-medium block mt-0.5">{instructor.id} • {instructor.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 font-semibold text-slate-700">
                          <div>{instructor.designation}</div>
                          <div className="text-[10px] text-slate-400 font-medium mt-0.5">{instructor.department}</div>
                        </td>
                        <td className="py-3.5 text-center font-bold text-slate-700">
                          <span className="px-2 py-0.5 bg-slate-100 rounded-md text-slate-600">
                            {instructor.subjects.length} Subjects
                          </span>
                        </td>
                        <td className="py-3.5 text-center font-bold text-slate-600">
                          ${instructor.salary.toLocaleString()}
                        </td>
                        <td className="py-3.5 text-center">
                          <select
                            value={instructor.status}
                            onChange={(e) => handleUpdateStatus(instructor._id, e.target.value as InstructorProfile['status'])}
                            className={`font-bold border-none bg-transparent rounded-lg p-1 cursor-pointer text-center outline-none ${
                              instructor.status === 'Active' ? 'text-emerald-600' :
                              instructor.status === 'Suspended' ? 'text-rose-600' : 'text-amber-600'
                            }`}
                          >
                            <option value="Active">Active</option>
                            <option value="On Leave">On Leave</option>
                            <option value="Suspended">Suspended</option>
                          </select>
                        </td>
                        <td className="py-3.5 pr-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedInstructor(instructor)}
                              className="p-1.5 border border-slate-200 hover:border-blue-500 bg-white text-slate-400 hover:text-blue-600 rounded-lg transition-all"
                              title="View Profile"
                            >
                              <Eye size={13} />
                            </button>
                            <button
                              onClick={() => handlePurgeRecord(instructor._id)}
                              className="p-1.5 border border-slate-200 hover:border-rose-500 bg-white text-slate-400 hover:text-rose-600 rounded-lg transition-all"
                              title="Delete Teacher"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      ) : (

        /* ── DETAIL VIEW ──────────────────────────────────────────────────── */
        <div className="max-w-5xl mx-auto flex flex-col gap-6">

          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedInstructor(null)}
              className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-sm transition-all"
            >
              <ArrowLeft size={14} /> Back to Faculty Directory
            </button>
            <span className="text-[11px] bg-slate-100 text-slate-500 border border-slate-200 font-bold px-3 py-1.5 rounded-xl">
              Employee ID: {selectedInstructor.id}
            </span>
          </div>

          {/* Hero card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="h-32 w-full bg-slate-900" />
            <div className="px-6 pb-5 flex flex-col md:flex-row items-center md:items-end justify-between gap-4 -mt-12 relative z-10">
              <div className="flex flex-col md:flex-row items-center md:items-end gap-4 text-center md:text-left">
                <div className="w-24 h-24 rounded-2xl border-4 border-white bg-blue-50 text-blue-600 font-bold text-3xl shadow-md flex items-center justify-center shrink-0">
                  {selectedInstructor.name.split(' ').filter(Boolean).map(n => n[0]).join('').substring(0, 2)}
                </div>
                <div className="mb-1">
                  <div className="flex items-center justify-center md:justify-start gap-2.5">
                    <h2 className="text-xl font-bold text-slate-800">{selectedInstructor.name}</h2>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      selectedInstructor.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      selectedInstructor.status === 'Suspended' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                      'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>{selectedInstructor.status}</span>
                  </div>
                  <p className="text-sm text-slate-400 font-medium mt-0.5">
                    {selectedInstructor.designation} • {selectedInstructor.department}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {selectedInstructor.status !== 'Suspended' ? (
                  <button
                    onClick={() => handleUpdateStatus(selectedInstructor._id, 'Suspended')}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 rounded-xl text-xs font-bold transition-all"
                  >
                    <ShieldAlert size={14} /> Suspend Access
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpdateStatus(selectedInstructor._id, 'Active')}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 rounded-xl text-xs font-bold transition-all"
                  >
                    <CheckCircle size={14} /> Reinstate
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex border-b border-slate-100 bg-slate-50/50 p-1.5 gap-1">
              {(['personal', 'professional', 'contact'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveProfileTab(tab)}
                  className={`capitalize px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeProfileTab === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  {tab} Info
                </button>
              ))}
            </div>
            <div className="p-5 text-xs font-semibold text-slate-700">
              {activeProfileTab === 'personal' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div><label className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider mb-0.5">Date of Birth</label>{selectedInstructor.dob}</div>
                  <div><label className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider mb-0.5">Gender</label>{selectedInstructor.gender}</div>
                  <div><label className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider mb-0.5">Nationality</label>{selectedInstructor.nationality}</div>
                  <div><label className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider mb-0.5">Joining Date</label>{selectedInstructor.joiningDate}</div>
                </div>
              )}
              {activeProfileTab === 'professional' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div><label className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider mb-0.5">Designation</label>{selectedInstructor.designation}</div>
                  <div><label className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider mb-0.5">Department</label>{selectedInstructor.department}</div>
                  <div className="md:col-span-2"><label className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider mb-0.5">Qualification</label>{selectedInstructor.qualification}</div>
                  <div className="md:col-span-4">
                    <label className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider mb-1.5">Subjects</label>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedInstructor.subjects.length > 0
                        ? selectedInstructor.subjects.map((s, i) => (
                          <span key={i} className="bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-md text-[11px] font-bold">{s}</span>
                        ))
                        : <span className="text-slate-400">No subjects assigned</span>
                      }
                    </div>
                  </div>
                </div>
              )}
              {activeProfileTab === 'contact' && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div><label className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider mb-0.5">Phone</label>{selectedInstructor.phone}</div>
                  <div className="md:col-span-2"><label className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider mb-0.5">Email</label>{selectedInstructor.email}</div>
                  <div><label className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider mb-0.5">Address</label>{selectedInstructor.address}</div>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-4 flex items-center gap-3.5">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Layers size={18} /></div>
              <div>
                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Subjects</span>
                <h4 className="text-base font-bold text-slate-800">{selectedInstructor.subjects.length} Assigned</h4>
              </div>
            </div>
            <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-4 flex items-center gap-3.5">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><Award size={18} /></div>
              <div>
                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Rating</span>
                <h4 className="text-base font-bold text-slate-800">
                  {selectedInstructor.averageRating > 0 ? `★ ${selectedInstructor.averageRating}` : 'N/A'}
                </h4>
              </div>
            </div>
            <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-4 flex items-center gap-3.5">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><BookOpen size={18} /></div>
              <div>
                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Joined</span>
                <h4 className="text-sm font-bold text-slate-800">{selectedInstructor.joiningDate}</h4>
              </div>
            </div>
            <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-4 flex items-center gap-3.5">
              <div className="p-3 bg-cyan-50 text-cyan-600 rounded-xl"><CreditCard size={18} /></div>
              <div>
                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Salary</span>
                <h4 className="text-base font-bold text-slate-800">${selectedInstructor.salary.toLocaleString()}</h4>
              </div>
            </div>
          </div>

          {/* Modules table */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="text-blue-600" size={18} />
              <h3 className="font-bold text-slate-700 text-base">Assigned Modules</h3>
            </div>
            {selectedInstructor.assignedModules.length === 0 ? (
              <p className="text-xs text-slate-400 font-medium text-center py-8">No modules assigned yet.</p>
            ) : (
              <div className="w-full overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                      <th className="pb-2.5 font-medium">Code</th>
                      <th className="pb-2.5 font-medium">Module Name</th>
                      <th className="pb-2.5 font-medium text-center">Students</th>
                      <th className="pb-2.5 font-medium text-center">Room</th>
                      <th className="pb-2.5 font-medium text-right">Schedule</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 font-semibold text-slate-700">
                    {selectedInstructor.assignedModules.map((mod, index) => (
                      <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 text-blue-600 font-bold">{mod.code}</td>
                        <td className="py-3">{mod.name}</td>
                        <td className="py-3 text-center text-slate-500">{mod.studentCount}</td>
                        <td className="py-3 text-center"><span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">{mod.room}</span></td>
                        <td className="py-3 text-right text-slate-500 font-medium">{mod.schedule}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Chart + Logs */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-7 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="font-bold text-slate-700 text-base mb-4">Evaluation Score Progression</h3>
              <div className="h-48 w-full -ml-5">
                {selectedInstructor.performanceHistory.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={selectedInstructor.performanceHistory} margin={{ left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="semester" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 5.0]} ticks={[0, 2.5, 5.0]} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff' }} />
                      <Bar dataKey="reviewScore" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={24} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 text-xs font-semibold">
                    No performance history available.
                  </div>
                )}
              </div>
            </div>

            <div className="md:col-span-5 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="font-bold text-slate-700 text-base mb-4">Activity Logs</h3>
              {selectedInstructor.logs.length === 0 ? (
                <p className="text-xs text-slate-400 font-medium text-center py-8">No activity logs.</p>
              ) : (
                <div className="flex flex-col gap-3.5">
                  {selectedInstructor.logs.map((log, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-xs">
                      <div className="p-1.5 bg-slate-50 rounded-lg text-slate-400 shrink-0 mt-0.5">
                        <AlertCircle size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-400 text-[10px]">{log.date}</span>
                          <span className="text-[9px] font-bold text-slate-300 uppercase tracking-wider">{log.type}</span>
                        </div>
                        <p className="text-slate-600 font-medium mt-0.5 line-clamp-2 leading-relaxed">{log.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* ── ADD MODAL ─────────────────────────────────────────────────────── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-md w-full overflow-hidden">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm">Onboard New Faculty</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={18} />
              </button>
            </div>

            {usersLoading ? (
              <div className="flex items-center justify-center py-16 gap-2 text-slate-400 text-sm">
                <Loader2 size={18} className="animate-spin" /> Loading users...
              </div>
            ) : availableUsers.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-sm font-medium px-6">
                No available users to assign as teacher.<br />
                <span className="text-xs mt-1 block">All registered users are already teachers, or no users exist.</span>
              </div>
            ) : (
              <form onSubmit={handleOnboardInstructor} className="p-5 flex flex-col gap-4 text-xs">

                {/* User picker */}
                <div>
                  <label className="block uppercase font-bold text-slate-400 tracking-wider mb-1.5">
                    Select User Account
                  </label>
                  <select
                    required
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 focus:border-blue-500 rounded-xl font-medium outline-none transition-all text-slate-700"
                  >
                    {availableUsers.map(u => (
                      <option key={u._id} value={u._id}>
                        {u.fullName} — {u.email}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Employee ID */}
                <div>
                  <label className="block uppercase font-bold text-slate-400 tracking-wider mb-1.5">
                    Employee ID
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g., EMP-2026-001"
                    value={newEmployeeId}
                    onChange={(e) => setNewEmployeeId(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 focus:border-blue-500 rounded-xl font-medium outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Department */}
                  <div>
                    <label className="block uppercase font-bold text-slate-400 tracking-wider mb-1.5">Department</label>
                    <select
                      value={newDept}
                      onChange={(e) => setNewDept(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold outline-none cursor-pointer"
                    >
                      <option value="Computer Science">Computer Science</option>
                      <option value="Information Technology">Information Technology</option>
                    </select>
                  </div>

                  {/* Designation */}
                  <div>
                    <label className="block uppercase font-bold text-slate-400 tracking-wider mb-1.5">Designation</label>
                    <select
                      value={newDesignation}
                      onChange={(e) => setNewDesignation(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold outline-none cursor-pointer"
                    >
                      <option value="Lecturer">Lecturer</option>
                      <option value="Senior Lecturer">Senior Lecturer</option>
                      <option value="Assistant Professor">Assistant Professor</option>
                      <option value="Professor">Professor</option>
                    </select>
                  </div>
                </div>

                {/* Qualification */}
                <div>
                  <label className="block uppercase font-bold text-slate-400 tracking-wider mb-1.5">Qualification</label>
                  <input
                    type="text"
                    placeholder="e.g., M.E. in Computer Engineering"
                    value={newQualification}
                    onChange={(e) => setNewQualification(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 focus:border-blue-500 rounded-xl font-medium outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Phone */}
                  <div>
                    <label className="block uppercase font-bold text-slate-400 tracking-wider mb-1.5">Phone</label>
                    <input
                      type="text"
                      placeholder="+977 98XXXXXXXX"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-200 focus:border-blue-500 rounded-xl font-medium outline-none transition-all"
                    />
                  </div>

                  {/* Salary */}
                  <div>
                    <label className="block uppercase font-bold text-slate-400 tracking-wider mb-1.5">Salary ($)</label>
                    <input
                      type="number"
                      placeholder="e.g., 2400"
                      value={newSalary}
                      onChange={(e) => setNewSalary(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-200 focus:border-blue-500 rounded-xl font-medium outline-none transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-md transition-all mt-2 flex items-center justify-center gap-2"
                >
                  {submitting ? <><Loader2 size={14} className="animate-spin" /> Creating...</> : 'Commit to Registry'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}