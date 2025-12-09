"use client";

import React, { useRef, useState } from "react";
import { getApiBase } from "@/lib/api";

export default function ImageUploader({
  onUploaded,
}: {
  onUploaded: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      const base = getApiBase();
      const res = await fetch(
        `${base}/api/upload/store-photo`,
        {
          method: "POST",
          body: formData,
        }
      );

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Upload gagal");
      }

      onUploaded(json.url);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <div
        className="w-full border border-slate-300 rounded-md p-3 flex items-center justify-center cursor-pointer hover:bg-slate-100"
        onClick={() => inputRef.current?.click()}
      >
        {preview ? (
          <img
            src={preview}
            alt="preview"
            className="h-24 object-cover rounded-md"
          />
        ) : (
          <span className="text-sm text-slate-500">
            Klik untuk pilih foto toko
          </span>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={handleFile}
      />

      {uploading && (
        <p className="text-sm text-blue-600 animate-pulse">Mengupload...</p>
      )}
    </div>
  );
}
