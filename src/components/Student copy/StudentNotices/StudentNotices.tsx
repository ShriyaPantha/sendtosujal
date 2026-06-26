import { useState } from "react";
import {
  Bell,
  Search,
  Pin,
  Trash2,
  Download,
  Calendar,
  AlertTriangle,
} from "lucide-react";

const StudentNotices = () => {
  const [search, setSearch] = useState("");

  const [notices, setNotices] = useState([
    {
      id: 1,
      title: "Semester Final Examination Schedule Published",
      category: "Exam",
      date: "2026-06-05",
      important: true,
    },
    {
      id: 2,
      title: "Hackathon Registration Open",
      category: "Event",
      date: "2026-06-03",
      important: false,
    },
    {
      id: 3,
      title: "Library Will Remain Closed on Saturday",
      category: "General",
      date: "2026-06-02",
      important: false,
    },
    {
      id: 4,
      title: "Admit Card Available for Download",
      category: "Exam",
      date: "2026-06-01",
      important: true,
    },
  ]);

  const deleteNotice = (id: number) => {
    setNotices((prev) => prev.filter((notice) => notice.id !== id));
  };

  const filteredNotices = notices.filter((notice) =>
    notice.title.toLowerCase().includes(search.toLowerCase())
  );

  const importantNotices = filteredNotices.filter(
    (notice) => notice.important
  );

  return (
    <div className="p-2 md:p-2 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-slate-800">
          Notices & Announcements
        </h1>
        <p className="text-slate-500">
          Stay updated with the latest university information
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
        <div className="bg-white p-5 rounded-3xl shadow-sm">
          <p className="text-sm text-slate-500">Total Notices</p>
          <h3 className="text-2xl font-bold">{notices.length}</h3>
        </div>

        <div className="bg-white p-5 rounded-3xl shadow-sm">
          <p className="text-sm text-slate-500">Important</p>
          <h3 className="text-2xl font-bold text-green-500">
            {notices.filter((n) => n.important).length}
          </h3>
        </div>

        <div className="bg-white p-5 rounded-3xl shadow-sm">
          <p className="text-sm text-slate-500">Exam Notices</p>
          <h3 className="text-2xl font-bold text-blue-500">
            {notices.filter((n) => n.category === "Exam").length}
          </h3>
        </div>

        <div className="bg-white p-5 rounded-3xl shadow-sm">
          <p className="text-sm text-slate-500">Events</p>
          <h3 className="text-2xl font-bold text-green-500">
            {notices.filter((n) => n.category === "Event").length}
          </h3>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-3xl shadow-sm mb-4">
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />

          <input
            type="text"
            placeholder="Search notices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-slate-100 rounded-xl py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
      </div>

      {/* Important Notices */}
      <div className="bg-white rounded-3xl p-6 shadow-sm mb-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="text-green-500" />
          <h2 className="font-bold text-xl">
            Important Notices
          </h2>
        </div>

        <div className="space-y-4">
          {importantNotices.map((notice) => (
            <div
              key={notice.id}
              className="border border-green-200 bg-green-50 rounded-2xl p-4"
            >
              <div className="flex justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Pin size={16} className="text-red-500" />
                    <h3 className="font-semibold">
                      {notice.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                    <span>{notice.category}</span>
                    <span>{notice.date}</span>
                  </div>
                </div>

                <button className="p-2 rounded-lg hover:bg-white">
                  <Download size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Notices */}
      <div className="bg-white rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <Bell className="text-blue-500" />
          <h2 className="font-bold text-xl">
            Recent Notices
          </h2>
        </div>

        <div className="space-y-4">
          {filteredNotices.map((notice) => (
            <div
              key={notice.id}
              className="border border-slate-100 rounded-2xl p-4 hover:bg-slate-50 transition"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-slate-800">
                    {notice.title}
                  </h3>

                  <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                    <span className="px-2 py-1 bg-slate-100 rounded-lg">
                      {notice.category}
                    </span>

                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      {notice.date}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="p-2 rounded-lg hover:bg-slate-100">
                    <Download size={18} />
                  </button>

                  <button
                    onClick={() => deleteNotice(notice.id)}
                    className="p-2 rounded-lg hover:bg-red-100 text-red-500"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredNotices.length === 0 && (
          <div className="text-center py-10 text-slate-400">
            No notices found
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentNotices;