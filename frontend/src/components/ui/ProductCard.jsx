import React, { useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Star, CreditCard, ImageIcon } from "lucide-react";
import { Button } from "../common/Button";
import { formatPrice } from "../../utils/formatPrice";
import { useCartStore } from "../../store/cartStore";
import { useProductImageStore } from "../../store/productImageStore";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const addItem = useCartStore((state) => state.addItem);

  const fallbackDefaultImg =
    "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=800";

  const { fetchImages, getImagesByProductId, loading } = useProductImageStore();

  const images = getImagesByProductId(product?.id);

  const isOutOfStock = Number(product?.quantity ?? 0) <= 0;

  useEffect(() => {
    if (product?.id) {
      fetchImages(product.id);
    }
  }, [product?.id, fetchImages]);

  const displayCategoryName =
    typeof product.category === "object" && product.category !== null
      ? product.category.name
      : product.categoryName || product.category_name || "Sản phẩm";

  const displayImage = useMemo(() => {
    if (!images || images.length === 0) {
      return fallbackDefaultImg;
    }

    const thumbnail = images.find((img) => img.isThumbnail === true);

    if (!thumbnail) {
      return fallbackDefaultImg;
    }

    return thumbnail.imageUrl || thumbnail.url || fallbackDefaultImg;
  }, [images]);

  const handleBuyNow = (e) => {
    e.preventDefault();

    if (isOutOfStock) {
      return;
    }

    addItem(product, 1);
    navigate("/shop/checkout");
  };

  const handleAddToCart = () => {
    if (isOutOfStock) {
      return;
    }

    addItem(product, 1);
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-4 hover:shadow-[0_20px_40px_rgba(42,130,228,0.06)] transition-all duration-300 group flex flex-col h-full text-left">
      <Link
        to={`/shop/product/${product.id}`}
        className="block relative h-52 mb-4 overflow-hidden rounded-2xl bg-gray-50"
      >
        {loading ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400 animate-pulse">
            <ImageIcon size={24} />
          </div>
        ) : (
          <img
            src={displayImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              if (e.currentTarget.src !== fallbackDefaultImg) {
                e.currentTarget.src = fallbackDefaultImg;
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
