import { z } from "zod";

export const productReviewSchema = z.object({
  rating: z
    .number()
    .int("Số sao đánh giá không hợp lệ.")
    .min(1, "Vui lòng chọn ít nhất 1 sao.")
    .max(5, "Số sao đánh giá tối đa là 5."),

  comment: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập nhận xét cho sản phẩm.")
    .max(1000, "Nhận xét không được vượt quá 1000 ký tự."),
});

export const orderReviewsSchema = z.record(
  z.string(),
  productReviewSchema,
);
