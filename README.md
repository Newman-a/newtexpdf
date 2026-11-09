# NewTexPDF Studio (React + Tectonic WebAssembly + KaTeX)

Una suite moderna para compilar documentos **TeX / LaTeX directamente a PDF nativo** dentro del navegador utilizando **WebAssembly (WASM)** y **KaTeX**.

---

## ⚡ Arquitectura 100% Web (Sin html2pdf.js)

Se ha eliminado por completo la librería `html2pdf.js` y la captura por Canvas. Ahora la generación de PDF se basa exclusivamente en motores tipográficos de alta precisión:

1. **Tectonic en WebAssembly (`@wasmer/sdk`)**:
   - Corre el motor completo de **XeTeX / Tectonic en WebAssembly** directamente en el navegador del cliente.
   - Ideal para despliegues estáticos en **GitHub Pages** y **Vercel** sin necesidad de servidores backend.
   - Genera documentos PDF vectoriales reales con cálculo milimétrico de saltos de página y fuentes TeX auténticas.
2. **Acelerador Local (en desarrollo)**:
   - Si se ejecuta localmente mediante `pnpm run dev`, el middleware de Vite puede utilizar el binario local para una compilación instantánea de 1 segundo.
3. **Impresión Vectorial Nativa**:
   - Botón directo para imprimir o guardar como PDF nativo vectorial a través del motor del navegador.
4. **Previsualización KaTeX reactiva**:
   - Renderizado en vivo mientras se redacta en el editor.

---

## 🚀 Despliegue en GitHub Pages / Vercel

El proyecto incluye:
- Workflow de **GitHub Actions** en `.github/workflows/deploy.yml` para despliegue automático con cada `git push`.
- Configuración para **Vercel** en `vercel.json`.
- Rutas relativas (`base: './'`) en `vite.config.ts`.

### Iniciar en local:
```bash
cd C:\Users\gabri\proyectos\newtexpdf
pnpm run dev
```
Abre en tu navegador: **http://localhost:5173**
Pulsando `Ctrl + Enter` compilarás tu documento con el motor Tectonic.