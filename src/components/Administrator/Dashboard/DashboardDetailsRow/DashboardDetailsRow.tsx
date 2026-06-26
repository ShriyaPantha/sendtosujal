import React, { useEffect, useState } from 'react';
import {
  Building2,
  Clock,
  CalendarDays,
  UserPlus,
  FileEdit,
  CreditCard,
  PlusCircle,
  FileText,
  Loader2,
} from 'lucide-react';
import axiosInstance from "../../../../api/axiosInstance"; 

// --- Interfaces ---
interface DepartmentRow {
  name: string;
  students: number;
  teachers: number;
  courses: number;
  avgScore: number | null;
  attendance: number | null;
}

interface AuditLogEntry {
  _id: string;
  action: string;
  user: string;
  role: string;
  time: string;
  date: string;
  category: string;
  status: string;
  createdAt: string;
}

interface ExamRow {
  subject: string;
  className: string;
  date: string;
  time: string | null;
  daysLeft: number;
}

const categoryStyle: Record<string, { icon: React.ReactNode; bg: string; color: string }> = {
  admission: { icon: <UserPlus size={14} />, bg: 'bg-blue-50', color: 'text-blue-600' },
  exam: { icon: <FileEdit size={14} />, bg: 'bg-amber-50', color: 'text-amber-500' },
  fee: { icon: <CreditCard size={14} />, bg: 'bg-emerald-50', color: 'text-emerald-600' },
  course: { icon: <PlusCircle size={14} />, bg: 'bg-rose-50', color: 'text-rose-500' },
};
const defaultCategoryStyle = { icon: <FileEdit size={14} />, bg: 'bg-slate-50', color: 'text-slate-500' };

const examBadgeColor = (daysLeft: number) => {
  if (daysLeft <= 5) return { bg: 'bg-orange-50', text: 'text-orange-500' };
  if (daysLeft <= 10) return { bg: 'bg-emerald-50', text: 'text-emerald-600' };
  return { bg: 'bg-cyan-50', text: 'text-cyan-600' };
};

