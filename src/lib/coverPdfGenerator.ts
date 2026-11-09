import { jsPDF } from 'jspdf';

export type CoverPaperType = 'letter' | 'a4' | 'legal';

export interface StudentAuthor {
  id: string;
  name: string;
  cedula?: string;
}

export interface CoverData {
  paperType: CoverPaperType;
  fontFamily: 'times' | 'helvetica';
  fontSize?: '10pt' | '11pt' | '12pt';
  logoLeft?: string | null;  // base64 data URL
  logoRight?: string | null; // base64 data URL
  membrete: string;
  title: string;
  subtitle?: string;
  docenteRole: string;       // e.g. "DOCENTE:"
  docenteTitle: string;      // e.g. "Ing." | "Dr." | "Msc."
  docenteName: string;
  authorRole: string;        // e.g. "REALIZADO POR:" | "AUTOR:"
  authors: StudentAuthor[];
  city?: string;             // e.g. "Ciudad"
  month: string;             // e.g. "Noviembre"
  year: string;              // e.g. "2026"
}

export const DEFAULT_MEMBRETE = `NOMBRE DE LA INSTITUCIÓN O UNIVERSIDAD
FACULTAD O DEPARTAMENTO ACADÉMICO
CARRERA O PROGRAMA DE ESTUDIOS`;

export const DOCENTE_TITLE_OPTIONS = [
  'Ing.',
  'Dr.',
  'Dra.',
  'Msc.',
  'Licda.',
  'Lic.',
  'Prof.',
  'T.S.U.',
  'Sin título',
];

export const DOCENTE_ROLE_OPTIONS = [
  'DOCENTE:',
  'PROFESOR:',
  'FACILITADOR:',
  'TUTOR:',
  'MAESTRO:',
  'ASESOR ACADÉMICO:',
];

export const AUTHOR_ROLE_OPTIONS = [
  'REALIZADO POR:',
  'AUTOR:',
  'AUTORES:',
  'ESTUDIANTE:',
  'ESTUDIANTES:',
  'INTEGRANTES:',
  'PARTICIPANTE:',
];

export const MONTH_OPTIONS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

/**
 * Returns dimensions in millimeters for the given paper format
 */
export function getPaperDimensionsMm(paper: CoverPaperType): { width: number; height: number } {
  switch (paper) {
    case 'a4':
      return { width: 210, height: 297 };
    case 'legal':
      return { width: 215.9, height: 355.6 };
    case 'letter':
    default:
      return { width: 215.9, height: 279.4 };
  }
}

/**
 * Generates a jsPDF instance for the academic cover page
 */
