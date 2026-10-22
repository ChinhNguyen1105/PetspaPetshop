import { z } from "zod";

const today = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const birthdaySchema = z
  .string()
  .optional()
  .default("")
  .refine((value) => {
    if (!value) return true;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return false;
    }

    const [year, month, day] = value.split("-").map(Number);

    const date = new Date(Date.UTC(year, month - 1, day));

    if (
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() !== month - 1 ||
      date.getUTCDate() !== day
    ) {
      return false;
    }

    const now = new Date();
    const todayValue =
      now.getFullYear() * 10000 +
      (now.getMonth() + 1) * 100 +
      now.getDate();

    const inputValue = year * 10000 + month * 100 + day;

    return inputValue <= todayValue;
  }, "Ngày sinh không hợp lệ hoặc nằm trong tương lai.");

const petFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập tên thú cưng.")
    .max(100, "Tên thú cưng không được vượt quá 100 ký tự."),

  specie: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập loài thú cưng.")
    .max(50, "Tên loài không được vượt quá 50 ký tự."),

  gender: z.enum(["MALE", "FEMALE", "UNKNOWN"], {
    message: "Vui lòng chọn giới tính hợp lệ.",
  }),

  birthday: birthdaySchema,

  weight: z
    .number({ message: "Cân nặng phải là một số hợp lệ." })
    .finite("Cân nặng không hợp lệ.")
    .positive("Cân nặng phải lớn hơn 0."),

  healthStatus: z
    .string()
    .trim()
    .max(1000, "Tình trạng sức khỏe không được vượt quá 1000 ký tự."),
});

export const validatePetForm = (formData, isEdit = false) => {
  const payload = {
    name: String(formData.name ?? ""),
    specie: String(formData.specie ?? "").trim().toUpperCase(),
    gender: String(formData.gender ?? "").toUpperCase(),
    birthday: String(formData.birthday ?? ""),
    weight:
      formData.weight === "" || formData.weight == null
        ? Number.NaN
        : Number(formData.weight),
    healthStatus: String(formData.healthStatus ?? ""),
  };

  if (isEdit) {
    const id = Number(formData.id);

    if (!Number.isInteger(id) || id <= 0) {
      return {
        success: false,
        error: {
          issues: [
            {
              path: ["id"],
              message: "ID thú cưng không hợp lệ.",
            },
          ],
        },
      };
    }

    payload.id = id;
  }

  return petFormSchema.safeParse(payload);
};
