import api from "./api";
import { APP_CONFIG } from "./config";
import { URL_CONSTANT } from "../constants/urlConstant";

const delay = (ms) =>
  new Promise((resolve) =>
    setTimeout(resolve, ms)
  );

let useApi = APP_CONFIG.USE_REAL_API;

const setApi = (flag) => {
  useApi = !!flag;
};

const shouldUseApi = (options = {}) =>
  options.api !== undefined
    ? !!options.api
    : useApi;

const normalizeResponse = (resp) => {
  const response = resp?.data;

  return {
    success:
      response?.body?.status === "SUCCESS",
    message:
      response?.body?.message ||
      response?.message ||
      "",
    data:
      response?.body?.data ?? null,
    statusCode:
      response?.statusCode ??
      resp?.status ??
      null,
  };
};

const normalizeService = (item) => {
  if (!item) {
    return null;
  }

  return {
    id: Number(item.id),
    name: item.name,
    description: item.description,
    basePrice: Number(item.basePrice),
    durationMin: Number(item.durationMin),
    categoryId:
      item.categoryId !== null &&
      item.categoryId !== undefined
        ? Number(item.categoryId)
        : null,
    categoryName: item.categoryName,
    serviceImages: item.serviceImages || [],
    averageRating: Number(item.averageRating || 0),
    totalReviews: Number(item.totalReviews || 0),
    createdDate: item.createdDate,
    lastModifiedDate: item.lastModifiedDate,
  };
};

const normalizeListData = (data) => ({
  meta: {
    page: Number(data?.meta?.page || 1),
    pageSize: Number(data?.meta?.pageSize || 10),
    pages: Number(data?.meta?.pages || 0),
    total: Number(data?.meta?.total || 0),
  },
  result:
    Array.isArray(data?.result)
      ? data.result.map(normalizeService)
      : [],
});

const getServices = async (params = {}, options = {}) => {
  if (shouldUseApi(options)) {
    const requestParams = {
      page:
        params.page !== undefined
          ? Number(params.page)
          : 1,

      pageSize:
        params.pageSize !== undefined
          ? Number(params.pageSize)
          : 10,

      ...(params.filter
        ? { filter: params.filter }
        : {}),
    };

    const resp = await api.get(
      URL_CONSTANT.PetService.GET_ALL_SERVICES,
      {
        params: requestParams,
      }
    );

    console.log(
      "get services request:",
      requestParams
    );

    console.log(
      "get services response:",
      resp
    );

    const normalized = normalizeResponse(resp);

    if (!normalized.success) {
      return normalized;
    }

    return {
      ...normalized,
      data: normalizeListData(
        normalized.data
      ),
    };
  }

  await delay(300);

  return {
    success: true,
    message: "",
    statusCode: 200,
    data: {
      meta: {
        page: 1,
        pageSize: 10,
        pages: 0,
        total: 0,
      },
      result: [],
    },
  };
};

const getTopServices = async (
  limit = 10,
  options = {}
) => {
  if (shouldUseApi(options)) {
    const requestParams = {
      limit: Number(limit),
    };

    const resp = await api.get(
      URL_CONSTANT.PetService.GET_TOP_SERVICES,
      {
        params: requestParams,
      }
    );

    const normalized = normalizeResponse(resp);

    if (!normalized.success) {
      return normalized;
    }

    return {
      ...normalized,
      data: Array.isArray(normalized.data)
        ? normalized.data.map(normalizeService)
        : [],
    };
  }

  await delay(300);

  return {
    success: true,
    message: "",
    statusCode: 200,
    data: [],
  };
};

const getServiceById = async (
  serviceId,
  options = {}
) => {
  const id = Number(serviceId);

  if (Number.isNaN(id)) {
    return {
      success: false,
      message: "Invalid service ID",
      statusCode: 400,
      data: null,
    };
  }

  if (shouldUseApi(options)) {
    const url =
      URL_CONSTANT.PetService.GET_SERVICE
        .replace(":id", String(id))
        .replace("{id}", String(id));

    const resp = await api.get(url);

    const normalized =
      normalizeResponse(resp);

    if (!normalized.success) {
      return normalized;
    }

    return {
      ...normalized,
      data: normalizeService(
        normalized.data
      ),
    };
  }

  await delay(300);

  return {
    success: true,
    message: "",
    statusCode: 200,
    data: null,
  };
};

const createService = async (
  payload,
  options = {}
) => {
  const request = {
    name: payload.name,
    description: payload.description,
    basePrice: Number(payload.basePrice),
    durationMin: Number(payload.durationMin),
    categoryId: Number(payload.categoryId),
  };

  if (shouldUseApi(options)) {
    const resp = await api.post(
      URL_CONSTANT.PetService.CREATE_SERVICE,
      request
    );

    const normalized =
      normalizeResponse(resp);

    if (!normalized.success) {
      return normalized;
    }

    return {
      ...normalized,
      data: normalizeService(
        normalized.data
      ),
    };
  }

  await delay(300);

  return {
    success: true,
    message: "",
    statusCode: 201,
    data: normalizeService({
      ...request,
      id: Date.now(),
    }),
  };
};

const updateService = async (
  serviceId,
  payload,
  options = {}
) => {
  const request = {
    id: Number(serviceId),
    name: payload.name,
    description: payload.description,
    basePrice:
      payload.basePrice !== null &&
      payload.basePrice !== undefined
        ? Number(payload.basePrice)
        : null,
    durationMin:
      payload.durationMin !== null &&
      payload.durationMin !== undefined
        ? Number(payload.durationMin)
        : null,
    categoryId:
      payload.categoryId !== null &&
      payload.categoryId !== undefined
        ? Number(payload.categoryId)
        : null,
  };

  if (shouldUseApi(options)) {
    const resp = await api.put(
      URL_CONSTANT.PetService.UPDATE_SERVICE,
      request
    );

    const normalized =
      normalizeResponse(resp);

    if (!normalized.success) {
      return normalized;
    }

    return {
      ...normalized,
      data: normalizeService(
        normalized.data
      ),
    };
  }

  await delay(300);

  return {
    success: true,
    message: "",
    statusCode: 200,
    data: normalizeService(request),
  };
};

const deleteService = async (
  serviceId,
  options = {}
) => {
  const id = Number(serviceId);

  if (Number.isNaN(id)) {
    return {
      success: false,
      message: "Invalid service ID",
      statusCode: 400,
      data: null,
    };
  }

  const url =
    URL_CONSTANT.PetService.DELETE_SERVICE
      .replace(":id", String(id))
      .replace("{id}", String(id));

  if (shouldUseApi(options)) {
    const resp = await api.delete(url);

    return normalizeResponse(resp);
  }

  await delay(300);

  return {
    success: true,
    message: "",
    statusCode: 204,
    data: null,
  };
};

export default {
  setApi,
  getServices,
  getTopServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
};
