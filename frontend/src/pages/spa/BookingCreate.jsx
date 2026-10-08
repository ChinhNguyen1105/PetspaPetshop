import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { CalendarClock, AlertCircle } from "lucide-react";

import Modal from "../../components/common/Modal";
import PaymentModal from "../../components/common/PaymentModal";
import BookingForm from "../../components/form/BookingForm";
import RecommendedServices from "./RecommendService";

import { useAuthStore } from "../../store/authStore";
import { useServiceStore } from "../../store/serviceStore";
import { usePetStore } from "../../store/petStore";
import { useBookingStore } from "../../store/bookingStore";
import { SLOT_TIMES } from "../../constants";

const BookingCreate = () => {
  const navigate = useNavigate();

  const { id: serviceIdFromParams } = useParams();

  const [searchParams] = useSearchParams();

  const initialServiceId = (
    serviceIdFromParams ||
    searchParams.get("serviceId") ||
    ""
  ).toString();

  // ─── STORES ───
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const user = useAuthStore((state) => state.user);

  const {
    services,
    fetchServices,
    loading: loadingServices,
  } = useServiceStore();

  const { myPets, fetchMyPets, loading: loadingPets } = usePetStore();

  const {
    bookings,
    fetchBookings,
    submitting,
    createBooking,
    unavailableSlots,
    loadingSlots,
    fetchUnavailableSlots,
  } = useBookingStore();

  // ─── LOCAL STATE ───
  const [slots, setSlots] = useState([]);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const [createdBookingData, setCreatedBookingData] = useState(null);

  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    serviceIds: initialServiceId ? [initialServiceId] : [],
    petId: "",
    date: "",
    time: "",
    note: "",
  });

  // ─── DERIVED ───
  const selectedServices = services.filter((service) =>
    formData.serviceIds.includes(service.id.toString()),
  );

  const totalDuration =
    selectedServices.reduce(
      (sum, service) => sum + (service.durationMin || 0),
      0,
    ) || 30;

  const totalAmount = selectedServices.reduce(
    (sum, service) => sum + (service.basePrice || 0),
    0,
  );

  const slotsNeeded = Math.ceil(totalDuration / 30);

  // ─── HELPER: tính endTime ───
  const computeEndTime = useCallback(
    (startTime) => {
      if (!startTime) {
        return undefined;
      }

      const [hours, minutes] = startTime.split(":").map(Number);

      const startMinutes = hours * 60 + minutes;

      const endMinutes = startMinutes + totalDuration;

      const endHours = Math.floor(endMinutes / 60) % 24;

      const endMinutesValue = endMinutes % 60;

      return `${String(endHours).padStart(2, "0")}:${String(
        endMinutesValue,
      ).padStart(2, "0")}`;
    },
    [totalDuration],
  );

  // ─── FETCH INITIAL DATA ───
  useEffect(() => {
    fetchServices();

    fetchMyPets({
      keyword: "",
      speciesId: null,
      gender: null,
      ownerId: null,
    });

    if (!bookings?.length && typeof fetchBookings === "function") {
      fetchBookings({
        page: 1,
        pageSize: 10,
      });
    }
  }, [fetchServices, fetchMyPets, bookings, fetchBookings]);

  // ─── DATE CHANGE ───
  useEffect(() => {
    if (!formData.date) {
      setSlots(
        SLOT_TIMES.map((slot) => ({
          start_time: slot.startTime,
          end_time: slot.endTime,
          available: true,
          reason: null,
        })),
      );

      return;
    }

    setFormData((prev) => ({
      ...prev,
      time: "",
    }));

    fetchUnavailableSlots({
      date: formData.date,
    });
  }, [formData.date, fetchUnavailableSlots]);

  // ─── SERVICE CHANGE ───
  useEffect(() => {
    setFormData((prev) =>
      prev.time
        ? {
            ...prev,
            time: "",
          }
        : prev,
    );
  }, [slotsNeeded]);

  // ─── SYNC SLOTS ───
  useEffect(() => {
    if (!formData.date) {
      return;
    }

    const mappedSlots = SLOT_TIMES.map((slot) => {
      const isBooked = (unavailableSlots || []).some((booking) => {
        return (
          slot.startTime < booking.endTime && slot.endTime > booking.startTime
        );
      });

      return {
        start_time: slot.startTime,
        end_time: slot.endTime,
        available: !isBooked,
        reason: isBooked ? "BOOKED" : null,
      };
    });

    setSlots(mappedSlots);
  }, [unavailableSlots, formData.date]);

  // ─── SLOT VALIDATION ───
  const checkConsecutiveSlots = useCallback(
    (startIndex) => {
      if (startIndex < 0 || startIndex + slotsNeeded > slots.length) {
        return {
          available: false,
          reason: "OVER_WORKING_HOURS",
        };
      }

      for (let i = 0; i < slotsNeeded; i++) {
        const slot = slots[startIndex + i];

        if (!slot?.available) {
          return {
            available: false,
            reason:
              i === 0
                ? slot.reason || "BOOKED"
                : "INSUFFICIENT_CONSECUTIVE_SLOTS",
          };
        }
      }

      return {
        available: true,
      };
    },
    [slots, slotsNeeded],
  );

  // ─── SELECT SLOT ───
  const handleSelectSlot = (slot, index) => {
    const result = checkConsecutiveSlots(index);

    if (result.available) {
      setFormData((prev) => ({
        ...prev,
        time: slot.start_time,
      }));
    }
  };

  // ─── AUTO SELECT SLOT ───
  useEffect(() => {
    if (!formData.date) {
      return;
    }

    if (!formData.serviceIds.length) {
      return;
    }

    if (formData.time) {
      return;
    }

    if (!slots.length) {
      return;
    }

    for (let i = 0; i < slots.length; i++) {
      const result = checkConsecutiveSlots(i);

      if (result.available) {
        setFormData((prev) => ({
          ...prev,
          time: slots[i].start_time,
        }));

        break;
      }
    }
  }, [
    slots,
    slotsNeeded,
    formData.date,
    formData.serviceIds,
    formData.time,
    checkConsecutiveSlots,
  ]);

  // ─── SERVICE TOGGLE ───
  const handleServiceToggle = (id) => {
    setFormData((prev) => {
      const strId = id.toString();

      const newServiceIds = prev.serviceIds.includes(strId)
        ? prev.serviceIds.filter((item) => item !== strId)
        : [...prev.serviceIds, strId];

      return {
        ...prev,
        serviceIds: newServiceIds,
        time: "",
      };
    });
  };

  // ─── RECOMMENDED SERVICE ───
  const handleSelectRecommendedService = (id) => {
    handleServiceToggle(id);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ─── SUBMIT BOOKING ───
  const handleSubmit = async (e) => {
    e?.preventDefault?.();

    setErrors({});

    if (!formData.serviceIds.length) {
      setErrors({
        submit: "Vui lòng chọn ít nhất một dịch vụ.",
      });

      return;
    }

    if (!formData.petId) {
      setErrors({
        submit: "Vui lòng chọn thú cưng.",
      });

      return;
    }

    if (!formData.date) {
      setErrors({
        submit: "Vui lòng chọn ngày.",
      });

      return;
    }

    if (!formData.time) {
      setErrors({
        submit: "Vui lòng chọn giờ.",
      });

      return;
    }

    try {
      const payload = {
        userId: user?.id,

        serviceIds: formData.serviceIds.map(Number),

        petId: Number(formData.petId),

        bookingDate: formData.date,

        startTime: formData.time,

        endTime: computeEndTime(formData.time),

        note: formData.note,

        durationMinutes: totalDuration,
      };

      const response = await createBooking(payload);

      /*
       * API thực tế:
       *
       * {
       *   statusCode: 201,
       *   body: {
       *     status: "SUCCESS",
       *     data: {
       *       id: "37",
       *       orderId: "67",
       *       ...
       *     }
       *   }
       * }
       */

      const bookingData = response?.body?.data ?? response?.data ?? null;

      if (response?.success === false || !bookingData) {
        setErrors({
          submit: response?.message || "Hệ thống từ chối tạo lịch hẹn.",
        });

        return;
      }

      /*
       * PaymentModal cần Order ID,
       * không phải Booking ID.
       */
      setCreatedBookingData({
        id: bookingData.orderId,
        orderId: bookingData.orderId,
        bookingId: bookingData.id,
        amount: totalAmount,
      });

      /*
       * Booking tạo thành công
       * → mở modal thanh toán.
       */
      setIsPaymentModalOpen(true);
    } catch (error) {
      console.error("Create booking error:", error);

      setErrors({
        submit: "Đã xảy ra lỗi hệ thống. Xin thử lại sau!",
      });
    }
  };

  // ─── PAYMENT SUCCESS ───
  const handlePaymentSuccess = () => {
    /*
     * 1. Đóng PaymentModal
     * 2. Xóa dữ liệu payment tạm
     * 3. Chuyển sang My Bookings
     */
    setIsPaymentModalOpen(false);

    setCreatedBookingData(null);

    navigate("/my-bookings");
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-10 pb-20">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm mb-8">
          <h1 className="text-2xl font-black text-pet-blue mb-6 flex items-center gap-2">
            <CalendarClock size={28} />
            Đặt lịch Spa
          </h1>

          {errors.submit && (
            <div className="p-4 mb-4 bg-red-50 text-red-600 rounded-2xl text-sm font-semibold flex items-center gap-2">
              <AlertCircle size={18} />

              {errors.submit}
            </div>
          )}

          <BookingForm
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setErrors={setErrors}
            services={services}
            pets={myPets}
            slots={slots}
            loadingSlots={loadingSlots}
            isAuthenticated={isAuthenticated}
            handleServiceToggle={handleServiceToggle}
            handleSelectSlot={handleSelectSlot}
            checkConsecutiveSlots={checkConsecutiveSlots}
            slotsNeeded={slotsNeeded}
            totalDuration={totalDuration}
            totalAmount={totalAmount}
            onSubmit={handleSubmit}
            submitting={submitting}
            loading={loadingServices || loadingPets}
          />
        </div>

        <RecommendedServices
          currentCartIds={formData.serviceIds}
          onServiceSelect={handleSelectRecommendedService}
        />
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        orderData={createdBookingData}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default BookingCreate;
