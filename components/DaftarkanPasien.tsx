'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, FileText, Trash2, Send, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwVeQaCIqrCREkeTMCVW2H7S6W8MPkJ-dz7y6KkR4UKkt1JbvCr99BIOoBP8gmFrnM/exec";

const daftarTindakan = [
  "Fakoemulsifikasi (Katarak)", "Pterygium", "Trabekulektomi (Glaukoma)", "Eviserasi/Enukleasi", "Injeksi Intravitreal",
  "Odontektomi", "ORIF Fraktur Mandibula", "Eksisi Kista Rahang", "Frenulektomi", "Gingivektomi",
  "Gastroskopi", "Kolonoskopi", "ERCP", "Bronkoskopi", "Endoskopi THT", "Polipektomi Endoskopi",
  "Apendektomi Laparoskopi", "Kolesistektomi Laparoskopi", "Hernia Repair Laparoskopi", "Kistektomi Laparoskopi", "Histerektomi Laparoskopi",
  "Kraniotomi", "VP Shunt", "Laminektomi", "Discektomi", "Burr Hole", "Kranioplasti",
  "Laparatomi Eksplorasi", "Hemoroidektomi", "Fistula Ani", "Kolostomi", "Reseksi Usus", "Apendecktomi Open", "Herniorrhaphy", "Kolesistektomi Open",
  "Mastektomi Radikal", "Biopsi Eksisi Tumor", "Eksisi Tumor Jinak/Ganas", "Limfadenektomi", "Wide Eksisi",
  "AV Fistula (Cimino)", "Pemasangan CDL", "Pemasangan CVC", "Embolektomi", "Vena Varises Surgery", "Pemasangan Port-A-Cath",
  "Sectio Caesarea (SC)", "SC + MOW", "SC + Histerektomi", "Histerektomi", "Kuretase", "Kistektomi Ovarium", "Ekstraksi Vakum",
  "WSD (Water Sealed Drainage)", "Pleurodesis", "Biopsi Pleura", "Torakoskopi (VATS)", "Torakosentesis"
];

const daftarRuangan = ["VK", "IGD", "ICU", "HCU", "Sasando", "Kenanga", "Kelimutu", "Cempaka"];

