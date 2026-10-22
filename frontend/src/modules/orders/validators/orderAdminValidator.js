const ORDER_STATUSES = Object.freeze([
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
]);

const ORDER_STATUS_TRANSITIONS = Object.freeze({
  PENDING: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
});

const isValidOrderStatus = (status) => {
  return ORDER_STATUSES.includes(status);
};

const validateOrderStatusTransition = (currentStatus, nextStatus) => {
  if (!isValidOrderStatus(currentStatus)) {
    return {
      isValid: false,
      message: "Trạng thái đơn hàng hiện tại không hợp lệ.",
    };
  }

  if (!isValidOrderStatus(nextStatus)) {
    return {
      isValid: false,
      message: "Trạng thái đơn hàng mới không hợp lệ.",
    };
  }

  if (currentStatus === nextStatus) {
    return {
      isValid: true,
      message: "",
    };
  }

  const allowedTransitions = ORDER_STATUS_TRANSITIONS[currentStatus];

  if (!allowedTransitions.includes(nextStatus)) {
    return {
      isValid: false,
      message: `Không thể chuyển trạng thái đơn hàng từ ${currentStatus} sang ${nextStatus}.`,
    };
  }

  return {
    isValid: true,
    message: "",
  };
};

const validateOrderAdminData = (formData, { mode, currentOrder } = {}) => {
  if (!formData || typeof formData !== "object") {
    return {
      isValid: false,
      message: "Dữ liệu đơn hàng không hợp lệ.",
    };
  }

  if (!isValidOrderStatus(formData.status)) {
    return {
      isValid: false,
      field: "status",
      message: "Vui lòng chọn trạng thái đơn hàng hợp lệ.",
    };
  }

  if (mode === "EDIT") {
    if (!currentOrder || currentOrder.id == null) {
      return {
        isValid: false,
        message: "Không tìm thấy đơn hàng cần cập nhật.",
      };
    }

    const transitionResult = validateOrderStatusTransition(
      currentOrder.status,
      formData.status,
    );

    if (!transitionResult.isValid) {
      return {
        ...transitionResult,
        field: "status",
      };
    }
  }

  return {
    isValid: true,
    message: "",
  };
};

export {
  ORDER_STATUSES,
  ORDER_STATUS_TRANSITIONS,
  isValidOrderStatus,
  validateOrderStatusTransition,
  validateOrderAdminData,
};
