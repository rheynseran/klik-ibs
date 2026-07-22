'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  LogOut, Trash2, Send, User, Stethoscope,
  ClipboardList, AlertTriangle, CheckCircle2, X,
  Calendar, ChevronDown, Plus,
  Baby, MessageSquare, Clock, Activity, UserPlus,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GOOGLE_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbwVeQaCIqrCREkeTMCVW2H7S6W8MPkJ-dz7y6KkR4UKkt1JbvCr99BIOoBP8gmFrnM/exec';

// ============================================================
// TYPES
// ============================================================
interface FormDataType {
  waktuDaftar: string;
  tanggalRencanaOperasi: string;
  jenisOperasi: string;
  kategoriCito: string;
  noRekamMedik: string;
  ruanganAsal: string;
  namaPasien: string;
  jenisKelamin: string;
  umurTahun: string;
  umurBulan: string;
  diagnosaMedis: string;
  rencanaTindakan: string;
  dpjpOperator: string[];
  dpjpLainnya: string;
  dpjpAnestesi: string;
  dpjpAnak: string;
  catatan: string;
}

interface ToastType {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning';
}

interface ValidationErrors {
  [key: string]: string;
}

// ============================================================
// DATA
// ============================================================
const daftarTindakan = [
  'Fakoemulsifikasi (Katarak)', 'Pterygium', 'Trabekulektomi (Glaukoma)',
  'Eviserasi/Enukleasi', 'Injeksi Intravitreal',
  'Odontektomi', 'ORIF Fraktur Mandibula', 'Eksisi Kista Rahang',
  'Frenulektomi', 'Gingivektomi',
  'Gastroskopi', 'Kolonoskopi', 'ERCP', 'Bronkoskopi',
  'Endoskopi THT', 'Polipektomi Endoskopi',
  'Apendektomi Laparoskopi', 'Kolesistektomi Laparoskopi',
  'Hernia Repair Laparoskopi', 'Kistektomi Laparoskopi',
  'Histerektomi Laparoskopi',
  'Kraniotomi', 'VP Shunt', 'Laminektomi', 'Discektomi',
  'Burr Hole', 'Kranioplasti',
  'Laparatomi Eksplorasi', 'Hemoroidektomi', 'Fistula Ani',
  'Kolostomi', 'Reseksi Usus',
  'Apendecktomi Open', 'Herniorrhaphy', 'Kolesistektomi Open',
  'Mastektomi Radikal', 'Biopsi Eksisi Tumor',
  'Eksisi Tumor Jinak/Ganas', 'Limfadenektomi', 'Wide Eksisi',
  'AV Fistula (Cimino)', 'Pemasangan CDL', 'Pemasangan CVC',
  'Embolektomi', 'Vena Varises Surgery', 'Pemasangan Port-A-Cath',
  'Sectio Caesarea (SC)', 'SC + MOW', 'SC + Histerektomi',
  'Histerektomi', 'Kuretase', 'Kistektomi Ovarium', 'Ekstraksi Vakum',
  'WSD (Water Sealed Drainage)', 'Pleurodesis', 'Biopsi Pleura',
  'Torakoskopi (VATS)', 'Torakosentesis',
];

const daftarRuangan = [
  'VK', 'IGD', 'ICU', 'HCU', 'Sasando', 'Kenanga',
  'Kelimutu', 'Cempaka', 'Bougenville', 'Anggrek',
  'Mawar', 'Tulip', 'Dahlia',
];

const dpjpOperatorList: string[] = [
  'dr.Agus,Sp.OG', 'dr.Yuni,Sp.OG', 'dr.Hendriette,Sp.OG',
  'dr.Dewi,Sp.OG', 'dr.Laurens,Sp.OG', 'dr.Bambang,Sp.OG',
  'dr.Donni Argie,Sp.BS', 'dr.Elrick Malelak,Sp.BS',
  'dr.Jean Pello,Sp.B', 'dr.Amrul,Sp.B', 'dr.Alders,Sp.B',
  'dr.Deddy,Sp.B (K)', 'dr.Widhi,Sp.B(K) Digestif',
  'dr.Teguh Dwi Nugroho,Sp.B (K) BVE', 'dr.Iren Lokananta,Sp.BA',
  'dr.Ellen,Sp.BM', 'dr.Steven,Sp.OT',
  'dr.Made,Sp.U', 'dr.Richman,Sp.U',
  'dr.Deif,Sp.An', 'dr.Petrus,Sp.An', 'dr.Budi,Sp.An',
  'dr.Intin,Sp.An', 'dr.Harry,Sp.An',
];

const dokterAnestesiList = [
  'dr.Budi,Sp.An', 'dr.Intin,Sp.An', 'dr.Harry,Sp.An',
  'dr.Petrus,Sp.An', 'dr.Deif,Sp.An', 'Lokal Anestesi',
];

