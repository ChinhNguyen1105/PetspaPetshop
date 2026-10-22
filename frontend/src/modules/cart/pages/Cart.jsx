import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Trash2, Plus, Minus, Image } from "lucide-react";

import { useCartStore } from "../store/cartStore.js";
import { useProductImageStore } from "../../products/store/productImageStore.js";

import {
  validateCartItemId,
  validateCartQuantity,
  validateCartSummary,
} from "../validators/cartValidator.js";

import { Button } from "../../../shared/components/Button.jsx";
import { formatPrice } from "../../../shared/utils/formatPrice.js";

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1548767797-d8c844163c4c?q=80&w=200";

const CartItemRow = ({ item, updateQuantity, removeItem, showToast }) => {
  const [imgUrl, setImgUrl] = useState(FALLBACK_IMG);
  const [loadingImg, setLoadingImg] = useState(true);
  const [quantityError, setQuantityError] = useState("");

  const fetchImages = useProductImageStore((state) => state.fetchImages);

  useEffect(() => {
    let isMounted = true;

    const loadProductThumbnail = async () => {
      setLoadingImg(true);

      if (
        typeof item?.productImage === "string" &&
        item.productImage.trim() !== ""
      ) {
        if (isMounted) {
          setImgUrl(item.productImage);
          setLoadingImg(false);
        }
        return;
      }

      if (!item?.productId) {
        if (isMounted) {
          setImgUrl(FALLBACK_IMG);
          setLoadingImg(false);
        }
        return;
      }

      try {
        const res = await fetchImages(item.productId);

        if (!isMounted) return;

        const images = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
            ? res.data
            : Array.isArray(res?.data?.data)
              ? res.data.data
              : [];

        const mainImg =
          images.find((img) => img?.isThumbnail === true) ||
          images.find((img) => img?.isMain === true) ||
          images[0];

        const imageUrl = mainImg?.imageUrl || mainImg?.url || "";

        setImgUrl(imageUrl || FALLBACK_IMG);
      } catch (error) {
        console.error(
          `Không thể lấy ảnh cho sản phẩm ${item.productId}:`,
          error,
        );

        if (isMounted) {
          setImgUrl(FALLBACK_IMG);
        }
      } finally {
        if (isMounted) {
          setLoadingImg(false);
        }
      }
    };

    loadProductThumbnail();

    return () => {
      isMounted = false;
    };
  }, [item?.productId, item?.productImage, fetchImages]);

  const handleImageError = (event) => {
    if (event.currentTarget.src !== FALLBACK_IMG) {
      event.currentTarget.src = FALLBACK_IMG;
    }
  };

  const handleUpdateQuantity = (nextQuantity) => {
    const idValidation = validateCartItemId(item?.id);

    if (!idValidation.isValid) {
      showToast(idValidation.error, "error");
      return;
    }

    const quantityValidation = validateCartQuantity(nextQuantity);

    if (!quantityValidation.isValid) {
      const message =
        quantityValidation.errors?.quantity ||
        "Số lượng sản phẩm không hợp lệ.";

      setQuantityError(message);
      showToast(message, "error");
      return;
    }

    setQuantityError("");
    updateQuantity(item.id, quantityValidation.data.quantity);
  };

  const handleRemoveItem = () => {
    const idValidation = validateCartItemId(item?.id);

    if (!idValidation.isValid) {
      showToast(idValidation.error, "error");
      return;
    }

    removeItem(item.id);
  };

  const quantity = Number(item?.quantity);
  const validQuantity = Number.isInteger(quantity) && quantity >= 1;

  return (
    <div className="rounded-2xl border border-gray-50 bg-white p-4 shadow-sm transition-all hover:border-gray-100">
      <div className="flex items-center gap-4">
        {/* Ảnh sản phẩm */}
        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
          {loadingImg ? (
            <div className="absolute inset-0 flex animate-pulse items-center justify-center bg-gray-100">
              <Image className="animate-bounce text-gray-300" size={20} />
            </div>
          ) : (
            <img
              src={imgUrl || FALLBACK_IMG}
              className="h-full w-full object-cover"
              alt={item?.productName || "Sản phẩm"}
              onError={handleImageError}
            />
          )}
        </div>

        {/* Thông tin sản phẩm */}
        <div className="min-w-0 flex-grow text-left">
          <h3 className="line-clamp-1 font-bold text-gray-800">
            {item?.productName || "Sản phẩm"}
          </h3>

          <p className="mt-0.5 font-black text-pet-orange">
            {formatPrice(item?.productPrice)}
          </p>
        </div>

        {/* Số lượng */}
        <div className="flex flex-shrink-0 flex-col items-center gap-1">
          <div className="flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 p-1.5">
            <button
              type="button"
              aria-label="Giảm số lượng"
              onClick={() => handleUpdateQuantity(quantity - 1)}
              disabled={!validQuantity || quantity <= 1}
              className="cursor-pointer rounded-lg bg-white p-1 text-gray-600 shadow-sm transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Minus size={14} />
            </button>

            <span className="w-8 text-center text-sm font-bold text-gray-800">
              {validQuantity ? quantity : "—"}
            </span>

            <button
              type="button"
              aria-label="Tăng số lượng"
              onClick={() => handleUpdateQuantity(quantity + 1)}
              disabled={!validQuantity}
              className="cursor-pointer rounded-lg bg-white p-1 text-gray-600 shadow-sm transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus size={14} />
            </button>
          </div>

          {quantityError && (
            <p className="max-w-32 text-center text-xs text-red-500">
              {quantityError}
            </p>
          )}
        </div>

        {/* Xóa sản phẩm */}
        <button
          type="button"
          aria-label="Xóa sản phẩm khỏi giỏ hàng"
          onClick={handleRemoveItem}
          className="flex-shrink-0 cursor-pointer rounded-xl border-none bg-transparent p-2 text-red-400 transition-all hover:bg-red-50 hover:text-red-500"
        >
          <Trash2 size={20} />
        </button>
      </div>
    </div>
  );
};

