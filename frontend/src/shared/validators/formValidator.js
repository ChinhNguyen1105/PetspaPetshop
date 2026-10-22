/**
 * Validate dữ liệu bằng Zod schema.
 *
 * @param {import("zod").ZodType} schema
 * @param {Object} formData
 * @returns {{
 *   isValid: boolean,
 *   data: any,
 *   errors: Record<string, string>,
 *   message: string
 * }}
 */
export const validateForm = (schema, formData) => {
  const result = schema.safeParse(formData);

  if (result.success) {
    return {
      isValid: true,
      data: result.data,
      errors: {},
      message: "",
    };
  }

  const errors = {};

  for (const issue of result.error.issues) {
    const field = issue.path.length > 0
      ? issue.path.join(".")
      : "_form";

    if (!errors[field]) {
      errors[field] = issue.message;
    }
  }

  return {
    isValid: false,
    data: null,
    errors,
    message: Object.values(errors)[0] || "Dữ liệu không hợp lệ.",
  };
};

/**
 * Lấy thông báo lỗi đầu tiên của một trường.
 *
 * @param {Record<string, string>} errors
 * @param {string} fieldName
 * @returns {string}
 */
export const getFieldError = (errors, fieldName) => {
  return errors?.[fieldName] || "";
};

/**
 * Kiểm tra một trường theo schema riêng.
 *
 * @param {import("zod").ZodType} schema
 * @param {*} value
 * @returns {{ isValid: boolean, message: string, data: any }}
 */
export const validateField = (schema, value) => {
  const result = schema.safeParse(value);

  if (result.success) {
    return {
      isValid: true,
      message: "",
      data: result.data,
    };
  }

  return {
    isValid: false,
    message: result.error.issues[0]?.message || "Dữ liệu không hợp lệ.",
    data: null,
  };
};

const formValidator = {
  validateForm,
  getFieldError,
  validateField,
};

export default formValidator;
