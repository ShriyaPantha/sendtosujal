import {
  FaBook,
  FaUserGraduate,
  FaClipboardCheck,
  FaMoneyBillWave,
} from "react-icons/fa";
import AttendanceChart from "./AttendanceChart";
import AttendanceOverview from "./AttendanceOverview";
import DashboardSchedules from "../StudentPages/DashboardSchedules";
import FeeSummaryCard from "../StudentPages/FeeSummaryCard";
import AchievementsCard from "../StudentPages/AchievementsCard";
import DashboardAnalyticsRow from "../StudentPages/DashboardAnalyticsRow";

const StudentHero = () => {
  const statCards = [
    {
      id: "attendance",
      title: "Attendance Rate",
      value: "92%",
      subtext: "This Month",
      trend: "↑ 5% from last month",
      isPositive: true,
      icon: FaBook,
      bgIcon: "bg-blue-100",
      textColor: "text-blue-600",
    },
    {
      id: "gpa",
      title: "Current GPA",
      value: "3.85",
      subtext: "Out of 4.00",
      trend: "↑ 0.15 from last semester",
      isPositive: true,
      icon: FaUserGraduate,
      bgIcon: "bg-purple-100",
      textColor: "text-purple-600",
    },
    {
      id: "assignments",
      title: "Completed Assignments",
      value: "28",
      subtext: "Total Completed",
      trend: "↑ 8 this month",
      isPositive: true,
      icon: FaClipboardCheck,
      bgIcon: "bg-green-100",
      textColor: "text-green-600",
    },
    {
      id: "fees",
      title: "Pending Fees",
      value: "Rs. 5,000",
      subtext: "Due Amount",
      trend: "● Due in 7 days",
      isPositive: false, // Uses orange alerting colors
      icon: FaMoneyBillWave,
      bgIcon: "bg-orange-100",
      textColor: "text-orange-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
      <div className="xl:col-span-2 relative overflow-hidden ">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mt-2 ">
          {statCards.map((card) => {
            const IconComponent = card.icon;

            return (
              <div
                key={card.id}
                className="bg-white rounded-xl border px-4 py-2  shadow-sm flex flex-col justify-between border-gray-100 "
              >
                {" "}
                {/* Header */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={`w-8 h-8 rounded-lg ${card.bgIcon} flex items-center justify-center`}
                    >
                      <IconComponent className={`${card.textColor} text-xs`} />
                    </div>
                    <p className="text-xs font-medium text-gray-500">
                      {card.title}
                    </p>
                  </div>

                  {/* Body Content */}
                  <div className="flex items-center justify-between">
                    {/* Render chart ONLY for the attendance card */}
                    {card.id === "attendance" && <AttendanceChart />}

                    <div
                      className={`flex-1 ${card.id === "attendance" ? "ml-3" : ""}`}
                    >
                      <h2 className="text-2xl font-bold text-gray-800">
                        {card.value}
                      </h2>
                      <p className="text-xs text-gray-400 mt-1">
                        {card.subtext}
                      </p>
                    </div>
                  </div>
                </div>
                {/* Footer/Trend */}
                <p
                  className={`text-xs mt-1 font-medium ${card.isPositive ? "text-green-600" : "text-orange-600"}`}
                >
                  {card.trend}
                </p>
              </div>
            );
          })}
        </div>
        <DashboardSchedules />
        <DashboardAnalyticsRow />
      </div>
      <div className="mt-2">
        <AttendanceOverview />
        <FeeSummaryCard />
        <AchievementsCard />
      </div>
    </div>
  );
};

export default StudentHero;
