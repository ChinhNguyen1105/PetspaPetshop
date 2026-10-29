import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  Menu,
  X,
  PawPrint,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Bell,
  User as UserIcon,
  Package,
  Heart,
  Clock,
  LogOut,
} from "lucide-react";
import { useScrollDirection } from "../../shared/hooks/useScrollDirection.js";
import { Button } from "../../shared/components/Button.jsx";
import UserDropdown from "./UserDropdown.jsx";
import NotificationDropdown from "./NotificationDropdown.jsx";
import { useCartStore } from "../../modules/cart/store/cartStore.js";
import { useAuthStore } from "../../modules/auth/store/authStore.js";

const Header = () => {
  const scrollDirection = useScrollDirection();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // State quản lý mở/đóng menu thả xuống trên Mobile
  const [isMobileNotifOpen, setIsMobileNotifOpen] = useState(false);
  const [isMobileAccountOpen, setIsMobileAccountOpen] = useState(false);

  // Store
  const cartCount = useCartStore((state) => state.totalItem);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const handleSearch = (e) => {
    if (e.key === "Enter" && searchQuery.trim() !== "") {
      navigate(`/spa?search=${encodeURIComponent(searchQuery)}`);
      setIsMobileMenuOpen(false);
    }
  };

  const handleMobileSearchClick = () => {
    if (searchQuery.trim() !== "") {
      navigate(`/spa?search=${encodeURIComponent(searchQuery)}`);
      setIsMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    navigate("/login");
  };

  // Hàm chuyển hướng tab Profile trên mobile kèm state activeTab
  const handleProfileTabClick = (tabName) => {
    setIsMobileMenuOpen(false);
    navigate("/profile", { state: { activeTab: tabName } });
  };

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-transform duration-500 bg-white border-b border-gray-100 shadow-sm ${
        scrollDirection === "down" ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="container mx-auto px-4 lg:px-8 h-20 flex items-center justify-between">
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-pet-blue p-2 rounded-xl group-hover:bg-pet-orange transition-colors shadow-sm">
            <PawPrint className="text-white" size={24} />
          </div>
          <span className="text-2xl font-black tracking-tighter text-pet-blue">
            PET<span className="text-pet-orange">SPA</span>
          </span>
        </Link>

        {/* NAVIGATION (Desktop) */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-bold text-gray-600">
          <NavLink to="/shop" label="Cửa hàng" />
          <NavLink to="/spa" label="Dịch vụ chăm sóc" />
          <NavLink to="/about" label="Về chúng tôi" />
        </nav>

        {/* ACTIONS */}
        <div className="flex items-center gap-3 lg:gap-5">
          {/* Khối Tìm kiếm (Desktop) */}
          <div className="hidden lg:flex relative items-center group/search py-2">
            <div className="flex items-center bg-gray-50 rounded-full border border-transparent group-hover/search:border-gray-200 group-hover/search:bg-white transition-all duration-300 overflow-hidden">
              <input
                type="text"
                placeholder="Tìm dịch vụ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                className="w-0 group-hover/search:w-48 lg:group-hover/search:w-64 transition-all duration-300 pl-0 group-hover/search:pl-4 py-1.5 bg-transparent outline-none text-sm text-gray-600"
              />
              <button
                type="button"
                onClick={() => navigate(`/spa?search=${searchQuery}`)}
                className="p-2 text-gray-500 hover:text-pet-blue transition-colors cursor-pointer touch-manipulation"
              >
                <Search size={22} />
              </button>
            </div>
          </div>

          {/* THÔNG BÁO (Desktop) */}
          <div className="hidden lg:block">
            <NotificationDropdown />
          </div>

          {/* GIỎ HÀNG */}
          <Link
            to="/shop/cart"
            className="p-2 text-gray-500 hover:text-pet-blue transition-colors relative"
          >
            <ShoppingCart size={22} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-pet-orange text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                {cartCount}
              </span>
            )}
          </Link>

          <div className="h-8 w-[1px] bg-gray-200 hidden lg:block mx-1"></div>

          {/* ĐẶT LỊCH NHANH (Desktop) */}
          <Link to="/spa/booking/create" className="hidden xl:block">
            <Button
              variant="secondary"
              className="!bg-pet-orange hover:shadow-lg hover:shadow-pet-orange/20 !px-4 !py-2 text-xs flex items-center gap-2 text-white font-bold transition-all"
            >
              <CalendarDays size={16} /> ĐẶT LỊCH NHANH
            </Button>
          </Link>

          {/* AUTH (Desktop) */}
          {!isAuthenticated ? (
            <div className="hidden lg:flex items-center gap-2">
              <Link to="/login">
                <Button variant="outline" className="!px-4 !py-1.5 text-sm">
                  Đăng nhập
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" className="!px-4 !py-1.5 text-sm">
                  Đăng ký
                </Button>
              </Link>
            </div>
          ) : (
            <div className="hidden lg:flex items-center gap-4">
              <UserDropdown />
            </div>
          )}

          {/* NÚT MENU MOBILE */}
          <button
            type="button"
            className="lg:hidden p-2 text-pet-blue cursor-pointer touch-manipulation outline-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Mobile Menu"
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-20 left-0 w-full bg-white border-b border-gray-100 p-5 flex flex-col gap-4 shadow-xl max-h-[calc(100vh-5rem)] overflow-y-auto">
          {/* Ô TÌM KIẾM MOBILE */}
          <div className="relative flex items-center bg-gray-50 rounded-xl border border-gray-200 overflow-hidden px-3 py-1">
            <input
              type="text"
              placeholder="Tìm kiếm dịch vụ, sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              className="w-full py-2 bg-transparent outline-none text-sm text-gray-700"
            />
            <button
              type="button"
              onClick={handleMobileSearchClick}
              className="p-2 text-gray-500 hover:text-pet-blue transition-colors cursor-pointer touch-manipulation"
            >
              <Search size={20} />
            </button>
          </div>

          <hr className="border-gray-100 my-1" />

          {/* ĐIỀU HƯỚNG CHÍNH */}
          <Link
            to="/shop"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-base font-bold text-gray-700 py-1"
          >
            Cửa hàng
          </Link>
          <Link
            to="/spa"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-base font-bold text-gray-700 py-1"
          >
            Dịch vụ chăm sóc
          </Link>
          <Link
            to="/about"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-base font-bold text-gray-700 py-1"
          >
            Về chúng tôi
          </Link>

          <hr className="border-gray-100 my-1" />

          {/* 1. THÔNG BÁO HỆ THỐNG (CÓ MŨI TÊN MỞ XUỐNG) */}
          <div className="flex flex-col">
            <button
              type="button"
              onClick={() => setIsMobileNotifOpen(!isMobileNotifOpen)}
              className="flex items-center justify-between py-2 text-base font-bold text-gray-700 w-full cursor-pointer touch-manipulation"
            >
              <div className="flex items-center gap-2">
                <Bell size={20} className="text-pet-blue" />
                <span>Thông báo hệ thống</span>
              </div>
              {isMobileNotifOpen ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </button>

            {isMobileNotifOpen && (
              <div className="pl-6 py-2 flex flex-col gap-3 bg-gray-50 rounded-xl my-1 border border-gray-100">
                <div className="text-xs text-gray-500 italic py-1">
                  Không có thông báo mới nào.
                </div>
              </div>
            )}
          </div>

          {/* 2. TÀI KHOẢN CỦA TÔI XẾP DỌC & TÍCH HỢP CÁC ĐƯỜNG DẪN TAB PROFILE */}
          {isAuthenticated ? (
            <div className="flex flex-col border-t border-gray-100 pt-3">
              <button
                type="button"
                onClick={() => setIsMobileAccountOpen(!isMobileAccountOpen)}
                className="flex items-center justify-between py-2 text-base font-bold text-gray-700 w-full cursor-pointer touch-manipulation"
              >
                <div className="flex items-center gap-2">
                  <UserIcon size={20} className="text-pet-orange" />
                  <span>
                    Tài khoản của tôi {user?.name ? `(${user.name})` : ""}
                  </span>
                </div>
                {isMobileAccountOpen ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </button>

              {/* Danh sách các chức năng / tab hồ sơ cá nhân xếp dọc */}
              {isMobileAccountOpen && (
                <div className="pl-6 py-2 flex flex-col gap-2 bg-gray-50 rounded-xl my-1 border border-gray-100">
                  <button
                    type="button"
                    onClick={() => handleProfileTabClick("info")}
                    className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-pet-blue py-1.5 text-left cursor-pointer"
                  >
                    <UserIcon size={16} className="text-pet-blue" /> Thông tin
                    cá nhân
                  </button>
                  <button
                    type="button"
                    onClick={() => handleProfileTabClick("orders")}
                    className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-pet-blue py-1.5 text-left cursor-pointer"
                  >
                    <Package size={16} className="text-pet-blue" /> Đơn hàng của
                    tôi
                  </button>
                  <button
                    type="button"
                    onClick={() => handleProfileTabClick("pets")}
                    className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-pet-blue py-1.5 text-left cursor-pointer"
                  >
                    <Heart size={16} className="text-pet-blue" /> Thú cưng của
                    tôi
                  </button>
                  <button
                    type="button"
                    onClick={() => handleProfileTabClick("bookings")}
                    className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-pet-blue py-1.5 text-left cursor-pointer"
                  >
                    <Clock size={16} className="text-pet-blue" /> Lịch hẹn dịch
                    vụ
                  </button>
                  <hr className="border-gray-200 my-1" />
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-sm font-medium text-red-500 hover:text-red-600 py-1.5 text-left cursor-pointer"
                  >
                    <LogOut size={16} /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <Button className="w-full" variant="outline">
                  Đăng nhập
                </Button>
              </Link>
              <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                <Button className="w-full" variant="primary">
                  Đăng ký
                </Button>
              </Link>
            </div>
          )}

          <hr className="border-gray-100 my-1" />

          {/* ĐẶT LỊCH NHANH CHO MOBILE */}
          <Link
            to="/spa/booking/create"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Button
              variant="secondary"
              className="w-full flex items-center justify-center gap-2 !bg-pet-orange text-white font-bold py-3"
            >
              <CalendarDays size={20} /> ĐẶT LỊCH NGAY
            </Button>
          </Link>
        </div>
      )}
    </header>
  );
};

const NavLink = ({ to, label }) => (
  <Link
    to={to}
    className="relative group py-2 hover:text-pet-blue transition-colors font-bold"
  >
    {label}
    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-pet-orange transition-all duration-300 group-hover:w-full"></span>
  </Link>
);

export default Header;
