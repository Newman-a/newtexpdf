import React from 'react';
import {
  Moon,
  Sun,
  BookOpen,
  Zap,
  Loader2,
  Home,
  Type,
  FileText,
  Menu,
  Code2,
  Eye,
  GraduationCap,
  Github,
} from 'lucide-react';
import { Button } from './ui/button';
import { PaperType, GlobalFont } from '@/lib/latexParser';
import { HeaderDropdownMenu } from './HeaderDropdownMenu';

interface HeaderProps {
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
  onOpenCoverModal?: () => void;
  activeMobileTab?: 'editor' | 'preview';
  onToggleMobileTab?: (tab: 'editor' | 'preview') => void;
  onPasteClipboard?: () => void;
  onClearEditor?: () => void;
  onCopyAll?: () => void;
  onDownloadTex?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
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
  onOpenCoverModal,
  activeMobileTab = 'editor',
  onToggleMobileTab,
  onPasteClipboard,
  onClearEditor,
  onCopyAll,
  onDownloadTex,
}) => {
  return (
    <header className="border-b border-slate-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-sm sticky top-0 z-30">
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 gap-2">
        {/* Left side: Logo, brand & home link */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onGoToHome}
            className="flex items-center gap-2 group cursor-pointer focus:outline-none"
            title="Ir a Inicio / Ver Prompt Universitario"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-600 text-white font-serif font-bold shadow-sm group-hover:bg-emerald-500 transition-colors">
              <span className="text-base tracking-tighter">T<sub className="text-[10px]">E</sub>X</span>
            </div>
            <div className="text-left hidden xs:block">
              <h1 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-zinc-100 leading-tight">
                NewTexPDF
              </h1>
            </div>
          </button>

          {/* Return to Home / Prompt */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onGoToHome}
            className="h-7 px-2 text-xs text-slate-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 hidden sm:flex items-center gap-1"
            title="Volver a Inicio / Prompt Universitario"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium">Inicio</span>
          </Button>
        </div>

        {/* Center: Mobile Segment Switcher (visible on < md) */}
        {onToggleMobileTab && (
          <div className="flex md:hidden items-center bg-slate-100 dark:bg-zinc-900 p-0.5 rounded-lg border border-slate-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => onToggleMobileTab('editor')}
              className={`px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${
                activeMobileTab === 'editor'
                  ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Editor</span>
            </button>
            <button
              type="button"
              onClick={() => onToggleMobileTab('preview')}
              className={`px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${
                activeMobileTab === 'preview'
                  ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Vista</span>
            </button>
          </div>
        )}

        {/* Right side: Action Controls & Lateral Menu Trigger */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Global Font Selector (Desktop Only) */}
          <div className="hidden md:flex items-center bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-md px-1.5 py-1 text-xs">
            <Type className="w-3 h-3 text-slate-400 mr-1" />
            <select
              value={globalFont}
              onChange={(e) => onGlobalFontChange(e.target.value as GlobalFont)}
              className="bg-transparent text-xs text-slate-800 dark:text-zinc-200 focus:outline-none cursor-pointer font-medium"
              title="Tipografía del documento"
            >
              <option value="times" className="dark:bg-zinc-900">Times New Roman</option>
              <option value="arial" className="dark:bg-zinc-900">Arial (Sans)</option>
              <option value="modern" className="dark:bg-zinc-900">Latin Modern</option>
              <option value="palatino" className="dark:bg-zinc-900">Palatino</option>
            </select>
          </div>

          {/* Font Size Selector (Desktop Only) */}
          <div className="hidden md:flex items-center bg-slate-100 dark:bg-zinc-900 p-0.5 rounded-md border border-slate-200 dark:border-zinc-800 text-xs">
            {(['10pt', '11pt', '12pt'] as const).map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => onFontSizeChange(size)}
                className={`px-1.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  fontSize === size
                    ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-zinc-200'
                }`}
                title={`Tamaño de fuente base: ${size}`}
              >
                {size}
              </button>
            ))}
          </div>

          {/* Paper Type Switcher (Desktop Only) */}
          <div className="hidden md:flex items-center bg-slate-100 dark:bg-zinc-900 p-0.5 rounded-md border border-slate-200 dark:border-zinc-800 text-xs">
            <button
              type="button"
              onClick={() => onPaperTypeChange('a4')}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                paperType === 'a4'
                  ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
              title="Hoja A4 (210 × 297 mm)"
            >
              A4
            </button>
            <button
              type="button"
              onClick={() => onPaperTypeChange('letter')}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                paperType === 'letter'
                  ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
              title="Hoja Carta / Letter (215.9 × 279.4 mm)"
            >
              Carta
            </button>
            <button
              type="button"
              onClick={() => onPaperTypeChange('legal')}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                paperType === 'legal'
                  ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
              title="Hoja Oficio / Legal (215.9 × 355.6 mm)"
            >
              Oficio
            </button>
          </div>

          {/* Syntax Help Dialog Trigger (Desktop only, available in mobile dropdown menu) */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hidden md:inline-flex"
            onClick={onOpenHelp}
            title="Guía de sintaxis LaTeX y KaTeX"
          >
            <BookOpen className="w-4 h-4" />
          </Button>

          {/* Dark Mode Toggle (Desktop only, available in mobile dropdown menu) */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hidden md:inline-flex"
            onClick={onToggleDarkMode}
            title={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {darkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </Button>

          {/* GitHub / Doc link (Desktop) */}
          <a
            href="https://github.com/Newman-a/newtexpdf"
            target="_blank"
            rel="noopener noreferrer"
            className="h-8 px-2 text-xs text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-md hidden md:flex items-center gap-1.5 transition-colors"
            title="Ver documentación y repositorio en GitHub"
          >
            <Github className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium">Doc</span>
          </a>

          {/* Main Action: Compile with Tectonic */}
          <Button
            type="button"
            variant="default"
            size="sm"
            disabled={isCompiling}
            className="h-8 px-2.5 sm:px-3 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm flex items-center gap-1.5 rounded-md"
            onClick={onCompileTectonic}
            title="Compilar con motor Tectonic (Ctrl + Enter)"
          >
            {isCompiling ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span className="hidden sm:inline">Compilando...</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden sm:inline">Compilar Tectonic</span>
                <span className="sm:hidden">PDF</span>
              </>
            )}
          </Button>

          {/* Action: Export to Word (.docx) */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isExportingDocx}
            className="h-8 px-2 sm:px-2.5 text-xs text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/60 bg-blue-50/70 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 font-medium flex items-center gap-1.5 rounded-md transition-colors"
            onClick={onExportDocx}
            title="Exportar documento en formato editable Microsoft Word (.docx)"
          >
            {isExportingDocx ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span className="hidden sm:inline">Word...</span>
              </>
            ) : (
              <>
                <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span className="hidden sm:inline">Exportar Word</span>
                <span className="sm:hidden">Word</span>
              </>
            )}
          </Button>

          {/* Action: Generate Academic Cover Page (PDF) - Desktop only outside, on mobile it lives inside the Menu */}
          {onOpenCoverModal && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="hidden md:flex h-8 px-2.5 text-xs text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/70 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 font-medium items-center gap-1.5 rounded-md transition-colors shrink-0"
              onClick={onOpenCoverModal}
              title="Generar portada universitaria en PDF lista para imprimir o anexar"
            >
              <GraduationCap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Portada PDF</span>
            </Button>
          )}

          {/* Radix UI Dropdown Menu (Only shown on mobile devices, hidden on desktop) */}
          <div className="md:hidden">
            <HeaderDropdownMenu
              paperType={paperType}
              onPaperTypeChange={onPaperTypeChange}
              globalFont={globalFont}
              onGlobalFontChange={onGlobalFontChange}
              fontSize={fontSize}
              onFontSizeChange={onFontSizeChange}
              onCompileTectonic={onCompileTectonic}
              isCompiling={isCompiling}
              onExportDocx={onExportDocx}
              isExportingDocx={isExportingDocx}
              darkMode={darkMode}
              onToggleDarkMode={onToggleDarkMode}
              onOpenHelp={onOpenHelp}
              onGoToHome={onGoToHome}
              onOpenCoverModal={onOpenCoverModal}
              onPasteClipboard={onPasteClipboard}
              onClearEditor={onClearEditor}
              onCopyAll={onCopyAll}
              onDownloadTex={onDownloadTex}
            />
          </div>
        </div>
      </div>
    </header>
  );
};
