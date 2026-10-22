import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, ArrowLeft } from "lucide-react";

import { Button } from "../../../shared/components/Button.jsx";
import Loading from "../../../shared/components/Loading.jsx";

import { useBookingStore } from "../../bookings/store/bookingStore.js";
import { useReviewStore } from "../store/reviewStore.js";
import { useCartStore } from "../../cart/store/cartStore.js";
import { bookingReviewSchema } from "../validators/bookingReviewValidator.js";

const CreateBookingReview = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useCartStore();

  const {
    currentBooking: booking,
    loading: bookingLoading,
    error: bookingError,
    fetchBookingById,
    setCurrentBooking,
    markBookingReviewed,
  } = useBookingStore();

  const {
    loading: reviewSubmitting,
    error: reviewStoreError,
    createServiceReview,
    resetReviews,
  } = useReviewStore();

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [localError, setLocalError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (bookingId) {
      fetchBookingById(bookingId);
    }

    resetReviews();

    return () => {
      setCurrentBooking(null);
    };
  }, [
    bookingId,
    fetchBookingById,
    setCurrentBooking,
    resetReviews,
  ]);

  const servicesList =
    booking?.bookingDetails ||
    booking?.services ||
    booking?.items ||
    [];

  const getErrorMessage = (value) => {
    if (typeof value === "string") return value;
    if (Array.isArray(value)) return value.join(", ");
    return "";
  };

  const serverBookingError =
    getErrorMessage(bookingError?.response?.data?.message) ||
    getErrorMessage(bookingError?.message) ||
    getErrorMessage(bookingError);

  const serverReviewError =
    getErrorMessage(reviewStoreError?.response?.data?.message) ||
    getErrorMessage(reviewStoreError?.message) ||
    getErrorMessage(reviewStoreError);

  const displayError =
    localError || serverBookingError || serverReviewError;

  const handleRatingChange = (value) => {
    setRating(value);
    setValidationErrors((prev) => ({
      ...prev,
      rating: "",
    }));
  };

  const handleCommentChange = (value) => {
    setComment(value);
    setValidationErrors((prev) => ({
      ...prev,
      comment: "",
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLocalError("");
    setValidationErrors({});

    const result = bookingReviewSchema.safeParse({
      rating,
      comment,
    });

    if (!result.success) {
      const errors = {};

      result.error.issues.forEach((issue) => {
        const field = String(issue.path[0] || "");

        if (!errors[field]) {
          errors[field] = issue.message;
        }
      });

      setValidationErrors(errors);
      setLocalError("Vui lòng kiểm tra lại thông tin đánh giá.");
      return;
    }

    try {
      const response = await createServiceReview({
        serviceId: Number(bookingId),
        rating: result.data.rating,
        comment: result.data.comment,
      });

      if (!response) {
        throw new Error("Không nhận được phản hồi khi gửi đánh giá.");
      }

      if (typeof markBookingReviewed === "function") {
        markBookingReviewed(bookingId);
      }

      showToast("Cảm ơn bạn đã đánh giá!");
      navigate("/profile/bookings");
    } catch (err) {
      setLocalError(
        getErrorMessage(err?.response?.data?.message) ||
          getErrorMessage(err?.message) ||
          "Gửi đánh giá thất bại. Vui lòng thử lại.",
      );
    }
  };

  if (bookingLoading && !booking) {
    return <Loading fullScreen />;
  }

  if (!booking) {
    return (
      <div className="pt-32 text-center text-gray-500 font-medium">
        {serverBookingError || "Không tìm thấy thông tin booking cần đánh giá."}
      </div>
    );
  }

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
          <h2 className="text-2xl font-black text-gray-800 mb-2">
            Đánh Giá Booking Spa
          </h2>

          <p className="text-gray-500 font-semibold mb-6">
            Booking #{bookingId}
          </p>

          <div className="space-y-2 mb-6">
            <h4 className="font-bold text-gray-700 text-sm">
              Dịch vụ đã sử dụng
            </h4>

            {servicesList.length > 0 ? (
              <ul className="space-y-1.5 pl-1">
                {servicesList.map((service, index) => (
                  <li
                    key={service.id || index}
                    className="text-gray-600 text-sm font-medium flex items-center gap-2"
                  >
                    <span className="text-green-500 font-bold">✓</span>
                    {service?.serviceName || service?.name || "Dịch vụ"}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">
                Không có thông tin chi tiết dịch vụ trong booking này.
              </p>
            )}
          </div>

          <hr className="border-t border-dashed border-gray-200 my-6" />

          {displayError && (
            <p className="text-red-500 text-sm mb-4 font-semibold bg-red-50 p-3 rounded-xl">
              {displayError}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Đánh giá số sao *
              </label>

              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => {
                  const activeRating = hoverRating || rating;
                  const isActive = activeRating >= star;

                  return (
                    <button
                      key={star}
                      type="button"
                      aria-label={`Đánh giá ${star} sao`}
                      aria-pressed={rating === star}
                      className="text-2xl outline-none transition-transform active:scale-95 cursor-pointer bg-transparent border-none p-0"
                      onClick={() => handleRatingChange(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onFocus={() => setHoverRating(star)}
                      onBlur={() => setHoverRating(0)}
                    >
                      <Star
                        size={28}
                        className={
                          isActive ? "text-pet-orange" : "text-gray-200"
                        }
                        fill={isActive ? "currentColor" : "none"}
                      />
                    </button>
                  );
                })}
              </div>

              {validationErrors.rating && (
                <p className="text-red-500 text-xs mt-2">
                  {validationErrors.rating}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Nhận xét *
              </label>

              <textarea
                rows={4}
                maxLength={1000}
                className="w-full p-4 border border-gray-200 rounded-3xl focus:outline-none focus:border-pet-blue focus:ring-2 focus:ring-pet-blue/10 resize-none italic text-sm transition-all text-gray-700"
                placeholder="Nhập cảm nhận thực tế của bạn về chất lượng phục vụ và thái độ nhân viên..."
                value={comment}
                onChange={(event) => handleCommentChange(event.target.value)}
              />

              <div className="flex justify-between gap-3 mt-1">
                {validationErrors.comment ? (
                  <p className="text-red-500 text-xs">
                    {validationErrors.comment}
                  </p>
                ) : (
                  <span />
                )}

                <span className="text-xs text-gray-400">
                  {comment.length}/1000
                </span>
              </div>
            </div>

            <Button
              type="submit"
              disabled={reviewSubmitting}
              className="w-full !py-3.5 font-bold rounded-2xl text-lg flex items-center justify-center gap-2"
            >
              {reviewSubmitting ? "Đang gửi đánh giá..." : "Gửi đánh giá"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateBookingReview;
