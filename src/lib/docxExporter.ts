import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ExternalHyperlink,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  WidthType,
} from 'docx';
import { PaperType, GlobalFont } from './latexParser';

interface ExportDocxOptions {
  filename?: string;
  paperType?: PaperType;
  globalFont?: GlobalFont;
  fontSize?: '10pt' | '11pt' | '12pt';
}

/**
 * Maps paper type to twips (1 inch = 1440 twips)
 */
function getPageDimensions(paperType: PaperType = 'letter') {
  switch (paperType) {
    case 'a4':
      // 210mm x 297mm
      return { width: 11906, height: 16838 };
    case 'legal':
      // 8.5in x 14in
      return { width: 12240, height: 20160 };
    case 'letter':
    default:
      // 8.5in x 11in
      return { width: 12240, height: 15840 };
  }
}

/**
 * Maps font family name
 */
function getFontFamily(font: GlobalFont = 'times'): string {
  switch (font) {
    case 'arial':
      return 'Arial';
    case 'palatino':
      return 'Palatino Linotype';
    case 'modern':
      return 'Cambria';
    case 'times':
    default:
      return 'Times New Roman';
  }
}

/**
 * Maps base font size to half-points (docx uses half-points)
 */
function getFontSizeHalfPt(fontSize: '10pt' | '11pt' | '12pt' = '12pt'): number {
  switch (fontSize) {
    case '10pt':
      return 20;
    case '11pt':
      return 22;
    case '12pt':
    default:
      return 24;
  }
}

/**
 * Safely parses any residual LaTeX formatting (like \textbf{...}, \textbf Word, \textbfWord, etc.)
 * found inside raw text nodes into corresponding formatted TextRuns so no raw commands leak to Word.
 */
function splitLatexFormattingRuns(
  text: string,
  state: { bold?: boolean; italics?: boolean; underline?: boolean; font?: string; color?: string },
  fontFamily: string,
  baseSize: number
): TextRun[] {
  const result: TextRun[] = [];
  // Tokenizer regex matching \textbf{...}, \textbf Word, \textbfWord, \textit{...}, etc.
  const regex = /\\(textbf|textit|underline|emph|texttt)(?:\{([^{}]+)\}|\s+([^\n\\<]+)|([A-ZÁÉÍÓÚÑa-z0-9_]+))|\\(bfseries|itshape)\b/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      const beforeText = text.substring(lastIndex, match.index);
      if (beforeText) {
        result.push(
          new TextRun({
            text: beforeText,
            font: state.font || fontFamily,
            size: baseSize,
            bold: state.bold,
            italics: state.italics,
            underline: state.underline ? {} : undefined,
            color: state.color,
          })
        );
      }
    }

    const cmd = match[1] || match[5];
    const content = match[2] || match[3] || match[4] || '';

    const isBold = cmd === 'textbf' || cmd === 'bfseries' || state.bold;
    const isItalic = cmd === 'textit' || cmd === 'emph' || cmd === 'itshape' || state.italics;
    const isUnderline = cmd === 'underline' || state.underline;
    const font = cmd === 'texttt' ? 'Courier New' : state.font || fontFamily;

    if (content) {
      result.push(
        new TextRun({
          text: content,
          font,
          size: baseSize,
          bold: isBold,
          italics: isItalic,
          underline: isUnderline ? {} : undefined,
          color: state.color,
        })
      );
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    const remaining = text.substring(lastIndex);
    if (remaining) {
      result.push(
        new TextRun({
          text: remaining,
          font: state.font || fontFamily,
          size: baseSize,
          bold: state.bold,
          italics: state.italics,
          underline: state.underline ? {} : undefined,
          color: state.color,
        })
      );
    }
  }

  return result;
}

/**
 * Extracts text, formatting runs and hyperlinks from an HTML element
 */
