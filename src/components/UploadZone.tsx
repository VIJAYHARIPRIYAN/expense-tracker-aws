import { useState, useCallback } from 'react';
import { Upload, FileText, X, Check } from 'lucide-react';
import { analyzeUploadedFile, buildValidationMessage, isSupportedExpenseFile, type AnalyticsSnapshot } from '../lib/expenseAnalytics';

interface UploadZoneProps {
  onFileUpload: (data: AnalyticsSnapshot, file: File) => void;
}

export default function UploadZone({ onFileUpload }: UploadZoneProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = useCallback(
    (uploadedFile: File) => {
      setFile(uploadedFile);
      setError(null);
      setUploadProgress(0);
      setUploading(true);

      if (!isSupportedExpenseFile(uploadedFile.name)) {
        setError('Invalid file format.');
        setUploadProgress(0);
        setUploading(false);
        return;
      }

      const progressInterval = window.setInterval(() => {
        setUploadProgress((previous) => {
          if (previous >= 95) return previous;
          const next = previous + Math.floor(Math.random() * 10) + 5;
          return next > 95 ? 95 : next;
        });
      }, 250);

      setTimeout(async () => {
        try {
          const validationResult = await analyzeUploadedFile(uploadedFile);
          const fileContent = uploadedFile.name.toLowerCase().endsWith('.xlsx')
            ? JSON.stringify(validationResult.transactions)
            : await uploadedFile.text();

          const response = await fetch(
            'https://gph5f9ks6c.execute-api.us-east-1.amazonaws.com/prod/upload',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                fileName: uploadedFile.name,
                fileSize: uploadedFile.size,
                fileType: uploadedFile.type,
                fileContent: fileContent
              }),
            }
          );

          if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
          }

          const data = await response.json();
          console.log('Upload Success:', data);

          setUploadProgress(100);
          onFileUpload(validationResult, uploadedFile);
        } catch (fetchError) {
          console.error('Upload Failed:', fetchError);
          setError(buildValidationMessage(fetchError));
          setUploadProgress(0);
        } finally {
          window.clearInterval(progressInterval);
          setUploading(false);
        }
      }, 500);
    },
    [onFileUpload]
  );

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = event.target.files?.[0];
      if (selectedFile) {
        if (!isSupportedExpenseFile(selectedFile.name)) {
          setError('Invalid file format.');
          return;
        }

        processFile(selectedFile);
      }
    },
    [processFile]
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setDragActive(false);
      const droppedFile = event.dataTransfer.files?.[0];
      if (droppedFile) {
        processFile(droppedFile);
      }
    },
    [processFile]
  );

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragActive(false);
  }, []);

  const reset = useCallback(() => {
    setFile(null);
    setUploadProgress(0);
    setError(null);
  }, []);

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div
        className={`group relative rounded-3xl border border-dashed p-8 text-center transition ${
          dragActive ? 'border-white/80 bg-white/5' : 'border-slate-700 bg-slate-950/70'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          id="file-upload"
          type="file"
          accept=".csv,.xlsx,.xls,.json"
          className="hidden"
          onChange={handleFileChange}
        />

        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-slate-800 text-slate-100">
            <Upload className="h-8 w-8" />
          </div>
          <div className="mb-3 text-sm font-semibold text-slate-100">Drag & drop your file here</div>
          <div className="text-xs text-slate-400">or click to browse CSV, Excel, or JSON</div>
        </label>
      </div>

      {file && (
        <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-950/80 p-4 text-left">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-slate-100">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-800">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">{file.name}</p>
                <p className="text-xs text-slate-500">{Math.round(file.size / 1024)} KB</p>
              </div>
            </div>
            <button
              type="button"
              onClick={reset}
              className="inline-flex h-10 min-w-[2.5rem] items-center justify-center rounded-2xl border border-slate-700 bg-slate-900 text-slate-400 transition hover:border-slate-500 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-slate-400 via-slate-200 to-white"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
            <span>{uploadProgress}%</span>
            {uploadProgress >= 100 ? (
              <span className="inline-flex items-center gap-1 text-emerald-400">
                <Check className="h-3.5 w-3.5" /> Analytics Generated Successfully
              </span>
            ) : uploading ? (
              <span>Uploading...</span>
            ) : (
              <span>Waiting for upload…</span>
            )}
          </div>
        </div>
      )}

      {error && <p className="mt-4 text-sm text-rose-400">{error}</p>}
    </div>
  );
}
