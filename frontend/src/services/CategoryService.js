import api from "./api";
import { APP_CONFIG } from "./config";
import { URL_CONSTANT } from "../constants/urlConstant";

import { categoryMock } from "../assets/data/mocks/categories/categoryMock";

const delay = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/*
|--------------------------------------------------------------------------
| CONFIG
|--------------------------------------------------------------------------
*/
let useApi = APP_CONFIG.USE_REAL_API;

const setApi = (flag) => {
  useApi = !!flag;
};

const shouldUseApi = (options = {}) =>
  options.api !== undefined
    ? !!options.api
    : useApi;

/*
|--------------------------------------------------------------------------
| GET CATEGORIES
|--------------------------------------------------------------------------
*/
const getCategories = async (
  params = {},
  options = {}
) => {
  if (shouldUseApi(options)) {
    const requestParams = {
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 10,
    };

    if (params.filter) {
      requestParams.filter = params.filter;
    }

    console.log(
      "GET CATEGORIES REQUEST:",
      URL_CONSTANT.Category.GET_CATEGORIES,
      requestParams
    );

    const resp = await api.get(
      URL_CONSTANT.Category.GET_CATEGORIES,
      {
        params: requestParams,
      }
    );

    console.log(
      "GET CATEGORIES RAW RESPONSE:",
      resp
    );

    /*
    |--------------------------------------------------------------------------
    | API RESPONSE
    |--------------------------------------------------------------------------
    |
    | Backend response:
    |
    | {
    |   status: "SUCCESS",
    |   data: {
    |     result: [...],
    |     meta: {
    |       page: 1,
    |       pageSize: 10,
    |       pages: 2,
    |       total: 17
    |     }
    |   }
    | }
    |
    | Some API wrappers/interceptors may expose the body through
    | resp.data.body, so support both forms.
    |
    */
    const body =
      resp.data?.body ??
      resp.data ??
      {};

    const responseData =
      body.data ?? {};

    return {
      success:
        body.status === "SUCCESS",

      message:
        body.message ||
        "Get categories successfully",

      data: {
        result:
          responseData.result || [],

        meta:
          responseData.meta || {
            page: requestParams.page,
            pageSize: requestParams.pageSize,
            total: 0,
            pages: 0,
          },
      },
    };
  }

  /*
  |--------------------------------------------------------------------------
  | MOCK
  |--------------------------------------------------------------------------
  */
  await delay(500);

  let result = [...categoryMock.result];

  const page = Number(params.page ?? 1);
  const pageSize = Number(params.pageSize ?? 10);

  const filter = params.filter || "";

  const filterList = Array.isArray(filter)
    ? filter
    : String(filter)
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

  for (const item of filterList) {
    const nameMatch = item.match(
      /^name~\*(.*?)\*$/i
    );

    if (nameMatch) {
      const keyword =
        nameMatch[1].toLowerCase();

      result = result.filter((category) =>
        category.name
          ?.toLowerCase()
          .includes(keyword)
      );

      continue;
    }

    const typeMatch = item.match(
      /^categoryType:(.+)$/i
    );

    if (typeMatch) {
      const categoryType =
        typeMatch[1];

      result = result.filter(
        (category) =>
          category.categoryType ===
          categoryType
      );

      continue;
    }

    const idMatch = item.match(
      /^id:(\d+)$/i
    );

    if (idMatch) {
      const id = Number(idMatch[1]);

      result = result.filter(
        (category) =>
          Number(category.id) === id
      );
    }
  }

  const total = result.length;

  const pages =
    total === 0
      ? 0
      : Math.ceil(total / pageSize);

  const startIndex =
    (page - 1) * pageSize;

  const paginatedResult =
    result.slice(
      startIndex,
      startIndex + pageSize
    );

  return {
    success: true,

    message:
      categoryMock.message ||
      "Get categories successfully",

    data: {
      result: paginatedResult,

      meta: {
        page,
        pageSize,
        total,
        pages,
      },
    },
  };
};

/*
|--------------------------------------------------------------------------
| GET CATEGORY DETAIL
|--------------------------------------------------------------------------
*/
const getCategoryById = async (
  id,
  options = {}
) => {
  if (shouldUseApi(options)) {
    const resp = await api.get(
      URL_CONSTANT.Category.GET_CATEGORY.replace(
        "{id}",
        id
      )
    );

    const body =
      resp.data?.body ??
      resp.data ??
      {};

    return {
      success:
        body.status === "SUCCESS",

      message:
        body.message || "",

      data:
        body.data || null,
    };
  }

  await delay(300);

  const category =
    categoryMock.result.find(
      (item) =>
        item.id === Number(id)
    ) || null;

  return {
    success: !!category,

    message: category
      ? "Get category successfully"
      : "Category not found",

    data: category,
  };
};

/*
|--------------------------------------------------------------------------
| CREATE CATEGORY
|--------------------------------------------------------------------------
*/
const createCategory = async (
  categoryData,
  options = {}
) => {
  if (shouldUseApi(options)) {
    const resp = await api.post(
      URL_CONSTANT.Category.CREATE_CATEGORY,
      categoryData
    );

    const body =
      resp.data?.body ??
      resp.data ??
      {};

    return {
      success:
        body.status === "SUCCESS",

      message:
        body.message || "",

      data:
        body.data,
    };
  }

  await delay(400);

  return {
    success: true,

    message:
      "Create category successfully",

    data: {
      id: Date.now(),
      name: categoryData.name,
      categoryType:
        categoryData.categoryType,
      activeFlag: true,
      deleteFlag: false,
    },
  };
};

/*
|--------------------------------------------------------------------------
| UPDATE CATEGORY
|--------------------------------------------------------------------------
*/
const updateCategory = async (
  id,
  categoryData,
  options = {}
) => {
  if (shouldUseApi(options)) {
    const resp = await api.put(
      URL_CONSTANT.Category.UPDATE_CATEGORY,
      {
        id,
        ...categoryData,
      }
    );

    const body =
      resp.data?.body ??
      resp.data ??
      {};

    return {
      success:
        body.status === "SUCCESS",

      message:
        body.message || "",

      data:
        body.data,
    };
  }

  await delay(400);

  return {
    success: true,

    message:
      "Update category successfully",

    data: {
      id: Number(id),
      ...categoryData,
    },
  };
};

/*
|--------------------------------------------------------------------------
| DELETE CATEGORY
|--------------------------------------------------------------------------
*/
const deleteCategory = async (
  id,
  options = {}
) => {
  if (shouldUseApi(options)) {
    const resp = await api.delete(
      URL_CONSTANT.Category.DELETE_CATEGORY.replace(
        "{id}",
        id
      )
    );

    const body =
      resp.data?.body ??
      resp.data ??
      {};

    return {
      success:
        body.status === "SUCCESS",

      message:
        body.message || "",

      data:
        body.data,
    };
  }

  await delay(300);

  return {
    success: true,

    message:
      `Deleted category #${id} successfully`,
  };
};

export default {
  setApi,

  getCategories,
  getCategoryById,

  createCategory,
  updateCategory,
  deleteCategory,
};
