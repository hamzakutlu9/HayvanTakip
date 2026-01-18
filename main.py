from fastapi import FastAPI, Depends, HTTPException, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc
from typing import List, Optional
from datetime import date, timedelta
import shutil
import os
import models, schemas
from database import SessionLocal, engine, Base

# Tabloları oluştur
Base.metadata.create_all(bind=engine)

app = FastAPI()

# Uploads Klasörü
UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# CORS (Bağlantı İzni)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()

# ANALİZ FONKSİYONU (Hata Korumalı)
def detayli_analiz_hesapla(hayvan_id: int, db: Session):
    olaylar = db.query(models.Olay).filter(models.Olay.hayvan_id == hayvan_id).order_by(asc(models.Olay.tarih)).all()
    bugun = date.today()
    sonuc = {"son_olay": "Boş", "renk": "gri", "mesaj": "Kayıtlı işlem yok.", "uyari": "Boş", "durum": "Boş", "tahmini_dogum": None, "son_olay_tarihi": None}
    
    if not olaylar: return sonuc

    aktif_tohumlama_tarihi = None
    for olay in olaylar:
        if olay.olay_tipi == "Tohumlama": aktif_tohumlama_tarihi = olay.tarih
        elif olay.olay_tipi in ["Dogum", "GebelikIptal"]: aktif_tohumlama_tarihi = None

    son_islem = olaylar[-1]
    sonuc["son_olay"] = son_islem.olay_tipi
    sonuc["son_olay_tarihi"] = son_islem.tarih

    if aktif_tohumlama_tarihi:
        tahmini = aktif_tohumlama_tarihi + timedelta(days=280)
        kalan = (tahmini - bugun).days
        sonuc.update({"durum": "Gebe", "tahmini_dogum": tahmini})
        if kalan < 0: sonuc.update({"mesaj": f"Doğum geçti!", "renk": "kirmizi", "uyari": "GEÇ"})
        else:
            sonuc["mesaj"] = f"Doğuma {kalan} gün"
            sonuc["renk"] = "kirmizi" if kalan <= 15 else "sari" if kalan <= 90 else "yesil"
            sonuc["uyari"] = "DOĞUM YAKIN" if kalan <= 15 else "KURUYA AL" if kalan <= 90 else "Gebe"
    return sonuc

@app.get("/ozet")
def get_ozet(db: Session = Depends(get_db)):
    try:
        hayvanlar = db.query(models.Hayvan).all()
        bugun = date.today()
        istatistik = {"toplam_hayvan": len(hayvanlar), "inek_sayisi": 0, "buzagi_sayisi": 0, "tosun_sayisi": 0, "dolu_inek": 0, "bos_inek": 0, "sagilan": 0}
        
        for h in hayvanlar:
            yas = (bugun - h.dogum_tarihi).days
            if h.cinsiyet == "Erkek": istatistik["tosun_sayisi"] += 1
            else:
                if yas < 180: istatistik["buzagi_sayisi"] += 1
                else: istatistik["inek_sayisi"] += 1
                
                # Gebe/Boş ve Sağım hesabı
                analiz = detayli_analiz_hesapla(h.id, db)
                if analiz["durum"] == "Gebe": istatistik["dolu_inek"] += 1
                else: istatistik["bos_inek"] += 1
                
                dogumlar = [o for o in h.olaylar if o.olay_tipi == "Dogum"]
                if dogumlar:
                    son_dogum = max(dogumlar, key=lambda x: x.tarih)
                    if (bugun - son_dogum.tarih).days < 305:
                        istatistik["sagilan"] += 1
        return istatistik
    except Exception as e:
        print(f"HATA: {str(e)}")
        return {"toplam_hayvan": 0, "inek_sayisi": 0, "buzagi_sayisi": 0, "tosun_sayisi": 0, "dolu_inek": 0, "bos_inek": 0, "sagilan": 0}

@app.post("/hayvanlar/")
async def create_hayvan(
    kupe_no: str = Form(...),
    isim: Optional[str] = Form(None),
    dogum_tarihi: str = Form(...),
    cinsiyet: str = Form(...),
    fotograf: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    fotograf_url = None
    if fotograf:
        file_path = f"{UPLOAD_DIR}/{kupe_no}_{fotograf.filename}"
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(fotograf.file, buffer)
        fotograf_url = f"http://127.0.0.1:8000/{file_path}"
    
    new_h = models.Hayvan(kupe_no=kupe_no, isim=isim, dogum_tarihi=date.fromisoformat(dogum_tarihi), cinsiyet=cinsiyet, fotograf_url=fotograf_url)
    db.add(new_h); db.commit(); db.refresh(new_h)
    return new_h

@app.get("/hayvanlar/", response_model=List[schemas.Hayvan])
def read_hayvanlar(db: Session = Depends(get_db)):
    return db.query(models.Hayvan).all()

@app.get("/hayvanlar/{id}/detay")
def get_detay(id: int, db: Session = Depends(get_db)):
    h = db.query(models.Hayvan).filter(models.Hayvan.id == id).first()
    o = db.query(models.Olay).filter(models.Olay.hayvan_id == id).order_by(desc(models.Olay.tarih)).all()
    return {"bilgi": h, "tarihce": o}

@app.delete("/hayvanlar/{id}")
def delete_hayvan(id: int, db: Session = Depends(get_db)):
    db.query(models.Olay).filter(models.Olay.hayvan_id == id).delete()
    db.query(models.Hayvan).filter(models.Hayvan.id == id).delete()
    db.commit(); return {"ok": True}

@app.post("/olaylar/")
def create_olay(olay: schemas.OlayCreate, db: Session = Depends(get_db)):
    db_olay = models.Olay(**olay.dict()); db.add(db_olay); db.commit(); return db_olay

@app.get("/analiz/{id}")
def get_analiz(id: int, db: Session = Depends(get_db)):
    return detayli_analiz_hesapla(id, db)