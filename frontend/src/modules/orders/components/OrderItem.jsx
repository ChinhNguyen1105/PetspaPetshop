import React, { useState } from "react";
import {
  Calendar,
  MapPin,
  CreditCard,
  Package,
  AlertTriangle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "../../../shared/components/Button.jsx";
import Modal from "../../../shared/components/Modal.jsx";
import { formatPrice } from "../../../shared/utils/formatPrice.js";
import { STATUS_CONFIG } from "../../../shared/constants/index.js";

const OrderItem = ({ order, onCancelOrder }) => {
  const navigate = useNavigate();

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);

  // Chuẩn hóa trạng thái đơn hàng
  const orderStatus = order?.status ? order.status.toUpperCase() : "PENDING";

  const currentStatus = STATUS_CONFIG[orderStatus] || STATUS_CONFIG.PENDING;

  // Thông tin người nhận
  const receiverName = order?.shippingName || order?.userName || "Khách nhận";

  const addressBody = order?.shippingAddressFull || "Chưa có thông tin địa chỉ";

  // Phương thức thanh toán
  const paymentMethod = order?.paymentMethod || "COD";

  // Tổng số sản phẩm
  const totalItemCount =
    order?.totalQuantity ||
    (Array.isArray(order?.orderDetails)
      ? order.orderDetails.reduce(
          (total, item) => total + (Number(item.quantity) || 0),
          0,
        )
      : 0);

  // Ngày tạo đơn
  const renderDate = () => {
    const targetDate = order?.createdDate || order?.createdAt;

    if (!targetDate) return "Hôm nay";

    const parsedDate = new Date(targetDate);

    return Number.isNaN(parsedDate.getTime())
      ? String(targetDate)
      : parsedDate.toLocaleDateString("vi-VN");
  };

  // Tổng tiền đơn hàng
  const totalAmount =
    order?.totalAmount ?? order?.finalAmount ?? order?.totalPrice ?? 0;

  // Xác nhận hủy đơn
  const handleConfirmCancel = async () => {
    try {
      setIsCanceling(true);

      if (onCancelOrder) {
        await onCancelOrder(order.id);
      }

      setIsCancelModalOpen(false);
    } catch (error) {
      console.error("Lỗi khi hủy đơn hàng:", error);
    } finally {
      setIsCanceling(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 transition-all hover:shadow-md text-left">
      {/* Header đơn hàng */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-b-gray-50">
        <div className="space-y-1">
          <p className="text-sm font-black text-blue-900 uppercase tracking-wider">
            {order?.orderCode || `#${order?.id}`}
          </p>

          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400">
            <Calendar size={13} />
            <span>{renderDate()}</span>
          </div>
        </div>

        <span
          className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${currentStatus.className}`}
        >
          {currentStatus.text}
        </span>
      </div>

      {/* Tóm tắt sản phẩm */}
      <div className="py-4 space-y-3">
        <div className="flex items-center justify-between gap-4 text-sm bg-gray-50 border border-gray-100 rounded-2xl p-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-white border border-gray-200 rounded-xl shrink-0 text-gray-400">
              <Package size={20} />
            </div>

            <div className="min-w-0">
              <p className="font-bold text-gray-800 line-clamp-1">
                {order?.orderDetails?.[0]?.productName ||
                  "Kiện hàng sản phẩm thú cưng"}
              </p>

              <p className="text-xs text-gray-500">
                Tổng cộng {totalItemCount} sản phẩm
              </p>
            </div>
          </div>

          <span className="font-bold text-gray-600 font-mono shrink-0">
            x{totalItemCount}
          </span>
        </div>
      </div>

      {/* Địa chỉ và thanh toán */}
      <div className="pt-4 border-t border-gray-50 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-medium text-gray-500">
        <div className="flex items-start gap-1.5">
          <MapPin size={14} className="text-gray-400 shrink-0 mt-0.5" />

          <p className="line-clamp-2">
            <span className="font-bold text-gray-700">{receiverName}</span>
            {addressBody ? ` - ${addressBody}` : ""}
          </p>
        </div>

        <div className="flex items-center gap-1.5 md:justify-end">
          <CreditCard size={14} className="text-gray-400 shrink-0" />

          <span>
            Thanh toán:{" "}
            <strong className="text-gray-700">
              {String(paymentMethod).toUpperCase() === "COD"
                ? "Trực tiếp (COD)"
                : "Chuyển khoản"}
            </strong>
          </span>
        </div>
      </div>

      {/* Tổng tiền và hành động */}
      <div className="mt-5 pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-gray-400 font-medium">Tổng số tiền</p>

          <p className="text-xl font-black text-orange-500">
            {formatPrice(totalAmount)}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          {/* Hủy đơn hàng */}
          {orderStatus === "PENDING" && (
            <button
              type="button"
              onClick={() => setIsCancelModalOpen(true)}
              className="border border-red-200 text-red-500 hover:bg-red-50 rounded-xl py-2 px-4 text-xs font-bold cursor-pointer transition-colors"
            >
              Hủy đơn hàng
            </button>
          )}

          {/* Đánh giá sản phẩm */}
          {orderStatus === "DELIVERED" && (
            <button
              type="button"
              onClick={() => navigate(`/review/create/product/${order?.id}`)}
              className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl py-2 px-4 text-xs font-bold cursor-pointer transition-colors"
            >
              Đánh giá
            </button>
          )}

          {/* Xem chi tiết */}
          <button
            type="button"
            onClick={() => navigate(`/profile/orders/${order?.id}`)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl py-2 px-4 text-xs font-bold cursor-pointer transition-colors"
          >
            Xem chi tiết
          </button>
        </div>
      </div>

      {/* Modal xác nhận hủy đơn */}
      {isCancelModalOpen && (
        <Modal
          isOpen={isCancelModalOpen}
          onClose={() => {
            if (!isCanceling) {
              setIsCancelModalOpen(false);
            }
          }}
          title="Xác nhận hủy đơn mua hàng"
        >
          <div className="text-center p-2">
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={24} />
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Bạn có chắc chắn muốn hủy đơn?
            </h3>

            <p className="text-sm text-gray-500 mb-8 leading-relaxed">
              Hành động này sẽ hủy toàn bộ gói sản phẩm của mã đơn hàng{" "}
              <span className="font-bold text-gray-800">
                {order?.orderCode || order?.id}
              </span>
              .
            </p>

            <div className="flex gap-4">
              <Button
                variant="outline"
                className="flex-1 rounded-xl py-3 font-bold text-gray-500"
                onClick={() => setIsCancelModalOpen(false)}
                disabled={isCanceling}
              >
                Đóng lại
              </Button>

              <Button
                className="flex-1 rounded-xl py-3 bg-red-500 hover:bg-red-600 text-white font-bold border-none"
                onClick={handleConfirmCancel}
                disabled={isCanceling}
              >
                {isCanceling ? "ĐANG HỦY..." : "XÁC NHẬN HỦY ĐƠN"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default OrderItem;
