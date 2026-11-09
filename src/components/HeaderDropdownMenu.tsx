import React from 'react';
import {
  Menu,
  Zap,
  FileText,
  Download,
  Copy,
  ClipboardPaste,
  BookOpen,
  Sun,
  Moon,
  Trash2,
  Home,
  Check,
  ChevronDown,
  Type,
  Layers,
  Sliders,
  GraduationCap,
} from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { PaperType, GlobalFont } from '@/lib/latexParser';

interface HeaderDropdownMenuProps {
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
  onPasteClipboard?: () => void;
  onClearEditor?: () => void;
  onCopyAll?: () => void;
  onDownloadTex?: () => void;
}

export const HeaderDropdownMenu: React.FC<HeaderDropdownMenuProps> = ({
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
  onPasteClipboard,
  onClearEditor,
  onCopyAll,
  onDownloadTex,
}) => {
  const [expandedSection, setExpandedSection] = React.useState<'paper' | 'font' | 'size' | null>(null);

  const toggleSection = (section: 'paper' | 'font' | 'size', e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedSection(prev => (prev === section ? null : section));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 px-2.5 text-xs text-slate-700 dark:text-zinc-200 border-slate-200 dark:border-zinc-800 flex items-center gap-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors shadow-xs"
          title="Abrir menú de configuración y acciones"
        >
          <Menu className="w-4 h-4 text-slate-700 dark:text-zinc-200" />
          <span className="hidden sm:inline font-medium">Menú</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-72 max-w-[calc(100vw-1.5rem)] max-h-[85vh] overflow-y-auto" align="end" sideOffset={6}>
        {/* Document Formatting Group */}
        <DropdownMenuGroup>
          <DropdownMenuLabel>Documento y Formato</DropdownMenuLabel>

          {/* Collapsible: Formato de Hoja */}
          <div className="flex flex-col">
            <button
              type="button"
              onClick={(e) => toggleSection('paper', e)}
              className={`flex items-center w-full px-2 py-1.5 text-xs rounded-md transition-colors ${
                expandedSection === 'paper'
                  ? 'bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 font-medium'
                  : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5 mr-2 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Formato de Hoja</span>
              <span className="ml-auto text-[10px] text-slate-400 dark:text-zinc-400 capitalize mr-1.5">
                {paperType === 'letter' ? 'Carta' : paperType === 'legal' ? 'Oficio' : 'A4'}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                  expandedSection === 'paper' ? 'rotate-180 text-emerald-600 dark:text-emerald-400' : ''
                }`}
              />
            </button>
            {expandedSection === 'paper' && (
              <div className="mx-1 my-1 p-1 rounded-lg bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/70 dark:border-zinc-800 space-y-0.5 animate-in fade-in-50 duration-150">
                <button
                  type="button"
                  onClick={() => onPaperTypeChange('letter')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                    paperType === 'letter'
                      ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-700/50'
                  }`}
                >
                  <span>Carta (Letter)</span>
                  {paperType === 'letter' && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                </button>
                <button
                  type="button"
                  onClick={() => onPaperTypeChange('a4')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                    paperType === 'a4'
                      ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-700/50'
                  }`}
                >
                  <span>A4 (210×297 mm)</span>
                  {paperType === 'a4' && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                </button>
                <button
                  type="button"
                  onClick={() => onPaperTypeChange('legal')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                    paperType === 'legal'
                      ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-700/50'
                  }`}
                >
                  <span>Oficio (Legal)</span>
                  {paperType === 'legal' && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                </button>
              </div>
            )}
          </div>

          {/* Collapsible: Tipografía */}
          <div className="flex flex-col">
            <button
              type="button"
              onClick={(e) => toggleSection('font', e)}
              className={`flex items-center w-full px-2 py-1.5 text-xs rounded-md transition-colors ${
                expandedSection === 'font'
                  ? 'bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 font-medium'
                  : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              <Type className="w-3.5 h-3.5 mr-2 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>Tipografía</span>
              <span className="ml-auto text-[10px] text-slate-400 dark:text-zinc-400 capitalize mr-1.5">
                {globalFont === 'times' ? 'Times' : globalFont === 'arial' ? 'Arial' : globalFont === 'modern' ? 'Modern' : 'Palatino'}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                  expandedSection === 'font' ? 'rotate-180 text-blue-600 dark:text-blue-400' : ''
                }`}
              />
            </button>
            {expandedSection === 'font' && (
              <div className="mx-1 my-1 p-1 rounded-lg bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/70 dark:border-zinc-800 space-y-0.5 animate-in fade-in-50 duration-150">
                <button
                  type="button"
                  onClick={() => onGlobalFontChange('times')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                    globalFont === 'times'
                      ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-700/50'
                  }`}
                >
                  <span className="font-serif">Times New Roman</span>
                  {globalFont === 'times' && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                </button>
                <button
                  type="button"
                  onClick={() => onGlobalFontChange('arial')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                    globalFont === 'arial'
                      ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-700/50'
                  }`}
                >
                  <span className="font-sans">Arial (Sans)</span>
                  {globalFont === 'arial' && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                </button>
                <button
                  type="button"
                  onClick={() => onGlobalFontChange('modern')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                    globalFont === 'modern'
                      ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-700/50'
                  }`}
                >
                  <span className="font-serif">Latin Modern</span>
                  {globalFont === 'modern' && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                </button>
                <button
                  type="button"
                  onClick={() => onGlobalFontChange('palatino')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                    globalFont === 'palatino'
                      ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-700/50'
                  }`}
                >
                  <span className="font-serif">Palatino</span>
                  {globalFont === 'palatino' && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                </button>
              </div>
            )}
          </div>

          {/* Collapsible: Tamaño de Letra */}
          <div className="flex flex-col">
            <button
              type="button"
              onClick={(e) => toggleSection('size', e)}
              className={`flex items-center w-full px-2 py-1.5 text-xs rounded-md transition-colors ${
                expandedSection === 'size'
                  ? 'bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 font-medium'
                  : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 mr-2 text-purple-600 dark:text-purple-400 shrink-0" />
              <span>Tamaño de Letra</span>
              <span className="ml-auto text-[10px] text-slate-400 dark:text-zinc-400 mr-1.5 font-normal">
                {fontSize}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                  expandedSection === 'size' ? 'rotate-180 text-purple-600 dark:text-purple-400' : ''
                }`}
              />
            </button>
            {expandedSection === 'size' && (
              <div className="mx-1 my-1 p-1 rounded-lg bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/70 dark:border-zinc-800 space-y-0.5 animate-in fade-in-50 duration-150">
                {(['10pt', '11pt', '12pt'] as const).map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => onFontSizeChange(size)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                      fontSize === size
                        ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 font-semibold shadow-xs'
                        : 'text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-700/50'
                    }`}
                  >
                    <span>{size}</span>
                    {fontSize === size && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Primary Actions Group */}
        <DropdownMenuGroup>
          <DropdownMenuLabel>Acciones Principales</DropdownMenuLabel>
          <DropdownMenuItem onClick={onCompileTectonic} disabled={isCompiling}>
            <Zap className="w-3.5 h-3.5 mr-2 text-amber-500" />
            <span>Compilar Tectonic (PDF)</span>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={onExportDocx} disabled={isExportingDocx}>
            <FileText className="w-3.5 h-3.5 mr-2 text-blue-500" />
            <span>Exportar Word (.docx)</span>
          </DropdownMenuItem>

          {onOpenCoverModal && (
            <DropdownMenuItem onClick={onOpenCoverModal}>
              <GraduationCap className="w-3.5 h-3.5 mr-2 text-emerald-600 dark:text-emerald-400" />
              <span>Generar Portada (PDF)</span>
            </DropdownMenuItem>
          )}

          {onDownloadTex && (
            <DropdownMenuItem onClick={onDownloadTex}>
              <Download className="w-3.5 h-3.5 mr-2 text-slate-500" />
              <span>Guardar archivo .tex</span>
            </DropdownMenuItem>
          )}

          {onPasteClipboard && (
            <DropdownMenuItem onClick={onPasteClipboard}>
              <ClipboardPaste className="w-3.5 h-3.5 mr-2 text-emerald-600 dark:text-emerald-400" />
              <span>Pegar portapapeles</span>
            </DropdownMenuItem>
          )}

          {onCopyAll && (
            <DropdownMenuItem onClick={onCopyAll}>
              <Copy className="w-3.5 h-3.5 mr-2 text-slate-500" />
              <span>Copiar todo el código</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Views and Tools */}
        <DropdownMenuGroup>
          <DropdownMenuLabel>Navegación y Vistas</DropdownMenuLabel>
          <DropdownMenuItem onClick={onOpenHelp}>
            <BookOpen className="w-3.5 h-3.5 mr-2 text-indigo-500" />
            <span>Guía de Sintaxis LaTeX</span>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={onToggleDarkMode}>
            {darkMode ? (
              <>
                <Sun className="w-3.5 h-3.5 mr-2 text-amber-400" />
                <span>Modo Claro</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 mr-2 text-slate-400" />
                <span>Modo Oscuro</span>
              </>
            )}
          </DropdownMenuItem>

          <DropdownMenuItem onClick={onGoToHome}>
            <Home className="w-3.5 h-3.5 mr-2 text-slate-400" />
            <span>Inicio / Prompt IA</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        {onClearEditor && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={onClearEditor}
                className="text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-950/40 focus:text-red-600"
              >
                <Trash2 className="w-3.5 h-3.5 mr-2" />
                <span>Vaciar Editor</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

