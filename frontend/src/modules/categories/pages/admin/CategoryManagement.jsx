import React, { useState, useEffect } from "react";
import {
  Search,
  Edit2,
  Trash2,
  AlertCircle,
  RefreshCw,
  Layers,
  ChevronRight,
  FolderPlus,
  CheckCircle,
  X,
  Filter,
} from "lucide-react";

import Loading from "../../../../shared/components/Loading.jsx";
import ConfirmModal from "../../../../shared/components/ConfirmModal.jsx";
import Pagination from "../../../../shared/components/Pagination.jsx";

import { useCartStore } from "../../../cart/store/cartStore.js";
import { useCategoryStore } from "../../store/categoryStore.js";
import { validateCategory } from "../../validators/categoryValidator.js";

const CategoryManagement = () => {
  // STORE
  const categories = useCategoryStore((state) => state.categories) || [];
  const categoryMeta = useCategoryStore((state) => state.categoryMeta);
  const loading = useCategoryStore((state) => state.loading);
  const errorStore = useCategoryStore((state) => state.error);

  const fetchCategories = useCategoryStore((state) => state.fetchCategories);
  const createCategory = useCategoryStore((state) => state.createCategory);
  const updateCategory = useCategoryStore((state) => state.updateCategory);
  const deleteCategory = useCategoryStore((state) => state.deleteCategory);

  const showToast = useCartStore((state) => state.showToast);

  // FILTER STATE
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // FORM STATE
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    categoryType: "PRODUCT",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // CONFIRM MODAL
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: "",
    title: "",
    message: "",
    pendingData: null,
  });

  // FETCH CATEGORIES
  useEffect(() => {
    const filters = [];

    if (searchTerm.trim()) {
      filters.push(`name~*${searchTerm.trim()}*`);
    }

    if (selectedType) {
      filters.push(`categoryType:${selectedType}`);
    }

    fetchCategories({
      page: currentPage,
      pageSize: 10,
      ...(filters.length > 0 ? { filter: filters.join(",") } : {}),
    });
  }, [currentPage, searchTerm, selectedType, fetchCategories]);

  // FILTER HANDLERS
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleTypeChange = (e) => {
    setSelectedType(e.target.value);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedType("");
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm.trim() !== "" || selectedType !== "";

  // FORM HANDLERS
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setFieldErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setFormError("");
  };

  const handleEditClick = (category) => {
    setIsEditing(true);
    setFormError("");
    setFieldErrors({});

    setFormData({
      id: category.id,
      name: category.name || "",
      categoryType: category.categoryType || "PRODUCT",
    });
  };

  const resetForm = () => {
    setIsEditing(false);
    setFormError("");
    setFieldErrors({});

    setFormData({
      id: null,
      name: "",
      categoryType: "PRODUCT",
    });
  };

  const closeConfirmModal = () => {
    setConfirmModal({
      isOpen: false,
      type: "",
      title: "",
      message: "",
      pendingData: null,
    });
  };

  // VALIDATE AND SUBMIT FORM
  const handleFormSubmit = (e) => {
    e.preventDefault();

    const validation = validateCategory(formData);

    setFieldErrors(validation.errors);
    setFormError("");

    if (!validation.isValid) {
      return;
    }

    const validatedData = {
      ...validation.data,
      ...(isEditing ? { id: formData.id } : {}),
    };

    if (isEditing) {
      setConfirmModal({
        isOpen: true,
        type: "CONFIRM_SUBMIT",
        title: "Xác nhận cập nhật",
        message: `Bạn có chắc chắn muốn lưu các thay đổi cho danh mục "${validatedData.name}" không?`,
        pendingData: validatedData,
      });

      return;
    }

    executeSaveCategory(validatedData);
  };

  // CREATE / UPDATE CATEGORY
  const executeSaveCategory = async (dataToSave) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setFormError("");

    try {
      let res;

      if (isEditing) {
        res = await updateCategory(dataToSave.id, {
          name: dataToSave.name,
          categoryType: dataToSave.categoryType,
        });
      } else {
        res = await createCategory({
          name: dataToSave.name,
          categoryType: dataToSave.categoryType,
        });
      }

      if (!res || !res.success) {
        const message =
          res?.message ||
          res?.error ||
          "Không thể lưu danh mục. Vui lòng thử lại.";

        setFormError(
          typeof message === "string"
            ? message
            : "Không thể lưu danh mục. Vui lòng thử lại.",
        );

        return;
      }

      showToast(
        isEditing
          ? "Cập nhật danh mục thành công!"
          : "Thêm danh mục mới thành công!",
        "success",
      );

      resetForm();
      closeConfirmModal();

      const filters = [];

      if (searchTerm.trim()) {
        filters.push(`name~*${searchTerm.trim()}*`);
      }

      if (selectedType) {
        filters.push(`categoryType:${selectedType}`);
      }

      await fetchCategories({
        page: currentPage,
        pageSize: 10,
        ...(filters.length > 0 ? { filter: filters.join(",") } : {}),
      });
    } catch (err) {
      console.error("Save category failed:", err);

      setFormError(
        err?.response?.data?.message ||
          err?.message ||
          "Đã xảy ra lỗi hệ thống, vui lòng thử lại.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // DELETE CATEGORY
  const handleOpenDeleteModal = (id, name) => {
    setConfirmModal({
      isOpen: true,
      type: "CONFIRM_DELETE",
      title: "Xóa danh mục vĩnh viễn",
      message: `Bạn có chắc chắn muốn xóa danh mục "${name}"?`,
      pendingData: {
        id,
        name,
      },
    });
  };

  const executeDeleteCategory = async () => {
    const pendingData = confirmModal.pendingData;

    if (!pendingData || isSubmitting) return;

    const { id, name } = pendingData;

    setIsSubmitting(true);

    try {
      const res = await deleteCategory(id);

      if (!res || !res.success) {
        showToast(
          res?.message ||
            res?.error ||
            "Không thể xóa danh mục. Vui lòng thử lại.",
          "error",
        );

        closeConfirmModal();
        return;
      }

      showToast(`Xóa danh mục "${name}" thành công!`, "success");

      if (isEditing && String(formData.id) === String(id)) {
        resetForm();
      }

      closeConfirmModal();

      const nextTargetPage =
        categories.length === 1 ? Math.max(currentPage - 1, 1) : currentPage;

      setCurrentPage(nextTargetPage);

      // Nếu vẫn ở trang hiện tại, useEffect có thể không chạy.
      if (nextTargetPage === currentPage) {
        const filters = [];

        if (searchTerm.trim()) {
          filters.push(`name~*${searchTerm.trim()}*`);
        }

        if (selectedType) {
          filters.push(`categoryType:${selectedType}`);
        }

        await fetchCategories({
          page: currentPage,
          pageSize: 10,
          ...(filters.length > 0 ? { filter: filters.join(",") } : {}),
        });
      }
    } catch (err) {
      console.error("Delete category failed:", err);

      showToast(
        err?.response?.data?.message ||
          err?.message ||
          "Đã xảy ra lỗi hệ thống khi xóa danh mục.",
        "error",
      );

      closeConfirmModal();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmAction = () => {
    if (confirmModal.type === "CONFIRM_SUBMIT") {
      executeSaveCategory(confirmModal.pendingData);
    } else if (confirmModal.type === "CONFIRM_DELETE") {
      executeDeleteCategory();
    } else {
      closeConfirmModal();
    }
  };

  // PAGINATION
  const totalItems = categoryMeta?.total || 0;
  const totalPages = categoryMeta?.pages || 1;
  const pageSize = categoryMeta?.pageSize || 10;

  const getGlobalIndex = (index) => {
    return (currentPage - 1) * pageSize + index + 1;
  };

  if (loading && categories.length === 0) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loading size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-6 bg-gray-50 p-6">
      {/* HEADER */}
      <div>
        <div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
          <span>Quản lý Shop</span>
          <ChevronRight size={12} />
          <span className="text-orange-500">Danh mục</span>
        </div>

        <h1 className="text-3xl font-black tracking-tight text-slate-800">
          DANH MỤC HỆ THỐNG
        </h1>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        {/* FORM CREATE / UPDATE */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:sticky lg:top-6">
          <div className="mb-4 flex items-center gap-2 border-b border-gray-100 pb-3 text-base font-black uppercase tracking-wide text-slate-800">
            <FolderPlus size={18} className="text-orange-500" />
            {isEditing ? "Cập nhật danh mục" : "Thêm danh mục mới"}
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-4" noValidate>
            {formError && (
              <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 p-3 text-xs font-bold text-red-500">
                <AlertCircle size={14} className="shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {errorStore && !formError && (
              <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 p-3 text-xs text-red-500">
                <AlertCircle size={14} className="shrink-0" />
                <span>
                  {typeof errorStore === "string"
                    ? errorStore
                    : "Không thể tải danh sách danh mục."}
                </span>
              </div>
            )}

            {/* CATEGORY NAME */}
            <div>
              <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-gray-400">
                Tên danh mục <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Ví dụ: Tắm & Vệ sinh, Thức ăn hạt..."
                maxLength={100}
                aria-invalid={Boolean(fieldErrors.name)}
                className={`w-full rounded-xl border bg-gray-50 px-3 py-2.5 text-sm text-gray-700 transition-all focus:bg-white focus:outline-none ${
                  fieldErrors.name
                    ? "border-red-400 focus:border-red-500"
                    : "border-gray-200 focus:border-orange-500"
                }`}
              />

              {fieldErrors.name && (
                <p className="mt-1 text-xs font-medium text-red-500">
                  {fieldErrors.name}
                </p>
              )}
            </div>

            {/* CATEGORY TYPE */}
            <div>
              <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-gray-400">
                Loại danh mục <span className="text-red-500">*</span>
              </label>

              <select
                name="categoryType"
                value={formData.categoryType}
                onChange={handleInputChange}
                aria-invalid={Boolean(fieldErrors.categoryType)}
                className={`w-full rounded-xl border bg-gray-50 px-3 py-2.5 text-sm font-bold text-gray-700 transition-all focus:bg-white focus:outline-none ${
                  fieldErrors.categoryType
                    ? "border-red-400 focus:border-red-500"
                    : "border-gray-200 focus:border-orange-500"
                }`}
              >
                <option value="PRODUCT">SẢN PHẨM (PRODUCT)</option>
                <option value="SERVICE">DỊCH VỤ (SERVICE)</option>
              </select>

              {fieldErrors.categoryType && (
                <p className="mt-1 text-xs font-medium text-red-500">
                  {fieldErrors.categoryType}
                </p>
              )}
            </div>

            {/* ACTIONS */}
            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-bold text-white shadow-sm transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 ${
                  isEditing
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-orange-500 hover:bg-orange-600"
                }`}
              >
                <CheckCircle size={16} />
                {isSubmitting
                  ? "Đang xử lý..."
                  : isEditing
                    ? "Cập nhật"
                    : "Tạo danh mục"}
              </button>

              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={isSubmitting}
                  className="rounded-xl bg-gray-100 px-3 py-2.5 text-sm font-bold text-gray-500 transition-all hover:bg-gray-200 disabled:opacity-60"
                  title="Hủy chỉnh sửa"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </form>
        </div>

        {/* CATEGORY TABLE */}
        <div className="flex min-h-[400px] flex-col justify-between overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm lg:col-span-2">
          <div>
            {/* FILTER BAR */}
            <div className="border-b border-gray-100 bg-gray-50/50 p-4">
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative max-w-xs flex-1">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <Search size={16} />
                  </span>

                  <input
                    type="text"
                    placeholder="Tìm danh mục..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-4 text-xs text-gray-700 transition-all focus:border-slate-700 focus:outline-none"
                  />
                </div>

                <div className="relative sm:w-48">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <Filter size={15} />
                  </span>

                  <select
                    value={selectedType}
                    onChange={handleTypeChange}
                    className="w-full cursor-pointer appearance-none rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-8 text-xs font-bold text-gray-700 transition-all focus:border-slate-700 focus:outline-none"
                  >
                    <option value="">Tất cả loại</option>
                    <option value="PRODUCT">Sản phẩm</option>
                    <option value="SERVICE">Dịch vụ</option>
                  </select>
                </div>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-gray-100 px-3 py-2 text-xs font-bold text-gray-500 transition-all hover:bg-gray-200 hover:text-slate-700"
                    title="Xóa bộ lọc"
                  >
                    <RefreshCw size={14} />
                    <span className="hidden sm:inline">Xóa lọc</span>
                  </button>
                )}
              </div>
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/70 text-xs font-black uppercase tracking-wider text-gray-400">
                    <th className="w-16 p-4 text-center">STT</th>
                    <th className="p-4">Tên danh mục</th>
                    <th className="p-4">Phân loại</th>
                    <th className="w-32 p-4 text-right">Hành động</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-50">
                  {categories.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="p-12 text-center font-medium text-gray-400"
                      >
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <Layers size={32} className="text-gray-300" />
                          <span>
                            {hasActiveFilters
                              ? "Không tìm thấy danh mục phù hợp."
                              : "Chưa có danh mục nào trong hệ thống."}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    categories.map((category, index) => {
                      const isRowEditing =
                        String(formData.id) === String(category.id) &&
                        isEditing;

                      return (
                        <tr
                          key={category.id}
                          className={`group transition-colors ${
                            isRowEditing
                              ? "bg-orange-50/40 hover:bg-orange-50/50"
                              : "hover:bg-gray-50/50"
                          }`}
                        >
                          <td className="p-4 text-center font-mono text-xs text-gray-400">
                            {getGlobalIndex(index)}
                          </td>

                          <td className="p-4">
                            <div
                              className={`text-base font-bold transition-colors ${
                                isRowEditing
                                  ? "text-orange-500"
                                  : "text-gray-800"
                              }`}
                            >
                              {category.name}
                            </div>
                          </td>

                          <td className="p-4">
                            <span
                              className={`rounded-full border px-2 py-1 text-[10px] font-extrabold ${
                                category.categoryType === "SERVICE"
                                  ? "border-purple-100 bg-purple-50 text-purple-600"
                                  : "border-teal-100 bg-teal-50 text-teal-600"
                              }`}
                            >
                              {category.categoryType || "PRODUCT"}
                            </span>
                          </td>

                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-80 transition-opacity group-hover:opacity-100">
                              <button
                                type="button"
                                onClick={() => handleEditClick(category)}
                                className={`rounded-xl border p-2 transition-all ${
                                  isRowEditing
                                    ? "border-orange-200 bg-orange-100 text-orange-500"
                                    : "border-transparent text-blue-600 hover:border-blue-200 hover:bg-blue-50"
                                }`}
                                title="Chỉnh sửa danh mục"
                              >
                                <Edit2 size={14} />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleOpenDeleteModal(
                                    category.id,
                                    category.name,
                                  )
                                }
                                className="rounded-xl border border-transparent p-2 text-red-500 transition-all hover:border-red-200 hover:bg-red-50"
                                title="Xóa danh mục"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* PAGINATION */}
          <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/50 px-4 py-3">
            <div className="text-xs font-bold text-gray-400">
              Tổng cộng: <span className="text-slate-700">{totalItems}</span>{" "}
              danh mục
              {totalItems > 0 &&
                ` (Hiển thị ${(currentPage - 1) * pageSize + 1} - ${Math.min(
                  currentPage * pageSize,
                  totalItems,
                )})`}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>

      {/* CONFIRM MODAL */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        onConfirm={handleConfirmAction}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type === "CONFIRM_DELETE" ? "danger" : "warning"}
      />
    </div>
  );
};

export default CategoryManagement;
