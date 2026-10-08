
import { create } from "zustand";

import BookingService from "../services/BookingService";

export const useBookingStore = create((set, get) => ({
  bookings: [],
  myBookings: [],
  currentBooking: null,
  unavailableSlots: [],
  meta: null,
  loading: false,
  submitting: false,
  error: null,

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  clearError: () => set({ error: null }),

  fetchBookings: async (
    params = {},
    options = {}
  ) => {
    try {
      set({
        loading: true,
        error: null,
      });

      const res =
        await BookingService.getBookings(
          params,
          options
        );

      console.log(
        "booking/all:",
        res
      );

      const data =
        res?.body?.data ??
        res?.data ??
        null;

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

  fetchBookingById: async (
    id,
    options = {}
  ) => {
    try {
      set({
        loading: true,
        error: null,
      });

      const res =
        await BookingService.getBookingById(
          id,
          options
        );

      const data =
        res?.body?.data ??
        res?.data ??
        null;

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

  fetchMyBookings: async (
    params = {},
    options = {}
  ) => {
    try {
      set({
        loading: true,
        error: null,
      });

      const res =
        await BookingService.getMyBookings(
          params,
          options
        );

      console.log(
        "booking/my:",
        res
      );

      const data =
        res?.body?.data ??
        res?.data ??
        null;

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

      console.log(
        "unavailable slots response:",
        res
      );

      /*
       * Backend response:
       *
       * {
       *   statusCode: 200,
       *   body: {
       *     status: "SUCCESS",
       *     data: [
       *       {
       *         startTime: "08:00:00",
       *         endTime: "08:45:00"
       *       }
       *     ]
       *   }
       * }
       */

      const data =
        res?.body?.data ??
        res?.data ??
        [];

      const unavailableSlots =
        Array.isArray(data)
          ? data
          : [];

      set({
        unavailableSlots,
      });

      console.log(
        "unavailable slots mapped:",
        unavailableSlots
      );

      return res;
    } catch (err) {
      console.error(
        "fetchUnavailableSlots error:",
        err
      );

      set({
        error: err.message,
        unavailableSlots: [],
      });
    }
  },

  createBooking: async (
    data,
    options = {}
  ) => {
    try {
      set({
        submitting: true,
        error: null,
      });

      const res =
        await BookingService.createBooking(
          data,
          options
        );

      const booking =
        res?.body?.data ??
        res?.data ??
        null;

      set((state) => ({
        bookings: booking
          ? [
              booking,
              ...state.bookings,
            ]
          : state.bookings,

        myBookings: booking
          ? [
              booking,
              ...state.myBookings,
            ]
          : state.myBookings,

        submitting: false,
      }));

      return res;
    } catch (err) {
      set({
        error: err.message,
        submitting: false,
      });

      throw err;
    }
  },

  cancelBooking: async (
    id,
    options = {}
  ) => {
    try {
      const res =
        await BookingService.cancelBooking(
          id,
          options
        );

      console.log(
        "cancelled:",
        res
      );

      set((state) => ({
        bookings:
          state.bookings.map((booking) =>
            String(booking.id) ===
            String(id)
              ? {
                  ...booking,
                  status:
                    "CANCELLED",
                }
              : booking
          ),

        myBookings:
          state.myBookings.map((booking) =>
            String(booking.id) ===
            String(id)
              ? {
                  ...booking,
                  status:
                    "CANCELLED",
                }
              : booking
          ),

        currentBooking:
          String(
            state.currentBooking?.id
          ) === String(id)
            ? {
                ...state.currentBooking,
                status:
                  "CANCELLED",
              }
            : state.currentBooking,
      }));

      return res;
    } catch (err) {
      set({
        error: err.message,
      });

      throw err;
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

      console.log(
        "STATUS =",
        statusValue
      );

      console.log(
        "TYPE =",
        typeof statusValue
      );

      const res =
        await BookingService.updateBookingStatus(
          id,
          statusValue,
          options
        );

      set((state) => ({
        bookings:
          state.bookings.map((booking) =>
            String(booking.id) ===
            String(id)
              ? {
                  ...booking,
                  status:
                    statusValue,
                }
              : booking
          ),

        myBookings:
          state.myBookings.map((booking) =>
            String(booking.id) ===
            String(id)
              ? {
                  ...booking,
                  status:
                    statusValue,
                }
              : booking
          ),

        currentBooking:
          String(
            state.currentBooking?.id
          ) === String(id)
            ? {
                ...state.currentBooking,
                status:
                  statusValue,
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

      throw err;
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
      unavailableSlots: [],
      meta: null,
    }),
}));

