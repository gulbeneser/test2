/********************************************************************
  Serakıncı B2B Scraper v5 – GitHub Actions Optimized (29.05.2024)
  - Handles Dermokozmetik and Hayvan Sağlığı with separate credentials from env.
  - Outputs 'products.json' and 'hayvan-sagligi.json' to 'urunler/api/'.
  - Maps fields to align with frontend Product type.
********************************************************************/

require('dotenv').config(); // ✅ .env dosyasını yükle

const puppeteer = require('puppeteer');
const fs = require('fs-extra');
const path = require('path');

/* :::::::::::::  AYARLAR  ::::::::::::: */
const ACCOUNTS_CONFIG = [
  {
    type: 'Dermokozmetik',
    email: process.env.DERMO_EMAIL,
    password: process.env.DERMO_PASSWORD,
    categories: [
      { name: 'Bioderma', id: 29 },
      { name: 'Caudalie', id: 30 },
      { name: 'Esthederm', id: 31 },
      { name: 'Etat Pur', id: 32 },
      { name: 'Nuxe', id: 33 },
      { name: 'Phyto', id: 34 },
      { name: 'Velavit', id: 35 },
    ],
    outputFile: 'products.json'
  },
  {
    type: 'Hayvan Sağlığı',
    email: process.env.ANIMAL_EMAIL,
    password: process.env.ANIMAL_PASSWORD,
    categories: [
      { name: 'ANESTEZİK', id: 38 },
      { name: 'ANTİBİYOTİK', id: 39 },
      { name: 'ANTİENFLAMATUAR', id: 41 },
      { name: 'ANTİHİSTAMİNİK', id: 40 },
      { name: 'ANTİPARAZİTER', id: 42 },
      { name: 'AŞI', id: 15 },
      { name: 'DEZENFEKTAN', id: 43 },
      { name: 'HORMON', id: 20 },
      { name: 'İNSEKTİSİT', id: 44 },
      { name: 'METABOLİZMA DÜZENLEYİCİ', id: 45 },
      { name: 'PANZEHİR', id: 46 },
      { name: 'PET ÜRÜNLER', id: 22 },
      { name: 'SUNİ TOHUM', id: 47 },
      { name: 'TEST KİTİ', id: 49 },
      { name: 'VETERİNER ALET', id: 50 },
      { name: 'VİTAMİN MİNERAL', id: 51 },
      { name: 'DIGER', id: 18 },
    ],
    outputFile: 'hayvan-sagligi.json'
  }
];

const BASE_URL = 'https://siparis.serakinci.com';
const OUTPUT_DIR = path.join(__dirname, 'urunler', 'api');

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function scrapeAccountData(accountConfig, browser) {
  const t0_account = Date.now();
  console.log(`\n===== ${accountConfig.type} Kategorisi için İşlem Başlatılıyor =====`);

  if (!accountConfig.email || !accountConfig.password) {
    console.error(`[${accountConfig.type}] 🚫 Ortam değişkenleri eksik!`);
    return [];
  }

  const page = await browser.newPage();

  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
  });

  try {
    console.log(`[${accountConfig.type}] ➜ Giriş yapılıyor`);
    await page.goto(`${BASE_URL}/#!/login`, { waitUntil: 'networkidle2', timeout: 90000 });
    await page.waitForSelector('input.txtUserName', { timeout: 20000 });
    await page.type('input.txtUserName', accountConfig.email, { delay: 60 });
    await page.type('input.txtPassword', accountConfig.password, { delay: 60 });
    await Promise.all([
      page.click('#login.btn-primary'),
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 90000 })
    ]);
    console.log(`[${accountConfig.type}] ✔ Giriş başarılı`);
  } catch (error) {
    console.error(`[${accountConfig.type}] ❌ Giriş başarısız:`, error.message);
    await page.close();
    return [];
  }

  await sleep(3000);

  const tokenData = await page.evaluate(() => {
    const stor = { ...localStorage, ...sessionStorage };
    for (const key in stor) {
      if (key.toLowerCase().includes('token')) return { token: stor[key] };
    }
    return { token: null };
  });

  const token = tokenData.token;

  if (!token) {
    console.error(`[${accountConfig.type}] ❌ Token alınamadı`);
    await page.close();
    return [];
  }

  const cookies = await page.cookies();
  const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join('; ');
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Cookie': cookieHeader
  };

  const allProductsForAccount = [];

  for (const cat of accountConfig.categories) {
    console.log(`\n[${accountConfig.type}] ➡ ${cat.name} ürünleri çekiliyor…`);
    let skip = 0, pageNo = 1;

    while (true) {
      const apiUrl = `${BASE_URL}/api/ProductList?categoryId=${cat.id}&categoryView=true&skip=${skip}&take=100`;
      let apiResponse;

      try {
        apiResponse = await page.evaluate(async (url, h) => {
          const r = await fetch(url, { headers: h });
          if (!r.ok) return { Error: `HTTP ${r.status}`, Url: url };
          return await r.json();
        }, apiUrl, headers);
      } catch (e) {
        apiResponse = { Error: e.message, Url: apiUrl };
      }

      if (apiResponse.Error) {
        console.error(`[${accountConfig.type}] ⚠️ API Hatası: ${apiResponse.Error}`);
        break;
      }

      const productList = (
        apiResponse.Data || apiResponse.Items || apiResponse.rows ||
        apiResponse.DataList || (apiResponse.Result && (apiResponse.Result.Data || apiResponse.Result.Items)) || []
      );

      console.log(`[${accountConfig.type}]   ↳ Sayfa ${pageNo}: ${productList.length} ürün`);
      if (!productList.length) break;

      const processedProducts = productList.map(p => {
        const product = {
          ProductId: p.ProductId,
          ProductName: p.ProductName,
          ImageUrl: p.ProductImage || p.ImageUrl || null,
          ProductCode: p.ProductCode || p.DisplayProductCode || null,
          description: p.Description || '',
          anaKategori: accountConfig.type,
        };

        if (accountConfig.type === 'Dermokozmetik') {
          product.brand = cat.name;
          product.cat = cat.name;
        } else {
          product.kategori = cat.name;
          if (p.ProducerName) product.brand = p.ProducerName;
        }

        return product;
      }).filter(p => p.ProductId && p.ProductName);

      allProductsForAccount.push(...processedProducts);
      if (productList.length < 100) break;
      skip += 100;
      pageNo++;
      await sleep(600);
    }
  }

  await fs.ensureDir(OUTPUT_DIR);
  const outputFilePath = path.join(OUTPUT_DIR, accountConfig.outputFile);
  fs.writeJsonSync(outputFilePath, allProductsForAccount, { spaces: 2 });

  console.log(`\n[${accountConfig.type}] ✅ Yazıldı: ${outputFilePath} → ${allProductsForAccount.length} ürün`);
  await page.close();
  return allProductsForAccount;
}

(async () => {
  const t0_total = Date.now();
  console.log("🚀 Serakıncı B2B Scraper Başlatılıyor...");

  const browser = await puppeteer.launch({
    headless: "new",
    slowMo: 40,
    defaultViewport: null,
    args: [
      '--start-maximized',
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--window-size=1920,1080'
    ]
  });

  try {
    for (const config of ACCOUNTS_CONFIG) {
      await scrapeAccountData(config, browser);
    }
  } catch (err) {
    console.error("❌ Genel hata:", err.message);
  } finally {
    await browser.close();
    console.log('🧼 Tarayıcı kapatıldı.');
    console.log(`⏱️ Toplam süre: ${((Date.now() - t0_total) / 1000).toFixed(1)} sn`);
  }
})();
