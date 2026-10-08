import api from "./api";
import { APP_CONFIG } from "./config";
import { URL_CONSTANT } from "../constants/urlConstant";

import { productDetailMock } from "../assets/data/mocks/product/productDetailMock";
import productList from "../assets/data/mocks/product/productList";

/*
|--------------------------------------------------------------------------
| CONFIG
|--------------------------------------------------------------------------
*/

let useApi = APP_CONFIG.USE_REAL_API;

const setApi = (flag) => {
  useApi = !!flag;
};

const shouldUseApi = (options = {}) => {
  return options.api !== undefined
    ? !!options.api
    : useApi;
};

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

const normalizeResponse = (resp) => {
  const response = resp?.data;

  const success =
    response?.body?.status === "SUCCESS";

  return {
    success,

    message:
      response?.body?.message ||
      response?.message ||
      "",

    data:
      response?.body?.data ??
      null,

    statusCode:
      response?.statusCode ??
      resp?.status ??
      null,
  };
};

/*
|--------------------------------------------------------------------------
| GET PRODUCTS
|--------------------------------------------------------------------------
*/

const getProducts = async (
  params = {},
  options = {}
) => {
  if (shouldUseApi(options)) {
    const {
      page = 1,
      pageSize = 10,
      filter,
    } = params;

    const requestParams = {
      page,
      pageSize,
    };

    if (
      filter !== undefined &&
      filter !== null &&
      String(filter).trim() !== ""
    ) {
      requestParams.filter =
        String(filter).trim();
    }

    console.log(
      "GET PRODUCTS REQUEST PARAMS:",
      requestParams
    );

    const resp = await api.get(
      URL_CONSTANT.Product.GET_PRODUCTS,
      {
        params: requestParams,
      }
    );

    console.log(
      "PRODUCT API RAW RESPONSE:",
      resp.data
    );

    const result =
      normalizeResponse(resp);

    console.log(
      "PRODUCT SERVICE RESPONSE:",
      result
    );

    return result;
  }

  await delay(500);

  let finalResult = [
    ...productList.result,
  ];

  const {
    page = 1,
    pageSize = 10,
    filter,
  } = params;

  /*
  |--------------------------------------------------------------------------
  | MOCK FILTER
  |--------------------------------------------------------------------------
  */

  if (filter) {
    const filters = String(filter)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    for (const condition of filters) {
      const containsMatch =
        condition.match(
          /^name~\*(.*)\*$/i
        );

      if (containsMatch) {
        const keyword =
          containsMatch[1].toLowerCase();

        finalResult =
          finalResult.filter(
            (product) =>
              product.name
                ?.toLowerCase()
                .includes(keyword)
          );

        continue;
      }

      const idMatch =
        condition.match(
          /^id:(\d+)$/i
        );

      if (idMatch) {
        finalResult =
          finalResult.filter(
            (product) =>
              Number(product.id) ===
              Number(idMatch[1])
          );

        continue;
      }

      const categoryMatch =
        condition.match(
          /^category\.id:(\d+)$/i
        );

      if (categoryMatch) {
        finalResult =
          finalResult.filter(
            (product) =>
              Number(product.categoryId) ===
              Number(categoryMatch[1])
          );
      }
    }
  }

  const total =
    finalResult.length;

  const start =
    (Number(page) - 1) *
    Number(pageSize);

  const end =
    start + Number(pageSize);

  const paginatedResult =
    finalResult.slice(
      start,
      end
    );

  return {
    success: true,

    message:
      "Get products successfully",

    data: {
      meta: {
        page: Number(page),

        pageSize:
          Number(pageSize),

        pages:
          Math.ceil(
            total /
              Number(pageSize)
          ),

        total,
      },

      result:
        paginatedResult,
    },
  };
};

/*
|--------------------------------------------------------------------------
| GET PRODUCT DETAIL
|--------------------------------------------------------------------------
*/

