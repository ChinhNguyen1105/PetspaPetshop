import React, { useState, useEffect } from "react";
import {
  Image as ImageIcon,
  Trash2,
  Check,
  Plus,
  AlertCircle,
  Loader2,
  Link,
} from "lucide-react";

import { useServiceStore } from "../../store/serviceStore.js";
import { useCategoryStore } from "../../../categories/store/categoryStore.js";
import { usePetServiceImageStore } from "../../../pets/store/petServiceImageStore.js";
import { useCartStore } from "../../../cart/store/cartStore.js";
import {
  validateServiceForm,
  validateServiceImageUrl,
} from "../../validators/serviceValidator.js";

const ServiceFormAdmin = ({ initialData, onSubmit, onClose }) => {
  const isEdit = Boolean(initialData);

  const { submitting } = useServiceStore();
  const { categories, fetchCategories } = useCategoryStore();

  const {
    images: serviceImages,
    loading: loadingImages,
    fetchImages,
    addImage,
    deleteImage,
    setMainImage,
    clearImages,
  } = usePetServiceImageStore();

  const { showToast } = useCartStore();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    basePrice: "",
    durationMin: "30",
    categoryId: "",
  });

  const [errors, setErrors] = useState({});
  const [newImageUrl, setNewImageUrl] = useState("");

  useEffect(() => {
    if (fetchCategories) {
      fetchCategories({ type: "SERVICE" });
    }
  }, [fetchCategories]);

  useEffect(() => {
    if (initialData) {
      const serviceId = initialData.id;
      const rawCategoryId =
        initialData.categoryId || initialData.category?.id || "";

      setFormData({
        name: initialData.name || "",
        description: initialData.description || "",
        basePrice: initialData.basePrice ?? initialData.original_price ?? "",
        durationMin:
          initialData.durationMin ?? initialData.duration_minutes ?? "30",
        categoryId: rawCategoryId ? String(rawCategoryId) : "",
      });

      if (serviceId) {
        fetchImages(serviceId);
      }
    } else {
      setFormData({
        name: "",
        description: "",
        basePrice: "",
        durationMin: "30",
        categoryId: "",
      });

      clearImages();
    }

    setErrors({});
    setNewImageUrl("");
  }, [initialData, fetchImages, clearImages]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: "",
      form: "",
    }));
  };

  const handleValidationAndSubmit = async () => {
    setErrors({});

    const validation = validateServiceForm(formData);

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    const submitPayload = {
      ...validation.data,
    };

    if (isEdit && initialData?.id) {
      submitPayload.id = Number(initialData.id);
    }

    try {
      await onSubmit(submitPayload);
    } catch (error) {
      console.error("Không thể lưu thông tin dịch vụ:", error);

      setErrors({
        form:
          error?.response?.data?.message ||
          error?.message ||
          "Không thể lưu thông tin dịch vụ. Vui lòng thử lại.",
      });
    }
  };

  const renderFieldError = (field) => {
    if (!errors[field]) {
      return null;
    }

    return (
      <p className="mt-1 text-xs text-red-600" role="alert">
        {errors[field]}
      </p>
    );
  };

  const handleAddImageUrl = async (event) => {
    event.preventDefault();

    const imageValidation = validateServiceImageUrl(newImageUrl);

    if (!imageValidation.isValid) {
      showToast(imageValidation.message, "error");
      return;
    }

    if (serviceImages.length >= 6) {
      showToast(
        "Hệ thống chỉ hỗ trợ tối đa 6 hình ảnh minh họa cho một dịch vụ.",
        "error",
      );
      return;
    }

    if (!isEdit || !initialData?.id) {
      showToast(
        "Vui lòng tạo dịch vụ trước khi thêm ảnh vào album chi tiết.",
        "error",
      );
      return;
    }

    try {
      const isFirstImg = serviceImages.length === 0;

      await addImage(initialData.id, imageValidation.data, isFirstImg);

      setNewImageUrl("");
      showToast("Thêm hình ảnh vào album thành công!", "success");
    } catch (error) {
      console.error("Không thể thêm ảnh dịch vụ:", error);

      showToast(
        "Không thể lưu liên kết hình ảnh này. Vui lòng kiểm tra lại.",
        "error",
      );
    }
  };

  const handleRemoveImage = async (imageId) => {
    const confirmed = window.confirm(
      "Bạn có chắc chắn muốn xóa hình ảnh này khỏi album không?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteImage(imageId);
      showToast("Đã xóa hình ảnh thành công!", "success");
    } catch (error) {
      console.error("Không thể xóa ảnh dịch vụ:", error);
      showToast("Xóa ảnh dịch vụ thất bại!", "error");
    }
  };

  const handleSetMainImage = async (imageId) => {
    try {
      await setMainImage(imageId);
      showToast("Thay đổi ảnh hiển thị đại diện thành công!", "success");
    } catch (error) {
      console.error("Không thể đặt ảnh đại diện:", error);
      showToast("Thiết lập ảnh đại diện thất bại!", "error");
    }
  };

  const currentThumbnailObj = serviceImages?.find(
    (image) => image.isThumbnail || image.isMain,
  );

  const formThumbnailUrl =
    currentThumbnailObj?.imageUrl ||
    currentThumbnailObj?.url ||
    initialData?.serviceImages?.find((image) => image.isThumbnail)?.imageUrl ||
    "https://placehold.co/150x150?text=No+Image";

  return (
    <div className="relative space-y-6">
      {submitting && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center rounded-xl bg-white/70 backdrop-blur-[2px]">
          <Loader2 className="mb-2 h-8 w-8 animate-spin text-blue-600" />
          <span className="text-sm font-medium text-gray-600">
            Hệ thống đang lưu dữ liệu dịch vụ...
          </span>
        </div>
      )}

      {errors.form && (
        <div
          className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-600"
          role="alert"
        >
          <AlertCircle size={16} className="shrink-0" />
          <span>{errors.form}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row">
            {isEdit && (
              <div className="hidden shrink-0 md:block">
                <label className="mb-1 block text-center text-sm font-medium text-gray-700">
                  Thumbnail
                </label>

                <div className="h-[102px] w-[102px] overflow-hidden rounded-lg border border-gray-300 bg-gray-50">
                  <img
                    src={formThumbnailUrl}
                    alt="Thumbnail Preview"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            )}

            <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Tên dịch vụ spa *
                </label>

                <input
                  type="text"
                  value={formData.name}
                  onChange={(event) =>
                    handleInputChange("name", event.target.value)
                  }
                  placeholder="Ví dụ: Combo Tắm Sấy & Vệ Sinh Tai"
                  aria-invalid={Boolean(errors.name)}
                  className={`w-full rounded-lg border p-2.5 text-sm outline-none transition-all focus:ring-1 focus:ring-blue-500 ${
                    errors.name
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-300 focus:border-blue-500"
                  }`}
                />

                {renderFieldError("name")}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Danh mục dịch vụ *
                </label>

                <select
                  value={formData.categoryId}
                  onChange={(event) =>
                    handleInputChange("categoryId", event.target.value)
                  }
                  aria-invalid={Boolean(errors.categoryId)}
                  className={`w-full rounded-lg border bg-white p-2.5 text-sm outline-none focus:ring-1 focus:ring-blue-500 ${
                    errors.categoryId
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-300 focus:border-blue-500"
                  }`}
                >
                  <option value="">-- Chọn danh mục dịch vụ --</option>

                  {categories &&
                    categories
                      .filter(
                        (category) =>
                          category.categoryType === "SERVICE" ||
                          category.type === "SERVICE" ||
                          !category.categoryType ||
                          String(category.id) === formData.categoryId,
                      )
                      .map((category) => (
                        <option key={category.id} value={String(category.id)}>
                          {category.name}
                        </option>
                      ))}
                </select>

                {renderFieldError("categoryId")}
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Mô tả dịch vụ chi tiết *
            </label>

            <textarea
              rows={3}
              value={formData.description}
              onChange={(event) =>
                handleInputChange("description", event.target.value)
              }
              placeholder="Mô tả chi tiết các bước trong quy trình phục vụ thú cưng..."
              aria-invalid={Boolean(errors.description)}
              className={`w-full rounded-lg border p-2.5 text-sm outline-none focus:ring-1 focus:ring-blue-500 ${
                errors.description
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-300 focus:border-blue-500"
              }`}
            />

            {renderFieldError("description")}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Giá gốc niêm yết (đ) *
              </label>

              <input
                type="number"
                min="0"
                step="1000"
                value={formData.basePrice}
                onChange={(event) =>
                  handleInputChange("basePrice", event.target.value)
                }
                placeholder="Nhập giá cơ bản..."
                aria-invalid={Boolean(errors.basePrice)}
                className={`w-full rounded-lg border p-2.5 text-sm font-semibold text-gray-800 outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors.basePrice
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-300 focus:border-blue-500"
                }`}
              />

              {renderFieldError("basePrice")}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Thời lượng hoàn thành (Phút) *
              </label>

              <input
                type="number"
                min="1"
                step="1"
                value={formData.durationMin}
                onChange={(event) =>
                  handleInputChange("durationMin", event.target.value)
                }
                placeholder="Ví dụ: 30, 45, 60..."
                aria-invalid={Boolean(errors.durationMin)}
                className={`w-full rounded-lg border p-2.5 text-sm font-medium outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors.durationMin
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-300 focus:border-blue-500"
                }`}
              />

              {renderFieldError("durationMin")}
            </div>
          </div>
        </div>

        {isEdit && (
          <div className="relative space-y-4 border-t border-gray-100 pt-4">
            {loadingImages && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
                <span className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                  <Loader2 size={14} className="animate-spin text-blue-500" />
                  Đang đồng bộ ảnh dịch vụ...
                </span>
              </div>
            )}

            <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-800">
              <ImageIcon size={16} className="text-blue-500" />
              <span>Quản lý Album ảnh gói dịch vụ</span>
            </div>

            <form onSubmit={handleAddImageUrl} className="flex gap-2">
              <div className="relative flex-grow">
                <Link
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(event) => setNewImageUrl(event.target.value)}
                  placeholder="Dán đường dẫn ảnh mạng URL vào đây..."
                  className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-9 pr-3 text-xs outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={!newImageUrl.trim() || serviceImages.length >= 6}
                className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-4 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-slate-900 disabled:opacity-40"
              >
                <Plus size={14} />
                Thêm ảnh
              </button>
            </form>

            <div>
              <p className="mb-2 text-xs text-gray-500">
                Ảnh hiện có ({serviceImages.length}/6){" "}
                <span className="ml-1 font-normal text-gray-400">
                  • Click chọn ảnh để đặt làm ảnh đại diện chính (Thumbnail)
                </span>
              </p>

              <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                {serviceImages.map((image) => {
                  const isMain = image.isThumbnail || image.isMain;
                  const currentImgUrl = image.imageUrl || image.url;

                  return (
                    <div
                      key={image.id}
                      className={`group relative aspect-square cursor-pointer overflow-hidden rounded-xl border transition-all ${
                        isMain
                          ? "border-blue-500 shadow-sm ring-2 ring-blue-400/30"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <img
                        src={currentImgUrl}
                        alt={`gallery-${image.id}`}
                        className="h-full w-full bg-gray-50 object-cover"
                        onClick={() => handleSetMainImage(image.id)}
                        title="Click để thiết lập làm ảnh đại diện chính"
                        onError={(event) => {
                          event.currentTarget.src =
                            "https://placehold.co/300x300?text=L%E1%BB%97i+Link+%E1%BA%A2nh";
                        }}
                      />

                      {isMain && (
                        <span className="absolute bottom-1 left-1 flex items-center gap-0.5 rounded bg-blue-600 px-1.5 py-0.5 text-[9px] font-bold text-white shadow">
                          <Check size={8} strokeWidth={4} />
                          Chính
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleRemoveImage(image.id);
                        }}
                        className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white opacity-0 shadow transition-opacity hover:bg-red-600 group-hover:opacity-100"
                        title="Gỡ ảnh này"
                        aria-label={`Xóa ảnh ${image.id}`}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
        >
          Hủy bỏ
        </button>

        <button
          type="button"
          onClick={handleValidationAndSubmit}
          disabled={submitting}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting && <Loader2 size={16} className="animate-spin" />}
          {isEdit ? "Cập nhật dịch vụ" : "Tạo dịch vụ mới"}
        </button>
      </div>
    </div>
  );
};

export default ServiceFormAdmin;
