import { PlusCircleIcon, TrashIcon, WrenchScrewdriverIcon, EyeIcon } from '@heroicons/react/24/outline'

export default function AnimalList({ hayvanlar, analizler, istatistik, aktifSayfa, setModalAcik, sil, islemPenceresiniAc, detayAc }) {

  const gunFarkiHesapla = (tarihStr) => {
    if (!tarihStr) return 0;
    return Math.floor((new Date() - new Date(tarihStr)) / (1000 * 60 * 60 * 24));
  }

  const isAnacInek = (h) => {
      const rapor = analizler[h.id];
      if (rapor && rapor.durum === 'Gebe') return true;
      if (gunFarkiHesapla(h.dogum_tarihi) >= 730) return true;
      return false;
  }

  const filtrelenmisListe = hayvanlar.filter(h => {
    if (aktifSayfa === 'liste') return h.cinsiyet === 'Dişi' && isAnacInek(h);
    if (aktifSayfa === 'disi_buzagi') return h.cinsiyet === 'Dişi' && !isAnacInek(h);
    if (aktifSayfa === 'erkek_buzagi') return h.cinsiyet === 'Erkek';
    return true;
  });

  const getGosterimVerileri = (rapor) => {
      if (!rapor) return { etiket: 'Boş', stil: 'bg-gray-100 text-gray-500', mesaj: '' };
      let veri = { etiket: '', stil: '', mesaj: rapor.mesaj };
      if (rapor.durum === 'Gebe') {
          veri.etiket = "Gebe (Dolu)";
          veri.stil = "bg-green-100 text-green-700 border border-green-200";
      } else if (rapor.durum === 'BosIptal') {
          veri.etiket = "Boş (Tohum Tutmadı)";
          veri.stil = "bg-red-100 text-red-700 border border-red-200";
      } else if (rapor.durum === 'Lohusa') {
          veri.etiket = "Boş (Yeni Doğum)";
          veri.stil = "bg-blue-50 text-blue-700 border border-blue-200";
      } else {
          veri.etiket = "Boş";
          veri.stil = "bg-gray-100 text-gray-500 border border-gray-200";
          if (rapor.mesaj && rapor.mesaj.includes("Kayıtlı işlem yok")) veri.mesaj = "";
      }
      return veri;
  }

  let baslik = aktifSayfa === 'disi_buzagi' ? "🌸 Dişi Buzağılar" : aktifSayfa === 'erkek_buzagi' ? "⚡ Erkekler" : "🐄 Anaç İnekler";

  return (
    <div className="w-full">
      {aktifSayfa === 'liste' && istatistik && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatsBox title="Gebe (Dolu)" val={istatistik.dolu_inek} sub="Takip edilen" color="green" />
            <StatsBox title="Boş" val={istatistik.bos_inek} sub="Tohumlanacak" color="red" />
            <StatsBox title="Sağılan" val={istatistik.sagilan} sub="Aktif sağım" color="yellow" />
        </div>
      )}

      <div className="flex justify-between items-center mb-6 pb-4 border-b">
        <h2 className="text-2xl font-bold text-gray-800">{baslik}</h2>
        <button onClick={setModalAcik} className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-blue-700 flex items-center gap-2 transition shadow-md">
          <PlusCircleIcon className="h-6 w-6" /> Yeni Ekle
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 w-full">
        {filtrelenmisListe.map(h => {
            const rapor = analizler[h.id];
            const gosterim = getGosterimVerileri(rapor);
            const yasAy = Math.floor(gunFarkiHesapla(h.dogum_tarihi) / 30);

            return (
              <div key={h.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col lg:flex-row justify-between items-center gap-6 hover:shadow-md transition">
                <div className="flex items-center gap-6 w-full lg:w-auto">
                  
                  {/* FOTOĞRAF ALANI GÜNCELLENDİ */}
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-inner overflow-hidden shrink-0 ${h.cinsiyet === 'Dişi' ? 'bg-pink-500' : 'bg-blue-500'}`}>
                     {h.fotograf_url ? (
                       <img src={h.fotograf_url} alt="hayvan" className="w-full h-full object-cover" />
                     ) : (
                       <span>{h.cinsiyet === 'Dişi' ? 'D' : 'E'}</span>
                     )}
                  </div>

                  <div>
                    <h3 className="font-bold text-xl text-gray-800 flex items-center gap-2">#{h.kupe_no} {h.isim && <span className="text-sm font-normal text-gray-500 bg-gray-50 px-2 py-0.5 rounded border">{h.isim}</span>}</h3>
                    <p className="text-sm text-gray-500 mt-1">📅 {h.dogum_tarihi} ({yasAy} Ay)</p>
                  </div>
                </div>

                <div className="flex-1 w-full lg:text-center flex flex-col items-center">
                   <span className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm mb-1 ${gosterim.stil}`}>{gosterim.etiket}</span>
                   <span className="text-sm text-gray-600 font-medium">{gosterim.mesaj}</span>
                </div>

                <div className="flex gap-3 w-full lg:w-auto justify-end">
                  <button onClick={() => detayAc(h.id)} className="px-5 py-2.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 flex items-center gap-2 border border-blue-200 font-bold"><EyeIcon className="h-5 w-5" /> Detay</button>
                  <button onClick={() => islemPenceresiniAc(h)} className="px-5 py-2.5 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 flex items-center gap-2 border border-indigo-200 font-bold"><WrenchScrewdriverIcon className="h-5 w-5" /> İşlem</button>
                  <button onClick={() => sil(h.id)} className="px-5 py-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 flex items-center gap-2 border border-red-200 font-medium"><TrashIcon className="h-5 w-5" /> Sil</button>
                </div>
              </div>
            )
        })}
      </div>
    </div>
  )
}

function StatsBox({ title, val, sub, color }) {
    const colors = { green: "bg-green-100 border-green-500 text-green-900", red: "bg-red-100 border-red-500 text-red-900", yellow: "bg-yellow-100 border-yellow-500 text-yellow-900" }
    return (
        <div className={`${colors[color]} border-l-8 p-6 rounded-r-xl shadow-sm flex justify-between items-center`}>
            <div><h3 className="font-bold text-lg">{title}</h3><p className="text-sm opacity-80">{sub}</p></div>
            <p className="text-4xl font-bold">{val}</p>
        </div>
    )
}