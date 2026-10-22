import { z } from "zod";
import {
  requiredTextSchema,
  positiveIdSchema,
} from "../../../shared/validators/commonSchemas.js";

const numberFromFormSchema = (
  fieldName,
  { integer = false, positive = false } = {},
) =>
  z.preprocess(
    (value) => {
      if (typeof value === "string") {
        const trimmedValue = value.trim();

        if (!trimmedValue) {
          return Number.NaN;
        }

        return Number(trimmedValue);
      }

      return value;
    },
    z
      .number({
        error: `${fieldName} phải là một số.`,
      })
      .finite(`${fieldName} không hợp lệ.`)
      .refine(
        (value) => !integer || Number.isInteger(value),
        `${fieldName} phải là số nguyên.`,
      )
      .refine(
        (value) => !positive || value > 0,
        `${fieldName} phải lớn hơn 0.`,
      ),
  );

export const serviceFormSchema = z.object({
  name: requiredTextSchema("Tên dịch vụ", 2, 100),

  description: requiredTextSchema("Mô tả dịch vụ", 1, 2000),

  basePrice: numberFromFormSchema("Giá dịch vụ", {
    positive: true,
  }),

  durationMin: numberFromFormSchema("Thời lượng", {
    integer: true,
    positive: true,
  }),

  categoryId: positiveIdSchema,
});

export const validateServiceForm = (formData) => {
  const result = serviceFormSchema.safeParse(formData);
  const errors = {};

  if (!result.success) {
    for (const issue of result.error.issues) {
      const field = issue.path.join(".") || "form";

      if (!errors[field]) {
        errors[field] = issue.message;
      }
    }
  }

  const isValid = Object.keys(errors).length === 0;

  return {
    isValid,
    errors,
    data: isValid ? result.data : null,
    message: Object.values(errors)[0] || "",
  };
};

export const validateServiceImageUrl = (value) => {
  const result = z
    .string()
    .trim()
    .min(1, "Vui lòng nhập đường dẫn ảnh.")
    .url("Đường dẫn ảnh không đúng định dạng.")
    .refine(
      (url) => {
        try {
          const parsedUrl = new URL(url);

          return ["http:", "https:"].includes(parsedUrl.protocol);
        } catch {
          return false;
        }
      },
      "Đường dẫn ảnh phải sử dụng HTTP hoặc HTTPS.",
    )
    .safeParse(value);

  if (!result.success) {
    return {
      isValid: false,
      message:
        result.error.issues[0]?.message || "Đường dẫn ảnh không hợp lệ.",
      data: null,
    };
  }

  return {
    isValid: true,
    message: "",
    data: result.data,
  };
};

const serviceValidator = {
  serviceFormSchema,
  validateServiceForm,
  validateServiceImageUrl,
};

export default serviceValidator;
