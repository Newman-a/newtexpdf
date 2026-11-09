export interface LatexTemplate {
  id: string;
  name: string;
  description: string;
  code: string;
}

export const LATEX_TEMPLATES: LatexTemplate[] = [
  {
    id: 'una-trabajo-sustitutivo',
    name: 'Examen / Trabajo UNA (Probabilidad)',
    description: 'Carátula oficial, tablas de corrección, Teorema de Bayes y combinatoria (Compilado con Tectonic)',
    code: `\\documentclass[12pt,letterpaper]{article}

\\usepackage{mathptmx}
\\usepackage{geometry}
\\geometry{top=2cm, bottom=2cm, left=2.2cm, right=2.2cm}
\\usepackage[spanish,es-nodecimaldot]{babel}
\\usepackage{amsmath,amssymb}
\\usepackage{booktabs}
\\usepackage{array}
\\usepackage{enumitem}
\\setlist[itemize]{label=--}
\\usepackage{hyperref}

\\hypersetup{
    colorlinks=true,
    linkcolor=black,
    urlcolor=blue,
    citecolor=black
}

\\pagestyle{plain}

\\begin{document}

% =========================================================================
% CARÁTULA OFICIAL
% =========================================================================
\\begin{center}
    {\small Lapso 2026-2 \\hfill Trabajo Sustitutivo de Prueba 1 \\hfill Cód. 737/747--1/4}

    \\vspace{0.8cm}

    {\\large \\textbf{UNIVERSIDAD NACIONAL ABIERTA}} \\\\
    \\textbf{VICERRECTORADO ACADÉMICO} \\\\
    \\textbf{COORDINACIÓN DE EVALUACIÓN ACADÉMICA} \\\\
    \\textbf{ÁREA: MATEMÁTICA}

    \\vspace{0.8cm}

    {\\large \\textbf{INSTRUCTIVO DE TRABAJO SUSTITUTIVO DE PRUEBA}}
\\end{center}

\\vspace{0.4cm}

\\begin{table}[h!]
\\centering
\\small
\\begin{tabular}{|p{7.5cm}|p{7.5cm}|}
\\hline
\\textbf{Asignatura:} & \\textbf{Cód. Asignatura:} \\\\
Introducción a la Probabilidad / Probabilidad & 737 / 747 \\\\ \\hline
\\textbf{Fecha de publicación:} & \\textbf{Fecha tope de entrega al Asesor:} \\\\
Semana 41 / 10-10-2026 & Semana 41 / 10-10-2026 \\\\ \\hline
\\end{tabular}
\\end{table}

\\vspace{0.3cm}

\\begin{center}
    \\textbf{DATOS DEL ESTUDIANTE:}
\\end{center}

\\begin{table}[h!]
\\centering
\\small
\\begin{tabular}{|p{7.5cm}|p{7.5cm}|}
\\hline
\\textbf{Nombre del estudiante:} & \\textbf{Cédula de identidad:} \\\\
Newman Gabriel Acosta Piña & V-12.345.678 \\\\ \\hline
\\textbf{Centro Local:} & \\textbf{Carrera:} \\\\
Caracas & Ingeniería de Sistemas \\\\ \\hline
\\textbf{Número de originales:} & \\textbf{Correo electrónico:} \\\\
1 & gabriel@correo.com \\\\ \\hline
\\end{tabular}
\\end{table}

\\vspace{0.5cm}

\\begin{center}
    \\textbf{RESULTADO DE LA CORRECCIÓN}

    \\vspace{0.2cm}

    \\begin{tabular}{|l|c|c|c|c|}
    \\hline
    \\textbf{Objetivos} & \\textbf{1} & \\textbf{2} & \\textbf{3} & \\textbf{4} \\\\ \\hline
    \\textbf{No logrado: 0 / Logrado: 1} & \\hspace{1cm} & \\hspace{1cm} & \\hspace{1cm} & \\hspace{1cm} \\\\ \\hline
    \\end{tabular}
\\end{center}

\\newpage

\\section*{Objetivo 1: Ecuaciones Combinatorias}

\\subsection*{Resolver la siguiente ecuación: $4C_{19}^{x} = C_{17}^{x}$}

La función combinatoria $C(n, k)$ o $\\binom{n}{k}$ representa las combinaciones simples sin repetición:
\\[C(n, k) = \\binom{n}{k} = \\frac{n!}{k!(n-k)!}, \\quad \\text{con } n, k \\in \\mathbb{N}_0 \\text{ y } 0 \\le k \\le n\\]

Desarrollando los factoriales:
\\[4 \\frac{19!}{x!(19-x)!} = \\frac{17!}{x!(17-x)!}\\]

Simplificando los términos comunes:
\\[4 \\cdot 19 \\cdot 18 = (19-x)(18-x)\\]
\\[1368 = 342 - 37x + x^2 \\implies x^2 - 37x - 1026 = 0\\]

Factorizando o aplicando la resolvente cuadrática:
\\[(x - 54)(x + 19) = 0\\]

\\section*{Objetivo 2: Teorema de Bayes}
Sean tres máquinas $A$, $B$ y $C$ que producen el 45\\%, 30\\% y 25\\% de los artículos de una fábrica:
\\begin{itemize}
    \\item $P(A) = 0.45, \\quad P(D \\mid A) = 0.03$
    \\item $P(B) = 0.30, \\quad P(D \\mid B) = 0.04$
    \\item $P(C) = 0.25, \\quad P(D \\mid C) = 0.05$
\\end{itemize}

Por el Teorema de la Probabilidad Total:
\\[P(D) = P(A)P(D \\mid A) + P(B)P(D \\mid B) + P(C)P(D \\mid C) = 0.0380\\]

Aplicando el Teorema de Bayes para la máquina B:
\\[P(B \\mid D) = \\frac{P(B)P(D \\mid B)}{P(D)} = \\frac{0.0120}{0.0380} = \\frac{6}{19} \\approx 31.58\\%\\]

\\end{document}`,
  },
  {
    id: 'physics-paper',
    name: 'Artículo Científico (Física)',
    description: 'Documento académico con resumen, ecuaciones de campo de Einstein y matrices',
    code: `\\documentclass[11pt,a4paper]{article}
\\usepackage{amsmath}
\\usepackage{amssymb}

\\title{Fundamentos de la Mecánica Cuántica y Relatividad General}
\\author{Dr. Gabriel C. \\\\ Departamento de Física Teórica}
\\date{\\today}

\\begin{document}

\\maketitle

\\begin{abstract}
En este trabajo investigativo se presenta una formulación unificada sobre los principios de conservación
del tensor de energía-momento en presencia de campos gravitacionales intensos. Analizamos las soluciones
de Schwarzschild y exploramos la formulación de la ecuación de onda de Schrödinger relativista acoplada.
\\end{abstract}

\\section{Introducción}
El problema de unificar la relatividad general de Einstein con el marco matemático de la teoría cuántica de campos constituye uno de los desafíos más prominentes de la física contemporánea.

Consideremos la acción gravitatoria de Einstein-Hilbert:
$$S = \\frac{c^4}{16\\pi G} \\int \\left( R - 2\\Lambda \\right) \\sqrt{-g} \\, d^4x + S_m$$

\\section{Ecuaciones de Campo de Einstein}
Las ecuaciones de campo fundamentales se expresan geométricamente mediante la curvatura del espacio-tiempo:

\\begin{equation}
G_{\\mu\\nu} + \\Lambda g_{\\mu\\nu} = \\frac{8\\pi G}{c^4} T_{\\mu\\nu}
\\end{equation}

donde $G_{\\mu\\nu} = R_{\\mu\\nu} - \\frac{1}{2} R g_{\\mu\\nu}$ es el \\textbf{tensor de Einstein}, $\\Lambda$ es la constante cosmológica y $T_{\\mu\\nu}$ es el tensor de energía-impulso.

\\subsection{Conservación Local de Energía}
Debido a las identidades contraídas de Bianchi, la divergencia covariante del tensor métrico se anula idénticamente:
$$\\nabla^\\mu G_{\\mu\\nu} = 0 \\implies \\nabla^\\mu T_{\\mu\\nu} = 0$$

\\begin{theorem}[Teorema de Birkhoff]
Cualquier solución con simetría esférica a las ecuaciones del campo de Einstein en el vacío debe ser estática y asintóticamente plana.
\\end{theorem}

\\section{Formulación Cuántica y Matrices}
En el espacio de Hilbert $\\mathcal{H}$, los observables están representados por operadores autoadjuntos. Las matrices de Pauli vienen dadas por:

\\begin{equation}
\\sigma_x = \\begin{pmatrix} 0 & 1 \\\\ 1 & 0 \\end{pmatrix}, \\quad
\\sigma_y = \\begin{pmatrix} 0 & -i \\\\ i & 0 \\end{pmatrix}, \\quad
\\sigma_z = \\begin{pmatrix} 1 & 0 \\\\ 0 & -1 \\end{pmatrix}
\\end{equation}

\\section{Conclusiones}
La simulación confirma la consistencia tensorial y abre la puerta a análisis más profundos de ondas gravitacionales originadas en fusiones binarias de agujeros negros.

\\end{document}`,
  },
  {
    id: 'calculus-exam',
    name: 'Examen de Cálculo y Álgebra',
    description: 'Evaluación académica con integrales, límites, derivadas y series de Taylor',
    code: `\\documentclass[12pt,letterpaper]{article}
\\title{Evaluación Parcial: Cálculo Multivariable y Series}
\\author{Facultad de Ciencias e Ingeniería}
\\date{Semestre 2026-I}

\\begin{document}

\\maketitle

\\noindent \\textbf{Instrucciones:} Responda con claridad justificando cada paso matemático. Tiempo límite: 90 minutos.

\\section{Problema 1: Integrales Dobles}
Calcule el valor de la integral doble iterada sobre la región acotada $D$:

\\begin{equation}
I = \\iint_D (x^2 + y^2) \\, dA
\\end{equation}

donde $D = \\{ (x,y) \\in \\mathbb{R}^2 : x^2 + y^2 \\le 4, \\, y \\ge 0 \\}$.

\\section{Problema 2: Series de Potencias}
Determine el radio y el intervalo de convergencia de la siguiente serie de potencias:

$$f(x) = \\sum_{n=1}^{\\infty} \\frac{(-1)^{n-1} (x - 2)^n}{n \\cdot 3^n}$$

\\begin{proof}
Aplicando el criterio del cociente o de D'Alembert:
$$L = \\lim_{n \\to \\infty} \\left| \\frac{a_{n+1}}{a_n} \\right| = \\lim_{n \\to \\infty} \\frac{|x - 2|}{3} \\cdot \\frac{n}{n+1} = \\frac{|x - 2|}{3}$$
Para convergencia absoluta, exigimos $L < 1 \\implies |x - 2| < 3$. Por lo tanto, el radio de convergencia es $R = 3$.
\\end{proof}

\\end{document}`,
  },
  {
    id: 'latex-cv',
    name: 'Curriculum Vitae Profesional',
    description: 'Plantilla de hoja de vida / CV elegante con historial laboral y habilidades',
    code: `\\documentclass[11pt,a4paper]{article}
\\usepackage{geometry}
\\geometry{top=1.5cm, bottom=1.5cm, left=1.8cm, right=1.8cm}
\\usepackage{hyperref}

\\pagestyle{empty}

\\begin{document}

\\begin{center}
    {\\LARGE \\textbf{Newman Gabriel Acosta Piña}} \\\\[0.2cm]
    \\small Caracas, Venezuela $\\cdot$ gabriel@ejemplo.com $\\cdot$ +58 412 0000000 \\\\[0.1cm]
    \\url{https://github.com/gabriel} $\\cdot$ \\url{https://linkedin.com/in/gabriel}
\\end{center}

\\vspace{0.3cm}
\\hrule
\\vspace{0.4cm}

\\section*{Perfil Profesional}
Ingeniero de Sistemas con experiencia en desarrollo full-stack moderno, diseño de interfaces responsivas y procesamiento de datos. Especializado en React, TypeScript, Rust, arquitecturas WebAssembly y tipografía científica con LaTeX.

\\section*{Experiencia Laboral}

\\noindent \\textbf{Desarrollador Full Stack Senior} \\hfill \\textit{2024 -- Presente} \\\\
\\textit{Tech Solutions Inc.}
\\begin{itemize}
    \\item Diseño e implementación de plataformas web de alta disponibilidad con React y Tailwind.
    \\item Optimización del rendimiento de renderizado en cliente y exportación de reportes PDF vectoriales.
\\end{itemize}

\\vspace{0.2cm}
\\noindent \\textbf{Ingeniero de Software Frontend} \\hfill \\textit{2022 -- 2024} \\\\
\\textit{DataCorp}
\\begin{itemize}
    \\item Creación de dashboards analíticos en tiempo real y visualización interactiva de métricas.
    \\item Integración de pruebas automatizadas y flujos de integración continua (CI/CD) con GitHub Actions.
\\end{itemize}

\\section*{Educación}

\\noindent \\textbf{Ingeniería de Sistemas} \\hfill \\textit{En curso} \\\\
Universidad Nacional Abierta (UNA)

\\section*{Habilidades Técnicas}
\\begin{itemize}
    \\item \\textbf{Lenguajes:} TypeScript, JavaScript, Python, Rust, C++, LaTeX, SQL.
    \\item \\textbf{Frameworks y Herramientas:} React, Vite, Node.js, Tailwind CSS, shadcn/ui, Git, WebAssembly.
\\end{itemize}

\\end{document}`,
  },
  {
    id: 'formula-cheatsheet',
    name: 'Ficha Resumen de Fórmulas (Cheat Sheet)',
    description: 'Compendio de cálculo, álgebra lineal, probabilidades y física matemática',
    code: `\\documentclass[10pt,a4paper]{article}
\\usepackage{geometry}
\\geometry{top=1.2cm, bottom=1.2cm, left=1.5cm, right=1.5cm}
\\usepackage{amsmath,amssymb}

\\title{\\textbf{Formulario Matemático Esencial}}
\\author{Referencia Rápida}
\\date{\\today}

\\begin{document}

\\maketitle

\\section*{1. Cálculo Diferencial e Integral}
\\begin{itemize}
    \\item \\textbf{Regla de la Cadena:} $\\frac{d}{dx}[f(g(x))] = f'(g(x)) \\cdot g'(x)$
    \\item \\textbf{Integración por Partes:} $\\int u \\, dv = u v - \\int v \\, du$
    \\item \\textbf{Integral de Gauss:} $\\int_{-\\infty}^{\\infty} e^{-x^2} \\, dx = \\sqrt{\\pi}$
    \\item \\textbf{Serie de Taylor:} $f(x) = \\sum_{n=0}^{\\infty} \\frac{f^{(n)}(a)}{n!} (x - a)^n$
\\end{itemize}

\\section*{2. Álgebra Lineal y Matrices}
Para una matriz $2 \\times 2$ invertible $A = \\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$:
\\[\\det(A) = ad - bc, \\qquad A^{-1} = \\frac{1}{ad - bc} \\begin{pmatrix} d & -b \\\\ -c & a \\end{pmatrix}\\]

Ecuación característica de valores propios:
\\[\\det(A - \\lambda I) = 0\\]

\\section*{3. Probabilidad y Estadística}
\\begin{itemize}
    \\item \\textbf{Distribución Normal:} $f(x) = \\frac{1}{\\sigma \\sqrt{2\\pi}} e^{-\\frac{1}{2}\\left(\\frac{x-\\mu}{\\sigma}\\right)^2}$
    \\item \\textbf{Teorema de Bayes:} $P(A_i \\mid B) = \\frac{P(A_i)P(B \\mid A_i)}{\\sum_j P(A_j)P(B \\mid A_j)}$
    \\item \\textbf{Esperanza y Varianza:} $\\mathbb{E}[X] = \\mu, \\quad \\text{Var}(X) = \\mathbb{E}[X^2] - (\\mathbb{E}[X])^2$
\\end{itemize}

\\end{document}`,
  },
  {
    id: 'blank-doc',
    name: 'Documento en Blanco',
    description: 'Estructura mínima limpia para empezar a escribir código LaTeX',
    code: `\\documentclass[11pt,a4paper]{article}

\\title{Mi Documento en LaTeX}
\\author{Gabriel}
\\date{\\today}

\\begin{document}

\\maketitle

\\section{Primera Sección}
Escribe aquí tu texto en \\textbf{LaTeX}.

Puedes escribir fórmulas matemáticas como $E = mc^2$ o en bloque:
\\[
\\int_{-\\infty}^{\\infty} e^{-x^2} \\, dx = \\sqrt{\\pi}
\\]

\\end{document}`,
  },
];
