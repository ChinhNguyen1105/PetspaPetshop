import { create } from "zustand";
import ProductService from "../services/ProductService";

export const useProductStore = create(
  (set, get) => ({
    /*
    |--------------------------------------------------------------------------
    | STATE
    |--------------------------------------------------------------------------
    */

    products: [],
    categories: [],
    meta: null,
    currentProduct: null,

    selectedCategory: 0,
    keyword: "",

    page: 1,
    pageSize: 10,

    loading: false,
    detailLoading: false,

    /*
    |--------------------------------------------------------------------------
    | FILTER
    |--------------------------------------------------------------------------
    */

    setSelectedCategory: (id) =>
      set({
        selectedCategory: id,
        page: 1,
      }),

    setKeyword: (keyword) =>
      set({
        keyword,
        page: 1,
      }),

    setPage: (page) =>
      set({
        page,
      }),

    clearCurrentProduct: () =>
      set({
        currentProduct: null,
      }),

    /*
    |--------------------------------------------------------------------------
    | GET PRODUCTS
    |--------------------------------------------------------------------------
    */

    fetchProducts: async (overrideParams = {}) => {
  try {
    set({
      loading: true,
    });

    const { page, pageSize } = get();

    const params = {
      page,
      pageSize,
      ...overrideParams,
    };

    console.log("GET PRODUCTS PARAMS:", params);

    const res = await ProductService.getProducts(params);

    console.log("PRODUCT SERVICE RESULT:", res);

    if (res?.success) {
      const result = (res.data?.result || []).map((item) => ({
        ...item,

        id:
          item.id !== undefined
            ? Number(item.id)
            : item.id,

        price:
          item.price !== undefined
            ? Number(item.price)
            : item.price,

        categoryId:
          item.categoryId !== undefined
            ? Number(item.categoryId)
            : item.categoryId,

        // API: stockQuantity
        // Frontend ProductCard: quantity
        quantity: Number(item.stockQuantity ?? 0),

        avgRating:
          item.avgRating !== undefined
            ? Number(item.avgRating)
            : item.avgRating,

        totalReviews:
          item.totalReviews !== undefined
            ? Number(item.totalReviews)
            : item.totalReviews,
      }));

      const meta = res.data?.meta || null;

      set({
        products: result,
        meta,
      });
    } else {
      set({
        products: [],
        meta: null,
      });
    }

    return res;
  } catch (err) {
    console.error(
      "Lỗi khi tải danh sách sản phẩm:",
      err
    );

    set({
      products: [],
      meta: null,
    });

    return {
      success: false,
      message: "Không thể tải danh sách sản phẩm",
      data: null,
    };
  } finally {
    set({
      loading: false,
    });
  }
},

    /*
    |--------------------------------------------------------------------------
    | GET PRODUCT DETAIL
    |--------------------------------------------------------------------------
    */

    fetchProductById: async (id) => {
      const numericId = Number(id);

      if (
        get().currentProduct?.id ===
        numericId
      ) {
        return {
          success: true,
          data:
            get().currentProduct,
        };
      }

      try {
        set({
          detailLoading: true,
          currentProduct: null,
        });

        const res =
          await ProductService.getProductById(
            numericId
          );

        console.log(
          "PRODUCT DETAIL SERVICE RESULT:",
          res
        );

        if (
          res?.success &&
          res?.data
        ) {
          const product = {
            ...res.data,

            id: Number(
              res.data.id
            ),

            price: Number(
              res.data.price
            ),

            categoryId:
              res.data.categoryId !==
              undefined
                ? Number(
                    res.data.categoryId
                  )
                : res.data.categoryId,

            stockQuantity:
              Number(
                res.data.stockQuantity ??
                  0
              ),
          };

          set({
            currentProduct:
              product,
          });

          return {
            success: true,
            data: product,
          };
        }

        set({
          currentProduct: null,
        });

        return {
          success: false,
          message:
            res?.message ||
            "Không thể tải chi tiết sản phẩm",
          data: null,
        };
      } catch (err) {
        console.error(
          `Lỗi khi tải chi tiết sản phẩm ID ${id}:`,
          err
        );

        set({
          currentProduct: null,
        });

        return {
          success: false,
          message:
            "Không thể tải chi tiết sản phẩm",
          data: null,
        };
      } finally {
        set({
          detailLoading: false,
        });
      }
    },

    /*
    |--------------------------------------------------------------------------
    | CREATE PRODUCT
    |--------------------------------------------------------------------------
    */

    createProduct: async (data) => {
      try {
        set({
          loading: true,
        });

        const request = {
          name: data.name,

          description:
            data.description,

          price: Number(
            data.price
          ),

          categoryId: Number(
            data.categoryId
          ),

          quantity: Number(
            data.quantity
          ),
        };

        console.log(
          "CREATE PRODUCT REQUEST:",
          request
        );

        const res =
          await ProductService.createProduct(
            request
          );

        console.log(
          "CREATE PRODUCT SERVICE RESULT:",
          res
        );

        if (
          res?.success &&
          res?.data
        ) {
          const product = {
            ...res.data,

            id:
              res.data.id !==
              undefined
                ? Number(
                    res.data.id
                  )
                : res.data.id,

            price:
              res.data.price !==
              undefined
                ? Number(
                    res.data.price
                  )
                : res.data.price,

            categoryId:
              res.data.categoryId !==
              undefined
                ? Number(
                    res.data.categoryId
                  )
                : res.data.categoryId,
          };

          set((state) => ({
            products: [
              product,
              ...state.products,
            ],
          }));
        }

        return res;
      } catch (err) {
        console.error(
          "Lỗi khi tạo sản phẩm:",
          err
        );

        return {
          success: false,
          message:
            "Lỗi hệ thống không thể tạo sản phẩm.",
          data: null,
        };
      } finally {
        set({
          loading: false,
        });
      }
    },

    /*
    |--------------------------------------------------------------------------
    | UPDATE PRODUCT
    |--------------------------------------------------------------------------
    */

    updateProduct: async (
      id,
      data
    ) => {
      const numericId =
        Number(id);

      try {
        set({
          loading: true,
        });

        const request = {
          id: numericId,

          name: data.name,

          description:
            data.description,

          price: Number(
            data.price
          ),

          categoryId: Number(
            data.categoryId ??
              data.category
          ),

          quantity: Number(
            data.stockQuantity ??
              data.stock_quantity ??
              0
          ),
        };

        console.log(
          "UPDATE PRODUCT REQUEST:",
          request
        );

        const res =
          await ProductService.updateProduct(
            numericId,
            request
          );

        console.log(
          "UPDATE PRODUCT SERVICE RESULT:",
          res
        );

        if (
          res?.success &&
          res?.data
        ) {
          const updatedProduct =
            {
              ...res.data,

              id:
                res.data.id !==
                undefined
                  ? Number(
                      res.data.id
                    )
                  : numericId,

              price:
                res.data.price !==
                undefined
                  ? Number(
                      res.data.price
                    )
                  : res.data.price,

              categoryId:
                res.data.categoryId !==
                undefined
                  ? Number(
                      res.data.categoryId
                    )
                  : res.data.categoryId,
            };

          set((state) => ({
            products:
              state.products.map(
                (product) =>
                  Number(
                    product.id
                  ) === numericId
                    ? {
                        ...product,
                        ...updatedProduct,
                      }
                    : product
              ),

            currentProduct:
              Number(
                state.currentProduct?.id
              ) === numericId
                ? {
                    ...state.currentProduct,
                    ...updatedProduct,
                  }
                : state.currentProduct,
          }));
        }

        return res;
      } catch (err) {
        console.error(
          `Lỗi khi cập nhật sản phẩm ID ${id}:`,
          err
        );

        return {
          success: false,
          message:
            "Lỗi hệ thống không thể cập nhật sản phẩm.",
          data: null,
        };
      } finally {
        set({
          loading: false,
        });
      }
    },

    /*
    |--------------------------------------------------------------------------
    | DELETE PRODUCT
    |--------------------------------------------------------------------------
    */

    deleteProduct: async (
      id
    ) => {
      const numericId =
        Number(id);

      try {
        set({
          loading: true,
        });

        const res =
          await ProductService.deleteProduct(
            numericId
          );

        console.log(
          "DELETE PRODUCT SERVICE RESULT:",
          res
        );

        if (res?.success) {
          set((state) => ({
            products:
              state.products.filter(
                (product) =>
                  Number(
                    product.id
                  ) !== numericId
              ),

            currentProduct:
              Number(
                state.currentProduct?.id
              ) === numericId
                ? null
                : state.currentProduct,
          }));
        }

        return res;
      } catch (err) {
        console.error(
          `Lỗi khi xóa sản phẩm ID ${id}:`,
          err
        );

        return {
          success: false,
          message:
            "Lỗi hệ thống không thể xóa sản phẩm.",
          data: null,
        };
      } finally {
        set({
          loading: false,
        });
      }
    },
  })
);
