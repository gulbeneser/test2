const fs = require('fs');
const path = require('path');

const dermoPath = path.join(__dirname, 'urunler', 'api', 'products.json');
const animalPath = path.join(__dirname, 'urunler', 'api', 'hayvan-sagligi.json');
const dermoTemplate = path.join(__dirname, 'urunler', 'dermokozmetik', 'product', 'template.html');
const animalTemplate = path.join(__dirname, 'urunler', 'hayvan-sagligi', 'product', 'template.html');

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

async function loadTemplate(segment) {
  const file = segment === 'dermokozmetik' ? dermoTemplate : animalTemplate;
  return fs.promises.readFile(file, 'utf8');
}

async function createPages(products, segment) {
  const template = await loadTemplate(segment);
  const list = [];
  for (const p of products) {
    if (!p || !p.ProductName) continue;
    const slug = slugify(p.ProductName);
    const outDir = path.join(__dirname, 'urunler', segment, 'product-pages', slug);
    await fs.promises.mkdir(outDir, { recursive: true });
    await fs.promises.writeFile(path.join(outDir, 'index.html'), template);
    list.push({ slug, name: p.ProductName });
  }
  await createIndex(list, segment);
}

async function createIndex(items, segment) {
  const links = items
    .map(({ slug, name }) => `    <li><a href="${slug}/">${name}</a></li>`) 
    .join('\n');
  const html = `<!DOCTYPE html>
<html lang="tr">
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
    'urunler',
    segment,
    'product-pages',
    'index.html'
  );
  await fs.promises.mkdir(path.dirname(outPath), { recursive: true });
  await fs.promises.writeFile(outPath, html);
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
