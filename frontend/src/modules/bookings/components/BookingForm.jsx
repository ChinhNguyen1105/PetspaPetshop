import React, { useMemo, useRef, useState } from "react";
import {
  Calendar,
  Clock,
  AlertCircle,
  ChevronRight,
  CheckCircle2,
  Star,
} from "lucide-react";

// ─── HELPERS ────────────────────────────────────────────────────────
const formatPrice = (n) =>
  typeof n === "number" && Number.isFinite(n)
    ? n.toLocaleString("vi-VN", {
        style: "currency",
        currency: "VND",
      })
    : "—";

const formatDuration = (min) => {
  if (!min) return "—";
  if (min < 60) return `${min} phút`;

  const h = Math.floor(min / 60);
  const m = min % 60;

  return m ? `${h}g ${m}p` : `${h} giờ`;
};

// Lấy ngày hiện tại theo múi giờ local, không dùng toISOString().
const getLocalDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

// Chuyển ngày và giờ thành Date theo local time.
const getSlotDateTime = (date, time) => {
  if (!date || !time || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;

  const match = String(time).match(
    /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/,
  );

  if (!match) return null;

  const [, hour, minute, second = "0"] = match;
  const dateTime = new Date(`${date}T${hour}:${minute}:${second}`);

  if (Number.isNaN(dateTime.getTime())) return null;

  const [year, month, day] = date.split("-").map(Number);

  if (
    dateTime.getFullYear() !== year ||
    dateTime.getMonth() + 1 !== month ||
    dateTime.getDate() !== day
  ) {
    return null;
  }

  return dateTime;
};

// Một slot chỉ hợp lệ khi ngày giờ bắt đầu vẫn còn ở tương lai.
const isSlotInFuture = (date, time) => {
  if (!date || !time) return false;
  if (date < getLocalDateString()) return false;

  const dateTime = getSlotDateTime(date, time);

  if (!dateTime) return false;

  return dateTime.getTime() > Date.now();
};

const BookingForm = ({
  formData,
  setFormData,
  errors = {},
  setErrors,
  services = [],
  pets = [],
  slots = [],
  loadingSlots = false,
  handleServiceToggle,
  handleSelectSlot,
  checkConsecutiveSlots,
  slotsNeeded = 1,
  totalDuration = 0,
  totalAmount = 0,
  onSubmit,
  submitting = false,
  loading = false,
}) => {
  const [step, setStep] = useState(1);

  // Chặn đồng bộ ngay khi nhấn, không phải chờ React render lại.
  const submitLockRef = useRef(false);

  // Khóa cục bộ: bật ngay lần nhấn đầu tiên và CHỈ được tắt khi đặt lịch
  // thất bại. Nếu đặt lịch thành công, nút được khóa vĩnh viễn để không
  // tạo thêm lịch hẹn thứ hai (không phụ thuộc vào `submitting` của store).
  const [localSubmitting, setLocalSubmitting] = useState(false);

  // Đã tạo lịch thành công (dùng để đổi nhãn nút).
  const [submitted, setSubmitted] = useState(false);

  const isSubmitting = submitting || localSubmitting;

  const serviceIds = Array.isArray(formData?.serviceIds)
    ? formData.serviceIds.map(String)
    : [];

  const safeSlotsNeeded = Math.max(1, Number(slotsNeeded) || 1);

  // ─── DERIVED DATA ──────────────────────────────────────────────────
  const selectedServices = useMemo(
    () => services.filter((service) => serviceIds.includes(String(service.id))),
    [services, formData?.serviceIds],
  );

  const selectedStartIndex = useMemo(
    () =>
      formData?.time
        ? slots.findIndex((slot) => slot.start_time === formData.time)
        : -1,
    [formData?.time, slots],
  );

  const selectedPet = useMemo(
    () => pets.find((pet) => String(pet.id) === String(formData?.petId)),
    [pets, formData?.petId],
  );

  // Kiểm tra toàn bộ block slot được chọn.
  const isBlockValid = useMemo(() => {
    if (selectedStartIndex < 0) return false;

    const selectedSlots = slots.slice(
      selectedStartIndex,
      selectedStartIndex + safeSlotsNeeded,
    );

    if (selectedSlots.length !== safeSlotsNeeded) return false;

    return selectedSlots.every(
      (slot) =>
        slot?.available && isSlotInFuture(formData?.date, slot.start_time),
    );
  }, [selectedStartIndex, safeSlotsNeeded, slots, formData?.date]);

  // ─── SLOT VALIDATION ───────────────────────────────────────────────
  const evaluateSlot = (index) => {
    const slot = slots[index];

    if (!slot) {
      return {
        available: false,
        reason: "Khung giờ không tồn tại.",
      };
    }

    if (!isSlotInFuture(formData?.date, slot.start_time)) {
      return {
        available: false,
        reason:
          formData?.date < getLocalDateString()
            ? "Ngày hẹn đã qua."
            : "Khung giờ này đã qua.",
      };
    }

    if (!slot.available) {
      return {
        available: false,
        reason: "Khung giờ này đã được đặt.",
      };
    }

    if (typeof checkConsecutiveSlots !== "function") {
      return {
        available: false,
        reason: "Không thể kiểm tra các khung giờ liên tiếp.",
      };
    }

    const evaluation = checkConsecutiveSlots(index);

    if (!evaluation?.available) {
      return {
        available: false,
        reason: "Không đủ khung giờ liên tiếp cho dịch vụ.",
      };
    }

    return {
      available: true,
      reason: "",
    };
  };

  // ─── STEP VALIDATION ───────────────────────────────────────────────
  const validateStep = (currentStep) => {
    const validationErrors = {};

    if (currentStep === 1) {
      if (serviceIds.length === 0) {
        validationErrors.serviceIds = "Vui lòng chọn ít nhất một dịch vụ.";
      } else {
        const allServicesExist = serviceIds.every((id) =>
          services.some((service) => String(service.id) === id),
        );

        if (!allServicesExist) {
          validationErrors.serviceIds =
            "Một hoặc nhiều dịch vụ không còn hợp lệ. Vui lòng chọn lại.";
        }
      }

      return validationErrors;
    }

    if (currentStep === 2 || currentStep === 3) {
      if (!formData?.petId) {
        validationErrors.petId = "Vui lòng chọn thú cưng.";
      } else if (!selectedPet) {
        validationErrors.petId =
          "Thú cưng không hợp lệ hoặc không còn tồn tại.";
      }

      if (!formData?.date) {
        validationErrors.date = "Vui lòng chọn ngày hẹn.";
      } else if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.date)) {
        validationErrors.date = "Ngày hẹn không hợp lệ.";
      } else if (formData.date < getLocalDateString()) {
        validationErrors.date = "Không thể đặt lịch vào ngày đã qua.";
      } else {
        const [year, month, day] = formData.date.split("-").map(Number);
        const parsedDate = new Date(year, month - 1, day);

        if (
          parsedDate.getFullYear() !== year ||
          parsedDate.getMonth() !== month - 1 ||
          parsedDate.getDate() !== day
        ) {
          validationErrors.date = "Ngày hẹn không tồn tại.";
        }
      }

      if (!formData?.time) {
        validationErrors.time = "Vui lòng chọn khung giờ.";
      } else if (!formData?.date) {
        validationErrors.time = "Vui lòng chọn ngày trước khi chọn khung giờ.";
      } else {
        const slotIndex = slots.findIndex(
          (slot) => slot.start_time === formData.time,
        );

        if (slotIndex < 0) {
          validationErrors.time =
            "Khung giờ đã chọn không còn trong lịch. Vui lòng chọn lại.";
        } else if (!isSlotInFuture(formData.date, formData.time)) {
          validationErrors.time = "Khung giờ đã qua. Vui lòng chọn giờ khác.";
        } else if (!isBlockValid) {
          validationErrors.time =
            "Khung giờ không còn đủ chỗ hoặc không đủ các ô liên tiếp. Vui lòng chọn lại.";
        } else {
          const evaluation = evaluateSlot(slotIndex);

          if (!evaluation.available) {
            validationErrors.time = evaluation.reason;
          }
        }
      }
    }

    return validationErrors;
  };

  const validateAll = () => {
    const serviceErrors = validateStep(1);
    const bookingErrors = validateStep(2);

    return {
      ...serviceErrors,
      ...bookingErrors,
    };
  };

  const goNext = () => {
    if (isSubmitting || submitLockRef.current) return;

    const validationErrors = validateStep(step);

    if (Object.keys(validationErrors).length > 0) {
      setErrors?.(validationErrors);
      return;
    }

    setErrors?.({});
    setStep((currentStep) => Math.min(currentStep + 1, 3));
  };

  const goBack = () => {
    if (isSubmitting || submitLockRef.current) return;

    setErrors?.({});
    setStep((currentStep) => Math.max(currentStep - 1, 1));
  };

  // ─── CONFIRM BOOKING: DOUBLE-SUBMIT PROTECTION ─────────────────────
  const handleConfirmBooking = async () => {
    // Khóa đồng bộ: lần nhấn thứ hai trong cùng tick sẽ bị chặn tại đây.
    if (submitLockRef.current || isSubmitting) return;

    const validationErrors = validateAll();

    if (Object.keys(validationErrors).length > 0) {
      setErrors?.(validationErrors);

      if (validationErrors.serviceIds) {
        setStep(1);
      } else {
        setStep(2);
      }

      return;
    }

    // Khóa nút ngay lập tức sau lần nhấn đầu tiên.
    submitLockRef.current = true;
    setLocalSubmitting(true);
    setErrors?.({});

    try {
      // BookingCreate cần trả về true nếu tạo lịch thành công,
      // false nếu thất bại hoặc dữ liệu không hợp lệ.
      const result = await onSubmit?.();

      if (result === true) {
        // Thành công: GIỮ NGUYÊN khóa, không mở lại nút.
        setSubmitted(true);
        return;
      }

      // Thất bại: mở khóa để người dùng sửa và thử lại.
      submitLockRef.current = false;
      setLocalSubmitting(false);
    } catch (error) {
      const responseMessage = error?.response?.data?.message;

      const message = Array.isArray(responseMessage)
        ? responseMessage.join(", ")
        : responseMessage ||
          error?.message ||
          "Đặt lịch thất bại. Vui lòng thử lại.";

      const isConflict =
        error?.response?.status === 409 ||
        error?.response?.status === 400 ||
        /conflict|already booked|requested time|trùng lịch|đã được đặt/i.test(
          String(message),
        );

      if (isConflict) {
        setErrors?.((previous) => ({
          ...(previous || {}),
          time: message,
          submit: "",
        }));

        setStep(2);
      } else {
        setErrors?.((previous) => ({
          ...(previous || {}),
          submit: message,
        }));
      }

      submitLockRef.current = false;
      setLocalSubmitting(false);
    }
  };

  const handleDateChange = (event) => {
    if (isSubmitting || submitLockRef.current) return;

    const nextDate = event.target.value;

    setFormData((previous) => ({
      ...previous,
      date: nextDate,
      time: "",
    }));

    setErrors?.((previous) => ({
      ...(previous || {}),
      date: "",
      time: "",
      submit: "",
    }));
  };

  const handlePetSelect = (petId) => {
    if (isSubmitting || submitLockRef.current) return;

    setFormData((previous) => ({
      ...previous,
      petId: String(petId),
    }));

    setErrors?.((previous) => ({
      ...(previous || {}),
      petId: "",
    }));
  };

  // ─── LOADING ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16">
        <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
        <p className="text-sm text-gray-400 font-medium">Đang tải dịch vụ...</p>
      </div>
    );
  }

  const STEPS = ["Dịch vụ", "Lịch hẹn", "Xác nhận"];

  return (
    <div className="flex flex-col">
      {/* ── STEP INDICATOR ── */}
      <div className="flex items-center gap-0 mb-6">
        {STEPS.map((label, index) => {
          const number = index + 1;
          const active = step === number;
          const done = step > number;

          return (
            <React.Fragment key={number}>
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                    done
                      ? "bg-orange-500 text-white"
                      : active
                        ? "bg-orange-500 text-white ring-4 ring-orange-100"
                        : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {done ? <CheckCircle2 size={13} /> : number}
                </div>

                <span
                  className={`text-xs font-bold transition-colors ${
                    active || done ? "text-gray-800" : "text-gray-400"
                  }`}
                >
                  {label}
                </span>
              </div>

              {index < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-px mx-2 transition-colors ${
                    done ? "bg-orange-300" : "bg-gray-200"
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* ── BODY ── */}
      <div
        className="space-y-5 overflow-y-auto max-h-[60vh] pr-1"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {/* ────────────────── STEP 1: SERVICES ────────────────── */}
        {step === 1 && (
          <>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Chọn dịch vụ <span className="text-red-500">*</span>
            </p>

            {errors.serviceIds && (
              <p className="text-xs font-semibold text-red-500 flex items-center gap-1 -mt-2">
                <AlertCircle size={12} />
                {errors.serviceIds}
              </p>
            )}

            <div className="grid grid-cols-1 gap-3">
              {services.map((service) => {
                const id = String(service.id);
                const checked = serviceIds.includes(id);

                const thumbnail =
                  service.serviceImages?.find((image) => image.isThumbnail)
                    ?.imageUrl || service.serviceImages?.[0]?.imageUrl;

                return (
                  <button
                    key={id}
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => {
                      if (isSubmitting || submitLockRef.current) return;

                      handleServiceToggle?.(id);

                      setErrors?.((previous) => ({
                        ...(previous || {}),
                        serviceIds: "",
                        time: "",
                        submit: "",
                      }));
                    }}
                    className={`flex items-center gap-3 p-3 rounded-2xl border-2 text-left transition-all disabled:opacity-60 ${
                      checked
                        ? "border-orange-400 bg-orange-50/60 shadow-sm"
                        : "border-gray-100 bg-white hover:border-gray-200"
                    }`}
                  >
                    <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                      {thumbnail ? (
                        <img
                          src={thumbnail}
                          alt={service.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">
                          🐾
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-black truncate ${
                          checked ? "text-orange-700" : "text-gray-800"
                        }`}
                      >
                        {service.name}
                      </p>

                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-400 font-medium flex items-center gap-0.5">
                          <Clock size={10} />
                          {formatDuration(
                            service.durationMin ||
                              service.durationMinutes ||
                              service.duration_minutes,
                          )}
                        </span>

                        {service.averageRating != null &&
                          Number(service.averageRating) > 0 && (
                            <span className="text-xs text-amber-500 font-bold flex items-center gap-0.5">
                              <Star size={10} fill="currentColor" />
                              {service.averageRating}
                            </span>
                          )}
                      </div>

                      <p className="text-sm font-black text-orange-500 mt-0.5">
                        {formatPrice(
                          Number(service.basePrice ?? service.price),
                        )}
                      </p>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                        checked
                          ? "bg-orange-500 border-orange-500"
                          : "border-gray-300"
                      }`}
                    >
                      {checked && (
                        <CheckCircle2 size={12} className="text-white" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {services.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-6">
                Hiện chưa có dịch vụ nào.
              </p>
            )}

            {selectedServices.length > 0 && (
              <div className="p-3 bg-orange-50 rounded-xl border border-orange-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-orange-700">
                    {selectedServices.length} dịch vụ đã chọn
                  </p>
                  <p className="text-xs text-orange-500 font-medium">
                    Tổng thời gian: {formatDuration(totalDuration)}
                  </p>
                </div>

                <p className="text-base font-black text-orange-600">
                  {formatPrice(Number(totalAmount))}
                </p>
              </div>
            )}
          </>
        )}

        {/* ────────────────── STEP 2: PET & DATETIME ────────────────── */}
        {step === 2 && (
          <>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Thú cưng nhận dịch vụ <span className="text-red-500">*</span>
              </p>

              {pets.length === 0 ? (
                <div className="p-4 rounded-xl bg-gray-50 border border-dashed border-gray-200 text-center text-xs text-gray-400 font-medium">
                  Bạn chưa đăng ký thú cưng nào. Hãy thêm tại trang hồ sơ!
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {pets.map((pet) => {
                    const selected =
                      String(formData?.petId ?? "") === String(pet.id);

                    return (
                      <button
                        key={pet.id}
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => handlePetSelect(pet.id)}
                        className={`p-3 rounded-xl border-2 text-left transition-all disabled:opacity-60 ${
                          selected
                            ? "border-orange-400 bg-orange-50 shadow-sm"
                            : "border-gray-100 bg-white hover:border-gray-200"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${
                              selected ? "bg-orange-100" : "bg-gray-100"
                            }`}
                          >
                            {pet.specie === "Cat" ? "🐱" : "🐶"}
                          </div>

                          <div className="min-w-0">
                            <p
                              className={`text-xs font-black truncate ${
                                selected ? "text-orange-700" : "text-gray-700"
                              }`}
                            >
                              {pet.name}
                            </p>

                            <p className="text-[10px] text-gray-400 font-medium truncate">
                              {pet.specie}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {errors.petId && (
                <p className="text-xs font-semibold text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {errors.petId}
                </p>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="flex items-center gap-1 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                <Calendar size={12} />
                Ngày hẹn <span className="text-red-500">*</span>
              </label>

              <input
                type="date"
                min={getLocalDateString()}
                value={formData?.date || ""}
                disabled={isSubmitting}
                onChange={handleDateChange}
                className={`w-full p-3 rounded-xl border outline-none bg-white font-semibold text-sm text-gray-700 focus:border-orange-400 transition-colors disabled:bg-gray-100 ${
                  errors.date ? "border-red-400" : "border-gray-200"
                }`}
              />

              {errors.date && (
                <p className="text-xs font-semibold text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {errors.date}
                </p>
              )}
            </div>

            {/* Slots */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-1 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <Clock size={12} />
                  Khung giờ <span className="text-red-500">*</span>
                </label>

                {totalDuration > 0 && (
                  <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">
                    Cần {safeSlotsNeeded} ô · {formatDuration(totalDuration)}
                  </span>
                )}
              </div>

              {!formData?.date ? (
                <div className="p-4 bg-gray-50 border border-dashed border-gray-200 rounded-xl text-center text-xs text-gray-400 font-medium">
                  Chọn ngày trước để xem lịch trống
                </div>
              ) : loadingSlots ? (
                <div className="grid grid-cols-2 gap-2 animate-pulse">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <div key={index} className="h-14 bg-gray-100 rounded-xl" />
                  ))}
                </div>
              ) : slots.length === 0 ? (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-center text-xs text-red-500 font-bold">
                  Không có ca trống vào ngày này
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto p-1 bg-gray-50 rounded-xl border border-gray-100">
                  {slots.map((slot, index) => {
                    const evaluation = evaluateSlot(index);
                    const canStart = evaluation.available;

                    const inBlock =
                      isBlockValid &&
                      selectedStartIndex >= 0 &&
                      index >= selectedStartIndex &&
                      index < selectedStartIndex + safeSlotsNeeded;

                    const isStart = formData?.time === slot.start_time;
                    const isPast = !isSlotInFuture(
                      formData?.date,
                      slot.start_time,
                    );

                    return (
                      <button
                        key={`${slot.start_time}-${index}`}
                        type="button"
                        disabled={isSubmitting || (!canStart && !inBlock)}
                        onClick={() => {
                          if (
                            isSubmitting ||
                            submitLockRef.current ||
                            (!canStart && !inBlock)
                          ) {
                            return;
                          }

                          handleSelectSlot?.(slot, index);

                          setErrors?.((previous) => ({
                            ...(previous || {}),
                            time: "",
                            submit: "",
                          }));
                        }}
                        title={
                          isPast
                            ? "Khung giờ này đã qua"
                            : !slot.available
                              ? "Khung giờ này đã được đặt"
                              : !canStart
                                ? evaluation.reason
                                : undefined
                        }
                        className={`relative flex flex-col items-center justify-center h-14 rounded-xl border text-xs font-bold transition-all disabled:cursor-not-allowed ${
                          inBlock
                            ? "bg-orange-500 text-white border-orange-500 shadow-sm scale-[1.02]"
                            : isPast
                              ? "bg-gray-100 border-gray-100 text-gray-300"
                              : !slot.available
                                ? "bg-gray-100 border-gray-100 text-gray-300 line-through"
                                : canStart
                                  ? "bg-white border-gray-200 text-gray-700 hover:border-orange-300 hover:bg-orange-50/40"
                                  : "bg-amber-50 border-amber-100 text-amber-400"
                        }`}
                      >
                        <span className="leading-tight">
                          {slot.start_time}
                          <br />
                          <span className="text-[10px] font-semibold opacity-80">
                            {slot.end_time}
                          </span>
                        </span>

                        {inBlock ? (
                          <span className="text-[8px] font-semibold mt-1 leading-none text-orange-100">
                            {isStart ? "Bắt đầu" : "Tiếp theo"}
                          </span>
                        ) : isPast ? (
                          <span className="text-[8px] font-semibold mt-1 leading-none text-gray-400">
                            Đã qua
                          </span>
                        ) : !slot.available ? (
                          <span className="text-[8px] font-semibold mt-1 leading-none text-gray-400">
                            Đã đặt
                          </span>
                        ) : !canStart ? (
                          <span className="text-[8px] font-semibold mt-1 leading-none">
                            Không đủ ô
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              )}

              {errors.time && (
                <p className="text-xs font-semibold text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {errors.time}
                </p>
              )}
            </div>

            {/* Note */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Ghi chú (tùy chọn)
              </label>

              <textarea
                rows={2}
                placeholder="Bé có tính cách đặc biệt, dị ứng, hay yêu cầu nào không?"
                value={formData?.note || ""}
                disabled={isSubmitting}
                onChange={(event) =>
                  setFormData((previous) => ({
                    ...previous,
                    note: event.target.value,
                  }))
                }
                className="w-full p-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 text-gray-700 resize-none disabled:bg-gray-100"
              />
            </div>
          </>
        )}

        {/* ────────────────── STEP 3: REVIEW ────────────────── */}
        {step === 3 && (
          <div className="space-y-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Xác nhận thông tin lịch hẹn
            </p>

            {errors.serviceIds && (
              <p className="text-xs font-semibold text-red-500 flex items-center gap-1">
                <AlertCircle size={12} />
                {errors.serviceIds}
              </p>
            )}

            <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100 space-y-2">
              <p className="text-[10px] font-black text-orange-400 uppercase tracking-wider">
                Dịch vụ đã chọn
              </p>

              {selectedServices.map((service) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="text-sm text-gray-700 font-semibold">
                    {service.name}
                  </span>

                  <span className="text-sm font-black text-orange-600">
                    {formatPrice(Number(service.basePrice ?? service.price))}
                  </span>
                </div>
              ))}

              <div className="border-t border-orange-100 pt-2 flex justify-between">
                <span className="text-xs font-bold text-gray-500">
                  Tổng cộng · {formatDuration(totalDuration)}
                </span>

                <span className="text-base font-black text-orange-600">
                  {formatPrice(Number(totalAmount))}
                </span>
              </div>
            </div>

            {selectedPet && (
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xl">
                  {selectedPet.specie === "Cat" ? "🐱" : "🐶"}
                </div>

                <div>
                  <p className="text-sm font-black text-gray-800">
                    {selectedPet.name}
                  </p>
                  <p className="text-xs text-gray-400 font-medium">
                    {selectedPet.specie} · {selectedPet.gender}
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Ngày hẹn
                </p>

                <p className="text-sm font-black text-gray-800">
                  {formData?.date
                    ? new Date(`${formData.date}T00:00:00`).toLocaleDateString(
                        "vi-VN",
                        {
                          weekday: "short",
                          day: "numeric",
                          month: "long",
                        },
                      )
                    : "—"}
                </p>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Khung giờ
                </p>

                <p className="text-sm font-black text-gray-800">
                  {formData?.time || "—"}
                  {isBlockValid &&
                    selectedStartIndex >= 0 &&
                    slots[selectedStartIndex + safeSlotsNeeded - 1] &&
                    ` – ${
                      slots[selectedStartIndex + safeSlotsNeeded - 1].end_time
                    }`}
                </p>
              </div>
            </div>

            {formData?.note && (
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Ghi chú
                </p>

                <p className="text-sm text-gray-700">{formData.note}</p>
              </div>
            )}

            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-xs font-semibold text-red-600">
                <AlertCircle size={14} />
                {errors.submit}
              </div>
            )}

            {errors.petId && (
              <p className="text-xs font-semibold text-red-500 flex items-center gap-1">
                <AlertCircle size={12} />
                {errors.petId}
              </p>
            )}

            {errors.date && (
              <p className="text-xs font-semibold text-red-500 flex items-center gap-1">
                <AlertCircle size={12} />
                {errors.date}
              </p>
            )}

            {errors.time && (
              <p className="text-xs font-semibold text-red-500 flex items-center gap-1">
                <AlertCircle size={12} />
                {errors.time}
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── FOOTER ── */}
      <div className="flex items-center justify-between gap-3 pt-5 mt-2 border-t border-gray-100">
        <button
          type="button"
          onClick={step > 1 ? goBack : undefined}
          disabled={isSubmitting}
          className={`px-4 py-2.5 border border-gray-200 text-gray-500 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50 ${
            step === 1 ? "invisible" : ""
          }`}
        >
          Quay lại
        </button>

        {step < 3 ? (
          <button
            type="button"
            onClick={goNext}
            disabled={isSubmitting}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-orange-500 text-white text-sm font-black rounded-xl hover:bg-orange-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all shadow-sm shadow-orange-200"
          >
            Tiếp theo <ChevronRight size={16} />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleConfirmBooking}
            disabled={isSubmitting}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-orange-500 text-white text-sm font-black rounded-xl hover:bg-orange-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all shadow-sm shadow-orange-200"
          >
            {submitted ? (
              <>
                <CheckCircle2 size={16} />
                Đã tạo lịch hẹn
              </>
            ) : isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <CheckCircle2 size={16} />
                Xác nhận đặt lịch
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default BookingForm;