export default function DashboardDetailsRow() {
  const [departments, setDepartments] = useState<DepartmentRow[]>([]);
  const [activities, setActivities] = useState<AuditLogEntry[]>([]);
  const [exams, setExams] = useState<ExamRow[]>([]);
  const [loadingDepts, setLoadingDepts] = useState(true);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [loadingExams, setLoadingExams] = useState(true);

  useEffect(() => {
    axiosInstance
      .get("/api/admin/dashboard/departments")
      .then((res) => setDepartments(res.data.data))
      .catch((e) => console.error("Failed to load department performance", e))
      .finally(() => setLoadingDepts(false));

    axiosInstance
      .get("/api/admin/dashboard/activities?limit=4")
      .then((res) => setActivities(res.data.data))
      .catch((e) => console.error("Failed to load recent activities", e))
      .finally(() => setLoadingActivities(false));

    axiosInstance
      .get("/api/admin/dashboard/exams?limit=4")
      .then((res) => setExams(res.data.data))
      .catch((e) => console.error("Failed to load upcoming exams", e))
      .finally(() => setLoadingExams(false));
  }, []);

  const handleDepartmentClick = (deptName: string) => {
    console.log("Open department:", deptName);
  };

  const handleExamClick = (subject: string) => {
    console.log("Open exam:", subject);
  };

  return (
    <div className="w-full bg-slate-50 px-1 pb-4 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* 1. Department Performance Section */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between min-h-85">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="text-blue-600" size={18} />
              <h3 className="font-bold text-slate-700 text-base">Department Performance</h3>
            </div>

            {loadingDepts ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin text-slate-400" size={20} />
              </div>
            ) : departments.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                No departments yet. Create one to see performance here.
              </p>
            ) : (
              <div className="w-full overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                      <th className="pb-3 font-medium">Department</th>
                      <th className="pb-3 font-medium text-center">Students</th>
                      <th className="pb-3 font-medium text-center">Teachers</th>
                      <th className="pb-3 font-medium text-center">Avg. Score</th>
                      <th className="pb-3 font-medium text-right">Attendance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {departments.map((dept, idx) => (
                      <tr
                        key={idx}
                        onClick={() => handleDepartmentClick(dept.name)}
                        className="group cursor-pointer hover:bg-slate-50/80 transition-colors duration-150"
                      >
                        <td className="py-3 text-xs font-bold text-slate-700 group-hover:text-blue-600 transition-colors max-w-32.5 truncate">
                          {dept.name}
                        </td>
                        <td className="py-3 text-xs font-medium text-slate-500 text-center">{dept.students}</td>
                        <td className="py-3 text-xs font-medium text-slate-500 text-center">{dept.teachers}</td>
                        <td className="py-3 text-xs font-bold text-slate-700 text-center">
                          {dept.avgScore !== null ? `${dept.avgScore}%` : "—"}
                        </td>
                        <td className="py-3 text-right">
                          {dept.attendance !== null ? (
                            <div className="inline-flex items-center gap-2">
                              <div className="w-12 bg-slate-100 h-1.5 rounded-full overflow-hidden hidden sm:block">
                                <div
                                  className="bg-emerald-500 h-full rounded-full"
                                  style={{ width: `${dept.attendance}%` }}
                                />
                              </div>
                              <span className="text-xs font-bold text-slate-700">{dept.attendance}%</span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* 2. Recent Activities Timeline Section */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between min-h-85">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Clock className="text-blue-600" size={18} />
                <h3 className="font-bold text-slate-700 text-base">Recent Activities</h3>
              </div>
            </div>

            {loadingActivities ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin text-slate-400" size={20} />
              </div>
            ) : activities.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No recent activity logged.</p>
            ) : (
              <div className="relative pl-4 border-l-2 border-slate-100 ml-2.5 flex flex-col gap-4 py-1">
                {activities.map((activity) => {
                  const style = categoryStyle[activity.category] || defaultCategoryStyle;
                  return (
                    <div key={activity._id} className="relative flex items-start gap-3 group">
                      <div className="absolute left-[-23.5px] top-1 bg-white p-0.5 rounded-full z-10">
                        <div className={`w-3 h-3 rounded-full border-2 border-white ${style.color.replace('text', 'bg')}`} />
                      </div>

                      <div className={`p-1.5 rounded-lg shrink-0 ${style.bg} ${style.color}`}>
                        {style.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-0.5">
                          <span className="text-[11px] font-bold text-slate-400 order-2 sm:order-1 tracking-tight">{activity.time}</span>
                          <span className="text-[10px] font-semibold text-slate-400 order-1 sm:order-2 bg-slate-50 px-1.5 py-0.5 rounded">by {activity.user}</span>
                        </div>
                        <p className="text-xs font-bold text-slate-700 mt-0.5 truncate group-hover:text-blue-600 transition-colors cursor-default">
                          {activity.action}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* 3. Upcoming Exams Notification Cards */}
        <div className="lg:col-span-3 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between min-h-85">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <CalendarDays className="text-blue-600" size={18} />
                <h3 className="font-bold text-slate-700 text-base">Upcoming Exams</h3>
              </div>
            </div>

            {loadingExams ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin text-slate-400" size={20} />
              </div>
            ) : exams.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No upcoming exams scheduled.</p>
            ) : (
              <div className="flex flex-col gap-2.5">
                {exams.map((exam, idx) => {
                  const badge = examBadgeColor(exam.daysLeft);
                  return (
                    <div
                      key={idx}
                      onClick={() => handleExamClick(exam.subject)}
                      className="flex items-center justify-between p-2.5 border border-slate-100 rounded-xl bg-white hover:bg-slate-50/50 hover:border-slate-200 cursor-pointer group transition-all duration-150"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className="p-2 bg-slate-50 text-slate-400 group-hover:text-blue-500 group-hover:bg-blue-50 rounded-xl transition-all duration-150 shrink-0">
                          <FileText size={16} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                            {exam.subject}
                          </h4>
                          <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                            {exam.date}{exam.time ? ` • ${exam.time}` : ""} • {exam.className}
                          </p>
                        </div>
                      </div>

                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg shrink-0 ml-2 tracking-wide whitespace-nowrap ${badge.bg} ${badge.text}`}>
                        {exam.daysLeft} Day{exam.daysLeft === 1 ? "" : "s"} Left
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}