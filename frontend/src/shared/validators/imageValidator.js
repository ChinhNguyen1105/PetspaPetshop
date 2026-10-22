const DEFAULT_ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const DEFAULT_MAX_SIZE_MB = 5;

/**
 * Kiểm tra một file ảnh.
 *
 * @param {File|null|undefined} file
 * @param {Object} options
 * @param {number} options.maxSizeMB
 * @param {string[]} options.allowedTypes
 * @returns {{ isValid: boolean, message: string }}
 */
export const validateImageFile = (
  file,
  {
    maxSizeMB = DEFAULT_MAX_SIZE_MB,
    allowedTypes = DEFAULT_ALLOWED_TYPES,
  } = {},
) => {
  if (!file) {
    return {
      isValid: false,
      message: "Vui lòng chọn ảnh.",
    };
  }

  if (typeof file.size !== "number" || typeof file.type !== "string") {
    return {
      isValid: false,
      message: "Tệp được chọn không hợp lệ.",
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      message: "Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP.",
    };
  }

  if (!Number.isFinite(maxSizeMB) || maxSizeMB <= 0) {
    return {
      isValid: false,
      message: "Giới hạn dung lượng ảnh không hợp lệ.",
    };
  }

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  if (file.size <= 0) {
    return {
      isValid: false,
      message: "Tệp ảnh đang trống.",
    };
  }

  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      message: `Dung lượng ảnh không được vượt quá ${maxSizeMB} MB.`,
    };
  }

  return {
    isValid: true,
    message: "",
  };
};

/**
 * Kiểm tra danh sách file ảnh, ví dụ upload nhiều ảnh sản phẩm.
 *
 * @param {FileList|File[]|null|undefined} files
 * @param {Object} options
 * @param {number} options.maxFiles
 * @param {number} options.maxSizeMB
 * @param {string[]} options.allowedTypes
 * @returns {{ isValid: boolean, message: string, errors: string[] }}
 */
export const validateImageFiles = (
  files,
  {
    maxFiles = 6,
    maxSizeMB = DEFAULT_MAX_SIZE_MB,
    allowedTypes = DEFAULT_ALLOWED_TYPES,
  } = {},
) => {
  const fileList = files ? Array.from(files) : [];
  const errors = [];

  if (fileList.length === 0) {
    return {
      isValid: false,
      message: "Vui lòng chọn ít nhất một ảnh.",
      errors: ["Vui lòng chọn ít nhất một ảnh."],
    };
  }

  if (!Number.isInteger(maxFiles) || maxFiles < 1) {
    return {
      isValid: false,
      message: "Số lượng ảnh tối đa không hợp lệ.",
      errors: ["Số lượng ảnh tối đa không hợp lệ."],
    };
  }

  if (fileList.length > maxFiles) {
    errors.push(`Chỉ được chọn tối đa ${maxFiles} ảnh.`);
  }

  fileList.forEach((file, index) => {
    const result = validateImageFile(file, {
      maxSizeMB,
      allowedTypes,
    });

    if (!result.isValid) {
      errors.push(`Ảnh thứ ${index + 1}: ${result.message}`);
    }
  });

  return {
    isValid: errors.length === 0,
    message: errors[0] || "",
    errors,
  };
};

const imageValidator = {
  validateImageFile,
  validateImageFiles,
};

export default imageValidator;
