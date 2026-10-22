import React, { useState, useEffect, useMemo } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Sliders,
  FileText,
  Package,
  Search,
} from "lucide-react";
import { useProductStore } from "../../../products/store/productStore.js";
import { validateInventoryTransaction } from "../../validators/inventoryTransactionValidator.js";

const InventoryTransactionAdmin = ({ onClose, onSubmit, mode = "CREATE" }) => {
  // Zustand store
  const storeProducts = useProductStore((state) => state.products) || [];
  const loading = useProductStore((state) => state.loading);
  const fetchProducts = useProductStore((state) => state.fetchProducts);

  // Form states
  const [type, setType] = useState("IMPORT");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Preview states
  const [currentProduct, setCurrentProduct] = useState(null);
  const [previewStock, setPreviewStock] = useState(0);

  // Validation errors
  const [errors, setErrors] = useState({});

  const isViewMode = mode === "VIEW";

  // Load products
  useEffect(() => {
    if (storeProducts.length === 0 && !loading) {
      fetchProducts({ pageSize: 100 });
    }
  }, [storeProducts.length, loading, fetchProducts]);

  // Filter products
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return storeProducts;

    const query = searchQuery.toLowerCase().trim();

    return storeProducts.filter((prod) => {
      const matchId = String(prod.id) === query;
      const matchName = prod.name?.toLowerCase().includes(query);

      return matchId || matchName;
    });
  }, [searchQuery, storeProducts]);

  // Find selected product and calculate preview stock
  useEffect(() => {
    const product = storeProducts.find(
      (item) => String(item.id) === String(selectedProductId),
    );

    setCurrentProduct(product || null);

    if (!product) {
      setPreviewStock(0);
      return;
    }

    const currentStock = Number(product.stockQuantity) || 0;
    const qty = Number(quantity) || 0;

    if (type === "IMPORT") {
      setPreviewStock(currentStock + qty);
    } else if (type === "EXPORT") {
      setPreviewStock(currentStock - qty);
    } else {
      // ADJUST: quantity is the new absolute stock
      setPreviewStock(qty);
    }
  }, [selectedProductId, quantity, type, storeProducts]);

  // Clear the error for a field when the user changes it
  const clearFieldError = (field) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;

      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  // Submit with Validator
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validation = validateInventoryTransaction({
      type,
      productId: selectedProductId,
      quantity,
      note,
      products: storeProducts,
    });

    setErrors(validation.errors);

    if (!validation.isValid) return;

    try {
      await onSubmit(validation.data);
    } catch (error) {
      console.error("Inventory transaction submission failed:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 1. Transaction type */}
      <div className="space-y-2">
        <label className="text-[11px] font-black uppercase text-gray-400 tracking-wider">
          Loại giao dịch
        </label>

        <div className="grid grid-cols-3 gap-2 bg-gray-100 p-1 rounded-xl">
          <button
            type="button"
            disabled={isViewMode}
            onClick={() => {
              setType("IMPORT");
              clearFieldError("type");
              clearFieldError("quantity");
            }}
            className={`py-2 px-3 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-1 ${
              type === "IMPORT"
                ? "bg-emerald-500 text-white shadow-sm"
                : "text-gray-500 hover:text-slate-800"
            }`}
          >
            <ArrowDownLeft size={14} /> NHẬP KHO
          </button>

          <button
            type="button"
            disabled={isViewMode}
            onClick={() => {
              setType("EXPORT");
              clearFieldError("type");
              clearFieldError("quantity");
            }}
            className={`py-2 px-3 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-1 ${
              type === "EXPORT"
                ? "bg-blue-500 text-white shadow-sm"
                : "text-gray-500 hover:text-slate-800"
            }`}
          >
            <ArrowUpRight size={14} /> XUẤT KHO
          </button>

          <button
            type="button"
            disabled={isViewMode}
            onClick={() => {
              setType("ADJUST");
              clearFieldError("type");
              clearFieldError("quantity");
            }}
            className={`py-2 px-3 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-1 ${
              type === "ADJUST"
                ? "bg-amber-500 text-white shadow-sm"
                : "text-gray-500 hover:text-slate-800"
            }`}
          >
            <Sliders size={14} /> ĐIỀU CHỈNH
          </button>
        </div>

        {errors.type && <p className="text-xs text-red-500">{errors.type}</p>}
      </div>

      {/* 2. Search and select product */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-black uppercase text-gray-400 tracking-wider flex items-center gap-1">
          <Package size={12} /> Vật tư / Sản phẩm
        </label>

        {!isViewMode && (
          <div className="relative mb-1.5">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
              <Search size={12} />
            </span>

            <input
              type="text"
              placeholder="Gõ tên hoặc nhập đúng ID sản phẩm để lọc nhanh..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-slate-400 focus:bg-white transition-all text-gray-700 font-medium"
            />
          </div>
        )}

        <select
          value={selectedProductId}
          disabled={isViewMode || loading}
          onChange={(e) => {
            setSelectedProductId(e.target.value);
            clearFieldError("productId");
            clearFieldError("quantity");
          }}
          className={`w-full px-3 py-2.5 bg-gray-50 border rounded-xl text-xs focus:outline-none focus:border-slate-700 focus:bg-white transition-all text-gray-700 font-medium ${
            errors.productId ? "border-red-500" : "border-gray-200"
          }`}
        >
          <option value="">
            {loading
              ? "Đang tải danh sách sản phẩm..."
              : filteredProducts.length === 0
                ? "Không tìm thấy sản phẩm phù hợp"
                : `-- Chọn sản phẩm biến động (${filteredProducts.length}) --`}
          </option>

          {!loading &&
            filteredProducts.map((prod) => (
              <option key={prod.id} value={prod.id}>
                [{prod.id}] {prod.name} (Tồn hiện tại: {prod.stockQuantity || 0}
                )
              </option>
            ))}
        </select>

        {errors.productId && (
          <p className="text-xs text-red-500">{errors.productId}</p>
        )}
      </div>

      {/* 3. Quantity */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-black uppercase text-gray-400 tracking-wider">
          {type === "ADJUST"
            ? "Số lượng tồn kho mới sau chốt"
            : "Số lượng thực hiện"}
        </label>

        <input
          type="number"
          min="1"
          step="1"
          disabled={isViewMode}
          placeholder={
            type === "ADJUST"
              ? "Nhập số lượng chốt tồn mới..."
              : "Nhập số lượng..."
          }
          value={quantity}
          onChange={(e) => {
            setQuantity(e.target.value);
            clearFieldError("quantity");
          }}
          className={`w-full px-3 py-2.5 bg-gray-50 border rounded-xl text-xs focus:outline-none focus:border-slate-700 focus:bg-white transition-all text-gray-700 font-mono font-bold ${
            errors.quantity ? "border-red-500" : "border-gray-200"
          }`}
        />

        {errors.quantity && (
          <p className="text-xs text-red-500">{errors.quantity}</p>
        )}
      </div>

      {/* 4. Stock preview */}
      {currentProduct && (
        <div className="p-3 bg-slate-50 border border-dashed border-gray-200 rounded-xl grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">
              Tồn kho hiện tại
            </p>

            <p className="text-sm font-black text-slate-600 font-mono mt-0.5">
              {currentProduct.stockQuantity || 0}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">
              Tồn sau xử lý (Dự kiến)
            </p>

            <p
              className={`text-sm font-black font-mono mt-0.5 ${
                previewStock < 0
                  ? "text-red-500"
                  : type === "IMPORT"
                    ? "text-emerald-600"
                    : type === "EXPORT"
                      ? "text-blue-600"
                      : "text-amber-500"
              }`}
            >
              {previewStock}
            </p>
          </div>
        </div>
      )}

      {/* 5. Note */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-black uppercase text-gray-400 tracking-wider flex items-center gap-1">
          <FileText size={12} /> Ghi chú lý do biến động kho{" "}
          <span className="text-red-500">*</span>
        </label>

        <textarea
          rows="3"
          disabled={isViewMode}
          placeholder="Nhập lý do nhập xuất hoặc mã chứng từ đi kèm (ví dụ: Xuất phục vụ dịch vụ spa)..."
          value={note}
          onChange={(e) => {
            setNote(e.target.value);
            clearFieldError("note");
          }}
          className={`w-full px-3 py-2.5 bg-gray-50 border rounded-xl text-xs focus:outline-none focus:border-slate-700 focus:bg-white transition-all text-gray-700 font-medium resize-none ${
            errors.note ? "border-red-500" : "border-gray-200"
          }`}
        />

        {errors.note && <p className="text-xs text-red-500">{errors.note}</p>}
      </div>

      {/* Actions */}
      {!isViewMode && (
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-slate-700 text-xs font-black rounded-xl transition-all"
          >
            HỦY BỎ
          </button>

          <button
            type="submit"
            disabled={loading}
            className={`px-5 py-2 text-white text-xs font-black rounded-xl transition-all shadow-sm ${
              type === "IMPORT"
                ? "bg-emerald-500 hover:bg-emerald-600"
                : type === "EXPORT"
                  ? "bg-blue-500 hover:bg-blue-600"
                  : "bg-amber-500 hover:bg-amber-600"
            } active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            XÁC NHẬN GHI SỔ
          </button>
        </div>
      )}
    </form>
  );
};

export default InventoryTransactionAdmin;
