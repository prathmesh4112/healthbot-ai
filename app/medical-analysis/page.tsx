'use client';

import { useState } from 'react';
import { Upload, FileImage, Activity, AlertCircle, CheckCircle2, Loader2, Sparkles, Brain, ZoomIn, ZoomOut, Download } from 'lucide-react';

function MedicalAnalysisPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [report, setReport] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const handleFileChange = (file: File | undefined) => {
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setReport('');
      setError('');
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 2000);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    handleFileChange(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleFileChange(file);
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

      if (data.success && data.report) {
        setReport(data.report);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during analysis');
    } finally {
      setLoading(false);
    }
  };

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.5, 3));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.5, 0.5));

  const handleDownloadReport = () => {
    if (!report) return;
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'analysis-report.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-gray-800 rounded-full blur-3xl top-0 -left-48 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-gray-700 rounded-full blur-3xl bottom-0 -right-48 animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="relative z-10 py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-600 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-white" />
            <span className="text-sm text-gray-300 font-medium">AI-Powered Medical Imaging</span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
            Medical Image
            <span className="block text-white">
              Analysis Platform
            </span>
          </h1>
          
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Advanced AI-driven diagnostic insights with state-of-the-art image processing technology
          </p>
        </div>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-700 p-8 shadow-2xl rounded-3xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                  <Upload className="w-6 h-6 text-black" />
                </div>
                <h2 className="text-2xl font-bold text-white">Upload Image</h2>
              </div>

              {/* Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-2xl transition-all duration-300 ${
                  isDragging
                    ? 'border-white bg-gray-800 scale-105'
                    : 'border-gray-600 bg-gray-900 hover:border-gray-400'
                }`}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleInputChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  id="file-upload"
                />
                
                {previewUrl ? (
                  <div className="relative group">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-80 object-contain rounded-2xl p-4 transition-transform duration-300"
                      style={{ transform: `scale(${zoomLevel})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-end justify-center pb-6">
                      <div className="flex gap-2">
                        <button onClick={handleZoomIn} className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-full font-semibold transition-all">
                          <ZoomIn className="w-4 h-4" />
                        </button>
                        <button onClick={handleZoomOut} className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-full font-semibold transition-all">
                          <ZoomOut className="w-4 h-4" />
                        </button>
                        <label htmlFor="file-upload" className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-full font-semibold cursor-pointer transition-all">
                          Change Image
                        </label>
                      </div>
                    </div>
                    {uploadSuccess && (
                      <div className="absolute top-4 right-4 bg-white text-black px-4 py-2 rounded-full flex items-center gap-2 shadow-lg animate-[slideIn_0.3s_ease-out]">
                        <CheckCircle2 className="w-4 h-4" />
                        Uploaded!
                      </div>
                    )}
                  </div>
                ) : (
                  <label htmlFor="file-upload" className="flex flex-col items-center justify-center py-16 cursor-pointer">
                    <div className="w-20 h-20 bg-gray-800 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <FileImage className="w-10 h-10 text-white" />
                    </div>
                    <p className="text-white font-semibold text-lg mb-2">
                      {isDragging ? 'Drop your image here' : 'Click or drag to upload'}
                    </p>
                    <p className="text-gray-500 text-sm">
                      Supports: JPG, PNG, DICOM, and more
                    </p>
                  </label>
                )}
              </div>

              {/* Analyze Button */}
              <button
                onClick={handleAnalyze}
                disabled={!selectedFile || loading}
                className="w-full mt-6 bg-white hover:bg-gray-200 disabled:bg-gray-600 text-black py-4 rounded-2xl font-bold text-lg shadow-lg disabled:shadow-none transition-all duration-300 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Analyzing with AI...
                  </>
                ) : (
                  <>
                    <Brain className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    Start AI Analysis
                  </>
                )}
              </button>

              {/* Error Message */}
              {error && (
                <div className="mt-4 bg-gray-800 border border-gray-600 text-gray-300 px-4 py-3 rounded-2xl flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: Activity, label: 'Fast Analysis', value: '<3s' },
                { icon: Brain, label: 'AI Accuracy', value: '98%' },
                { icon: CheckCircle2, label: 'Secure', value: '100%' }
              ].map((item, i) => (
                <div key={i} className="bg-gray-900 border border-gray-700 p-4 text-center hover:bg-gray-800 transition-all rounded-2xl">
                  <item.icon className="w-6 h-6 text-white mx-auto mb-2" />
                  <p className="text-gray-500 text-xs mb-1">{item.label}</p>
                  <p className="text-white font-bold text-lg">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Report Section */}
          <div className="bg-gray-900 border border-gray-700 p-8 shadow-2xl rounded-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                <Activity className="w-6 h-6 text-black" />
              </div>
              <h2 className="text-2xl font-bold text-white">Analysis Report</h2>
            </div>

            <div className="bg-gray-800 rounded-2xl p-6 min-h-[600px] max-h-[600px] overflow-y-auto custom-scrollbar">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="relative w-24 h-24 mb-6">
                    <div className="absolute inset-0 border-4 border-gray-600 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-transparent border-t-white rounded-full animate-spin"></div>
                    <Brain className="absolute inset-0 m-auto w-10 h-10 text-white" />
                  </div>
                  <p className="text-white font-semibold text-lg mb-2">Processing Image...</p>
                  <p className="text-gray-500 text-sm">AI analysis in progress</p>
                </div>
              ) : report ? (
                <div className="text-gray-200 space-y-4 prose prose-invert max-w-none">
                  {report.split('\n').map((line, i) => {
                    if (line.startsWith('# ')) {
                      return <h1 key={i} className="text-3xl font-bold text-white mb-4">{line.slice(2)}</h1>;
                    } else if (line.startsWith('## ')) {
                      return <h2 key={i} className="text-2xl font-bold text-purple-300 mt-6 mb-3">{line.slice(3)}</h2>;
                    } else if (line.startsWith('### ')) {
                      return <h3 key={i} className="text-xl font-semibold text-blue-300 mt-4 mb-2">{line.slice(4)}</h3>;
                    } else if (line.startsWith('- ')) {
                      return <li key={i} className="text-gray-300 ml-4">{line.slice(2)}</li>;
                    } else if (line.match(/^\d+\./)) {
                      return <li key={i} className="text-gray-300 ml-4 list-decimal">{line.replace(/^\d+\.\s/, '')}</li>;
                    } else if (line.startsWith('---')) {
                      return <hr key={i} className="border-white/10 my-6" />;
                    } else if (line.trim()) {
                      return <p key={i} className="text-gray-300 leading-relaxed">{line}</p>;
                    }
                    return null;
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-20 h-20 bg-gray-700 rounded-2xl flex items-center justify-center mb-4">
                    <Activity className="w-10 h-10 text-gray-500" />
                  </div>
                  <p className="text-gray-400 text-lg mb-2">No Analysis Yet</p>
                  <p className="text-gray-600 text-sm max-w-xs">
                    Upload a medical image and click analyze to generate a comprehensive AI-powered report
                  </p>
                </div>
              )}
            </div>

            {report && (
              <button
                onClick={handleDownloadReport}
                className="w-full mt-4 bg-white hover:bg-gray-200 text-black py-3 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download Report
              </button>
            )}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="max-w-7xl mx-auto mt-8 text-center">
          <p className="text-gray-600 text-sm">
            ⚕️ For demonstration purposes only. Always consult qualified healthcare professionals for medical diagnosis and treatment.
          </p>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.4);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.6);
        }
        @keyframes slideIn {
          from {
            transform: translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

export default MedicalAnalysisPage;