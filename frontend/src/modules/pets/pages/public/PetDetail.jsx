import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Sparkles, AlertCircle, Trash2 } from "lucide-react";

import { Button } from "../../../../shared/components/Button.jsx";
import Loading from "../../../../shared/components/Loading.jsx";
import ConfirmModal from "../../../../shared/components/ConfirmModal.jsx";
import { usePetStore } from "../../store/petStore.js";

const PetDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const {
    currentPet,
    loading,
    error: storeError,
    fetchPetById,
    createPet,
    updatePet,
    deletePet,
    clearCurrentPet,
    clearError,
  } = usePetStore();

  const [formData, setFormData] = useState({
    name: "",
    specie: "DOG",
    gender: "MALE",
    birthday: "",
    weight: "",
    healthStatus: "",
  });

  const [validationError, setValidationError] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isEditMode && id) {
      fetchPetById(id);
    }

    return () => {
      clearCurrentPet?.();
      clearError?.();
    };
  }, [id, isEditMode, fetchPetById, clearCurrentPet, clearError]);

  useEffect(() => {
    if (isEditMode && currentPet) {
      const birthday = currentPet.birthday
        ? String(currentPet.birthday).slice(0, 10)
        : "";

      setFormData({
        name: currentPet.name || "",
        specie:
          currentPet.specie || currentPet.species?.name?.toUpperCase() || "DOG",
        gender: currentPet.gender?.toUpperCase() || "MALE",
        birthday,
        weight: currentPet.weight ?? currentPet.weight_kg ?? "",
        healthStatus: currentPet.healthStatus || currentPet.medical_note || "",
      });
    }
  }, [currentPet, isEditMode]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: name === "weight" && value !== "" ? value : value,
    }));

    if (validationError) {
      setValidationError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setValidationError("");

    if (!formData.name.trim()) {
      setValidationError("Vui lòng điền tên của bé.");
      return;
    }

    if (!formData.birthday) {
      setValidationError("Vui lòng nhập ngày sinh.");
      return;
    }

    const birthdayDate = new Date(`${formData.birthday}T00:00:00.000Z`);

    if (Number.isNaN(birthdayDate.getTime())) {
      setValidationError("Ngày sinh không hợp lệ.");
      return;
    }

    const weight = Number(formData.weight);

    if (formData.weight === "" || !Number.isFinite(weight) || weight <= 0) {
      setValidationError("Cân nặng phải là số dương lớn hơn 0.");
      return;
    }

    const payload = {
      ...formData,
      name: formData.name.trim(),
      birthday: formData.birthday,
      weight,
    };

    try {
      setIsSubmitting(true);

      let response;

      if (isEditMode) {
        response = await updatePet(id, {
          ...payload,
          id: Number.parseInt(id, 10),
        });
      } else {
        response = await createPet(payload);
      }

      if (response) {
        navigate("/profile", {
          state: { activeTab: "pets" },
        });
      } else {
        setValidationError("Không thể lưu hồ sơ thú cưng. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Gửi form thú cưng thất bại:", error);

      const responseMessage = error?.response?.data?.message;

      setValidationError(
        Array.isArray(responseMessage)
          ? responseMessage.join(", ")
          : responseMessage ||
              error?.message ||
              "Đã xảy ra lỗi khi lưu hồ sơ thú cưng.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePet = async () => {
    if (!id || typeof deletePet !== "function") {
      setValidationError("Store chưa cung cấp chức năng xóa thú cưng.");
      setIsDeleteModalOpen(false);
      return;
    }

    try {
      setIsDeleting(true);
      setValidationError("");

      const response = await deletePet(id);

      if (
        response === false ||
        response?.status === "ERROR" ||
        response?.success === false
      ) {
        throw new Error(response?.message || "Không thể xóa hồ sơ thú cưng.");
      }

      setIsDeleteModalOpen(false);

      navigate("/profile", {
        state: { activeTab: "pets" },
      });
    } catch (error) {
      console.error("Xóa thú cưng thất bại:", error);

      const responseMessage = error?.response?.data?.message;

      setValidationError(
        Array.isArray(responseMessage)
          ? responseMessage.join(", ")
          : responseMessage ||
              error?.message ||
              "Không thể xóa thú cưng. Vui lòng thử lại.",
      );

      setIsDeleteModalOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isEditMode && loading && !currentPet) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loading size="large" />
      </div>
    );
  }

  const todayStr = new Date().toLocaleDateString("en-CA");

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 text-left">
      {/* Điều hướng quay lại */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() =>
            navigate("/profile", {
              state: { activeTab: "pets" },
            })
          }
          className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={18} />
          Quay lại danh sách bé
        </button>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
        {/* Tiêu đề */}
        <div className="mb-8">
          <h2 className="text-3xl font-black text-gray-900 flex items-center gap-2">
            <Sparkles className="text-pet-orange" size={26} />
            {isEditMode ? "Cập nhật hồ sơ của bé" : "Đăng ký thú cưng mới"}
          </h2>

          <p className="text-sm text-gray-400 font-medium mt-1">
            {isEditMode
              ? "Sửa đổi các thông số sinh trắc học và sức khỏe để cập nhật hồ sơ của bé."
              : "Điền đầy đủ thông tin để nhận diện và tính toán giá dịch vụ Spa phù hợp nhất cho bé."}
          </p>
        </div>

        {/* Thông báo lỗi */}
        {(validationError || storeError) && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-700 text-sm font-medium">
            <AlertCircle className="shrink-0 text-red-500 mt-0.5" size={18} />
            <div>{validationError || storeError}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tên thú cưng */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-700">
                Tên của bé <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ví dụ: Cậu Vàng, Bin Bin..."
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl font-medium focus:outline-none focus:border-pet-blue transition-colors text-gray-800"
              />
            </div>

            {/* Chủng loài */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-700">
                Chủng loài <span className="text-red-500">*</span>
              </label>

              <select
                name="specie"
                value={formData.specie}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl font-bold focus:outline-none focus:border-pet-blue transition-colors text-gray-800 bg-white"
              >
                <option value="DOG">🐶 Loài Chó (DOG)</option>
                <option value="CAT">🐱 Loài Mèo (CAT)</option>
              </select>
            </div>

            {/* Giới tính */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-700">
                Giới tính <span className="text-red-500">*</span>
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setFormData((previous) => ({
                      ...previous,
                      gender: "MALE",
                    }))
                  }
                  className={`py-3 rounded-xl border-2 font-bold transition-all text-sm ${
                    formData.gender === "MALE"
                      ? "border-pet-blue bg-blue-50/50 text-pet-blue shadow-sm"
                      : "border-gray-200 text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  ♂ Đực (MALE)
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setFormData((previous) => ({
                      ...previous,
                      gender: "FEMALE",
                    }))
                  }
                  className={`py-3 rounded-xl border-2 font-bold transition-all text-sm ${
                    formData.gender === "FEMALE"
                      ? "border-pet-orange bg-orange-50/50 text-pet-orange shadow-sm"
                      : "border-gray-200 text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  ♀ Cái (FEMALE)
                </button>
              </div>
            </div>

            {/* Ngày sinh */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-700">
                Ngày sinh sinh học <span className="text-red-500">*</span>
              </label>

              <input
                type="date"
                name="birthday"
                max={todayStr}
                value={formData.birthday}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl font-bold focus:outline-none focus:border-pet-blue transition-colors text-gray-800 bg-white"
              />
            </div>

            {/* Cân nặng */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-700">
                Cân nặng hiện tại (kg) <span className="text-red-500">*</span>
              </label>

              <input
                type="number"
                step="0.1"
                min="0.01"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                placeholder="Nhập số cân nặng của bé..."
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl font-bold focus:outline-none focus:border-pet-blue transition-colors text-gray-800"
              />
            </div>
          </div>

          {/* Tình trạng sức khỏe */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-700">
              Trạng thái sức khỏe & Lưu ý đặc biệt
            </label>

            <textarea
              name="healthStatus"
              rows={4}
              value={formData.healthStatus}
              onChange={handleChange}
              placeholder="Ghi chú tiền sử bệnh lý, dị ứng thuốc, dị ứng thức ăn hoặc tính khí đặc biệt của bé khi tắm rửa để nhân viên lưu ý..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl font-medium focus:outline-none focus:border-pet-blue transition-colors text-gray-800 resize-none leading-relaxed"
            />
          </div>

          {/* Nút hành động */}
          <div className="pt-4 border-t border-gray-50 flex flex-wrap items-center justify-between gap-3">
            <div>
              {isEditMode && (
                <Button
                  type="button"
                  variant="outline"
                  disabled={isDeleting || isSubmitting}
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="rounded-xl font-bold px-5 py-2.5 text-sm text-red-600 border-red-200 hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  Xóa thú cưng
                </Button>
              )}
            </div>

            <div className="flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting || isDeleting}
                onClick={() =>
                  navigate("/profile", {
                    state: { activeTab: "pets" },
                  })
                }
                className="rounded-xl font-bold px-6 py-2.5 text-sm"
              >
                Hủy bỏ
              </Button>

              <Button
                type="submit"
                disabled={loading || isSubmitting || isDeleting}
                className="rounded-xl font-bold px-6 py-2.5 text-sm bg-pet-blue shadow-md shadow-pet-blue/10 flex items-center gap-2"
              >
                {isSubmitting || loading ? (
                  "Đang xử lý..."
                ) : (
                  <>
                    <Save size={16} />
                    {isEditMode ? "Lưu thay đổi" : "Đăng ký bé"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Modal xác nhận xóa */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          if (!isDeleting) {
            setIsDeleteModalOpen(false);
          }
        }}
        onConfirm={handleDeletePet}
        title="Xác nhận xóa thú cưng"
        message={`Bạn có chắc chắn muốn xóa hồ sơ của bé "${
          currentPet?.name || formData.name || "thú cưng này"
        }" không? Hành động này không thể hoàn tác.`}
        type="danger"
        confirmText={isDeleting ? "Đang xóa..." : "Xác nhận xóa"}
        cancelText="Quay lại"
      />
    </div>
  );
};

export default PetDetail;
