import { ValidatedFile } from '@/types';
import { formatFileSize } from './utils';

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  isMagicBytesVerified: boolean;
  validatedFile?: ValidatedFile;
}

/**
 * Checks the magic bytes of a file to verify it is truly a PDF (%PDF-)
 */
export async function verifyPdfMagicBytes(file: File): Promise<boolean> {
  try {
    const slice = file.slice(0, 4);
    const buffer = await slice.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    // %PDF is [0x25, 0x50, 0x44, 0x46]
    return (
      bytes.length >= 4 &&
      bytes[0] === 0x25 && // %
      bytes[1] === 0x50 && // P
      bytes[2] === 0x44 && // D
      bytes[3] === 0x46    // F
    );
  } catch (err) {
    console.error('Failed to read file magic bytes:', err);
    return false;
  }
}

/**
 * Validates file type, size, extension, and content signature
 */
export async function validateResumePdf(file: File): Promise<FileValidationResult> {
  if (!file) {
    return {
      isValid: false,
      error: 'No file was provided.',
      isMagicBytesVerified: false,
    };
  }

  // 1. Check file size
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      isValid: false,
      error: `File size exceeds the 5 MB limit (Current: ${formatFileSize(file.size)}). Please compress or choose a smaller PDF.`,
      isMagicBytesVerified: false,
    };
  }

  if (file.size === 0) {
    return {
      isValid: false,
      error: 'The selected file is empty (0 bytes). Please select a valid resume.',
      isMagicBytesVerified: false,
    };
  }

  // 2. Check file extension
  const fileName = file.name.trim();
  const isPdfExtension = fileName.toLowerCase().endsWith('.pdf');
  if (!isPdfExtension) {
    return {
      isValid: false,
      error: `Only PDF documents are supported (.pdf). Selected file: "${fileName}" is not a PDF.`,
      isMagicBytesVerified: false,
    };
  }

  // 3. Verify PDF Magic Bytes (%PDF-)
  const isMagicBytesValid = await verifyPdfMagicBytes(file);
  if (!isMagicBytesValid) {
    return {
      isValid: false,
      error: `Invalid PDF format. The file "${fileName}" does not contain a valid PDF document header signature.`,
      isMagicBytesVerified: false,
    };
  }

  const validated: ValidatedFile = {
    file,
    name: fileName,
    size: file.size,
    sizeFormatted: formatFileSize(file.size),
    isValid: true,
    isPdfMagicBytesVerified: true,
    uploadedAt: new Date(),
  };

  return {
    isValid: true,
    isMagicBytesVerified: true,
    validatedFile: validated,
  };
}
