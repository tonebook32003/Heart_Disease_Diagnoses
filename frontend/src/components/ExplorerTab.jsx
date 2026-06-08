import React, { useEffect, useState } from "react";
import { getDatasetStats } from "../utils/api";
import {
  Database,
  Users,
  Heart,
  AlertCircle,
  RefreshCw,
  Activity,
  BarChart3,
  BrainCircuit,
  GitBranch,
  SlidersHorizontal,
} from "lucide-react";

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

export default function ExplorerTab() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDatasetStats();
      setStats(data);
    } catch (err) {
      console.error(err);
      setError(
        "Không thể kết nối đến máy chủ API hoặc dữ liệu chưa được huấn luyện.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const loadStats = async () => {
      try {
        const data = await getDatasetStats();
        if (!cancelled) {
          setStats(data);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError(
            "Không thể kết nối đến máy chủ API hoặc dữ liệu chưa được huấn luyện.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadStats();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <RefreshCw className="loading-spinner" />
        <p>Đang tải thống kê dữ liệu từ máy chủ...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <AlertCircle size={40} className="icon-red" />
        <p className="error-msg">{error}</p>
        <button className="btn btn-primary" onClick={fetchStats}>
          Thử Lại
        </button>
      </div>
    );
  }

  if (!stats) return null;

  // Pie chart calculation helper
  const renderDonut = (title, dataMap, colors, labelMap = {}) => {
    const keys = Object.keys(dataMap);
    const values = Object.values(dataMap);
    const total = values.reduce((sum, val) => sum + val, 0);

    let cumulativePercent = 0;
    const slices = keys.map((key, index) => {
      const val = dataMap[key];
      const percent = (val / total) * 100;
      const startPercent = cumulativePercent;
      cumulativePercent += percent;

      // Calculate SVG stroke coordinates
      const x1 = Math.cos(2 * Math.PI * (startPercent / 100));
      const y1 = Math.sin(2 * Math.PI * (startPercent / 100));
      const x2 = Math.cos(2 * Math.PI * (cumulativePercent / 100));
      const y2 = Math.sin(2 * Math.PI * (cumulativePercent / 100));

      const largeArc = percent > 50 ? 1 : 0;

      const pathData = [
        `M ${x1} ${y1}`,
        `A 1 1 0 ${largeArc} 1 ${x2} ${y2}`,
        `L 0 0`,
      ].join(" ");

      return {
        path: pathData,
        color: colors[index % colors.length],
        label: labelMap[key] || key,
        val,
        percent: percent.toFixed(1),
      };
    });

    return (
      <div className="donut-card">
        <h4>{title}</h4>
        <div className="donut-body">
          <svg viewBox="-1.1 -1.1 2.2 2.2" className="donut-svg">
            {slices.map((slice, i) => (
              <path key={i} d={slice.path} fill={slice.color} />
            ))}
            <circle cx="0" cy="0" r="0.6" fill="#1e293b" />
            <text
              x="0"
              y="0"
              dominantBaseline="middle"
              textAnchor="middle"
              fill="#fff"
              fontSize="0.25"
              fontWeight="bold"
            >
              {total} mẫu
            </text>
          </svg>
          <div className="donut-legend">
            {slices.map((slice, i) => (
              <div key={i} className="legend-item">
                <span
                  className="legend-dot"
                  style={{ backgroundColor: slice.color }}
                ></span>
                <span className="legend-label">{slice.label}</span>
                <span className="legend-value">
                  {slice.val} ({slice.percent}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Bar chart helper for heart disease prevalence by categories
  const renderBarChart = (title, dataMap, color, labelMap = {}) => {
    const keys = Object.keys(dataMap);

    return (
      <div className="bar-chart-card">
        <h4>{title}</h4>
        <div className="bar-chart-container">
          {keys.map((key, index) => {
            const val = dataMap[key];
            const percent = (val * 100).toFixed(1);
            return (
              <div key={index} className="bar-item">
                <div className="bar-label">{labelMap[key] || key}</div>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${percent}%`,
                      backgroundColor: color,
                      boxShadow: `0 0 10px ${color}80`,
                    }}
                  ></div>
                </div>
                <div className="bar-value">{percent}%</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Correlation heatmap helper
  const renderCorrelationMatrix = (corr) => {
    const vars = Object.keys(corr);

    return (
      <div className="heatmap-card">
        <h4>Ma Trận Tương Quan Hệ Số Pearson</h4>
        <p className="margin-bottom-sm">
          Mức độ tương quan tuyến tính giữa các chỉ số số học và nhãn kết quả
          (HeartDisease).
        </p>
        <div className="heatmap-scroll">
          <div
            className="heatmap-grid"
            style={{
              gridTemplateColumns: `repeat(${vars.length + 1}, minmax(80px, 1fr))`,
            }}
          >
            {/* Header row corner */}
            <div className="heatmap-header-cell"></div>
            {/* Header labels */}
            {vars.map((v, i) => (
              <div key={i} className="heatmap-header-cell font-xs">
                {v}
              </div>
            ))}

            {/* Rows */}
            {vars.map((rowVar, rowIndex) => (
              <React.Fragment key={rowIndex}>
                {/* Row label */}
                <div className="heatmap-row-label">{rowVar}</div>
                {/* Cells */}
                {vars.map((colVar, colIndex) => {
                  const val = corr[rowVar][colVar];
                  // Color interpolator from blue (negative) to red (positive)
                  let cellColor = "#1e293b";
                  let textColor = "#94a3b8";

                  if (val > 0) {
                    const alpha = val.toFixed(2);
                    cellColor = `rgba(239, 68, 68, ${alpha})`;
                    textColor = val > 0.4 ? "#fff" : "#ef4444";
                  } else if (val < 0) {
                    const alpha = Math.abs(val).toFixed(2);
                    cellColor = `rgba(59, 130, 246, ${alpha})`;
                    textColor = Math.abs(val) > 0.4 ? "#fff" : "#60a5fa";
                  }

                  if (rowVar === colVar) {
                    cellColor = "#475569";
                    textColor = "#fff";
                  }

                  return (
                    <div
                      key={colIndex}
                      className="heatmap-cell"
                      style={{ backgroundColor: cellColor, color: textColor }}
                      title={`${rowVar} vs ${colVar}: ${val.toFixed(3)}`}
                    >
                      {val.toFixed(2)}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="tab-pane explorer-tab fade-in">
      <div className="section-header">
        <Database className="icon-purple" />
        <h2>Khám Phá Chi Tiết Tập Dữ Liệu</h2>
        <p>
          Thống kê trực quan từ 918 hồ sơ lâm sàng giúp định dạng phân phối dữ
          liệu huấn luyện.
        </p>
      </div>
      <div className="card explorer-dataset-card">
        <h2 className="section-title">
          <Database className="icon-purple" /> Về Tập Dữ Liệu Huấn Luyện
        </h2>
        <p>
          Mô hình được huấn luyện trên{" "}
          <strong>Heart Failure Prediction Dataset</strong>
          <br />
          (bao gồm 918 mẫu thu thập từ 5 cơ sở dữ liệu tim mạch lớn: Cleveland,
          Hungarian, Switzerland, Long Beach VA, và Stalog).
        </p>
        <div className="data-features-list">
          <div className="feature-item-desc">
            <strong>11 Đặc trưng lâm sàng:</strong> Tuổi (Age), Giới tính (Sex),
            Loại đau ngực (ChestPainType), Huyết áp tâm thu (RestingBP),
            Cholesterol huyết thanh (Cholesterol), Đường huyết lúc đói
            (FastingBS), Điện tâm đồ lúc nghỉ (RestingECG), Nhịp tim tối đa
            (MaxHR), Đau ngực khi vận động (ExerciseAngina), Độ chênh ST
            (Oldpeak), Độ dốc đoạn ST (ST_Slope).
          </div>
        </div>
      </div>
      <section className="about-section about-workflow-section explorer-workflow-section">
        <div className="about-section-heading">
          <h2>Quy trình học máy</h2>
        </div>
        <div className="about-workflow">
          {workflow.map(({ icon: Icon, title, text }, index) => (
            <article className="about-workflow-step" key={title}>
              <span className="about-workflow-index">{index + 1}</span>
              <span className="about-workflow-icon">
                <Icon size={18} />
              </span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>
      {/* Summary Cards */}
      <div className="stats-summary-grid explorer-summary-grid">
        <div className="stat-summary-card bg-glass">
          <Database size={24} className="icon-purple" />
          <div>
            <h3>{stats.total_records}</h3>
            <p>Tổng số bệnh nhân</p>
          </div>
        </div>
        <div className="stat-summary-card bg-glass">
          <Heart size={24} className="icon-red" />
          <div>
            <h3>
              {stats.heart_disease_distribution["1"]} (
              {(
                (stats.heart_disease_distribution["1"] / stats.total_records) *
                100
              ).toFixed(1)}
              %)
            </h3>
            <p>Mẫu có nguy cơ mắc bệnh</p>
          </div>
        </div>
        <div className="stat-summary-card bg-glass">
          <Users size={24} className="icon-blue" />
          <div>
            <h3>
              {stats.gender_distribution["M"]} /{" "}
              {stats.gender_distribution["F"]}
            </h3>
            <p>Phân bố Nam / Nữ</p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid-2-col explorer-chart-grid">
        {renderDonut(
          "Tỷ Lệ Bệnh Tim (HeartDisease)",
          stats.heart_disease_distribution,
          ["#10b981", "#ef4444"],
          { 0: "Bình thường", 1: "Mắc bệnh tim" },
        )}

        {renderDonut(
          "Phân Bố Giới Tính (Sex)",
          stats.gender_distribution,
          ["#3b82f6", "#ec4899"],
          { M: "Nam (Male)", F: "Nữ (Female)" },
        )}
      </div>

      <div className="grid-2-col explorer-chart-grid">
        {renderBarChart(
          "Tỷ Lệ Mắc Bệnh Tim Theo Giới Tính",
          stats.heart_disease_by_gender,
          "#ef4444",
          { M: "Nam (Male)", F: "Nữ (Female)" },
        )}

        {renderBarChart(
          "Tỷ Lệ Mắc Bệnh Tim Theo Loại Đau Ngực",
          stats.heart_disease_by_chest_pain,
          "#ef4444",
          {
            TA: "Đau điển hình (TA)",
            ATA: "Đau không điển hình (ATA)",
            NAP: "Đau không thắt ngực (NAP)",
            ASY: "Không triệu chứng (ASY)",
          },
        )}
      </div>

      <div className="grid-2-col explorer-chart-grid">
        {renderBarChart(
          "Tỷ Lệ Mắc Bệnh Tim Theo Độ Dốc Đoạn ST",
          stats.heart_disease_by_st_slope,
          "#ef4444",
          {
            Up: "Dốc lên (Up)",
            Flat: "Đi ngang (Flat)",
            Down: "Dốc xuống (Down)",
          },
        )}

        <div className="card text-stats-card">
          <h4>Tổng Quan Chỉ Số Sinh Tồn (Giá trị Trung Bình)</h4>
          <div className="text-stats-grid">
            <div className="text-stat-item">
              <span>Tuổi trung bình:</span>
              <strong>{stats.age_stats.mean.toFixed(1)} tuổi</strong>
            </div>
            <div className="text-stat-item">
              <span>Huyết áp lúc nghỉ TB:</span>
              <strong>{stats.resting_bp_stats.mean.toFixed(1)} mmHg</strong>
            </div>
            <div className="text-stat-item">
              <span>Cholesterol TB:</span>
              <strong>{stats.cholesterol_stats.mean.toFixed(1)} mg/dl</strong>
            </div>
            <div className="text-stat-item">
              <span>Nhịp tim tối đa TB:</span>
              <strong>{stats.max_hr_stats.mean.toFixed(1)} nhịp/phút</strong>
            </div>
          </div>
          <div className="stats-insight-info">
            <AlertCircle size={16} />
            <span>
              Lưu ý: Tập dữ liệu chứa một số bản ghi có chỉ số Cholesterol bằng
              0 mg/dl (293 mẫu) do lỗi dữ liệu lúc ghi nhận ở một vài trung tâm
              y tế ban đầu, mô hình học máy đã được xử lý phù hợp.
            </span>
          </div>
        </div>
      </div>

      <div className="explorer-heatmap-section">
        {renderCorrelationMatrix(stats.correlation_matrix)}
      </div>
    </div>
  );
}
