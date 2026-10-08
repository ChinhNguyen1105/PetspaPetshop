import api from "./api";
import { URL_CONSTANT } from "../constants/urlConstant";

/**
 * Lấy data thực tế từ response backend.
 *
 * Backend hiện tại có thể trả:
 *
 * 1. Full wrapper:
 * {
 *   statusCode: 200,
 *   body: {
 *     status: "SUCCESS",
 *     data: ...
 *   }
 * }
 *
 * 2. Nếu api.js đã unwrap:
 * {
 *   status: "SUCCESS",
 *   data: ...
 * }
 *
 * 3. Nếu api.js unwrap sâu hơn:
 * ...
 */
const extractResponseData = (responseData) => {
  console.log("========== VNPAY SERVICE RESPONSE ==========");
  console.log("Raw response:", responseData);

  if (responseData?.body?.data !== undefined) {
    console.log("→ Response dạng: statusCode.body.data");
    return responseData.body.data;
  }

  if (responseData?.data !== undefined) {
    console.log("→ Response dạng: data");
    return responseData.data;
  }

  console.log("→ Response không có wrapper, sử dụng trực tiếp");
  return responseData;
};

/**
 * Tạo URL thanh toán VNPAY
 */
const createVNPayPayment = async (orderId) => {
  console.log("========== CREATE VNPAY PAYMENT ==========");
  console.log("orderId:", orderId);
  console.log("orderId type:", typeof orderId);

  if (!orderId) {
    throw new Error("orderId không tồn tại khi tạo thanh toán VNPAY.");
  }

  try {
    /*
     * Không truyền null làm request body.
     *
     * Backend chỉ cần:
     * POST /payment/vnpay/create?orderId=60
     */
    const response = await api.post(
      URL_CONSTANT.Payment.CREATE_PAYMENT,
      undefined,
      {
        params: {
          orderId,
        },
      }
    );

    console.log("========== CREATE VNPAY RESPONSE ==========");
    console.log("Axios response:", response);
    console.log("Axios response.data:", response?.data);

    const data = extractResponseData(response?.data);

    console.log("VNPAY payment URL:", data);
    console.log("VNPAY payment URL type:", typeof data);
    console.log("===========================================");

    return data;
  } catch (error) {
    console.error("========== CREATE VNPAY ERROR ==========");
    console.error("Error:", error);
    console.error("Message:", error?.message);
    console.error("Response:", error?.response);
    console.error("Response status:", error?.response?.status);
    console.error("Response data:", error?.response?.data);
    console.error("========================================");

    throw error;
  }
};

/**
 * Xử lý URL Return từ VNPAY
 */
const handleVNPayReturn = async (queryString) => {
  console.log("========== HANDLE VNPAY RETURN ==========");

  const urlParams = new URLSearchParams(queryString);
  const paramsObject = Object.fromEntries(urlParams.entries());

  console.log("VNPAY return params:", paramsObject);

  try {
    const response = await api.get(
      URL_CONSTANT.Payment.HANDLE_RETURN,
      {
        params: paramsObject,
      }
    );

    console.log("VNPAY return response:", response);
    console.log("VNPAY return response.data:", response?.data);

    return extractResponseData(response?.data);
  } catch (error) {
    console.error("========== HANDLE VNPAY RETURN ERROR ==========");
    console.error("Error:", error);
    console.error("Message:", error?.message);
    console.error("Response:", error?.response);
    console.error("Response data:", error?.response?.data);
    console.error("================================================");

    throw error;
  }
};

/**
 * Kiểm tra trạng thái thanh toán
 */
const checkPaymentStatus = async (orderId) => {
  console.log("========== CHECK VNPAY STATUS ==========");
  console.log("orderId:", orderId);

  if (!orderId) {
    throw new Error("orderId không tồn tại khi kiểm tra trạng thái VNPAY.");
  }

  try {
    const response = await api.get(
      URL_CONSTANT.Payment.GET_PAYMENT_STATUS,
      {
        params: {
          orderId,
        },
      }
    );

    console.log("Payment status Axios response:", response);
    console.log("Payment status response.data:", response?.data);

    const data = extractResponseData(response?.data);

    console.log("Payment status actual data:", data);
    console.log("========================================");

    return data;
  } catch (error) {
    console.error("========== CHECK VNPAY STATUS ERROR ==========");
    console.error("Error:", error);
    console.error("Message:", error?.message);
    console.error("Response:", error?.response);
    console.error("Response status:", error?.response?.status);
    console.error("Response data:", error?.response?.data);
    console.error("==============================================");

    throw error;
  }
};

const VNpaymentService = {
  createVNPayPayment,
  handleVNPayReturn,
  checkPaymentStatus,
};

export default VNpaymentService;
