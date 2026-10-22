import { z } from "zod";

export const PERMISSION_MODULES = [
  "AUTH",
  "USER",
  "ROLE",
  "PERMISSION",
  "PRODUCT",
  "PET",
  "SPA",
  "BOOKING",
  "ORDER",
  "CART",
  "SYSTEM",
];

export const PERMISSION_METHODS = [
  "GET",
  "POST",
  "PUT",
  "DELETE",
  "PATCH",
  "OPTIONS",
];

export const permissionFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Tên quyền hạn không được để trống.")
    .max(150, "Tên quyền hạn không được vượt quá 150 ký tự."),

  apiPath: z
    .string()
    .trim()
    .min(1, "API Path không được để trống.")
    .max(500, "API Path không được vượt quá 500 ký tự.")
    .refine(
      (value) => value.startsWith("/"),
      "API Path phải bắt đầu bằng dấu /."
    )
    .refine(
      (value) => !/\s/.test(value),
      "API Path không được chứa khoảng trắng."
    ),

  method: z
    .enum(PERMISSION_METHODS)
    .default("GET"),

  module: z
    .enum(PERMISSION_MODULES, {
      message: "Vui lòng chọn phân hệ hợp lệ.",
    }),
});

export const validatePermissionForm = (formData) => {
  return permissionFormSchema.safeParse({
    name: String(formData.name ?? ""),
    apiPath: String(formData.apiPath ?? ""),
    method: String(formData.method ?? "GET").toUpperCase(),
    module: String(formData.module ?? "").toUpperCase(),
  });
};
