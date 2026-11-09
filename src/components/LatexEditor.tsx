import React, { useRef, useState, useEffect } from 'react';
import { LatexToolbar } from './LatexToolbar';
import {
  Upload,
  Download,
  Copy,
  Check,
  Trash2,
  Sparkles,
  Scaling,
  Undo2,
  Redo2,
  Bold,
  Italic,
  Underline,
  Type,
  Code,
  Sigma,
  Heading1,
  Scissors,
  ClipboardPaste,
  FileCode2,
  SlidersHorizontal,
} from 'lucide-react';
import { Button } from './ui/button';

interface LatexEditorProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  onCompile?: () => void;
  onNotify?: (type: 'success' | 'error', text: string) => void;
}

/**
 * Generates highlighted HTML tokens from raw LaTeX code
 */
function highlightLatex(code: string): string {
  if (!code) return '';

  const escape = (str: string) =>
    str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  return code
    .split('\n')
    .map(line => {
      // Comments %
      const commentIdx = line.indexOf('%');
      let textPart = line;
      let commentPart = '';
      if (commentIdx !== -1 && (commentIdx === 0 || line[commentIdx - 1] !== '\\')) {
        textPart = line.substring(0, commentIdx);
        commentPart = line.substring(commentIdx);
      }

      let highlighted = escape(textPart);

      // LaTeX commands: \command
      highlighted = highlighted.replace(
        /(\\[a-zA-Z*]+)/g,
        '<span class="text-blue-600 dark:text-blue-400 font-semibold">$1</span>'
      );

      // Math delimiters $ ... $
      highlighted = highlighted.replace(
        /(\$[^\$\n]*?\$)/g,
        '<span class="text-emerald-600 dark:text-emerald-400 font-mono">$1</span>'
      );

      // Curly braces and brackets { } [ ]
      highlighted = highlighted.replace(
        /([{}])/g,
        '<span class="text-amber-600 dark:text-amber-400 font-bold">$1</span>'
      );
      highlighted = highlighted.replace(
        /([[\]])/g,
        '<span class="text-purple-600 dark:text-purple-400 font-medium">$1</span>'
      );

      // Append comment in gray italic
      if (commentPart) {
        highlighted += `<span class="text-slate-400 dark:text-zinc-500 italic">${escape(commentPart)}</span>`;
      }

      return highlighted || '&nbsp;';
    })
    .join('\n');
}

