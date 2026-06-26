// src/pages/Dashboard/ParentDashboard/Fees.tsx
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, Clock, CreditCard, AlertCircle } from "lucide-react";
import { useDataStore } from "./DataStore";

const Fees = () => {
  const navigate = useNavigate();
  const { studentName, fees, pendingFees } = useDataStore();

  const totalPaid = fees.filter(f => f.paid).reduce((s, f) => s + f.amount, 0);
  const unpaidFees = fees.filter(f => !f.paid);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">

        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/parent")}
            className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors">
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-slate-800">Fee Summary</h1>
            <p className="text-xs text-slate-500">{studentName}</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 text-center">
            <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">Total Paid</p>
            <p className="text-xl font-semibold text-emerald-600">${totalPaid}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 text-center">
            <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">Pending</p>
            <p className="text-xl font-semibold text-amber-600">${pendingFees}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 text-center">
            <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">Due Bills</p>
            <p className="text-xl font-semibold text-red-500">{unpaidFees.length}</p>
          </div>
        </div>

        {/* Pending Fees */}
        {unpaidFees.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-100">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <p className="font-semibold text-slate-800 text-sm">Pending Payments</p>
            </div>
            {unpaidFees.map((fee) => (
              <div key={fee.id} className="flex items-center justify-between px-5 py-4 border-b border-slate-100 last:border-none hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-50 rounded-lg">
                    <CreditCard className="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{fee.label}</p>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" /> Due: {fee.due}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-800">${fee.amount}</p>
                  <button className="text-[11px] text-white bg-amber-500 hover:bg-amber-600 px-3 py-1 rounded-lg mt-1 transition-colors">
                    Pay Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Payment History */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-100">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <p className="font-semibold text-slate-800 text-sm">Payment History</p>
          </div>
          {fees.filter(f => f.paid).map((fee) => (
            <div key={fee.id} className="flex items-center justify-between px-5 py-4 border-b border-slate-100 last:border-none hover:bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">{fee.label}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Paid on {fee.paidOn}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-emerald-600">${fee.amount}</p>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">Paid</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Fees;