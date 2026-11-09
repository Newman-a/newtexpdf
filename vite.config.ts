import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { execFile } from 'child_process';

function tectonicPlugin(): Plugin {
  return {
    name: 'vite-plugin-tectonic',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const cleanUrl = req.url?.split('?')[0] || '';
        if (cleanUrl.endsWith('/api/compile-tectonic') && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk;
          });

          req.on('end', () => {
            try {
              const { code, filename } = JSON.parse(body || '{}');
              if (!code || typeof code !== 'string') {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'No se envió código LaTeX válido.' }));
                return;
              }

              // Create temporary directory
              const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'newtexpdf-'));
              const inputTexPath = path.join(tempDir, 'document.tex');

              // Auto-sanitize known incompatibilities (e.g. bidi=basic is LuaTeX-only and halts XeTeX/Tectonic)
              let safeCode = code.replace(/\\usepackage\[[^\]]*bidi=basic[^\]]*\]\{babel\}/g, '\\usepackage[spanish,es-nodecimaldot]{babel}');
              safeCode = safeCode.replace(/\\babelprovide\[[^\]]*\]\{[^}]*\}/g, '');
              safeCode = safeCode.replace(/\\babelfont\{[^}]*\}\{[^}]*\}/g, '');

              // Ensure graphicx is loaded if resizebox is used
              if (safeCode.includes('resizebox') && !safeCode.includes('usepackage{graphicx}')) {
                safeCode = safeCode.replace(/\\documentclass(\[[^\]]*\])?\{[^}]*\}/, '$&\n\\usepackage{graphicx}');
              }

              // Ensure amsmath is loaded if math commands are used (e.g. \iint, \iiint, align, etc.)
              if (!safeCode.includes('{amsmath}')) {
                if (/\\(iint|iiint|idotsint|align|gather|bmatrix|pmatrix|vmatrix|cases|text|eqref|substack|dfrac|tfrac)\b/.test(safeCode)) {
                  safeCode = safeCode.replace(/\\documentclass(\[[^\]]*\])?\{[^}]*\}/, '$&\n\\usepackage{amsmath}');
                }
              }

              // Ensure amssymb is loaded if symbols are used
              if (!safeCode.includes('{amssymb}')) {
                if (/\\(mathbb|mathfrak|subseteq|supseteq|approx|triangleq|therefore|because)\b/.test(safeCode)) {
                  safeCode = safeCode.replace(/\\documentclass(\[[^\]]*\])?\{[^}]*\}/, '$&\n\\usepackage{amssymb}');
                }
              }

              // Ensure setspace is loaded if spacing commands are used
              if (!safeCode.includes('{setspace}')) {
                if (/\\(onehalfspacing|doublespacing|singlespacing)\b/.test(safeCode)) {
                  safeCode = safeCode.replace(/\\documentclass(\[[^\]]*\])?\{[^}]*\}/, '$&\n\\usepackage{setspace}');
                }
              }

              fs.writeFileSync(inputTexPath, safeCode, 'utf-8');

              const tectonicPath = path.resolve(__dirname, 'bin/tectonic.exe');
              if (!fs.existsSync(tectonicPath)) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: `No se encontró tectonic.exe en ${tectonicPath}` }));
                return;
              }

              const safeName = (filename || 'documento.pdf').endsWith('.pdf') ? filename : `${filename}.pdf`;

              execFile(tectonicPath, [inputTexPath, '--outdir', tempDir], { maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
                const outputPdfPath = path.join(tempDir, 'document.pdf');

                if (error || !fs.existsSync(outputPdfPath)) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({
                    error: 'Error al compilar el documento con Tectonic',
                    details: (stderr || stdout || (error ? error.message : '')).trim()
                  }));
                  try {
                    fs.rmSync(tempDir, { recursive: true, force: true });
                  } catch {}
                  return;
                }

                const pdfBuffer = fs.readFileSync(outputPdfPath);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `inline; filename="${safeName}"`);
                res.end(pdfBuffer);

                try {
                  fs.rmSync(tempDir, { recursive: true, force: true });
                } catch {}
              });
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err?.message || 'Error interno del servidor' }));
            }
          });
          return;
        }
        next();
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    wasm(),
    topLevelAwait(),
    tectonicPlugin(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  optimizeDeps: {
    exclude: ['@wasmer/sdk'],
  },
});
