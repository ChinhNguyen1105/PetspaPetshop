/**
 * Validate dữ liệu form đặt lịch.
 *
 * @param {Object} formData
 * @param {Object} options
 * @param {boolean} options.isWalkIn - Đặt lịch trực tiếp tại quầy.
 * @param {boolean} options.requireGroomer - Bắt buộc chọn nhân viên.
 * @returns {Object} Object chứa lỗi theo tên trường.
 */
const validateBookingForm = (
  formData = {},
  {
    isWalkIn = false,
    requireGroomer = false,
  } = {},
) => {
  const errors = {};

  const isFilled = (value) =>
    value !== undefined &&
    value !== null &&
    String(value).trim() !== "";

  // Kiểm tra ID dạng số nguyên dương.
  // Dùng cho serviceId, petId và groomerId.
  const isPositiveId = (value) => {
    if (!isFilled(value)) {
      return false;
    }

    const number = Number(value);

    return Number.isSafeInteger(number) && number > 0;
  };

  // Kiểm tra ID khách hàng.
  // Chấp nhận UUID dạng chuỗi hoặc ID số nguyên dương.
  const isValidCustomerId = (value) => {
    if (!isFilled(value)) {
      return false;
    }

    if (typeof value === "string") {
      const normalizedValue = value.trim();

      // Chấp nhận UUID, ví dụ:
      // 550e8400-e29b-41d4-a716-446655440000
      const uuidPattern =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

      if (uuidPattern.test(normalizedValue)) {
        return true;
      }
    }

    // Hỗ trợ trường hợp hệ thống dùng ID số.
    return isPositiveId(value);
  };

  // Services
  if (
    !Array.isArray(formData.serviceIds) ||
    formData.serviceIds.length === 0
  ) {
    errors.serviceIds = "Vui lòng chọn ít nhất một dịch vụ!";
  } else if (!formData.serviceIds.every(isPositiveId)) {
    errors.serviceIds = "Danh sách dịch vụ không hợp lệ!";
  }

  // Groomer (admin only)
  if (requireGroomer && !isPositiveId(formData.groomerId)) {
    errors.groomerId = "Vui lòng chọn nhân viên thực hiện!";
  }

  // Date
  const date =
    typeof formData.date === "string" ? formData.date.trim() : "";

  if (!date) {
    errors.date = "Vui lòng chọn ngày đặt lịch!";
  } else {
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;

    if (!datePattern.test(date)) {
      errors.date = "Ngày đặt lịch không hợp lệ!";
    } else {
      const [year, month, day] = date.split("-").map(Number);
      const selectedDate = new Date(year, month - 1, day);

      const validDate =
        selectedDate.getFullYear() === year &&
        selectedDate.getMonth() === month - 1 &&
        selectedDate.getDate() === day;

      if (!validDate) {
        errors.date = "Ngày đặt lịch không hợp lệ!";
      } else {
        const now = new Date();

        const today = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
        );

        if (selectedDate < today) {
          errors.date = "Ngày đặt lịch không được nằm trong quá khứ!";
        }
      }
    }
  }

  // Time: accepts HH:mm or HH:mm:ss.
  const time =
    typeof formData.time === "string" ? formData.time.trim() : "";

  const timePattern = /^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/;

  if (!time) {
    errors.time = "Vui lòng chọn khung giờ!";
  } else if (!timePattern.test(time)) {
    errors.time = "Khung giờ không hợp lệ!";
  }

  // Walk-in customer
  if (isWalkIn) {
    const name = String(
      formData.walkInName ?? formData.customerName ?? "",
    ).trim();

    const phone = String(
      formData.walkInPhone ?? formData.customerPhone ?? "",
    ).trim();

    if (!name) {
      errors.customerName = "Vui lòng nhập tên khách hàng!";
    } else if (name.length < 2 || name.length > 100) {
      errors.customerName =
        "Tên khách hàng phải có từ 2 đến 100 ký tự!";
    }

    // Vietnamese mobile phone: 0xxxxxxxxx or +84xxxxxxxxx.
    const phoneRegex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;

    if (!phone) {
      errors.customerPhone = "Vui lòng nhập số điện thoại!";
    } else if (!phoneRegex.test(phone)) {
      errors.customerPhone = "Số điện thoại không hợp lệ!";
    }
  } else {
    // Registered customer
    // Customer ID có thể là UUID, không bắt buộc phải là số.
    if (!isValidCustomerId(formData.customerId)) {
      errors.customerId = "Vui lòng chọn khách hàng!";
    }

    // Pet ID vẫn phải là số nguyên dương.
    if (!isPositiveId(formData.petId)) {
      errors.petId = "Vui lòng chọn thú cưng!";
    }
  }

  return errors;
};

export default validateBookingForm;