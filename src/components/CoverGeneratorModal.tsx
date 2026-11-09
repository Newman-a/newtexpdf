import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Download,
  Plus,
  Trash2,
  Upload,
  Check,
  Copy,
  ExternalLink,
  GraduationCap,
  Sparkles,
  RotateCcw,
  Eye,
  Edit3,
  Loader2,
} from 'lucide-react';
import { Button } from './ui/button';
import {
  CoverData,
  CoverPaperType,
  LineSpacingType,
  CoverMargins,
  MARGIN_PRESETS,
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
  const [isDownloading, setIsDownloading] = useState(false);

  // Form State (Default to clean empty fields)
  const [paperType, setPaperType] = useState<CoverPaperType>(initialPaperType);
  const [fontFamily, setFontFamily] = useState<'times' | 'helvetica'>('times');
  const [fontSize, setFontSize] = useState<'10pt' | '11pt' | '12pt'>('11pt');
  const [lineSpacing, setLineSpacing] = useState<LineSpacingType>('1.15');
  const [marginPreset, setMarginPreset] = useState<string>('apa');
  const [margins, setMargins] = useState<CoverMargins>({
    top: 2.5,
    bottom: 2.5,
    left: 2.5,
    right: 2.5,
  });
  const [showCustomMargins, setShowCustomMargins] = useState<boolean>(false);
  const [logoLeft, setLogoLeft] = useState<string | null>(null);
  const [logoRight, setLogoRight] = useState<string | null>(null);
  const [membrete, setMembrete] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [subtitle, setSubtitle] = useState<string>('');
  const [docenteRole, setDocenteRole] = useState<string>('DOCENTE:');
  const [docenteTitle, setDocenteTitle] = useState<string>('Ing.');
  const [docenteName, setDocenteName] = useState<string>('');
  const [authorRole, setAuthorRole] = useState<string>('REALIZADO POR:');
  const [authors, setAuthors] = useState<StudentAuthor[]>([
    { id: '1', name: '', cedula: '' },
  ]);
  const [city, setCity] = useState<string>('');
  const [month, setMonth] = useState<string>(currentMonthName);
  const [year, setYear] = useState<string>(currentYear);

  const fileInputLeftRef = useRef<HTMLInputElement>(null);
  const fileInputRightRef = useRef<HTMLInputElement>(null);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleMarginPresetChange = (presetKey: string) => {
    setMarginPreset(presetKey);
    if (presetKey === 'custom') {
      setShowCustomMargins(true);
    } else if (MARGIN_PRESETS[presetKey]) {
      setMargins({ ...MARGIN_PRESETS[presetKey].margins });
      setShowCustomMargins(false);
    }
  };

  const handleCustomMarginChange = (side: keyof CoverMargins, val: number) => {
    setMarginPreset('custom');
    setMargins(prev => ({ ...prev, [side]: Math.max(0.5, Math.min(val, 8.0)) }));
  };

  const coverData: CoverData = {
    paperType,
    fontFamily,
    fontSize,
    lineSpacing,
    margins,
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
    if (authors.length <= 1) {
      setAuthors([{ id: '1', name: '', cedula: '' }]);
      return;
    }
    setAuthors(prev => prev.filter(a => a.id !== id));
  };

  const handleUpdateAuthor = (id: string, field: 'name' | 'cedula', val: string) => {
    setAuthors(prev => prev.map(a => (a.id === id ? { ...a, [field]: val } : a)));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>, side: 'left' | 'right') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const result = ev.target?.result as string;
      if (side === 'left') setLogoLeft(result);
      else setLogoRight(result);
    };
    reader.readAsDataURL(file);
  };

  const handleClearAll = () => {
    setMembrete('');
    setTitle('');
    setSubtitle('');
    setDocenteName('');
    setAuthors([{ id: '1', name: '', cedula: '' }]);
    setCity('');
    setLogoLeft(null);
    setLogoRight(null);
    setLineSpacing('1.15');
    setMarginPreset('apa');
    setMargins({ top: 2.5, bottom: 2.5, left: 2.5, right: 2.5 });
  };

  const handleDownload = () => {
    setIsDownloading(true);
    try {
      const safeTitle = (title.trim() || 'portada').toLowerCase().replace(/[^a-z0-9]/gi, '_').substring(0, 30);
      downloadCoverPdf(coverData, `portada_${safeTitle}.pdf`);
    } finally {
      setTimeout(() => setIsDownloading(false), 800);
    }
  };

  const handleOpenNewTab = () => {
    const blobUrl = getCoverPdfBlobUrl(coverData);
    window.open(blobUrl, '_blank');
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

  const paperAspect = paperType === 'legal' ? 'aspect-[8.5/14]' : paperType === 'a4' ? 'aspect-[210/297]' : 'aspect-[8.5/11]';
  const fontSizeClass = fontSize === '10pt' ? 'text-[88%]' : fontSize === '12pt' ? 'text-[108%]' : 'text-[100%]';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full h-[100dvh] sm:h-[88vh] sm:max-h-[850px] sm:max-w-4xl flex flex-col bg-white dark:bg-zinc-900 sm:border sm:border-slate-200 dark:sm:border-zinc-800 rounded-none sm:rounded-2xl shadow-2xl overflow-hidden text-slate-800 dark:text-zinc-100">
        
        {/* Modal Top Header (Touch-friendly & clean) */}
        <div className="flex items-center justify-between px-3.5 sm:px-5 py-3 border-b border-slate-100 dark:border-zinc-800 shrink-0 bg-white dark:bg-zinc-900">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 leading-tight">
                Generador de Portada
              </h2>
              <span className="text-[11px] text-slate-400 dark:text-zinc-500 hidden sm:inline">
                Documento académico en PDF listo para imprimir
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-zinc-800"
            title="Cerrar modal (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile Tab Segmented Switcher (Pinned under header on mobile, hidden on desktop) */}
        <div className="lg:hidden px-3.5 py-2 bg-slate-50 dark:bg-zinc-950/70 border-b border-slate-100 dark:border-zinc-800 shrink-0">
          <div className="grid grid-cols-2 p-1 bg-slate-200/70 dark:bg-zinc-800 rounded-xl text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveTab('form')}
              className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'form'
                  ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Formulario</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'preview'
                  ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Vista Previa</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left Column: Form with Mobile-Optimized Inputs */}
          <div
            className={`w-full lg:w-1/2 h-full overflow-y-auto px-4 sm:px-6 py-4 space-y-4 border-r border-slate-100 dark:border-zinc-800 overscroll-contain ${
              activeTab === 'form' ? 'block' : 'hidden lg:block'
            }`}
          >
            {/* 1. Format: Hoja, Tipografía, Tamaño e Interlineado */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-zinc-400 mb-1">
                  Hoja
                </label>
                <select
                  value={paperType}
                  onChange={e => setPaperType(e.target.value as CoverPaperType)}
                  className="w-full text-xs h-10 sm:h-9 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-lg px-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="letter">Carta (Letter)</option>
                  <option value="a4">A4 (210×297)</option>
                  <option value="legal">Oficio (Legal)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-zinc-400 mb-1">
                  Tipografía
                </label>
                <select
                  value={fontFamily}
                  onChange={e => setFontFamily(e.target.value as 'times' | 'helvetica')}
                  className="w-full text-xs h-10 sm:h-9 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-lg px-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="times">Times New Roman</option>
                  <option value="helvetica">Arial (Sans)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-zinc-400 mb-1">
                  Tamaño
                </label>
                <select
                  value={fontSize}
                  onChange={e => setFontSize(e.target.value as '10pt' | '11pt' | '12pt')}
                  className="w-full text-xs h-10 sm:h-9 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-lg px-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer font-medium"
                >
                  <option value="10pt">10 pt</option>
                  <option value="11pt">11 pt</option>
                  <option value="12pt">12 pt</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-zinc-400 mb-1">
                  Interlineado
                </label>
                <select
                  value={lineSpacing}
                  onChange={e => setLineSpacing(e.target.value as LineSpacingType)}
                  className="w-full text-xs h-10 sm:h-9 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-lg px-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer font-medium"
                >
                  <option value="1.0">1.0 (Sencillo)</option>
                  <option value="1.15">1.15 (Estándar)</option>
                  <option value="1.5">1.5 (Espacio y medio)</option>
                  <option value="2.0">2.0 (Doble espacio)</option>
                </select>
              </div>
            </div>

            {/* 2. Márgenes de la Hoja (Personalizables en cm de todos los lados) */}
            <div className="p-2.5 rounded-xl bg-slate-50/70 dark:bg-zinc-800/40 border border-slate-200/60 dark:border-zinc-700/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-600 dark:text-zinc-300">
                  Márgenes de la Hoja (cm)
                </span>
                <select
                  value={marginPreset}
                  onChange={e => handleMarginPresetChange(e.target.value)}
                  className="text-xs h-7 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-md px-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer font-medium"
                >
                  <option value="apa">Normas APA (2.5 cm)</option>
                  <option value="tesis">Tesis (Sup: 4cm, Izq: 4cm, Der: 3cm, Inf: 3cm)</option>
                  <option value="standard">Estándar (3.0 cm)</option>
                  <option value="compact">Compacto (2.0 cm)</option>
                  <option value="custom">Personalizado...</option>
                </select>
              </div>

              {/* 4 Inputs de márgenes independientes: Superior, Inferior, Izquierdo, Derecho */}
              <div className="grid grid-cols-4 gap-2 pt-0.5">
                <div>
                  <label className="block text-[10px] text-slate-400 dark:text-zinc-500 mb-0.5 text-center">
                    Superior
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      step="0.1"
                      min="1.0"
                      max="6.0"
                      value={margins.top}
                      onChange={e => handleCustomMarginChange('top', parseFloat(e.target.value) || 2.5)}
                      className="w-full text-center text-xs h-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-md pr-4 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                    />
                    <span className="absolute right-1 text-[9px] text-slate-400 pointer-events-none">cm</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 dark:text-zinc-500 mb-0.5 text-center">
                    Inferior
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      step="0.1"
                      min="1.0"
                      max="6.0"
                      value={margins.bottom}
                      onChange={e => handleCustomMarginChange('bottom', parseFloat(e.target.value) || 2.5)}
                      className="w-full text-center text-xs h-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-md pr-4 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                    />
                    <span className="absolute right-1 text-[9px] text-slate-400 pointer-events-none">cm</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 dark:text-zinc-500 mb-0.5 text-center">
                    Izquierdo
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      step="0.1"
                      min="1.0"
                      max="6.0"
                      value={margins.left}
                      onChange={e => handleCustomMarginChange('left', parseFloat(e.target.value) || 2.5)}
                      className="w-full text-center text-xs h-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-md pr-4 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                    />
                    <span className="absolute right-1 text-[9px] text-slate-400 pointer-events-none">cm</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 dark:text-zinc-500 mb-0.5 text-center">
                    Derecho
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      step="0.1"
                      min="1.0"
                      max="6.0"
                      value={margins.right}
                      onChange={e => handleCustomMarginChange('right', parseFloat(e.target.value) || 2.5)}
                      className="w-full text-center text-xs h-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-md pr-4 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                    />
                    <span className="absolute right-1 text-[9px] text-slate-400 pointer-events-none">cm</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Logos (Compact buttons with preview) */}
            <div>
              <span className="block text-[11px] font-medium text-slate-500 dark:text-zinc-400 mb-1.5">
                Logos institucionales (Opcional)
              </span>
              <div className="grid grid-cols-2 gap-2">
                {/* Left Logo */}
                <input
                  type="file"
                  ref={fileInputLeftRef}
                  accept="image/*"
                  onChange={e => handleLogoUpload(e, 'left')}
                  className="hidden"
                />
                {logoLeft ? (
                  <div className="flex items-center justify-between p-2 border border-slate-200 dark:border-zinc-700 rounded-lg bg-slate-50/70 dark:bg-zinc-800/50">
                    <img src={logoLeft} alt="Logo 1" className="h-6 max-w-[65px] object-contain" />
                    <button
                      type="button"
                      onClick={() => setLogoLeft(null)}
                      className="text-[11px] text-slate-400 hover:text-red-500 p-1"
                      title="Quitar logo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputLeftRef.current?.click()}
                    className="flex items-center justify-center gap-1.5 h-10 sm:h-9 text-xs text-slate-600 hover:text-slate-900 dark:text-zinc-300 dark:hover:text-zinc-100 border border-dashed border-slate-200 dark:border-zinc-700 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800/60 transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5 text-slate-400" />
                    <span>Logo Izquierdo</span>
                  </button>
                )}

                {/* Right Logo */}
                <input
                  type="file"
                  ref={fileInputRightRef}
                  accept="image/*"
                  onChange={e => handleLogoUpload(e, 'right')}
                  className="hidden"
                />
                {logoRight ? (
                  <div className="flex items-center justify-between p-2 border border-slate-200 dark:border-zinc-700 rounded-lg bg-slate-50/70 dark:bg-zinc-800/50">
                    <img src={logoRight} alt="Logo 2" className="h-6 max-w-[65px] object-contain" />
                    <button
                      type="button"
                      onClick={() => setLogoRight(null)}
                      className="text-[11px] text-slate-400 hover:text-red-500 p-1"
                      title="Quitar logo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRightRef.current?.click()}
                    className="flex items-center justify-center gap-1.5 h-10 sm:h-9 text-xs text-slate-600 hover:text-slate-900 dark:text-zinc-300 dark:hover:text-zinc-100 border border-dashed border-slate-200 dark:border-zinc-700 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800/60 transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5 text-slate-400" />
                    <span>Logo Derecho</span>
                  </button>
                )}
              </div>
            </div>

            {/* 3. Membrete */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                  Membrete (Centrado en encabezado)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setMembrete(DEFAULT_MEMBRETE)}
                    className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" /> Ejemplo
                  </button>
                  {membrete && (
                    <button
                      type="button"
                      onClick={() => setMembrete('')}
                      className="text-[11px] text-slate-400 hover:text-red-500"
                    >
                      Limpiar
                    </button>
                  )}
                </div>
              </div>
              <textarea
                value={membrete}
                onChange={e => setMembrete(e.target.value)}
                rows={3}
                placeholder="MEMBRETE DE LA UNIVERSIDAD..."
                className="w-full text-sm sm:text-xs bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed font-serif"
              />
            </div>

            {/* 4. Título & Subtítulo */}
            <div className="space-y-2.5">
              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-zinc-400 mb-1">
                  Título de la Actividad (Centrado en el medio)
                </label>
                <textarea
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  rows={2}
                  placeholder="TÍTULO DE LA ACTIVIDAD..."
                  className="w-full text-sm sm:text-xs font-semibold uppercase bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-serif"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-zinc-400 mb-1">
                  Asignatura / Cátedra (Opcional)
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={e => setSubtitle(e.target.value)}
                  placeholder="Ej: Cátedra: Cálculo Diferencial"
                  className="w-full text-sm sm:text-xs h-10 sm:h-9 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-lg px-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* 5. Docente & Autores */}
            <div className="space-y-3">
              {/* Docente */}
              <div>
                <span className="block text-[11px] font-medium text-slate-500 dark:text-zinc-400 mb-1">
                  Docente (Lado izquierdo)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                  <select
                    value={docenteRole}
                    onChange={e => setDocenteRole(e.target.value)}
                    className="text-xs h-10 sm:h-9 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-lg px-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                  >
                    {DOCENTE_ROLE_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>

                  <select
                    value={docenteTitle}
                    onChange={e => setDocenteTitle(e.target.value)}
                    className="text-xs h-10 sm:h-9 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-lg px-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                  >
                    {DOCENTE_TITLE_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>

                  <input
                    type="text"
                    value={docenteName}
                    onChange={e => setDocenteName(e.target.value)}
                    placeholder="Nombre del Docente"
                    className="text-sm sm:text-xs h-10 sm:h-9 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-lg px-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Autores */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                    Estudiantes ({authors.length})
                  </span>
                  <select
                    value={authorRole}
                    onChange={e => setAuthorRole(e.target.value)}
                    className="text-xs bg-transparent text-slate-500 dark:text-zinc-400 border-none p-0 focus:outline-none cursor-pointer"
                  >
                    {AUTHOR_ROLE_OPTIONS.map(opt => (
                      <option key={opt} value={opt} className="dark:bg-zinc-900">{opt}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  {authors.map((author, index) => (
                    <div
                      key={author.id}
                      className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 p-2 rounded-lg bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/60 dark:border-zinc-700/60"
                    >
                      <div className="flex items-center gap-1.5 flex-1">
                        <span className="text-[11px] font-mono text-slate-400 w-3.5 shrink-0 text-center">
                          {index + 1}.
                        </span>
                        <input
                          type="text"
                          value={author.name}
                          onChange={e => handleUpdateAuthor(author.id, 'name', e.target.value)}
                          placeholder="Nombre y Apellido del estudiante"
                          className="w-full text-sm sm:text-xs h-9 sm:h-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-md px-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                      <div className="flex items-center gap-1.5 pl-5 sm:pl-0">
                        <input
                          type="text"
                          value={author.cedula || ''}
                          onChange={e => handleUpdateAuthor(author.id, 'cedula', e.target.value)}
                          placeholder="C.I. (opcional)"
                          className="w-full sm:w-28 text-sm sm:text-xs h-9 sm:h-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-md px-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                        {authors.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveAuthor(author.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 shrink-0 transition-colors"
                            title="Eliminar estudiante"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleAddAuthor}
                  className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-medium py-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Agregar otro estudiante
                </button>
              </div>
            </div>

            {/* 6. Ciudad y Fecha */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-zinc-400 mb-1">
                  Ciudad (Opcional)
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="Ej: Ciudad"
                  className="w-full text-sm sm:text-xs h-10 sm:h-9 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-lg px-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-zinc-400 mb-1">
                  Mes
                </label>
                <select
                  value={month}
                  onChange={e => setMonth(e.target.value)}
                  className="w-full text-xs h-10 sm:h-9 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-lg px-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                >
                  {MONTH_OPTIONS.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-zinc-400 mb-1">
                  Año
                </label>
                <input
                  type="text"
                  value={year}
                  onChange={e => setYear(e.target.value)}
                  placeholder="2026"
                  className="w-full text-sm sm:text-xs h-10 sm:h-9 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-lg px-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                />
              </div>
            </div>

            {/* Reset Fields */}
            <div className="pt-2 pb-2 flex justify-end">
              <button
                type="button"
                onClick={handleClearAll}
                className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Vaciar formulario</span>
              </button>
            </div>
          </div>

          {/* Right Column: Responsive Live Paper Sheet Preview */}
          <div
            className={`w-full lg:w-1/2 h-full bg-slate-100/70 dark:bg-zinc-950/50 p-4 sm:p-6 flex flex-col items-center justify-start sm:justify-center overflow-y-auto overscroll-contain ${
              activeTab === 'preview' ? 'flex' : 'hidden lg:flex'
            }`}
          >
            {/* The Scaled Paper Sheet */}
            <div
              className={`w-full max-w-[320px] xs:max-w-[350px] sm:max-w-[390px] bg-white text-black shadow-xl rounded-sm flex flex-col justify-between border border-slate-200/90 transition-all ${paperAspect} ${fontSizeClass} select-none font-serif`}
              style={{
                fontFamily: fontFamily === 'helvetica' ? 'Arial, sans-serif' : '"Times New Roman", Times, serif',
                paddingTop: `${Math.round((margins.top / 2.5) * 22)}px`,
                paddingBottom: `${Math.round((margins.bottom / 2.5) * 20)}px`,
                paddingLeft: `${Math.round((margins.left / 2.5) * 22)}px`,
                paddingRight: `${Math.round((margins.right / 2.5) * 22)}px`,
                lineHeight: lineSpacing === '2.0' ? '1.8' : lineSpacing === '1.5' ? '1.45' : lineSpacing === '1.0' ? '1.1' : '1.25',
              }}
            >
              {/* Header: Logos + Membrete */}
              <div className="relative w-full flex items-start justify-between min-h-[46px] sm:min-h-[56px] gap-1.5">
                {logoLeft && (
                  <div className="w-8 sm:w-11 h-8 sm:h-11 flex-shrink-0 flex items-center justify-center">
                    <img
                      src={logoLeft}
                      alt="Logo Izquierdo"
                      className="max-h-full max-w-full w-auto h-auto object-contain object-center"
                    />
                  </div>
                )}

                <div className="flex-1 text-center px-1">
                  {membrete.trim() ? (
                    membrete.split('\n').filter(Boolean).map((line, idx) => (
                      <p key={idx} className="text-[7.5px] sm:text-[9px] font-bold leading-tight uppercase tracking-tight text-slate-900">
                        {line.trim()}
                      </p>
                    ))
                  ) : (
                    <div className="py-1 px-2 border border-dashed border-slate-200 rounded text-center">
                      <p className="text-[7.5px] sm:text-[8.5px] text-slate-300 font-bold uppercase tracking-wider">
                        MEMBRETE DE LA UNIVERSIDAD
                      </p>
                    </div>
                  )}
                </div>

                {logoRight && (
                  <div className="w-8 sm:w-11 h-8 sm:h-11 flex-shrink-0 flex items-center justify-center">
                    <img
                      src={logoRight}
                      alt="Logo Derecho"
                      className="max-h-full max-w-full w-auto h-auto object-contain object-center"
                    />
                  </div>
                )}
              </div>

              {/* Middle: Title & Subtitle */}
              <div className="my-auto py-4 sm:py-6 text-center">
                {title.trim() ? (
                  <h1 className="text-xs sm:text-sm font-bold uppercase tracking-wide leading-snug text-slate-950 px-2">
                    {title.trim()}
                  </h1>
                ) : (
                  <div className="py-2 px-3 border border-dashed border-slate-200 rounded text-center">
                    <h1 className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-300">
                      TÍTULO DE LA ACTIVIDAD
                    </h1>
                  </div>
                )}

                {subtitle && subtitle.trim() && (
                  <p className="text-[8.5px] sm:text-[10px] text-slate-600 italic mt-1.5 px-2">
                    {subtitle.trim()}
                  </p>
                )}
              </div>

              {/* Bottom: Docente (Left) & Realizado por (Right) */}
              <div className="w-full flex items-start justify-between pt-2 text-[7.5px] sm:text-[9px] leading-tight">
                {/* Docente */}
                <div className="text-left max-w-[48%]">
                  <p className="font-bold text-slate-900 uppercase">{docenteRole}</p>
                  <p className="text-slate-700 mt-0.5">
                    {docenteName.trim() ? (
                      `${docenteTitle && docenteTitle !== 'Sin título' ? `${docenteTitle} ` : ''}${docenteName.trim()}`
                    ) : (
                      <span className="text-slate-300 italic">[Nombre del Docente]</span>
                    )}
                  </p>
                </div>

                {/* Realizado por */}
                <div className="text-right max-w-[48%] ml-auto">
                  <p className="font-bold text-slate-900 uppercase">{authorRole}</p>
                  <div className="mt-0.5 space-y-0.5">
                    {authors.some(a => a.name.trim()) ? (
                      authors.map((auth, idx) => (
                        auth.name.trim() ? (
                          <p key={idx} className="text-slate-700">
                            {auth.name.trim()}
                            {auth.cedula && auth.cedula.trim() ? ` (${auth.cedula.trim()})` : ''}
                          </p>
                        ) : null
                      ))
                    ) : (
                      <p className="text-slate-300 italic">[Nombre del Estudiante]</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer: Ciudad y Fecha */}
              <div className="text-center pt-4 text-[8px] sm:text-[9.5px] font-bold text-slate-900">
                {city.trim() ? `${city.trim()}, ` : ''}{month} de {year}
              </div>
            </div>

            <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-2.5 text-center">
              {paperType.toUpperCase()} • Margen: {margins.top}cm / {margins.left}cm / {margins.right}cm / {margins.bottom}cm • Interlineado: {lineSpacing}
            </p>

            {/* Quick helper for mobile preview */}
            <div className="flex items-center gap-2 mt-3 lg:hidden">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setActiveTab('form')}
                className="h-8 text-xs text-slate-700 dark:text-zinc-300 rounded-lg flex items-center gap-1.5 shadow-xs"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Volver a editar</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Modal Sticky Bottom Action Bar (Thumb-friendly on mobile) */}
        <div className="px-3.5 sm:px-5 py-2.5 sm:py-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-2 shrink-0 bg-white dark:bg-zinc-900">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyLatex}
              className="h-9 px-2 sm:px-2.5 text-xs text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 border-slate-200 dark:border-zinc-700 flex items-center gap-1.5 rounded-lg"
              title="Copiar código LaTeX"
            >
              {copiedLatex ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copiedLatex ? 'Copiado' : 'Copiar LaTeX'}</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleOpenNewTab}
              className="h-9 px-2 sm:px-2.5 text-xs text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 border-slate-200 dark:border-zinc-700 flex items-center gap-1.5 rounded-lg"
              title="Ver PDF en pestaña"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ver PDF</span>
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="default"
              size="sm"
              disabled={isDownloading}
              onClick={handleDownload}
              className="h-9 sm:h-9 px-4 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Generando...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar PDF</span>
                </>
              )}
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};