export function createCoverPdfDocument(data: CoverData): jsPDF {
  const { width: W, height: H } = getPaperDimensionsMm(data.paperType);
  const font = data.fontFamily === 'helvetica' ? 'helvetica' : 'times';
  const baseSize = data.fontSize || '11pt';
  const scale = baseSize === '10pt' ? 0.9 : baseSize === '12pt' ? 1.12 : 1.0;

  const membreteSize = 10.5 * scale;
  const membreteLineHeight = 4.8 * scale;
  const titleSize = 14 * scale;
  const titleLineHeight = 6.5 * scale;
  const subtitleSize = 11 * scale;
  const detailsSize = 10.5 * scale;
  const detailsLineHeight = 5.5 * scale;
  const footerSize = 11 * scale;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [W, H],
  });

  const marginX = 25;
  const marginY = 24;

  // 1. Logos (Left and Right) with strict original aspect ratio preservation
  const logoBoxSize = 25; // max bounding box in mm (width and height)

  const addProportionalLogo = (imageData: string, boxX: number, boxY: number) => {
    try {
      const props = doc.getImageProperties(imageData);
      let renderW = logoBoxSize;
      let renderH = logoBoxSize;

      if (props && props.width > 0 && props.height > 0) {
        const aspect = props.width / props.height;
        if (aspect >= 1) {
          // Wider than tall or square: cap width at logoBoxSize, scale height proportionally
          renderW = logoBoxSize;
          renderH = logoBoxSize / aspect;
        } else {
          // Taller than wide (portrait): cap height at logoBoxSize, scale width proportionally
          renderH = logoBoxSize;
          renderW = logoBoxSize * aspect;
        }
      }

      // Center within the reserved bounding box
      const posX = boxX + (logoBoxSize - renderW) / 2;
      const posY = boxY + (logoBoxSize - renderH) / 2;
      const format = props?.fileType || (imageData.startsWith('data:image/jpeg') ? 'JPEG' : 'PNG');

      doc.addImage(imageData, format, posX, posY, renderW, renderH);
    } catch (err) {
      console.warn('Fallback adding logo image:', err);
      try {
        doc.addImage(imageData, 'PNG', boxX, boxY, logoBoxSize, logoBoxSize);
      } catch {
        try {
          doc.addImage(imageData, 'JPEG', boxX, boxY, logoBoxSize, logoBoxSize);
        } catch (e2) {
          console.error('Failed to add logo image to PDF:', e2);
        }
      }
    }
  };

  if (data.logoLeft) {
    addProportionalLogo(data.logoLeft, marginX, marginY);
  }

  if (data.logoRight) {
    addProportionalLogo(data.logoRight, W - marginX - logoBoxSize, marginY);
  }

  // 2. Centered Membrete
  doc.setFont(font, 'bold');
  doc.setFontSize(membreteSize);
  doc.setTextColor(20, 20, 20);

  // Calculate available text width between logos or margins
  const hasLogos = !!(data.logoLeft || data.logoRight);
  const maxMembreteWidth = hasLogos ? W - (marginX * 2 + logoBoxSize * 2 + 10) : W - marginX * 2;

  const rawMembreteLines = data.membrete.split('\n').map(l => l.trim()).filter(Boolean);
  let currentY = marginY + 2;

  rawMembreteLines.forEach(line => {
    const wrapped = doc.splitTextToSize(line, maxMembreteWidth);
    wrapped.forEach((wrappedLine: string) => {
      doc.text(wrappedLine, W / 2, currentY, { align: 'center' });
      currentY += membreteLineHeight;
    });
  });

  // 3. Activity Title (Vertically Centered)
  // Position vertically: balanced around middle
  let titleY = H / 2 - 12;
  if (data.paperType === 'legal') {
    titleY = H / 2 - 20;
  }

  doc.setFont(font, 'bold');
  doc.setFontSize(titleSize);
  const maxTitleWidth = W - marginX * 2 - 10;
  const rawTitle = data.title.trim() || 'TÍTULO DE LA ACTIVIDAD';
  const titleLines = doc.splitTextToSize(rawTitle.toUpperCase(), maxTitleWidth);

  titleLines.forEach((tLine: string) => {
    doc.text(tLine, W / 2, titleY, { align: 'center' });
    titleY += titleLineHeight;
  });

  // Optional Subtitle / Asignatura
  if (data.subtitle && data.subtitle.trim()) {
    titleY += 3;
    doc.setFont(font, 'normal');
    doc.setFontSize(subtitleSize);
    const subLines = doc.splitTextToSize(data.subtitle.trim(), maxTitleWidth);
    subLines.forEach((sLine: string) => {
      doc.text(sLine, W / 2, titleY, { align: 'center' });
      titleY += 5.2 * scale;
    });
  }

  // 4. Lower Section: Docente (Left) & Realizado por / Autores (Right)
  let lowerY = H - 76;
  if (data.paperType === 'legal') {
    lowerY = H - 96;
  } else if (data.paperType === 'a4') {
    lowerY = H - 82;
  }

  // Left Column: Docente
  const docRole = data.docenteRole.trim() || 'DOCENTE:';
  doc.setFont(font, 'bold');
  doc.setFontSize(detailsSize);
  doc.text(docRole, marginX, lowerY);

  const prefix = data.docenteTitle && data.docenteTitle !== 'Sin título' ? `${data.docenteTitle} ` : '';
  const docenteFullName = `${prefix}${data.docenteName.trim() || 'Nombre del Docente'}`;

  doc.setFont(font, 'normal');
  doc.setFontSize(detailsSize);
  doc.text(docenteFullName, marginX, lowerY + detailsLineHeight);

  // Right Column: Autores / Realizado por
  const authRole = data.authorRole.trim() || 'REALIZADO POR:';
  const rightAlignX = W - marginX;

  doc.setFont(font, 'bold');
  doc.setFontSize(detailsSize);
  doc.text(authRole, rightAlignX, lowerY, { align: 'right' });

  doc.setFont(font, 'normal');
  doc.setFontSize(detailsSize);

  const authorList = data.authors.length > 0 ? data.authors : [{ id: '1', name: 'Nombre del Estudiante' }];
  authorList.forEach((author, idx) => {
    const cedulaText = author.cedula && author.cedula.trim() ? ` ${author.cedula.trim()}` : '';
    const lineText = `${author.name.trim() || 'Nombre del Estudiante'}${cedulaText}`;
    doc.text(lineText, rightAlignX, lowerY + detailsLineHeight * (idx + 1), { align: 'right' });
  });

  // 5. Bottom Footer: Ciudad y Fecha
  const footerY = H - 24;
  doc.setFont(font, 'bold');
  doc.setFontSize(footerSize);

  const cityPrefix = data.city && data.city.trim() ? `${data.city.trim()}, ` : '';
  const dateText = `${cityPrefix}${data.month} de ${data.year}`;

  doc.text(dateText, W / 2, footerY, { align: 'center' });

  return doc;
}

