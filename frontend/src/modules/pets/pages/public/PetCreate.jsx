import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PawPrint,
  HeartPulse,
  Scale,
  Calendar,
  FileText,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";

import { Input } from "../../../../shared/components/Input.jsx";
import { Button } from "../../../../shared/components/Button.jsx";
import { usePetStore } from "../../store/petStore.js";
import { useCartStore } from "../../../cart/store/cartStore.js";
import { validatePetForm } from "../../validators/petFormValidator.js";

const getToday = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const PetCreate = () => {
  const navigate = useNavigate();

  const { createPet, loading, error: storeError, clearError } = usePetStore();
  const { showToast } = useCartStore();

  const [formData, setFormData] = useState({
    name: "",
    specie: "",
    gender: "MALE",
    birthday: "",
    weight: "",
    healthStatus: "",
  });

  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    clearError?.();
  }, [clearError]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setValidationError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setValidationError("");

    const validation = validatePetForm(formData);

    if (!validation.success) {
      setValidationError(
        validation.error.issues[0]?.message || "Dữ liệu không hợp lệ.",
      );
      return;
    }

    const payload = {
      ...validation.data,
      healthStatus: validation.data.healthStatus || "Bình thường",
    };

    try {
      const response = await createPet(payload);

      if (
        !response ||
        response.status === "ERROR" ||
        response.success === false
      ) {
        setValidationError(
          response?.message || storeError || "Không thể tạo hồ sơ thú cưng.",
        );
        return;
      }

      showToast?.("Đăng ký hồ sơ bé thành công!");
      navigate("/profile", { state: { activeTab: "pets" } });
    } catch (error) {
      setValidationError(
        error?.message || "Đã xảy ra lỗi khi tạo hồ sơ thú cưng.",
      );
    }
  };

  const displayedError = validationError || storeError;

  return (
    <div className="my-6 mx-auto max-w-2xl rounded-3xl border border-gray-100 bg-white p-8 text-left shadow-sm">
      <div className="mb-6 flex items-center gap-4 border-b border-gray-50 pb-4">
        <button
          type="button"
          onClick={() => navigate("/profile", { state: { activeTab: "pets" } })}
          className="rounded-xl p-2 text-gray-500 transition-colors hover:bg-gray-50"
          aria-label="Quay lại hồ sơ"
        >
          <ArrowLeft size={20} />
        </button>

        <div>
          <h2 className="flex items-center gap-2 text-xl font-black uppercase tracking-tight text-pet-blue">
            <PawPrint size={22} />
            Đăng ký thành viên mới
          </h2>
          <p className="text-xs font-medium text-gray-400">
            Khởi tạo thông tin thú cưng để quản lý và sử dụng dịch vụ Spa.
          </p>
        </div>
      </div>

      {displayedError && (
        <div
          role="alert"
          className="mb-5 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-700"
        >
          <AlertCircle
            className="mt-0.5 flex-shrink-0 text-red-500"
            size={18}
          />
          <div>{displayedError}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Tên của bé *"
          icon={PawPrint}
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Nhập tên bé..."
          required
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="Loài thú cưng *"
            icon={HeartPulse}
            name="specie"
            value={formData.specie}
            onChange={handleInputChange}
            placeholder="Ví dụ: DOG, CAT, RABBIT..."
            required
          />

          <div>
            <label className="mb-1.5 flex items-center gap-1 text-sm font-bold text-gray-700">
              <HeartPulse size={15} className="text-gray-400" />
              Giới tính *
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              required
              className="h-[46px] w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-800 outline-none transition-all focus:border-pet-blue focus:ring-2 focus:ring-pet-blue/10"
            >
              <option value="MALE">Đực (MALE)</option>
              <option value="FEMALE">Cái (FEMALE)</option>
              <option value="UNKNOWN">Chưa rõ (UNKNOWN)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 flex items-center gap-1 text-sm font-bold text-gray-700">
              <Calendar size={15} className="text-gray-400" />
              Ngày sinh *
            </label>
            <input
              type="date"
              name="birthday"
              value={formData.birthday}
              onChange={handleInputChange}
              max={getToday()}
              required
              className="h-[46px] w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-800 outline-none transition-all focus:border-pet-blue focus:ring-2 focus:ring-pet-blue/10"
            />
          </div>

          <Input
            label="Cân nặng thực tế (kg) *"
            icon={Scale}
            type="number"
            step="0.1"
            min="0.1"
            name="weight"
            value={formData.weight}
            onChange={handleInputChange}
            placeholder="Ví dụ: 8.5"
            required
          />
        </div>

        <div>
          <label className="mb-1.5 flex items-center gap-1 text-sm font-bold text-gray-700">
            <FileText size={15} className="text-gray-400" />
            Tình trạng sức khỏe và lưu ý đặc biệt
          </label>
          <textarea
            name="healthStatus"
            value={formData.healthStatus}
            onChange={handleInputChange}
            rows={4}
            maxLength={1000}
            placeholder="Ghi chú bệnh lý, dị ứng hoặc những lưu ý đặc biệt..."
            className="w-full resize-none rounded-2xl border border-gray-200 px-4 py-3 text-sm font-medium leading-relaxed text-gray-800 outline-none transition-all focus:border-pet-blue focus:ring-2 focus:ring-pet-blue/10"
          />
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              navigate("/profile", { state: { activeTab: "pets" } })
            }
            disabled={loading}
            className="rounded-xl px-6 font-bold"
          >
            Hủy bỏ
          </Button>

          <Button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-xl px-8 text-sm font-black uppercase tracking-wider shadow-md shadow-pet-blue/10"
          >
            {loading ? "Đang lưu hồ sơ..." : "Hoàn tất đăng ký"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PetCreate;