function parseInlineRuns(
  node: Node,
  fontFamily: string,
  baseSize: number,
  inherited: { bold?: boolean; italics?: boolean; underline?: boolean; font?: string } = {}
): (TextRun | ExternalHyperlink)[] {
  const runs: (TextRun | ExternalHyperlink)[] = [];

  const traverse = (
    current: Node,
    state: { bold?: boolean; italics?: boolean; underline?: boolean; font?: string; color?: string }
  ) => {
    if (current.nodeType === Node.TEXT_NODE) {
      let text = current.textContent || '';
      if (!text) return;

      // Clean stray formatting, bibliography or spacing commands
      text = text.replace(/\\(onehalfspacing|doublespacing|singlespacing|begingroup|endgroup|bgroup|egroup|noindent|indent|centering|raggedright|raggedleft|bigskip|medskip|smallskip|sloppy|fussy|relax|appendix|protect)\b/g, '');
      text = text.replace(/\\(label|pagenumbering|pagestyle|thispagestyle|setstretch|linespread|phantom|hphantom|vphantom)\{[^}]*\}/g, '');
      text = text.replace(/\\(setcounter|addtocounter)\{[^}]*\}\{[^}]*\}/g, '');
      text = text.replace(/\\(apaitem|bibitem|bibentry)\b/g, '');
      text = text.replace(/\\hangindent(=|\s)[^\s\\]+/g, '');
      text = text.replace(/\\hangafter(=|\s)[^\s\\]+/g, '');
      // Clean truncated dollar artifacts like $=10393, $=4169414
      text = text.replace(/\$=?\d+\$?|\$=[0-9a-zA-Z_]+/g, '');
      if (!text.trim()) return;

      // Clean any accidental leftover LaTeX commands like \textbf, \textit, etc.
      if (
        /\\(textbf|textit|underline|emph|texttt|bfseries|itshape)\b/.test(text) ||
        /\\textbf[A-ZÁÉÍÓÚÑa-z0-9]/.test(text)
      ) {
        const subRuns = splitLatexFormattingRuns(text, state, fontFamily, baseSize);
        runs.push(...subRuns);
        return;
      }

      runs.push(
        new TextRun({
          text,
          font: state.font || fontFamily,
          size: baseSize,
          bold: state.bold,
          italics: state.italics,
          underline: state.underline ? {} : undefined,
          color: state.color,
        })
      );
      return;
    }

    if (current.nodeType === Node.ELEMENT_NODE) {
      const el = current as HTMLElement;
      const tag = el.tagName.toUpperCase();

      // Native ExternalHyperlink for <a> tags
      if (tag === 'A') {
        let href = el.getAttribute('href') || '';
        href = href.replace(/\$=?\d+\$?|\$=[^$\s]+|\$/g, '').trim();
        let linkText = el.textContent || href;
        linkText = linkText.replace(/\$=?\d+\$?|\$=[^$\s]+|\$/g, '').trim();

        if (href && (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:'))) {
          runs.push(
            new ExternalHyperlink({
              children: [
                new TextRun({
                  text: linkText || href,
                  font: fontFamily,
                  size: baseSize,
                  color: '0563C1',
                  underline: {},
                }),
              ],
              link: href,
            })
          );
          return;
        } else if (linkText) {
          runs.push(
            new TextRun({
              text: linkText,
              font: fontFamily,
              size: baseSize,
              color: state.color,
            })
          );
          return;
        }
      }

      // Line breaks <br>
      if (tag === 'BR') {
        runs.push(new TextRun({ text: '', break: 1 }));
        return;
      }

      // Check if it's KaTeX formula
      if (el.classList.contains('katex') || el.classList.contains('katex-display')) {
        const annotation = el.querySelector('annotation[encoding="application/x-tex"]');
        const mathText = annotation ? annotation.textContent?.trim() : el.innerText.trim();
        if (mathText) {
          runs.push(
            new TextRun({
              text: ` ${mathText} `,
              font: 'Cambria Math',
              italics: true,
              size: baseSize,
              color: '1E3A8A',
            })
          );
        }
        return;
      }

      const nextState = { ...state };
      if (tag === 'STRONG' || tag === 'B') nextState.bold = true;
      if (tag === 'EM' || tag === 'I') nextState.italics = true;
      if (tag === 'U') nextState.underline = true;
      if (tag === 'CODE') {
        nextState.font = 'Courier New';
      }

      current.childNodes.forEach(child => traverse(child, nextState));
    }
  };

  node.childNodes.forEach(child => traverse(child, inherited));

  if (runs.length === 0 && node.textContent?.trim()) {
    const cleanText = node.textContent.trim().replace(/\$=?\d+\$?|\$=[0-9a-zA-Z_]+/g, '');
    if (cleanText) {
      runs.push(
        new TextRun({
          text: cleanText,
          font: fontFamily,
          size: baseSize,
          bold: inherited.bold,
          italics: inherited.italics,
        })
      );
    }
  }

  return runs;
}

/**
 * Converts table DOM node to docx Table
 */