/**
 * Downloads the generated cover PDF directly
 */
export function downloadCoverPdf(data: CoverData, filename = 'portada_academica.pdf'): void {
  const doc = createCoverPdfDocument(data);
  const safeName = filename.toLowerCase().endsWith('.pdf') ? filename : `${filename}.pdf`;
  doc.save(safeName);
}

/**
 * Generates an object URL (blob) for the cover PDF
 */
export function getCoverPdfBlobUrl(data: CoverData): string {
  const doc = createCoverPdfDocument(data);
  const blob = doc.output('blob');
  return URL.createObjectURL(blob);
}

/**
 * Generates matching standalone LaTeX code for this cover page
 */
export function generateCoverLatexCode(data: CoverData): string {
  const paperOpt = data.paperType === 'a4' ? 'a4paper' : data.paperType === 'legal' ? 'legalpaper' : 'letterpaper';
  const prefix = data.docenteTitle && data.docenteTitle !== 'Sin título' ? `${data.docenteTitle} ` : '';
  const docenteFull = `${prefix}${data.docenteName.trim() || 'Nombre del Docente'}`;
  const cityPrefix = data.city && data.city.trim() ? `${data.city.trim()}, ` : '';

  const authorsTex = data.authors
    .map(a => `${a.name.trim()}${a.cedula ? ` \\\\ ${a.cedula.trim()}` : ''}`)
    .join(' \\\\[0.2cm]\n');

  const sizeOpt = data.fontSize || '11pt';

  return `\\documentclass[${sizeOpt}, ${paperOpt}]{article}
\\usepackage[spanish, es-tabla]{babel}
\\usepackage[utf8]{inputenc}
\\usepackage[margin=2.5cm]{geometry}
\\usepackage{mathptmx}
\\usepackage{graphicx}

\\begin{document}
\\pagestyle{empty}

% Encabezado y Membrete
\\begin{center}
${data.membrete.split('\n').filter(Boolean).map(l => `\\textbf{${l}}`).join(' \\\\\n')}
\\end{center}

\\vspace*{\\fill}

% Título de la Actividad
\\begin{center}
  {\\Large \\textbf{${data.title.trim().toUpperCase()}}}
  ${data.subtitle ? `\\\\[0.4cm]\n  {\\normalsize ${data.subtitle.trim()}}` : ''}
\\end{center}

\\vspace*{\\fill}

% Datos del Docente y Estudiantes
\\noindent
\\begin{minipage}[t]{0.48\\textwidth}
  \\textbf{${data.docenteRole}} \\\\[0.15cm]
  ${docenteFull}
\\end{minipage}
\\hfill
\\begin{minipage}[t]{0.48\\textwidth}
  \\begin{flushright}
    \\textbf{${data.authorRole}} \\\\[0.15cm]
    ${authorsTex || 'Nombre del Estudiante'}
  \\end{flushright}
\\end{minipage}

\\vspace*{1.8cm}

% Ciudad y Fecha
\\begin{center}
  \\textbf{${cityPrefix}${data.month} de ${data.year}}
\\end{center}

\\end{document}`;
}

