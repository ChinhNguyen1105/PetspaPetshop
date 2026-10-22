// src/app/router/RoleRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../modules/auth/store/authStore.js";

const RoleRoute = ({ children, allowedRoles = [] }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const user = useAuthStore((state) => state.user);

  // Chưa đăng nhập
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Lấy role từ các cấu trúc dữ liệu có thể có
  const rawRole =
    user?.role?.roleName ||
    user?.role?.name ||
    (typeof user?.role === "string" ? user.role : "");

  const userRole = rawRole.toUpperCase();

  const normalizedAllowedRoles = allowedRoles.map((role) => role.toUpperCase());

  // Role không được phép truy cập route hiện tại
  if (!normalizedAllowedRoles.includes(userRole)) {
    // Admin và Staff luôn quay về trang quản trị
    if (["ROLE_ADMIN", "ROLE_STAFF"].includes(userRole)) {
      return <Navigate to="/admin/dashboard" replace />;
    }

    // Các role khác quay về trang chủ
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RoleRoute;
