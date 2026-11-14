import React, { useState } from 'react';
import {
  Copy,
  Check,
  ArrowRight,
  Sun,
  Moon,
  CheckCircle2,
  Github,
  Instagram,
  GraduationCap,
} from 'lucide-react';
import { Button } from './ui/button';

interface LandingPageProps {
  onGoToEditor: () => void;
  onOpenCoverModal?: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const UNIVERSITY_LATEX_PROMPT = `Actúa como un docente universitario experto en LaTeX y en redacción académica.
Necesito que resuelvas y estructures la siguiente actividad universitaria en código LaTeX completo, impecable y listo para compilar.

Sigue estrictamente estos lineamientos y criterios técnicos obligatorios:

1. ESTRUCTURA, TIPOGRAFÍA Y TAMAÑO UNIFORME DE 12 PT:
- Clase de documento: \\documentclass[12pt, letterpaper]{article}
- Márgenes: \\usepackage[margin=2.5cm]{geometry} (esto deja un ancho útil de texto exacto de 16.59 cm).
- Idioma y paquetes base: \\usepackage[utf8]{inputenc}, \\usepackage[spanish, es-tabla]{babel}, \\usepackage{mathptmx} (Times New Roman), \\usepackage{setspace}\\onehalfspacing.
- TAMAÑO DE LETRA 12 PT UNIFORME: Todo el texto del documento y TODOS los títulos (\\section, \\subsection, \\subsubsection y \\paragraph) deben tener exactamente tamaño de 12 puntos (\\normalsize) en negrita. Incluye obligatoriamente este bloque en el preámbulo para evitar títulos gigantes:
  \\makeatletter
  \\renewcommand\\section{\\@startsection{section}{1}{\\z@}{-3.5ex \\@plus -1ex \\@minus -.2ex}{2.3ex \\@plus.2ex}{\\normalfont\\normalsize\\bfseries}}
  \\renewcommand\\subsection{\\@startsection{subsection}{2}{\\z@}{-3.25ex\\@plus -1ex \\@minus -.2ex}{1.5ex \\@plus .2ex}{\\normalfont\\normalsize\\bfseries}}
  \\renewcommand\\subsubsection{\\@startsection{subsubsection}{3}{\\z@}{-3.25ex\\@plus -1ex \\@minus -.2ex}{1.5ex \\@plus .2ex}{\\normalfont\\normalsize\\bfseries}}
  \\renewcommand\\paragraph{\\@startsection{paragraph}{4}{\\z@}{3.25ex \\@plus1ex \\@minus.2ex}{-1em}{\\normalfont\\normalsize\\bfseries}}
  \\makeatother

2. SIN PORTADA Y SIN MEMBRETE (INICIO DIRECTO):
- NO incluyas portada (\\begin{titlepage}) NI TAMPOCO incluyas membrete o encabezado institucional (no pongas nombre de universidad, vicerrectorado, asignatura ni datos del estudiante al inicio).
- Inicia el documento después de \\begin{document} directamente con la primera sección de contenido (por ejemplo: \\section*{Introducción} o el primer punto de la actividad), ya que la portada se unirá aparte en PDF.

3. REGLA DE ORO PARA CUADROS, TABLAS, ESQUEMAS Y MAPAS CONCEPTUALES (PROHIBIDO CORTARSE A LA DERECHA O ABAJO):
- PROHIBIDO usar \\resizebox o \\begin{tabular} en cuadros medianos o largos, porque no permiten saltos de página y cortan la tabla por abajo pisando la numeración.
- Usa SIEMPRE el paquete \\usepackage{longtable} y \\usepackage{array} para TODOS los cuadros, matrices, cuadros resumen y diagramas esquemáticos, permitiendo que se dividan limpiamente entre páginas con \\endfirsthead y \\endhead.
- Define en el preámbulo este tipo de columna con letra reducida (\\footnotesize), interlineado simple y alineación izquierda para que el texto se adapte perfecto sin dejar huecos en blanco:
  \\renewcommand{\\arraystretch}{1.15}
  \\setlength{\\tabcolsep}{3.5pt}
  \\setlength{\\LTleft}{0pt}
  \\setlength{\\LTright}{0pt}
  \\newcolumntype{P}[1]{>{\\raggedright\\arraybackslash\\singlespacing\\footnotesize}p{#1}}
- CONTROL MATEMÁTICO DEL ANCHO DERECHO: La suma de los anchos de todas las columnas P{...} de cualquier tabla NUNCA debe superar los 15.0 cm en total (por ejemplo: 4 columnas de |P{2.5cm}|P{3.3cm}|P{4.6cm}|P{4.6cm}| = 15.0 cm; o 5 columnas de |P{2.2cm}|P{3.1cm}|P{3.4cm}|P{3.1cm}|P{3.1cm}| = 14.9 cm).
- PROHIBIDO usar \\multicolumn{N}{|c|}{Texto largo} suelto en títulos de tablas, porque desborda la tabla hacia la derecha. Envuelve SIEMPRE el texto de cualquier \\multicolumn dentro de un \\parbox de máximo 14.8 cm:
  \\multicolumn{4}{|c|}{\\parbox{14.8cm}{\\centering\\vspace{3pt}\\textbf{TÍTULO DEL CUADRO}\\vspace{3pt}}} \\\\ \\hline

4. DESARROLLO DEL CONTENIDO Y DIAGRAMAS:
- Desarrolla toda la teoría y el análisis con profundidad universitaria, paráfrasis rigurosa y citas en formato APA (Autor, año).
- Si piden un "Diagrama Esquemático", "Cuadro Resumen" o "Mapa de Conceptos", constrúyelo usando la estructura de \\begin{longtable} con columnas P{...}, flechas lógicas ($\\downarrow$, $\\rightarrow$) y conectores en cursiva para que tenga apariencia de esquema/mapa jerárquico pero con ajuste automático de página garantizado.
- Si además del cuadro o esquema piden desarrollar, caracterizar o ejemplificar los puntos, redacta subsecciones amplias y detalladas debajo de cada cuadro explicando cada punto de forma exhaustiva.
- Si la actividad involucra ejercicios matemáticos o de cálculo, usa \\usepackage{amsmath, amssymb, amsfonts} y resuelve paso a paso. Si es teórica, omite fórmulas innecesarias.

5. DECLARACIÓN DE USO ÉTICO DE IA (SI LA ACTIVIDAD O INSTRUCTIVO LO EXIGE):
- Si las instrucciones de la universidad solicitan declarar el uso de IA, incluye antes de la bibliografía una sección titulada \\section*{Declaración sobre el Uso Ético de Herramientas Tecnológicas e Inteligencia Artificial} con la referencia en formato APA y un párrafo explicando que se utilizó como asistente de maquetación tipográfica y estructuración, siendo revisada y contrastada con la bibliografía académica.

6. BIBLIOGRAFÍA Y REFERENCIAS (FORMATO APA 7ma EDICIÓN LIMPIO):
- No uses comandos bibliográficos complejos (\\apaitem o BibTeX).
- Coloca \\raggedright al inicio de la sección \\section*{Referencias Bibliográficas} y redacta cada fuente usando sangría francesa con:
  \\hangindent=0.5in \\hangafter=1
- Prohíbe el uso de signos de dólar ($) o enlaces rotos; escribe las URLs limpias únicamente dentro de \\url{...}.

A continuación, aquí tienes las instrucciones y contenidos de la actividad para resolver:
[PEGA AQUÍ EL ENUNCIADO O INSTRUCTIVO DE TU ACTIVIDAD]`;

export const LandingPage: React.FC<LandingPageProps> = ({
  onGoToEditor,
  onOpenCoverModal,
  darkMode,
  onToggleDarkMode,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(UNIVERSITY_LATEX_PROMPT);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Error al copiar el prompt', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 flex flex-col font-sans transition-colors">
      {/* Top Navbar */}
      <header className="border-b border-slate-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-600 text-white font-serif font-bold shadow-md shadow-emerald-600/20">
              <span className="text-base tracking-tighter">T<sub className="text-[10px]">E</sub>X</span>
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
                NewTexPDF
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5">
            <a
              href="https://github.com/Newman-a/newtexpdf"
              target="_blank"
              rel="noopener noreferrer"
              className="h-9 px-3 text-xs text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-800 rounded-lg flex items-center gap-1.5 transition-colors hover:bg-slate-100 dark:hover:bg-zinc-800/80 shadow-xs"
              title="Ver repositorio y documentación en GitHub"
            >
              <Github className="w-4 h-4 text-slate-800 dark:text-zinc-100" />
              <span className="font-medium">Doc</span>
            </a>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onToggleDarkMode}
              className="h-9 w-9 p-0 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white rounded-lg"
              title={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-14 px-4 sm:px-6 max-w-5xl mx-auto text-center">
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-5 leading-tight">
          El entorno <span className="text-emerald-600 dark:text-emerald-400">LaTeX profesional</span> para tus actividades universitarias
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-zinc-400 max-w-3xl mx-auto mb-8 leading-relaxed">
          Diseña, edita y compila documentos científicos directamente en tu navegador sin instalaciones.
          Previsualización instantánea en vivo con KaTeX, soporte de hojas <strong className="text-slate-800 dark:text-zinc-200">A4, Carta y Oficio</strong>, y motor Tectonic para generar PDFs vectoriales con acabado de imprenta.
        </p>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Button
            type="button"
            onClick={onGoToEditor}
            className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-6 h-11 shadow-lg shadow-emerald-600/25 rounded-xl transition-all cursor-pointer"
          >
            <span>Abrir Editor LaTeX</span>
            <ArrowRight className="w-4 h-4" />
          </Button>

          {onOpenCoverModal && (
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={onOpenCoverModal}
              className="text-xs sm:text-sm px-5 h-11 border-emerald-300 dark:border-emerald-700/60 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 flex items-center gap-2 rounded-xl font-medium"
            >
              <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Generar Portada PDF</span>
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={handleCopyPrompt}
            className="text-xs sm:text-sm px-5 h-11 border-slate-300 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-900 flex items-center gap-2 rounded-xl"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Prompt Copiado' : 'Copiar Prompt para IA'}</span>
          </Button>
        </div>
      </section>

      {/* Main Feature: Prompt Maestro Card */}
      <section className="px-4 sm:px-6 max-w-4xl mx-auto w-full pb-16">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-zinc-800">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-1">
                Prompt Maestro para Actividades Universitarias
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
                Pega este prompt en <strong>ChatGPT, Claude, DeepSeek o Gemini</strong>. Se adapta automáticamente tanto a ejercicios matemáticos como a tareas teóricas o ensayos, garantizando código limpio que compila sin errores.
              </p>
            </div>

            <Button
              type="button"
              onClick={handleCopyPrompt}
              className={`shrink-0 text-xs font-semibold px-4 py-2 h-9 transition-all rounded-lg flex items-center gap-1.5 ${
                copied
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-zinc-800 dark:hover:bg-zinc-700'
              }`}
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Copiado con éxito</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar Prompt Maestro</span>
                </>
              )}
            </Button>
          </div>

          {/* Prompt Preview Code Box */}
          <div className="mt-5 relative">
            <div className="bg-slate-950 rounded-xl p-4 sm:p-5 font-mono text-xs text-slate-300 leading-relaxed max-h-72 overflow-y-auto border border-slate-800 shadow-inner">
              <pre className="whitespace-pre-wrap">{UNIVERSITY_LATEX_PROMPT}</pre>
            </div>
          </div>

          {/* Key Advantages Grid (Clean Typography, No generic icon boxes) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-6 pt-6 border-t border-slate-100 dark:border-zinc-800 text-xs">
            <div className="space-y-1">
              <h4 className="font-bold text-slate-900 dark:text-zinc-100">
                1. Sin portada formal
              </h4>
              <p className="text-slate-500 dark:text-zinc-400 leading-relaxed">
                Comienza directamente en el encabezado institucional para adjuntar la portada oficial de la universidad sin páginas en blanco.
              </p>
            </div>

            <div className="space-y-1">
              <h4 className="font-bold text-slate-900 dark:text-zinc-100">
                2. Tablas ajustadas al margen
              </h4>
              <p className="text-slate-500 dark:text-zinc-400 leading-relaxed">
                Instruye a la IA a envolver tablas con \resizebox para evitar texto cortado o desbordamientos en el margen derecho.
              </p>
            </div>

            <div className="space-y-1">
              <h4 className="font-bold text-slate-900 dark:text-zinc-100">
                3. Adaptable a la materia
              </h4>
              <p className="text-slate-500 dark:text-zinc-400 leading-relaxed">
                Si la actividad es teórica u humanística omite fórmulas; si es numérica resuelve cálculos paso a paso con amsmath.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid (Clean, minimalist technical layout) */}
      <section className="px-4 sm:px-6 max-w-5xl mx-auto w-full pb-20">
        <h2 className="text-xl sm:text-2xl font-bold text-center text-slate-900 dark:text-white mb-8">
          Características de NewTexPDF
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2">
                Compilación Tectonic
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                Motor XeTeX moderno y rápido que resuelve dependencias y fuentes automáticamente para generar PDFs limpios y nítidos.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2">
                Hojas A4, Carta u Oficio
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                Selecciona con un clic el formato de papel que solicita tu universidad. El editor ajusta de inmediato el preámbulo y la vista previa.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2">
                Auto-ajuste de Tablas
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                Si una tabla excede el margen derecho, la herramienta de auto-ajuste la adapta automáticamente al ancho del texto para evitar pérdidas de contenido.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="mt-12 text-center p-8 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-xl">
          <h3 className="text-xl sm:text-2xl font-bold mb-2">¿Listo para editar tu trabajo?</h3>
          <p className="text-emerald-100 text-xs sm:text-sm max-w-xl mx-auto mb-6">
            Ingresa directamente al editor para redactar y compilar tu documento con total comodidad.
          </p>
          <Button
            type="button"
            onClick={onGoToEditor}
            className="inline-flex items-center justify-center gap-2 bg-white text-emerald-800 hover:bg-slate-100 font-bold text-sm px-6 h-11 shadow-md rounded-xl transition-all cursor-pointer"
          >
            <span>Abrir Editor LaTeX</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* Footer with Developer Credits and Social Links */}
      <footer className="mt-auto border-t border-slate-200 dark:border-zinc-800 py-8 px-4 sm:px-6 text-xs text-slate-500 dark:text-zinc-400 bg-white/50 dark:bg-zinc-950">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-semibold text-slate-800 dark:text-zinc-200">NewTexPDF</span> &mdash; Compilador y Editor LaTeX para Estudiantes e Investigadores
          </div>

          <div className="flex items-center gap-3 flex-wrap justify-center">
            <span className="text-slate-600 dark:text-zinc-300">
              Desarrollado por <strong className="text-slate-900 dark:text-white font-semibold">Ing. Newman Acosta</strong>
            </span>
            <div className="flex items-center gap-2">
              <a
                href="https://github.com/Newman-a"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 flex items-center justify-center transition-colors"
                title="GitHub: https://github.com/Newman-a"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://www.instagram.com/newman_ga/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 hover:text-pink-600 dark:hover:text-pink-400 flex items-center justify-center transition-colors"
                title="Instagram: https://www.instagram.com/newman_ga/"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
