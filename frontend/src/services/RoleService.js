import api from "./api";
import { APP_CONFIG } from "./config";
import { URL_CONSTANT } from "../constants/urlConstant";

const delay = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

let useApi = APP_CONFIG.USE_REAL_API;

const setApi = (flag) => {
  useApi = !!flag;
};

const shouldUseApi = (options = {}) =>
  options.api !== undefined ? !!options.api : useApi;

/*
|--------------------------------------------------------------------------
| MAPPER
|--------------------------------------------------------------------------
*/
const mapRoleRequest = (request) => ({
  id:
    request.id !== undefined && request.id !== null
      ? Number(request.id)
      : undefined,

  name: request.name,

  description: request.description ?? null,

  activeFlag:
    typeof request.activeFlag === "boolean"
      ? request.activeFlag
      : request.activeFlag === "true"
        ? true
        : request.activeFlag === "false"
          ? false
          : undefined,

  permissions: Array.isArray(request.permissions)
    ? request.permissions.map((permission) => ({
        id: Number(
          permission?.id ?? permission
        ),
      }))
    : [],
});

/*
|--------------------------------------------------------------------------
| CREATE
|--------------------------------------------------------------------------
*/
const createRole = async (request, options = {}) => {
  const payload = mapRoleRequest(request);

  delete payload.id;

  if (shouldUseApi(options)) {
    const resp = await api.post(
      URL_CONSTANT.Role.CREATE_ROLE,
      payload
    );

    return resp.data?.body?.data ?? null;
  }

  await delay(500);

  return {
    id: Date.now(),
    ...payload,
  };
};

/*
|--------------------------------------------------------------------------
| UPDATE
|--------------------------------------------------------------------------
*/
const updateRole = async (request, options = {}) => {
  const payload = mapRoleRequest(request);

  if (payload.id === undefined || !Number.isInteger(payload.id) || payload.id <= 0) {
    throw new Error("ID Role phải là số nguyên dương.");
  }

  if (typeof payload.activeFlag !== "boolean") {
    throw new Error(
      "Role phải có activeFlag kiểu boolean trước khi cập nhật."
    );
  }

  if (payload.permissions.some(
    (permission) =>
      !Number.isInteger(permission.id) || permission.id <= 0
  )) {
    throw new Error(
      "ID của từng permission phải là số nguyên dương."
    );
  }

  if (shouldUseApi(options)) {
    const resp = await api.put(
      URL_CONSTANT.Role.UPDATE_ROLE,
      payload
    );

    return resp.data?.body?.data ?? null;
  }

  await delay(500);

  return payload;
};

/*
|--------------------------------------------------------------------------
| GET ALL
|--------------------------------------------------------------------------
*/
const getRoles = async (params = {}, options = {}) => {
  if (shouldUseApi(options)) {
    const resp = await api.get(
      URL_CONSTANT.Role.GET_ALL_ROLES,
      { params }
    );

    const response = resp.data;

    return {
      meta: response?.body?.data?.meta ?? {
        page: 1,
        pageSize: 10,
        pages: 0,
        total: 0,
      },

      result: Array.isArray(response?.body?.data?.result)
        ? response.body.data.result
        : [],
    };
  }

  await delay(500);

  return {
    meta: {
      page: 1,
      pageSize: 10,
      pages: 1,
      total: 0,
    },
    result: [],
  };
};

/*
|--------------------------------------------------------------------------
| DETAIL
|--------------------------------------------------------------------------
*/
const getRoleById = async (id, options = {}) => {
  if (shouldUseApi(options)) {
    const resp = await api.get(
      URL_CONSTANT.Role.GET_ROLE_BY_ID.replace(
        "{id}",
        String(id)
      )
    );

    return resp.data?.body?.data ?? null;
  }

  await delay(500);

  return {
    id: Number(id),
    name: "",
    description: "",
    activeFlag: true,
    permissions: [],
  };
};

/*
|--------------------------------------------------------------------------
| DELETE
|--------------------------------------------------------------------------
*/
const deleteRole = async (id, options = {}) => {
  if (shouldUseApi(options)) {
    const resp = await api.delete(
      URL_CONSTANT.Role.DELETE_ROLE.replace(
        "{id}",
        String(id)
      )
    );

    return resp.data?.body?.data ?? null;
  }

  await delay(500);

  return {
    status: true,
    message: "Delete role successfully",
  };
};

const RoleService = {
  setApi,
  createRole,
  updateRole,
  getRoles,
  getRoleById,
  deleteRole,
};

export default RoleService;
