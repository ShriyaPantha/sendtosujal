import { useState } from "react";
import { Outlet } from "react-router-dom";
import TeacherSidebar from "../components/Teacher/TeacherSidebar/TeacherSidebar";
import TeacherNavbar from "../components/Teacher/TeacherNavbar/TeacherNavbar";
// import TeacherSidebar from "./TeacherSidebar/TeacherSidebar";
// import TeacherNavbar from "./TeacherNavbar/TeacherNavbar";

const TeacherLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    console.log("Real project search executed:", value);
  };

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      {/* Sidebar - Handles its own mobile sliding visibility rules internally */}
      <TeacherSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* Main Panel Content Area */}
      {/* lg:pl-64 automatically shifts the layout frame on desktop viewports to sit right beside the sidebar */}
      <div className="lg:pl-64 flex flex-col min-h-screen w-full transition-all duration-300">
        <TeacherNavbar 
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          searchValue={searchQuery}
          onSearchChange={handleSearch}
        />
        
        <main className="flex-1 p-4 md:p-6 w-full max-w-full overflow-x-hidden">
          <Outlet context={{ searchQuery }} />
        </main>
      </div>
    </div>
  );
};

export default TeacherLayout;