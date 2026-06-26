import { useEffect, useState } from "react";
import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaBookOpen,
  FaMoneyBillWave,
  FaWallet,
} from "react-icons/fa";

import { MdOutlineAccessTimeFilled } from "react-icons/md";
import {  FiLoader } from "react-icons/fi";
import DashboardOverview from "../../DashboardOverview/DashboardOverview";
import axiosInstance from "../../../../../api/axiosInstance"; // adjust path to where your axios.ts lives

interface StatCardData {
  value: number;
  changePercent?: number;
  positive?: boolean;
}

interface DashboardStatsResponse {
  totalStudents: StatCardData;
  totalTeachers: StatCardData;
  totalCourses: StatCardData;
  totalRevenue: StatCardData;
  pendingFees: { value: number };
  attendanceRate: StatCardData;
}

const formatCurrency = (n: number) =>
  `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

const formatChange = (changePercent?: number) => {
  if (changePercent === undefined) return null;
  const sign = changePercent >= 0 ? "+" : "";
  return `${sign} ${changePercent}%`;
};

const AdminHome = () => {
  const [stats, setStats] = useState<DashboardStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get<{ success: boolean; data: DashboardStatsResponse }>(
          "/api/admin/dashboard/stats"
        );
        setStats(res.data.data);
      } catch (e: any) {
        setError(e.response?.data?.message || e.message || "Failed to load dashboard stats");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const cards = stats
    ? [
        {
          title: "Total Students",
          value: stats.totalStudents.value.toLocaleString(),
          change: formatChange(stats.totalStudents.changePercent),
          icon: <FaUserGraduate />,
          bg: "bg-blue-100",
          iconColor: "text-blue-600",
          positive: stats.totalStudents.positive,
        },
        {
          title: "Total Teachers",
          value: stats.totalTeachers.value.toLocaleString(),
          change: formatChange(stats.totalTeachers.changePercent),
          icon: <FaChalkboardTeacher />,
          bg: "bg-green-100",
          iconColor: "text-green-600",
          positive: stats.totalTeachers.positive,
        },
        {
          title: "Total Courses",
          value: stats.totalCourses.value.toLocaleString(),
          change: formatChange(stats.totalCourses.changePercent),
          icon: <FaBookOpen />,
          bg: "bg-purple-100",
          iconColor: "text-purple-600",
          positive: stats.totalCourses.positive,
        },
        {
          title: "Total Revenue",
          value: formatCurrency(stats.totalRevenue.value),
          change: formatChange(stats.totalRevenue.changePercent),
          icon: <FaMoneyBillWave />,
          bg: "bg-orange-100",
          iconColor: "text-orange-600",
          positive: stats.totalRevenue.positive,
        },
        {
          title: "Pending Fees",
          value: stats.pendingFees.value.toLocaleString(),
          change: null,
          icon: <FaWallet />,
          bg: "bg-red-100",
          iconColor: "text-red-600",
          positive: false,
        },
        {
          title: "Attendance Rate",
          value: `${stats.attendanceRate.value}%`,
          change: formatChange(stats.attendanceRate.changePercent),
          icon: <MdOutlineAccessTimeFilled />,
          bg: "bg-cyan-100",
          iconColor: "text-cyan-600",
          positive: stats.attendanceRate.positive,
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-slate-50 p-1">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Welcome back, Administrator! 👋
          </h1>

          <p className="text-slate-500 mt-1">
            Here's what's happening in your institution today.
          </p>
        </div>

       
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-4">
          ⚠️ {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-4">
        {loading ? (
          <div className="col-span-6 flex justify-center py-10">
            <FiLoader className="animate-spin text-slate-400" size={24} />
          </div>
        ) : (
          cards.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-xl ${item.bg} ${item.iconColor}`}
                >
                  {item.icon}
                </div>
              </div>

              <p className="text-sm text-slate-500 mt-4">{item.title}</p>

              <h3 className="text-2xl font-bold text-slate-800 mt-1">
                {item.value}
              </h3>

              {item.change && (
                <p
                  className={`text-xs mt-2 ${
                    item.positive ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {item.change} from last month
                </p>
              )}
            </div>
          ))
        )}
      </div>
      <DashboardOverview />
    </div>
  );
};

export default AdminHome;