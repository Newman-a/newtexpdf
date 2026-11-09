import React from 'react';
import {
  X,
  FileText,
  Zap,
  BookOpen,
  Home,
  Sun,
  Moon,
  Trash2,
  Download,
  Copy,
  ClipboardPaste,
  Github,
  Instagram,
  Type,
  FileStack,
  Sparkles,
} from 'lucide-react';
import { Button } from './ui/button';
import { PaperType, GlobalFont } from '@/lib/latexParser';

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  paperType: PaperType;
  onPaperTypeChange: (paper: PaperType) => void;
  globalFont: GlobalFont;
  onGlobalFontChange: (font: GlobalFont) => void;
  fontSize: '10pt' | '11pt' | '12pt';
  onFontSizeChange: (size: '10pt' | '11pt' | '12pt') => void;
  onCompileTectonic: () => void;
  isCompiling: boolean;
  onExportDocx: () => void;
  isExportingDocx: boolean;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenHelp: () => void;
  onGoToHome: () => void;
  onPasteClipboard?: () => void;
  onClearEditor?: () => void;
  onCopyAll?: () => void;
  onDownloadTex?: () => void;
}

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({
  isOpen,
  onClose,
  paperType,
  onPaperTypeChange,
  globalFont,
  onGlobalFontChange,
  fontSize,
  onFontSizeChange,
  onCompileTectonic,
  isCompiling,
  onExportDocx,
  isExportingDocx,
  darkMode,
  onToggleDarkMode,
  onOpenHelp,
  onGoToHome,
  onPasteClipboard,
  onClearEditor,
  onCopyAll,
  onDownloadTex,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-out Sidebar Panel */}
      <aside className="relative z-50 w-full max-w-xs sm:max-w-sm h-full bg-white dark:bg-zinc-950 border-l border-slate-200 dark:border-zinc-800 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-200 dark:border-zinc-800 shrink-0 bg-slate-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-600 text-white font-serif font-bold text-xs shadow-sm">
              T<sub className="text-[9px]">E</sub>X
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                Menú de Control
              </h2>
              <p className="text-[10px] text-slate-500 dark:text-zinc-400">
                Ajustes y herramientas del documento
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-zinc-800 transition-colors"
            title="Cerrar menú"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 text-xs text-slate-700 dark:text-zinc-300">
          {/* Main Primary Actions */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500 tracking-wider">
              Acciones Principales
            </span>
            <div className="grid grid-cols-1 gap-2">
              <Button
                type="button"
                onClick={() => {
                  onCompileTectonic();
                  onClose();
                }}
                disabled={isCompiling}
                className="w-full h-9 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center justify-center gap-2 rounded-lg shadow-sm"
              >
                <Zap className="w-4 h-4 text-amber-300" />
                <span>{isCompiling ? 'Compilando...' : 'Compilar Tectonic (PDF)'}</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onExportDocx();
                  onClose();
                }}
                disabled={isExportingDocx}
                className="w-full h-9 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/60 bg-blue-50/70 dark:bg-blue-950/40 hover:bg-blue-100 font-semibold flex items-center justify-center gap-2 rounded-lg"
              >
                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>{isExportingDocx ? 'Generando...' : 'Exportar a Word (.docx)'}</span>
              </Button>
            </div>
          </div>

          {/* Quick Clipboard Paste & Copy */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500 tracking-wider">
              Portapapeles & Archivo
            </span>
            <div className="grid grid-cols-2 gap-2">
              {onPasteClipboard && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onPasteClipboard();
                    onClose();
                  }}
                  className="h-8 text-xs flex items-center justify-center gap-1.5 border-slate-200 dark:border-zinc-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                  title="Pegar texto copiado"
                >
                  <ClipboardPaste className="w-3.5 h-3.5" />
                  <span>Pegar</span>
                </Button>
              )}

              {onCopyAll && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onCopyAll();
                    onClose();
                  }}
                  className="h-8 text-xs flex items-center justify-center gap-1.5 border-slate-200 dark:border-zinc-800"
                  title="Copiar todo el código LaTeX"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Todo</span>
                </Button>
              )}

              {onDownloadTex && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onDownloadTex();
                    onClose();
                  }}
                  className="h-8 text-xs flex items-center justify-center gap-1.5 border-slate-200 dark:border-zinc-800"
                  title="Descargar archivo .tex"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Guardar .tex</span>
                </Button>
              )}

              {onClearEditor && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onClearEditor();
                    onClose();
                  }}
                  className="h-8 text-xs flex items-center justify-center gap-1.5 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/40 hover:bg-red-50 dark:hover:bg-red-950/30"
                  title="Limpiar editor"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Vaciar</span>
                </Button>
              )}
            </div>
          </div>

          {/* Paper Type Selection */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500 tracking-wider flex items-center gap-1.5">
              <FileStack className="w-3.5 h-3.5" /> Tamaño de Hoja
            </span>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-zinc-900 rounded-lg border border-slate-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => onPaperTypeChange('letter')}
                className={`py-1.5 px-2 rounded-md font-medium text-xs text-center transition-all ${
                  paperType === 'letter'
                    ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-sm font-bold'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Carta
              </button>
              <button
                type="button"
                onClick={() => onPaperTypeChange('a4')}
                className={`py-1.5 px-2 rounded-md font-medium text-xs text-center transition-all ${
                  paperType === 'a4'
                    ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-sm font-bold'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                A4
              </button>
              <button
                type="button"
                onClick={() => onPaperTypeChange('legal')}
                className={`py-1.5 px-2 rounded-md font-medium text-xs text-center transition-all ${
                  paperType === 'legal'
                    ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-sm font-bold'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Oficio
              </button>
            </div>
          </div>

          {/* Typography Selection */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500 tracking-wider flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5" /> Tipografía del Documento
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: 'times', label: 'Times New Roman', fontClass: 'font-serif' },
                { id: 'arial', label: 'Arial (Sans)', fontClass: 'font-sans' },
                { id: 'modern', label: 'Latin Modern', fontClass: 'font-serif' },
                { id: 'palatino', label: 'Palatino', fontClass: 'font-serif' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => onGlobalFontChange(f.id as GlobalFont)}
                  className={`p-2 rounded-lg border text-left text-xs transition-all ${
                    globalFont === f.id
                      ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 font-semibold shadow-xs'
                      : 'border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900 text-slate-700 dark:text-zinc-300'
                  }`}
                >
                  <div className={f.fontClass}>{f.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Base Font Size */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500 tracking-wider">
              Tamaño Base de Letra
            </span>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-zinc-900 rounded-lg border border-slate-200 dark:border-zinc-800">
              {(['10pt', '11pt', '12pt'] as const).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => onFontSizeChange(size)}
                  className={`py-1.5 px-2 rounded-md font-medium text-xs text-center transition-all ${
                    fontSize === size
                      ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-sm font-bold'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Navigation & Preferences */}
          <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 space-y-1.5">
            <button
              type="button"
              onClick={() => {
                onOpenHelp();
                onClose();
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-700 dark:text-zinc-300 text-left transition-colors"
            >
              <BookOpen className="w-4 h-4 text-slate-500" />
              <span>Guía de Sintaxis LaTeX</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onGoToHome();
                onClose();
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-700 dark:text-zinc-300 text-left transition-colors"
            >
              <Home className="w-4 h-4 text-slate-500" />
              <span>Volver a Inicio / Prompt IA</span>
            </button>

            <button
              type="button"
              onClick={onToggleDarkMode}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-700 dark:text-zinc-300 text-left transition-colors"
            >
              <div className="flex items-center gap-2.5">
                {darkMode ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-500" />
                )}
                <span>{darkMode ? 'Modo Claro' : 'Modo Oscuro'}</span>
              </div>
              <span className="text-[10px] text-slate-400 uppercase font-mono">
                {darkMode ? 'Dark' : 'Light'}
              </span>
            </button>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-3.5 border-t border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 text-[11px] text-slate-500 dark:text-zinc-400 flex items-center justify-between">
          <div>
            Desarrollado por <strong className="text-slate-800 dark:text-zinc-200">Ing. Newman Acosta</strong>
          </div>
          <div className="flex items-center gap-1.5">
            <a
              href="https://github.com/Newman-a"
              target="_blank"
              rel="noopener noreferrer"
              className="w-6 h-6 rounded flex items-center justify-center text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              title="GitHub"
            >
              <Github className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://www.instagram.com/newman_ga/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-6 h-6 rounded flex items-center justify-center text-slate-600 dark:text-zinc-400 hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
              title="Instagram"
            >
              <Instagram className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </aside>
    </div>
  );
};

