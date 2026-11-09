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
  Type,
  Layers,
  Sliders,
  PanelRight,
  Github,
  Instagram,
  ExternalLink,
} from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
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
  onOpenSidebar: () => void;
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
  onOpenSidebar,
  onPasteClipboard,
  onClearEditor,
  onCopyAll,
  onDownloadTex,
}) => {
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

      <DropdownMenuContent className="w-64 max-h-[85vh] overflow-y-auto" align="end" sideOffset={6}>
        {/* Document Formatting Group */}
        <DropdownMenuGroup>
          <DropdownMenuLabel>Documento y Formato</DropdownMenuLabel>

          {/* Submenu: Paper Type */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Layers className="w-3.5 h-3.5 mr-2 text-emerald-600 dark:text-emerald-400" />
              <span>Formato de Hoja</span>
              <span className="ml-auto text-[10px] text-slate-400 capitalize mr-1">{paperType}</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="w-44">
                <DropdownMenuItem onClick={() => onPaperTypeChange('letter')} className="flex items-center justify-between">
                  <span>Carta (Letter)</span>
                  {paperType === 'letter' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onPaperTypeChange('a4')} className="flex items-center justify-between">
                  <span>A4 (210×297)</span>
                  {paperType === 'a4' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onPaperTypeChange('legal')} className="flex items-center justify-between">
                  <span>Oficio (Legal)</span>
                  {paperType === 'legal' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          {/* Submenu: Global Font */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Type className="w-3.5 h-3.5 mr-2 text-blue-600 dark:text-blue-400" />
              <span>Tipografía</span>
              <span className="ml-auto text-[10px] text-slate-400 capitalize mr-1">{globalFont}</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="w-48">
                <DropdownMenuItem onClick={() => onGlobalFontChange('times')} className="flex items-center justify-between">
                  <span className="font-serif">Times New Roman</span>
                  {globalFont === 'times' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onGlobalFontChange('arial')} className="flex items-center justify-between">
                  <span className="font-sans">Arial (Sans)</span>
                  {globalFont === 'arial' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onGlobalFontChange('modern')} className="flex items-center justify-between">
                  <span className="font-serif">Latin Modern</span>
                  {globalFont === 'modern' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onGlobalFontChange('palatino')} className="flex items-center justify-between">
                  <span className="font-serif">Palatino</span>
                  {globalFont === 'palatino' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          {/* Submenu: Font Size */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Sliders className="w-3.5 h-3.5 mr-2 text-purple-600 dark:text-purple-400" />
              <span>Tamaño de Letra</span>
              <span className="ml-auto text-[10px] text-slate-400 mr-1">{fontSize}</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="w-36">
                <DropdownMenuItem onClick={() => onFontSizeChange('10pt')} className="flex items-center justify-between">
                  <span>10 pt</span>
                  {fontSize === '10pt' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onFontSizeChange('11pt')} className="flex items-center justify-between">
                  <span>11 pt</span>
                  {fontSize === '11pt' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onFontSizeChange('12pt')} className="flex items-center justify-between">
                  <span>12 pt</span>
                  {fontSize === '12pt' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
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

          <DropdownMenuItem onClick={onOpenSidebar}>
            <PanelRight className="w-3.5 h-3.5 mr-2 text-teal-600" />
            <span>Ver Panel Lateral</span>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={onGoToHome}>
            <Home className="w-3.5 h-3.5 mr-2 text-slate-400" />
            <span>Inicio / Prompt IA</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Developer & Credits */}
        <DropdownMenuGroup>
          <DropdownMenuLabel>Desarrollador</DropdownMenuLabel>
          <DropdownMenuItem asChild>
            <a
              href="https://github.com/Newman-a"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center w-full cursor-pointer"
            >
              <Github className="w-3.5 h-3.5 mr-2 text-slate-700 dark:text-zinc-300" />
              <span>GitHub: Newman Acosta</span>
              <ExternalLink className="w-3 h-3 ml-auto text-slate-400" />
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a
              href="https://instagram.com/newman.acostaa"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center w-full cursor-pointer"
            >
              <Instagram className="w-3.5 h-3.5 mr-2 text-pink-600" />
              <span>Instagram: @newman.acostaa</span>
              <ExternalLink className="w-3 h-3 ml-auto text-slate-400" />
            </a>
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

