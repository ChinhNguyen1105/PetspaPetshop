import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  PawPrint,
  CalendarCheck,
  ShieldCheck,
  Heart,
} from "lucide-react";

import { Input } from "../../../shared/components/Input.jsx";
import { useAuthStore } from "../store/authStore.js";
import authValidator from "../validators/authValidator.js";

const { validateLoginForm } = authValidator;

const Login = () => {
  const navigate = useNavigate();

  const loginAction = useAuthStore(
    (state) => state.loginAction || state.login || state.actions?.loginAction,
  );

  const loading = useAuthStore((state) => state.loading);
  const authError = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    clearError?.();
    setValidationError("");
  }, [clearError]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    clearError?.();
    setValidationError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    clearError?.();
    setValidationError("");

    let validation;

    try {
      validation = validateLoginForm(formData);
    } catch (error) {
      setValidationError(
        error instanceof Error ? error.message : "Không thể kiểm tra dữ liệu.",
      );
      return;
    }

    if (!validation?.isValid) {
      setValidationError(
        validation?.message || "Thông tin đăng nhập không hợp lệ.",
      );
      return;
    }

    if (typeof loginAction !== "function") {
      setValidationError(
        "Hệ thống xác thực chưa sẵn sàng. Vui lòng thử lại sau.",
      );
      return;
    }

    try {
      const credentials = {
        email: formData.email.trim(),
        password: formData.password,
      };

      const result = await loginAction(credentials);

      if (!result?.success) {
        return;
      }

      if (["ROLE_ADMIN", "ROLE_STAFF"].includes(result.role)) {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (error) {
      setValidationError(
        error instanceof Error
          ? error.message
          : "Đăng nhập xảy ra lỗi không xác định.",
      );
    }
  };

  return (
    <div className="min-h-screen bg-white lg:grid lg:grid-cols-2">
      {/* LOGIN FORM */}
      <section className="flex min-h-screen items-start justify-center px-6 pt-15 sm:px-10 lg:px-14 xl:px-20">
        <div className="w-full max-w-md -translate-y-2 lg:-translate-y-3">
          {/* BRAND
          <Link
            to="/"
            className="mb-10 inline-flex items-center gap-3"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pet-blue text-white">
              <PawPrint size={25} />
            </div>

            <div>
              <p className="text-xl font-bold tracking-tight text-slate-800">
                Pet<span className="text-pet-orange">Spa</span>
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                Chăm sóc thú cưng tận tâm
              </p>
            </div>
          </Link> */}

          {/* HEADING */}
          <div className="mb-8">
            <p className="mb-2 text-sm font-semibold text-pet-blue">
              Chào mừng bạn trở lại
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Đăng nhập
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Đăng nhập để quản lý lịch hẹn, theo dõi dịch vụ và mua sắm cho thú
              cưng của bạn.
            </p>
          </div>

          {/* ERROR */}
          {(validationError || authError) && (
            <div
              role="alert"
              className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {validationError || authError}
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* EMAIL */}
            <div>
              <label
                htmlFor="login-email"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Địa chỉ email
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <Input
                  id="login-email"
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="username"
                  disabled={loading}
                  className="w-full rounded-lg border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition-colors focus:border-pet-blue focus:ring-2 focus:ring-pet-blue/15"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label
                  htmlFor="login-password"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Mật khẩu
                </label>

                <Link
                  to="/forgot-password"
                  onClick={() => clearError?.()}
                  className="text-sm font-medium text-pet-blue hover:underline"
                >
                  Quên mật khẩu?
                </Link>
              </div>

              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <Input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Nhập mật khẩu"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  disabled={loading}
                  className="w-full rounded-lg border border-slate-300 bg-white py-3 pl-11 pr-12 text-sm text-slate-800 outline-none transition-colors focus:border-pet-blue focus:ring-2 focus:ring-pet-blue/15"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  aria-pressed={showPassword}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-pet-blue"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* REMEMBER LOGIN */}
            <label className="flex cursor-pointer items-center gap-2.5">
              <input
                type="checkbox"
                name="rememberMe"
                className="h-4 w-4 rounded border-slate-300 accent-pet-blue"
              />

              <span className="text-sm text-slate-600">Duy trì đăng nhập</span>
            </label>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-pet-blue px-4 py-3.5 font-semibold text-white transition-colors hover:bg-pet-blue/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Đang đăng nhập...
                </>
              ) : (
                <>
                  Đăng nhập
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* REGISTER */}
          <p className="mt-7 text-center text-sm text-slate-600">
            Chưa có tài khoản?{" "}
            <Link
              to="/register"
              onClick={() => clearError?.()}
              className="font-semibold text-pet-orange hover:underline"
            >
              Đăng ký ngay
            </Link>
          </p>

          {/* SECURITY NOTE */}
          <div className="mt-8 flex items-center justify-center gap-2 border-t border-slate-100 pt-5 text-xs text-slate-500">
            <ShieldCheck size={16} className="text-pet-blue" />
            Bảo mật thông tin tài khoản của bạn
          </div>
        </div>
      </section>

      {/* BRAND IMAGE PANEL */}
      <section className="relative hidden min-h-screen overflow-hidden bg-pet-blue lg:block">
        <img
          src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=1800"
          alt="Chó và thú cưng tại PetSpa"
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Solid brand overlay */}
        <div className="absolute inset-0 bg-pet-blue/75" />

        <div className="relative flex min-h-screen flex-col justify-between p-10 text-white xl:p-14">
          {/* BRAND LABEL */}
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/40">
              <PawPrint size={23} />
            </div>

            <div>
              <p className="font-bold tracking-wide">PetSpa</p>
              <p className="text-xs text-white/80">Chăm sóc thú cưng</p>
            </div>
          </div>

          {/* MAIN CONTENT */}
          <div className="max-w-lg py-12">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.15em] text-white/80">
              Dịch vụ chăm sóc thú cưng
            </p>

            <h2 className="text-4xl font-bold leading-tight xl:text-5xl">
              Chăm sóc tận tâm.
              <br />
              Đồng hành dài lâu.
            </h2>

            <p className="mt-5 max-w-md text-base leading-7 text-white/90">
              Từ làm đẹp, chăm sóc sức khỏe đến lưu trú, PetSpa luôn hướng đến
              sự an toàn và thoải mái cho từng thú cưng.
            </p>

            {/* SERVICE INFORMATION */}
            <div className="mt-9 space-y-4 border-t border-white/30 pt-6">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white/15">
                  <Heart size={22} />
                </div>

                <div>
                  <p className="font-semibold">Chăm sóc bằng sự tận tâm</p>
                  <p className="mt-1 text-sm leading-6 text-white/80">
                    Quan tâm đến nhu cầu và trải nghiệm của từng boss.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white/15">
                  <CalendarCheck size={22} />
                </div>

                <div>
                  <p className="font-semibold">Đặt lịch thuận tiện</p>
                  <p className="mt-1 text-sm leading-6 text-white/80">
                    Dễ dàng theo dõi và quản lý các lịch hẹn chăm sóc.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="border-t border-white/30 pt-5 text-sm text-white/80">
            PetSpa — Người bạn đồng hành của thú cưng và gia đình bạn.
          </div>
        </div>
      </section>
    </div>
  );
};

export default Login;
