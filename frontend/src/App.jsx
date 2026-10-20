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
import CreateOrderReview from "./modules/reviews/pages/CreateProductReview.jsx";
import CreateBookingReview from "./modules/reviews/pages/CreateBookingReview.jsx";

import OrderDetail from "./modules/orders/pages/public/OrderDetail.jsx";
import AboutUs from "./modules/about/pages/public/AboutUs.jsx";
import Login from "./modules/auth/pages/Login.jsx";
import Register from "./modules/auth/pages/Register.jsx";

import { useAuthStore } from "./modules/auth/store/authStore.js";
import "./styles/animations.css";

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

// Import Role Route Guard động
import RoleRoute from "./app/router/RoleRoute.jsx";

// ----------------------------------------------------------------------
// ROUTE GUARDS
// ----------------------------------------------------------------------

const AnonymousRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return !isAuthenticated ? children : <Navigate to="/" replace />;
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

  // --------------------------------------------------------------------
  // ROLE CONFIG
  // --------------------------------------------------------------------

  const customerRoles = ["ROLE_USER"];
  const adminRoles = ["ROLE_ADMIN", "ROLE_STAFF"];

  // --------------------------------------------------------------------
  // RENDER
  // --------------------------------------------------------------------

  return (
    <div className="flex flex-col min-h-screen">
      {!isAdminRoute && <Header />}

      <ToastContainer />

      <main className="flex-grow pt-20">
        <Routes>
          {/* ========================================================= */}
          {/* PUBLIC ROUTES - KHÔNG CẦN ĐĂNG NHẬP */}
          {/* ========================================================= */}

          <Route path="/" element={<HomePage />} />

          <Route path="/about" element={<AboutUs />} />

          <Route path="/shop" element={<ProductList />} />

          <Route path="/shop/product/:id" element={<ProductDetail />} />

          <Route path="/spa" element={<ServiceList />} />

          <Route path="/spa/service/:id" element={<ServiceDetail />} />

          {/* ========================================================= */}
          {/* AUTH ROUTES */}
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
          {/* PROTECTED CUSTOMER ROUTES */}
          {/* ========================================================= */}

          <Route
            path="/shop/cart"
            element={
              <RoleRoute allowedRoles={customerRoles}>
                <Cart />
              </RoleRoute>
            }
          />

          <Route
            path="/shop/checkout"
            element={
              <RoleRoute allowedRoles={customerRoles}>
                <Checkout />
              </RoleRoute>
            }
          />

          <Route
            path="/spa/booking/create"
            element={
              <RoleRoute allowedRoles={customerRoles}>
                <BookingCreate />
              </RoleRoute>
            }
          />

          <Route
            path="/booking/create/:id"
            element={
              <RoleRoute allowedRoles={customerRoles}>
                <BookingCreate />
              </RoleRoute>
            }
          />

          <Route
            path="/spa/bookings"
            element={
              <RoleRoute allowedRoles={customerRoles}>
                <BookingList />
              </RoleRoute>
            }
          />

          <Route
            path="/spa/booking/:id"
            element={
              <RoleRoute allowedRoles={customerRoles}>
                <BookingDetail />
              </RoleRoute>
            }
          />

          {/* ========================================================= */}
          {/* ORDER SUCCESS - COD */}
          {/* ========================================================= */}

          <Route
            path="/order-success"
            element={
              <RoleRoute allowedRoles={customerRoles}>
                <OrderSuccess />
              </RoleRoute>
            }
          />

          {/* ========================================================= */}
          {/* VNPAY RETURN */}
          {/* ========================================================= */}

          <Route
            path="/payment/vnpay/return"
            element={
              <RoleRoute allowedRoles={customerRoles}>
                <VNPayReturnPage />
              </RoleRoute>
            }
          />

          {/* ========================================================= */}
          {/* PROFILE & PETS */}
          {/* ========================================================= */}

          <Route
            path="/profile"
            element={
              <RoleRoute allowedRoles={customerRoles}>
                <Profile />
              </RoleRoute>
            }
          />

          <Route
            path="/profile/orders/:id"
            element={
              <RoleRoute allowedRoles={customerRoles}>
                <OrderDetail />
              </RoleRoute>
            }
          />

          <Route
            path="/profile/pets/detail/:id"
            element={
              <RoleRoute allowedRoles={customerRoles}>
                <PetDetail />
              </RoleRoute>
            }
          />

          <Route
            path="/profile/pets/edit/:id"
            element={
              <RoleRoute allowedRoles={customerRoles}>
                <PetEdit />
              </RoleRoute>
            }
          />

          <Route
            path="/profile/pets/create"
            element={
              <RoleRoute allowedRoles={customerRoles}>
                <PetCreate />
              </RoleRoute>
            }
          />

          {/* ========================================================= */}
          {/* REVIEWS */}
          {/* ========================================================= */}

          <Route
            path="/review/create/product/:orderId"
            element={
              <RoleRoute allowedRoles={customerRoles}>
                <CreateOrderReview />
              </RoleRoute>
            }
          />

          <Route
            path="/review/create/booking/:bookingId"
            element={
              <RoleRoute allowedRoles={customerRoles}>
                <CreateBookingReview />
              </RoleRoute>
            }
          />

          {/* ========================================================= */}
          {/* ADMIN ROUTES */}
          {/* ========================================================= */}

          <Route
            path="/admin"
            element={
              <RoleRoute allowedRoles={adminRoles}>
                <AdminLayout />
              </RoleRoute>
            }
          >
            <Route path="dashboard" element={<Dashboard />} />

            <Route path="products/list" element={<ProductManagement />} />

            <Route path="categories" element={<CategoryManagement />} />

            <Route path="services/list" element={<ServiceManagement />} />

            <Route path="bookings" element={<BookingManagement />} />

            <Route path="orders" element={<OrderManagement />} />

            <Route path="users" element={<UserManagement />} />

            <Route path="reports" element={<RevenueReport />} />

            <Route path="roles" element={<RoleManagement />} />

            <Route
              path="inventory/list"
              element={<InventoryListManagement />}
            />

            <Route
              path="inventory/transaction"
              element={<InventoryTransManagement />}
            />

            <Route path="permission" element={<PermissionManagement />} />
          </Route>

          {/* ========================================================= */}
          {/* FALLBACK */}
          {/* ========================================================= */}

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!isAdminRoute && <Footer />}
    </div>
  );
}

export default App;
