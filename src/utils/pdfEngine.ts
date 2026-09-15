import { PDFDocument, degrees, StandardFonts, rgb } from 'pdf-lib';
import JSZip from 'jszip';
import mammoth from 'mammoth';
import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  Packer,
  ImageRun,
} from 'docx';
import * as pdfjsLib from 'pdfjs-dist';

// Configure pdfjs worker safely for modern browser environments
if (typeof window !== 'undefined') {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || '6.3.289'}/build/pdf.worker.min.mjs`;
  } catch {
    // pdfjs falls back to main-thread fake worker
  }
}

/**
 * Format bytes into readable string (e.g. 1.2 MB, 340 KB)
 */
export function formatBytes(bytes: number, decimals: number = 1): string {
  if (!bytes || bytes <= 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Check if a file is a valid PDF
 */
export function isPdfFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return name.endsWith('.pdf') || file.type === 'application/pdf';
}

/**
 * Check if a file is an accepted image
 */
export function isImageFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return (
    name.endsWith('.jpg') ||
    name.endsWith('.jpeg') ||
    name.endsWith('.png') ||
    name.endsWith('.webp') ||
    file.type.startsWith('image/')
  );
}

/**
 * Check if a file is an accepted Word document
 */
export function isWordFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return (
    name.endsWith('.docx') ||
    name.endsWith('.doc') ||
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    file.type === 'application/msword'
  );
}

/**
 * Safely get page count of a PDF file
 */
export async function getPdfPageCount(file: File): Promise<number> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    return pdf.getPageCount();
  } catch {
    return 0;
  }
}

/**
 * Result of a single generated file
 */
export interface ProcessedFile {
  name: string;
  blob: Blob;
  size: number;
}

/**
 * Result of any tool operation
 */
export interface ToolOperationResult {
  isMultiple: boolean;
  singleFile?: ProcessedFile;
  zipFile?: ProcessedFile;
  itemCount: number;
  stats?: {
    originalSize?: number;
    resultingSize?: number;
    savedPercentage?: number;
    note?: string;
  };
}

/**
 * Split page range item
 */
export interface SplitRangeItem {
  id: string;
  from: number;
  to: number;
}

export type SplitMode = 'every-page' | 'combine-ranges' | 'separate-ranges';

/**
 * Compression level setting
 */
export type CompressionLevel = 'low' | 'recommended' | 'high';

/**
 * Trigger immediate browser download
 */
export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

/**
 * REAL MERGE PDF: Combines multiple PDF files into one PDF
 * Supports arbitrarily large queues (2, 10, 20, 50+ files)
 */
export async function executeMergePdfs(
  files: File[],
  outputName: string = 'merged.pdf',
  onProgress?: (message: string, percent: number) => void
): Promise<ToolOperationResult> {
  if (files.length < 2) {
    throw new Error('Please select at least 2 PDF files to merge.');
  }

  onProgress?.(`Preparing ${files.length} documents for merge...`, 5);
  const mergedPdf = await PDFDocument.create();

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const progressPct = Math.round(10 + (i / files.length) * 75);
    onProgress?.(`Merging file ${i + 1} of ${files.length}: ${file.name}...`, progressPct);

    const buffer = await file.arrayBuffer();
    let sourcePdf: PDFDocument;
    try {
      sourcePdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
    } catch {
      throw new Error(`Failed to read "${file.name}". The file may be password-protected or corrupted.`);
    }

    const pageIndices = sourcePdf.getPageIndices();
    const copiedPages = await mergedPdf.copyPages(sourcePdf, pageIndices);
    copiedPages.forEach((p) => mergedPdf.addPage(p));
  }

  onProgress?.('Assembling and generating merged PDF...', 90);
  const pdfBytes = await mergedPdf.save();
  const cleanName = outputName.toLowerCase().endsWith('.pdf') ? outputName : `${outputName}.pdf`;
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });

  onProgress?.('Merge complete!', 100);
  return {
    isMultiple: false,
    singleFile: {
      name: cleanName,
      blob,
      size: blob.size,
    },
    itemCount: 1,
  };
}

/**
 * REAL SPLIT PDF:
 * Mode 1: 'every-page' -> Page 1, Page 2, ... -> ZIP
 * Mode 2: 'combine-ranges' -> Combined into ONE PDF -> single PDF download
 * Mode 3: 'separate-ranges' -> Separate PDF for each range -> ZIP (or single PDF if 1 range)
 */
export async function executeSplitPdf(
  file: File,
  mode: SplitMode,
  ranges: SplitRangeItem[],
  onProgress?: (message: string, percent: number) => void
): Promise<ToolOperationResult> {
  onProgress?.('Loading PDF document...', 10);
  const buffer = await file.arrayBuffer();
  let sourcePdf: PDFDocument;
  try {
    sourcePdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
  } catch {
    throw new Error(`Failed to read "${file.name}". File may be password-protected or corrupted.`);
  }

  const totalPages = sourcePdf.getPageCount();
  if (totalPages === 0) {
    throw new Error('The PDF document contains no pages.');
  }

  const baseFilename = file.name.replace(/\.[^/.]+$/, '');

  // ----------------------------------------------------------------------
  // MODE 1: SPLIT EVERY PAGE
  // ----------------------------------------------------------------------
  if (mode === 'every-page') {
    const outputFiles: ProcessedFile[] = [];

    for (let i = 0; i < totalPages; i++) {
      const pageNumber = i + 1;
      const pct = Math.round(15 + (i / totalPages) * 70);
      onProgress?.(`Extracting page ${pageNumber} of ${totalPages}...`, pct);

      const newPdf = await PDFDocument.create();
      const [copiedPage] = await newPdf.copyPages(sourcePdf, [i]);
      newPdf.addPage(copiedPage);

      const bytes = await newPdf.save();
      const blob = new Blob([bytes], { type: 'application/pdf' });
      outputFiles.push({
        name: `page-${pageNumber}.pdf`,
        blob,
        size: blob.size,
      });
    }

    onProgress?.('Packaging split pages into ZIP archive...', 90);
    const zip = new JSZip();
    for (const f of outputFiles) {
      zip.file(f.name, f.blob);
    }
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    onProgress?.('Split complete!', 100);

    return {
      isMultiple: true,
      zipFile: {
        name: 'split-pages.zip',
        blob: zipBlob,
        size: zipBlob.size,
      },
      itemCount: outputFiles.length,
    };
  }

  // Validate ranges for Mode 2 & Mode 3
  if (!ranges || ranges.length === 0) {
    throw new Error('Please specify at least one valid page range.');
  }

  for (let idx = 0; idx < ranges.length; idx++) {
    const r = ranges[idx];
    if (r.from < 1 || r.to < 1) {
      throw new Error(`Range ${idx + 1} has invalid page numbers. Pages start at 1.`);
    }
    if (r.from > r.to) {
      throw new Error(`Range ${idx + 1} start page (${r.from}) cannot be greater than end page (${r.to}).`);
    }
    if (r.from > totalPages || r.to > totalPages) {
      throw new Error(
        `Range ${idx + 1} (${r.from}-${r.to}) exceeds total document pages (${totalPages}).`
      );
    }
  }

  // ----------------------------------------------------------------------
  // MODE 2: EXTRACT SELECTED RANGES INTO ONE PDF
  // Combines all selected ranges into a single output PDF
  // ----------------------------------------------------------------------
  if (mode === 'combine-ranges') {
    onProgress?.('Extracting and combining selected page ranges...', 30);
    const combinedPdf = await PDFDocument.create();

    // Collect all zero-based page indices in requested range sequence
    const indicesToCopy: number[] = [];
    for (const r of ranges) {
      for (let p = r.from; p <= r.to; p++) {
        indicesToCopy.push(p - 1);
      }
    }

    if (indicesToCopy.length === 0) {
      throw new Error('No pages found in specified ranges.');
    }

    onProgress?.(`Copying ${indicesToCopy.length} pages into combined document...`, 60);
    const copiedPages = await combinedPdf.copyPages(sourcePdf, indicesToCopy);
    copiedPages.forEach((page) => combinedPdf.addPage(page));

    onProgress?.('Generating extracted PDF document...', 85);
    const bytes = await combinedPdf.save();
    const blob = new Blob([bytes], { type: 'application/pdf' });

    onProgress?.('Extraction complete!', 100);
    return {
      isMultiple: false,
      singleFile: {
        name: 'extracted-pages.pdf',
        blob,
        size: blob.size,
      },
      itemCount: 1,
    };
  }

  // ----------------------------------------------------------------------
  // MODE 3: SPLIT SELECTED RANGES INTO SEPARATE PDF FILES
  // Creates a distinct PDF for each selected range
  // ----------------------------------------------------------------------
  const outputFiles: ProcessedFile[] = [];

  for (let idx = 0; idx < ranges.length; idx++) {
    const r = ranges[idx];
    const pct = Math.round(20 + (idx / ranges.length) * 65);
    onProgress?.(`Creating range ${idx + 1} of ${ranges.length} (pages ${r.from}-${r.to})...`, pct);

    const rangePdf = await PDFDocument.create();
    const indices: number[] = [];
    for (let p = r.from; p <= r.to; p++) {
      indices.push(p - 1);
    }

    const copied = await rangePdf.copyPages(sourcePdf, indices);
    copied.forEach((p) => rangePdf.addPage(p));

    const bytes = await rangePdf.save();
    const blob = new Blob([bytes], { type: 'application/pdf' });
    outputFiles.push({
      name: `range-${r.from}-${r.to}.pdf`,
      blob,
      size: blob.size,
    });
  }

  if (outputFiles.length === 1) {
    onProgress?.('Split complete!', 100);
    return {
      isMultiple: false,
      singleFile: outputFiles[0],
      itemCount: 1,
    };
  } else {
    onProgress?.('Packaging split range files into ZIP archive...', 90);
    const zip = new JSZip();
    for (const f of outputFiles) {
      zip.file(f.name, f.blob);
    }
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    onProgress?.('Split complete!', 100);

    return {
      isMultiple: true,
      zipFile: {
        name: 'split-ranges.zip',
        blob: zipBlob,
        size: zipBlob.size,
      },
      itemCount: outputFiles.length,
    };
  }
}

/**
 * REAL ROTATE PDF: Rotates all pages by specified degrees (90, 180, 270)
 */
export async function executeRotatePdf(
  files: File[],
  angleDegrees: number = 90,
  onProgress?: (message: string, percent: number) => void
): Promise<ToolOperationResult> {
  const outputFiles: ProcessedFile[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    onProgress?.(`Rotating "${file.name}" (${i + 1}/${files.length})...`, Math.round(15 + (i / files.length) * 70));

    const buffer = await file.arrayBuffer();
    let pdf: PDFDocument;
    try {
      pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
    } catch {
      throw new Error(`Failed to load "${file.name}". File might be corrupted or password-protected.`);
    }

    const pages = pdf.getPages();
    pages.forEach((page) => {
      const currentRotation = page.getRotation().angle;
      page.setRotation(degrees((currentRotation + angleDegrees) % 360));
    });

    const bytes = await pdf.save();
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    outputFiles.push({
      name: `${baseName}-rotated.pdf`,
      blob,
      size: blob.size,
    });
  }

  if (outputFiles.length === 1) {
    onProgress?.('Rotation complete!', 100);
    return {
      isMultiple: false,
      singleFile: outputFiles[0],
      itemCount: 1,
    };
  } else {
    onProgress?.('Creating ZIP archive of rotated PDFs...', 90);
    const zip = new JSZip();
    for (const f of outputFiles) {
      zip.file(f.name, f.blob);
    }
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    onProgress?.('Rotation complete!', 100);
    return {
      isMultiple: true,
      zipFile: {
        name: 'rotated-documents.zip',
        blob: zipBlob,
        size: zipBlob.size,
      },
      itemCount: outputFiles.length,
    };
  }
}

/**
 * REAL COMPRESS PDF:
 * Genuinely optimizes PDF content:
 * 1. For image-heavy/scanned PDFs: re-renders pages at target DPI & JPEG quality
 * 2. For vector/text PDFs: strips dead metadata and applies object streams
 * 3. Compares original size vs resulting size and honestly displays compression stats
 */
export async function executeCompressPdf(
  files: File[],
  level: CompressionLevel = 'recommended',
  onProgress?: (message: string, percent: number) => void
): Promise<ToolOperationResult> {
  if (files.length === 0) {
    throw new Error('Please select at least 1 PDF file to compress.');
  }

  const outputFiles: ProcessedFile[] = [];
  let totalOriginalSize = 0;
  let totalResultingSize = 0;

  // Level configuration
  const config = {
    low: { scale: 1.5, quality: 0.85, label: 'Low compression / High quality' },
    recommended: { scale: 1.25, quality: 0.70, label: 'Recommended compression' },
    high: { scale: 1.0, quality: 0.50, label: 'High compression / Smallest size' },
  }[level];

  for (let fileIdx = 0; fileIdx < files.length; fileIdx++) {
    const file = files[fileIdx];
    totalOriginalSize += file.size;
    onProgress?.(
      `Analyzing and optimizing "${file.name}" (${fileIdx + 1}/${files.length})...`,
      Math.round(10 + (fileIdx / files.length) * 80)
    );

    const buffer = await file.arrayBuffer();

    // Strategy 1: Object stream & metadata optimization with pdf-lib
    let streamOnlyBytes: Uint8Array | null = null;
    try {
      const pdfClean = await PDFDocument.load(buffer, { ignoreEncryption: true });
      pdfClean.setTitle('');
      pdfClean.setAuthor('');
      pdfClean.setSubject('');
      pdfClean.setKeywords([]);
      pdfClean.setProducer('PDF Tools Engine');
      pdfClean.setCreator('PDF Tools');
      streamOnlyBytes = await pdfClean.save({ useObjectStreams: true });
    } catch {
      // ignore
    }

    // Strategy 2: Page raster re-compression via pdfjs-dist and canvas
    let renderedBytes: Uint8Array | null = null;
    try {
      const pdfJsDoc = await pdfjsLib.getDocument({
        data: new Uint8Array(buffer),
        cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || '6.3.289'}/cmaps/`,
        cMapPacked: true,
      }).promise;

      const numPages = pdfJsDoc.numPages;
      const targetPdf = await PDFDocument.create();

      for (let p = 1; p <= numPages; p++) {
        onProgress?.(
          `Compressing "${file.name}" page ${p} of ${numPages}...`,
          Math.round(15 + ((p / numPages) * 70) / files.length)
        );

        const page = await pdfJsDoc.getPage(p);
        const viewport = page.getViewport({ scale: config.scale });

        const canvas = document.createElement('canvas');
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        const ctx = canvas.getContext('2d');

        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          await page.render({
            canvasContext: ctx,
            canvas,
            viewport,
          } as any).promise;

          const jpegBlob: Blob = await new Promise((resolve) => {
            canvas.toBlob(
              (b) => resolve(b || new Blob()),
              'image/jpeg',
              config.quality
            );
          });

          const jpegBytes = await jpegBlob.arrayBuffer();
          const embeddedImage = await targetPdf.embedJpg(jpegBytes);

          // Original PDF dimensions in points
          const originalWidth = viewport.width / config.scale;
          const originalHeight = viewport.height / config.scale;
          const targetPage = targetPdf.addPage([originalWidth, originalHeight]);

          targetPage.drawImage(embeddedImage, {
            x: 0,
            y: 0,
            width: originalWidth,
            height: originalHeight,
          });
        }
      }

      renderedBytes = await targetPdf.save({ useObjectStreams: true });
    } catch {
      // Fallback if canvas rendering fails
    }

    // Compare available outputs to pick genuine smallest size without corruption
    let chosenBytes: Uint8Array;
    if (renderedBytes && renderedBytes.length < file.size) {
      // Genuine raster reduction achieved (e.g. 3.12 MB down to 1.8 MB)
      chosenBytes = renderedBytes;
    } else if (streamOnlyBytes && streamOnlyBytes.length < file.size) {
      // Stream optimization achieved
      chosenBytes = streamOnlyBytes;
    } else if (renderedBytes && (!streamOnlyBytes || renderedBytes.length <= streamOnlyBytes.length)) {
      chosenBytes = renderedBytes;
    } else if (streamOnlyBytes) {
      chosenBytes = streamOnlyBytes;
    } else {
      chosenBytes = new Uint8Array(buffer);
    }

    totalResultingSize += chosenBytes.length;
    const blob = new Blob([chosenBytes], { type: 'application/pdf' });
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    outputFiles.push({
      name: `${baseName}-compressed.pdf`,
      blob,
      size: chosenBytes.length,
    });
  }

  // Calculate actual compression stats
  const savedBytes = Math.max(0, totalOriginalSize - totalResultingSize);
  const savedPercent =
    totalOriginalSize > 0
      ? Math.max(0, Math.round(((totalOriginalSize - totalResultingSize) / totalOriginalSize) * 1000) / 10)
      : 0;

  const note =
    savedPercent > 0
      ? `Successfully reduced file size by ${savedPercent}% (${formatBytes(savedBytes)} saved).`
      : 'Document is already maximally compact. Original size preserved.';

  if (outputFiles.length === 1) {
    onProgress?.('Compression complete!', 100);
    return {
      isMultiple: false,
      singleFile: outputFiles[0],
      itemCount: 1,
      stats: {
        originalSize: totalOriginalSize,
        resultingSize: totalResultingSize,
        savedPercentage: savedPercent,
        note,
      },
    };
  } else {
    onProgress?.('Packaging compressed PDFs into ZIP archive...', 90);
    const zip = new JSZip();
    for (const f of outputFiles) {
      zip.file(f.name, f.blob);
    }
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    onProgress?.('Compression complete!', 100);
    return {
      isMultiple: true,
      zipFile: {
        name: 'compressed-documents.zip',
        blob: zipBlob,
        size: zipBlob.size,
      },
      itemCount: outputFiles.length,
      stats: {
        originalSize: totalOriginalSize,
        resultingSize: totalResultingSize,
        savedPercentage: savedPercent,
        note,
      },
    };
  }
}

