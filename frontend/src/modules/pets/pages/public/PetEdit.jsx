import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  PawPrint,
  HeartPulse,
  Scale,
  Calendar,
  FileText,
  ArrowLeft,
  Heart,
  AlertCircle,
} from "lucide-react";

import { Input } from "../../../../shared/components/Input.jsx";
import { Button } from "../../../../shared/components/Button.jsx";
import Loading from "../../../../shared/components/Loading.jsx";
import { useCartStore } from "../../../cart/store/cartStore.js";
import { usePetStore } from "../../store/petStore.js";
import { validatePetForm } from "../../validators/petFormValidator.js";

const getToday = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const PetEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useCartStore();

  const { currentPet, loading, submitting, fetchPetById, updatePet } =
    usePetStore();

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    specie: "",
    gender: "",
    birthday: "",
    weight: "",
    healthStatus: "",
  });

  const [validationError, setValidationError] = useState("");
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (!id) {
      setLoadError("Không tìm thấy ID thú cưng.");
      return;
    }

    setLoadError("");

    Promise.resolve(fetchPetById(id)).catch((error) => {
      setLoadError(error?.message || "Không thể tải thông tin thú cưng.");
    });
  }, [id, fetchPetById]);

  useEffect(() => {
    if (!currentPet) return;

    setFormData({
      id: String(currentPet.id ?? ""),
      name: currentPet.name ?? "",
      specie: currentPet.specie ?? currentPet.species?.name ?? "DOG",
      gender: String(currentPet.gender ?? "UNKNOWN").toUpperCase(),
      birthday: currentPet.birthday
        ? String(currentPet.birthday).slice(0, 10)
        : "",
      weight: String(currentPet.weight ?? currentPet.weight_kg ?? ""),
      healthStatus: currentPet.healthStatus ?? currentPet.medical_note ?? "",
    });

    setValidationError("");
  }, [currentPet]);

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

    const validation = validatePetForm(formData, true);

    if (!validation.success) {
      setValidationError(
        validation.error.issues[0]?.message || "Dữ liệu không hợp lệ.",
      );
      return;
    }

    const payload = {
      ...validation.data,
      healthStatus: validation.data.healthStatus || null,
    };

    try {
      const response = await updatePet(id, payload);

      if (!response || response.status !== "SUCCESS") {
        setValidationError(
          response?.message || "Có lỗi xảy ra khi cập nhật thông tin.",
        );
        return;
      }

      showToast?.(
        `Cập nhật thông tin thú cưng ${response.data?.name || payload.name} thành công!`,
      );

      navigate("/profile");
    } catch (error) {
      setValidationError(
        error?.message || "Đã xảy ra lỗi khi cập nhật thú cưng.",
      );
    }
  };

  if (loading && !currentPet) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loading size="large" />
      </div>
    );
  }

  if (loadError || (!loading && !currentPet)) {
    return (
      <div className="mx-auto max-w-2xl rounded-3xl border border-gray-100 bg-white py-12 text-center shadow-sm">
        <p className="mb-4 font-bold text-red-500">
          {loadError || "Không tìm thấy thông tin thú cưng."}
        </p>
        <Button variant="outline" onClick={() => navigate("/profile")}>
          Quay lại hồ sơ
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-gray-100 bg-white p-8 text-left shadow-sm">
      <div className="mb-6 flex items-center gap-4 border-b border-gray-50 pb-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded-xl p-2 text-gray-500 transition-colors hover:bg-gray-50"
          aria-label="Quay lại"
        >
          <ArrowLeft size={20} />
        </button>

        <div>
          <h2 className="flex items-center gap-2 text-xl font-black uppercase tracking-tight text-pet-blue">
            <PawPrint size={22} />
            Chỉnh sửa thông tin bé
          </h2>
          <p className="text-xs font-medium text-gray-400">
            Cập nhật thông tin cơ bản của thú cưng.
          </p>
        </div>
      </div>

      {validationError && (
        <div
          role="alert"
          className="mb-5 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-700"
        >
          <AlertCircle
            className="mt-0.5 flex-shrink-0 text-red-500"
            size={18}
          />
          <div>{validationError}</div>
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
            placeholder="Ví dụ: DOG, CAT..."
            required
          />

          <div>
            <label className="mb-1.5 flex items-center gap-1 text-sm font-bold text-gray-700">
              <Heart size={15} className="text-gray-400" />
              Giới tính *
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              required
              className="h-[46px] w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium outline-none transition-all focus:border-pet-blue focus:ring-2 focus:ring-pet-blue/10"
            >
              <option value="" disabled>
                -- Chọn giới tính --
              </option>
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
              className="h-[46px] w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium outline-none transition-all focus:border-pet-blue focus:ring-2 focus:ring-pet-blue/10"
            />
          </div>

          <Input
            label="Cân nặng (kg) *"
            icon={Scale}
            type="number"
            step="0.1"
            min="0.1"
            name="weight"
            value={formData.weight}
            onChange={handleInputChange}
            placeholder="Ví dụ: 4.5"
            required
          />
        </div>

        <div>
          <label className="mb-1.5 flex items-center gap-1 text-sm font-bold text-gray-700">
            <FileText size={15} className="text-gray-400" />
            Tình trạng sức khỏe
          </label>
          <textarea
            name="healthStatus"
            value={formData.healthStatus}
            onChange={handleInputChange}
            rows={3}
            maxLength={1000}
            placeholder="Mô tả tình trạng sức khỏe hiện tại của bé..."
            className="w-full resize-none rounded-2xl border border-gray-200 px-4 py-3 text-sm font-medium outline-none transition-all focus:border-pet-blue focus:ring-2 focus:ring-pet-blue/10"
          />
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            disabled={submitting}
            className="rounded-xl px-6 font-bold"
          >
            Hủy bỏ
          </Button>

          <Button
            type="submit"
            disabled={submitting}
            className="rounded-xl px-8 text-sm font-black uppercase tracking-wider shadow-md shadow-pet-blue/10"
          >
            {submitting ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PetEdit;
