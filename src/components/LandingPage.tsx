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
  ExternalLink,
} from 'lucide-react';
import { Button } from './ui/button';

interface LandingPageProps {
  onGoToEditor: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const UNIVERSITY_LATEX_PROMPT = `Actúa como un docente universitario experto en LaTeX y en redacción académica.
Necesito que resuelvas y estructures la siguiente actividad universitaria en código LaTeX completo, impecable y listo para compilar.

Sigue estrictamente estos lineamientos y criterios técnicos:

1. ESTRUCTURA Y FORMATO GENERAL:
- Utiliza la clase de documento: \\documentclass[12pt, letterpaper]{article} (o a4paper/legalpaper según aplique).
- Tipografía: Times New Roman mediante \\usepackage{mathptmx} (o Arial con \\usepackage{helvet}\\renewcommand{\\familydefault}{\\sfdefault}).
- Idioma y codificación: \\usepackage[spanish, es-tabla]{babel} y \\usepackage[utf8]{inputenc}.
- Márgenes académicos equilibrados: \\usepackage[margin=2.5cm]{geometry}.
- Interlineado: \\usepackage{setspace}\\onehalfspacing o espaciado de 1.15.

2. SIN PORTADA (MUY IMPORTANTE):
- NO incluyas portada formal (omite \\begin{titlepage} o página en blanco).
- Inicia directamente en la primera página con un encabezado institucional sobrio o bloque de datos:
  Universidad, Carrera, Asignatura, Título de la Actividad, Nombre del Estudiante y Fecha.
- La portada se diseñará aparte y se unirá posteriormente en PDF.

3. REGLA DE ORO PARA TABLAS (EVITAR QUE SE CORTEN):
- Ninguna tabla debe desbordar el margen derecho de la página.
- Envuelve SIEMPRE cada tabla ancha con \\resizebox{\\linewidth}{!}{...} del paquete graphicx, o utiliza columnas con ancho fijo como p{3.5cm} y tabularx:
  \\begin{center}
  \\resizebox{\\linewidth}{!}{
    \\begin{tabular}{|c|c|p{6cm}|}
    \\hline
    ...
    \\hline
    \\end{tabular}
  }
  \\end{center}

4. DESARROLLO DEL CONTENIDO (ADAPTACIÓN INTELIGENTE):
- Si la actividad involucra ejercicios numéricos, cálculo, ciencias o matemáticas:
  * Resuelve cada ejercicio paso a paso con rigor analítico.
  * Emplea \\usepackage{amsmath, amssymb, amsfonts}.
  * Presenta ecuaciones destacadas en bloques display ($$ ... $$) o en el entorno align*.
  * Incluye explicaciones conceptuales breves antes y después de cada cálculo.
- Si la actividad es teórica, ensayo, resumen, reporte o humanística:
  * Estructura el documento con secciones y subsecciones jerárquicas bien argumentadas.
  * Redacta párrafos fluidos y académicos con citas bibliográficas apropiadas.
  * OMITE por completo fórmulas, símbolos matemáticos y paquetes numéricos innecesarios.

5. PAQUETES ESTÁNDAR Y LIMPIEZA:
- Emplea únicamente paquetes universales compatibles con Tectonic/XeTeX:
  amsmath, amssymb, graphicx, booktabs, array, geometry, mathptmx, hyperref, url.
- Evita paquetes obsoletos o comandos conflictivos.

6. BIBLIOGRAFÍA Y REFERENCIAS (FORMATO APA LIMPIO Y COMPATIBLE CON WORD):
- Elimina cualquier comando o entorno bibliográfico complejo (NO uses \\apaitem ni \\begin{apabib}). Escribe las referencias como texto plano estructurado dentro de un entorno estándar (p. ej., párrafos normales con sangría francesa usando \\hangindent=0.5in \\hangafter=1 o simplemente saltos de párrafo \\par).
- Prohíbe terminantemente el uso de signos de dólar ($) en los enlaces o en el texto. Elimina fragmentos truncados como "$=10393$" o "$=4169414$". Si una fuente no tiene URL limpia, omite el enlace y deja la referencia bibliográfica editorial completa.
- Escribe todas las URLs dentro del comando \\url{...} (requiere \\usepackage{url} o \\usepackage{hyperref}) con la opción de permitir saltos de línea automáticos, o coloca el hipervínculo en texto limpio sin caracteres escapados que rompan la justificación en Word.
- Evita espacios en blanco desproporcionados entre palabras forzando alineación a la izquierda (\\raggedright) en el bloque de bibliografía para que Word no estire el texto al justificar líneas con enlaces largos.

A continuación, aquí tienes los enunciados y datos de la actividad para resolver:
[PEGA AQUÍ EL ENUNCIADO O EJERCICIOS DE TU ACTIVIDAD]`;

export const LandingPage: React.FC<LandingPageProps> = ({
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

          <div className="flex items-center gap-2.5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onToggleDarkMode}
              className="h-9 w-9 p-0 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
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
          <a
            href="?editor=true"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-6 h-11 shadow-lg shadow-emerald-600/25 rounded-xl transition-all cursor-pointer"
          >
            <span>Abrir Editor en Nueva Pestaña</span>
            <ExternalLink className="w-4 h-4" />
          </a>

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
            Abre el editor en una pestaña independiente para redactar y compilar tu documento con total comodidad.
          </p>
          <a
            href="?editor=true"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-white text-emerald-800 hover:bg-slate-100 font-bold text-sm px-6 h-11 shadow-md rounded-xl transition-all cursor-pointer"
          >
            <span>Abrir Editor en Nueva Pestaña</span>
            <ExternalLink className="w-4 h-4" />
          </a>
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