// ============================================================
// ✅ FIX #1 — Lazy initializer: load draft SEBELUM render pertama
//    Tidak pakai useEffect sama sekali untuk load draft
//    Ini menghilangkan cascading setState warning
// ============================================================
function loadInitialFormData(): FormDataType {
  const base: FormDataType = {
    waktuDaftar: new Date().toISOString().slice(0, 16),
    tanggalRencanaOperasi: '',
    jenisOperasi: 'elektif',
    kategoriCito: '',
    noRekamMedik: '',
    ruanganAsal: '',
    namaPasien: '',
    jenisKelamin: 'L',
    umurTahun: '',
    umurBulan: '',
    diagnosaMedis: '',
    rencanaTindakan: '',
    dpjpOperator: [],
    dpjpLainnya: '',
    dpjpAnestesi: '',
    dpjpAnak: '',
    catatan: '',
  };

  // Hanya dijalankan di client (SSR-safe)
  if (typeof window === 'undefined') return base;

  try {
    const saved = localStorage.getItem('formDraftBedah');
    if (saved) {
      const parsed = JSON.parse(saved) as Partial<FormDataType>;
      return {
        ...base,
        ...parsed,
        // ✅ Selalu pakai waktu sekarang, bukan waktu dari draft
        waktuDaftar: new Date().toISOString().slice(0, 16),
      };
    }
  } catch {
    // Jika localStorage gagal, pakai base
  }

  return base;
}

const createFreshForm = (): FormDataType => ({
  waktuDaftar: new Date().toISOString().slice(0, 16),
  tanggalRencanaOperasi: '',
  jenisOperasi: 'elektif',
  kategoriCito: '',
  noRekamMedik: '',
  ruanganAsal: '',
  namaPasien: '',
  jenisKelamin: 'L',
  umurTahun: '',
  umurBulan: '',
  diagnosaMedis: '',
  rencanaTindakan: '',
  dpjpOperator: [],
  dpjpLainnya: '',
  dpjpAnestesi: '',
  dpjpAnak: '',
  catatan: '',
});

// ============================================================
// STYLES
// ============================================================
const inputBase =
  'w-full p-3 bg-white text-slate-900 border rounded-xl focus:ring-2 ' +
  'focus:ring-emerald-500 focus:border-emerald-500 outline-none ' +
  'transition-all duration-200 text-sm';
const inputDefault = `${inputBase} border-slate-300 hover:border-slate-400`;
const inputError = `${inputBase} border-red-400 ring-1 ring-red-200`;

// ============================================================
// HELPER: Transform data sebelum kirim ke Google Sheet
// ============================================================
function buildSubmitData(formData: FormDataType): FormDataType {
  const finalOperator = formData.dpjpOperator.map((doc) => {
    if (doc === 'Lainnya' && formData.dpjpLainnya.trim()) {
      return formData.dpjpLainnya.trim();
    }
    return doc;
  });

  return {
    ...formData,
    dpjpOperator: finalOperator,
  };
}

