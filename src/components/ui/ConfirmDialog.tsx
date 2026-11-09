import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from './button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Aceptar',
  cancelText = 'Cancelar',
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-6 relative animate-in zoom-in-95 duration-200 text-slate-900 dark:text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close X */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 p-1 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content */}
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/60 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>

          <div className="flex-1 pr-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5 leading-tight">
              {title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 mt-6 pt-4 border-t border-slate-100 dark:border-zinc-800">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-xs px-4 h-9 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg"
          >
            {cancelText}
          </Button>

          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="text-xs px-4 h-9 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg shadow-sm"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

