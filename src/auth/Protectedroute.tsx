import type { ReactElement, ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isAuthenticated, getRole, type Role } from "./useAuth";

interface ProtectedRouteProps {
  allowedRoles?: Role[];
  children: ReactNode;
}

export default function ProtectedRoute({
  allowedRoles,
  children,
}: ProtectedRouteProps): ReactElement {
  const location = useLocation();

  if (!isAuthenticated()) {
    // not logged in at all -> bounce to landing page, remember where they
    // were headed in case you want to redirect back after login later
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  const role = getRole();
  const isAllowed =
    !allowedRoles || allowedRoles.length === 0 || (role !== null && allowedRoles.includes(role));

  if (!isAllowed) {
    // logged in, but wrong role for this section
    return <Navigate to="/" replace />;
  }

  return children as ReactElement;
}