function parseTableToDocx(tableEl: HTMLElement, fontFamily: string, baseSize: number): Table {
  const rows: TableRow[] = [];
  const trElements = tableEl.querySelectorAll('tr');

  trElements.forEach((tr, rowIdx) => {
    const cells: TableCell[] = [];
    const cellElements = tr.querySelectorAll('th, td');

    cellElements.forEach(cell => {
      const isHeader = cell.tagName === 'TH' || rowIdx === 0;
      const runs = parseInlineRuns(cell, fontFamily, Math.max(16, baseSize - 2), {
        bold: isHeader,
      });

      cells.push(
        new TableCell({
          children: [
            new Paragraph({
              children: runs.length > 0 ? runs : [new TextRun({ text: ' ', size: baseSize - 2 })],
              spacing: { before: 80, after: 80 },
            }),
          ],
          borders: {
            top: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
            bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
            left: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
            right: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
          },
          shading: isHeader ? { fill: 'F3F4F6' } : undefined,
        })
      );
    });

    if (cells.length > 0) {
      rows.push(new TableRow({ children: cells }));
    }
  });

  return new Table({
    rows: rows.length > 0 ? rows : [new TableRow({ children: [new TableCell({ children: [] })] })],
    width: { size: 100, type: WidthType.PERCENTAGE },
  });
}

/**
 * Main function to generate docx Blob from parsed LaTeX HTML
 */
