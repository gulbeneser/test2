const fs = require('fs');
const path = require('path');
try {
  require('dotenv').config();
} catch {}
const { GoogleGenerativeAI } = require('@google/generative-ai');

const dermoPath = path.join(__dirname, 'urunler', 'api', 'products.json');
const animalPath = path.join(__dirname, 'urunler', 'api', 'hayvan-sagligi.json');
const dermoTemplate = path.join(__dirname, 'urunler', 'dermokozmetik', 'product', 'template.html');
const animalTemplate = path.join(__dirname, 'urunler', 'hayvan-sagligi', 'product', 'template.html');

const languages = ['tr', 'en', 'ru'];

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const translationModel = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash-preview-04-17'
});

const cachePath = path.join(__dirname, 'translation_cache.json');
let translationCache = {};
try {
  translationCache = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
} catch {}

async function translateText(text, targetLang) {
  if (targetLang === 'tr') return text;
  if (!text) return '';
  const key = `${targetLang}:${text}`;
  if (translationCache[key]) return translationCache[key];
  const prompt = `Translate this text to ${targetLang}:\n${text}`;
  const result = await translationModel.generateContent(prompt);
  const translated = result?.response?.text()?.trim() || text;
  translationCache[key] = translated;
  fs.writeFileSync(cachePath, JSON.stringify(translationCache, null, 2));
  return translated;
}

