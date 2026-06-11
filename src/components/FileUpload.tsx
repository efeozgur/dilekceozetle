"use client";

import { useState, useRef } from "react";
import { Upload, FileText, File, X, Loader2, AlertCircle } from "lucide-react";
import { parsePDF, parseUDF, FileParseError } from "@/lib/fileParser";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface FileUploadProps {
  onFileContent: (text: string) => void;
  accept?: ".pdf" | ".udf" | ".pdf,.udf";
  label?: string;
}

export function FileUpload({
  onFileContent,
  accept = ".pdf,.udf",
  label = "Dilekçe dosyası yükleyin",
}: FileUploadProps) {
  const { data: session } = useSession();
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isPro = session?.user?.subscription === "pro";

  if (!isPro) {
    return (
      <div className="border-2 border-dashed border-border rounded-2xl p-6 text-center bg-muted/30">
        <FileText className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground mb-2">
          Dosya yükleme Pro özelliği
        </p>
        <Link
          href="/upgrade"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary-dark bg-primary/5 border border-primary/20 px-3 py-1.5 rounded-xl hover:bg-primary/10 transition-all"
        >
          Pro&apos;ya Yükselt
        </Link>
      </div>
    );
  }

  async function processFile(file: File) {
    setLoading(true);
    setError(null);
    setFileName(file.name);

    try {
      let text: string;
      if (file.name.toLowerCase().endsWith(".pdf")) {
        text = await parsePDF(file);
      } else if (file.name.toLowerCase().endsWith(".udf")) {
        text = await parseUDF(file);
      } else {
        throw new FileParseError("Desteklenmeyen dosya formatı");
      }

      if (text.length < 50) {
        throw new FileParseError("Dosyadan yeterli metin çıkarılamadı (minimum 50 karakter)");
      }

      if (text.length > 100000) {
        throw new FileParseError("Dosya çok büyük (maksimum 100.000 karakter)");
      }

      onFileContent(text);
    } catch (err) {
      if (err instanceof FileParseError) {
        setError(err.message);
      } else {
        setError("Dosya işlenirken bir hata oluştu");
      }
    } finally {
      setLoading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    if (inputRef.current) inputRef.current.value = "";
  }

  function clearFile() {
    setFileName(null);
    setError(null);
  }

  return (
    <div className="space-y-2">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !loading && inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? "border-primary bg-primary/5"
            : fileName
            ? "border-emerald-300 bg-emerald-50/50"
            : "border-border hover:border-primary/30 hover:bg-muted/50"
        } ${loading ? "pointer-events-none opacity-70" : ""}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
        />

        {loading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Dosya işleniyor...</p>
          </div>
        ) : fileName ? (
          <div className="flex items-center justify-center gap-3">
            <div className="flex items-center gap-2">
              {fileName.endsWith(".pdf") ? (
                <FileText className="h-6 w-6 text-red-500" />
              ) : (
                <File className="h-6 w-6 text-blue-500" />
              )}
              <span className="text-sm font-medium text-foreground">{fileName}</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearFile();
              }}
              className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-8 w-8 text-muted-foreground/40" />
            <div>
              <p className="text-sm font-medium text-foreground">{label}</p>
              <p className="text-xs text-muted-foreground mt-1">
                PDF veya UDF dosyası (maks. 5MB)
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
