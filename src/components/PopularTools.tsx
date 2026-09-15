import React, { useState, useMemo } from 'react';
import { PdfTool, ToolCategory } from '../types';
import { PDF_TOOLS, TOOL_CATEGORIES } from '../data/tools';
import { ToolCard } from './ToolCard';
import { Search, Filter, Sparkles, AlertCircle } from 'lucide-react';

interface PopularToolsProps {
  onSelectTool: (tool: PdfTool) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  darkMode?: boolean;
}

export const PopularTools: React.FC<PopularToolsProps> = ({
  onSelectTool,
  searchQuery,
  onSearchChange,
  darkMode = false,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory>('all');

  const filteredTools = useMemo(() => {
    return PDF_TOOLS.filter((tool) => {
      const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
      const matchesSearch =
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.acceptedFormats.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <section id="tools" className="py-16 md:py-24 bg-slate-50/70 dark:bg-slate-900/60 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Core Toolset</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Popular Tools
            </h2>
            <p className="mt-2 text-base text-slate-600 dark:text-slate-300 max-w-xl">
              High-performance utilities built to handle all your PDF tasks. Select a tool to begin
              previewing its workflow.
            </p>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {TOOL_CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  id={`cat-filter-${cat.id}`}
                  onClick={() => setSelectedCategory(cat.id as ToolCategory)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/25'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Counter & Search feedback */}
        {searchQuery && (
          <div className="mb-6 flex items-center justify-between px-4 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 text-sm">
            <span className="text-indigo-900 dark:text-indigo-200">
              Showing results for: <strong>"{searchQuery}"</strong> ({filteredTools.length} found)
            </span>
            <button
              onClick={() => onSearchChange('')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              Reset search
            </button>
          </div>
        )}

        {/* Tools Grid */}
        {filteredTools.length > 0 ? (
          <div
            id="tools-grid"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {filteredTools.map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                onClick={onSelectTool}
                darkMode={darkMode}
              />
            ))}
          </div>
        ) : (
          /* Empty Search State */
          <div className="text-center py-16 px-4 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
              No matching tools found
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              We couldn't find any tool matching "{searchQuery}". Try clearing your search query or selecting "All Tools".
            </p>
            <button
              onClick={() => {
                onSearchChange('');
                setSelectedCategory('all');
              }}
              className="mt-5 px-4 py-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 rounded-lg hover:bg-indigo-100"
            >
              View All Tools
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
