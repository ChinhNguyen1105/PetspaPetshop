import React, { useState, useEffect, useRef, useCallback } from "react";

import { Input } from "../../../shared/components/Input.jsx";
import { Button } from "../../../shared/components/Button.jsx";

import { User, Mail, ShieldCheck, Calendar, Camera } from "lucide-react";

import { useCartStore } from "../../cart/store/cartStore.js";
import { useUserStore } from "../store/userStore.js";

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150";

const ProfileInfo = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    dateOfBirth: "",
    gender: "MALE",
  });

  const [avatarPreview, setAvatarPreview] = useState(DEFAULT_AVATAR);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef(null);
  const avatarObjectUrlRef = useRef(null);
  const mountedRef = useRef(false);
  const uploadRequestRef = useRef(false);

  const {
    currentUser,
    loading,
    detailLoading,
    fetchProfile,
    updateProfile,
    uploadAvatar,
    downloadAvatar,
  } = useUserStore();

  const { showToastNotification } = useCartStore();

  const busy = loading || uploading;

  const notify = useCallback(
    (message) => {
      if (showToastNotification) {
        showToastNotification(message);
      } else {
        window.alert(message);
      }
    },
    [showToastNotification],
  );

  // Giải phóng URL ảnh tạm thời.
  const revokeAvatarObjectUrl = useCallback(() => {
    if (avatarObjectUrlRef.current) {
      URL.revokeObjectURL(avatarObjectUrlRef.current);
      avatarObjectUrlRef.current = null;
    }
  }, []);

  // Cập nhật preview và giải phóng URL cũ.
  const setAvatarObjectUrl = useCallback(
    (url) => {
      revokeAvatarObjectUrl();
      avatarObjectUrlRef.current = url;
      setAvatarPreview(url);
    },
    [revokeAvatarObjectUrl],
  );

  // Tải avatar thông qua action của store.
  const loadAvatar = useCallback(
    async (fileName) => {
      if (!fileName) {
        revokeAvatarObjectUrl();

        if (mountedRef.current) {
          setAvatarPreview(DEFAULT_AVATAR);
        }

        return;
      }

      setAvatarLoading(true);

      try {
        const blob = await downloadAvatar(fileName);

        if (!mountedRef.current) {
          return;
        }

        if (!(blob instanceof Blob) || blob.size === 0) {
          throw new Error("Dữ liệu ảnh nhận được không hợp lệ.");
        }

        const objectUrl = URL.createObjectURL(blob);
        setAvatarObjectUrl(objectUrl);
      } catch (error) {
        console.error("Không thể tải ảnh đại diện:", error);

        if (mountedRef.current) {
          revokeAvatarObjectUrl();
          setAvatarPreview(DEFAULT_AVATAR);
        }
      } finally {
        if (mountedRef.current) {
          setAvatarLoading(false);
        }
      }
    },
    [downloadAvatar, revokeAvatarObjectUrl, setAvatarObjectUrl],
  );

  // Đổ dữ liệu từ currentUser trong store vào form.
  const syncFormFromUser = useCallback((user) => {
    if (!user) {
      return;
    }

    setFormData({
      fullName: user.name ?? "",
      email: user.email ?? "",
      dateOfBirth: user.dateOfBirth
        ? String(user.dateOfBirth).split("T")[0]
        : "",
      gender: user.gender ?? "MALE",
    });
  }, []);

  // Tải hồ sơ thông qua store.
  const loadUserProfile = useCallback(async () => {
    try {
      const response = await fetchProfile();

      if (!mountedRef.current) {
        return;
      }

      if (response?.status !== "SUCCESS") {
        notify(`${response?.message || "Không thể tải thông tin hồ sơ."} ❌`);
        return;
      }

      const user = response.data;

      if (user) {
        syncFormFromUser(user);
        await loadAvatar(user.avatarUrl || "");
      }
    } catch (error) {
      console.error("Lỗi tải hồ sơ người dùng:", error);

      if (mountedRef.current) {
        notify("Không thể tải thông tin hồ sơ. ❌");
      }
    }
  }, [fetchProfile, loadAvatar, notify, syncFormFromUser]);

  useEffect(() => {
    mountedRef.current = true;

    loadUserProfile();

    return () => {
      mountedRef.current = false;
      revokeAvatarObjectUrl();
    };
  }, [loadUserProfile, revokeAvatarObjectUrl]);

  // Đồng bộ khi currentUser thay đổi từ store.
  useEffect(() => {
    if (currentUser) {
      syncFormFromUser(currentUser);
    }
  }, [currentUser, syncFormFromUser]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleAvatarClick = () => {
    if (!busy && !avatarLoading && !uploadRequestRef.current) {
      fileInputRef.current?.click();
    }
  };

  // Upload avatar chỉ thông qua store.
  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];

    // Cho phép chọn lại cùng một file.
    event.target.value = "";

    if (!file || uploadRequestRef.current) {
      return;
    }

    const userId = currentUser?.id;

    if (!userId) {
      notify("Không tìm thấy ID người dùng. Vui lòng đăng nhập lại. ❌");
      return;
    }

    if (!file.type.startsWith("image/")) {
      notify("Vui lòng chọn một file ảnh hợp lệ. ❌");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      notify("Ảnh đại diện không được vượt quá 2 MB. ❌");
      return;
    }

    uploadRequestRef.current = true;
    setUploading(true);

    const previousAvatarUrl = avatarPreview;
    const temporaryUrl = URL.createObjectURL(file);

    setAvatarObjectUrl(temporaryUrl);

    try {
      const response = await uploadAvatar(userId, file);

      if (response?.status !== "SUCCESS") {
        throw new Error(response?.message || "Không thể tải ảnh đại diện lên.");
      }

      notify("Cập nhật ảnh đại diện thành công! 📸");

      // Tải lại hồ sơ để lấy tên file mới từ backend.
      await loadUserProfile();
    } catch (error) {
      console.error("Lỗi upload avatar:", error);

      if (mountedRef.current) {
        // Chỉ khôi phục URL cũ nếu URL đó vẫn hợp lệ.
        if (previousAvatarUrl && previousAvatarUrl !== DEFAULT_AVATAR) {
          setAvatarPreview(previousAvatarUrl);
        } else {
          revokeAvatarObjectUrl();
          setAvatarPreview(DEFAULT_AVATAR);
        }
      }

      notify(`${error?.message || "Lỗi khi tải ảnh lên."} ❌`);
    } finally {
      uploadRequestRef.current = false;

      if (mountedRef.current) {
        setUploading(false);
      }
    }
  };

  // Cập nhật hồ sơ qua store.
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (busy) {
      return;
    }

    const payload = {
      name: formData.fullName.trim(),
      dateOfBirth: formData.dateOfBirth || null,
      gender: formData.gender,
    };

    if (!payload.name) {
      notify("Vui lòng nhập họ và tên. ❌");
      return;
    }

    try {
      const response = await updateProfile(payload);

      if (response?.status !== "SUCCESS") {
        notify(`${response?.message || "Không thể cập nhật hồ sơ."} ❌`);
        return;
      }

      // Store là nguồn dữ liệu chính; không tự sửa localStorage.
      syncFormFromUser(
        response.data || {
          ...currentUser,
          ...payload,
        },
      );

      notify("Cập nhật thông tin cá nhân thành công! 🎉");
    } catch (error) {
      console.error("Lỗi cập nhật hồ sơ:", error);

      notify(`${error?.message || "Có lỗi xảy ra, vui lòng thử lại."} ❌`);
    }
  };

  if (detailLoading && !currentUser) {
    return (
      <div className="space-y-6 animate-pulse text-left bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex flex-col items-center space-y-3 mb-4">
          <div className="w-24 h-24 bg-gray-200 rounded-full" />
          <div className="h-4 bg-gray-200 rounded w-1/4" />
        </div>

        <div className="h-7 bg-gray-200 rounded-xl w-1/4 mb-4" />
        <div className="h-12 bg-gray-200 rounded-2xl w-full" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-12 bg-gray-200 rounded-2xl w-full" />
          <div className="h-12 bg-gray-200 rounded-2xl w-full" />
        </div>

        <div className="h-12 bg-gray-200 rounded-2xl w-full" />
        <div className="h-12 bg-gray-200 rounded-2xl w-24 ml-auto" />
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-left">
      {/* Avatar */}
      <div className="flex flex-col items-center border-b border-gray-100 pb-6 mb-6">
        <div
          className="relative group cursor-pointer"
          onClick={handleAvatarClick}
        >
          <img
            src={avatarPreview}
            alt="User Avatar"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = DEFAULT_AVATAR;
            }}
            className={`w-24 h-24 rounded-full object-cover border-4 border-gray-50 shadow-md transition-all duration-300 ${
              busy || avatarLoading ? "opacity-50" : "group-hover:brightness-75"
            }`}
          />

          <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Camera className="text-white" size={20} />
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
            disabled={busy || avatarLoading}
          />
        </div>

        <p className="text-xs font-bold text-gray-400 mt-2.5 uppercase tracking-wider">
          {busy
            ? "Đang xử lý file..."
            : avatarLoading
              ? "Đang tải ảnh..."
              : "Nhấp vào ảnh để thay đổi avatar"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-gray-50 mb-2">
          <ShieldCheck className="text-pet-blue" size={24} />

          <h2 className="text-xl font-black text-pet-blue uppercase tracking-tight">
            Thông tin cá nhân
          </h2>
        </div>

        <Input
          label="Họ và tên người dùng *"
          icon={User}
          name="fullName"
          value={formData.fullName}
          onChange={handleInputChange}
          required
          disabled={busy}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Địa chỉ Email (Không thể thay đổi)"
            icon={Mail}
            value={formData.email}
            disabled
            className="bg-gray-50 text-gray-400 cursor-not-allowed font-medium"
          />

          <Input
            label="Ngày sinh"
            icon={Calendar}
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleInputChange}
            disabled={busy}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">
            Giới tính
          </label>

          <div className="grid grid-cols-3 gap-3">
            {["MALE", "FEMALE", "OTHER"].map((genderOption) => (
              <label
                key={genderOption}
                className={`flex items-center justify-center gap-2 px-4 py-3 border rounded-2xl text-sm font-bold cursor-pointer transition-all select-none ${
                  formData.gender === genderOption
                    ? "border-pet-blue bg-blue-50/50 text-pet-blue ring-2 ring-pet-blue/10"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  name="gender"
                  value={genderOption}
                  checked={formData.gender === genderOption}
                  onChange={handleInputChange}
                  className="hidden"
                  disabled={busy}
                />

                {genderOption === "MALE"
                  ? "Nam"
                  : genderOption === "FEMALE"
                    ? "Nữ"
                    : "Khác"}
              </label>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t border-gray-50 flex justify-end">
          <Button
            type="submit"
            disabled={busy}
            className="w-full md:w-auto !px-8 !py-3 rounded-xl font-black shadow-md shadow-pet-blue/10 uppercase text-sm tracking-wider"
          >
            {busy ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProfileInfo;
