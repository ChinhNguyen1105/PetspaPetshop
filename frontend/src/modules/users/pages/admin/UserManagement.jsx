import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  User,
  Shield,
  ChevronRight,
  Mail,
} from "lucide-react";

import Loading from "../../../../shared/components/Loading.jsx";
import { formatDate } from "../../../../shared/utils/formatDate.js";
import Modal from "../../../../shared/components/Modal.jsx";
import ConfirmModal from "../../../../shared/components/ConfirmModal.jsx";
import UserFormAdmin from "../../components/admin/UserFormAdmin.jsx";
import Pagination from "../../../../shared/components/Pagination.jsx";
import UserAvatar from "../../components/admin/UserAvatar.jsx";

import { useUserStore } from "../../store/userStore.js";
import { useCartStore } from "../../../cart/store/cartStore.js";
import { ROLE_OPTIONS } from "../../../../shared/constants/index.js";

/**
 * Tạo filter gửi lên backend.
 *
 * Ví dụ:
 * name~*nguyen*,'email~*nguyen*,'phone~*nguyen*
 * role.name:ADMIN
 */
const buildFilterQuery = (keyword, role) => {
  const filters = [];
  const normalizedKeyword = keyword?.trim();

  if (normalizedKeyword) {
    // Tránh dấu phẩy trong từ khóa bị hiểu thành điều kiện filter mới.
    const safeKeyword = normalizedKeyword.replace(/,/g, " ");

    filters.push(`name~*${safeKeyword}*`);
    filters.push(`'email~*${safeKeyword}*`);
  }

  if (role && role !== "ALL") {
    filters.push(`role.name:${role}`);
  }

  return filters.length > 0 ? filters.join(",") : undefined;
};

