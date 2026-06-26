import { useEffect, useState } from "react";
import { CreditCard, ArrowUpRight, CheckCircle2 } from "lucide-react";

const FeeSummaryCard = () => {
  const totalFees = 75000;
  const paidAmount = 70000;
  const remainingBalance = totalFees - paidAmount;

  const targetPercentage = Math.round((paidAmount / totalFees) * 100);

  const radius = 40;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;

  // animation states
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    let start = 0;
    const interval = setInterval(() => {
      start += 1;
      if (start >= targetPercentage) {
        start = targetPercentage;
        clearInterval(interval);
      }
      setPercent(start);
    }, 15);

    return () => clearInterval(interval);
  }, [targetPercentage]);

  const strokeDashoffset =
    circumference - (percent / 100) * circumference;

  // STATUS LOGIC
  const getStatus = () => {
    if (percent === 100) return "Fully Paid";
    if (percent >= 50) return "Partially Paid";
    return "Pending";
  };

  const status = getStatus();

  return (
    <div className="w-full max-w-md rounded-3xl border border-gray-100 bg-white/80 backdrop-blur-xl shadow-sm  transition-all duration-300 p-6 mt-3">

      {/* HEADER */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="font-bold text-gray-900 text-lg">
            Fee Summary
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Academic payment overview
          </p>
        </div>

        <button className="text-xs font-semibold text-blue-600 flex items-center gap-1 group">
          View Details
          <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
        </button>
      </div>

      {/* CONTENT */}
      <div className="grid grid-cols-12 gap-5 items-center mb-6">

        {/* LEFT */}
        <div className="col-span-7 space-y-4">

          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Total Fees</span>
            <span className="font-semibold">
              Rs. {totalFees.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Paid</span>
            <span className="font-semibold text-emerald-600">
              Rs. {paidAmount.toLocaleString()}
            </span>
          </div>

          <div className="h-px bg-gray-100" />

          <div className="flex justify-between text-sm">
            <span className="font-semibold text-gray-900">
              Remaining
            </span>
            <span className="font-bold text-red-500">
              Rs. {remainingBalance.toLocaleString()}
            </span>
          </div>

          {/* STATUS BADGE */}
          <span className={`inline-block text-[10px] font-bold px-3 py-1 rounded-full
            ${percent === 100 ? "bg-green-100 text-green-700" :
              percent >= 50 ? "bg-blue-100 text-blue-700" :
              "bg-red-100 text-red-600"}
          `}>
            {status}
          </span>

        </div>

        {/* RIGHT CIRCLE */}
        <div className="col-span-5 flex justify-center">
          <div className="relative w-28 h-28">

            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">

              {/* background */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke="#E5E7EB"
                strokeWidth={strokeWidth}
                fill="none"
              />

              {/* progress */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke="url(#grad)"
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 0.3s linear" }}
              />

              <defs>
                <linearGradient id="grad">
                  <stop offset="0%" stopColor="#06B6D4" />
                  <stop offset="100%" stopColor="#3B82F6" />
                </linearGradient>
              </defs>

            </svg>

            {/* CENTER TEXT */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-extrabold text-gray-900">
                {percent}%
              </span>
              <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                Paid
              </span>
            </div>

          </div>
        </div>
      </div>

      {/* CTA */}
      <button className="w-full bg-linear-to-r from-blue-600 to-blue-700 text-white font-semibold text-sm py-3 rounded-2xl shadow-sm hover:bg-blue-500 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
        <CreditCard className="w-4 h-4" />
        Pay Now
      </button>

      {/* FOOTER */}
      <div className="mt-5 flex items-center gap-2 text-xs text-gray-400">
        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        <span>
          Last Payment:{" "}
          <span className="font-semibold text-gray-500">
            Rs. 15,000
          </span>{" "}
          on Apr 20, 2024
        </span>
      </div>

    </div>
  );
};

export default FeeSummaryCard;