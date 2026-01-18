import React, { useState, useEffect } from 'react'
import * as Icons from '@heroicons/react/24/outline'

// 1. HAYVAN EKLEME MODALI
export function HayvanEkleModal({ acik, setAcik, kaydet, form, setForm }) {
    const [onizleme, setOnizleme] = useState(null);
    useEffect(() => { if (!acik) setOnizleme(null); }, [acik]);

    if (!acik) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 animate-in zoom-in duration-200">
                <div className="bg-emerald-600 p-5 flex justify-between items-center text-white">
                    <h3 className="font-bold flex items-center gap-2 uppercase text-sm">Yeni Hayvan Kaydı</h3>
                    <button onClick={() => setAcik(false)} className="hover:bg-white/20 p-1 rounded-full"><Icons.XMarkIcon className="h-6 w-6"/></button>
                </div>
                <form onSubmit={kaydet} className="p-8 space-y-5">
                    <div className="flex flex-col items-center">
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-3xl bg-slate-100 border-4 border-white shadow-xl overflow-hidden flex items-center justify-center">
                                {onizleme ? <img src={onizleme} className="w-full h-full object-cover" alt="Önizleme" /> : <Icons.PhotoIcon className="h-10 w-10 text-slate-300" />}
                            </div>
                            <label className="absolute -bottom-2 -right-2 p-2 bg-emerald-600 text-white rounded-xl shadow-lg cursor-pointer border-4 border-white hover:bg-emerald-700 transition-all">
                                <Icons.CameraIcon className="h-4 w-4" />
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                                    const file = e.target.files[0];
                                    if(file) {
                                        setForm({...form, fotograf: file});
                                        setOnizleme(URL.createObjectURL(file));
                                    }
                                }} />
                            </label>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 mt-2 uppercase">Fotoğraf Seç</p>
                    </div>
                    
                    <input type="text" required value={form.kupe_no} onChange={(e)=>setForm({...form, kupe_no: e.target.value})} className="w-full p-4 rounded-2xl border-2 border-slate-50 bg-slate-50 font-bold outline-none focus:border-emerald-500" placeholder="Küpe No" />
                    <input type="text" value={form.isim} onChange={(e)=>setForm({...form, isim: e.target.value})} className="w-full p-4 rounded-2xl border-2 border-slate-50 bg-slate-50 font-bold outline-none focus:border-emerald-500" placeholder="İsim" />
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase ml-1">Doğum Tarihi</p>
                            <input type="date" required value={form.dogum_tarihi} onChange={(e)=>setForm({...form, dogum_tarihi: e.target.value})} className="w-full p-4 rounded-xl border-2 border-slate-50 bg-slate-50 font-bold outline-none focus:border-emerald-500" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase ml-1">Cinsiyet</p>
                            <select value={form.cinsiyet} onChange={(e)=>setForm({...form, cinsiyet: e.target.value})} className="w-full p-4 rounded-xl border-2 border-slate-50 bg-slate-50 font-bold outline-none focus:border-emerald-500">
                                <option value="Dişi">Dişi</option>
                                <option value="Erkek">Erkek</option>
                            </select>
                        </div>
                    </div>

                    <button type="submit" className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-emerald-700 active:scale-95 transition-all">Kaydet</button>
                </form>
            </div>
        </div>
    );
}

// 2. İŞLEM EKLEME MODALI
export function IslemEkleModal({ acik, setAcik, kaydet, form, setForm, seciliHayvan }) {
    if (!acik) return null;
    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
        <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200 border border-slate-200">
          <div className="bg-emerald-600 p-5 flex justify-between items-center text-white">
            <h3 className="font-bold uppercase text-xs flex items-center gap-2"><Icons.WrenchScrewdriverIcon className="h-5 w-5"/> İşlem Gir: {seciliHayvan?.kupe_no}</h3>
            <button onClick={() => setAcik(false)}><Icons.XMarkIcon className="h-6 w-6"/></button>
          </div>
          <form onSubmit={kaydet} className="p-8 space-y-4">
            <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase ml-1">İşlem Türü</p>
                <select value={form.olay_tipi} onChange={(e)=>setForm({...form, olay_tipi: e.target.value})} className="w-full p-4 rounded-2xl border-2 border-slate-50 bg-slate-50 font-bold outline-none focus:border-emerald-500 transition-all">
                    <option value="Tohumlama">🧬 Tohumlama</option>
                    <option value="Dogum">🍼 Doğum Yaptı</option>
                    <option value="Muayene">🩺 Muayene</option>
                    <option value="Asi">💉 Aşı / İlaç</option>
                    <option value="GebelikIptal">❌ Gebelik İptal (Boşa Çıktı)</option>
                </select>
            </div>

            {form.olay_tipi === "Tohumlama" && (
                <div className="animate-in slide-in-from-top-2 duration-200">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1">Tohum Irkı / Cinsi</p>
                    <select value={form.tohum_cinsi || "Simental"} onChange={(e)=>setForm({...form, tohum_cinsi: e.target.value})} className="w-full p-4 rounded-2xl border-2 border-emerald-100 bg-emerald-50 text-emerald-800 font-bold outline-none focus:border-emerald-400">
                        <option value="Simental">Simental</option>
                        <option value="Holstein">Holstein</option>
                        <option value="Belçika Mavisi">🇧🇪 Belçika Mavisi</option>
                        <option value="Montofon">Montofon</option>
                        <option value="Angus">Angus</option>
                        <option value="Limuzin">Limuzin</option>
                        <option value="Hereford">Hereford</option>
                    </select>
                </div>
            )}

            <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase ml-1">Tarih</p>
                <input type="date" required value={form.tarih} onChange={(e)=>setForm({...form, tarih: e.target.value})} className="w-full p-4 rounded-2xl border-2 border-slate-50 bg-slate-50 font-bold outline-none focus:border-emerald-500" />
            </div>
            
            <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase ml-1">Açıklama / Not</p>
                <textarea value={form.aciklama} onChange={(e)=>setForm({...form, aciklama: e.target.value})} className="w-full p-4 rounded-2xl border-2 border-slate-50 bg-slate-50 font-medium h-24 outline-none focus:border-emerald-500 resize-none" placeholder="İşlem detaylarını yazın..." />
            </div>
            
            <button type="submit" className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase shadow-xl hover:bg-emerald-700 active:scale-95 transition-all">Kaydet</button>
          </form>
        </div>
      </div>
    );
}

