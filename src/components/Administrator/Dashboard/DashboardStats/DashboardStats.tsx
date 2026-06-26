import React, { useEffect, useState } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import {
  UserPlus,
  FileText,
  ClipboardList,
  CheckSquare,
  Users,
  Briefcase,
  Building2,
  PlusCircle,
  GraduationCap,
  BookOpen,
  CalendarDays,
  FileBarChart2,
  Megaphone,
  Loader2,
} from "lucide-react";
import axiosInstance from "../../../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
// --- Interfaces ---
interface StatRowProps {
  icon: React.ReactNode;
  bgIconColor: string;
  label: string;
  value: number;
}

interface ActionCardProps {
  icon: React.ReactNode;
  iconColor: string;
  label: string;
  onClick?: () => void;
}

interface AdmissionsOverview {
  newToday: number;
  newThisWeek: number;
  newThisMonth: number;
  totalStudents: number;
}

interface TeacherOverview {
  activeTeachers: number;
  inactiveTeachers: number;
  newHiresThisMonth: number;
  departments: number;
}

interface FeeCollection {
  collectedAmount: number;
  totalAmount: number;
  pendingAmount: number;
  collectedPercent: number;
}

// --- Subcomponents for Cleanliness ---
const StatRow = ({ icon, bgIconColor, label, value }: StatRowProps) => (
  <div className="flex items-center justify-between py-2 text-sm">
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-xl ${bgIconColor}`}>{icon}</div>
      <span className="text-slate-500 font-medium">{label}</span>
    </div>
    <span className="font-bold text-slate-800 text-base">{value}</span>
  </div>
);

const QuickActionCard = ({
  icon,
  iconColor,
  label,
  onClick,
}: ActionCardProps) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center justify-center p-4 border border-slate-100 rounded-xl bg-white hover:bg-slate-50 hover:shadow-sm transition-all duration-200 group text-center w-full"
  >
    <div
      className={`p-2.5 rounded-xl ${iconColor} mb-2 group-hover:scale-105 transition-transform duration-200`}
    >
      {icon}
    </div>
    <span className="text-xs font-bold text-slate-700 tracking-wide">
      {label}
    </span>
  </button>
);

const CardLoader = () => (
  <div className="flex-1 flex items-center justify-center py-8">
    <Loader2 className="animate-spin text-slate-400" size={20} />
  </div>
);

export default function DashboardStats() {
  const [admissions, setAdmissions] = useState<AdmissionsOverview | null>(null);
  const [teacherOverview, setTeacherOverview] =
    useState<TeacherOverview | null>(null);
  const [fee, setFee] = useState<FeeCollection | null>(null);
  const navigate = useNavigate();
  useEffect(() => {
    axiosInstance
      .get("/api/admin/dashboard/admissions-overview")
      .then((res) => setAdmissions(res.data.data))
      .catch((e) => console.error("Failed to load admissions overview", e));

    axiosInstance
      .get("/api/admin/dashboard/teacher-overview")
      .then((res) => setTeacherOverview(res.data.data))
      .catch((e) => console.error("Failed to load teacher overview", e));

    axiosInstance
      .get("/api/admin/dashboard/fee-collection")
      .then((res) => setFee(res.data.data))
      .catch((e) => console.error("Failed to load fee collection", e));
  }, []);

  const feeProgressData = fee
    ? [
        { name: "Collected", value: fee.collectedPercent, color: "#2563eb" },
        {
          name: "Remaining",
          value: 100 - fee.collectedPercent,
          color: "#eff6ff",
        },
      ]
    : [
        { name: "Collected", value: 0, color: "#2563eb" },
        { name: "Remaining", value: 100, color: "#eff6ff" },
      ];

  return (
    <div className="w-full bg-slate-50 px-1 py-5 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* 1. Admissions Overview */}
        <div className="lg:col-span-3 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardList className="text-blue-600" size={18} />
            <h3 className="font-bold text-slate-700 text-base">
              Admissions Overview
            </h3>
          </div>
          {!admissions ? (
            <CardLoader />
          ) : (
            <div className="flex flex-col gap-2 my-auto">
              <StatRow
                icon={<UserPlus size={16} className="text-blue-500" />}
                bgIconColor="bg-blue-50"
                label="New Students Today"
                value={admissions.newToday}
              />
              <StatRow
                icon={<FileText size={16} className="text-emerald-500" />}
                bgIconColor="bg-emerald-50"
                label="New This Week"
                value={admissions.newThisWeek}
              />
              <StatRow
                icon={<CheckSquare size={16} className="text-orange-500" />}
                bgIconColor="bg-orange-50"
                label="Total Students"
                value={admissions.totalStudents}
              />
              <StatRow
                icon={<Users size={16} className="text-purple-500" />}
                bgIconColor="bg-purple-50"
                label="This Month Admissions"
                value={admissions.newThisMonth}
              />
            </div>
          )}
        </div>

        {/* 2. Teacher Overview */}
        <div className="lg:col-span-3 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Users className="text-purple-600" size={18} />
            <h3 className="font-bold text-slate-700 text-base">
              Teacher Overview
            </h3>
          </div>
          {!teacherOverview ? (
            <CardLoader />
          ) : (
            <div className="flex flex-col gap-2 my-auto">
              <StatRow
                icon={<Users size={16} className="text-purple-500" />}
                bgIconColor="bg-purple-50"
                label="Active Teachers"
                value={teacherOverview.activeTeachers}
              />
              <StatRow
                icon={<Briefcase size={16} className="text-emerald-500" />}
                bgIconColor="bg-emerald-50"
                label="New Hires This Month"
                value={teacherOverview.newHiresThisMonth}
              />
              <StatRow
                icon={<Building2 size={16} className="text-indigo-500" />}
                bgIconColor="bg-indigo-50"
                label="Departments"
                value={teacherOverview.departments}
              />
              <StatRow
                icon={<Users size={16} className="text-slate-400" />}
                bgIconColor="bg-slate-50"
                label="Inactive Teachers"
                value={teacherOverview.inactiveTeachers}
              />
            </div>
          )}
        </div>

        {/* 3. Fee Collection */}
        <div className="lg:col-span-3 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <PlusCircle className="text-emerald-500" size={18} />
            <h3 className="font-bold text-slate-700 text-base">
              Fee Collection{" "}
              <span className="text-slate-400 font-normal text-sm">
                (This Month)
              </span>
            </h3>
          </div>

          {!fee ? (
            <CardLoader />
          ) : (
            <div className="flex items-center justify-between gap-2 my-auto">
              {/* Gauge Style Ring */}
              <div className="relative w-32 h-32 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={feeProgressData}
                      cx="50%"
                      cy="50%"
                      innerRadius={44}
                      outerRadius={54}
                      startAngle={220}
                      endAngle={-40}
                      paddingAngle={0}
                      dataKey="value"
                      cornerRadius={10}
                    >
                      {feeProgressData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center -mt-1">
                  <span className="text-2xl font-bold text-slate-800">
                    {fee.collectedPercent}%
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
                    Collected
                  </span>
                </div>
              </div>

              {/* Figures Grid */}
              <div className="flex flex-col gap-2.5 flex-1 pl-2">
                <div>
                  <div className="text-[11px] text-slate-400 font-medium">
                    Collected Amount
                  </div>
                  <div className="text-base font-bold text-slate-800">
                    ${fee.collectedAmount.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400 font-medium">
                    Total Amount
                  </div>
                  <div className="text-base font-bold text-slate-700">
                    ${fee.totalAmount.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400 font-medium">
                    Pending Amount
                  </div>
                  <div className="text-base font-bold text-red-500">
                    ${fee.pendingAmount.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 4. Quick Actions — static navigation shortcuts, wire onClick to your router */}
        <div className="lg:col-span-3 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <h3 className="font-bold text-slate-700 text-base mb-4">
            Quick Actions
          </h3>

          <div className="grid grid-cols-3 gap-3 my-auto">
            <QuickActionCard
              icon={<GraduationCap size={20} />}
              iconColor="bg-blue-50 text-blue-600"
              label="Add Student"
              onClick={() => navigate("/admin/student")}
            />

            <QuickActionCard
              icon={<Users size={20} />}
              iconColor="bg-emerald-50 text-emerald-600"
              label="Add Teacher"
              onClick={() => navigate("/admin/teacher")}
            />

            <QuickActionCard
              icon={<BookOpen size={20} />}
              iconColor="bg-purple-50 text-purple-600"
              label="Create Department"
              onClick={() => navigate("/admin/department")}
            />

            <QuickActionCard
              icon={<CalendarDays size={20} />}
              iconColor="bg-amber-50 text-amber-500"
              label="Schedule Exam"
              onClick={() => navigate("/admin/exam")}
            />

            <QuickActionCard
              icon={<FileBarChart2 size={20} />}
              iconColor="bg-cyan-50 text-cyan-600"
              label="Generate Report"
              onClick={() => navigate("/admin/reports")}
            />

            <QuickActionCard
              icon={<Megaphone size={20} />}
              iconColor="bg-rose-50 text-rose-500"
              label="Send Notice"
              onClick={() => navigate("/admin/notice")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
