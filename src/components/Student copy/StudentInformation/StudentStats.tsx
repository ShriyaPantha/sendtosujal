const stats = [
  {
    title: "Current GPA",
    value: "3.85",
  },
  {
    title: "Attendance",
    value: "92%",
  },
  {
    title: "Credits Earned",
    value: "72",
  },
  {
    title: "Semester",
    value: "3rd",
  },
];

const StudentStats = () => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
      {stats.map((stat) => (
        <div
          key={stat.title}
          className="bg-white rounded-2xl p-5 shadow-sm"
        >
          <p className="text-gray-500 text-sm">
            {stat.title}
          </p>

          <h3 className="text-3xl font-bold mt-2">
            {stat.value}
          </h3>

          {stat.title === "Attendance" && (
            <div className="w-full bg-gray-200 h-2 rounded-full mt-3">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{ width: "92%" }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default StudentStats;