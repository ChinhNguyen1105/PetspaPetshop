/**
 * Kiểm tra định dạng email hợp lệ.
 */
export const isValidEmail = (email) => {
  if (typeof email !== "string") {
    return false;
  }

  const normalizedEmail = email.trim();

  if (!normalizedEmail || normalizedEmail.length > 254) {
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(normalizedEmail);
};

/**
 * Xác thực dữ liệu form đăng nhập.
 * @param {Object} formData - Dữ liệu email và password.
 * @returns {{ isValid: boolean, message: string }}
 */
export const validateLoginForm = (formData) => {
  const email =
    typeof formData?.email === "string" ? formData.email.trim() : "";

  const password =
    typeof formData?.password === "string" ? formData.password : "";

  if (!email || !password) {
    return {
      isValid: false,
      message: "Vui lòng điền đầy đủ Email và Mật khẩu.",
    };
  }

  if (!isValidEmail(email)) {
    return {
      isValid: false,
      message: "Định dạng Email không hợp lệ (Ví dụ: name@example.com).",
    };
  }

  if (password.length < 6) {
    return {
      isValid: false,
      message: "Mật khẩu phải chứa ít nhất 6 ký tự.",
    };
  }

  if (password.length > 128) {
    return {
      isValid: false,
      message: "Mật khẩu không được vượt quá 128 ký tự.",
    };
  }

  return {
    isValid: true,
    message: "",
  };
};

/**
 * Xác thực dữ liệu form đăng ký.
 * Không yêu cầu số điện thoại, theo form hiện tại.
 * @param {Object} formData - Dữ liệu name, email, password, confirmPassword.
 * @returns {{ isValid: boolean, message: string }}
 */
export const validateRegisterForm = (formData) => {
  const name =
    typeof formData?.name === "string" ? formData.name.trim() : "";

  const email =
    typeof formData?.email === "string" ? formData.email.trim() : "";

  const password =
    typeof formData?.password === "string" ? formData.password : "";

  const confirmPassword =
    typeof formData?.confirmPassword === "string"
      ? formData.confirmPassword
      : "";

  if (!name || !email || !password || !confirmPassword) {
    return {
      isValid: false,
      message: "Vui lòng điền đầy đủ tất cả các trường thông tin.",
    };
  }

  if (name.length < 2) {
    return {
      isValid: false,
      message: "Họ và tên phải có ít nhất 2 ký tự.",
    };
  }

  if (name.length > 100) {
    return {
      isValid: false,
      message: "Họ và tên không được vượt quá 100 ký tự.",
    };
  }

  if (!isValidEmail(email)) {
    return {
      isValid: false,
      message: "Định dạng email không hợp lệ. Vui lòng kiểm tra lại.",
    };
  }

  if (password.length < 6) {
    return {
      isValid: false,
      message: "Mật khẩu bảo mật phải chứa ít nhất 6 ký tự.",
    };
  }

  if (password.length > 128) {
    return {
      isValid: false,
      message: "Mật khẩu không được vượt quá 128 ký tự.",
    };
  }

  if (password !== confirmPassword) {
    return {
      isValid: false,
      message: "Mật khẩu xác nhận không khớp với mật khẩu đã nhập.",
    };
  }

  return {
    isValid: true,
    message: "",
  };
};

/**
 * Giữ default export để tương thích với cách import hiện tại.
 */
const authValidator = {
  isValidEmail,
  validateLoginForm,
  validateRegisterForm,
};

export default authValidator;
