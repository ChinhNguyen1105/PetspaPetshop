import React, { useEffect, useMemo, useState } from "react";

import { Search, SlidersHorizontal, Layers } from "lucide-react";

import { useServiceStore } from "../../store/serviceStore";
import { useCategoryStore } from "../../store/categoryStore";

import Loading from "../../components/common/Loading";
import ServiceCard from "../../components/ui/ServiceCard";
import Pagination from "../../components/common/Pagination";

const ServiceList = () => {
  const [filterCategoryId, setFilterCategoryId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const PAGE_SIZE = 10;

  const {
    services,
    meta,
    loading: loadingServices,
    fetchServices,
    searchServices,
    fetchServicesByCategory,
  } = useServiceStore();

  const {
    categories,
    loading: loadingCategories,
    fetchCategories,
  } = useCategoryStore();

  // ───────────────── FETCH CATEGORIES ─────────────────

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // ───────────────── FETCH SERVICES ─────────────────

  useEffect(() => {
    const loadServices = async () => {
      const params = {
        page: currentPage,
        pageSize: PAGE_SIZE,
      };

      // Có category
      if (filterCategoryId !== null) {
        await fetchServicesByCategory(filterCategoryId, params);

        return;
      }

      // Có keyword
      if (searchTerm.trim()) {
        await searchServices(searchTerm.trim(), params);

        return;
      }

      // Tất cả services
      await fetchServices(params);
    };

    loadServices();
  }, [
    currentPage,
    filterCategoryId,
    searchTerm,
    fetchServices,
    fetchServicesByCategory,
    searchServices,
  ]);

  // ───────────────── FILTER CATEGORIES ─────────────────

  const filteredCategories = useMemo(() => {
    return Array.isArray(categories)
      ? categories.filter((cat) => cat && cat.categoryType === "SERVICE")
      : [];
  }, [categories]);

  // ───────────────── SELECTED CATEGORY ─────────────────

  const selectedCategory = useMemo(() => {
    if (filterCategoryId === null) {
      return null;
    }

    return filteredCategories.find(
      (cat) => Number(cat.id) === Number(filterCategoryId),
    );
  }, [filteredCategories, filterCategoryId]);

  // ───────────────── CURRENT SERVICES ─────────────────

  const currentServices = useMemo(() => {
    return Array.isArray(services) ? services.filter(Boolean) : [];
  }, [services]);

  // ───────────────── PAGINATION ─────────────────

  const totalPages = Number(meta?.pages) || 0;

  // ───────────────── CATEGORY CHANGE ─────────────────

  const handleCategoryChange = (id) => {
    setCurrentPage(1);

    setFilterCategoryId(id === null ? null : Number(id));
  };

  // ───────────────── SEARCH CHANGE ─────────────────

  const handleSearchChange = (e) => {
    const value = e.target.value;

    setSearchTerm(value);
    setCurrentPage(1);
  };

  // ───────────────── PAGE CHANGE ─────────────────

  const handlePageChange = (page) => {
    if (page < 1 || (totalPages > 0 && page > totalPages)) {
      return;
    }

    setCurrentPage(page);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ───────────────── LOADING ─────────────────

  const isFirstLoad =
    loadingCategories || (loadingServices && currentServices.length === 0);

  if (isFirstLoad) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50/50">
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pt-10 pb-20 text-left">
      <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
        {/* ───────────────── HEADER ───────────────── */}

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black text-pet-blue mb-2">
              Dịch Vụ Petspa
            </h1>

            <p className="text-gray-500 font-medium">
              Chăm sóc thú cưng của bạn bằng tất cả tình yêu thương
            </p>
          </div>

          {/* ───────────────── CATEGORY FILTER ───────────────── */}

          <div className="flex flex-wrap gap-3 items-center">
            <button
              onClick={() => handleCategoryChange(null)}
              className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer border outline-none ${
                filterCategoryId === null
                  ? "bg-pet-blue text-white border-pet-blue shadow-lg shadow-blue-500/10"
                  : "bg-white text-gray-500 hover:bg-gray-100 border-gray-200"
              }`}
            >
              Tất Cả
            </button>

            {filteredCategories.map((cat) => {
              const categoryName = cat.name;

              const currentId = Number(cat.id);

              if (!categoryName) {
                return null;
              }

              return (
                <button
                  key={currentId}
                  onClick={() => handleCategoryChange(currentId)}
                  className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer border outline-none ${
                    Number(filterCategoryId) === currentId
                      ? "bg-pet-blue text-white border-pet-blue shadow-lg shadow-blue-500/10"
                      : "bg-white text-gray-500 hover:bg-gray-100 border-gray-200"
                  }`}
                >
                  {categoryName}
                </button>
              );
            })}
          </div>
        </div>

        {/* ───────────────── TOOLBAR ───────────────── */}

        <div className="bg-white p-4 rounded-2xl border border-gray-100 mb-8 flex flex-col sm:flex-row gap-4 justify-between items-center shadow-sm">
          <div className="relative w-full sm:w-96">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />

            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Tìm kiếm tên dịch vụ hoặc mô tả..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-gray-100 outline-none transition-all font-medium text-gray-700"
            />
          </div>

          <button className="flex items-center gap-2 text-gray-600 font-black text-xs uppercase tracking-wider hover:text-pet-blue transition-colors cursor-pointer bg-transparent border-none outline-none">
            <SlidersHorizontal size={16} />
            Sắp xếp theo: Phổ biến nhất
          </button>
        </div>

        {/* ───────────────── RESULT INFO ───────────────── */}

        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500 font-medium">
            {meta?.total
              ? `Hiển thị ${currentServices.length} / ${meta.total} dịch vụ`
              : "Không có dịch vụ"}
          </p>

          {totalPages > 0 && (
            <p className="text-sm text-gray-400">
              Trang{" "}
              <span className="font-bold text-gray-600">
                {meta?.page || currentPage}
              </span>{" "}
              / {totalPages}
            </p>
          )}
        </div>

        {/* ───────────────── LOADING WHEN CHANGING PAGE ───────────────── */}

        {loadingServices ? (
          <div className="py-20 flex justify-center">
            <Loading />
          </div>
        ) : currentServices.length > 0 ? (
          <>
            {/* ───────────────── SERVICE GRID ───────────────── */}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
              {currentServices.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>

            {/* ───────────────── PAGINATION ───────────────── */}

            {totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <Pagination
                  currentPage={meta?.page || currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        ) : (
          /* ───────────────── EMPTY ───────────────── */

          <div className="text-center py-24 bg-white rounded-[32px] border border-gray-100 shadow-sm max-w-xl mx-auto flex flex-col items-center justify-center p-6">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-4">
              <Layers size={22} />
            </div>

            <h3 className="text-gray-700 font-black text-base mb-1">
              Không tìm thấy kết quả
            </h3>

            <p className="text-gray-400 font-medium text-sm">
              Không tìm thấy dịch vụ nào phù hợp với danh mục hoặc từ khóa "
              {searchTerm}
              ".
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceList;
