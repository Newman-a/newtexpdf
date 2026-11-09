import { jsPDF } from 'jspdf';

export type CoverPaperType = 'letter' | 'a4' | 'legal';

export type LineSpacingType = '1.0' | '1.15' | '1.5' | '2.0';

export interface CoverMargins {
  top: number;    // in cm, e.g. 2.5, 3.0, 4.0
  bottom: number; // in cm
  left: number;   // in cm
  right: number;  // in cm
}

export const MARGIN_PRESETS: Record<string, { label: string; margins: CoverMargins }> = {
  apa: {
    label: 'Normas APA (2.5 cm todos los lados)',
    margins: { top: 2.5, bottom: 2.5, left: 2.5, right: 2.5 },
  },
  tesis: {
    label: 'Tesis / Encuadernar (Sup: 4cm, Izq: 4cm, Der: 3cm, Inf: 3cm)',
    margins: { top: 4.0, bottom: 3.0, left: 4.0, right: 3.0 },
  },
  standard: {
    label: 'Estándar Universitario (3.0 cm todos los lados)',
    margins: { top: 3.0, bottom: 3.0, left: 3.0, right: 3.0 },
  },
  compact: {
    label: 'Compacto (2.0 cm todos los lados)',
    margins: { top: 2.0, bottom: 2.0, left: 2.0, right: 2.0 },
  },
};

export interface StudentAuthor {
  id: string;
  name: string;
  cedula?: string;
}

export interface CoverData {
  paperType: CoverPaperType;
  fontFamily: 'times' | 'helvetica';
  fontSize?: '10pt' | '11pt' | '12pt';
  lineSpacing?: LineSpacingType;
  margins?: CoverMargins;
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

  // Margins in mm (converted from cm)
  const marginTop = (data.margins?.top ?? 2.5) * 10;
  const marginBottom = (data.margins?.bottom ?? 2.5) * 10;
  const marginLeft = (data.margins?.left ?? 2.5) * 10;
  const marginRight = (data.margins?.right ?? 2.5) * 10;

  // Interlineado multiplier
  const spacingMultiplier = data.lineSpacing === '2.0' ? 1.45 : data.lineSpacing === '1.5' ? 1.25 : data.lineSpacing === '1.0' ? 0.9 : 1.0;

