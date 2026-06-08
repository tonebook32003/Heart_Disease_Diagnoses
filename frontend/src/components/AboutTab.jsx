import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bot,
  BrainCircuit,
  Database,
  FileText,
  GitBranch,
  HeartPulse,
  LineChart,
  Network,
  ShieldCheck,
  SlidersHorizontal,
  Stethoscope,
} from "lucide-react";

const overviewStats = [
  {
    value: "918",
    label: "hồ sơ dữ liệu",
    detail: "Heart Failure Prediction Dataset",
  },
  {
    value: "11",
    label: "đặc trưng đầu vào",
    detail: "lâm sàng, ECG và gắng sức",
  },
  { value: "4", label: "mô hình ML", detail: "so sánh trong cùng một API" },
  {
    value: "PDF + AI",
    label: "báo cáo hỗ trợ",
    detail: "xuất kết quả và giải thích bằng chatbot",
  },
];

const capabilities = [
  {
    icon: HeartPulse,
    title: "Ước tính nguy cơ",
    text: "Trả về phần trăm nguy cơ bệnh tim từ dữ liệu người dùng nhập.",
  },
  {
    icon: Network,
    title: "So sánh mô hình",
    text: "Đối chiếu Decision Tree, Naive Bayes, SVM và Random Forest.",
  },
  {
    icon: LineChart,
    title: "Phân tích hiệu năng",
    text: "Theo dõi Accuracy, Precision, Recall, F1-score, ROC-AUC và Confusion Matrix.",
  },
  {
    icon: Database,
    title: "Khám phá dữ liệu",
    text: "Xem thống kê mô tả, phân phối đặc trưng và tương quan trong dataset.",
  },
  {
    icon: FileText,
    title: "Báo cáo PDF",
    text: "Xem trước và tải báo cáo gồm dữ liệu nhập, xác suất, yếu tố nguy cơ và khuyến nghị.",
  },
  {
    icon: Bot,
    title: "AI Assistant",
    text: "Giải thích chỉ số, kết quả, thuật ngữ mô hình và cách sử dụng website.",
  },
];

const workflow = [
  {
    icon: Database,
    title: "Dataset",
    text: "Thu thập 918 hồ sơ với 11 đặc trưng và nhãn HeartDisease.",
  },
  {
    icon: SlidersHorizontal,
    title: "Preprocessing",
    text: "Chuẩn hóa biến số và mã hóa biến phân loại trước khi huấn luyện.",
  },
  {
    icon: GitBranch,
    title: "Train/Test Split",
    text: "Tách dữ liệu để đánh giá khách quan khả năng tổng quát hóa.",
  },
  {
    icon: BrainCircuit,
    title: "Train Models",
    text: "Huấn luyện bốn thuật toán và lưu lại bằng Joblib.",
  },
  {
    icon: BarChart3,
    title: "Evaluate",
    text: "Đánh giá bằng metrics, ROC Curve và Confusion Matrix.",
  },
  {
    icon: Activity,
    title: "Serve API",
    text: "Flask backend nạp model và trả kết quả dự đoán cho React UI.",
  },
];

const modelSummaries = [
  {
    name: "Decision Tree",
    role: "Dễ giải thích",
    text: "Chia dữ liệu thành các nhánh quyết định trực quan.",
  },
  {
    name: "Naive Bayes",
    role: "Baseline xác suất",
    text: "Dự đoán nhanh dựa trên giả định độc lập giữa các đặc trưng.",
  },
  {
    name: "SVM",
    role: "Biên phân tách",
    text: "Tìm ranh giới tối ưu giữa nhóm nguy cơ và không nguy cơ.",
  },
  {
    name: "Random Forest",
    role: "Mô hình mặc định",
    text: "Kết hợp nhiều cây quyết định để tăng độ ổn định.",
  },
];

const featureGroups = [
  { title: "Thông tin cơ bản", items: ["Age", "Sex"] },
  { title: "Triệu chứng", items: ["ChestPainType", "ExerciseAngina"] },
  {
    title: "Chỉ số lâm sàng",
    items: ["RestingBP", "Cholesterol", "FastingBS"],
  },
  {
    title: "ECG và gắng sức",
    items: ["RestingECG", "MaxHR", "Oldpeak", "ST_Slope"],
  },
];

export default function AboutTab() {
  return (
    <div className="tab-pane fade-in">
      <div className="about-dashboard">
        <section className="about-overview">
          <div className="about-overview-copy">
            <div className="about-eyebrow">
              <span className="about-pulse-dot"></span>
              Data Mining Project
            </div>
            <h1>SmartHeartDiagnosis</h1>
            <p>
              Dashboard hỗ trợ ước tính phần trăm nguy cơ bệnh tim từ 11 chỉ số
              lâm sàng, kết hợp mô hình học máy, phân tích dữ liệu, báo cáo PDF
              và trợ lý AI giải thích kết quả.
            </p>
            <div className="about-badge-row">
              <span>Academic project</span>
              <span>ML-powered</span>
              <span>Not medical diagnosis</span>
            </div>
          </div>

          <div className="about-overview-signal" aria-hidden="true">
            <div className="signal-ring signal-ring-outer"></div>
            <div className="signal-ring signal-ring-middle"></div>
            <div className="signal-core">
              <HeartPulse size={42} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
