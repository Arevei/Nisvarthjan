"use client";

import { useRef, useState } from "react";
import { Upload, X, Camera } from "lucide-react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  label?: string;
};

export function MemberPhotoUpload({ value, onChange, label }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string>(value || "");

  const handleUpload = async (file: File) => {
    // Validate file size (500KB)
    const maxSize = 500 * 1024;
    if (file.size > maxSize) {
      setError("Image must be 500KB or less");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setIsUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/cloudinary/upload", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !payload.url) {
        throw new Error(payload.error || "Upload failed");
      }

      onChange(payload.url);
      setPreview(payload.url);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed");
      setPreview("");
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = () => {
    onChange("");
    setPreview("");
    setError("");
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium text-zinc-700">{label}</label>}

      <div className="flex flex-col items-center gap-3 sm:flex-row">
        {/* Photo preview area */}
        <div
          className="relative h-28 w-28 cursor-pointer overflow-hidden rounded-full border-2 border-dashed border-rose-300 bg-rose-50 transition-colors hover:border-rose-400"
          onClick={() => !isUploading && inputRef.current?.click()}
        >
          {preview ? (
            <img src={preview} alt="Preview" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-rose-400">
              <Camera className="h-8 w-8" />
              <span className="mt-1 text-xs">Add Photo</span>
            </div>
          )}

          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
            </div>
          )}
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-2 rounded-md border border-rose-400 bg-white px-4 py-2 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-50 disabled:opacity-50"
              disabled={isUploading}
            >
              <Upload className="h-4 w-4" />
              {isUploading ? "Uploading..." : "Upload Photo"}
            </button>

            {preview && (
              <button
                type="button"
                onClick={handleRemove}
                className="flex items-center gap-1 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-50"
              >
                <X className="h-4 w-4" />
                Remove
              </button>
            )}
          </div>

          <p className="text-xs text-zinc-500">
            Upload a passport-size photo for your ID card. Max file size: 500KB. Supported formats: JPG, PNG
          </p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) handleUpload(file);
        }}
      />

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}