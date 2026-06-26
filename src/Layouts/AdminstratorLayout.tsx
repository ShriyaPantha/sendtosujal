import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/Administrator/Sidebar/AdminSidebar";
import AdminNavbar from "../components/Administrator/Navbar/AdminNavbar";


const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* 1. Pass down open state and toggle function to Sidebar */}
      <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* 2. Content Container: Shifts right on desktop grids */}
      <div className="lg:pl-72 flex flex-col min-h-screen">
        
        {/* 3. Pass toggle function to Navbar for mobile users */}
        <AdminNavbar onToggleSidebar={() => setIsSidebarOpen(true)} />

        {/* 4. Page Main Contents */}
        <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto">
          <Outlet /> {/* This renders your active child dashboard routes */}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;