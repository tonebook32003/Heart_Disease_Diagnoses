import os
import json
import numpy as np
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib

app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing

# Paths
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BACKEND_DIR, 'models')

# Load models and preprocessing assets
preprocessor = None
models = {}
metrics_data = {}
stats_data = {}

def load_assets():
    global preprocessor, models, metrics_data, stats_data
    try:
        preprocessor_path = os.path.join(MODELS_DIR, 'preprocessor.joblib')
        if os.path.exists(preprocessor_path):
            preprocessor = joblib.load(preprocessor_path)
            print("Loaded preprocessor.")
        
        model_names = ['Decision Tree', 'Naive Bayes', 'SVM', 'Random Forest']
        for name in model_names:
            filename = name.lower().replace(' ', '_') + '.joblib'
            filepath = os.path.join(MODELS_DIR, filename)
            if os.path.exists(filepath):
                models[name] = joblib.load(filepath)
                print(f"Loaded model: {name}")
                
        metrics_path = os.path.join(MODELS_DIR, 'metrics.json')
        if os.path.exists(metrics_path):
            with open(metrics_path, 'r') as f:
                metrics_data = json.load(f)
            print("Loaded metrics.")
            
        stats_path = os.path.join(MODELS_DIR, 'stats.json')
        if os.path.exists(stats_path):
            with open(stats_path, 'r') as f:
                stats_data = json.load(f)
            print("Loaded dataset stats.")
    except Exception as e:
        print(f"Error loading assets: {e}")

# Load assets on startup
load_assets()

@app.route('/', methods=['GET'])
def index():
    return jsonify({
        'message': 'SmartHeartDiagnosis backend is running',
        'health_url': '/api/health'
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'ok',
        'models_loaded': sorted(models.keys()),
        'preprocessor_loaded': preprocessor is not None,
        'metrics_loaded': bool(metrics_data),
        'stats_loaded': bool(stats_data)
    })

@app.route('/api/metrics', methods=['GET'])
def get_metrics():
    # If not loaded, reload
    if not metrics_data:
        load_assets()
    return jsonify(metrics_data)

@app.route('/api/stats', methods=['GET'])
def get_stats():
    # If not loaded, reload
    if not stats_data:
        load_assets()
    return jsonify(stats_data)

