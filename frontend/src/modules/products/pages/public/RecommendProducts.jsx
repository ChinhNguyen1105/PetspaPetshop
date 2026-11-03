import React, { useEffect, useMemo, useRef, useState } from "react";
import { Sparkles, Loader2, Check, ShoppingBag } from "lucide-react";

import { useProductStore } from "../../store/productStore.js";
import useRecommendationStore from "../../../recommendations/store/apioriStore.js";
import { useCartStore } from "../../../cart/store/cartStore.js";
import { useProductImageStore } from "../../store/productImageStore.js";

const EMPTY_IDS = Object.freeze([]);
const FALLBACK_IMAGE = "https://placehold.co/100x100?text=No+Image";

// Tạo URL ảnh theo cơ chế tải file hiện tại của PetSpa.
const getProductImageUrl = (image) => {
  if (!image?.imageUrl) return FALLBACK_IMAGE;

  const apiBaseUrl = (
    import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1"
  ).replace(/\/+$/, "");

  const params = new URLSearchParams({
    fileName: image.imageUrl,
    folder: "products",
    inline: "true",
  });

  return `${apiBaseUrl}/files/download?${params.toString()}`;
};

const RecommendedProducts = ({ maxItems = 4, currentCartIds = EMPTY_IDS }) => {
  const {
    productRecommendations,
    fetchProductRecommendations,
    loading: recLoading,
    error: recError,
  } = useRecommendationStore();

  const { products, fetchProducts, loading: prodLoading } = useProductStore();

  const { imagesByProductId, fetchImages } = useProductImageStore();

  const addItemToCart = useCartStore((state) => state.addItem);

  const [recommendedList, setRecommendedList] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isAdding, setIsAdding] = useState(false);

  const lastFetchedIdsRef = useRef("");

  // Chuẩn hóa ID sản phẩm trong giỏ hàng.
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

  /*
  |--------------------------------------------------------------------------
  | STEP 1: FETCH PRODUCTS
  |--------------------------------------------------------------------------
  */
  useEffect(() => {
    if (!products?.length) {
      fetchProducts({ page: 1, pageSize: 50 });
    }
  }, [products?.length, fetchProducts]);

  /*
  |--------------------------------------------------------------------------
  | STEP 2: FETCH APRIORI RECOMMENDATIONS
  |--------------------------------------------------------------------------
  */
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

  /*
  |--------------------------------------------------------------------------
  | STEP 3: MAP RECOMMENDED IDS TO PRODUCTS
  |--------------------------------------------------------------------------
  */
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

    setSelectedIds(new Set(mapped.map((product) => product.id)));
  }, [
    currentIdsKey,
    cleanProductIds,
    productRecommendations,
    products,
    productsReady,
    maxItems,
  ]);

  /*
  |--------------------------------------------------------------------------
  | STEP 4: FETCH PRODUCT IMAGES
  |--------------------------------------------------------------------------
  */
  useEffect(() => {
    if (!recommendedList.length) return;

    recommendedList.forEach((product) => {
      const key = String(product.id);

      // Chỉ fetch nếu sản phẩm chưa có dữ liệu ảnh trong store.
      if (!Object.hasOwn(imagesByProductId, key)) {
        fetchImages(product.id).catch((error) => {
          console.error(`[PRODUCT IMAGE ERROR] Product ${product.id}:`, error);
        });
      }
    });
  }, [recommendedList, imagesByProductId, fetchImages]);

  /*
  |--------------------------------------------------------------------------
  | STEP 5: SELECTION
  |--------------------------------------------------------------------------
  */
  const toggleSelect = (id) => {
    setSelectedIds((previous) => {
      const next = new Set(previous);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  /*
  |--------------------------------------------------------------------------
  | STEP 6: TOTAL PRICE
  |--------------------------------------------------------------------------
  */
  const totalPrice = useMemo(() => {
    return recommendedList
      .filter((product) => selectedIds.has(product.id))
      .reduce((sum, product) => sum + (Number(product.price) || 0), 0);
  }, [recommendedList, selectedIds]);

  /*
  |--------------------------------------------------------------------------
  | STEP 7: ADD SELECTED PRODUCTS TO CART
  |--------------------------------------------------------------------------
  */
  const handleAddSelectedToCart = async () => {
    const itemsToAdd = recommendedList.filter((product) =>
      selectedIds.has(product.id),
    );

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
    <div className="my-6 rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm sm:p-6">
      {/* HEADER */}
      <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-amber-50 p-1 text-amber-500">
            <Sparkles size={16} fill="currentColor" />
          </div>

          <h2 className="text-sm font-black uppercase tracking-tight text-gray-900 sm:text-base">
            Thường mua kèm
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 items-center gap-4 lg:grid-cols-12 lg:gap-6">
        {/* CỘT TRÁI: DANH SÁCH SẢN PHẨM */}
        <div className="flex flex-col divide-y divide-gray-100 lg:col-span-8">
          {recommendedList.map((product) => {
            const isChecked = selectedIds.has(product.id);

            // Lấy danh sách ảnh theo product ID.
            const productImages = imagesByProductId[String(product.id)] || [];

            // Ưu tiên thumbnail hoặc ảnh chính.
            const thumbnail = productImages.find(
              (image) => image.isThumbnail || image.isMain,
            );

            const selectedImage = thumbnail || productImages[0];

            // Tạo URL download giống ProductDetail.
            const imageUrl = selectedImage
              ? getProductImageUrl(selectedImage)
              : FALLBACK_IMAGE;

            return (
              <div
                key={product.id}
                className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
              >
                {/* CHECKBOX */}
                <button
                  type="button"
                  onClick={() => toggleSelect(product.id)}
                  className={`flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded border transition-colors sm:h-6 sm:w-6 ${
                    isChecked
                      ? "border-pet-blue bg-pet-blue text-white"
                      : "border-gray-300 bg-white hover:border-gray-400"
                  }`}
                >
                  {isChecked && <Check size={14} strokeWidth={3} />}
                </button>

                {/* PRODUCT IMAGE */}
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50 sm:h-16 sm:w-16">
                  <img
                    src={imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover"
                    onError={(event) => {
                      event.currentTarget.src = FALLBACK_IMAGE;
                    }}
                  />
                </div>

                {/* PRODUCT INFORMATION */}
                <div className="flex min-w-0 flex-grow flex-col">
                  <span className="mb-0.5 text-xs font-bold text-gray-900 sm:text-sm">
                    {Number(product.price || 0).toLocaleString("vi-VN")} đ
                  </span>

                  <p className="line-clamp-2 text-[11px] font-medium text-gray-600 sm:text-xs">
                    {product.name}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CỘT PHẢI: TỔNG TIỀN VÀ NÚT THÊM GIỎ */}
        <div className="flex flex-col justify-start border-t border-gray-100 pt-4 lg:col-span-4 lg:border-l lg:border-t-0 lg:pt-0 lg:pl-6">
          <div className="mb-3 w-full text-left">
            <span className="text-xs font-medium text-gray-500 sm:text-sm">
              Tổng tiền:
            </span>

            <span className="ml-1 text-lg font-black text-gray-900 sm:text-xl">
              {totalPrice.toLocaleString("vi-VN")} đ
            </span>
          </div>

          <button
            type="button"
            disabled={selectedIds.size === 0 || isAdding}
            onClick={handleAddSelectedToCart}
            className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold text-white shadow-sm transition-all sm:py-3 sm:text-sm ${
              selectedIds.size === 0 || isAdding
                ? "cursor-not-allowed bg-gray-300 shadow-none"
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
