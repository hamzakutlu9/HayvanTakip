import { useState, useEffect } from 'react'
import { BellAlertIcon, CheckCircleIcon, ExclamationTriangleIcon, ClockIcon, InformationCircleIcon, TrashIcon, ArrowUturnLeftIcon, XMarkIcon } from '@heroicons/react/24/outline'

export default function Assistant({ hayvanlar, analizler }) {
  const [bildirimler, setBildirimler] = useState([])
  const [okunanlar, setOkunanlar] = useState([])
  const [arsivModalAcik, setArsivModalAcik] = useState(false)

  // 1. Okunanları Getir
  useEffect(() => {
    const kayitliOkunanlar = localStorage.getItem('ciftlik_okunan_bildirimler');
    if (kayitliOkunanlar) {
        setOkunanlar(JSON.parse(kayitliOkunanlar));
    }
  }, []);

  // 2. Bildirim Hesaplama
  useEffect(() => {
    if (!hayvanlar || !analizler) return;

    const yeniBildirimler = [];
    
    hayvanlar.forEach(h => {
        const analiz = analizler[h.id];
        if (!analiz) return;

        // --- DOĞUM HESAPLAMA ---
        let kalanSure = null;

        // YÖNTEM A (En Garantisi): Mesajın içinde sayı var mı?
        // "Muayene yapıldı. Doğuma 90 gün var" mesajından 90'ı çeker.
        if (analiz.mesaj && (analiz.mesaj.includes("Doğuma") || analiz.mesaj.includes("doguma"))) {
            const sayiBul = analiz.mesaj.match(/(\d+)/);
            if (sayiBul) {
                kalanSure = parseInt(sayiBul[0]);
                if (analiz.mesaj.toLowerCase().includes("geçti") || analiz.mesaj.toLowerCase().includes("gecikti")) {
                    kalanSure = -kalanSure;
                }
            }
        }

        // YÖNTEM B: Tahmini Doğum Tarihi varsa kullan
        if (kalanSure === null && analiz.tahmini_dogum) {
            const bugun = new Date();
            const hedef = new Date(analiz.tahmini_dogum);
            if (!isNaN(hedef.getTime())) {
                const fark = (hedef - bugun) / (1000 * 60 * 60 * 24);
                kalanSure = Math.ceil(fark);
            }
        }

        // YÖNTEM C: Sadece Tohumlama ise hesapla
        if (kalanSure === null && analiz.son_olay_tipi === 'Tohumlama' && analiz.son_olay_tarihi) {
            const bugun = new Date();
            const tohumlama = new Date(analiz.son_olay_tarihi);
            tohumlama.setDate(tohumlama.getDate() + 280); 
            const fark = (tohumlama - bugun) / (1000 * 60 * 60 * 24);
            kalanSure = Math.ceil(fark);
        }

        // --- BİLDİRİM OLUŞTUR (100 GÜN ALTI) ---
        if (kalanSure !== null && kalanSure <= 100 && kalanSure >= -60) {
            let baslik, mesaj, tip;

            // 1. GECİKENLER
            if (kalanSure < 0) {
                tip = "gecikti"; // Kırmızı
                baslik = "⚠️ DOĞUM GECİKTİ!";
                mesaj = `${h.isim || h.kupe_no} ineğinin doğumu ${Math.abs(kalanSure)} gün gecikti.`;
            } 
            // 2. ÇOK YAKLAŞANLAR (Son 10 Gün)
            else if (kalanSure < 10) {
                tip = "acil"; // Turuncu
                baslik = "🚨 Doğum Çok Yakın";
                mesaj = `${h.isim || h.kupe_no} ineğinin doğumuna sadece ${kalanSure} gün kaldı.`;
            } 
            // 3. YAKLAŞANLAR (10 - 90 Gün)
            else if (kalanSure < 90) {
                tip = "yaklasiyor"; // Sarı
                baslik = "⏳ Doğum Yaklaşıyor";
                mesaj = `${h.isim || h.kupe_no} için ${kalanSure} gün kaldı.`;
            } 
            // 4. SON 100 GÜN
            else {
                tip = "yeni"; // Mavi/Yeşil
                baslik = "📝 Gebelik Takibi (Son 100 Gün)";
                mesaj = `${h.isim || h.kupe_no} son döneme girdi. Doğuma ${kalanSure} gün var.`;
            }

            const bildirimId = `bildirim_${h.id}_${kalanSure}_gun`;

            yeniBildirimler.push({
                id: bildirimId,
                tip: tip,
                baslik: baslik,
                mesaj: mesaj,
                hayvan: h
            });
        }
    });

    setBildirimler(yeniBildirimler);
  }, [hayvanlar, analizler]);

  // --- İŞLEMLER ---
  const bildirimKapat = (bildirimId) => {
      const yeniOkunanlar = [...okunanlar, bildirimId];
      setOkunanlar(yeniOkunanlar);
      localStorage.setItem('ciftlik_okunan_bildirimler', JSON.stringify(yeniOkunanlar));
  }

  const tekrarAktifEt = (bildirimId) => {
      const yeniList = okunanlar.filter(id => id !== bildirimId);
      setOkunanlar(yeniList);
      localStorage.setItem('ciftlik_okunan_bildirimler', JSON.stringify(yeniList));
      if (yeniList.length === 0) setArsivModalAcik(false);
  }

  const aktifListe = bildirimler.filter(b => !okunanlar.includes(b.id)); 
  const arsivListe = bildirimler.filter(b => okunanlar.includes(b.id));

  const stilGetir = (tip) => {
      switch(tip) {
          case 'gecikti': return { bg: 'bg-red-50 border-red-200', iconBg: 'bg-red-100 text-red-600', icon: <ExclamationTriangleIcon className="w-8 h-8"/>, text: 'text-red-800' };
          case 'acil': return { bg: 'bg-orange-50 border-orange-200', iconBg: 'bg-orange-100 text-orange-600', icon: <BellAlertIcon className="w-8 h-8"/>, text: 'text-orange-800' };
          case 'yaklasiyor': return { bg: 'bg-yellow-50 border-yellow-200', iconBg: 'bg-yellow-100 text-yellow-600', icon: <ClockIcon className="w-8 h-8"/>, text: 'text-yellow-800' };
          default: return { bg: 'bg-blue-50 border-blue-200', iconBg: 'bg-blue-100 text-blue-600', icon: <InformationCircleIcon className="w-8 h-8"/>, text: 'text-blue-800' };
      }
  }

  return (
    <div className="w-full animate-fade-in relative">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <BellAlertIcon className="h-8 w-8 text-yellow-500" /> Çiftlik Asistanı
            </h2>
            <button 
                onClick={() => setArsivModalAcik(true)} 
                disabled={okunanlar.length === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition ${okunanlar.length === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300'}`}
            >
                <TrashIcon className="h-5 w-5" />
                {okunanlar.length === 0 ? "Çöp Kutusu Boş" : `Çöp Kutusu (${okunanlar.length})`}
            </button>
        </div>

        {aktifListe.length === 0 ? (
             <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <CheckCircleIcon className="h-16 w-16 text-green-100 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-gray-700">Aktif Bildirim Yok</h3>
                <p className="text-gray-500">Şu an 100 günün altına düşen kritik bir işlem yok.</p>
             </div>
        ) : (
            <div className="space-y-4">
                {aktifListe.map(b => {
                    const stil = stilGetir(b.tip);
                    return (
                        <div key={b.id} className={`${stil.bg} p-5 rounded-xl border flex items-center gap-4 hover:shadow-md transition`}>
                            <div className={`p-3 rounded-full ${stil.iconBg}`}>{stil.icon}</div>
                            <div className="flex-1">
                                <h4 className={`text-lg font-bold ${stil.text}`}>{b.baslik}</h4>
                                <p className="text-gray-700">{b.mesaj}</p>
                            </div>
                            <button onClick={() => bildirimKapat(b.id)} className="px-4 py-2 bg-white border rounded-lg text-sm font-bold text-gray-600 hover:text-green-600 hover:border-green-300 shadow-sm">
                                Okundu
                            </button>
                        </div>
                    )
                })}
            </div>
        )}

        {arsivModalAcik && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 backdrop-blur-sm p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col animate-bounce-in">
                    <div className="bg-gray-100 p-4 border-b flex justify-between items-center">
                        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <TrashIcon className="h-6 w-6 text-gray-500" /> Arşiv
                        </h3>
                        <button onClick={() => setArsivModalAcik(false)} className="text-gray-500 hover:text-red-600 bg-white p-1 rounded-full border hover:bg-red-50 transition">
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>
                    <div className="p-6 overflow-y-auto flex-1 bg-gray-50 space-y-3">
                        {arsivListe.length === 0 ? (
                            <div className="text-center py-10 text-gray-400">Arşiv boş.</div>
                        ) : (
                            arsivListe.map(b => (
                                <div key={b.id} className="bg-white p-4 rounded-lg border border-gray-200 flex items-center justify-between shadow-sm opacity-75 hover:opacity-100 transition">
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-600 text-sm line-through decoration-gray-400">{b.baslik}</h4>
                                        <p className="text-gray-500 text-sm">{b.mesaj}</p>
                                    </div>
                                    <button onClick={() => tekrarAktifEt(b.id)} className="ml-4 flex items-center gap-1 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-blue-100 border border-blue-200 transition">
                                        <ArrowUturnLeftIcon className="h-4 w-4" /> Geri Al
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="p-4 bg-gray-100 border-t text-right">
                        <button onClick={() => setArsivModalAcik(false)} className="px-6 py-2 bg-gray-800 text-white rounded-lg font-bold hover:bg-gray-900 transition">
                            Kapat
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  )
}