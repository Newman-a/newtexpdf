import katex from 'katex';

export type PaperType = 'a4' | 'letter' | 'legal';
export type GlobalFont = 'times' | 'arial' | 'modern' | 'palatino';

export interface LatexDocumentMetadata {
  title: string;
  author: string;
  date: string;
  fontSize: string;
  paperType: PaperType;
  globalFont?: GlobalFont;
}

export interface ParseResult {
  html: string;
  metadata: LatexDocumentMetadata;
  errors: string[];
}

/**
 * Renders LaTeX formulas to HTML safely using KaTeX.
 */
function renderMath(mathCode: string, displayMode: boolean): string {
  try {
    return katex.renderToString(mathCode.trim(), {
      displayMode,
      throwOnError: false,
      output: 'html',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return `<span class="text-red-500 font-mono text-xs bg-red-50 p-1 border border-red-200 rounded">[Error matemático: ${message}]</span>`;
  }
}

/**
 * Escapes HTML characters in raw text.
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Parses balanced-brace commands like \textbf{...}, \textit{...}, supporting nested braces and line breaks.
 */
function parseBalancedCommand(
  input: string,
  commandName: string,
  openTag: string,
  closeTag: string
): string {
  const prefix = `\\${commandName}`;
  let result = '';
  let i = 0;

  while (i < input.length) {
    const cmdIdx = input.indexOf(prefix, i);
    if (cmdIdx === -1) {
      result += input.substring(i);
      break;
    }

    result += input.substring(i, cmdIdx);
    let curr = cmdIdx + prefix.length;

    // Optional asterisk: \textbf*{...}
    if (curr < input.length && input[curr] === '*') {
      curr++;
    }

    // Optional whitespace before opening brace
    while (curr < input.length && /\s/.test(input[curr])) {
      curr++;
    }

    if (curr < input.length && input[curr] === '{') {
      let depth = 1;
      let j = curr + 1;
      while (j < input.length && depth > 0) {
        if (input[j] === '\\') {
          j += 2; // skip escaped character
          continue;
        }
        if (input[j] === '{') depth++;
        else if (input[j] === '}') depth--;
        j++;
      }

      if (depth === 0) {
        // Matched balanced { ... }
        const innerContent = input.substring(curr + 1, j - 1);
        result += `${openTag}${parseInlineFormatting(innerContent)}${closeTag}`;
        i = j;
        continue;
      }
    }

    // If not matched with '{', leave prefix and advance to prevent infinite loops
    result += prefix;
    i = cmdIdx + prefix.length;
  }

  return result;
}

/**
 * Parses inline LaTeX formatting like \textbf{}, \textit{}, \texttt{}, etc.
 */
function parseInlineFormatting(text: string): string {
  let result = text;

  // Clean LaTeX preamble & spacing commands that might appear in body
  result = result.replace(/\\noindent\b/g, '');
  result = result.replace(/\\centering\b/g, '');
  result = result.replace(/\\(?:onehalfspacing|doublespacing|singlespacing)\b/g, '');
  result = result.replace(/\\(?:setstretch|linespread)\{[^}]*\}/g, '');
  result = result.replace(/\\(?:bigskip|medskip|smallskip)\b/g, '');
  result = result.replace(/\\(?:indent|raggedright|raggedleft|justifying)\b/g, '');
  result = result.replace(/\\(?:begingroup|endgroup|bgroup|egroup)\b/g, '');
  result = result.replace(/\\label\{[^}]*\}/g, '');
  result = result.replace(/\\pagestyle\{[^}]*\}/g, '');
  result = result.replace(/\\thispagestyle\{[^}]*\}/g, '');
  result = result.replace(/\\pagenumbering\{[^}]*\}/g, '');
  result = result.replace(/\\(?:setcounter|addtocounter)\{[^}]*\}\{[^}]*\}/g, '');
  result = result.replace(/\\stepcounter\{[^}]*\}/g, '');
  result = result.replace(/\\selectlanguage\{[^}]*\}/g, '');
  result = result.replace(/\\foreignlanguage\{[^}]*\}\{([^}]*)\}/g, '$1');
  result = result.replace(/\\(?:phantom|hphantom|vphantom)\{[^}]*\}/g, '');
  result = result.replace(/\\(?:sloppy|fussy|makeatletter|makeatother|protect|relax|appendix)\b/g, '');
  result = result.replace(/\\setlist(?:\[[^\]]*\])?\{[^}]*\}/g, '');
  result = result.replace(/\\hypersetup\{[\s\S]*?\}/g, '');
  result = result.replace(/\\geometry\{[\s\S]*?\}/g, '');
  result = result.replace(/\\setlength\{[^}]*\}\{[^}]*\}/g, '');
  result = result.replace(/\\babelfont\{[^}]*\}\{[^}]*\}/g, '');
  result = result.replace(/\\babelprovide(?:\[[^\]]*\])?\{[^}]*\}/g, '');

  // Vertical and horizontal spacing: \vspace{0.3cm}, \vspace*{...}, \hspace{...}
  result = result.replace(/\\vspace\*?\{([^}]+)\}/g, '<div style="height: $1; min-height: 4px;" class="latex-vspace"></div>');
  result = result.replace(/\\hspace\*?\{([^}]+)\}/g, '<span style="display: inline-block; width: $1;" class="latex-hspace"></span>');
  result = result.replace(/\\hfill\b/g, '<span style="float: right; display: inline-block;"></span>');
  result = result.replace(/\\vfill\b/g, '<div class="my-4"></div>');

  // Balanced brace commands (run FIRST so \textbf{\large ...} doesn't get its braces stripped by fontSizes)
  result = parseBalancedCommand(result, 'textbf', '<strong>', '</strong>');
  result = parseBalancedCommand(result, 'textit', '<em>', '</em>');
  result = parseBalancedCommand(result, 'emph', '<em>', '</em>');
  result = parseBalancedCommand(result, 'underline', '<u>', '</u>');
  result = parseBalancedCommand(result, 'texttt', '<code class="bg-slate-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-xs font-mono">', '</code>');
  result = parseBalancedCommand(result, 'textrm', '<span class="font-serif font-times">', '</span>');
  result = parseBalancedCommand(result, 'textsf', '<span class="font-sans font-arial">', '</span>');
  result = parseBalancedCommand(result, 'textsc', '<span style="font-variant: small-caps;">', '</span>');
  result = parseBalancedCommand(result, 'sout', '<del>', '</del>');
  result = parseBalancedCommand(result, 'st', '<del>', '</del>');

  // Block formatting with curly braces: {\textbf ...}, {\bf ...}, {\bfseries ...}
  result = result.replace(/\{\s*\\(?:textbf|bf|bfseries)\b\s*([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/gi, '<strong>$1</strong>');
  result = result.replace(/\{\s*\\(?:textit|it|itshape|emph)\b\s*([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/gi, '<em>$1</em>');
  result = result.replace(/\{\s*\\(?:underline)\b\s*([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/gi, '<u>$1</u>');
  result = result.replace(/\{\s*\\(?:texttt|tt|ttfamily)\b\s*([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/gi, '<code class="bg-slate-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-xs font-mono">$1</code>');
  result = result.replace(/\{\s*\\(?:textrm|rm|rmfamily)\b\s*([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/gi, '<span class="font-serif font-times">$1</span>');
  result = result.replace(/\{\s*\\(?:textsf|sf|sffamily)\b\s*([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/gi, '<span class="font-sans font-arial">$1</span>');
  result = result.replace(/\{\s*\\(?:textsc|sc|scshape)\b\s*([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/gi, '<span style="font-variant: small-caps;">$1</span>');

  // Font size modifiers in blocks: {\large Text}, {\small Text}, etc.
  const fontSizes: Record<string, string> = {
    tiny: 'font-size: 0.7em;',
    scriptsize: 'font-size: 0.8em;',
    footnotesize: 'font-size: 0.85em;',
    small: 'font-size: 0.9em;',
    normalsize: 'font-size: 1em;',
    large: 'font-size: 1.15em;',
    Large: 'font-size: 1.3em;',
    LARGE: 'font-size: 1.5em;',
    huge: 'font-size: 1.8em;',
    Huge: 'font-size: 2.1em;',
  };

  Object.entries(fontSizes).forEach(([cmd, style]) => {
    // Block pattern: {\large ...}
    const blockRegex = new RegExp(`\\{\\s*\\\\${cmd}\\s*([^{}]*(?:\\{[^{}]*\\}[^{}]*)*)\\}`, 'g');
    result = result.replace(blockRegex, `<span style="${style}">$1</span>`);
    // Standalone: \large
    const standaloneRegex = new RegExp(`\\\\${cmd}\\b`, 'g');
    result = result.replace(standaloneRegex, '');
  });

  // Hyperlinks: \href{url}{text}
  result = result.replace(/\\href\{([^}]+)\}\{([^}]+)\}/g, (_, rawUrl, rawText) => {
    const cleanUrl = rawUrl.replace(/\\([_%$&])/g, '$1').replace(/\$=?\d+\$?|\$=[^$\s]+|\$/g, '').trim();
    const cleanText = rawText.replace(/\$=?\d+\$?|\$=[^$\s]+|\$/g, '').trim();
    return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" class="latex-url text-blue-600 underline">${cleanText}</a>`;
  });
  // \url{url}
  result = result.replace(/\\url\{([^}]+)\}/g, (_, rawUrl) => {
    const cleanUrl = rawUrl.replace(/\\([_%$&])/g, '$1').replace(/\$=?\d+\$?|\$=[^$\s]+|\$/g, '').trim();
    return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" class="latex-url text-blue-600 underline font-mono text-xs break-all">${cleanUrl}</a>`;
  });

  // Clean bibliography & indentation directives from inline text
  result = result.replace(/\\(apaitem|bibitem)\b/g, '');
  result = result.replace(/\\hangindent(=|\s)[^\s\\<]+/g, '');
  result = result.replace(/\\hangafter(=|\s)[^\s\\<]+/g, '');

  // Colors: \textcolor{color}{text}
  result = result.replace(/\\textcolor\{([a-zA-Z0-9#]+)\}\{([^{}]+)\}/g, '<span style="color: $1;">$2</span>');

  // Unbraced commands (e.g. \textbf Word or \textbf Words up to \\ or newline)
  result = result.replace(/\\(?:textbf|bfseries)\s+([^\n\\<{}]+)/g, '<strong>$1</strong>');
  result = result.replace(/\\(?:textit|itshape|emph)\s+([^\n\\<{}]+)/g, '<em>$1</em>');
  result = result.replace(/\\(?:underline)\s+([^\n\\<{}]+)/g, '<u>$1</u>');

  // Handle accidental concatenation like \textbfREPÚBLICA
  result = result.replace(/\\textbf([A-ZÁÉÍÓÚÑa-z0-9_]+)/g, '<strong>$1</strong>');
  result = result.replace(/\\textit([A-ZÁÉÍÓÚÑa-z0-9_]+)/g, '<em>$1</em>');
  result = result.replace(/\\underline([A-ZÁÉÍÓÚÑa-z0-9_]+)/g, '<u>$1</u>');

  // Cleanup any lingering standalone switch commands
  result = result.replace(/\\(?:bfseries|itshape|slshape|scshape|ttfamily|rmfamily|sffamily)\b/g, '');

  // \cite{key} & \ref{key}
  result = result.replace(/\\cite\{([^}]+)\}/g, '<span class="text-blue-600 font-serif text-sm">[$1]</span>');
  result = result.replace(/\\ref\{([^}]+)\}/g, '<span class="text-blue-600 font-serif text-sm font-semibold">$1</span>');

  // Footnote: \footnote{text}
  result = result.replace(/\\footnote\{([^}]+)\}/g, '<sup class="text-xs text-blue-600 cursor-pointer" title="$1">[*]</sup>');

  // LaTeX special characters quotes `` and ''
  result = result.replace(/``/g, '“').replace(/''/g, '”').replace(/`/g, '‘').replace(/'/g, '’');
  // En-dash & Em-dash
  result = result.replace(/---/g, '—').replace(/--/g, '–');

  // Escaped characters: \%, \&, \$, \#, \_, \{, \}
  result = result.replace(/\\%/g, '%');
  result = result.replace(/\\&/g, '&amp;');
  result = result.replace(/\\\$/g, '$');
  result = result.replace(/\\#/g, '#');
  result = result.replace(/\\_/g, '_');
  result = result.replace(/\\\{/g, '{');
  result = result.replace(/\\\}/g, '}');

  // Line breaks with optional spacing: \\[0.3cm] or \\
  result = result.replace(/\\\\(?:\[[^\]]*\])?/g, '<br/>');
  result = result.replace(/\\newline/g, '<br/>');

  return result;
}

/**
 * Main parser that translates a full TeX/LaTeX document or snippet into formatted HTML.
 */
export function parseLatexToHtml(latexCode: string): ParseResult {
  const errors: string[] = [];
  const metadata: LatexDocumentMetadata = {
    title: '',
    author: '',
    date: '',
    fontSize: '11pt',
    paperType: 'a4',
  };

  if (!latexCode || !latexCode.trim()) {
    return { html: '<p class="text-slate-400 italic">Escribe código LaTeX para previsualizar...</p>', metadata, errors };
  }

  // 1. Extraer metadata del preámbulo o cuerpo
  const titleMatch = latexCode.match(/\\title(?:\[[^\]]*\])?\{([\s\S]*?)\}(?=\s*(\\|\n|$))/);
  if (titleMatch) metadata.title = titleMatch[1].trim();

  const authorMatch = latexCode.match(/\\author\{([\s\S]*?)\}(?=\s*(\\|\n|$))/);
  if (authorMatch) metadata.author = authorMatch[1].trim();

  const dateMatch = latexCode.match(/\\date\{([\s\S]*?)\}(?=\s*(\\|\n|$))/);
  if (dateMatch) {
    const rawDate = dateMatch[1].trim();
    if (rawDate === '\\today') {
      metadata.date = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
    } else {
      metadata.date = rawDate;
    }
  }

  // Check paper type or font size in documentclass or geometry
  const docClassMatch = latexCode.match(/\\documentclass\[([^\]]*)\]/);
  if (docClassMatch) {
    const opts = docClassMatch[1].toLowerCase();
    if (opts.includes('legal')) metadata.paperType = 'legal';
    else if (opts.includes('letter')) metadata.paperType = 'letter';
    else if (opts.includes('a4')) metadata.paperType = 'a4';

    if (opts.includes('10pt')) metadata.fontSize = '10pt';
    if (opts.includes('11pt')) metadata.fontSize = '11pt';
    if (opts.includes('12pt')) metadata.fontSize = '12pt';
  }

  // Also check geometry package options
  const geometryMatch = latexCode.match(/\\usepackage\[([^\]]*)\]\{geometry\}/i);
  if (geometryMatch) {
    const opts = geometryMatch[1].toLowerCase();
    if (opts.includes('legal')) metadata.paperType = 'legal';
    else if (opts.includes('letter')) metadata.paperType = 'letter';
    else if (opts.includes('a4')) metadata.paperType = 'a4';
  }

  // Check global font package
  if (latexCode.includes('{mathptmx}') || latexCode.includes('{times}')) {
    metadata.globalFont = 'times';
  } else if (latexCode.includes('{helvet}') || latexCode.includes('\\familydefault}{\\sfdefault}')) {
    metadata.globalFont = 'arial';
  } else if (latexCode.includes('{mathpazo}')) {
    metadata.globalFont = 'palatino';
  } else if (latexCode.includes('{lmodern}')) {
    metadata.globalFont = 'modern';
  }

  // 2. Extraer cuerpo si tiene \begin{document} ... \end{document}
  let bodyContent = latexCode;
  const docMatch = latexCode.match(/\\begin\{document\}([\s\S]*?)\\end\{document\}/);
  if (docMatch) {
    bodyContent = docMatch[1];
  } else {
    // Si no tiene \begin{document}, omitir líneas de preámbulo que comiencen con \documentclass o \usepackage
    const lines = latexCode.split('\n');
    const filteredLines = lines.filter(line => {
      const trimmed = line.trim();
      return !trimmed.startsWith('\\documentclass') &&
             !trimmed.startsWith('\\usepackage') &&
             !trimmed.startsWith('\\title{') &&
             !trimmed.startsWith('\\author{') &&
             !trimmed.startsWith('\\date{');
    });
    bodyContent = filteredLines.join('\n');
  }

  // 3. Remover comentarios de LaTeX (% ... excepto si están escapados \%)
  // Reemplazamos los comentarios de línea completa o al final de línea
  const sanitizedLines = bodyContent.split('\n').map(line => {
    let inEscape = false;
    let commentIdx = -1;
    for (let i = 0; i < line.length; i++) {
      if (line[i] === '\\') {
        inEscape = !inEscape;
      } else if (line[i] === '%' && !inEscape) {
        commentIdx = i;
        break;
      } else {
        inEscape = false;
      }
    }
    return commentIdx !== -1 ? line.slice(0, commentIdx) : line;
  });

  let text = sanitizedLines.join('\n');

  // Pre-clean standalone body-level LaTeX directives so they don't produce orphaned paragraphs
  text = text.replace(/^\s*\\(?:onehalfspacing|doublespacing|singlespacing)\s*$/gm, '');
  text = text.replace(/^\s*\\(?:begingroup|endgroup|bgroup|egroup)\s*$/gm, '');
  text = text.replace(/^\s*\\(?:noindent|indent|centering|raggedright|raggedleft)\s*$/gm, '');
  text = text.replace(/^\s*\\label\{[^}]*\}\s*$/gm, '');

  // Pre-clean broken dollar fragments like $=10393$, $=4169414$, \$, etc.
  text = text.replace(/\\?\$=[0-9a-zA-Z_]+\\?\$?/g, '');
  text = text.replace(/\$=[0-9]+\$?/g, '');

  // 4. Tokenizar y proteger bloques matemáticos y entornos complejos antes de procesar texto
  const mathPlaceholders: { id: string; html: string }[] = [];
  let placeholderCounter = 0;

  function addPlaceholder(html: string): string {
    const id = `___LATEX_BLOCK_${placeholderCounter++}___`;
    mathPlaceholders.push({ id, html });
    return id;
  }

  // Verbatim environments
  text = text.replace(/\\begin\{verbatim\}([\s\S]*?)\\end\{verbatim\}/g, (_, code) => {
    return addPlaceholder(`<pre class="bg-slate-100 dark:bg-slate-800 p-3 rounded font-mono text-xs overflow-x-auto my-3 border border-slate-200 dark:border-slate-700"><code>${escapeHtml(code.trim())}</code></pre>`);
  });

  // Display math: equation, align, gather, etc.
  text = text.replace(/\\begin\{(equation\*?|align\*?|gather\*?|multline\*?)\}([\s\S]*?)\\end\{\1\}/g, (_, envName, math) => {
    const rendered = renderMath(`\\begin{${envName}}${math}\\end{${envName}}`, true);
    return addPlaceholder(`<div class="latex-math-display my-4 flex justify-center">${rendered}</div>`);
  });

  // Display math: $$ ... $$
  text = text.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
    const rendered = renderMath(math, true);
    return addPlaceholder(`<div class="latex-math-display my-4 flex justify-center">${rendered}</div>`);
  });

  // Display math: \[ ... \]
  text = text.replace(/\\\[([\s\S]*?)\\\]/g, (_, math) => {
    const rendered = renderMath(math, true);
    return addPlaceholder(`<div class="latex-math-display my-4 flex justify-center">${rendered}</div>`);
  });

  // Inline math: $ ... $ (cuidando de no matchear con otros caracteres o saltos de línea extremos)
  text = text.replace(/\$([^\$\n]+?)\$/g, (_, math) => {
    const rendered = renderMath(math, false);
    return addPlaceholder(rendered);
  });

  // Inline math: \( ... \)
  text = text.replace(/\\\(([\s\S]*?)\\\)/g, (_, math) => {
    const rendered = renderMath(math, false);
    return addPlaceholder(rendered);
  });

  // Page break: \newpage, \clearpage
  text = text.replace(/\\(newpage|clearpage)/g, () => {
    return addPlaceholder('<div class="html2pdf__page-break" style="page-break-before: always; height: 1px; margin: 2rem 0; border-top: 1px dashed #cbd5e1;"></div>');
  });

  // Maketitle
  text = text.replace(/\\maketitle/g, () => {
    let headerHtml = '<div class="latex-header text-center mb-8">';
    if (metadata.title) {
      headerHtml += `<h1 class="latex-title">${parseInlineFormatting(metadata.title)}</h1>`;
    }
    if (metadata.author) {
      headerHtml += `<div class="latex-author">${parseInlineFormatting(metadata.author)}</div>`;
    }
    if (metadata.date) {
      headerHtml += `<div class="latex-date">${metadata.date}</div>`;
    }
    headerHtml += '</div>';
    return addPlaceholder(headerHtml);
  });

  // Abstract environment
  text = text.replace(/\\begin\{abstract\}([\s\S]*?)\\end\{abstract\}/g, (_, content) => {
    const innerHtml = parseParagraphs(content.trim());
    return addPlaceholder(`
      <div class="latex-abstract border-y border-slate-200 py-3 my-6">
        <div class="latex-abstract-title font-serif font-bold text-center tracking-wide mb-2">RESUMEN / ABSTRACT</div>
        <div class="text-sm italic leading-relaxed text-slate-800">${innerHtml}</div>
      </div>
    `);
  });

  // Theorem & Proof environments
  text = text.replace(/\\begin\{theorem\}(?:\[([^\]]*)\])?([\s\S]*?)\\end\{theorem\}/g, (_, title, body) => {
    const heading = title ? `Teorema (${title})` : 'Teorema';
    return addPlaceholder(`
      <div class="latex-theorem">
        <span class="font-bold">${heading}.</span> ${parseInlineFormatting(body.trim())}
      </div>
    `);
  });

  text = text.replace(/\\begin\{proof\}([\s\S]*?)\\end\{proof\}/g, (_, body) => {
    return addPlaceholder(`
      <div class="latex-proof">
        <span class="font-semibold not-italic">Demostración.</span> ${parseInlineFormatting(body.trim())}
      </div>
    `);
  });

  // Itemize & Enumerate lists
  text = text.replace(/\\begin\{itemize\}([\s\S]*?)\\end\{itemize\}/g, (_, items) => {
    const listItems = parseListItems(items);
    return addPlaceholder(`<ul class="list-disc pl-6 my-3 space-y-1">${listItems}</ul>`);
  });

  text = text.replace(/\\begin\{enumerate\}([\s\S]*?)\\end\{enumerate\}/g, (_, items) => {
    const listItems = parseListItems(items);
    return addPlaceholder(`<ol class="list-decimal pl-6 my-3 space-y-1">${listItems}</ol>`);
  });

  // Figure environment & \includegraphics
  text = text.replace(/\\begin\{figure\}(?:\[[^\]]*\])?([\s\S]*?)\\end\{figure\}/g, (_, figContent) => {
    return addPlaceholder(parseFigure(figContent));
  });

  // Standalone \includegraphics[options]{url}
  text = text.replace(/\\includegraphics(?:\[([^\]]*)\])?\{([^}]+)\}/g, (_, opts, src) => {
    return addPlaceholder(renderImage(src, opts));
  });

  // Horizontal rules: \hrule, \rule{\linewidth}{...}
  text = text.replace(/\\(hrule|rule\{[^\}]*\}\{[^\}]*\})/g, () => {
    return addPlaceholder('<hr class="my-4 border-t border-slate-300 dark:border-slate-700" />');
  });

  // Bibliography environments (both standard thebibliography and apabib)
  text = text.replace(/\\begin\{(?:thebibliography|apabib)\}(?:\{[^}]*\})?([\s\S]*?)\\end\{(?:thebibliography|apabib)\}/g, (_, bibContent) => {
    return addPlaceholder(parseBibliography(bibContent));
  });

  // Tables and Tabular environments (robust parser supporting nested column braces like |p{6.5cm}|p{6.5cm}|)
  text = parseAllTablesAndTabular(text, addPlaceholder);

  // Flushright & Flushleft environments
  text = text.replace(/\\begin\{flushright\}([\s\S]*?)\\end\{flushright\}/g, (_, content) => {
    return addPlaceholder(`<div class="text-right my-3">${parseInlineFormatting(content.trim())}</div>`);
  });
  text = text.replace(/\\begin\{flushleft\}([\s\S]*?)\\end\{flushleft\}/g, (_, content) => {
    return addPlaceholder(`<div class="text-left my-3">${parseInlineFormatting(content.trim())}</div>`);
  });

  // Center environment
  text = text.replace(/\\begin\{center\}([\s\S]*?)\\end\{center\}/g, (_, content) => {
    return addPlaceholder(`<div class="text-center my-3">${parseInlineFormatting(content.trim())}</div>`);
  });

  // Quote environment
  text = text.replace(/\\begin\{quote\}([\s\S]*?)\\end\{quote\}/g, (_, content) => {
    return addPlaceholder(`<blockquote>${parseInlineFormatting(content.trim())}</blockquote>`);
  });

  // Sections, Subsections, Subsubsections
  let sectionCounter = 0;
  let subSectionCounter = 0;

  text = text.replace(/\\section\*?\{([^}]+)\}/g, (_, title) => {
    sectionCounter++;
    subSectionCounter = 0;
    const isUnstarred = !_.includes('*');
    const prefix = isUnstarred ? `${sectionCounter}. ` : '';
    return addPlaceholder(`<h2 class="latex-section text-xl font-bold mt-6 mb-3 border-b pb-1">${prefix}${parseInlineFormatting(title)}</h2>`);
  });

  text = text.replace(/\\subsection\*?\{([^}]+)\}/g, (_, title) => {
    subSectionCounter++;
    const isUnstarred = !_.includes('*');
    const prefix = isUnstarred ? `${sectionCounter}.${subSectionCounter} ` : '';
    return addPlaceholder(`<h3 class="latex-subsection text-lg font-semibold mt-4 mb-2">${prefix}${parseInlineFormatting(title)}</h3>`);
  });

  text = text.replace(/\\subsubsection\*?\{([^}]+)\}/g, (_, title) => {
    return addPlaceholder(`<h4 class="latex-subsubsection text-base font-semibold italic mt-3 mb-1">${parseInlineFormatting(title)}</h4>`);
  });

  text = text.replace(/\\paragraph\*?\{([^}]+)\}/g, (_, title) => {
    return addPlaceholder(`<p class="font-bold inline-block mr-2">${parseInlineFormatting(title)}</p>`);
  });

  // Parse standard paragraphs
  let finalHtml = parseParagraphs(text);

  // Restore placeholders in reverse order
  for (let i = mathPlaceholders.length - 1; i >= 0; i--) {
    const { id, html } = mathPlaceholders[i];
    finalHtml = finalHtml.split(id).join(html);
  }

  return { html: finalHtml, metadata, errors };
}

/**
 * Splits lines by paragraphs and wraps text in <p> tags.
 */
function parseParagraphs(text: string): string {
  const blocks = text.split(/\n\s*\n+/);
  return blocks
    .map(block => {
      let trimmed = block.trim();
      if (!trimmed) return '';
      // If it's already an HTML block or placeholder, don't wrap in <p>
      if (trimmed.startsWith('<h') || trimmed.startsWith('<div') || trimmed.startsWith('<ul') ||
          trimmed.startsWith('<ol') || trimmed.startsWith('<table') || trimmed.startsWith('<pre') ||
          trimmed.startsWith('___LATEX_BLOCK_')) {
        return trimmed;
      }

      // Check for hanging indent commands (\hangindent / \hangafter)
      const isHanging = /\\hangindent\b/.test(trimmed) || /\\hangafter\b/.test(trimmed);
      if (isHanging) {
        trimmed = trimmed
          .replace(/\\hangindent(=|\s)[^\s\\]+/g, '')
          .replace(/\\hangafter(=|\s)[^\s\\]+/g, '')
          .trim();
        return `<p class="latex-bib-item latex-hanging-indent my-2 leading-relaxed" style="text-align: left; padding-left: 2rem; text-indent: -2rem;">${parseInlineFormatting(trimmed)}</p>`;
      }

      return `<p class="my-2 leading-relaxed text-justify">${parseInlineFormatting(trimmed)}</p>`;
    })
    .filter(Boolean)
    .join('\n');
}

/**
 * Parses \item inside list environments, supporting custom labels like \item[a)] or \item[--]
 */
function parseListItems(content: string): string {
  const items = content.split(/\\item\b/);
  return items
    .filter(item => item.trim())
    .map(item => {
      const trimmed = item.trim();
      const customBulletMatch = trimmed.match(/^\[([^\]]+)\]\s*([\s\S]*)$/);
      if (customBulletMatch) {
        const bullet = customBulletMatch[1];
        const body = customBulletMatch[2];
        return `<li class="list-none"><span class="font-semibold mr-2">${parseInlineFormatting(bullet)}</span>${parseInlineFormatting(body)}</li>`;
      }
      return `<li>${parseInlineFormatting(trimmed)}</li>`;
    })
    .join('\n');
}

/**
 * Parses all \begin{table} and \begin{tabular} environments robustly,
 * correctly handling nested braces in column specs such as \begin{tabular}{|p{6.5cm}|p{6.5cm}|}
 */
function parseAllTablesAndTabular(text: string, addPlaceholder: (html: string) => string): string {
  // First, parse \begin{table} ... \end{table}
  const tableMarker = '\\begin{table}';
  let tIdx = text.indexOf(tableMarker);
  while (tIdx !== -1) {
    const startIdx = tIdx;
    let pos = tIdx + tableMarker.length;
    while (pos < text.length && /\s/.test(text[pos])) pos++;
    if (text[pos] === '[') {
      while (pos < text.length && text[pos] !== ']') pos++;
      if (pos < text.length) pos++;
    }

    const endMarker = '\\end{table}';
    const endIdx = text.indexOf(endMarker, pos);
    if (endIdx !== -1) {
      const tableContent = text.substring(pos, endIdx);
      const parsedHtml = parseTableContent(tableContent);
      const placeholder = addPlaceholder(parsedHtml);
      text = text.substring(0, startIdx) + placeholder + text.substring(endIdx + endMarker.length);
      tIdx = text.indexOf(tableMarker, startIdx + placeholder.length);
      continue;
    }
    tIdx = text.indexOf(tableMarker, tIdx + tableMarker.length);
  }

  // Second, parse standalone \begin{tabular} ... \end{tabular}
  const tabularMarker = '\\begin{tabular}';
  let tabIdx = text.indexOf(tabularMarker);
  while (tabIdx !== -1) {
    const startIdx = tabIdx;
    let pos = tabIdx + tabularMarker.length;
    while (pos < text.length && /\s/.test(text[pos])) pos++;

    if (text[pos] === '{') {
      let braceCount = 1;
      const colStart = pos + 1;
      pos++;
      while (pos < text.length && braceCount > 0) {
        if (text[pos] === '{') braceCount++;
        else if (text[pos] === '}') braceCount--;
        pos++;
      }
      const cols = text.substring(colStart, pos - 1);

      const endMarker = '\\end{tabular}';
      const endIdx = text.indexOf(endMarker, pos);
      if (endIdx !== -1) {
        const body = text.substring(pos, endIdx);
        const tableHtml = parseTabular(cols, body);
        const placeholder = addPlaceholder(tableHtml);
        text = text.substring(0, startIdx) + placeholder + text.substring(endIdx + endMarker.length);
        tabIdx = text.indexOf(tabularMarker, startIdx + placeholder.length);
        continue;
      }
    }
    tabIdx = text.indexOf(tabularMarker, tabIdx + tabularMarker.length);
  }

  return text;
}

/**
 * Parses table content (caption + internal tabular).
 */
function parseTableContent(content: string): string {
  let caption = '';
  const captionMatch = content.match(/\\caption\{([^}]+)\}/);
  if (captionMatch) {
    caption = captionMatch[1];
  }

  // Find tabular inside table
  const tabularMarker = '\\begin{tabular}';
  const tabIdx = content.indexOf(tabularMarker);
  let tableHtml = '';

  if (tabIdx !== -1) {
    let pos = tabIdx + tabularMarker.length;
    while (pos < content.length && /\s/.test(content[pos])) pos++;

    if (content[pos] === '{') {
      let braceCount = 1;
      const colStart = pos + 1;
      pos++;
      while (pos < content.length && braceCount > 0) {
        if (content[pos] === '{') braceCount++;
        else if (content[pos] === '}') braceCount--;
        pos++;
      }
      const cols = content.substring(colStart, pos - 1);

      const endMarker = '\\end{tabular}';
      const endIdx = content.indexOf(endMarker, pos);
      if (endIdx !== -1) {
        const body = content.substring(pos, endIdx);
        tableHtml = parseTabular(cols, body);
      }
    }
  }

  return `
    <div class="my-4 text-center">
      ${tableHtml}
      ${caption ? `<div class="text-xs text-slate-500 italic mt-1">Cuadro: ${parseInlineFormatting(caption)}</div>` : ''}
    </div>
  `;
}

/**
 * Parses tabular content into HTML table, supporting \multicolumn, \toprule, \midrule, \bottomrule.
 */
function parseTabular(_cols: string, body: string): string {
  // Clean LaTeX row formatting
  const rows = body
    .split(/\\\\/)
    .map(r => r.trim())
    .filter(Boolean);

  let tableHtml = '<table class="latex-table border border-slate-300 w-full my-4 text-sm">';
  rows.forEach((row, rowIndex) => {
    // Remove standalone rule lines
    if (/^\\(hline|toprule|midrule|bottomrule)\s*$/.test(row.trim())) return;
    const cleanRow = row.replace(/\\(hline|toprule|midrule|bottomrule)\b/g, '').trim();
    if (!cleanRow) return;

    const cells = cleanRow.split('&').map(c => c.trim());
    tableHtml += '<tr>';
    cells.forEach(cell => {
      let content = cell;
      let colspan = 1;

      // Check \multicolumn{n}{align}{content}
      const multicolMatch = content.match(/\\multicolumn\{(\d+)\}\{[^}]*\}\{([\s\S]*)\}/);
      if (multicolMatch) {
        colspan = parseInt(multicolMatch[1], 10);
        content = multicolMatch[2];
      }

      const tag = rowIndex === 0 ? 'th' : 'td';
      const colspanAttr = colspan > 1 ? ` colspan="${colspan}"` : '';
      tableHtml += `<${tag}${colspanAttr} class="border border-slate-300 p-2">${parseInlineFormatting(content)}</${tag}>`;
    });
    tableHtml += '</tr>';
  });
  tableHtml += '</table>';
  return tableHtml;
}

/**
 * Parses figure environment with includegraphics and caption.
 */
function parseFigure(content: string): string {
  let caption = '';
  const captionMatch = content.match(/\\caption\{([^}]+)\}/);
  if (captionMatch) {
    caption = captionMatch[1];
  }

  let imgHtml = '';
  const imgMatch = content.match(/\\includegraphics(?:\[([^\]]*)\])?\{([^}]+)\}/);
  if (imgMatch) {
    imgHtml = renderImage(imgMatch[2], imgMatch[1]);
  }

  return `
    <div class="my-6 text-center">
      ${imgHtml}
      ${caption ? `<div class="text-xs text-slate-500 italic mt-2">Figura: ${parseInlineFormatting(caption)}</div>` : ''}
    </div>
  `;
}

/**
 * Renders an image with optional width styling.
 */
function renderImage(src: string, options?: string): string {
  let style = 'max-width: 100%; height: auto; margin: 0 auto; display: block; border-radius: 4px;';
  if (options) {
    if (options.includes('width=')) {
      const widthMatch = options.match(/width=([0-9.]+(?:%|px|mm|cm|\\linewidth|\\textwidth))/);
      if (widthMatch) {
        let w = widthMatch[1];
        if (w.includes('\\linewidth') || w.includes('\\textwidth')) {
          const factorMatch = options.match(/([0-9.]+)\\(?:linewidth|textwidth)/);
          const factor = factorMatch ? parseFloat(factorMatch[1]) : 1;
          w = `${Math.round(factor * 100)}%`;
        }
        style += ` width: ${w};`;
      }
    }
  }

  return `<img src="${src.trim()}" alt="Figura LaTeX" style="${style}" class="shadow-sm border border-slate-200" />`;
}

/**
 * Parses bibliography items from either \begin{thebibliography} or \begin{apabib},
 * supporting \bibitem, \apaitem, \hangindent, or standard paragraph entries.
 */
function parseBibliography(content: string): string {
  // Pre-clean dollar artifacts & broken fragments
  let cleanContent = content
    .replace(/\\?\$=[0-9a-zA-Z_]+\\?\$?/g, '')
    .replace(/\$=[0-9]+\$?/g, '');

  let items: { key?: string; text: string }[] = [];

  if (cleanContent.includes('\\bibitem') || cleanContent.includes('\\apaitem')) {
    // Split by \bibitem[...] or \bibitem{...} or \apaitem
    const rawTokens = cleanContent.split(/\\(?:bibitem(?:\[[^\]]*\])?\{([^}]*)\}|apaitem\b)/g);
    let currentKey = '';
    for (let i = 0; i < rawTokens.length; i++) {
      const token = rawTokens[i];
      if (token === undefined) continue;
      if (i % 2 === 1) {
        currentKey = token || '';
      } else {
        const trimmed = token.trim();
        if (trimmed) {
          items.push({ key: currentKey, text: trimmed });
          currentKey = '';
        }
      }
    }
  } else {
    // Plain text or standard paragraphs separated by newlines or \par
    const rawParas = cleanContent.split(/\n\s*\n+|\\par\b/);
    rawParas.forEach(p => {
      const trimmed = p.trim();
      if (trimmed) {
        items.push({ text: trimmed });
      }
    });
  }

  let bibHtml = '<div class="latex-bibliography mt-8 border-t pt-4 text-xs text-left" style="text-align: left;">\n' +
    '  <h3 class="latex-bibliography-title font-bold mb-3 text-sm">Referencias</h3>\n' +
    '  <div class="latex-bibliography-list space-y-3">\n';

  items.forEach(item => {
    let itemText = item.text
      .replace(/\\hangindent(=|\s)[^\s\\]+/g, '')
      .replace(/\\hangafter(=|\s)[^\s\\]+/g, '')
      .replace(/\\raggedright\b/g, '')
      .trim();

    if (!itemText) return;

    const keyBadge = item.key ? `<span class="font-semibold text-slate-600 mr-1">[${item.key}]</span> ` : '';
    bibHtml += `    <p class="latex-bib-item leading-relaxed" style="text-align: left; padding-left: 2rem; text-indent: -2rem;">${keyBadge}${parseInlineFormatting(itemText)}</p>\n`;
  });

  bibHtml += '  </div>\n</div>';
  return bibHtml;
}

/**
 * Modifies or inserts paper type in LaTeX documentclass or geometry
 */
export function applyPaperTypeToLatex(code: string, paper: PaperType): string {
  const paperOption = paper === 'a4' ? 'a4paper' : paper === 'legal' ? 'legalpaper' : 'letterpaper';

  let result = code;

  // 1. If \documentclass[...] exists
  if (/\\documentclass\[([^\]]*)\]\{([^}]*)\}/.test(result)) {
    result = result.replace(/\\documentclass\[([^\]]*)\]\{([^}]*)\}/, (_, opts, docType) => {
      let cleanOpts = opts.replace(/\b(a4paper|letterpaper|legalpaper)\b,?/gi, '').trim();
      cleanOpts = cleanOpts.replace(/,(\s*,)+/g, ',').replace(/^,|,$/g, '').trim();
      const newOpts = cleanOpts ? `${cleanOpts}, ${paperOption}` : paperOption;
      return `\\documentclass[${newOpts}]{${docType}}`;
    });
  } else if (/\\documentclass\{([^}]*)\}/.test(result)) {
    result = result.replace(/\\documentclass\{([^}]*)\}/, `\\documentclass[12pt, ${paperOption}]{$1}`);
  }

  // 2. If geometry package exists with paper options
  if (/\\usepackage\[([^\]]*)\]\{geometry\}/.test(result)) {
    result = result.replace(/\\usepackage\[([^\]]*)\]\{geometry\}/, (_, opts) => {
      let cleanOpts = opts.replace(/\b(a4paper|letterpaper|legalpaper)\b,?/gi, '').trim();
      cleanOpts = cleanOpts.replace(/,(\s*,)+/g, ',').replace(/^,|,$/g, '').trim();
      const newOpts = cleanOpts ? `${cleanOpts}, ${paperOption}` : paperOption;
      return `\\usepackage[${newOpts}]{geometry}`;
    });
  }

  return result;
}

/**
 * Applies global document typography package (Times New Roman, Arial, Latin Modern, Palatino)
 */
export function applyFontToLatex(code: string, font: GlobalFont): string {
  // Remove existing font setup
  let cleaned = code
    .replace(/\\usepackage\{mathptmx\}\s*\n?/g, '')
    .replace(/\\usepackage\{times\}\s*\n?/g, '')
    .replace(/\\usepackage\{helvet\}\s*\n?/g, '')
    .replace(/\\usepackage\{lmodern\}\s*\n?/g, '')
    .replace(/\\usepackage\{mathpazo\}\s*\n?/g, '')
    .replace(/\\renewcommand\{\\familydefault\}\{\\sfdefault\}\s*\n?/g, '');

  let snippet = '';
  switch (font) {
    case 'times':
      snippet = '\\usepackage{mathptmx}\n';
      break;
    case 'arial':
      snippet = '\\usepackage{helvet}\n\\renewcommand{\\familydefault}{\\sfdefault}\n';
      break;
    case 'modern':
      snippet = '\\usepackage{lmodern}\n';
      break;
    case 'palatino':
      snippet = '\\usepackage{mathpazo}\n';
      break;
  }

  if (cleaned.includes('\\documentclass')) {
    cleaned = cleaned.replace(/(\\documentclass(?:\[[^\]]*\])?\{[^}]*\}\s*\n)/, `$1${snippet}`);
  } else {
    cleaned = snippet + cleaned;
  }

  return cleaned;
}

/**
 * Modifies or sets the document base font size in \documentclass (10pt, 11pt, 12pt)
 */
export function applyFontSizeToLatex(code: string, size: '10pt' | '11pt' | '12pt'): string {
  let result = code;
  if (/\\documentclass\[([^\]]*)\]\{([^}]*)\}/.test(result)) {
    result = result.replace(/\\documentclass\[([^\]]*)\]\{([^}]*)\}/, (_, opts, docType) => {
      let cleanOpts = opts.replace(/\b(10pt|11pt|12pt)\b,?/gi, '').trim();
      cleanOpts = cleanOpts.replace(/,(\s*,)+/g, ',').replace(/^,|,$/g, '').trim();
      const newOpts = cleanOpts ? `${size}, ${cleanOpts}` : size;
      return `\\documentclass[${newOpts}]{${docType}}`;
    });
  } else if (/\\documentclass\{([^}]*)\}/.test(result)) {
    result = result.replace(/\\documentclass\{([^}]*)\}/, `\\documentclass[${size}]{$1}`);
  }
  return result;
}


