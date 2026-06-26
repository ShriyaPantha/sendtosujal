import { useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  BookOpen,
} from "lucide-react";

/* ===================== ANIMATION ===================== */
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

const StudentAttendance = () => {
  const [studentId, setStudentId] = useState("");
  const [status, setStatus] = useState("");
  const [marked, setMarked] = useState(false);

  const subjects = [
    { subject: "Data Structures", attendance: 95 },
    { subject: "DBMS", attendance: 91 },
    { subject: "Operating System", attendance: 87 },
    { subject: "Computer Network", attendance: 93 },
  ];

  const history = [
    { date: "2026-06-01", subject: "DBMS", status: "Present" },
    { date: "2026-06-02", subject: "DSA", status: "Present" },
    { date: "2026-06-03", subject: "OS", status: "Absent" },
  ];

  const markAttendance = () => {
    if (!studentId || !status) return;

    setMarked(true);

    console.log("Attendance Marked:");
    console.log("Student ID:", studentId);
    console.log("Status:", status);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 md:p-8 bg-slate-50 min-h-screen"
    >
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold">Attendance System</h1>
          <p className="text-gray-500">Manual Attendance Marking</p>
        </div>

        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm">
          <Calendar className="w-4 h-4 text-blue-500" />
          2026 Academic
        </div>
      </div>

      {/* ================= INPUT SECTION ================= */}
      <div className="bg-white p-5 rounded-2xl shadow mb-4">
        <h2 className="font-bold text-lg mb-3">Mark Attendance</h2>

        <div className="grid md:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Enter Student ID"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="border p-2 rounded-lg w-full"
          />

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border p-2 rounded-lg w-full"
          >
            <option value="">Select Status</option>
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
            <option value="Leave">Leave</option>
          </select>

          <button
            onClick={markAttendance}
            className="bg-green-600 text-white rounded-lg px-4 py-2 hover:bg-green-700"
          >
            Mark Attendance
          </button>
        </div>

        {marked && (
          <div className="mt-3 text-green-600 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Attendance Marked Successfully
          </div>
        )}
      </div>

      {/* ================= STATS ================= */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4"
      >
        {[
          {
            title: "Overall",
            value: "92%",
            icon: <BookOpen />,
            color: "text-blue-600",
          },
          {
            title: "Present",
            value: "184",
            icon: <CheckCircle />,
            color: "text-green-600",
          },
          {
            title: "Absent",
            value: "12",
            icon: <XCircle />,
            color: "text-red-600",
          },
          {
            title: "Leave",
            value: "4",
            icon: <AlertCircle />,
            color: "text-yellow-600",
          },
        ].map((card, i) => (
          <motion.div key={i} variants={item}>
            <div className="bg-white p-4 rounded-xl shadow flex justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.title}</p>
                <h2 className={`text-xl font-bold ${card.color}`}>
                  {card.value}
                </h2>
              </div>
              <div className="text-gray-500">{card.icon}</div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ================= SUBJECTS ================= */}
      <div className="bg-white p-4 rounded-2xl shadow mb-4">
        <h2 className="font-bold mb-3">Subject Attendance</h2>

        {subjects.map((s, i) => (
          <div key={i} className="mb-3">
            <div className="flex justify-between text-sm">
              <span>{s.subject}</span>
              <span>{s.attendance}%</span>
            </div>

            <div className="w-full bg-gray-200 h-2 rounded-full">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${s.attendance}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* ================= HISTORY ================= */}
      <div className="bg-white p-4 rounded-2xl shadow">
        <h2 className="font-bold mb-3">Recent Logs</h2>

        <table className="w-full text-sm">
          <tbody>
            {history.map((h, i) => (
              <tr key={i} className="border-b">
                <td className="p-2">{h.date}</td>
                <td className="p-2">{h.subject}</td>
                <td className="p-2 text-right">{h.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default StudentAttendance;