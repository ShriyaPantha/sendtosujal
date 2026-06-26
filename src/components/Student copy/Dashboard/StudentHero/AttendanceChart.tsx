import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Present", value: 92 },
  { name: "Absent", value: 8 },
];

const COLORS = ["#2563eb", "#e5e7eb"];

const AttendanceChart = () => {
  return (
    // Changed to standard Tailwind sizing (w-16 h-16 = 64px by 64px)
    <div className="w-16 h-16 shrink-0">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            // Adjusted radii so the 64px container perfectly bounds the chart
            innerRadius={22}
            outerRadius={30}
            startAngle={90}
            endAngle={-270}
            dataKey="value"
            stroke="none"
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index]}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AttendanceChart;