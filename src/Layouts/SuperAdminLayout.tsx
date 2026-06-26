import { Outlet } from "react-router-dom";
import SuperAdminSidebar from "../components/SuperAdmin/superadminsidebar/superadminsidebar";
import SuperAdminNavbar from "../components/SuperAdmin/superadminnavbar/superadminnavbar";
// import SuperAdminNavbar from "../components/SuperAdmin/superadminnavbar/SuperAdminNavbar";
// import SuperAdminNavbar from "../components/SuperAdmin/superadminnavbar/SuperAdminNavbar";
// import SuperAdminSidebar from "../components/SuperAdmin/SuperAdminSidebar/SuperAdminSidebar";
// import SuperAdminNavbar from "../components/SuperAdmin/SuperAdminNavbar/SuperAdminNavbar";

const SuperAdminLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50">

      {/* Sidebar */}
      <SuperAdminSidebar />

      {/* Main Content */}
      <div className="md:ml-64 min-h-screen">

        {/* Navbar */}
        <SuperAdminNavbar />

        {/* Page Content */}
        <main className="p-4 md:p-6">
          <Outlet />
        </main>

      </div>
    </div>
  );
};

export default SuperAdminLayout;