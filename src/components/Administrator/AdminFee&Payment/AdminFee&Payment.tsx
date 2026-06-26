import { useState, useEffect, useCallback } from "react";
import {
  CreditCard, Search, SlidersHorizontal, CheckCircle, AlertTriangle,
  Wallet, X, Plus, Loader2, Banknote, Clock, ReceiptText,
} from "lucide-react";
import api from "../../../api/axiosInstance";

// ── Types ─────────────────────────────────────────────────────────────────────

interface FeeRecord {
  _id: string;
  studentId: {
    _id: string; class: string; section: string; admissionNumber?: string;
    userId: { fullName: string; email: string };
  };
  title: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: "pending" | "partial" | "paid";
  dueDate: string;
}

interface PayrollRecord {
  _id: string;
  staffId: string;
  staffModel: "Teacher" | "Admin" | "Receptionist";
  staff: { name: string; email: string; model: string } | null;
  month: number;
  year: number;
  basicSalary: number;
  netSalary: number;
  grossSalary: number;
  totalAllowances: number;
  totalDeductions: number;
  status: "pending" | "paid";
  paidAt?: string;
}

interface StudentOption {
  _id: string;
  userId: { fullName: string; email: string };
  class: string;
  section: string;
  admissionNumber?: string;
}

interface TeacherOption {
  _id: string;
  userId: { fullName: string; email: string };
  employeeId: string;
  department: string;
}

interface AdminOption {
  _id: string;
  fullName: string;
  email: string;
  employeeId?: string;
  isActive?: boolean;
}

interface ReceptionistOption {
  _id: string;
  userId: { fullName: string; email: string };
  phone?: string;
}

