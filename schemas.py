from pydantic import BaseModel
from datetime import date
from typing import Optional, List

# --- Olay Şemaları ---
class OlayBase(BaseModel):
    olay_tipi: str 
    tarih: date
    aciklama: Optional[str] = None

class OlayCreate(OlayBase):
    hayvan_id: int

class Olay(OlayBase):
    id: int
    hayvan_id: int
    class Config:
        from_attributes = True # <-- BURASI DEĞİŞTİ

# --- Hayvan Şemaları ---
class HayvanBase(BaseModel):
    kupe_no: str
    isim: Optional[str] = None
    cinsiyet: str
    dogum_tarihi: date
    anne_kupe_no: Optional[str] = None
    baba_kupe_no: Optional[str] = None
    fotograf_url: Optional[str] = None

class HayvanCreate(HayvanBase):
    pass

class Hayvan(HayvanBase):
    id: int
    aktif_mi: bool
    olaylar: List[Olay] = [] 

    class Config:
        from_attributes = True # <-- BURASI DEĞİŞTİ