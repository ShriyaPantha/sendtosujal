import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { FaChevronDown } from "react-icons/fa";

// --- CHART DATA CONFIGURATIONS ---
const pieData = [
  { name: "Present", value: 92, color: "#10b981" }, // Emerald green
  { name: "Absent", value: 6, color: "#ef4444" },   // Rose red
  { name: "Late", value: 2, color: "#f59e0b" },     // Amber yellow
];

const barData = [
  { name: "Mon", attendance: 80 },
  { name: "Tue", attendance: 82 },
  { name: "Wed", attendance: 88 },
  { name: "Thu", attendance: 96 },
  { name: "Fri", attendance: 75 },
  { name: "Sat", attendance: 76 },
];

const AttendanceOverview = () => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-2  max-w-xl w-full">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-xl font-bold text-[#1e293b]">Attendance Overview</h3>
        <button className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors">
          This Week <FaChevronDown className="text-xs " />
        </button>
      </div>

      {/* Top Split: Donut Chart & Legend Metrics */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Left Side: Donut Container with Absolute Core Text */}
        <div className="relative w-34 h-34 shrink-0 mt-3">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                innerRadius={45}
                outerRadius={65}
                startAngle={90}
                endAngle={-270}
                dataKey="value"
                stroke="none"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          
          {/* Inner Donut Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-extrabold text-[#1e293b]">92%</span>
            <span className="text-xs font-semibold text-gray-400 mt-0.5">Total</span>
          </div>
        </div>

        {/* Right Side: Interactive Row Legends */}
        <div className="flex-1 w-full space-y-4 max-w-60">
          {pieData.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span 
                  className="w-4 h-4 rounded" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm font-medium text-gray-600">{item.name}</span>
              </div>
              <span className="text-sm font-bold text-[#1e293b]">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Layout: Weekly Progress Bar Graph */}
      <div className="w-full h-37 -ml-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={barData} 
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            barSize={16}
          >
            <CartesianGrid 
              vertical={false} 
              stroke="#f1f5f9" 
            />
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
              dy={8}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12 }}
              domain={[0, 100]}
              ticks={[0, 50, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <Bar 
              dataKey="attendance" 
              fill="#10b981" 
              radius={[8, 8, 8, 8]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AttendanceOverview;