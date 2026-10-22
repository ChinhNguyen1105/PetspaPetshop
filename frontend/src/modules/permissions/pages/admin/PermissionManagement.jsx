import React, { useCallback, useEffect, useState } from "react";
import { usePermissionStore } from "../../store/permissionStore.js";
import { useCartStore } from "../../../cart/store/cartStore.js";

import {
  KeyRound,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  Layers,
  ChevronRight,
  AlertCircle,
  X,
  Save,
  Info,
  Filter,
} from "lucide-react";

import Loading from "../../../../shared/components/Loading.jsx";
import ConfirmModal from "../../../../shared/components/ConfirmModal.jsx";
import Pagination from "../../../../shared/components/Pagination.jsx";
import { validatePermissionForm } from "../../validators/permissionValidator.js";

const MODULE_OPTIONS = [
  { value: "AUTH", label: "AUTHENTICATION" },
  { value: "USER", label: "USER (NGƯỜI DÙNG)" },
  { value: "ROLE", label: "ROLE (VAI TRÒ)" },
  { value: "PERMISSION", label: "PERMISSION (QUYỀN HẠN)" },
  { value: "PRODUCT", label: "PRODUCT (SẢN PHẨM)" },
  { value: "PET", label: "PET (THÚ CƯNG)" },
  { value: "SPA", label: "SERVICE (DỊCH VỤ SPA)" },
  { value: "BOOKING", label: "BOOKING (LỊCH ĐẶT)" },
  { value: "ORDER", label: "ORDER (ĐƠN HÀNG)" },
  { value: "CART", label: "CART (GIỎ HÀNG)" },
  { value: "SYSTEM", label: "SYSTEM (HỆ THỐNG)" },
];

const INITIAL_FORM_DATA = {
  name: "",
  apiPath: "",
  method: "GET",
  module: "",
};

const INITIAL_DELETE_STATE = {
  isOpen: false,
  permissionId: null,
  permissionName: "",
};

