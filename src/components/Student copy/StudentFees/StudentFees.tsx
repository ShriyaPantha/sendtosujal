import { motion } from "framer-motion";
import { Download } from "lucide-react";

/* ================= ANIMATION ================= */
const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

/* ================= MAIN PAGE ================= */
const StudentFees = () => {
  const feeSummary = {
    total: 120000,
    paid: 80000,
    due: 40000,
  };

  const feeBreakdown = [
    { name: "Tuition Fee", amount: 60000, status: "Paid" },
    { name: "Exam Fee", amount: 10000, status: "Paid" },
    { name: "Library Fee", amount: 5000, status: "Paid" },
    { name: "Lab Fee", amount: 15000, status: "Due" },
    { name: "Hostel Fee", amount: 30000, status: "Due" },
  ];

  const payments = [
    { date: "2026-01-10", amount: 30000, method: "Esewa", status: "Success" },
    { date: "2026-03-12", amount: 50000, method: "Bank", status: "Success" },
  ];

  const progress = (feeSummary.paid / feeSummary.total) * 100;

  /* ================= ESEWA PAYMENT ================= */
  const handleEsewaPayment = (amount: number) => {
    const params: any = {
      amt: amount,
      psc: 0,
      pdc: 0,
      txAmt: 0,
      tAmt: amount,
      pid: "FEE_" + Date.now(),
      scd: "EPAYTEST",
      su: "http://localhost:5173/success",
      fu: "http://localhost:5173/fail",
    };

    const form = document.createElement("form");
    form.method = "POST";
    form.action = "https://uat.esewa.com.np/epay/main";

    Object.keys(params).forEach((key) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = params[key];
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 md:p-8 bg-slate-50 min-h-screen"
    >
      {/* HEADER */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4"
      >
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">
            Fees Dashboard
          </h1>
          <p className="text-slate-500 mt-1">
            Manage your payments and fee history
          </p>
        </div>

        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl">
          <Download className="w-4 h-4" />
          Download Receipt
        </button>
      </motion.div>

      {/* SUMMARY */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <motion.div variants={item} className="bg-white p-6 rounded-3xl shadow-sm">
          <p className="text-slate-500 text-sm">Total Fees</p>
          <h2 className="text-3xl font-bold text-blue-600">
            Rs {feeSummary.total}
          </h2>
        </motion.div>

        <motion.div variants={item} className="bg-white p-6 rounded-3xl shadow-sm">
          <p className="text-slate-500 text-sm">Paid</p>
          <h2 className="text-3xl font-bold text-emerald-600">
            Rs {feeSummary.paid}
          </h2>
        </motion.div>

        <motion.div variants={item} className="bg-white p-6 rounded-3xl shadow-sm">
          <p className="text-slate-500 text-sm">Due</p>
          <h2 className="text-3xl font-bold text-rose-600">
            Rs {feeSummary.due}
          </h2>
        </motion.div>
      </motion.div>

      {/* PROGRESS */}
      <div className="bg-white rounded-3xl p-6 mt-8 shadow-sm">
        <h2 className="font-bold text-lg mb-4">Payment Progress</h2>

        <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1 }}
            className="h-4 bg-emerald-500 rounded-full"
          />
        </div>

        <p className="mt-3 text-sm text-emerald-600 font-semibold">
          {progress.toFixed(0)}% Paid
        </p>
      </div>

      {/* BREAKDOWN + ESEWA BUTTON */}
      <div className="bg-white rounded-3xl p-6 mt-8 shadow-sm">
        <h2 className="text-xl font-bold mb-6">Fee Breakdown</h2>

        <div className="space-y-4">
          {feeBreakdown.map((fee, i) => (
            <div
              key={i}
              className="flex justify-between items-center p-4 rounded-xl bg-slate-50"
            >
              <div>
                <p className="font-semibold">{fee.name}</p>
                <p className="text-sm text-slate-500">Rs {fee.amount}</p>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    fee.status === "Paid"
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-rose-100 text-rose-600"
                  }`}
                >
                  {fee.status}
                </span>

                {/* ESEWA BUTTON */}
                {fee.status === "Due" && (
                  <button
                    onClick={() => handleEsewaPayment(fee.amount)}
                    className="bg-green-600 hover:bg-green-700 text-white text-xs px-4 py-2 rounded-lg transition-all"
                  >
                    Pay eSewa
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* PAY ALL BUTTON */}
        <div className="mt-6">
          <button
            onClick={() => handleEsewaPayment(feeSummary.due)}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-xl"
          >
            Pay All Due via eSewa
          </button>
        </div>
      </div>

      {/* PAYMENT HISTORY */}
      <div className="bg-white rounded-3xl p-6 mt-8 shadow-sm overflow-x-auto">
        <h2 className="text-xl font-bold mb-6">Payment History</h2>

        <table className="w-full">
          <thead>
            <tr className="text-left text-slate-500 text-sm border-b">
              <th className="p-3">Date</th>
              <th className="p-3">Method</th>
              <th className="p-3">Amount</th>
              <th className="p-3 text-right">Status</th>
            </tr>
          </thead>

          <tbody>
            {payments.map((pay, i) => (
              <motion.tr key={i} whileHover={{ x: 5 }} className="border-b">
                <td className="p-3">{pay.date}</td>
                <td className="p-3">{pay.method}</td>
                <td className="p-3 text-emerald-600 font-semibold">
                  Rs {pay.amount}
                </td>
                <td className="p-3 text-right">
                  <span className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold">
                    Success
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ALERT */}
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ repeat: Infinity, duration: 3 }}
        className="bg-amber-50 text-amber-700 p-4 rounded-2xl mt-8"
      >
        ⚠ Remaining fee Rs {feeSummary.due} must be cleared before exam
        registration.
      </motion.div>
    </motion.div>
  );
};

export default StudentFees;