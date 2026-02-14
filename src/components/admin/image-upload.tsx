"use client";

import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload, X, ImageIcon } from "lucide-react";
import Image from "next/image";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const { url } = await res.json();
        onChange(url);
      }
    } catch {
      console.error("Upload failed");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      {value ? (
        <div className="relative inline-block">
          <Image
            src={value}
            alt="Uploaded"
            width={200}
            height={200}
            className="border-border rounded-md border object-cover"
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="bg-destructive text-destructive-foreground absolute -top-2 -right-2 rounded-full p-1"
          >
            <X className="size-3" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          className="border-border hover:bg-accent flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed p-8 transition-colors"
        >
          <ImageIcon className="text-muted-foreground size-8" />
          <p className="text-muted-foreground text-sm">
            Click to upload an image
          </p>
        </div>
      )}
      <div className="flex items-center gap-2">
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Or paste image URL"
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
        >
          <Upload className="size-4" />
        </Button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
