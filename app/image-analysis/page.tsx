"use client";

/**
 * Advanced Medical Image Analysis Tool
 * Features:
 * - Multi-image upload with drag & drop
 * - Real-time AI analysis using Hugging Face
 * - Advanced image preprocessing
 * - Comparison mode for multiple images
 * - Export analysis reports
 * - History tracking with thumbnails
 * - Advanced glassmorphism UI
 * - Smooth animations and transitions
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

/* ----------------------------- Types ----------------------------- */

type AnalysisResult = {
  id: string;
  imageUrl: string;
  imageName: string;
  timestamp: string;
  analysis: string;
  confidence?: number;
  tags?: string[];
  processing?: boolean;
  error?: string;
};

type Toast = {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
};

/* ------------------------ Animated Background ------------------------- */

function AnimatedMeshBackground({ darkMode }: { darkMode: boolean }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
      <motion.div
        className="absolute -top-1/2 -left-1/2 w-full h-full rounded-full blur-3xl"
        style={{
          background: darkMode
            ? "radial-gradient(circle, rgba(34, 211, 238, 0.3) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(56, 189, 248, 0.3) 0%, transparent 70%)",
        }}
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute -bottom-1/2 -right-1/2 w-full h-full rounded-full blur-3xl"
        style={{
          background: darkMode
            ? "radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(196, 181, 253, 0.3) 0%, transparent 70%)",
        }}
        animate={{
          x: [0, -100, 0],
          y: [0, -50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}

/* ------------------------- Floating Particles ------------------------- */

function FloatingParticles({ count = 30, darkMode }: { count?: number; darkMode: boolean }) {
  const [particles, setParticles] = useState<
    { top: string; left: string; delay: number; duration: number }[]
  >([]);

  useEffect(() => {
    const positions = Array.from({ length: count }).map(() => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      delay: Math.random() * 5,
      duration: 15 + Math.random() * 10,
    }));
    setParticles(positions);
  }, [count]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className={`absolute w-1 h-1 rounded-full ${
            darkMode ? "bg-cyan-400" : "bg-blue-400"
          }`}
          style={{ top: p.top, left: p.left }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 0.6, 0],
            scale: [0, 1.5, 0],
            y: [0, -100, -200],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "easeOut",
            delay: p.delay,
          }}
        />
      ))}
    </div>
  );
}

/* ------------------------- Toast Notification ------------------------ */

