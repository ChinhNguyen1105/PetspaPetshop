import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  MapPin,
  Calendar,
  Clock,
  User,
  Scissors,
  ArrowLeft,
  AlertTriangle,
  Heart,
  FileText,
  CheckCircle2,
} from "lucide-react";

// Zustand Store
import { useBookingStore } from "../../store/bookingStore.js";

// UI Components & Utils
import { Badge } from "../../../../shared/components/Badge.jsx";
import { Button } from "../../../../shared/components/Button.jsx";
import Loading from "../../../../shared/components/Loading.jsx";
import Modal from "../../../../shared/components/Modal.jsx";
import { formatDate } from "../../../../shared/utils/formatDate.js";
import { formatPrice } from "../../../../shared/utils/formatPrice.js";

// Component hiển thị thông tin dạng key-value
const InfoItem = React.memo(
  ({ icon, label, value, valueColor = "text-gray-800" }) => (
    <div className="bg-gray-50/60 p-3.5 rounded-2xl border border-gray-100">
      <p className="text-gray-400 text-[11px] uppercase font-bold tracking-wider mb-1 flex items-center gap-1.5">
        {icon} {label}
      </p>
      <p className={`font-bold text-sm ${valueColor}`}>{value || "N/A"}</p>
    </div>
  ),
);

InfoItem.displayName = "InfoItem";

// Chuẩn hóa trạng thái thanh toán từ API
const getPaymentStatusInfo = (status) => {
  const normalizedStatus = String(status ?? "")
    .trim()
    .toUpperCase();

  switch (normalizedStatus) {
    case "SUCCESS":
    case "COMPLETED":
    case "PAID":
      return {
        label: "Đã thanh toán",
        variant: "success",
      };

    case "PENDING":
      return {
        label: "Chờ thanh toán",
        variant: "warning",
      };

    case "FAILED":
    case "ERROR":
      return {
        label: "Thanh toán thất bại",
        variant: "danger",
      };

    case "CANCELLED":
    case "CANCELED":
      return {
        label: "Đã hủy thanh toán",
        variant: "danger",
      };

    case "REFUNDED":
      return {
        label: "Đã hoàn tiền",
        variant: "danger",
      };

    default:
      return {
        label: "Chưa xác định",
        variant: "warning",
      };
  }
};

const getBookingStatusInfo = (status) => {
  switch (
    String(status ?? "")
      .trim()
      .toUpperCase()
  ) {
    case "CONFIRMED":
      return {
        label: "Đã xác nhận",
        variant: "success",
      };

    case "CANCELLED":
      return {
        label: "Đã hủy",
        variant: "danger",
      };

    case "COMPLETED":
      return {
        label: "Đã hoàn thành",
        variant: "success",
      };

    case "PENDING":
      return {
        label: "Chờ xử lý",
        variant: "warning",
      };

    default:
      return {
        label: "Chưa xác định",
        variant: "warning",
      };
  }
};

const BookingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    currentBooking,
    loading,
    fetchBookingById,
    cancelBooking,
    setCurrentBooking,
  } = useBookingStore();

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  // Đồng bộ dữ liệu lịch hẹn với Zustand Store
  useEffect(() => {
    if (id) {
      fetchBookingById(id);
    }

    return () => {
      setCurrentBooking(null);
    };
  }, [id, fetchBookingById, setCurrentBooking]);

  // Hủy lịch hẹn
  const handleConfirmCancel = async () => {
    const bookingIdToCancel = currentBooking?.id || id;

    if (!bookingIdToCancel) {
      alert("Không tìm thấy mã đặt lịch.");
      return;
    }

    const response = await cancelBooking(bookingIdToCancel);

    if (response) {
      setIsCancelModalOpen(false);
      alert("Đã hủy lịch hẹn thành công.");
    } else {
      alert("Hủy lịch thất bại hoặc đã xảy ra lỗi từ hệ thống.");
    }
  };

  // Liên hệ hỗ trợ
  const handleContactSupport = () => {
    const zaloNumber = "0912345678";
    const message = encodeURIComponent(
      `Xin chào, tôi cần hỗ trợ về mã đặt lịch Spa #${currentBooking?.id || id}`,
    );

    window.open(
      `https://zalo.me/${zaloNumber}?text=${message}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  if (loading && !currentBooking) {
    return <Loading fullScreen />;
  }

  if (!currentBooking || !currentBooking.id) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 pt-20">
        <p className="text-gray-500 font-medium mb-4">
          Không tìm thấy thông tin đặt lịch chi tiết.
        </p>

        <Button
          onClick={() =>
            navigate("/profile", { state: { activeTab: "bookings" } })
          }
        >
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  // Dữ liệu trả về từ Booking API
  const {
    id: bookingId,
    userName: customerName,
    status: currentStatus,
    paymentStatus,
    bookingDate,
    startTime,
    endTime,
    petName,
    createdDate,
    actualPrice: finalAmount,
    bookingDetails = [],
    note,
  } = currentBooking;

  const bookingStatusInfo = getBookingStatusInfo(currentStatus);
  const paymentStatusInfo = getPaymentStatusInfo(paymentStatus);

  // Định dạng khung giờ
  const timeDisplay =
    startTime && endTime
      ? `${startTime.substring(0, 5)} - ${endTime.substring(0, 5)}`
      : "N/A";

  // Tổng thời gian dịch vụ
  const totalDurationMinutes = bookingDetails.reduce(
    (sum, item) => sum + (Number(item.serviceDuration) || 0),
    0,
  );

  const totalDuration = totalDurationMinutes
    ? `${totalDurationMinutes} phút`
    : "N/A";

  // Tổng tiền dịch vụ
  const subTotalAmount = bookingDetails.reduce(
    (sum, item) => sum + (Number(item.servicePrice) || 0),
    0,
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-10 pb-20 text-left">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Nút quay lại */}
        <button
          onClick={() =>
            navigate("/profile", { state: { activeTab: "bookings" } })
          }
          className="flex items-center text-gray-500 hover:text-pet-blue mb-6 font-bold text-sm transition-colors cursor-pointer"
        >
          <ArrowLeft size={18} className="mr-2" />
          Quay lại danh sách lịch hẹn
        </button>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Header Card */}
          <div className="bg-pet-blue p-8 text-white">
            <div className="flex justify-between items-center gap-4">
              <div>
                <p className="text-blue-200 text-xs font-bold tracking-widest uppercase">
                  MÃ ĐẶT LỊCH #{bookingId}
                </p>

                <h1 className="text-2xl font-bold mt-1">
                  Chi Tiết Lịch Hẹn Spa
                </h1>

                <p className="text-blue-100 text-xs mt-1 opacity-90">
                  Khách hàng: {customerName || "N/A"}
                </p>
              </div>

              <div className="flex flex-col items-end gap-2 shrink-0">
                {/* Trạng thái lịch hẹn */}
                <Badge variant={bookingStatusInfo.variant}>
                  {bookingStatusInfo.label}
                </Badge>

                {/* Trạng thái thanh toán lấy từ API */}
                <Badge variant={paymentStatusInfo.variant}>
                  {paymentStatusInfo.label}
                </Badge>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-8 space-y-6">
            {/* Khối 1: Thời gian & Nhân sự */}
            <div className="grid grid-cols-2 gap-4">
              <InfoItem
                icon={<Calendar size={15} />}
                label="Ngày hẹn"
                value={bookingDate ? formatDate(bookingDate) : ""}
              />

              <InfoItem
                icon={<Clock size={15} />}
                label="Khung giờ"
                value={timeDisplay}
              />

              <InfoItem
                icon={<Clock size={15} />}
                label="Tổng thời gian"
                value={totalDuration}
              />

              <InfoItem
                icon={<User size={15} />}
                label="Chuyên viên (Groomer)"
                value="Hệ thống tự xếp"
                valueColor="text-blue-600"
              />
            </div>

            {/* Khối 2: Thông tin thú cưng */}
            <div className="bg-orange-50/40 border border-orange-100/70 rounded-2xl p-4 flex items-start gap-3.5">
              <div className="p-2.5 bg-orange-100 text-pet-orange rounded-xl mt-0.5">
                <Heart size={20} className="fill-current" />
              </div>

              <div className="grid grid-cols-2 flex-1 gap-2">
                <div>
                  <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
                    Thú cưng
                  </p>

                  <p className="font-bold text-gray-800 text-base">
                    {petName || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
                    ID thú cưng
                  </p>

                  <p className="font-medium text-gray-700 text-sm mt-0.5">
                    #{currentBooking.petId || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Khối 3: Danh sách dịch vụ */}
            <div className="border border-gray-100 rounded-2xl p-5 bg-white space-y-4">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 border-b pb-3">
                <Scissors size={16} className="text-pet-blue" />
                Danh sách dịch vụ đăng ký
              </h3>

              <div className="divide-y divide-gray-50">
                {bookingDetails.length > 0 ? (
                  bookingDetails.map((detail, index) => (
                    <div
                      key={detail.id || index}
                      className="py-3 flex justify-between items-center first:pt-0 last:pb-0 gap-4"
                    >
                      <div>
                        <p className="font-bold text-gray-800 text-sm">
                          {detail.serviceName || "Dịch vụ"}
                        </p>

                        <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                          <Clock size={12} />
                          Thời gian thực hiện: {detail.serviceDuration ??
                            0}{" "}
                          phút
                        </p>
                      </div>

                      <span className="font-semibold text-gray-700 text-sm shrink-0">
                        {formatPrice(detail.servicePrice || 0)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="py-3 text-sm text-gray-400 text-center">
                    Chưa có thông tin dịch vụ.
                  </p>
                )}
              </div>
            </div>

            {/* Khối 4: Ghi chú đặc biệt */}
            {note && (
              <div className="bg-red-50/50 border border-red-100 rounded-2xl p-4 flex items-start gap-3">
                <FileText
                  size={18}
                  className="text-red-500 mt-0.5 flex-shrink-0"
                />

                <div>
                  <p className="text-[11px] text-red-500 font-bold uppercase tracking-wider">
                    Lưu ý đặc biệt từ chủ nuôi
                  </p>

                  <p className="text-sm text-gray-700 mt-1 italic font-medium">
                    "{note}"
                  </p>
                </div>
              </div>
            )}

            {/* Khối 5: Địa điểm & Tổng kết hóa đơn */}
            <div className="bg-gray-50 rounded-2xl p-5 space-y-3.5 border border-gray-100">
              <div className="text-xs flex items-start">
                <MapPin
                  size={16}
                  className="mr-2 text-gray-400 flex-shrink-0 mt-0.5"
                />

                <div>
                  <span className="font-bold text-gray-800">Địa chỉ Spa: </span>

                  <span className="text-gray-600 font-medium">
                    Số 123 Lạch Tray, Ngô Quyền, Hải Phòng
                  </span>
                </div>
              </div>

              <div className="text-xs flex items-center border-t pt-3 border-gray-200/60">
                <CheckCircle2
                  size={16}
                  className="mr-2 text-gray-400 flex-shrink-0"
                />

                <span className="font-bold text-gray-800">
                  Thời gian tạo đơn đặt:{" "}
                </span>

                <span className="text-gray-600 font-medium ml-1">
                  {createdDate
                    ? new Date(createdDate).toLocaleString("vi-VN")
                    : "N/A"}
                </span>
              </div>

              {/* Chi tiết hóa đơn */}
              <div className="border-t pt-3 border-gray-200/60 space-y-2 text-xs">
                <div className="flex justify-between text-gray-600 font-medium">
                  <span>Tổng tiền dịch vụ:</span>
                  <span>{formatPrice(subTotalAmount)}</span>
                </div>

                <div className="border-t pt-3.5 border-dashed border-gray-200 flex justify-between items-center text-sm font-bold">
                  <span className="text-gray-800">
                    Tổng chi phí thanh toán:
                  </span>

                  <span className="text-2xl text-pet-orange">
                    {formatPrice(finalAmount || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Action */}
          {currentStatus === "PENDING" && (
            <div className="p-6 bg-gray-50 border-t flex gap-4">
              <Button
                variant="outline"
                className="flex-1 text-red-500 border-red-200 hover:bg-red-50/50 rounded-2xl font-bold"
                onClick={() => setIsCancelModalOpen(true)}
              >
                Hủy lịch đặt
              </Button>

              <Button
                className="flex-1 rounded-2xl font-bold"
                onClick={handleContactSupport}
              >
                Liên hệ hỗ trợ
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Modal xác nhận hủy lịch */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Xác nhận hủy đặt lịch"
      >
        <div className="text-center p-2">
          <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={24} />
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Bạn có chắc chắn muốn hủy?
          </h3>

          <p className="text-sm text-gray-500 mb-8 leading-relaxed">
            Hủy bỏ toàn bộ lịch dịch vụ dành cho bé{" "}
            <span className="font-bold text-gray-800">
              {petName || "thú cưng"}
            </span>
            . Không thể hoàn tác sau khi xác nhận.
          </p>

          <div className="flex gap-4">
            <Button
              variant="outline"
              className="flex-1 rounded-xl !py-3 font-bold text-gray-500"
              onClick={() => setIsCancelModalOpen(false)}
              disabled={loading}
            >
              Đóng lại
            </Button>

            <Button
              className="flex-1 rounded-xl !py-3 bg-red-500 hover:bg-red-600 text-white font-bold border-none shadow-md shadow-red-500/10"
              onClick={handleConfirmCancel}
              disabled={loading}
            >
              {loading ? "ĐANG HỦY..." : "XÁC NHẬN HỦY"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BookingDetail;
