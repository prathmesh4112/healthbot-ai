'use client';

import { useState } from 'react';
import { Activity, AlertTriangle, CheckCircle, Loader2, Stethoscope } from 'lucide-react';

interface Prediction {
  disease: string;
  probability: number;
}

export default function SymptomCheckerPage() {
  const [symptoms, setSymptoms] = useState('');
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim()) return;

    setLoading(true);
    setError('');
    setPredictions([]);

    try {
      const response = await fetch('/api/symptom-prediction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symptoms }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Prediction failed');
      }

      setPredictions(data.predictions);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Prediction failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (probability: number) => {
    if (probability >= 70) return 'text-red-600 bg-red-50 border-red-200';
    if (probability >= 40) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getSeverityIcon = (probability: number) => {
    if (probability >= 70) return <AlertTriangle className="h-5 w-5" />;
    if (probability >= 40) return <Activity className="h-5 w-5" />;
    return <CheckCircle className="h-5 w-5" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Stethoscope className="h-12 w-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">AI Symptom Checker</h1>
          </div>
          <p className="text-lg text-gray-600">
            Describe your symptoms and get AI-powered disease predictions
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6" suppressHydrationWarning>
            <div>
              <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700 mb-2">
                Describe your symptoms
              </label>
              <textarea
                id="symptoms"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="e.g., fever, headache, fatigue, cough..."
                className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || !symptoms.trim()}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Analyzing symptoms...
                </>
              ) : (
                <>
                  <Activity className="h-5 w-5 mr-2" />
                  Check Symptoms
                </>
              )}
            </button>
          </form>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {predictions.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Possible Conditions</h2>
            <div className="space-y-4">
              {predictions.map((pred, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 ${getSeverityColor(pred.probability)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {getSeverityIcon(pred.probability)}
                      <h3 className="text-lg font-semibold ml-3">{pred.disease}</h3>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{pred.probability}%</div>
                      <div className="text-sm opacity-75">likelihood</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Important Disclaimer</h3>
              <p className="text-sm text-gray-600">
                This AI-powered symptom checker is for informational purposes only and should not replace professional medical advice.
                Always consult with a qualified healthcare provider for proper diagnosis and treatment.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}