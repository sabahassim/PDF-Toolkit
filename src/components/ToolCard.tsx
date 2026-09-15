import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { PdfTool } from '../types';
import { ToolIcon, getAccentStyles } from './ToolIcon';

interface ToolCardProps {
  tool: PdfTool;
  darkMode?: boolean;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool, darkMode = false }) => {
  const styles = getAccentStyles(tool.accentColor, darkMode);

  return (
    <Link
      to={`/${tool.id}`}
      id={`tool-card-${tool.id}`}
      className={`group relative flex flex-col justify-between p-6 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/80 shadow-xs hover:shadow-xl ${styles.glow} transition-all duration-300 hover:-translate-y-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500`}
    >
      {/* Top row: Icon and Optional Badge */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center border ${styles.bg} ${styles.text} ${styles.border} group-hover:scale-105 transition-transform duration-300`}
          >
            <ToolIcon iconName={tool.iconName} accentColor={tool.accentColor} className="w-6 h-6 stroke-[2.2]" />
          </div>

          <div className="flex items-center gap-2">
            {tool.status === 'live' ? (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Live Tool</span>
              </span>
            ) : (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                In Development
              </span>
            )}
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-700/60 text-slate-400 dark:text-slate-400 group-hover:bg-indigo-600 group-hover:text-white dark:group-hover:bg-indigo-500 dark:group-hover:text-white transition-colors duration-200">
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </div>
        </div>

        {/* Tool Name */}
        <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {tool.name}
        </h3>

        {/* Short Description */}
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
          {tool.description}
        </p>
      </div>

      {/* Card Footer: Quick features pill and Clickable indicator */}
      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 dark:text-slate-400">
          Accepts {tool.acceptedFormats}
        </span>
        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 group-hover:underline">
          <span>Launch Tool</span>
        </span>
      </div>
    </Link>
  );
};
