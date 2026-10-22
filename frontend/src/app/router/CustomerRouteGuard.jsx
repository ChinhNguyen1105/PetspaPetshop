import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../modules/auth/store/authStore.js";

const CustomerRouteGuard = ({ children }) => {
  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated
  );

  const user = useAuthStore((state) => state.user);

  const rawRole =
    user?.role?.roleName ||
    user?.role?.name ||
    (typeof user?.role === "string" ? user.role : "");

  const role = rawRole.toUpperCase();

  const isAdminOrStaff = [
    "ROLE_ADMIN",
    "ROLE_STAFF",
  ].includes(role);

  if (isAuthenticated && user && isAdminOrStaff) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};

export default CustomerRouteGuard;
