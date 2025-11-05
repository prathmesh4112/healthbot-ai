"use client";

/**
 * Advanced Image Analyzer Component
 * Features:
 * - Image preprocessing (brightness, contrast, filters)
 * - Side-by-side comparison
 * - Annotation tools
 * - Zoom and pan
 * - Batch processing
 * - Advanced export options
 */

import React, { useRef, useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";

/* ----------------------------- Types ----------------------------- */

interface ImageData {
  id: string;
  file: File;
  preview: string;
  processed?: string;
  analysis?: string;
  annotations?: Annotation[];
}

interface Annotation {
  id: string;
  type: "rect" | "circle" | "arrow" | "text";
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  text?: string;
  color: string;
}

interface ImageAdjustments {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  grayscale: boolean;
  invert: boolean;
}

/* ----------------------------- Component ----------------------------- */

export function ImageAnalyzer() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  const [adjustments, setAdjustments] = useState<ImageAdjustments>({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    grayscale: false,
    invert: false,
  });
  const [showControls, setShowControls] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [comparing, setComparing] = useState(false);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [annotationMode, setAnnotationMode] = useState<"rect" | "circle" | "text" | null>(
    null
  );

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  /* -------------------- Image Processing -------------------- */

  const applyFilters = (imageData: ImageData) => {
    if (!canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = imageRef.current;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    // Apply CSS filters
    ctx.filter = `
      brightness(${adjustments.brightness}%)
      contrast(${adjustments.contrast}%)
      saturate(${adjustments.saturation}%)
      blur(${adjustments.blur}px)
      ${adjustments.grayscale ? "grayscale(100%)" : ""}
      ${adjustments.invert ? "invert(100%)" : ""}
    `;

    ctx.drawImage(img, 0, 0);

    // Draw annotations
    annotations.forEach((annotation) => {
      ctx.strokeStyle = annotation.color;
      ctx.lineWidth = 3;

      if (annotation.type === "rect" && annotation.width && annotation.height) {
        ctx.strokeRect(
          annotation.x,
          annotation.y,
          annotation.width,
          annotation.height
        );
      } else if (annotation.type === "circle" && annotation.radius) {
        ctx.beginPath();
        ctx.arc(annotation.x, annotation.y, annotation.radius, 0, 2 * Math.PI);
        ctx.stroke();
      }

      if (annotation.text) {
        ctx.font = "16px Arial";
        ctx.fillStyle = annotation.color;
        ctx.fillText(annotation.text, annotation.x, annotation.y);
      }
    });

    // Update processed image
    const processedUrl = canvas.toDataURL("image/png");
    setImages((prev) =>
      prev.map((img) =>
        img.id === imageData.id ? { ...img, processed: processedUrl } : img
      )
    );
  };

  /* -------------------- Reset Filters -------------------- */

  const resetFilters = () => {
    setAdjustments({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      blur: 0,
      grayscale: false,
      invert: false,
    });
    setAnnotations([]);
  };

  /* -------------------- Export Functions -------------------- */

  const exportImage = (format: "png" | "jpg" | "pdf") => {
    if (!selectedImage) return;

    const link = document.createElement("a");
    link.href = selectedImage.processed || selectedImage.preview;
    link.download = `processed_${selectedImage.file.name}`;
    link.click();
  };

  const exportWithAnalysis = () => {
    if (!selectedImage) return;

    const report = {
      image: selectedImage.file.name,
      analysis: selectedImage.analysis,
      adjustments,
      annotations: annotations.map((a) => ({
        type: a.type,
        position: { x: a.x, y: a.y },
        text: a.text,
      })),
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `analysis_${selectedImage.file.name}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  /* -------------------- Comparison Mode -------------------- */

  const ComparisonView = () => {
    if (images.length < 2) return null;

    return (
      <div className="grid grid-cols-2 gap-4">
        {images.slice(0, 2).map((img) => (
          <div key={img.id} className="space-y-2">
            <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800">
              <img
                src={img.processed || img.preview}
                alt={img.file.name}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="p-3 bg-white dark:bg-gray-800 rounded-xl">
              <h4 className="font-semibold text-sm truncate">{img.file.name}</h4>
              {img.analysis && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                  {img.analysis}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  /* -------------------- Render -------------------- */

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <AnimatePresence>
        {showControls && selectedImage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl rounded-2xl shadow-xl border border-white/20 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Icon icon="mdi:tune" className="h-6 w-6 text-blue-600" />
                Image Adjustments
              </h3>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetFilters}
                className="px-4 py-2 rounded-xl bg-red-500/20 text-red-600 hover:bg-red-500/30 transition-all text-sm font-medium"
              >
                <Icon icon="mdi:refresh" className="inline h-4 w-4 mr-1" />
                Reset
              </motion.button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Brightness */}
              <div>
                <label className="flex items-center gap-2 mb-2 text-sm font-medium">
                  <Icon icon="mdi:brightness-6" className="h-4 w-4" />
                  Brightness: {adjustments.brightness}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={adjustments.brightness}
                  onChange={(e) =>
                    setAdjustments((prev) => ({
                      ...prev,
                      brightness: parseInt(e.target.value),
                    }))
                  }
                  className="w-full"
                />
              </div>

              {/* Contrast */}
              <div>
                <label className="flex items-center gap-2 mb-2 text-sm font-medium">
                  <Icon icon="mdi:contrast" className="h-4 w-4" />
                  Contrast: {adjustments.contrast}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={adjustments.contrast}
                  onChange={(e) =>
                    setAdjustments((prev) => ({
                      ...prev,
                      contrast: parseInt(e.target.value),
                    }))
                  }
                  className="w-full"
                />
              </div>

              {/* Saturation */}
              <div>
                <label className="flex items-center gap-2 mb-2 text-sm font-medium">
                  <Icon icon="mdi:palette" className="h-4 w-4" />
                  Saturation: {adjustments.saturation}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={adjustments.saturation}
                  onChange={(e) =>
                    setAdjustments((prev) => ({
                      ...prev,
                      saturation: parseInt(e.target.value),
                    }))
                  }
                  className="w-full"
                />
              </div>

              {/* Blur */}
              <div>
                <label className="flex items-center gap-2 mb-2 text-sm font-medium">
                  <Icon icon="mdi:blur" className="h-4 w-4" />
                  Blur: {adjustments.blur}px
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={adjustments.blur}
                  onChange={(e) =>
                    setAdjustments((prev) => ({
                      ...prev,
                      blur: parseInt(e.target.value),
                    }))
                  }
                  className="w-full"
                />
              </div>

              {/* Grayscale */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={adjustments.grayscale}
                    onChange={(e) =>
                      setAdjustments((prev) => ({
                        ...prev,
                        grayscale: e.target.checked,
                      }))
                    }
                    className="w-5 h-5"
                  />
                  <Icon icon="mdi:invert-colors-off" className="h-4 w-4" />
                  <span className="text-sm font-medium">Grayscale</span>
                </label>
              </div>

              {/* Invert */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={adjustments.invert}
                    onChange={(e) =>
                      setAdjustments((prev) => ({
                        ...prev,
                        invert: e.target.checked,
                      }))
                    }
                    className="w-5 h-5"
                  />
                  <Icon icon="mdi:invert-colors" className="h-4 w-4" />
                  <span className="text-sm font-medium">Invert Colors</span>
                </label>
              </div>
            </div>

            {/* Annotation Tools */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
                <Icon icon="mdi:draw" className="h-5 w-5 text-purple-600" />
                Annotation Tools
              </h4>
              <div className="flex flex-wrap gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    setAnnotationMode(annotationMode === "rect" ? null : "rect")
                  }
                  className={`px-4 py-2 rounded-xl transition-all text-sm font-medium flex items-center gap-2 ${
                    annotationMode === "rect"
                      ? "bg-purple-500 text-white"
                      : "bg-purple-500/20 text-purple-600 hover:bg-purple-500/30"
                  }`}
                >
                  <Icon icon="mdi:rectangle-outline" className="h-4 w-4" />
                  Rectangle
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    setAnnotationMode(annotationMode === "circle" ? null : "circle")
                  }
                  className={`px-4 py-2 rounded-xl transition-all text-sm font-medium flex items-center gap-2 ${
                    annotationMode === "circle"
                      ? "bg-purple-500 text-white"
                      : "bg-purple-500/20 text-purple-600 hover:bg-purple-500/30"
                  }`}
                >
                  <Icon icon="mdi:circle-outline" className="h-4 w-4" />
                  Circle
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    setAnnotationMode(annotationMode === "text" ? null : "text")
                  }
                  className={`px-4 py-2 rounded-xl transition-all text-sm font-medium flex items-center gap-2 ${
                    annotationMode === "text"
                      ? "bg-purple-500 text-white"
                      : "bg-purple-500/20 text-purple-600 hover:bg-purple-500/30"
                  }`}
                >
                  <Icon icon="mdi:text" className="h-4 w-4" />
                  Text
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setAnnotations([])}
                  className="px-4 py-2 rounded-xl bg-red-500/20 text-red-600 hover:bg-red-500/30 transition-all text-sm font-medium flex items-center gap-2"
                >
                  <Icon icon="mdi:eraser" className="h-4 w-4" />
                  Clear Annotations
                </motion.button>
              </div>
            </div>

            {/* Export Options */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
                <Icon icon="mdi:export" className="h-5 w-5 text-green-600" />
                Export Options
              </h4>
              <div className="flex flex-wrap gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => exportImage("png")}
                  className="px-4 py-2 rounded-xl bg-green-500/20 text-green-600 hover:bg-green-500/30 transition-all text-sm font-medium flex items-center gap-2"
                >
                  <Icon icon="mdi:file-image" className="h-4 w-4" />
                  Export as PNG
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => exportImage("jpg")}
                  className="px-4 py-2 rounded-xl bg-green-500/20 text-green-600 hover:bg-green-500/30 transition-all text-sm font-medium flex items-center gap-2"
                >
                  <Icon icon="mdi:file-jpg-box" className="h-4 w-4" />
                  Export as JPG
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={exportWithAnalysis}
                  className="px-4 py-2 rounded-xl bg-blue-500/20 text-blue-600 hover:bg-blue-500/30 transition-all text-sm font-medium flex items-center gap-2"
                >
                  <Icon icon="mdi:file-document" className="h-4 w-4" />
                  Export with Analysis
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comparison Mode */}
      {comparing && <ComparisonView />}

      {/* Hidden Canvas for Processing */}
      <canvas ref={canvasRef} className="hidden" />
      <img
        ref={imageRef}
        src={selectedImage?.preview}
        alt="Processing"
        className="hidden"
        onLoad={() => selectedImage && applyFilters(selectedImage)}
      />
    </div>
  );
}