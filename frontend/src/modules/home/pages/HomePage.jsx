// src/pages/home/HomePage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

import Hero from "../components/Hero.jsx";
import StatsSection from "../components/StatsSection.jsx";
import FacilitiesTeaser from "../components/FacilitiesTeaser.jsx";
import ScrollReveal from "../components/Scrollreveal.jsx";

import Loading from "../../../shared/components/Loading.jsx";
import { Button } from "../../../shared/components/Button.jsx";

import ProductCard from "../../products/components/ProductCard.jsx";
import ServiceCard from "../../services/components/ServiceCard.jsx";

import { useProductStore } from "../../products/store/productStore.js";
import { useServiceStore } from "../../services/store/serviceStore.js";
import { useCategoryStore } from "../../categories/store/categoryStore.js";
import { useCart } from "../../cart/hooks/useCart.js";

const PRODUCT_TABS = [
  { value: "ALL", label: "Tất cả" },
  { value: "FOOD", label: "Thức ăn" },
  { value: "TOY", label: "Đồ chơi" },
  { value: "ACCESSORY", label: "Phụ kiện" },
];

const PRODUCT_NAME_KEYWORDS = {
  FOOD: ["thức ăn", "hạt", "pate", "pâté", "đồ ăn", "dinh dưỡng", "sữa"],
  TOY: ["đồ chơi", "bóng", "thú bông", "đồ gặm", "đồ chơi tương tác"],
  ACCESSORY: [
    "phụ kiện",
    "vòng cổ",
    "dây dắt",
    "lược",
    "sữa tắm",
    "dầu gội",
    "khay",
    "bát",
    "chuồng",
    "đệm",
    "túi vận chuyển",
  ],
};

const SERVICE_VISIBLE_COUNT = 4;

const SERVICE_GROUPS = [
  {
    key: "spa",
    title: "Spa chuyên sâu",
    subtitle: "Dành cho thú cưng của bạn",
    description:
      "Tắm, vệ sinh và chăm sóc bộ lông với quy trình phù hợp cho từng bé thú cưng.",
    buttonLabel: "Khám phá dịch vụ",
    categoryKeywords: ["spa", "tam", "ve sinh", "cham soc long"],
    sectionClass: "rounded-3xl bg-white",
  },
  {
    key: "medical",
    title: "Chăm sóc y tế – tiêm chủng",
    subtitle: "Sức khỏe là ưu tiên",
    description:
      "Tìm hiểu các dịch vụ chăm sóc sức khỏe, kiểm tra và tiêm chủng phù hợp cho thú cưng.",
    buttonLabel: "Tìm hiểu dịch vụ",
    categoryKeywords: ["y te", "tiem chung", "thu y", "suc khoe"],
    sectionClass: "rounded-3xl bg-blue-50",
  },
  {
    key: "boarding",
    title: "Dịch vụ trông giữ",
    subtitle: "An tâm khi vắng nhà",
    description:
      "Tìm hiểu dịch vụ lưu trú, trông giữ và chăm sóc thú cưng khi bạn bận rộn hoặc đi xa.",
    buttonLabel: "Liên hệ tư vấn",
    categoryKeywords: [
      "trong giu",
      "luu tru",
      "khach san thu cung",
      "boarding",
    ],
    sectionClass: "rounded-3xl border border-slate-100 bg-white shadow-sm",
  },
];

const normalizeText = (value) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[–—]/g, "-")
    .toLowerCase()
    .trim();

const getCategoryId = (category) =>
  category?.id ?? category?.categoryId ?? null;

const getCategoryName = (category) =>
  category?.name ?? category?.categoryName ?? "";

const getServiceCategoryName = (service) =>
  service?.categoryName ?? service?.category?.name ?? "";

const getListFromResponse = (response) => {
  const candidates = [
    response?.data?.result,
    response?.data?.data?.result,
    response?.result,
    response?.data?.data,
    response?.data,
  ];

  return candidates.find(Array.isArray) ?? [];
};

const isServiceCategory = (category) => {
  const type = normalizeText(category?.categoryType);

  return ["service", "pet service", "pet_service", "service category"].includes(
    type,
  );
};