function slugify(text) {
  if (text == null) return 'isimsiz-urun';
  let str = String(text);
  const trMap = { 'ç':'c','Ç':'C','ğ':'g','Ğ':'G','ı':'i','İ':'I','ö':'o','Ö':'O','ş':'s','Ş':'S','ü':'u','Ü':'U' };
  for (const key in trMap) str = str.replace(new RegExp(key, 'g'), trMap[key]);
  str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  str = str.replace(/\//g, '').replace(/[\.,]/g, '');
  str = str.toLowerCase();
  str = str.replace(/(\d+)\s+(sensibio)/g, '$1$2');
  const units = 'ml|gr|l|kg|mg|cm|m|lt';
  str = str.replace(new RegExp(`\\b(${units})\\s+(shower|gel)\\b`, 'gi'), '$1$2');
  str = str.replace(new RegExp(`(\\d+)\\s*(${units})\\b`, 'gi'), '$1-$2');
  str = str.replace(/\s+/g, '-').replace(/[^\w-]+/g, '-').replace(/--+/g, '-').replace(/^-+|-+$/g, '');
  return str || 'isimsiz-urun';
}

async function loadTemplate(segment) {
  const file = segment === 'dermokozmetik' ? dermoTemplate : animalTemplate;
  return fs.promises.readFile(file, 'utf8');
}

async function downloadImages(products) {
  const outDir = path.join(__dirname, 'urunler', 'api', 'gorseller');
  await fs.promises.mkdir(outDir, { recursive: true });
  for (const p of products) {
    if (!p || !p.ImageUrl || !p.ProductCode) continue;
    const url = new URL(p.ImageUrl);
    const dir = path.dirname(url.pathname);
    const ext = path.extname(url.pathname) || '.jpg';
    const name = path.basename(url.pathname, ext);
    const attempts = new Set();
    attempts.add(url.href);
    if (name.endsWith('_1')) {
      attempts.add(`${url.origin}${dir}/${name.replace(/_1$/, '')}${ext}`);
    } else {
      attempts.add(`${url.origin}${dir}/${name}_1${ext}`);
    }
    if (!name.includes('_') && /\d$/.test(name)) {
      attempts.add(`${url.origin}${dir}/${name.replace(/(\d)$/,'_$1')}${ext}`);
    }

    let saved = false;
    for (const attempt of attempts) {
      try {
        const res = await fetch(attempt);
        if (!res.ok) throw new Error(res.statusText);
        const arrayBuffer = await res.arrayBuffer();
        const dest = path.join(outDir, `${p.ProductCode}${path.extname(new URL(attempt).pathname) || ext}`);
        await fs.promises.writeFile(dest, Buffer.from(arrayBuffer));
        saved = true;
        break;
      } catch (err) {
        continue;
      }
    }
    if (!saved) {
      console.warn('Image download failed for', p.ImageUrl);
    }
  }
}

async function createPages(products, segment, lang) {
  const template = await loadTemplate(segment);
  const list = [];
  for (const p of products) {
    if (!p || !p.ProductName) continue;
    const name = await translateText(p.ProductName, lang);
    const slug = slugify(name);
    const outDir = path.join(__dirname, lang, 'urunler', segment, 'product-pages', slug);
    await fs.promises.mkdir(outDir, { recursive: true });
    let page = template.replace('<html lang="tr">', `<html lang="${lang}">`);
    const hreflang = languages
      .map(l => `<link rel="alternate" hreflang="${l}" href="/${l}/urunler/${segment}/product-pages/${slug}/" />`)
      .join('\n');
    page = page.replace('</head>', `${hreflang}\n</head>`);
    await fs.promises.writeFile(path.join(outDir, 'index.html'), page);
    list.push({ slug, name });
  }
  await createIndex(list, segment, lang);
}

async function createIndex(items, segment, lang) {
  const links = items
    .map(({ slug, name }) => `    <li><a href="${slug}/">${name}</a></li>`)
    .join('\n');
  const html = `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${segment} product pages</title>
</head>
<body>
  <h1>${segment} product pages</h1>
  <ul>
${links}
  </ul>
</body>
</html>`;
  const outPath = path.join(
    __dirname,
    lang,
    'urunler',
    segment,
    'product-pages',
    'index.html'
  );
  await fs.promises.mkdir(path.dirname(outPath), { recursive: true });
  await fs.promises.writeFile(outPath, html);
}

function extractStaticUrls() {
  const sitemapPath = path.join(__dirname, 'sitemap.xml');
  const urls = new Set();
  if (fs.existsSync(sitemapPath)) {
    const content = fs.readFileSync(sitemapPath, 'utf8');
    const regex = /<loc>([^<]+)<\/loc>/g;
    let m;
    while ((m = regex.exec(content))) {
      const loc = m[1];
      if (!loc.includes('/product/') && !loc.includes('/product-pages/')) {
        urls.add(loc);
      }
    }
  } else {
    urls.add('https://www.serakinci.com/');
    urls.add('https://www.serakinci.com/urunler/');
  }
  return Array.from(urls);
}

async function createSitemap(dermo, animal) {
  const today = new Date().toISOString().slice(0, 10);
  const urls = extractStaticUrls();
  for (const lang of languages) {
    urls.push(`https://www.serakinci.com/${lang}/urunler/`);
    for (const p of dermo) {
      if (p && p.ProductName) {
        const name = await translateText(p.ProductName, lang);
        const slug = slugify(name);
        urls.push(`https://www.serakinci.com/${lang}/urunler/dermokozmetik/product-pages/${slug}/`);
      }
    }
    for (const p of animal) {
      if (p && p.ProductName) {
        const name = await translateText(p.ProductName, lang);
        const slug = slugify(name);
        urls.push(`https://www.serakinci.com/${lang}/urunler/hayvan-sagligi/product-pages/${slug}/`);
      }
    }
  }
  const entries = urls
    .map(
      (loc) => `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>`
    )
    .join('\n');
  const xml =
    `<?xml version='1.0' encoding='utf-8'?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    entries +
    '\n</urlset>';
  await fs.promises.writeFile(path.join(__dirname, 'sitemap.xml'), xml);
  await fs.promises.writeFile(path.join(__dirname, 'sitemap.html'), xml);
}

async function generate() {
  let dermo = [];
  let animal = [];
  try { dermo = JSON.parse(await fs.promises.readFile(dermoPath, 'utf8')); } catch {}
  try { animal = JSON.parse(await fs.promises.readFile(animalPath, 'utf8')); } catch {}
  await downloadImages([...dermo, ...animal]);
  for (const lang of languages) {
    await createPages(dermo, 'dermokozmetik', lang);
    await createPages(animal, 'hayvan-sagligi', lang);
  }
  await createSitemap(dermo, animal);
  console.log('Static product pages generated and sitemap updated.');
}

if (require.main === module) {
  generate();
}
