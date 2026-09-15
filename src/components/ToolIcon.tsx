import React from 'react';
import {
  Files,
  Scissors,
  FileArchive,
  FileText,
  FileOutput,
  Image as ImageIcon,
  Images,
  RotateCw,
  FileCheck,
} from 'lucide-react';
import { PdfTool } from '../types';

interface ToolIconProps {
  iconName: string;
  accentColor: PdfTool['accentColor'];
  className?: string;
  size?: number;
}

export const ToolIcon: React.FC<ToolIconProps> = ({
  iconName,
  accentColor,
  className = 'w-6 h-6',
  size = 24,
}) => {
  const getIcon = () => {
    switch (iconName) {
      case 'Files':
        return <Files size={size} className={className} />;
      case 'Scissors':
        return <Scissors size={size} className={className} />;
      case 'FileArchive':
        return <FileArchive size={size} className={className} />;
      case 'FileText':
        return <FileText size={size} className={className} />;
      case 'FileOutput':
        return <FileOutput size={size} className={className} />;
      case 'Image':
        return <ImageIcon size={size} className={className} />;
      case 'Images':
        return <Images size={size} className={className} />;
      case 'RotateCw':
        return <RotateCw size={size} className={className} />;
      default:
        return <FileCheck size={size} className={className} />;
    }
  };

  return <>{getIcon()}</>;
};

export const getAccentStyles = (accent: PdfTool['accentColor'], isDark: boolean = false) => {
  switch (accent) {
    case 'indigo':
      return {
        bg: isDark ? 'bg-indigo-950/60' : 'bg-indigo-50',
        text: isDark ? 'text-indigo-400' : 'text-indigo-600',
        border: isDark ? 'border-indigo-800/50' : 'border-indigo-100',
        hoverBorder: 'hover:border-indigo-400 dark:hover:border-indigo-600',
        glow: 'hover:shadow-indigo-500/10',
        badgeBg: isDark ? 'bg-indigo-900/50 text-indigo-300' : 'bg-indigo-100 text-indigo-700',
      };
    case 'rose':
      return {
        bg: isDark ? 'bg-rose-950/60' : 'bg-rose-50',
        text: isDark ? 'text-rose-400' : 'text-rose-600',
        border: isDark ? 'border-rose-800/50' : 'border-rose-100',
        hoverBorder: 'hover:border-rose-400 dark:hover:border-rose-600',
        glow: 'hover:shadow-rose-500/10',
        badgeBg: isDark ? 'bg-rose-900/50 text-rose-300' : 'bg-rose-100 text-rose-700',
      };
    case 'emerald':
      return {
        bg: isDark ? 'bg-emerald-950/60' : 'bg-emerald-50',
        text: isDark ? 'text-emerald-400' : 'text-emerald-600',
        border: isDark ? 'border-emerald-800/50' : 'border-emerald-100',
        hoverBorder: 'hover:border-emerald-400 dark:hover:border-emerald-600',
        glow: 'hover:shadow-emerald-500/10',
        badgeBg: isDark ? 'bg-emerald-900/50 text-emerald-300' : 'bg-emerald-100 text-emerald-700',
      };
    case 'blue':
      return {
        bg: isDark ? 'bg-blue-950/60' : 'bg-blue-50',
        text: isDark ? 'text-blue-400' : 'text-blue-600',
        border: isDark ? 'border-blue-800/50' : 'border-blue-100',
        hoverBorder: 'hover:border-blue-400 dark:hover:border-blue-600',
        glow: 'hover:shadow-blue-500/10',
        badgeBg: isDark ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-700',
      };
    case 'sky':
      return {
        bg: isDark ? 'bg-sky-950/60' : 'bg-sky-50',
        text: isDark ? 'text-sky-400' : 'text-sky-600',
        border: isDark ? 'border-sky-800/50' : 'border-sky-100',
        hoverBorder: 'hover:border-sky-400 dark:hover:border-sky-600',
        glow: 'hover:shadow-sky-500/10',
        badgeBg: isDark ? 'bg-sky-900/50 text-sky-300' : 'bg-sky-100 text-sky-700',
      };
    case 'amber':
      return {
        bg: isDark ? 'bg-amber-950/60' : 'bg-amber-50',
        text: isDark ? 'text-amber-400' : 'text-amber-600',
        border: isDark ? 'border-amber-800/50' : 'border-amber-100',
        hoverBorder: 'hover:border-amber-400 dark:hover:border-amber-600',
        glow: 'hover:shadow-amber-500/10',
        badgeBg: isDark ? 'bg-amber-900/50 text-amber-300' : 'bg-amber-100 text-amber-700',
      };
    case 'teal':
      return {
        bg: isDark ? 'bg-teal-950/60' : 'bg-teal-50',
        text: isDark ? 'text-teal-400' : 'text-teal-600',
        border: isDark ? 'border-teal-800/50' : 'border-teal-100',
        hoverBorder: 'hover:border-teal-400 dark:hover:border-teal-600',
        glow: 'hover:shadow-teal-500/10',
        badgeBg: isDark ? 'bg-teal-900/50 text-teal-300' : 'bg-teal-100 text-teal-700',
      };
    case 'violet':
    default:
      return {
        bg: isDark ? 'bg-violet-950/60' : 'bg-violet-50',
        text: isDark ? 'text-violet-400' : 'text-violet-600',
        border: isDark ? 'border-violet-800/50' : 'border-violet-100',
        hoverBorder: 'hover:border-violet-400 dark:hover:border-violet-600',
        glow: 'hover:shadow-violet-500/10',
        badgeBg: isDark ? 'bg-violet-900/50 text-violet-300' : 'bg-violet-100 text-violet-700',
      };
  }
};
