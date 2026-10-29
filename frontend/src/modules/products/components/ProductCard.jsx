import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Star, CreditCard, ImageIcon, Eye } from "lucide-react";

import { Button } from "../../../shared/components/Button.jsx";
import { formatPrice } from "../../../shared/utils/formatPrice.js";
import { useProductImageStore } from "../store/productImageStore.js";
import { useCartStore } from "../../cart/store/cartStore.js";

const EMPTY_IMAGES = [];

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const productId = product?.id;
  const productKey = String(productId);
  const addItem = useCartStore((state) => state.addItem);
  // Subscribe trực tiếp vào danh sách ảnh của sản phẩm.
  const images = useProductImageStore(
    (state) => state.imagesByProductId?.[productKey] ?? EMPTY_IMAGES,
  );

  const fetchImages = useProductImageStore((state) => state.fetchImages);
  const downloadImage = useProductImageStore((state) => state.downloadImage);

  const [displayImage, setDisplayImage] = useState("");
  const [imageLoading, setImageLoading] = useState(false);

  const isOutOfStock = Number(product?.quantity ?? product?.stock ?? 0) <= 0;

  // Lọc chọn ảnh thumbnail hoặc ảnh đầu tiên
  const selectedImage = useMemo(() => {
    if (!Array.isArray(images) || images.length === 0) {
      return null;
    }

    return (
      images.find(
        (image) =>
          image?.isThumbnail === true ||
          String(image?.isThumbnail).toLowerCase() === "true" ||
          image?.isMain === true,
      ) ?? images[0]
    );
  }, [images]);

  // Chỉ gọi API khi ID sản phẩm thay đổi.
  useEffect(() => {
    if (productId == null || typeof fetchImages !== "function") {
      return;
    }

    fetchImages(productId).catch((error) => {
      console.error(
        `[ProductCard] Không thể tải danh sách ảnh sản phẩm ${productId}:`,
        error,
      );
    });
  }, [productId, fetchImages]);

  // Tải file ảnh sau khi đã có thông tin ảnh.
  useEffect(() => {
    let cancelled = false;
    let objectUrl = null;

    const loadImage = async () => {
      const imageFileName = selectedImage?.imageUrl || selectedImage?.url || "";

      if (!imageFileName) {
        setDisplayImage("");
        setImageLoading(false);
        return;
      }

      // Hỗ trợ URL tuyệt đối hoặc đường dẫn ảnh đã được lưu trực tiếp.
      if (/^(https?:|data:|blob:)/i.test(imageFileName)) {
        setDisplayImage(imageFileName);
        setImageLoading(false);
        return;
      }

      if (typeof downloadImage !== "function") {
        setDisplayImage("");
        setImageLoading(false);
        return;
      }

      // Lấy tên file nếu là chuỗi đường dẫn lưu trữ
      const fileName = String(imageFileName).split("/").pop().split("?")[0];
      if (!fileName) {
        setDisplayImage("");
        setImageLoading(false);
        return;
      }

      setImageLoading(true);

      try {
        const blob = await downloadImage(fileName);

        if (cancelled) return;

        if (!(blob instanceof Blob) || blob.size === 0) {
          throw new Error("Dữ liệu ảnh tải về không hợp lệ.");
        }

        objectUrl = URL.createObjectURL(blob);
        setDisplayImage(objectUrl);
      } catch (error) {
        if (!cancelled) {
          console.error(
            `[ProductCard] Không thể tải ảnh "${imageFileName}":`,
            error,
          );
          setDisplayImage("");
        }
      } finally {
        if (!cancelled) {
          setImageLoading(false);
        }
      }
    };

    loadImage();

    return () => {
      cancelled = true;

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [selectedImage, downloadImage]);

  if (!product || typeof product !== "object" || productId == null) {
    return null;
  }

  const fallbackImage = "https://placehold.co/400x300?text=No+Image";

  const handleImageError = (event) => {
    if (event.currentTarget.src !== fallbackImage) {
      event.currentTarget.src = fallbackImage;
    }
  };
  const handleBuyNow = async (e) => {
    e.preventDefault();

    if (!product || isOutOfStock) return;

    await addItem(product, 1);

    navigate("/shop/checkout", {
      state: {
        mode: "buyNow",
        productId: product.id ?? product.productId,
      },
    });
  };
  const handleAddToCart = () => {
    if (!product || isOutOfStock) return;

    addItem(product, 1);
  };

  const price = Number(product.price ?? 0);
  const originalPrice =
    product.originalPrice != null ? Number(product.originalPrice) : null;

  const displayCategoryName =
    typeof product?.category === "object" && product.category !== null
      ? product.category.name
      : product?.categoryName || product?.category_name || "";

  return (
    <div className="bg-white rounded-xl sm:rounded-3xl border border-gray-100 p-2 sm:p-4 hover:shadow-[0_20px_40px_rgba(42,130,228,0.06)] transition-all duration-300 group flex flex-col h-full text-left">
      {/* Khung ảnh: Tối ưu chiều cao nhỏ gọn trên di động (h-36), máy tính (h-52) */}
      <Link
        to={`/shop/product/${productId}`}
        className="block relative h-36 sm:h-52 mb-2 sm:mb-4 overflow-hidden rounded-lg sm:rounded-2xl bg-gray-50"
      >
        {imageLoading ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400 animate-pulse">
            <ImageIcon size={20} className="sm:w-6 sm:h-6" />
          </div>
        ) : (
          <img
            src={displayImage || fallbackImage}
            alt={product.name || "Sản phẩm thú cưng"}
            onError={handleImageError}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        )}

        {product.averageRating && (
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full flex items-center gap-0.5 sm:gap-1 shadow-sm border border-gray-100">
            <Star
              size={10}
              className="text-pet-orange sm:w-3 sm:h-3"
              fill="currentColor"
            />
            <span className="text-[10px] sm:text-xs font-bold text-gray-700">
              {product.averageRating}
            </span>
          </div>
        )}

        {product.isNew && (
          <span className="absolute left-2 top-2 sm:left-3 sm:top-3 rounded-full bg-green-500 px-2.5 py-0.5 text-[10px] sm:text-xs font-semibold text-white">
            Mới
          </span>
        )}

        {product.discount > 0 && (
          <span className="absolute right-2 top-2 sm:right-3 sm:top-3 rounded-full bg-red-500 px-2.5 py-0.5 text-[10px] sm:text-xs font-semibold text-white">
            -{product.discount}%
          </span>
        )}

        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="px-3 py-1 sm:px-4 sm:py-2 bg-white/95 rounded-full text-xs sm:text-sm font-black text-gray-700">
              HẾT HÀNG
            </span>
          </div>
        )}

        <span className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 hidden sm:flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-700 opacity-0 shadow transition-opacity group-hover:opacity-100">
          <Eye size={16} />
        </span>
      </Link>

      <div className="flex-grow flex flex-col px-0.5 sm:px-1">
        {displayCategoryName && (
          <p className="text-[9px] sm:text-[11px] uppercase font-bold text-gray-400 tracking-wider mb-1 truncate">
            {displayCategoryName}
          </p>
        )}

        <Link
          to={`/shop/product/${productId}`}
          className="block flex-grow mb-2"
        >
          <h3 className="font-bold text-gray-800 hover:text-pet-blue transition-colors text-xs sm:text-base line-clamp-2 leading-snug">
            {product.name || "Sản phẩm"}
          </h3>
        </Link>

        <div className="mt-auto pt-1 pb-2 sm:pb-3">
          <p className="text-pet-orange font-black text-sm sm:text-xl">
            {formatPrice(price)}
          </p>

          {originalPrice != null && originalPrice > price && (
            <p className="text-[11px] sm:text-sm text-gray-400 line-queries line-through">
              {formatPrice(originalPrice)}
            </p>
          )}

          <p
            className={`text-[10px] sm:text-xs font-bold mt-0.5 sm:mt-1 ${
              isOutOfStock ? "text-red-500" : "text-gray-400"
            }`}
          >
            {isOutOfStock
              ? "Hết hàng"
              : `Còn ${product.quantity ?? product.stock ?? 0}`}
          </p>
        </div>
      </div>

      {/* Khu vực nút bấm tối ưu responsive mobile/desktop */}
      <div className="flex items-center gap-1.5 sm:gap-2 w-full mt-1 sm:mt-2">
        <Button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          variant="outline"
          className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl transition-all active:scale-[0.95] ${
            isOutOfStock
              ? "border-gray-200 text-gray-300 bg-gray-50 cursor-not-allowed"
              : "border border-slate-200 text-slate-600 hover:text-pet-blue hover:border-pet-blue/30 hover:bg-pet-blue/5"
          }`}
          title={isOutOfStock ? "Sản phẩm đã hết hàng" : "Thêm vào giỏ hàng"}
        >
          <ShoppingCart
            size={16}
            className="sm:w-[18px] sm:h-[18px] stroke-[2.5]"
          />
        </Button>

        <Button
          onClick={handleBuyNow}
          disabled={isOutOfStock}
          variant="primary"
          className={`flex-1 flex items-center justify-center gap-1 !py-2 sm:!py-3 font-bold rounded-xl sm:rounded-2xl text-xs sm:text-sm transition-all shadow-sm shadow-pet-blue/10 active:scale-[0.98] ${
            isOutOfStock ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <CreditCard size={14} className="sm:w-4 sm:h-4 stroke-[2.5]" />
          <span className="truncate">
            {isOutOfStock ? "Hết hàng" : "Mua ngay"}
          </span>
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;