const findServiceCategory = (categories, group) => {
  const activeCategories = categories.filter(
    (category) =>
      category?.activeFlag !== false &&
      category?.deleteFlag !== true &&
      isServiceCategory(category),
  );

  return (
    activeCategories.find((category) => {
      const name = normalizeText(getCategoryName(category));

      return group.categoryKeywords.some((keyword) =>
        name.includes(normalizeText(keyword)),
      );
    }) ?? null
  );
};

const HomePage = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [activeTab, setActiveTab] = useState("ALL");

  const [servicesByGroup, setServicesByGroup] = useState({
    spa: [],
    medical: [],
    boarding: [],
  });

  const [serviceOffsets, setServiceOffsets] = useState({
    spa: 0,
    medical: 0,
    boarding: 0,
  });

  const [serviceGroupsLoading, setServiceGroupsLoading] = useState(false);
  const [serviceGroupsError, setServiceGroupsError] = useState(false);

  const {
    products: allProducts = [],
    loading: productLoading,
    fetchProducts,
  } = useProductStore();

  const { fetchServices } = useServiceStore();

  const {
    categories: allCategories = [],
    loading: categoryLoading,
    fetchCategories,
  } = useCategoryStore();

  const products = Array.isArray(allProducts) ? allProducts : [];
  const categories = Array.isArray(allCategories) ? allCategories : [];

  // Tải sản phẩm và danh mục.
  useEffect(() => {
    fetchProducts();
    fetchCategories({ page: 1, pageSize: 100 });
  }, [fetchProducts, fetchCategories]);

  // Tải dịch vụ riêng cho từng danh mục.
  useEffect(() => {
    if (categories.length === 0) return;

    let cancelled = false;

    const loadServicesByCategory = async () => {
      setServiceGroupsLoading(true);
      setServiceGroupsError(false);

      const nextGroups = {
        spa: [],
        medical: [],
        boarding: [],
      };

      try {
        for (const group of SERVICE_GROUPS) {
          const category = findServiceCategory(categories, group);

          if (!category) {
            nextGroups[group.key] = [];
            continue;
          }

          const categoryName = getCategoryName(category);

          const response = await fetchServices({
            page: 1,
            pageSize: 100,
            filter: `category.name='${categoryName.replace(/'/g, "\\'")}'`,
          });

          if (cancelled) return;

          const returnedServices = getListFromResponse(response);
          const storeServices = useServiceStore.getState().services;

          const serviceList =
            returnedServices.length > 0
              ? returnedServices
              : Array.isArray(storeServices)
                ? storeServices
                : [];

          nextGroups[group.key] = serviceList.filter((service) => {
            const serviceCategoryName = getServiceCategoryName(service);

            if (!serviceCategoryName) return true;

            return (
              normalizeText(serviceCategoryName) === normalizeText(categoryName)
            );
          });
        }

        if (!cancelled) {
          setServicesByGroup(nextGroups);
          setServiceOffsets({
            spa: 0,
            medical: 0,
            boarding: 0,
          });
        }
      } catch (error) {
        console.error("Không thể tải dịch vụ theo danh mục:", error);

        if (!cancelled) {
          setServiceGroupsError(true);
        }
      } finally {
        if (!cancelled) {
          setServiceGroupsLoading(false);
        }
      }
    };

    loadServicesByCategory();

    return () => {
      cancelled = true;
    };
  }, [categories, fetchServices]);

  // Lọc sản phẩm theo product.name, không dựa vào categoryId/categoryName.
  const filteredProducts = useMemo(() => {
    if (activeTab === "ALL") {
      return products.slice(0, 4);
    }

    const keywords = PRODUCT_NAME_KEYWORDS[activeTab] ?? [];

    return products
      .filter((product) => {
        const productName = normalizeText(product?.name);

        return keywords.some((keyword) =>
          productName.includes(normalizeText(keyword)),
        );
      })
      .slice(0, 4);
  }, [products, activeTab]);

  const scrollServices = (groupKey, direction, totalServices) => {
    const maxOffset = Math.max(0, totalServices - SERVICE_VISIBLE_COUNT);

    setServiceOffsets((previous) => ({
      ...previous,
      [groupKey]: Math.min(
        maxOffset,
        Math.max(0, (previous[groupKey] ?? 0) + direction),
      ),
    }));
  };

  const renderServiceSection = (group) => {
    const groupServices = servicesByGroup[group.key] ?? [];

    const maxOffset = Math.max(0, groupServices.length - SERVICE_VISIBLE_COUNT);

    const currentOffset = Math.min(serviceOffsets[group.key] ?? 0, maxOffset);

    const visibleServices = groupServices.slice(
      currentOffset,
      currentOffset + SERVICE_VISIBLE_COUNT,
    );

    const canScrollLeft = currentOffset > 0;
    const canScrollRight = currentOffset < maxOffset;

    return (
      <section
        key={group.key}
        id={
          group.key === "boarding"
            ? "pet-boarding"
            : group.key === "medical"
              ? "medical-care"
              : "spa"
        }
        className="scroll-mt-24"
      >
        <ScrollReveal variant="fade-up" duration={700}>
          <div
            className={`mb-8 flex flex-col gap-6 p-7 sm:p-10 lg:flex-row lg:items-end lg:justify-between ${group.sectionClass}`}
          >
            <div className="max-w-3xl">
              <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-pet-orange">
                {group.subtitle}
              </span>

              <h2 className="text-3xl font-black uppercase tracking-tight text-slate-800">
                {group.title}
              </h2>

              <p className="mt-3 text-sm leading-7 text-slate-600">
                {group.description}
              </p>
            </div>

            <Button
              onClick={() => navigate("/spa")}
              className="shrink-0 self-start lg:self-auto"
            >
              {group.buttonLabel} →
            </Button>
          </div>
        </ScrollReveal>

        {serviceGroupsLoading && groupServices.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-500">
            Đang tải dịch vụ...
          </div>
        ) : groupServices.length > 0 ? (
          <>
            <div className="relative px-2 sm:px-0">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {visibleServices.map((service, index) => (
                  <ScrollReveal
                    key={service.id}
                    variant="fade-up"
                    delay={index * 60}
                    duration={600}
                    threshold={0.1}
                  >
                    <ServiceCard
                      service={service}
                      onBookingClick={() =>
                        navigate(`/spa/booking/create?serviceId=${service.id}`)
                      }
                    />
                  </ScrollReveal>
                ))}
              </div>

              {canScrollLeft && (
                <button
                  type="button"
                  aria-label={`Xem dịch vụ ${group.title} trước đó`}
                  onClick={() =>
                    scrollServices(group.key, -1, groupServices.length)
                  }
                  className="absolute left-0 top-1/2 z-10 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-lg transition hover:bg-slate-100"
                >
                  <ChevronLeft size={22} />
                </button>
              )}

              {canScrollRight && (
                <button
                  type="button"
                  aria-label={`Xem thêm dịch vụ ${group.title}`}
                  onClick={() =>
                    scrollServices(group.key, 1, groupServices.length)
                  }
                  className="absolute right-0 top-1/2 z-10 flex h-10 w-10 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-lg transition hover:bg-slate-100"
                >
                  <ChevronRight size={22} />
                </button>
              )}
            </div>

            {groupServices.length > SERVICE_VISIBLE_COUNT && (
              <div className="mt-5 flex items-center justify-center gap-2">
                {Array.from({
                  length: groupServices.length - SERVICE_VISIBLE_COUNT + 1,
                }).map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    aria-label={`Chuyển đến nhóm dịch vụ ${index + 1}`}
                    onClick={() =>
                      setServiceOffsets((previous) => ({
                        ...previous,
                        [group.key]: index,
                      }))
                    }
                    className={`h-2 rounded-full transition-all ${
                      currentOffset === index
                        ? "w-6 bg-pet-blue"
                        : "w-2 bg-slate-300 hover:bg-slate-400"
                    }`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="rounded-2xl bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
            {serviceGroupsError
              ? "Không thể tải dịch vụ. Vui lòng thử lại sau."
              : "Hiện chưa có dịch vụ thuộc danh mục này."}
          </div>
        )}
      </section>
    );
  };

  const isInitialLoading =
    (productLoading || categoryLoading) &&
    products.length === 0 &&
    categories.length === 0;

  if (isInitialLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loading size="large" />
      </div>
    );
  }

  return (
    <main className="homepage-container mx-auto w-full px-0">
      {/* 1. HERO */}
      <Hero />

      <div className="space-y-20 px-5 py-12 sm:px-8 lg:px-20">
        {/* 2. SPA CHUYÊN SÂU */}
        {renderServiceSection(SERVICE_GROUPS[0])}

        {/* 3. CHĂM SÓC Y TẾ - TIÊM CHỦNG */}
        {renderServiceSection(SERVICE_GROUPS[1])}

        {/* 4. DỊCH VỤ TRÔNG GIỮ */}
        {renderServiceSection(SERVICE_GROUPS[2])}

        {/* 5. SẢN PHẨM CHO THÚ CƯNG */}
        <section id="products" className="scroll-mt-24">
          <ScrollReveal variant="fade-down" duration={600}>
            <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-pet-orange">
                  Cửa hàng bách hóa Boss
                </span>

                <h2 className="text-3xl font-black uppercase tracking-tight text-slate-800">
                  Sản phẩm cho thú cưng
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Thức ăn, đồ chơi và phụ kiện dành cho những người bạn bốn
                  chân.
                </p>
              </div>

              <div className="flex max-w-full self-start overflow-x-auto rounded-xl bg-slate-100 p-1 lg:self-auto">
                {PRODUCT_TABS.map((tab) => (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setActiveTab(tab.value)}
                    className={`whitespace-nowrap rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                      activeTab === tab.value
                        ? "bg-pet-blue text-white shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-5 md:grid-cols-4 md:gap-6">
              {filteredProducts.map((product, index) => (
                <ScrollReveal
                  key={product.id}
                  variant="fade-up"
                  delay={index * 75}
                  duration={600}
                  threshold={0.08}
                >
                  <ProductCard
                    product={product}
                    onAddToCart={() => addToCart(product)}
                    onClick={() => navigate(`/shop/product/${product.id}`)}
                  />
                </ScrollReveal>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center font-medium text-slate-400">
              Không tìm thấy sản phẩm phù hợp với từ khóa của danh mục này.
            </div>
          )}

          <div className="mt-8 text-center">
            <Button onClick={() => navigate("/shop")} className="font-bold">
              Xem tất cả sản phẩm →
            </Button>
          </div>
        </section>

        {/* 6. CƠ SỞ VẬT CHẤT */}
        <section id="facilities" className="scroll-mt-24">
          <ScrollReveal variant="fade-up" duration={800} threshold={0.2}>
            <FacilitiesTeaser />
          </ScrollReveal>
        </section>

        {/* 7. CÁC CON SỐ ẤN TƯỢNG */}
        <section id="stats" className="scroll-mt-24">
          <ScrollReveal variant="zoom-in" duration={800} threshold={0.2}>
            <StatsSection />
          </ScrollReveal>
        </section>

        {/* 8. ĐÁNH GIÁ TỪ KHÁCH HÀNG */}
        <section id="customer-reviews" className="scroll-mt-24">
          <ScrollReveal variant="fade-up" duration={700}>
            <div className="mb-8 text-center">
              <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-pet-orange">
                Những người bạn đồng hành
              </span>

              <h2 className="text-3xl font-black uppercase tracking-tight text-slate-800">
                Đánh giá từ khách hàng
              </h2>

              <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-500">
                Sự tin tưởng và hài lòng của khách hàng là động lực để chúng tôi
                không ngừng cải thiện dịch vụ.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50 px-6 py-10 text-center">
              <p className="font-semibold text-slate-600">
                Đánh giá khách hàng sẽ được hiển thị tại đây khi có API danh
                sách đánh giá phù hợp.
              </p>
            </div>
          </ScrollReveal>
        </section>
      </div>
    </main>
  );
};

export default HomePage;
