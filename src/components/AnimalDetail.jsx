import { useEffect, useState } from 'react'
import axios from 'axios'
import { ArrowLeftIcon, CalendarDaysIcon, WrenchScrewdriverIcon, TagIcon } from '@heroicons/react/24/outline'

export default function AnimalDetail({ hayvanId, geriDon, islemPenceresiniAc }) {
  const [veri, setVeri] = useState(null)

  // Verileri Çek
  useEffect(() => {
    const zaman = new Date().getTime();
    axios.get(`http://127.0.0.1:8000/hayvanlar/${hayvanId}/detay?_=${zaman}`)
      .then(res => setVeri(res.data))
      .catch(err => console.error(err))
  }, [hayvanId])

  if (!veri) return <div className="p-10 text-center text-gray-500 text-xl">Kayıtlar getiriliyor...</div>

  const { bilgi, tarihce } = veri

  // Olay Tipine Göre İkon ve Renk Seçimi
  const getEventStyle = (tip) => {
    switch(tip) {
      case 'Dogum': return { icon: '🍼', color: 'bg-green-100 text-green-800 border-green-300', title: 'Doğum Yaptı' };
      case 'Tohumlama': return { icon: '🧬', color: 'bg-blue-100 text-blue-800 border-blue-300', title: 'Tohumlama' };
      case 'Asi': return { icon: '💉', color: 'bg-purple-100 text-purple-800 border-purple-300', title: 'Aşı / İlaç' };
      case 'Hastalik': return { icon: '🦠', color: 'bg-red-100 text-red-800 border-red-300', title: 'Hastalık Kaydı' };
      case 'Muayene': return { icon: '🩺', color: 'bg-yellow-100 text-yellow-800 border-yellow-300', title: 'Muayene' };
      case 'KuruyaAlma': return { icon: '🛑', color: 'bg-gray-100 text-gray-800 border-gray-300', title: 'Kuruya Alma' };
      default: return { icon: '📌', color: 'bg-gray-50 text-gray-700', title: tip };
    }
  }

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      
      {/* ÜST BAR */}
      <div className="flex items-center justify-between border-b pb-6 mb-8">
        <button onClick={geriDon} className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition font-bold text-lg">
            <ArrowLeftIcon className="h-6 w-6" /> Listeye Dön
        </button>
        <div className="flex gap-2">
            <button onClick={() => islemPenceresiniAc(bilgi)} className="bg-indigo-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition shadow-lg font-bold text-lg">
                <WrenchScrewdriverIcon className="h-6 w-6" /> Yeni İşlem Gir
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* SOL: KİMLİK KARTI */}
        <div className="bg-white p-8 rounded-3xl shadow-xl h-fit border border-gray-100">
            <div className="flex flex-col items-center border-b pb-8">
                <div className={`w-32 h-32 rounded-full flex items-center justify-center text-white font-bold text-6xl shadow-2xl mb-6 ${bilgi.cinsiyet === 'Dişi' ? 'bg-pink-500' : 'bg-blue-500'}`}>
                    {bilgi.cinsiyet === 'Dişi' ? 'D' : 'E'}
                </div>
                <h2 className="text-4xl font-bold text-gray-900 font-mono tracking-tight">#{bilgi.kupe_no}</h2>
                {bilgi.isim && (
                    <span className="mt-3 bg-gray-100 text-gray-600 px-4 py-1.5 rounded-lg text-lg font-medium border border-gray-200">
                        {bilgi.isim}
                    </span>
                )}
            </div>
            
            <div className="mt-8 space-y-6 text-lg">
                <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded transition">
                    <span className="text-gray-500 font-medium">Doğum Tarihi</span>
                    <span className="font-bold text-gray-800">{bilgi.dogum_tarihi}</span>
                </div>
                <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded transition">
                    <span className="text-gray-500 font-medium">Cinsiyet</span>
                    <span className="font-bold text-gray-800">{bilgi.cinsiyet}</span>
                </div>
                <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded transition">
                    <span className="text-gray-500 font-medium">Durum</span>
                    <span className="font-bold text-green-700 bg-green-100 px-3 py-1 rounded-lg border border-green-200">Aktif Sürüde</span>
                </div>
            </div>
        </div>

        {/* SAĞ: ZAMAN TÜNELİ */}
        <div className="lg:col-span-2 space-y-8">
            <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                <CalendarDaysIcon className="h-8 w-8 text-blue-600" /> Sağlık ve İşlem Geçmişi
            </h3>

            {tarihce.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl border-2 border-dashed border-gray-300 text-center text-gray-400 text-xl">
                    Henüz kayıtlı bir işlem yok.
                </div>
            ) : (
                <div className="space-y-0">
                    {tarihce.map((olay, index) => {
                        const style = getEventStyle(olay.olay_tipi)
                        
                        // --- ÖZEL AYRIŞTIRMA MANTIĞI ---
                        let aciklamaMetni = olay.aciklama;
                        let irkBilgisi = null;

                        // Eğer açıklamada [Irk: Simental] gibi bir şey varsa yakala
                        if (aciklamaMetni && aciklamaMetni.includes('[Irk:')) {
                            const match = aciklamaMetni.match(/\[Irk:\s*(.*?)\]/);
                            if (match) {
                                irkBilgisi = match[1]; // Sadece ırk adını al (örn: Simental)
                                aciklamaMetni = aciklamaMetni.replace(match[0], '').trim(); // O kısmı metinden sil
                            }
                        }
                        // ------------------------------

                        return (
                            <div key={index} className="flex gap-6 relative">
                                {/* Çizgi */}
                                {index !== tarihce.length - 1 && (
                                    <div className="absolute left-8 top-16 bottom-0 w-1 bg-gray-200"></div>
                                )}
                                
                                {/* İkon */}
                                <div className={`w-16 h-16 rounded-full flex-shrink-0 flex items-center justify-center text-3xl shadow-lg z-10 bg-white border-4 border-gray-100`}>
                                    {style.icon}
                                </div>

                                {/* Kart */}
                                <div className="flex-1 bg-white p-6 rounded-2xl shadow-md border border-gray-200 mb-8 hover:shadow-xl hover:-translate-y-1 transition duration-300">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                                        <span className={`px-4 py-2 rounded-lg text-base font-bold uppercase tracking-wide border ${style.color}`}>
                                            {style.title}
                                        </span>
                                        <p className="text-gray-500 text-lg font-medium flex items-center gap-2">
                                            🕒 {olay.tarih}
                                        </p>
                                    </div>

                                    {/* EĞER IRK VARSA BURADA GÜZEL BİR ETİKET OLARAK GÖSTER */}
                                    {irkBilgisi && (
                                        <div className="mb-3 inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg border border-indigo-200 shadow-sm">
                                            <TagIcon className="h-5 w-5" />
                                            <span className="font-bold text-sm uppercase tracking-wider">Irk: {irkBilgisi}</span>
                                        </div>
                                    )}
                                    
                                    {/* Kalan Açıklama Metni (Varsa) */}
                                    {aciklamaMetni && (
                                        <div className="bg-gray-50 p-4 rounded-xl text-gray-700 text-lg border-l-8 border-gray-300 leading-relaxed">
                                            {aciklamaMetni}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
      </div>
    </div>
  )
}