const fs = require('fs');
const path = require('path');

const dermoPath = path.join(__dirname, 'urunler', 'api', 'products.json');
const animalPath = path.join(__dirname, 'urunler', 'api', 'hayvan-sagligi.json');

function slugify(text) {
  if (text == null) return 'isimsiz-urun';
  let str = String(text);
  const trMap = { 'ç':'c','Ç':'C','ğ':'g','Ğ':'G','ı':'i','İ':'I','ö':'o','Ö':'O','ş':'s','Ş':'S','ü':'u','Ü':'U' };
  for (const key in trMap) str = str.replace(new RegExp(key, 'g'), trMap[key]);
  str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  str = str.replace(/\//g, '').replace(/\./g, '');
  str = str.toLowerCase();
  str = str.replace(/(\d+)\s+(sensibio)/g, '$1$2');
  const units = 'ml|gr|l|kg|mg|cm|m|lt';
  str = str.replace(new RegExp(`\\b(${units})\\s+(shower|gel)\\b`, 'gi'), '$1$2');
  str = str.replace(new RegExp(`(\\d+)\\s*(${units})\\b`, 'gi'), '$1-$2');
  str = str.replace(/\s+/g, '-').replace(/[^\w-]+/g, '-').replace(/--+/g, '-').replace(/^-+|-+$/g, '');
  return str || 'isimsiz-urun';
}

function buildHtml(product, segment) {
  const titleSegment = segment === 'dermokozmetik' ? 'Dermokozmetik' : 'Hayvan Sağlığı';
  const description = product.description || product.ProductName;
  return `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<title>${product.ProductName} | ${titleSegment} | Serakıncı</title>
<meta name="description" content="${description}">
<link rel="canonical" href="https://www.serakinci.com/urunler/${segment}/product-pages/${slugify(product.ProductName)}/">
</head>
<body>
<h1>${product.ProductName}</h1>
${product.ImageUrl ? `<img src="${product.ImageUrl}" alt="${product.ProductName}">` : ''}
<p><strong>Ürün Kodu:</strong> ${product.ProductCode || ''}</p>
${description ? `<p>${description}</p>` : ''}
</body>
</html>`;
}

async function createPages(products, segment) {
  for (const p of products) {
    if (!p || !p.ProductName) continue;
    const slug = slugify(p.ProductName);
    const outDir = path.join(__dirname, 'urunler', segment, 'product-pages', slug);
    await fs.promises.mkdir(outDir, { recursive: true });
    const html = buildHtml(p, segment);
    await fs.promises.writeFile(path.join(outDir, 'index.html'), html);
  }
}

async function generate() {
  let dermo = [];
  let animal = [];
  try { dermo = JSON.parse(await fs.promises.readFile(dermoPath, 'utf8')); } catch {}
  try { animal = JSON.parse(await fs.promises.readFile(animalPath, 'utf8')); } catch {}
  await createPages(dermo, 'dermokozmetik');
  await createPages(animal, 'hayvan-sagligi');
  console.log('Static product pages generated.');
}

if (require.main === module) {
  generate();
}
