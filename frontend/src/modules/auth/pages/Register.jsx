import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  CheckCircle2,
  UserRound,
  ShieldCheck,
  PawPrint,
} from "lucide-react";

import { Button } from "../../../shared/components/Button.jsx";
import { Input } from "../../../shared/components/Input.jsx";
import { useAuthStore } from "../store/authStore.js";
import { validateRegisterForm } from "../validators/authValidator.js";
import HeroPets3D from "../../home/components/HeroPets3D.jsx";

const Register = () => {
  const navigate = useNavigate();

  const loading = useAuthStore((state) => state.loading);
  const serverError = useAuthStore((state) => state.error);
  const registerAction = useAuthStore((state) => state.registerAction);
  const loginAction = useAuthStore((state) => state.loginAction);
  const clearError = useAuthStore((state) => state.clearError);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setValidationError("");
    clearError?.();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setValidationError("");
    clearError?.();

    let validation;

    try {
      validation = validateRegisterForm(formData);
    } catch (error) {
      setValidationError(
        error instanceof Error
          ? error.message
          : "Không thể kiểm tra thông tin đăng ký.",
      );
      return;
    }

    if (!validation?.isValid) {
      setValidationError(
        validation?.message || "Vui lòng kiểm tra lại thông tin đăng ký.",
      );
      return;
    }

    if (
      typeof registerAction !== "function" ||
      typeof loginAction !== "function"
    ) {
      setValidationError(
        "Hệ thống xác thực chưa sẵn sàng. Vui lòng thử lại sau.",
      );
      return;
    }

    const submitData = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password,
      confirmPassword: formData.confirmPassword,
    };

    try {
      const registerResult = await registerAction(submitData);

      if (!registerResult?.success) {
        return;
      }

      const loginResult = await loginAction({
        email: submitData.email,
        password: submitData.password,
      });

      if (!loginResult?.success) {
        navigate("/login", { replace: true });
        return;
      }

      setIsSuccess(true);

      await new Promise((resolve) => setTimeout(resolve, 1800));

      navigate("/", { replace: true });
    } catch (error) {
      setValidationError(
        error instanceof Error
          ? error.message
          : "Đăng ký không thành công. Vui lòng thử lại.",
      );
    }
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-10">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-pet-blue/10 text-pet-blue">
            <CheckCircle2 size={34} />
          </div>

          <h2 className="mt-6 text-2xl font-bold text-slate-900">
            Đăng ký thành công!
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Chào mừng bạn đến với{" "}
            <span className="font-semibold text-pet-blue">PetSpa</span>. Tài
            khoản của bạn đã sẵn sàng.
          </p>

          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-500">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-pet-blue" />
            Đang chuyển đến trang chủ...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white lg:grid lg:grid-cols-2">
      {/* REGISTER FORM */}
      <section className="flex min-h-screen items-center justify-center px-6 py-10 sm:px-10 lg:px-14 xl:px-20">
        <div className="w-full max-w-md">
          {/* BRAND
          <Link to="/" className="mb-8 inline-flex items-center gap-3">
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
          <div className="mb-7">
            <p className="mb-2 text-sm font-semibold text-pet-blue">
              Trở thành thành viên PetSpa
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Tạo tài khoản
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Tạo tài khoản để đặt lịch chăm sóc, theo dõi dịch vụ và quản lý
              thông tin thú cưng của bạn.
            </p>
          </div>

          {/* ERROR */}
          {(validationError || serverError) && (
            <div
              role="alert"
              className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700"
            >
              {validationError || serverError}
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* NAME */}
            <div>
              <label
                htmlFor="register-name"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Họ và tên
              </label>

              <div className="relative">
                <UserRound
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <Input
                  id="register-name"
                  type="text"
                  name="name"
                  placeholder="Nguyễn Văn A"
                  value={formData.name}
                  onChange={handleChange}
                  autoComplete="name"
                  disabled={loading}
                  className="w-full rounded-lg border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition-colors focus:border-pet-blue focus:ring-2 focus:ring-pet-blue/15"
                />
              </div>
            </div>

            {/* EMAIL */}
            <div>
              <label
                htmlFor="register-email"
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
                  id="register-email"
                  type="email"
                  name="email"
                  placeholder="bossyeu@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  disabled={loading}
                  className="w-full rounded-lg border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition-colors focus:border-pet-blue focus:ring-2 focus:ring-pet-blue/15"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <label
                htmlFor="register-password"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Mật khẩu
              </label>

              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <Input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Nhập mật khẩu"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  disabled={loading}
                  className="w-full rounded-lg border border-slate-300 bg-white py-3 pl-11 pr-12 text-sm text-slate-800 outline-none transition-colors focus:border-pet-blue focus:ring-2 focus:ring-pet-blue/15"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-pet-blue"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* CONFIRM PASSWORD */}
            <div>
              <label
                htmlFor="register-confirm-password"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Nhập lại mật khẩu
              </label>

              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <Input
                  id="register-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Nhập lại mật khẩu"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  disabled={loading}
                  className="w-full rounded-lg border border-slate-300 bg-white py-3 pl-11 pr-12 text-sm text-slate-800 outline-none transition-colors focus:border-pet-blue focus:ring-2 focus:ring-pet-blue/15"
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={
                    showConfirmPassword
                      ? "Ẩn mật khẩu xác nhận"
                      : "Hiện mật khẩu xác nhận"
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-pet-blue"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* SUBMIT */}
            <Button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-pet-orange px-4 py-3.5 font-semibold text-white transition-colors hover:bg-pet-orange/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
              {!loading && <ArrowRight size={18} />}
            </Button>
          </form>

          {/* LOGIN LINK */}
          <p className="mt-6 border-t border-slate-100 pt-5 text-center text-sm text-slate-600">
            Bạn đã có tài khoản?{" "}
            <Link
              to="/login"
              onClick={() => clearError?.()}
              className="font-semibold text-pet-blue hover:underline"
            >
              Đăng nhập ngay
            </Link>
          </p>

          {/* SECURITY */}
          <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-500">
            <ShieldCheck size={16} className="text-pet-blue" />
            Thông tin của bạn được bảo vệ an toàn
          </div>
        </div>
      </section>

      {/* 3D PET PANEL */}
      <section className="relative hidden min-h-screen flex-col overflow-hidden bg-slate-50 lg:flex">
        {/* BRAND HEADER */}
        <div className="relative z-10 flex items-center justify-between border-b border-slate-200 bg-white px-8 py-5 xl:px-12">
          <div>
            <p className="text-sm font-bold text-slate-800">
              Pet<span className="text-pet-orange">Spa</span>
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Dịch vụ chăm sóc thú cưng
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <span className="h-2 w-2 rounded-full bg-pet-orange" />
            Chào mừng thành viên mới
          </div>
        </div>

        {/* 3D SCENE */}
        <div className="relative flex flex-1 flex-col justify-center px-5 py-8 xl:px-10">
          <div className="mx-auto w-full max-w-2xl">
            <div className="mb-1 text-center">
              <p className="text-sm font-semibold text-pet-blue">
                Cùng bắt đầu hành trình
              </p>

              <h2 className="mt-2 text-3xl font-bold leading-tight text-slate-900 xl:text-4xl">
                Chăm sóc tốt hơn,
                <br />
                yêu thương nhiều hơn.
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
                Tạo tài khoản để đặt lịch, theo dõi dịch vụ và chăm sóc người
                bạn bốn chân thuận tiện hơn.
              </p>
            </div>

            <div className="mt-2 h-[340px] w-full sm:h-[390px] xl:h-[430px]">
              <HeroPets3D />
            </div>

            {/* SERVICE BENEFITS */}
            <div className="mx-auto grid max-w-lg grid-cols-2 gap-3">
              <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-pet-blue/10 text-pet-blue">
                  <PawPrint size={20} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Chăm sóc tận tâm
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Dịch vụ dành riêng cho thú cưng.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-pet-orange/10 text-pet-orange">
                  <ShieldCheck size={20} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    An tâm sử dụng
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Quản lý lịch hẹn thuận tiện.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="border-t border-slate-200 bg-white px-8 py-4 text-center text-xs text-slate-500">
          PetSpa — Người bạn đồng hành của thú cưng và gia đình bạn.
        </div>
      </section>
    </div>
  );
};

export default Register;
