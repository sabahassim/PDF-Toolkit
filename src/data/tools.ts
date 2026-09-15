import { PdfTool } from '../types';

export const PDF_TOOLS: PdfTool[] = [
  {
    id: 'merge-pdf',
    name: 'Merge PDF',
    description: 'Combine multiple PDF files into one unified document in your custom order.',
    category: 'organize',
    status: 'live',
    iconName: 'Files',
    badge: 'Popular',
    accentColor: 'indigo',
    acceptedFormats: '.pdf',
    actionPrompt: 'Select PDF files to merge',
    features: ['Custom page reordering', 'Multi-file upload', 'Instant client-side merge'],
  },
  {
    id: 'split-pdf',
    name: 'Split PDF',
    description: 'Extract select page ranges or save every individual page as an independent PDF.',
    category: 'organize',
    status: 'live',
    iconName: 'Scissors',
    badge: 'Essential',
    accentColor: 'rose',
    acceptedFormats: '.pdf',
    actionPrompt: 'Select PDF file to split',
    features: ['Extract page ranges', 'Separate into individual files', 'Real ZIP download'],
  },
  {
    id: 'compress-pdf',
    name: 'Compress PDF',
    description: 'Significantly reduce document file size while keeping crisp text and images.',
    category: 'optimize',
    status: 'live',
    iconName: 'FileArchive',
    badge: 'Live',
    accentColor: 'emerald',
    acceptedFormats: '.pdf',
    actionPrompt: 'Select PDF file to compress',
    features: ['Lossless stream optimization', 'Fast local processing', 'Direct download'],
  },
  {
    id: 'rotate-pdf',
    name: 'Rotate PDF',
    description: 'Turn your PDF pages 90, 180, or 270 degrees clockwise or counterclockwise.',
    category: 'organize',
    status: 'live',
    iconName: 'RotateCw',
    badge: 'Live',
    accentColor: 'violet',
    acceptedFormats: '.pdf',
    actionPrompt: 'Select PDF file to rotate',
    features: ['Rotate 90°, 180°, 270°', 'Batch rotation', 'Single or ZIP download'],
  },
  {
    id: 'jpg-to-pdf',
    name: 'JPG to PDF',
    description: 'Convert photos, scans, and JPG images into a single organized, shareable PDF.',
    category: 'convert-to',
    status: 'live',
    iconName: 'Images',
    badge: 'Live',
    accentColor: 'teal',
    acceptedFormats: '.jpg, .jpeg, .png, .webp',
    actionPrompt: 'Select JPG images to convert to PDF',
    features: ['Multi-image support', 'Clean page scaling', 'Unified PDF output'],
  },
  {
    id: 'pdf-to-word',
    name: 'PDF to Word',
    description: 'Transform PDF documents into editable Microsoft Word (.docx) documents with layout preservation.',
    category: 'convert-from',
    status: 'live',
    iconName: 'FileText',
    badge: 'Document',
    accentColor: 'blue',
    acceptedFormats: '.pdf',
    actionPrompt: 'Select PDF file to convert to Word',
    features: ['Retains formatting & tables', 'Editable docx output', 'Document export'],
  },
  {
    id: 'word-to-pdf',
    name: 'Word to PDF',
    description: 'Convert DOC and DOCX documents into clean, standard PDF files ready for distribution.',
    category: 'convert-to',
    status: 'live',
    iconName: 'FileOutput',
    badge: 'Document',
    accentColor: 'sky',
    acceptedFormats: '.doc, .docx',
    actionPrompt: 'Select Word file to convert to PDF',
    features: ['Font preservation', 'Print-ready quality', 'Full vector rendering'],
  },
  {
    id: 'pdf-to-jpg',
    name: 'PDF to JPG',
    description: 'Extract every page of a PDF document into high-resolution JPG or JPEG images.',
    category: 'convert-from',
    status: 'live',
    iconName: 'Image',
    badge: 'Images',
    accentColor: 'amber',
    acceptedFormats: '.pdf',
    actionPrompt: 'Select PDF file to export as JPG',
    features: ['High resolution extraction', 'Batch image archive download', 'ZIP download'],
  },
];

export const TOOL_CATEGORIES = [
  { id: 'all', label: 'All Tools' },
  { id: 'organize', label: 'Organize & Edit' },
  { id: 'optimize', label: 'Optimize & Compress' },
  { id: 'convert-from', label: 'Convert from PDF' },
  { id: 'convert-to', label: 'Convert to PDF' },
] as const;

export const TOOL_ROUTES = PDF_TOOLS.map((tool) => `/${tool.id}`);

export function getToolById(id: string): PdfTool | undefined {
  return PDF_TOOLS.find((tool) => tool.id === id);
}

export function getRelatedTools(tool: PdfTool, limit = 4): PdfTool[] {
  const sameCategory = PDF_TOOLS.filter((item) => item.id !== tool.id && item.category === tool.category);
  const remaining = PDF_TOOLS.filter((item) => item.id !== tool.id && item.category !== tool.category);
  return [...sameCategory, ...remaining].slice(0, limit);
}
