import { z } from "zod";

const permissionIdSchema = z
  .number({
    error: "ID quyền hạn phải là một số.",
  })
  .int("ID quyền hạn phải là số nguyên.")
  .positive("ID quyền hạn phải lớn hơn 0.");

export const rolePermissionSchema = z.object({
  id: permissionIdSchema,
});

export const rolePermissionFormSchema = z.object({
  roleId: z
    .number({
      error: "Vui lòng chọn vai trò cần cập nhật.",
    })
    .int("ID vai trò phải là số nguyên.")
    .positive("ID vai trò không hợp lệ."),

  name: z
    .string()
    .trim()
    .min(1, "Tên vai trò không được để trống.")
    .max(100, "Tên vai trò không được vượt quá 100 ký tự."),

  permissionIds: z
    .array(permissionIdSchema)
    .refine(
      (ids) => new Set(ids).size === ids.length,
      "Danh sách quyền hạn không được chứa ID trùng lặp."
    ),
});

export const validateRolePermissionForm = (formData) => {
  const result = rolePermissionFormSchema.safeParse(formData);
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

const roleValidator = {
  rolePermissionSchema,
  rolePermissionFormSchema,
  validateRolePermissionForm,
};

export default roleValidator;
