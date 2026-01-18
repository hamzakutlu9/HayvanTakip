from sqlalchemy import Column, Integer, String, Date, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Hayvan(Base):
    __tablename__ = "hayvanlar"

    # BU SATIR ÇOK ÖNEMLİ - HATAYI VEREN YER BURASIYDI
    id = Column(Integer, primary_key=True, index=True) 
    
    kupe_no = Column(String, unique=True, index=True)
    isim = Column(String, nullable=True)
    cinsiyet = Column(String)
    dogum_tarihi = Column(Date)
    anne_kupe_no = Column(String, nullable=True)
    baba_kupe_no = Column(String, nullable=True)
    aktif_mi = Column(Boolean, default=True)
    fotograf_url = Column(String, nullable=True)

    # Bir hayvanın birden çok olayı olabilir
    olaylar = relationship("Olay", back_populates="hayvan")

class Olay(Base):
    __tablename__ = "olaylar"

    # BURADA DA PRIMARY KEY OLMALI
    id = Column(Integer, primary_key=True, index=True)
    
    hayvan_id = Column(Integer, ForeignKey("hayvanlar.id"))
    olay_tipi = Column(String) 
    tarih = Column(Date)
    aciklama = Column(String, nullable=True)

    hayvan = relationship("Hayvan", back_populates="olaylar")