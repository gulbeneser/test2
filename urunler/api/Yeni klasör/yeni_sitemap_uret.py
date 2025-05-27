#!/usr/bin/env python3
# -------------------------------------
#  yeni_sitemap_uret.py
# -------------------------------------
import json, re, unicodedata, datetime, xml.etree.ElementTree as ET
from pathlib import Path

# ---------- slugify (sitedeki JS ile birebir) ----------
def slugify(text: str) -> str:
    text = str(text)
    tr_map = str.maketrans("ÇĞİÖŞÜçğıöşü", "CGIOSUcgio su")
    text = text.translate(tr_map)
    text = unicodedata.normalize('NFD', text).encode('ascii', 'ignore').decode()
    text = re.sub(r'(\d+)\s*(ml|gr|lt)', r'\1-\2', text, flags=re.I)
    text = re.sub(r'[^\w\s-]', '', text.lower())
    text = re.sub(r'\s+', '-', text)
    text = re.sub(r'-+', '-', text).strip('-')
    return text

# ---------- dosyaları oku ----------
def load_json(path):
    with open(path, encoding='utf-8') as f:
        return json.load(f)

dermo_products  = load_json('dermokozmetik.json')
animal_products = load_json('hayvan-sagligi.json')

today = datetime.date.today().isoformat()

# ---------- eski sitemap (statik URL’ler) ----------
old_urls = []
if Path('sitemap.xml').exists():
    old_root = ET.parse('sitemap.xml').getroot()
    old_urls  = old_root.findall('{*}url')

# ---------- yeni <urlset> ----------
urlset = ET.Element('urlset', xmlns="http://www.sitemaps.org/schemas/sitemap/0.9")
urlset.extend(old_urls)       # statik sayfalar korundu

def add_url(loc, lastmod=today, changefreq='monthly', priority='0.8'):
    url = ET.SubElement(urlset, 'url')
    ET.SubElement(url, 'loc').text        = loc
    ET.SubElement(url, 'lastmod').text    = lastmod
    ET.SubElement(url, 'changefreq').text = changefreq
    ET.SubElement(url, 'priority').text   = priority

# ---------- dermokozmetik ----------
for p in dermo_products:
    slug = slugify(p.get('ProductName', 'urun'))
    loc  = f'https://www.serakinci.com/urunler/dermokozmetik/product/{slug}/'
    last = str(p.get('LastModified') or p.get('updatedAt') or today)[:10]
    add_url(loc, last)

# ---------- hayvan sağlığı ----------
for p in animal_products:
    slug = slugify(p.get('ProductName', 'urun'))
    loc  = f'https://www.serakinci.com/urunler/hayvan-sagligi/product/{slug}/'
    last = str(p.get('LastModified') or p.get('updatedAt') or today)[:10]
    add_url(loc, last)

# ---------- dosyaya yaz ----------
ET.indent(urlset)                       # Python ≥3.9
ET.ElementTree(urlset).write('sitemap.xml', encoding='utf-8', xml_declaration=True)
print('✅ sitemap.xml üretildi — toplam URL:', len(urlset))
