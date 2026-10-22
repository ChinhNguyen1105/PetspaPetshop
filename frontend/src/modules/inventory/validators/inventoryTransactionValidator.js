const VALID_TRANSACTION_TYPES = ["IMPORT", "EXPORT", "ADJUST"];

export const validateInventoryTransaction = ({
  type,
  productId,
  quantity,
  note,
  products = [],
}) => {
  const errors = {};

  // 1. Validate transaction type
  if (!VALID_TRANSACTION_TYPES.includes(type)) {
    errors.type = "Loại giao dịch không hợp lệ.";
  }

  // 2. Validate product
  if (
    productId === undefined ||
    productId === null ||
    String(productId).trim() === ""
  ) {
    errors.productId = "Vui lòng chọn sản phẩm.";
  } else {
    const product = products.find(
      (item) => String(item.id) === String(productId)
    );

    if (!product) {
      errors.productId = "Sản phẩm không tồn tại hoặc chưa được tải.";
    }
  }

  // 3. Validate quantity
  const parsedQuantity =
    quantity === "" || quantity === null || quantity === undefined
      ? NaN
      : Number(quantity);

  if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
    errors.quantity = "Số lượng phải là số lớn hơn 0.";
  }

  // 4. Validate export stock
  if (
    type === "EXPORT" &&
    !errors.productId &&
    !errors.quantity
  ) {
    const product = products.find(
      (item) => String(item.id) === String(productId)
    );

    const stockQuantity = Number(product?.stockQuantity);

    if (!Number.isFinite(stockQuantity)) {
      errors.quantity = "Không xác định được tồn kho hiện tại.";
    } else if (parsedQuantity > stockQuantity) {
      errors.quantity = `Số lượng xuất không được vượt quá tồn kho (${stockQuantity}).`;
    }
  }

  // 5. Validate note
  if (typeof note !== "string" || !note.trim()) {
    errors.note = "Vui lòng nhập ghi chú giao dịch.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    data: {
      type,
      productId: Number(productId),
      quantity: parsedQuantity,
      note: typeof note === "string" ? note.trim() : "",
    },
  };
};