@app.route('/api/predict', methods=['POST'])
def predict():
    global preprocessor, models
    if preprocessor is None or not models:
        load_assets()
        if preprocessor is None or not models:
            return jsonify({'error': 'Models and preprocessor are not trained or available.'}), 500
            
    try:
        data = request.json
        # Expected input features matching the dataset columns
        required_fields = [
            'Age', 'Sex', 'ChestPainType', 'RestingBP', 'Cholesterol', 
            'FastingBS', 'RestingECG', 'MaxHR', 'ExerciseAngina', 'Oldpeak', 'ST_Slope'
        ]
        
        # Verify all required fields are present
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return jsonify({'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400
            
        # Create input DataFrame
        # Make sure values are cast to correct types
        input_dict = {
            'Age': [int(data['Age'])],
            'Sex': [str(data['Sex'])],
            'ChestPainType': [str(data['ChestPainType'])],
            'RestingBP': [float(data['RestingBP'])],
            'Cholesterol': [float(data['Cholesterol'])],
            'FastingBS': [int(data['FastingBS'])],
            'RestingECG': [str(data['RestingECG'])],
            'MaxHR': [float(data['MaxHR'])],
            'ExerciseAngina': [str(data['ExerciseAngina'])],
            'Oldpeak': [float(data['Oldpeak'])],
            'ST_Slope': [str(data['ST_Slope'])]
        }
        
        input_df = pd.DataFrame(input_dict)
        
        # Preprocess the input data
        input_processed = preprocessor.transform(input_df)
        
        # Get predictions from all models
        predictions = {}
        for name, model in models.items():
            pred = int(model.predict(input_processed)[0])
            prob = model.predict_proba(input_processed)[0] if hasattr(model, 'predict_proba') else [0.5, 0.5]
            
            # Confidence is the probability of the predicted class
            confidence = float(prob[pred])
            
            predictions[name] = {
                'prediction': pred,
                'confidence': confidence,
                'probability_0': float(prob[0]),
                'probability_1': float(prob[1])
            }
            
        # Clinical Risk Explanation Engine
        risk_factors = []
        
        # Age
        age = int(data['Age'])
        if age > 50:
            risk_factors.append({
                'feature': 'Tuổi (Age)',
                'value': f"{age} tuổi",
                'reason': 'Độ tuổi > 50 làm tăng nguy cơ xơ vữa động mạch và các vấn đề về tim.'
            })
            
        # Sex
        sex = str(data['Sex'])
        if sex == 'M':
            risk_factors.append({
                'feature': 'Giới tính (Sex)',
                'value': 'Nam',
                'reason': 'Nam giới theo thống kê có nguy cơ mắc bệnh mạch vành sớm và cao hơn nữ giới.'
            })
            
        # Chest Pain Type
        cpt = str(data['ChestPainType'])
        if cpt == 'ASY':
            risk_factors.append({
                'feature': 'Loại đau ngực (ChestPainType)',
                'value': 'Không triệu chứng (ASY)',
                'reason': 'Đau ngực ASY thường nguy hiểm nhất vì tổn thương cơ tim ngầm tiến triển âm thầm mà không gây cảnh báo rõ ràng.'
            })
        elif cpt == 'TA':
            risk_factors.append({
                'feature': 'Loại đau ngực (ChestPainType)',
                'value': 'Đau thắt ngực điển hình (TA)',
                'reason': 'Đau thắt ngực điển hình là dấu hiệu trực tiếp của thiếu máu cơ tim cục bộ do tắc hẹp mạch vành.'
            })
            
        # Exercise Angina
        ea = str(data['ExerciseAngina'])
        if ea == 'Y':
            risk_factors.append({
                'feature': 'Đau ngực khi vận động (ExerciseAngina)',
                'value': 'Có (Y)',
                'reason': 'Đau thắt ngực xuất hiện khi gắng sức chứng tỏ lưu lượng máu mạch vành không đáp ứng đủ nhu cầu oxy của cơ tim.'
            })
            
        # Resting BP
        rbp = float(data['RestingBP'])
        if rbp > 130:
            risk_factors.append({
                'feature': 'Huyết áp tâm thu lúc nghỉ (RestingBP)',
                'value': f"{rbp} mm Hg",
                'reason': 'Huyết áp > 130 mmHg phản ánh tình trạng tăng huyết áp, làm tăng áp lực thành mạch và làm dày cơ tim.'
            })
            
        # Cholesterol
        chol = float(data['Cholesterol'])
        if chol > 240:
            risk_factors.append({
                'feature': 'Cholesterol huyết thanh (Cholesterol)',
                'value': f"{chol} mg/dl",
                'reason': 'Cholesterol > 240 mg/dl ở mức cao, tăng nguy cơ hình thành mảng xơ vữa gây bít tắc lòng mạch.'
            })
        elif chol < 100 and chol > 0: # Under normal is fine, but if it is 0, it is a data artifact in this dataset or serious hypolipidemia
            pass
            
        # Fasting Blood Sugar
        fbs = int(data['FastingBS'])
        if fbs == 1:
            risk_factors.append({
                'feature': 'Đường huyết lúc đói (FastingBS)',
                'value': '> 120 mg/dl',
                'reason': 'Đường huyết cao làm tổn thương lớp nội mạc mạch máu, thúc đẩy hình thành các mảng xơ vữa nhanh hơn.'
            })
            
        # Resting ECG
        recg = str(data['RestingECG'])
        if recg == 'ST':
            risk_factors.append({
                'feature': 'Điện tâm đồ lúc nghỉ (RestingECG)',
                'value': 'Bất thường sóng ST-T',
                'reason': 'ST-T wave abnormality phản ánh trực tiếp tình trạng thiếu máu cơ tim hoặc tổn thương cơ tim.'
            })
        elif recg == 'LVH':
            risk_factors.append({
                'feature': 'Điện tâm đồ lúc nghỉ (RestingECG)',
                'value': 'Phì đại thất trái (LVH)',
                'reason': 'Phì đại thất trái là hệ quả của tăng huyết áp kéo dài hoặc bệnh van tim, làm tăng nguy cơ suy tim.'
            })
            
        # Max Heart Rate
        max_hr = float(data['MaxHR'])
        # A simple clinical estimate is 220 - age. If MaxHR is significantly lower than 0.7 * (220-age), it shows chronotropic incompetence
        age_pred_max = 220 - age
        if max_hr < 0.65 * age_pred_max or max_hr < 120:
            risk_factors.append({
                'feature': 'Nhịp tim tối đa (MaxHR)',
                'value': f"{max_hr} nhịp/phút",
                'reason': 'Nhịp tim gắng sức thấp hơn bình thường so với tuổi cho thấy tim không tăng được nhịp tương xứng để đáp ứng tải.'
            })
            
        # Oldpeak
        oldpeak = float(data['Oldpeak'])
        if oldpeak > 1.0:
            risk_factors.append({
                'feature': 'Độ chênh ST (Oldpeak)',
                'value': f"{oldpeak} mm",
                'reason': 'Độ chênh xuống của đoạn ST > 1mm khi gắng sức là chỉ báo rất mạnh mẽ về thiếu máu cơ tim dưới màng tâm mạc.'
            })
            
        # ST Slope
        slope = str(data['ST_Slope'])
        if slope == 'Flat':
            risk_factors.append({
                'feature': 'Độ dốc ST (ST_Slope)',
                'value': 'Đi ngang (Flat)',
                'reason': 'Đoạn ST đi ngang sau gắng sức là dấu hiệu điển hình và nhạy cảm của tình trạng bệnh động mạch vành.'
            })
        elif slope == 'Down':
            risk_factors.append({
                'feature': 'Độ dốc ST (ST_Slope)',
                'value': 'Dốc xuống (Down)',
                'reason': 'Đoạn ST dốc xuống là chỉ báo nguy cơ cao nhất liên quan đến tắc nghẽn động mạch vành nghiêm trọng.'
            })
            
        # Generate medical recommendations
        # If any model predicts disease, or if we average predictions and it's positive
        # We can also let frontend choose which model to look at, but we provide recommendations based on the overall prediction
        # Let's count votes
        votes = sum([p['prediction'] for p in predictions.values()])
        is_high_risk = votes >= 2 # Majority vote or any model
        
        recommendations = {
            'tests': [],
            'treatments': [],
            'lifestyle': []
        }
        
        if is_high_risk:
            recommendations['tests'] = [
                'Chụp cắt lớp vi tính động mạch vành (Coronary CT Angiography) để đánh giá vị trí và mức độ hẹp.',
                'Siêu âm tim gắng sức (Stress Echocardiography) hoặc Điện tâm đồ gắng sức để khảo sát thêm về tưới máu cơ tim.',
                'Xét nghiệm sinh hóa máu nâng cao: Troponin T/I, NT-proBNP, bilan mỡ máu toàn phần (LDL-C, HDL-C, Triglycerides).'
            ]
            recommendations['treatments'] = [
                'Tham vấn bác sĩ chuyên khoa Tim mạch để xem xét sử dụng các thuốc như Aspirin/Clopidogrel (kháng tiểu cầu), Statins (hạ cholesterol, ổn định mảng xơ vữa), thuốc chẹn beta hoặc ức chế men chuyển nếu có tăng huyết áp.',
                'Kiểm soát huyết áp tối ưu: duy trì huyết áp huyết động học ổn định dưới 130/80 mmHg.'
            ]
            recommendations['lifestyle'] = [
                'Hạn chế muối nghiêm ngặt (dưới 2g natri/ngày, khoảng 1 thìa cà phê muối).',
                'Kiêng tuyệt đối rượu bia, thuốc lá và các chất kích thích.',
                'Tránh các hoạt động gắng sức đột ngột, nặng nề do có tiền sử đau ngực/thiếu máu cơ tim (luyện tập nhẹ nhàng: đi bộ, đạp xe chậm từ 15-30 phút mỗi ngày).'
            ]
        else:
            recommendations['tests'] = [
                'Khám sức khỏe tim mạch định kỳ mỗi 6 - 12 tháng.',
                'Xét nghiệm glucose và cholesterol máu định kỳ để duy trì các chỉ số trong tầm kiểm soát.'
            ]
            recommendations['treatments'] = [
                'Không cần can thiệp y khoa đặc hiệu tại thời điểm này nếu không có triệu chứng lâm sàng cấp tính.',
                'Duy trì các thuốc điều trị bệnh nền hiện tại (như tiểu đường hoặc cao huyết áp nhẹ) theo chỉ dẫn của bác sĩ.'
            ]
            recommendations['lifestyle'] = [
                'Duy trì chế độ ăn tốt cho tim mạch Địa Trung Hải: giàu rau xanh, trái cây, các loại hạt, cá và hạn chế mỡ động vật.',
                'Duy trì tập thể dục đều đặn: ít nhất 150 phút/tuần với cường độ trung bình (đi bộ nhanh, bơi lội).',
                'Kiểm soát cân nặng ở mức BMI lý tưởng (18.5 - 22.9 kg/m2).'
            ]
            
        response = {
            'predictions': predictions,
            'risk_factors': risk_factors,
            'recommendations': recommendations,
            'patient_data': data
        }
        
        return jsonify(response)
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
