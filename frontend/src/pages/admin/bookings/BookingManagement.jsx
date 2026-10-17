import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Calendar,
  Trash2,
  CheckCircle,
  Clock,
  ChevronRight,
  User,
  Edit2,
  Hash,
} from "lucide-react";

import Loading from "../../../components/common/Loading";
import { formatPrice } from "../../../utils/formatPrice";
import Modal from "../../../components/common/Modal";
import ConfirmModal from "../../../components/common/ConfirmModal";

import { useCartStore } from "../../../store/cartStore";
import { useBookingStore } from "../../../store/bookingStore";

import BookingFormAdmin from "../../../components/form/BookingFormAdmin";
import BookingFormAdminUpdate from "../../../components/form/BookingFormAdminUpdate";

import Pagination from "../../../components/common/Pagination";
import { BOOKING_STATUS_LIST } from "../../../constants";

const BookingManagement = () => {
  // =========================================================
  // BOOKING STORE
  // =========================================================
  const bookings = useBookingStore((state) => state.bookings) || [];
  const meta = useBookingStore((state) => state.meta);
  const loading = useBookingStore((state) => state.loading);
  const errorStore = useBookingStore((state) => state.error);

  const fetchBookings = useBookingStore((state) => state.fetchBookings);
  const createBooking = useBookingStore((state) => state.createBooking);

  const updateBookingStatus = useBookingStore(
    (state) => state.updateBookingStatus || state.updateBooking,
  );

  const cancelBooking = useBookingStore((state) => state.cancelBooking);

  // =========================================================
  // GLOBAL TOAST
  // =========================================================
  const showToast = useCartStore((state) => state.showToast);

  // =========================================================
  // LOCAL STATE
  // =========================================================
  const [searchId, setSearchId] = useState("");
  const [searchName, setSearchName] = useState("");
  const [searchPetName, setSearchPetName] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  const [debouncedFilters, setDebouncedFilters] = useState({
    id: "",
    name: "",
    petName: "",
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("CREATE");
  const [selectedBooking, setSelectedBooking] = useState(null);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: "",
    title: "",
    message: "",
    pendingData: null,
  });

  const statusFilters = BOOKING_STATUS_LIST;

  // =========================================================
  // DEBOUNCE SEARCH
  // =========================================================
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFilters({
        id: searchId.trim(),
        name: searchName.trim(),
        petName: searchPetName.trim(),
      });
    }, 500);

    return () => clearTimeout(handler);
  }, [searchId, searchName, searchPetName]);

  // =========================================================
  // RESET PAGE WHEN FILTERS CHANGE
  // =========================================================
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedFilters, selectedStatus]);

  // =========================================================
  // FETCH BOOKINGS FROM API
  // =========================================================
  useEffect(() => {
    const filterConditions = [];

    // Filter by booking ID
    if (debouncedFilters.id && !isNaN(debouncedFilters.id)) {
      filterConditions.push(`id:${debouncedFilters.id}`);
    }

    // Filter by customer name
    if (debouncedFilters.name) {
      filterConditions.push(`userName~*${debouncedFilters.name}*`);
    }

    // Filter by pet name
    if (debouncedFilters.petName) {
      filterConditions.push(`petName~*${debouncedFilters.petName}*`);
    }

    // Filter by booking status
    if (selectedStatus !== "ALL") {
      filterConditions.push(`status:${selectedStatus}`);
    }

    const filterParam =
      filterConditions.length > 0 ? filterConditions.join(",") : undefined;

    fetchBookings({
      page: currentPage,
      filter: filterParam,
    });
  }, [currentPage, debouncedFilters, selectedStatus, fetchBookings]);

  // =========================================================
  // MODAL HANDLERS
  // =========================================================
  const handleOpenCreateModal = () => {
    setModalType("CREATE");
    setSelectedBooking(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (booking) => {
    setModalType("EDIT");
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (formOutputData) => {
    setConfirmModal({
      isOpen: true,
      type: "CONFIRM_SAVE_FORM",
      title:
        modalType === "CREATE"
          ? "Xác nhận thêm lịch đặt"
          : "Xác nhận cập nhật trạng thái",
      message:
        modalType === "CREATE"
          ? "Bạn có chắc chắn muốn tạo lịch hẹn dịch vụ mới này không?"
          : `Bạn có chắc chắn muốn thay đổi trạng thái cho lịch hẹn #${selectedBooking?.id} không?`,
      pendingData: formOutputData,
    });
  };

  // =========================================================
  // RELOAD CURRENT QUERY
  // =========================================================
  const reloadBookings = async () => {
    const filterConditions = [];

    if (debouncedFilters.id && !isNaN(debouncedFilters.id)) {
      filterConditions.push(`id:${debouncedFilters.id}`);
    }

    if (debouncedFilters.name) {
      filterConditions.push(`userName~*${debouncedFilters.name}*`);
    }

    if (debouncedFilters.petName) {
      filterConditions.push(`petName~*${debouncedFilters.petName}*`);
    }

    if (selectedStatus !== "ALL") {
      filterConditions.push(`status:${selectedStatus}`);
    }

    await fetchBookings({
      page: currentPage,
      filter:
        filterConditions.length > 0 ? filterConditions.join(",") : undefined,
    });
  };

  // =========================================================
  // CREATE / UPDATE BOOKING
  // =========================================================
  const executeSaveBooking = async () => {
    const formData = confirmModal.pendingData;

    if (!formData) return;

    try {
      let result;

      if (modalType === "CREATE") {
        result = await createBooking(formData);
      } else {
        result = await updateBookingStatus(selectedBooking.id, formData);
      }

      if (result) {
        showToast(
          modalType === "CREATE"
            ? "Tạo mới lịch hẹn đặt dịch vụ thành công!"
            : `Cập nhật lịch hẹn #${selectedBooking.id} thành công!`,
          "success",
        );

        setIsModalOpen(false);
        closeConfirmModal();

        if (modalType === "CREATE") {
          setSearchId("");
          setSearchName("");
          setSearchPetName("");
          setSelectedStatus("ALL");
          setCurrentPage(1);

          // Effect sẽ gọi lại API khi bộ lọc thay đổi.
          // Nếu các bộ lọc đã ở trạng thái mặc định, tải lại trực tiếp.
          if (
            !debouncedFilters.id &&
            !debouncedFilters.name &&
            !debouncedFilters.petName &&
            selectedStatus === "ALL" &&
            currentPage === 1
          ) {
            await fetchBookings({ page: 1 });
          }
        } else {
          await reloadBookings();
        }
      } else {
        showToast(
          "Xử lý dữ liệu thất bại. Vui lòng kiểm tra lại thông tin.",
          "error",
        );
      }
    } catch (error) {
      console.error("Lỗi khi xử lý lưu dữ liệu form:", error);
      showToast("Đã xảy ra lỗi, không thể lưu dữ liệu.", "error");
    }
  };

  // =========================================================
  // QUICK STATUS CHANGE
  // =========================================================
  const handleStatusChangeClick = (bookingId, userName, targetStatus) => {
    setConfirmModal({
      isOpen: true,
      type: "CONFIRM_STATUS_UPDATE",
      title: "Xác nhận cập nhật trạng thái",
      message: `Bạn có chắc chắn muốn chuyển trạng thái lịch hẹn của "${userName}" sang [${targetStatus}] không?`,
      pendingData: {
        id: bookingId,
        status: targetStatus,
        customerName: userName,
      },
    });
  };

  const executeUpdateStatus = async () => {
    const { id, status, customerName } = confirmModal.pendingData || {};

    if (id == null) return;

    try {
      const result = await updateBookingStatus(id, { status });

      if (result) {
        showToast(
          `Cập nhật trạng thái lịch hẹn của ${customerName} thành công!`,
          "success",
        );

        closeConfirmModal();
        await reloadBookings();
      } else {
        showToast("Gặp sự cố khi cập nhật trạng thái.", "error");
      }
    } catch (error) {
      console.error("Gặp lỗi khi cập nhật trạng thái:", error);
      showToast("Đã xảy ra lỗi hệ thống khi cập nhật trạng thái.", "error");
    }
  };

  // =========================================================
  // CANCEL BOOKING
  // =========================================================
  const handleConfirmCancelBooking = (bookingId, userName) => {
    setConfirmModal({
      isOpen: true,
      type: "CONFIRM_CANCEL_BOOKING",
      title: "Hủy lịch hẹn vĩnh viễn",
      message: `Hành động này sẽ hủy lịch đặt dịch vụ của khách hàng "${userName}". Bạn có chắc chắn muốn tiếp tục?`,
      pendingData: {
        id: bookingId,
        name: userName,
      },
    });
  };

  const executeCancelBooking = async () => {
    const { id, name } = confirmModal.pendingData || {};

    if (id == null) return;

    try {
      const result = await cancelBooking(id);

      const isSuccess =
        result?.status === "SUCCESS" || result?.success === true;

      if (isSuccess) {
        showToast(
          `Đã hủy lịch hẹn của khách hàng "${name}" thành công!`,
          "success",
        );

        closeConfirmModal();
        await reloadBookings();
      } else {
        showToast(
          result?.message || "Xảy ra lỗi khi tiến hành hủy lịch.",
          "error",
        );
      }
    } catch (error) {
      console.error("Lỗi khi hủy lịch:", error);
      showToast("Đã xảy ra lỗi khi tiến hành hủy lịch.", "error");
    }
  };

  // =========================================================
  // CONFIRM MODAL
  // =========================================================
  const closeConfirmModal = () => {
    setConfirmModal({
      isOpen: false,
      type: "",
      title: "",
      message: "",
      pendingData: null,
    });
  };

  const handleCancelForm = () => {
    setConfirmModal({
      isOpen: true,
      type: "CANCEL_FORM",
      title: "Hủy bỏ thao tác?",
      message:
        "Những thay đổi bạn vừa nhập trên Form sẽ không được lưu. Bạn vẫn muốn thoát chứ?",
      pendingData: null,
    });
  };

  const handleConfirmAction = () => {
    switch (confirmModal.type) {
      case "CANCEL_FORM":
        setIsModalOpen(false);
        closeConfirmModal();
        break;

      case "CONFIRM_SAVE_FORM":
        executeSaveBooking();
        break;

      case "CONFIRM_STATUS_UPDATE":
        executeUpdateStatus();
        break;

      case "CONFIRM_CANCEL_BOOKING":
        executeCancelBooking();
        break;

      default:
        closeConfirmModal();
    }
  };

  // =========================================================
  // STATUS BADGE
  // =========================================================
  const renderStatusBadge = (status) => {
    const statusMap = {
      CONFIRMED: ["Đã xác nhận", "text-emerald-600 bg-emerald-50"],
      PENDING: ["Chờ xử lý", "text-amber-500 bg-amber-50"],
      COMPLETED: ["Đã hoàn thành", "text-blue-600 bg-blue-50"],
      CANCELLED: ["Đã hủy", "text-red-500 bg-red-50"],
    };

    const [label, className] = statusMap[status] ?? [
      status,
      "text-gray-500 bg-gray-100",
    ];

    return (
      <span
        className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg ${className}`}
      >
        {label}
      </span>
    );
  };

  // =========================================================
  // ERROR STATE
  // =========================================================
  if (errorStore) {
    return <div className="text-center p-6 text-red-500">{errorStore}</div>;
  }

  // =========================================================
  // RENDER
  // =========================================================
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
            <span>Quản lý Shop</span>
            <ChevronRight size={12} />
            <span className="text-orange-500">Đặt lịch dịch vụ</span>
          </div>

          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            DANH SÁCH ĐẶT LỊCH
          </h1>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-orange-500 text-white font-bold rounded-2xl shadow-md hover:bg-opacity-90 active:scale-95 transition-all"
        >
          <Plus size={18} />
          Đặt lịch mới
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
        {/* SEARCH BY BOOKING ID */}
        <div className="relative w-full">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
            <Hash size={16} />
          </span>

          <input
            type="text"
            inputMode="numeric"
            placeholder="Tìm theo mã lịch..."
            value={searchId}
            onChange={(event) => setSearchId(event.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 text-gray-700"
          />
        </div>

        {/* SEARCH BY CUSTOMER */}
        <div className="relative w-full">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
            <Search size={16} />
          </span>

          <input
            type="text"
            placeholder="Tìm theo tên khách hàng..."
            value={searchName}
            onChange={(event) => setSearchName(event.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 text-gray-700"
          />
        </div>

        {/* SEARCH BY PET */}
        <div className="relative w-full">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
            <Search size={16} />
          </span>

          <input
            type="text"
            placeholder="Tìm theo tên thú cưng..."
            value={searchPetName}
            onChange={(event) => setSearchPetName(event.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 text-gray-700"
          />
        </div>

        {/* FILTER BY STATUS */}
        <select
          value={selectedStatus}
          onChange={(event) => setSelectedStatus(event.target.value)}
          className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 focus:outline-none focus:border-orange-500"
        >
          <option value="ALL">Tất cả trạng thái</option>

          {statusFilters.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </div>

      {/* BOOKING TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex h-60 items-center justify-center">
            <Loading size="large" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead>
                <tr className="bg-gray-50 text-gray-400 text-xs uppercase font-black tracking-wider border-b border-gray-100">
                  <th className="p-4 w-16 text-center">Mã</th>
                  <th className="p-4">Khách hàng &amp; Thú cưng</th>
                  <th className="p-4">Chi tiết dịch vụ</th>
                  <th className="p-4">Thời gian đặt</th>
                  <th className="p-4">Tổng tiền</th>
                  <th className="p-4 text-center">Trạng thái</th>
                  <th className="p-4 text-right">Hành động</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-12 text-center text-gray-400">
                      <Calendar
                        size={36}
                        className="mx-auto mb-2 text-gray-300"
                      />
                      Không tìm thấy lịch đặt nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  bookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="hover:bg-gray-50/50 transition-colors group"
                    >
                      {/* BOOKING ID */}
                      <td className="p-4 text-center font-bold text-blue-600 font-mono text-xs">
                        #{booking.id}
                      </td>

                      {/* CUSTOMER & PET */}
                      <td className="p-4">
                        <div className="font-bold text-gray-800 text-base flex items-center gap-1.5">
                          <User size={14} className="text-gray-400" />
                          {booking.userName || "—"}
                        </div>

                        <div className="text-xs text-gray-500 mt-0.5">
                          Thú cưng:{" "}
                          <span className="font-bold text-orange-500">
                            {booking.petName || "—"}
                          </span>
                        </div>
                      </td>

                      {/* SERVICES */}
                      <td className="p-4">
                        <div className="space-y-1">
                          {booking.bookingDetails?.length > 0 ? (
                            booking.bookingDetails.map((detail) => (
                              <div
                                key={detail.id}
                                className="text-xs bg-gray-50 border px-2 py-0.5 rounded-md inline-block mr-1 text-gray-700 font-medium"
                              >
                                {detail.serviceName}
                              </div>
                            ))
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </div>
                      </td>

                      {/* BOOKING TIME */}
                      <td className="p-4">
                        <div className="font-bold text-gray-800 flex items-center gap-1">
                          <Clock size={14} className="text-gray-400" />
                          {booking.startTime || "--:--"} -{" "}
                          {booking.endTime || "--:--"}
                        </div>

                        <div className="text-xs font-semibold text-gray-400 mt-0.5">
                          {booking.bookingDate || "—"}
                        </div>
                      </td>

                      {/* PRICE */}
                      <td className="p-4 font-black text-gray-900 text-base">
                        {formatPrice(booking.actualPrice ?? 0)}
                      </td>

                      {/* STATUS */}
                      <td className="p-4 text-center">
                        {renderStatusBadge(booking.status)}
                      </td>

                      {/* ACTIONS */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(booking)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl border border-transparent hover:border-blue-200 transition-all"
                            title="Chỉnh sửa chi tiết"
                          >
                            <Edit2 size={16} />
                          </button>

                          {booking.status === "PENDING" && (
                            <button
                              onClick={() =>
                                handleStatusChangeClick(
                                  booking.id,
                                  booking.userName,
                                  "CONFIRMED",
                                )
                              }
                              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl border border-transparent hover:border-emerald-200 transition-all"
                              title="Xác nhận lịch hẹn"
                            >
                              <CheckCircle size={16} />
                            </button>
                          )}

                          {booking.status !== "CANCELLED" && (
                            <button
                              onClick={() =>
                                handleConfirmCancelBooking(
                                  booking.id,
                                  booking.userName,
                                )
                              }
                              className="p-2 text-red-500 hover:bg-red-50 rounded-xl border border-transparent hover:border-red-200 transition-all"
                              title="Hủy lịch đặt"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION FROM API META */}
        {meta && meta.pages > 1 && (
          <div className="p-4 border-t border-gray-100 flex justify-center bg-gray-50/50">
            <Pagination
              currentPage={currentPage}
              totalPages={meta.pages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* BOOKING FORM MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCancelForm}
        title={
          modalType === "CREATE"
            ? "Tạo lượt đặt lịch hẹn dịch vụ Spa"
            : `Chỉnh sửa & Xem thông tin chi tiết lịch hẹn #${selectedBooking?.id}`
        }
        size="lg"
      >
        {modalType === "CREATE" ? (
          <BookingFormAdmin
            initialData={null}
            onSubmit={handleFormSubmit}
            onClose={handleCancelForm}
          />
        ) : (
          <BookingFormAdminUpdate
            initialData={selectedBooking}
            onSubmit={handleFormSubmit}
            onClose={handleCancelForm}
          />
        )}
      </Modal>

      {/* CONFIRM MODAL */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        onConfirm={handleConfirmAction}
        title={confirmModal.title}
        message={confirmModal.message}
        type={
          confirmModal.type === "CONFIRM_CANCEL_BOOKING" ? "danger" : "warning"
        }
      />
    </div>
  );
};

export default BookingManagement;
