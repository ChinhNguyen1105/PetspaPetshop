const isValidId = (id) => {
  if (id === undefined || id === null || String(id).trim() === "") {
    return false;
  }

  const parsedId = Number(id);

  return Number.isSafeInteger(parsedId) && parsedId > 0;
};

const isValidQuantity = (quantity) => {
  if (
    quantity === undefined ||
    quantity === null ||
    quantity === ""
  ) {
    return false;
  }

  const parsedQuantity = Number(quantity);

  return Number.isSafeInteger(parsedQuantity) && parsedQuantity >= 1;
};

const isValidPrice = (price) => {
  if (price === undefined || price === null || price === "") {
    return false;
  }

  const parsedPrice = Number(price);

  return Number.isFinite(parsedPrice) && parsedPrice >= 0;
};

/**
 * Validate ID của sản phẩm trong giỏ hàng.
 */
export const validateCartItemId = (id) => {
  const isValid = isValidId(id);

  return {
    isValid,
    error: isValid
      ? ""
      : "ID sản phẩm trong giỏ hàng không hợp lệ.",
  };
};

/**
 * Validate số lượng trước khi cập nhật giỏ hàng.
 */
export const validateCartQuantity = (quantity) => {
  const isValid = isValidQuantity(quantity);

  return {
    isValid,
    errors: isValid
      ? {}
      : {
          quantity:
            "Số lượng phải là số nguyên lớn hơn hoặc bằng 1.",
        },
    data: {
      quantity: isValid ? Number(quantity) : null,
    },
  };
};

/**
 * Validate thông tin cơ bản của một sản phẩm trong giỏ hàng.
 */
export const validateCartItem = (item) => {
  const errors = {};

  if (!isValidId(item?.id)) {
    errors.id = "ID sản phẩm trong giỏ hàng không hợp lệ.";
  }

  if (!isValidId(item?.productId)) {
    errors.productId = "ID sản phẩm không hợp lệ.";
  }

  if (!isValidQuantity(item?.quantity)) {
    errors.quantity = "Số lượng sản phẩm không hợp lệ.";
  }

  if (!isValidPrice(item?.productPrice)) {
    errors.productPrice = "Giá sản phẩm không hợp lệ.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate dữ liệu tổng quan của giỏ hàng.
 */
export const validateCartSummary = ({ itemDtoList, totalAmount }) => {
  const errors = {};

  if (!Array.isArray(itemDtoList)) {
    errors.itemDtoList = "Dữ liệu giỏ hàng không hợp lệ.";
  }

  if (!isValidPrice(totalAmount)) {
    errors.totalAmount = "Tổng tiền giỏ hàng không hợp lệ.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