  const membreteSize = 10.5 * scale;
  const titleSize = 14 * scale;
  const titleLineHeight = (6.5 * scale) * spacingMultiplier;
  const subtitleSize = 11 * scale;
  const detailsSize = 10.5 * scale;
  const detailsLineHeight = (5.5 * scale) * spacingMultiplier;
  const footerSize = 11 * scale;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [W, H],
  });

  // 1. Logos (Left and Right) with strict original aspect ratio preservation
  const logoBoxSize = 22; // optimal bounding box in mm for academic header logos

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
    addProportionalLogo(data.logoLeft, marginLeft, marginTop);
  }

  if (data.logoRight) {
    addProportionalLogo(data.logoRight, W - marginRight - logoBoxSize, marginTop);
  }

  // 2. Centered Membrete
  doc.setFont(font, 'bold');

  // Calculate available text width between logos (or margins if no logos)
  const hasLogos = !!(data.logoLeft || data.logoRight);
  const maxMembreteWidth = hasLogos
    ? (W - marginRight - (data.logoRight ? logoBoxSize + 4 : 0)) - (marginLeft + (data.logoLeft ? logoBoxSize + 4 : 0))
    : W - (marginLeft + marginRight);

  const rawMembreteLines = data.membrete.split('\n').map(l => l.trim()).filter(Boolean);

  // Auto-fit font size: ensure no single line gets broken awkwardly into a dangling word (e.g. "DEFENSA")
  let effectiveMembreteSize = membreteSize;
  for (const line of rawMembreteLines) {
    doc.setFontSize(effectiveMembreteSize);
    const textWidth = doc.getTextWidth(line);
    if (textWidth > maxMembreteWidth && textWidth > 0) {
      const scaleNeeded = (maxMembreteWidth / textWidth) * 0.99;
      const targetSize = effectiveMembreteSize * scaleNeeded;
      if (targetSize < effectiveMembreteSize) {
        effectiveMembreteSize = Math.max(targetSize, 8.5);
      }
    }
  }

  doc.setFontSize(effectiveMembreteSize);
  doc.setTextColor(20, 20, 20);

  const currentMembreteLineHeight = (effectiveMembreteSize * 0.44) * spacingMultiplier;
  let currentY = marginTop + 2;

  // Document optical center X
  const centerX = (marginLeft + (W - marginRight)) / 2;

  rawMembreteLines.forEach(line => {
    const wrapped = doc.splitTextToSize(line, maxMembreteWidth);
    wrapped.forEach((wrappedLine: string) => {
      doc.text(wrappedLine, centerX, currentY, { align: 'center' });
      currentY += currentMembreteLineHeight;
    });
  });

  // 3. Activity Title (Vertically Centered)
  let titleY = H / 2 - 12;
  if (data.paperType === 'legal') {
    titleY = H / 2 - 20;
  }

  doc.setFont(font, 'bold');
  doc.setFontSize(titleSize);
  const maxTitleWidth = (W - marginRight) - marginLeft - 10;
  const rawTitle = data.title.trim() || 'TÍTULO DE LA ACTIVIDAD';
  const titleLines = doc.splitTextToSize(rawTitle.toUpperCase(), maxTitleWidth);

  titleLines.forEach((tLine: string) => {
    doc.text(tLine, centerX, titleY, { align: 'center' });
    titleY += titleLineHeight;
  });

  // Optional Subtitle / Asignatura
  if (data.subtitle && data.subtitle.trim()) {
    titleY += 3;
    doc.setFont(font, 'normal');
    doc.setFontSize(subtitleSize);
    const subLines = doc.splitTextToSize(data.subtitle.trim(), maxTitleWidth);
    subLines.forEach((sLine: string) => {
      doc.text(sLine, centerX, titleY, { align: 'center' });
      titleY += 5.2 * scale * spacingMultiplier;
    });
  }

  // 4. Lower Section: Docente (Left) & Realizado por / Autores (Right)
  let lowerY = H - marginBottom - 42;
  if (data.paperType === 'legal') {
    lowerY = H - marginBottom - 58;
  } else if (data.paperType === 'a4') {
    lowerY = H - marginBottom - 46;
  }

  // Left Column: Docente
  const docRole = data.docenteRole.trim() || 'DOCENTE:';
  doc.setFont(font, 'bold');
  doc.setFontSize(detailsSize);
  doc.text(docRole, marginLeft, lowerY);

  const prefix = data.docenteTitle && data.docenteTitle !== 'Sin título' ? `${data.docenteTitle} ` : '';
  const docenteFullName = `${prefix}${data.docenteName.trim() || 'Nombre del Docente'}`;

  doc.setFont(font, 'normal');
  doc.setFontSize(detailsSize);
  doc.text(docenteFullName, marginLeft, lowerY + detailsLineHeight);

  // Right Column: Autores / Realizado por
  const authRole = data.authorRole.trim() || 'REALIZADO POR:';
  const rightAlignX = W - marginRight;

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
  const footerY = H - marginBottom - 3;
  doc.setFont(font, 'bold');
  doc.setFontSize(footerSize);

  const cityPrefix = data.city && data.city.trim() ? `${data.city.trim()}, ` : '';
  const dateText = `${cityPrefix}${data.month} de ${data.year}`;

  doc.text(dateText, centerX, footerY, { align: 'center' });

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
  const topCm = data.margins?.top ?? 2.5;
  const bottomCm = data.margins?.bottom ?? 2.5;
  const leftCm = data.margins?.left ?? 2.5;
  const rightCm = data.margins?.right ?? 2.5;

  const spacingCmd = data.lineSpacing === '2.0'
    ? '\\usepackage{setspace}\n\\doublespacing\n'
    : data.lineSpacing === '1.5'
    ? '\\usepackage{setspace}\n\\onehalfspacing\n'
    : data.lineSpacing === '1.0'
    ? '\\usepackage{setspace}\n\\singlespacing\n'
    : '';

  return `\\documentclass[${sizeOpt}, ${paperOpt}]{article}
\\usepackage[spanish, es-tabla]{babel}
\\usepackage[utf8]{inputenc}
\\usepackage[top=${topCm}cm, bottom=${bottomCm}cm, left=${leftCm}cm, right=${rightCm}cm]{geometry}
\\usepackage{mathptmx}
\\usepackage{graphicx}
${spacingCmd}
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

