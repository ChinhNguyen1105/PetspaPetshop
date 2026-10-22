import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, ArrowLeft, ImageIcon } from "lucide-react";

import { Button } from "../../../shared/components/Button.jsx";
import Loading from "../../../shared/components/Loading.jsx";

import { useOrderStore } from "../../orders/store/orderStore.js";
import { useReviewStore } from "../store/reviewStore.js";
import { useProductImageStore } from "../../products/store/productImageStore.js";
import { orderReviewsSchema } from "../validators/productReviewValidator.js";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=800";

// =========================================================
// PRODUCT REVIEW IMAGE
// =========================================================

const ProductReviewImage = ({ productId, productName, fallbackImage }) => {
  const fetchImages = useProductImageStore((state) => state.fetchImages);

  const getImagesByProductId = useProductImageStore(
    (state) => state.getImagesByProductId,
  );

  const downloadImage = useProductImageStore((state) => state.downloadImage);

  const [imageSrc, setImageSrc] = useState(fallbackImage);
  const [imageLoading, setImageLoading] = useState(true);

  const images = getImagesByProductId(productId);

  const selectedImage = useMemo(() => {
    if (!Array.isArray(images) || images.length === 0) {
      return null;
    }

    return (
      images.find((image) => image?.isThumbnail === true) ||
      images.find((image) => image?.isMain === true) ||
      images[0] ||
      null
    );
  }, [images]);

  useEffect(() => {
    if (productId == null) return;

    fetchImages(productId).catch(() => {});
  }, [productId, fetchImages]);

  useEffect(() => {
    let cancelled = false;
    let objectUrl = null;

    const loadImage = async () => {
      const imagePath = selectedImage?.imageUrl || selectedImage?.url || "";

      if (!imagePath) {
        if (!cancelled) {
          setImageSrc(fallbackImage);
          setImageLoading(false);
        }
        return;
      }

      // URL HTTP/HTTPS có thể hiển thị trực tiếp.
      if (/^https?:\/\//i.test(imagePath)) {
        if (!cancelled) {
          setImageSrc(imagePath);
          setImageLoading(false);
        }
        return;
      }

      const fileName = String(imagePath).split("/").pop().split("?")[0];

      if (!fileName) {
        if (!cancelled) {
          setImageSrc(fallbackImage);
          setImageLoading(false);
        }
        return;
      }

      setImageLoading(true);

      try {
        const blob = await downloadImage(fileName);

        if (cancelled) return;

        if (!(blob instanceof Blob) || blob.size === 0) {
          throw new Error("Dữ liệu ảnh sản phẩm không hợp lệ.");
        }

        objectUrl = URL.createObjectURL(blob);
        setImageSrc(objectUrl);
      } catch (error) {
        console.error(`Không thể tải ảnh sản phẩm ${productId}:`, error);

        if (!cancelled) {
          setImageSrc(fallbackImage);
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
  }, [productId, selectedImage, downloadImage, fallbackImage]);

  return (
    <div className="w-12 h-12 rounded-xl overflow-hidden bg-white border p-1 flex-shrink-0 flex items-center justify-center">
      {imageLoading ? (
        <ImageIcon size={20} className="text-gray-300 animate-pulse" />
      ) : (
        <img
          src={imageSrc}
          alt={productName || "Ảnh sản phẩm"}
          className="w-full h-full object-contain"
          onError={() => setImageSrc(fallbackImage)}
        />
      )}
    </div>
  );
};

// =========================================================
// MAIN COMPONENT
// =========================================================

const CreateOrderReview = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const {
    currentOrder: order,
    loading: orderLoading,
    fetchOrderById,
  } = useOrderStore();

  const { loading: reviewSubmitting, createProductReview } = useReviewStore();

  const [ratings, setRatings] = useState({});
  const [hoverRatings, setHoverRatings] = useState({});
  const [comments, setComments] = useState({});
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (orderId) {
      fetchOrderById(orderId);
    }
  }, [orderId, fetchOrderById]);

  useEffect(() => {
    if (!order || !Array.isArray(order.orderDetails)) return;

    const initialRatings = {};
    const initialComments = {};

    order.orderDetails.forEach((item) => {
      const productId = String(item.productId);

      initialRatings[productId] = 5;
      initialComments[productId] = "";
    });

    setRatings(initialRatings);
    setComments(initialComments);
    setValidationErrors({});
  }, [order]);

  if (orderLoading) {
    return <Loading fullScreen />;
  }

  if (!order) {
    return (
      <div className="pt-32 text-center text-gray-500 font-medium">
        Không tìm thấy thông tin đơn hàng cần đánh giá.
      </div>
    );
  }

  const itemsList = Array.isArray(order.orderDetails) ? order.orderDetails : [];

  const handleRatingChange = (productId, value) => {
    const key = String(productId);

    setRatings((prev) => ({
      ...prev,
      [key]: value,
    }));

    setValidationErrors((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        rating: "",
      },
    }));
  };

  const handleHoverRatingChange = (productId, value) => {
    setHoverRatings((prev) => ({
      ...prev,
      [String(productId)]: value,
    }));
  };

  const handleCommentChange = (productId, value) => {
    const key = String(productId);

    setComments((prev) => ({
      ...prev,
      [key]: value,
    }));

    setValidationErrors((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        comment: "",
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setValidationErrors({});

    const reviewData = {};

    itemsList.forEach((item) => {
      const productId = String(item.productId);

      reviewData[productId] = {
        rating: Number(ratings[productId] ?? 5),
        comment: comments[productId] ?? "",
      };
    });

    const result = orderReviewsSchema.safeParse(reviewData);

    if (!result.success) {
      const errors = {};

      result.error.issues.forEach((issue) => {
        const productId = String(issue.path[0] ?? "");
        const field = String(issue.path[1] ?? "");

        if (!errors[productId]) {
          errors[productId] = {};
        }

        if (!errors[productId][field]) {
          errors[productId][field] = issue.message;
        }
      });

      setValidationErrors(errors);
      setError("Vui lòng kiểm tra lại thông tin đánh giá.");
      return;
    }

    try {
      await Promise.all(
        itemsList.map((item) => {
          const productId = String(item.productId);
          const review = result.data[productId];

          return createProductReview({
            productId: Number(item.productId),
            rating: review.rating,
            comment: review.comment,
          });
        }),
      );

      alert("Cảm ơn bạn đã gửi đánh giá cho các sản phẩm!");
      navigate("/profile", {
        state: { activeTab: "orders" },
      });
    } catch (err) {
      setError(
        err?.message ||
          "Có lỗi xảy ra trong quá trình gửi đánh giá. Vui lòng thử lại.",
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-10 pb-20 text-left">
      <div className="max-w-2xl mx-auto px-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-pet-blue font-bold mb-6 transition-colors cursor-pointer border-none bg-transparent outline-none"
        >
          <ArrowLeft size={18} />
          Quay lại
        </button>

        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
          <h2 className="text-3xl font-black text-pet-blue mb-2">
            Đánh Giá Sản Phẩm
          </h2>

          <p className="text-gray-500 font-semibold mb-6">
            Mã đơn: #{order.id}
          </p>

          {error && (
            <p className="text-red-500 text-sm mb-6 font-semibold bg-red-50 p-3 rounded-xl">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-8 divide-y divide-dashed divide-gray-200">
              {itemsList.map((item, index) => {
                const productId = String(item.productId);
                const currentRating = ratings[productId] ?? 5;
                const currentHover = hoverRatings[productId] ?? 0;
                const currentComment = comments[productId] ?? "";
                const fieldErrors = validationErrors[productId] ?? {};

                return (
                  <div
                    key={item.id || `${productId}-${index}`}
                    className={`space-y-4 ${index > 0 ? "pt-8" : ""}`}
                  >
                    <div className="flex items-center gap-3 bg-gray-50/50 p-3 rounded-2xl border border-gray-100">
                      <ProductReviewImage
                        productId={item.productId}
                        productName={item.productName}
                        fallbackImage={FALLBACK_IMAGE}
                      />

                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-gray-800 truncate">
                          {item.productName || "Sản phẩm"}
                        </h4>

                        <p className="text-xs text-gray-400 mt-0.5">
                          Số lượng: x{item.quantity || 1}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-gray-400 mb-2">
                        Đánh giá sản phẩm này *
                      </label>

                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            aria-label={`Đánh giá ${star} sao`}
                            className="text-xl outline-none transition-transform active:scale-95 cursor-pointer bg-transparent border-none p-0"
                            onClick={() =>
                              handleRatingChange(item.productId, star)
                            }
                            onMouseEnter={() =>
                              handleHoverRatingChange(item.productId, star)
                            }
                            onMouseLeave={() =>
                              handleHoverRatingChange(item.productId, 0)
                            }
                          >
                            <Star
                              size={26}
                              className={
                                (currentHover || currentRating) >= star
                                  ? "text-pet-orange"
                                  : "text-gray-200"
                              }
                              fill={
                                (currentHover || currentRating) >= star
                                  ? "currentColor"
                                  : "none"
                              }
                            />
                          </button>
                        ))}
                      </div>

                      {fieldErrors.rating && (
                        <p className="text-red-500 text-xs mt-2">
                          {fieldErrors.rating}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-gray-400 mb-2">
                        Nhận xét chi tiết *
                      </label>

                      <textarea
                        rows={3}
                        maxLength={1000}
                        className="w-full p-4 border border-gray-200 rounded-2xl focus:outline-none focus:border-pet-blue focus:ring-2 focus:ring-pet-blue/10 resize-none italic text-sm transition-all text-gray-700 bg-white"
                        placeholder={`Chia sẻ trải nghiệm của bạn về sản phẩm ${item.productName}...`}
                        value={currentComment}
                        onChange={(e) =>
                          handleCommentChange(item.productId, e.target.value)
                        }
                      />

                      <div className="flex justify-between gap-3 mt-1">
                        {fieldErrors.comment ? (
                          <p className="text-red-500 text-xs">
                            {fieldErrors.comment}
                          </p>
                        ) : (
                          <span />
                        )}

                        <span className="text-xs text-gray-400">
                          {currentComment.length}/1000
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <Button
              type="submit"
              disabled={reviewSubmitting || itemsList.length === 0}
              className="w-full !py-3.5 font-bold rounded-2xl text-lg flex items-center justify-center gap-2 mt-6"
            >
              {reviewSubmitting
                ? "Đang gửi các đánh giá..."
                : "Gửi tất cả đánh giá"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateOrderReview;
