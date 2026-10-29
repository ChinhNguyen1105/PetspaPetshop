export const Button = ({
  children,
  variant = "primary",
  size = "md", // Kích thước mặc định
  className = "",
  ...props
}) => {
  const variants = {
    primary:
      "bg-pet-blue text-white hover:bg-opacity-90 shadow-sm shadow-pet-blue/10",
    secondary:
      "bg-pet-orange text-white hover:bg-opacity-90 shadow-sm shadow-pet-orange/10",
    outline:
      "border border-slate-200 text-slate-600 hover:text-pet-blue hover:border-pet-blue/30 hover:bg-pet-blue/5",
  };

  // Định nghĩa các kích thước cơ bản kết hợp responsive linh hoạt
  const sizes = {
    xs: "px-2.5 py-1 text-[11px] sm:text-xs", // Cực nhỏ cho các thẻ tag/nút phụ
    sm: "px-3 py-1.5 text-xs sm:text-sm", // Nhỏ gọn, hợp với card di động 2 cột
    md: "px-4 py-2 sm:px-6 sm:py-2.5 text-xs sm:text-base", // Vừa (Responsive linh hoạt)
    lg: "px-6 py-3 sm:px-8 sm:py-3.5 text-sm sm:text-lg", // Lớn
  };

  return (
    <button
      className={`rounded-xl sm:rounded-full font-bold transition-all duration-300 active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
