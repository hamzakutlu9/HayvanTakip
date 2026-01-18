export default function Dashboard({ istatistik }) {
    if (!istatistik) return <div className="text-center p-10 text-gray-500">Veriler yükleniyor...</div>
  
    return (
      <div className="space-y-6 animate-fade-in w-full">
        <h2 className="text-2xl font-bold text-gray-800 border-b pb-4">📊 Çiftlik Nüfus Özeti</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5 gap-6">
          <InfoCard title="Toplam Mevcut" value={istatistik.toplam_hayvan} color="bg-blue-600" />
          <InfoCard title="Anaç İnek" value={istatistik.inek_sayisi} color="bg-purple-600" />
          <InfoCard title="Dişi/Düve" value={istatistik.buzagi_sayisi} color="bg-pink-500" />
          <InfoCard title="Tosun/Erkek" value={istatistik.tosun_sayisi} color="bg-indigo-500" />
        </div>
      </div>
    )
  }
  
  function InfoCard({ title, value, sub, color }) {
    return (
      <div className={`${color} text-white p-6 rounded-xl shadow-lg transform hover:scale-105 transition`}>
        <h3 className="text-lg opacity-80">{title}</h3>
        <p className="text-5xl font-bold">{value}</p>
        {sub && <span className="text-sm opacity-75">{sub}</span>}
      </div>
    )
  }