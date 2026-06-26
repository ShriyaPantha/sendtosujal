export type UserRole =
  | "student"
  | "teacher"
  | "parent"
  | "admin"
  | "superadmin";

export interface RoleConfig {
  role: UserRole;
  label: string;
  dashboardPath: string;
  color: string;
  icon: string;
}

export const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  student: {
    role: "student",
    label: "Student",
    dashboardPath: "/dashboard/student",
    color: "#4F46E5",
    icon: "🎓",
  },
  teacher: {
    role: "teacher",
    label: "Teacher",
    dashboardPath: "/dashboard/teacher",
    color: "#0891B2",
    icon: "📚",
  },
  parent: {
    role: "parent",
    label: "Parent",
    dashboardPath: "/dashboard/parent",
    color: "#059669",
    icon: "👨‍👩‍👧",
  },
  admin: {
    role: "admin",
    label: "Admin",
    dashboardPath: "/dashboard/admin",
    color: "#D97706",
    icon: "🏫",
  },
  superadmin: {
    role: "superadmin",
    label: "Super Admin",
    dashboardPath: "/dashboard/superadmin",
    color: "#DC2626",
    icon: "⚡",
  },
};