const getProductById = async (
  id,
  options = {}
) => {
  if (shouldUseApi(options)) {
    const resp = await api.get(
      URL_CONSTANT.Product.GET_PRODUCT.replace(
        "{id}",
        id
      )
    );

    console.log(
      "PRODUCT DETAIL API RAW RESPONSE:",
      resp.data
    );

    const result =
      normalizeResponse(resp);

    console.log(
      "PRODUCT DETAIL SERVICE RESPONSE:",
      result
    );

    return result;
  }

  await delay(500);

  const isFoundMockDetail =
    String(productDetailMock?.id) ===
    String(id);

  let productData = null;

  if (isFoundMockDetail) {
    productData =
      productDetailMock;
  } else {
    const basicProduct =
      productList.result.find(
        (product) =>
          String(product.id) ===
          String(id)
      );

    if (basicProduct) {
      productData = {
        ...basicProduct,

        images: [
          {
            id: 1,

            imageUrl:
              basicProduct.thumbnailUrl,

            isThumbnail: true,
          },
        ],

        reviews: [],
      };
    }
  }

  return {
    success: !!productData,

    message: productData
      ? "Get product detail successfully"
      : "Product not found",

    data: productData,
  };
};

/*
|--------------------------------------------------------------------------
| CREATE PRODUCT
|--------------------------------------------------------------------------
*/

const createProduct = async (
  productData,
  options = {}
) => {
  if (shouldUseApi(options)) {
    const resp = await api.post(
      URL_CONSTANT.Product.CREATE_PRODUCT,
      productData
    );

    console.log(
      "CREATE PRODUCT API RAW RESPONSE:",
      resp.data
    );

    return normalizeResponse(resp);
  }

  await delay(600);

  return {
    success: true,

    message:
      "Create product successfully",

    data: {
      id: Date.now(),

      thumbnailUrl:
        productData.thumbnailUrl ||
        "https://images.unsplash.com/photo-1587300003388-59208cc962cb",

      averageRating: 0,

      reviewCount: 0,

      images: [],

      reviews: [],

      activeFlag: true,

      deleteFlag: false,

      status:
        Number(
          productData.stockQuantity
        ) > 0
          ? "ACTIVE"
          : "OUT_OF_STOCK",

      createdDate:
        new Date().toISOString(),

      lastModifiedDate:
        new Date().toISOString(),

      ...productData,
    },
  };
};

/*
|--------------------------------------------------------------------------
| UPDATE PRODUCT
|--------------------------------------------------------------------------
*/

const updateProduct = async (
  id,
  productData,
  options = {}
) => {
  if (shouldUseApi(options)) {
    const resp = await api.put(
      URL_CONSTANT.Product.UPDATE_PRODUCT,
      {
        id: Number(id),
        ...productData,
      }
    );

    console.log(
      "UPDATE PRODUCT API RAW RESPONSE:",
      resp.data
    );

    return normalizeResponse(resp);
  }

  await delay(600);

  return {
    success: true,

    message:
      "Update product successfully",

    data: {
      id: Number(id),

      ...productData,

      status:
        Number(
          productData.stockQuantity
        ) > 0
          ? "ACTIVE"
          : "OUT_OF_STOCK",

      lastModifiedDate:
        new Date().toISOString(),
    },
  };
};

/*
|--------------------------------------------------------------------------
| DELETE PRODUCT
|--------------------------------------------------------------------------
*/

const deleteProduct = async (
  id,
  options = {}
) => {
  if (shouldUseApi(options)) {
    const resp = await api.delete(
      URL_CONSTANT.Product.DELETE_PRODUCT.replace(
        "{id}",
        id
      )
    );

    console.log(
      "DELETE PRODUCT API RAW RESPONSE:",
      resp.data
    );

    return normalizeResponse(resp);
  }

  await delay(400);

  return {
    success: true,

    message:
      `Delete product #${id} successfully`,

    data: null,
  };
};

/*
|--------------------------------------------------------------------------
| DELAY
|--------------------------------------------------------------------------
*/

const delay = (ms) =>
  new Promise((resolve) =>
    setTimeout(resolve, ms)
  );

/*
|--------------------------------------------------------------------------
| EXPORT
|--------------------------------------------------------------------------
*/

export default {
  setApi,

  getProducts,
  getProductById,

  createProduct,
  updateProduct,
  deleteProduct,
};
