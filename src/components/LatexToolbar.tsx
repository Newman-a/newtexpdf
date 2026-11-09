import React from 'react';
import {
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Sigma,
  Table as TableIcon,
  Quote,
  FileCode,
  Superscript,
  Subscript,
  Divide,
  Radical,
  Type,
  X,
} from 'lucide-react';
import { Button } from './ui/button';

interface LatexToolbarProps {
  onInsert: (snippetBefore: string, snippetAfter?: string) => void;
  onClose?: () => void;
}

export const LatexToolbar: React.FC<LatexToolbarProps> = ({ onInsert, onClose }) => {
  const mathSymbols = [
    { label: 'α', snippet: '\\alpha ' },
    { label: 'β', snippet: '\\beta ' },
    { label: 'γ', snippet: '\\gamma ' },
    { label: 'θ', snippet: '\\theta ' },
    { label: 'λ', snippet: '\\lambda ' },
    { label: 'π', snippet: '\\pi ' },
    { label: 'σ', snippet: '\\sigma ' },
    { label: 'ω', snippet: '\\omega ' },
    { label: 'Δ', snippet: '\\Delta ' },
    { label: 'Ω', snippet: '\\Omega ' },
    { label: '∫', snippet: '\\int_{a}^{b} ', description: 'Integral' },
    { label: '∑', snippet: '\\sum_{i=1}^{n} ', description: 'Sumatoria' },
    { label: '∏', snippet: '\\prod_{i=1}^{n} ', description: 'Productoria' },
    { label: 'lim', snippet: '\\lim_{x \\to \\infty} ', description: 'Límite' },
    { label: '∞', snippet: '\\infty ' },
    { label: '±', snippet: '\\pm ' },
    { label: '≤', snippet: '\\le ' },
    { label: '≥', snippet: '\\ge ' },
    { label: '≠', snippet: '\\ne ' },
    { label: '≈', snippet: '\\approx ' },
    { label: '∈', snippet: '\\in ' },
    { label: 'ℝ', snippet: '\\mathbb{R}' },
    { label: 'ℂ', snippet: '\\mathbb{C}' },
    { label: '∂', snippet: '\\partial ' },
    { label: '∇', snippet: '\\nabla ' },
    { label: '→', snippet: '\\to ' },
    { label: '⇒', snippet: '\\implies ' },
  ];

  return (
    <div
      onMouseDown={(e) => {
        // Prevent stealing focus from the textarea to preserve scroll position and selection
        e.preventDefault();
      }}
      className="flex flex-col gap-1.5 p-2 bg-slate-100/90 dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-800 text-xs shrink-0 relative animate-in fade-in duration-150"
    >
      {/* Top formatting row: swipeable horizontally without wrapping into 6 lines */}
      <div className="flex items-center gap-1 overflow-x-auto pb-0.5 no-scrollbar whitespace-nowrap">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="h-6 w-6 rounded flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white mr-1 shrink-0"
            title="Ocultar barra de herramientas"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
        <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500 mr-1 tracking-wider shrink-0">
          Formato:
        </span>

        {/* Text styling */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white"
          onClick={() => onInsert('\\textbf{', '}')}
          title="Negrita (\textbf{})"
        >
          <Bold className="w-3.5 h-3.5 mr-1" /> Negrita
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white"
          onClick={() => onInsert('\\textit{', '}')}
          title="Cursiva (\textit{})"
        >
          <Italic className="w-3.5 h-3.5 mr-1" /> Cursiva
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white"
          onClick={() => onInsert('\\underline{', '}')}
          title="Subrayado (\underline{})"
        >
          <Underline className="w-3.5 h-3.5 mr-1" /> Subrayado
        </Button>

        <div className="h-4 w-px bg-slate-300 dark:bg-zinc-800 mx-1" />

        {/* Selected text typography */}
        <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500 mr-0.5 tracking-wider">
          Fuente:
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 font-serif text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white"
          onClick={() => onInsert('\\textrm{', '}')}
          title="Cambiar texto seleccionado a Serif / Times (\textrm{})"
        >
          <span className="font-semibold text-xs">Times/Serif</span>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 font-sans text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white"
          onClick={() => onInsert('\\textsf{', '}')}
          title="Cambiar texto seleccionado a Sans / Arial (\textsf{})"
        >
          <span className="font-semibold text-xs">Arial/Sans</span>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 font-mono text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white"
          onClick={() => onInsert('\\texttt{', '}')}
          title="Cambiar texto seleccionado a Monospace / Código (\texttt{})"
        >
          <span className="text-xs">Mono</span>
        </Button>

        <div className="h-4 w-px bg-slate-300 dark:bg-zinc-800 mx-1" />

        {/* Headings */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white"
          onClick={() => onInsert('\\section{', '}')}
          title="Sección (\section{})"
        >
          <Heading1 className="w-3.5 h-3.5 mr-1" /> Sec
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white"
          onClick={() => onInsert('\\subsection{', '}')}
          title="Subsección (\subsection{})"
        >
          <Heading2 className="w-3.5 h-3.5 mr-1" /> Subsec
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white"
          onClick={() => onInsert('\\subsubsection{', '}')}
          title="Sub-subsección"
        >
          <Heading3 className="w-3.5 h-3.5 mr-1" /> Sub3
        </Button>

        <div className="h-4 w-px bg-slate-300 dark:bg-zinc-800 mx-1" />

        {/* Lists */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white"
          onClick={() => onInsert('\\begin{itemize}\n  \\item ', '\n\\end{itemize}')}
          title="Lista con viñetas (\begin{itemize})"
        >
          <List className="w-3.5 h-3.5 mr-1" /> Lista
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white"
          onClick={() => onInsert('\\begin{enumerate}\n  \\item ', '\n\\end{enumerate}')}
          title="Lista numerada (\begin{enumerate})"
        >
          <ListOrdered className="w-3.5 h-3.5 mr-1" /> Numerada
        </Button>

        <div className="h-4 w-px bg-slate-300 dark:bg-zinc-800 mx-1" />

        {/* Math & Environments */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white"
          onClick={() => onInsert('$', '$')}
          title="Fórmula matemática en línea ($...$)"
        >
          <Sigma className="w-3.5 h-3.5 mr-1" /> $Inline$
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white"
          onClick={() => onInsert('$$\n', '\n$$')}
          title="Fórmula matemática en bloque ($$...$$)"
        >
          <Sigma className="w-3.5 h-3.5 mr-1" /> $$Bloque$$
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white"
          onClick={() => onInsert('\\frac{', '}{}')}
          title="Fracción (\frac{a}{b})"
        >
          <Divide className="w-3.5 h-3.5 mr-1" /> \frac
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white"
          onClick={() => onInsert('\\sqrt{', '}')}
          title="Raíz cuadrada (\sqrt{x})"
        >
          <Radical className="w-3.5 h-3.5 mr-1" /> \sqrt
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white"
          onClick={() => onInsert('^{', '}')}
          title="Superíndice / Exponente"
        >
          <Superscript className="w-3.5 h-3.5 mr-1" /> xⁿ
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white"
          onClick={() => onInsert('_{', '}')}
          title="Subíndice"
        >
          <Subscript className="w-3.5 h-3.5 mr-1" /> xₙ
        </Button>

        <div className="h-4 w-px bg-slate-300 dark:bg-zinc-800 mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white"
          onClick={() => onInsert('\\begin{center}\n\\resizebox{\\linewidth}{!}{\n\\begin{tabular}{|c|c|}\n\\hline\nCol 1 & Col 2 \\\\\n\\hline\nA & B \\\\\n\\hline\n\\end{tabular}\n}\n\\end{center}')}
          title="Tabla ajustada (\resizebox + tabular)"
        >
          <TableIcon className="w-3.5 h-3.5 mr-1" /> Tabla
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white"
          onClick={() => onInsert('\\begin{quote}\n', '\n\\end{quote}')}
          title="Cita (\begin{quote})"
        >
          <Quote className="w-3.5 h-3.5 mr-1" /> Cita
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white"
          onClick={() => onInsert('\\newpage\n')}
          title="Salto de página (\newpage)"
        >
          <FileCode className="w-3.5 h-3.5 mr-1" /> Salto Pág
        </Button>
      </div>

      {/* Quick Math Symbols Row */}
      <div className="flex items-center gap-1 overflow-x-auto pb-0.5 no-scrollbar">
        <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500 mr-1 tracking-wider whitespace-nowrap">
          KaTeX:
        </span>
        {mathSymbols.map((s, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onInsert(s.snippet)}
            title={s.description || s.snippet}
            className="h-6 px-1.5 min-w-[24px] rounded bg-white dark:bg-zinc-900 hover:bg-emerald-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-800 flex items-center justify-center font-serif text-sm transition-colors cursor-pointer"
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
};
