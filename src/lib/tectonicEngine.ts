import { Wasmer, init } from '@wasmer/sdk';

export interface CompilationResult {
  success: boolean;
  pdfUrl?: string;
  blob?: Blob;
  error?: string;
  details?: string;
  engineUsed: 'wasm' | 'local';
}

let wasmerInitialized = false;
let tectonicPackage: any = null;

/**
 * Initializes the in-browser WebAssembly runtime for Tectonic
 */
async function getOrInitWasmerTectonic() {
  if (!wasmerInitialized) {
    try {
      await init();
      wasmerInitialized = true;
    } catch (e: any) {
      console.warn('Wasmer init error:', e);
      throw new Error(`Error al inicializar runtime WebAssembly: ${e?.message || e}`);
    }
  }

  if (!tectonicPackage) {
    tectonicPackage = await Wasmer.fromRegistry('syrusakbary/tectonic');
  }

  return tectonicPackage;
}

/**
 * Prepares and sanitizes LaTeX code to guarantee successful compilation in Tectonic
 */
export function sanitizeLatexForTectonic(code: string): string {
  let safeCode = code.replace(/\\usepackage\[[^\]]*bidi=basic[^\]]*\]\{babel\}/g, '\\usepackage[spanish,es-nodecimaldot]{babel}');
  safeCode = safeCode.replace(/\\babelprovide\[[^\]]*\]\{[^}]*\}/g, '');
  safeCode = safeCode.replace(/\\babelfont\{[^}]*\}\{[^}]*\}/g, '');

  if (safeCode.includes('resizebox') && !safeCode.includes('usepackage{graphicx}')) {
    safeCode = safeCode.replace(/\\documentclass(\[[^\]]*\])?\{[^}]*\}/, '$&\n\\usepackage{graphicx}');
  }

  if (!safeCode.includes('{amsmath}')) {
    if (/\\(iint|iiint|idotsint|align|gather|bmatrix|pmatrix|vmatrix|cases|text|eqref|substack|dfrac|tfrac)\b/.test(safeCode)) {
      safeCode = safeCode.replace(/\\documentclass(\[[^\]]*\])?\{[^}]*\}/, '$&\n\\usepackage{amsmath}');
    }
  }

  if (!safeCode.includes('{amssymb}')) {
    if (/\\(mathbb|mathfrak|subseteq|supseteq|approx|triangleq|therefore|because)\b/.test(safeCode)) {
      safeCode = safeCode.replace(/\\documentclass(\[[^\]]*\])?\{[^}]*\}/, '$&\n\\usepackage{amssymb}');
    }
  }

  if (!safeCode.includes('{setspace}')) {
    if (/\\(onehalfspacing|doublespacing|singlespacing)\b/.test(safeCode)) {
      safeCode = safeCode.replace(/\\documentclass(\[[^\]]*\])?\{[^}]*\}/, '$&\n\\usepackage{setspace}');
    }
  }

  return safeCode;
}

/**
 * Compiles LaTeX source using in-browser WebAssembly (Wasmer / Tectonic WASM)
 */
async function compileWithWasmInBrowser(latexCode: string): Promise<CompilationResult> {
  try {
    const pkg = await getOrInitWasmerTectonic();
    if (!pkg) {
      throw new Error('No se pudo descargar el paquete WebAssembly de Tectonic.');
    }

    const sanitizedCode = sanitizeLatexForTectonic(latexCode);
    const encoder = new TextEncoder();
    const documentBytes = encoder.encode(sanitizedCode);

    const instance = await pkg.entrypoint?.run({
      args: ['document.tex'],
      mount: {
        '/': {
          'document.tex': documentBytes,
        },
      },
    });

    const output = await instance.wait();

    if (output.ok) {
      const pdfBytes = await instance.fs?.readFile('/document.pdf');
      if (pdfBytes && pdfBytes.length > 0) {
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const pdfUrl = URL.createObjectURL(blob);
        return {
          success: true,
          pdfUrl,
          blob,
          engineUsed: 'wasm',
        };
      }
    }

    return {
      success: false,
      error: 'Error de compilación en Tectonic WebAssembly',
      details: output.stderr || 'No se generó el archivo document.pdf',
      engineUsed: 'wasm',
    };
  } catch (err: any) {
    console.error('WASM compilation failed:', err);
    return {
      success: false,
      error: 'Error en el motor WebAssembly',
      details: err?.message || String(err),
      engineUsed: 'wasm',
    };
  }
}

/**
 * Compiles LaTeX using the local fast development server endpoint
 */
async function compileWithLocalServer(latexCode: string, filename: string): Promise<CompilationResult> {
  const response = await fetch('/api/compile-tectonic', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: latexCode, filename }),
  });

  if (!response.ok) {
    let errorMsg = 'Error en el compilador Tectonic';
    let details = '';
    try {
      const errJson = await response.json();
      errorMsg = errJson.error || errorMsg;
      details = errJson.details || '';
    } catch {
      details = await response.text();
    }
    return {
      success: false,
      error: errorMsg,
      details,
      engineUsed: 'local',
    };
  }

  const blob = await response.blob();
  const pdfUrl = URL.createObjectURL(blob);

  return {
    success: true,
    pdfUrl,
    blob,
    engineUsed: 'local',
  };
}

/**
 * Universal Compilation Entrypoint:
 * Uses the local fast Tectonic XeTeX engine in development,
 * and transparently switches to in-browser WebAssembly when deployed to GitHub Pages or Vercel.
 */
export async function compileLatexDocument(
  latexCode: string,
  filename: string = 'documento.pdf'
): Promise<CompilationResult> {
  if (!latexCode.trim()) {
    return {
      success: false,
      error: 'El documento está vacío.',
      engineUsed: 'wasm',
    };
  }

  const sanitizedCode = sanitizeLatexForTectonic(latexCode);

  // 1. In local dev environment, use the local fast Tectonic engine
  const isLocalhost =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '::1';

  if (isLocalhost) {
    try {
      return await compileWithLocalServer(sanitizedCode, filename);
    } catch (err: any) {
      console.warn('Local endpoint connection error, trying WASM fallback:', err);
    }
  }

  // 2. In cloud deployment (GitHub Pages, Vercel), execute in-browser via WebAssembly
  return await compileWithWasmInBrowser(sanitizedCode);
}

/**
 * Downloads a generated PDF Blob
 */
export function downloadPdfBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Direct native browser print for 100% vectorial PDF generation in any browser
 */
export function printDocumentDirectly(_element: HTMLElement): void {
  window.print();
}
