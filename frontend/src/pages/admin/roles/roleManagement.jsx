import React, { useEffect, useState, useMemo, useRef } from "react";

import { useRoleStore } from "../../../store/roleStore";
import { usePermissionStore } from "../../../store/permissionStore";
import { useCartStore } from "../../../store/cartStore";

import {
  Shield,
  ShieldCheck,
  CheckSquare,
  Square,
  RefreshCw,
  AlertCircle,
  ChevronRight,
  CheckCircle,
  Layers,
  Lock,
} from "lucide-react";

import Loading from "../../../components/common/Loading";
import ConfirmModal from "../../../components/common/ConfirmModal";

const RoleManagement = () => {
  // =========================================================
  // 1. STORE
  // =========================================================

  const roles = useRoleStore((state) => state.roles);
  const loadingRoles = useRoleStore((state) => state.loading);
  const errorRoles = useRoleStore((state) => state.error);
  const fetchRoles = useRoleStore((state) => state.fetchRoles);
  const updateRole = useRoleStore((state) => state.updateRole);

  const permissions = usePermissionStore((state) => state.permissions);

  const loadingPermissions = usePermissionStore((state) => state.loading);

  const errorPermissions = usePermissionStore((state) => state.error);

  const fetchPermissions = usePermissionStore(
    (state) => state.fetchPermissions,
  );

  const showToast = useCartStore((state) => state.showToast);

  const isLoadingCombined = loadingRoles || loadingPermissions;

  const combinedError = errorRoles || errorPermissions;

  const permissionContainerRef = useRef(null);

  // =========================================================
  // 2. LOCAL STATE
  // =========================================================

  const [selectedRole, setSelectedRole] = useState(null);

  const [checkedPermissionIds, setCheckedPermissionIds] = useState([]);

  const [selectedModule, setSelectedModule] = useState("");

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: "",
    title: "",
    message: "",
    pendingData: null,
  });

  // =========================================================
  // 3. LOAD ROLES
  // =========================================================

  useEffect(() => {
    const initRoles = async () => {
      const rolesRes = await fetchRoles({
        pageSize: 100,
      });

      if (rolesRes && rolesRes.length > 0) {
        const firstRole = rolesRes[0];

        setSelectedRole(firstRole);

        setCheckedPermissionIds(
          firstRole.permissions
            ? firstRole.permissions.map((permission) => permission.id)
            : [],
        );
      }
    };

    initRoles();
  }, [fetchRoles]);

  // =========================================================
  // 4. LẤY DANH SÁCH MODULE
  //
  // Module được lấy từ permissions của các role.
  // Không phụ thuộc vào page permission hiện tại.
  // =========================================================

  const moduleKeys = useMemo(() => {
    const moduleSet = new Set();

    roles.forEach((role) => {
      role.permissions?.forEach((permission) => {
        const moduleName =
          permission.module ||
          permission.apiPath?.split("/").filter(Boolean)[0]?.toUpperCase();

        if (moduleName) {
          moduleSet.add(moduleName);
        }
      });
    });

    permissions.forEach((permission) => {
      const moduleName =
        permission.module ||
        permission.apiPath?.split("/").filter(Boolean)[0]?.toUpperCase();

      if (moduleName) {
        moduleSet.add(moduleName);
      }
    });

    return Array.from(moduleSet).sort();
  }, [roles, permissions]);

  // =========================================================
  // 5. CHỌN MODULE MẶC ĐỊNH
  // =========================================================

  useEffect(() => {
    if (moduleKeys.length > 0 && !moduleKeys.includes(selectedModule)) {
      setSelectedModule(moduleKeys[0]);
    }
  }, [moduleKeys, selectedModule]);

  // =========================================================
  // 6. FETCH PERMISSION THEO MODULE
  //
  // BE:
  // /permissions?page=1&pageSize=100&filter=module:USER
  // =========================================================

  useEffect(() => {
    if (!selectedModule) {
      return;
    }

    fetchPermissions({
      page: 1,
      pageSize: 100,
      filter: `module:${selectedModule}`,
    });

    if (permissionContainerRef.current) {
      permissionContainerRef.current.scrollTop = 0;
    }
  }, [selectedModule, fetchPermissions]);

  // =========================================================
  // 7. ĐỒNG BỘ ROLE SAU KHI STORE UPDATE
  // =========================================================

  useEffect(() => {
    if (!selectedRole || roles.length === 0) {
      return;
    }

    const updatedRole = roles.find((role) => role.id === selectedRole.id);

    if (!updatedRole) {
      return;
    }

    const updatedIds = updatedRole.permissions
      ? updatedRole.permissions.map((permission) => permission.id)
      : [];

    const currentIds = selectedRole.permissions
      ? selectedRole.permissions.map((permission) => permission.id)
      : [];

    if (JSON.stringify(updatedIds) !== JSON.stringify(currentIds)) {
      setSelectedRole(updatedRole);
      setCheckedPermissionIds(updatedIds);
    }
  }, [roles]);

  // =========================================================
  // 8. CHỌN ROLE
  // =========================================================

  const handleSelectRole = (role) => {
    setSelectedRole(role);

    const extractedIds = role.permissions
      ? role.permissions.map((permission) => permission.id)
      : [];

    setCheckedPermissionIds(extractedIds);
  };

  // =========================================================
  // 9. PERMISSION CỦA MODULE HIỆN TẠI
  // =========================================================

  const currentModulePermissions = useMemo(() => {
    if (!permissions || permissions.length === 0) {
      return [];
    }

    return permissions.filter((permission) => {
      const moduleName =
        permission.module ||
        permission.apiPath?.split("/").filter(Boolean)[0]?.toUpperCase() ||
        "HỆ THỐNG CHUNG";

      return moduleName === selectedModule;
    });
  }, [permissions, selectedModule]);

  // =========================================================
  // 10. TOGGLE PERMISSION
  // =========================================================

  const handleTogglePermission = (permissionId) => {
    setCheckedPermissionIds((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId],
    );
  };

  // =========================================================
  // 11. TOGGLE TOÀN BỘ MODULE
  // =========================================================

  const handleToggleModuleAll = () => {
    const moduleIds = currentModulePermissions.map(
      (permission) => permission.id,
    );

    const isAllSelected =
      moduleIds.length > 0 &&
      moduleIds.every((id) => checkedPermissionIds.includes(id));

    if (isAllSelected) {
      setCheckedPermissionIds((prev) =>
        prev.filter((id) => !moduleIds.includes(id)),
      );
    } else {
      setCheckedPermissionIds((prev) =>
        Array.from(new Set([...prev, ...moduleIds])),
      );
    }
  };

  // =========================================================
  // 12. TRẠNG THÁI MODULE
  // =========================================================

  const isAllModuleChecked =
    currentModulePermissions.length > 0 &&
    currentModulePermissions.every((permission) =>
      checkedPermissionIds.includes(permission.id),
    );

  const isSomeModuleChecked =
    currentModulePermissions.some((permission) =>
      checkedPermissionIds.includes(permission.id),
    ) && !isAllModuleChecked;

  // =========================================================
  // 13. SUBMIT
  // =========================================================

  const handleFormSubmit = (event) => {
    event.preventDefault();

    if (!selectedRole) {
      return;
    }

    setConfirmModal({
      isOpen: true,
      type: "CONFIRM_SUBMIT",
      title: "Xác nhận cập nhật phân quyền",
      message: `Bạn có chắc chắn muốn cập nhật lại ma trận quyền hạn cho vai trò "${selectedRole.name}" không?`,
      pendingData: checkedPermissionIds,
    });
  };

  // =========================================================
  // 14. SAVE
  // =========================================================

  const executeSavePermissions = async () => {
    try {
      const formattedPermissions = confirmModal.pendingData.map((id) => ({
        id,
      }));

      const updatePayload = {
        id: selectedRole.id,
        name: selectedRole.name,
        description: selectedRole.description,
        activeFlag: selectedRole.activeFlag ?? true,
        permissions: formattedPermissions,
      };

      const res = await updateRole(updatePayload);

      closeConfirmModal();

      if (res && res.success) {
        showToast(
          `Cập nhật ma trận quyền vai trò [${selectedRole.name}] thành công!`,
          "success",
        );
      } else {
        showToast(res?.message || "Không thể cập nhật phân quyền.", "error");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật phân quyền:", error);

      showToast("Đã xảy ra lỗi hệ thống khi cập nhật quyền.", "error");

      closeConfirmModal();
    }
  };

  // =========================================================
  // 15. CONFIRM
  // =========================================================

  const handleConfirmAction = () => {
    if (confirmModal.type === "CONFIRM_SUBMIT") {
      executeSavePermissions();
    } else {
      closeConfirmModal();
    }
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

  // =========================================================
  // 16. REFRESH
  // =========================================================

  const handleRefresh = async () => {
    await fetchRoles({
      pageSize: 100,
    });

    if (selectedModule) {
      await fetchPermissions({
        page: 1,
        pageSize: 100,
        filter: `module:${selectedModule}`,
      });
    }
  };

  // =========================================================
  // 17. LOADING
  // =========================================================

  if (isLoadingCombined && roles.length === 0) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loading size="large" />
      </div>
    );
  }

  // =========================================================
  // 18. UI
  // =========================================================

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 bg-gray-50 min-h-screen flex flex-col">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
            <span>Quản lý Cấu hình</span>

            <ChevronRight size={12} />

            <span className="text-orange-500">Phân quyền Hệ thống</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            MA TRẬN PHÂN QUYỀN
          </h1>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 text-xs font-bold text-gray-600 rounded-xl hover:bg-gray-50 transition-all shadow-sm active:scale-95"
        >
          <RefreshCw
            size={14}
            className={isLoadingCombined ? "animate-spin" : ""}
          />
          Làm mới dữ liệu
        </button>
      </div>

      {/* ERROR */}
      {combinedError && (
        <div className="p-3 bg-red-50 border border-red-100 text-red-500 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0">
          <AlertCircle size={14} className="flex-shrink-0" />

          <span>{combinedError}</span>
        </div>
      )}

      {/* BODY */}
      <div className="grid grid-cols-1 xl:grid-cols-4 lg:grid-cols-3 gap-5 items-start flex-1">
        {/* ROLE */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 xl:col-span-1 lg:col-span-1 flex flex-col max-h-[calc(100vh-160px)] sticky top-4">
          <div className="flex items-center gap-2 text-[13px] font-black text-slate-800 border-b border-gray-100 pb-3 mb-3 uppercase tracking-wide shrink-0">
            <Shield size={16} className="text-orange-500" />
            1. Chọn vai trò tài khoản
          </div>

          <div className="space-y-2 overflow-y-auto custom-scrollbar pr-1 flex-1">
            {roles.map((role) => {
              const isSelected = selectedRole?.id === role.id;

              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => handleSelectRole(role)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left border transition-all active:scale-[0.99] ${
                    isSelected
                      ? "bg-orange-50/50 border-orange-200 text-orange-600 shadow-sm"
                      : "bg-gray-50/50 border-gray-100 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`p-1.5 rounded-lg shrink-0 border ${
                        isSelected
                          ? "bg-orange-500 border-orange-600 text-white"
                          : "bg-white border-gray-200 text-gray-400"
                      }`}
                    >
                      <ShieldCheck size={14} />
                    </div>

                    <div className="min-w-0 pr-2">
                      <p
                        className={`text-[13px] font-black tracking-tight truncate ${
                          isSelected ? "text-slate-800" : "text-gray-700"
                        }`}
                      >
                        {role.name}
                      </p>

                      <p className="text-[10px] text-gray-400 truncate mt-0.5">
                        {role.description || "Chưa có mô tả"}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md border shrink-0 ${
                      isSelected
                        ? "bg-white border-orange-200 text-orange-600"
                        : "bg-gray-100 border-transparent text-gray-500"
                    }`}
                  >
                    {role.permissions?.length || 0}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* PERMISSIONS */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden xl:col-span-3 lg:col-span-2 flex flex-col h-[calc(100vh-160px)]">
          {/* HEADER */}
          <div className="p-3.5 border-b border-gray-100 bg-gray-50/80 flex flex-col gap-3 shrink-0">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="text-[13px] font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                <Lock size={16} className="text-orange-500" />
                2. Ma trận quyền chi tiết
                {selectedRole && (
                  <span className="text-orange-500">[{selectedRole.name}]</span>
                )}
              </div>

              {selectedRole && (
                <button
                  type="button"
                  onClick={handleFormSubmit}
                  className="w-full sm:w-auto px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-xl text-xs tracking-wide transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-sm uppercase"
                >
                  <CheckCircle size={14} />
                  Cập nhật ma trận
                </button>
              )}
            </div>

            {/* MODULE SELECT */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="flex items-center gap-2 shrink-0">
                <Layers size={15} className="text-orange-500" />

                <span className="text-[11px] font-black text-gray-500 uppercase">
                  Chọn phân hệ
                </span>
              </div>

              <select
                value={selectedModule}
                onChange={(event) => setSelectedModule(event.target.value)}
                className="w-full sm:w-auto min-w-[220px] px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              >
                {moduleKeys.length === 0 ? (
                  <option value="">Không có phân hệ</option>
                ) : (
                  moduleKeys.map((moduleName) => (
                    <option key={moduleName} value={moduleName}>
                      {moduleName}
                    </option>
                  ))
                )}
              </select>

              {selectedModule && (
                <span className="text-[10px] text-gray-400 font-bold">
                  {currentModulePermissions.length} quyền
                </span>
              )}
            </div>
          </div>

          {/* PERMISSION CONTENT */}
          <div
            ref={permissionContainerRef}
            className="p-4 overflow-y-auto custom-scrollbar flex-1 scroll-smooth bg-gray-50/20"
          >
            {!selectedModule ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 font-medium space-y-2">
                <Layers size={32} className="text-gray-300" />

                <span className="text-sm">Chưa có phân hệ quyền hạn.</span>
              </div>
            ) : loadingPermissions ? (
              <div className="flex flex-col items-center justify-center h-full">
                <Loading size="large" />

                <span className="mt-3 text-xs text-gray-400 font-bold">
                  Đang tải quyền của phân hệ {selectedModule}...
                </span>
              </div>
            ) : currentModulePermissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 font-medium space-y-2">
                <Layers size={32} className="text-gray-300" />

                <span className="text-sm">
                  Không tìm thấy quyền hạn trong phân hệ {selectedModule}.
                </span>
              </div>
            ) : (
              <div className="border border-gray-100/80 rounded-xl overflow-hidden shadow-sm bg-white">
                {/* MODULE HEADER */}
                <div className="bg-gray-50/80 px-3 py-2.5 border-b border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] font-black text-slate-700 tracking-wider uppercase">
                    📦 PHÂN HỆ: {selectedModule}
                  </span>

                  <button
                    type="button"
                    onClick={handleToggleModuleAll}
                    className={`flex items-center gap-1 px-2 py-1 rounded border text-[10px] font-extrabold transition-colors ${
                      isAllModuleChecked
                        ? "text-purple-600 bg-purple-50 border-purple-200"
                        : isSomeModuleChecked
                          ? "text-teal-600 bg-teal-50 border-teal-200"
                          : "text-gray-500 bg-white border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {isAllModuleChecked ? (
                      <CheckSquare size={12} />
                    ) : (
                      <Square size={12} />
                    )}
                    Chọn tất cả ({currentModulePermissions.length})
                  </button>
                </div>

                {/* PERMISSION LIST */}
                <div className="p-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5">
                  {currentModulePermissions.map((permission) => {
                    const isChecked = checkedPermissionIds.includes(
                      permission.id,
                    );

                    return (
                      <div
                        key={permission.id}
                        onClick={() => handleTogglePermission(permission.id)}
                        className={`flex items-start gap-2.5 p-2.5 rounded-lg border transition-all duration-150 cursor-pointer select-none group ${
                          isChecked
                            ? "bg-orange-50/40 border-orange-200/80 shadow-xs"
                            : "bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50/50"
                        }`}
                      >
                        <div
                          className={`mt-0.5 rounded shrink-0 transition-colors ${
                            isChecked ? "text-orange-500" : "text-gray-300"
                          }`}
                        >
                          {isChecked ? (
                            <CheckSquare size={14} />
                          ) : (
                            <Square size={14} />
                          )}
                        </div>

                        <div className="min-w-0 flex-1 flex flex-col justify-center">
                          <p
                            className={`text-[11px] font-bold leading-tight truncate ${
                              isChecked ? "text-slate-800" : "text-gray-600"
                            }`}
                            title={permission.name}
                          >
                            {permission.name}
                          </p>

                          <div className="flex items-center gap-1.5 mt-1 overflow-hidden">
                            <span
                              className={`text-[8.5px] font-extrabold px-1.5 py-0.5 rounded-sm border shrink-0 ${
                                permission.method === "GET"
                                  ? "bg-purple-50 text-purple-600 border-purple-100"
                                  : permission.method === "POST"
                                    ? "bg-teal-50 text-teal-600 border-teal-100"
                                    : permission.method === "PUT"
                                      ? "bg-amber-50 text-amber-600 border-amber-100"
                                      : "bg-rose-50 text-rose-600 border-rose-100"
                              }`}
                            >
                              {permission.method}
                            </span>

                            <span
                              className="text-[9px] text-gray-400 font-bold font-mono truncate"
                              title={permission.apiPath}
                            >
                              {permission.apiPath}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="bg-white border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between p-3 gap-3 text-xs font-bold text-gray-400 shrink-0">
            <div>
              Đã chọn:{" "}
              <span className="text-orange-500 font-black">
                {checkedPermissionIds.length}
              </span>{" "}
              quyền hạn.
            </div>

            {selectedModule && (
              <div className="text-gray-400">
                Đang xem:{" "}
                <span className="text-orange-500 font-black">
                  {selectedModule}
                </span>
              </div>
            )}
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
        type="warning"
      />
    </div>
  );
};

export default RoleManagement;
