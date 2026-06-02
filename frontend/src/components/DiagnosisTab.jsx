import { useState } from 'react';
import { predictPatient } from '../utils/api';
import { HeartPulse, Activity, Stethoscope, Send, AlertTriangle, ShieldCheck, ChevronDown, ChevronUp, Pill, TestTube, Salad, RefreshCw, Shuffle, Eye, X } from 'lucide-react';

const INITIAL_FORM = {
  Age: '',
  Sex: '',
  ChestPainType: '',
  RestingBP: '',
  Cholesterol: '',
  FastingBS: '',
  RestingECG: '',
  MaxHR: '',
  ExerciseAngina: '',
  Oldpeak: '',
  ST_Slope: '',
};

const randomChoice = (items) => items[Math.floor(Math.random() * items.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomDecimal = (min, max, decimals = 1) => (
  Math.random() * (max - min) + min
).toFixed(decimals);

export default function DiagnosisTab({ selectedModel }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAllModels, setShowAllModels] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid = () => {
    return Object.values(form).every(v => v !== '' && v !== null && v !== undefined);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      setError('Vui lòng điền đầy đủ tất cả các trường thông tin lâm sàng.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      setResult(null);
      const data = await predictPatient(form);
      setResult(data);
      setShowResultModal(true);
    } catch (err) {
      setError(err.message || 'Lỗi khi gửi dữ liệu đến máy chủ. Hãy kiểm tra Backend.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm(INITIAL_FORM);
    setResult(null);
    setError(null);
    setShowResultModal(false);
    setShowAllModels(false);
  };

  const handleRandomFill = () => {
    setForm({
      Age: String(randomInt(29, 77)),
      Sex: randomChoice(['M', 'F']),
      ChestPainType: randomChoice(['TA', 'ATA', 'NAP', 'ASY']),
      RestingBP: String(randomInt(90, 180)),
      Cholesterol: String(randomInt(120, 360)),
      FastingBS: randomChoice(['0', '0', '1']),
      RestingECG: randomChoice(['Normal', 'ST', 'LVH']),
      MaxHR: String(randomInt(75, 195)),
      ExerciseAngina: randomChoice(['N', 'Y']),
      Oldpeak: randomDecimal(-0.5, 4.2),
      ST_Slope: randomChoice(['Up', 'Flat', 'Down']),
    });
    setResult(null);
    setError(null);
    setShowResultModal(false);
    setShowAllModels(false);
  };

  // Get the primary model result
  const primaryResult = result?.predictions?.[selectedModel];
  const isHighRisk = primaryResult?.prediction === 1;
  const confidence = primaryResult ? (primaryResult.confidence * 100).toFixed(1) : 0;

  // Circular progress for confidence
  const renderConfidenceCircle = (value, risk) => {
    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;
    const color = risk ? '#ef4444' : '#10b981';

    return (
      <div className="confidence-circle-container">
        <svg viewBox="0 0 128 128" className="confidence-svg">
          <circle cx="64" cy="64" r={radius} fill="none" stroke="#1e293b" strokeWidth="8" />
          <circle
            cx="64" cy="64" r={radius} fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: 'stroke-dashoffset 1.2s ease-in-out',
              transform: 'rotate(-90deg)',
              transformOrigin: '64px 64px',
              filter: `drop-shadow(0 0 8px ${color}80)`
            }}
          />
          <text x="64" y="58" textAnchor="middle" fill="var(--text-primary)" fontSize="22" fontWeight="bold">{value}%</text>
          <text x="64" y="76" textAnchor="middle" fill="var(--text-secondary)" fontSize="9">Độ tin cậy</text>
        </svg>
      </div>
    );
  };

  return (
    <div className="tab-pane fade-in">
      <div className="section-header">
        <HeartPulse className="icon-red" />
        <h2>Chẩn Đoán Nguy Cơ Bệnh Mạch Vành</h2>
        <p>Nhập đầy đủ 11 chỉ số lâm sàng của bệnh nhân, sau đó nhấn <strong>"Phân Tích Nguy Cơ"</strong> để nhận kết quả dự đoán từ mô hình <strong>{selectedModel}</strong>.</p>
      </div>

      <form className="diagnosis-form" onSubmit={handleSubmit}>
        {/* Section A */}
        <div className="form-section">
          <div className="form-section-header">
            <HeartPulse size={20} className="icon-red" />
            <h3>A. Thông Tin Cơ Bản & Triệu Chứng Chính</h3>
          </div>
          <div className="form-grid">
            <div className="form-group">
            {/* <span className="unit">Năm</span> */}
              <label htmlFor="age">Tuổi (Age) </label>
              <input id="age" type="number" min="1" max="120" placeholder="Ví dụ: 55"
                value={form.Age} onChange={(e) => handleChange('Age', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Giới tính (Sex)</label>
              <div className="radio-group">
                <label className={`radio-card ${form.Sex === 'M' ? 'radio-active' : ''}`}>
                  <input type="radio" name="sex" value="M" checked={form.Sex === 'M'} onChange={() => handleChange('Sex', 'M')} />
                  <span>Nam (M)</span>
                </label>
                <label className={`radio-card ${form.Sex === 'F' ? 'radio-active' : ''}`}>
                  <input type="radio" name="sex" value="F" checked={form.Sex === 'F'} onChange={() => handleChange('Sex', 'F')} />
                  <span>Nữ (F)</span>
                </label>
              </div>
            </div>
            <div className="form-group form-group-wide">
              <label>Loại đau ngực (ChestPainType)</label>
              <div className="radio-group radio-group-4">
                {[
                  { val: 'TA', label: 'Đau thắt ngực điển hình (TA)' },
                  { val: 'ATA', label: 'Đau không điển hình (ATA)' },
                  { val: 'NAP', label: 'Đau không thắt ngực (NAP)' },
                  { val: 'ASY', label: 'Không triệu chứng (ASY)' },
                ].map(opt => (
                  <label key={opt.val} className={`radio-card ${form.ChestPainType === opt.val ? 'radio-active' : ''}`}>
                    <input type="radio" name="cpt" value={opt.val} checked={form.ChestPainType === opt.val}
                      onChange={() => handleChange('ChestPainType', opt.val)} />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Đau ngực khi vận động (ExerciseAngina)</label>
              <div className="radio-group">
                <label className={`radio-card ${form.ExerciseAngina === 'Y' ? 'radio-active' : ''}`}>
                  <input type="radio" name="ea" value="Y" checked={form.ExerciseAngina === 'Y'} onChange={() => handleChange('ExerciseAngina', 'Y')} />
                  <span>Có (Y)</span>
                </label>
                <label className={`radio-card ${form.ExerciseAngina === 'N' ? 'radio-active' : ''}`}>
                  <input type="radio" name="ea" value="N" checked={form.ExerciseAngina === 'N'} onChange={() => handleChange('ExerciseAngina', 'N')} />
                  <span>Không (N)</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Section B */}
        <div className="form-section">
          <div className="form-section-header">
            <Activity size={20} className="icon-blue" />
            <h3>B. Chỉ Số Sinh Tồn & Xét Nghiệm Máu</h3>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="rbp">Huyết áp tâm thu lúc nghỉ (RestingBP) <span className="unit">mm Hg</span></label>
              <input id="rbp" type="number" min="0" max="300" placeholder="Ví dụ: 140"
                value={form.RestingBP} onChange={(e) => handleChange('RestingBP', e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="chol">Cholesterol huyết thanh (Cholesterol) <span className="unit">mg/dl</span></label>
              <input id="chol" type="number" min="0" max="700" placeholder="Ví dụ: 289"
                value={form.Cholesterol} onChange={(e) => handleChange('Cholesterol', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Đường huyết lúc đói (FastingBS)</label>
              <div className="radio-group">
                <label className={`radio-card ${form.FastingBS === '1' ? 'radio-active' : ''}`}>
                  <input type="radio" name="fbs" value="1" checked={form.FastingBS === '1'} onChange={() => handleChange('FastingBS', '1')} />
                  <span>&gt; 120 mg/dl</span>
                </label>
                <label className={`radio-card ${form.FastingBS === '0' ? 'radio-active' : ''}`}>
                  <input type="radio" name="fbs" value="0" checked={form.FastingBS === '0'} onChange={() => handleChange('FastingBS', '0')} />
                  <span>≤ 120 mg/dl</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Section C */}
        <div className="form-section">
          <div className="form-section-header">
            <Stethoscope size={20} className="icon-green" />
            <h3>C. Kết Quả Điện Tâm Đồ (ECG) & Gắng Sức</h3>
          </div>
          <div className="form-grid">
            <div className="form-group form-group-wide">
              <label>Kết quả điện tâm đồ lúc nghỉ (RestingECG)</label>
              <div className="radio-group radio-group-3">
                {[
                  { val: 'Normal', label: 'Bình thường (Normal)' },
                  { val: 'ST', label: 'Bất thường sóng ST-T' },
                  { val: 'LVH', label: 'Phì đại thất trái (LVH)' },
                ].map(opt => (
                  <label key={opt.val} className={`radio-card ${form.RestingECG === opt.val ? 'radio-active' : ''}`}>
                    <input type="radio" name="recg" value={opt.val} checked={form.RestingECG === opt.val}
                      onChange={() => handleChange('RestingECG', opt.val)} />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="maxhr">Nhịp tim tối đa (MaxHR) <span className="unit">60 - 202 nhịp/phút</span></label>
              <input id="maxhr" type="number" min="60" max="202" placeholder="Ví dụ: 110"
                value={form.MaxHR} onChange={(e) => handleChange('MaxHR', e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="oldpeak">Độ chênh ST (Oldpeak) <span className="unit">mm</span></label>
              <input id="oldpeak" type="number" step="0.1" min="-5" max="10" placeholder="Ví dụ: 1.8"
                value={form.Oldpeak} onChange={(e) => handleChange('Oldpeak', e.target.value)} />
            </div>
            <div className="form-group form-group-wide">
              <label>Độ dốc đoạn ST (ST_Slope)</label>
              <div className="radio-group radio-group-3">
                {[
                  { val: 'Up', label: 'Dốc lên (Up)' },
                  { val: 'Flat', label: 'Đi ngang (Flat)' },
                  { val: 'Down', label: 'Dốc xuống (Down)' },
                ].map(opt => (
                  <label key={opt.val} className={`radio-card ${form.ST_Slope === opt.val ? 'radio-active' : ''}`}>
                    <input type="radio" name="slope" value={opt.val} checked={form.ST_Slope === opt.val}
                      onChange={() => handleChange('ST_Slope', opt.val)} />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="form-error">
            <AlertTriangle size={16} /> {error}
          </div>
        )}

        <div className="form-actions">
          <button type="button" className="btn btn-outline btn-lg" onClick={handleRandomFill} disabled={loading}>
            <Shuffle size={18} /> Điền Ngẫu Nhiên
          </button>
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            {loading ? (
              <><RefreshCw size={18} className="loading-spinner" /> Đang phân tích...</>
            ) : (
              <><Send size={18} /> Phân Tích Nguy Cơ</>
            )}
          </button>
          <button type="button" className="btn btn-outline btn-lg" onClick={handleReset}>
            Làm Mới
          </button>
          {result && !showResultModal && (
            <button type="button" className="btn btn-outline btn-lg" onClick={() => setShowResultModal(true)}>
              <Eye size={18} /> Xem Lại Kết Quả
            </button>
          )}
        </div>
      </form>

      {result && showResultModal && (
        <div className="result-modal-overlay fade-in" role="dialog" aria-modal="true" aria-labelledby="diagnosis-result-title">
          <div className={`result-panel result-modal ${isHighRisk ? 'result-danger' : 'result-safe'}`}>
          <button
            type="button"
            className="result-modal-close"
            onClick={() => setShowResultModal(false)}
            aria-label="Đóng kết quả chẩn đoán"
          >
            <X size={20} />
          </button>
          <div className="result-header">
            <div className="result-icon-wrap">
              {isHighRisk ? <AlertTriangle size={36} /> : <ShieldCheck size={36} />}
            </div>
            <div className="result-title">
              <h2 id="diagnosis-result-title">{isHighRisk ? 'PHÁT HIỆN NGUY CƠ MẮC BỆNH TIM' : 'KHÔNG PHÁT HIỆN NGUY CƠ BỆNH TIM'}</h2>
              <p>Kết quả từ mô hình: <strong>{selectedModel}</strong></p>
            </div>
            {renderConfidenceCircle(parseFloat(confidence), isHighRisk)}
          </div>

          {/* All models comparison */}
          <div className="result-models-toggle" onClick={() => setShowAllModels(!showAllModels)}>
            <span>Kết quả từ tất cả mô hình</span>
            {showAllModels ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
          {showAllModels && (
            <div className="all-models-grid fade-in">
              {Object.entries(result.predictions).map(([name, pred]) => (
                <div key={name} className={`model-result-card ${pred.prediction === 1 ? 'model-danger' : 'model-safe'}`}>
                  <h4>{name}</h4>
                  <div className="model-result-status">
                    {pred.prediction === 1 ? <AlertTriangle size={16} /> : <ShieldCheck size={16} />}
                    <span>{pred.prediction === 1 ? 'Nguy cơ' : 'Bình thường'}</span>
                  </div>
                  <div className="model-result-conf">
                    <div className="conf-bar-track">
                      <div className="conf-bar-fill" style={{
                        width: `${(pred.probability_1 * 100).toFixed(0)}%`,
                        backgroundColor: pred.prediction === 1 ? '#ef4444' : '#10b981'
                      }}></div>
                    </div>
                    <span>P(Bệnh) = {(pred.probability_1 * 100).toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Risk Factors */}
          {result.risk_factors && result.risk_factors.length > 0 && (
            <div className="risk-factors-section">
              <h3><AlertTriangle size={18} className="icon-amber" /> Các Yếu Tố Nguy Cơ Được Phát Hiện</h3>
              <div className="risk-factors-list">
                {result.risk_factors.map((rf, idx) => (
                  <div key={idx} className="risk-factor-item">
                    <div className="rf-header">
                      <span className="rf-feature">{rf.feature}</span>
                      <span className="rf-value">{rf.value}</span>
                    </div>
                    <p className="rf-reason">{rf.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {result.recommendations && (
            <div className="recommendations-section">
              <h3><Stethoscope size={18} className="icon-blue" /> Khuyến Nghị Điều Trị Y Khoa</h3>
              <p className="rec-disclaimer">(Dành cho bác sĩ tham khảo, không thay thế chẩn đoán chuyên khoa)</p>

              <div className="rec-grid">
                <div className="rec-card">
                  <div className="rec-card-header">
                    <TestTube size={20} />
                    <h4>Chỉ Định Cận Lâm Sàng</h4>
                  </div>
                  <ul>
                    {result.recommendations.tests.map((t, i) => <li key={i}>{t}</li>)}
                  </ul>
                </div>
                <div className="rec-card">
                  <div className="rec-card-header">
                    <Pill size={20} />
                    <h4>Hướng Dẫn Điều Trị</h4>
                  </div>
                  <ul>
                    {result.recommendations.treatments.map((t, i) => <li key={i}>{t}</li>)}
                  </ul>
                </div>
                <div className="rec-card">
                  <div className="rec-card-header">
                    <Salad size={20} />
                    <h4>Thay Đổi Lối Sống</h4>
                  </div>
                  <ul>
                    {result.recommendations.lifestyle.map((t, i) => <li key={i}>{t}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
        </div>
      )}
    </div>
  );
}
