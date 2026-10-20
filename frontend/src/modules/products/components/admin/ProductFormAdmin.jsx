import React, { useState, useEffect, useRef } from "react";
import { useProductStore } from "../../store/productStore.js";
import { useCategoryStore } from "../../../categories/store/categoryStore.js";
import { useProductImageStore } from "../../store/productImageStore.js";
import ProductImage from "../../pages/admin/ProductImage.jsx";

const MAX_IMAGES = 6;

const ProductFormAdmin = ({ initialData, onSubmit, onClose }) => {
  const isEdit = Boolean(initialData?.id);
  const productId = initialData?.id;

  // Product store
  const loadingProduct = useProductStore((state) => state.loading);

  // Category store
  const categories = useCategoryStore((state) => state.categories) || [];
  const fetchCategories = useCategoryStore((state) => state.fetchCategories);

  // Product image store
  const imagesByProductId = useProductImageStore(
    (state) => state.imagesByProductId,
  );
  const loadingImages = useProductImageStore((state) => state.loading);
  const fetchImages = useProductImageStore((state) => state.fetchImages);
  const uploadImages = useProductImageStore((state) => state.uploadImages);
  const deleteImage = useProductImageStore((state) => state.deleteImage);
  const setMainImage = useProductImageStore((state) => state.setMainImage);
  const clearImages = useProductImageStore((state) => state.clearImages);

  const productImages = productId
    ? imagesByProductId?.[String(productId)] || []
    : [];

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    quantity: "",
  });

  const [uploadingImages, setUploadingImages] = useState(false);
  const fileInputRef = useRef(null);

  // Fetch categories
  useEffect(() => {
    fetchCategories?.({ type: "PRODUCT" });
  }, [fetchCategories]);

  // Populate form when opening or switching product
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        description: initialData.description || "",
        price: initialData.price ?? "",
        categoryId: initialData.categoryId ?? initialData.category?.id ?? "",
        quantity:
          initialData.quantity ??
          initialData.stockQuantity ??
          initialData.stock_quantity ??
          "",
      });

      if (initialData.id != null) {
        fetchImages(String(initialData.id)).catch((error) => {
          console.error("Không tải được danh sách ảnh:", error);
        });
      }
    } else {
      setFormData({
        name: "",
        description: "",
        price: "",
        categoryId: "",
        quantity: "",
      });

      clearImages?.();
    }
  }, [initialData, fetchImages, clearImages]);

  // Upload selected images
  const handleFileChange = async (event) => {
    const files = Array.from(event.target.files || []);

    if (!files.length) return;

    if (!productId) {
      alert("Vui lòng tạo sản phẩm trước khi tải ảnh lên.");
      event.target.value = "";
      return;
    }

    if (productImages.length + files.length > MAX_IMAGES) {
      alert(
        `Tối đa ${MAX_IMAGES} ảnh. Hiện tại sản phẩm có ${productImages.length} ảnh.`,
      );
      event.target.value = "";
      return;
    }

    const invalidFile = files.find((file) => !file.type.startsWith("image/"));

    if (invalidFile) {
      alert(`Tệp "${invalidFile.name}" không phải là hình ảnh.`);
      event.target.value = "";
      return;
    }

    try {
      setUploadingImages(true);

      await uploadImages(String(productId), files);
      await fetchImages(String(productId));

      alert("Tải ảnh lên thành công.");
    } catch (error) {
      console.error("Upload images error:", error);
      alert(
        error?.response?.data?.message ||
          error?.message ||
          "Tải ảnh thất bại. Vui lòng kiểm tra API upload.",
      );
    } finally {
      setUploadingImages(false);
      event.target.value = "";
    }
  };

  // Delete image
  const handleRemoveGalleryImage = async (imageId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa hình ảnh này không?")) {
      return;
    }

    try {
      await deleteImage(imageId);
      await fetchImages(String(productId));
      alert("Xóa ảnh thành công.");
    } catch (error) {
      console.error("Delete image error:", error);
      alert(
        error?.response?.data?.message || error?.message || "Xóa ảnh thất bại.",
      );
    }
  };

  // Set main image
  const handleSetMainImage = async (imageId) => {
    if (!productId) return;

    try {
      await setMainImage(String(productId), imageId);
      await fetchImages(String(productId));
    } catch (error) {
      console.error("Set main image error:", error);
      alert(
        error?.response?.data?.message ||
          error?.message ||
          "Không thể đặt ảnh đại diện.",
      );
    }
  };

  // Validate and submit
  const handleSubmitForm = () => {
    if (!formData.name.trim()) {
      alert("Tên sản phẩm không được để trống.");
      return;
    }

    if (!formData.description.trim()) {
      alert("Mô tả sản phẩm không được để trống.");
      return;
    }

    if (
      formData.price === "" ||
      !Number.isFinite(Number(formData.price)) ||
      Number(formData.price) < 0
    ) {
      alert("Giá sản phẩm không hợp lệ.");
      return;
    }

    if (
      formData.categoryId === "" ||
      !Number.isFinite(Number(formData.categoryId))
    ) {
      alert("Vui lòng chọn danh mục hợp lệ.");
      return;
    }

    // Only validate quantity when creating a new product.
    // Editing product details must not change stock quantity.
    if (!isEdit) {
      if (
        formData.quantity === "" ||
        !Number.isFinite(Number(formData.quantity)) ||
        Number(formData.quantity) < 0
      ) {
        alert("Số lượng nhập kho không hợp lệ.");
        return;
      }
    }

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: Number(formData.price),
      categoryId: Number(formData.categoryId),
    };

    if (isEdit) {
      // Update product information only.
      // Intentionally do not include quantity.
      payload.id = Number(productId);
    } else {
      // Initial stock quantity is only supplied during creation.
      payload.quantity = Number(formData.quantity);
    }

    onSubmit(payload);
  };

  return (
    <div className="relative space-y-6">
      {loadingProduct && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/70 backdrop-blur-[2px]">
          <div className="mb-2 h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <span className="text-sm font-medium text-gray-600">
            Đang xử lý dữ liệu sản phẩm...
          </span>
        </div>
      )}

      {/* Product name and category */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Tên sản phẩm *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(event) =>
              setFormData((prev) => ({
                ...prev,
                name: event.target.value,
              }))
            }
            placeholder="Nhập tên sản phẩm..."
            className="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Danh mục sản phẩm *
          </label>
          <select
            value={formData.categoryId}
            onChange={(event) =>
              setFormData((prev) => ({
                ...prev,
                categoryId: event.target.value,
              }))
            }
            className="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:border-blue-500"
          >
            <option value="">-- Chọn danh mục --</option>
            {categories
              .filter(
                (category) =>
                  category.categoryType === "PRODUCT" ||
                  category.type === "PRODUCT" ||
                  !category.categoryType,
              )
              .map((category) => {
                const id = category.value ?? category.id;

                return (
                  <option key={id} value={id}>
                    {category.label ?? category.name}
                  </option>
                );
              })}
          </select>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Mô tả sản phẩm *
        </label>
        <textarea
          rows={3}
          value={formData.description}
          onChange={(event) =>
            setFormData((prev) => ({
              ...prev,
              description: event.target.value,
            }))
          }
          placeholder="Mô tả chi tiết các đặc tính, công dụng sản phẩm..."
          className="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Price and quantity */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Giá sản phẩm (đ) *
          </label>
          <input
            type="number"
            min="0"
            value={formData.price}
            onChange={(event) =>
              setFormData((prev) => ({
                ...prev,
                price: event.target.value,
              }))
            }
            placeholder="Nhập giá bán..."
            className="w-full rounded-lg border border-gray-300 p-2.5 text-sm font-medium text-gray-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            {isEdit
              ? "Số lượng tồn kho hiện tại (chỉ xem)"
              : "Số lượng nhập kho ban đầu *"}
          </label>
          <input
            type="number"
            min="0"
            value={formData.quantity}
            disabled={isEdit}
            onChange={(event) =>
              setFormData((prev) => ({
                ...prev,
                quantity: event.target.value,
              }))
            }
            placeholder={
              isEdit ? "Quản lý tại chức năng kho" : "Nhập số lượng tồn..."
            }
            className={`w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:border-blue-500 ${
              isEdit ? "cursor-not-allowed bg-gray-100 text-gray-500" : ""
            }`}
          />
          {isEdit && (
            <p className="mt-1 text-xs text-gray-500">
              Số lượng tồn kho không thay đổi khi cập nhật thông tin sản phẩm.
              Hãy dùng chức năng quản lý kho để nhập hoặc xuất hàng.
            </p>
          )}
        </div>
      </div>

      {/* Image gallery */}
      {isEdit && (
        <div className="relative space-y-4 border-t border-gray-100 pt-4">
          {(loadingImages || uploadingImages) && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60">
              <span className="animate-pulse text-xs font-semibold text-gray-500">
                {uploadingImages
                  ? "Đang tải ảnh lên..."
                  : "Đang đồng bộ ảnh..."}
              </span>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-800">
              Quản lý album ảnh sản phẩm
            </label>
            <p className="mb-3 mt-1 text-xs text-gray-500">
              {productImages.length}/{MAX_IMAGES} ảnh. Nhấn vào ảnh để đặt làm
              ảnh đại diện.
            </p>

            <div className="mb-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
              {productImages.map((img) => {
                const isMain = Boolean(img.isThumbnail || img.isMain);

                return (
                  <div
                    key={img.id}
                    className={`group relative aspect-square cursor-pointer overflow-hidden rounded-xl border ${
                      isMain
                        ? "border-orange-500 ring-2 ring-orange-400/30"
                        : "border-gray-200"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleSetMainImage(img.id)}
                      title="Đặt làm ảnh đại diện"
                      className="h-full w-full"
                    >
                      <ProductImage
                        image={img}
                        alt={`Ảnh sản phẩm ${img.id}`}
                        className="h-full w-full object-cover"
                      />
                    </button>

                    {isMain && (
                      <span className="pointer-events-none absolute bottom-1 left-1 rounded bg-orange-500 px-1.5 py-0.5 text-[9px] font-bold text-white shadow">
                        Chính
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => handleRemoveGalleryImage(img.id)}
                      title="Xóa ảnh"
                      className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white opacity-0 shadow transition-opacity hover:bg-red-600 group-hover:opacity-100"
                    >
                      ×
                    </button>
                  </div>
                );
              })}

              {productImages.length < MAX_IMAGES && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex aspect-square flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 text-gray-400 transition-colors hover:border-blue-400 hover:bg-blue-50/40 hover:text-blue-500"
                >
                  <span className="text-2xl leading-none">+</span>
                  <span className="mt-1 text-[10px]">Tải ảnh lên</span>
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              accept="image/png,image/jpeg,image/webp,image/gif"
              multiple
              className="hidden"
            />

            {productImages.length < MAX_IMAGES && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImages}
                  className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-slate-900 disabled:opacity-50"
                >
                  Chọn tệp từ thiết bị
                </button>
                <span className="text-xs text-gray-400">
                  PNG, JPG, JPEG, WEBP
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Hủy bỏ
        </button>

        <button
          type="button"
          onClick={handleSubmitForm}
          disabled={loadingProduct || uploadingImages}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isEdit ? "Cập nhật sản phẩm" : "Tạo sản phẩm mới"}
        </button>
      </div>
    </div>
  );
};

export default ProductFormAdmin;
