import React, { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import Header from "./layouts/public/Header.jsx";
import Footer from "./layouts/public/Footer.jsx";
import ToastContainer from "./shared/components/ToastContainer.jsx";

// Pages - Shop
import HomePage from "./modules/home/pages/HomePage.jsx";
import ProductList from "./modules/products/pages/public/ProductList.jsx";
import ProductDetail from "./modules/products/pages/public/ProductDetail.jsx";
import Cart from "./modules/cart/pages/Cart.jsx";
import Checkout from "./modules/orders/pages/Checkout.jsx";
import VNPayReturnPage from "./modules/payments/pages/VNPayReturnPage.jsx";
import OrderSuccess from "./modules/orders/pages/public/OrderSuccess.jsx";

// Pages - Spa
import ServiceList from "./modules/services/pages/public/ServiceList.jsx";
import ServiceDetail from "./modules/services/pages/public/ServiceDetail.jsx";
import BookingList from "./modules/bookings/pages/public/BookingList.jsx";
import BookingDetail from "./modules/bookings/pages/public/BookingDetail.jsx";
import BookingCreate from "./modules/bookings/pages/public/BookingCreate.jsx";

// Pages - Profile & Pet
import Profile from "./modules/users/pages/public/Profile.jsx";
import PetEdit from "./modules/pets/pages/public/PetEdit.jsx";
import PetDetail from "./modules/pets/pages/public/PetDetail.jsx";
import PetCreate from "./modules/pets/pages/public/PetCreate.jsx";

// Pages - Review
import CreateOrderReview from "./modules/reviews/pages/CreateOrderReview.jsx";
import CreateBookingReview from "./modules/reviews/pages/CreateBookingReview.jsx";

import OrderDetail from "./modules/orders/pages/public/OrderDetail.jsx";
import AboutUs from "./modules/about/pages/public/AboutUs.jsx";
import Login from "./modules/auth/pages/Login.jsx";
import Register from "./modules/auth/pages/Register.jsx";

import { useAuthStore } from "./modules/auth/store/authStore.js";
import "./styles/animations.css";

// Pages - Admin
import Dashboard from "./modules/dashboard/pages/admin/Dashboard.jsx";
import AdminLayout from "./layouts/admin/AdminLayout.jsx";
import ProductManagement from "./modules/products/pages/admin/ProductManagement.jsx";
import CategoryManagement from "./modules/categories/pages/admin/CategoryManagement.jsx";
import ServiceManagement from "./modules/services/pages/admin/ServiceManagement.jsx";
import BookingManagement from "./modules/bookings/pages/admin/BookingManagement.jsx";
import OrderManagement from "./modules/orders/pages/admin/OrderManagement.jsx";
import UserManagement from "./modules/users/pages/admin/UserManagement.jsx";
import RevenueReport from "./modules/reports/pages/admin/RevenueReport.jsx";
import RoleManagement from "./modules/roles/pages/admin/RoleManagement.jsx";
import InventoryListManagement from "./modules/inventory/pages/admin/InventoryListManagement.jsx";
import InventoryTransManagement from "./modules/inventory/pages/admin/InventoryTransactionManagement.jsx";
import PermissionManagement from "./modules/permissions/pages/admin/PermissionManagement.jsx";

// Route Guards
import RoleRoute from "./app/router/RoleRoute.jsx";
import AdminRoute from "./app/router/AdminRoute.jsx";
import CustomerRouteGuard from "./app/router/CustomerRouteGuard.jsx";

// ----------------------------------------------------------------------
// ROLE CONFIG
// ----------------------------------------------------------------------

const customerRoles = ["ROLE_USER"];

// ----------------------------------------------------------------------
// AUTH ROUTES
// ----------------------------------------------------------------------

const AnonymousRoute = ({ children }) => {
  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated
  );

  const user = useAuthStore((state) => state.user);

  if (!isAuthenticated) {
    return children;
  }

  const rawRole =
    user?.role?.roleName ||
    user?.role?.name ||
    (typeof user?.role === "string" ? user.role : "");

  const role = rawRole.toUpperCase();

  if (["ROLE_ADMIN", "ROLE_STAFF"].includes(role)) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Navigate to="/" replace />;
};

