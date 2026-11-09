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
  city?: string;             // e.g. "Caracas"
  month: string;             // e.g. "Noviembre"
  year: string;              // e.g. "2026"
}

export const DEFAULT_MEMBRETE = `REPÚBLICA BOLIVARIANA DE VENEZUELA
MINISTERIO DEL PODER POPULAR PARA LA EDUCACIÓN UNIVERSITARIA
UNIVERSIDAD NACIONAL EXPERIMENTAL DE LOS LLANOS OCCIDENTALES
VICERRECTORADO DE PLANIFICACIÓN Y DESARROLLO REGIONAL
PROGRAMA CIENCIAS BÁSICAS Y APLICADAS`;

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

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [W, H],
  });

  const marginX = 25;
  const marginY = 24;

  // 1. Logos (Left and Right)
  const logoBoxSize = 25; // max width/height in mm

  if (data.logoLeft) {
    try {
      doc.addImage(data.logoLeft, 'PNG', marginX, marginY, logoBoxSize, logoBoxSize);
    } catch {
      try {
        doc.addImage(data.logoLeft, 'JPEG', marginX, marginY, logoBoxSize, logoBoxSize);
      } catch (err) {
        console.warn('Could not render left logo image:', err);
      }
    }
  }

  if (data.logoRight) {
    try {
      doc.addImage(data.logoRight, 'PNG', W - marginX - logoBoxSize, marginY, logoBoxSize, logoBoxSize);
    } catch {
      try {
        doc.addImage(data.logoRight, 'JPEG', W - marginX - logoBoxSize, marginY, logoBoxSize, logoBoxSize);
      } catch (err) {
        console.warn('Could not render right logo image:', err);
      }
    }
  }

  // 2. Centered Membrete
  doc.setFont(font, 'bold');
  doc.setFontSize(10.5);
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
      currentY += 4.8;
    });
  });

  // 3. Activity Title (Vertically Centered)
  // Position vertically: balanced around middle
  let titleY = H / 2 - 12;
  if (data.paperType === 'legal') {
    titleY = H / 2 - 20;
  }

  doc.setFont(font, 'bold');
  doc.setFontSize(14);
  const maxTitleWidth = W - marginX * 2 - 10;
  const rawTitle = data.title.trim() || 'TÍTULO DE LA ACTIVIDAD';
  const titleLines = doc.splitTextToSize(rawTitle.toUpperCase(), maxTitleWidth);

  titleLines.forEach((tLine: string) => {
    doc.text(tLine, W / 2, titleY, { align: 'center' });
    titleY += 6.5;
  });

  // Optional Subtitle / Asignatura
  if (data.subtitle && data.subtitle.trim()) {
    titleY += 3;
    doc.setFont(font, 'normal');
    doc.setFontSize(11);
    const subLines = doc.splitTextToSize(data.subtitle.trim(), maxTitleWidth);
    subLines.forEach((sLine: string) => {
      doc.text(sLine, W / 2, titleY, { align: 'center' });
      titleY += 5.2;
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
  doc.setFontSize(10.5);
  doc.text(docRole, marginX, lowerY);

  const prefix = data.docenteTitle && data.docenteTitle !== 'Sin título' ? `${data.docenteTitle} ` : '';
  const docenteFullName = `${prefix}${data.docenteName.trim() || 'Nombre del Docente'}`;

  doc.setFont(font, 'normal');
  doc.setFontSize(10.5);
  doc.text(docenteFullName, marginX, lowerY + 5.5);

  // Right Column: Autores / Realizado por
  const authRole = data.authorRole.trim() || 'REALIZADO POR:';
  const rightAlignX = W - marginX;

  doc.setFont(font, 'bold');
  doc.setFontSize(10.5);
  doc.text(authRole, rightAlignX, lowerY, { align: 'right' });

  doc.setFont(font, 'normal');
  doc.setFontSize(10.5);

  const authorList = data.authors.length > 0 ? data.authors : [{ id: '1', name: 'Nombre del Estudiante' }];
  authorList.forEach((author, idx) => {
    const cedulaText = author.cedula && author.cedula.trim() ? ` ${author.cedula.trim()}` : '';
    const lineText = `${author.name.trim() || 'Nombre del Estudiante'}${cedulaText}`;
    doc.text(lineText, rightAlignX, lowerY + 5.5 * (idx + 1), { align: 'right' });
  });

  // 5. Bottom Footer: Ciudad y Fecha
  const footerY = H - 24;
  doc.setFont(font, 'bold');
  doc.setFontSize(11);

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

  return `\\documentclass[12pt, ${paperOpt}]{article}
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
