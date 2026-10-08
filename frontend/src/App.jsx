import React, { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import ToastContainer from "./components/ui/ToastContainer";

// Pages - Shop
import HomePage from "./pages/home/HomePage";
import ProductList from "./pages/shop/ProductList";
import ProductDetail from "./pages/shop/ProductDetail";
import Cart from "./pages/shop/Cart";
import Checkout from "./pages/shop/Checkout";
import VNPayReturnPage from "./pages/shop/VNPayReturnPage";
import OrderSuccess from "./pages/order/OrderSuccess";

// Pages - Spa
import ServiceList from "./pages/spa/ServiceList";
import ServiceDetail from "./pages/spa/ServiceDetail";
import BookingList from "./pages/spa/BookingList";
import BookingDetail from "./pages/spa/BookingDetail";
import BookingCreate from "./pages/spa/BookingCreate";

// Pages - Profile & Pet
import Profile from "./pages/profile/Profile";
import PetEdit from "./pages/pet/PetEdit";
import PetDetail from "./pages/pet/PetDetail";
import PetCreate from "./pages/pet/PetCreate";

// Pages - Review
import CreateOrderReview from "./pages/review/CreateProductReview";
import CreateBookingReview from "./pages/review/CreateBookingReview";

import OrderDetail from "./pages/order/OrderDetail";
import AboutUs from "./pages/about/AboutUs";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import { useAuthStore } from "./store/authStore";
import "./styles/animations.css";

import Dashboard from "./pages/admin/dashboard/Dashboard";
import AdminLayout from "./pages/admin/AdminLayout";
import ProductManagement from "./pages/admin/products/ProductManagement";
import CategoryManagement from "./pages/admin/categories/CategoryManagement";
import ServiceManagement from "./pages/admin/services/ServiceManagement";
import BookingManagement from "./pages/admin/bookings/BookingManagement";
import OrderManagement from "./pages/admin/orders/OrderManagement";
import UserManagement from "./pages/admin/users/UserManagement";
import RevenueReport from "./pages/admin/reports/RevenueReport";
import RoleManagement from "./pages/admin/roles/roleManagement";
import InventoryListManagement from "./pages/admin/inventory/inventoryListManagement";
import InventoryTransManagement from "./pages/admin/inventory/inventoryTransManagement";
import PermissionManagement from "./pages/admin/roles/permissionManagement";

// Import Role Route Guard động
import RoleRoute from "./routes/RoleRoute";

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
          {/* USER & PUBLIC ROUTES */}
          {/* ========================================================= */}

          <Route
            path="/"
            element={
              <RoleRoute allowedRoles={customerRoles}>
                <HomePage />
              </RoleRoute>
            }
          />

          <Route
            path="/about"
            element={
              <RoleRoute allowedRoles={customerRoles}>
                <AboutUs />
              </RoleRoute>
            }
          />

          <Route
            path="/spa"
            element={
              <RoleRoute allowedRoles={customerRoles}>
                <ServiceList />
              </RoleRoute>
            }
          />

          <Route
            path="/spa/service/:id"
            element={
              <RoleRoute allowedRoles={customerRoles}>
                <ServiceDetail />
              </RoleRoute>
            }
          />

          <Route
            path="/shop"
            element={
              <RoleRoute allowedRoles={customerRoles}>
                <ProductList />
              </RoleRoute>
            }
          />

          <Route
            path="/shop/product/:id"
            element={
              <RoleRoute allowedRoles={customerRoles}>
                <ProductDetail />
              </RoleRoute>
            }
          />

          <Route
            path="/shop/cart"
            element={
              <RoleRoute allowedRoles={customerRoles}>
                <Cart />
              </RoleRoute>
            }
          />

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
          </Route>

          {/* ========================================================= */}
          {/* FALLBACK */}
          {/* ========================================================= */}

          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />
        </Routes>
      </main>

      {!isAdminRoute && <Footer />}
    </div>
  );
}

export default App;
