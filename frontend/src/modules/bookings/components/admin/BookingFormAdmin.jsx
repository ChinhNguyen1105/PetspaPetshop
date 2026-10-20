import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Calendar,
  Clock,
  AlertCircle,
  Plus,
  X,
  Notebook,
  CheckCircle2,
} from "lucide-react";
import validateBookingForm from "../../../../shared/validators/bookingValidator.js";

import { useServiceStore } from "../../../services/store/serviceStore.js";
import { useUserStore } from "../../../users/store/userStore.js";
import { usePetStore } from "../../../pets/store/petStore.js";
import { useBookingStore } from "../../store/bookingStore.js";
import { SLOT_TIMES } from "../../../../shared/constants/index.js";

const BookingFormAdmin = ({ initialData, onSubmit, onClose }) => {
  // ─── STORE DATA ──────────────────────────────────────────────────────────────
  const { services, fetchServices } = useServiceStore();
  const { users, fetchUsers } = useUserStore();
  const { pets, fetchPets, loading: loadingPets } = usePetStore();
  const fetchUnavailableSlots = useBookingStore(
    (state) => state.fetchUnavailableSlots,
  );
  const unavailableSlots = useBookingStore((state) => state.unavailableSlots);
  const bookingStoreError = useBookingStore((state) => state.error);

  // ─── LOCAL UI STATE ──────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [petsError, setPetsError] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [userError, setUserError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    userEmail: initialData?.user?.email ?? "",
    petId: initialData?.pet?.id ?? "",
    date: initialData?.bookingDate || "",
    time: initialData?.startTime || "",
    note: initialData?.note || "",
    serviceIds: initialData?.services?.map((s) => s.id.toString()) || [],
  });

  // SLOT_TIMES là toàn bộ ca làm việc. Store cung cấp các ca đã bị đặt;
  // form ghép hai nguồn để vẫn hiển thị ca bận và disable chúng.
  const slots = useMemo(() => {
    const bookedSlots = Array.isArray(unavailableSlots) ? unavailableSlots : [];

    const toSeconds = (value) => {
      if (typeof value !== "string") return null;
      const match = value.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
      if (!match) return null;
      return (
        Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3] || 0)
      );
    };

    const getTimeValue = (item, keys) => {
      if (typeof item === "string") return item;
      for (const key of keys) {
        if (item?.[key] != null) return item[key];
      }
      return null;
    };

    return SLOT_TIMES.map((slot) => {
      const slotStart = toSeconds(slot.startTime);
      const slotEnd = toSeconds(slot.endTime);
      const booked = bookedSlots.some((item) => {
        const bookedStartValue = getTimeValue(item, [
          "startTime",
          "start_time",
          "bookingStartTime",
          "time",
          "slotTime",
        ]);
        const bookedEndValue = getTimeValue(item, [
          "endTime",
          "end_time",
          "bookingEndTime",
        ]);
        const bookedStart = toSeconds(bookedStartValue);
        const bookedEnd = toSeconds(bookedEndValue);

        // Nếu API trả một giờ đơn lẻ thì chỉ đánh dấu ô bắt đầu tại giờ đó.
        if (bookedStart == null) return false;
        if (bookedEnd == null) return bookedStart === slotStart;

        // Nếu API trả khoảng thời gian đặt, disable mọi ô giao với khoảng đó.
        return slotStart < bookedEnd && slotEnd > bookedStart;
      });

      const isOwnCurrentBookingSlot =
        initialData &&
        formData.date === initialData.bookingDate &&
        slotStart != null &&
        toSeconds(initialData.startTime) != null &&
        toSeconds(initialData.endTime) != null &&
        slotStart < toSeconds(initialData.endTime) &&
        slotEnd > toSeconds(initialData.startTime);

      return {
        ...slot,
        available: !booked || Boolean(isOwnCurrentBookingSlot),
        reason: booked && !isOwnCurrentBookingSlot ? "BOOKED" : undefined,
      };
    });
  }, [unavailableSlots, initialData, formData.date]);

  // ─── MATCHED USER (tra cứu bằng email) ──────────────────────────────────────
  const matchedUser = useMemo(() => {
    const email = formData.userEmail?.trim().toLowerCase();
    if (!email) return undefined;

    return users.find((u) => u.email?.trim().toLowerCase() === email);
  }, [users, formData.userEmail]);

  // ─── TÍNH TOÁN GIÁ TRỊ PHÁT SINH ────────────────────────────────────────────
  const selectedServices = useMemo(
    () => services.filter((s) => formData.serviceIds.includes(s.id.toString())),
    [services, formData.serviceIds],
  );

  const totalDuration = useMemo(
    () =>
      selectedServices.reduce((sum, s) => sum + (s.durationMin || 0), 0) || 30,
    [selectedServices],
  );

  const totalAmount = useMemo(
    () => selectedServices.reduce((sum, s) => sum + (s.basePrice || 0), 0),
    [selectedServices],
  );

  const slotsNeeded = Math.ceil(totalDuration / 30);
  // ─── FETCH METADATA BAN ĐẦU TỪ STORES ──────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchServices(), fetchUsers()]);
      } catch (error) {
        console.error("Lỗi tải dịch vụ hoặc khách hàng:", error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [fetchServices, fetchUsers]);

  // ─── KIỂM TRA EMAIL KHÁCH HÀNG ──────────────────────────────────────────────
  useEffect(() => {
    const email = formData.userEmail?.trim();
    if (!email) {
      setUserError("");
      return;
    }

    // Chỉ báo không tìm thấy khi email có vẻ đã nhập đầy đủ.
    if (!matchedUser) {
      setUserError("Không tìm thấy khách hàng với email này.");
    } else {
      setUserError("");
    }
  }, [formData.userEmail, matchedUser]);

  // ─── LẤY PET BẰNG QUERY ĐÃ TÍCH HỢP TRONG PET STORE ────────────────────────
  useEffect(() => {
    if (!matchedUser?.id) {
      setPetsError("");
      setFormData((prev) => ({ ...prev, petId: "" }));
      return;
    }

    setPetsError("");
    setFormData((prev) => ({ ...prev, petId: "" }));

    fetchPets({
      page: 1,
      pageSize: 100,
      filter: `user_id:${matchedUser.id}`,
    }).catch((error) => {
      console.error("Lỗi lấy danh sách thú cưng của khách hàng:", error);
      setPetsError(
        error?.response?.data?.message ||
          error?.message ||
          "Không thể tải danh sách thú cưng của khách hàng.",
      );
    });
  }, [matchedUser?.id, fetchPets]);

  // ─── LẤY CÁC CA ĐÃ ĐẶT TỪ BOOKING STORE THEO NGÀY ───────────────────────────
  useEffect(() => {
    if (!formData.date) {
      setLoadingSlots(false);
      return;
    }

    let cancelled = false;
    setLoadingSlots(true);

    fetchUnavailableSlots({ date: formData.date })
      .catch((err) => {
        console.error("Lỗi lấy các khung giờ đã đặt:", err);
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false);
      });

    return () => {
      cancelled = true;
    };
  }, [formData.date, fetchUnavailableSlots]);

  // ─── THUẬT TOÁN KIỂM TRA N SLOT LIÊN TIẾP ───────────────────────────────────
  const checkConsecutiveSlots = useCallback(
    (startIndex) => {
      if (startIndex < 0 || startIndex >= slots.length)
        return { available: false, reason: "INVALID_INDEX" };

      for (let i = 0; i < slotsNeeded; i++) {
        const slot = slots[startIndex + i];
        if (!slot) return { available: false, reason: "OVER_WORKING_HOURS" };

        const isOwnCurrentSlot =
          initialData &&
          formData.date === initialData.bookingDate &&
          slot.startTime === initialData.startTime;

        if (!slot.available && !isOwnCurrentSlot) {
          return {
            available: false,
            reason: i === 0 ? slot.reason : "INSUFFICIENT_CONSECUTIVE_SLOTS",
          };
        }
      }
      return { available: true };
    },
    [slots, slotsNeeded, initialData, formData.date],
  );

  const selectedStartIndex = useMemo(
    () =>
      formData.time
        ? slots.findIndex((s) => s.startTime === formData.time)
        : -1,
    [formData.time, slots],
  );

  useEffect(() => {
    if (selectedStartIndex !== -1) {
      const evaluation = checkConsecutiveSlots(selectedStartIndex);
      if (!evaluation.available) setFormData((prev) => ({ ...prev, time: "" }));
    }
  }, [slotsNeeded, slots, selectedStartIndex, checkConsecutiveSlots]);

  // Auto-select earliest available consecutive block
  useEffect(() => {
    if (!formData.date) return;
    if (!formData.serviceIds || formData.serviceIds.length === 0) return;
    if (formData.time) return; // keep user selection
    if (!slots || slots.length === 0) return;

    for (let i = 0; i < slots.length; i++) {
      const evaluation = checkConsecutiveSlots(i);
      if (evaluation.available) {
        setFormData((prev) => ({ ...prev, time: slots[i].startTime }));
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

  // ─── HANDLERS ────────────────────────────────────────────────────────────────
  const handleServiceToggle = (serviceIdStr) => {
    setFormData((prev) => {
      const isExist = prev.serviceIds.includes(serviceIdStr);
      const updatedIds = isExist
        ? prev.serviceIds.filter((id) => id !== serviceIdStr)
        : [...prev.serviceIds, serviceIdStr];
      return { ...prev, serviceIds: updatedIds };
    });
  };

  const handleSelectSlot = (slot, index) => {
    const evaluation = checkConsecutiveSlots(index);
    if (!evaluation.available) return;
    setFormData((prev) => ({ ...prev, time: slot.startTime }));
  };

  // ─── SUBMIT: VALIDATE FORM VÀ GỬI DỮ LIỆU CHO COMPONENT CHA ─────────────────
  // BookingManagement sẽ mở ConfirmModal; API chỉ được gọi sau khi admin xác nhận.
  const handleFormSubmit = (e) => {
    e.preventDefault();
    setSubmitError("");
    setUserError("");

    // bookingValidator yêu cầu customerId, còn payload API dùng userId.
    const validationPayload = {
      serviceIds: formData.serviceIds,
      date: formData.date,
      time: formData.time,
      customerId: matchedUser?.id ?? "",
      petId: formData.petId,
    };

    const errors = validateBookingForm(validationPayload, {
      requireGroomer: false,
    });

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (!matchedUser?.id) {
      setUserError("Vui lòng nhập email hợp lệ của khách hàng.");
      return;
    }

    setFormErrors({});

    const endTime =
      slots[selectedStartIndex + slotsNeeded - 1]?.endTime || formData.time;

    // User ID là UUID, không ép sang Number; pet/service ID là số.
    const payload = {
      userId: matchedUser.id,
      petId: Number(formData.petId),
      serviceIds: formData.serviceIds.map(Number),
      bookingDate: formData.date,
      startTime: formData.time,
      endTime,
      note: formData.note?.trim() || "",
      durationMinutes: totalDuration,
    };

    if (typeof onSubmit !== "function") {
      setSubmitError(
        "Không thể gửi biểu mẫu: component cha chưa truyền onSubmit.",
      );
      console.error("BookingFormAdmin: onSubmit prop is missing.");
      return;
    }

    onSubmit(payload);
  };

  // ─── BADGE LÝ DO SLOT ────────────────────────────────────────────────────────
  const getReasonBadge = (reason) => {
    switch (reason) {
      case "BOOKED":
        return { label: "Kín lịch", color: "bg-red-100 text-red-500" };
      case "OUTSIDE_WORKING_HOURS":
        return { label: "Ngoài giờ", color: "bg-gray-200 text-gray-500" };
      case "OVER_WORKING_HOURS":
        return { label: "Cuối ca", color: "bg-gray-200 text-gray-500" };
      case "INSUFFICIENT_CONSECUTIVE_SLOTS":
        return { label: "Thiếu ô tiếp", color: "bg-amber-100 text-amber-600" };
      default:
        return { label: "Hết chỗ", color: "bg-gray-200 text-gray-500" };
    }
  };

  // Hiển thị lý do nút xác nhận đang bị khóa để dễ kiểm tra form.
  const submitDisabledReason = !formData.time
    ? "Bạn chưa chọn khung giờ."
    : isSubmitting
      ? "Đang gửi yêu cầu tạo lịch."
      : !matchedUser
        ? "Chưa tìm thấy khách hàng theo email."
        : !formData.petId
          ? "Bạn chưa chọn thú cưng."
          : "";

  // ─── LOADING TOÀN TRANG ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="py-12 text-center text-sm font-semibold text-gray-500 animate-pulse">
        Đang tải cấu hình biểu mẫu toàn hệ thống...
      </div>
    );
  }

  // ─── RENDER ──────────────────────────────────────────────────────────────────
  return (
    <form
      noValidate
      onSubmit={handleFormSubmit}
      className="space-y-6 text-left max-h-[75vh] overflow-y-auto pr-2"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      {(submitError || bookingStoreError) && (
        <div className="p-3 rounded-xl border border-red-200 bg-red-50 text-sm text-red-600 font-medium">
          {submitError || bookingStoreError}
        </div>
      )}

      {/* 1. CHỌN DỊCH VỤ */}
      <div>
        <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">
          1. Dịch vụ chăm sóc <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {services.map((s) => {
            const isChecked = formData.serviceIds.includes(s.id.toString());
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => handleServiceToggle(s.id.toString())}
                className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isChecked
                    ? "bg-orange-50 border-orange-400 text-orange-600 shadow-sm"
                    : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                {isChecked ? <X size={12} /> : <Plus size={12} />}
                {s.name} ({s.durationMin}p)
              </button>
            );
          })}
        </div>

        {selectedServices.length > 0 && (
          <div className="p-3 bg-gray-50 rounded-xl text-xs text-gray-500 flex justify-between items-center font-medium">
            <span>Đã chọn: {selectedServices.length} dịch vụ</span>
            <span>
              Tổng thời gian:{" "}
              <strong className="text-orange-500 font-bold">
                {totalDuration} phút
              </strong>
            </span>
          </div>
        )}

        {formErrors.serviceIds && (
          <p className="text-xs font-semibold text-red-500 mt-1 flex items-center gap-1">
            <AlertCircle size={12} /> {formErrors.serviceIds}
          </p>
        )}
      </div>

      {/* 2. KHÁCH HÀNG: TÌM THEO EMAIL */}
      <div className="space-y-4 bg-orange-50/30 p-4 rounded-2xl border border-orange-100/50">
        <label className="block text-xs font-black text-gray-400 uppercase tracking-wider">
          2. Thông tin khách hàng <span className="text-red-500">*</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">
              Email khách hàng <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              placeholder="Nhập email khách hàng"
              value={formData.userEmail}
              onChange={(e) => {
                const userEmail = e.target.value;
                setFormData((prev) => ({ ...prev, userEmail, petId: "" }));
                setFormErrors((prev) => ({
                  ...prev,
                  customerId: "",
                  userId: "",
                  petId: "",
                }));
              }}
              className={`w-full p-2.5 rounded-xl border outline-none text-sm text-gray-700 focus:border-orange-500 ${
                formErrors.customerId || formErrors.userId
                  ? "border-red-400"
                  : "border-gray-200"
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">
              Kết quả tra cứu
            </label>
            {matchedUser ? (
              <div className="p-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl flex items-center gap-2 text-xs font-bold">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                <div>
                  <p>{matchedUser.name}</p>
                  <p className="font-medium text-gray-400 text-[10px]">
                    {matchedUser.email}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-2.5 bg-gray-100 text-gray-400 border border-dashed rounded-xl text-xs font-medium text-center">
                Chưa có dữ liệu
              </div>
            )}
          </div>
        </div>

        {userError && (
          <p className="text-xs font-semibold text-red-500 mt-1">{userError}</p>
        )}

        {(formErrors.customerId || formErrors.userId) && (
          <p className="text-xs font-semibold text-red-500 flex items-center gap-1">
            <AlertCircle size={12} />
            {formErrors.customerId || formErrors.userId}
          </p>
        )}

        {/* CHỌN THÚ CƯNG */}
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">
            Chọn Thú cưng tương ứng <span className="text-red-500">*</span>
          </label>
          {petsError && (
            <p className="mb-2 text-xs font-semibold text-red-500">
              {petsError}
            </p>
          )}
          <select
            className={`w-full p-2.5 rounded-xl border outline-none bg-white font-medium text-sm text-gray-700 focus:border-orange-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
              formErrors.petId ? "border-red-400" : "border-gray-200"
            }`}
            value={formData.petId}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, petId: e.target.value }))
            }
            disabled={!matchedUser || loadingPets}
          >
            {!matchedUser ? (
              <option value="">-- Vui lòng nhập email hợp lệ trước --</option>
            ) : loadingPets ? (
              <option value="">Đang tải danh sách pet của khách...</option>
            ) : pets.length === 0 ? (
              <option value="">Tài khoản khách này chưa đăng ký Pet nào</option>
            ) : (
              <>
                <option value="">-- Chọn thú cưng nhận dịch vụ --</option>
                {pets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.specie})
                  </option>
                ))}
              </>
            )}
          </select>
          {formErrors.petId && (
            <p className="text-xs font-semibold text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle size={12} /> {formErrors.petId}
            </p>
          )}
        </div>
      </div>

      {/* 3. NGÀY HẸN */}
      <div>
        <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
          <Calendar size={14} /> 3. Chọn ngày đặt lịch{" "}
          <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          min={new Date().toISOString().split("T")[0]}
          value={formData.date}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              date: e.target.value,
              time: "",
            }))
          }
          className={`w-full p-3 rounded-xl border outline-none bg-white font-medium text-sm text-gray-700 focus:border-orange-500 ${
            formErrors.date ? "border-red-400" : "border-gray-200"
          }`}
        />
        {formErrors.date && (
          <p className="text-xs font-semibold text-red-500 mt-1 flex items-center gap-1">
            <AlertCircle size={12} /> {formErrors.date}
          </p>
        )}
      </div>

      {/* 4. KHUNG GIỜ */}
      <div>
        <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
          <Clock size={14} /> 4. Trạng thái ca trống{" "}
          <span className="text-red-500">*</span>
        </label>

        {!formData.date ? (
          <div className="p-4 bg-gray-50 text-gray-400 rounded-xl border border-dashed border-gray-200 text-center text-xs flex items-center justify-center gap-1.5">
            <AlertCircle size={14} /> Vui lòng chọn{" "}
            <strong>Ngày đặt lịch</strong> để hiển thị ca trống.
          </div>
        ) : formData.serviceIds.length === 0 ? (
          <div className="p-4 bg-amber-50 text-amber-600 rounded-xl border border-dashed border-amber-200 text-center text-xs font-bold">
            Vui lòng chọn dịch vụ ở mục 1 để tính toán thời lượng giữ ô!
          </div>
        ) : loadingSlots ? (
          <div className="grid grid-cols-2 gap-2 animate-pulse">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-14 bg-gray-100 rounded-xl" />
            ))}
          </div>
        ) : slots.length === 0 ? (
          <div className="p-4 bg-red-50 text-red-500 rounded-xl border border-red-100 text-center text-xs font-bold">
            Không có ca làm việc hoặc đã kín lịch vào ngày này!
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1 bg-gray-50 rounded-xl border">
            {slots.map((slot, index) => {
              const evaluation = checkConsecutiveSlots(index);
              const isAvailable = evaluation.available;
              const reason = isAvailable
                ? null
                : evaluation.reason || slot.reason;
              const isInSelectedBlock =
                selectedStartIndex >= 0 &&
                index >= selectedStartIndex &&
                index < selectedStartIndex + slotsNeeded;
              const isActualStart = formData.time === slot.startTime;
              const badge = reason ? getReasonBadge(reason) : null;

              return (
                <button
                  key={index}
                  type="button"
                  disabled={!isAvailable}
                  onClick={() => handleSelectSlot(slot, index)}
                  className={`p-2 rounded-xl border text-left relative transition-all flex flex-col justify-between h-14 ${
                    isInSelectedBlock
                      ? "bg-orange-500 text-white border-orange-500 shadow-sm font-bold scale-[1.01]"
                      : !isAvailable
                        ? "bg-gray-100 border-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white hover:bg-orange-50/40 border-gray-200 text-gray-700 hover:border-orange-300 cursor-pointer font-semibold"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs tracking-wide font-bold">
                      {slot.startTime} – {slot.endTime}
                    </span>
                    {!isAvailable && badge && (
                      <span
                        className={`text-[8px] px-1 py-0.5 rounded font-bold uppercase tracking-wider ${badge.color}`}
                      >
                        {badge.label}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-[9px] block font-medium truncate ${
                      isInSelectedBlock ? "text-orange-100" : "text-gray-400"
                    }`}
                  >
                    {isInSelectedBlock
                      ? isActualStart
                        ? `Bắt đầu (${totalDuration}p)`
                        : "Chuỗi giữ chỗ"
                      : isAvailable
                        ? "Đủ điều kiện chọn"
                        : reason === "INSUFFICIENT_CONSECUTIVE_SLOTS"
                          ? "Thiếu ô liền kề"
                          : "Không thể chọn"}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {formErrors.time && (
          <p className="text-xs font-semibold text-red-500 mt-1 flex items-center gap-1">
            <AlertCircle size={12} /> {formErrors.time}
          </p>
        )}
      </div>

      {/* GHI CHÚ */}
      <div>
        <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
          <Notebook size={14} /> Ghi chú lịch hẹn
        </label>
        <textarea
          rows="2"
          placeholder="Yêu cầu đặc biệt về sức khỏe hoặc hành vi của bé..."
          value={formData.note}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, note: e.target.value }))
          }
          className="w-full p-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 text-gray-700"
        />
      </div>

      {/* TỔNG TIỀN */}
      {totalAmount > 0 && (
        <div className="p-3 bg-orange-50/50 rounded-xl border border-orange-100 flex justify-between items-center">
          <span className="text-xs font-bold text-gray-600">
            Doanh thu dự kiến:
          </span>
          <strong className="text-lg font-black text-orange-600">
            {totalAmount.toLocaleString("vi-VN")} đ
          </strong>
        </div>
      )}

      {/* FOOTER ACTIONS */}
      <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100 sticky bottom-0 bg-white">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-200 text-gray-500 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-all"
        >
          Hủy
        </button>
        <div className="flex flex-col items-end gap-1">
          <button
            type="submit"
            disabled={Boolean(submitDisabledReason)}
            title={submitDisabledReason || "Xác nhận tạo lịch hẹn"}
            className="px-5 py-2 bg-orange-500 text-white text-sm font-black rounded-xl hover:bg-opacity-95 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all"
          >
            Xác nhận lịch đặt
          </button>
          {submitDisabledReason && (
            <p className="text-[11px] text-red-500">{submitDisabledReason}</p>
          )}
        </div>
      </div>
    </form>
  );
};

export default BookingFormAdmin;
