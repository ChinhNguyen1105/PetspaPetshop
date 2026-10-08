import { create } from "zustand";
import OrderService from "../services/OrderService";

export const useOrderStore = create((set, get) => ({
  /* ================= STATE ================= */
  orders: [],
  myOrders: [],
  currentOrder: null,
  meta: null,
  revenue: null,

  loading: false,
  submitting: false,
  error: null,

  /* ================= COMMON ================= */
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  /* ================= ADMIN ================= */
  fetchOrders: async (params = {}, options = {}) => {
    try {
      set({ loading: true, error: null });

      const res = await OrderService.getOrders(
        params,
        options,
      );

      set({
        orders: res?.body?.data?.result || [],
        meta: res?.body?.data?.meta || null,
        loading: false,
      });

      console.log("fetch order:", res);

      return res;
    } catch (err) {
      set({
        orders: [],
        meta: null,
        loading: false,
        error:
          err?.response?.data?.message ||
          err?.message ||
          "Fetch orders failed",
      });

      throw err;
    }
  },

  /* ================= REVENUE ================= */
  fetchRevenue: async (options = {}) => {
    try {
      set({
        loading: true,
        error: null,
      });

      const res =
        await OrderService.getRevenue(
          options,
        );

      const revenue =
        res?.body?.data ||
        res?.data ||
        null;

      set({
        revenue,
        loading: false,
      });

      console.log(
        "fetch revenue:",
        res,
      );

      return res;
    } catch (err) {
      set({
        revenue: null,
        loading: false,
        error:
          err?.response?.data?.message ||
          err?.message ||
          "Fetch revenue failed",
      });

      console.error(
        "Fetch revenue failed:",
        err,
      );

      throw err;
    }
  },

  /* ================= DETAIL ================= */
  fetchOrderById: async (orderId, options = {}) => {
    try {
      set({
        loading: true,
        error: null,
      });

      const res = await OrderService.getOrderById(
        orderId,
        options,
      );

      set({
        currentOrder:
          res?.body?.data ||
          res?.data ||
          null,
        loading: false,
      });

      return res;
    } catch (err) {
      set({
        currentOrder: null,
        loading: false,
        error:
          err?.response?.data?.message ||
          err?.message ||
          "Fetch order failed",
      });

      throw err;
    }
  },

  /* ================= MY ORDERS ================= */
  fetchMyOrders: async (
    status,
    page = 1,
    pageSize = 20,
    options = {},
  ) => {
    try {
      set({
        loading: true,
        error: null,
      });

      const res = await OrderService.getMyOrders(
        status,
        page,
        pageSize,
        options,
      );

      const data =
        res?.body?.data ||
        res?.data ||
        null;

      set({
        myOrders: data?.result || [],
        meta: data?.meta || null,
        loading: false,
      });

      console.log("fetch my orders:", res);

      return res;
    } catch (err) {
      set({
        myOrders: [],
        meta: null,
        loading: false,
        error:
          err?.response?.data?.message ||
          err?.message ||
          "Fetch my orders failed",
      });

      console.error(
        "Fetch my orders failed:",
        err,
      );

      throw err;
    }
  },

  /* ================= CREATE ================= */
  createOrder: async (orderData, options = {}) => {
    try {
      set({
        submitting: true,
        error: null,
      });

      const res =
        await OrderService.createOrder(
          orderData,
          options,
        );

      const order =
        res?.body?.data ||
        res?.data ||
        null;

      set((state) => ({
        orders: order
          ? [order, ...state.orders]
          : state.orders,
        currentOrder: order,
        submitting: false,
      }));

      return res;
    } catch (err) {
      set({
        submitting: false,
        error:
          err?.response?.data?.message ||
          err?.message ||
          "Create order failed",
      });

      throw err;
    }
  },

  /* ================= UPDATE STATUS ================= */
  updateOrderStatus: async (
    orderId,
    status,
    note = "",
    options = {},
  ) => {
    try {
      set({
        submitting: true,
        error: null,
      });

      const res =
        await OrderService.updateOrderStatus(
          orderId,
          status,
          note,
          options,
        );

      set((state) => ({
        orders: state.orders.map((o) =>
          String(o.id) === String(orderId)
            ? { ...o, status }
            : o,
        ),

        currentOrder:
          String(state.currentOrder?.id) ===
          String(orderId)
            ? {
                ...state.currentOrder,
                status,
              }
            : state.currentOrder,

        submitting: false,
      }));

      return res;
    } catch (err) {
      set({
        submitting: false,
        error:
          err?.response?.data?.message ||
          err?.message ||
          "Update order status failed",
      });

      throw err;
    }
  },

  /* ================= CANCEL ================= */
  cancelOrder: async (
    orderId,
    options = {},
  ) => {
    try {
      set({
        submitting: true,
        error: null,
      });

      const res =
        await OrderService.cancelOrder(
          orderId,
          options,
        );

      set((state) => ({
        orders: state.orders.map((o) =>
          String(o.id) === String(orderId)
            ? {
                ...o,
                status: "CANCELLED",
              }
            : o,
        ),

        myOrders: state.myOrders.map((o) =>
          String(o.id) === String(orderId)
            ? {
                ...o,
                status: "CANCELLED",
              }
            : o,
        ),

        currentOrder:
          String(state.currentOrder?.id) ===
          String(orderId)
            ? {
                ...state.currentOrder,
                status: "CANCELLED",
              }
            : state.currentOrder,

        submitting: false,
      }));

      return res;
    } catch (err) {
      set({
        submitting: false,
        error:
          err?.response?.data?.message ||
          err?.message ||
          "Cancel order failed",
      });

      throw err;
    }
  },

  /* ================= PAYMENT ================= */
  payOrder: async (
    orderId,
    paymentMethod,
    options = {},
  ) => {
    try {
      set({
        submitting: true,
        error: null,
      });

      const res =
        await OrderService.payOrder(
          orderId,
          paymentMethod,
          options,
        );

      set((state) => ({
        orders: state.orders.map((o) =>
          String(o.id) === String(orderId)
            ? {
                ...o,
                paymentStatus: "SUCCESS",
                paymentMethod,
              }
            : o,
        ),

        currentOrder:
          String(state.currentOrder?.id) ===
          String(orderId)
            ? {
                ...state.currentOrder,
                paymentStatus: "SUCCESS",
                paymentMethod,
              }
            : state.currentOrder,

        submitting: false,
      }));

      return res;
    } catch (err) {
      set({
        submitting: false,
        error:
          err?.response?.data?.message ||
          err?.message ||
          "Payment failed",
      });

      throw err;
    }
  },

  /* ================= RESET ================= */
  resetOrderState: () => {
    set({
      orders: [],
      myOrders: [],
      currentOrder: null,
      meta: null,
      revenue: null,
      loading: false,
      submitting: false,
      error: null,
    });
  },
}));