function ToastNotification({
  toasts,
  removeToast,
}: {
  toasts: Toast[];
  removeToast: (id: string) => void;
}) {
  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            className={`px-4 py-3 rounded-xl shadow-2xl backdrop-blur-xl border flex items-center gap-3 min-w-[280px] ${
              toast.type === "success"
                ? "bg-green-500/90 text-white border-green-400"
                : toast.type === "error"
                ? "bg-red-500/90 text-white border-red-400"
                : toast.type === "warning"
                ? "bg-orange-500/90 text-white border-orange-400"
                : "bg-blue-500/90 text-white border-blue-400"
            }`}
          >
            <Icon
              icon={
                toast.type === "success"
                  ? "mdi:check-circle"
                  : toast.type === "error"
                  ? "mdi:alert-circle"
                  : toast.type === "warning"
                  ? "mdi:alert"
                  : "mdi:information"
              }
              className="h-5 w-5"
            />
            <span className="flex-1 text-sm font-medium">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="hover:bg-white/20 rounded p-1"
            >
              <Icon icon="mdi:close" className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------- Storage Helpers ------------------------ */

const STORAGE_KEY = "healthbot_image_analysis_history";

function loadHistory(): AnalysisResult[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch {
    return [];
  }
}

function saveHistory(history: AnalysisResult[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {
    // ignore
  }
}

/* ----------------------------- Main Component ------------------------------ */

export default function ImageAnalysisPage() {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult | null>(null);
  const [compareMode, setCompareMode] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<AnalysisResult | null>(
    null
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  /* -------------------- Toast System -------------------- */

  const addToast = (message: string, type: Toast["type"] = "info") => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  /* -------------------- Initial Load -------------------- */

  useEffect(() => {
    const saved = loadHistory();
    setHistory(saved);
  }, []);

  useEffect(() => {
    saveHistory(history);
  }, [history]);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [darkMode]);

  /* -------------------- File Handling -------------------- */

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;

    const validFiles: File[] = [];
    const validUrls: string[] = [];

    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        if (file.size > 10 * 1024 * 1024) {
          addToast("Image too large (max 10MB)", "warning");
          return;
        }
        validFiles.push(file);
        validUrls.push(URL.createObjectURL(file));
      } else {
        addToast("Only image files are allowed", "error");
      }
    });

    if (validFiles.length > 0) {
      setSelectedImages((prev) => [...prev, ...validFiles]);
      setPreviewUrls((prev) => [...prev, ...validUrls]);
      addToast(`${validFiles.length} image(s) added`, "success");
    }
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect]
  );

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    addToast("Image removed", "info");
  };

  const clearAllImages = () => {
    previewUrls.forEach((url) => URL.revokeObjectURL(url));
    setSelectedImages([]);
    setPreviewUrls([]);
    setCurrentAnalysis(null);
    addToast("All images cleared", "info");
  };

  /* -------------------- Analysis Function -------------------- */

  const analyzeImages = async () => {
    if (selectedImages.length === 0) {
      addToast("Please select at least one image", "warning");
      return;
    }

    setAnalyzing(true);
    addToast("Starting analysis...", "info");

    try {
      const formData = new FormData();
      selectedImages.forEach((file) => {
        formData.append("images", file);
      });
      formData.append("compareMode", compareMode.toString());

      const response = await fetch("/api/analyze-image", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      const result: AnalysisResult = {
        id: Date.now().toString(),
        imageUrl: previewUrls[0],
        imageName: selectedImages[0].name,
        timestamp: new Date().toISOString(),
        analysis: data.analysis || "Analysis completed",
        confidence: data.confidence,
        tags: data.tags || [],
      };

      setCurrentAnalysis(result);
      setHistory((prev) => [result, ...prev.slice(0, 49)]);
      addToast("Analysis completed!", "success");
    } catch (error) {
      console.error("Analysis error:", error);
      addToast(
        error instanceof Error ? error.message : "Analysis failed",
        "error"
      );
    } finally {
      setAnalyzing(false);
    }
  };

  /* -------------------- Export Functions -------------------- */

  const exportAnalysis = () => {
    if (!currentAnalysis) return;

    const report = {
      ...currentAnalysis,
      exportDate: new Date().toISOString(),
      disclaimer:
        "This AI analysis is for informational purposes only and not medical advice.",
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analysis_${currentAnalysis.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast("Analysis exported", "success");
  };

  const copyAnalysis = () => {
    if (!currentAnalysis) return;
    navigator.clipboard.writeText(currentAnalysis.analysis);
    addToast("Copied to clipboard", "success");
  };

  /* -------------------- Render -------------------- */

  return (
    <div
      className={`flex flex-col h-screen w-full relative overflow-hidden transition-colors duration-500 ${
        darkMode ? "bg-gray-950 text-white" : "bg-gray-50 text-black"
      }`}
    >
      <AnimatedMeshBackground darkMode={darkMode} />
      <FloatingParticles count={20} darkMode={darkMode} />
      <ToastNotification toasts={toasts} removeToast={removeToast} />

      {/* Header */}
      <header
        className={`sticky top-0 z-40 h-20 border-b border-white/10 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 text-white backdrop-blur-2xl shadow-xl`}
      >
        <div className="h-full px-6 flex items-center justify-between max-w-[1800px] mx-auto">
          <div className="flex items-center gap-4">
            <Link href="/">
              <motion.button
                whileHover={{ scale: 1.1, x: -4 }}
                whileTap={{ scale: 0.9 }}
                className="p-2.5 rounded-xl hover:bg-white/20 transition"
                title="Back to chat"
              >
                <Icon icon="mdi:arrow-left" className="h-6 w-6" />
              </motion.button>
            </Link>

            <motion.div
              className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center border border-white/30"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Icon icon="mdi:image-search" className="h-7 w-7 text-white" />
            </motion.div>

            <div>
              <h1 className="text-lg font-bold">Medical Image Analysis</h1>
              <div className="flex items-center gap-2 text-sm opacity-90">
                <motion.div
                  className="w-2 h-2 bg-green-400 rounded-full"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [1, 0.5, 1],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span>AI-Powered • Hugging Face</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowHistory(!showHistory)}
              className="p-2.5 rounded-xl hover:bg-white/20 transition"
              title="View history"
            >
              <Icon icon="mdi:history" className="h-6 w-6" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setDarkMode((d) => !d)}
              className="p-2.5 rounded-xl hover:bg-white/20 transition"
              title="Toggle theme"
            >
              <Icon
                icon={
                  darkMode
                    ? "mdi:white-balance-sunny"
                    : "mdi:moon-waning-crescent"
                }
                className="h-6 w-6"
              />
            </motion.button>
          </div>
        </div>
      </header>

      {/* Disclaimer Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 py-3 border-b border-white/10 bg-amber-500/10 backdrop-blur-xl relative z-30"
      >
        <div className="max-w-[1800px] mx-auto flex items-center gap-3 text-sm">
          <Icon
            icon="mdi:shield-alert"
            className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0"
          />
          <span className="text-gray-700 dark:text-gray-300 flex-1">
            <strong>Medical Disclaimer:</strong> AI image analysis is for
            informational and educational purposes only. This is NOT a diagnostic
            tool. Always consult qualified healthcare professionals for medical
            diagnosis and treatment.
          </span>
          <span className="text-xs opacity-70 hidden lg:block">
            Powered by Hugging Face
          </span>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex">
        {/* History Sidebar */}
        <AnimatePresence>
          {showHistory && (
            <>
              <motion.div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowHistory(false)}
              />

              <motion.aside
                initial={{ x: -400 }}
                animate={{ x: 0 }}
                exit={{ x: -400 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed lg:static z-50 h-full w-96 flex flex-col border-r border-white/10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl shadow-2xl"
              >
                <div className="px-5 py-4 border-b border-white/10 bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon icon="mdi:history" className="h-6 w-6" />
                      <h3 className="font-bold">Analysis History</h3>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowHistory(false)}
                      className="p-2 rounded-xl hover:bg-white/20 lg:hidden"
                    >
                      <Icon icon="mdi:close" className="h-6 w-6" />
                    </motion.button>
                  </div>
                  <p className="text-xs mt-1 opacity-90">
                    {history.length} analyses stored
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {history.length === 0 && (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                      <Icon
                        icon="mdi:image-off"
                        className="h-16 w-16 mx-auto mb-3 opacity-50"
                      />
                      <p className="text-sm">No analysis history yet</p>
                    </div>
                  )}

                  <AnimatePresence mode="popLayout">
                    {history.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        whileHover={{ scale: 1.02, x: 4 }}
                        className={`p-3 rounded-2xl border-2 transition-all cursor-pointer ${
                          selectedHistoryItem?.id === item.id
                            ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-transparent"
                            : "bg-white/50 dark:bg-gray-800/50 border-transparent hover:border-cyan-500/30"
                        }`}
                        onClick={() => {
                          setSelectedHistoryItem(item);
                          setCurrentAnalysis(item);
                          setShowHistory(false);
                        }}
                      >
                        <div className="flex gap-3">
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                            <img
                              src={item.imageUrl}
                              alt={item.imageName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm truncate">
                              {item.imageName}
                            </h4>
                            <p
                              className={`text-xs mt-1 line-clamp-2 ${
                                selectedHistoryItem?.id === item.id
                                  ? "text-white/80"
                                  : "text-gray-600 dark:text-gray-400"
                              }`}
                            >
                              {item.analysis}
                            </p>
                            <span
                              className={`text-xs mt-1 block ${
                                selectedHistoryItem?.id === item.id
                                  ? "text-white/70"
                                  : "text-gray-500"
                              }`}
                            >
                              {new Date(item.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <div className="border-t border-white/10 p-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      if (confirm("Clear all history?")) {
                        setHistory([]);
                        setSelectedHistoryItem(null);
                        addToast("History cleared", "info");
                      }
                    }}
                    className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-medium shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Icon icon="mdi:delete-sweep" className="h-5 w-5" />
                    Clear All History
                  </motion.button>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Analysis Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-[1400px] mx-auto space-y-6">
            {/* Upload Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                    <Icon icon="mdi:cloud-upload" className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Upload Medical Images</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Drag & drop or click to select images
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 cursor-pointer px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium shadow-lg hover:shadow-xl transition-all">
                    <Icon icon="mdi:compare" className="h-5 w-5" />
                    <span>Compare Mode</span>
                    <input
                      type="checkbox"
                      checked={compareMode}
                      onChange={(e) => setCompareMode(e.target.checked)}
                      className="ml-2"
                    />
                  </label>
                </div>
              </div>

              {/* Drop Zone */}
              <div
                ref={dropZoneRef}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-3 border-dashed rounded-3xl p-12 transition-all cursor-pointer ${
                  dragActive
                    ? "border-cyan-500 bg-cyan-500/10 scale-[1.02]"
                    : "border-gray-300 dark:border-gray-700 hover:border-cyan-500 hover:bg-cyan-500/5"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="hidden"
                />

                <div className="text-center">
                  <motion.div
                    animate={{ y: dragActive ? -10 : [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="mb-4"
                  >
                    <Icon
                      icon="mdi:cloud-upload"
                      className={`h-20 w-20 mx-auto ${
                        dragActive
                          ? "text-cyan-500"
                          : "text-gray-400 dark:text-gray-600"
                      }`}
                    />
                  </motion.div>
                  <p className="text-lg font-semibold mb-2">
                    {dragActive
                      ? "Drop images here"
                      : "Drag & drop images or click to browse"}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Supports: JPG, PNG, WebP, GIF (Max 10MB per image)
                  </p>
                  <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <Icon icon="mdi:shield-check" className="h-4 w-4" />
                      <span>Secure Upload</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon icon="mdi:lightning-bolt" className="h-4 w-4" />
                      <span>Fast Analysis</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon icon="mdi:brain" className="h-4 w-4" />
                      <span>AI-Powered</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Image Previews */}
              {previewUrls.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold">Selected Images ({previewUrls.length})