const PermissionManagement = () => {
  const permissions = usePermissionStore((state) => state.permissions);
  const meta = usePermissionStore((state) => state.metaPermissions);
  const loading = usePermissionStore((state) => state.loading);
  const submitting = usePermissionStore((state) => state.submitting);
  const error = usePermissionStore((state) => state.error);

  const fetchPermissions = usePermissionStore(
    (state) => state.fetchPermissions
  );
  const createPermission = usePermissionStore(
    (state) => state.createPermission
  );
  const updatePermission = usePermissionStore(
    (state) => state.updatePermission
  );
  const deletePermission = usePermissionStore(
    (state) => state.deletePermission
  );

  const showToast = useCartStore((state) => state.showToast);

  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedModule, setSelectedModule] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [validationError, setValidationError] = useState("");

  const [confirmDeleteModal, setConfirmDeleteModal] =
    useState(INITIAL_DELETE_STATE);

  const buildFilterQuery = useCallback((keyword, moduleValue) => {
    const filters = [];
    const normalizedKeyword = keyword.trim();

    if (normalizedKeyword) {
      const escapedKeyword = normalizedKeyword
        .replace(/\\/g, "\\\\")
        .replace(/\*/g, "\\*")
        .replace(/,/g, "\\,");

      filters.push(`name~*${escapedKeyword}*`);
      filters.push(`'apiPath~*${escapedKeyword}*`);
    }

    if (moduleValue) {
      filters.push(`module:${moduleValue}`);
    }

    return filters.length ? filters.join(",") : undefined;
  }, []);

  const loadData = useCallback(
    (overrides = {}) => {
      const page = overrides.page ?? currentPage;
      const keyword = overrides.keyword ?? searchKeyword;
      const moduleValue = overrides.module ?? selectedModule;

      return fetchPermissions({
        page,
        pageSize,
        filter: buildFilterQuery(keyword, moduleValue),
      });
    },
    [
      buildFilterQuery,
      currentPage,
      fetchPermissions,
      pageSize,
      searchKeyword,
      selectedModule,
    ]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setCurrentPage(1);
    loadData({ page: 1 });
  };

  const handleModuleChange = (event) => {
    setSelectedModule(event.target.value);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchKeyword("");
    setSelectedModule("");
    setCurrentPage(1);

    fetchPermissions({
      page: 1,
      pageSize,
      filter: undefined,
    });
  };

  const openCreateModal = () => {
    setEditingPermission(null);
    setFormData({ ...INITIAL_FORM_DATA });
    setValidationError("");
    setIsFormModalOpen(true);
  };

  const openEditModal = (permission) => {
    setEditingPermission(permission);
    setFormData({
      name: permission.name ?? "",
      apiPath: permission.apiPath ?? "",
      method: permission.method ?? "GET",
      module: permission.module ?? "",
    });
    setValidationError("");
    setIsFormModalOpen(true);
  };

  const closeFormModal = () => {
    if (submitting) return;

    setIsFormModalOpen(false);
    setEditingPermission(null);
    setFormData({ ...INITIAL_FORM_DATA });
    setValidationError("");
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setValidationError("");
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setValidationError("");

    const validation = validatePermissionForm(formData);

    if (!validation.success) {
      setValidationError(
        validation.error.issues[0]?.message ||
          "Vui lòng kiểm tra lại thông tin."
      );
      return;
    }

    const payload = validation.data;

    try {
      const response = editingPermission
        ? await updatePermission({
            id: editingPermission.id,
            ...payload,
          })
        : await createPermission(payload);

      if (!response?.success) {
        const message =
          response?.message || "Không thể lưu quyền hạn. Vui lòng thử lại.";

        setValidationError(message);
        showToast?.(message, "error");
        return;
      }

      showToast?.(
        `${editingPermission ? "Cập nhật" : "Thêm mới"} quyền [${payload.name}] thành công!`,
        "success"
      );

      setIsFormModalOpen(false);
      setEditingPermission(null);
      setFormData({ ...INITIAL_FORM_DATA });
      setValidationError("");

      await loadData();
    } catch (submitError) {
      const message =
        submitError?.message || "Đã xảy ra lỗi khi lưu quyền hạn.";

      setValidationError(message);
      showToast?.(message, "error");
    }
  };

  const triggerDeletePermission = (permission) => {
    setConfirmDeleteModal({
      isOpen: true,
      permissionId: permission.id,
      permissionName: permission.name,
    });
  };

  const closeDeleteModal = () => {
    setConfirmDeleteModal({ ...INITIAL_DELETE_STATE });
  };

  const executeDeletePermission = async () => {
    const { permissionId, permissionName } = confirmDeleteModal;

    if (permissionId == null) return;

    try {
      const response = await deletePermission(permissionId);

      if (!response?.success) {
        showToast?.(
          response?.message || "Không thể xóa quyền hạn này.",
          "error"
        );
        return;
      }

      closeDeleteModal();
      showToast?.(`Xóa quyền [${permissionName}] thành công!`, "success");

      const isLastItemOnPage =
        permissions.length === 1 && currentPage > 1;

      if (isLastItemOnPage) {
        setCurrentPage((previous) => previous - 1);
      } else {
        await loadData();
      }
    } catch (deleteError) {
      showToast?.(
        deleteError?.message || "Đã xảy ra lỗi khi xóa quyền hạn.",
        "error"
      );
    }
  };

  const getMethodBadgeClass = (method) => {
    switch (method) {
      case "GET":
        return "bg-purple-50 text-purple-600 border-purple-100";
      case "POST":
        return "bg-teal-50 text-teal-600 border-teal-100";
      case "PUT":
      case "PATCH":
      case "OPTIONS":
        return "bg-amber-50 text-amber-600 border-amber-100";
      case "DELETE":
        return "bg-rose-50 text-rose-600 border-rose-100";
      default:
        return "bg-gray-50 text-gray-600 border-gray-100";
    }
  };

  return (
    <div className="min-h-screen space-y-6 bg-gray-50 p-6">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
            <span>Quản lý Cấu hình</span>
            <ChevronRight size={12} />
            <span className="text-orange-500">Danh mục Quyền hạn</span>
          </div>

          <h1 className="flex items-center gap-2 text-3xl font-black tracking-tight text-slate-800">
            QUẢN LÝ QUYỀN HẠN (PERMISSIONS)
          </h1>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-md transition-all hover:bg-orange-600 active:scale-95"
        >
          <Plus size={16} />
          Tạo quyền mới
        </button>
      </div>

      <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:flex-row">
        <div className="flex w-full flex-1 flex-col items-center gap-3 sm:flex-row md:w-auto">
          <form
            onSubmit={handleSearchSubmit}
            className="group relative w-full sm:w-80"
          >
            <input
              type="text"
              placeholder="Tìm theo tên quyền, API path..."
              value={searchKeyword}
              onChange={(event) => setSearchKeyword(event.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-11 pr-4 text-sm font-medium text-slate-700 transition-all focus:border-orange-400 focus:bg-white focus:outline-none"
            />
            <button
              type="submit"
              title="Tìm kiếm"
              className="absolute left-1 top-1/2 -translate-y-1/2 rounded-lg p-2 text-gray-400 transition-all hover:bg-gray-200/60 hover:text-orange-500 active:scale-90"
            >
              <Search size={16} />
            </button>
          </form>

          <div className="relative w-full sm:w-56">
            <select
              value={selectedModule}
              onChange={handleModuleChange}
              className="w-full cursor-pointer appearance-none rounded-xl border border-gray-200 bg-gray-50 py-2 pl-9 pr-4 text-sm font-bold text-slate-700 transition-all focus:border-orange-400 focus:bg-white focus:outline-none"
            >
              <option value="">Tất cả phân hệ</option>
              {MODULE_OPTIONS.map((module) => (
                <option key={module.value} value={module.value}>
                  {module.label}
                </option>
              ))}
            </select>
            <Filter
              size={14}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleResetFilters}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-600 shadow-sm transition-all hover:bg-gray-50 active:scale-95 md:w-auto"
        >
          <RefreshCw
            size={14}
            className={loading ? "animate-spin" : ""}
          />
          Làm mới bộ lọc
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 p-3 text-xs font-bold text-red-500"
        >
          <AlertCircle size={14} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {loading && permissions.length === 0 ? (
          <div className="flex h-[40vh] items-center justify-center">
            <Loading size="large" />
          </div>
        ) : permissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center space-y-2 py-20 font-medium text-gray-400">
            <Layers size={40} className="text-gray-300" />
            <span>
              Không tìm thấy tài nguyên quyền hạn nào khớp với bộ lọc.
            </span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/70 text-[11px] font-black uppercase tracking-wider text-slate-500">
                  <th className="w-12 px-5 py-4 text-center">ID</th>
                  <th className="px-5 py-4">Tên Quyền Hạn</th>
                  <th className="px-5 py-4">Phân Hệ (Module)</th>
                  <th className="px-5 py-4">HTTP Method</th>
                  <th className="px-5 py-4 font-mono">API Path Endpoint</th>
                  <th className="w-28 px-5 py-4 text-right">Hành động</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50 text-sm">
                {permissions.map((item) => (
                  <tr
                    key={item.id}
                    className="group transition-colors hover:bg-gray-50/50"
                  >
                    <td className="px-5 py-4 text-center font-mono text-xs text-gray-400">
                      {item.id}
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-bold tracking-tight text-slate-800">
                        {item.name}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-extrabold uppercase tracking-wide text-slate-600">
                        📦 {item.module || "SYSTEM"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded border px-2 py-0.5 text-[10px] font-black tracking-widest ${getMethodBadgeClass(item.method)}`}
                      >
                        {item.method}
                      </span>
                    </td>

                    <td className="px-5 py-4 font-mono text-xs font-semibold tracking-tight text-gray-500">
                      {item.apiPath}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-1.5 opacity-80 transition-opacity group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="rounded-lg border border-gray-200 bg-gray-50 p-1.5 text-gray-500 transition-all hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 active:scale-90"
                          title="Sửa quyền hạn"
                          aria-label={`Sửa quyền ${item.name}`}
                        >
                          <Edit2 size={13} />
                        </button>

                        <button
                          type="button"
                          onClick={() => triggerDeletePermission(item)}
                          className="rounded-lg border border-gray-200 bg-gray-50 p-1.5 text-gray-500 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600 active:scale-90"
                          title="Xóa quyền hạn"
                          aria-label={`Xóa quyền ${item.name}`}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {meta && meta.pages > 1 && (
          <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-100 bg-gray-50/40 px-5 py-5 sm:flex-row">
            <span className="order-2 text-xs font-bold text-gray-400 sm:order-1">
              Hiển thị{" "}
              <span className="text-slate-700">{permissions.length}</span> /{" "}
              {meta.total} bản ghi dữ liệu.
            </span>

            <div className="order-1 sm:order-2">
              <Pagination
                currentPage={currentPage}
                totalPages={meta.pages}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        )}
      </div>

      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg animate-scale-up overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/80 px-5 py-4">
              <div className="flex items-center gap-2 text-base font-black uppercase tracking-wide text-slate-800">
                <KeyRound size={18} className="text-orange-500" />
                {editingPermission
                  ? "Cập nhật thông tin quyền"
                  : "Thêm mới quyền hệ thống"}
              </div>

              <button
                type="button"
                onClick={closeFormModal}
                disabled={submitting}
                className="text-gray-400 transition-colors hover:text-gray-600 disabled:opacity-50"
                aria-label="Đóng biểu mẫu"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 p-5">
              {validationError && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-3 text-sm font-medium text-red-600"
                >
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-700">
                  Tên Quyền Hạn <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  maxLength={150}
                  placeholder="Ví dụ: Lấy thông tin người dùng hiện tại"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-slate-800 focus:border-orange-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="sm:col-span-1">
                  <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-700">
                    HTTP Method <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="method"
                    required
                    value={formData.method}
                    onChange={handleInputChange}
                    className="w-full cursor-pointer rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 focus:border-orange-400 focus:outline-none"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                    <option value="PATCH">PATCH</option>
                    <option value="OPTIONS">OPTIONS</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-700">
                    Phân Hệ / Module{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="module"
                    required
                    value={formData.module}
                    onChange={handleInputChange}
                    className="w-full cursor-pointer rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-bold text-slate-800 focus:border-orange-400 focus:outline-none"
                  >
                    <option value="">--- Chọn Phân Hệ ---</option>
                    {MODULE_OPTIONS.map((module) => (
                      <option key={module.value} value={module.value}>
                        {module.value}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-700">
                  API Path Endpoint{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="apiPath"
                  required
                  maxLength={500}
                  placeholder="Ví dụ: /api/v1/users/current"
                  value={formData.apiPath}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 font-mono text-sm font-semibold text-slate-800 focus:border-orange-400 focus:outline-none"
                />
              </div>

              <div className="flex items-start gap-2 rounded-xl border border-blue-100/60 bg-blue-50/50 p-3 text-xs font-medium leading-relaxed text-blue-600">
                <Info size={14} className="mt-0.5 shrink-0" />
                <span>
                  API Endpoint và Method được backend sử dụng để xác định quyền
                  truy cập tương ứng với từng request.
                </span>
              </div>

              <div className="flex justify-end gap-2 border-t border-gray-100 pt-3">
                <button
                  type="button"
                  onClick={closeFormModal}
                  disabled={submitting}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-gray-500 transition-all hover:bg-gray-100 disabled:opacity-50"
                >
                  Hủy bỏ
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-1.5 rounded-xl bg-orange-500 px-4 py-2 text-xs font-black uppercase tracking-wider text-white transition-all hover:bg-orange-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Save size={14} />
                  {submitting ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmDeleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={executeDeletePermission}
        title="Xác nhận gỡ bỏ quyền hạn"
        message={`Bạn có chắc chắn muốn xóa vĩnh viễn quyền hạn "${confirmDeleteModal.permissionName}" khỏi hệ thống? Hành động này có thể ảnh hưởng đến các cấu hình Vai trò đang chứa quyền này.`}
        type="danger"
      />
    </div>
  );
};

export default PermissionManagement;
