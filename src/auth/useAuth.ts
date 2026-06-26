export type Role =
  | "teacher"
  | "parent"
  | "student"
  | "reception"
  | "superadmin"
  | "admin";

export interface User {
  role: Role;
  [key: string]: unknown;
}

export interface AuthState {
  token: string | null;
  user: User | null;
  role: Role | null;
  isAuthenticated: boolean;
}

export function getToken(): string | null {
  return localStorage.getItem("token");
}

export function getUser(): User | null {
  const raw = localStorage.getItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function getRole(): Role | null {
  const user = getUser();
  return user?.role ?? null;
}

export function isAuthenticated(): boolean {
  return Boolean(getToken());
}

export function logout(): void {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

// Simple hook-style wrapper in case you want to call this from components.
// Not reactive to localStorage changes mid-session (a full page nav happens
// on login/logout anyway, since LandingPage handles login), but if you later
// want live updates, wrap this in state + a storage event listener.
export default function useAuth(): AuthState {
  return {
    token: getToken(),
    user: getUser(),
    role: getRole(),
    isAuthenticated: isAuthenticated(),
  };
}