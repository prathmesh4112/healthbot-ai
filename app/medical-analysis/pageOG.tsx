'use client';

import { useState } from 'react';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';

export default function MedicalAnalysisPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [report, setReport] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setReport('');
      setError('');
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError('Please upload an image first');
      return;
    }

    setLoading(true);
    setError('');
    setReport('');

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await fetch('/api/medical-analysis', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      setReport(data.report);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🩺 Medical Image Analysis Tool 🔬
          </h1>
          <p className="text-lg text-gray-600">
            Upload a medical image for AI-powered analysis with detailed findings and diagnosis
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              Upload Medical Image
            </h2>
            
            <div className="space-y-4">
              <label className="block">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-indigo-50 file:text-indigo-700
                    hover:file:bg-indigo-100 cursor-pointer"
                />
              </label>

              {previewUrl && (
                <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    fill
                    className="object-contain"
                  />
                </div>
              )}

              <button
                onClick={handleAnalyze}
                disabled={!selectedFile || loading}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg
                  font-semibold hover:bg-indigo-700 disabled:bg-gray-400
                  disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Analyzing...
                  </span>
                ) : (
                  '🔍 Analyze Image'
                )}
              </button>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  ⚠️ {error}
                </div>
              )}
            </div>
          </div>

          {/* Report Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              📋 Analysis Report
            </h2>
            
            <div className="prose prose-sm max-w-none overflow-y-auto max-h-[600px]">
              {report ? (
                <div className="text-gray-700">
                  <ReactMarkdown>
                    {report}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="text-gray-500 italic">
                  Upload and analyze an image to see the report here.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}