export async function generateDocxBlob(
  htmlContent: string,
  options: ExportDocxOptions = {}
): Promise<Blob> {
  const paper = options.paperType || 'letter';
  const font = options.globalFont || 'times';
  const fontFamily = getFontFamily(font);
  const baseSize = getFontSizeHalfPt(options.fontSize || '12pt');
  const dimensions = getPageDimensions(paper);

  // Pre-clean any accidental raw LaTeX commands before parsing to DOM
  let sanitizedHtml = htmlContent || '<p></p>';
  sanitizedHtml = sanitizedHtml.replace(/\\(onehalfspacing|doublespacing|singlespacing|begingroup|endgroup|bgroup|egroup|noindent|indent|centering|raggedright|raggedleft|bigskip|medskip|smallskip|sloppy|fussy|relax|appendix|protect)\b/g, '');
  sanitizedHtml = sanitizedHtml.replace(/\\(label|pagenumbering|pagestyle|thispagestyle|setstretch|linespread|phantom|hphantom|vphantom)\{[^}]*\}/g, '');
  sanitizedHtml = sanitizedHtml.replace(/\\(setcounter|addtocounter)\{[^}]*\}\{[^}]*\}/g, '');
  sanitizedHtml = sanitizedHtml.replace(/\\(apaitem|bibitem|bibentry)\b/g, '');
  sanitizedHtml = sanitizedHtml.replace(/\\hangindent(=|\s)[^\s\\<]+/g, '');
  sanitizedHtml = sanitizedHtml.replace(/\\hangafter(=|\s)[^\s\\<]+/g, '');
  sanitizedHtml = sanitizedHtml.replace(/\$=?\d+\$?|\$=[0-9a-zA-Z_]+/g, '');
  sanitizedHtml = sanitizedHtml.replace(/\\textbf\s*(<[^>]+>)/g, '$1');
  sanitizedHtml = sanitizedHtml.replace(/(<[^>]+>)\s*\\textbf/g, '$1');
  sanitizedHtml = sanitizedHtml.replace(/\\textbf([A-ZÁÉÍÓÚÑa-z0-9_]+)/g, '<strong>$1</strong>');
  sanitizedHtml = sanitizedHtml.replace(/\\textbf\s+([^\n\\<{}]+)/g, '<strong>$1</strong>');
  sanitizedHtml = sanitizedHtml.replace(/\\(textbf|bfseries)\b/g, '');
  sanitizedHtml = sanitizedHtml.replace(/\\(textit|itshape)\b/g, '');
  sanitizedHtml = sanitizedHtml.replace(/\\(underline)\b/g, '');

  const parser = new DOMParser();
  const doc = parser.parseFromString(sanitizedHtml, 'text/html');

  const children: (Paragraph | Table)[] = [];
  let inBibliographySection = false;

  const processBlock = (el: HTMLElement) => {
    const tag = el.tagName.toUpperCase();

    // Container DIVs that contain child block elements (e.g. .latex-header with h1, div, etc.)
    if (tag === 'DIV' && el.querySelector('h1, h2, h3, h4, p, table, ul, ol, blockquote, hr, .latex-math-display')) {
      el.childNodes.forEach(child => {
        if (child.nodeType === Node.ELEMENT_NODE) {
          processBlock(child as HTMLElement);
        }
      });
      return;
    }

    // Determine alignment from classes or inline styles
    let alignment: (typeof AlignmentType)[keyof typeof AlignmentType] = AlignmentType.BOTH; // standard academic justify
    if (
      el.classList.contains('text-center') ||
      el.classList.contains('latex-header') ||
      el.style.textAlign === 'center'
    ) {
      alignment = AlignmentType.CENTER;
    } else if (
      el.classList.contains('text-right') ||
      el.style.textAlign === 'right'
    ) {
      alignment = AlignmentType.RIGHT;
    } else if (
      el.classList.contains('text-left') ||
      el.style.textAlign === 'left'
    ) {
      alignment = AlignmentType.LEFT;
    }

    // Headings
    if (tag === 'H1' || tag === 'H2' || tag === 'H3') {
      const headingText = (el.textContent || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (headingText.includes('referencia') || headingText.includes('bibliograf') || headingText.includes('references')) {
        inBibliographySection = true;
      } else {
        inBibliographySection = false;
      }
    }

    if (tag === 'H1') {
      const runs = parseInlineRuns(el, fontFamily, 32, { bold: true });
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          alignment,
          children: runs,
          spacing: { before: 280, after: 120 },
        })
      );
      return;
    }

    if (tag === 'H2') {
      const runs = parseInlineRuns(el, fontFamily, 28, { bold: true });
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          alignment,
          children: runs,
          spacing: { before: 220, after: 100 },
        })
      );
      return;
    }

    if (tag === 'H3') {
      const runs = parseInlineRuns(el, fontFamily, 24, { bold: true });
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_3,
          alignment,
          children: runs,
          spacing: { before: 180, after: 80 },
        })
      );
      return;
    }

    // Tables
    if (tag === 'TABLE') {
      children.push(parseTableToDocx(el, fontFamily, baseSize));
      children.push(new Paragraph({ spacing: { after: 140 } }));
      return;
    }

    // Lists (Itemize / Enumerate)
    if (tag === 'UL' || tag === 'OL') {
      const items = el.querySelectorAll('li');
      items.forEach((li, idx) => {
        const runs = parseInlineRuns(li, fontFamily, baseSize);
        children.push(
          new Paragraph({
            children: tag === 'OL'
              ? [new TextRun({ text: `${idx + 1}. `, bold: true, size: baseSize, font: fontFamily }), ...runs]
              : runs,
            bullet: tag === 'UL' ? { level: 0 } : undefined,
            spacing: { before: 60, after: 60 },
          })
        );
      });
      return;
    }

    // Horizontal Rule (hrule)
    if (tag === 'HR') {
      children.push(
        new Paragraph({
          border: {
            bottom: { color: '4B5563', space: 2, style: BorderStyle.SINGLE, size: 8 },
          },
          spacing: { before: 120, after: 140 },
        })
      );
      return;
    }

    // Display Math Block
    if (el.classList.contains('latex-math-display')) {
      const annotation = el.querySelector('annotation[encoding="application/x-tex"]');
      const mathText = annotation ? annotation.textContent?.trim() : el.innerText.trim();
      if (mathText) {
        children.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: mathText,
                font: 'Cambria Math',
                italics: true,
                size: baseSize + 2,
                color: '1E3A8A',
              }),
            ],
            spacing: { before: 180, after: 180 },
          })
        );
      }
      return;
    }

    // Standard Paragraph or leaf DIV (like centered blocks or bibliography items)
    const isBibItem =
      el.classList.contains('latex-bib-item') ||
      el.classList.contains('latex-hanging-indent') ||
      (el.closest && el.closest('.latex-bibliography') !== null) ||
      (el.parentElement && el.parentElement.classList.contains('latex-bibliography')) ||
      inBibliographySection;

    const runs = parseInlineRuns(el, fontFamily, baseSize);
    if (runs.length > 0) {
      children.push(
        new Paragraph({
          children: runs,
          alignment: isBibItem ? AlignmentType.LEFT : alignment,
          indent: isBibItem
            ? { left: 720, hanging: 720 }
            : undefined,
          spacing: { before: isBibItem ? 80 : 80, after: 120, line: 360 }, // 1.5 line spacing
        })
      );
    }
  };

  // Iterate top-level DOM nodes in body
  doc.body.childNodes.forEach(node => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      processBlock(node as HTMLElement);
    }
  });

  // Fallback if empty
  if (children.length === 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Documento generado con NewTexPDF',
            font: fontFamily,
            size: baseSize,
            italics: true,
            color: '6B7280',
          }),
        ],
      })
    );
  }

  const wordDoc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              width: dimensions.width,
              height: dimensions.height,
            },
            margin: {
              top: 1417, // 2.5cm
              bottom: 1417,
              left: 1417,
              right: 1417,
            },
          },
        },
        children,
      },
    ],
  });

  return await Packer.toBlob(wordDoc);
}

/**
 * Triggers native browser download for the .docx file
 */
export async function exportDocumentToWord(
  htmlContent: string,
  options: ExportDocxOptions = {}
): Promise<void> {
  const blob = await generateDocxBlob(htmlContent, options);
  const rawName = options.filename ? options.filename.trim() : 'documento';
  const safeName = (rawName.toLowerCase().endsWith('.docx') ? rawName : `${rawName}.docx`)
    .replace(/[^a-zA-Z0-9_\-.]/g, '_');

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = safeName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

