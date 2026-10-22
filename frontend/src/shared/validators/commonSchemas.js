import { z } from "zod";

/**
 * Chuỗi bắt buộc, loại bỏ khoảng trắng ở hai đầu.
 */
export const requiredTextSchema = (fieldName, minLength = 1, maxLength = 255) =>
  z
    .string()
    .trim()
    .min(1, `Vui lòng nhập ${fieldName}.`)
    .min(minLength, `${fieldName} phải có ít nhất ${minLength} ký tự.`)
    .max(maxLength, `${fieldName} không được vượt quá ${maxLength} ký tự.`);

/**
 * Email hợp lệ.
 */
export const emailSchema = z
  .string()
  .trim()
  .min(1, "Vui lòng nhập email.")
  .email("Email không đúng định dạng.")
  .max(254, "Email không được vượt quá 254 ký tự.");

/**
 * Số điện thoại Việt Nam.
 * Chấp nhận dạng 0xxxxxxxxx hoặc +84xxxxxxxxx.
 */
export const phoneSchema = z
  .string()
  .trim()
  .min(1, "Vui lòng nhập số điện thoại.")
  .regex(
    /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/,
    "Số điện thoại Việt Nam không hợp lệ.",
  );

/**
 * Mật khẩu khi đăng ký hoặc đổi mật khẩu.
 */
export const passwordSchema = z
  .string()
  .min(1, "Vui lòng nhập mật khẩu.")
  .min(8, "Mật khẩu phải có ít nhất 8 ký tự.")
  .max(128, "Mật khẩu không được vượt quá 128 ký tự.");

/**
 * Xác nhận mật khẩu.
 */
export const confirmPasswordSchema = z
  .string()
  .min(1, "Vui lòng xác nhận mật khẩu.");

/**
 * Giá tiền không âm.
 * Chuyển chuỗi từ input thành số trước khi kiểm tra.
 */
export const priceSchema = z.preprocess(
  (value) => {
    if (typeof value === "string" && value.trim() === "") {
      return Number.NaN;
    }

    return typeof value === "string" ? Number(value) : value;
  },
  z
    .number({ error: "Giá tiền phải là một số." })
    .finite("Giá tiền không hợp lệ.")
    .min(0, "Giá tiền không được âm."),
);

/**
 * Số lượng nguyên không âm.
 */
export const quantitySchema = z.preprocess(
  (value) => {
    if (typeof value === "string" && value.trim() === "") {
      return Number.NaN;
    }

    return typeof value === "string" ? Number(value) : value;
  },
  z
    .number({ error: "Số lượng phải là một số." })
    .finite("Số lượng không hợp lệ.")
    .int("Số lượng phải là số nguyên.")
    .min(0, "Số lượng không được âm."),
);

/**
 * Mô tả không bắt buộc.
 */
export const optionalDescriptionSchema = z
  .string()
  .trim()
  .max(2000, "Mô tả không được vượt quá 2000 ký tự.")
  .optional()
  .or(z.literal(""));

/**
 * ID số nguyên dương.
 */
export const positiveIdSchema = z.preprocess(
  (value) => {
    if (typeof value === "string" && value.trim() === "") {
      return Number.NaN;
    }

    return typeof value === "string" ? Number(value) : value;
  },
  z
    .number({ error: "ID phải là một số." })
    .finite("ID không hợp lệ.")
    .int("ID phải là số nguyên.")
    .positive("ID phải lớn hơn 0."),
);

/**
 * Ngày hợp lệ theo định dạng YYYY-MM-DD.
 */
export const dateSchema = z
  .string()
  .min(1, "Vui lòng chọn ngày.")
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày không đúng định dạng YYYY-MM-DD.")
  .refine((value) => {
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );
  }, "Ngày không hợp lệ.");
