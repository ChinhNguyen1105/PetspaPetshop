import { create } from "zustand";
import UserService from "../services/UserService";

const normalizeResponse = (res) => {
  const root =
    res?.status !== undefined
      ? res
      : res?.body ??
        res?.data?.body ??
        res?.data ??
        res;

  const statusCode =
    root?.statusCode ??
    res?.statusCode ??
    res?.status ??
    null;

  const status = String(
    root?.status ??
      (typeof statusCode === "number" &&
      statusCode >= 200 &&
      statusCode < 300
        ? "SUCCESS"
        : "ERROR")
  ).toUpperCase();

  return {
    status,
    message: root?.message ?? "",
    data: root?.data ?? null,
    statusCode,
  };
};

const normalizeUser = (user) => {
  if (!user || typeof user !== "object") {
    return null;
  }

  return {
    ...user,
    id:
      user.id !== undefined && user.id !== null
        ? String(user.id)
        : null,
    name: user.name ?? "",
    email: user.email ?? "",
    dateOfBirth: user.dateOfBirth ?? null,
    gender: user.gender ?? null,
    avatarUrl: user.avatarUrl ?? user.avatar ?? null,
    roleName: user.roleName ?? user.role?.name ?? null,
  };
};

// Không ghi đè trường hiện tại bằng undefined hoặc null.
const mergeUser = (existingUser, incomingUser) => {
  if (!incomingUser || typeof incomingUser !== "object") {
    return existingUser;
  }

  const validFields = Object.fromEntries(
    Object.entries(incomingUser).filter(
      ([, value]) => value !== undefined && value !== null
    )
  );

  return normalizeUser({
    ...(existingUser ?? {}),
    ...validFields,
  });
};

const normalizeUserList = (data) => {
  const rows = Array.isArray(data)
    ? data
    : Array.isArray(data?.result)
      ? data.result
      : [];

  return {
    result: rows.map(normalizeUser).filter(Boolean),
    meta: data?.meta
      ? {
          page: Number(data.meta.page ?? 1),
          pageSize: Number(data.meta.pageSize ?? 10),
          pages: Number(data.meta.pages ?? 0),
          total: Number(data.meta.total ?? 0),
        }
      : null,
  };
};

const getErrorMessage = (err, fallback) => {
  const message =
    err?.response?.data?.message ??
    err?.response?.data?.body?.message;

  return (
    (Array.isArray(message) ? message.join(", ") : message) ??
    err?.message ??
    fallback
  );
};

const errorResult = (err, fallback) => ({
  status: "ERROR",
  message: getErrorMessage(err, fallback),
  data: null,
});

const isSuccess = (response) => response.status === "SUCCESS";

const getUpdatedUser = (responseData, fallback) => {
  const rawUser =
    responseData?.user ??
    responseData?.result ??
    responseData;

  return {
    ...fallback,
    ...(rawUser && typeof rawUser === "object" ? rawUser : {}),
  };
};

