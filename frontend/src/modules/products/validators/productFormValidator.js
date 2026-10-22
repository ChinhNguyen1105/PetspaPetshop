import { z } from "zod";

const requiredText = (label) =>
  z.string().trim().min(1, `${label} không được để trống.`);

const nonNegativeNumber = (label) =>
  z
    .number({ error: `${label} không hợp lệ.` })
    .finite(`${label} không hợp lệ.`)
    .min(0, `${label} không được nhỏ hơn 0.`);

export const productFormSchema = z.object({
  name: requiredText("Tên sản phẩm"),

  description: requiredText("Mô tả sản phẩm"),

  price: nonNegativeNumber("Giá sản phẩm"),

  categoryId: z
    .number({ error: "Vui lòng chọn danh mục hợp lệ." })
    .int("Danh mục không hợp lệ.")
    .positive("Vui lòng chọn danh mục hợp lệ."),

  quantity: nonNegativeNumber("Số lượng nhập kho")
    .int("Số lượng nhập kho phải là số nguyên.")
    .optional(),
});

export const validateProductForm = (formData, isEdit) => {
  const payload = {
    name: formData.name,
    description: formData.description,
    price: Number(formData.price),
    categoryId: Number(formData.categoryId),
  };

  if (!isEdit) {
    payload.quantity = Number(formData.quantity);
  }

  return productFormSchema.safeParse(payload);
};
