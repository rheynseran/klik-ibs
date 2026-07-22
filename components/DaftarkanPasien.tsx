'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  LogOut, Trash2, Send, User, Stethoscope,
  ClipboardList, AlertTriangle, CheckCircle2, X,
  Calendar, ChevronDown, Plus,
  Baby, MessageSquare, Clock, Activity,
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
  dpjpOperator: string[];   // ← tetap array (backward compat)
  dpjpLainnya: string;      // ← dipakai jika pilih "Dokter Operator Lainnya"
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

// ✅ Daftar dokter operator + "Dokter Operator Lainnya" di akhir
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
  'Dokter Operator Lainnya',  // ← opsi terakhir
];

const dokterAnestesiList = [
  'dr.Budi,Sp.An', 'dr.Intin,Sp.An', 'dr.Harry,Sp.An',
  'dr.Petrus,Sp.An', 'dr.Deif,Sp.An', 'Lokal Anestesi',
];

// ============================================================
// STATIC INITIAL — hydration safe
// ============================================================
const STATIC_INITIAL: FormDataType = {
  waktuDaftar: '',
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

const createFreshForm = (): FormDataType => ({
  ...STATIC_INITIAL,
  waktuDaftar: new Date().toISOString().slice(0, 16),
});

// ============================================================
// STYLES
// ============================================================
const inputBase =
  'w-full p-3.5 bg-white text-slate-900 text-[15px] border rounded-xl ' +
  'focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none ' +
  'transition-all duration-200 min-h-[48px]';
const inputDefault = `${inputBase} border-slate-300 hover:border-slate-400`;
const inputError   = `${inputBase} border-red-400 ring-1 ring-red-200`;

// ============================================================
// ✅ HELPER: Transform data sebelum kirim
//    Jika dpjpOperator[0] === "Dokter Operator Lainnya"
//    → ganti dengan nama asli dari dpjpLainnya
// ============================================================
function buildSubmitData(formData: FormDataType): FormDataType {
  let finalOperator = [...formData.dpjpOperator];

  if (finalOperator[0] === 'Dokter Operator Lainnya' && formData.dpjpLainnya.trim()) {
    finalOperator = [formData.dpjpLainnya.trim()];
  }

  return { ...formData, dpjpOperator: finalOperator };
}

// ============================================================
// FETCH WITH TIMEOUT
// ============================================================
async function fetchWithTimeout(
  url: string, options: RequestInit, timeoutMs: number = 15000
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

// ============================================================
// TOAST
// ============================================================
function ToastContainer({ toasts, removeToast }: {
  toasts: ToastType[]; removeToast: (id: number) => void;
}) {
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div key={t.id}
            initial={{ opacity: 0, x: 80, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3.5
              rounded-2xl shadow-2xl border backdrop-blur-sm ${
              t.type === 'success' ? 'bg-emerald-50/95 border-emerald-200 text-emerald-800'
              : t.type === 'error' ? 'bg-red-50/95 border-red-200 text-red-800'
              : 'bg-amber-50/95 border-amber-200 text-amber-800'}`}>
            {t.type === 'success' && <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />}
            {t.type === 'error' && <X size={20} className="text-red-500 shrink-0" />}
            {t.type === 'warning' && <AlertTriangle size={20} className="text-amber-500 shrink-0" />}
            <span className="text-sm font-semibold flex-1">{t.message}</span>
            <button onClick={() => removeToast(t.id)}
              className="text-current opacity-40 hover:opacity-100 transition cursor-pointer p-1">
              <X size={16} /></button>
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
  icon: React.ElementType; title: string; children: React.ReactNode;
  variant?: 'default' | 'danger' | 'info'; collapsible?: boolean;
  defaultOpen?: boolean; badge?: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const styles = {
    default: { border: 'border-slate-200', header: 'bg-gradient-to-r from-slate-50 to-slate-100/80',
      iconBg: 'bg-emerald-100 text-emerald-700', titleColor: 'text-slate-800' },
    danger: { border: 'border-red-200', header: 'bg-gradient-to-r from-red-50 to-red-100/80',
      iconBg: 'bg-red-100 text-red-600', titleColor: 'text-red-800' },
    info: { border: 'border-blue-200', header: 'bg-gradient-to-r from-blue-50 to-blue-100/80',
      iconBg: 'bg-blue-100 text-blue-600', titleColor: 'text-blue-800' },
  };
  const s = styles[variant];
  return (
    <div className={`rounded-2xl border ${s.border} shadow-sm overflow-hidden`}>
      <div className={`${s.header} px-4 sm:px-5 py-4 flex items-center justify-between
        ${collapsible ? 'cursor-pointer select-none active:bg-slate-200/50' : ''}`}
        onClick={() => collapsible && setIsOpen(!isOpen)}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${s.iconBg}`}><Icon size={18} /></div>
          <h3 className={`text-[13px] sm:text-sm font-bold uppercase tracking-wide ${s.titleColor}`}>{title}</h3>
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
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} style={{ overflow: 'hidden' }}>
            <div className="p-4 sm:p-5 bg-white">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================
// FORM FIELD
// ============================================================
function FormField({ label, required, error, children, className = '' }: {
  label: string; required?: boolean; error?: string;
  children: React.ReactNode; className?: string;
}) {
  return (
    <div className={className}>
      <label className="flex items-center gap-1 text-[13px] font-bold text-slate-600 uppercase tracking-wider mb-2">
        {label}{required && <span className="text-red-500 text-sm">*</span>}
      </label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            className="text-[13px] text-red-500 mt-1.5 font-medium flex items-center gap-1">
            <AlertTriangle size={13} />{error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================
// SUMMARY MODAL
// ============================================================
function SummaryModal({ isOpen, onClose, onConfirm, data, isSubmitting, submitProgress }: {
  isOpen: boolean; onClose: () => void; onConfirm: () => void;
  data: FormDataType; isSubmitting: boolean; submitProgress: string;
}) {
  const fmt = (d: string) => d
    ? new Date(d).toLocaleString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '-';

  // ✅ Tampilkan nama asli di summary
  const dokterDisplay = (() => {
    const raw = data.dpjpOperator?.[0] || '-';
    if (raw === 'Dokter Operator Lainnya' && data.dpjpLainnya?.trim()) {
      return data.dpjpLainnya.trim();
    }
    return raw;
  })();

  const rows: [string, string][] = [
    ['Waktu Registrasi', fmt(data.waktuDaftar)],
    ['Rencana Operasi', fmt(data.tanggalRencanaOperasi)],
    ['Jenis Operasi', data.jenisOperasi?.toUpperCase()],
    ...(data.jenisOperasi === 'cito' ? ([['Kategori Cito', data.kategoriCito]] as [string, string][]) : []),
    ['Nama Pasien', data.namaPasien],
    ['No. Rekam Medik', data.noRekamMedik],
    ['Ruangan Asal', data.ruanganAsal || '-'],
    ['Jenis Kelamin', data.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'],
    ['Umur', `${data.umurTahun || '0'} Tahun ${data.umurBulan || '0'} Bulan`],
    ['Diagnosa', data.diagnosaMedis],
    ['Rencana Tindakan', data.rencanaTindakan],
    ['Dokter Operator', dokterDisplay],
    ...(data.dpjpAnestesi ? ([['Dokter Anestesi', data.dpjpAnestesi]] as [string, string][]) : []),
    ...(data.dpjpAnak ? ([['DPJP Anak', data.dpjpAnak]] as [string, string][]) : []),
    ...(data.catatan ? ([['Catatan', data.catatan]] as [string, string][]) : []),
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9998] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={onClose}>
          <motion.div initial={{ scale: 0.95, opacity: 0, y: 40 }} animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 40 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-4 rounded-t-3xl sticky top-0 z-10">
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <ClipboardList size={20} /> Konfirmasi Data Pasien</h3>
              <p className="text-emerald-100 text-xs mt-1">Periksa kembali data sebelum dikirim</p>
            </div>
            <div className="p-5 space-y-1">
              {rows.map(([l, v], i) => (
                <div key={i} className={`flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4 py-2.5
                  border-b border-slate-100 last:border-0 px-1 ${i % 2 === 0 ? 'bg-slate-50/50 rounded-lg' : ''}`}>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide shrink-0">{l}</span>
                  <span className="text-sm font-medium text-slate-800 sm:text-right break-words">{v}</span>
                </div>
              ))}
            </div>
            <div className="px-5 pb-5 flex gap-3 sticky bottom-0 bg-white pt-3 border-t border-slate-100">
              <button onClick={onClose}
                className="flex-1 py-3.5 rounded-xl border border-slate-300 text-slate-600 font-semibold hover:bg-slate-50 active:bg-slate-100 transition cursor-pointer text-[15px]">
                Kembali</button>
              <motion.button whileTap={{ scale: 0.97 }} onClick={onConfirm} disabled={isSubmitting}
                className="flex-1 py-3.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 active:bg-emerald-800 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 text-[15px]">
                {isSubmitting ? (
                  <span className="flex flex-col items-center gap-1">
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>Mengirim...
                    </span>
                    <span className="text-[11px] text-emerald-200 font-normal">{submitProgress}</span>
                  </span>
                ) : <><Send size={18} /> Kirim Data</>}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function PendaftaranPasienOperasi() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState('');
  const [showSummary, setShowSummary] = useState(false);
  const [toasts, setToasts] = useState<ToastType[]>([]);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [showDraftBanner, setShowDraftBanner] = useState(false);
  const [mounted, setMounted] = useState(false);

  // ✅ Hydration-safe: static initial
  const [formData, setFormData] = useState<FormDataType>(STATIC_INITIAL);

  // ✅ Client-only: load draft + set waktu
  useEffect(() => {
    setMounted(true);
    const now = new Date().toISOString().slice(0, 16);
    try {
      const saved = localStorage.getItem('formDraftBedah');
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<FormDataType>;
        setFormData(prev => ({ ...prev, ...parsed, waktuDaftar: now }));
        if (parsed.namaPasien || parsed.noRekamMedik || parsed.diagnosaMedis) {
          setShowDraftBanner(true);
        }
      } else {
        setFormData(prev => ({ ...prev, waktuDaftar: now }));
      }
    } catch {
      setFormData(prev => ({ ...prev, waktuDaftar: now }));
    }
  }, []);

  // Draft banner auto-hide
  useEffect(() => {
    if (!showDraftBanner) return;
    const timer = setTimeout(() => setShowDraftBanner(false), 3000);
    return () => clearTimeout(timer);
  }, [showDraftBanner]);

  // Auto-save
  useEffect(() => {
    if (!mounted) return;
    const t = setTimeout(() => {
      try { localStorage.setItem('formDraftBedah', JSON.stringify(formData)); } catch {}
    }, 1000);
    return () => clearTimeout(t);
  }, [formData, mounted]);

  // Clock
  useEffect(() => {
    const iv = setInterval(() => {
      setFormData(p => ({ ...p, waktuDaftar: new Date().toISOString().slice(0, 16) }));
    }, 60000);
    return () => clearInterval(iv);
  }, []);

  // Toast
  const addToast = useCallback((msg: string, type: ToastType['type']) => {
    const id = Date.now();
    setToasts(p => [...p, { id, message: msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  }, []);
  const removeToast = useCallback((id: number) => {
    setToasts(p => p.filter(t => t.id !== id));
  }, []);

  // ✅ Handle change — termasuk logic untuk dpjpOperator single select
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'dpjpOperator') {
      // ✅ Single select: simpan sebagai array 1 item
      setFormData(p => ({
        ...p,
        dpjpOperator: value ? [value] : [],
        // Reset dpjpLainnya jika bukan "Dokter Operator Lainnya"
        dpjpLainnya: value === 'Dokter Operator Lainnya' ? p.dpjpLainnya : '',
      }));
    } else {
      setFormData(p => ({ ...p, [name]: value }));
    }

    if (errors[name]) setErrors(p => { const n = { ...p }; delete n[name]; return n; });
  };

  // Validation
  const validate = (): boolean => {
    const e: ValidationErrors = {};
    if (!formData.namaPasien.trim()) e.namaPasien = 'Nama pasien wajib diisi';
    if (!formData.noRekamMedik.trim()) e.noRekamMedik = 'No. Rekam Medik wajib diisi';
    if (!formData.tanggalRencanaOperasi) e.tanggalRencanaOperasi = 'Tanggal rencana wajib diisi';
    if (!formData.diagnosaMedis.trim()) e.diagnosaMedis = 'Diagnosa medis wajib diisi';
    if (!formData.rencanaTindakan.trim()) e.rencanaTindakan = 'Rencana tindakan wajib diisi';
    if (formData.jenisOperasi === 'cito' && !formData.kategoriCito) e.kategoriCito = 'Kategori Cito wajib diisi';

    // ✅ Validasi dokter operator
    if (formData.dpjpOperator.length === 0 || !formData.dpjpOperator[0]?.trim()) {
      e.dpjpOperator = 'Dokter operator wajib dipilih';
    }

    // ✅ Jika pilih "Lainnya", nama wajib diisi
    if (formData.dpjpOperator[0] === 'Dokter Operator Lainnya' && !formData.dpjpLainnya.trim()) {
      e.dpjpLainnya = 'Nama dokter operator wajib diisi';
    }

    const isSC = formData.rencanaTindakan?.toLowerCase().includes('sectio')
      || formData.rencanaTindakan?.toLowerCase().includes('sc');
    if (isSC && !formData.dpjpAnak.trim()) e.dpjpAnak = 'DPJP Anak wajib diisi untuk SC';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) { addToast('Mohon lengkapi semua field wajib', 'warning'); return; }
    setShowSummary(true);
  };

  // ✅ Submit dengan transform "Lainnya" → nama asli
  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    setSubmitProgress('Menghubungkan ke server...');
    let seconds = 0;
    const progressInterval = setInterval(() => {
      seconds++;
      if (seconds <= 3) setSubmitProgress('Menghubungkan ke server...');
      else if (seconds <= 8) setSubmitProgress(`Mengirim data... (${seconds} detik)`);
      else setSubmitProgress(`Hampir selesai... (${seconds} detik)`);
    }, 1000);

    try {
      // ✅ Transform: "Dokter Operator Lainnya" → nama asli
      const submitData = buildSubmitData(formData);

      await fetchWithTimeout(GOOGLE_SCRIPT_URL, {
        method: 'POST', mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      }, 15000);

      clearInterval(progressInterval);
      addToast('Data pasien berhasil disimpan!', 'success');
      setFormData(createFreshForm());
      setShowSummary(false);
      localStorage.removeItem('formDraftBedah');
    } catch (err) {
      clearInterval(progressInterval);
      if (err instanceof DOMException && err.name === 'AbortError') {
        addToast('Koneksi lambat. Data kemungkinan tetap tersimpan.', 'warning');
        setFormData(createFreshForm());
        setShowSummary(false);
        localStorage.removeItem('formDraftBedah');
      } else {
        addToast('Gagal mengirim data. Periksa koneksi internet.', 'error');
      }
    } finally {
      clearInterval(progressInterval);
      setIsSubmitting(false);
      setSubmitProgress('');
    }
  };

  // ✅ Derived state
  const isSectio = formData.rencanaTindakan?.toLowerCase().includes('sectio')
    || formData.rencanaTindakan?.toLowerCase().includes('sc');

  const isOperatorLainnya = formData.dpjpOperator[0] === 'Dokter Operator Lainnya';

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
      <SummaryModal isOpen={showSummary} onClose={() => setShowSummary(false)}
        onConfirm={handleConfirmSubmit} data={formData}
        isSubmitting={isSubmitting} submitProgress={submitProgress} />

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="min-h-screen w-full bg-gradient-to-br from-emerald-950 via-teal-900 to-green-950 py-4 sm:py-6 px-3 sm:px-6">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto bg-slate-50/98 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden">

          {/* HEADER */}
          <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 px-4 sm:px-8 py-4 sm:py-5 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -translate-y-20 translate-x-20" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-y-16 -translate-x-16" />
            </div>
            <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h2 className="text-lg sm:text-2xl font-extrabold text-white tracking-wide flex items-center gap-2.5">
                <div className="p-1.5 sm:p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Activity size={20} className="text-white sm:w-6 sm:h-6" />
                </div>
                <div>
                  <span className="block text-base sm:text-2xl">REGISTRASI PASIEN BEDAH</span>
                  <span className="text-[10px] sm:text-xs font-medium text-emerald-100 tracking-normal block">
                    IBS — RSUD Prof. Dr. W.Z. Johannes Kupang</span>
                </div>
              </h2>
              <div className="flex items-center gap-2">
                <AnimatePresence>
                  {formData.jenisOperasi === 'cito' && (
                    <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="flex items-center gap-1.5 bg-red-500 text-white px-3 py-1.5 rounded-xl font-extrabold text-[13px] shadow-lg shadow-red-500/30 border border-red-400">
                      <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                        <AlertTriangle size={14} /></motion.div>CITO
                    </motion.div>
                  )}
                </AnimatePresence>
                <button onClick={() => router.push('/')}
                  className="text-white font-bold flex items-center gap-1.5 bg-white/15 hover:bg-white/25 active:bg-white/30 px-3 py-2 rounded-xl transition border border-white/20 cursor-pointer backdrop-blur-sm text-[13px]">
                  <LogOut size={15} /> Logout</button>
              </div>
            </div>

            <div className="relative mt-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-medium text-emerald-100">Progress Data</span>
                <span className="text-[11px] font-bold text-white">{completionPercent}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-1.5 overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${completionPercent}%` }} transition={{ duration: 0.5 }}
                  className={`h-full rounded-full ${completionPercent === 100 ? 'bg-green-300' : completionPercent >= 60 ? 'bg-yellow-300' : 'bg-red-300'}`} />
              </div>
            </div>

            <AnimatePresence>
              {showDraftBanner && (
                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                  className="mt-2 text-[11px] text-emerald-200 flex items-center gap-1">
                  <CheckCircle2 size={12} /> Draft sebelumnya berhasil dimuat</motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* FORM */}
          <div className="p-4 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">

              {/* 1. Jadwal */}
              <SectionCard icon={Calendar} title="Jadwal & Jenis Operasi"
                variant={formData.jenisOperasi === 'cito' ? 'danger' : 'default'}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
                  <FormField label="Tanggal Registrasi" required>
                    <input type="datetime-local" name="waktuDaftar" value={formData.waktuDaftar}
                      onChange={handleChange} className={inputDefault} required />
                  </FormField>
                  <FormField label="Rencana Operasi" required error={errors.tanggalRencanaOperasi}>
                    <input type="datetime-local" name="tanggalRencanaOperasi" value={formData.tanggalRencanaOperasi}
                      onChange={handleChange} className={errors.tanggalRencanaOperasi ? inputError : inputDefault} required />
                  </FormField>
                  <FormField label="Jenis Operasi" required>
                    <select name="jenisOperasi" value={formData.jenisOperasi} onChange={handleChange}
                      className={`${inputDefault} font-bold ${formData.jenisOperasi === 'cito' ? '!border-red-400 !text-red-700 !bg-red-50' : ''}`}>
                      <option value="elektif">⏳ ELEKTIF</option>
                      <option value="cito">🔴 CITO</option>
                    </select>
                  </FormField>
                </div>
                <AnimatePresence>
                  {formData.jenisOperasi === 'cito' && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mt-4 p-4 bg-red-50 rounded-xl border border-red-200">
                        <FormField label="Kategori Cito" required error={errors.kategoriCito}>
                          <select name="kategoriCito" value={formData.kategoriCito} onChange={handleChange}
                            className={`${errors.kategoriCito ? inputError : inputDefault} !border-red-300`}>
                            <option value="">— Pilih Kategori —</option>
                            <option value="Kategori 1">🔴 Kategori 1</option>
                            <option value="Bukan Kategori 1">🟡 Bukan Kategori 1</option>
                          </select>
                        </FormField>
                        <FormField label="Dokter Anestesi">
                          <select name="dpjpAnestesi" value={formData.dpjpAnestesi} onChange={handleChange}
                            className={`${inputDefault} !border-red-300`}>
                            <option value="">— Pilih Dokter —</option>
                            {dokterAnestesiList.map((d, i) => <option key={i} value={d}>{d}</option>)}
                          </select>
                        </FormField>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </SectionCard>

              {/* 2. Data Pasien */}
              <SectionCard icon={User} title="Data Pasien">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <FormField label="Nama Pasien" required error={errors.namaPasien}>
                    <input type="text" name="namaPasien" value={formData.namaPasien} onChange={handleChange}
                      placeholder="Masukkan nama lengkap pasien" autoComplete="off"
                      className={errors.namaPasien ? inputError : inputDefault} required />
                  </FormField>
                  <FormField label="No. Rekam Medik" required error={errors.noRekamMedik}>
                    <input type="text" name="noRekamMedik" value={formData.noRekamMedik} onChange={handleChange}
                      placeholder="Contoh: 123456" autoComplete="off"
                      className={errors.noRekamMedik ? inputError : inputDefault} required />
                  </FormField>
                  <FormField label="Ruangan Asal">
                    <input list="ruanganList" type="text" name="ruanganAsal" value={formData.ruanganAsal}
                      onChange={handleChange} placeholder="Pilih atau ketik ruangan" autoComplete="off"
                      className={inputDefault} />
                    <datalist id="ruanganList">
                      {daftarRuangan.map((r, i) => <option key={i} value={r} />)}
                    </datalist>
                  </FormField>
                  <FormField label="Jenis Kelamin">
                    <select name="jenisKelamin" value={formData.jenisKelamin} onChange={handleChange} className={inputDefault}>
                      <option value="L">Laki-laki</option>
                      <option value="P">Perempuan</option>
                    </select>
                  </FormField>
                  <div className="sm:col-span-2">
                    <label className="flex items-center gap-1 text-[13px] font-bold text-slate-600 uppercase tracking-wider mb-2">Umur</label>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div className="relative">
                        <input type="number" name="umurTahun" value={formData.umurTahun} onChange={handleChange}
                          placeholder="0" min="0" max="150" className={`${inputDefault} pr-16`} />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] font-semibold text-slate-400 pointer-events-none">Tahun</span>
                      </div>
                      <div className="relative">
                        <input type="number" name="umurBulan" value={formData.umurBulan} onChange={handleChange}
                          placeholder="0" min="0" max="11" className={`${inputDefault} pr-16`} />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] font-semibold text-slate-400 pointer-events-none">Bulan</span>
                      </div>
                    </div>
                  </div>
                </div>
              </SectionCard>

              {/* ✅ 3. Diagnosa + Tindakan + Dokter Operator (SEDERHANA) */}
              <SectionCard icon={Stethoscope} title="Diagnosa, Tindakan & Dokter">
                <div className="space-y-5 sm:space-y-6">

                  <FormField label="Diagnosa Medis" required error={errors.diagnosaMedis}>
                    <input type="text" name="diagnosaMedis" value={formData.diagnosaMedis} onChange={handleChange}
                      placeholder="Tuliskan diagnosa medis pasien..." autoComplete="off"
                      className={errors.diagnosaMedis ? inputError : inputDefault} required />
                  </FormField>

                  <FormField label="Rencana Tindakan" required error={errors.rencanaTindakan}>
                    <input list="tindakanList" name="rencanaTindakan" value={formData.rencanaTindakan}
                      onChange={handleChange} placeholder="Pilih atau ketik rencana tindakan..."
                      className={errors.rencanaTindakan ? inputError : inputDefault} required />
                    <datalist id="tindakanList">
                      {daftarTindakan.map((t, i) => <option key={i} value={t} />)}
                    </datalist>
                  </FormField>

                  {/* DPJP Anak (SC) */}
                  <AnimatePresence>
                    {isSectio && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="p-4 bg-pink-50 rounded-xl border border-pink-200">
                          <FormField label="DPJP Anak (Wajib untuk SC)" required error={errors.dpjpAnak}>
                            <div className="flex items-center gap-2">
                              <Baby size={18} className="text-pink-500 shrink-0" />
                              <input type="text" name="dpjpAnak" value={formData.dpjpAnak} onChange={handleChange}
                                placeholder="Nama DPJP Anak" autoComplete="off"
                                className={`${errors.dpjpAnak ? inputError : inputDefault} !border-pink-300`} />
                            </div>
                          </FormField>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="border-t border-slate-100" />

                  {/* ✅ DOKTER OPERATOR — Simple datalist (seperti Rencana Tindakan) */}
                  <FormField label="Dokter Operator" required error={errors.dpjpOperator}>
                    <input
                      list="dokterOperatorList"
                      name="dpjpOperator"
                      value={formData.dpjpOperator[0] || ''}
                      onChange={handleChange}
                      placeholder="Pilih atau ketik nama dokter operator..."
                      autoComplete="off"
                      className={errors.dpjpOperator ? inputError : inputDefault}
                      required
                    />
                    <datalist id="dokterOperatorList">
                      {dpjpOperatorList.map((doc, i) => (
                        <option key={i} value={doc} />
                      ))}
                    </datalist>
                  </FormField>

                  {/* ✅ Muncul jika pilih "Dokter Operator Lainnya" */}
                  <AnimatePresence>
                    {isOperatorLainnya && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 space-y-2">
                          <label className="text-[13px] font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
                            <Plus size={13} /> Sebutkan Nama Dokter Operator
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            name="dpjpLainnya"
                            value={formData.dpjpLainnya}
                            onChange={handleChange}
                            placeholder="Ketik nama lengkap dokter operator..."
                            autoComplete="off"
                            autoFocus
                            className="w-full p-3.5 bg-white text-slate-900 text-[15px] border border-blue-300
                              rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                              outline-none transition-all placeholder:text-blue-300 min-h-[48px]"
                          />
                          {errors.dpjpLainnya && (
                            <p className="text-[13px] text-red-500 font-medium flex items-center gap-1">
                              <AlertTriangle size={13} />{errors.dpjpLainnya}
                            </p>
                          )}
                          <p className="text-[12px] text-blue-500 flex items-center gap-1">
                            <CheckCircle2 size={12} /> Nama ini akan masuk ke kolom Dokter Operator di Google Sheet
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              </SectionCard>

              {/* 4. Catatan — tetap collapsible, default closed */}
              <SectionCard icon={MessageSquare} title="Catatan Tambahan" collapsible defaultOpen={false}>
                <textarea name="catatan" value={formData.catatan} onChange={handleChange}
                  placeholder="Tuliskan catatan tambahan di sini (opsional)..."
                  autoComplete="off" className={`${inputDefault} resize-none`} rows={3} />
              </SectionCard>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={isSubmitting}
                  className={`flex-1 py-4 px-6 rounded-2xl font-bold transition flex items-center
                    justify-center gap-2.5 shadow-lg cursor-pointer text-[15px] sm:text-base
                    disabled:opacity-60 disabled:cursor-not-allowed min-h-[52px] ${
                    formData.jenisOperasi === 'cito'
                      ? 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 active:from-red-800 shadow-red-900/20'
                      : 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white hover:from-emerald-700 hover:to-teal-800 active:from-emerald-800 shadow-emerald-900/20'
                  }`}>
                  <Send size={20} />
                  {formData.jenisOperasi === 'cito' ? 'Kirim CITO' : 'Kirim Data'}
                </motion.button>
                <button type="button"
                  onClick={() => {
                    if (confirm('Reset semua data form?')) {
                      setFormData(createFreshForm()); setErrors({});
                      localStorage.removeItem('formDraftBedah');
                      addToast('Form berhasil direset', 'warning');
                    }
                  }}
                  className="bg-slate-100 text-slate-500 hover:text-red-600 hover:bg-red-50 active:bg-red-100
                    px-4 sm:px-5 rounded-2xl transition flex items-center justify-center border border-slate-200
                    cursor-pointer min-h-[52px] min-w-[52px]" title="Reset Form">
                  <Trash2 size={20} />
                </button>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[12px] text-slate-400 pb-2">
                <Clock size={11} /><span>Data form tersimpan otomatis</span>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}