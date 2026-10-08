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
| GET ALL PETS (ADMIN)
|--------------------------------------------------------------------------
*/
const getPets = async (params = {}, options = {}) => {
  if (shouldUseApi(options)) {
    const resp = await api.get(URL_CONSTANT.Pet.GET_ALL_PETS, {
      params,
    });

    return resp.data.body.data;
  }

  return {
    result: [],
    meta: {
      page: 1,
      pageSize: 10,
      pages: 0,
      total: 0,
    },
  };
};

/*
|--------------------------------------------------------------------------
| GET PET BY ID
|--------------------------------------------------------------------------
*/
const getPetById = async (petId, options = {}) => {
  if (shouldUseApi(options)) {
    const resp = await api.get(
      URL_CONSTANT.Pet.GET_PET_DETAIL.replace("{id}", petId)
    );

    return resp.data.body.data;
  }

  return null;
};

/*
|--------------------------------------------------------------------------
| GET MY PETS
|--------------------------------------------------------------------------
*/
const getMyPets = async (options = {}) => {
  if (shouldUseApi(options)) {
    const resp = await api.get(URL_CONSTANT.Pet.GET_MY_PETS);

    return resp.data.body.data;
  }

  return [];
};

/*
|--------------------------------------------------------------------------
| GET PETS BY USER
|--------------------------------------------------------------------------
*/
const getPetsByUser = async (userId, options = {}) => {
  if (shouldUseApi(options)) {
    const resp = await api.get(URL_CONSTANT.Pet.GET_ALL_PETS, {
      params: { userId },
    });

    return resp.data.body.data;
  }

  return {
    result: [],
    meta: {
      page: 1,
      pageSize: 10,
      pages: 0,
      total: 0,
    },
  };
};

/*
|--------------------------------------------------------------------------
| CREATE PET
|--------------------------------------------------------------------------
*/
const createPet = async (petData, options = {}) => {
  if (shouldUseApi(options)) {
    const resp = await api.post(
      URL_CONSTANT.Pet.CREATE_PET,
      petData
    );

    return resp.data.body.data;
  }

  return {
    ...petData,
    id: Date.now(),
  };
};

/*
|--------------------------------------------------------------------------
| UPDATE PET
|--------------------------------------------------------------------------
*/
const updatePet = async (petId, petData, options = {}) => {
  console.log("payload send", petId, petData);

  if (shouldUseApi(options)) {
    const resp = await api.put(
      URL_CONSTANT.Pet.UPDATE_PET,
      {
        id: petId,
        ...petData,
      }
    );

    return resp.data.body.data;
  }

  return {
    id: petId,
    ...petData,
  };
};

/*
|--------------------------------------------------------------------------
| DELETE PET
|--------------------------------------------------------------------------
*/
const deletePet = async (petId, options = {}) => {
  if (shouldUseApi(options)) {
    const resp = await api.delete(
      URL_CONSTANT.Pet.DELETE_PET.replace("{id}", petId)
    );

    return resp.data.body.data;
  }

  return {
    message: "Deleted",
  };
};

export default {
  setApi,
  getPets,
  getPetById,
  getMyPets,
  createPet,
  updatePet,
  deletePet,
  getPetsByUser,
};