import React, { useEffect } from 'react';
import { X, ShieldCheck, FileCheck } from 'lucide-react';

interface PolicyModalProps {
  type: 'privacy' | 'terms' | null;
  onClose: () => void;
}

export const PolicyModal: React.FC<PolicyModalProps> = ({ type, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (type) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [type, onClose]);

  if (!type) return null;

  return (
    <div
      id="policy-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        id="policy-modal-card"
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              {type === 'privacy' ? <ShieldCheck className="w-5 h-5" /> : <FileCheck className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {type === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Effective Date: September 2026 • PDF Tools
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {type === 'privacy' ? (
            <>
              <h4 className="font-bold text-slate-900 dark:text-white text-base">
                1. Our Privacy Commitment
              </h4>
              <p>
                PDF Tools operates under a strict "zero-retention" philosophy. When you work with PDF
                documents on our platform, your files are processed in ephemeral memory and are never saved to
                permanent databases or hard disks.
              </p>

              <h4 className="font-bold text-slate-900 dark:text-white text-base">
                2. No File Telemetry or Inspection
              </h4>
              <p>
                We do not index, search, read, or inspect the content of your documents. No document data
                is used to train machine learning models or sold to third-party brokers.
              </p>

              <h4 className="font-bold text-slate-900 dark:text-white text-base">
                3. Encryption & In-Transit Security
              </h4>
              <p>
                All data transmission between your browser and our services utilizes industry-standard
                TLS 1.3 encryption.
              </p>

              <h4 className="font-bold text-slate-900 dark:text-white text-base">
                4. Automated Deletion
              </h4>
              <p>
                Once your task is completed or the browser session ends, all temporary operational memory
                allocations are cleared immediately.
              </p>
            </>
          ) : (
            <>
              <h4 className="font-bold text-slate-900 dark:text-white text-base">
                1. Acceptance of Terms
              </h4>
              <p>
                By using PDF Tools, you agree to access and utilize the utility services strictly for lawful
                purposes. You retain full ownership and copyrights of any documents you process with our tools.
              </p>

              <h4 className="font-bold text-slate-900 dark:text-white text-base">
                2. Acceptable Use
              </h4>
              <p>
                You agree not to use the platform to process unlawful, malicious, or infringing content.
                Automated scraping or malicious overloading of platform interfaces is strictly prohibited.
              </p>

              <h4 className="font-bold text-slate-900 dark:text-white text-base">
                3. Disclaimer of Warranty
              </h4>
              <p>
                PDF Tools provides utilities "as is" without warranty of any kind. While we design all tools
                for maximum fidelity and reliability, users should retain copies of their original documents.
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