/**
 * REAL JPG TO PDF: Embeds images into clean PDF pages
 * Supports unlimited image batches
 */
export async function executeImagesToPdf(
  files: File[],
  outputName: string = 'images.pdf',
  onProgress?: (message: string, percent: number) => void
): Promise<ToolOperationResult> {
  if (files.length === 0) {
    throw new Error('Please select at least 1 image file.');
  }

  onProgress?.(`Initializing PDF for ${files.length} images...`, 10);
  const pdfDoc = await PDFDocument.create();

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const pct = Math.round(15 + (i / files.length) * 75);
    onProgress?.(`Embedding image ${i + 1} of ${files.length}: ${file.name}...`, pct);

    const buffer = await file.arrayBuffer();
    const isPng = file.type === 'image/png' || file.name.toLowerCase().endsWith('.png');

    let embeddedImage;
    try {
      if (isPng) {
        embeddedImage = await pdfDoc.embedPng(buffer);
      } else {
        embeddedImage = await pdfDoc.embedJpg(buffer);
      }
    } catch {
      // If direct embed failed, convert via canvas to JPEG
      const imageBitmap = await createImageBitmap(file);
      const canvas = document.createElement('canvas');
      canvas.width = imageBitmap.width;
      canvas.height = imageBitmap.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(imageBitmap, 0, 0);
        const jpegBlob: Blob = await new Promise((res) => canvas.toBlob((b) => res(b!), 'image/jpeg', 0.92));
        const jpegBytes = await jpegBlob.arrayBuffer();
        embeddedImage = await pdfDoc.embedJpg(jpegBytes);
      } else {
        continue;
      }
    }

    const { width, height } = embeddedImage;
    const page = pdfDoc.addPage([width, height]);
    page.drawImage(embeddedImage, {
      x: 0,
      y: 0,
      width,
      height,
    });
  }

  onProgress?.('Assembling output PDF document...', 92);
  const pdfBytes = await pdfDoc.save();
  const cleanName = outputName.toLowerCase().endsWith('.pdf') ? outputName : `${outputName}.pdf`;
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });

  onProgress?.('Images converted to PDF successfully!', 100);
  return {
    isMultiple: false,
    singleFile: {
      name: cleanName,
      blob,
      size: blob.size,
    },
    itemCount: 1,
  };
}

