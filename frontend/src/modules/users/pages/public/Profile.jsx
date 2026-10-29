import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import ProfileSidebar from "../../components/ProfileSidebar.jsx";
import ProfileInfo from "../../components/ProfileInfo.jsx";
import OrderList from "../../../orders/pages/public/OrderList.jsx";
import PetList from "../../../pets/pages/public/PetList.jsx";
import BookingList from "../../../bookings/pages/public/BookingList.jsx";

const Profile = () => {
  const location = useLocation();

  // Khởi tạo tab mặc định dựa trên state ẩn được truyền sang, nếu không có thì mở 'info'
  const [activeTab, setActiveTab] = useState(
    location.state?.activeTab || "info",
  );

  // Lắng nghe sự thay đổi nếu user đang ở profile mà bấm chuyển hướng (redirect) lại từ trang khác tới
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  // Hàm điều hướng hiển thị component theo tab đang chọn
  const renderTabContent = () => {
    switch (activeTab) {
      case "info":
        return <ProfileInfo />;
      case "orders":
        return <OrderList />;
      case "pets":
        return <PetList />;
      case "bookings":
        return <BookingList />;
      default:
        return <ProfileInfo />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-10 pb-20 text-left">
      <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
        <h1 className="text-3xl font-black text-pet-blue mb-8 uppercase tracking-tight">
          Hồ sơ cá nhân
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
          {/* CỘT TRÁI: SIDEBAR MENU CHUYỂN TAB 
              - Dùng `hidden md:block` để ẨN TRÊN MOBILE và GIỮ NGUYÊN TRÊN PC */}
          <div className="hidden md:block md:col-span-1 sticky top-28">
            <ProfileSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>

          {/* CỘT PHẢI: KHU VỰC HIỂN THỊ NỘI DUNG LINH HOẠT 
              - Trên mobile chiếm trọn 1 cột (w-full), trên PC chiếm 3 cột (md:col-span-3) */}
          <div className="col-span-1 md:col-span-3">
            <div className="w-full transition-all duration-300">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
