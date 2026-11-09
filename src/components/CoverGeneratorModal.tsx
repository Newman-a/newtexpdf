import React, { useState, useRef } from 'react';
import {
  X,
  Download,
  Eye,
  Plus,
  Trash2,
  Upload,
  Image as ImageIcon,
  Check,
  Copy,
  ExternalLink,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { Button } from './ui/button';
import {
  CoverData,
  CoverPaperType,
  StudentAuthor,
  DEFAULT_MEMBRETE,
  DOCENTE_ROLE_OPTIONS,
  DOCENTE_TITLE_OPTIONS,
  AUTHOR_ROLE_OPTIONS,
  MONTH_OPTIONS,
  downloadCoverPdf,
  getCoverPdfBlobUrl,
  generateCoverLatexCode,
} from '@/lib/coverPdfGenerator';

interface CoverGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPaperType?: CoverPaperType;
}

export const CoverGeneratorModal: React.FC<CoverGeneratorModalProps> = ({
  isOpen,
  onClose,
  initialPaperType = 'letter',
}) => {
  const currentYear = new Date().getFullYear().toString();
  const currentMonthIdx = new Date().getMonth();
  const currentMonthName = MONTH_OPTIONS[currentMonthIdx] || 'Noviembre';

  const [activeTab, setActiveTab] = useState<'form' | 'preview'>('form');
  const [copiedLatex, setCopiedLatex] = useState(false);

  // Form State
  const [paperType, setPaperType] = useState<CoverPaperType>(initialPaperType);
  const [fontFamily, setFontFamily] = useState<'times' | 'helvetica'>('times');
  const [logoLeft, setLogoLeft] = useState<string | null>(null);
  const [logoRight, setLogoRight] = useState<string | null>(null);
  const [membrete, setMembrete] = useState<string>(DEFAULT_MEMBRETE);
  const [title, setTitle] = useState<string>('INFORME DE PRÁCTICA PROFESIONAL');
  const [subtitle, setSubtitle] = useState<string>('Cátedra: Proyecto de Ingeniería de Sistemas');
  const [docenteRole, setDocenteRole] = useState<string>('DOCENTE:');
  const [docenteTitle, setDocenteTitle] = useState<string>('Ing.');
  const [docenteName, setDocenteName] = useState<string>('Carlos Mendoza');
  const [authorRole, setAuthorRole] = useState<string>('REALIZADO POR:');
  const [authors, setAuthors] = useState<StudentAuthor[]>([
    { id: '1', name: 'Newman Acosta', cedula: 'C.I. V-28.123.456' },
  ]);
  const [city, setCity] = useState<string>('');
  const [month, setMonth] = useState<string>(currentMonthName);
  const [year, setYear] = useState<string>(currentYear);

  const fileInputLeftRef = useRef<HTMLInputElement>(null);
  const fileInputRightRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const coverData: CoverData = {
    paperType,
    fontFamily,
    logoLeft,
    logoRight,
    membrete,
    title,
    subtitle,
    docenteRole,
    docenteTitle,
    docenteName,
    authorRole,
    authors,
    city,
    month,
    year,
  };

  const handleAddAuthor = () => {
    setAuthors(prev => [
      ...prev,
      { id: Date.now().toString(), name: '', cedula: '' },
    ]);
  };

  const handleRemoveAuthor = (id: string) => {
    if (authors.length <= 1) return;
    setAuthors(prev => prev.filter(a => a.id !== id));
  };

  const handleUpdateAuthor = (id: string, field: 'name' | 'cedula', val: string) => {
    setAuthors(prev =>
      prev.map(a => (a.id === id ? { ...a, [field]: val } : a))
    );
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>, side: 'left' | 'right') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (side === 'left') setLogoLeft(result);
      else setLogoRight(result);
    };
    reader.readAsDataURL(file);
  };

  const handleDownload = () => {
    const safeTitle = (title.trim() || 'portada').toLowerCase().replace(/[^a-z0-9]/gi, '_').substring(0, 30);
    downloadCoverPdf(coverData, `portada_${safeTitle}.pdf`);
  };

  const handleOpenNewTab = () => {
    const url = getCoverPdfBlobUrl(coverData);
    window.open(url, '_blank');
  };

  const handleCopyLatex = async () => {
    const tex = generateCoverLatexCode(coverData);
    try {
      await navigator.clipboard.writeText(tex);
      setCopiedLatex(true);
      setTimeout(() => setCopiedLatex(false), 2000);
    } catch {
      console.error('No se pudo copiar el código LaTeX');
    }
  };

  // Aspect ratio styling for realistic sheet preview
  const paperAspect = paperType === 'legal' ? 'aspect-[8.5/14]' : paperType === 'a4' ? 'aspect-[210/297]' : 'aspect-[8.5/11]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[92vh] flex flex-col bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden text-slate-900 dark:text-zinc-100">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-950/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-sm shadow-emerald-600/30">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-white">
                Generador de Portada Universitaria (PDF)
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 hidden sm:block">
                Crea una portada institucional oficial lista para imprimir o anexar a tu trabajo
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile View Toggle */}
            <div className="flex lg:hidden bg-slate-200 dark:bg-zinc-800 p-0.5 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('form')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  activeTab === 'form'
                    ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400'
                }`}
              >
                Datos
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  activeTab === 'preview'
                    ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400'
                }`}
              >
                Vista Previa
              </button>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 rounded-lg"
              title="Cerrar ventana"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Modal Body: Split Form & Live Preview */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left Column: Form Controls */}
          <div
            className={`w-full lg:w-1/2 h-full overflow-y-auto p-4 sm:p-6 space-y-5 border-r border-slate-200 dark:border-zinc-800 ${
              activeTab === 'form' ? 'block' : 'hidden lg:block'
            }`}
          >
            {/* Paper Type & Typography */}
            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200/80 dark:border-zinc-800">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Formato de Hoja
                </label>
                <select
                  value={paperType}
                  onChange={e => setPaperType(e.target.value as CoverPaperType)}
                  className="w-full text-xs bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-md p-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                >
                  <option value="letter">Carta (Letter - 215.9×279.4 mm)</option>
                  <option value="a4">A4 (210×297 mm)</option>
                  <option value="legal">Oficio (Legal - 215.9×355.6 mm)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Tipografía
                </label>
                <select
                  value={fontFamily}
                  onChange={e => setFontFamily(e.target.value as 'times' | 'helvetica')}
                  className="w-full text-xs bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-md p-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                >
                  <option value="times">Times New Roman (Oficial)</option>
                  <option value="helvetica">Arial / Sans</option>
                </select>
              </div>
            </div>

            {/* Optional Logos Upload (1 or 2 logos) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Logos Institucionales (Opcionales)</span>
                </label>
                <span className="text-[10px] text-slate-400">PNG o JPG sin fondo recomendado</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Logo Left */}
                <div className="border border-dashed border-slate-300 dark:border-zinc-700 rounded-xl p-2.5 text-center bg-slate-50/50 dark:bg-zinc-950/40 relative">
                  <input
                    type="file"
                    ref={fileInputLeftRef}
                    accept="image/*"
                    onChange={e => handleLogoUpload(e, 'left')}
                    className="hidden"
                  />
                  {logoLeft ? (
                    <div className="flex flex-col items-center gap-1.5">
                      <img src={logoLeft} alt="Logo Izquierdo" className="h-12 max-w-full object-contain mx-auto" />
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => fileInputLeftRef.current?.click()}
                          className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Cambiar
                        </button>
                        <span className="text-slate-300">•</span>
                        <button
                          type="button"
                          onClick={() => setLogoLeft(null)}
                          className="text-[10px] text-red-500 hover:underline"
                        >
                          Quitar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputLeftRef.current?.click()}
                      className="w-full flex flex-col items-center justify-center py-2 text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200"
                    >
                      <Upload className="w-4 h-4 mb-1 text-slate-400" />
                      <span className="text-[11px] font-medium">Cargar Logo Izquierdo</span>
                    </button>
                  )}
                </div>

                {/* Logo Right */}
                <div className="border border-dashed border-slate-300 dark:border-zinc-700 rounded-xl p-2.5 text-center bg-slate-50/50 dark:bg-zinc-950/40 relative">
                  <input
                    type="file"
                    ref={fileInputRightRef}
                    accept="image/*"
                    onChange={e => handleLogoUpload(e, 'right')}
                    className="hidden"
                  />
                  {logoRight ? (
                    <div className="flex flex-col items-center gap-1.5">
                      <img src={logoRight} alt="Logo Derecho" className="h-12 max-w-full object-contain mx-auto" />
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => fileInputRightRef.current?.click()}
                          className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Cambiar
                        </button>
                        <span className="text-slate-300">•</span>
                        <button
                          type="button"
                          onClick={() => setLogoRight(null)}
                          className="text-[10px] text-red-500 hover:underline"
                        >
                          Quitar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRightRef.current?.click()}
                      className="w-full flex flex-col items-center justify-center py-2 text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200"
                    >
                      <Upload className="w-4 h-4 mb-1 text-slate-400" />
                      <span className="text-[11px] font-medium">Cargar Logo Derecho</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Membrete de la Universidad */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                  Membrete Institucional (Centrado)
                </label>
                <button
                  type="button"
                  onClick={() => setMembrete(DEFAULT_MEMBRETE)}
                  className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" /> Restaurar plantilla
                </button>
              </div>
              <textarea
                value={membrete}
                onChange={e => setMembrete(e.target.value)}
                rows={4}
                placeholder="Escribe el membrete institucional. Usa saltos de línea para cada nivel..."
                className="w-full text-xs bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed font-serif"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Cada salto de línea quedará centrado en el encabezado de la página.
              </p>
            </div>

            {/* Title & Subtitle */}
            <div className="space-y-2.5">
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200 mb-1">
                  Título de la Actividad (En el medio)
                </label>
                <textarea
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  rows={2}
                  placeholder="Ej: INFORME DE PRÁCTICA PROFESIONAL O ENSAYO CIENTÍFICO"
                  className="w-full text-xs font-bold uppercase bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-serif"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Asignatura / Cátedra o Subtítulo (Opcional)
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={e => setSubtitle(e.target.value)}
                  placeholder="Ej: Cátedra: Algoritmos y Estructura de Datos"
                  className="w-full text-xs bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Docente / Maestro (Left Side) */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200/80 dark:border-zinc-800 space-y-2">
              <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200">
                Datos del Docente (Lado Izquierdo)
              </label>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-500 dark:text-zinc-400 mb-0.5">Etiqueta</label>
                  <select
                    value={docenteRole}
                    onChange={e => setDocenteRole(e.target.value)}
                    className="w-full text-xs bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-md p-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    {DOCENTE_ROLE_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-500 dark:text-zinc-400 mb-0.5">Título / Grado</label>
                  <select
                    value={docenteTitle}
                    onChange={e => setDocenteTitle(e.target.value)}
                    className="w-full text-xs bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-md p-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    {DOCENTE_TITLE_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-500 dark:text-zinc-400 mb-0.5">Nombre y Apellido</label>
                  <input
                    type="text"
                    value={docenteName}
                    onChange={e => setDocenteName(e.target.value)}
                    placeholder="Nombre del Docente"
                    className="w-full text-xs bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-md p-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Autores / Estudiantes (Right Side) */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200/80 dark:border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                  Estudiantes / Autores (Lado Derecho)
                </label>
                <select
                  value={authorRole}
                  onChange={e => setAuthorRole(e.target.value)}
                  className="text-xs bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                >
                  {AUTHOR_ROLE_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                {authors.map((author, index) => (
                  <div key={author.id} className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 w-4 font-mono">{index + 1}.</span>
                    <input
                      type="text"
                      value={author.name}
                      onChange={e => handleUpdateAuthor(author.id, 'name', e.target.value)}
                      placeholder="Nombre y Apellido del Estudiante"
                      className="flex-1 text-xs bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-md p-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <input
                      type="text"
                      value={author.cedula || ''}
                      onChange={e => handleUpdateAuthor(author.id, 'cedula', e.target.value)}
                      placeholder="C.I. V-28.123.456 (opcional)"
                      className="w-32 text-xs bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-md p-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    {authors.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveAuthor(author.id)}
                        className="text-slate-400 hover:text-red-500 p-1 rounded"
                        title="Eliminar estudiante"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddAuthor}
                className="w-full text-xs h-7 border-dashed border-slate-300 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center justify-center gap-1.5 mt-2"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar otro estudiante</span>
              </Button>
            </div>

            {/* Fecha y Ciudad (Pie de Página) */}
            <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200/80 dark:border-zinc-800">
              <div>
                <label className="block text-[10px] text-slate-500 dark:text-zinc-400 mb-0.5">Ciudad (Opcional)</label>
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="Ej: Caracas"
                  className="w-full text-xs bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-md p-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 dark:text-zinc-400 mb-0.5">Mes</label>
                <select
                  value={month}
                  onChange={e => setMonth(e.target.value)}
                  className="w-full text-xs bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-md p-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {MONTH_OPTIONS.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 dark:text-zinc-400 mb-0.5">Año</label>
                <input
                  type="text"
                  value={year}
                  onChange={e => setYear(e.target.value)}
                  placeholder="2026"
                  className="w-full text-xs bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-md p-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Live Visual Sheet Preview */}
          <div
            className={`w-full lg:w-1/2 h-full bg-slate-100 dark:bg-zinc-950 p-3 sm:p-6 flex flex-col items-center justify-center overflow-y-auto ${
              activeTab === 'preview' ? 'flex' : 'hidden lg:flex'
            }`}
          >
            {/* The Realistic Paper Sheet */}
            <div
              className={`w-full max-w-[360px] sm:max-w-[420px] bg-white text-black shadow-2xl rounded-sm p-6 sm:p-8 flex flex-col justify-between border border-slate-200 transition-all ${paperAspect} select-none font-serif`}
              style={{ fontFamily: fontFamily === 'helvetica' ? 'Arial, sans-serif' : '"Times New Roman", Times, serif' }}
            >
              {/* Header: Logos + Membrete */}
              <div className="relative w-full flex items-start justify-between min-h-[64px]">
                {logoLeft && (
                  <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
                    <img src={logoLeft} alt="Logo 1" className="max-h-full max-w-full object-contain" />
                  </div>
                )}

                <div className="flex-1 text-center px-1">
                  {membrete.split('\n').filter(Boolean).map((line, idx) => (
                    <p key={idx} className="text-[8px] sm:text-[9.5px] font-bold leading-tight uppercase tracking-tight text-slate-900">
                      {line.trim()}
                    </p>
                  ))}
                </div>

                {logoRight && (
                  <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
                    <img src={logoRight} alt="Logo 2" className="max-h-full max-w-full object-contain" />
                  </div>
                )}
              </div>

              {/* Middle: Title & Subtitle */}
              <div className="my-auto py-6 text-center">
                <h1 className="text-xs sm:text-sm font-bold uppercase tracking-wide leading-snug text-slate-950 px-2">
                  {title.trim() || 'TÍTULO DE LA ACTIVIDAD'}
                </h1>
                {subtitle && subtitle.trim() && (
                  <p className="text-[9px] sm:text-[10px] text-slate-700 italic mt-2 px-2">
                    {subtitle.trim()}
                  </p>
                )}
              </div>

              {/* Bottom: Docente (Left) & Realizado por (Right) */}
              <div className="w-full flex items-start justify-between pt-4 text-[8px] sm:text-[9.5px] leading-tight">
                {/* Docente */}
                <div className="text-left max-w-[48%]">
                  <p className="font-bold text-slate-900 uppercase">{docenteRole}</p>
                  <p className="text-slate-800 mt-0.5">
                    {docenteTitle && docenteTitle !== 'Sin título' ? `${docenteTitle} ` : ''}
                    {docenteName.trim() || 'Nombre del Docente'}
                  </p>
                </div>

                {/* Realizado por */}
                <div className="text-right max-w-[48%] ml-auto">
                  <p className="font-bold text-slate-900 uppercase">{authorRole}</p>
                  <div className="mt-0.5 space-y-0.5">
                    {authors.map((auth, idx) => (
                      <p key={idx} className="text-slate-800">
                        {auth.name.trim() || 'Nombre del Estudiante'}
                        {auth.cedula && auth.cedula.trim() ? ` (${auth.cedula.trim()})` : ''}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer: Ciudad y Fecha */}
              <div className="text-center pt-6 text-[9px] sm:text-[10px] font-bold text-slate-900">
                {city.trim() ? `${city.trim()}, ` : ''}{month} de {year}
              </div>
            </div>

            <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-3 text-center">
              Previsualización a escala {paperType.toUpperCase()} (vectorial y lista para imprimir en PDF)
            </p>
          </div>
        </div>

        {/* Modal Footer / Action Bar */}
        <div className="px-4 sm:px-6 py-3 border-t border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyLatex}
              className="h-8 px-2.5 text-xs text-slate-700 dark:text-zinc-300 border-slate-300 dark:border-zinc-700 flex items-center gap-1.5 rounded-lg"
              title="Copiar código LaTeX de la portada para pegarlo en tu documento"
            >
              {copiedLatex ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copiedLatex ? 'LaTeX Copiado' : 'Copiar LaTeX'}</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleOpenNewTab}
              className="h-8 px-2.5 text-xs text-slate-700 dark:text-zinc-300 border-slate-300 dark:border-zinc-700 flex items-center gap-1.5 rounded-lg"
              title="Abrir PDF en pestaña para visualizar o imprimir"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ver PDF</span>
            </Button>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={handleDownload}
              className="h-9 px-4 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 flex items-center gap-2 rounded-xl"
            >
              <Download className="w-4 h-4" />
              <span>Descargar Portada PDF</span>
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};
