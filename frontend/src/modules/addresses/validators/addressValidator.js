
import { z } from "zod";
import { requiredTextSchema, phoneSchema } from "../../../shared/validators/commonSchemas";

export const addressSchema = z.object({
  receiverName: requiredTextSchema("tên người nhận", 1, 255),

  phone: phoneSchema,

  city: requiredTextSchema("Tỉnh/Thành phố", 1, 255),

  district: requiredTextSchema("Quận/Huyện", 1, 255),

  detailAddress: requiredTextSchema("số nhà, tên đường", 1, 500),
});

export const validateAddress = (formData) => {
  const result = addressSchema.safeParse(formData);

  if (result.success) {
    return {};
  }

  const errors = {};

  for (const issue of result.error.issues) {
    const field = issue.path[0];

    if (field && !errors[field]) {
      errors[field] = issue.message;
    }
  }

  return errors;
};
