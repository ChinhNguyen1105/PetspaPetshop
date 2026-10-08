import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const order = location.state?.order;

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
        <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-green-100 flex items-center justify-center">
          <span className="text-4xl text-green-600">✓</span>
        </div>

        <h1 className="text-2xl font-bold text-green-600 mb-3">
          Đặt hàng thành công
        </h1>

        <p className="text-gray-600 mb-2">
          Đơn hàng của bạn đã được ghi nhận thành công.
        </p>

        {order?.id && (
          <p className="text-gray-500 mb-6">
            Mã đơn hàng: <strong>#{order.id}</strong>
          </p>
        )}

        {!order?.id && <div className="mb-6" />}

        <div className="space-y-3">
          <button
            onClick={() => navigate("/profile/orders")}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-medium transition"
          >
            Xem đơn hàng
          </button>

          <button
            onClick={() => navigate("/shop")}
            className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 rounded-xl font-medium transition"
          >
            Tiếp tục mua hàng
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