// ----------------------------------------------------------------------
// APP COMPONENT
// ----------------------------------------------------------------------

function App() {
  const sync = useAuthStore((state) => state.sync);

  useEffect(() => {
    if (typeof sync === "function") {
      sync();
    }
  }, [sync]);

  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  const isAuthRoute =
    location.pathname === "/login" ||
    location.pathname === "/register";

  return (
    <div className="flex flex-col min-h-screen">
      {!isAdminRoute && <Header />}

      <ToastContainer />

      <main className="flex-grow pt-20">
        <Routes>
          {/* ========================================================= */}
          {/* PUBLIC ROUTES */}
          {/* Admin/Staff truy cập sẽ bị CustomerRouteGuard chặn */}
          {/* ========================================================= */}

          <Route
            path="/"
            element={
              <CustomerRouteGuard>
                <HomePage />
              </CustomerRouteGuard>
            }
          />

          <Route
            path="/about"
            element={
              <CustomerRouteGuard>
                <AboutUs />
              </CustomerRouteGuard>
            }
          />

          <Route
            path="/shop"
            element={
              <CustomerRouteGuard>
                <ProductList />
              </CustomerRouteGuard>
            }
          />

          <Route
            path="/shop/product/:id"
            element={
              <CustomerRouteGuard>
                <ProductDetail />
              </CustomerRouteGuard>
            }
          />

          <Route
            path="/spa"
            element={
              <CustomerRouteGuard>
                <ServiceList />
              </CustomerRouteGuard>
            }
          />

          <Route
            path="/spa/service/:id"
            element={
              <CustomerRouteGuard>
                <ServiceDetail />
              </CustomerRouteGuard>
            }
          />

          {/* ========================================================= */}
          {/* AUTH ROUTES */}
          {/* Login/Register được giữ riêng, không bọc CustomerRouteGuard */}
          {/* ========================================================= */}

          <Route
            path="/login"
            element={
              <AnonymousRoute>
                <Login />
              </AnonymousRoute>
            }
          />

          <Route
            path="/register"
            element={
              <AnonymousRoute>
                <Register />
              </AnonymousRoute>
            }
          />

          {/* ========================================================= */}
          {/* CUSTOMER ROUTES */}
          {/* CustomerRouteGuard chặn Admin/Staff trước */}
          {/* RoleRoute kiểm tra quyền đăng nhập của customer */}
          {/* ========================================================= */}

          <Route
            path="/shop/cart"
            element={
              <CustomerRouteGuard>
                <RoleRoute allowedRoles={customerRoles}>
                  <Cart />
                </RoleRoute>
              </CustomerRouteGuard>
            }
          />

          <Route
            path="/shop/checkout"
            element={
              <CustomerRouteGuard>
                <RoleRoute allowedRoles={customerRoles}>
                  <Checkout />
                </RoleRoute>
              </CustomerRouteGuard>
            }
          />

          <Route
            path="/spa/booking/create"
            element={
              <CustomerRouteGuard>
                <RoleRoute allowedRoles={customerRoles}>
                  <BookingCreate />
                </RoleRoute>
              </CustomerRouteGuard>
            }
          />

          <Route
            path="/booking/create/:id"
            element={
              <CustomerRouteGuard>
                <RoleRoute allowedRoles={customerRoles}>
                  <BookingCreate />
                </RoleRoute>
              </CustomerRouteGuard>
            }
          />

          <Route
            path="/spa/bookings"
            element={
              <CustomerRouteGuard>
                <RoleRoute allowedRoles={customerRoles}>
                  <BookingList />
                </RoleRoute>
              </CustomerRouteGuard>
            }
          />

          <Route
            path="/spa/booking/:id"
            element={
              <CustomerRouteGuard>
                <RoleRoute allowedRoles={customerRoles}>
                  <BookingDetail />
                </RoleRoute>
              </CustomerRouteGuard>
            }
          />

          {/* ORDER SUCCESS */}

          <Route
            path="/order-success"
            element={
              <CustomerRouteGuard>
                <RoleRoute allowedRoles={customerRoles}>
                  <OrderSuccess />
                </RoleRoute>
              </CustomerRouteGuard>
            }
          />

          {/* VNPAY RETURN */}

          <Route
            path="/payment/vnpay/return"
            element={
              <CustomerRouteGuard>
                <RoleRoute allowedRoles={customerRoles}>
                  <VNPayReturnPage />
                </RoleRoute>
              </CustomerRouteGuard>
            }
          />

          {/* PROFILE & PETS */}

          <Route
            path="/profile"
            element={
              <CustomerRouteGuard>
                <RoleRoute allowedRoles={customerRoles}>
                  <Profile />
                </RoleRoute>
              </CustomerRouteGuard>
            }
          />

          <Route
            path="/profile/orders/:id"
            element={
              <CustomerRouteGuard>
                <RoleRoute allowedRoles={customerRoles}>
                  <OrderDetail />
                </RoleRoute>
              </CustomerRouteGuard>
            }
          />

          <Route
            path="/profile/pets/detail/:id"
            element={
              <CustomerRouteGuard>
                <RoleRoute allowedRoles={customerRoles}>
                  <PetDetail />
                </RoleRoute>
              </CustomerRouteGuard>
            }
          />

          <Route
            path="/profile/pets/edit/:id"
            element={
              <CustomerRouteGuard>
                <RoleRoute allowedRoles={customerRoles}>
                  <PetEdit />
                </RoleRoute>
              </CustomerRouteGuard>
            }
          />

          <Route
            path="/profile/pets/create"
            element={
              <CustomerRouteGuard>
                <RoleRoute allowedRoles={customerRoles}>
                  <PetCreate />
                </RoleRoute>
              </CustomerRouteGuard>
            }
          />

          {/* REVIEWS */}

          <Route
            path="/review/create/product/:orderId"
            element={
              <CustomerRouteGuard>
                <RoleRoute allowedRoles={customerRoles}>
                  <CreateOrderReview />
                </RoleRoute>
              </CustomerRouteGuard>
            }
          />

          <Route
            path="/review/create/booking/:bookingId"
            element={
              <CustomerRouteGuard>
                <RoleRoute allowedRoles={customerRoles}>
                  <CreateBookingReview />
                </RoleRoute>
              </CustomerRouteGuard>
            }
          />

          {/* ========================================================= */}
          {/* ADMIN ROUTES */}
          {/* Chỉ Admin/Staff được truy cập */}
          {/* ========================================================= */}

          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route
              index
              element={<Navigate to="dashboard" replace />}
            />

            <Route path="dashboard" element={<Dashboard />} />

            <Route
              path="products/list"
              element={<ProductManagement />}
            />

            <Route
              path="categories"
              element={<CategoryManagement />}
            />

            <Route
              path="services/list"
              element={<ServiceManagement />}
            />

            <Route
              path="bookings"
              element={<BookingManagement />}
            />

            <Route
              path="orders"
              element={<OrderManagement />}
            />

            <Route
              path="users"
              element={<UserManagement />}
            />

            <Route
              path="reports"
              element={<RevenueReport />}
            />

            <Route
              path="roles"
              element={<RoleManagement />}
            />

            <Route
              path="inventory/list"
              element={<InventoryListManagement />}
            />

            <Route
              path="inventory/transaction"
              element={<InventoryTransManagement />}
            />

            <Route
              path="permission"
              element={<PermissionManagement />}
            />

            {/* URL không tồn tại trong khu vực admin */}
            <Route
              path="*"
              element={<Navigate to="/admin/dashboard" replace />}
            />
          </Route>

          {/* ========================================================= */}
          {/* FALLBACK */}
          {/* Admin/Staff không được rơi về public homepage */}
          {/* ========================================================= */}

          <Route
            path="*"
            element={
              <Navigate
                to="/"
                replace
              />
            }
          />
        </Routes>
      </main>

      {!isAdminRoute && <Footer />}
    </div>
  );
}

export default App;
