import React, { useState, useEffect, useRef } from "react";
import {
  X,
  CheckCircle2,
  Loader2,
  QrCode,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";

import VNPayService from "../../services/VNpayService";

const PaymentModal = ({ isOpen, onClose, orderData, onPaymentSuccess }) => {
  const [paymentStatus, setPaymentStatus] = useState("PENDING");
  const [timeLeft, setTimeLeft] = useState(300);
  const [isInitializing, setIsInitializing] = useState(true);
  const [vnpayUrl, setVnpayUrl] = useState("");

  const pollingRef = useRef(null);

  const actualOrderData = orderData?.body?.data || orderData;

  const amount = actualOrderData?.amount || actualOrderData?.totalAmount || 0;

  const orderId = actualOrderData?.id;

  /*
  |--------------------------------------------------------------------------
  | DEBUG - THÔNG TIN COMPONENT
  |--------------------------------------------------------------------------
  */
  console.log("========== PAYMENT MODAL RENDER ==========");
  console.log("isOpen:", isOpen);
  console.log("orderData:", orderData);
  console.log("orderId:", orderId);
  console.log("amount:", amount);
  console.log("vnpayUrl:", vnpayUrl);
  console.log("isInitializing:", isInitializing);
  console.log("paymentStatus:", paymentStatus);
  console.log("==========================================");

  /*
  |--------------------------------------------------------------------------
  | QR CODE
  |--------------------------------------------------------------------------
  */
  const qrImageUrl = vnpayUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
        vnpayUrl,
      )}`
    : "";

  /*
  |--------------------------------------------------------------------------
  | EFFECT 1: KHỞI TẠO THANH TOÁN VNPAY
  |--------------------------------------------------------------------------
  */
  useEffect(() => {
    console.log("========== VNPAY EFFECT 1 ==========");
    console.log("isOpen:", isOpen);
    console.log("orderData:", orderData);
    console.log("orderId:", orderId);

    if (!isOpen || !orderId) {
      console.log("❌ VNPAY EFFECT BỊ RETURN");

      if (!isOpen) {
        console.log("→ Lý do: isOpen = false");
      }

      if (!orderId) {
        console.log("→ Lý do: orderId không tồn tại");
      }

      return;
    }

    console.log("✅ VNPAY EFFECT ĐƯỢC CHẠY");
    console.log("→ orderId =", orderId);

    const initPayment = async () => {
      try {
        console.log("========== VNPAY INIT START ==========");
        console.log("→ Đang gọi VNPayService.createVNPayPayment()");
        console.log("→ orderId:", orderId);

        setIsInitializing(true);

        const resData = await VNPayService.createVNPayPayment(orderId);

        console.log("========== VNPAY RESPONSE ==========");
        console.log("VNPAY resData:", resData);
        console.log("VNPAY type:", typeof resData);
        console.log("====================================");

        if (resData) {
          console.log("✅ Có dữ liệu VNPAY");

          setVnpayUrl(resData);
          setIsInitializing(false);

          console.log("→ setVnpayUrl() đã được gọi");
          console.log("→ QR URL dự kiến sẽ được tạo ở render tiếp theo");
        } else {
          console.error("❌ VNPAY trả về dữ liệu rỗng");

          throw new Error("Không nhận được cấu trúc phản hồi từ Service.");
        }
      } catch (error) {
        console.error("========== VNPAY INIT ERROR ==========");
        console.error("Error:", error);
        console.error("Response:", error?.response);
        console.error("Response data:", error?.response?.data);
        console.error("Message:", error?.message);
        console.error("======================================");

        alert("Không thể kết nối đến hệ thống VNPAY. Vui lòng làm mới lại!");

        onClose();
      }
    };

    initPayment();

    setTimeLeft(300);
    setPaymentStatus("PENDING");

    return () => {
      console.log("🧹 VNPAY EFFECT 1 CLEANUP");
    };
  }, [isOpen, orderId]);

  /*
  |--------------------------------------------------------------------------
  | EFFECT 2: COUNTDOWN
  |--------------------------------------------------------------------------
  */
  useEffect(() => {
    console.log("========== COUNTDOWN EFFECT ==========");
    console.log({
      isOpen,
      paymentStatus,
      isInitializing,
      timeLeft,
    });

    if (!isOpen || paymentStatus === "SUCCESS" || isInitializing) {
      console.log("→ Countdown chưa chạy");
      return;
    }

    if (timeLeft <= 0) {
      console.log("⏰ Hết thời gian thanh toán");

      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }

      onClose();
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, isOpen, paymentStatus, isInitializing]);

  /*
  |--------------------------------------------------------------------------
  | EFFECT 3: POLLING TRẠNG THÁI PAYMENT
  |--------------------------------------------------------------------------
  */
  useEffect(() => {
    console.log("========== POLLING EFFECT ==========");
    console.log({
      isOpen,
      orderId,
      isInitializing,
    });

    if (!isOpen || !orderId || isInitializing) {
      console.log("→ Polling chưa chạy");
      return;
    }

    console.log("✅ Bắt đầu polling payment status");
    console.log("→ orderId:", orderId);

    const checkStatus = async () => {
      try {
        console.log("🔄 POLLING: kiểm tra payment status...");
        console.log("→ orderId:", orderId);

        const data = await VNPayService.checkPaymentStatus(orderId);

        console.log("========== PAYMENT STATUS ==========");
        console.log("data:", data);
        console.log("orderStatus:", data?.orderStatus);
        console.log("paymentStatus:", data?.paymentStatus);
        console.log("transactionId:", data?.transactionId);
        console.log("====================================");

        if (
          data?.orderStatus === "PROCESSING" ||
          data?.paymentStatus === "SUCCESS"
        ) {
          console.log("✅ PAYMENT SUCCESS / PROCESSING");

          setPaymentStatus("PROCESSING");

          if (pollingRef.current) {
            clearInterval(pollingRef.current);
          }

          setTimeout(() => {
            console.log("🎉 Chuyển sang SUCCESS");

            setPaymentStatus("SUCCESS");

            if (onPaymentSuccess) {
              onPaymentSuccess();
            }
          }, 1500);
        } else if (
          data?.paymentStatus === "FAILED" ||
          data?.orderStatus === "CANCELLED"
        ) {
          console.log("❌ PAYMENT FAILED / CANCELLED");

          if (pollingRef.current) {
            clearInterval(pollingRef.current);
          }

          alert("Giao dịch VNPAY thất bại hoặc bị hủy bỏ từ hệ thống.");

          onClose();
        } else {
          console.log("⏳ PAYMENT VẪN ĐANG PENDING");
        }
      } catch (error) {
        console.error("========== POLLING ERROR ==========");
        console.error("Error:", error);
        console.error("Response:", error?.response);
        console.error("Response data:", error?.response?.data);
        console.error("Message:", error?.message);
        console.error("===================================");
      }
    };

    pollingRef.current = setInterval(checkStatus, 3000);

    return () => {
      console.log("🧹 POLLING CLEANUP");

      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [isOpen, orderId, isInitializing, onPaymentSuccess]);

  /*
  |--------------------------------------------------------------------------
  | FORMAT TIME
  |--------------------------------------------------------------------------
  */
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  /*
  |--------------------------------------------------------------------------
  | DEBUG QR
  |--------------------------------------------------------------------------
  */
  console.log("========== QR DEBUG ==========");
  console.log("vnpayUrl:", vnpayUrl);
  console.log("qrImageUrl:", qrImageUrl);
  console.log("==============================");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative">
        {/* Modal Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-2 text-blue-600 font-bold">
            <QrCode size={20} />
            <span>Thanh toán an toàn qua VNPAY</span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-200 text-gray-400 border-none bg-transparent cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Đang khởi tạo */}
        {isInitializing ? (
          <div className="p-12 flex flex-col items-center justify-center text-gray-500 text-sm">
            <Loader2 className="animate-spin text-blue-600 mb-3" size={40} />
            Đang kết nối cổng thanh toán VNPAY...
          </div>
        ) : paymentStatus !== "SUCCESS" ? (
          /* Hiển thị QR */
          <div className="p-6 flex flex-col items-center">
            <div className="mb-4 bg-amber-50 text-amber-700 px-4 py-1.5 rounded-full text-xs font-bold border border-amber-200 animate-pulse">
              Thời gian giữ cổng thanh toán: {formatTime(timeLeft)}
            </div>

            <div className="relative p-3 bg-white border-2 border-gray-100 rounded-2xl shadow-inner mb-4">
              {qrImageUrl ? (
                <img
                  src={qrImageUrl}
                  alt="VNPAY QR Gateway"
                  className={`w-52 h-52 object-contain transition-opacity ${
                    paymentStatus === "PROCESSING"
                      ? "opacity-20"
                      : "opacity-100"
                  }`}
                  onLoad={() => {
                    console.log("✅ QR IMAGE LOAD SUCCESS");
                  }}
                  onError={(event) => {
                    console.error("❌ QR IMAGE LOAD ERROR");
                    console.error("QR URL:", qrImageUrl);
                    console.error("Image element:", event.currentTarget);
                  }}
                />
              ) : (
                <div className="w-52 h-52 flex items-center justify-center text-sm text-red-500 text-center">
                  Không có VNPAY URL để tạo QR
                </div>
              )}

              {paymentStatus === "PROCESSING" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-blue-600 font-bold text-sm bg-white/50">
                  <Loader2
                    className="animate-spin text-orange-500 mb-2"
                    size={32}
                  />
                  Hệ thống đang kiểm tra xử lý kho hàng...
                </div>
              )}
            </div>

            <p className="text-xs text-gray-400 text-center mb-5 max-w-xs leading-relaxed">
              Mở ứng dụng Ngân hàng (Banking) hoặc Ví VNPAY, chọn tính năng{" "}
              <strong className="text-gray-600">Quét mã QR</strong> để thanh
              toán.
            </p>

            <div className="w-full space-y-3">
              <a
                href={vnpayUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-500/10 transition-colors no-underline"
              >
                <ExternalLink size={16} />
                Mở ví / Cổng VNPAY trực tiếp
              </a>

              <div className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">
                    Tổng tiền đơn hàng #{orderId}:
                  </span>

                  <strong className="text-sm font-bold text-orange-500">
                    {amount.toLocaleString("vi-VN")} đ
                  </strong>
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-1.5 text-[11px] text-gray-400 font-medium bg-emerald-50/50 text-emerald-700 px-3 py-1 rounded-lg">
              <ShieldCheck size={14} />
              Bảo mật theo tiêu chuẩn quốc tế mã hóa VNPAY
            </div>
          </div>
        ) : (
          /* Thanh toán thành công */
          <div className="p-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-500 mb-4 animate-bounce">
              <CheckCircle2 size={40} />
            </div>

            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Thanh toán thành công!
            </h3>

            <p className="text-sm text-gray-500 max-w-xs mb-6 leading-relaxed">
              Hệ thống đã xác nhận hóa đơn của bạn. Kho hàng đã tự động cập nhật
              trừ sản phẩm thành công.
            </p>

            <button
              onClick={onClose}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm transition-colors border-none cursor-pointer"
            >
              Đóng & Xem trạng thái đơn
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