// 3. HAYVAN DETAY MODALI
export function HayvanDetayModal({ acik, setAcik, detayVerisi, islemSil }) {
    const [tamEkran, setTamEkran] = useState(false);
    if (!acik || !detayVerisi) return null;
    const { bilgi, tarihce } = detayVerisi;

    return (
        <div className="fixed inset-0 z-[2000] bg-slate-50 flex flex-col w-full h-full overflow-hidden animate-in slide-in-from-right duration-300">
            {tamEkran && bilgi.fotograf_url && (
                <div className="fixed inset-0 z-[3000] bg-black/95 flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in" onClick={() => setTamEkran(false)}>
                    <img src={bilgi.fotograf_url} className="max-w-full max-h-full rounded-xl shadow-2xl border-2 border-white/20" alt="Büyük Görünüm" />
                    <button className="absolute top-10 right-10 text-white p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all"><Icons.XMarkIcon className="h-10 w-10"/></button>
                </div>
            )}
            
            <div className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm">
                <button onClick={() => setAcik(false)} className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase hover:bg-slate-700 active:scale-95 transition-all">
                    <Icons.ArrowLeftIcon className="h-4 w-4" /> Geri Dön
                </button>
                <div className="flex flex-col items-end text-emerald-600">
                    <span className="text-[10px] font-black uppercase italic leading-none">Bereketli Çiftlik</span>
                    <span className="text-[8px] font-bold">AKILLI TAKİP SİSTEMİ</span>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                <div className="w-80 md:w-96 bg-white border-r p-8 shrink-0 flex flex-col gap-8 overflow-y-auto">
                    <div className="flex justify-start">
                        <div onClick={() => {if(bilgi.fotograf_url) setTamEkran(true)}} className={`w-44 h-44 rounded-[3rem] flex items-center justify-center text-white font-black text-6xl shadow-2xl border-4 border-white overflow-hidden cursor-zoom-in group relative ${bilgi.cinsiyet === 'Dişi' ? 'bg-pink-500' : 'bg-blue-500'}`}>
                            {bilgi.fotograf_url ? (
                                <>
                                    <img src={bilgi.fotograf_url} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" alt="Hayvan" />
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                        <Icons.MagnifyingGlassPlusIcon className="h-12 w-12 text-white" />
                                    </div>
                                </>
                            ) : <span>{bilgi.cinsiyet === 'Dişi' ? 'D' : 'E'}</span>}
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Küpe Numarası</p>
                            <h2 className="text-4xl font-black text-slate-900 italic tracking-tighter">#{bilgi.kupe_no}</h2>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Hayvan İsmi</p>
                            <h3 className="text-2xl font-bold text-slate-700">{bilgi.isim || 'İsimsiz'}</h3>
                        </div>
                        <div className="pt-6 border-t border-slate-100">
                            <div className="flex items-center gap-3 text-xs font-bold text-slate-600 bg-emerald-50 p-4 rounded-2xl shadow-inner border border-emerald-100">
                                <Icons.CalendarDaysIcon className="h-6 w-6 text-emerald-600" />
                                <div>
                                    <p className="text-[8px] uppercase text-emerald-600/50 font-black">Doğum Tarihi</p>
                                    <p className="text-sm tracking-tight">{bilgi.dogum_tarihi}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-10 bg-slate-50/40">
                    <div className="max-w-3xl mx-auto space-y-6">
                        <h4 className="font-black text-xl text-slate-800 uppercase flex items-center gap-3 mb-10 tracking-tight italic">
                            <Icons.ClockIcon className="h-7 w-7 text-emerald-500" /> İşlem Tarihçesi
                        </h4>
                        
                        {tarihce.length === 0 ? (
                            <div className="bg-white p-20 rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center text-slate-400">
                                <Icons.InboxIcon className="h-12 w-12 mb-4 opacity-20" />
                                <p className="font-bold uppercase text-xs tracking-widest text-center">Henüz bu hayvan için<br/>bir işlem kaydı yapılmadı</p>
                            </div>
                        ) : (
                            tarihce.map((olay) => (
                                <div key={olay.id} className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm flex justify-between items-center group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-4">
                                            <span className={`font-black text-lg uppercase tracking-tighter ${olay.olay_tipi === 'Tohumlama' ? 'text-blue-600' : olay.olay_tipi === 'GebelikIptal' ? 'text-red-600' : 'text-emerald-600'}`}>
                                                {olay.olay_tipi}
                                            </span>
                                            <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm">{olay.tarih}</span>
                                        </div>
                                        <p className="text-slate-500 text-sm font-semibold leading-relaxed max-w-xl">{olay.aciklama}</p>
                                    </div>
                                    <button onClick={() => {if(window.confirm('Bu işlemi silmek istediğine emin misin?')) islemSil(olay.id)}} className="p-4 text-slate-200 hover:text-red-600 hover:bg-red-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300">
                                        <Icons.TrashIcon className="h-7 w-7" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}