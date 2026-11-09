import React, { useEffect } from 'react';
import {
  CheckCircle2,
  Download,
  ExternalLink,
  FileText,
  X,
} from 'lucide-react';
import { Button } from './ui/button';
import { PaperType, GlobalFont } from '@/lib/latexParser';

interface CompileSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  filename: string;
  paperType: PaperType;
  globalFont: GlobalFont;
  fontSize: '10pt' | '11pt' | '12pt';
  onDownloadPdf: () => void;
  onOpenPdfNewTab: () => void;
  onExportDocx?: () => void;
  onViewInPreview?: () => void;
}

export const CompileSuccessModal: React.FC<CompileSuccessModalProps> = ({
  isOpen,
  onClose,
  filename,
  paperType,
  onDownloadPdf,
  onOpenPdfNewTab,
  onExportDocx,
}) => {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const paperNames: Record<PaperType, string> = {
    letter: 'Carta',
    a4: 'A4',
    legal: 'Oficio',
  };

  const cleanFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[320px] sm:max-w-xs bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xl p-5 relative animate-in zoom-in-95 duration-150 text-slate-900 dark:text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3.5 right-3.5 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 p-1 rounded-lg transition-colors"
          title="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Minimal Icon & Header */}
        <div className="flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2.5">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
            PDF Listo
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono mt-0.5 truncate max-w-[240px]">
            {cleanFilename} • {paperNames[paperType]}
          </p>
        </div>

        {/* Compact Actions */}
        <div className="mt-4 space-y-2">
          {/* Primary Action: Download PDF */}
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={() => {
              onDownloadPdf();
              onClose();
            }}
            className="w-full h-9 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar PDF</span>
          </Button>

          {/* Secondary Actions: Open PDF / Word */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                onOpenPdfNewTab();
              }}
              className="h-8 text-xs border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl flex items-center justify-center gap-1.5"
            >
              <ExternalLink className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>Ver PDF</span>
            </Button>

            {onExportDocx && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  onExportDocx();
                }}
                className="h-8 text-xs border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl flex items-center justify-center gap-1.5"
              >
                <FileText className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                <span>Word</span>
              </Button>
            )}
          </div>

          {/* Tertiary Action: Continue Editing */}
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={onClose}
              className="text-[11px] text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 py-1 transition-colors"
            >
              Seguir ajustando
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
