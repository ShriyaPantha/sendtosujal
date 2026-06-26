import type { ReactElement } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

/* ========================= AUTH ========================= */
import ProtectedRoute from "./auth/Protectedroute";
import type { Role } from "./auth/useAuth";

/* ========================= LANDING ========================= */
import LandingPage from "./pages/LandingPage/LandingPage";
import VerifyOTP from "./components/LandingPage/VerifyOTP";

/* ========================= DATA STORES ========================= */
import { DataStoreProvider as TeacherDataStore } from "./pages/Dashboard/TeacherDashboard/DataStore";
import { DataStoreProvider as ParentDataStore } from "./pages/Dashboard/ParentDashboard/DataStore";

/* ========================= LAYOUTS ========================= */
import TeacherLayout from "./Layouts/TeacherLayout";
import ParentLayout from "./Layouts/ParentLayout";
import StudentLayout from "./Layouts/StudentLayout";
import ReceptionistLayout from "./Layouts/ReceptionistLayout";
import SuperAdminLayout from "./Layouts/SuperAdminLayout";
import AdminLayout from "./Layouts/AdminstratorLayout";

/* ========================= TEACHER ========================= */
import TeacherDashboard from "./pages/Dashboard/TeacherDashboard/TeacherDashboard";
import Students from "./pages/Dashboard/TeacherDashboard/Student";
import Attendance from "./pages/Dashboard/TeacherDashboard/Attendance";
import ClassAttendance from "./pages/Dashboard/TeacherDashboard/ClassAttendance";
import Assignments from "./pages/Dashboard/TeacherDashboard/Assignments";
import Salary from "./pages/Dashboard/TeacherDashboard/Salary";
import ClassStudentList from "./pages/Dashboard/TeacherDashboard/ClassStudentslist";
import TeacherProfile from "./pages/Dashboard/TeacherDashboard/Profile";
import LeaveManagement from "./pages/Dashboard/TeacherDashboard/LeaveManagement";
import Timetable from "./pages/Dashboard/TeacherDashboard/TimeTable";
import ExamsAndMarks from "./pages/Dashboard/TeacherDashboard/Exams";
import TeacherSettings from "./pages/Dashboard/TeacherDashboard/Settings";

/* ========================= PARENT ========================= */
import ParentDashboard from "./pages/Dashboard/ParentDashboard/ParentDashboard";
import Parentattendance from "./pages/Dashboard/ParentDashboard/Parentattendance";
import Fees from "./pages/Dashboard/ParentDashboard/Fees";
import Reports from "./pages/Dashboard/ParentDashboard/Reports";
import Notices from "./pages/Dashboard/ParentDashboard/Notices";
import ParentProfile from "./pages/Dashboard/ParentDashboard/ParentProfile";
import ParentSettings from "./pages/Dashboard/ParentDashboard/ParentSettings";
import Events from "./pages/Dashboard/ParentDashboard/Events";

/* ========================= STUDENT ========================= */
import StudentDashboard from "./pages/Dashboard/StudentDashboard/StudentDashboard";
import StudentHome from "./components/Student copy/Dashboard/StudentHome/StudentHome";
import StudentProfile from "./components/Student copy/StudentInformation/StudentMainProfile/StudentMainProfile";
import StudentFees from "./components/Student copy/StudentFees/StudentFees";
import StudentExams from "./components/Student copy/StudentExam/StudentExams";
import StudentNotices from "./components/Student copy/StudentNotices/StudentNotices";
import StudentSetting from "./components/Student copy/StudentSettings/StudentSettings";
import AttendancePage from "./components/Student copy/StudentAttendance/StudentAttendance";

/* ========================= RECEPTIONIST ========================= */
import ReceptionistDashboard from "./pages/Dashboard/ReceptionistDashboard/ReceptionistDashboard";
import Visitors from "./pages/Dashboard/ReceptionistDashboard/Visitors";
import Deliveries from "./pages/Dashboard/ReceptionistDashboard/Deliveries";
import Appointments from "./pages/Dashboard/ReceptionistDashboard/Appointment";
import PhoneDirectory from "./pages/Dashboard/ReceptionistDashboard/PhoneDirectory";
import Documents from "./pages/Dashboard/ReceptionistDashboard/Documents";
import Rprofile from "./pages/Dashboard/ReceptionistDashboard/Profile";
import SSettings from "./pages/Dashboard/ReceptionistDashboard/Setting";

/* ========================= SUPER ADMIN ========================= */
import SuperAdminDashboard from "./pages/Dashboard/SuperAdminDashboard/SuperAdminDashboard";
import ManageUsers from "./pages/Dashboard/SuperAdminDashboard/ManageUsers";
import Roles from "./pages/Dashboard/SuperAdminDashboard/Roles";
import AuditLogs from "./pages/Dashboard/SuperAdminDashboard/AuditLogs";
import SuperAdminSettings from "./pages/Dashboard/SuperAdminDashboard/Settings";
import Billing from "./pages/Dashboard/SuperAdminDashboard/Billing";
import SuperAdminSubscriptions from "./pages/Dashboard/SuperAdminDashboard/Superadminsubscriptions";
import SuperAdminSchools from "./pages/Dashboard/SuperAdminDashboard/SuperAdminSchools";

