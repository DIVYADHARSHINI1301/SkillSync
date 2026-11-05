import React, { useRef, useState, DragEvent, ChangeEvent } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, RefreshCw, X, ShieldAlert } from 'lucide-react';
import { validateResumePdf, MAX_FILE_SIZE_BYTES } from '@/lib/pdfValidator';
import { ValidatedFile } from '@/types';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';
import { cn } from '@/lib/utils';

interface ResumeDropzoneProps {
  onFileValidated: (validatedFile: ValidatedFile | null) => void;
  selectedFile: ValidatedFile | null;
  className?: string;
}

export const ResumeDropzone: React.FC<ResumeDropzoneProps> = ({
  onFileValidated,
  selectedFile,
  className,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const processFile = async (file: File) => {
    setValidationError(null);
    setIsValidating(true);

    try {
      const result = await validateResumePdf(file);
      if (result.isValid && result.validatedFile) {
        onFileValidated(result.validatedFile);
      } else {
        setValidationError(result.error || 'The uploaded file is not a valid PDF document.');
        onFileValidated(null);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error validating file format.';
      setValidationError(msg);
      onFileValidated(null);
    } finally {
      setIsValidating(false);
      // Reset input value to allow re-selecting same file if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      await processFile(droppedFiles[0]);
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await processFile(files[0]);
    }
  };

  const handleRemove = () => {
    onFileValidated(null);
    setValidationError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleFileChange}
        className="hidden"
        id="resume-file-input"
      />

      {validationError && (
        <Alert
          type="error"
          title="File Validation Error"
          message={validationError}
          onClose={() => setValidationError(null)}
        />
      )}

      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all duration-200 cursor-pointer select-none',
            isDragging
              ? 'border-indigo-600 bg-indigo-50/80 scale-[1.01]'
              : 'border-slate-300 hover:border-indigo-500 bg-white hover:bg-slate-50/60 shadow-xs'
          )}
        >
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto mb-4 transition-transform group-hover:scale-110">
            {isValidating ? (
              <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
            ) : (
              <UploadCloud className="w-8 h-8 text-indigo-600" />
            )}
          </div>

          <h3 className="text-base sm:text-lg font-semibold text-slate-900">
            {isValidating
              ? 'Verifying PDF signature and byte integrity...'
              : 'Drag & drop your resume here'}
          </h3>

          <p className="mt-1.5 text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
            Select a PDF document containing your work history, education, and technical projects.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button
              type="button"
              variant="primary"
              size="sm"
              isLoading={isValidating}
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              Browse Local Files
            </Button>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-4 text-xs text-slate-500">
            <span>Format: <strong>PDF only</strong></span>
            <span>•</span>
            <span>Max size: <strong>5 MB</strong></span>
            <span>•</span>
            <span>Signature: <strong>%PDF Header Verified</strong></span>
          </div>
        </div>
      ) : (
        /* Selected & Validated File Card */
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
                <FileText className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-slate-900 text-sm sm:text-base break-all">
                    {selectedFile.name}
                  </h4>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified PDF
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span>Size: <strong className="text-slate-700">{selectedFile.sizeFormatted}</strong></span>
                  <span>•</span>
                  <span>Header: <strong className="text-slate-700">%PDF-1.x Magic Bytes Valid</strong></span>
                  <span>•</span>
                  <span>Status: <strong className="text-emerald-700 font-medium">Ready for Stage 2 Engine</strong></span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Replace
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                leftIcon={<X className="w-3.5 h-3.5" />}
              >
                Remove
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
