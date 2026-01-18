import { useState, useEffect } from 'react'
import axios from 'axios'

// Bileşen Importları
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import Assistant from './components/Assistant' 
import AnimalList from './components/AnimalList'

// MODALLAR
import { HayvanEkleModal, IslemEkleModal, HayvanDetayModal } from './components/Modals'

function App() {
  const [aktifSayfa, setAktifSayfa] = useState('ozet')
  
  const [istatistik, setIstatistik] = useState(null)
  const [hayvanlar, setHayvanlar] = useState([])
  const [analizler, setAnalizler] = useState({})
  
  const [modalAcik, setModalAcik] = useState(false)
  const [olayModalAcik, setOlayModalAcik] = useState(false)
  const [detayModalAcik, setDetayModalAcik] = useState(false)
  
  const [islemYapilacakHayvan, setIslemYapilacakHayvan] = useState(null)
  const [detayVerisi, setDetayVerisi] = useState(null)

  const [form, setForm] = useState({ 
    kupe_no: "", 
    isim: "", 
    cinsiyet: "Dişi", 
    dogum_tarihi: "",
    fotograf: null 
  })
  
  const [olayForm, setOlayForm] = useState({ 
      olay_tipi: "Tohumlama", 
      tarih: "", 
      aciklama: "",
      tohum_cinsi: "Simental" 
  })

  const veriGuncelle = () => {
    const ts = new Date().getTime(); 
    axios.get(`http://127.0.0.1:8000/ozet?_=${ts}`)
        .then(res => setIstatistik(res.data))
        .catch(err => console.error("Özet Hatası:", err))

    axios.get(`http://127.0.0.1:8000/hayvanlar/?_=${ts}`)
        .then(res => {
            setHayvanlar(res.data)
            res.data.forEach(h => analizGetir(h.id))
        })
        .catch(err => console.error("Liste Hatası:", err))
  }

  const analizGetir = (id) => {
      const ts = new Date().getTime();
      axios.get(`http://127.0.0.1:8000/analiz/${id}?_=${ts}`)
           .then(res => setAnalizler(prev => ({ ...prev, [id]: res.data })))
           .catch(err => console.error("Analiz Hatası:", err));
  }

  useEffect(() => { veriGuncelle() }, [])

  const kaydet = (e) => {
    e.preventDefault()
    const formData = new FormData();
    formData.append("kupe_no", form.kupe_no);
    formData.append("isim", form.isim || "");
    formData.append("dogum_tarihi", form.dogum_tarihi);
    formData.append("cinsiyet", form.cinsiyet);
    if (form.fotograf) { formData.append("fotograf", form.fotograf); }

    axios.post('http://127.0.0.1:8000/hayvanlar/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })
    .then(() => {
        alert("✅ Hayvan Başarıyla Kaydedildi"); 
        setModalAcik(false); 
        setForm({ kupe_no: "", isim: "", cinsiyet: "Dişi", dogum_tarihi: "", fotograf: null }); 
        veriGuncelle()
      })
      .catch(err => alert("Kayıt Hatası!"));
  }

  const sil = (id) => {
    if(window.confirm("Bu hayvanı ve geçmişini silmek istediğine emin misin?")) {
      axios.delete(`http://127.0.0.1:8000/hayvanlar/${id}`).then(() => veriGuncelle());
    }
  }

  const islemSil = (islemId) => {
      axios.delete(`http://127.0.0.1:8000/olaylar/${islemId}`)
          .then(() => {
              if (detayVerisi) { detayAc(detayVerisi.bilgi.id); }
              veriGuncelle();
          });
  }

  const detayAc = (id) => {
      const ts = new Date().getTime();
      axios.get(`http://127.0.0.1:8000/hayvanlar/${id}/detay?_=${ts}`)
          .then(res => {
              setDetayVerisi(res.data);
              setDetayModalAcik(true);
          });
  }

  // --- İŞLEM KAYDETME (DÜZELTİLDİ) ---
  const olayKaydet = (e) => {
    e.preventDefault()
    
    // Veriyi hem açıklama içine hem de ayrı alan olarak gönderiyoruz
    const gonderilecekVeri = {
        olay_tipi: olayForm.olay_tipi,
        tarih: olayForm.tarih,
        aciklama: olayForm.aciklama,
        tohum_cinsi: olayForm.olay_tipi === "Tohumlama" ? olayForm.tohum_cinsi : null, // AYRI GÖNDERİM
        hayvan_id: islemYapilacakHayvan.id
    }

    axios.post('http://127.0.0.1:8000/olaylar/', gonderilecekVeri)
        .then(() => {
            setOlayModalAcik(false); 
            setOlayForm({ olay_tipi: "Tohumlama", tarih: "", aciklama: "", tohum_cinsi: "Simental" }); 
            veriGuncelle();
            if(detayModalAcik) detayAc(islemYapilacakHayvan.id); // Detay sayfası açıksa yenile
        })
        .catch(err => alert("İşlem kaydedilemedi."));
  }

  const yeniEkleTiklandi = () => {
      let otomatikCinsiyet = (aktifSayfa === 'erkek_buzagi') ? "Erkek" : "Dişi";
      setForm({ kupe_no: "", isim: "", cinsiyet: otomatikCinsiyet, dogum_tarihi: "", fotograf: null });
      setModalAcik(true);
  }

  return (
    <div className="flex h-screen bg-slate-100 font-sans overflow-hidden">
      <Sidebar aktifSayfa={aktifSayfa} setAktifSayfa={setAktifSayfa} />
      <div className="flex-1 ml-72 p-10 overflow-y-auto w-full h-full">
            {aktifSayfa === 'ozet' && <Dashboard istatistik={istatistik} />}
            {aktifSayfa === 'asistan' && <Assistant hayvanlar={hayvanlar} analizler={analizler} />}
            {['liste', 'disi_buzagi', 'erkek_buzagi'].includes(aktifSayfa) && (
                <AnimalList 
                    hayvanlar={hayvanlar} 
                    analizler={analizler} 
                    istatistik={istatistik} 
                    aktifSayfa={aktifSayfa} 
                    setModalAcik={yeniEkleTiklandi} 
                    sil={sil}
                    islemPenceresiniAc={(h) => { setIslemYapilacakHayvan(h); setOlayModalAcik(true) }}
                    detayAc={detayAc}
                />
            )}
      </div>

      <HayvanEkleModal acik={modalAcik} setAcik={setModalAcik} kaydet={kaydet} form={form} setForm={setForm} />
      <IslemEkleModal acik={olayModalAcik} setAcik={setOlayModalAcik} kaydet={olayKaydet} form={olayForm} setForm={setOlayForm} seciliHayvan={islemYapilacakHayvan} />
      <HayvanDetayModal acik={detayModalAcik} setAcik={setDetayModalAcik} detayVerisi={detayVerisi} islemSil={islemSil} />
    </div>
  )
}

export default App;