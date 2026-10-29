import api from "../../../infrastructure/api/api.js";
import { URL_CONSTANT } from "../../../app/config/urlConstant.js";

// Chuẩn hóa response để hỗ trợ cả response.data.data
// và response.data.body.data từ backend.
const getResponsePayload = (response) => {
  const responseData = response?.data;
  return responseData?.body ?? responseData;
};

// Lấy danh sách người dùng.
const getUsers = async (params = {}) => {
  const queryParams = { ...params };

  if (Array.isArray(queryParams.filter)) {
    queryParams.filter = queryParams.filter
      .map((item) => String(item).trim())
      .filter(Boolean)
      .join(",");
  }

  const response = await api.get(URL_CONSTANT.User.GET_USERS, {
    params: queryParams,
  });

  // API thực tế: response.data.body.data
  const responseData = response?.data;
  const payload = responseData?.body ?? responseData;
  const data = payload?.data;

  if (Array.isArray(data?.result)) {
    return {
      ...payload,
      data: {
        ...data,
        meta: {
          page: Number(data.meta?.page) || 1,
          pageSize: Number(data.meta?.pageSize) || 10,
          pages: Number(data.meta?.pages) || 1,
          total: Number(data.meta?.total) || 0,
        },
        result: data.result.map((user) => ({
          ...user,
          id: user?.id ?? "",
          name: user?.name ?? "",
          email: user?.email ?? "",
          phone: user?.phone ?? "",
          avatarUrl: user?.avatarUrl ?? "",
          roleName: user?.roleName ?? user?.role?.name ?? null,
        })),
      },
    };
  }

  return {
    ...payload,
    data: {
      meta: {
        page: 1,
        pageSize: 10,
        pages: 1,
        total: 0,
      },
      result: [],
    },
  };
};


// Lấy thông tin một người dùng.
const getUserById = async (id) => {
  const url = URL_CONSTANT.User.GET_USER.replace("{id}", id);
  const response = await api.get(url);
  const payload = getResponsePayload(response);
  const data = payload?.data;

  return {
    ...payload,
    data: data
      ? {
          ...data,
          avatarUrl: data.avatarUrl || "",
        }
      : data,
  };
};

// Tạo người dùng.
const createUser = async (userData) => {
  const payload = {
    email: userData.email,
    password: userData.password,
    name: userData.name,
    dateOfBirth: userData.dateOfBirth?.split("T")[0],
    gender: userData.gender,
    role: {
      id: Number(userData.role?.id || userData.role),
    },
  };
 console.log("[CREATE USER] Payload gửi backend:", payload);

  const response = await api.post(
    URL_CONSTANT.User.CREATE_USER,
    payload
  );

  return getResponsePayload(response);
};

// Cập nhật người dùng.
const updateUser = async (userData) => {
  const payload = {
    id: userData.id,
    password: userData.password,
    name: userData.name,
    dateOfBirth: userData.dateOfBirth?.split("T")[0],
    gender: userData.gender,
    role: {
      id: Number(userData.role?.id || userData.role),
    },
  };

  const response = await api.put(
    URL_CONSTANT.User.UPDATE_USER,
    payload
  );

  return getResponsePayload(response);
};

// Cập nhật trạng thái người dùng.
const updateUserStatus = async (id) => {
  const url = URL_CONSTANT.User.CHANGE_USER_STATUS.replace("{id}", id);
  const response = await api.patch(url);

  return getResponsePayload(response);
};

// Xóa người dùng.
const deleteUser = async (id) => {
  const url = URL_CONSTANT.User.DELETE_USER.replace("{id}", id);
  const response = await api.delete(url);

  return getResponsePayload(response);
};

// Upload ảnh đại diện.
// Giữ nguyên endpoint upload đang hoạt động.
const uploadAvatar = async (userId, file) => {
  const formData = new FormData();
  formData.append("file", file);

  const url = `/users/${userId}/avatar`;

  const response = await api.post(url, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return getResponsePayload(response);
};

// Tải ảnh đại diện có xác thực JWT.
const downloadAvatar = async (fileName) => {
  if (!fileName) {
    throw new Error("Không có tên file ảnh đại diện.");
  }

  const token = localStorage.getItem("petspa_token");

  const headers = {};

  // Chỉ gửi JWT khi đã đăng nhập.
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await api.get("/files/download", {
    params: {
      fileName,
      folder: "avatars",
      inline: true,
    },
    responseType: "blob",
    headers,
  });

  return response.data;
};

// Lấy hồ sơ người dùng hiện tại.
const getProfile = async () => {
  const response = await api.get(URL_CONSTANT.User.GET_PROFILE);
  const payload = getResponsePayload(response);
  const data = payload?.data;

  return {
    ...payload,
    data: data
      ? {
          ...data,
          avatarUrl: data.avatarUrl || "",
        }
      : data,
  };
};

// Cập nhật hồ sơ người dùng.
const updateProfile = async (profileData) => {
  const response = await api.put(
    URL_CONSTANT.User.UPDATE_PROFILE,
    profileData
  );

  return getResponsePayload(response);
};

const UserService = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserStatus,
  deleteUser,

  uploadAvatar,
  downloadAvatar,
  
  getProfile,
  updateProfile,
};

export default UserService;
