import { Outlet } from "react-router-dom";
import StudentSidebar from "../components/Student copy/StudentSidebar/StudentSidebar";
import StudentNavbar from "../components/Student copy/StudentNavbar/StudentNavbar";
import DashboardFooter from "../components/Student copy/Dashboard/StudentPages/DashboardFooter";
// import StudentSidebar from "../components/Student/StudentSidebar/StudentSidebar";
// import StudentNavbar from "../components/Student/StudentNavbar/StudentNavbar";
// import DashboardFooter from "../components/Student/Dashboard/StudentPages/DashboardFooter";

const StudentLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <StudentSidebar />

      <div className="md:ml-64 min-h-screen">
        <StudentNavbar />
        {/* <DashboardFooter/> */}

        <main className="p-4 md:p-6">
          <Outlet />
          <DashboardFooter/>
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;