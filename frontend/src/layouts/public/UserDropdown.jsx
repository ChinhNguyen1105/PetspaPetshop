import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, LogOut, Settings } from "lucide-react";
import { useAuthStore } from "../../modules/auth/store/authStore.js";
import { useUserStore } from "../../modules/users/store/userStore.js";
import api from "../../infrastructure/api/api.js";

const DEFAULT_AVATAR = "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix";

const UserDropdown = () => {
  const navigate = useNavigate();

  const logout = useAuthStore((state) => state.logout);
  const authUser = useAuthStore((state) => state.user);

  const currentUser = useUserStore((state) => state.currentUser);
  const fetchProfile = useUserStore((state) => state.fetchProfile);

  const [avatarSrc, setAvatarSrc] = useState(DEFAULT_AVATAR);

  useEffect(() => {
    if (authUser) {
      fetchProfile();
    }
  }, [authUser, fetchProfile]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const avatarFileName =
    currentUser?.avatarUrl || authUser?.avatarUrl || authUser?.avatar || "";

  useEffect(() => {
    let objectUrl;

    if (!avatarFileName) {
      setAvatarSrc(DEFAULT_AVATAR);
      return undefined;
    }

    // Nếu backend trả URL đầy đủ thì dùng trực tiếp.
    if (/^https?:\/\//i.test(avatarFileName)) {
      setAvatarSrc(avatarFileName);
      return undefined;
    }

    let cancelled = false;

    const loadAvatar = async () => {
      try {
        const response = await api.get("/files/download", {
          params: {
            fileName: avatarFileName,
            folder: "avatars",
            inline: true,
          },
          responseType: "blob",
        });

        if (cancelled) return;

        objectUrl = URL.createObjectURL(response.data);
        setAvatarSrc(objectUrl);
      } catch (error) {
        if (!cancelled) {
          console.error("Không thể tải avatar:", error);
          setAvatarSrc(DEFAULT_AVATAR);
        }
      }
    };

    loadAvatar();

    return () => {
      cancelled = true;

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [avatarFileName]);

  const displayFullName =
    currentUser?.name || authUser?.name || authUser?.full_name || "User";

  const displayEmail =
    currentUser?.email || authUser?.email || "user@petspa.com";

  return (
    <div className="relative group py-2">
      <button
        type="button"
        aria-label="Mở menu tài khoản"
        className="flex items-center gap-2 outline-none cursor-pointer"
      >
        <div className="w-10 h-10 rounded-full border-2 border-pet-pink overflow-hidden group-hover:border-pet-blue transition-all">
          <img
            src={avatarSrc}
            alt="User Avatar"
            className="w-full h-full object-cover"
            onError={() => setAvatarSrc(DEFAULT_AVATAR)}
          />
        </div>
      </button>

      <div
        className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2
        opacity-0 invisible translate-y-2
        group-hover:opacity-100 group-hover:visible group-hover:translate-y-0
        transition-all duration-300 z-[60]"
      >
        <div className="px-4 py-3 border-b border-gray-50">
          <p className="text-sm font-bold text-gray-800">
            Xin chào, {displayFullName} 👋
          </p>
          <p className="text-xs text-gray-500 truncate">{displayEmail}</p>
        </div>

        <div className="p-2">
          <DropdownItem
            to="/profile"
            icon={<User size={18} />}
            label="Hồ sơ của tôi"
          />

          <DropdownItem
            to="/settings"
            icon={<Settings size={18} />}
            label="Cài đặt"
          />
        </div>

        <div className="border-t border-gray-50 p-2">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut size={18} />
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
};

const DropdownItem = ({ to, icon, label }) => (
  <Link
    to={to}
    className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-pet-blue rounded-xl transition-colors"
  >
    {icon}
    {label}
  </Link>
);

export default UserDropdown;
