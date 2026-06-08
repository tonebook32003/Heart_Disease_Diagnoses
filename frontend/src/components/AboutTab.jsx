import { Heart, Cpu, Database, Award } from 'lucide-react';

export default function AboutTab() {
  return (
    <div className="tab-pane fade-in">
      <div className="hero-banner">
        <Heart className="hero-heart-icon" />
        <div className="hero-content">
          <h1>Hệ Thống Hỗ Trợ Chẩn Đoán & Điều Trị Bệnh Tim</h1>
          <p>Ứng dụng khai thác dữ liệu hỗ trợ chẩn đoán nguy cơ bệnh mạch vành dựa trên các dấu hiệu lâm sàng và chỉ số xét nghiệm.</p>
        </div>
      </div>

      {/* <div className="warning-box">
        <ShieldAlert className="warning-icon" />
        <div className="warning-text">
          <h4>
            <Info size={18} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} /> 
            Khuyến Cáo Y Khoa (Medical Disclaimer)
          </h4>
          <p>
            Ứng dụng này là sản phẩm nghiên cứu học thuật thuộc môn học Khai thác dữ liệu. Kết quả dự đoán và các khuyến nghị điều trị chỉ mang tính chất tham khảo cho nhân viên y tế, không thể thay thế cho các chẩn đoán lâm sàng, xét nghiệm chuyên sâu và quyết định của bác sĩ chuyên khoa tim mạch.
          </p>
        </div>
      </div> */}
    </div>
  );
}
