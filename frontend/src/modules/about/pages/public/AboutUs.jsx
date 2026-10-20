import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../../shared/components/Button.jsx";
import CoreValues from "../../components/CoreValues.jsx";
import TeamSection from "../../components/TeamSection.jsx";
import PetCompanions3D from "../../components/PetCompanions3D.jsx";

const AboutUs = () => {
  const navigate = useNavigate();

  return (
    <div className="about-us-container max-w-7xl mx-auto px-4 py-12">
      {/* SECTION 1: Hero Story */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
        {/* Nội dung thương hiệu */}
        <div className="text-left space-y-6">
          <span className="bg-pet-blue/10 text-pet-blue text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider inline-block">
            Câu chuyện thương hiệu 🐾
          </span>

          <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight uppercase leading-tight">
            Nơi Trao Gửi <br />
            <span className="text-pet-orange">Trọn Vẹn Yêu Thương</span>
          </h1>

          <p className="text-slate-600 font-medium leading-relaxed">
            Được thành lập từ niềm đam mê lớn lao với thế giới thú cưng, chúng
            tôi tự hào xây dựng một hệ sinh thái chăm sóc toàn diện chuẩn hóa
            cao từ dịch vụ Spa dưỡng sinh đến chuỗi cung ứng sản phẩm thiết yếu
            chính hãng.
          </p>

          <p className="text-slate-500 text-sm leading-relaxed">
            Tại đây, mỗi chú cún, chú mèo không đơn thuần là thú nuôi, các bé là
            những thành viên gia đình xứng đáng nhận được sự tôn trọng và những
            điều tuyệt vời nhất.
          </p>

          <div className="pt-2 flex flex-wrap gap-4">
            <Button
              variant="primary"
              onClick={() => navigate("/spa")}
              className="bg-pet-blue hover:bg-blue-600 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-sm"
            >
              Đặt Dịch Vụ Ngay
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate("/shop")}
              className="border-2 border-slate-200 text-slate-700 hover:bg-slate-50 font-bold px-6 py-3 rounded-xl transition-all"
            >
              Ghé Cửa Hàng
            </Button>
          </div>
        </div>

        {/* Chó và mèo 3D tương tác */}
        <div className="relative flex justify-center items-center min-w-0">
          <div className="absolute inset-8 bg-pet-blue/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 w-full min-w-0">
            <PetCompanions3D
              height={440}
              className="border border-white shadow-xl"
            />
          </div>

          <div className="absolute top-2 right-2 w-24 h-24 bg-pet-orange/10 rounded-full blur-2xl pointer-events-none" />
        </div>
      </div>

      {/* SECTION 2: Triết lý và giá trị cốt lõi */}
      <CoreValues />

      {/* SECTION 3: Đội ngũ chuyên gia */}
      <TeamSection />
    </div>
  );
};

export default AboutUs;