const Cart = () => {
  const itemDtoList = useCartStore((state) => state.itemDtoList);
  const totalAmount = useCartStore((state) => state.totalAmount);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const fetchCart = useCartStore((state) => state.fetchCart);
  const isLoading = useCartStore((state) => state.isLoading);
  const showToast = useCartStore((state) => state.showToast);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const safeItems = Array.isArray(itemDtoList) ? itemDtoList : [];

  const summaryValidation = validateCartSummary({
    itemDtoList: safeItems,
    totalAmount,
  });

  const invalidItems = safeItems.filter(
    (item) => !validateCartItemForDisplay(item),
  );

  function validateCartItemForDisplay(item) {
    const quantity = Number(item?.quantity);
    const price = Number(item?.productPrice);

    return (
      item?.id !== undefined &&
      item?.id !== null &&
      String(item.id).trim() !== "" &&
      Number.isSafeInteger(Number(item.id)) &&
      Number(item.id) > 0 &&
      Number.isInteger(quantity) &&
      quantity >= 1 &&
      Number.isFinite(price) &&
      price >= 0
    );
  }

  if (isLoading && safeItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32 text-center">
        <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-pet-blue border-t-transparent" />

        <h2 className="text-xl font-bold text-gray-600">
          Đang tải giỏ hàng của bạn...
        </h2>
      </div>
    );
  }

  if (!summaryValidation.isValid) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 pt-32 text-center">
        <h2 className="mb-2 text-2xl font-black text-gray-800">
          Không thể hiển thị giỏ hàng
        </h2>

        <p className="mb-6 text-sm text-red-500">
          Dữ liệu giỏ hàng không hợp lệ. Vui lòng tải lại.
        </p>

        <Button onClick={() => fetchCart()} className="rounded-xl">
          Tải lại giỏ hàng
        </Button>
      </div>
    );
  }

  if (safeItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32 text-center">
        <h2 className="mb-2 text-2xl font-black text-gray-800">
          Giỏ hàng trống trơn! 🛒
        </h2>

        <p className="mb-6 text-sm font-medium text-gray-500">
          Hãy tìm thêm các sản phẩm chăm sóc thú cưng chất lượng nhé.
        </p>

        <Link to="/shop">
          <Button className="!rounded-xl !px-8 !py-3 text-xs font-black uppercase tracking-wide">
            Quay lại cửa hàng
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 pt-10">
      <div className="container mx-auto max-w-5xl px-4 md:px-10">
        <h1 className="mb-8 text-left text-3xl font-black uppercase tracking-tight text-pet-blue">
          Giỏ hàng của bạn
        </h1>

        {invalidItems.length > 0 && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Có {invalidItems.length} sản phẩm chứa dữ liệu không hợp lệ. Vui
            lòng kiểm tra lại hoặc tải lại giỏ hàng trước khi thanh toán.
          </div>
        )}

        <div className="grid items-start gap-8 lg:grid-cols-12">
          {/* Danh sách sản phẩm */}
          <div className="space-y-4 lg:col-span-8">
            {safeItems.map((item, index) => (
              <CartItemRow
                key={item?.id ?? `invalid-cart-item-${index}`}
                item={item}
                updateQuantity={updateQuantity}
                removeItem={removeItem}
                showToast={showToast}
              />
            ))}
          </div>

          {/* Tóm tắt đơn hàng */}
          <div className="sticky top-24 text-left lg:col-span-4">
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="mb-4 border-b border-gray-50 pb-3 text-lg font-black uppercase tracking-wider text-gray-800">
                Tóm tắt đơn hàng
              </h3>

              <div className="mb-6 flex items-center justify-between gap-3">
                <span className="text-sm font-bold text-gray-500">
                  Tổng tiền tạm tính:
                </span>

                <span className="text-2xl font-black text-pet-orange">
                  {formatPrice(totalAmount)}
                </span>
              </div>

              <Button
                disabled={invalidItems.length > 0 || isLoading}
                onClick={() => {
                  if (invalidItems.length > 0) {
                    showToast(
                      "Vui lòng kiểm tra lại dữ liệu sản phẩm trong giỏ hàng.",
                      "error",
                    );
                    return;
                  }

                  window.location.href = "/shop/checkout";
                }}
                className="w-full !rounded-2xl !py-4 text-sm font-black uppercase tracking-widest shadow-lg shadow-blue-500/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Tiến hành đặt hàng
              </Button>

              {invalidItems.length > 0 && (
                <p className="mt-3 text-xs leading-5 text-red-500">
                  Không thể thanh toán khi có sản phẩm chứa dữ liệu không hợp
                  lệ.
                </p>
              )}

              <Link
                to="/shop"
                className="mt-4 block text-center text-sm font-semibold text-pet-blue hover:underline"
              >
                Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
