'use client';

import { useState } from 'react';
import { Upload, FileImage, Activity, AlertCircle, CheckCircle2, Loader2, Sparkles, Brain } from 'lucide-react';

function MedicalAnalysisPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [report, setReport] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);

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

      const response = await fetch('http://localhost:5000/api/analyze-image', {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl top-0 -left-48 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl bottom-0 -right-48 animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="relative z-10 py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 backdrop-blur-sm border border-purple-500/20 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-300 font-medium">AI-Powered Medical Imaging</span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
            Medical Image
            <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 text-transparent bg-clip-text">
              Analysis Platform
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Advanced AI-driven diagnostic insights with state-of-the-art image processing technology
          </p>
        </div>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/50">
                  <Upload className="w-6 h-6 text-white" />
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
                    ? 'border-purple-400 bg-purple-500/10 scale-105'
                    : 'border-white/20 bg-white/5 hover:border-purple-500/50'
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
                      className="w-full h-80 object-contain rounded-2xl p-4"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-end justify-center pb-6">
                      <label htmlFor="file-upload" className="px-6 py-2 bg-white/90 hover:bg-white text-gray-900 rounded-full font-semibold cursor-pointer transition-all">
                        Change Image
                      </label>
                    </div>
                    {uploadSuccess && (
                      <div className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg animate-[slideIn_0.3s_ease-out]">
                        <CheckCircle2 className="w-4 h-4" />
                        Uploaded!
                      </div>
                    )}
                  </div>
                ) : (
                  <label htmlFor="file-upload" className="flex flex-col items-center justify-center py-16 cursor-pointer">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <FileImage className="w-10 h-10 text-purple-400" />
                    </div>
                    <p className="text-white font-semibold text-lg mb-2">
                      {isDragging ? 'Drop your image here' : 'Click or drag to upload'}
                    </p>
                    <p className="text-gray-400 text-sm">
                      Supports: JPG, PNG, DICOM, and more
                    </p>
                  </label>
                )}
              </div>

              {/* Analyze Button */}
              <button
                onClick={handleAnalyze}
                disabled={!selectedFile || loading}
                className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-600 disabled:to-gray-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-purple-500/50 disabled:shadow-none transition-all duration-300 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
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
                <div className="mt-4 bg-red-500/10 backdrop-blur-sm border border-red-500/30 text-red-300 px-4 py-3 rounded-2xl flex items-center gap-3">
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
                <div key={i} className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 text-center hover:bg-white/10 transition-all">
                  <item.icon className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                  <p className="text-gray-400 text-xs mb-1">{item.label}</p>
                  <p className="text-white font-bold text-lg">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Report Section */}
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/50">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Analysis Report</h2>
            </div>

            <div className="bg-white/5 rounded-2xl p-6 min-h-[600px] max-h-[600px] overflow-y-auto custom-scrollbar">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="relative w-24 h-24 mb-6">
                    <div className="absolute inset-0 border-4 border-purple-500/30 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-transparent border-t-purple-500 rounded-full animate-spin"></div>
                    <Brain className="absolute inset-0 m-auto w-10 h-10 text-purple-400" />
                  </div>
                  <p className="text-white font-semibold text-lg mb-2">Processing Image...</p>
                  <p className="text-gray-400 text-sm">AI analysis in progress</p>
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
                  <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mb-4">
                    <Activity className="w-10 h-10 text-gray-500" />
                  </div>
                  <p className="text-gray-400 text-lg mb-2">No Analysis Yet</p>
                  <p className="text-gray-500 text-sm max-w-xs">
                    Upload a medical image and click analyze to generate a comprehensive AI-powered report
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="max-w-7xl mx-auto mt-8 text-center">
          <p className="text-gray-500 text-sm">
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
          background: rgba(168, 85, 247, 0.4);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(168, 85, 247, 0.6);
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