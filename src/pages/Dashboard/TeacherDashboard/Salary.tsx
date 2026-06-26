import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, DollarSign, TrendingUp, CreditCard, Calendar, Printer, X, FileText } from "lucide-react";

const SALARY_DATA = [
  { month: "Jan", gross: 55000, net: 48000, gH: "h-[83%]", nH: "h-[72%]" },
  { month: "Feb", gross: 55000, net: 48000, gH: "h-[83%]", nH: "h-[72%]" },
  { month: "Mar", gross: 58000, net: 50500, gH: "h-[90%]", nH: "h-[78%]" },
  { month: "Apr", gross: 55000, net: 48000, gH: "h-[83%]", nH: "h-[72%]" },
  { month: "May", gross: 60000, net: 52000, gH: "h-[100%]", nH: "h-[86%]" },
  { month: "Jun", gross: 55000, net: 48000, gH: "h-[83%]", nH: "h-[72%]" },
];

const PAYSLIPS = [
  { month: "Jan 2026", gross: "NPR 55,000", deductions: "NPR 7,000", net: "NPR 48,000", status: "Paid", date: "Jan 31, 2026", id: "PAY-2026-01" },
  { month: "Feb 2026", gross: "NPR 55,000", deductions: "NPR 7,000", net: "NPR 48,000", status: "Paid", date: "Feb 28, 2026", id: "PAY-2026-02" },
  { month: "Mar 2026", gross: "NPR 58,000", deductions: "NPR 7,500", net: "NPR 50,500", status: "Paid", date: "Mar 31, 2026", id: "PAY-2026-03" },
  { month: "Apr 2026", gross: "NPR 55,000", deductions: "NPR 7,000", net: "NPR 48,000", status: "Paid", date: "Apr 30, 2026", id: "PAY-2026-04" },
  { month: "May 2026", gross: "NPR 60,000", deductions: "NPR 8,000", net: "NPR 52,000", status: "Paid", date: "May 31, 2026", id: "PAY-2026-05" },
  { month: "Jun 2026", gross: "NPR 55,000", deductions: "NPR 7,000", net: "NPR 48,000", status: "Pending", date: "Jun 30, 2026", id: "PAY-2026-06" },
];

const BREAKDOWN = [
  { label: "Basic Salary", amount: "NPR 40,000", type: "earning" },
  { label: "House Rent Allowance", amount: "NPR 8,000", type: "earning" },
  { label: "Transport Allowance", amount: "NPR 3,000", type: "earning" },
  { label: "Medical Allowance", amount: "NPR 4,000", type: "earning" },
  { label: "Provident Fund (10%)", amount: "− NPR 4,000", type: "deduction" },
  { label: "Income Tax", amount: "− NPR 2,500", type: "deduction" },
  { label: "Social Security Fund", amount: "− NPR 500", type: "deduction" },
];

