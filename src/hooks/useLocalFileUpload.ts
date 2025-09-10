import { useState, useCallback, useRef } from "react";

export type FileType = "image" | "video" | "pdf" | "any";

type SavedFile = {
  id: string;
  name: string;
  type: string;
  size: number;
  dataUrl: string;
  createdAt: string;
};

const STORAGE_KEY = "bcp_uploads";

export function useLocalFileUpload({
  type = "any",
  maxSizeMB = 10,
  onUploadComplete,
}: {
  type?: FileType;
  maxSizeMB?: number;
  onUploadComplete?: (filePath: string) => void;
} = {}) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const bucketStatus: "available" | "unavailable" = "available";
  // simple current user placeholder to keep UI enabled; replace with real auth if available
  const currentUser = { id: "local" };

  const progressRef = useRef<number | null>(null);

  const getAcceptedFileTypes = useCallback(() => {
    switch (type) {
      case "image":
        return ["image/*"];
      case "video":
        return ["video/*"];
      case "pdf":
        return [".pdf", "application/pdf"];
      case "any":
      default:
        return [];
    }
  }, [type]);

  const readFileAsDataUrl = (f: File) =>
    new Promise<string>((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(String(fr.result));
      fr.onerror = reject;
      fr.readAsDataURL(f);
    });

  const handleFileChange = useCallback(
    (ev: React.ChangeEvent<HTMLInputElement> | File) => {
      let f: File | null = null;
      if (ev instanceof Event || (ev as any).target) {
        const target = ev as React.ChangeEvent<HTMLInputElement>;
        f = target.target.files?.[0] ?? null;
      } else {
        f = ev as File;
      }
      if (!f) return;
      // size check
      if (f.size > maxSizeMB * 1024 * 1024) {
        setError(`File exceeds ${maxSizeMB} MB`);
        return;
      }
      setError(null);
      setFile(f);
    },
    [maxSizeMB]
  );

  const persistSavedFile = (saved: SavedFile) => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const existing: SavedFile[] = raw ? JSON.parse(raw) : [];
      localStorage.setItem(STORAGE_KEY, JSON.stringify([saved, ...existing]));
    } catch (e) {
      console.error("persist error", e);
      throw new Error("Failed to save file to localStorage");
    }
  };

  const uploadFile = useCallback(async () => {
    if (!file) {
      setError("No file selected");
      return;
    }
    setError(null);
    setUploading(true);
    setProgress(0);

    // simulate progress
    progressRef.current = window.setInterval(() => {
      setProgress((p) => {
        const next = Math.min(95, p + Math.floor(Math.random() * 12) + 5);
        return next;
      });
    }, 200);

    try {
      const dataUrl = await readFileAsDataUrl(file);
      const saved: SavedFile = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        name: file.name,
        type: file.type || "application/octet-stream",
        size: file.size,
        dataUrl,
        createdAt: new Date().toISOString(),
      };
      persistSavedFile(saved);
      // finish progress
      setProgress(100);
      if (progressRef.current) {
        window.clearInterval(progressRef.current);
        progressRef.current = null;
      }
      // small delay to let UI show 100%
      await new Promise((r) => setTimeout(r, 150));
      setUploading(false);
      setFile(null);

      // callback with stored id (or data URL if you prefer)
      onUploadComplete?.(saved.id);
    } catch (e: any) {
      console.error("upload failed", e);
      setError(e?.message ?? "Upload failed");
      setUploading(false);
      if (progressRef.current) {
        window.clearInterval(progressRef.current);
        progressRef.current = null;
      }
      setProgress(0);
    }
  }, [file, onUploadComplete]);

  const resetFile = useCallback(() => {
    setFile(null);
    setError(null);
    setUploading(false);
    setProgress(0);
    if (progressRef.current) {
      window.clearInterval(progressRef.current);
      progressRef.current = null;
    }
  }, []);

  return {
    file,
    uploading,
    progress,
    error,
    bucketStatus,
    getAcceptedFileTypes,
    handleFileChange,
    uploadFile,
    resetFile,
    currentUser,
  };
}