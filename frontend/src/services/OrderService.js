import api from "./api";
import { APP_CONFIG } from "./config";
import { URL_CONSTANT } from "../constants/urlConstant";

const delay = (ms) =>
  new Promise((r) => setTimeout(r, ms));

let useApi = APP_CONFIG.USE_REAL_API;

const setApi = (flag) => {
  useApi = !!flag;
};

const shouldUseApi = (options = {}) =>
  options.api !== undefined
    ? !!options.api
    : useApi;

/* ───────────────────────── HELPERS ───────────────────────── */

const safeArray = (arr) =>
  Array.isArray(arr) ? arr : [];

/* ───────────────────────── GET ALL ORDERS ───────────────────────── */

const getOrders = async (
  params = {},
  options = {},
) => {
  if (shouldUseApi(options)) {
    const res = await api.get(
      URL_CONSTANT.Order.GET_ALL_ORDERS,
      {
        params,
      },
    );

    return res.data;
  }

  await delay(300);

  return {
    statusCode: 200,
    body: {
      status: "SUCCESS",
      data: {
        result: [],
        meta: {
          page: 1,
          pageSize: 10,
          pages: 0,
          total: 0,
        },
      },
    },
  };
};

/* ───────────────────────── GET REVENUE ───────────────────────── */

const getRevenue = async (
  options = {},
) => {
  if (shouldUseApi(options)) {
    const res = await api.get(
      URL_CONSTANT.Order.GET_REVENUE,
    );

    return res.data;
  }

  await delay(300);

  return {
    statusCode: 200,
    body: {
      status: "SUCCESS",
      data: {
        totalRevenue: 0,
        shopRevenue: 0,
        spaRevenue: 0,
        paidOrders: 0,
        unpaidOrders: 0,
      },
    },
  };
};

/* ───────────────────────── GET ORDER DETAIL ───────────────────────── */

const getOrderById = async (
  orderId,
  options = {},
) => {
  if (shouldUseApi(options)) {
    const res = await api.get(
      URL_CONSTANT.Order.GET_ORDER_DETAIL.replace(
        "{id}",
        orderId,
      ),
    );

    return res.data;
  }

  await delay(200);

  return {
    statusCode: 200,
    body: {
      status: "SUCCESS",
      data: null,
    },
  };
};

/* ───────────────────────── GET MY ORDERS ───────────────────────── */

/*
Backend:

GET /orders/my-orders?page=1&pageSize=20
GET /orders/my-orders?status=PENDING&page=1&pageSize=20

Store gọi:

getMyOrders(status, page, pageSize, options)
*/

const getMyOrders = async (
  status,
  page = 1,
  pageSize = 20,
  options = {},
) => {
  if (shouldUseApi(options)) {
    const params = {
      page,
      pageSize,
    };

    if (
      status !== undefined &&
      status !== null &&
      status !== "" &&
      status !== "ALL"
    ) {
      params.status = status;
    }

    const res = await api.get(
      URL_CONSTANT.Order.GET_MY_ORDERS,
      {
        params,
      },
    );

    console.log(
      "GET MY ORDERS:",
      res.config?.url,
      res.config?.params,
      res.data,
    );

    return res.data;
  }

  await delay(200);

  return {
    statusCode: 200,
    body: {
      status: "SUCCESS",
      data: {
        result: [],
        meta: {
          page,
          pageSize,
          pages: 0,
          total: 0,
        },
      },
    },
  };
};

/* ───────────────────────── CREATE ORDER FROM CART ───────────────────────── */

const createOrder = async (
  orderData,
  options = {},
) => {
  const payload = {
    cartItemIds: safeArray(
      orderData?.cartItemIds,
    ),
    addressId: orderData?.addressId,
    paymentMethod:
      orderData?.paymentMethod || "COD",
  };

  if (!payload.cartItemIds.length) {
    throw new Error(
      "[ORDER] Bạn chưa chọn sản phẩm",
    );
  }

  if (!payload.addressId) {
    throw new Error(
      "[ORDER] Thiếu địa chỉ giao hàng",
    );
  }

  if (!payload.paymentMethod) {
    throw new Error(
      "[ORDER] Thiếu phương thức thanh toán",
    );
  }

  if (shouldUseApi(options)) {
    const res = await api.post(
      URL_CONSTANT.Order.CREATE_ORDER_FROM_CART,
      payload,
    );

    return res.data;
  }

  await delay(500);

  return {
    statusCode: 201,
    body: {
      status: "SUCCESS",
      data: {
        id: Date.now(),
        ...payload,
        status: "PROCESSING",
        paymentStatus: "PENDING",
        createdDate:
          new Date().toISOString(),
      },
    },
  };
};

/* ───────────────────────── UPDATE ORDER STATUS ───────────────────────── */

const updateOrderStatus = async (
  orderId,
  status,
  note = "",
  options = {},
) => {
  const payload = {
    orderId,
    status,
    note,
  };

  console.log(
    "UPDATE ORDER STATUS payload:",
    payload,
  );

  if (shouldUseApi(options)) {
    const res = await api.patch(
      URL_CONSTANT.Order.UPDATE_ORDER_STATUS,
      payload,
    );

    return res.data;
  }

  await delay(200);

  return {
    statusCode: 200,
    body: {
      status: "SUCCESS",
      data: payload,
    },
  };
};

/* ───────────────────────── CANCEL ORDER ───────────────────────── */

const cancelOrder = async (
  orderId,
  options = {},
) => {
  if (shouldUseApi(options)) {
    const res = await api.patch(
      URL_CONSTANT.Order.CANCEL_ORDER.replace(
        "{id}",
        orderId,
      ),
    );

    return res.data;
  }

  await delay(200);

  return {
    statusCode: 200,
    body: {
      status: "SUCCESS",
      data: {
        id: orderId,
        status: "CANCELLED",
      },
    },
  };
};

/* ───────────────────────── PAYMENT ───────────────────────── */

const payOrder = async (
  orderId,
  paymentMethod,
  options = {},
) => {
  if (shouldUseApi(options)) {
    const res = await api.post(
      URL_CONSTANT.Payment.CREATE_PAYMENT,
      {
        orderId,
        paymentMethod,
      },
    );

    return res.data;
  }

  await delay(300);

  return {
    statusCode: 200,
    body: {
      status: "SUCCESS",
      data: {
        orderId,
        paymentMethod,
        paymentStatus: "SUCCESS",
      },
    },
  };
};

export default {
  setApi,

  getOrders,
  getRevenue,
  getOrderById,
  getMyOrders,

  createOrder,

  updateOrderStatus,
  cancelOrder,

  payOrder,
};