const Salary = () => {
  const navigate = useNavigate();
  const [selectedSlip, setSelectedSlip] = useState<any>(null);

  return (
    <div className="w-full print:bg-white">
      <header className="bg-white border-b border-slate-200/80 h-14 flex items-center px-4 md:px-8 gap-2 sticky top-0 z-10 w-full print:hidden">
        <button onClick={() => navigate("/teacher/dashboard")} className="text-slate-400 hover:text-slate-600 text-xs flex items-center gap-1 bg-transparent border-none outline-none cursor-pointer font-medium transition-colors">
          Dashboard <ChevronRight size={12} />
        </button>
        <span className="text-xs font-semibold text-slate-700">Salary Analytics</span>
      </header>

      <div className="p-4 md:p-6 max-w-[1200px] mx-auto space-y-6 w-full print:p-0 print:max-w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full print:hidden">
          {[
            { label: "Gross Salary", value: "NPR 55,000", sub: "Base average", color: "text-indigo-600", icon: DollarSign, bg: "bg-indigo-50" },
            { label: "Net Take-Home", value: "NPR 48,000", sub: "Clear distributed", color: "text-emerald-600", icon: TrendingUp, bg: "bg-emerald-50" },
            { label: "Total Deductions", value: "NPR 7,000", sub: "Tax & insurance", color: "text-rose-600", icon: CreditCard, bg: "bg-rose-50" },
            { label: "YTD Total Pay", value: "NPR 2,94,500", sub: "Accumulated 2026", color: "text-amber-600", icon: Calendar, bg: "bg-amber-50" },
          ].map((s, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center justify-between hover:shadow-md hover:border-slate-300/70 group transition-all">
              <div className="space-y-1">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{s.label}</p>
                <p className={`text-xl font-black ${s.color} tracking-tight`}>{s.value}</p>
                <p className="text-[11px] text-slate-400 font-medium">{s.sub}</p>
              </div>
              <div className={`${s.bg} w-11 h-11 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <s.icon size={18} className={s.color} />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full print:hidden">
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 md:p-6 shadow-xs flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-800 tracking-tight">Earnings Comparison Matrix</h2>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Hover balances to review exact month-to-month deviations</p>
            </div>
            
            <div className="flex items-end justify-between gap-2 h-48 pt-8 border-b border-slate-100 px-2 sm:px-6 w-full">
              {SALARY_DATA.map((bar, idx) => (
                <div key={idx} className="flex flex-col items-center justify-end h-full flex-1 group cursor-pointer relative">
                  <div className="absolute bottom-full mb-2 bg-slate-900 text-white text-[10px] p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md flex flex-col gap-0.5 z-20 min-w-[95px] text-center font-mono">
                    <span className="border-b border-slate-700 pb-0.5 mb-0.5 font-sans font-bold">{bar.month} 2026</span>
                    <span className="text-slate-300">Gross: {bar.gross}</span>
                    <span className="text-emerald-400 font-bold">Net: {bar.net}</span>
                  </div>
                  <div className="flex items-end gap-1 sm:gap-1.5 justify-center w-full h-full">
                    <div className={`${bar.gH} w-3 sm:w-4.5 bg-indigo-100 rounded-t group-hover:bg-indigo-200 transition-colors duration-150 min-h-[4px]`} />
                    <div className={`${bar.nH} w-3 sm:w-4.5 bg-indigo-600 rounded-t group-hover:bg-indigo-700 group-hover:scale-y-[1.02] transition-all duration-150 origin-bottom min-h-[4px]`} />
                  </div>
                  <span className="text-[11px] text-slate-400 font-bold group-hover:text-slate-700 transition-colors mt-2 block shrink-0">{bar.month}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-4 mt-4 text-[11px] text-slate-500 font-bold px-2">
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 bg-indigo-100 border border-indigo-200 rounded-sm" /> Gross Distributed Amount</div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 bg-indigo-600 rounded-sm" /> Real Net Transferred</div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 shadow-xs flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-800 tracking-tight">Active Payroll Breakdown</h2>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Itemized calculations for May 2026 ledger cycles</p>
            </div>
            <div className="space-y-3 flex-1 my-4 overflow-y-auto max-h-[190px] pr-1">
              {BREAKDOWN.map((b, i) => (
                <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-50 last:border-none">
                  <span className="text-slate-500 font-semibold">{b.label}</span>
                  <span className={`font-bold font-mono tracking-tight ${b.type === "deduction" ? "text-rose-600" : "text-slate-800"}`}>{b.amount}</span>
                </div>
              ))}
            </div>
            <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs bg-slate-50 -mx-2 p-3 rounded-lg border border-slate-200/50">
              <span className="font-bold text-slate-700">Net Settled Balance</span>
              <span className="font-black text-emerald-600 font-mono text-sm">NPR 52,000</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs w-full print:hidden">
          <div className="px-5 py-4 border-b border-slate-200/80 bg-slate-50/50">
            <h2 className="text-sm font-bold text-slate-800 tracking-tight">Payslip Settlement Archives</h2>
          </div>
          <div className="overflow-x-auto w-full">
            <table className="w-full text-xs min-w-[800px] text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/60 border-b border-slate-200 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                  {["Salary Period", "Gross Base", "Taxes & Deductions", "Net Distributed", "Clearance Status", "Settlement Date", "Statements"].map((h, i) => (
                    <th key={i} className={`px-6 py-3.5 ${i === 6 ? "text-right" : ""}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                {PAYSLIPS.map((p, i) => (
                  <tr key={i} className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800">{p.month}</td>
                    <td className="px-6 py-4 font-mono font-semibold text-slate-700">{p.gross}</td>
                    <td className="px-6 py-4 font-mono text-rose-500 font-semibold">{p.deductions}</td>
                    <td className="px-6 py-4 font-mono font-bold text-emerald-600">{p.net}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${p.status === "Paid" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"}`}>{p.status}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 font-mono">{p.date}</td>
                    <td className="px-6 py-4 text-right">
                      {p.status === "Paid" ? (
                        <button onClick={() => setSelectedSlip(p)} className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-bold bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-100 px-3 py-1 rounded-lg transition-all text-[11px] cursor-pointer">
                          <FileText size={12} /> View Receipt
                        </button>
                      ) : (
                        <span className="text-slate-400 italic font-bold pr-4 tracking-wide">Pending Cycle</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {selectedSlip && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 print:static print:bg-white print:p-0">
            <div className="bg-white rounded-xl w-full max-w-md shadow-xl border border-slate-200/80 overflow-hidden print:border-none print:shadow-none animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/60 print:hidden">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Verified Statement Invoice</h3>
                <button onClick={() => setSelectedSlip(null)} className="p-1 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-lg transition-colors bg-transparent border-none outline-none cursor-pointer">
                  <X size={15} />
                </button>
              </div>

              <div className="p-6 space-y-6 text-xs text-slate-700 bg-white print:p-0">
                <div className="text-center space-y-1.5 border-b border-dashed border-slate-200 pb-4">
                  <h2 className="text-base font-black text-slate-900 tracking-wider">TRIBHUVAN UNIVERSITY</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Office of Faculty Accounts & Payroll</p>
                  <span className="inline-block bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded border border-emerald-100 mt-1 uppercase tracking-widest">Disbursement Complete</span>
                </div>

                <div className="grid grid-cols-2 gap-y-3.5 gap-x-4 font-medium text-slate-500 border-b border-slate-100 pb-4">
                  {[
                    { l: "Transaction Id", v: selectedSlip.id, m: true },
                    { l: "Payroll Period", v: selectedSlip.month, b: true },
                    { l: "Faculty Officer", v: "Roshan Shrestha" },
                    { l: "Clearance Settlement", v: selectedSlip.date, m: true }
                  ].map((item, i) => (
                    <div key={i} className="text-slate-600">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">{item.l}</span>
                      <span className={`text-slate-800 font-semibold ${item.m ? "font-mono" : ""} ${item.b ? "font-bold" : ""}`}>{item.v}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2.5">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Audited Ledger Breakdown</span>
                  <div className="space-y-2 font-medium">
                    <div className="flex justify-between text-slate-600">
                      <span>Gross Base Allocated Earnings</span>
                      <span className="font-mono text-slate-800 font-bold">{selectedSlip.gross}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Provident & Tax Deductions Applied</span>
                      <span className="font-mono text-rose-500 font-bold">{selectedSlip.deductions}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t-2 border-dashed border-slate-200 flex items-center justify-between p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                  <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">Net Amount Deposited</span>
                  <span className="font-black font-mono text-emerald-700 text-base">{selectedSlip.net}</span>
                </div>
                <div className="text-center pt-2 hidden print:block border-t border-slate-100">
                  <p className="text-[9px] text-slate-400 font-medium">This document is system authorized by Tribhuvan University Registrar Accounts.</p>
                </div>
              </div>

              <div className="flex gap-2.5 px-6 pb-6 pt-2 border-t border-slate-100 bg-slate-50/40 print:hidden">
                <button type="button" onClick={() => setSelectedSlip(null)} className="flex-1 border border-slate-200 text-slate-600 text-xs py-2 rounded-xl hover:bg-slate-100 font-bold transition-colors cursor-pointer bg-white">Dismiss</button>
                <button type="button" onClick={() => window.print()} className="flex-1 bg-slate-900 text-white text-xs py-2 rounded-xl hover:bg-slate-800 font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.01]"><Printer size={13} /> Print Statement</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Salary;