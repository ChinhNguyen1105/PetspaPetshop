
import { z } from "zod";

import {
  emailSchema,
  positiveIdSchema,
} from "../../../shared/validators/commonSchemas.js";

/**
 * Schema kiểm tra thông tin người dùng và nhân viên.
 */
export const userFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập họ và tên.")
    .min(2, "Họ và tên phải có ít nhất 2 ký tự.")
    .max(100, "Họ và tên không được vượt quá 100 ký tự."),

  email: emailSchema,

  roleId: positiveIdSchema,

  gender: z
    .enum(["", "MALE", "FEMALE", "OTHER"])
    .optional()
    .default(""),

  dateOfBirth: z
    .string()
    .optional()
    .default("")
    .refine((value) => {
      if (!value) return true;

      if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return false;
      }

      const [year, month, day] = value.split("-").map(Number);

      // Dùng UTC để tránh sai lệch múi giờ.
      const date = new Date(Date.UTC(year, month - 1, day));

      // Ngày phải tồn tại thực tế.
      if (
        date.getUTCFullYear() !== year ||
        date.getUTCMonth() !== month - 1 ||
        date.getUTCDate() !== day
      ) {
        return false;
      }

      // Lấy ngày hiện tại theo lịch địa phương.
      const now = new Date();
      const todayValue =
        now.getFullYear() * 10000 +
        (now.getMonth() + 1) * 100 +
        now.getDate();

      const inputValue = year * 10000 + month * 100 + day;

      return inputValue <= todayValue;
    }, "Ngày sinh không hợp lệ hoặc nằm trong tương lai."),

  password: z.string().optional().default(""),
});

/**
 * Tạo mới: bắt buộc mật khẩu.
 * Cập nhật: cho phép mật khẩu rỗng.
 */
export const validateUserForm = (
  formData,
  { isEditMode = false } = {},
) => {
  const result = userFormSchema.safeParse(formData);
  const errors = {};

  if (!result.success) {
    for (const issue of result.error.issues) {
      const field = issue.path.join(".") || "form";

      if (!errors[field]) {
        errors[field] = issue.message;
      }
    }
  }

  const password = formData?.password ?? "";

  if (!isEditMode && !password.trim()) {
    errors.password = "Vui lòng nhập mật khẩu.";
  } else if (password && password.length < 6) {
    errors.password = "Mật khẩu phải có ít nhất 6 ký tự.";
  } else if (password && password.length > 128) {
    errors.password = "Mật khẩu không được vượt quá 128 ký tự.";
  }

  const isValid = Object.keys(errors).length === 0;

  return {
    isValid,
    errors,
    data: isValid ? result.data : null,
  };
};

const userValidator = {
  userFormSchema,
  validateUserForm,
};

export default userValidator;
