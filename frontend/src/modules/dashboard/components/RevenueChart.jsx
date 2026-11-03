import React, { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { TrendingUp, ShoppingBag, Sparkles, Calendar } from "lucide-react";
import { formatPrice } from "../../../shared/utils/formatPrice";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-xl border border-gray-100 min-w-[220px]">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
          Thời gian: {label}
        </p>
        {payload.map((entry, index) => (
          <div
            key={`item-${index}`}
            className="flex items-center justify-between py-1 border-b border-gray-50 last:border-none"
          >
            <span className="flex items-center gap-2 text-xs font-semibold text-gray-600">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              {entry.name}:
            </span>
            <span className="text-sm font-black text-gray-800">
              {formatPrice(entry.value)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const RevenueChart = ({ orders = [], revenueData }) => {
  const [viewMode, setViewMode] = useState("date"); // "date" hoặc "month"

  // Xử lý dữ liệu thật từ mảng orders dựa trên createdDate và totalAmount
  const chartData = useMemo(() => {
    if (!orders || orders.length === 0) return [];

    const grouped = {};

    orders.forEach((order) => {
      if (!order.createdDate) return;

      const dateObj = new Date(order.createdDate);

      // Key gom nhóm theo Ngày (DD/MM) hoặc Tháng (MM/YYYY)
      const key =
        viewMode === "date"
          ? `${String(dateObj.getDate()).padStart(2, "0")}/${String(dateObj.getMonth() + 1).padStart(2, "0")}`
          : `Tháng ${dateObj.getMonth() + 1}/${dateObj.getFullYear()}`;

      if (!grouped[key]) {
        grouped[key] = {
          name: key,
          shop: 0,
          spa: 0,
          timestamp: dateObj.getTime(),
        };
      }

      const amount = Number(order.totalAmount) || 0;

      // Phân loại dựa trên orderType ("PRODUCT" -> shop, ngược lại hoặc dịch vụ -> spa)
      if (order.orderType === "PRODUCT") {
        grouped[key].shop += amount;
      } else {
        grouped[key].spa += amount;
      }
    });

    // Chuyển đổi object thành array và sắp xếp theo thời gian tăng dần
    return Object.values(grouped).sort((a, b) => a.timestamp - b.timestamp);
  }, [orders, viewMode]);

  const shopRevenue = revenueData?.shopRevenue || 0;
  const spaRevenue = revenueData?.spaRevenue || 0;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-pet-blue">
              Biểu đồ tăng trưởng doanh thu thực tế
            </h2>
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
              <TrendingUp size={12} /> Live API
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Thống kê doanh thu tự động phân tích từ dữ liệu đơn hàng hệ thống
          </p>
        </div>

        {/* CONTROLS */}
        <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setViewMode("date")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              viewMode === "date"
                ? "bg-white text-pet-blue shadow-sm"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Theo Ngày
          </button>
          <button
            onClick={() => setViewMode("month")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              viewMode === "month"
                ? "bg-white text-pet-blue shadow-sm"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Theo Tháng
          </button>
        </div>
      </div>

      {/* QUICK STATS LEGEND */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50/50 border border-blue-100/50">
          <div className="p-2 rounded-lg bg-blue-500 text-white shadow-sm">
            <Sparkles size={18} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500">
              Doanh thu Spa (Tổng API)
            </p>
            <p className="text-sm font-black text-gray-800">
              {formatPrice(spaRevenue)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl bg-orange-50/50 border border-orange-100/50">
          <div className="p-2 rounded-lg bg-pet-orange text-white shadow-sm">
            <ShoppingBag size={18} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500">
              Doanh thu Shop (Tổng API)
            </p>
            <p className="text-sm font-black text-gray-800">
              {formatPrice(shopRevenue)}
            </p>
          </div>
        </div>
      </div>

      {/* ANIMATED AREA CHART */}
      <div className="h-[300px] w-full">
        {chartData.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm gap-2">
            <Calendar size={32} className="opacity-40" />
            <span>Chưa có dữ liệu biểu đồ cho khoảng thời gian này.</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorSpa" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorShop" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F97316" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#F97316" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#F3F4F6"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9CA3AF", fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9CA3AF", fontSize: 12 }}
                tickFormatter={(val) =>
                  `${val >= 1000000 ? (val / 1000000).toFixed(1) + "M" : val / 1000 + "k"}`
                }
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="spa"
                name="Dịch vụ Spa"
                stroke="#3B82F6"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorSpa)"
                isAnimationActive={true}
                animationDuration={1500}
                animationEasing="ease-in-out"
              />
              <Area
                type="monotone"
                dataKey="shop"
                name="Sản phẩm Shop"
                stroke="#F97316"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorShop)"
                isAnimationActive={true}
                animationDuration={1800}
                animationEasing="ease-in-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default RevenueChart;
