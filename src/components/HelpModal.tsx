import React from 'react';
import { X, CheckCircle2, Code2, Github, Instagram } from 'lucide-react';
import { Button } from './ui/button';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const examples = [
    {
      title: 'Estructura básica de documento',
      code: `\\documentclass[11pt,a4paper]{article}
\\title{Título de la Publicación}
\\author{Tu Nombre}
\\date{\\today}

\\begin{document}
\\maketitle

\\begin{abstract}
Resumen conciso del documento...
\\end{abstract}

\\section{Introducción}
Texto introductorio...
\\end{document}`,
    },
    {
      title: 'Fórmulas Matemáticas con KaTeX',
      code: `% En línea:
La energía es $E = mc^2$.

% En bloque centrado:
$$\\int_{a}^{b} f(x) \\, dx = F(b) - F(a)$$

% Entorno equation numerado:
\\begin{equation}
\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1
\\end{equation}`,
    },
    {
      title: 'Matrices y Sistemas de Ecuaciones',
      code: `$$A = \\begin{pmatrix}
  a_{11} & a_{12} \\\\
  a_{21} & a_{22}
\\end{pmatrix}$$`,
    },
    {
      title: 'Formatos de Texto y Listas',
      code: `\\textbf{Negrita}, \\textit{Cursiva}, \\underline{Subrayado}, \\texttt{Código}

\\begin{itemize}
  \\item Elemento con viñeta
  \\item Otro elemento
\\end{itemize}

\\begin{enumerate}
  \\item Primer paso
  \\item Segundo paso
\\end{enumerate}`,
    },
    {
      title: 'Tablas y Cuadros',
      code: `\\begin{center}
\\begin{tabular}{|l|c|r|}
\\hline
Columna 1 & Columna 2 & Columna 3 \\\\
\\hline
Dato A & Dato B & Dato C \\\\
\\hline
\\end{tabular}
\\end{center}`,
    },
    {
      title: 'Salto de Página forzado en el PDF',
      code: `\\newpage  % Forzará un salto de página limpio en Tectonic`,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100">
              Guía Rápida de Sintaxis TeX / LaTeX y KaTeX
            </h2>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900 dark:hover:text-zinc-100"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs text-slate-700 dark:text-zinc-300">
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 rounded-lg p-3 text-emerald-800 dark:text-emerald-300 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <strong>Compilación en tiempo real:</strong> Este entorno traduce
              documentos LaTeX estándar a HTML interactivo y procesa todas las fórmulas
              matemáticas a través de <code>KaTeX</code>. Para exportar,{' '}
              <code>Tectonic (XeTeX)</code> genera un PDF nativo vectorial de alta fidelidad
              listo para imprimir o compartir.
            </div>
          </div>

          {examples.map((item, idx) => (
            <div
              key={idx}
              className="border border-slate-200 dark:border-zinc-800 rounded-lg p-3 bg-slate-50 dark:bg-zinc-950"
            >
              <h3 className="font-semibold text-slate-900 dark:text-zinc-100 mb-2">
                {item.title}
              </h3>
              <pre className="p-2.5 bg-black/80 text-zinc-100 rounded font-mono text-[11px] overflow-x-auto border border-zinc-800">
                <code>{item.code}</code>
              </pre>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-zinc-400">
            <span>Desarrollado por <strong>Ing. Newman Acosta</strong></span>
            <div className="flex items-center gap-1.5 ml-1">
              <a
                href="https://github.com/Newman-a"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white"
                title="GitHub"
              >
                <Github className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://www.instagram.com/newman_ga/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-600 dark:text-zinc-300 hover:text-pink-500"
                title="Instagram"
              >
                <Instagram className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <Button type="button" variant="default" size="sm" onClick={onClose} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8">
            Entendido
          </Button>
        </div>
      </div>
    </div>
  );
};