/* ========================= ADMIN ========================= */
import AdminstratorDashboard from "./pages/Dashboard/AdminstratorDashboard/AdminstratorDashboard";
import AdminAttendance from "./components/Administrator/AdminAttendance/AdminAttendanceDashboard";
import AdminDepartment from "./components/Administrator/AdminDepartment/AdminDepartment";
import AdminExam from "./components/Administrator/AdminExam/AdminExam";
import AdminFeePayment from "./components/Administrator/AdminFee&Payment/AdminFee&Payment";
import AdminNotice from "./components/Administrator/AdminNotice/AdminNotice";
import AdminReports from "./components/Administrator/AdminReports/AdminReports";
import AdminSettings from "./components/Administrator/AdminSettings/AdminSettings";
import StudentProfilePage from "./components/Administrator/StudentProfilePage/StudentProfilePage";
import TeacherManager from "./components/Administrator/TeacherStudentManager/TeacherManager";
import ParentsPage from "./components/Administrator/ParentsPage/ParentsPage";

const ROLES: Record<string, Role> = {
  TEACHER:    "teacher",
  PARENT:     "parent",
  STUDENT:    "student",
  RECEPTION:  "reception",
  SUPERADMIN: "superadmin",
  ADMIN:      "admin",
};

function App(): ReactElement {
  return (
    <Routes>

      {/* ================= PUBLIC ================= */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />

      {/* ================= TEACHER ================= */}
      <Route
        path="/teacher/*"
        element={
          <ProtectedRoute allowedRoles={[ROLES.TEACHER]}>
            <TeacherDataStore>
              <TeacherLayout />
            </TeacherDataStore>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"     element={<TeacherDashboard />} />
        <Route path="students"      element={<Students />} />
        <Route path="students/:classId" element={<ClassStudentList />} />
        <Route path="attendance"    element={<Attendance />} />
        <Route path="attendance/:classId" element={<ClassAttendance />} />
        <Route path="assignments"   element={<Assignments />} />
        <Route path="salary"        element={<Salary />} />
        <Route path="profile"       element={<TeacherProfile />} />
        <Route path="leavemanagement" element={<LeaveManagement />} />
        <Route path="timetable"     element={<Timetable />} />
        <Route path="exams"         element={<ExamsAndMarks />} />
        <Route path="settings"      element={<TeacherSettings />} />
      </Route>

      {/* ================= PARENT ================= */}
      <Route
        path="/parent/*"
        element={
          <ProtectedRoute allowedRoles={[ROLES.PARENT]}>
            <ParentDataStore>
              <ParentLayout />
            </ParentDataStore>
          </ProtectedRoute>
        }
      >
        <Route index element={<ParentDashboard />} />
        <Route path="dashboard"  element={<ParentDashboard />} />
        <Route path="attendance" element={<Parentattendance />} />
        <Route path="fees"       element={<Fees />} />
        <Route path="reports"    element={<Reports />} />
        <Route path="notices"    element={<Notices />} />
        <Route path="profile"    element={<ParentProfile />} />
        <Route path="settings"   element={<ParentSettings />} />
        <Route path="events"     element={<Events />} />
      </Route>

      {/* ================= STUDENT ================= */}
      <Route
        path="/student/*"
        element={
          <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<StudentDashboard />} />
        <Route path="dashboard"  element={<StudentDashboard />} />
        <Route path="home"       element={<StudentHome />} />
        <Route path="profile"    element={<StudentProfile />} />
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="fees"       element={<StudentFees />} />
        <Route path="exams"      element={<StudentExams />} />
        <Route path="notices"    element={<StudentNotices />} />
        <Route path="settings"   element={<StudentSetting />} />
      </Route>

      {/* ================= RECEPTION ================= */}
      <Route
        path="/reception/*"
        element={
          <ProtectedRoute allowedRoles={[ROLES.RECEPTION]}>
            <ReceptionistLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"       element={<ReceptionistDashboard />} />
        <Route path="visitors"        element={<Visitors />} />
        <Route path="appointments"    element={<Appointments />} />
        <Route path="deliveries"      element={<Deliveries />} />
        <Route path="phone-directory" element={<PhoneDirectory />} />
        <Route path="documents"       element={<Documents />} />
        <Route path="profile"         element={<Rprofile />} />
        <Route path="settings"        element={<SSettings />} />
      </Route>

      {/* ================= SUPER ADMIN ================= */}
      <Route
        path="/superadmin/*"
        element={
          <ProtectedRoute allowedRoles={[ROLES.SUPERADMIN]}>
            <SuperAdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"     element={<SuperAdminDashboard />} />
        <Route path="users"         element={<ManageUsers />} />
        <Route path="Subscriptions" element={<SuperAdminSubscriptions />} />
        <Route path="School"        element={<SuperAdminSchools />} />
        <Route path="billing"       element={<Billing />} />
        <Route path="roles"         element={<Roles />} />
        <Route path="settings"      element={<SuperAdminSettings />} />
        <Route path="audit-logs"    element={<AuditLogs />} />
      </Route>

      {/* ================= ADMIN ================= */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"   element={<AdminstratorDashboard />} />
        <Route path="student"     element={<StudentProfilePage />} />
        <Route path="teacher"     element={<TeacherManager />} />
        <Route path="department"  element={<AdminDepartment />} />
        <Route path="attendance"  element={<AdminAttendance />} />
        <Route path="fee-payment" element={<AdminFeePayment />} />
        <Route path="exam"        element={<AdminExam />} />
        <Route path="notice"      element={<AdminNotice />} />
        <Route path="reports"     element={<AdminReports />} />
        <Route path="settings"    element={<AdminSettings />} />
        <Route path="parent"      element={<ParentsPage />} />
      </Route>

      {/* ================= 404 ================= */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}

export default App;