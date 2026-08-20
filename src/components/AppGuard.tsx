import React, { ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Spinner } from "./ui/Spinner";
import { UserRole } from "../domains/user/user.types";

interface AppGuardProps {
  requireAuth?: boolean;
  allowedRoles?: UserRole[];
  children?: ReactNode;
}

export const AppGuard: React.FC<AppGuardProps> = ({ requireAuth = false, allowedRoles, children }) => {
  const { currentUser, userProfile, loading } = useAuth();
  const location = useLocation();

  const actualRequireAuth = requireAuth || (allowedRoles && allowedRoles.length > 0) ? true : false;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <Spinner size="lg" />
      </div>
    );
  }

  if (actualRequireAuth && !currentUser) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (actualRequireAuth && currentUser && !currentUser.emailVerified && location.pathname !== "/verify-email") {
    return <Navigate to="/verify-email" replace />;
  }

  const activeRole = userProfile?.role as UserRole | undefined;

  if (allowedRoles && allowedRoles.length > 0) {
    if (!activeRole || !allowedRoles.includes(activeRole)) {
      console.warn(`[Security Alert AppGuard] Unauthorized or missing role "${activeRole}" for user ${currentUser?.email}`);
      return <Navigate to="/" replace />;
    }
  }

  return children ? <>{children}</> : <Outlet />;
};
