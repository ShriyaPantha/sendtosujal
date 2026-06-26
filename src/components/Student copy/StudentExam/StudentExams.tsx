import {
  Calendar,
  FileText,
  Award,
  CheckCircle,
  Download,
  Bell,
  Trash2,
} from "lucide-react";
import { useState } from "react";

const StudentExams = () => {
  const upcomingExams = [
    {
      subject: "Data Structures",
      date: "2026-06-15",
      time: "10:00 AM",
      room: "A-204",
    },
    {
      subject: "DBMS",
      date: "2026-06-18",
      time: "09:00 AM",
      room: "B-102",
    },
    {
      subject: "Operating System",
      date: "2026-06-22",
      time: "01:00 PM",
      room: "C-301",
    },
  ];

  const results = [
    {
      subject: "Computer Network",
      marks: 88,
      grade: "A",
      status: "Passed",
    },
    {
      subject: "Java Programming",
      marks: 92,
      grade: "A+",
      status: "Passed",
    },
    {
      subject: "Mathematics",
      marks: 76,
      grade: "B+",
      status: "Passed",
    },
  ];

  //   const notifications = [
  //     "Admit cards released for Semester Final Examination.",
  //     "Exam center changed for DBMS examination.",
  //     "Result published for Computer Network.",
  //   ];

  const [notifications, setNotifications] = useState([
    "Admit cards released for Semester Final Examination.",
    "Exam center changed for DBMS examination.",
    "Result published for Computer Network.",
  ]);

  const deleteNotification = (index: number) => {
    if (window.confirm("Delete this notification?")) {
      setNotifications((prev) => prev.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="p-6 md:p-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-slate-800">
          Examination Dashboard
        </h1>
        <p className="text-slate-500">Semester Final Examination 2026</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
        {[
          {
            title: "Upcoming Exams",
            value: "3",
            icon: <Calendar className="w-5 h-5" />,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            title: "Passed Subjects",
            value: "18",
            icon: <CheckCircle className="w-5 h-5" />,
            color: "text-green-600",
            bg: "bg-green-50",
          },
          {
            title: "Current GPA",
            value: "3.82",
            icon: <Award className="w-5 h-5" />,
            color: "text-purple-600",
            bg: "bg-purple-50",
          },
          {
            title: "Backlogs",
            value: "0",
            icon: <FileText className="w-5 h-5" />,
            color: "text-orange-600",
            bg: "bg-orange-50",
          },
        ].map((card) => (
          <div
            key={card.title}
            className="bg-white rounded-3xl p-5 shadow-sm flex justify-between"
          >
            <div>
              <p className="text-sm text-slate-500">{card.title}</p>
              <h3 className={`text-2xl font-bold ${card.color}`}>
                {card.value}
              </h3>
            </div>

            <div className={`${card.bg} p-3 rounded-xl`}>{card.icon}</div>
          </div>
        ))}
      </div>

      {/* Main */}
      <div className="grid xl:grid-cols-3 gap-4">
        {/* Schedule */}
        <div className="xl:col-span-2 bg-white rounded-3xl p-6 shadow-sm">
          <h2 className="font-bold text-xl mb-4">Upcoming Exam Schedule</h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left p-3">Subject</th>
                  <th className="text-left p-3">Date</th>
                  <th className="text-left p-3">Time</th>
                  <th className="text-left p-3">Room</th>
                </tr>
              </thead>

              <tbody>
                {upcomingExams.map((exam) => (
                  <tr
                    key={exam.subject}
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >
                    <td className="p-3">{exam.subject}</td>
                    <td className="p-3">{exam.date}</td>
                    <td className="p-3">{exam.time}</td>
                    <td className="p-3">{exam.room}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Admit Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <h2 className="font-bold text-xl mb-4">Admit Card</h2>

          <div className="border border-slate-100 rounded-2xl p-5 bg-slate-50">
            <p className="font-semibold">Semester Final Examination</p>

            <p className="text-sm text-slate-500 mt-1">Status: Available</p>

            <button className="mt-4 w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl">
              <Download size={18} />
              Download Admit Card
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="bg-white rounded-3xl p-6 shadow-sm mt-4">
        <h2 className="font-bold text-xl mb-4">Recent Results</h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left p-3">Subject</th>
                <th className="text-left p-3">Marks</th>
                <th className="text-left p-3">Grade</th>
                <th className="text-left p-3">Status</th>
              </tr>
            </thead>

            <tbody>
              {results.map((result) => (
                <tr
                  key={result.subject}
                  className="border-b border-slate-100 hover:bg-slate-50"
                >
                  <td className="p-3">{result.subject}</td>
                  <td className="p-3">{result.marks}</td>
                  <td className="p-3">{result.grade}</td>
                  <td className="p-3">
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                      {result.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-3xl p-6 shadow-sm mt-4">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="text-orange-500" />
          <h2 className="font-bold text-xl">Exam Notifications</h2>
        </div>

        <div className="space-y-3">
          {notifications.map((note, index) => (
            <div
              key={index}
              className="p-4 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-between gap-4"
            >
              <p className="text-sm text-slate-700">{note}</p>

              <button
                onClick={() => deleteNotification(index)}
                className="p-2 rounded-lg hover:bg-red-100 text-red-500 transition"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        {notifications.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            No notifications available
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentExams;
