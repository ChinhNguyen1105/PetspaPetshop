import React, { useEffect, useState } from "react";
import { Image as ImageIcon } from "lucide-react";

import { formatPrice } from "../../../../shared/utils/formatPrice.js";
import { useProductImageStore } from "../../../products/store/productImageStore.js";

import {
  ORDER_STATUS_TRANSITIONS,
  validateOrderAdminData,
} from "../../validators/orderAdminValidator.js";

const ORDER_STATUS_LABELS = {
  PENDING: "Chờ xử lý",
  PROCESSING: "Đang xử lý",
  SHIPPED: "Đang giao hàng",
  DELIVERED: "Đã giao hàng",
  CANCELLED: "Đã hủy",
};

const PAYMENT_METHOD_LABELS = {
  COD: "Thanh toán khi nhận hàng (COD)",
  VNPAY: "Thanh toán qua VNPay",
  MOMO: "Thanh toán qua MoMo",
  BANK_TRANSFER: "Chuyển khoản ngân hàng",
};

const inputClass =
  "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 disabled:opacity-70 disabled:cursor-not-allowed";

const getInitialFormData = (data) => ({
  id: data?.id ?? "",
  createdDate: data?.createdDate ?? "",
  customer_name: data?.shippingName ?? "",
  shipping_phone: data?.shippingPhone ?? "",
  shipping_address: data?.shippingAddressFull ?? "",
  payment_method: data?.paymentMethod ?? "COD",
  payment_status: data?.paymentStatus ?? "PENDING",
  status: data?.status ?? "PENDING",
  items: Array.isArray(data?.orderDetails)
    ? data.orderDetails.map((item) => ({ ...item }))
    : [],
  total_amount: Number(data?.totalAmount) || 0,
});

