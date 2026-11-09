export interface CompilationResult {
  success: boolean;
  pdfUrl?: string;
  blob?: Blob;
  error?: string;
  details?: string;
  engineUsed: 'local' | 'cloud' | 'wasm';
}

/**
 * Prepares and sanitizes LaTeX code to guarantee successful compilation in XeTeX / Tectonic
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
 * Compiles LaTeX source using the high-performance XeLaTeX cloud compiler (LaTeX-on-HTTP)
 * Compatible with modern UTF-8 XeTeX / Tectonic packages and accessible from Vercel.
 */
async function compileWithCloudService(latexCode: string, _filename: string): Promise<CompilationResult> {
  const sanitizedCode = sanitizeLatexForTectonic(latexCode);

  // Strategy 1: LaTeX-on-HTTP (XeLaTeX engine with full CORS support)
  try {
    const response = await fetch('https://latex.ytotech.com/builds/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        compiler: 'xelatex',
        resources: [
          {
            main: true,
            content: sanitizedCode,
          },
        ],
      }),
    });

    if (response.ok) {
      const blob = await response.blob();
      const pdfUrl = URL.createObjectURL(blob);
      return {
        success: true,
        pdfUrl,
        blob,
        engineUsed: 'cloud',
      };
    }

    // Try parsing error details if compilation halted
    try {
      const errJson = await response.json();
      let errorSummary = 'Error de compilación en LaTeX';
      let details = '';

      if (errJson.log_files && typeof errJson.log_files === 'object') {
        const logKeys = Object.keys(errJson.log_files);
        if (logKeys.length > 0) {
          const logText: string = errJson.log_files[logKeys[0]];
          const errorMatch = logText.match(/(?:! [^\n]+|LaTeX Error:[^\n]+)/);
          if (errorMatch) {
            errorSummary = errorMatch[0];
          }
          details = logText;
        }
      } else if (errJson.logs) {
        details = errJson.logs;
      }

      return {
        success: false,
        error: errorSummary,
        details: details || errJson.error || 'Fallo de compilación',
        engineUsed: 'cloud',
      };
    } catch {
      // Non-JSON error response
    }
  } catch (err: any) {
    console.warn('Primary cloud compiler (ytotech) error, attempting fallback:', err);
  }

  // Strategy 2: LaTeXOnline fallback endpoint
  try {
    const encoded = encodeURIComponent(sanitizedCode);
    const fallbackResponse = await fetch(`https://latexonline.cc/compile?text=${encoded}`);
    if (fallbackResponse.ok) {
      const blob = await fallbackResponse.blob();
      const pdfUrl = URL.createObjectURL(blob);
      return {
        success: true,
        pdfUrl,
        blob,
        engineUsed: 'cloud',
      };
    }
    const errText = await fallbackResponse.text();
    return {
      success: false,
      error: 'Error de compilación en LaTeX',
      details: errText,
      engineUsed: 'cloud',
    };
  } catch (fallbackErr: any) {
    console.error('All cloud compilers failed:', fallbackErr);
    return {
      success: false,
      error: 'No se pudo conectar con el servicio de compilación',
      details: fallbackErr?.message || String(fallbackErr),
      engineUsed: 'cloud',
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
 * Uses the local fast Tectonic XeTeX engine in development if available,
 * and seamlessly uses high-availability XeLaTeX Cloud compilation when deployed to Vercel.
 */
export async function compileLatexDocument(
  latexCode: string,
  filename: string = 'documento.pdf'
): Promise<CompilationResult> {
  if (!latexCode.trim()) {
    return {
      success: false,
      error: 'El documento está vacío.',
      engineUsed: 'cloud',
    };
  }

  const sanitizedCode = sanitizeLatexForTectonic(latexCode);

  // 1. In local dev environment, use the local fast Tectonic engine if available
  const isLocalhost =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '::1';

  if (isLocalhost) {
    try {
      const localResult = await compileWithLocalServer(sanitizedCode, filename);
      if (localResult.success) {
        return localResult;
      }
    } catch (err: any) {
      console.warn('Local endpoint connection error, trying cloud compiler:', err);
    }
  }

  // 2. In cloud deployment (Vercel, GitHub Pages), compile via cloud XeLaTeX engine
  return await compileWithCloudService(sanitizedCode, filename);
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