export default function PendaftaranPasienOperasi() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
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
    dpjpOperator: [] as string[],
    dpjpLainnya: '',
    dpjpAnestesi: '',
    dpjpAnak: '',
    catatan: '',
    isDropdownOpen: false
  });

  useEffect(() => {
    const savedData = localStorage.getItem('formDataIBS');
    if (savedData) {
      setFormData(JSON.parse(savedData));
    } else {
      setFormData(prev => ({ ...prev, waktuDaftar: new Date().toISOString().slice(0, 16) }));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('formDataIBS', JSON.stringify(formData));
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (dokter: string) => {
    setFormData(prev => {
      const list = prev.dpjpOperator || [];
      const newList = list.includes(dokter) 
        ? list.filter((item: string) => item !== dokter) 
        : [...list, dokter];
      return { ...prev, dpjpOperator: newList };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      alert('Data Berhasil Tersimpan!');
      localStorage.removeItem('formDataIBS');
      window.location.reload();
    } catch (error) {
      alert('Gagal mengirim data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSectio = formData.rencanaTindakan?.toLowerCase().includes('sectio') || formData.rencanaTindakan?.toLowerCase().includes('sc');
  const dpjpOperatorList = ["dr.Agus,Sp.OG", "dr.Yuni,SpOG", "dr.Hendriette,Sp.OG", "dr.Dewi,Sp.OG", "dr.Laurens,Sp.OG", "dr.Bambang,Sp.OG", "dr.Donni Argie,Sp.BS", "dr.Elrick Malelak,Sp.BS", "dr.Jean Pello,Sp.B", "dr.Amrul,Sp.B", "dr.Alders,Sp.B", "dr.Deddy,Sp.B (K)", "dr.Widhi,Sp.B(K) Digestif", "dr.Teguh Dwi Nugroho, Sp.B (K) BVE", "dr.Iren Lokananta,Sp.BA", "dr.Ellen,Sp.BM", "dr.Steven,Sp.OT", "dr.Made,Sp.U", "dr.Richman,Sp.U", "dr.Deif,Sp.An", "dr.Petrus,Sp.An", "dr.Budi,Sp.An", "dr.Intin,Sp.An", "dr.Harry,Sp.An"];
  const dokterAnestesiList = ["dr.Budi,Sp.An", "dr.Intin,Sp.An", "dr.Harry,Sp.An", "dr.Petrus,Sp.An", "dr.Deif,Sp.An", "Lokal Anestesi"];

  return (
    <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }}
        className="min-h-screen w-full bg-linear-to-br from-emerald-950 via-teal-900 to-green-950 py-8 px-4 sm:px-6"
    >
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto bg-slate-50/98 backdrop-blur-md rounded-3xl shadow-2xl p-6 sm:p-8 border border-emerald-100"
      >
        {/* Header Section dengan Spacing & Kontras Optimal */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b-2 border-emerald-100/60 pb-6">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 flex items-center flex-wrap gap-3">
            <FileText className="text-emerald-700" size={26} /> 
            <span>Pendaftaran Operasi</span>
            <motion.div animate={{ scale: [1, 1.25, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="flex items-center ml-1">
                <Heart className="text-red-500 fill-red-500" size={22} />
            </motion.div>
          </h2>
          <button 
            onClick={() => router.push('/')} 
            className="text-red-600 font-bold flex items-center gap-2 hover:text-red-800 bg-red-50 px-4 py-2 rounded-xl transition border border-red-100"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl border ${formData.jenisOperasi === 'cito' ? 'bg-red-50/80 border-red-200' : 'bg-emerald-50/80 border-emerald-200'}`}>
            <div>
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Waktu Pendaftaran</label>
              <input 
                type="datetime-local" 
                name="waktuDaftar" 
                value={formData.waktuDaftar} 
                onChange={handleChange} 
                className="w-full mt-1 p-2.5 bg-white text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium" 
                required 
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Jenis Operasi</label>
              <select 
                name="jenisOperasi" 
                value={formData.jenisOperasi} 
                onChange={handleChange} 
                className="w-full mt-1 p-2.5 bg-white text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold"
              >
                <option value="elektif">Elektif</option>
                <option value="cito">Cito</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Tanggal Rencana Operasi</label>
                <input 
                  type="datetime-local" 
                  name="tanggalRencanaOperasi" 
                  value={formData.tanggalRencanaOperasi} 
                  onChange={handleChange} 
                  className="w-full mt-1 p-2.5 bg-white text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium" 
                  required 
                />
            </div>
            
            <div>
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Nama Pasien</label>
              <input 
                type="text" 
                name="namaPasien" 
                value={formData.namaPasien} 
                onChange={handleChange} 
                placeholder="Masukkan nama lengkap" 
                className="w-full mt-1 p-2.5 bg-white text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" 
                required 
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">No Rekam Medik</label>
              <input 
                type="text" 
                name="noRekamMedik" 
                value={formData.noRekamMedik} 
                onChange={handleChange} 
                placeholder="No RM" 
                className="w-full mt-1 p-2.5 bg-white text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" 
                required 
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Ruangan Asal</label>
              <input 
                list="ruanganList" 
                type="text" 
                name="ruanganAsal" 
                value={formData.ruanganAsal} 
                onChange={handleChange} 
                placeholder="Pilih atau ketik ruangan" 
                className="w-full mt-1 p-2.5 bg-white text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" 
              />
              <datalist id="ruanganList">{daftarRuangan.map((item, i) => <option key={i} value={item} />)}</datalist>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Jenis Kelamin</label>
              <select 
                name="jenisKelamin" 
                value={formData.jenisKelamin} 
                onChange={handleChange} 
                className="w-full mt-1 p-2.5 bg-white text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Umur (Thn)</label>
              <input 
                type="number" 
                name="umurTahun" 
                value={formData.umurTahun} 
                onChange={handleChange} 
                placeholder="Tahun" 
                className="w-full mt-1 p-2.5 bg-white text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" 
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Umur (Bln)</label>
              <input 
                type="number" 
                name="umurBulan" 
                value={formData.umurBulan} 
                onChange={handleChange} 
                placeholder="Bulan" 
                className="w-full mt-1 p-2.5 bg-white text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" 
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div>
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Diagnosa Medis</label>
              <input 
                type="text" 
                name="diagnosaMedis" 
                value={formData.diagnosaMedis} 
                onChange={handleChange} 
                placeholder="Tuliskan diagnosa medis..." 
                className="w-full mt-1 p-2.5 bg-white text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" 
                required 
              />
            </div>
            
            <div>
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Rencana Tindakan</label>
              <input 
                list="tindakanList" 
                name="rencanaTindakan" 
                value={formData.rencanaTindakan} 
                onChange={handleChange} 
                placeholder="Pilih atau ketik rencana tindakan..." 
                className="w-full mt-1 p-2.5 bg-white text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" 
                required 
              />
              <datalist id="tindakanList">{daftarTindakan.map((item, i) => <option key={i} value={item} />)}</datalist>
            </div>
            
            <div className="relative">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Dokter Operator</label>
                <div 
                  onClick={() => setFormData(p => ({ ...p, isDropdownOpen: !p.isDropdownOpen }))} 
                  className="w-full mt-1 p-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 cursor-pointer truncate shadow-xs"
                >
                  {formData.dpjpOperator?.length > 0 ? formData.dpjpOperator.join(', ') : <span className="text-slate-400">Klik pilih dokter...</span>}
                </div>
                {formData.isDropdownOpen && (
                    <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto p-2">
                        {dpjpOperatorList.map((doc, i) => (
                            <label key={i} className="flex items-center gap-2.5 p-2 hover:bg-slate-50 text-slate-800 text-sm cursor-pointer rounded-lg">
                              <input type="checkbox" checked={formData.dpjpOperator?.includes(doc)} onChange={() => handleCheckboxChange(doc)} className="rounded text-emerald-600 focus:ring-emerald-500" /> 
                              {doc}
                            </label>
                        ))}
                        <label className="flex items-center gap-2.5 p-2 text-blue-700 font-bold border-t border-slate-100 text-sm cursor-pointer mt-1">
                          <input type="checkbox" checked={formData.dpjpOperator?.includes('Lainnya')} onChange={() => handleCheckboxChange('Lainnya')} className="rounded text-emerald-600 focus:ring-emerald-500" /> 
                          Lainnya
                        </label>
                        {formData.dpjpOperator?.includes('Lainnya') && (
                          <input 
                            name="dpjpLainnya" 
                            value={formData.dpjpLainnya} 
                            onChange={handleChange} 
                            placeholder="Tulis nama dokter..." 
                            className="w-full mt-2 p-2 bg-white text-slate-900 border border-slate-300 rounded-lg text-sm" 
                          />
                        )}
                    </div>
                )}
            </div>

            {formData.jenisOperasi === 'cito' && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-red-50/90 p-4 rounded-2xl border border-red-200">
                <div>
                  <label className="text-xs font-bold text-red-900 uppercase tracking-wide">Kategori Cito</label>
                  <select 
                    name="kategoriCito" 
                    value={formData.kategoriCito} 
                    onChange={handleChange} 
                    className="w-full mt-1 p-2.5 bg-white text-slate-900 border border-red-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                  >
                      <option value="">Pilih...</option>
                      <option value="Kategori 1">Kategori 1</option>
                      <option value="Bukan Kategori 1">Bukan Kategori 1</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-red-900 uppercase tracking-wide">Dokter Anestesi</label>
                  <select 
                    name="dpjpAnestesi" 
                    value={formData.dpjpAnestesi} 
                    onChange={handleChange} 
                    className="w-full mt-1 p-2.5 bg-white text-slate-900 border border-red-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                  >
                    <option value="">Pilih...</option>
                    {dokterAnestesiList.map((d, i) => <option key={i} value={d}>{d}</option>)}
                  </select>
                </div>
              </motion.div>
            )}
            
            {isSectio && (
              <div>
                <label className="text-xs font-bold text-red-700 uppercase tracking-wide">DPJP Anak</label>
                <input 
                  type="text" 
                  name="dpjpAnak" 
                  value={formData.dpjpAnak} 
                  onChange={handleChange} 
                  placeholder="Nama DPJP Anak" 
                  className="w-full mt-1 p-2.5 bg-white text-slate-900 border-2 border-red-400 rounded-xl focus:ring-2 focus:ring-red-500 outline-none" 
                />
              </div>
            )}
            
            <div>
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Catatan Tambahan</label>
              <textarea 
                name="catatan" 
                value={formData.catatan} 
                onChange={handleChange} 
                placeholder="Catatan tambahan (opsional)..." 
                className="w-full mt-1 p-2.5 bg-white text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" 
                rows={2} 
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <motion.button 
              whileHover={{ scale: 1.01 }} 
              whileTap={{ scale: 0.99 }} 
              type="submit" 
              disabled={isSubmitting} 
              className="flex-1 bg-emerald-700 text-white py-3.5 px-6 rounded-xl font-bold hover:bg-emerald-800 transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/10 cursor-pointer"
            >
                {isSubmitting ? 'Menyimpan...' : <><Send size={20} /> Kirim Data</>}
            </motion.button>
            <button 
              type="button" 
              onClick={() => { localStorage.removeItem('formDataIBS'); window.location.reload(); }} 
              className="bg-slate-200 text-slate-700 hover:text-red-600 px-5 rounded-xl hover:bg-slate-300 transition flex items-center justify-center border border-slate-300 cursor-pointer"
              title="Reset Form"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}