export const useUserStore = create((set, get) => ({
  // STATE
  users: [],
  meta: null,
  currentUser: null,

  loading: false,
  detailLoading: false,

  page: 1,
  pageSize: 10,

  // SETTERS
  setPage: (page) => {
    if (Number.isInteger(page) && page > 0) {
      set({ page });
    }
  },

  setPageSize: (pageSize) => {
    if (Number.isInteger(pageSize) && pageSize > 0) {
      set({ pageSize, page: 1 });
    }
  },

  clearCurrentUser: () => set({ currentUser: null }),

  // GET USERS
fetchUsers: async (params = {}) => {
  set({ loading: true });

  try {
    const page = params.page ?? get().page;
    const pageSize = params.pageSize ?? get().pageSize;

    const response = await UserService.getUsers({
      ...params,
      page,
      pageSize,
    });

    const normalized = normalizeResponse(response);

    if (normalized.status !== "SUCCESS") {
      throw new Error(
        normalized.message || "Không thể tải danh sách người dùng",
      );
    }

    // normalizeUserList trả về { result, meta }, không phải { data, meta }.
    const { result: users, meta } = normalizeUserList(normalized.data);

    const normalizedUsers = Array.isArray(users) ? users : [];

    const normalizedMeta = {
      page: Number(meta?.page) || page,
      pageSize: Number(meta?.pageSize) || pageSize,
      pages: Number(meta?.pages) || 1,
      total: Number(meta?.total) || 0,
    };

    set({
      users: normalizedUsers,
      meta: normalizedMeta,
      page,
      pageSize,
      loading: false,
    });

    return {
      ...normalized,
      data: {
        result: normalizedUsers,
        meta: normalizedMeta,
      },
    };
  } catch (error) {
    console.error("Lỗi tải danh sách người dùng:", error);

    set({
      users: [],
      loading: false,
    });

    return {
      status: "ERROR",
      message:
        error?.response?.data?.body?.message ??
        error?.response?.data?.message ??
        error?.message ??
        "Không thể tải danh sách người dùng",
      data: null,
    };
  }
},


  // GET USER DETAIL
  fetchUserById: async (id) => {
    if (id === undefined || id === null || id === "") {
      return {
        status: "ERROR",
        message: "Thiếu ID người dùng.",
        data: null,
      };
    }

    const userId = String(id);
    set({ detailLoading: true });

    try {
      const response = normalizeResponse(
        await UserService.getUserById(userId)
      );

      if (!isSuccess(response) || !response.data) {
        return response;
      }

      const incomingUser = normalizeUser(response.data);

      if (!incomingUser) {
        return {
          ...response,
          status: "ERROR",
          message: "Dữ liệu người dùng không hợp lệ.",
          data: null,
        };
      }

      set((state) => {
        const existingUser =
          state.users.find((user) => user.id === userId) ??
          (state.currentUser?.id === userId
            ? state.currentUser
            : null);

        const updatedUser = mergeUser(existingUser, incomingUser);

        return {
          users: state.users.map((user) =>
            user.id === userId
              ? mergeUser(user, incomingUser)
              : user
          ),
          currentUser: updatedUser,
        };
      });

      return {
        ...response,
        data: get().currentUser,
      };
    } catch (err) {
      console.error(`Lỗi khi tải user ${userId}:`, err);
      return errorResult(err, `Lỗi khi tải user ${userId}`);
    } finally {
      set({ detailLoading: false });
    }
  },

  // CREATE USER
  createUser: async (userData) => {
    set({ loading: true });

    try {
      const response = normalizeResponse(
        await UserService.createUser(userData)
      );

      if (!isSuccess(response)) {
        return response;
      }

      const rawUser =
        response.data?.user ??
        response.data?.result ??
        response.data;

      const newUser = normalizeUser(rawUser);

      if (newUser) {
        set((state) => ({
          users: [
            newUser,
            ...state.users.filter((user) => user.id !== newUser.id),
          ],
        }));
      } else {
        await get().fetchUsers();
      }

      return response;
    } catch (err) {
      console.error("Lỗi khi tạo user:", err);
      return errorResult(err, "Lỗi tạo user");
    } finally {
      set({ loading: false });
    }
  },

  // UPDATE USER
  updateUser: async (userData) => {
    if (
      userData?.id === undefined ||
      userData?.id === null ||
      userData?.id === ""
    ) {
      return {
        status: "ERROR",
        message: "Thiếu ID người dùng cần cập nhật.",
        data: null,
      };
    }

    const id = String(userData.id);
    set({ loading: true });

    try {
      const response = normalizeResponse(
        await UserService.updateUser(userData)
      );

      if (!isSuccess(response)) {
        return response;
      }

      const state = get();
      const existingUser =
        state.users.find((user) => user.id === id) ??
        (state.currentUser?.id === id ? state.currentUser : null);

      const fallback = {
        ...(existingUser ?? {}),
        ...userData,
        id,
      };

      const updatedData = getUpdatedUser(response.data, fallback);

      set((currentState) => ({
        users: currentState.users.map((user) =>
          user.id === id
            ? mergeUser(user, updatedData)
            : user
        ),
        currentUser:
          currentState.currentUser?.id === id
            ? mergeUser(currentState.currentUser, updatedData)
            : currentState.currentUser,
      }));

      return {
        ...response,
        data: mergeUser(existingUser, updatedData),
      };
    } catch (err) {
      console.error(`Lỗi cập nhật user ${id}:`, err);
      return errorResult(err, "Lỗi cập nhật user");
    } finally {
      set({ loading: false });
    }
  },

  // CHANGE STATUS
  updateUserStatus: async (id) => {
    if (id === undefined || id === null || id === "") {
      return {
        status: "ERROR",
        message: "Thiếu ID người dùng.",
        data: null,
      };
    }

    set({ loading: true });

    try {
      const response = normalizeResponse(
        await UserService.updateUserStatus(id)
      );

      if (isSuccess(response)) {
        await get().fetchUsers({
          page: get().page,
          pageSize: get().pageSize,
        });
      }

      return response;
    } catch (err) {
      console.error(`Lỗi đổi trạng thái user ${id}:`, err);
      return errorResult(err, "Lỗi đổi trạng thái user");
    } finally {
      set({ loading: false });
    }
  },

  // DELETE USER
  deleteUser: async (id) => {
    if (id === undefined || id === null || id === "") {
      return {
        status: "ERROR",
        message: "Thiếu ID người dùng.",
        data: null,
      };
    }

    const userId = String(id);
    set({ loading: true });

    try {
      const response = normalizeResponse(
        await UserService.deleteUser(userId)
      );

      if (isSuccess(response)) {
        set((state) => ({
          users: state.users.filter((user) => user.id !== userId),
          currentUser:
            state.currentUser?.id === userId
              ? null
              : state.currentUser,
          meta: state.meta
            ? {
                ...state.meta,
                total: Math.max(0, state.meta.total - 1),
              }
            : null,
        }));
      }

      return response;
    } catch (err) {
      console.error(`Lỗi xóa user ${userId}:`, err);
      return errorResult(err, "Lỗi xóa user");
    } finally {
      set({ loading: false });
    }
  },
// DOWNLOAD AVATAR
downloadAvatar: async (fileName) => {
  if (!fileName) {
    return {
      status: "ERROR",
      message: "Không có tên file ảnh đại diện.",
      data: null,
    };
  }

  try {
    const blob = await UserService.downloadAvatar(fileName);

    if (!(blob instanceof Blob) || blob.size === 0) {
      throw new Error("Dữ liệu ảnh đại diện không hợp lệ hoặc rỗng.");
    }

    return blob;
  } catch (err) {
    console.error("Lỗi tải avatar:", err);

    return {
      status: "ERROR",
      message: getErrorMessage(err, "Lỗi tải ảnh đại diện."),
      data: null,
    };
  }
},
  // UPLOAD AVATAR
  uploadAvatar: async (userId, file) => {
    if (userId === undefined || userId === null || userId === "") {
      return {
        status: "ERROR",
        message: "Thiếu ID người dùng.",
        data: null,
      };
    }

    if (!file) {
      return {
        status: "ERROR",
        message: "Vui lòng chọn file ảnh.",
        data: null,
      };
    }

    const id = String(userId);
    set({ loading: true });

    try {
      const response = normalizeResponse(
        await UserService.uploadAvatar(id, file)
      );

      if (!isSuccess(response)) {
        return response;
      }

      const rawUser =
        response.data?.user ??
        response.data?.result ??
        response.data;

      const avatar =
        rawUser && typeof rawUser === "object"
          ? rawUser.avatarUrl ?? rawUser.avatar ?? null
          : null;

      if (avatar) {
        set((state) => ({
          users: state.users.map((user) =>
            user.id === id ? { ...user, avatarUrl: avatar } : user
          ),
          currentUser:
            state.currentUser?.id === id
              ? { ...state.currentUser, avatarUrl: avatar }
              : state.currentUser,
        }));
      }

      // Đồng bộ tên file avatar thực tế từ backend.
      const detailResponse = await get().fetchUserById(id);

      if (isSuccess(detailResponse) && detailResponse.data) {
        return {
          ...response,
          data: detailResponse.data,
        };
      }

      // Upload thành công không đồng nghĩa tải lại chi tiết thành công.
      return response;
    } catch (err) {
      console.error("Lỗi upload avatar:", err);
      return errorResult(err, "Lỗi upload avatar");
    } finally {
      set({ loading: false });
    }
  },

  // GET PROFILE
  fetchProfile: async () => {
    set({ detailLoading: true });

    try {
      const response = normalizeResponse(
        await UserService.getProfile()
      );

      if (!isSuccess(response) || !response.data) {
        return response;
      }

      set((state) => ({
        currentUser: mergeUser(state.currentUser, response.data),
      }));

      return {
        ...response,
        data: get().currentUser,
      };
    } catch (err) {
      console.error("Lỗi lấy profile:", err);
      return errorResult(err, "Lỗi lấy profile");
    } finally {
      set({ detailLoading: false });
    }
  },

  // UPDATE PROFILE
  updateProfile: async (profileData) => {
    set({ loading: true });

    try {
      const response = normalizeResponse(
        await UserService.updateProfile(profileData)
      );

      if (!isSuccess(response)) {
        return response;
      }

      const incomingData =
        response.data && typeof response.data === "object"
          ? response.data
          : profileData;

      set((state) => ({
        currentUser: mergeUser(state.currentUser, {
          ...incomingData,
          id: incomingData.id ?? state.currentUser?.id,
        }),
      }));

      return {
        ...response,
        data: get().currentUser,
      };
    } catch (err) {
      console.error("Lỗi cập nhật profile:", err);
      return errorResult(err, "Lỗi cập nhật profile");
    } finally {
      set({ loading: false });
    }
  },
}));
