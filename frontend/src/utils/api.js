const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Send patient clinical data to the backend for heart disease prediction.
 * @param {Object} patientData - Object containing all 11 patient features.
 * @returns {Promise<Object>} Recommendation, predictions, and risk factors.
 */
export async function predictPatient(patientData) {
  const response = await fetch(`${API_BASE_URL}/predict`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(patientData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to get predictions');
  }

  return response.json();
}

/**
 * Fetch model performance metrics from backend.
 * @returns {Promise<Object>} Object containing metrics for all 4 models.
 */
export async function getModelMetrics() {
  const response = await fetch(`${API_BASE_URL}/metrics`);
  if (!response.ok) {
    throw new Error('Failed to fetch model metrics');
  }
  return response.json();
}

/**
 * Fetch descriptive statistics of the dataset from backend.
 * @returns {Promise<Object>} Statistics summaries.
 */
export async function getDatasetStats() {
  const response = await fetch(`${API_BASE_URL}/stats`);
  if (!response.ok) {
    throw new Error('Failed to fetch dataset stats');
  }
  return response.json();
}
