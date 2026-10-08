import React, { useEffect, useMemo, useState } from "react";

import {
  Search,
  SlidersHorizontal,
  Layers,
} from "lucide-react";

import Loading from "../../components/common/Loading";
import ProductCard from "../../components/ui/ProductCard";
import Pagination from "../../components/common/Pagination";

import { useProductStore } from "../../store/productStore";
import { useCategoryStore } from "../../store/categoryStore";

const ProductList = () => {
  const PAGE_SIZE = 10;

  const [currentPage, setCurrentPage] = useState(1);

  const {
    products,
    meta,
    loading: productLoading,
    selectedCategory,
    keyword,
    setSelectedCategory,
    setKeyword,
    fetchProducts,
  } = useProductStore();

  const {
    categories,
    loading: categoryLoading,
    fetchCategories,
  } = useCategoryStore();

  // =========================================================
  // FETCH CATEGORIES
  // =========================================================

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // =========================================================
  // FETCH PRODUCTS
  //
  // Tất cả:
  // /products?page=1&pageSize=10
  //
  // Category:
  // /products?page=1&pageSize=10&filter=category.id:3
  //
  // Category + keyword:
  // /products?page=1&pageSize=10&filter=category.id:3,name~*Royal*
  //
  // Backend sử dụng Specification để xử lý filter.
  // =========================================================

  useEffect(() => {
    const loadProducts = async () => {
      const params = {
        page: currentPage,
        pageSize: PAGE_SIZE,
      };

      const filters = [];

      // =======================================================
      // CATEGORY FILTER
      // =======================================================

      if (
        selectedCategory !== null &&
        Number(selectedCategory) !== 0
      ) {
        filters.push(
          `category.id:${Number(selectedCategory)}`,
        );
      }

      // =======================================================
      // KEYWORD FILTER
      // =======================================================

      if (keyword.trim()) {
        filters.push(
          `name~*${keyword.trim()}*`,
        );
      }

      // =======================================================
      // BUILD SPECIFICATION FILTER
      // =======================================================

      if (filters.length > 0) {
        params.filter = filters.join(",");
      }

      console.log(
        "Product query params:",
        params,
      );

      await fetchProducts(params);
    };

    loadProducts();
  }, [
    currentPage,
    selectedCategory,
    keyword,
    fetchProducts,
  ]);

  // =========================================================
  // PRODUCT CATEGORIES
  // =========================================================

  const filteredCategories = useMemo(() => {
    return Array.isArray(categories)
      ? categories.filter(
          (category) =>
            category &&
            category.categoryType === "PRODUCT",
        )
      : [];
  }, [categories]);

  // =========================================================
  // PAGINATION
  // =========================================================

  const totalPages =
    Number(meta?.pages) || 0;

  const displayedPage =
    Number(meta?.page) || currentPage;

  // =========================================================
  // CATEGORY CHANGE
  // =========================================================

  const handleCategoryChange = (id) => {
    const categoryId =
      id === null ? 0 : Number(id);

    setSelectedCategory(categoryId);

    // Khi đổi category phải quay về page 1.
    setCurrentPage(1);
  };

  // =========================================================
  // SEARCH CHANGE
  // =========================================================

  const handleSearchChange = (e) => {
    setKeyword(e.target.value);

    // Khi đổi keyword phải quay về page 1.
    setCurrentPage(1);
  };

  // =========================================================
  // PAGE CHANGE
  // =========================================================

  const handlePageChange = (page) => {
    if (page < 1) {
      return;
    }

    if (
      totalPages > 0 &&
      page > totalPages
    ) {
      return;
    }

    setCurrentPage(page);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================================================
  // LOADING
  // =========================================================

  const isFirstLoad =
    categoryLoading ||
    (productLoading && products.length === 0);

  if (isFirstLoad) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50/50">
        <Loading />
      </div>
    );
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="min-h-screen bg-gray-50/50 pt-10 pb-20 text-left">
      <div className="container mx-auto px-4 lg:px-8 max-w-7xl">

        {/* HEADER */}

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">

          <div>
            <h1 className="text-4xl font-black text-pet-blue mb-2">
              Cửa Hàng Petspa
            </h1>

            <p className="text-gray-500 font-medium">
              Cung cấp phụ kiện và thức ăn dinh dưỡng tốt nhất cho thú cưng
            </p>
          </div>

          {/* CATEGORY FILTER */}

          <div className="flex flex-wrap gap-3 items-center">

            {/* ALL */}

            <button
              onClick={() =>
                handleCategoryChange(0)
              }
              className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer border outline-none ${
                Number(selectedCategory) === 0
                  ? "bg-pet-blue text-white border-pet-blue shadow-lg shadow-blue-500/10"
                  : "bg-white text-gray-500 hover:bg-gray-100 border-gray-200"
              }`}
            >
              Tất Cả Sản Phẩm
            </button>

            {/* CATEGORY */}

            {filteredCategories.map(
              (category) => {
                const categoryName =
                  category.name;

                const categoryId =
                  Number(category.id);

                if (!categoryName) {
                  return null;
                }

                return (
                  <button
                    key={categoryId}
                    onClick={() =>
                      handleCategoryChange(
                        categoryId,
                      )
                    }
                    className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer border outline-none ${
                      Number(selectedCategory) ===
                      categoryId
                        ? "bg-pet-blue text-white border-pet-blue shadow-lg shadow-blue-500/10"
                        : "bg-white text-gray-500 hover:bg-gray-100 border-gray-200"
                    }`}
                  >
                    {categoryName}
                  </button>
                );
              },
            )}
          </div>
        </div>

        {/* TOOLBAR */}

        <div className="bg-white p-4 rounded-2xl border border-gray-100 mb-8 flex flex-col sm:flex-row gap-4 justify-between items-center shadow-sm">

          <div className="relative w-full sm:w-96">

            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />

            <input
              type="text"
              value={keyword}
              onChange={handleSearchChange}
              placeholder="Tìm kiếm tên sản phẩm..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-gray-100 outline-none transition-all font-medium text-gray-700"
            />
          </div>

          <button
            type="button"
            className="flex items-center gap-2 text-gray-600 font-black text-xs uppercase tracking-wider hover:text-pet-blue transition-colors cursor-pointer bg-transparent border-none outline-none"
          >
            <SlidersHorizontal size={16} />

            Sắp xếp theo: Bán chạy nhất
          </button>
        </div>

        {/* RESULT INFO */}

        <div className="flex items-center justify-between mb-6">

          <p className="text-sm text-gray-500 font-medium">
            {meta?.total
              ? `Hiển thị ${products.length} / ${meta.total} sản phẩm`
              : "Không có sản phẩm"}
          </p>

          {totalPages > 0 && (
            <p className="text-sm text-gray-400">
              Trang{" "}
              <span className="font-bold text-gray-600">
                {displayedPage}
              </span>{" "}
              / {totalPages}
            </p>
          )}
        </div>

        {/* PRODUCT GRID */}

        <div className="relative">

          {productLoading ? (
            <div className="py-20 flex justify-center">
              <Loading />
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
                {products.map(
                  (product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                    />
                  ),
                )}
              </div>

              {/* PAGINATION */}

              {totalPages > 1 && (
                <div className="mt-12 flex justify-center">
                  <Pagination
                    currentPage={displayedPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          ) : (
            /* EMPTY STATE */

            <div className="text-center py-24 bg-white rounded-[32px] border border-gray-100 shadow-sm max-w-xl mx-auto flex flex-col items-center justify-center p-6">

              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-4">
                <Layers size={22} />
              </div>

              <h3 className="text-gray-700 font-black text-base mb-1">
                Không tìm thấy kết quả
              </h3>

              <p className="text-gray-400 font-medium text-sm">
                Hiện tại không tìm thấy sản phẩm nào phù hợp với bộ lọc hoặc từ khóa "
                {keyword}".
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductList;