const OrderFormAdmin = ({ initialData, onSubmit, onClose, mode }) => {
  const { downloadImage } = useProductImageStore();

  const [imageUrls, setImageUrls] = useState({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(() =>
    getInitialFormData(initialData),
  );

  const isViewMode = mode === "VIEW";
  const isEditMode = mode === "EDIT";

  const formatISODateToInput = (value) => {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value).substring(0, 16);
    }

    const timezoneOffset = date.getTimezoneOffset() * 60000;

    return new Date(date.getTime() - timezoneOffset)
      .toISOString()
      .substring(0, 16);
  };

  // Đồng bộ dữ liệu khi mở form hoặc chuyển sang đơn hàng khác.
  useEffect(() => {
    setFormData(getInitialFormData(initialData));
    setFormError("");
  }, [initialData, mode]);

  // Tải ảnh của các sản phẩm trong đơn hàng.
  useEffect(() => {
    let cancelled = false;
    const createdUrls = [];

    const loadImages = async () => {
      const imageNames = [
        ...new Set(
          formData.items
            .map((item) => item.productImage)
            .filter(Boolean),
        ),
      ];

      const results = await Promise.all(
        imageNames.map(async (imageName) => {
          try {
            const blob = await downloadImage(imageName);

            if (!(blob instanceof Blob) || blob.size === 0) {
              return [imageName, null];
            }

            const objectUrl = URL.createObjectURL(blob);
            createdUrls.push(objectUrl);

            return [imageName, objectUrl];
          } catch (error) {
            console.error(
              `Không thể tải ảnh sản phẩm ${imageName}:`,
              error,
            );

            return [imageName, null];
          }
        }),
      );

      if (cancelled) {
        createdUrls.forEach((url) => URL.revokeObjectURL(url));
        return;
      }

      setImageUrls((previous) => {
        const next = {};

        results.forEach(([imageName, objectUrl]) => {
          if (objectUrl) {
            next[imageName] = objectUrl;
          }
        });

        // Giữ URL của những ảnh đã tải trước đó nếu chúng vẫn còn sử dụng.
        Object.entries(previous).forEach(([imageName, objectUrl]) => {
          if (imageNames.includes(imageName) && !next[imageName]) {
            next[imageName] = objectUrl;
          }
        });

        return next;
      });
    };

    loadImages();

    return () => {
      cancelled = true;
      createdUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [formData.items, downloadImage]);

  const updateStatus = (value) => {
    setFormError("");

    setFormData((previous) => ({
      ...previous,
      status: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isViewMode || !isEditMode || isSubmitting) {
      return;
    }

    setFormError("");

    const validation = validateOrderAdminData(formData, {
      mode: "EDIT",
      currentOrder: initialData,
    });

    if (!validation.isValid) {
      setFormError(validation.message);
      return;
    }

    if (initialData?.id == null) {
      setFormError("Không tìm thấy mã đơn hàng cần cập nhật.");
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        id: initialData.id,
        status: formData.status,
      });
    } catch (error) {
      setFormError(error?.message || "Không thể gửi yêu cầu cập nhật.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const allowedStatuses = isEditMode
    ? [
        formData.status,
        ...(ORDER_STATUS_TRANSITIONS[formData.status] || []),
      ].filter(
        (status, index, statuses) => statuses.indexOf(status) === index,
      )
    : [formData.status];

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 max-h-[75vh] overflow-y-auto pr-2 no-scrollbar"
    >
      {formError && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {formError}
        </div>
      )}

      {isEditMode && (
        <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          Bạn chỉ có thể cập nhật trạng thái đơn hàng. Thông tin khách hàng,
          sản phẩm, thanh toán và tổng tiền được giữ nguyên theo dữ liệu hiện
          tại.
        </div>
      )}

      {/* Thông tin khách hàng */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
            Mã đơn hàng
          </label>
          <input
            type="text"
            readOnly
            value={formData.id}
            className={`${inputClass} text-gray-500`}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
            Tên khách hàng
          </label>
          <input
            type="text"
            readOnly
            value={formData.customer_name}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
            Số điện thoại
          </label>
          <input
            type="text"
            readOnly
            value={formData.shipping_phone}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
            Ngày tạo đơn
          </label>
          <input
            type="datetime-local"
            readOnly
            value={formatISODateToInput(formData.createdDate)}
            className={`${inputClass} text-gray-500`}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
            Địa chỉ giao hàng
          </label>
          <input
            type="text"
            readOnly
            value={formData.shipping_address}
            className={inputClass}
          />
        </div>
      </div>

      {/* Phương thức thanh toán */}
      <div className="bg-orange-50/60 p-4 rounded-2xl border border-orange-100">
        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
          Phương thức thanh toán
        </label>

        <input
          type="text"
          readOnly
          value={
            PAYMENT_METHOD_LABELS[formData.payment_method] ||
            formData.payment_method ||
            "Chưa xác định"
          }
          className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700"
        />
      </div>

      {/* Trạng thái đơn hàng và thanh toán */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
            Trạng thái thanh toán
          </label>

          <input
            type="text"
            readOnly
            value={formData.payment_status}
            className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
            Trạng thái đơn hàng
          </label>

          <select
            disabled={!isEditMode || isSubmitting}
            value={formData.status}
            onChange={(event) => updateStatus(event.target.value)}
            className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 focus:outline-none focus:border-orange-500 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {allowedStatuses.map((status) => (
              <option key={status} value={status}>
                {ORDER_STATUS_LABELS[status] || status} ({status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Danh sách sản phẩm */}
      <div className="space-y-3">
        <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider">
          Danh sách sản phẩm
        </h3>

        <div className="space-y-2">
          {formData.items.map((item, index) => (
            <div
              key={item.id || `${item.productId || "product"}-${index}`}
              className="flex flex-col sm:flex-row gap-3 bg-white border border-gray-100 p-3 rounded-xl shadow-sm items-center"
            >
              <div className="w-16 h-16 shrink-0 rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden">
                {imageUrls[item.productImage] ? (
                  <img
                    src={imageUrls[item.productImage]}
                    alt={item.productName || "Ảnh sản phẩm"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon size={22} className="text-gray-300" />
                )}
              </div>

              <div className="w-full sm:flex-1">
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                  Tên sản phẩm
                </label>
                <input
                  type="text"
                  readOnly
                  value={item.productName || ""}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm disabled:opacity-70"
                />
              </div>

              <div className="w-full sm:w-20">
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                  Số lượng
                </label>
                <input
                  type="number"
                  readOnly
                  value={item.quantity ?? ""}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm text-center"
                />
              </div>

              <div className="w-full sm:w-28">
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                  Đơn giá
                </label>
                <input
                  type="text"
                  readOnly
                  value={formatPrice(Number(item.unitPrice) || 0)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm font-bold text-right"
                />
              </div>

              <div className="w-full sm:w-28 text-right">
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                  Thành tiền
                </label>
                <div className="font-black text-slate-800 text-sm py-2">
                  {formatPrice(
                    (Number(item.unitPrice) || 0) *
                      (Number(item.quantity) || 0),
                  )}
                </div>
              </div>
            </div>
          ))}

          {formData.items.length === 0 && (
            <div className="text-center p-6 text-gray-400 border border-dashed rounded-xl">
              Chưa có sản phẩm nào trong đơn hàng.
            </div>
          )}
        </div>
      </div>

      {/* Tổng tiền */}
      <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
        <span className="text-sm font-bold text-gray-500 uppercase">
          Tổng tiền thanh toán:
        </span>
        <span className="text-2xl font-black text-orange-500">
          {formatPrice(formData.total_amount)}
        </span>
      </div>

      {/* Nút thao tác */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="px-5 py-2.5 border border-gray-200 text-gray-600 font-bold rounded-xl text-sm hover:bg-gray-50 transition-all disabled:opacity-50"
        >
          {isViewMode ? "Đóng" : "Hủy bỏ"}
        </button>

        {isEditMode && (
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-orange-500 text-white font-bold rounded-xl text-sm hover:bg-opacity-90 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Đang xử lý..." : "Cập nhật trạng thái"}
          </button>
        )}
      </div>
    </form>
  );
};

export default OrderFormAdmin;