const MONTHS = ["", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminBillingPayroll() {
  const [tab, setTab] = useState<"fees" | "payroll">("fees");

  // ── Fee state ───────────────────────────────────────────────────────────────
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [feeLoading, setFeeLoading] = useState(true);
  const [feeError, setFeeError] = useState<string | null>(null);
  const [feeSearch, setFeeSearch] = useState("");
  const [feeStatusFilter, setFeeStatusFilter] = useState("All");

  // ── Payroll state ──────────────────────────────────────────────────────────
  const [payrolls, setPayrolls] = useState<PayrollRecord[]>([]);
  const [payrollLoading, setPayrollLoading] = useState(true);
  const [payrollError, setPayrollError] = useState<string | null>(null);
  const [payrollSummary, setPayrollSummary] = useState({ totalNetSalary: 0, totalPaid: 0, totalPending: 0 });

  // ── Fee modal state ────────────────────────────────────────────────────────
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [studentQuery, setStudentQuery] = useState("");
  const [allStudents, setAllStudents] = useState<StudentOption[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentOption | null>(null);
  const [feeTitle, setFeeTitle] = useState("");
  const [feeAmount, setFeeAmount] = useState("");
  const [feeDueDate, setFeeDueDate] = useState("");
  const [feeDesc, setFeeDesc] = useState("");
  const [feeNotify, setFeeNotify] = useState<"both" | "student" | "parent" | "none">("both");
  const [feeSubmitting, setFeeSubmitting] = useState(false);

  // ── Salary modal state ─────────────────────────────────────────────────────
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [staffModel, setStaffModel] = useState<"Teacher" | "Admin" | "Receptionist">("Teacher");
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [admins, setAdmins] = useState<AdminOption[]>([]);
  const [receptionists, setReceptionists] = useState<ReceptionistOption[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [salMonth, setSalMonth] = useState(new Date().getMonth() + 1);
  const [salYear, setSalYear] = useState(new Date().getFullYear());
  const [basicSalary, setBasicSalary] = useState("");
  const [houseRent, setHouseRent] = useState("0");
  const [transport, setTransport] = useState("0");
  const [medical, setMedical] = useState("0");
  const [pfRate, setPfRate] = useState("10");
  const [taxRate, setTaxRate] = useState("5");
  const [absentDays, setAbsentDays] = useState("0");
  const [salSubmitting, setSalSubmitting] = useState(false);

  // ── Loaders ────────────────────────────────────────────────────────────────

  const loadFees = useCallback(async () => {
    setFeeLoading(true); setFeeError(null);
    try {
      const { data } = await api.get("/api/fees");
      setFees(data.data ?? []);
    } catch (e: any) { setFeeError(e?.response?.data?.message ?? "Failed to load fees"); }
    finally { setFeeLoading(false); }
  }, []);

  const loadPayrolls = useCallback(async () => {
    setPayrollLoading(true); setPayrollError(null);
    try {
      const { data } = await api.get("/api/payroll");
      setPayrolls(data.data ?? []);
      setPayrollSummary(data.summary ?? { totalNetSalary: 0, totalPaid: 0, totalPending: 0 });
    } catch (e: any) { setPayrollError(e?.response?.data?.message ?? "Failed to load payrolls"); }
    finally { setPayrollLoading(false); }
  }, []);

  const loadTeachers = useCallback(async () => {
    try {
      const { data } = await api.get("/api/teachers");
      setTeachers(data.data ?? []);
    } catch { setTeachers([]); }
  }, []);

  const loadStudents = useCallback(async () => {
    try {
      const { data } = await api.get("/api/students");
      setAllStudents(data.data ?? []);
    } catch { setAllStudents([]); }
  }, []);

  const loadAdmins = useCallback(async () => {
    try {
      const { data } = await api.get("/api/admin/list");
      setAdmins(data.data ?? []);
    } catch { setAdmins([]); }
  }, []);

  const loadReceptionists = useCallback(async () => {
    try {
      const { data } = await api.get("/api/receptionist/list");
      setReceptionists(data.data ?? []);
    } catch { setReceptionists([]); }
  }, []);

  useEffect(() => {
    loadFees(); loadPayrolls(); loadTeachers(); loadStudents(); loadAdmins(); loadReceptionists();
  }, [loadFees, loadPayrolls, loadTeachers, loadStudents, loadAdmins, loadReceptionists]);

  // ── Create fee ─────────────────────────────────────────────────────────────

  const handleCreateFee = async () => {
    if (!selectedStudent || !feeTitle || !feeAmount || !feeDueDate) return;
    setFeeSubmitting(true);
    try {
      await api.post("/api/fees", {
        studentId: selectedStudent._id,
        title: feeTitle,
        totalAmount: Number(feeAmount),
        dueDate: feeDueDate,
        description: feeDesc,
        notifyWho: feeNotify,
      });
      setShowFeeModal(false);
      resetFeeModal();
      await loadFees();
    } catch (e: any) { alert(e?.response?.data?.message ?? "Create fee failed"); }
    finally { setFeeSubmitting(false); }
  };

  const resetFeeModal = () => {
    setStudentQuery(""); setSelectedStudent(null);
    setFeeTitle(""); setFeeAmount(""); setFeeDueDate(""); setFeeDesc(""); setFeeNotify("both");
  };

  // ── Create salary ──────────────────────────────────────────────────────────

  const handleCreateSalary = async () => {
    if (!selectedStaffId || !basicSalary) return;
    setSalSubmitting(true);
    try {
      await api.post("/api/payroll/salary-config", {
        staffId: selectedStaffId,
        staffModel,
        basicSalary: Number(basicSalary),
        allowances: {
          houseRent: Number(houseRent),
          transport: Number(transport),
          medical: Number(medical),
        },
        pfRate: Number(pfRate),
        taxRate: Number(taxRate),
      });
      await api.post("/api/payroll/generate", {
        staffId: selectedStaffId,
        staffModel,
        month: salMonth,
        year: salYear,
        absentDays: Number(absentDays),
      });
      setShowSalaryModal(false);
      resetSalaryModal();
      await loadPayrolls();
    } catch (e: any) { alert(e?.response?.data?.message ?? "Create salary failed"); }
    finally { setSalSubmitting(false); }
  };

  const resetSalaryModal = () => {
    setSelectedStaffId(""); setBasicSalary(""); setHouseRent("0");
    setTransport("0"); setMedical("0"); setPfRate("10"); setTaxRate("5"); setAbsentDays("0");
  };

  // ── Mark paid ──────────────────────────────────────────────────────────────

  const handleMarkPaid = async (id: string) => {
    try {
      await api.put(`/api/payroll/${id}/mark-paid`, { paymentMethod: "cash" });
      await loadPayrolls();
    } catch (e: any) { alert(e?.response?.data?.message ?? "Failed"); }
  };

  // ── Derived ────────────────────────────────────────────────────────────────

  const filteredFees = fees.filter((f) => {
    const name = f.studentId?.userId?.fullName?.toLowerCase() ?? "";
    const q = feeSearch.toLowerCase();
    return (
      (name.includes(q) || f.title.toLowerCase().includes(q)) &&
      (feeStatusFilter === "All" || f.status === feeStatusFilter)
    );
  });

  const filteredStudents = allStudents.filter((s) => {
    const q = studentQuery.toLowerCase();
    return (
      s.userId.fullName.toLowerCase().includes(q) ||
      s.userId.email.toLowerCase().includes(q) ||
      (s.admissionNumber ?? "").toLowerCase().includes(q)
    );
  });

  const totalCollected = fees.reduce((a, f) => a + f.paidAmount, 0);
  const totalDue = fees.reduce((a, f) => a + f.remainingAmount, 0);
  const totalInvoiced = fees.reduce((a, f) => a + f.totalAmount, 0);

  const feeStatusBadge = (s: string) =>
    s === "paid" ? "bg-emerald-50 text-emerald-600 border-emerald-100"
    : s === "partial" ? "bg-amber-50 text-amber-600 border-amber-100"
    : "bg-rose-50 text-rose-600 border-rose-100";

  const payStatusBadge = (s: string) =>
    s === "paid" ? "bg-emerald-50 text-emerald-600 border-emerald-100"
    : "bg-amber-50 text-amber-600 border-amber-100";

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="w-full bg-slate-50 min-h-screen p-6 font-sans text-slate-800">
      <div className="max-w-5xl mx-auto flex flex-col gap-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-600 text-white rounded-xl shadow-md"><Wallet size={22} /></div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Billing & Payroll Engine</h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Manage student fee ledgers and staff salary disbursements</p>
            </div>
          </div>
          <div className="flex gap-2 self-start sm:self-center">
            {tab === "fees" ? (
              <button onClick={() => setShowFeeModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all">
                <Plus size={14} /> Create Fee
              </button>
            ) : (
              <button onClick={() => setShowSalaryModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all">
                <Plus size={14} /> Generate Salary
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-slate-100 rounded-2xl p-1 shadow-sm w-fit">
          {(["fees", "payroll"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${tab === t ? "bg-slate-900 text-white shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>
              {t === "fees" ? "Student Fees" : "Staff Payroll"}
            </button>
          ))}
        </div>

        {/* ── FEE TAB ─────────────────────────────────────────────────────────── */}
        {tab === "fees" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: <CheckCircle size={18} />, color: "emerald", label: "Total Collected", value: `Rs. ${totalCollected.toLocaleString()}` },
                { icon: <AlertTriangle size={18} />, color: "rose", label: "Outstanding Dues", value: `Rs. ${totalDue.toLocaleString()}` },
                { icon: <CreditCard size={18} />, color: "blue", label: "Total Invoiced", value: `Rs. ${totalInvoiced.toLocaleString()}` },
              ].map(({ icon, color, label, value }) => (
                <div key={label} className="bg-white border border-slate-100 shadow-sm rounded-2xl p-4 flex items-center gap-3.5">
                  <div className={`p-3 bg-${color}-50 text-${color}-600 rounded-xl`}>{icon}</div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">{label}</span>
                    <h4 className="text-base font-bold text-slate-800">{value}</h4>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-8 relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type="text" placeholder="Search by student name or fee title..."
                  value={feeSearch} onChange={(e) => setFeeSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 focus:border-blue-500 rounded-xl text-xs font-medium outline-none transition-all shadow-sm" />
              </div>
              <div className="md:col-span-4 relative">
                <select value={feeStatusFilter} onChange={(e) => setFeeStatusFilter(e.target.value)}
                  className="w-full pl-4 pr-8 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl text-xs outline-none cursor-pointer shadow-sm appearance-none">
                  <option value="All">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="partial">Partial</option>
                  <option value="paid">Paid</option>
                </select>
                <SlidersHorizontal className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              {feeLoading ? (
                <div className="py-16 flex items-center justify-center text-slate-400 text-sm">
                  <Loader2 size={18} className="animate-spin mr-2" /> Loading fees...
                </div>
              ) : feeError ? (
                <div className="py-12 text-center text-rose-500 text-sm font-semibold">{feeError}</div>
              ) : (
                <div className="w-full overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-187.5">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 text-xs uppercase tracking-wider">
                        <th className="py-3 px-5 font-medium">Student</th>
                        <th className="py-3 font-medium">Fee Title</th>
                        <th className="py-3 font-medium">Total</th>
                        <th className="py-3 font-medium">Paid</th>
                        <th className="py-3 font-medium">Due</th>
                        <th className="py-3 font-medium">Due Date</th>
                        <th className="py-3 text-center font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-xs">
                      {filteredFees.map((f) => (
                        <tr key={f._id} className="hover:bg-slate-50/40 transition-colors">
                          <td className="py-3.5 px-5">
                            <div className="font-bold text-slate-700">{f.studentId?.userId?.fullName ?? "—"}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {f.studentId?.userId?.email ?? "—"}
                              {f.studentId?.admissionNumber && ` • Adm: ${f.studentId.admissionNumber}`}
                              {f.studentId?.class && ` • Class ${f.studentId.class} ${f.studentId.section}`}
                            </div>
                          </td>
                          <td className="py-3.5 font-semibold text-slate-700">{f.title}</td>
                          <td className="py-3.5 font-semibold text-slate-600">Rs. {f.totalAmount.toLocaleString()}</td>
                          <td className="py-3.5 font-bold text-emerald-600">Rs. {f.paidAmount.toLocaleString()}</td>
                          <td className="py-3.5 font-bold text-rose-600">Rs. {f.remainingAmount.toLocaleString()}</td>
                          <td className="py-3.5 text-slate-500">{new Date(f.dueDate).toLocaleDateString("en-NP")}</td>
                          <td className="py-3.5 text-center">
                            <span className={`font-bold px-2.5 py-0.5 rounded-full border text-[10px] capitalize ${feeStatusBadge(f.status)}`}>{f.status}</span>
                          </td>
                        </tr>
                      ))}
                      {filteredFees.length === 0 && (
                        <tr><td colSpan={7} className="text-center py-12 text-slate-400 font-medium">No fee records found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* ── PAYROLL TAB ──────────────────────────────────────────────────────── */}
        {tab === "payroll" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: <Banknote size={18} />, color: "blue", label: "Total Salary Bill", value: `Rs. ${payrollSummary.totalNetSalary.toLocaleString()}` },
                { icon: <CheckCircle size={18} />, color: "emerald", label: "Total Paid", value: `Rs. ${payrollSummary.totalPaid.toLocaleString()}` },
                { icon: <Clock size={18} />, color: "amber", label: "Pending", value: `Rs. ${payrollSummary.totalPending.toLocaleString()}` },
              ].map(({ icon, color, label, value }) => (
                <div key={label} className="bg-white border border-slate-100 shadow-sm rounded-2xl p-4 flex items-center gap-3.5">
                  <div className={`p-3 bg-${color}-50 text-${color}-600 rounded-xl`}>{icon}</div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">{label}</span>
                    <h4 className="text-base font-bold text-slate-800">{value}</h4>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              {payrollLoading ? (
                <div className="py-16 flex items-center justify-center text-slate-400 text-sm">
                  <Loader2 size={18} className="animate-spin mr-2" /> Loading payrolls...
                </div>
              ) : payrollError ? (
                <div className="py-12 text-center text-rose-500 text-sm font-semibold">{payrollError}</div>
              ) : (
                <div className="w-full overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-200">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 text-xs uppercase tracking-wider">
                        <th className="py-3 px-5 font-medium">Staff</th>
                        <th className="py-3 font-medium">Role</th>
                        <th className="py-3 font-medium">Period</th>
                        <th className="py-3 font-medium">Gross</th>
                        <th className="py-3 font-medium">Deductions</th>
                        <th className="py-3 font-medium">Net Salary</th>
                        <th className="py-3 text-center font-medium">Status</th>
                        <th className="py-3 pr-5 text-right font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-xs">
                      {payrolls.map((p) => (
                        <tr key={p._id} className="hover:bg-slate-50/40 transition-colors">
                          <td className="py-3.5 px-5">
                            <div className="font-bold text-slate-700">{p.staff?.name ?? "—"}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">{p.staff?.email ?? "—"}</div>
                          </td>
                          <td className="py-3.5">
                            <span className="font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md text-[10px]">{p.staffModel}</span>
                          </td>
                          <td className="py-3.5 font-semibold text-slate-600">{MONTHS[p.month]} {p.year}</td>
                          <td className="py-3.5 font-semibold text-slate-600">Rs. {p.grossSalary?.toLocaleString()}</td>
                          <td className="py-3.5 font-semibold text-rose-500">- Rs. {p.totalDeductions?.toLocaleString()}</td>
                          <td className="py-3.5 font-bold text-slate-800">Rs. {p.netSalary?.toLocaleString()}</td>
                          <td className="py-3.5 text-center">
                            <span className={`font-bold px-2.5 py-0.5 rounded-full border text-[10px] capitalize ${payStatusBadge(p.status)}`}>{p.status}</span>
                          </td>
                          <td className="py-3.5 pr-5 text-right">
                            {p.status === "pending" && (
                              <button onClick={() => handleMarkPaid(p._id)}
                                className="text-[10px] font-bold px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg transition-all">
                                Mark Paid
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {payrolls.length === 0 && (
                        <tr><td colSpan={8} className="text-center py-12 text-slate-400 font-medium">No payroll records found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* ── FEE MODAL ────────────────────────────────────────────────────────── */}
      {showFeeModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-lg w-full overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between sticky top-0">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2"><ReceiptText size={15} /> Create Student Fee</h3>
              <button onClick={() => { setShowFeeModal(false); resetFeeModal(); }} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <div className="p-5 flex flex-col gap-4 text-xs">

              {/* Student picker */}
              <div>
                <label className="block uppercase font-bold text-slate-400 tracking-wider mb-1.5">Select Student</label>
                {!selectedStudent ? (
                  <>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={13} />
                      <input type="text" placeholder="Search by name, email or admission no..."
                        value={studentQuery} onChange={(e) => setStudentQuery(e.target.value)}
                        className="w-full pl-8 pr-4 py-2.5 bg-white border border-slate-200 focus:border-blue-500 rounded-xl font-medium outline-none transition-all" />
                    </div>
                    {studentQuery.length > 0 && (
                      <div className="mt-1.5 border border-slate-200 rounded-xl bg-white shadow-sm max-h-44 overflow-y-auto">
                        {filteredStudents.length === 0 ? (
                          <div className="px-3 py-4 text-center text-[10px] text-slate-400">No students found</div>
                        ) : filteredStudents.map((s) => (
                          <button key={s._id} onClick={() => { setSelectedStudent(s); setStudentQuery(""); }}
                            className="w-full text-left px-3 py-2.5 hover:bg-blue-50 transition-colors border-b border-slate-50 last:border-0">
                            <div className="font-bold text-slate-700">{s.userId.fullName}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {s.userId.email} • Class {s.class} {s.section}
                              {s.admissionNumber && ` • Adm: ${s.admissionNumber}`}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-xl">
                    <div>
                      <div className="font-bold text-blue-700">{selectedStudent.userId.fullName}</div>
                      <div className="text-[10px] text-blue-400 mt-0.5">
                        {selectedStudent.userId.email} • Class {selectedStudent.class} {selectedStudent.section}
                        {selectedStudent.admissionNumber && ` • Adm: ${selectedStudent.admissionNumber}`}
                      </div>
                    </div>
                    <button onClick={() => setSelectedStudent(null)} className="text-blue-400 hover:text-blue-600 ml-2 shrink-0"><X size={14} /></button>
                  </div>
                )}
              </div>

              <div>
                <label className="block uppercase font-bold text-slate-400 tracking-wider mb-1.5">Fee Title</label>
                <input type="text" placeholder="e.g., Tuition Fee - Term 1" value={feeTitle}
                  onChange={(e) => setFeeTitle(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 focus:border-blue-500 rounded-xl font-medium outline-none transition-all" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase font-bold text-slate-400 tracking-wider mb-1.5">Amount (Rs.)</label>
                  <input type="number" placeholder="e.g., 15000" value={feeAmount}
                    onChange={(e) => setFeeAmount(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 focus:border-blue-500 rounded-xl font-bold outline-none transition-all" />
                </div>
                <div>
                  <label className="block uppercase font-bold text-slate-400 tracking-wider mb-1.5">Due Date</label>
                  <input type="date" value={feeDueDate} onChange={(e) => setFeeDueDate(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 focus:border-blue-500 rounded-xl font-medium outline-none transition-all" />
                </div>
              </div>

              <div>
                <label className="block uppercase font-bold text-slate-400 tracking-wider mb-1.5">Description (optional)</label>
                <input type="text" placeholder="Additional notes..." value={feeDesc}
                  onChange={(e) => setFeeDesc(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 focus:border-blue-500 rounded-xl font-medium outline-none transition-all" />
              </div>

              <div>
                <label className="block uppercase font-bold text-slate-400 tracking-wider mb-1.5">Notify</label>
                <select value={feeNotify} onChange={(e) => setFeeNotify(e.target.value as any)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 outline-none">
                  <option value="both">Student + Parent</option>
                  <option value="student">Student Only</option>
                  <option value="parent">Parent Only</option>
                  <option value="none">No Notification</option>
                </select>
              </div>

              <button onClick={handleCreateFee}
                disabled={feeSubmitting || !selectedStudent || !feeTitle || !feeAmount || !feeDueDate}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl font-bold shadow-md transition-all mt-1">
                {feeSubmitting ? "Creating..." : "Create Fee & Notify"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SALARY MODAL ─────────────────────────────────────────────────────── */}
      {showSalaryModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-lg w-full overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between sticky top-0">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2"><Banknote size={15} /> Generate Staff Salary</h3>
              <button onClick={() => { setShowSalaryModal(false); resetSalaryModal(); }} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <div className="p-5 flex flex-col gap-4 text-xs">

              {/* Staff type toggle */}
              <div>
                <label className="block uppercase font-bold text-slate-400 tracking-wider mb-1.5">Staff Type</label>
                <div className="flex gap-2">
                  {(["Teacher", "Admin", "Receptionist"] as const).map((t) => (
                    <button key={t} onClick={() => { setStaffModel(t); setSelectedStaffId(""); }}
                      className={`flex-1 py-2 rounded-xl font-bold border text-[10px] transition-all ${staffModel === t ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-500 border-slate-200"}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Teacher picker */}
              {staffModel === "Teacher" && (
                <div>
                  <label className="block uppercase font-bold text-slate-400 tracking-wider mb-1.5">Select Teacher</label>
                  <div className="border border-slate-200 rounded-xl bg-white max-h-44 overflow-y-auto">
                    {teachers.length === 0 ? (
                      <div className="px-3 py-4 text-center text-[10px] text-slate-400">No teachers found</div>
                    ) : teachers.map((t) => (
                      <button key={t._id} onClick={() => setSelectedStaffId(t._id)}
                        className={`w-full text-left px-3 py-2.5 hover:bg-blue-50 transition-colors border-b border-slate-50 last:border-0 ${selectedStaffId === t._id ? "bg-blue-50 border-l-2 border-l-blue-500" : ""}`}>
                        <div className="font-bold text-slate-700">{t.userId.fullName}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {t.userId.email} • ID: {t.employeeId} • {t.department}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Admin picker */}
              {staffModel === "Admin" && (
                <div>
                  <label className="block uppercase font-bold text-slate-400 tracking-wider mb-1.5">Select Admin</label>
                  <div className="border border-slate-200 rounded-xl bg-white max-h-44 overflow-y-auto">
                    {admins.length === 0 ? (
                      <div className="px-3 py-4 text-center text-[10px] text-slate-400">No admins found</div>
                    ) : admins.map((a) => (
                      <button key={a._id} onClick={() => setSelectedStaffId(a._id)}
                        className={`w-full text-left px-3 py-2.5 hover:bg-blue-50 transition-colors border-b border-slate-50 last:border-0 ${selectedStaffId === a._id ? "bg-blue-50 border-l-2 border-l-blue-500" : ""}`}>
                        <div className="font-bold text-slate-700">{a.fullName}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {a.email}
                          {a.employeeId && ` • ID: ${a.employeeId}`}
                          {a.isActive === false && <span className="ml-1 text-rose-400">• Inactive</span>}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Receptionist picker */}
              {staffModel === "Receptionist" && (
                <div>
                  <label className="block uppercase font-bold text-slate-400 tracking-wider mb-1.5">Select Receptionist</label>
                  <div className="border border-slate-200 rounded-xl bg-white max-h-44 overflow-y-auto">
                    {receptionists.length === 0 ? (
                      <div className="px-3 py-4 text-center text-[10px] text-slate-400">No receptionists found</div>
                    ) : receptionists.map((r) => (
                      <button key={r._id} onClick={() => setSelectedStaffId(r._id)}
                        className={`w-full text-left px-3 py-2.5 hover:bg-blue-50 transition-colors border-b border-slate-50 last:border-0 ${selectedStaffId === r._id ? "bg-blue-50 border-l-2 border-l-blue-500" : ""}`}>
                        <div className="font-bold text-slate-700">{r.userId?.fullName ?? "—"}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {r.userId?.email ?? "—"}
                          {r.phone && ` • ${r.phone}`}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected staff confirmation */}
              {selectedStaffId && (
                <div className="flex items-center justify-between p-2.5 bg-blue-50 border border-blue-200 rounded-xl">
                  <span className="text-[10px] font-bold text-blue-600">
                    ✓ Staff selected
                    {staffModel === "Teacher" && (() => { const t = teachers.find(x => x._id === selectedStaffId); return t ? ` — ${t.userId.fullName}` : ""; })()}
                    {staffModel === "Admin" && (() => { const a = admins.find(x => x._id === selectedStaffId); return a ? ` — ${a.fullName}` : ""; })()}
                    {staffModel === "Receptionist" && (() => { const r = receptionists.find(x => x._id === selectedStaffId); return r ? ` — ${r.userId?.fullName}` : ""; })()}
                  </span>
                  <button onClick={() => setSelectedStaffId("")} className="text-blue-400 hover:text-blue-600"><X size={13} /></button>
                </div>
              )}

              {/* Period */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase font-bold text-slate-400 tracking-wider mb-1.5">Month</label>
                  <select value={salMonth} onChange={(e) => setSalMonth(Number(e.target.value))}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 outline-none">
                    {MONTHS.slice(1).map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block uppercase font-bold text-slate-400 tracking-wider mb-1.5">Year</label>
                  <input type="number" value={salYear} onChange={(e) => setSalYear(Number(e.target.value))}
                    className="w-full p-2.5 bg-white border border-slate-200 focus:border-blue-500 rounded-xl font-bold outline-none transition-all" />
                </div>
              </div>

              {/* Basic salary */}
              <div>
                <label className="block uppercase font-bold text-slate-400 tracking-wider mb-1.5">Basic Salary (Rs.)</label>
                <input type="number" placeholder="e.g., 25000" value={basicSalary}
                  onChange={(e) => setBasicSalary(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 focus:border-blue-500 rounded-xl font-bold outline-none transition-all" />
              </div>

              {/* Allowances */}
              <div>
                <label className="block uppercase font-bold text-slate-400 tracking-wider mb-1.5">Allowances (Rs.)</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "House Rent", val: houseRent, set: setHouseRent },
                    { label: "Transport", val: transport, set: setTransport },
                    { label: "Medical", val: medical, set: setMedical },
                  ].map(({ label, val, set }) => (
                    <div key={label}>
                      <label className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">{label}</label>
                      <input type="number" value={val} onChange={(e) => set(e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-200 focus:border-blue-500 rounded-xl font-bold outline-none transition-all" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Deduction config */}
              <div>
                <label className="block uppercase font-bold text-slate-400 tracking-wider mb-1.5">Deduction Config</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "PF Rate %", val: pfRate, set: setPfRate },
                    { label: "Tax Rate %", val: taxRate, set: setTaxRate },
                    { label: "Absent Days", val: absentDays, set: setAbsentDays },
                  ].map(({ label, val, set }) => (
                    <div key={label}>
                      <label className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">{label}</label>
                      <input type="number" value={val} onChange={(e) => set(e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-200 focus:border-blue-500 rounded-xl font-bold outline-none transition-all" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-[10px] text-slate-400 bg-slate-50 p-3 rounded-xl border border-slate-100">
                ✉️ Staff will receive email + in-app notification after salary is generated.
              </div>

              <button onClick={handleCreateSalary}
                disabled={salSubmitting || !selectedStaffId || !basicSalary}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl font-bold shadow-md transition-all">
                {salSubmitting ? "Generating..." : "Generate & Notify Staff"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}