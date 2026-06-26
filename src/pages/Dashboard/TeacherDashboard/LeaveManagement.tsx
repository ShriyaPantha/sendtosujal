import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, CalendarDays, History, Bell, CheckCircle2 } from "lucide-react";

const LeaveManagement = () => {
  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];

  // State for form data, status message, and the list of leaves
  const [formData, setFormData] = useState({ type: "Sick Leave", start: "", end: "", reason: "" });
  const [previousLeaves, setPreviousLeaves] = useState<any[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.start || !formData.reason) return;

    // Add new request to the list
    const newEntry = { 
      type: formData.type, 
      dates: `${formData.start} ${formData.end ? "to " + formData.end : ""}`, 
      status: "Pending" 
    };
    
    setPreviousLeaves([newEntry, ...previousLeaves]);
    setShowSuccess(true);
    
    // Hide success message after 5 seconds
    setTimeout(() => setShowSuccess(false), 5000);
  };

  return (
    <div className="w-full flex flex-col h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 h-14 flex items-center px-4 md:px-8 gap-2 shrink-0">
        <button onClick={() => navigate("/teacher/dashboard")} className="text-blue-600 text-sm flex items-center gap-1 hover:underline">
          Dashboard <ChevronRight size={14} />
        </button>
        <span className="text-sm text-slate-600">Leave Management</span>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
        
        {/* Success Alert Banner */}
        {showSuccess && (
          <div className="max-w-4xl mx-auto bg-blue-50 border border-blue-200 p-4 rounded-lg flex items-center gap-3">
            <CheckCircle2 className="text-blue-600" size={20} />
            <p className="text-sm text-blue-800">Your leave request has been submitted successfully and is now pending approval.</p>
          </div>
        )}

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white p-6 rounded-lg border border-slate-200">
            <h2 className="text-base text-slate-700 mb-5 flex items-center gap-2">
              <CalendarDays size={18} className="text-blue-600" /> Apply for Leave
            </h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <select onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-sm text-slate-600 focus:border-blue-500 focus:outline-none">
                <option>Sick Leave</option>
                <option>Casual Leave</option>
                <option>Emergency Leave</option>
              </select>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input type="date" min={today} onChange={(e) => setFormData({...formData, start: e.target.value})} className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-sm text-slate-600 focus:border-blue-500 focus:outline-none" />
                <input type="date" min={today} onChange={(e) => setFormData({...formData, end: e.target.value})} className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-sm text-slate-600 focus:border-blue-500 focus:outline-none" />
              </div>
              <textarea placeholder="Reason..." onChange={(e) => setFormData({...formData, reason: e.target.value})} className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-sm text-slate-600 h-20 focus:border-blue-500 focus:outline-none" />
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded text-sm hover:bg-blue-700">Submit Application</button>
            </form>
          </div>

          <div className="bg-white p-6 rounded-lg border border-slate-200 h-fit">
            <h3 className="text-sm text-slate-700 mb-3">Policy Note</h3>
            <ul className="text-xs text-slate-500 space-y-2 list-disc pl-4">
              {/* <li>Past dates are disabled.</li> */}
              <li>Leave end date blank for 1-day leave.</li>
            </ul>
          </div>
        </div>

        {/* Dynamic Records Table */}
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg border border-slate-200">
          <h2 className="text-base text-slate-700 mb-5 flex items-center gap-2">
            <History size={18} className="text-blue-600" /> Previous Leave Records
          </h2>
          {previousLeaves.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">No leave records submitted yet.</div>
          ) : (
            <table className="w-full text-left text-sm text-slate-600">
              <thead><tr className="text-xs text-slate-500 uppercase border-b"><th className="pb-3">Type</th><th className="pb-3">Dates</th><th className="pb-3">Status</th></tr></thead>
              <tbody>
                {previousLeaves.map((leave, i) => (
                  <tr key={i} className="border-b last:border-0"><td className="py-3">{leave.type}</td><td className="py-3">{leave.dates}</td><td className="py-3 text-blue-600 font-medium">{leave.status}</td></tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
};

export default LeaveManagement;