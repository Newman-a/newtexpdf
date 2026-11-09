import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { LatexEditor } from './components/LatexEditor';
import { DocumentPreview } from './components/DocumentPreview';
import { HelpModal } from './components/HelpModal';
import { LandingPage } from './components/LandingPage';
import { ConfirmDialog } from './components/ui/ConfirmDialog';
import { CompileSuccessModal } from './components/CompileSuccessModal';
import {
  parseLatexToHtml,
  PaperType,
  GlobalFont,
  applyPaperTypeToLatex,
  applyFontToLatex,
  applyFontSizeToLatex,
} from './lib/latexParser';
import { compileLatexDocument } from './lib/tectonicEngine';
import { exportDocumentToWord } from './lib/docxExporter';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const INITIAL_LATEX_CODE = '';

function checkIsEditorRoute(): boolean {
  if (typeof window === 'undefined') return false;
  const hash = window.location.hash.toLowerCase();
  const search = window.location.search.toLowerCase();
  const path = window.location.pathname.toLowerCase();
  return (
    hash.includes('editor') ||
    search.includes('editor') ||
    path.endsWith('/editor') ||
    path.includes('/editor/')
  );
}

export function App() {
  // Navigation view: 'landing' (index with prompt & info) or 'editor' (studio workspace)
  const [view, setView] = useState<'landing' | 'editor'>(() => {
    return checkIsEditorRoute() ? 'editor' : 'landing';
  });

  // Listen to route changes (hashchange or back/forward buttons)
  useEffect(() => {
    const handleSyncRoute = () => {
      setView(checkIsEditorRoute() ? 'editor' : 'landing');
    };
    window.addEventListener('hashchange', handleSyncRoute);
    window.addEventListener('popstate', handleSyncRoute);
    return () => {
      window.removeEventListener('hashchange', handleSyncRoute);
      window.removeEventListener('popstate', handleSyncRoute);
    };
  }, []);

  // LaTeX source code with localStorage persistence (starts completely blank)
  const [latexCode, setLatexCode] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('newtexpdf_code_blank');
        if (saved !== null) return saved;
      } catch {}
    }
    return INITIAL_LATEX_CODE;
  });

  // Sync latex code to localStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem('newtexpdf_code_blank', latexCode);
    } catch {}
  }, [latexCode]);

  const handleGoToEditor = () => {
    setView('editor');
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', '?editor=true');
    }
  };

  const handleGoToHome = () => {
    setView('landing');
    if (typeof window !== 'undefined') {
      window.location.hash = '';
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  // Settings: Paper (A4, Carta, Oficio), Typography & Base Font Size
  const [paperType, setPaperType] = useState<PaperType>('letter');
  const [globalFont, setGlobalFont] = useState<GlobalFont>('times');
  const [fontSize, setFontSize] = useState<'10pt' | '11pt' | '12pt'>('12pt');
  const [zoom, setZoom] = useState<number>(1.0);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Tectonic compilation states
  const [isCompilingTectonic, setIsCompilingTectonic] = useState<boolean>(false);
  const [tectonicPdfUrl, setTectonicPdfUrl] = useState<string | null>(null);
  const [tectonicError, setTectonicError] = useState<{ message: string; details?: string } | null>(null);
  const [isExportingDocx, setIsExportingDocx] = useState<boolean>(false);

  // UI state
  const [helpOpen, setHelpOpen] = useState<boolean>(false);
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');
  const [confirmClearOpen, setConfirmClearOpen] = useState<boolean>(false);
  const [compileSuccessOpen, setCompileSuccessOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Ref to the rendered printable sheet
  const documentRef = useRef<HTMLDivElement>(null);

  // Update HTML class on dark mode change
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Parse LaTeX to HTML reactively for instant editing feedback
  const parseResult = useMemo(() => {
    return parseLatexToHtml(latexCode);
  }, [latexCode]);

  // Sync detected metadata from LaTeX code if it already has paper, font or size
  useEffect(() => {
    if (parseResult.metadata.paperType && parseResult.metadata.paperType !== paperType) {
      setPaperType(parseResult.metadata.paperType);
    }
    if (parseResult.metadata.globalFont && parseResult.metadata.globalFont !== globalFont) {
      setGlobalFont(parseResult.metadata.globalFont);
    }
    if (parseResult.metadata.fontSize && ['10pt', '11pt', '12pt'].includes(parseResult.metadata.fontSize)) {
      setFontSize(parseResult.metadata.fontSize as '10pt' | '11pt' | '12pt');
    }
  }, [parseResult.metadata.paperType, parseResult.metadata.globalFont, parseResult.metadata.fontSize]);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleClear = () => {
    setConfirmClearOpen(true);
  };

  const executeClear = () => {
    setLatexCode('');
    setTectonicPdfUrl(null);
    setTectonicError(null);
    try {
      localStorage.removeItem('newtexpdf_code_blank');
    } catch {}
    showToast('success', 'Editor vaciado correctamente.');
  };

  const handlePaperTypeChange = (newPaper: PaperType) => {
    setPaperType(newPaper);
    const updatedCode = applyPaperTypeToLatex(latexCode, newPaper);
    if (updatedCode !== latexCode) {
      setLatexCode(updatedCode);
    }
    const label = newPaper === 'a4' ? 'A4' : newPaper === 'legal' ? 'Oficio (Legal)' : 'Carta (Letter)';
    showToast('success', `Tamaño de hoja cambiado a ${label}.`);
  };

  const handleGlobalFontChange = (newFont: GlobalFont) => {
    setGlobalFont(newFont);
    const updatedCode = applyFontToLatex(latexCode, newFont);
    if (updatedCode !== latexCode) {
      setLatexCode(updatedCode);
    }
    const fontNames: Record<GlobalFont, string> = {
      times: 'Times New Roman',
      arial: 'Arial (Sans-Serif)',
      modern: 'Latin Modern',
      palatino: 'Palatino',
    };
    showToast('success', `Tipografía cambiada a ${fontNames[newFont]}.`);
  };

  const handleFontSizeChange = (newSize: '10pt' | '11pt' | '12pt') => {
    setFontSize(newSize);
    const updatedCode = applyFontSizeToLatex(latexCode, newSize);
    if (updatedCode !== latexCode) {
      setLatexCode(updatedCode);
    }
    showToast('success', `Tamaño de letra base fijado en ${newSize}.`);
  };

  // Compile using Tectonic engine
  const handleCompileTectonic = useCallback(async () => {
    if (!latexCode.trim()) {
      showToast('error', 'El editor está vacío.');
      return;
    }

    try {
      setIsCompilingTectonic(true);
      setTectonicError(null);

      const safeTitle = parseResult.metadata.title
        ? parseResult.metadata.title.toLowerCase().replace(/[^a-z0-9]/gi, '_').substring(0, 30)
        : 'documento';

      const result = await compileLatexDocument(latexCode, `${safeTitle}.pdf`);

      if (result.success && result.pdfUrl) {
        setTectonicPdfUrl(result.pdfUrl);
        setCompileSuccessOpen(true);
        showToast('success', 'PDF generado con éxito.');
      } else {
        setTectonicError({
          message: result.error || 'Error al compilar con Tectonic',
          details: result.details,
        });
        showToast('error', result.error || 'Fallo de compilación con Tectonic');
      }
    } catch (err: any) {
      setTectonicError({
        message: 'No se pudo compilar el documento con Tectonic',
        details: err?.message,
      });
      showToast('error', 'Error al ejecutar Tectonic');
    } finally {
      setIsCompilingTectonic(false);
    }
  }, [latexCode, parseResult.metadata.title]);

  const handleDownloadCompiledPdf = () => {
    if (!tectonicPdfUrl) return;
    const safeTitle = parseResult.metadata.title
      ? parseResult.metadata.title.toLowerCase().replace(/[^a-z0-9]/gi, '_').substring(0, 30)
      : 'documento';
    const a = document.createElement('a');
    a.href = tectonicPdfUrl;
    a.download = `${safeTitle}.pdf`;
    a.click();
    showToast('success', 'Descarga de PDF iniciada.');
  };

  const handleOpenPdfNewTab = () => {
    if (!tectonicPdfUrl) return;
    window.open(tectonicPdfUrl, '_blank');
  };

  // Export to Microsoft Word (.docx) directly in browser
  const handleExportDocx = useCallback(async () => {
    if (!latexCode.trim()) {
      showToast('error', 'El documento está vacío.');
      return;
    }

    try {
      setIsExportingDocx(true);
      const safeTitle = parseResult.metadata.title
        ? parseResult.metadata.title.toLowerCase().replace(/[^a-z0-9]/gi, '_').substring(0, 30)
        : 'documento';

      await exportDocumentToWord(parseResult.html, {
        filename: `${safeTitle}.docx`,
        paperType,
        globalFont,
        fontSize,
      });

      showToast('success', 'Documento Word (.docx) descargado con éxito.');
    } catch (err: any) {
      console.error('Error al exportar Word:', err);
      showToast('error', 'Error al exportar a Word (.docx)');
    } finally {
      setIsExportingDocx(false);
    }
  }, [latexCode, parseResult.html, parseResult.metadata.title, paperType, globalFont, fontSize]);

  // Actions for Sidebar Drawer
  const handlePasteClipboard = async () => {
    try {
      if (!navigator.clipboard || !navigator.clipboard.readText) {
        showToast('error', 'El navegador bloqueó la lectura directa. Usa Ctrl + V.');
        return;
      }
      const text = await navigator.clipboard.readText();
      if (!text || !text.trim()) {
        showToast('error', 'El portapapeles está vacío.');
        return;
      }
      setLatexCode((prev) => (prev ? `${prev}\n${text}` : text));
      showToast('success', 'Texto pegado en el editor.');
    } catch {
      showToast('error', 'Permiso denegado por el navegador. Usa Ctrl + V.');
    }
  };

  const handleCopyAll = async () => {
    try {
      await navigator.clipboard.writeText(latexCode);
      showToast('success', 'Código copiado al portapapeles.');
    } catch {
      showToast('error', 'No se pudo copiar el código.');
    }
  };

  const handleDownloadTex = () => {
    const blob = new Blob([latexCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'documento.tex';
    a.click();
    URL.revokeObjectURL(url);
    showToast('success', 'Archivo documento.tex descargado.');
  };

  // If in landing view, render the Landing / Index page
  if (view === 'landing') {
    return (
      <>
        <LandingPage
          onGoToEditor={handleGoToEditor}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
        />
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-xl text-xs font-medium bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border border-zinc-700 dark:border-zinc-300 animate-in slide-in-from-bottom-3 duration-200">
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        )}
      </>
    );
  }

  // Otherwise, render full Studio Editor & Preview Workspace
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-100 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100">
      {/* Top Navbar */}
      <Header
        paperType={paperType}
        onPaperTypeChange={handlePaperTypeChange}
        globalFont={globalFont}
        onGlobalFontChange={handleGlobalFontChange}
        fontSize={fontSize}
        onFontSizeChange={handleFontSizeChange}
        onCompileTectonic={handleCompileTectonic}
        isCompiling={isCompilingTectonic}
        onExportDocx={handleExportDocx}
        isExportingDocx={isExportingDocx}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onOpenHelp={() => setHelpOpen(true)}
        onGoToHome={handleGoToHome}
        activeMobileTab={mobileTab}
        onToggleMobileTab={setMobileTab}
        onPasteClipboard={handlePasteClipboard}
        onClearEditor={handleClear}
        onCopyAll={handleCopyAll}
        onDownloadTex={handleDownloadTex}
      />

      {/* Main Split Layout: Responsive Editor (Left) & Preview (Right) */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Left Side: LaTeX Code Editor */}
        <section
          className={`w-full md:w-1/2 h-full flex flex-col min-w-0 ${
            mobileTab === 'editor' ? 'flex' : 'hidden md:flex'
          }`}
        >
          <LatexEditor
            value={latexCode}
            onChange={(val) => {
              setLatexCode(val);
            }}
            onClear={handleClear}
            onCompile={handleCompileTectonic}
            onNotify={showToast}
          />
        </section>

        {/* Right Side: Dual-view Preview (Live KaTeX OR Native Tectonic PDF) */}
        <section
          className={`w-full md:w-1/2 h-full flex flex-col min-w-0 ${
            mobileTab === 'preview' ? 'flex' : 'hidden md:flex'
          }`}
        >
          <DocumentPreview
            htmlContent={parseResult.html}
            paperType={paperType}
            globalFont={globalFont}
            zoom={zoom}
            onZoomChange={setZoom}
            documentRef={documentRef}
            tectonicPdfUrl={tectonicPdfUrl}
            onCompileTectonic={handleCompileTectonic}
            isCompilingTectonic={isCompilingTectonic}
            tectonicError={tectonicError}
          />
        </section>
      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-xl text-xs font-medium bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border border-zinc-700 dark:border-zinc-300 animate-in slide-in-from-bottom-3 duration-200">
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Help Syntax Modal */}
      <HelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />

      {/* Confirmation Dialog for clearing editor */}
      <ConfirmDialog
        isOpen={confirmClearOpen}
        onClose={() => setConfirmClearOpen(false)}
        onConfirm={executeClear}
        title="¿Deseas vaciar el editor?"
        description="Se perderán todos los cambios que no hayas guardado o descargado. Esta acción no se puede deshacer."
        confirmText="Sí, vaciar editor"
        cancelText="Cancelar"
      />

      {/* Post-Compilation Success Modal: Download or Continue Editing */}
      <CompileSuccessModal
        isOpen={compileSuccessOpen}
        onClose={() => setCompileSuccessOpen(false)}
        filename={
          parseResult.metadata.title
            ? parseResult.metadata.title.toLowerCase().replace(/[^a-z0-9]/gi, '_').substring(0, 30)
            : 'documento'
        }
        paperType={paperType}
        globalFont={globalFont}
        fontSize={fontSize}
        onDownloadPdf={handleDownloadCompiledPdf}
        onOpenPdfNewTab={handleOpenPdfNewTab}
        onExportDocx={handleExportDocx}
      />
    </div>
  );
}

export default App;
