import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertCircle,
  Package,
  Layers,
  ChevronRight,
  Hash,
} from "lucide-react";

import Loading from "../../../../shared/components/Loading.jsx";
import { formatPrice } from "../../../../shared/utils/formatPrice.js";
import ProductFormAdmin from "../../components/admin/ProductFormAdmin.jsx";
import Modal from "../../../../shared/components/Modal.jsx";
import ConfirmModal from "../../../../shared/components/ConfirmModal.jsx";
import Pagination from "../../../../shared/components/Pagination.jsx";

import { useCartStore } from "../../../cart/store/cartStore.js";
import { useProductStore } from "../../store/productStore.js";
import { useCategoryStore } from "../../../categories/store/categoryStore.js";
import { useProductImageStore } from "../../store/productImageStore.js";

import ProductImage from "./ProductImage.jsx";

const ProductManagement = () => {
  // =========================================================
  // PRODUCT STORE
  // =========================================================
  const products = useProductStore((state) => state.products) || [];
  const meta = useProductStore((state) => state.meta);
  const loadingProducts = useProductStore((state) => state.loading);
  const errorProducts = useProductStore((state) => state.error);

  const fetchProducts = useProductStore((state) => state.fetchProducts);
  const deleteProduct = useProductStore((state) => state.deleteProduct);
  const createProduct = useProductStore((state) => state.createProduct);
  const updateProduct = useProductStore((state) => state.updateProduct);

  // =========================================================
  // CATEGORY STORE
  // =========================================================
  const storeCategories = useCategoryStore((state) => state.categories) || [];

  const fetchCategories = useCategoryStore((state) => state.fetchCategories);

  const loadingCategories = useCategoryStore((state) => state.loading);

  // =========================================================
  // PRODUCT IMAGE STORE
  // =========================================================
  const imagesByProductId = useProductImageStore(
    (state) => state.imagesByProductId,
  );

  const fetchImages = useProductImageStore((state) => state.fetchImages);

  // =========================================================
  // GLOBAL TOAST
  // =========================================================
  const showToast = useCartStore((state) => state.showToast);

  // =========================================================
  // LOCAL STATE
  // =========================================================
  const [searchId, setSearchId] = useState("");
  const [searchName, setSearchName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const [debouncedFilters, setDebouncedFilters] = useState({
    id: "",
    name: "",
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: "",
    title: "",
    message: "",
    pendingData: null,
  });

  // =========================================================
  // FETCH CATEGORIES
  // =========================================================
  useEffect(() => {
    fetchCategories({ type: "PRODUCT" });
  }, [fetchCategories]);

  // =========================================================
  // DEBOUNCE SEARCH
  // =========================================================
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFilters({
        id: searchId.trim(),
        name: searchName.trim(),
      });
    }, 500);

    return () => clearTimeout(handler);
  }, [searchId, searchName]);

  // =========================================================
  // FETCH PRODUCTS
  // =========================================================
  useEffect(() => {
    const filterConditions = [];

    // Filter by product ID
    if (debouncedFilters.id && !isNaN(debouncedFilters.id)) {
      filterConditions.push(`id:${debouncedFilters.id}`);
    }

    // Filter by product name
    if (debouncedFilters.name) {
      filterConditions.push(`name~*${debouncedFilters.name}*`);
    }

    // Filter by category
    if (selectedCategory !== 0) {
      filterConditions.push(`category.id:${selectedCategory}`);
    }

    const filterParam =
      filterConditions.length > 0 ? filterConditions.join(",") : undefined;

    fetchProducts({
      page: currentPage,
      filter: filterParam,
    });
  }, [currentPage, debouncedFilters, selectedCategory, fetchProducts]);

  // =========================================================
  // RESET PAGE WHEN FILTERS CHANGE
  // =========================================================
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedFilters, selectedCategory]);

  // =========================================================
  // FETCH IMAGES FOR EACH PRODUCT
  // =========================================================
  useEffect(() => {
    products.forEach((product) => {
      const productId = String(product.id);

      // Store đã có danh sách ảnh thì không gọi lại API.
      if (!Object.prototype.hasOwnProperty.call(imagesByProductId, productId)) {
        fetchImages(productId).catch((error) => {
          console.error(
            `Không thể tải danh sách ảnh của sản phẩm ${productId}:`,
            error,
          );
        });
      }
    });
  }, [products, imagesByProductId, fetchImages]);

  // =========================================================
  // CATEGORY OPTIONS
  // =========================================================
  const categoriesOptions = [
    { value: 0, label: "Tất cả danh mục" },
    ...storeCategories
      .filter(
        (category) =>
          category.categoryType === "PRODUCT" || category.type === "PRODUCT",
      )
      .map((category) => ({
        value: category.id,
        label: category.name,
      })),
  ];

  // =========================================================
  // MODAL HANDLERS
  // =========================================================
  const handleOpenCreateModal = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (payload) => {
    const isCreateMode = !selectedProduct;

    try {
      let result;

      if (isCreateMode) {
        result = await createProduct(payload);
      } else {
        result = await updateProduct(payload.id, payload);
      }

      if (result) {
        setIsModalOpen(false);

        if (isCreateMode) {
          showToast("Thêm mới sản phẩm thành công! 🎉", "success");

          setSearchId("");
          setSearchName("");
          setSelectedCategory(0);
          setCurrentPage(1);
        } else {
          showToast("Cập nhật thông tin sản phẩm thành công! 💾", "success");

          // Tải lại danh sách để nhận dữ liệu mới nhất.
          await fetchProducts({
            page: currentPage,
          });
        }
      } else {
        showToast(
          "Xử lý dữ liệu thất bại. Vui lòng kiểm tra lại thông tin.",
          "error",
        );
      }
    } catch (error) {
      console.error("Submit product error:", error);

      showToast(
        "Đã xảy ra lỗi hệ thống trong lúc truyền tải dữ liệu.",
        "error",
      );
    }
  };

  const handleCancelForm = () => {
    setConfirmModal({
      isOpen: true,
      type: "CANCEL_FORM",
      title: "Hủy bỏ thao tác?",
      message:
        "Những thay đổi bạn vừa nhập sẽ không được lưu. Bạn vẫn muốn thoát chứ?",
      pendingData: null,
    });
  };

  const handleConfirmDelete = (productId, productName) => {
    setConfirmModal({
      isOpen: true,
      type: "CONFIRM_DELETE",
      title: "Xóa sản phẩm vĩnh viễn",
      message: `Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa sản phẩm "${productName}" không?`,
      pendingData: {
        id: productId,
        name: productName,
      },
    });
  };

  const closeConfirmModal = () => {
    setConfirmModal({
      isOpen: false,
      type: "",
      title: "",
      message: "",
      pendingData: null,
    });
  };

  const executeDeleteProduct = async () => {
    const { id, name } = confirmModal.pendingData || {};

    if (id == null) return;

    try {
      const result = await deleteProduct(id);

      if (result?.success) {
        showToast(`Đã xóa sản phẩm "${name}" thành công! 🗑️`, "success");
      } else {
        showToast("Không thể xóa sản phẩm vào lúc này.", "error");
      }

      closeConfirmModal();
    } catch (error) {
      console.error("Delete product error:", error);

      showToast("Đã xảy ra lỗi khi tiến hành xóa.", "error");
    }
  };

  const handleConfirmAction = () => {
    switch (confirmModal.type) {
      case "CANCEL_FORM":
        setIsModalOpen(false);
        closeConfirmModal();
        break;

      case "CONFIRM_DELETE":
        executeDeleteProduct();
        break;

      default:
        closeConfirmModal();
    }
  };

  // =========================================================
  // ERROR STATE
  // =========================================================
  if (errorProducts) {
    return (
      <div className="text-center p-6 text-red-500 flex items-center justify-center gap-2 h-[60vh]">
        <AlertCircle size={18} />
        {errorProducts}
      </div>
    );
  }

  // =========================================================
  // RENDER
  // =========================================================
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
            <span>Quản lý Shop</span>
            <ChevronRight size={12} />
            <span className="text-orange-500">Sản phẩm</span>
          </div>

          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            DANH SÁCH SẢN PHẨM
          </h1>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-orange-500 text-white font-bold rounded-2xl shadow-md hover:bg-opacity-90 active:scale-95 transition-all"
        >
          <Plus size={18} />
          Thêm sản phẩm
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
        {/* SEARCH BY ID */}
        <div className="relative w-full">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
            <Hash size={16} />
          </span>

          <input
            type="text"
            placeholder="Tìm theo ID sản phẩm..."
            value={searchId}
            onChange={(event) => setSearchId(event.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 text-gray-700"
          />
        </div>

        {/* SEARCH BY NAME */}
        <div className="relative w-full">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
            <Search size={16} />
          </span>

          <input
            type="text"
            placeholder="Tìm theo tên sản phẩm..."
            value={searchName}
            onChange={(event) => setSearchName(event.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 text-gray-700"
          />
        </div>

        {/* FILTER BY CATEGORY */}
        <div className="relative w-full">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 pointer-events-none z-10">
            <Layers size={16} />
          </span>

          <select
            value={selectedCategory}
            onChange={(event) =>
              setSelectedCategory(Number(event.target.value))
            }
            disabled={loadingCategories}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 focus:outline-none focus:border-orange-500 disabled:opacity-50 appearance-none"
          >
            {categoriesOptions.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* PRODUCT TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
        {(loadingProducts || loadingCategories) && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-10">
            <Loading size="large" />
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead>
              <tr className="bg-gray-50 text-gray-400 text-xs uppercase font-black tracking-wider border-b border-gray-100">
                <th className="p-4 w-24 text-center">Ảnh</th>
                <th className="p-4">Thông tin sản phẩm</th>
                <th className="p-4">Phân loại</th>
                <th className="p-4">Giá bán</th>
                <th className="p-4 text-center">Kho hàng</th>
                <th className="p-4 text-right">Hành động</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {products.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-gray-400">
                    <Package size={36} className="mx-auto mb-2 text-gray-300" />
                    Không tìm thấy sản phẩm nào trùng khớp.
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const productImages =
                    imagesByProductId[String(product.id)] || [];

                  const thumbnail =
                    productImages.find(
                      (image) => image.isThumbnail || image.isMain,
                    ) ||
                    productImages[0] ||
                    null;

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-gray-50/50 transition-colors group"
                    >
                      {/* PRODUCT IMAGE */}
                      <td className="p-4 text-center">
                        <div className="w-14 h-14 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center mx-auto group-hover:scale-105 transition-transform duration-200 shadow-sm">
                          {thumbnail ? (
                            <ProductImage
                              image={thumbnail}
                              alt={`Ảnh ${product.name}`}
                              className="h-full w-full"
                            />
                          ) : (
                            <Package size={20} className="text-gray-400" />
                          )}
                        </div>
                      </td>

                      {/* PRODUCT INFO */}
                      <td className="p-4">
                        <div className="font-bold text-gray-800 text-base group-hover:text-orange-500 transition-colors">
                          {product.name}
                        </div>

                        <div className="text-xs font-mono text-gray-400 mt-0.5">
                          Mã định danh:{" "}
                          <span className="font-bold text-blue-600">
                            ID - #{product.id}
                          </span>
                        </div>
                      </td>

                      {/* CATEGORY */}
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg">
                          <Layers size={12} />
                          {product.categoryName || "Chưa phân loại"}
                        </span>
                      </td>

                      {/* PRICE */}
                      <td className="p-4 font-black text-gray-900 text-base">
                        {formatPrice(product.price)}
                      </td>

                      {/* STOCK */}
                      <td className="p-4 text-center">
                        <span
                          className={`font-bold ${
                            product.stockQuantity === 0
                              ? "text-red-500 bg-red-50 px-2 py-0.5 rounded-lg border border-red-100 text-xs"
                              : "text-gray-800"
                          }`}
                        >
                          {product.stockQuantity === 0
                            ? "Hết hàng"
                            : `${product.stockQuantity} cái`}
                        </span>
                      </td>

                      {/* ACTIONS */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(product)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl border border-transparent hover:border-blue-200 transition-all"
                            title="Sửa sản phẩm"
                          >
                            <Edit2 size={16} />
                          </button>

                          <button
                            onClick={() =>
                              handleConfirmDelete(product.id, product.name)
                            }
                            className="p-2 text-red-500 hover:bg-red-50 rounded-xl border border-transparent hover:border-red-200 transition-all"
                            title="Xóa sản phẩm"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {meta && meta.pages > 1 && (
          <div className="p-4 border-t border-gray-100 flex justify-center bg-gray-50/50">
            <Pagination
              currentPage={currentPage}
              totalPages={meta.pages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </div>

      {/* PRODUCT FORM MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCancelForm}
        title={
          selectedProduct ? "Chỉnh sửa thông tin sản phẩm" : "Thêm sản phẩm mới"
        }
        size="lg"
      >
        <ProductFormAdmin
          initialData={selectedProduct}
          onSubmit={handleFormSubmit}
          onClose={handleCancelForm}
        />
      </Modal>

      {/* CONFIRMATION MODAL */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        onConfirm={handleConfirmAction}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type === "CONFIRM_DELETE" ? "danger" : "warning"}
      />
    </div>
  );
};

export default ProductManagement;
