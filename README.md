# SmartHeartDiagnosis

SmartHeartDiagnosis is a React + Vite web interface for a heart disease risk estimation system. It lets users enter clinical indicators, call the Flask machine learning API, compare model outputs, explore dataset statistics, and export a printable PDF report from the prediction result.

---

### Key Features

- Estimate heart disease risk as a percentage from 11 clinical indicators.
- Compare results from Decision Tree, Naive Bayes, SVM, and Random Forest.
- Display risk factors and reference recommendations.
- Visualize model metrics, ROC curves, and confusion matrices.
- Explore dataset statistics and correlations.
- Support dark mode and light mode.
- Preview and download the prediction result as a PDF report.
- AI assistant powered by the backend OpenAI API integration.
- Responsive layout with a mobile bottom navigation bar.

### Tech Stack

- React
- Vite
- JavaScript / JSX
- CSS
- Lucide React
- Flask API backend
- Scikit-learn models served from the backend
- OpenAI API for the AI assistant

### Requirements

- Node.js 20.19+ or 22.12+ recommended
- npm
- Backend API running locally or deployed

### Environment Variable

Create a `.env` file inside the `frontend` folder if you want to override the API URL:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

For production:

```env
VITE_API_BASE_URL=https://your-backend-url.onrender.com/api
```

If this variable is not set, the frontend falls back to:

```txt
http://localhost:5000/api
```

The AI assistant is handled by the backend. Set these variables on the backend server, not in the frontend:

```env
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4.1-mini
```

### Install Dependencies

```bash
npm install
```

### Run Locally

Start the backend first:

```bash
cd ../backend
python app.py
```

Then start the frontend:

```bash
cd ../frontend
npm run dev
```

Open the Vite URL, usually:

```txt
http://localhost:5173
```

### Build

```bash
npm run build
```

The production build is generated in:

```txt
dist/
```

### Preview Production Build

```bash
npm run preview
```

### Deployment Notes

For Render Static Site:

```txt
Root Directory: frontend
Build Command: npm install && npm run build
Publish Directory: frontend/dist
```

Set this environment variable:

```txt
VITE_API_BASE_URL=https://your-backend-url.onrender.com/api
```

### Project Structure

```txt
frontend/
|-- public/
|-- src/
|   |-- components/
|   |   |-- AboutTab.jsx
|   |   |-- AnalysisTab.jsx
|   |   |-- ChatAssistant.jsx
|   |   |-- DiagnosisTab.jsx
|   |   `-- ExplorerTab.jsx
|   |-- utils/
|   |   `-- api.js
|   |-- App.jsx
|   |-- index.css
|   `-- main.jsx
|-- index.html
|-- package.json
`-- vite.config.js
```

