import React, { useState, useEffect } from "react";
import { Plus, X, Image as ImageIcon } from "lucide-react";
import { formatPrice } from "../../../../shared/utils/formatPrice.js";
import { useProductStore } from "../../../products/store/productStore.js";
import { useProductImageStore } from "../../../products/store/productImageStore.js";

const OrderFormAdmin = ({ initialData, onSubmit, onClose, mode }) => {
  const { products: availableProducts, fetchProducts } = useProductStore();
  const { downloadImage } = useProductImageStore();

  const [imageUrls, setImageUrls] = useState({});

  const formatISODateToInput = (isoString) => {
    if (!isoString) return "";
    return isoString.substring(0, 16);
  };

  const [formData, setFormData] = useState({
    id: initialData?.id || "",
    createdDate: initialData?.createdDate || "",
    customer_name: initialData?.shippingName || "",
    shipping_phone: initialData?.shippingPhone || "",
    shipping_address: initialData?.shippingAddressFull || "",
    payment_method: initialData?.paymentMethod || "COD",
    payment_status: initialData?.paymentStatus || "PENDING",
    status: initialData?.status || "PENDING",
    items: initialData?.orderDetails || [],
    total_amount: Number(initialData?.totalAmount) || 0,
  });

  // Chỉ cho phép cập nhật trạng thái thanh toán
  // với đơn COD đang giao hoặc đã giao thành công.
  const canEditPaymentStatus =
    formData.payment_method === "COD" &&
    ["SHIPPED", "DELIVERED"].includes(formData.status);

  // Tải danh sách sản phẩm từ store.
  useEffect(() => {
    if (mode !== "VIEW") {
      fetchProducts();
    }
  }, [mode, fetchProducts]);

  // Tải ảnh sản phẩm thông qua ProductImageStore.
  useEffect(() => {
    let cancelled = false;
    const createdUrls = [];

    const loadImages = async () => {
      const uniqueImages = [
        ...new Set(
          formData.items.map((item) => item.productImage).filter(Boolean),
        ),
      ];

      const results = await Promise.all(
        uniqueImages.map(async (imageName) => {
          try {
            const blob = await downloadImage(imageName);

            if (!(blob instanceof Blob) || blob.size === 0) {
              return [imageName, null];
            }

            const objectUrl = URL.createObjectURL(blob);
            createdUrls.push(objectUrl);

            return [imageName, objectUrl];
          } catch (error) {
            console.error(`Không thể tải ảnh sản phẩm ${imageName}:`, error);

            return [imageName, null];
          }
        }),
      );

      if (!cancelled) {
        setImageUrls((prev) => {
          const next = { ...prev };

          results.forEach(([imageName, objectUrl]) => {
            next[imageName] = objectUrl;
          });

          return next;
        });
      }
    };

    loadImages();

    return () => {
      cancelled = true;
      createdUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [formData.items, downloadImage]);

  // Tính tổng tiền từ số lượng và đơn giá.
  useEffect(() => {
    const total = formData.items.reduce((sum, item) => {
      const unitPrice = Number(item.unitPrice) || 0;
      const quantity = Number(item.quantity) || 0;

      return sum + unitPrice * quantity;
    }, 0);

    setFormData((prev) => {
      if (prev.total_amount === total) {
        return prev;
      }

      return {
        ...prev,
        total_amount: total,
      };
    });
  }, [formData.items]);

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    const numericValue = Number(value) || 0;

    updatedItems[index] = {
      ...updatedItems[index],
      [field]:
        field === "quantity" || field === "unitPrice" ? numericValue : value,
    };

    updatedItems[index].totalAmount =
      (Number(updatedItems[index].quantity) || 0) *
      (Number(updatedItems[index].unitPrice) || 0);

    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
    }));
  };

  const handleProductNameChange = (index, value) => {
    const updatedItems = [...formData.items];

    const found = availableProducts.find(
      (product) => product.name?.toLowerCase() === value.trim().toLowerCase(),
    );

    if (found) {
      updatedItems[index] = {
        ...updatedItems[index],
        productId: found.id,
        productName: found.name,
        productImage: found.image || found.productImage || "",
        unitPrice: Number(found.price) || 0,
      };
    } else {
      updatedItems[index] = {
        ...updatedItems[index],
        productName: value,
      };
    }

    updatedItems[index].totalAmount =
      (Number(updatedItems[index].quantity) || 0) *
      (Number(updatedItems[index].unitPrice) || 0);

    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
    }));
  };

  const addEmptyItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: Date.now(),
          productId: "",
          productImage: "",
          productName: "",
          quantity: 1,
          unitPrice: 0,
          totalAmount: 0,
        },
      ],
    }));
  };

  const removeItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handlePaymentStatusChange = (value) => {
    if (mode === "VIEW" || !canEditPaymentStatus) {
      return;
    }

    // Chỉ cho phép hai trạng thái hợp lệ đối với COD.
    if (!["PENDING", "SUCCESS"].includes(value)) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      payment_status: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.customer_name ||
      !formData.shipping_address ||
      formData.items.length === 0
    ) {
      alert("Vui lòng điền đầy đủ thông tin khách hàng và ít nhất 1 sản phẩm!");
      return;
    }

    onSubmit({
      ...formData,
      paymentMethod: formData.payment_method,
      paymentStatus: formData.payment_status,
      shippingName: formData.customer_name,
      shippingPhone: formData.shipping_phone,
      shippingAddressFull: formData.shipping_address,
      totalAmount: formData.total_amount,
    });
  };

  const paymentMethodLabels = {
    COD: "Thanh toán khi nhận hàng (COD)",
    VNPAY: "Thanh toán qua VNPay",
    MOMO: "Thanh toán qua MoMo",
    BANK_TRANSFER: "Chuyển khoản ngân hàng",
  };

  const paymentStatusLabels = {
    PENDING: "Chờ thanh toán (PENDING)",
    SUCCESS: "Đã thanh toán (SUCCESS)",
    FAILED: "Thanh toán thất bại (FAILED)",
    REFUNDED: "Đã hoàn tiền (REFUNDED)",
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 max-h-[75vh] overflow-y-auto pr-2 no-scrollbar"
    >
      {/* Thông tin khách hàng */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
            Tên khách hàng
          </label>
          <input
            type="text"
            required
            disabled={mode === "VIEW"}
            value={formData.customer_name}
            onChange={(e) =>
              setFormData({
                ...formData,
                customer_name: e.target.value,
              })
            }
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 disabled:opacity-70"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
            Số điện thoại
          </label>
          <input
            type="text"
            required
            disabled={mode === "VIEW"}
            value={formData.shipping_phone}
            onChange={(e) =>
              setFormData({
                ...formData,
                shipping_phone: e.target.value,
              })
            }
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 disabled:opacity-70"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
            Ngày tạo đơn
          </label>
          <input
            type="datetime-local"
            disabled
            value={formatISODateToInput(formData.createdDate)}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none disabled:opacity-70 text-gray-500"
          />
        </div>
      </div>

      {/* Địa chỉ giao hàng */}
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
          Địa chỉ giao hàng
        </label>
        <input
          type="text"
          required
          disabled={mode === "VIEW"}
          value={formData.shipping_address}
          onChange={(e) =>
            setFormData({
              ...formData,
              shipping_address: e.target.value,
            })
          }
          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 disabled:opacity-70"
        />
      </div>

      {/* Phương thức thanh toán: chỉ xem */}
      <div className="bg-orange-50/60 p-4 rounded-2xl border border-orange-100">
        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
          Phương thức thanh toán
        </label>

        <input
          type="text"
          readOnly
          value={
            paymentMethodLabels[formData.payment_method] ||
            formData.payment_method ||
            "Chưa xác định"
          }
          className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 cursor-default"
        />
      </div>

      {/* Trạng thái thanh toán và trạng thái đơn hàng */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
            Trạng thái thanh toán
          </label>

          {canEditPaymentStatus && mode !== "VIEW" ? (
            <select
              value={formData.payment_status}
              onChange={(e) => handlePaymentStatusChange(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 focus:outline-none focus:border-orange-500"
            >
              <option value="PENDING">Chờ thanh toán (PENDING)</option>
              <option value="SUCCESS">Đã thanh toán (SUCCESS)</option>
            </select>
          ) : (
            <input
              type="text"
              readOnly
              value={
                paymentStatusLabels[formData.payment_status] ||
                formData.payment_status ||
                "Chưa xác định"
              }
              className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 cursor-default"
            />
          )}

          {!canEditPaymentStatus && mode !== "VIEW" && (
            <p className="text-xs text-gray-400 mt-2">
              Chỉ có thể cập nhật thanh toán COD khi đơn đang giao hoặc đã giao
              thành công.
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
            Trạng thái đơn hàng
          </label>

          <select
            disabled={mode === "VIEW"}
            value={formData.status}
            onChange={(e) =>
              setFormData({
                ...formData,
                status: e.target.value,
              })
            }
            className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 focus:outline-none focus:border-orange-500 disabled:opacity-70"
          >
            <option value="PENDING">Chờ xử lý (PENDING)</option>
            <option value="PROCESSING">Đang xử lý (PROCESSING)</option>
            <option value="SHIPPED">Đang giao hàng (SHIPPED)</option>
            <option value="DELIVERED">Đã hoàn thành (DELIVERED)</option>
            <option value="CANCELLED">Đã hủy (CANCELLED)</option>
          </select>
        </div>
      </div>

      {/* Danh sách sản phẩm */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider">
            Danh sách sản phẩm
          </h3>

          {mode !== "VIEW" && (
            <button
              type="button"
              onClick={addEmptyItem}
              className="flex items-center gap-1 text-xs font-bold text-orange-500 hover:text-orange-600"
            >
              <Plus size={14} />
              Thêm dòng sản phẩm
            </button>
          )}
        </div>

        <div className="space-y-2">
          {formData.items.map((item, index) => (
            <div
              key={item.id || index}
              className="flex flex-col sm:flex-row gap-3 bg-white border border-gray-100 p-3 rounded-xl shadow-sm items-center"
            >
              {/* Ảnh sản phẩm từ ProductImageStore */}
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
                  placeholder="Nhập hoặc chọn sản phẩm..."
                  required
                  disabled={mode === "VIEW"}
                  value={item.productName || ""}
                  onChange={(e) =>
                    handleProductNameChange(index, e.target.value)
                  }
                  list="product-suggestions"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:outline-none disabled:opacity-70"
                />
              </div>

              <div className="w-full sm:w-20">
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                  Số lượng
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  disabled={mode === "VIEW"}
                  value={item.quantity}
                  onChange={(e) =>
                    handleItemChange(index, "quantity", e.target.value)
                  }
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm text-center focus:outline-none disabled:opacity-70"
                />
              </div>

              <div className="w-full sm:w-28">
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                  Đơn giá
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  disabled={mode === "VIEW"}
                  value={item.unitPrice}
                  onChange={(e) =>
                    handleItemChange(index, "unitPrice", e.target.value)
                  }
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm font-bold text-right focus:outline-none disabled:opacity-70"
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

              {mode !== "VIEW" && (
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="p-1.5 text-red-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors"
                  title="Xóa sản phẩm"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          ))}

          {formData.items.length === 0 && (
            <div className="text-center p-6 text-gray-400 border border-dashed rounded-xl">
              Chưa có sản phẩm nào trong đơn hàng.
            </div>
          )}
        </div>
      </div>

      <datalist id="product-suggestions">
        {availableProducts.map((product) => (
          <option key={product.id} value={product.name} />
        ))}
      </datalist>

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
          className="px-5 py-2.5 border border-gray-200 text-gray-600 font-bold rounded-xl text-sm hover:bg-gray-50 transition-all"
        >
          {mode === "VIEW" ? "Đóng" : "Hủy bỏ"}
        </button>

        {mode !== "VIEW" && (
          <button
            type="submit"
            className="px-5 py-2.5 bg-orange-500 text-white font-bold rounded-xl text-sm hover:bg-opacity-90 active:scale-95 transition-all"
          >
            Lưu thay đổi
          </button>
        )}
      </div>
    </form>
  );
};

export default OrderFormAdmin;
