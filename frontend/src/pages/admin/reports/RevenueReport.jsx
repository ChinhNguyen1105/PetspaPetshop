import React, { useEffect, useState } from "react";
import {
  DollarSign,
  Calendar,
  ShoppingBag,
  ArrowUpRight,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  FileText,
} from "lucide-react";

import Loading from "../../../components/common/Loading";
import StatCard from "../dashboard/components/StatCard";
import Pagination from "../../../components/common/Pagination";

import { formatPrice } from "../../../utils/formatPrice";
import { useOrderStore } from "../../../store/orderStore";

// ─────────────────────────────────────────────────────────────────────────────
// HELPER
// ─────────────────────────────────────────────────────────────────────────────

const toNumber = (value) => {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
};

// ─────────────────────────────────────────────────────────────────────────────
// PAYMENT STATUS BADGE
// ─────────────────────────────────────────────────────────────────────────────

const getPaymentStatusBadge = (status) => {
  const config = {
    PAID: {
      bg: "bg-emerald-50 text-emerald-600 border-emerald-200",
      icon: <CheckCircle size={13} />,
      text: "Đã thanh toán",
    },

    SUCCESS: {
      bg: "bg-emerald-50 text-emerald-600 border-emerald-200",
      icon: <CheckCircle size={13} />,
      text: "Đã thanh toán",
    },

    PENDING: {
      bg: "bg-orange-50 text-pet-orange border-orange-200",
      icon: <Clock size={13} />,
      text: "Chờ thanh toán",
    },

    UNPAID: {
      bg: "bg-orange-50 text-pet-orange border-orange-200",
      icon: <Clock size={13} />,
      text: "Chưa thanh toán",
    },

    REFUNDED: {
      bg: "bg-purple-50 text-purple-600 border-purple-200",
      icon: <AlertCircle size={13} />,
      text: "Đã hoàn tiền",
    },

    FAILED: {
      bg: "bg-red-50 text-red-600 border-red-200",
      icon: <AlertCircle size={13} />,
      text: "Thanh toán thất bại",
    },
  };

  const target = config[status] || {
    bg: "bg-gray-50 text-gray-600 border-gray-200",
    icon: null,
    text: status || "Không xác định",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${target.bg}`}
    >
      {target.icon}
      {target.text}
    </span>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// NORMALIZE PAYMENT STATUS
// ─────────────────────────────────────────────────────────────────────────────

const normalizePaymentStatus = (status) => {
  if (status === "SUCCESS") {
    return "PAID";
  }

  if (status === "PAID") {
    return "PAID";
  }

  if (status === "PENDING") {
    return "PENDING";
  }

  if (status === "UNPAID") {
    return "UNPAID";
  }

  if (status === "REFUNDED") {
    return "REFUNDED";
  }

  if (status === "FAILED") {
    return "FAILED";
  }

  return status || "PENDING";
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

const RevenueReport = () => {
  // ───────────────────────────────────────────────────────────────────────────
  // ZUSTAND STORE
  // ───────────────────────────────────────────────────────────────────────────

  const {
    orders: rawOrders,
    revenue,
    meta: orderMeta,
    loading: orderLoading,
    fetchOrders,
    fetchRevenue,
    error: storeError,
  } = useOrderStore();

  // ───────────────────────────────────────────────────────────────────────────
  // LOCAL STATE
  // ───────────────────────────────────────────────────────────────────────────

  const [localError, setLocalError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);

  const [pageSize, setPageSize] = useState(10);

  // ───────────────────────────────────────────────────────────────────────────
  // ERROR
  // ───────────────────────────────────────────────────────────────────────────

  const activeError =
    storeError || localError;

  // ───────────────────────────────────────────────────────────────────────────
  // FETCH ORDERS
  //
  // Pagination được xử lý bởi BACKEND.
  // FE chỉ gửi page + pageSize.
  // ───────────────────────────────────────────────────────────────────────────

  const loadOrders = async (
    page = currentPage,
    size = pageSize,
  ) => {
    try {
      setLocalError(null);

      await fetchOrders({
        page,
        pageSize: size,
      });
    } catch (err) {
      console.error(
        "Lỗi tải danh sách đơn hàng:",
        err,
      );

      setLocalError(
        "Không thể tải danh sách giao dịch. Vui lòng thử lại!",
      );
    }
  };

  // ───────────────────────────────────────────────────────────────────────────
  // REFRESH DATA
  // ───────────────────────────────────────────────────────────────────────────

  const handleRefreshData = async () => {
    try {
      setLocalError(null);

      await Promise.all([
        fetchRevenue(),
        fetchOrders({
          page: currentPage,
          pageSize,
        }),
      ]);
    } catch (err) {
      console.error(
        "Lỗi tải dữ liệu báo cáo doanh thu:",
        err,
      );

      setLocalError(
        "Hệ thống không thể đồng bộ dữ liệu báo cáo. Vui lòng thử lại!",
      );
    }
  };

  // ───────────────────────────────────────────────────────────────────────────
  // INITIAL FETCH
  // ───────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    fetchRevenue().catch((err) => {
      console.error(
        "Fetch revenue failed:",
        err,
      );
    });
  }, [fetchRevenue]);

  // ───────────────────────────────────────────────────────────────────────────
  // FETCH ORDER WHEN PAGE / PAGE SIZE CHANGES
  // ───────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    loadOrders(
      currentPage,
      pageSize,
    );
  }, [
    currentPage,
    pageSize,
    fetchOrders,
  ]);

  // ───────────────────────────────────────────────────────────────────────────
  // REVENUE DATA
  //
  // Doanh thu lấy trực tiếp từ:
  // GET /orders/revenue
  // ───────────────────────────────────────────────────────────────────────────

  const totalRevenue = toNumber(
    revenue?.totalRevenue,
  );

  const spaRevenue = toNumber(
    revenue?.spaRevenue,
  );

  const shopRevenue = toNumber(
    revenue?.shopRevenue,
  );

  const paidCount = toNumber(
    revenue?.paidOrders,
  );

  const unpaidCount = toNumber(
    revenue?.unpaidOrders,
  );

  // ───────────────────────────────────────────────────────────────────────────
  // PAGINATION DATA
  //
  // Backend trả:
  // meta.page
  // meta.pageSize
  // meta.pages
  // meta.total
  // ───────────────────────────────────────────────────────────────────────────

  const totalItems = toNumber(
    orderMeta?.total,
  );

  const totalPages = toNumber(
    orderMeta?.pages,
  );

  const displayedPage =
    toNumber(orderMeta?.page) ||
    currentPage;

  // ───────────────────────────────────────────────────────────────────────────
  // CHANGE PAGE
  // ───────────────────────────────────────────────────────────────────────────

  const handlePageChange = (page) => {
    if (
      page < 1 ||
      (totalPages > 0 &&
        page > totalPages)
    ) {
      return;
    }

    setCurrentPage(page);
  };

  // ───────────────────────────────────────────────────────────────────────────
  // CHANGE PAGE SIZE
  // ───────────────────────────────────────────────────────────────────────────

  const handlePageSizeChange = (
    event,
  ) => {
    const newPageSize = Number(
      event.target.value,
    );

    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  // ───────────────────────────────────────────────────────────────────────────
  // LOADING
  // ───────────────────────────────────────────────────────────────────────────

  if (
    orderLoading &&
    (!rawOrders ||
      rawOrders.length === 0)
  ) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loading size="large" />
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // ERROR
  // ───────────────────────────────────────────────────────────────────────────

  if (activeError) {
    return (
      <div className="flex flex-col h-[50vh] items-center justify-center space-y-4 text-center p-6">
        <div className="p-4 bg-red-50 text-red-500 rounded-full">
          <AlertCircle size={40} />
        </div>

        <p className="text-gray-600 font-medium max-w-md">
          {activeError}
        </p>

        <button
          onClick={handleRefreshData}
          className="flex items-center gap-2 px-4 py-2 bg-pet-blue text-white rounded-xl text-sm font-bold shadow-sm hover:bg-opacity-90 transition-all"
        >
          <RefreshCw size={16} />
          Thử lại
        </button>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // RENDER
  // ───────────────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* HEADER */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
            <span>Báo cáo tài chính</span>
          </div>

          <h1 className="text-3xl font-black text-pet-blue tracking-tight flex items-center gap-2">
            <TrendingUp className="text-emerald-500" />
            DOANH THU & KINH DOANH
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Phân tích chi tiết nguồn tiền và theo dõi dòng tiền thanh toán thực
            tế.
          </p>
        </div>

        <button
          onClick={handleRefreshData}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-600 font-bold text-sm rounded-xl shadow-sm hover:bg-gray-50 active:scale-95 transition-all"
        >
          <RefreshCw
            size={15}
            className={
              orderLoading
                ? "animate-spin"
                : ""
            }
          />
          Làm mới dữ liệu
        </button>
      </div>

      {/* REVENUE CARDS */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          title="Doanh thu thực tế (Đã thu)"
          value={formatPrice(
            totalRevenue,
          )}
          icon={DollarSign}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-500"
        />

        <StatCard
          title="Doanh thu mảng Spa"
          value={formatPrice(
            spaRevenue,
          )}
          icon={Calendar}
          iconBg="bg-blue-50"
          iconColor="text-pet-blue"
        />

        <StatCard
          title="Doanh thu mảng Shop"
          value={formatPrice(
            shopRevenue,
          )}
          icon={ShoppingBag}
          iconBg="bg-orange-50"
          iconColor="text-pet-orange"
        />

        <StatCard
          title="Tổng số đơn"
          value={`${totalItems} hóa đơn`}
          icon={FileText}
          iconBg="bg-purple-50"
          iconColor="text-purple-500"
        />
      </div>

      {/* CASH FLOW */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PAID */}

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-wider">
            Cơ cấu dòng tiền về
          </h3>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-black text-gray-800">
                {paidCount}
              </div>

              <div className="text-xs text-gray-400 font-medium">
                Hóa đơn thu tiền thành công
              </div>
            </div>

            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500">
              <ArrowUpRight size={24} />
            </div>
          </div>

          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden flex">
            <div
              className="bg-emerald-500 h-full"
              style={{
                width: `${
                  (paidCount /
                    Math.max(
                      1,
                      paidCount +
                        unpaidCount,
                    )) *
                  100
                }%`,
              }}
            />
          </div>
        </div>

        {/* UNPAID */}

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-wider">
            Dòng công nợ chờ xử lý
          </h3>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-black text-gray-800">
                {unpaidCount}
              </div>

              <div className="text-xs text-gray-400 font-medium">
                Hóa đơn chưa/chờ thanh toán
              </div>
            </div>

            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-pet-orange">
              <Clock size={22} />
            </div>
          </div>

          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-pet-orange h-full"
              style={{
                width: `${
                  (unpaidCount /
                    Math.max(
                      1,
                      paidCount +
                        unpaidCount,
                    )) *
                  100
                }%`,
              }}
            />
          </div>
        </div>

        {/* SPA / SHOP */}

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-wider">
            Tỷ trọng Spa / Cửa hàng
          </h3>

          <div className="flex justify-between items-center text-xs font-bold text-gray-600">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-pet-blue rounded-full"></span>
              Spa
            </span>

            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-pet-orange rounded-full"></span>
              Cửa hàng
            </span>
          </div>

          <div className="w-full bg-gray-100 h-4 rounded-xl overflow-hidden flex">
            <div
              className="bg-pet-blue h-full"
              style={{
                width: `${
                  (spaRevenue /
                    Math.max(
                      1,
                      totalRevenue,
                    )) *
                  100
                }%`,
              }}
            />

            <div
              className="bg-pet-orange h-full"
              style={{
                width: `${
                  (shopRevenue /
                    Math.max(
                      1,
                      totalRevenue,
                    )) *
                  100
                }%`,
              }}
            />
          </div>

          <div className="text-center text-[11px] text-gray-400 font-medium">
            Biểu đồ thể hiện tỷ lệ đóng góp doanh thu sạch
          </div>
        </div>
      </div>

      {/* TRANSACTION TABLE */}

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-lg font-black text-pet-blue flex items-center gap-2">
            <span className="w-2 h-5 bg-pet-blue rounded-full"></span>
            Nhật ký dòng tiền và chi tiết hóa đơn hệ thống
          </h2>

          <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
            <span>Hiển thị:</span>

            <select
              value={pageSize}
              onChange={
                handlePageSizeChange
              }
              className="px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 focus:outline-none focus:border-pet-blue"
            >
              <option value={5}>
                5 hàng
              </option>

              <option value={10}>
                10 hàng
              </option>

              <option value={20}>
                20 hàng
              </option>

              <option value={50}>
                50 hàng
              </option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead>
              <tr className="bg-gray-50 text-gray-400 text-xs uppercase font-black tracking-wider border-b border-gray-100">
                <th className="p-4">
                  Mã giao dịch
                </th>

                <th className="p-4">
                  Khách hàng
                </th>

                <th className="p-4">
                  Nguồn doanh thu
                </th>

                <th className="p-4">
                  Thời gian tạo
                </th>

                <th className="p-4 text-center">
                  Trạng thái tiền
                </th>

                <th className="p-4 text-right">
                  Tổng số tiền
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {!rawOrders ||
              rawOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="p-12 text-center text-gray-400"
                  >
                    <FileText
                      size={36}
                      className="mx-auto mb-2 text-gray-300"
                    />

                    Không có bản ghi hóa đơn nào.
                  </td>
                </tr>
              ) : (
                rawOrders
                  .filter(
                    (order) =>
                      order.orderType ===
                        "PRODUCT" ||
                      order.orderType ===
                        "BOOKING",
                  )
                  .map((order) => {
                    const isShop =
                      order.orderType ===
                      "PRODUCT";

                    const paymentStatus =
                      normalizePaymentStatus(
                        order.paymentStatus,
                      );

                    return (
                      <tr
                        key={`${isShop ? "SHOP" : "SPA"}_${order.id}`}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="p-4">
                          <span
                            className={`font-mono text-xs font-bold px-2 py-1 rounded ${
                              isShop
                                ? "text-pet-orange bg-orange-50"
                                : "text-pet-blue bg-blue-50"
                            }`}
                          >
                            {isShop
                              ? `ORD#${order.id}`
                              : `BK#${order.id}`}
                          </span>
                        </td>

                        <td className="p-4 font-bold text-gray-800">
                          {order.shippingName ||
                            "—"}
                        </td>

                        <td className="p-4">
                          <span
                            className={`text-xs font-bold px-2.5 py-0.5 rounded-md border ${
                              isShop
                                ? "bg-orange-50/30 text-pet-orange border-orange-100"
                                : "bg-blue-50/30 text-pet-blue border-blue-100"
                            }`}
                          >
                            {isShop
                              ? "Sản phẩm"
                              : "Dịch vụ Spa"}
                          </span>
                        </td>

                        <td className="p-4 text-gray-400 font-medium text-xs">
                          {order.createdDate
                            ? new Date(
                                order.createdDate,
                              ).toLocaleString(
                                "vi-VN",
                              )
                            : "—"}
                        </td>

                        <td className="p-4 text-center">
                          {getPaymentStatusBadge(
                            paymentStatus,
                          )}
                        </td>

                        <td className="p-4 text-right font-black text-gray-900 text-base">
                          {formatPrice(
                            toNumber(
                              order.totalAmount,
                            ),
                          )}
                        </td>
                      </tr>
                    );
                  })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION BACKEND */}

        {totalItems > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-gray-100 gap-4">
            <div className="text-xs font-bold text-gray-400">
              Hiển thị từ{" "}
              <span className="text-gray-700">
                {(displayedPage - 1) *
                  pageSize +
                  1}
              </span>{" "}
              đến{" "}
              <span className="text-gray-700">
                {Math.min(
                  displayedPage *
                    pageSize,
                  totalItems,
                )}
              </span>{" "}
              trong tổng số{" "}
              <span className="text-pet-blue">
                {totalItems}
              </span>{" "}
              bản ghi
            </div>

            <Pagination
              currentPage={displayedPage}
              totalPages={totalPages}
              onPageChange={
                handlePageChange
              }
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default RevenueReport;
