import React, { useEffect, useState } from "react";
import { useProductImageStore } from "../../../store/productImageStore";

const ProductImage = ({
  image,
  alt = "Ảnh sản phẩm",
  className = "w-full h-full",
}) => {
  const downloadImage = useProductImageStore((state) => state.downloadImage);

  const [imageSrc, setImageSrc] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const imageUrl = image?.imageUrl || image?.url || "";

  useEffect(() => {
    let cancelled = false;
    let objectUrl = null;

    const loadImage = async () => {
      if (!imageUrl) {
        setImageSrc("");
        setHasError(true);
        setLoading(false);
        return;
      }

      setLoading(true);
      setHasError(false);
      setImageSrc("");

      try {
        // Tải ảnh thông qua Zustand store.
        const blob = await downloadImage(imageUrl);

        if (!(blob instanceof Blob) || blob.size === 0) {
          throw new Error("Dữ liệu ảnh sản phẩm không hợp lệ.");
        }

        // Chuyển Blob thành URL để hiển thị bằng thẻ img.
        objectUrl = URL.createObjectURL(blob);

        if (!cancelled) {
          setImageSrc(objectUrl);
        }
      } catch (error) {
        console.error("Không thể tải ảnh sản phẩm:", imageUrl, error);

        if (!cancelled) {
          setImageSrc("");
          setHasError(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
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
  }, [imageUrl, downloadImage]);

  if (loading) {
    return (
      <div
        className={`${className} flex items-center justify-center bg-gray-100`}
      >
        <span className="text-xs text-gray-400">Đang tải ảnh...</span>
      </div>
    );
  }

  if (hasError || !imageSrc) {
    return (
      <div
        className={`${className} flex items-center justify-center bg-gray-100`}
      >
        <span className="text-xs text-gray-400">Không có ảnh</span>
      </div>
    );
  }

  return (
    <img src={imageSrc} alt={alt} className={`${className} object-cover`} />
  );
};

export default ProductImage;