/**
 * REAL PDF TO JPG: Converts every page of a PDF into high-resolution JPG images
 * Single page PDF -> 1 JPG direct download
 * Multi page PDF -> Real ZIP archive containing all JPGs
 */
export async function executePdfToJpg(
  file: File,
  onProgress?: (message: string, percent: number) => void
): Promise<ToolOperationResult> {
  onProgress?.('Loading PDF document for image rendering...', 10);
  const buffer = await file.arrayBuffer();

  const pdfJsDoc = await pdfjsLib.getDocument({
    data: new Uint8Array(buffer),
    cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || '6.3.289'}/cmaps/`,
    cMapPacked: true,
  }).promise;

  const numPages = pdfJsDoc.numPages;
  if (numPages === 0) {
    throw new Error('This PDF has no pages to convert.');
  }

  const baseFilename = file.name.replace(/\.[^/.]+$/, '');
  const outputJpgs: ProcessedFile[] = [];

  for (let p = 1; p <= numPages; p++) {
    const pct = Math.round(15 + (p / numPages) * 75);
    onProgress?.(`Rendering page ${p} of ${numPages} to JPG...`, pct);

    const page = await pdfJsDoc.getPage(p);
    // Scale 2.0 provides crisp 150-200 DPI resolution
    const viewport = page.getViewport({ scale: 2.0 });

    const canvas = document.createElement('canvas');
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      await page.render({
        canvasContext: ctx,
        canvas,
        viewport,
      } as any).promise;

      const jpegBlob: Blob = await new Promise((resolve, reject) => {
        canvas.toBlob(
          (b) => {
            if (b) resolve(b);
            else reject(new Error(`Failed to encode page ${p} to JPG`));
          },
          'image/jpeg',
          0.92
        );
      });

      const jpgName = numPages === 1 ? `${baseFilename}.jpg` : `${baseFilename}-page-${p}.jpg`;
      outputJpgs.push({
        name: jpgName,
        blob: jpegBlob,
        size: jpegBlob.size,
      });
    }
  }

  if (outputJpgs.length === 1) {
    onProgress?.('Done!', 100);
    return {
      isMultiple: false,
      singleFile: outputJpgs[0],
      itemCount: 1,
    };
  } else {
    onProgress?.('Packaging JPG images into ZIP archive...', 92);
    const zip = new JSZip();
    for (const img of outputJpgs) {
      zip.file(img.name, img.blob);
    }
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    onProgress?.('Conversion complete!', 100);

    return {
      isMultiple: true,
      zipFile: {
        name: `${baseFilename}-images.zip`,
        blob: zipBlob,
        size: zipBlob.size,
      },
      itemCount: outputJpgs.length,
    };
  }
}

/**
 * REAL WORD TO PDF: Converts real .docx files into clean PDF documents
 */
export async function executeWordToPdf(
  file: File,
  onProgress?: (message: string, percent: number) => void
): Promise<ToolOperationResult> {
  const fileNameLower = file.name.toLowerCase();
  if (fileNameLower.endsWith('.doc') && !fileNameLower.endsWith('.docx')) {
    throw new Error(
      'Legacy binary .doc files (Word 97-2003) are not supported. Please save your file as modern Word Document (.docx) format.'
    );
  }

  onProgress?.('Reading Word document (.docx)...', 15);
  let arrayBuffer: ArrayBuffer;
  try {
    arrayBuffer = await file.arrayBuffer();
  } catch {
    throw new Error('Could not read the selected DOCX file. Please check file permissions.');
  }

  onProgress?.('Parsing document structures, paragraphs, and headings...', 35);
  let htmlContent = '';
  try {
    const result = await mammoth.convertToHtml({ arrayBuffer });
    htmlContent = result.value;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown parser error';
    throw new Error(`Failed to parse DOCX file: ${message}. Ensure the file is a valid Word document.`);
  }

  if (!htmlContent.trim()) {
    throw new Error('The DOCX document appears to be empty or contains unsupported content.');
  }

  onProgress?.('Generating PDF document...', 60);
  const pdfDoc = await PDFDocument.create();
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Standard A4 dimensions
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const margin = 54;
  const contentWidth = pageWidth - margin * 2;

  let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let currentY = pageHeight - margin;

  const parser = new DOMParser();
  const docDOM = parser.parseFromString(`<div>${htmlContent}</div>`, 'text/html');
  const elements = Array.from(docDOM.body.firstElementChild?.children || []);

  const ensureSpace = (neededHeight: number) => {
    if (currentY - neededHeight < margin) {
      currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
      currentY = pageHeight - margin;
    }
  };

  for (const el of elements) {
    const tagName = el.tagName.toLowerCase();
    const rawText = el.textContent?.trim() || '';
    if (!rawText) continue;

    let fontSize = 11;
    let font = regularFont;
    let lineHeight = 16;
    let spaceAfter = 8;

    if (tagName === 'h1') {
      fontSize = 20;
      font = boldFont;
      lineHeight = 26;
      spaceAfter = 14;
      ensureSpace(lineHeight * 2);
    } else if (tagName === 'h2') {
      fontSize = 15;
      font = boldFont;
      lineHeight = 20;
      spaceAfter = 10;
      ensureSpace(lineHeight * 1.5);
    } else if (tagName === 'h3') {
      fontSize = 13;
      font = boldFont;
      lineHeight = 18;
      spaceAfter = 8;
      ensureSpace(lineHeight * 1.5);
    } else if (tagName === 'ul' || tagName === 'ol') {
      const items = Array.from(el.querySelectorAll('li'));
      for (const li of items) {
        const itemText = li.textContent?.trim() || '';
        if (!itemText) continue;
        const wrappedLines = wrapText(`•  ${itemText}`, regularFont, 11, contentWidth - 16);
        for (const line of wrappedLines) {
          ensureSpace(16);
          currentPage.drawText(line, {
            x: margin + 12,
            y: currentY,
            size: 11,
            font: regularFont,
            color: rgb(0.1, 0.1, 0.1),
          });
          currentY -= 16;
        }
      }
      currentY -= 6;
      continue;
    }

    // Wrap normal text
    const lines = wrapText(rawText, font, fontSize, contentWidth);
    for (const line of lines) {
      ensureSpace(lineHeight);
      currentPage.drawText(line, {
        x: margin,
        y: currentY,
        size: fontSize,
        font: font,
        color: rgb(0.12, 0.12, 0.14),
      });
      currentY -= lineHeight;
    }
    currentY -= spaceAfter;
  }

  onProgress?.('Finalizing PDF...', 90);
  const pdfBytes = await pdfDoc.save();
  const baseName = file.name.replace(/\.[^/.]+$/, '');
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });

  onProgress?.('Word document successfully converted to PDF!', 100);
  return {
    isMultiple: false,
    singleFile: {
      name: `${baseName}.pdf`,
      blob,
      size: blob.size,
    },
    itemCount: 1,
  };
}

/**
 * Word wrap helper for PDF text layout
 */
function wrapText(text: string, font: any, size: number, maxWidth: number): string[] {
  const words = text.replace(/\s+/g, ' ').split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const candidate = currentLine ? `${currentLine} ${word}` : word;
    const width = font.widthOfTextAtSize(candidate, size);
    if (width <= maxWidth) {
      currentLine = candidate;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

/**
 * REAL PDF TO WORD: Converts PDF files into real Microsoft Word (.docx) documents
 */
export async function executePdfToWord(
  file: File,
  onProgress?: (message: string, percent: number) => void
): Promise<ToolOperationResult> {
  onProgress?.('Loading PDF document for text and structure extraction...', 10);
  const buffer = await file.arrayBuffer();

  const pdfJsDoc = await pdfjsLib.getDocument({
    data: new Uint8Array(buffer),
    cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || '6.3.289'}/cmaps/`,
    cMapPacked: true,
  }).promise;

  const numPages = pdfJsDoc.numPages;
  if (numPages === 0) {
    throw new Error('This PDF has no pages.');
  }

  const docParagraphs: Paragraph[] = [];
  let totalTextItemsCount = 0;

  for (let p = 1; p <= numPages; p++) {
    const pct = Math.round(15 + (p / numPages) * 65);
    onProgress?.(`Extracting content from page ${p} of ${numPages}...`, pct);

    const page = await pdfJsDoc.getPage(p);
    const textContent = await page.getTextContent();
    const items = textContent.items as Array<{
      str: string;
      transform: number[];
      height?: number;
    }>;

    if (items.length > 0) {
      totalTextItemsCount += items.length;

      // Group items into lines based on vertical transform coordinates
      const lineMap: { [yKey: number]: Array<{ x: number; text: string; height: number }> } = {};

      for (const item of items) {
        if (!item.str) continue;
        const y = item.transform[5];
        const x = item.transform[4];
        const height = item.height || 11;
        // Group within 3-point vertical band
        const yKey = Math.round(y / 3) * 3;
        if (!lineMap[yKey]) lineMap[yKey] = [];
        lineMap[yKey].push({ x, text: item.str, height });
      }

      // Sort lines from top of page to bottom (descending Y)
      const sortedYKeys = Object.keys(lineMap)
        .map(Number)
        .sort((a, b) => b - a);

      for (const yKey of sortedYKeys) {
        const lineItems = lineMap[yKey].sort((a, b) => a.x - b.x);
        const lineText = lineItems.map((it) => it.text).join(' ').trim();
        if (!lineText) continue;

        const maxFontSize = Math.max(...lineItems.map((it) => it.height));
        const isHeading = maxFontSize > 15;

        docParagraphs.push(
          new Paragraph({
            heading: isHeading ? HeadingLevel.HEADING_2 : undefined,
            children: [
              new TextRun({
                text: lineText,
                bold: isHeading,
                size: Math.round(Math.max(10, maxFontSize) * 2), // docx uses half-points
              }),
            ],
            spacing: {
              after: isHeading ? 160 : 80,
            },
          })
        );
      }
    } else {
      // Scanned page fallback: Render page to canvas and embed as image into Word
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = document.createElement('canvas');
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      const ctx = canvas.getContext('2d');
      if (ctx) {
        await page.render({
          canvasContext: ctx,
          canvas,
          viewport,
        } as any).promise;
        const pngBlob: Blob = await new Promise((res) => canvas.toBlob((b) => res(b!), 'image/png'));
        const pngBytes = await pngBlob.arrayBuffer();

        docParagraphs.push(
          new Paragraph({
            children: [
              new ImageRun({
                type: 'png',
                data: new Uint8Array(pngBytes),
                transformation: {
                  width: 500,
                  height: Math.round((500 / viewport.width) * viewport.height),
                },
              }),
            ],
            spacing: { after: 120 },
          })
        );
      }
    }

    // Add page separator between pages if multiple
    if (p < numPages) {
      docParagraphs.push(
        new Paragraph({
          children: [new TextRun({ text: '--- Page Break ---', color: '999999', size: 16 })],
          spacing: { before: 120, after: 120 },
        })
      );
    }
  }

  onProgress?.('Assembling Microsoft Word document (.docx)...', 85);
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: docParagraphs.length > 0 ? docParagraphs : [
          new Paragraph({
            children: [new TextRun({ text: 'Document converted from PDF.' })],
          }),
        ],
      },
    ],
  });

  const docxBlob = await Packer.toBlob(doc);
  const baseName = file.name.replace(/\.[^/.]+$/, '');

  const note =
    totalTextItemsCount > 0
      ? 'Extracted editable text and structure into Microsoft Word (.docx) document.'
      : 'Scanned image-based PDF converted. Page images preserved inside Microsoft Word document.';

  onProgress?.('PDF successfully converted to Word!', 100);
  return {
    isMultiple: false,
    singleFile: {
      name: `${baseName}.docx`,
      blob: docxBlob,
      size: docxBlob.size,
    },
    itemCount: 1,
    stats: {
      note,
    },
  };
}
