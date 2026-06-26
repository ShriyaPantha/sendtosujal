// src/pages/teacher/TeacherAssignments.tsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Plus, Search, FileText, Clock, X } from "lucide-react";

// Synchronized classes
const CLASSES = [
  { subject: "Data Structures",     batch: "BCA 3rd Sem" },
  { subject: "DBMS",                batch: "CSIT 3rd Sem" },
  { subject: "Algorithms",          batch: "BIT 5th Sem" },
  { subject: "Advanced Programming", batch: "BCA 1st Sem" },
];

const INITIAL_ASSIGNMENTS = [
  { id: 1, title: "DBMS Mid-Term Assignment",         subject: "DBMS",             batch: "CSIT 3rd Sem", due: "2026-06-10", submissions: 18, total: 22, status: "Active" },
  { id: 2, title: "Data Structures Lab Report",       subject: "Data Structures",  batch: "BCA 3rd Sem",  due: "2026-06-12", submissions: 12, total: 20, status: "Active" },
  { id: 3, title: "Algorithms Complexity Analysis",   subject: "Algorithms",       batch: "BIT 5th Sem",  due: "2026-06-15", submissions: 5,  total: 18, status: "Active" },
  { id: 4, title: "ER Diagram Assignment",            subject: "DBMS",             batch: "CSIT 3rd Sem", due: "2026-06-05", submissions: 22, total: 22, status: "Graded" },
];

const INITIAL_SUBMISSIONS = [
  { id: 1, student: "Aarav Sharma",   roll: "BCA-301", assignment: "Data Structures Lab Report", submitted: "Jun 7, 9:30 AM",  grade: null,  status: "Submitted" },
  { id: 2, student: "Priya Tamang",   roll: "CST-301", assignment: "DBMS Mid-Term Assignment",         submitted: "Jun 6, 4:00 PM",  grade: "A",   status: "Graded" },
  { id: 3, student: "Bikash Gurung",  roll: "BIT-301", assignment: "Algorithms Complexity Analysis",   submitted: "Jun 7, 8:15 AM",  grade: null,  status: "Late" },
  { id: 4, student: "Sita Adhikari",  roll: "BCA-304", assignment: "Data Structures Lab Report",       submitted: "Jun 6, 2:30 PM",  grade: "B+",  status: "Graded" },
  { id: 5, student: "Raju Shrestha",  roll: "BCA-305", assignment: "Data Structures Lab Report",       submitted: "Jun 5, 11:00 AM", grade: null,  status: "Submitted" },
];

const statusStyles: Record<string, string> = {
  Active:    "bg-indigo-50 text-indigo-700 border-indigo-100",
  Graded:    "bg-emerald-50 text-emerald-700 border-emerald-100",
  Submitted: "bg-blue-50 text-blue-600 border-blue-100",
  Late:      "bg-amber-50 text-amber-600 border-amber-100",
};

