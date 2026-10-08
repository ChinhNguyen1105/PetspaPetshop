
import { create } from "zustand";
import BookingService from "../services/BookingService";

export const useBookingStore = create((set, get) => ({
  bookings: [],
  myBookings: [],
  currentBooking: null,
  unavailableSlots: [],
  meta: null,
  loading: false,
  error: null,

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  clearError: () => set({ error: null }),

  fetchBookings: async (params = {}, options = {}) => {
    try {
      set({
        loading: true,
        error: null,
      });

      const res = await BookingService.getBookings(
        params,
        options
      );

      console.log("booking/all: ", res);

      const data = res?.body?.data ?? res?.data ?? {};

      set({
        bookings: data?.result || [],
        meta: data?.meta || null,
        loading: false,
      });

      return res;
    } catch (err) {
      set({
        error: err.message,
        loading: false,
      });
    }
  },

  fetchBookingById: async (id, options = {}) => {
    try {
      set({
        loading: true,
        error: null,
      });

      const res = await BookingService.getBookingById(
        id,
        options
      );

      const data = res?.body?.data ?? res?.data ?? null;

      set({
        currentBooking: data,
        loading: false,
      });

      return res;
    } catch (err) {
      set({
        error: err.message,
        loading: false,
      });
    }
  },

  fetchMyBookings: async (params = {}, options = {}) => {
    try {
      set({
        loading: true,
        error: null,
      });

      const res = await BookingService.getMyBookings(
        params,
        options
      );

      console.log("booking from store: ", res);

      const data = res?.body?.data ?? res?.data ?? {};

      set({
        myBookings: data?.result || [],
        meta: data?.meta || null,
        loading: false,
      });

      return res;
    } catch (err) {
      set({
        error: err.message,
        loading: false,
      });
    }
  },

  fetchUnavailableSlots: async (
    params = {},
    options = {}
  ) => {
    try {
      const res =
        await BookingService.getUnavailableSlots(
          {
            bookingDate: params.date,
          },
          options
        );

      const data = res?.body?.data ?? res?.data ?? [];

      set({
        unavailableSlots: data || [],
      });

      console.log("unavailable:", res);

      return res;
    } catch (err) {
      set({
        error: err.message,
      });
    }
  },

  createBooking: async (data, options = {}) => {
    try {
      set({
        loading: true,
        error: null,
      });

      const res = await BookingService.createBooking(
        data,
        options
      );

      const booking =
        res?.body?.data ?? res?.data ?? null;

      set((state) => ({
        bookings: booking
          ? [booking, ...state.bookings]
          : state.bookings,

        myBookings: booking
          ? [booking, ...state.myBookings]
          : state.myBookings,

        loading: false,
      }));

      return res;
    } catch (err) {
      set({
        error: err.message,
        loading: false,
      });
    }
  },

  cancelBooking: async (id, options = {}) => {
    try {
      const res = await BookingService.cancelBooking(
        id,
        options
      );

      console.log("cancelled:", res);

      set((state) => ({
        bookings: state.bookings.map((b) =>
          String(b.id) === String(id)
            ? {
                ...b,
                status: "CANCELLED",
              }
            : b
        ),

        myBookings: state.myBookings.map((b) =>
          String(b.id) === String(id)
            ? {
                ...b,
                status: "CANCELLED",
              }
            : b
        ),

        currentBooking:
          String(state.currentBooking?.id) === String(id)
            ? {
                ...state.currentBooking,
                status: "CANCELLED",
              }
            : state.currentBooking,
      }));

      return res;
    } catch (err) {
      set({
        error: err.message,
      });
    }
  },

  updateBookingStatus: async (
    id,
    status,
    options = {}
  ) => {
    try {
      const statusValue =
        typeof status === "object"
          ? status.status
          : status;

      const res =
        await BookingService.updateBookingStatus(
          id,
          statusValue,
          options
        );

      set((state) => ({
        bookings: state.bookings.map((b) =>
          String(b.id) === String(id)
            ? {
                ...b,
                status: statusValue,
              }
            : b
        ),

        myBookings: state.myBookings.map((b) =>
          String(b.id) === String(id)
            ? {
                ...b,
                status: statusValue,
              }
            : b
        ),

        currentBooking:
          String(state.currentBooking?.id) === String(id)
            ? {
                ...state.currentBooking,
                status: statusValue,
              }
            : state.currentBooking,
      }));

      return res;
    } catch (err) {
      console.error(
        "updateBookingStatus error:",
        err
      );

      set({
        error: err.message,
      });
    }
  },

  setCurrentBooking: (booking) =>
    set({
      currentBooking: booking,
    }),

  clearBookings: () =>
    set({
      bookings: [],
      myBookings: [],
    }),
}));

