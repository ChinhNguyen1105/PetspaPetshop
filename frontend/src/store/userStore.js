import { create } from "zustand";
import UserService from "../services/UserService";

const normalizeResponse = (res) => {
  const body = res?.body;

  if (body) {
    return {
      status: body?.status || "ERROR",
      message:
        body?.message ||
        res?.message ||
        "",
      data: body?.data ?? null,
      statusCode:
        res?.statusCode ??
        res?.status ??
        null,
    };
  }

  return {
    status: res?.status || "ERROR",
    message:
      res?.message ||
      "",
    data: res?.data ?? null,
    statusCode:
      res?.statusCode ??
      null,
  };
};

const normalizeUser = (user) => {
  if (!user) {
    return null;
  }

  return {
    ...user,
    id:
      user.id !== null &&
      user.id !== undefined
        ? String(user.id)
        : null,

    name: user.name || "",
    email: user.email || "",

    dateOfBirth:
      user.dateOfBirth || null,

    gender:
      user.gender || null,

    avatarUrl:
      user.avatarUrl || null,

    roleName:
      user.roleName || null,
  };
};

const normalizeUserList = (data) => {
  return {
    result: Array.isArray(data?.result)
      ? data.result.map(normalizeUser)
      : [],

    meta: data?.meta
      ? {
          page: Number(
            data.meta.page || 1
          ),
          pageSize: Number(
            data.meta.pageSize || 10
          ),
          pages: Number(
            data.meta.pages || 0
          ),
          total: Number(
            data.meta.total || 0
          ),
        }
      : null,
  };
};

