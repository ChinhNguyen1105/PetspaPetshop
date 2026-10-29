import React, { useEffect, useMemo, useRef, useState } from "react";
import { Sparkles, Loader2, Check, ShoppingBag } from "lucide-react";

import { useProductStore } from "../../store/productStore.js";
import useRecommendationStore from "../../../recommendations/store/apioriStore.js";
import { useCartStore } from "../../../cart/store/cartStore.js";

const EMPTY_IDS = Object.freeze([]);

const RecommendedProducts = ({ maxItems = 4, currentCartIds = EMPTY_IDS }) => {
  const {
    productRecommendations,
    fetchProductRecommendations,
    loading: recLoading,
    error: recError,
  } = useRecommendationStore();

  const { products, fetchProducts, loading: prodLoading } = useProductStore();
  const addItemToCart = useCartStore((state) => state.addItem);

  const [recommendedList, setRecommendedList] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isAdding, setIsAdding] = useState(false);
  const lastFetchedIdsRef = useRef("");

  const currentIdsKey = useMemo(() => {
    if (!Array.isArray(currentCartIds)) return "";

    return Array.from(
      new Set(
        currentCartIds
          .filter((id) => id !== null && id !== undefined && id !== "")
          .map(Number)
          .filter(Number.isFinite),
      ),
    )
      .sort((a, b) => a - b)
      .join(",");
  }, [currentCartIds]);

  const cleanProductIds = useMemo(
    () => (currentIdsKey ? currentIdsKey.split(",").map(Number) : []),
    [currentIdsKey],
  );

  const productsReady = products?.length > 0;

  // STEP 1: Tải danh sách sản phẩm nền
  useEffect(() => {
    if (!products?.length) {
      fetchProducts({ page: 1, pageSize: 50 });
    }
  }, [products?.length, fetchProducts]);

  // STEP 2: Gọi API Apriori
  useEffect(() => {
    if (cleanProductIds.length === 0) {
      lastFetchedIdsRef.current = "";
      setRecommendedList((previous) => (previous.length === 0 ? previous : []));
      return;
    }

    if (lastFetchedIdsRef.current === currentIdsKey) return;

    lastFetchedIdsRef.current = currentIdsKey;

    fetchProductRecommendations(cleanProductIds).catch((error) => {
      if (lastFetchedIdsRef.current === currentIdsKey) {
        lastFetchedIdsRef.current = "";
      }
      console.error("[APRIORI PRODUCT PIPELINE ERROR]:", error);
    });
  }, [currentIdsKey, cleanProductIds, fetchProductRecommendations]);

  // STEP 3: Ánh xạ ID gợi ý thành dữ liệu sản phẩm & mặc định chọn tất cả
  useEffect(() => {
    if (
      cleanProductIds.length === 0 ||
      !productRecommendations?.length ||
      !productsReady
    ) {
      setRecommendedList((previous) => (previous.length === 0 ? previous : []));
      return;
    }

    const inputIds = new Set(cleanProductIds.map(String));

    const mapped = productRecommendations
      .filter((id) => !inputIds.has(String(id)))
      .map((id) =>
        products.find((product) => String(product.id) === String(id)),
      )
      .filter(Boolean)
      .filter((product) => {
        const stock = Number(product.stockQuantity);

        return (
          product.activeFlag !== false &&
          product.activeFlag !== 0 &&
          product.deleteFlag !== true &&
          product.deleteFlag !== 1 &&
          product.status !== "OUT_OF_STOCK" &&
          Number.isFinite(stock) &&
          stock > 0
        );
      })
      .slice(0, maxItems);

    setRecommendedList((previous) => {
      const same =
        previous.length === mapped.length &&
        previous.every((product, index) => product.id === mapped[index]?.id);

      return same ? previous : mapped;
    });

    // Mặc định chọn tất cả các sản phẩm gợi ý
    setSelectedIds(new Set(mapped.map((p) => p.id)));
  }, [
    currentIdsKey,
    cleanProductIds,
    productRecommendations,
    products,
    productsReady,
    maxItems,
  ]);

  // Toggle chọn/bỏ chọn sản phẩm
  const toggleSelect = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  // Tính tổng tiền các sản phẩm được chọn
  const totalPrice = useMemo(() => {
    return recommendedList
      .filter((p) => selectedIds.has(p.id))
      .reduce((sum, p) => sum + (Number(p.price) || 0), 0);
  }, [recommendedList, selectedIds]);

  // Thêm các sản phẩm được chọn vào giỏ hàng
  const handleAddSelectedToCart = async () => {
    const itemsToAdd = recommendedList.filter((p) => selectedIds.has(p.id));
    if (itemsToAdd.length === 0) return;

    setIsAdding(true);
    try {
      for (const item of itemsToAdd) {
        await addItemToCart(item, 1);
      }
    } catch (error) {
      console.error("Lỗi khi thêm sản phẩm mua kèm vào giỏ:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const isLoading = (recLoading || prodLoading) && recommendedList.length === 0;

  if (recError) return null;

  if (isLoading) {
    return (
      <div className="my-6 flex flex-col items-center justify-center gap-2 rounded-2xl border border-gray-100 bg-white py-8 text-gray-400">
        <Loader2 className="animate-spin text-pet-blue" size={24} />
        <p className="text-xs font-semibold text-gray-500">
          Đang tính toán sản phẩm mua kèm phù hợp...
        </p>
      </div>
    );
  }

  if (!recommendedList.length) return null;

  return (
    <div className="my-6 rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 text-left shadow-sm">
      {/* HEADER */}
      <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-amber-50 p-1 text-amber-500">
            <Sparkles size={16} fill="currentColor" />
          </div>
          <h2 className="text-sm sm:text-base font-black uppercase tracking-tight text-gray-900">
            Thường mua kèm
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-center">
        {/* CỘT TRÁI: DANH SÁCH SẢN PHẨM & CHECKBOX */}
        <div className="lg:col-span-8 flex flex-col divide-y divide-gray-100">
          {recommendedList.map((product) => {
            const isChecked = selectedIds.has(product.id);
            const imageUrl =
              product.imageUrl ||
              product.image ||
              "https://placehold.co/100x100?text=No+Image";

            return (
              <div
                key={product.id}
                className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
              >
                {/* Checkbox custom */}
                <button
                  type="button"
                  onClick={() => toggleSelect(product.id)}
                  className={`flex h-5 w-5 sm:h-6 sm:w-6 shrink-0 items-center justify-center rounded border transition-colors cursor-pointer ${
                    isChecked
                      ? "bg-pet-blue border-pet-blue text-white"
                      : "border-gray-300 bg-white hover:border-gray-400"
                  }`}
                >
                  {isChecked && <Check size={14} strokeWidth={3} />}
                </button>

                {/* Hình ảnh sản phẩm (nhỏ gọn trên mobile) */}
                <div className="h-14 w-14 sm:h-16 sm:w-16 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                  <img
                    src={imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Thông tin sản phẩm */}
                <div className="flex flex-col flex-grow min-w-0">
                  <span className="text-xs sm:text-sm font-bold text-gray-900 mb-0.5">
                    {Number(product.price || 0).toLocaleString("vi-VN")} đ
                  </span>
                  <p className="text-[11px] sm:text-xs font-medium text-gray-600 line-clamp-2">
                    {product.name}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CỘT PHẢI: TỔNG TIỀN (SÁT LỀ TRÁI, ĐẶT PHÍA TRÊN) & NÚT THÊM VÀO GIỎ */}
        <div className="lg:col-span-4 flex flex-col justify-start border-t lg:border-t-0 lg:border-l border-gray-100 pt-4 lg:pt-0 lg:pl-6">
          <div className="w-full text-left mb-3">
            <span className="text-xs sm:text-sm text-gray-500 font-medium">
              Tổng tiền:{" "}
            </span>
            <span className="text-lg sm:text-xl font-black text-gray-900 ml-1">
              {totalPrice.toLocaleString("vi-VN")} đ
            </span>
          </div>

          <button
            type="button"
            disabled={selectedIds.size === 0 || isAdding}
            onClick={handleAddSelectedToCart}
            className={`w-full py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm text-white shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
              selectedIds.size === 0 || isAdding
                ? "bg-gray-300 cursor-not-allowed shadow-none"
                : "bg-pet-blue hover:bg-blue-700 active:scale-95"
            }`}
          >
            {isAdding ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                Đang thêm...
              </>
            ) : (
              <>
                <ShoppingBag size={16} />
                Thêm vào giỏ
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecommendedProducts;