export const LatexEditor: React.FC<LatexEditorProps> = ({
  value,
  onChange,
  onClear,
  onCompile,
  onNotify,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState(false);
  const [syntaxHighlightEnabled, setSyntaxHighlightEnabled] = useState(true);
  const [showToolbar, setShowToolbar] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768;
    }
    return true;
  });
  const [isDragging, setIsDragging] = useState(false);

  // Undo / Redo History Stack
  const historyRef = useRef<string[]>([value]);
  const historyIndexRef = useRef<number>(0);
  const isUndoRedoRef = useRef<boolean>(false);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Custom Context Menu State
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    start: number;
    end: number;
    selectedText: string;
  } | null>(null);

  // Stats
  const lineCount = value.split('\n').length;
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const charCount = value.length;

  // Push new state to history stack
  const pushHistory = (newVal: string) => {
    if (isUndoRedoRef.current) return;
    const history = historyRef.current;
    const currentIndex = historyIndexRef.current;

    if (history[currentIndex] === newVal) return;

    const updated = history.slice(0, currentIndex + 1);
    updated.push(newVal);

    if (updated.length > 60) {
      updated.shift();
    }

    historyRef.current = updated;
    historyIndexRef.current = updated.length - 1;
  };

  const handleUndo = () => {
    if (historyIndexRef.current > 0) {
      isUndoRedoRef.current = true;
      historyIndexRef.current -= 1;
      const prevVal = historyRef.current[historyIndexRef.current];
      onChange(prevVal);
      setTimeout(() => {
        isUndoRedoRef.current = false;
        handleScroll();
      }, 0);
    }
  };

  const handleRedo = () => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      isUndoRedoRef.current = true;
      historyIndexRef.current += 1;
      const nextVal = historyRef.current[historyIndexRef.current];
      onChange(nextVal);
      setTimeout(() => {
        isUndoRedoRef.current = false;
        handleScroll();
      }, 0);
    }
  };

  // Sync scroll between textarea, line numbers, and highlighted backdrop
  const handleScroll = () => {
    if (textareaRef.current) {
      const top = textareaRef.current.scrollTop;
      const left = textareaRef.current.scrollLeft;
      if (highlightRef.current) {
        highlightRef.current.scrollTop = top;
        highlightRef.current.scrollLeft = left;
      }
      if (lineNumbersRef.current) {
        lineNumbersRef.current.scrollTop = top;
      }
    }
  };

  // Close context menu on outside click or escape
  useEffect(() => {
    const handleGlobalClick = () => setContextMenu(null);
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setContextMenu(null);
    };

    window.addEventListener('click', handleGlobalClick);
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('click', handleGlobalClick);
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, []);

  const handleInsert = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Save exact scroll offsets before modifying content
    const savedScrollTop = textarea.scrollTop;
    const savedScrollLeft = textarea.scrollLeft;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    const replacement = `${before}${selectedText}${after}`;

    if (typeof textarea.setRangeText === 'function') {
      textarea.focus({ preventScroll: true });
      textarea.setRangeText(replacement, start, end, 'end');
      
      const newCursorStart = start + before.length;
      const newCursorEnd = newCursorStart + selectedText.length;
      textarea.setSelectionRange(newCursorStart, newCursorEnd);

      const newValue = textarea.value;
      pushHistory(newValue);
      onChange(newValue);

      // Restore scroll position immediately
      textarea.scrollTop = savedScrollTop;
      textarea.scrollLeft = savedScrollLeft;
      handleScroll();

      // Guard against asynchronous DOM layout shifts
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.scrollTop = savedScrollTop;
          textareaRef.current.scrollLeft = savedScrollLeft;
          handleScroll();
        }
      });
    } else {
      const newValue = value.substring(0, start) + replacement + value.substring(end);
      pushHistory(newValue);
      onChange(newValue);

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus({ preventScroll: true });
          const cursorPosition = start + before.length + selectedText.length;
          textareaRef.current.setSelectionRange(cursorPosition, cursorPosition);
          textareaRef.current.scrollTop = savedScrollTop;
          textareaRef.current.scrollLeft = savedScrollLeft;
          handleScroll();
        }
      }, 0);
    }
  };

  const handleContextMenu = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    // Compute coordinate within window
    const menuWidth = 220;
    const menuHeight = 340;
    let x = e.clientX;
    let y = e.clientY;

    if (x + menuWidth > window.innerWidth) {
      x = window.innerWidth - menuWidth - 10;
    }
    if (y + menuHeight > window.innerHeight) {
      y = window.innerHeight - menuHeight - 10;
    }

    setContextMenu({ x, y, start, end, selectedText });
  };

  const applyContextOption = (before: string, after: string = '') => {
    if (!contextMenu) return;
    const textarea = textareaRef.current;
    if (!textarea) return;

    const savedScrollTop = textarea.scrollTop;
    const savedScrollLeft = textarea.scrollLeft;
    const { start, end, selectedText } = contextMenu;
    const fallbackText = selectedText || 'texto';
    const replacement = `${before}${fallbackText}${after}`;

    if (typeof textarea.setRangeText === 'function') {
      textarea.focus({ preventScroll: true });
      textarea.setRangeText(replacement, start, end, 'end');
      
      const newCursorStart = start + before.length;
      const newCursorEnd = newCursorStart + fallbackText.length;
      textarea.setSelectionRange(newCursorStart, newCursorEnd);

      const newValue = textarea.value;
      pushHistory(newValue);
      onChange(newValue);
      setContextMenu(null);

      textarea.scrollTop = savedScrollTop;
      textarea.scrollLeft = savedScrollLeft;
      handleScroll();

      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.scrollTop = savedScrollTop;
          textareaRef.current.scrollLeft = savedScrollLeft;
          handleScroll();
        }
      });
    } else {
      const newValue = value.substring(0, start) + replacement + value.substring(end);
      pushHistory(newValue);
      onChange(newValue);
      setContextMenu(null);

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus({ preventScroll: true });
          textareaRef.current.setSelectionRange(
            start + before.length,
            start + before.length + fallbackText.length
          );
          textareaRef.current.scrollTop = savedScrollTop;
          textareaRef.current.scrollLeft = savedScrollLeft;
          handleScroll();
        }
      }, 0);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onNotify?.('success', 'Código copiado al portapapeles.');
    } catch (err) {
      console.error('Failed to copy text', err);
      onNotify?.('error', 'No se pudo copiar al portapapeles.');
    }
  };

  const handlePaste = async () => {
    try {
      if (!navigator.clipboard || !navigator.clipboard.readText) {
        onNotify?.('error', 'El navegador bloqueó el acceso directo. Usa Ctrl + V.');
        return;
      }
      const text = await navigator.clipboard.readText();
      if (!text || !text.trim()) {
        onNotify?.('error', 'El portapapeles está vacío.');
        return;
      }
      const textarea = textareaRef.current;
      if (textarea && typeof textarea.setRangeText === 'function') {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        textarea.focus({ preventScroll: true });
        textarea.setRangeText(text, start, end, 'end');
        const newVal = textarea.value;
        pushHistory(newVal);
        onChange(newVal);
      } else {
        const newVal = value ? `${value}\n${text}` : text;
        pushHistory(newVal);
        onChange(newVal);
      }
      onNotify?.('success', 'Texto pegado desde el portapapeles.');
    } catch (err) {
      onNotify?.('error', 'Permiso denegado por el navegador. Usa Ctrl + V dentro del editor.');
    }
  };

  const handleAutoFitTables = () => {
    let code = value;
    if (!code.includes('usepackage{graphicx}')) {
      code = code.replace(/\\documentclass(\[[^\]]*\])?\{[^}]*\}/, '$&\n\\usepackage{graphicx}');
    }

    // Pattern to wrap un-wrapped center tables
    const pattern = /\\begin\{center\}\s*(\\begin\{tabular\}[\s\S]*?\\end\{tabular\})\s*\\end\{center\}/g;
    let count = 0;
    code = code.replace(pattern, (_, tabularBlock) => {
      count++;
      return '\\begin{center}\n\\resizebox{\\linewidth}{!}{\n' + tabularBlock + '\n}\n\\end{center}';
    });

    if (count > 0 || code !== value) {
      pushHistory(code);
      onChange(code);
    }
  };

  const handleDownloadTex = () => {
    const blob = new Blob([value], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'documento.tex';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        pushHistory(content);
        onChange(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.name.endsWith('.tex') || file.name.endsWith('.txt'))) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          pushHistory(content);
          onChange(content);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl + Z -> Deshacer
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      if (e.shiftKey) {
        handleRedo();
      } else {
        handleUndo();
      }
      return;
    }

    // Ctrl + Y -> Rehacer
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
      e.preventDefault();
      handleRedo();
      return;
    }

    // Ctrl + Enter to compile
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      onCompile?.();
      return;
    }

    // Ctrl + S to download .tex
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      handleDownloadTex();
      return;
    }

    // Tab indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      pushHistory(newValue);
      onChange(newValue);

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
        handleScroll();
      }, 0);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newVal = e.target.value;
    onChange(newVal);

    // Debounce pushing to history for continuous typing
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }
    typingTimerRef.current = setTimeout(() => {
      pushHistory(newVal);
    }, 450);
  };

  return (
    <div
      className={`flex flex-col h-full bg-white dark:bg-zinc-950 border-r border-slate-200 dark:border-zinc-800 relative ${
        isDragging ? 'ring-2 ring-emerald-500 bg-emerald-50/10' : ''
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      {/* Editor Sub-header with actions */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-900/80 shrink-0 flex-wrap gap-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
            Editor LaTeX
          </span>
          <span className="text-[11px] text-slate-400 bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded font-mono">
            {lineCount} líneas
          </span>

          {/* Undo / Redo Buttons */}
          <div className="flex items-center gap-0.5 ml-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-slate-500 hover:text-slate-900 dark:hover:text-zinc-100"
              onClick={handleUndo}
              title="Deshacer (Ctrl + Z)"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-slate-500 hover:text-slate-900 dark:hover:text-zinc-100"
              onClick={handleRedo}
              title="Rehacer (Ctrl + Y)"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </Button>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 px-1.5 text-[10px] text-slate-500 hover:text-slate-900 dark:hover:text-zinc-100"
            onClick={() => setSyntaxHighlightEnabled(!syntaxHighlightEnabled)}
            title="Alternar resaltado de sintaxis"
          >
            <Sparkles className={`w-3 h-3 mr-1 ${syntaxHighlightEnabled ? 'text-amber-500' : 'text-slate-400'}`} />
            <span className="hidden xs:inline">{syntaxHighlightEnabled ? 'Sintaxis: On' : 'Sintaxis: Off'}</span>
          </Button>

          {/* Toggle Toolbar Button (Allows hiding formatting bar, especially useful on mobile) */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={`h-6 px-1.5 text-[10px] flex items-center gap-1 transition-colors ${
              showToolbar
                ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400 font-semibold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-zinc-100'
            }`}
            onClick={() => setShowToolbar(!showToolbar)}
            title={showToolbar ? 'Ocultar barra de formato' : 'Mostrar barra de formato LaTeX y símbolos'}
          >
            <SlidersHorizontal className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">{showToolbar ? 'Ocultar Barra' : 'Barra Formato'}</span>
            <span className="sm:hidden">{showToolbar ? 'Ocultar' : 'Formato'}</span>
          </Button>
        </div>

        <div className="flex items-center gap-1">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".tex,.latex,.txt"
            className="hidden"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white"
            onClick={() => fileInputRef.current?.click()}
            title="Abrir o arrastrar archivo .tex"
          >
            <Upload className="w-3.5 h-3.5 mr-1" /> Importar .tex
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
            onClick={handleAutoFitTables}
            title="Ajusta automáticamente todas las tablas para que no se corten en el margen derecho del PDF"
          >
            <Scaling className="w-3.5 h-3.5 mr-1" /> Auto-ajustar Tablas
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white"
            onClick={handleDownloadTex}
            title="Descargar archivo .tex (Ctrl+S)"
          >
            <Download className="w-3.5 h-3.5 mr-1" /> Guardar .tex
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white"
            onClick={handlePaste}
            title="Pegar del portapapeles (Ctrl+V)"
          >
            <ClipboardPaste className="w-3.5 h-3.5 mr-1 text-emerald-600 dark:text-emerald-400" /> Pegar
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white"
            onClick={handleCopy}
            title="Copiar código al portapapeles"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 mr-1 text-emerald-500" /> Copiado
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 mr-1" /> Copiar
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-slate-400 hover:text-red-500"
            onClick={onClear}
            title="Limpiar editor"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Formatting & KaTeX Toolbar */}
      {showToolbar && (
        <LatexToolbar
          onInsert={handleInsert}
          onClose={() => setShowToolbar(false)}
        />
      )}

      {/* Textarea Code Editor with Syntax Backdrop */}
      <div className="flex-1 relative overflow-hidden flex">
        {/* Line Numbers Simulation */}
        <div
          ref={lineNumbersRef}
          className="w-10 py-3 bg-slate-50 dark:bg-zinc-950 border-r border-slate-200 dark:border-zinc-800 text-[11px] font-mono text-slate-400 select-none text-right pr-2 overflow-hidden hidden sm:block"
        >
          {Array.from({ length: Math.min(lineCount, 800) }, (_, i) => (
            <div key={i} className="leading-6">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Code Editor Container */}
        <div className="relative flex-1 h-full overflow-hidden">
          {/* Syntax Highlight Backdrop Layer */}
          {syntaxHighlightEnabled && (
            <pre
              ref={highlightRef}
              aria-hidden="true"
              className="absolute inset-0 p-3 m-0 font-mono text-xs md:text-sm leading-6 pointer-events-none select-none overflow-hidden whitespace-pre-wrap break-words bg-transparent text-slate-900 dark:text-zinc-100"
              dangerouslySetInnerHTML={{ __html: highlightLatex(value) }}
            />
          )}

          {/* Interactive Text Area Layer */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleTextareaChange}
            onScroll={handleScroll}
            onKeyDown={handleKeyDown}
            onContextMenu={handleContextMenu}
            placeholder={!value.trim() ? '' : 'Escribe o arrastra aquí tu documento LaTeX...'}
            spellCheck={false}
            className={`absolute inset-0 w-full h-full p-3 font-mono text-xs md:text-sm leading-6 resize-none focus:outline-none overflow-auto bg-transparent whitespace-pre-wrap break-words ${
              syntaxHighlightEnabled
                ? 'text-transparent caret-slate-900 dark:caret-zinc-100 selection:bg-emerald-500/30'
                : 'text-slate-900 dark:text-zinc-100'
            }`}
          />

          {/* Empty State Overlay */}
          {!value.trim() && (
            <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none z-10">
              <div className="max-w-sm w-full bg-slate-50/95 dark:bg-zinc-900/95 border border-dashed border-slate-300 dark:border-zinc-700 rounded-2xl p-6 text-center shadow-lg backdrop-blur-sm pointer-events-auto">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-inner">
                  <FileCode2 className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-semibold text-slate-800 dark:text-zinc-200 mb-1">
                  Editor en Blanco
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mb-4 leading-relaxed">
                  Pega el código LaTeX que copiaste o generaste con la IA, o importa un archivo <span className="font-mono text-emerald-600 dark:text-emerald-400 font-medium">.tex</span>.
                </p>
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <Button
                    type="button"
                    size="sm"
                    onClick={handlePaste}
                    className="h-8 px-3.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm flex items-center gap-1.5 rounded-lg"
                  >
                    <ClipboardPaste className="w-3.5 h-3.5" />
                    <span>Pegar Portapapeles</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-8 px-3 text-xs border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center gap-1.5 rounded-lg"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Importar .tex</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom Context Menu (Clic Derecho) */}
      {contextMenu && (
        <div
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
          className="fixed z-50 w-52 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-2xl p-1.5 text-xs animate-in fade-in duration-150 select-none"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-2 py-1 text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider border-b border-slate-100 dark:border-zinc-800 mb-1">
            {contextMenu.selectedText ? 'Texto seleccionado' : 'Opciones rápidas'}
          </div>

          {/* Formato */}
          <button
            type="button"
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-left transition-colors"
            onClick={() => applyContextOption('\\textbf{', '}')}
          >
            <Bold className="w-3.5 h-3.5 text-slate-500" />
            <span>Negrita (\\textbf)</span>
          </button>
          <button
            type="button"
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-left transition-colors"
            onClick={() => applyContextOption('\\textit{', '}')}
          >
            <Italic className="w-3.5 h-3.5 text-slate-500" />
            <span>Cursiva (\\textit)</span>
          </button>
          <button
            type="button"
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-left transition-colors"
            onClick={() => applyContextOption('\\underline{', '}')}
          >
            <Underline className="w-3.5 h-3.5 text-slate-500" />
            <span>Subrayado (\\underline)</span>
          </button>

          <div className="my-1 border-t border-slate-100 dark:border-zinc-800" />

          {/* Tipografía */}
          <button
            type="button"
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-left transition-colors font-serif"
            onClick={() => applyContextOption('\\textrm{', '}')}
          >
            <Type className="w-3.5 h-3.5 text-slate-500" />
            <span>Times / Serif (\\textrm)</span>
          </button>
          <button
            type="button"
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-left transition-colors font-sans"
            onClick={() => applyContextOption('\\textsf{', '}')}
          >
            <Type className="w-3.5 h-3.5 text-slate-500" />
            <span>Arial / Sans (\\textsf)</span>
          </button>
          <button
            type="button"
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-left transition-colors font-mono"
            onClick={() => applyContextOption('\\texttt{', '}')}
          >
            <Code className="w-3.5 h-3.5 text-slate-500" />
            <span>Monospace (\\texttt)</span>
          </button>

          <div className="my-1 border-t border-slate-100 dark:border-zinc-800" />

          {/* Tamaño */}
          <button
            type="button"
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-left transition-colors"
            onClick={() => applyContextOption('{\\large ', '}')}
          >
            <span className="text-sm font-semibold">A+</span>
            <span>Texto Grande (\\large)</span>
          </button>
          <button
            type="button"
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-left transition-colors"
            onClick={() => applyContextOption('{\\small ', '}')}
          >
            <span className="text-[10px] font-semibold">A-</span>
            <span>Texto Pequeño (\\small)</span>
          </button>

          <div className="my-1 border-t border-slate-100 dark:border-zinc-800" />

          {/* Ecuación y Sección */}
          <button
            type="button"
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-left transition-colors"
            onClick={() => applyContextOption('$', '$')}
          >
            <Sigma className="w-3.5 h-3.5 text-emerald-500" />
            <span>Ecuación en línea ($...$)</span>
          </button>
          <button
            type="button"
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-left transition-colors"
            onClick={() => applyContextOption('\\section{', '}')}
          >
            <Heading1 className="w-3.5 h-3.5 text-blue-500" />
            <span>Crear Sección (\\section)</span>
          </button>
        </div>
      )}

      {/* Footer stats bar */}
      <div className="px-3 py-1.5 bg-slate-50 dark:bg-zinc-950 border-t border-slate-200 dark:border-zinc-800 text-[11px] text-slate-500 dark:text-zinc-400 flex items-center justify-between font-mono">
        <div className="flex items-center gap-2">
          <span>UTF-8 • LaTeX 2ε</span>
          <span className="hidden sm:inline text-slate-400">• Ctrl+Z Deshacer • Clic derecho para menú</span>
        </div>
        <div className="flex items-center gap-3">
          <span>{charCount} car</span>
          <span>{wordCount} pal</span>
        </div>
      </div>
    </div>
  );
};