export const useUserStore = create((set, get) => ({
  // ───────────────────────── STATE ─────────────────────────
  users: [],
  meta: null,
  currentUser: null,

  loading: false,
  detailLoading: false,

  page: 1,
  pageSize: 10,

  // ───────────────────────── SETTERS ─────────────────────────
  setPage: (page) =>
    set({
      page,
    }),

  clearCurrentUser: () =>
    set({
      currentUser: null,
    }),

  // ───────────────────────── GET USERS ─────────────────────────
  fetchUsers: async (params = {}) => {
    try {
      set({
        loading: true,
      });

      const state = get();

      const res = await UserService.getUsers({
        page: state.page,
        pageSize: state.pageSize,
        ...params,
      });

      const response =
        normalizeResponse(res);

      console.log(
        "fetchUsers:",
        response
      );

      if (
        response.status ===
        "SUCCESS"
      ) {
        const listData =
          normalizeUserList(
            response.data
          );

        set({
          users: listData.result,
          meta: listData.meta,
        });
      } else {
        set({
          users: [],
          meta: null,
        });
      }

      return response;
    } catch (err) {
      console.error(
        "Lỗi khi tải danh sách user:",
        err
      );

      set({
        users: [],
        meta: null,
      });

      return {
        status: "ERROR",
        message:
          err?.response?.data?.message ||
          err?.message ||
          "Lỗi khi tải danh sách user",
        data: null,
      };
    } finally {
      set({
        loading: false,
      });
    }
  },

  // ───────────────────────── GET USER DETAIL ─────────────────────────
  fetchUserById: async (id) => {
    console.log(
      "userid:",
      id
    );

    try {
      set({
        detailLoading: true,
        currentUser: null,
      });

      const res =
        await UserService.getUserById(
          id
        );

      const response =
        normalizeResponse(res);

      if (
        response.status ===
        "SUCCESS"
      ) {
        set({
          currentUser:
            normalizeUser(
              response.data
            ),
        });
      } else {
        set({
          currentUser: null,
        });
      }

      return response;
    } catch (err) {
      console.error(
        `Lỗi khi tải user ${id}:`,
        err
      );

      return {
        status: "ERROR",
        message:
          err?.response?.data?.message ||
          err?.message ||
          `Lỗi khi tải user ${id}`,
        data: null,
      };
    } finally {
      set({
        detailLoading: false,
      });
    }
  },

  // ───────────────────────── CREATE USER ─────────────────────────
  createUser: async (userData) => {
    try {
      set({
        loading: true,
      });

      const res =
        await UserService.createUser(
          userData
        );

      const response =
        normalizeResponse(res);

      if (
        response.status ===
        "SUCCESS"
      ) {
        const newUser =
          normalizeUser(
            response.data
          );

        set((state) => ({
          users: [
            newUser,
            ...state.users,
          ],
        }));
      }

      return response;
    } catch (err) {
      console.error(
        "Lỗi khi tạo user:",
        err
      );

      return {
        status: "ERROR",
        message:
          err?.response?.data?.message ||
          err?.message ||
          "Lỗi tạo user",
        data: null,
      };
    } finally {
      set({
        loading: false,
      });
    }
  },

  // ───────────────────────── UPDATE USER ─────────────────────────
  updateUser: async (userData) => {
    console.log(
      "payload from store:",
      userData
    );

    try {
      set({
        loading: true,
      });

      const res =
        await UserService.updateUser(
          userData
        );

      const response =
        normalizeResponse(res);

      if (
        response.status ===
        "SUCCESS"
      ) {
        const updatedUser =
          normalizeUser(
            response.data
          );

        set((state) => ({
          users: state.users.map(
            (user) =>
              user.id ===
              String(userData.id)
                ? {
                    ...user,
                    ...updatedUser,
                  }
                : user
          ),

          currentUser:
            state.currentUser?.id ===
            String(userData.id)
              ? {
                  ...state.currentUser,
                  ...updatedUser,
                }
              : state.currentUser,
        }));
      }

      return response;
    } catch (err) {
      console.error(
        `Lỗi update user ${userData.id}:`,
        err
      );

      return {
        status: "ERROR",
        message:
          err?.response?.data?.message ||
          err?.message ||
          "Lỗi update user",
        data: null,
      };
    } finally {
      set({
        loading: false,
      });
    }
  },

  // ───────────────────────── CHANGE STATUS ─────────────────────────
  updateUserStatus: async (id) => {
    try {
      set({
        loading: true,
      });

      const res =
        await UserService.updateUserStatus(
          id
        );

      const response =
        normalizeResponse(res);

      if (
        response.status ===
        "SUCCESS"
      ) {
        await get().fetchUsers();
      }

      return response;
    } catch (err) {
      console.error(
        `Lỗi đổi trạng thái user ${id}:`,
        err
      );

      return {
        status: "ERROR",
        message:
          err?.response?.data?.message ||
          err?.message ||
          "Lỗi đổi trạng thái user",
        data: null,
      };
    } finally {
      set({
        loading: false,
      });
    }
  },

  // ───────────────────────── DELETE USER ─────────────────────────
  deleteUser: async (id) => {
    try {
      set({
        loading: true,
      });

      const res =
        await UserService.deleteUser(
          id
        );

      const response =
        normalizeResponse(res);

      if (
        response.status ===
        "SUCCESS"
      ) {
        set((state) => ({
          users:
            state.users.filter(
              (user) =>
                user.id !== String(id)
            ),

          currentUser:
            state.currentUser?.id ===
            String(id)
              ? null
              : state.currentUser,
        }));
      }

      return response;
    } catch (err) {
      console.error(
        `Lỗi xóa user ${id}:`,
        err
      );

      return {
        status: "ERROR",
        message:
          err?.response?.data?.message ||
          err?.message ||
          "Lỗi xóa user",
        data: null,
      };
    } finally {
      set({
        loading: false,
      });
    }
  },

  // ───────────────────────── AVATAR ─────────────────────────
  uploadAvatar: async (
    userId,
    file
  ) => {
    try {
      set({
        loading: true,
      });

      const res =
        await UserService.uploadAvatar(
          userId,
          file
        );

      return normalizeResponse(res);
    } catch (err) {
      console.error(
        "Lỗi upload avatar:",
        err
      );

      return {
        status: "ERROR",
        message:
          err?.response?.data?.message ||
          err?.message ||
          "Lỗi upload avatar",
        data: null,
      };
    } finally {
      set({
        loading: false,
      });
    }
  },

  // ───────────────────────── PROFILE ─────────────────────────
  fetchProfile: async () => {
    try {
      set({
        detailLoading: true,
      });

      const res =
        await UserService.getProfile();

      const response =
        normalizeResponse(res);

      if (
        response.status ===
        "SUCCESS"
      ) {
        const user =
          normalizeUser(
            response.data
          );

        set({
          currentUser: user,
        });
      } else {
        set({
          currentUser: null,
        });
      }

      return response;
    } catch (err) {
      console.error(
        "Lỗi lấy profile:",
        err
      );

      return {
        status: "ERROR",
        message:
          err?.response?.data?.message ||
          err?.message ||
          "Lỗi lấy profile",
        data: null,
      };
    } finally {
      set({
        detailLoading: false,
      });
    }
  },

  updateProfile: async (
    profileData
  ) => {
    try {
      set({
        loading: true,
      });

      const res =
        await UserService.updateProfile(
          profileData
        );

      const response =
        normalizeResponse(res);

      if (
        response.status ===
        "SUCCESS"
      ) {
        const user =
          normalizeUser(
            response.data
          );

        set({
          currentUser: user,
        });
      }

      return response;
    } catch (err) {
      console.error(
        "Lỗi cập nhật profile:",
        err
      );

      return {
        status: "ERROR",
        message:
          err?.response?.data?.message ||
          err?.message ||
          "Lỗi cập nhật profile",
        data: null,
      };
    } finally {
      set({
        loading: false,
      });
    }
  },
}));
