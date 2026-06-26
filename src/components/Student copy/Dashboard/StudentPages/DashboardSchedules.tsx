import { ChevronDown, MoreVertical } from "lucide-react";
import {
  assignmentData,
  examData,
  scheduleData,
} from "../../../constant/DasboardScheduleslinks";

const DashboardSchedules = () => {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6 w-full h-[85vh]">

      {/* ================= LEFT (SCHEDULE - SCROLLABLE) ================= */}
      <div className="xl:col-span-2 bg-linear-to-b from-white to-gray-50/40 rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">

        {/* HEADER (sticky) */}
        <div className="p-6 pb-4 flex items-center justify-between bg-white/70 backdrop-blur-md sticky top-0 z-10 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-gray-900 text-lg">
              Today’s Schedule
            </h3>
            <p className="text-xs text-gray-400">
              Your classes and activities for today
            </p>
          </div>

          <button className="text-xs font-semibold text-blue-600 bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition">
            View Timetable
          </button>
        </div>

        {/* SCROLL AREA */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">

          {scheduleData.map((item, idx) => (
            <div key={item.id} className="flex gap-4 group relative">

              {/* TIME */}
              <div className="w-20 text-right pt-1 shrink-0">
                <span className="text-[11px] font-semibold text-gray-400 tabular-nums group-hover:text-gray-600 transition">
                  {item.time}
                </span>
              </div>

              {/* TIMELINE */}
              <div className="relative flex flex-col items-center">
                <div
                  className={`w-3 h-3 rounded-full ${item.color} ring-4 ring-white shadow-sm z-10`}
                />
                {idx !== scheduleData.length - 1 && (
                  <div className="w-0.5 bg-gray-200/70 absolute top-3 bottom-0" />
                )}
              </div>

              {/* CARD */}
              <div className="flex-1 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition">

                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">
                      {item.subject}
                    </h4>

                    <p className="text-[11px] text-gray-500 mt-1">
                      {item.prof}
                    </p>

                    <span className="inline-block mt-3 text-[10px] font-semibold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
                      {item.room}
                    </span>
                  </div>

                  <MoreVertical className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition" />
                </div>

              </div>
            </div>
          ))}

        </div>
      </div>

      {/* ================= RIGHT STACK (SCROLLABLE COLUMN) ================= */}
      <div className="flex flex-col gap-6 h-[85vh] overflow-hidden">

        {/* ================= ASSIGNMENTS ================= */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden h-1/2">

          <div className="p-5 pb-3 flex items-center justify-between border-b border-gray-100">
            <div>
              <h3 className="font-bold text-gray-900 text-sm">
                Assignments
              </h3>
              <p className="text-[11px] text-gray-400">Pending tasks</p>
            </div>

            <button className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100">
              View All <ChevronDown className="w-3 h-3 inline ml-1" />
            </button>
          </div>

          <div className="p-4 space-y-3 overflow-y-auto flex-1">

            {assignmentData.map((task) => {
              const Icon = task.icon;

              return (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">

                    <div className={`w-10 h-10 rounded-xl ${task.iconBg} flex items-center justify-center`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-gray-900 truncate">
                        {task.title}
                      </h4>
                      <p className="text-[11px] text-gray-400 truncate">
                        {task.desc}
                      </p>
                      <p className="text-[10px] text-red-500 font-semibold mt-0.5">
                        {task.due}
                      </p>
                    </div>

                  </div>

                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${task.statusStyle}`}>
                    {task.status}
                  </span>

                </div>
              );
            })}

          </div>
        </div>

        {/* ================= EXAMS ================= */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden h-1/2">

          <div className="p-5 pb-3 flex items-center justify-between border-b border-gray-100">
            <div>
              <h3 className="font-bold text-gray-900 text-sm">
                Upcoming Exams
              </h3>
              <p className="text-[11px] text-gray-400">Schedule overview</p>
            </div>

            <button className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100">
              View All <ChevronDown className="w-3 h-3 inline ml-1" />
            </button>
          </div>

          <div className="p-4 space-y-3 overflow-y-auto flex-1">

            {examData.map((exam) => (
              <div
                key={exam.id}
                className="flex items-start justify-between p-2 rounded-xl hover:bg-gray-50 transition"
              >
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-gray-900 truncate">
                    {exam.title}
                  </h4>
                  <p className="text-[11px] text-gray-400 mt-1">
                    {exam.date}
                  </p>
                  <p className="text-[11px] text-gray-400">
                    {exam.venue}
                  </p>
                </div>

                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full shrink-0">
                  {exam.countdown}
                </span>

              </div>
            ))}

          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardSchedules;