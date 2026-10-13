import React, { useEffect, useMemo, useState } from "react";
import { Camera, UploadCloud, X, Eye, EyeOff } from "lucide-react";
import { useRoleStore } from "../../store/roleStore";
import UserAvatar from "../../pages/admin/users/UserAvatar";

const MAX_FILE_SIZE = 2 * 1024 * 1024;

const initialFormState = {
  name: "",
  email: "",
  avatar: "",
  roleId: "",
  gender: "",
  dateOfBirth: "",
  password: "",
  rawFile: null,
};

const UserFormAdmin = ({
  initialData,
  onSubmit,
  onUploadAvatar,
  onCancel,
  isSubmitting = false,
}) => {
  const { roles, fetchRoles } = useRoleStore();

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [previewUrl, setPreviewUrl] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isEditMode = Boolean(initialData?.id);
  const isBusy = isSubmitting || submitting;

  const availableRoles = useMemo(
    () => (Array.isArray(roles) ? roles : []),
    [roles],
  );

  useEffect(() => {
    let active = true;

    const loadRoles = async () => {
      setLoadingRoles(true);

      try {
        await fetchRoles();
      } catch (error) {
        console.error("Không thể tải danh sách vai trò:", error);
      } finally {
        if (active) {
          setLoadingRoles(false);
        }
      }
    };

    loadRoles();

    return () => {
      active = false;
    };
  }, [fetchRoles]);

  useEffect(() => {
    if (!initialData) {
      const customerRole = availableRoles.find(
        (role) => role.name?.toUpperCase() === "CUSTOMER",
      );

      setFormData({
        ...initialFormState,
        roleId: customerRole ? String(customerRole.id) : "",
      });

      setErrors({});
      return;
    }

    const roleId =
      initialData.role?.id ??
      initialData.roleId ??
      availableRoles.find(
        (role) =>
          role.name?.toUpperCase() === initialData.roleName?.toUpperCase(),
      )?.id ??
      "";

    setFormData({
      name: initialData.name ?? "",
      email: initialData.email ?? "",
      avatar: initialData.avatarUrl ?? initialData.avatar ?? "",
      roleId: roleId === "" ? "" : String(roleId),
      gender: initialData.gender ?? "",
      dateOfBirth: initialData.dateOfBirth
        ? String(initialData.dateOfBirth).split("T")[0]
        : "",
      password: "",
      rawFile: null,
    });

    setPreviewUrl("");
    setErrors({});
  }, [
    initialData?.id,
    initialData?.name,
    initialData?.email,
    initialData?.avatarUrl,
    initialData?.avatar,
    initialData?.role?.id,
    initialData?.roleId,
    initialData?.roleName,
    initialData?.gender,
    initialData?.dateOfBirth,
    availableRoles,
  ]);

  useEffect(() => {
    if (!formData.rawFile) {
      setPreviewUrl("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(formData.rawFile);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [formData.rawFile]);

  const updateField = (field, value) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [field]: "",
      form: "",
    }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    // Cho phép chọn lại cùng một file sau khi bỏ chọn.
    event.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors((previous) => ({
        ...previous,
        avatar: "Vui lòng chọn tệp hình ảnh.",
      }));
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setErrors((previous) => ({
        ...previous,
        avatar: "Ảnh đại diện không được vượt quá 2 MB.",
      }));
      return;
    }

    setFormData((previous) => ({
      ...previous,
      rawFile: file,
    }));

    setErrors((previous) => ({
      ...previous,
      avatar: "",
      form: "",
    }));
  };

  const handleRemoveAvatar = () => {
    setFormData((previous) => ({
      ...previous,
      avatar: "",
      rawFile: null,
    }));

    setErrors((previous) => ({
      ...previous,
      avatar: "",
    }));
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.name.trim()) {
      nextErrors.name = "Vui lòng nhập họ và tên.";
    }

    if (!formData.email.trim()) {
      nextErrors.email = "Vui lòng nhập email.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      nextErrors.email = "Email không đúng định dạng.";
    }

    if (!isEditMode && !formData.password.trim()) {
      nextErrors.password = "Vui lòng nhập mật khẩu.";
    }

    if (!isEditMode && formData.password.length < 6) {
      nextErrors.password = "Mật khẩu phải có ít nhất 6 ký tự.";
    }

    if (formData.password && formData.password.length < 6) {
      nextErrors.password = "Mật khẩu phải có ít nhất 6 ký tự.";
    }

    if (!formData.roleId) {
      nextErrors.roleId = "Vui lòng chọn vai trò.";
    }

    if (
      formData.dateOfBirth &&
      Number.isNaN(Date.parse(formData.dateOfBirth))
    ) {
      nextErrors.dateOfBirth = "Ngày sinh không hợp lệ.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isBusy) return;
    if (!validateForm()) return;

    setSubmitting(true);
    setErrors({});

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        role: {
          id: Number(formData.roleId),
        },
        gender: formData.gender || null,
        dateOfBirth: formData.dateOfBirth || null,
        rawFile: formData.rawFile || undefined,
      };

      if (isEditMode) {
        payload.id = initialData.id;

        // Không gửi mật khẩu rỗng khi chỉnh sửa.
        if (formData.password.trim()) {
          payload.password = formData.password;
        }
      } else {
        payload.password = formData.password;
      }

      const result = await onSubmit(payload);

      if (result === false) {
        setErrors({
          form: "Không thể lưu thông tin. Vui lòng kiểm tra lại.",
        });
        return;
      }

      // Nếu component cha chưa xử lý upload, thực hiện tại đây.
      // Component cha nên trả về { success: true, avatarUploaded: true }
      // khi đã hoàn tất cả cập nhật thông tin và upload ảnh.
      const avatarAlreadyUploaded = result?.avatarUploaded === true;

      if (
        isEditMode &&
        formData.rawFile &&
        typeof onUploadAvatar === "function" &&
        !avatarAlreadyUploaded
      ) {
        const uploadResult = await onUploadAvatar(
          initialData.id,
          formData.rawFile,
        );

        if (
          uploadResult === false ||
          uploadResult?.status === "ERROR" ||
          uploadResult?.success === false
        ) {
          setErrors({
            form: "Thông tin đã được lưu nhưng tải ảnh thất bại. Vui lòng thử lại.",
          });
          return;
        }
      }

      setFormData((previous) => ({
        ...previous,
        password: "",
        rawFile: null,
      }));
    } catch (error) {
      console.error("Lỗi khi lưu người dùng:", error);

      setErrors({
        form:
          error?.response?.data?.message ||
          error?.message ||
          "Có lỗi xảy ra khi lưu thông tin người dùng.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const inputClassName =
    "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100";

  const renderError = (field) =>
    errors[field] ? (
      <p className="mt-1 text-sm text-red-600">{errors[field]}</p>
    ) : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {errors.form && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {errors.form}
        </div>
      )}

      <div className="flex flex-col items-center gap-3">
        <div className="relative h-28 w-28 overflow-hidden rounded-full border border-gray-200 bg-gray-100">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Ảnh đại diện xem trước"
              className="h-full w-full object-cover"
            />
          ) : formData.avatar ? (
            <UserAvatar
              user={{
                id: initialData?.id,
                avatarUrl: formData.avatar,
              }}
              className="h-full w-full"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-400">
              <Camera size={36} />
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <label
            className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-50 ${
              isBusy ? "pointer-events-none opacity-50" : ""
            }`}
          >
            <UploadCloud size={16} />
            Chọn ảnh
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={isBusy}
            />
          </label>

          {(previewUrl || formData.avatar) && (
            <button
              type="button"
              onClick={handleRemoveAvatar}
              disabled={isBusy}
              className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              <X size={16} />
              Bỏ ảnh
            </button>
          )}
        </div>

        <p className="text-xs text-gray-500">
          Chỉ hỗ trợ tệp hình ảnh, dung lượng tối đa 2 MB.
        </p>

        {formData.rawFile && (
          <p className="max-w-full break-all text-xs text-gray-600">
            Ảnh đã chọn: {formData.rawFile.name}
          </p>
        )}

        {renderError("avatar")}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Họ và tên <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(event) => updateField("name", event.target.value)}
          className={inputClassName}
          placeholder="Nhập họ và tên"
          disabled={isBusy}
        />
        {renderError("name")}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(event) => updateField("email", event.target.value)}
          className={inputClassName}
          placeholder="example@email.com"
          disabled={isBusy || isEditMode}
        />
        {renderError("email")}
        {isEditMode && (
          <p className="mt-1 text-xs text-gray-500">
            Email không thể chỉnh sửa tại đây.
          </p>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Mật khẩu {isEditMode ? "(để trống nếu không đổi)" : "*"}
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={(event) => updateField("password", event.target.value)}
            className={`${inputClassName} pr-11`}
            placeholder={
              isEditMode ? "Nhập mật khẩu mới nếu cần" : "Nhập mật khẩu"
            }
            autoComplete="new-password"
            disabled={isBusy}
          />
          <button
            type="button"
            onClick={() => setShowPassword((previous) => !previous)}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
            aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            disabled={isBusy}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {renderError("password")}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Vai trò <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.roleId}
            onChange={(event) => updateField("roleId", event.target.value)}
            className={inputClassName}
            disabled={isBusy || loadingRoles}
          >
            <option value="">
              {loadingRoles ? "Đang tải vai trò..." : "Chọn vai trò"}
            </option>
            {availableRoles.map((role) => (
              <option key={role.id} value={String(role.id)}>
                {role.name}
              </option>
            ))}
          </select>
          {renderError("roleId")}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Giới tính
          </label>
          <select
            value={formData.gender}
            onChange={(event) => updateField("gender", event.target.value)}
            className={inputClassName}
            disabled={isBusy}
          >
            <option value="">Chọn giới tính</option>
            <option value="MALE">Nam</option>
            <option value="FEMALE">Nữ</option>
            <option value="OTHER">Khác</option>
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Ngày sinh
        </label>
        <input
          type="date"
          value={formData.dateOfBirth}
          onChange={(event) => updateField("dateOfBirth", event.target.value)}
          className={inputClassName}
          disabled={isBusy}
        />
        {renderError("dateOfBirth")}
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isBusy}
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Hủy
          </button>
        )}

        <button
          type="submit"
          disabled={isBusy || loadingRoles}
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isBusy
            ? "Đang lưu..."
            : isEditMode
              ? "Cập nhật người dùng"
              : "Tạo người dùng"}
        </button>
      </div>
    </form>
  );
};

export default UserFormAdmin;
