import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Star, CreditCard, ImageIcon } from "lucide-react";

import { Button } from "../../components/common/Button";
import { formatPrice } from "../../utils/formatPrice";
import { useCartStore } from "../../store/cartStore";
import { useProductImageStore } from "../../store/productImageStore";

const FALLBACK_DEFAULT_IMG =
  "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=800";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const addItem = useCartStore((state) => state.addItem);

  const fetchImages = useProductImageStore((state) => state.fetchImages);
  const getImagesByProductId = useProductImageStore(
    (state) => state.getImagesByProductId,
  );
  const downloadImage = useProductImageStore((state) => state.downloadImage);

  const [imageSrc, setImageSrc] = useState(FALLBACK_DEFAULT_IMG);
  const [imageLoading, setImageLoading] = useState(false);

  const productId = product?.id;
  const images = productId != null ? getImagesByProductId(productId) : [];

  const isOutOfStock = Number(product?.quantity ?? 0) <= 0;

  // =========================================================
  // FETCH PRODUCT IMAGES
  // =========================================================

  useEffect(() => {
    if (productId == null) return;

    fetchImages(productId).catch(() => {});
  }, [productId, fetchImages]);

  // =========================================================
  // CATEGORY NAME
  // =========================================================

  const displayCategoryName =
    typeof product?.category === "object" && product.category !== null
      ? product.category.name
      : product?.categoryName || product?.category_name || "Sản phẩm";

  // =========================================================
  // SELECT DISPLAY IMAGE
  // =========================================================

  const selectedImage = useMemo(() => {
    if (!Array.isArray(images) || images.length === 0) {
      return null;
    }

    return (
      images.find((img) => img?.isThumbnail === true) ||
      images.find((img) => img?.isMain === true) ||
      images.find(Boolean) ||
      null
    );
  }, [images]);

  // =========================================================
  // DOWNLOAD IMAGE THROUGH STORE
  // =========================================================

  useEffect(() => {
    let cancelled = false;
    let objectUrl = null;

    const loadImage = async () => {
      const imageFileName = selectedImage?.imageUrl || selectedImage?.url || "";

      if (!imageFileName) {
        setImageSrc(FALLBACK_DEFAULT_IMG);
        setImageLoading(false);
        return;
      }

      // Nếu là URL HTTP/HTTPS đầy đủ thì sử dụng trực tiếp.
      if (/^https?:\/\//i.test(imageFileName)) {
        setImageSrc(imageFileName);
        setImageLoading(false);
        return;
      }

      // Ảnh upload mới được lưu bằng tên file.
      const fileName = String(imageFileName).split("/").pop().split("?")[0];

      if (!fileName) {
        setImageSrc(FALLBACK_DEFAULT_IMG);
        setImageLoading(false);
        return;
      }

      setImageLoading(true);

      try {
        // Gọi action downloadImage từ Zustand store.
        const blob = await downloadImage(fileName);

        if (cancelled) return;

        if (!(blob instanceof Blob) || blob.size === 0) {
          throw new Error("Dữ liệu ảnh sản phẩm không hợp lệ.");
        }

        objectUrl = URL.createObjectURL(blob);
        setImageSrc(objectUrl);
      } catch (error) {
        if (!cancelled) {
          console.error(`Không thể tải ảnh sản phẩm ${productId}:`, error);
          setImageSrc(FALLBACK_DEFAULT_IMG);
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
  }, [productId, selectedImage, downloadImage]);

  // =========================================================
  // BUY NOW
  // =========================================================

  const handleBuyNow = (e) => {
    e.preventDefault();

    if (!product || isOutOfStock) return;

    addItem(product, 1);
    navigate("/shop/checkout");
  };

  // =========================================================
  // ADD TO CART
  // =========================================================

  const handleAddToCart = () => {
    if (!product || isOutOfStock) return;

    addItem(product, 1);
  };

  // =========================================================
  // VALIDATE PRODUCT
  // Giữ các Hooks phía trên luôn được gọi theo cùng thứ tự.
  // =========================================================

  if (!product || typeof product !== "object" || productId == null) {
    console.warn("ProductCard nhận product không hợp lệ:", product);
    return null;
  }

  // =========================================================
  // UI — GIỮ NGUYÊN GIAO DIỆN
  // =========================================================

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-4 hover:shadow-[0_20px_40px_rgba(42,130,228,0.06)] transition-all duration-300 group flex flex-col h-full text-left">
      <Link
        to={`/shop/product/${product.id}`}
        className="block relative h-52 mb-4 overflow-hidden rounded-2xl bg-gray-50"
      >
        {imageLoading ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400 animate-pulse">
            <ImageIcon size={24} />
          </div>
        ) : (
          <img
            src={imageSrc}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              if (e.currentTarget.src !== FALLBACK_DEFAULT_IMG) {
                e.currentTarget.src = FALLBACK_DEFAULT_IMG;
              }
            }}
          />
        )}

        {product.averageRating && (
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm border border-gray-100">
            <Star size={12} className="text-pet-orange" fill="currentColor" />

            <span className="text-xs font-bold text-gray-700">
              {product.averageRating}
            </span>
          </div>
        )}

        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="px-4 py-2 bg-white/95 rounded-full text-sm font-black text-gray-700">
              HẾT HÀNG
            </span>
          </div>
        )}
      </Link>

      <div className="flex-grow flex flex-col px-1">
        <p className="text-[11px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">
          {displayCategoryName}
        </p>

        <Link
          to={`/shop/product/${product.id}`}
          className="block flex-grow mb-2"
        >
          <h3 className="font-bold text-gray-800 hover:text-pet-blue transition-colors text-base line-clamp-2 leading-snug">
            {product.name}
          </h3>
        </Link>

        <div className="mt-auto pt-1 pb-3">
          <p className="text-pet-orange font-black text-xl">
            {formatPrice(product.price)}
          </p>

          <p
            className={`text-xs font-bold mt-1 ${
              isOutOfStock ? "text-red-500" : "text-gray-400"
            }`}
          >
            {isOutOfStock ? "Hết hàng" : `Còn ${product.quantity} sản phẩm`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full mt-2">
        {/* THÊM VÀO GIỎ */}
        <Button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          variant="outline"
          className={`p-3 rounded-2xl transition-all active:scale-[0.95] ${
            isOutOfStock
              ? "border-gray-200 text-gray-300 bg-gray-50 cursor-not-allowed"
              : "border border-slate-200 text-slate-600 hover:text-pet-blue hover:border-pet-blue/30 hover:bg-pet-blue/5"
          }`}
          title={isOutOfStock ? "Sản phẩm đã hết hàng" : "Thêm vào giỏ hàng"}
        >
          <ShoppingCart size={18} className="stroke-[2.5]" />
        </Button>

        {/* MUA NGAY */}
        <Button
          onClick={handleBuyNow}
          disabled={isOutOfStock}
          variant="primary"
          className={`flex-1 flex items-center justify-center gap-1.5 !py-3 font-bold rounded-2xl text-sm transition-all shadow-sm shadow-pet-blue/10 active:scale-[0.98] ${
            isOutOfStock ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <CreditCard size={16} className="stroke-[2.5]" />

          {isOutOfStock ? "Hết hàng" : "Mua ngay"}
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;
