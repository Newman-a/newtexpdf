import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  FileCheck,
  Zap,
  AlertTriangle,
  Info,
  X,
  Smartphone,
  FileText,
  Scaling,
} from 'lucide-react';
import { Button } from './ui/button';
import { PaperType, GlobalFont } from '@/lib/latexParser';

interface DocumentPreviewProps {
  htmlContent: string;
  paperType: PaperType;
  globalFont: GlobalFont;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  documentRef: React.RefObject<HTMLDivElement>;
  tectonicPdfUrl: string | null;
  onCompileTectonic: () => void;
  isCompilingTectonic: boolean;
  tectonicError: { message: string; details?: string } | null;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  htmlContent,
  paperType,
  globalFont,
  zoom,
  onZoomChange,
  documentRef,
  tectonicPdfUrl,
  onCompileTectonic,
  isCompilingTectonic,
  tectonicError,
}) => {
  const [activeTab, setActiveTab] = useState<'katex' | 'pdf'>('katex');
  const [fullscreen, setFullscreen] = useState(false);
  const [showPreviewNotice, setShowPreviewNotice] = useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Responsive mode: adapts naturally to mobile screen width without tiny scale
  const [isMobileAdapted, setIsMobileAdapted] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  // Auto-switch to PDF tab when a new tectonic PDF is compiled
  useEffect(() => {
    if (tectonicPdfUrl) {
      setActiveTab('pdf');
    }
  }, [tectonicPdfUrl]);

  const handleZoomIn = () => {
    onZoomChange(Math.min(zoom + 0.15, 2.0));
  };

  const handleZoomOut = () => {
    onZoomChange(Math.max(zoom - 0.15, 0.25));
  };

  const handleResetZoom = () => {
    onZoomChange(1.0);
  };

  const handleFitToWidth = () => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.clientWidth - 24;
    const pageWidthMm = paperType === 'a4' ? 210 : 215.9;
    const pageWidthPx = pageWidthMm * 3.7795;
    const targetZoom = Math.min(Math.max(containerWidth / pageWidthPx, 0.25), 1.5);
    onZoomChange(Number(targetZoom.toFixed(2)));
  };

  const paperClass =
    paperType === 'a4'
      ? 'a4-page'
      : paperType === 'legal'
      ? 'legal-page'
      : 'letter-page';

  const fontClass =
    globalFont === 'times'
      ? 'font-times'
      : globalFont === 'arial'
      ? 'font-arial'
      : globalFont === 'palatino'
      ? 'font-palatino'
      : 'font-modern';

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-slate-200/60 dark:bg-zinc-950 relative transition-all duration-200 overflow-hidden",
        fullscreen && "fixed inset-0 z-50 bg-zinc-950 p-4"
      )}
    >
      {/* Tab Switcher & Floating Control Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 z-10 shrink-0 flex-wrap gap-2">
        {/* Left: View Mode Tabs */}
        <div className="flex items-center bg-slate-100 dark:bg-zinc-800 p-0.5 rounded-lg border border-slate-200 dark:border-zinc-700">
          <button
            type="button"
            onClick={() => setActiveTab('katex')}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all",
              activeTab === 'katex'
                ? "bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-sm font-semibold"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100"
            )}
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Vista Rápida KaTeX</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('pdf');
              if (!tectonicPdfUrl && !isCompilingTectonic) {
                onCompileTectonic();
              }
            }}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all relative",
              activeTab === 'pdf'
                ? "bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-sm font-semibold"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100"
            )}
          >
            <FileCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>PDF Tectonic Nativo</span>
            {tectonicPdfUrl && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </button>
        </div>

        {/* Right: Zoom & Tool Actions */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Mobile vs Sheet Adaptation Switcher */}
          {activeTab === 'katex' && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={cn(
                "h-7 px-2 text-xs flex items-center gap-1.5 transition-colors border shadow-xs rounded-md",
                isMobileAdapted
                  ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 font-semibold"
                  : "border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:text-slate-900"
              )}
              onClick={() => setIsMobileAdapted(!isMobileAdapted)}
              title={
                isMobileAdapted
                  ? "Cambiar a vista de Hoja Impresa real (A4/Carta)"
                  : "Adaptar vista al ancho de pantalla del móvil"
              }
            >
              {isMobileAdapted ? (
                <>
                  <Smartphone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Adaptado Móvil</span>
                </>
              ) : (
                <>
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">Hoja Impresa</span>
                  <span className="sm:hidden">Hoja</span>
                </>
              )}
            </Button>
          )}

          {activeTab === 'katex' && !isMobileAdapted && (
            <>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-slate-600 dark:text-zinc-400"
                onClick={handleZoomOut}
                title="Reducir zoom"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </Button>
              <span className="text-xs font-mono text-slate-600 dark:text-zinc-400 min-w-[36px] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-slate-600 dark:text-zinc-400"
                onClick={handleZoomIn}
                title="Aumentar zoom"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-1.5 text-xs text-slate-600 dark:text-zinc-400"
                onClick={handleFitToWidth}
                title="Ajustar escala al ancho disponible"
              >
                <Scaling className="w-3 h-3 mr-1" /> Ajustar
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-1.5 text-xs text-slate-600 dark:text-zinc-400 hidden sm:inline-flex"
                onClick={handleResetZoom}
                title="Restablecer a 100%"
              >
                <RotateCcw className="w-3 h-3 mr-1" /> 100%
              </Button>
            </>
          )}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 ml-0.5 text-slate-600 dark:text-zinc-400"
            onClick={() => setFullscreen(!fullscreen)}
            title={fullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Notice Alert about Live KaTeX Approximation vs Final Tectonic Vector PDF */}
      {showPreviewNotice && activeTab === 'katex' && (
        <div className="bg-amber-500/10 dark:bg-amber-950/30 border-b border-amber-300/40 dark:border-amber-800/40 px-3 py-2 text-[11px] sm:text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between gap-3 shrink-0 animate-in fade-in duration-200 select-none">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <p className="leading-snug">
              <strong>Aviso sobre la vista rápida:</strong> Esta previsualización es solo una aproximación interactiva en vivo. Si notas caracteres o formatos desalineados, no te preocupes: el documento final y exacto con calidad de imprenta se genera al presionar <strong>Compilar Tectonic</strong>.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowPreviewNotice(false)}
            className="p-1 rounded hover:bg-amber-200/50 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-400 shrink-0 transition-colors"
            title="Cerrar aviso"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main View Area */}
      {activeTab === 'katex' ? (
        <div
          ref={containerRef}
          className="flex-1 overflow-auto p-2 sm:p-6 md:p-8 flex justify-center items-start"
        >
          {isMobileAdapted ? (
            /* 100% Responsive Mobile Fluid View (No awkward sideways overflow) */
            <div className="w-full max-w-2xl mx-auto shadow-md rounded-xl bg-white border border-slate-200 dark:border-zinc-800 animate-in fade-in duration-150">
              <div
                ref={documentRef}
                id="latex-preview-page"
                className={cn(
                  "latex-document bg-white text-slate-900 select-text mobile-adapted-page",
                  fontClass
                )}
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            </div>
          ) : (
            /* Scaled Real Sheet Simulation (Carta / A4 / Oficio) */
            <div
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: 'top center',
                transition: 'transform 0.15s ease-out',
              }}
              className="shadow-2xl rounded-sm"
            >
              <div
                ref={documentRef}
                id="latex-preview-page"
                className={cn(
                  "latex-document bg-white text-slate-900 border border-slate-300 select-text",
                  paperClass,
                  fontClass
                )}
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            </div>
          )}
        </div>
      ) : (
        /* Native Tectonic PDF View Area */
        <div className="flex-1 relative bg-zinc-950 flex flex-col items-center justify-center overflow-hidden">
          {tectonicPdfUrl ? (
            <iframe
              src={`${tectonicPdfUrl}#toolbar=1&navpanes=1`}
              className="w-full h-full border-none"
              title="PDF Nativo Generado por Tectonic"
            />
          ) : isCompilingTectonic ? (
            <div className="flex flex-col items-center gap-3 p-6 text-center text-zinc-300">
              <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <p className="font-semibold text-sm">Compilando documento con Tectonic WebAssembly...</p>
              <p className="text-xs text-zinc-400 max-w-sm">
                Generando documento PDF vectorial de alta precisión tipográfica con cálculo de márgenes y fuentes de imprenta directamente en tu navegador.
              </p>
            </div>
          ) : tectonicError ? (
            <div className="p-6 max-w-lg bg-red-950/90 border border-red-800 text-red-200 rounded-xl m-4 overflow-auto max-h-[80%] shadow-2xl">
              <div className="flex items-center gap-2 font-bold text-red-400 mb-2">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span>Error en el compilador Tectonic</span>
              </div>
              <p className="text-xs mb-3 text-red-300">{tectonicError.message}</p>
              {tectonicError.details && (
                <pre className="text-[11px] p-3 bg-black/60 rounded border border-red-900/50 font-mono whitespace-pre-wrap overflow-x-auto text-red-200 leading-normal mb-3">
                  {tectonicError.details}
                </pre>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs bg-red-900/40 border-red-700 text-white hover:bg-red-900/60"
                onClick={onCompileTectonic}
              >
                Reintentar compilación
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 p-6 text-center text-zinc-400 max-w-sm">
              <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400">
                <Zap className="w-7 h-7" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-zinc-200 mb-1">PDF Nativo aún no compilado</h4>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Presiona el botón de abajo o <kbd className="px-1 py-0.5 bg-zinc-800 rounded text-[10px] font-mono text-zinc-300">Ctrl + Enter</kbd> para compilar tu código TeX directamente con Tectonic WebAssembly.
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                onClick={onCompileTectonic}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs px-4"
              >
                Compilar con Tectonic
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