const Assignments = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"assignments" | "submissions">("assignments");
  const [search, setSearch] = useState("");
  const [showNewModal, setShowNewModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState("All");

  // Input states for creating a new assignment
  const [newTitle, setNewTitle] = useState("");
  const [selectedClassIndex, setSelectedClassIndex] = useState(0);
  const [newDueDate, setNewDueDate] = useState("");
  const [newDesc, setNewDesc] = useState("");

  // Grade Input States
  const [gradingId, setGradingId] = useState<number | null>(null);
  const [gradeValue, setGradeValue] = useState("");

  // Core Data Lists loaded from localStorage or defaults
  const [assignments, setAssignments] = useState(() => {
    const saved = localStorage.getItem("teacher_assignments_list");
    return saved ? JSON.parse(saved) : INITIAL_ASSIGNMENTS;
  });

  const [submissions, setSubmissions] = useState(() => {
    const saved = localStorage.getItem("teacher_submissions_list");
    return saved ? JSON.parse(saved) : INITIAL_SUBMISSIONS;
  });

  // Save to cache whenever data updates
  useEffect(() => {
    localStorage.setItem("teacher_assignments_list", JSON.stringify(assignments));
  }, [assignments]);

  useEffect(() => {
    localStorage.setItem("teacher_submissions_list", JSON.stringify(submissions));
  }, [submissions]);

  // Handle adding a new assignment row
  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDueDate) return;

    const classDetails = CLASSES[selectedClassIndex];
    const newRecord = {
      id: Date.now(),
      title: newTitle,
      subject: classDetails.subject,
      batch: classDetails.batch,
      due: newDueDate,
      submissions: 0,
      total: 20, // default student count
      status: "Active",
    };

    setAssignments([newRecord, ...assignments]);
    
    // Reset form fields and hide popup modal
    setNewTitle("");
    setNewDueDate("");
    setNewDesc("");
    setShowNewModal(false);
  };

  // Handle submitting a grade value for a student
  const handleSaveGrade = (subId: number) => {
    if (!gradeValue.trim()) return;
    setSubmissions(
      submissions.map((sub: any) =>
        sub.id === subId ? { ...sub, grade: gradeValue.toUpperCase(), status: "Graded" } : sub
      )
    );
    setGradingId(null);
    setGradeValue("");
  };

  // Filter conditions
  const filteredAssignments = assignments.filter((a: any) => {
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase()) || a.subject.toLowerCase().includes(search.toLowerCase());
    const matchTab = filterStatus === "All" || a.status === filterStatus;
    return matchSearch && matchTab;
  });

  const filteredSubmissions = submissions.filter((s: any) =>
    s.student.toLowerCase().includes(search.toLowerCase()) ||
    s.assignment.toLowerCase().includes(search.toLowerCase()) ||
    s.roll.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 w-full">
      
      {/* Top Navbar Header */}
      <header className="bg-white border-b border-slate-200 h-14 flex items-center px-4 sm:px-6 sticky top-0 z-10 justify-between w-full">
        <div className="flex items-center gap-1">
          <button 
            onClick={() => navigate("/teacher/dashboard")} 
            className="text-slate-400 hover:text-slate-600 text-xs flex items-center gap-1 bg-transparent border-none outline-none cursor-pointer"
          >
            Dashboard <ChevronRight size={12} />
          </button>
          <span className="text-xs font-semibold text-slate-700">Assignments</span>
        </div>
        
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-1.5 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-xl hover:bg-slate-800 transition-colors font-bold shadow-sm"
        >
          <Plus size={13} /> New Assignment
        </button>
      </header>

      <div className="p-4 sm:p-6 max-w-[1100px] mx-auto space-y-4 w-full">
        
        {/* Controls Layout Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3 border border-slate-200 rounded-2xl shadow-sm">
          {/* Tab Button Toggle controls */}
          <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
            {(["assignments", "submissions"] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setSearch(""); }}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all capitalize ${
                  tab === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 flex-1 justify-end w-full">
            {/* Live Data Search Filter */}
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 gap-2 w-full md:max-w-xs focus-within:bg-white focus-within:border-blue-500 transition-all">
              <Search size={13} className="text-slate-400 shrink-0" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent text-xs outline-none w-full text-slate-700 placeholder:text-slate-400"
                placeholder={tab === "assignments" ? "Search assignments..." : "Search by student name or roll..."}
              />
            </div>

            {/* Quick Status Pill Filter Options */}
            {tab === "assignments" && (
              <div className="flex items-center gap-1 bg-slate-50 p-1 border border-slate-200 rounded-xl">
                {["All", "Active", "Graded"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilterStatus(f)}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${
                      filterStatus === f ? "bg-slate-900 text-white shadow-sm" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ASSIGNMENTS VIEW TAB */}
        {tab === "assignments" && (
          <div className="grid gap-3 w-full">
            {filteredAssignments.map((assignmentItem: any) => {
              const progressPercentage = Math.round((assignmentItem.submissions / assignmentItem.total) * 100);
              return (
                <div key={assignmentItem.id} className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 hover:border-slate-300 transition-all shadow-sm flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-3 w-full">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0 border border-indigo-100">
                        <FileText size={15} className="text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-slate-800">{assignmentItem.title}</h3>
                        <p className="text-[10px] font-medium text-slate-400 mt-0.5">
                          {assignmentItem.subject} · <span className="text-slate-500 font-semibold">{assignmentItem.batch}</span>
                        </p>
                      </div>
                    </div>
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-md font-bold border ${statusStyles[assignmentItem.status]}`}>
                      {assignmentItem.status}
                    </span>
                  </div>

                  {/* Horizontal Data Metrics Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-3.5 mt-1 w-full">
                    <div className="flex items-center gap-6">
                      <div>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Due Date</span>
                        <div className="text-[11px] font-bold text-slate-600 flex items-center gap-1 mt-0.5">
                          <Clock size={11} className="text-slate-400 shrink-0" /> 
                          {assignmentItem.due}
                        </div>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Turned In</span>
                        <span className="text-[11px] font-mono font-bold text-slate-700 mt-0.5 block">
                          {assignmentItem.submissions} / {assignmentItem.total} students
                        </span>
                      </div>
                    </div>

                    {/* Progress Fill Indicator Line */}
                    <div className="w-full sm:w-44">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Total Turned In</span>
                        <span className="text-[10px] font-mono font-bold text-indigo-600">{progressPercentage}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden w-full">
                        <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${progressPercentage}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredAssignments.length === 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-400 font-medium text-xs">
                No assignments found matching your filter selection.
              </div>
            )}
          </div>
        )}

        {/* SUBMISSIONS GRADING TABLE VIEW TAB */}
        {tab === "submissions" && (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm w-full">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="px-5 py-3">Student Info</th>
                    <th className="px-5 py-3">Assignment Title</th>
                    <th className="px-5 py-3">Turn In Date</th>
                    <th className="px-5 py-3 text-center">Score Card</th>
                    <th className="px-5 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredSubmissions.map((submissionItem: any) => (
                    <tr key={submissionItem.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-bold text-slate-800">{submissionItem.student}</p>
                        <p className="text-[10px] font-mono text-slate-400 mt-0.5">Roll ID: {submissionItem.roll}</p>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 font-medium max-w-[240px] truncate">
                        {submissionItem.assignment}
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 font-medium">{submissionItem.submitted}</td>
                      <td className="px-5 py-3.5 text-center">
                        {submissionItem.grade ? (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-lg font-bold text-[11px]">
                            Grade: {submissionItem.grade}
                          </span>
                        ) : gradingId === submissionItem.id ? (
                          // Inline score input box
                          <div className="flex items-center justify-center gap-1.5">
                            <input
                              autoFocus
                              value={gradeValue}
                              onChange={(e) => setGradeValue(e.target.value)}
                              className="w-12 text-center p-1 border border-indigo-400 bg-white rounded-lg text-xs outline-none uppercase font-bold text-slate-800"
                              placeholder="A+"
                              maxLength={3}
                            />
                            <button
                              onClick={() => handleSaveGrade(submissionItem.id)}
                              className="bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-md hover:bg-slate-800"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => { setGradingId(null); setGradeValue(""); }}
                              className="text-slate-400 hover:text-slate-600 p-0.5"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setGradingId(submissionItem.id)}
                            className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline bg-indigo-50/60 px-2.5 py-1 rounded-lg border border-indigo-100 transition-all text-[11px]"
                          >
                            Add Grade
                          </button>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${statusStyles[submissionItem.status]}`}>
                          {submissionItem.status}
                        </span>
                      </td>
                    </tr>
                  ))}

                  {filteredSubmissions.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-5 py-10 text-center text-slate-400 font-medium text-xs">
                        No submittal logs matching query filter found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* POPUP MODAL COMPONENT: CREATE ASSIGNMENT FORM */}
      {showNewModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-slate-100 overflow-hidden transform transition-all">
            
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-xs font-bold text-slate-800">Add New Student Task</h3>
              <button 
                onClick={() => setShowNewModal(false)} 
                className="p-1 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-lg transition-colors bg-transparent border-none outline-none cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="p-5 space-y-3.5">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Assignment Title</label>
                <input
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full border border-slate-200 bg-slate-50 focus:bg-white rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500 transition-all text-slate-800 font-medium"
                  placeholder="e.g., SQL Query Optimization Paper"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Assign to Class Group</label>
                <select
                  value={selectedClassIndex}
                  onChange={(e) => setSelectedClassIndex(Number(e.target.value))}
                  className="w-full border border-slate-200 bg-slate-50 focus:bg-white rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500 transition-all text-slate-700 font-medium cursor-pointer"
                >
                  {CLASSES.map((cls, idx) => (
                    <option key={idx} value={idx}>
                      {cls.subject} ({cls.batch})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Due Calendar Date</label>
                <input
                  required
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full border border-slate-200 bg-slate-50 focus:bg-white rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500 transition-all text-slate-700 font-medium cursor-pointer"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Instructions (Optional)</label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full border border-slate-200 bg-slate-50 focus:bg-white rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500 transition-all text-slate-800 font-medium resize-none placeholder:text-slate-400"
                  placeholder="Provide details about submission file formats..."
                />
              </div>

              <div className="flex gap-2.5 pt-3 border-t border-slate-100 mt-4">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="flex-1 border border-slate-200 text-slate-600 text-xs py-2 rounded-xl hover:bg-slate-50 font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-slate-900 text-white text-xs py-2 rounded-xl hover:bg-slate-800 font-bold transition-colors shadow-sm cursor-pointer"
                >
                  Create Task
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
};

export default Assignments;