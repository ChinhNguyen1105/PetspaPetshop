import { create } from "zustand";
import ServiceService from "../services/ServiceService";

const normalizeService = (service) => ({
  ...service,
  id: Number(service?.id),
  basePrice: Number(service?.basePrice || 0),
  durationMin: Number(service?.durationMin || 0),
  categoryId:
    service?.categoryId !== null &&
    service?.categoryId !== undefined
      ? Number(service.categoryId)
      : null,
  averageRating: Number(service?.averageRating || 0),
  totalReviews: Number(service?.totalReviews || 0),
});

const normalizeListData = (data) => ({
  meta: {
    page: Number(data?.meta?.page || 1),
    pageSize: Number(data?.meta?.pageSize || 10),
    pages: Number(data?.meta?.pages || 0),
    total: Number(data?.meta?.total || 0),
  },
  result: Array.isArray(data?.result)
    ? data.result.map(normalizeService)
    : [],
});

export const useServiceStore = create((set) => ({
  services: [],
  currentService: null,

  meta: {
    page: 1,
    pageSize: 10,
    pages: 0,
    total: 0,
  },

  loading: false,
  submitting: false,
  error: null,

  fetchServices: async (params = {}) => {
    set({
      loading: true,
      error: null,
    });

    try {
      const response =
        await ServiceService.getServices(params);

      if (!response.success) {
        set({
          services: [],
          meta: {
            page: 1,
            pageSize: 10,
            pages: 0,
            total: 0,
          },
          error:
            response.message ||
            "Failed to fetch services",
          loading: false,
        });

        return response;
      }

      const data =
        normalizeListData(response.data);

      set({
        services: data.result,
        meta: data.meta,
        error: null,
        loading: false,
      });

      return {
        ...response,
        data,
      };
    } catch (error) {
      const message =
        error?.response?.data?.body?.message ||
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch services";

      set({
        services: [],
        error: message,
        loading: false,
      });

      return {
        success: false,
        message,
        data: null,
      };
    }
  },

  fetchServiceById: async (serviceId) => {
    set({
      loading: true,
      error: null,
    });

    try {
      const response =
        await ServiceService.getServiceById(
          serviceId,
        );

      if (!response.success) {
        set({
          currentService: null,
          error:
            response.message ||
            "Failed to fetch service",
          loading: false,
        });

        return response;
      }

      const service =
        normalizeService(response.data);

      set({
        currentService: service,
        error: null,
        loading: false,
      });

      return {
        ...response,
        data: service,
      };
    } catch (error) {
      const message =
        error?.response?.data?.body?.message ||
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch service";

      set({
        currentService: null,
        error: message,
        loading: false,
      });

      return {
        success: false,
        message,
        data: null,
      };
    }
  },

  clearCurrentService: () => {
    set({
      currentService: null,
      error: null,
    });
  },

  createService: async (payload) => {
    set({
      submitting: true,
      error: null,
    });

    try {
      const response =
        await ServiceService.createService(
          payload,
        );

      if (!response.success) {
        set({
          error:
            response.message ||
            "Failed to create service",
          submitting: false,
        });

        return response;
      }

      const service =
        normalizeService(response.data);

      set({
        currentService: service,
        error: null,
        submitting: false,
      });

      return {
        ...response,
        data: service,
      };
    } catch (error) {
      const message =
        error?.response?.data?.body?.message ||
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create service";

      set({
        error: message,
        submitting: false,
      });

      return {
        success: false,
        message,
        data: null,
      };
    }
  },

  updateService: async (
    serviceId,
    payload,
  ) => {
    set({
      submitting: true,
      error: null,
    });

    try {
      const response =
        await ServiceService.updateService(
          Number(serviceId),
          payload,
        );

      if (!response.success) {
        set({
          error:
            response.message ||
            "Failed to update service",
          submitting: false,
        });

        return response;
      }

      const service =
        normalizeService(response.data);

      set({
        currentService: service,
        error: null,
        submitting: false,
      });

      return {
        ...response,
        data: service,
      };
    } catch (error) {
      const message =
        error?.response?.data?.body?.message ||
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update service";

      set({
        error: message,
        submitting: false,
      });

      return {
        success: false,
        message,
        data: null,
      };
    }
  },

  deleteService: async (serviceId) => {
    set({
      submitting: true,
      error: null,
    });

    try {
      const response =
        await ServiceService.deleteService(
          serviceId,
        );

      if (!response.success) {
        set({
          error:
            response.message ||
            "Failed to delete service",
          submitting: false,
        });

        return response;
      }

      set((state) => ({
        services: state.services.filter(
          (service) =>
            Number(service.id) !==
            Number(serviceId),
        ),

        currentService:
          state.currentService &&
          Number(state.currentService.id) ===
            Number(serviceId)
            ? null
            : state.currentService,

        meta: {
          ...state.meta,
          total: Math.max(
            0,
            Number(state.meta.total || 0) - 1,
          ),
        },

        error: null,
        submitting: false,
      }));

      return response;
    } catch (error) {
      const message =
        error?.response?.data?.body?.message ||
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete service";

      set({
        error: message,
        submitting: false,
      });

      return {
        success: false,
        message,
        data: null,
      };
    }
  },

  fetchTopServices: async (limit = 10) => {
    set({
      loading: true,
      error: null,
    });

    try {
      const response =
        await ServiceService.getTopServices(
          limit,
        );

      if (!response.success) {
        set({
          error:
            response.message ||
            "Failed to fetch top services",
          loading: false,
        });

        return response;
      }

      const services =
        Array.isArray(response.data)
          ? response.data.map(normalizeService)
          : [];

      set({
        services,
        error: null,
        loading: false,
      });

      return {
        ...response,
        data: services,
      };
    } catch (error) {
      const message =
        error?.response?.data?.body?.message ||
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch top services";

      set({
        error: message,
        loading: false,
      });

      return {
        success: false,
        message,
        data: null,
      };
    }
  },
}));
