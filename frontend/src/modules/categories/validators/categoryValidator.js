const VALID_CATEGORY_TYPES = ["PRODUCT", "SERVICE"];

export const validateCategory = (category) => {
  const errors = {};

  const name =
    typeof category?.name === "string" ? category.name.trim() : "";

  if (!name) {
    errors.name = "Tên danh mục không được để trống.";
  } else if (name.length > 100) {
    errors.name = "Tên danh mục không được vượt quá 100 ký tự.";
  }

  if (!VALID_CATEGORY_TYPES.includes(category?.categoryType)) {
    errors.categoryType = "Loại danh mục không hợp lệ.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    data: {
      name,
      categoryType: category?.categoryType,
    },
  };
};
