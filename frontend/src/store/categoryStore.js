import { create } from "zustand";
import CategoryService from "../services/CategoryService";

export const useCategoryStore = create((set, get) => ({
  // ───────────────────────── STATES ─────────────────────────
  categories: [],

  categoryMeta: {
    page: 1,
    pageSize: 10,
    total: 0,
    pages: 1,
  },

  loading: false,
  error: null,

  // filters
  keyword: "",
  selectedType: "",

  // ───────────────────────── FILTER ACTIONS ─────────────────────────
  setKeyword: (keyword) =>
    set({ keyword }),

  setSelectedType: (type) =>
    set({ selectedType: type }),

  clearFilters: () =>
    set({
      keyword: "",
      selectedType: "",
    }),

  // ───────────────────────── GET CATEGORIES ─────────────────────────
  fetchCategories: async (
    overrideParams = {}
  ) => {
    try {
      set({
        loading: true,
        error: null,
      });

      const state = get();

      const page =
        overrideParams.page ?? 1;

      const pageSize =
        overrideParams.pageSize ?? 10;

      /*
      |--------------------------------------------------------------------------
      | FILTER
      |--------------------------------------------------------------------------
      |
      | Nếu component truyền filter trực tiếp thì ưu tiên filter đó.
      | Nếu không thì tạo filter từ keyword + selectedType trong store.
      |
      */
      let filter =
        overrideParams.filter;

      if (
        filter === undefined
      ) {
        const keyword =
          overrideParams.keyword !== undefined
            ? overrideParams.keyword
            : state.keyword;

        const type =
          overrideParams.type !== undefined
            ? overrideParams.type
            : state.selectedType;

        const filters = [];

        if (keyword?.trim()) {
          filters.push(
            `name~*${keyword.trim()}*`
          );
        }

        if (type?.trim()) {
          filters.push(
            `categoryType:${type.trim()}`
          );
        }

        if (filters.length > 0) {
          filter = filters.join(",");
        }
      }

      const params = {
        page,
        pageSize,
      };

      if (filter) {
        params.filter = filter;
      }

      console.log(
        "GET CATEGORIES PARAMS:",
        params
      );

      const res =
        await CategoryService.getCategories(
          params
        );

      console.log(
        "GET CATEGORIES RESPONSE:",
        res
      );

      if (res?.success) {
        const result =
          res.data?.result || [];

        const meta =
          res.data?.meta || {
            page,
            pageSize,
            total: result.length,
            pages:
              result.length > 0 ? 1 : 0,
          };

        set({
          categories: result,
          categoryMeta: meta,
          error: null,
        });
      } else {
        set({
          categories: [],
          categoryMeta: {
            page,
            pageSize,
            total: 0,
            pages: 0,
          },
          error:
            res?.message ||
            "Không thể tải danh mục.",
        });
      }

      return res;
    } catch (err) {
      console.error(
        "Lỗi khi load categories:",
        err
      );

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Đã xảy ra lỗi khi tải danh mục.";

      set({
        categories: [],
        categoryMeta: {
          page: 1,
          pageSize: 10,
          total: 0,
          pages: 0,
        },
        error: message,
      });

      return {
        success: false,
        message,
      };
    } finally {
      set({
        loading: false,
      });
    }
  },

  // ───────────────────────── CREATE ─────────────────────────
  createCategory: async (
    newCategoryData
  ) => {
    try {
      set({
        loading: true,
        error: null,
      });

      const res =
        await CategoryService.createCategory(
          newCategoryData
        );

      if (res?.success) {
        set((state) => ({
          categories: [
            res.data,
            ...state.categories,
          ],
        }));
      }

      return res;
    } catch (err) {
      console.error(
        "Lỗi create category:",
        err
      );

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "System error";

      set({
        error: message,
      });

      return {
        success: false,
        message,
      };
    } finally {
      set({
        loading: false,
      });
    }
  },

  // ───────────────────────── UPDATE ─────────────────────────
  updateCategory: async (
    id,
    updatedData
  ) => {
    try {
      set({
        loading: true,
        error: null,
      });

      const res =
        await CategoryService.updateCategory(
          id,
          updatedData
        );

      if (res?.success) {
        set((state) => ({
          categories:
            state.categories.map(
              (cat) =>
                cat.id === Number(id)
                  ? {
                      ...cat,
                      ...res.data,
                    }
                  : cat
            ),
        }));
      }

      return res;
    } catch (err) {
      console.error(
        `Lỗi update category ${id}:`,
        err
      );

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "System error";

      set({
        error: message,
      });

      return {
        success: false,
        message,
      };
    } finally {
      set({
        loading: false,
      });
    }
  },

  // ───────────────────────── DELETE ─────────────────────────
  deleteCategory: async (id) => {
    try {
      set({
        loading: true,
        error: null,
      });

      const res =
        await CategoryService.deleteCategory(
          id
        );

      if (res?.success) {
        set((state) => ({
          categories:
            state.categories.filter(
              (cat) =>
                cat.id !== Number(id)
            ),
        }));
      }

      return res;
    } catch (err) {
      console.error(
        `Lỗi delete category ${id}:`,
        err
      );

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "System error";

      set({
        error: message,
      });

      return {
        success: false,
        message,
      };
    } finally {
      set({
        loading: false,
      });
    }
  },
}));
