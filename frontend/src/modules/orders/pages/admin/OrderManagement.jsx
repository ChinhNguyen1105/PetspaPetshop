import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Edit2,
  ChevronRight,
  Eye,
  User,
  MapPin,
  Package,
  Phone,
  Hash,
} from "lucide-react";

import Loading from "../../../../shared/components/Loading.jsx";
import { formatPrice } from "../../../../shared/utils/formatPrice.js";
import { formatDate } from "../../../../shared/utils/formatDate.js";
import Modal from "../../../../shared/components/Modal.jsx";
import ConfirmModal from "../../../../shared/components/ConfirmModal.jsx";
import { useCartStore } from "../../../cart/store/cartStore.js";
import { useOrderStore } from "../../store/orderStore.js";
import OrderFormAdmin from "../../components/admin/OrderFormAdmin.jsx";

import {
  STATUS_FILTERS,
  STATUS_CONFIG,
  PAYMENT_STATUS_CONFIG,
} from "../../../../shared/constants/index.js";

import Pagination from "../../../../shared/components/Pagination.jsx";

const OrderManagement = () => {
  const orders = useOrderStore((state) => state.orders) || [];
  const meta = useOrderStore((state) => state.meta);
  const loading = useOrderStore((state) => state.loading);
  const errorStore = useOrderStore((state) => state.error);
  const fetchOrders = useOrderStore((state) => state.fetchOrders);
  const updateOrderStatus = useOrderStore(
    (state) => state.updateOrderStatus,
  );

  const showToast = useCartStore((state) => state.showToast);

  const [searchId, setSearchId] = useState("");
  const [searchName, setSearchName] = useState("");
  const [searchPhone, setSearchPhone] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  const [debouncedFilters, setDebouncedFilters] = useState({
    id: "",
    name: "",
    phone: "",
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("VIEW");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: "",
    title: "",
    message: "",
    pendingData: null,
  });

  // Debounce bộ lọc tìm kiếm.
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFilters({
        id: searchId.trim(),
        name: searchName.trim(),
        phone: searchPhone.trim(),
      });
    }, 500);

    return () => clearTimeout(handler);
  }, [searchId, searchName, searchPhone]);

  // Tạo bộ lọc và fetch danh sách đơn hàng.
  const loadOrders = useCallback(() => {
    const filterConditions = ["orderType:PRODUCT"];

    if (selectedStatus !== "ALL") {
      filterConditions.push(`status:${selectedStatus}`);
    }

    if (debouncedFilters.id && !Number.isNaN(Number(debouncedFilters.id))) {
      filterConditions.push(`id:${debouncedFilters.id}`);
    }

    if (debouncedFilters.name) {
      filterConditions.push(`shippingName~${debouncedFilters.name}`);
    }

    if (debouncedFilters.phone) {
      filterConditions.push(`shippingPhone~${debouncedFilters.phone}`);
    }

    return fetchOrders({
      page: currentPage,
      pageSize: meta?.pageSize || 10,
      filter: filterConditions.join(","),
    });
  }, [
    currentPage,
    debouncedFilters,
    selectedStatus,
    fetchOrders,
    meta?.pageSize,
  ]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Reset trang khi bộ lọc thay đổi.
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedFilters, selectedStatus]);

  const handleOpenEditModal = (order) => {
    setModalType("EDIT");
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleOpenViewModal = (order) => {
    setModalType("VIEW");
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (formOutputData) => {
    if (modalType !== "EDIT") {
      return;
    }

    setConfirmModal({
      isOpen: true,
      type: "CONFIRM_UPDATE",
      title: "Cập nhật trạng thái đơn hàng",
      message: `Bạn có chắc chắn muốn cập nhật trạng thái đơn hàng #${formOutputData.id}?`,
      pendingData: formOutputData,
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

  const executeUpdateOrder = async () => {
    if (isSaving) {
      return;
    }

    const formOutputData = confirmModal.pendingData;

    if (
      !formOutputData ||
      formOutputData.id == null ||
      formOutputData.status == null
    ) {
      showToast("Dữ liệu cập nhật đơn hàng không hợp lệ.", "error");
      return;
    }

    setIsSaving(true);

    try {
      const result = await updateOrderStatus(
        formOutputData.id,
        formOutputData.status,
      );

      // Hỗ trợ store trả về { success: false } khi API thất bại.
      if (result?.success === false) {
        showToast(
          result.message || "Không thể cập nhật trạng thái đơn hàng.",
          "error",
        );
        return;
      }

      // Chỉ đóng modal sau khi API cập nhật thành công.
      setIsModalOpen(false);
      closeConfirmModal();
      setSelectedOrder(null);

      showToast(
        `Cập nhật trạng thái đơn hàng #${formOutputData.id} thành công.`,
        "success",
      );

      // Fetch lại dữ liệu thật từ BE, không tự sửa dữ liệu trong store.
      await loadOrders();
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái đơn hàng:", error);

      showToast(
        error?.message || "Gặp sự cố khi cập nhật đơn hàng.",
        "error",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelForm = () => {
    if (modalType === "VIEW") {
      setIsModalOpen(false);
      setSelectedOrder(null);
      return;
    }

    setConfirmModal({
      isOpen: true,
      type: "CANCEL_FORM",
      title: "Hủy thao tác?",
      message: "Những thay đổi chưa lưu sẽ bị mất. Bạn có muốn thoát không?",
      pendingData: null,
    });
  };

  const handleConfirmAction = () => {
    switch (confirmModal.type) {
      case "CANCEL_FORM":
        setIsModalOpen(false);
        setSelectedOrder(null);
        closeConfirmModal();
        break;

      case "CONFIRM_UPDATE":
        executeUpdateOrder();
        break;

      default:
        closeConfirmModal();
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loading size="large" />
      </div>
    );
  }

  if (errorStore && orders.length === 0) {
    return (
      <div className="p-6 text-center text-red-500">
        {errorStore}
        <div className="mt-4">
          <button
            type="button"
            onClick={loadOrders}
            className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-bold text-white hover:bg-orange-600"
          >
            Thử tải lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-6 bg-gray-50 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
            <span>Quản lý Shop</span>
            <ChevronRight size={12} />
            <span className="text-orange-500">Đơn hàng</span>
          </div>

          <h1 className="text-3xl font-black tracking-tight text-slate-800">
            QUẢN LÝ ĐƠN HÀNG
          </h1>
        </div>

        <button
          type="button"
          onClick={loadOrders}
          disabled={loading}
          className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
        >
          {loading ? "Đang tải..." : "Làm mới dữ liệu"}
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-5">
        <div className="relative w-full">
          <Hash
            size={16}
            className="absolute inset-y-0 left-3.5 my-auto text-gray-400"
          />
          <input
            type="text"
            placeholder="Mã đơn hàng (Số)..."
            value={searchId}
            onChange={(event) => setSearchId(event.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-4 text-sm text-gray-700 focus:border-orange-500 focus:outline-none"
          />
        </div>

        <div className="relative w-full">
          <User
            size={16}
            className="absolute inset-y-0 left-3.5 my-auto text-gray-400"
          />
          <input
            type="text"
            placeholder="Tên khách hàng..."
            value={searchName}
            onChange={(event) => setSearchName(event.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-4 text-sm text-gray-700 focus:border-orange-500 focus:outline-none"
          />
        </div>

        <div className="relative w-full">
          <Phone
            size={16}
            className="absolute inset-y-0 left-3.5 my-auto text-gray-400"
          />
          <input
            type="text"
            placeholder="Số điện thoại..."
            value={searchPhone}
            onChange={(event) => setSearchPhone(event.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-4 text-sm text-gray-700 focus:border-orange-500 focus:outline-none"
          />
        </div>

        <div className="w-full lg:col-span-2">
          <select
            value={selectedStatus}
            onChange={(event) => setSelectedStatus(event.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-semibold text-gray-600 focus:border-orange-500 focus:outline-none"
          >
            {STATUS_FILTERS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Order table */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {loading && orders.length > 0 && (
          <div className="border-b border-blue-100 bg-blue-50 px-4 py-2 text-xs text-blue-700">
            Đang đồng bộ dữ liệu đơn hàng...
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-xs font-black uppercase tracking-wider text-gray-400">
                <th className="w-44 p-4">Mã đơn hàng</th>
                <th className="p-4">Khách hàng</th>
                <th className="p-4">Chi tiết sản phẩm mua</th>
                <th className="p-4">Tổng tiền</th>
                <th className="p-4 text-center">Trạng thái đơn</th>
                <th className="p-4 text-right">Hành động</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-gray-400">
                    <Package
                      size={36}
                      className="mx-auto mb-2 text-gray-300"
                    />
                    Không tìm thấy dữ liệu hóa đơn nào trùng khớp.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const statusInfo = STATUS_CONFIG[order.status];
                  const paymentInfo =
                    PAYMENT_STATUS_CONFIG[order.paymentStatus];

                  return (
                    <tr
                      key={order.id}
                      className="group transition-colors hover:bg-gray-50/50"
                    >
                      <td className="p-4">
                        <div className="mb-0.5 font-mono text-xs text-gray-400">
                          {formatDate(order.createdDate)}
                        </div>
                        <div className="font-mono text-sm font-bold tracking-tight text-blue-600">
                          #{order.id}
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-sm font-bold text-gray-800">
                          <User size={14} className="text-gray-400" />
                          {order.shippingName}
                        </div>

                        <div className="mt-0.5 flex max-w-xs items-center gap-1 truncate text-xs text-gray-400">
                          <MapPin size={12} className="shrink-0" />
                          {order.shippingAddressFull}
                        </div>

                        {order.shippingPhone && (
                          <div className="mt-0.5 flex items-center gap-1 text-xs text-gray-400">
                            <Phone size={12} className="shrink-0" />
                            {order.shippingPhone}
                          </div>
                        )}
                      </td>

                      <td className="max-w-sm p-4">
                        <div className="space-y-0.5">
                          {order.orderDetails?.map((item, index) => (
                            <div
                              key={item.id || index}
                              className="truncate text-xs text-gray-600"
                            >
                              •{" "}
                              <span className="font-semibold text-slate-700">
                                {item.productName}
                              </span>{" "}
                              x{item.quantity}
                            </div>
                          ))}
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="text-base font-black text-gray-900">
                          {formatPrice(order.totalAmount)}
                        </div>

                        <div
                          className={`mt-1 w-max rounded border px-2 py-0.5 text-[10px] font-bold ${
                            paymentInfo
                              ? paymentInfo.color
                              : "border-gray-200 bg-gray-50 text-gray-600"
                          }`}
                        >
                          {paymentInfo
                            ? paymentInfo.label
                            : order.paymentStatus}
                        </div>
                      </td>

                      <td className="p-4 text-center">
                        <span
                          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${
                            statusInfo
                              ? statusInfo.className
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {statusInfo ? statusInfo.text : order.status}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenViewModal(order)}
                            className="rounded-xl border border-transparent p-2 text-gray-500 transition-all hover:bg-gray-100"
                            title="Xem chi tiết"
                          >
                            <Eye size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(order)}
                            className="rounded-xl border border-transparent p-2 text-blue-600 transition-all hover:border-blue-200 hover:bg-blue-50"
                            title="Cập nhật trạng thái"
                          >
                            <Edit2 size={16} />
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

        {meta && meta.pages > 1 && (
          <div className="border-t border-gray-100 bg-gray-50/50 p-4">
            <Pagination
              currentPage={currentPage}
              totalPages={meta.pages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* Order detail/update modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCancelForm}
        title={
          modalType === "EDIT"
            ? "Cập nhật trạng thái đơn hàng"
            : "Chi tiết đơn hàng"
        }
        size="lg"
      >
        <OrderFormAdmin
          initialData={selectedOrder}
          onSubmit={handleFormSubmit}
          onClose={handleCancelForm}
          mode={modalType}
        />
      </Modal>

      {/* Confirmation modal */}
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

export default OrderManagement;