// ============================================================
// TOAST
// ============================================================
function ToastContainer({ toasts, removeToast }: {
  toasts: ToastType[];
  removeToast: (id: number) => void;
}) {
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div key={t.id}
            initial={{ opacity: 0, x: 80, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className={`pointer-events-auto flex items-center gap-3 px-5 py-4
              rounded-2xl shadow-2xl border backdrop-blur-sm ${
              t.type === 'success'
                ? 'bg-emerald-50/95 border-emerald-200 text-emerald-800'
                : t.type === 'error'
                  ? 'bg-red-50/95 border-red-200 text-red-800'
                  : 'bg-amber-50/95 border-amber-200 text-amber-800'
            }`}>
            {t.type === 'success' && <CheckCircle2 size={22} className="text-emerald-500 shrink-0" />}
            {t.type === 'error' && <X size={22} className="text-red-500 shrink-0" />}
            {t.type === 'warning' && <AlertTriangle size={22} className="text-amber-500 shrink-0" />}
            <span className="text-sm font-semibold flex-1">{t.message}</span>
            <button
              onClick={() => removeToast(t.id)}
              className="text-current opacity-40 hover:opacity-100 transition cursor-pointer"
            >
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ============================================================
// SECTION CARD
// ============================================================
function SectionCard({
  icon: Icon, title, children, variant = 'default',
  collapsible = false, defaultOpen = true, badge,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  variant?: 'default' | 'danger' | 'info';
  collapsible?: boolean;
  defaultOpen?: boolean;
  badge?: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const styles = {
    default: {
      border: 'border-slate-200',
      header: 'bg-gradient-to-r from-slate-50 to-slate-100/80',
      iconBg: 'bg-emerald-100 text-emerald-700',
      titleColor: 'text-slate-800',
    },
    danger: {
      border: 'border-red-200',
      header: 'bg-gradient-to-r from-red-50 to-red-100/80',
      iconBg: 'bg-red-100 text-red-600',
      titleColor: 'text-red-800',
    },
    info: {
      border: 'border-blue-200',
      header: 'bg-gradient-to-r from-blue-50 to-blue-100/80',
      iconBg: 'bg-blue-100 text-blue-600',
      titleColor: 'text-blue-800',
    },
  };
  const s = styles[variant];
  return (
    <div className={`rounded-2xl border ${s.border} shadow-sm overflow-hidden`}>
      <div
        className={`${s.header} px-5 py-3.5 flex items-center justify-between
          ${collapsible ? 'cursor-pointer select-none' : ''}`}
        onClick={() => collapsible && setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${s.iconBg}`}><Icon size={18} /></div>
          <h3 className={`text-sm font-bold uppercase tracking-wide ${s.titleColor}`}>{title}</h3>
          {badge}
        </div>
        {collapsible && (
          <motion.div animate={{ rotate: isOpen ? 0 : -90 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={18} className="text-slate-400" />
          </motion.div>
        )}
      </div>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="p-5 bg-white">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================
// FORM FIELD
// ============================================================
function FormField({
  label, required, error, children, className = '',
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="flex items-center gap-1 text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
        {label}
        {required && <span className="text-red-500 text-sm">*</span>}
      </label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-xs text-red-500 mt-1 font-medium flex items-center gap-1"
          >
            <AlertTriangle size={12} />{error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================
// SUMMARY MODAL
// ============================================================
function SummaryModal({
  isOpen, onClose, onConfirm, data, isSubmitting,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  data: FormDataType;
  isSubmitting: boolean;
}) {
  const fmt = (d: string) => d
    ? new Date(d).toLocaleString('id-ID', {
        day: '2-digit', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : '-';

  // ✅ Tampilkan nama asli, bukan "Lainnya"
  const dokterDisplay = (() => {
    const docs = (data.dpjpOperator ?? []).map((doc) =>
      doc === 'Lainnya' && data.dpjpLainnya?.trim()
        ? data.dpjpLainnya.trim()
        : doc
    );
    return docs.join(', ') || '-';
  })();

  const rows: [string, string][] = [
    ['Waktu Registrasi', fmt(data.waktuDaftar)],
    ['Rencana Operasi',  fmt(data.tanggalRencanaOperasi)],
    ['Jenis Operasi',    data.jenisOperasi?.toUpperCase()],
    ...(data.jenisOperasi === 'cito'
      ? ([['Kategori Cito', data.kategoriCito]] as [string, string][])
      : []),
    ['Nama Pasien',      data.namaPasien],
    ['No. Rekam Medik',  data.noRekamMedik],
    ['Ruangan Asal',     data.ruanganAsal || '-'],
    ['Jenis Kelamin',    data.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'],
    ['Umur',             `${data.umurTahun || '0'} Tahun ${data.umurBulan || '0'} Bulan`],
    ['Diagnosa',         data.diagnosaMedis],
    ['Rencana Tindakan', data.rencanaTindakan],
    ['Dokter Operator',  dokterDisplay],
    ...(data.dpjpAnestesi
      ? ([['Dokter Anestesi', data.dpjpAnestesi]] as [string, string][])
      : []),
    ...(data.dpjpAnak
      ? ([['DPJP Anak', data.dpjpAnak]] as [string, string][])
      : []),
    ...(data.catatan
      ? ([['Catatan', data.catatan]] as [string, string][])
      : []),
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 rounded-t-3xl sticky top-0 z-10">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ClipboardList size={22} /> Konfirmasi Data Pasien
              </h3>
              <p className="text-emerald-100 text-xs mt-1">
                Periksa kembali data sebelum dikirim
              </p>
            </div>

            <div className="p-6 space-y-1">
              {rows.map(([l, v], i) => (
                <div
                  key={i}
                  className={`flex justify-between items-start gap-4 py-2.5
                    border-b border-slate-100 last:border-0 px-2 rounded-lg
                    ${i % 2 === 0 ? 'bg-slate-50/50' : ''}`}
                >
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide shrink-0 w-36">
                    {l}
                  </span>
                  <span className="text-sm font-medium text-slate-800 text-right break-words max-w-[220px]">
                    {v}
                  </span>
                </div>
              ))}
            </div>

            <div className="px-6 pb-6 flex gap-3 sticky bottom-0 bg-white pt-3 border-t border-slate-100">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl border border-slate-300 text-slate-600 font-semibold hover:bg-slate-50 transition cursor-pointer"
              >
                Kembali
              </button>
              <motion.button
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                onClick={onConfirm} disabled={isSubmitting}
                className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Mengirim...
                  </span>
                ) : (
                  <><Send size={18} /> Kirim Data</>
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================================
// DOKTER OPERATOR — MULTI-SELECT AUTOCOMPLETE
// ============================================================
function DokterOperatorSelect({
  selected, onToggle, dpjpLainnya, onLainnyaChange, error,
}: {
  selected: string[];
  onToggle: (doc: string) => void;
  dpjpLainnya: string;
  onLainnyaChange: (val: string) => void;
  error?: string;
}) {
  const [query, setQuery]     = useState('');
  const [focused, setFocused] = useState(false);
  const wrapperRef            = useRef<HTMLDivElement>(null);
  const inputRef              = useRef<HTMLInputElement>(null);
  const isLainnya             = selected.includes('Lainnya');

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const suggestions = dpjpOperatorList.filter((doc) =>
    !selected.includes(doc) &&
    (query.trim() === '' || doc.toLowerCase().includes(query.toLowerCase().trim()))
  );

  const showSuggestions = focused && suggestions.length > 0;
  const selectedCount   = selected.filter(s => s !== 'Lainnya').length;

  const handleSelect = (doc: string) => {
    onToggle(doc);
    setQuery('');
    inputRef.current?.focus();
  };

  return (
    <div className="space-y-3">
      {/* Label + Counter */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-1 text-xs font-bold text-slate-600 uppercase tracking-wider">
          Dokter Operator <span className="text-red-500 text-sm">*</span>
        </label>
        {selectedCount > 0 && (
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200"
          >
            ✓ {selectedCount} dokter dipilih
          </motion.span>
        )}
      </div>

      {/* Input Box */}
      <div ref={wrapperRef} className="relative">
        <div
          className={`flex flex-wrap items-center gap-1.5 p-2.5 bg-white border rounded-xl
            transition-all duration-200 min-h-[48px] cursor-text ${
              error
                ? 'border-red-400 ring-1 ring-red-200'
                : focused
                  ? 'border-emerald-500 ring-2 ring-emerald-500'
                  : 'border-slate-300 hover:border-slate-400'
            }`}
          onClick={() => inputRef.current?.focus()}
        >
          {/* Tag chips dari list */}
          <AnimatePresence mode="popLayout">
            {selected.filter(d => d !== 'Lainnya').map((doc) => (
              <motion.span
                key={doc} layout
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg shrink-0 bg-emerald-100 text-emerald-700"
              >
                {doc}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onToggle(doc); }}
                  className="hover:text-red-500 transition cursor-pointer p-0.5 rounded-full hover:bg-red-50"
                  aria-label={`Hapus ${doc}`}
                >
                  <X size={12} />
                </button>
              </motion.span>
            ))}
          </AnimatePresence>

          {/* Tag chip "Lainnya" — tampilkan nama asli */}
          <AnimatePresence>
            {isLainnya && (
              <motion.span
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg shrink-0 bg-blue-100 text-blue-700"
              >
                {dpjpLainnya?.trim() || 'Dokter Lainnya'}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onToggle('Lainnya'); onLainnyaChange(''); }}
                  className="hover:text-red-500 transition cursor-pointer p-0.5 rounded-full hover:bg-red-50"
                  aria-label="Hapus dokter lainnya"
                >
                  <X size={12} />
                </button>
              </motion.span>
            )}
          </AnimatePresence>

          {/* Text input */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            placeholder={selected.length === 0 ? 'Ketik atau klik untuk pilih dokter...' : 'Tambah dokter lain...'}
            autoComplete="off"
            className="flex-1 min-w-[140px] outline-none text-sm text-slate-900 placeholder:text-slate-400 bg-transparent py-1"
          />

          {/* Clear all */}
          {selected.length > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                // Hapus satu per satu untuk trigger state update
                [...selected].forEach(d => onToggle(d));
                onLainnyaChange('');
                setQuery('');
              }}
              className="text-slate-400 hover:text-red-500 transition cursor-pointer p-1 rounded-full hover:bg-red-50 shrink-0"
              title="Hapus semua dokter"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Suggestion list */}
        <AnimatePresence>
          {showSuggestions && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.12 }}
              className="absolute z-50 w-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl max-h-56 overflow-y-auto"
            >
              {suggestions.map((doc) => (
                <button
                  key={doc}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(doc)}
                  className="w-full text-left px-4 py-3 text-sm text-slate-700
                    hover:bg-emerald-50 hover:text-emerald-800 active:bg-emerald-100
                    transition-colors cursor-pointer flex items-center gap-3
                    border-b border-slate-50 last:border-0"
                >
                  <div className="h-4 w-4 shrink-0 rounded border-2 border-slate-300 bg-white" />
                  <span className="flex-1">{doc}</span>
                </button>
              ))}

              {query.trim() && suggestions.length === 0 && (
                <div className="px-4 py-3 text-sm text-slate-400 text-center">
                  Tidak ditemukan &quot;{query}&quot;
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="text-xs text-red-500 mt-1 font-medium flex items-center gap-1"
            >
              <AlertTriangle size={12} />{error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Tombol "+ Dokter Lainnya" — SELALU TERLIHAT */}
      {!isLainnya && (
        <motion.button
          type="button"
          onClick={() => { onToggle('Lainnya'); setFocused(false); }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-center gap-2 py-3 px-4
            bg-slate-50 hover:bg-blue-50 border-2 border-dashed border-slate-300
            hover:border-blue-400 rounded-xl text-sm font-semibold text-slate-500
            hover:text-blue-600 transition-all cursor-pointer"
        >
          <UserPlus size={16} />
          Dokter Operator Tidak Ada di Daftar? Klik di Sini
        </motion.button>
      )}

      {/* Input manual Lainnya */}
      <AnimatePresence>
        {isLainnya && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Plus size={12} /> Nama Dokter Operator Lainnya
                  <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => { onToggle('Lainnya'); onLainnyaChange(''); }}
                  className="text-xs text-blue-400 hover:text-red-500 transition cursor-pointer flex items-center gap-1"
                >
                  <X size={12} /> Batal
                </button>
              </div>
              <input
                value={dpjpLainnya}
                onChange={(e) => onLainnyaChange(e.target.value)}
                placeholder="Ketik nama lengkap dokter operator..."
                autoComplete="off"
                autoFocus
                className="w-full p-3 bg-white text-slate-900 border border-blue-300
                  rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  outline-none transition-all placeholder:text-blue-300"
              />
              <p className="text-[11px] text-blue-500 flex items-center gap-1">
                <CheckCircle2 size={11} />
                Nama ini akan masuk ke kolom Dokter Operator di Google Sheet
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint */}
      {selected.length === 0 && !error && (
        <p className="text-xs text-slate-400 pl-1">
          Klik kolom di atas untuk melihat daftar. Bisa pilih lebih dari satu dokter.
        </p>
      )}
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function PendaftaranPasienOperasi() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSummary,  setShowSummary]  = useState(false);
  const [toasts,       setToasts]       = useState<ToastType[]>([]);
  const [errors,       setErrors]       = useState<ValidationErrors>({});

  // ✅ FIX #1 — Gunakan lazy initializer, bukan useEffect untuk load draft
  //    loadInitialFormData() dipanggil SEKALI saat komponen mount
  //    Tidak ada setState di dalam useEffect → tidak ada cascading render
  const [formData, setFormData] = useState<FormDataType>(loadInitialFormData);

  // ✅ FIX #2 — Draft loaded indicator: pakai ref untuk cek apakah ada draft
  //    Tidak setState dari useEffect, tapi cukup render sekali
  const hasDraft = useRef<boolean>(false);
  const [showDraftBanner, setShowDraftBanner] = useState(false);

  useEffect(() => {
    // Cek apakah tadi ada draft yang dimuat
    // loadInitialFormData sudah berjalan sebelum ini, jadi kita cukup cek localStorage
    try {
      const saved = localStorage.getItem('formDraftBedah');
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<FormDataType>;
        // Hanya tampilkan banner jika ada data bermakna di draft
        const hasMeaningfulData = parsed.namaPasien || parsed.noRekamMedik || parsed.diagnosaMedis;
        if (hasMeaningfulData) {
          hasDraft.current = true;
          setShowDraftBanner(true);
          // ✅ FIX: Gunakan setTimeout dengan cleanup, bukan setState langsung
          const timer = setTimeout(() => setShowDraftBanner(false), 3000);
          return () => clearTimeout(timer);
        }
      }
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Hanya satu kali saat mount

  // ✅ FIX #3 — Auto-save: debounced, tidak ada masalah
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem('formDraftBedah', JSON.stringify(formData));
      } catch {}
    }, 1000);
    return () => clearTimeout(t);
  }, [formData]);

  // ✅ FIX #4 — Clock update: tidak masalah, ini update eksternal → state
  useEffect(() => {
    const iv = setInterval(() => {
      setFormData(p => ({ ...p, waktuDaftar: new Date().toISOString().slice(0, 16) }));
    }, 60000);
    return () => clearInterval(iv);
  }, []);

  // ── Toast helpers ──────────────────────────────────────────
  const addToast = useCallback((message: string, type: ToastType['type']) => {
    const id = Date.now();
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(p => p.filter(t => t.id !== id));
  }, []);

  // ── Handlers ──────────────────────────────────────────────
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
    if (errors[name]) {
      setErrors(p => { const n = { ...p }; delete n[name]; return n; });
    }
  };

  const handleDokterToggle = (dokter: string) => {
    setFormData(p => {
      const list = p.dpjpOperator ?? [];
      return {
        ...p,
        dpjpOperator: list.includes(dokter)
          ? list.filter(d => d !== dokter)
          : [...list, dokter],
      };
    });
    if (errors.dpjpOperator) setErrors(p => { const n = { ...p }; delete n.dpjpOperator; return n; });
    if (errors.dpjpLainnya)  setErrors(p => { const n = { ...p }; delete n.dpjpLainnya;  return n; });
  };

  // ── Validation ────────────────────────────────────────────
  const validate = (): boolean => {
    const e: ValidationErrors = {};
    if (!formData.namaPasien.trim())      e.namaPasien      = 'Nama pasien wajib diisi';
    if (!formData.noRekamMedik.trim())    e.noRekamMedik    = 'No. Rekam Medik wajib diisi';
    if (!formData.tanggalRencanaOperasi)  e.tanggalRencanaOperasi = 'Tanggal rencana operasi wajib diisi';
    if (!formData.diagnosaMedis.trim())   e.diagnosaMedis   = 'Diagnosa medis wajib diisi';
    if (!formData.rencanaTindakan.trim()) e.rencanaTindakan = 'Rencana tindakan wajib diisi';

    if (formData.jenisOperasi === 'cito' && !formData.kategoriCito)
      e.kategoriCito = 'Kategori Cito wajib diisi';

    if (formData.dpjpOperator.length === 0)
      e.dpjpOperator = 'Pilih minimal satu dokter operator';

    if (formData.dpjpOperator.includes('Lainnya') && !formData.dpjpLainnya.trim())
      e.dpjpLainnya = 'Nama dokter lainnya wajib diisi';

    const isSC =
      formData.rencanaTindakan?.toLowerCase().includes('sectio') ||
      formData.rencanaTindakan?.toLowerCase().includes('sc');
    if (isSC && !formData.dpjpAnak.trim())
      e.dpjpAnak = 'DPJP Anak wajib diisi untuk SC';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) {
      addToast('Mohon lengkapi semua field yang wajib diisi', 'warning');
      return;
    }
    setShowSummary(true);
  };

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    try {
      // ✅ "Lainnya" diganti nama asli sebelum kirim ke Google Sheet
      const submitData = buildSubmitData(formData);

      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      addToast('Data pasien berhasil disimpan!', 'success');
      setFormData(createFreshForm());
      setShowSummary(false);
      localStorage.removeItem('formDraftBedah');
    } catch {
      addToast('Gagal mengirim data. Periksa koneksi internet.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSectio =
    formData.rencanaTindakan?.toLowerCase().includes('sectio') ||
    formData.rencanaTindakan?.toLowerCase().includes('sc');

  const completionCount = [
    formData.namaPasien, formData.noRekamMedik,
    formData.tanggalRencanaOperasi, formData.diagnosaMedis,
    formData.rencanaTindakan,
  ].filter(Boolean).length;
  const completionPercent = Math.round((completionCount / 5) * 100);

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <SummaryModal
        isOpen={showSummary}
        onClose={() => setShowSummary(false)}
        onConfirm={handleConfirmSubmit}
        data={formData}
        isSubmitting={isSubmitting}
      />

      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="min-h-screen w-full bg-gradient-to-br from-emerald-950 via-teal-900 to-green-950 py-6 px-4 sm:px-6"
      >
        <motion.div
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto bg-slate-50/98 backdrop-blur-md rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden"
        >
          {/* ══ HEADER ══ */}
          <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 px-6 sm:px-8 py-5 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -translate-y-20 translate-x-20" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-y-16 -translate-x-16" />
            </div>

            <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-wide flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Activity size={24} className="text-white" />
                </div>
                <div>
                  <span className="block">REGISTRASI PASIEN BEDAH</span>
                  <span className="text-xs font-medium text-emerald-100 tracking-normal">
                    Instalasi Bedah Sentral — RSUD Prof. Dr. W.Z. Johannes Kupang
                  </span>
                </div>
              </h2>

              <div className="flex items-center gap-2">
                <AnimatePresence>
                  {formData.jenisOperasi === 'cito' && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="flex items-center gap-1.5 bg-red-500 text-white px-4 py-2 rounded-xl font-extrabold text-sm shadow-lg shadow-red-500/30 border border-red-400"
                    >
                      <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                        <AlertTriangle size={16} />
                      </motion.div>
                      CITO
                    </motion.div>
                  )}
                </AnimatePresence>
                <button
                  onClick={() => router.push('/')}
                  className="text-white font-bold flex items-center gap-2 bg-white/15 hover:bg-white/25 px-4 py-2.5 rounded-xl transition border border-white/20 cursor-pointer backdrop-blur-sm text-sm"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </div>

            {/* Progress */}
            <div className="relative mt-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-emerald-100">Kelengkapan Data</span>
                <span className="text-xs font-bold text-white">{completionPercent}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${completionPercent}%` }}
                  transition={{ duration: 0.5 }}
                  className={`h-full rounded-full ${
                    completionPercent === 100 ? 'bg-green-300'
                    : completionPercent >= 60  ? 'bg-yellow-300'
                    : 'bg-red-300'
                  }`}
                />
              </div>
            </div>

            {/* ✅ Draft banner */}
            <AnimatePresence>
              {showDraftBanner && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="mt-2 text-xs text-emerald-200 flex items-center gap-1"
                >
                  <CheckCircle2 size={12} /> Draft sebelumnya berhasil dimuat
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ══ FORM ══ */}
          <div className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* 1. Jadwal */}
              <SectionCard
                icon={Calendar} title="Jadwal & Jenis Operasi"
                variant={formData.jenisOperasi === 'cito' ? 'danger' : 'default'}
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FormField label="Tanggal Registrasi" required>
                    <input type="datetime-local" name="waktuDaftar"
                      value={formData.waktuDaftar} onChange={handleChange}
                      className={inputDefault} required />
                  </FormField>
                  <FormField label="Rencana Operasi" required error={errors.tanggalRencanaOperasi}>
                    <input type="datetime-local" name="tanggalRencanaOperasi"
                      value={formData.tanggalRencanaOperasi} onChange={handleChange}
                      className={errors.tanggalRencanaOperasi ? inputError : inputDefault} required />
                  </FormField>
                  <FormField label="Jenis Operasi" required>
                    <select name="jenisOperasi" value={formData.jenisOperasi}
                      onChange={handleChange}
                      className={`${inputDefault} font-bold ${
                        formData.jenisOperasi === 'cito'
                          ? '!border-red-400 !text-red-700 !bg-red-50' : ''
                      }`}>
                      <option value="elektif">⏳ ELEKTIF</option>
                      <option value="cito">🔴 CITO</option>
                    </select>
                  </FormField>
                </div>

                <AnimatePresence>
                  {formData.jenisOperasi === 'cito' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 p-4 bg-red-50 rounded-xl border border-red-200">
                        <FormField label="Kategori Cito" required error={errors.kategoriCito}>
                          <select name="kategoriCito" value={formData.kategoriCito}
                            onChange={handleChange}
                            className={`${errors.kategoriCito ? inputError : inputDefault} !border-red-300`}>
                            <option value="">— Pilih Kategori —</option>
                            <option value="Kategori 1">🔴 Kategori 1</option>
                            <option value="Bukan Kategori 1">🟡 Bukan Kategori 1</option>
                          </select>
                        </FormField>
                        <FormField label="Dokter Anestesi">
                          <select name="dpjpAnestesi" value={formData.dpjpAnestesi}
                            onChange={handleChange}
                            className={`${inputDefault} !border-red-300`}>
                            <option value="">— Pilih Dokter —</option>
                            {dokterAnestesiList.map((d, i) =>
                              <option key={i} value={d}>{d}</option>
                            )}
                          </select>
                        </FormField>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </SectionCard>

              {/* 2. Data Pasien */}
              <SectionCard icon={User} title="Data Pasien">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Nama Pasien" required error={errors.namaPasien}>
                    <input type="text" name="namaPasien" value={formData.namaPasien}
                      onChange={handleChange} placeholder="Masukkan nama lengkap pasien"
                      autoComplete="off"
                      className={errors.namaPasien ? inputError : inputDefault} required />
                  </FormField>
                  <FormField label="No. Rekam Medik" required error={errors.noRekamMedik}>
                    <input type="text" name="noRekamMedik" value={formData.noRekamMedik}
                      onChange={handleChange} placeholder="Contoh: 123456"
                      autoComplete="off"
                      className={errors.noRekamMedik ? inputError : inputDefault} required />
                  </FormField>
                  <FormField label="Ruangan Asal">
                    <input list="ruanganList" type="text" name="ruanganAsal"
                      value={formData.ruanganAsal} onChange={handleChange}
                      placeholder="Pilih atau ketik ruangan" autoComplete="off"
                      className={inputDefault} />
                    <datalist id="ruanganList">
                      {daftarRuangan.map((r, i) => <option key={i} value={r} />)}
                    </datalist>
                  </FormField>
                  <FormField label="Jenis Kelamin">
                    <select name="jenisKelamin" value={formData.jenisKelamin}
                      onChange={handleChange} className={inputDefault}>
                      <option value="L">Laki-laki</option>
                      <option value="P">Perempuan</option>
                    </select>
                  </FormField>
                  <div className="sm:col-span-2">
                    <label className="flex items-center gap-1 text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      Umur
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="relative">
                        <input type="number" name="umurTahun" value={formData.umurTahun}
                          onChange={handleChange} placeholder="0" min="0" max="150"
                          className={`${inputDefault} pr-16`} />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 pointer-events-none">
                          Tahun
                        </span>
                      </div>
                      <div className="relative">
                        <input type="number" name="umurBulan" value={formData.umurBulan}
                          onChange={handleChange} placeholder="0" min="0" max="11"
                          className={`${inputDefault} pr-16`} />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 pointer-events-none">
                          Bulan
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </SectionCard>

              {/* 3. Diagnosa + Tindakan + Dokter */}
              <SectionCard icon={Stethoscope} title="Diagnosa, Tindakan & Dokter Operator">
                <div className="space-y-5">
                  <FormField label="Diagnosa Medis" required error={errors.diagnosaMedis}>
                    <input type="text" name="diagnosaMedis" value={formData.diagnosaMedis}
                      onChange={handleChange} placeholder="Tuliskan diagnosa medis pasien..."
                      autoComplete="off"
                      className={errors.diagnosaMedis ? inputError : inputDefault} required />
                  </FormField>

                  <FormField label="Rencana Tindakan" required error={errors.rencanaTindakan}>
                    <input list="tindakanList" name="rencanaTindakan"
                      value={formData.rencanaTindakan} onChange={handleChange}
                      placeholder="Pilih atau ketik rencana tindakan..."
                      className={errors.rencanaTindakan ? inputError : inputDefault} required />
                    <datalist id="tindakanList">
                      {daftarTindakan.map((t, i) => <option key={i} value={t} />)}
                    </datalist>
                  </FormField>

                  <AnimatePresence>
                    {isSectio && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} className="overflow-hidden"
                      >
                        <div className="p-4 bg-pink-50 rounded-xl border border-pink-200">
                          <FormField label="DPJP Anak (Wajib untuk SC)" required error={errors.dpjpAnak}>
                            <div className="flex items-center gap-2">
                              <Baby size={18} className="text-pink-500 shrink-0" />
                              <input type="text" name="dpjpAnak" value={formData.dpjpAnak}
                                onChange={handleChange}
                                placeholder="Nama DPJP Anak yang akan hadir"
                                autoComplete="off"
                                className={`${errors.dpjpAnak ? inputError : inputDefault} !border-pink-300`} />
                            </div>
                          </FormField>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="border-t border-slate-100" />

                  <DokterOperatorSelect
                    selected={formData.dpjpOperator}
                    onToggle={handleDokterToggle}
                    dpjpLainnya={formData.dpjpLainnya}
                    onLainnyaChange={(v) => {
                      setFormData(p => ({ ...p, dpjpLainnya: v }));
                      if (errors.dpjpLainnya)
                        setErrors(p => { const n = { ...p }; delete n.dpjpLainnya; return n; });
                    }}
                    error={errors.dpjpOperator || errors.dpjpLainnya}
                  />
                </div>
              </SectionCard>

              {/* 4. Catatan */}
              <SectionCard icon={MessageSquare} title="Catatan Tambahan" collapsible defaultOpen={false}>
                <textarea name="catatan" value={formData.catatan} onChange={handleChange}
                  placeholder="Tuliskan catatan tambahan di sini (opsional)..."
                  autoComplete="off" className={`${inputDefault} resize-none`} rows={3} />
              </SectionCard>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <motion.button
                  whileHover={{ scale: 1.005 }} whileTap={{ scale: 0.995 }}
                  type="submit" disabled={isSubmitting}
                  className={`flex-1 py-4 px-6 rounded-2xl font-bold transition flex items-center
                    justify-center gap-2.5 shadow-lg cursor-pointer text-base
                    disabled:opacity-60 disabled:cursor-not-allowed ${
                      formData.jenisOperasi === 'cito'
                        ? 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 shadow-red-900/20'
                        : 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white hover:from-emerald-700 hover:to-teal-800 shadow-emerald-900/20'
                    }`}
                >
                  <Send size={20} />
                  {formData.jenisOperasi === 'cito' ? 'Kirim Data CITO' : 'Kirim Data Pasien'}
                </motion.button>

                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Reset semua data form? Tindakan ini tidak bisa dibatalkan.')) {
                      setFormData(createFreshForm());
                      setErrors({});
                      localStorage.removeItem('formDraftBedah');
                      addToast('Form berhasil direset', 'warning');
                    }
                  }}
                  className="bg-slate-100 text-slate-500 hover:text-red-600 hover:bg-red-50 px-5 rounded-2xl transition flex items-center justify-center border border-slate-200 hover:border-red-200 cursor-pointer"
                  title="Reset Form"
                >
                  <Trash2 size={20} />
                </button>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
                <Clock size={12} />
                <span>Data form tersimpan otomatis secara lokal</span>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}