import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  UploadCloud,
  FileText,
  Trash2,
  ArrowUp,
  ArrowDown,
  Plus,
  CheckCircle2,
  Download,
  RotateCcw,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Archive,
  Layers,
  RotateCw,
  Scissors,
  Sparkles,
  FileType,
  Image as ImageIcon,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { PdfTool, UploadedFileItem } from '../types';
import { ToolIcon, getAccentStyles } from './ToolIcon';
import { Link } from 'react-router-dom';
import {
  formatBytes,
  isPdfFile,
  isImageFile,
  isWordFile,
  getPdfPageCount,
  ToolOperationResult,
  SplitRangeItem,
  SplitMode,
  CompressionLevel,
  triggerDownload,
  executeMergePdfs,
  executeSplitPdf,
  executeRotatePdf,
  executeCompressPdf,
  executeImagesToPdf,
  executeWordToPdf,
  executePdfToWord,
  executePdfToJpg,
} from '../utils/pdfEngine';

interface ToolPageProps {
  tool: PdfTool;
  onBack: () => void;
  darkMode?: boolean;
  relatedTools?: PdfTool[];
}

export const ToolPage: React.FC<ToolPageProps> = ({
  tool,
  onBack,
  darkMode = false,
  relatedTools = [],
}) => {
  // Real selected files in state - supports 20+ files without arbitrary limit
  const [selectedFiles, setSelectedFiles] = useState<UploadedFileItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Tool specific configurations
  const [outputFilename, setOutputFilename] = useState<string>('merged.pdf');
  const [rotateAngle, setRotateAngle] = useState<number>(90);

  // Split PDF modes & range state
  const [splitMode, setSplitMode] = useState<SplitMode>('every-page');
  const [splitRanges, setSplitRanges] = useState<SplitRangeItem[]>([
    { id: 'range-1', from: 1, to: 2 },
  ]);

  // Compress PDF level state
  const [compressLevel, setCompressLevel] = useState<CompressionLevel>('recommended');

  // Execution state
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMessage, setProgressMessage] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [result, setResult] = useState<ToolOperationResult | null>(null);

  // Hidden native file input element
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Reset states when switching tools
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setSelectedFiles([]);
    setErrorMessage(null);
    setIsProcessing(false);
    setProgressMessage('');
    setProgressPercent(0);
    setResult(null);

    if (tool.id === 'merge-pdf') {
      setOutputFilename('merged.pdf');
    } else if (tool.id === 'jpg-to-pdf') {
      setOutputFilename('images.pdf');
    } else if (tool.id === 'split-pdf') {
      setSplitMode('every-page');
      setSplitRanges([{ id: 'range-1', from: 1, to: 2 }]);
    }
  }, [tool.id]);

  const styles = getAccentStyles(tool.accentColor, darkMode);
  const isMultipleSupported =
    tool.id === 'merge-pdf' ||
    tool.id === 'jpg-to-pdf' ||
    tool.id === 'rotate-pdf' ||
    tool.id === 'compress-pdf';

  const MAX_INPUT_FILES = 100;

  // Helper for detected total page count of first uploaded file
  const firstDocPages = selectedFiles[0]?.pageCount || 0;

  // Auto-adjust default range to match document page count when detected
  useEffect(() => {
    if (tool.id === 'split-pdf' && firstDocPages > 0) {
      setSplitRanges((prev) => {
        if (prev.length === 1 && prev[0].from === 1 && prev[0].to === 2) {
          return [
            {
              id: prev[0].id,
              from: 1,
              to: Math.min(firstDocPages, 2),
            },
          ];
        }
        return prev;
      });
    }
  }, [tool.id, firstDocPages]);

  /**
   * Universal file addition handler used by both click-to-select and drag-and-drop
   * Multi-file tools support up to 100 files maximum.
   */
  const handleAddIncomingFiles = async (incomingFiles: FileList | File[]) => {
    setErrorMessage(null);
    const rawList = Array.from(incomingFiles);
    if (rawList.length === 0) return;

    // Check if adding raw files would exceed the 100-file maximum
    if (isMultipleSupported && selectedFiles.length + rawList.length > MAX_INPUT_FILES) {
      setErrorMessage('Maximum 100 files can be processed at one time.');
      return;
    }

    const validItems: UploadedFileItem[] = [];
    const invalidNames: string[] = [];

    for (const file of rawList) {
      // Validate file type based on tool accepted format
      let isValid = true;
      if (tool.id === 'jpg-to-pdf') {
        isValid = isImageFile(file);
      } else if (tool.id === 'word-to-pdf') {
        isValid = isWordFile(file);
      } else if (tool.acceptedFormats.includes('.pdf')) {
        isValid = isPdfFile(file);
      }

      if (!isValid) {
        invalidNames.push(file.name);
        continue;
      }

      const item: UploadedFileItem = {
        id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        file,
        name: file.name,
        size: file.size,
        formattedSize: formatBytes(file.size),
      };
      validItems.push(item);
    }

    if (invalidNames.length > 0) {
      setErrorMessage(
        `The following file(s) are not supported by this tool: ${invalidNames.join(', ')}. Please upload ${tool.acceptedFormats} files.`
      );
    }

    if (validItems.length > 0) {
      if (isMultipleSupported) {
        if (selectedFiles.length + validItems.length > MAX_INPUT_FILES) {
          setErrorMessage('Maximum 100 files can be processed at one time.');
          return;
        }
        setSelectedFiles((prev) => [...prev, ...validItems]);
      } else {
        // Single file tool (Split PDF, PDF to Word, Word to PDF, PDF to JPG)
        setSelectedFiles([validItems[0]]);
      }

      // Detect PDF page counts asynchronously
      for (const item of validItems) {
        if (isPdfFile(item.file)) {
          getPdfPageCount(item.file).then((count) => {
            if (count > 0) {
              setSelectedFiles((prev) =>
                prev.map((f) => (f.id === item.id ? { ...f, pageCount: count } : f))
              );
            }
          });
        }
      }
    }
  };

  /**
   * Native file input change handler
   */
  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleAddIncomingFiles(e.target.files);
      // Reset input value so re-selecting identical files also triggers event
      e.target.value = '';
    }
  };

  /**
   * Drag and drop handlers
   */
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const onDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleAddIncomingFiles(e.dataTransfer.files);
    }
  };

  /**
   * Reorder files (for Merge PDF)
   */
  const moveFile = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === selectedFiles.length - 1)
    ) {
      return;
    }
    const target = direction === 'up' ? index - 1 : index + 1;
    setSelectedFiles((prev) => {
      const arr = [...prev];
      const [moved] = arr.splice(index, 1);
      arr.splice(target, 0, moved);
      return arr;
    });
  };

  const removeFile = (id: string) => {
    setSelectedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const clearAllFiles = () => {
    setSelectedFiles([]);
    setErrorMessage(null);
  };

  /**
   * Range builder actions for Split PDF
   */
  const handleAddSplitRange = () => {
    const totalP = firstDocPages || 10;
    setSplitRanges((prev) => {
      const last = prev[prev.length - 1];
      const nextFrom = last ? Math.min(last.to + 1, totalP) : 1;
      const nextTo = Math.min(nextFrom + 1, totalP);
      return [
        ...prev,
        {
          id: `range-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          from: nextFrom,
          to: Math.max(nextFrom, nextTo),
        },
      ];
    });
  };

  const handleRemoveSplitRange = (id: string) => {
    if (splitRanges.length <= 1) return;
    setSplitRanges((prev) => prev.filter((r) => r.id !== id));
  };

  const handleUpdateSplitRange = (id: string, field: 'from' | 'to', val: number) => {
    setSplitRanges((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: Math.max(1, val) } : r))
    );
  };

  /**
   * Determine whether action button is ready to be enabled
   */
  const isActionReady = () => {
    if (tool.id === 'merge-pdf') return selectedFiles.length >= 2;
    return selectedFiles.length >= 1;
  };

  /**
   * Execute real PDF operation
   */
  const handleExecuteOperation = async () => {
    if (!isActionReady()) return;

    setErrorMessage(null);
    setIsProcessing(true);
    setProgressPercent(10);
    setProgressMessage('Starting operation...');

    try {
      let opResult: ToolOperationResult;

      if (tool.id === 'merge-pdf') {
        const rawFiles = selectedFiles.map((f) => f.file);
        opResult = await executeMergePdfs(rawFiles, outputFilename, (msg, pct) => {
          setProgressMessage(msg);
          setProgressPercent(pct);
        });
      } else if (tool.id === 'split-pdf') {
        const rawFile = selectedFiles[0].file;
        opResult = await executeSplitPdf(rawFile, splitMode, splitRanges, (msg, pct) => {
          setProgressMessage(msg);
          setProgressPercent(pct);
        });
      } else if (tool.id === 'rotate-pdf') {
        const rawFiles = selectedFiles.map((f) => f.file);
        opResult = await executeRotatePdf(rawFiles, rotateAngle, (msg, pct) => {
          setProgressMessage(msg);
          setProgressPercent(pct);
        });
      } else if (tool.id === 'compress-pdf') {
        const rawFiles = selectedFiles.map((f) => f.file);
        opResult = await executeCompressPdf(rawFiles, compressLevel, (msg, pct) => {
          setProgressMessage(msg);
          setProgressPercent(pct);
        });
      } else if (tool.id === 'jpg-to-pdf') {
        const rawFiles = selectedFiles.map((f) => f.file);
        opResult = await executeImagesToPdf(rawFiles, outputFilename, (msg, pct) => {
          setProgressMessage(msg);
          setProgressPercent(pct);
        });
      } else if (tool.id === 'word-to-pdf') {
        const rawFile = selectedFiles[0].file;
        opResult = await executeWordToPdf(rawFile, (msg, pct) => {
          setProgressMessage(msg);
          setProgressPercent(pct);
        });
      } else if (tool.id === 'pdf-to-word') {
        const rawFile = selectedFiles[0].file;
        opResult = await executePdfToWord(rawFile, (msg, pct) => {
          setProgressMessage(msg);
          setProgressPercent(pct);
        });
      } else if (tool.id === 'pdf-to-jpg') {
        const rawFile = selectedFiles[0].file;
        opResult = await executePdfToJpg(rawFile, (msg, pct) => {
          setProgressMessage(msg);
          setProgressPercent(pct);
        });
      } else {
        // Fallback: genuine clean document wrap
        const rawFiles = selectedFiles.map((f) => f.file);
        opResult = await executeCompressPdf(rawFiles, 'recommended', (msg, pct) => {
          setProgressMessage(msg);
          setProgressPercent(pct);
        });
      }

      setResult(opResult);
      setIsProcessing(false);
    } catch (err: unknown) {
      setIsProcessing(false);
      const text = err instanceof Error ? err.message : 'An error occurred during processing.';
      setErrorMessage(text);
    }
  };

  const handleReset = () => {
    setResult(null);
    setSelectedFiles([]);
    setErrorMessage(null);
    setIsProcessing(false);
    setProgressMessage('');
    setProgressPercent(0);
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
      {/* Top Header / Back Navigation */}
      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to homepage</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>100% Client-Side • Private & Secure</span>
        </div>
      </div>

      {/* Main Tool Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        {/* Tool Banner Header */}
        <div className="p-6 sm:p-8 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm shrink-0 ${styles.badgeBg} ${styles.text}`}
            >
              <ToolIcon iconName={tool.iconName} accentColor={tool.accentColor} className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {tool.name}
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
                {tool.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Live Engine
            </span>
          </div>
        </div>

        {/* Error Alert if any */}
        {errorMessage && (
          <div className="mx-6 sm:mx-8 mt-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 flex items-start gap-3 text-rose-800 dark:text-rose-200 text-sm">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-grow">
              <strong className="font-bold">Notice: </strong>
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-rose-500 hover:text-rose-700 dark:hover:text-rose-300 text-xs font-bold uppercase cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="p-6 sm:p-8 space-y-6">
          {/* Active Processing Indicator */}
          {isProcessing && (
            <div className="py-12 px-6 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center animate-pulse">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Processing Documents...
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {progressMessage || 'Working on your files locally...'}
                </p>
              </div>
              {/* Progress bar */}
              <div className="max-w-md mx-auto w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-xs font-semibold text-slate-400">{progressPercent}% complete</p>
            </div>
          )}

          {/* Result View when complete */}
          {!isProcessing && result && (
            <div className="py-8 px-4 text-center space-y-6">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-sm">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 block mb-1">
                  SUCCESS
                </span>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {result.isMultiple
                    ? `${result.itemCount} Files Generated & Packaged!`
                    : 'File Successfully Generated!'}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {result.isMultiple
                    ? 'All generated output files were automatically bundled into a single ZIP archive.'
                    : 'Your completed document is ready to download.'}
                </p>
              </div>

              {/* Compression stats summary if available */}
              {result.stats && (result.stats.originalSize || result.stats.note) && (
                <div className="max-w-md mx-auto p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-left space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span>Optimization Report:</span>
                    {result.stats.savedPercentage !== undefined && result.stats.savedPercentage > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-[11px] font-extrabold">
                        Saved {result.stats.savedPercentage}%
                      </span>
                    )}
                  </div>
                  {result.stats.originalSize && result.stats.resultingSize && (
                    <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                      <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <p className="text-[10px] text-slate-400 uppercase font-semibold">Original</p>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{formatBytes(result.stats.originalSize)}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <p className="text-[10px] text-slate-400 uppercase font-semibold">Compressed</p>
                        <p className="font-bold text-emerald-600 dark:text-emerald-400">{formatBytes(result.stats.resultingSize)}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <p className="text-[10px] text-slate-400 uppercase font-semibold">Saved</p>
                        <p className="font-bold text-indigo-600 dark:text-indigo-400">
                          {result.stats.savedPercentage !== undefined && result.stats.savedPercentage > 0
                            ? `${result.stats.savedPercentage}%`
                            : '0%'}
                        </p>
                      </div>
                    </div>
                  )}
                  {result.stats.note && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      {result.stats.note}
                    </p>
                  )}
                </div>
              )}

              {/* Universal Output Rule Display */}
              {result.isMultiple && result.zipFile ? (
                /* MULTIPLE OUTPUT FILES → ZIP PACKAGE */
                <div className="max-w-md mx-auto p-5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-11 h-11 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                      <Archive className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                        {result.zipFile.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {formatBytes(result.zipFile.size)} • {result.itemCount} files inside
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => triggerDownload(result.zipFile!.blob, result.zipFile!.name)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 active:scale-[0.98] cursor-pointer transition-all shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download ZIP</span>
                  </button>
                </div>
              ) : result.singleFile ? (
                /* ONE OUTPUT FILE → DIRECT DOWNLOAD */
                <div className="max-w-md mx-auto p-5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate max-w-[200px]">
                        {result.singleFile.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {formatBytes(result.singleFile.size)}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => triggerDownload(result.singleFile!.blob, result.singleFile!.name)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 active:scale-[0.98] cursor-pointer transition-all shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download {result.singleFile.name}</span>
                  </button>
                </div>
              ) : null}

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Process more files</span>
                </button>
              </div>
            </div>
          )}

          {/* Standard Input & Options View */}
          {!isProcessing && !result && (
            <>
              {/* UNIVERSAL UPLOAD AREA: Entire area is clickable and supports drag & drop */}
              <div
                id="universal-upload-dropzone"
                role="button"
                tabIndex={0}
                onClick={() => {
                  if (isMultipleSupported && selectedFiles.length >= MAX_INPUT_FILES) {
                    setErrorMessage('Maximum 100 files can be processed at one time.');
                    return;
                  }
                  fileInputRef.current?.click();
                }}
                onDragOver={onDragOver}
                onDragEnter={onDragEnter}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (isMultipleSupported && selectedFiles.length >= MAX_INPUT_FILES) {
                      setErrorMessage('Maximum 100 files can be processed at one time.');
                      return;
                    }
                    fileInputRef.current?.click();
                  }
                }}
                className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isDragging
                    ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/60 scale-[1.01]'
                    : 'border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/40 hover:border-indigo-400 hover:bg-indigo-50/30 dark:hover:bg-slate-800/70'
                }`}
              >
                {/* Hidden native input with stopPropagation */}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple={isMultipleSupported}
                  accept={tool.acceptedFormats}
                  className="hidden"
                  onChange={onFileInputChange}
                  onClick={(e) => e.stopPropagation()}
                />

                <div className="w-16 h-16 mx-auto rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm mb-4 group-hover:scale-105 transition-transform">
                  <UploadCloud className="w-8 h-8" />
                </div>

                <p className="text-base font-bold text-slate-800 dark:text-slate-100">
                  Click anywhere in this area to select files, or{' '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isMultipleSupported && selectedFiles.length >= MAX_INPUT_FILES) {
                        setErrorMessage('Maximum 100 files can be processed at one time.');
                        return;
                      }
                      fileInputRef.current?.click();
                    }}
                    className="text-indigo-600 dark:text-indigo-400 underline font-extrabold hover:text-indigo-700 dark:hover:text-indigo-300 cursor-pointer"
                  >
                    Browse Files
                  </button>
                </p>

                <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Drag and drop {tool.acceptedFormats} files from your computer directly into this box{isMultipleSupported ? ' (up to 100 files)' : ''}.
                </p>
              </div>

              {/* SELECTED FILES LIST: Appears immediately BELOW the upload area */}
              {selectedFiles.length > 0 && (
                <div id="selected-files-list" className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Selected files ({selectedFiles.length}{isMultipleSupported ? ` / ${MAX_INPUT_FILES}` : ''})
                    </h3>

                    <div className="flex items-center gap-3">
                      {isMultipleSupported && (
                        <button
                          type="button"
                          onClick={() => {
                            if (selectedFiles.length >= MAX_INPUT_FILES) {
                              setErrorMessage('Maximum 100 files can be processed at one time.');
                              return;
                            }
                            fileInputRef.current?.click();
                          }}
                          className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add more</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={clearAllFiles}
                        className="text-xs font-semibold text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                      >
                        Clear all
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {selectedFiles.map((fileItem, idx) => (
                      <div
                        key={fileItem.id}
                        className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-sm hover:border-slate-300 dark:hover:border-slate-600 transition-all"
                      >
                        <div className="flex items-center gap-3 truncate flex-grow mr-2">
                          <span className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                          <div className="truncate">
                            <p className="font-semibold text-slate-900 dark:text-slate-100 truncate text-xs sm:text-sm">
                              {fileItem.name}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {fileItem.formattedSize}
                              {fileItem.pageCount !== undefined && (
                                <span> • {fileItem.pageCount} {fileItem.pageCount === 1 ? 'page' : 'pages'}</span>
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-1 shrink-0">
                          {tool.id === 'merge-pdf' && (
                            <>
                              <button
                                type="button"
                                onClick={() => moveFile(idx, 'up')}
                                disabled={idx === 0}
                                className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-25 transition-colors rounded cursor-pointer"
                                title="Move up"
                              >
                                <ArrowUp className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => moveFile(idx, 'down')}
                                disabled={idx === selectedFiles.length - 1}
                                className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-25 transition-colors rounded cursor-pointer"
                                title="Move down"
                              >
                                <ArrowDown className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button
                            type="button"
                            onClick={() => removeFile(fileItem.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors rounded cursor-pointer ml-1"
                            title="Remove file"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TOOL-SPECIFIC CONFIGURATION OPTIONS */}
              {selectedFiles.length > 0 && (
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-5">
                  {/* 1. SPLIT PDF - 3 DISTINCT EXPLICIT MODES */}
                  {tool.id === 'split-pdf' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block">
                          Choose Split Mode:
                        </label>
                        {firstDocPages > 0 && (
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                            Total Document Pages: <strong>{firstDocPages}</strong>
                          </span>
                        )}
                      </div>

                      {/* 3 Mode Radio Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* MODE 1: SPLIT EVERY PAGE */}
                        <button
                          type="button"
                          onClick={() => setSplitMode('every-page')}
                          className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            splitMode === 'every-page'
                              ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/70 ring-1 ring-indigo-600'
                              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                                Mode 1: Split Every Page
                              </span>
                              {splitMode === 'every-page' && (
                                <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                              Splits every page into an individual PDF file (e.g. page-1.pdf, page-2.pdf).
                            </p>
                          </div>
                          <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                            Output: ZIP Archive (split-pages.zip)
                          </div>
                        </button>

                        {/* MODE 2: EXTRACT SELECTED RANGES INTO ONE PDF */}
                        <button
                          type="button"
                          onClick={() => setSplitMode('combine-ranges')}
                          className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            splitMode === 'combine-ranges'
                              ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/70 ring-1 ring-indigo-600'
                              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                                Mode 2: Extract into ONE PDF
                              </span>
                              {splitMode === 'combine-ranges' && (
                                <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                              Combines multiple selected ranges into ONE output PDF. Pages outside ranges are excluded.
                            </p>
                          </div>
                          <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                            Output: 1 PDF (extracted-pages.pdf)
                          </div>
                        </button>

                        {/* MODE 3: SPLIT SELECTED RANGES INTO SEPARATE PDF FILES */}
                        <button
                          type="button"
                          onClick={() => setSplitMode('separate-ranges')}
                          className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            splitMode === 'separate-ranges'
                              ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/70 ring-1 ring-indigo-600'
                              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                                Mode 3: Split into Separate PDFs
                              </span>
                              {splitMode === 'separate-ranges' && (
                                <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                              Creates a distinct PDF for each selected range (e.g. range-1-3.pdf, range-4-6.pdf).
                            </p>
                          </div>
                          <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                            Output: ZIP Archive (split-ranges.zip)
                          </div>
                        </button>
                      </div>

                      {/* SPLIT RANGE BUILDER UX for Mode 2 and Mode 3 */}
                      {(splitMode === 'combine-ranges' || splitMode === 'separate-ranges') && (
                        <div className="mt-4 p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                              Define Page Ranges:
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {splitMode === 'combine-ranges'
                                ? 'All ranges will be merged into one single PDF'
                                : 'Each range will produce a separate PDF'}
                            </span>
                          </div>

                          <div className="space-y-2.5">
                            {splitRanges.map((r, idx) => {
                              const isInvalid =
                                r.from < 1 ||
                                r.to < 1 ||
                                r.from > r.to ||
                                (firstDocPages > 0 && r.to > firstDocPages);

                              return (
                                <div
                                  key={r.id}
                                  className={`p-3 rounded-lg border flex items-center justify-between gap-3 ${
                                    isInvalid
                                      ? 'border-rose-300 bg-rose-50/50 dark:bg-rose-950/20'
                                      : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40'
                                  }`}
                                >
                                  <div className="flex items-center gap-3 flex-grow">
                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300 shrink-0">
                                      Range {idx + 1}:
                                    </span>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-slate-500">Page</span>
                                      <input
                                        type="number"
                                        min={1}
                                        max={firstDocPages || 9999}
                                        value={r.from}
                                        onChange={(e) =>
                                          handleUpdateSplitRange(r.id, 'from', parseInt(e.target.value) || 1)
                                        }
                                        className="w-16 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs font-bold text-center focus:ring-2 focus:ring-indigo-500 outline-none"
                                      />
                                      <span className="text-xs text-slate-500 font-medium">to</span>
                                      <input
                                        type="number"
                                        min={1}
                                        max={firstDocPages || 9999}
                                        value={r.to}
                                        onChange={(e) =>
                                          handleUpdateSplitRange(r.id, 'to', parseInt(e.target.value) || 1)
                                        }
                                        className="w-16 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs font-bold text-center focus:ring-2 focus:ring-indigo-500 outline-none"
                                      />
                                    </div>
                                    {isInvalid && (
                                      <span className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
                                        <AlertTriangle className="w-3.5 h-3.5" />
                                        {r.from > r.to
                                          ? 'Start cannot exceed end'
                                          : firstDocPages > 0 && r.to > firstDocPages
                                          ? `Max ${firstDocPages} pages`
                                          : 'Invalid range'}
                                      </span>
                                    )}
                                  </div>

                                  {splitRanges.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveSplitRange(r.id)}
                                      className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                      title="Remove this range"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          <button
                            type="button"
                            onClick={handleAddSplitRange}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 cursor-pointer pt-1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>+ Add Another Range</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 2. COMPRESS PDF - GENUINE COMPRESSION LEVELS */}
                  {tool.id === 'compress-pdf' && (
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block">
                        Select Compression Level:
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                          {
                            id: 'low',
                            title: 'Low Compression',
                            desc: 'High visual quality • lighter file reduction',
                          },
                          {
                            id: 'recommended',
                            title: 'Recommended',
                            desc: 'Optimal balance of clear quality & file savings',
                          },
                          {
                            id: 'high',
                            title: 'High Compression',
                            desc: 'Maximum size reduction • slightly lower image DPI',
                          },
                        ].map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setCompressLevel(opt.id as CompressionLevel)}
                            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                              compressLevel === opt.id
                                ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/70 ring-1 ring-indigo-600'
                                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                                {opt.title}
                              </span>
                              {compressLevel === opt.id && (
                                <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-1 leading-normal">
                              {opt.desc}
                            </span>
                          </button>
                        ))}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        Processes real embedded images and document streams directly in your browser. Original and compressed byte counts are measured accurately without simulated values.
                      </p>
                    </div>
                  )}

                  {/* 3. ROTATE PDF OPTIONS */}
                  {tool.id === 'rotate-pdf' && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block">
                        Rotation Angle:
                      </label>
                      <div className="flex items-center gap-2">
                        {[
                          { label: '90° Clockwise', value: 90 },
                          { label: '180° Half Turn', value: 180 },
                          { label: '270° Counter-Clockwise', value: 270 },
                        ].map((item) => (
                          <button
                            key={item.value}
                            type="button"
                            onClick={() => setRotateAngle(item.value)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              rotateAngle === item.value
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 4. OUTPUT FILENAME OPTION (Merge PDF & JPG to PDF) */}
                  {(tool.id === 'merge-pdf' || tool.id === 'jpg-to-pdf') && (
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        Output Document Filename:
                      </label>
                      <input
                        type="text"
                        value={outputFilename}
                        onChange={(e) => setOutputFilename(e.target.value)}
                        placeholder="merged.pdf"
                        className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  )}

                  {/* 5. WORD TO PDF INFO */}
                  {tool.id === 'word-to-pdf' && (
                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <FileType className="w-4 h-4 text-indigo-500 shrink-0" />
                      <span>Converts modern Word (.docx) documents into clean, paginated PDF files preserving paragraphs, headings, bullet lists, and tables.</span>
                    </div>
                  )}

                  {/* 6. PDF TO WORD INFO */}
                  {tool.id === 'pdf-to-word' && (
                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <FileType className="w-4 h-4 text-indigo-500 shrink-0" />
                      <span>Extracts document text lines, headings, and structures into an editable Microsoft Word (.docx) document. Scanned image pages are preserved as embedded document graphics.</span>
                    </div>
                  )}

                  {/* 7. PDF TO JPG INFO */}
                  {tool.id === 'pdf-to-jpg' && (
                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-indigo-500 shrink-0" />
                      <span>Renders every page of your PDF into high-resolution JPG images. Single page PDFs download directly as a JPG; multi-page PDFs are automatically packaged into a ZIP archive.</span>
                    </div>
                  )}
                </div>
              )}

              {/* ACTION BUTTON */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {tool.id === 'merge-pdf' && selectedFiles.length < 2 && (
                    <span>Please select at least 2 PDF files to enable merging.</span>
                  )}
                  {tool.id !== 'merge-pdf' && selectedFiles.length === 0 && (
                    <span>Please select or drop a file to proceed.</span>
                  )}
                  {tool.id === 'merge-pdf' && selectedFiles.length >= 2 && (
                    <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                      Ready to merge {selectedFiles.length} documents.
                    </span>
                  )}
                </div>

                <button
                  id="tool-action-btn"
                  type="button"
                  onClick={handleExecuteOperation}
                  disabled={!isActionReady() || isProcessing}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-indigo-600/25 cursor-pointer transition-all"
                >
                  {tool.id === 'merge-pdf' && (
                    <>
                      <Layers className="w-4 h-4" />
                      <span>{selectedFiles.length >= 2 ? `Merge ${selectedFiles.length} PDFs` : 'Merge PDFs'}</span>
                    </>
                  )}
                  {tool.id === 'split-pdf' && (
                    <>
                      <Scissors className="w-4 h-4" />
                      <span>
                        {splitMode === 'every-page'
                          ? 'Split Every Page'
                          : splitMode === 'combine-ranges'
                          ? 'Extract Ranges to 1 PDF'
                          : 'Split Ranges to Separate PDFs'}
                      </span>
                    </>
                  )}
                  {tool.id === 'rotate-pdf' && (
                    <>
                      <RotateCw className="w-4 h-4" />
                      <span>Rotate PDF</span>
                    </>
                  )}
                  {tool.id === 'compress-pdf' && (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Compress PDF</span>
                    </>
                  )}
                  {tool.id === 'jpg-to-pdf' && (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Convert to PDF</span>
                    </>
                  )}
                  {tool.id === 'word-to-pdf' && (
                    <>
                      <FileType className="w-4 h-4" />
                      <span>Convert Word to PDF</span>
                    </>
                  )}
                  {tool.id === 'pdf-to-word' && (
                    <>
                      <FileType className="w-4 h-4" />
                      <span>Convert PDF to Word</span>
                    </>
                  )}
                  {tool.id === 'pdf-to-jpg' && (
                    <>
                      <ImageIcon className="w-4 h-4" />
                      <span>Convert PDF to JPG</span>
                    </>
                  )}
                  {tool.id !== 'merge-pdf' &&
                    tool.id !== 'split-pdf' &&
                    tool.id !== 'rotate-pdf' &&
                    tool.id !== 'compress-pdf' &&
                    tool.id !== 'jpg-to-pdf' &&
                    tool.id !== 'word-to-pdf' &&
                    tool.id !== 'pdf-to-word' &&
                    tool.id !== 'pdf-to-jpg' && (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Process Document</span>
                      </>
                    )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {relatedTools.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Related tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedTools.map((related) => (
              <Link
                key={related.id}
                to={`/${related.id}`}
                className="text-left p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-sm transition-all"
              >
                <p className="text-sm font-bold text-slate-900 dark:text-white">{related.name}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {related.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