const UserManagement = () => {
  const {
    users: storeUsers,
    meta,
    loading,
    detailLoading,
    currentUser,
    page,
    pageSize,
    setPage,
    fetchUsers,
    fetchUserById,
    clearCurrentUser,
    createUser,
    updateUser,
    deleteUser,
    uploadAvatar,
  } = useUserStore();

  // Đảm bảo users luôn là mảng, tránh lỗi users.length và users.map.
  const users = Array.isArray(storeUsers) ? storeUsers : [];

  const showToast = useCartStore((state) => state.showToast);

  const [searchInputValue, setSearchInputValue] = useState("");
  const [keyword, setKeyword] = useState("");
  const [selectedRole, setSelectedRole] = useState("ALL");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("CREATE");

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: "",
    title: "",
    message: "",
    pendingData: null,
  });

  const roles = Array.isArray(ROLE_OPTIONS) ? ROLE_OPTIONS : [];

  const filterQuery = useMemo(
    () => buildFilterQuery(keyword, selectedRole),
    [keyword, selectedRole],
  );

  /**
   * Debounce tìm kiếm.
   * Chỉ gửi yêu cầu sau khi người dùng ngừng nhập 500ms.
   */
  useEffect(() => {
    const handler = setTimeout(() => {
      const nextKeyword = searchInputValue.trim();

      if (nextKeyword !== keyword) {
        setKeyword(nextKeyword);
        setPage(1);
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [searchInputValue, keyword, setPage]);

  /**
   * Tải dữ liệu từ backend theo trang và điều kiện lọc.
   * Không lọc users trực tiếp trên frontend nữa.
   */
  useEffect(() => {
    fetchUsers({
      page,
      pageSize,
      filter: filterQuery,
    });
  }, [fetchUsers, page, pageSize, filterQuery]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    const nextKeyword = searchInputValue.trim();

    setPage(1);

    if (nextKeyword !== keyword) {
      setKeyword(nextKeyword);
    } else {
      // Từ khóa không đổi: chủ động tải lại dữ liệu.
      fetchUsers({
        page: 1,
        pageSize,
        filter: buildFilterQuery(nextKeyword, selectedRole),
      });
    }
  };

  const handleRoleChange = (event) => {
    setSelectedRole(event.target.value);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearchInputValue("");
    setKeyword("");
    setSelectedRole("ALL");
    setPage(1);

    fetchUsers({
      page: 1,
      pageSize,
      filter: undefined,
    });
  };

  const handleOpenCreateModal = () => {
    clearCurrentUser();
    setModalType("CREATE");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = async (user) => {
    setModalType("EDIT");
    setIsModalOpen(true);

    try {
      const response = await fetchUserById(user.id);

      if (response?.status !== "SUCCESS") {
        showToast(
          response?.message || "Không thể lấy thông tin chi tiết người dùng.",
          "error",
        );
      }
    } catch (err) {
      console.error("Lỗi lấy chi tiết thành viên:", err);
      showToast("Đã xảy ra lỗi hệ thống khi tải thông tin chi tiết.", "error");
    }
  };

  const handleFormSubmit = (payloadData) => {
    if (modalType === "EDIT") {
      setConfirmModal({
        isOpen: true,
        type: "CONFIRM_UPDATE",
        title: "Xác nhận cập nhật",
        message: `Bạn có chắc chắn muốn lưu các thay đổi cho tài khoản "${payloadData.name}"?`,
        pendingData: payloadData,
      });
    } else {
      executeSaveUser(payloadData);
    }
  };

  const executeSaveUser = async (payloadData) => {
    try {
      if (modalType === "CREATE") {
        const { rawFile, ...userCreateData } = payloadData;

        const response = await createUser(userCreateData);

        if (response?.status !== "SUCCESS") {
          showToast(response?.message || "Đã xảy ra lỗi khi tạo.", "error");
          return;
        }

        const createdUser =
          response.data?.user ?? response.data?.result ?? response.data;

        if (rawFile && createdUser?.id) {
          const uploadRes = await uploadAvatar(createdUser.id, rawFile);

          if (uploadRes?.status !== "SUCCESS") {
            showToast(
              "Tài khoản đã tạo nhưng tải ảnh đại diện thất bại.",
              "warning",
            );
          }
        }

        showToast("Thêm thành viên mới thành công!", "success");

        setIsModalOpen(false);
        closeConfirmModal();
        setPage(1);

        await fetchUsers({
          page: 1,
          pageSize,
          filter: filterQuery,
        });
      } else {
        const response = await updateUser(payloadData);

        if (response?.status === "SUCCESS") {
          showToast("Cập nhật thông tin thành viên thành công!", "success");

          setIsModalOpen(false);
          closeConfirmModal();

          await fetchUsers({
            page,
            pageSize,
            filter: filterQuery,
          });
        } else {
          showToast(
            response?.message || "Đã xảy ra lỗi khi cập nhật.",
            "error",
          );
        }
      }
    } catch (err) {
      console.error("Lỗi khi xử lý lưu thông tin user:", err);
      showToast("Đã xảy ra lỗi hệ thống khi lưu thông tin.", "error");
    }
  };

  const handleCancelForm = () => {
    setConfirmModal({
      isOpen: true,
      type: "CANCEL_FORM",
      title: "Hủy bỏ thao tác?",
      message:
        "Những thông tin bạn vừa nhập hoặc chỉnh sửa sẽ không được lưu. Bạn vẫn muốn thoát chứ?",
      pendingData: null,
    });
  };

  const handleConfirmDelete = (userId, userName) => {
    setConfirmModal({
      isOpen: true,
      type: "CONFIRM_DELETE",
      title: "Xóa tài khoản vĩnh viễn",
      message: `Hành động này không thể hoàn tác. Bạn chắc chắn muốn xóa tài khoản "${userName}"?`,
      pendingData: {
        id: userId,
        name: userName,
      },
    });
  };

  const executeDeleteUser = async () => {
    const { id, name } = confirmModal.pendingData ?? {};

    if (id == null) return;

    try {
      const response = await deleteUser(id);

      if (response?.status === "SUCCESS") {
        showToast(`Đã xóa tài khoản "${name}" thành công!`, "success");

        closeConfirmModal();

        await fetchUsers({
          page,
          pageSize,
          filter: filterQuery,
        });
      } else {
        showToast(response?.message || "Xóa tài khoản thất bại.", "error");
      }
    } catch (err) {
      console.error("Lỗi khi xóa người dùng:", err);
      showToast("Gặp lỗi hệ thống khi thực hiện xóa.", "error");
    }
  };

  const handleConfirmAction = () => {
    switch (confirmModal.type) {
      case "CANCEL_FORM":
        setIsModalOpen(false);
        clearCurrentUser();
        closeConfirmModal();
        break;

      case "CONFIRM_UPDATE":
        executeSaveUser(confirmModal.pendingData);
        break;

      case "CONFIRM_DELETE":
        executeDeleteUser();
        break;

      default:
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

  const renderStatusBadge = (user) => {
    if (user.deleteFlag) {
      return (
        <span className="inline-block text-xs font-bold px-2.5 py-1 rounded-full border text-red-600 bg-red-50 border-red-100">
          Đã xóa
        </span>
      );
    }

    if (user.activeFlag) {
      return (
        <span className="inline-block text-xs font-bold px-2.5 py-1 rounded-full border text-green-600 bg-green-50 border-green-100">
          Hoạt động
        </span>
      );
    }

    return (
      <span className="inline-block text-xs font-bold px-2.5 py-1 rounded-full border text-amber-600 bg-amber-50 border-amber-100">
        Tạm ngưng
      </span>
    );
  };

  const totalPages = Math.max(
    1,
    Number(meta?.pages) ||
      (Number(meta?.total) > 0
        ? Math.ceil(Number(meta.total) / (Number(pageSize) || 10))
        : 1),
  );

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
            <span>Quản lý hệ thống</span>
            <ChevronRight size={12} />
            <span className="text-orange-500">Người dùng</span>
          </div>

          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            DANH SÁCH TÀI KHOẢN
          </h1>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-orange-500 text-white font-bold rounded-2xl shadow-md hover:bg-opacity-90 active:scale-95 transition-all"
        >
          <Plus size={18} />
          Thêm người dùng
        </button>
      </div>

      {/* Bộ lọc */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
            <Search size={18} />
          </span>

          <input
            type="text"
            placeholder="Tìm theo tên, email, số điện thoại..."
            value={searchInputValue}
            onChange={(event) => setSearchInputValue(event.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 text-gray-700"
          />
        </form>

        <div className="flex w-full sm:w-auto gap-2">
          <select
            value={selectedRole}
            onChange={handleRoleChange}
            className="w-full sm:w-52 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 focus:outline-none focus:border-orange-500"
          >
            {roles.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleResetFilters}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50"
          >
            Xóa lọc
          </button>
        </div>
      </div>

      {/* Danh sách người dùng */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex h-[40vh] items-center justify-center">
            <Loading size="large" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead>
                <tr className="bg-gray-50 text-gray-400 text-xs uppercase font-black tracking-wider border-b border-gray-100">
                  <th className="p-4 w-24 text-center">Ảnh</th>
                  <th className="p-4">Họ và tên</th>
                  <th className="p-4">Liên hệ</th>
                  <th className="p-4">Vai trò</th>
                  <th className="p-4 text-center">Trạng thái</th>
                  <th className="p-4 text-center">Ngày tạo</th>
                  <th className="p-4 text-right">Hành động</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-gray-400">
                      <User size={36} className="mx-auto mb-2 text-gray-300" />
                      Không tìm thấy thành viên nào phù hợp yêu cầu.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => {
                    const roleName = String(
                      user?.roleName ?? user?.role?.name ?? "",
                    ).toUpperCase();

                    return (
                      <tr
                        key={user.id}
                        className="hover:bg-gray-50/50 transition-colors group"
                      >
                        <td className="p-4 text-center">
                          <UserAvatar user={user} />
                        </td>

                        <td className="p-4">
                          <div className="font-bold text-gray-800 text-base">
                            {user.name || "—"}
                          </div>
                          <div className="text-xs font-mono text-gray-400">
                            ID: #{user.id}
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="flex items-center gap-1.5 text-gray-700 font-medium">
                            <Mail size={13} className="text-gray-400" />
                            <span>{user.email || "—"}</span>
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {user.phone || "—"}
                          </div>
                        </td>

                        <td className="p-4">
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                            <Shield size={12} className="text-slate-500" />
                            {roleName === "ADMIN"
                              ? "Quản trị viên"
                              : roleName === "STAFF"
                                ? "Nhân viên"
                                : roleName === "MANAGER"
                                  ? "Quản lý"
                                  : "Khách hàng"}
                          </span>
                        </td>

                        <td className="p-4 text-center">
                          {renderStatusBadge(user)}
                        </td>

                        <td className="p-4 text-center text-gray-500 font-medium">
                          {user.createdDate
                            ? formatDate(user.createdDate)
                            : "—"}
                        </td>

                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(user)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl border border-transparent hover:border-blue-200 transition-all"
                              aria-label={`Sửa người dùng ${user.name || user.id}`}
                            >
                              <Edit2 size={16} />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleConfirmDelete(user.id, user.name)
                              }
                              disabled={user.deleteFlag}
                              className={`p-2 rounded-xl border border-transparent transition-all ${
                                user.deleteFlag
                                  ? "text-gray-300 cursor-not-allowed"
                                  : "text-red-500 hover:bg-red-50 hover:border-red-200"
                              }`}
                              aria-label={`Xóa người dùng ${user.name || user.id}`}
                            >
                              <Trash2 size={16} />
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
        )}
      </div>

      {/* Phân trang */}
      {totalPages > 1 && !loading && (
        <div className="flex justify-end mt-4">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* Modal tạo / cập nhật */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCancelForm}
        title={
          modalType === "CREATE"
            ? "Thêm tài khoản người dùng"
            : "Chỉnh sửa tài khoản"
        }
        size="lg"
      >
        {detailLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loading size="medium" />
          </div>
        ) : (
          <UserFormAdmin
            initialData={currentUser}
            onSubmit={handleFormSubmit}
            onClose={handleCancelForm}
            onUploadAvatar={uploadAvatar}
          />
        )}
      </Modal>

      {/* Modal xác nhận */}
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

export default UserManagement;
