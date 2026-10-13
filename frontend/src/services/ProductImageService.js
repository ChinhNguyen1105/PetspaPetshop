import api from "./api";
import { URL_CONSTANT } from "../constants/urlConstant";
/*
|--------------------------------------------------------------------------
| GET PRODUCT IMAGES
|--------------------------------------------------------------------------
*/
const getProductImages = async (productId) => {
  const resp = await api.get(
    URL_CONSTANT.ProductImages.GET_IMAGES.replace(
      "{productId}",
      productId
    )
  );

  // Giữ imageUrl là tên file để sử dụng với API download.
  const imageList = resp.data?.body?.data
    ?? resp.data?.data
    ?? [];

  return {
    ...resp.data,
    body: {
      ...resp.data?.body,
      data: imageList,
    },
  };
};

/*
|--------------------------------------------------------------------------
| DOWNLOAD PRODUCT IMAGE
|--------------------------------------------------------------------------
*/
const downloadImage = async (imageUrl) => {
  console.log("ĐANG GỌI DOWNLOAD:", imageUrl);

  const fileName = imageUrl.split("/").pop().split("?")[0];

  const response = await api.get("/files/download", {
    params: {
      fileName,
      folder: "products",
      inline: true,
    },
    responseType: "blob",
  });

  return response.data;
};

/*
|--------------------------------------------------------------------------
| ADD IMAGES
|--------------------------------------------------------------------------
*/
const addImages = async (productId, files) => {
  console.log("productId:", productId);
  console.log("files:", files);
  console.log("isArray:", Array.isArray(files));

  if (!Array.isArray(files) || files.length === 0) {
    throw new Error("Danh sách ảnh không hợp lệ");
  }

  const formData = new FormData();

  files.forEach((file) => {
    console.log("Appending file:", file.name, file.size);
    formData.append("files", file);
  });

  // Kiểm tra nội dung FormData
  for (const [key, value] of formData.entries()) {
    console.log("FormData:", key, value);
  }

  const resp = await api.post(
    URL_CONSTANT.ProductImages.ADD_IMAGES,
    formData,
    {
      params: { productId: Number(productId) },
    }
  );

  return resp.data;
};

/*
|--------------------------------------------------------------------------
| DELETE IMAGE
|--------------------------------------------------------------------------
*/
const deleteImage = async (
  imageId
) => {
  const resp = await api.delete(
    URL_CONSTANT.ProductImages.DELETE_IMAGE.replace(
      "{id}",
      imageId
    )
  );

  return resp.data;
};

/*
|--------------------------------------------------------------------------
| SET THUMBNAIL IMAGE
|--------------------------------------------------------------------------
*/
const setMainImage = async (
  productId,
  imageId
) => {
  const payload = {
    productId,
    imageId,
  };

  const resp = await api.put(
    URL_CONSTANT.ProductImages.SET_MAIN_IMAGE,
    payload
  );

  return resp.data;
};

export default {
  getProductImages,
  addImages,
  deleteImage,
  setMainImage,
  downloadImage
};