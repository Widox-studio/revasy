"use client";

import React, { useState, useRef } from "react";
import { Upload, Image as ImageIcon, Trash2, Link as LinkIcon, Check, RefreshCw } from "lucide-react";

interface LogoUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  businessName?: string;
  accentColor?: string;
  className?: string;
}

export function optimizeImageFile(file: File, maxDim = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    // Preserve vector SVGs as-is
    if (file.type === "image/svg+xml") {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        try {
          const webpData = canvas.toDataURL("image/webp", 0.9);
          resolve(webpData);
        } catch {
          resolve(canvas.toDataURL("image/png"));
        }
      };
      img.onerror = () => reject(new Error("Failed to load image file"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export function LogoUploader({
  value = "",
  onChange,
  businessName = "Business",
  accentColor = "#0d9488",
  className = "",
}: LogoUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [mode, setMode] = useState<"upload" | "url">(value?.startsWith("http") ? "url" : "upload");
  const [urlInput, setUrlInput] = useState(value?.startsWith("http") ? value : "");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileChange = async (file?: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please select a valid image file (PNG, JPG, WebP, SVG).");
      return;
    }

    // Limit upload source file to 8MB
    if (file.size > 8 * 1024 * 1024) {
      setErrorMsg("Image file is too large. Please select a file under 8MB.");
      return;
    }

    setErrorMsg(null);
    setIsProcessing(true);

    try {
      const optimized = await optimizeImageFile(file, 256);
      onChange(optimized);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to process image.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileChange(file);
  };

  const handleUrlApply = () => {
    if (!urlInput.trim()) {
      onChange("");
      return;
    }
    onChange(urlInput.trim());
  };

  const handleRemove = () => {
    onChange("");
    setUrlInput("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-muted">
          Business Logo
        </label>
        <div className="flex items-center gap-2 text-[11px]">
          <button
            type="button"
            onClick={() => setMode("upload")}
            className={`px-2 py-0.5 rounded font-medium transition-colors ${
              mode === "upload" ? "bg-slate-200 text-ink" : "text-muted hover:text-ink"
            }`}
          >
            Upload File
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => setMode("url")}
            className={`px-2 py-0.5 rounded font-medium transition-colors ${
              mode === "url" ? "bg-slate-200 text-ink" : "text-muted hover:text-ink"
            }`}
          >
            Image URL
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl border border-hairline bg-slate-50/70">
        {/* Preview Avatar */}
        <div className="relative group shrink-0">
          <div className="w-16 h-16 rounded-2xl bg-white border border-hairline shadow-sm overflow-hidden flex items-center justify-center p-1">
            {value ? (
              <img
                src={value}
                alt={`${businessName} logo`}
                className="w-full h-full object-contain rounded-xl"
                onError={() => setErrorMsg("Could not load image from provided URL")}
              />
            ) : (
              <div
                className="w-full h-full rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-2xs"
                style={{ backgroundColor: accentColor }}
              >
                {businessName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          {value && (
            <button
              type="button"
              onClick={handleRemove}
              title="Remove logo"
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-xs transition-transform hover:scale-110"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Input / Action Controls */}
        <div className="flex-1 w-full space-y-2">
          {mode === "upload" ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`cursor-pointer border-2 border-dashed rounded-xl p-3 text-center transition-all ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-slate-300 hover:border-slate-400 bg-white"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                onChange={(e) => handleFileChange(e.target.files?.[0])}
                className="hidden"
              />
              <div className="flex items-center justify-center gap-2 text-xs text-ink">
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-primary" />
                    <span>Optimizing logo image...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5 text-muted-soft" />
                    <span className="font-medium text-primary">
                      {value ? "Click to replace logo" : "Upload logo"}
                    </span>
                    <span className="text-muted text-[11px] hidden sm:inline">
                      or drag & drop
                    </span>
                  </>
                )}
              </div>
              <p className="text-[10px] text-muted mt-0.5">
                PNG, JPG, WebP, or SVG (optimized automatically)
              </p>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/logo.png"
                className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-hairline bg-white focus:ring-1 focus:ring-primary outline-none"
              />
              <button
                type="button"
                onClick={handleUrlApply}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors shrink-0"
              >
                Apply
              </button>
            </div>
          )}

          {errorMsg && (
            <p className="text-[11px] text-rose-600 font-medium">
              {errorMsg}
            </p>
          )}

          {value && !errorMsg && (
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium">
              <Check className="w-3 h-3 text-emerald-600" />
              <span>Logo configured • Displays on NFC stands, review pages, and dashboards</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
