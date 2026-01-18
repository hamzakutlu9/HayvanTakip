import { 
    ChartPieIcon, 
    ClipboardDocumentListIcon, 
    HeartIcon,     
    BoltIcon,
    BellAlertIcon // <-- Bunu ekledik
  } from '@heroicons/react/24/outline'
  
  export default function Sidebar({ aktifSayfa, setAktifSayfa }) {
    
    const btnClass = (sayfaAdi, renkClass) => 
      `w-full text-left p-4 rounded-xl flex items-center gap-4 transition-all duration-200 font-medium ${aktifSayfa === sayfaAdi ? `${renkClass} text-white shadow-lg` : 'hover:bg-slate-800 text-gray-300 hover:text-white'}`
  
    return (
      <div className="w-72 bg-slate-900 text-white flex flex-col p-6 shadow-2xl z-20 overflow-y-auto h-screen fixed left-0 top-0">
        <h1 className="text-3xl font-bold mb-12 flex items-center gap-3 select-none tracking-tight">
            🐄 Çiftlik<span className="text-blue-400">Takip</span>
        </h1>
        
        <nav className="space-y-3 flex-1">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 pl-2">Genel Bakış</p>
          <button onClick={() => setAktifSayfa('ozet')} className={btnClass('ozet', 'bg-blue-600')}>
            <ChartPieIcon className="h-6 w-6" /> Sürü Nüfusu
          </button>

          {/* YENİ EKLENEN ASİSTAN MENÜSÜ */}
          <button onClick={() => setAktifSayfa('asistan')} className={btnClass('asistan', 'bg-yellow-600')}>
            <BellAlertIcon className="h-6 w-6" /> Çiftlik Asistanı
          </button>
          
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-8 mb-2 pl-2">Yönetim</p>
          <button onClick={() => setAktifSayfa('liste')} className={btnClass('liste', 'bg-blue-600')}>
            <ClipboardDocumentListIcon className="h-6 w-6" /> İnek Listesi
          </button>
  
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-8 mb-2 pl-2">Buzağılar</p>
          <button onClick={() => setAktifSayfa('disi_buzagi')} className={btnClass('disi_buzagi', 'bg-pink-600')}>
            <HeartIcon className="h-6 w-6" /> Dişi Buzağılar
          </button>
          <button onClick={() => setAktifSayfa('erkek_buzagi')} className={btnClass('erkek_buzagi', 'bg-blue-600')}>
            <BoltIcon className="h-6 w-6" /> Erkek Buzağılar
          </button>
        </nav>
        <div className="mt-8 text-xs text-slate-500 pt-6 border-t border-slate-800 text-center">&copy; 2026 Çiftlik Yönetim</div>
      </div>
    )
  }