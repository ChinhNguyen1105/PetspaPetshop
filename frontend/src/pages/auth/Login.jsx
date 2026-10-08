import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, ArrowRight } from "lucide-react";

import { Input } from "../../components/common/Input";
import { useAuthStore } from "../../store/authStore";

import authValidator from "../../utils/authValidator";

const { validateLoginForm } = authValidator;

const Login = () => {
  // =========================================================
  // 0. COMPONENT RENDER
  // =========================================================
  console.log("🔥 [0] LOGIN COMPONENT RENDER");

  const navigate = useNavigate();

  // =========================================================
  // AUTH STORE
  // =========================================================
  const loginAction = useAuthStore(
    (state) => state.loginAction || state.login || state.actions?.loginAction,
  );

  const loading = useAuthStore((state) => state.loading);
  const authError = useAuthStore((state) => state.error);

  console.log("🔥 [STORE] loginAction:", loginAction);
  console.log("🔥 [STORE] typeof loginAction:", typeof loginAction);
  console.log("🔥 [STORE] loading:", loading);
  console.log("🔥 [STORE] authError:", authError);

  // =========================================================
  // FORM STATE
  // =========================================================
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState("");

  // =========================================================
  // INPUT CHANGE
  // =========================================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    console.log("✏️ [INPUT CHANGE]");
    console.log("   name:", name);
    console.log("   value:", name === "password" ? "********" : value);

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (validationError) {
      setValidationError("");
    }
  };

  // =========================================================
  // BUTTON CLICK TEST
  // =========================================================
  const handleButtonClick = () => {
    console.log("🟢 [2] SUBMIT BUTTON CLICKED");
  };

  // =========================================================
  // FORM SUBMIT
  // =========================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("========================================");
    console.log("🔥 [3] FORM SUBMITTED");
    console.log("========================================");

    console.log("📦 [FORM DATA]:", {
      email: formData.email,
      password: "********",
    });

    // =======================================================
    // VALIDATION
    // =======================================================
    console.log("🔎 [4] START VALIDATION");

    let validation;

    try {
      validation = validateLoginForm(formData);

      console.log("✅ [4] VALIDATION RESULT:", validation);
    } catch (error) {
      console.error("❌ [4] VALIDATION CRASHED:", error);

      setValidationError(
        error instanceof Error ? error.message : "Validation bị lỗi.",
      );

      return;
    }

    if (!validation?.isValid) {
      console.warn("⚠️ [4] VALIDATION FAILED");

      setValidationError(
        validation?.message || "Thông tin đăng nhập không hợp lệ.",
      );

      return;
    }

    console.log("✅ [4] VALIDATION PASSED");

    // =======================================================
    // CHECK LOGIN ACTION
    // =======================================================
    console.log("🔎 [5] CHECK LOGIN ACTION");
    console.log("loginAction:", loginAction);
    console.log("typeof:", typeof loginAction);

    if (typeof loginAction !== "function") {
      console.error("❌ [5] loginAction IS NOT A FUNCTION");

      setValidationError(
        "Hệ thống xác thực chưa sẵn sàng. Vui lòng kiểm tra lại authStore.",
      );

      return;
    }

    // =======================================================
    // CALL LOGIN ACTION
    // =======================================================
    console.log("🚀 [6] BEFORE LOGIN ACTION");

    const credentials = {
      email: formData.email.trim(),
      password: formData.password,
    };

    console.log("📤 [6] CREDENTIALS:", {
      email: credentials.email,
      password: "********",
    });

    try {
      const result = await loginAction(credentials);

      // =====================================================
      // LOGIN RESULT
      // =====================================================
      console.log("========================================");
      console.log("🎯 [7] LOGIN ACTION RESULT");
      console.log("========================================");

      console.log("result:", result);
      console.log("result.success:", result?.success);
      console.log("result.role:", result?.role);

      // =====================================================
      // LOGIN FAILED
      // =====================================================
      if (!result?.success) {
        console.warn("⚠️ [7] LOGIN FAILED");

        return;
      }

      // =====================================================
      // LOGIN SUCCESS
      // =====================================================
      console.log("✅ [7] LOGIN SUCCESS");

      const role = result.role;

      console.log("👤 [8] USER ROLE:", role);

      // =====================================================
      // NAVIGATION
      // =====================================================
      if (["ROLE_ADMIN", "ROLE_STAFF"].includes(role)) {
        console.log("➡️ [9] NAVIGATE TO ADMIN DASHBOARD");

        navigate("/admin/dashboard", {
          replace: true,
        });
      } else {
        console.log("➡️ [9] NAVIGATE TO HOME");

        navigate("/", {
          replace: true,
        });
      }
    } catch (error) {
      // =====================================================
      // UNEXPECTED ERROR
      // =====================================================
      console.error("========================================");
      console.error("❌ [ERROR] LOGIN ACTION CRASHED");
      console.error("========================================");

      console.error("error:", error);

      if (error instanceof Error) {
        console.error("error.message:", error.message);
        console.error("error.stack:", error.stack);
      }

      setValidationError(
        error instanceof Error
          ? error.message
          : "Đăng nhập xảy ra lỗi không xác định.",
      );
    }
  };

  // =========================================================
  // RENDER
  // =========================================================
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-slate-50">
      {/* =====================================================
          LEFT FORM
      ====================================================== */}
      <div className="lg:col-span-5 flex flex-col justify-center px-8 sm:px-16 lg:px-12 xl:px-16 bg-white z-10 relative shadow-xl">
        <div className="max-w-md w-full mx-auto">
          {/* HEADER */}
          <div className="mb-10">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase">
              Mừng Bạn Trở Lại
            </h2>

            <p className="text-slate-500 text-sm font-medium mt-1">
              Đăng nhập để quản lý lịch hẹn và mua sắm.
            </p>
          </div>

          {/* =================================================
              ERROR
          ================================================== */}
          {(validationError || authError) && (
            <div className="bg-rose-50 border-l-4 border-rose-500 text-rose-700 p-4 rounded-xl text-xs font-semibold mb-6 animate-shake">
              {validationError || authError}
            </div>
          )}

          {/* =================================================
              LOGIN FORM
          ================================================== */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* EMAIL */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                Địa chỉ Email
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Mail size={18} />
                </div>

                <Input
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="username"
                  className="pl-10 w-full bg-slate-50 border-slate-200 rounded-xl py-3 text-sm"
                  disabled={loading}
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Mật khẩu
                </label>

                <Link
                  to="/forgot-password"
                  className="text-xs font-bold text-pet-blue"
                >
                  Quên mật khẩu?
                </Link>
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Lock size={18} />
                </div>

                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  className="pl-10 pr-10 w-full bg-slate-50 border-slate-200 rounded-xl py-3 text-sm"
                  disabled={loading}
                />

                <button
                  type="button"
                  onClick={() => {
                    console.log("👁️ PASSWORD VISIBILITY TOGGLE");

                    setShowPassword((prev) => !prev);
                  }}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* REMEMBER LOGIN */}
            <div className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 accent-pet-blue rounded"
              />

              <label className="ml-2 text-xs text-slate-500 font-bold">
                Duy trì đăng nhập
              </label>
            </div>

            {/* =================================================
                DEBUG SUBMIT BUTTON
            ================================================== */}

            <button
              type="submit"
              disabled={loading}
              onClick={handleButtonClick}
              className="w-full bg-pet-blue text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2"
            >
              {loading ? "Đang đăng nhập..." : "Đăng Nhập"}

              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          {/* FOOTER */}
          <div className="text-center mt-8 pt-6 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              Chưa có tài khoản?{" "}
              <Link to="/register" className="text-pet-orange font-bold">
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================
          RIGHT VISUAL
      ====================================================== */}
      <div className="hidden lg:col-span-7 lg:flex relative bg-slate-900 items-center justify-center p-12 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=1200"
          className="absolute inset-0 w-full h-full object-cover opacity-35"
          alt="Pet Spa Visual background"
        />

        <div className="absolute inset-0 bg-gradient-to-tr from-pet-blue/90 via-slate-900/80" />

        <div className="relative z-10 text-white max-w-md">
          <h3 className="text-4xl font-black uppercase">
            Nơi Boss tận hưởng <br />
            <span className="text-pet-orange">Spa đẳng cấp</span>
          </h3>

          <p className="text-sm mt-4 text-slate-200">
            Hệ sinh thái chăm sóc thú cưng toàn diện.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
