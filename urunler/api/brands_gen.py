import json, pathlib, re, unicodedata

# ► Giriş / çıkış dosyaları
src = pathlib.Path(__file__).with_suffix('').with_name('products.json')
out = pathlib.Path(__file__).with_suffix('').with_name('brands.json')

def slugify(text: str) -> str:
    # ── 12 karakter  ─────────────────────── 12 karakter ──
    tr_map = str.maketrans("ÇĞİÖŞÜçğıöşü", "CGIOSUcgiosu")
    text = text.translate(tr_map)
    text = unicodedata.normalize("NFD", text).encode("ascii", "ignore").decode()
    text = re.sub(r"[^0-9a-zA-Z\s-]", "", text).lower()
    return re.sub(r"[\s-]+", "-", text).strip("-")

# ► Markaları topla
brands = set()
for p in json.loads(src.read_text(encoding="utf-8")):
    if p.get("brand"):
        brands.add(p["brand"].strip())

# ► JSON yaz
data = [{"name": b, "slug": slugify(b)} for b in sorted(brands)]
out.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"{len(data)} marka yazıldı → {out}")
