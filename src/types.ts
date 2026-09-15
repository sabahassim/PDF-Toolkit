export type ToolCategory = 'all' | 'organize' | 'convert-to' | 'convert-from' | 'optimize';

export type ToolStatus = 'live' | 'in-development';

export interface PdfTool {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  status: ToolStatus;
  iconName: string;
  badge?: string;
  accentColor: 'indigo' | 'blue' | 'emerald' | 'violet' | 'amber' | 'teal' | 'rose' | 'sky';
  acceptedFormats: string;
  actionPrompt: string;
  features: string[];
}

export interface UploadedFileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  formattedSize: string;
  pageCount?: number;
}

export interface MergeResult {
  blob: Blob;
  downloadUrl: string;
  filename: string;
  pageCount: number;
  totalSize: number;
}

export type ThemeMode = 'light' | 'dark' | 'system';

export interface UserPreferences {
  theme: ThemeMode;
  autoDownload: boolean;
  highQualityPreview: boolean;
  privacyStrict: boolean;
}

