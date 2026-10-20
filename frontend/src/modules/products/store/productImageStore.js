import { create } from "zustand";
import ProductImageService from "../api/ProductImageService.js";

export const useProductImageStore = create((set, get) => ({
  imagesByProductId: {},
  loading: false,
  error: null,

  /*
  |--------------------------------------------------------------------------
  | FETCH IMAGES
  |--------------------------------------------------------------------------
  */
  fetchImages: async (productId) => {
    try {
      set({ loading: true, error: null });

      const res =
        await ProductImageService.getProductImages(productId);

      const imageList =
        res?.body?.data ??
        res?.data?.data ??
        [];

      set((state) => ({
        imagesByProductId: {
          ...state.imagesByProductId,
          [String(productId)]: imageList,
        },
      }));

      return imageList;
    } catch (err) {
      console.error("Fetch images error:", err);

      set({
        error:
          err?.response?.data?.message ||
          err?.message ||
          "Fetch images failed",
      });

      throw err;
    } finally {
      set({ loading: false });
    }
  },

  /*
  |--------------------------------------------------------------------------
  | GET IMAGES OF PRODUCT
  |--------------------------------------------------------------------------
  */
  getImagesByProductId: (productId) =>
    get().imagesByProductId[String(productId)] || [],

  /*
  |--------------------------------------------------------------------------
  | GET MAIN IMAGE
  |--------------------------------------------------------------------------
  */
  getMainImage: (productId) => {
    const images =
      get().imagesByProductId[String(productId)] || [];

    return (
      images.find(
        (img) => img.isThumbnail || img.isMain
      ) ||
      images[0] ||
      null
    );
  },

  /*
  |--------------------------------------------------------------------------
  | UPLOAD IMAGES
  |--------------------------------------------------------------------------
  */
  uploadImages: async (productId, files) => {
    try {
      set({ loading: true, error: null });

      const res =
        await ProductImageService.addImages(productId, files);

      await get().fetchImages(productId);

      return res;
    } catch (err) {
      console.error("Upload image error:", err);

      set({
        error:
          err?.response?.data?.message ||
          err?.message ||
          "Upload images failed",
      });

      throw err;
    } finally {
      set({ loading: false });
    }
  },

  /*
  |--------------------------------------------------------------------------
  | DELETE IMAGE
  |--------------------------------------------------------------------------
  */
  deleteImage: async (imageId) => {
    try {
      const res =
        await ProductImageService.deleteImage(imageId);

      set((state) => {
        const updatedMap = {};

        Object.entries(state.imagesByProductId).forEach(
          ([productId, images]) => {
            updatedMap[productId] = images.filter(
              (img) => String(img.id) !== String(imageId)
            );
          }
        );

        return {
          imagesByProductId: updatedMap,
        };
      });

      return res;
    } catch (err) {
      console.error("Delete image error:", err);
      throw err;
    }
  },

  /*
  |--------------------------------------------------------------------------
  | SET THUMBNAIL / MAIN IMAGE
  |--------------------------------------------------------------------------
  */
  setMainImage: async (productId, imageId) => {
    try {
      const res =
        await ProductImageService.setMainImage(
          productId,
          imageId
        );

      set((state) => {
        const key = String(productId);
        const images = state.imagesByProductId[key];

        if (!Array.isArray(images)) {
          return {};
        }

        return {
          imagesByProductId: {
            ...state.imagesByProductId,
            [key]: images.map((img) => ({
              ...img,
              isMain:
                String(img.id) === String(imageId),
              isThumbnail:
                String(img.id) === String(imageId),
            })),
          },
        };
      });

      return res;
    } catch (err) {
      console.error("Set thumbnail error:", err);
      throw err;
    }
  },

  /*
  |--------------------------------------------------------------------------
  | DOWNLOAD IMAGE AS BLOB
  |--------------------------------------------------------------------------
  */
  downloadImage: async (imageUrl) => {
    if (!imageUrl) {
      throw new Error("Không có đường dẫn ảnh sản phẩm.");
    }

    try {
      const blob =
        await ProductImageService.downloadImage(imageUrl);

      if (!(blob instanceof Blob) || blob.size === 0) {
        throw new Error("Dữ liệu ảnh sản phẩm không hợp lệ.");
      }

      return blob;
    } catch (err) {
      console.error("Lỗi tải ảnh sản phẩm:", err);

      set({
        error:
          err?.response?.data?.message ||
          err?.message ||
          "Không thể tải ảnh sản phẩm.",
      });

      throw err;
    }
  },

  /*
  |--------------------------------------------------------------------------
  | CLEAR IMAGES
  |--------------------------------------------------------------------------
  */
  clearImages: () =>
    set({
      imagesByProductId: {},
      error: null,
    }),
}));