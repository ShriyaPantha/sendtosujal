import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { AlertTriangle, UserPlus, Calendar, DollarSign, Loader2 } from "lucide-react";
import DashboardStats from "../DashboardStats/DashboardStats";
import DashboardDetailsRow from "../DashboardDetailsRow/DashboardDetailsRow";
import ParentOverview from "../Parentoverview/Parentoverview";
import axiosInstance from "../../../../api/axiosInstance"; 

// --- Types & Interfaces ---
interface GrowthDataPoint {
  name: string;
  students: number;
}

interface AttendanceDataPoint {
  name: string;
  value: number;
  color: string;
}

interface NotificationAlert {
  type: "attendance" | "admission" | "exam" | "fee" | string;
  title: string;
  subtitle: string;
}

const notificationStyles: Record<string, { icon: React.ReactNode; bg: string; color: string }> = {
  attendance: { icon: <AlertTriangle size={15} />, bg: "bg-amber-50", color: "text-amber-500" },
  admission: { icon: <UserPlus size={15} />, bg: "bg-blue-50", color: "text-blue-500" },
  exam: { icon: <Calendar size={15} />, bg: "bg-purple-50", color: "text-purple-500" },
  fee: { icon: <DollarSign size={15} />, bg: "bg-emerald-50", color: "text-emerald-500" },
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-blue-600 text-white px-3 py-1.5 rounded-lg shadow-lg text-xs relative font-semibold">
        <div className="text-[14px] font-bold">
          {payload[0].value?.toLocaleString()}
        </div>
        <div className="text-[10px] opacity-80 font-normal">Total Students</div>
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-600 rotate-45"></div>
      </div>
    );
  }
  return null;
};

export default function DashboardOverview() {
  const [growthData, setGrowthData] = useState<GrowthDataPoint[]>([]);
  const [attendanceData, setAttendanceData] = useState<AttendanceDataPoint[]>([]);
  const [notifications, setNotifications] = useState<NotificationAlert[]>([]);
  const [loadingGrowth, setLoadingGrowth] = useState(true);
  const [loadingAttendance, setLoadingAttendance] = useState(true);
  const [loadingNotifications, setLoadingNotifications] = useState(true);

  useEffect(() => {
    axiosInstance
      .get("/api/admin/dashboard/growth")
      .then((res) => setGrowthData(res.data.data))
      .catch((e) => console.error("Failed to load growth data", e))
      .finally(() => setLoadingGrowth(false));

    axiosInstance
      .get("/api/admin/dashboard/attendance-overview")
      .then((res) => setAttendanceData(res.data.data))
      .catch((e) => console.error("Failed to load attendance overview", e))
      .finally(() => setLoadingAttendance(false));

    axiosInstance
      .get("/api/admin/dashboard/notifications")
      .then((res) => setNotifications(res.data.data))
      .catch((e) => console.error("Failed to load notifications", e))
      .finally(() => setLoadingNotifications(false));
  }, []);

  const presentPct = attendanceData.find((d) => d.name === "Present")?.value ?? 0;

  return (
    <div className="w-full bg-slate-50 px-1 py-4 font-sans text-slate-800 flex flex-col gap-2">
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* 1. Student Growth Card */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-80">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-slate-700 text-base">
              Student Growth{" "}
              <span className="text-slate-400 font-normal text-sm">(This Year)</span>
            </h3>
          </div>

          <div className="h-56 w-full -ml-4 pr-4 flex items-center justify-center">
            {loadingGrowth ? (
              <Loader2 className="animate-spin text-slate-400" size={24} />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={growthData}
                  margin={{ top: 25, right: 5, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="students"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorStudents)"
                    dot={{
                      r: 4,
                      stroke: "#3b82f6",
                      strokeWidth: 2,
                      fill: "#fff",
                    }}
                    activeDot={{ r: 6 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* 2. Attendance Overview Card */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col h-80">
          <h3 className="font-bold text-slate-700 text-base mb-2">
            Attendance Overview <span className="text-slate-400 font-normal text-sm">(This Month)</span>
          </h3>

          {loadingAttendance ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="animate-spin text-slate-400" size={24} />
            </div>
          ) : (
            <div className="flex items-center justify-between my-auto gap-4">
              <div className="relative w-40 h-40 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={attendanceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {attendanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-slate-800">{presentPct}%</span>
                  <span className="text-xs text-slate-400 font-medium">Present</span>
                </div>
              </div>

              <div className="flex flex-col gap-3 pr-2 flex-1">
                {attendanceData.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-slate-500 font-medium">{item.name}</span>
                    </div>
                    <span className="font-bold text-slate-700">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 3. Important Notifications Card */}
        <div className="lg:col-span-3 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col h-80">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-700 text-base">
              Notifications
            </h3>
          </div>

          <div className="flex flex-col gap-3 overflow-y-auto pr-1 custom-scrollbar">
            {loadingNotifications ? (
              <div className="flex-1 flex items-center justify-center py-6">
                <Loader2 className="animate-spin text-slate-400" size={20} />
              </div>
            ) : notifications.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No alerts right now.</p>
            ) : (
              notifications.map((n, idx) => {
                const style = notificationStyles[n.type] || notificationStyles.admission;
                return (
                  <div
                    key={idx}
                    className={`flex items-start gap-2.5 pb-2 ${
                      idx !== notifications.length - 1 ? "border-b border-slate-50" : ""
                    }`}
                  >
                    <div className={`p-1.5 ${style.bg} ${style.color} rounded-lg mt-0.5 shrink-0`}>
                      {style.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[11px] font-bold text-slate-800 truncate">{n.title}</h4>
                      <p className="text-[11px] text-slate-400 truncate">{n.subtitle}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Render secondary section seamlessly directly below with equal grid tracking gap */}
      <div className="max-w-7xl mx-auto w-full -mt-6">
         <DashboardStats />
         <DashboardDetailsRow/>
         <ParentOverview />
      </div>
    </div>
  );
}