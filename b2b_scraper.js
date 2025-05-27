
/********************************************************************
  Serakıncı B2B Scraper v5 – GitHub Actions Optimized (28.05.2024)
  - Handles Dermokozmetik and Hayvan Sağlığı with separate credentials from env.
  - Outputs 'products.json' and 'hayvan-sagligi.json' to 'public/urunler/api/'.
  - Maps fields to align with frontend Product type.
********************************************************************/
const puppeteer = require('puppeteer');
const fs        = require('fs-extra');
const path      = require('path');

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
const OUTPUT_DIR = path.join(__dirname, 'urunler', 'api'); // Output to public/api/
/* :::::::::::::::::::::::::::::::::::: */

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function scrapeAccountData(accountConfig, browser) {
  const t0_account = Date.now();
  console.log(`\n===== ${accountConfig.type} Kategorisi için İşlem Başlatılıyor =====`);

  if (!accountConfig.email || !accountConfig.password) {
    console.error(`[${accountConfig.type}] 🚫 E-posta (${accountConfig.email ? 'Sağlandı' : 'Eksik'}) veya şifre (${accountConfig.password ? 'Sağlandı' : 'Eksik'}) ortam değişkenleri (DERMO_EMAIL/PASSWORD veya ANIMAL_EMAIL/PASSWORD) ayarlanmamış veya boş. Bu hesap atlanıyor.`);
    return [];
  }
   if (accountConfig.categories.length === 0) {
    console.warn(`[${accountConfig.type}] ⚠️ Kategori listesi boş. Bu hesap için ürün çekilmeyecek.`);
    return [];
  }


  const page = await browser.newPage();

  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36'
  );
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
  });

  page.on('pageerror', e => console.log(`[${accountConfig.type} - pageerror]`, e.message));
  page.on('console', m => {
    const text = m.text();
    if (text.includes('preloaded using link preload') || text.includes('API Error') || text.includes('DevTools')) return;
    // console.log(`[${accountConfig.type} - browser]`, text);
  });

  console.log(`[${accountConfig.type}] ➜ Login sayfası açılıyor: ${accountConfig.email}`);
  try {
    await page.goto(`${BASE_URL}/#!/login`, { waitUntil: 'networkidle2', timeout: 90000 });
    await page.waitForSelector('input.txtUserName', { timeout: 20000 });
    await page.type('input.txtUserName', accountConfig.email, { delay: 60 });
    await page.type('input.txtPassword', accountConfig.password, { delay: 60 });
    await Promise.all([
      page.click('#login.btn-primary'),
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 90000 })
    ]);
    console.log(`[${accountConfig.type}] ✔ Giriş başarılı: ${accountConfig.email}`);
  } catch (error) {
    console.error(`[${accountConfig.type}] 🚫 Login başarısız: ${accountConfig.email}`, error.message);
    await page.close();
    return [];
  }
  
  await sleep(3500);

  const tokenData = await page.evaluate(() => {
    const stor = { ...localStorage, ...sessionStorage };
    let tk = null;
    for (const k in stor) {
      if (k.toLowerCase().includes('token')) {
        tk = stor[k];
        break;
      }
    }
    return { token: tk };
  });
  const token = tokenData.token;


  if (!token) {
    console.error(`[${accountConfig.type}] 🚫 Bearer token bulunamadı! Giriş sonrası sayfa kontrol ediliyor...`);
    const currentUrl = page.url();
    if (!currentUrl.includes('dashboard') && !currentUrl.includes('home') && currentUrl.includes('login')) { // Adjust based on actual post-login URL
        console.error(`[${accountConfig.type}] Hala login sayfasında. Token alınamadı.`);
    } else {
        console.log(`[${accountConfig.type}] Login sonrası URL: ${currentUrl}. Token DOM'da farklı bir şekilde saklanıyor olabilir.`);
    }
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
    if (!cat.id || !cat.name) {
        console.warn(`[${accountConfig.type}] Atlanıyor: ID (${cat.id}) veya isim (${cat.name}) eksik olan kategori.`);
        continue;
    }
    console.log(`\n[${accountConfig.type}] ➡ ${cat.name} (ID ${cat.id}) ürünleri çekiliyor…`);
    let skip = 0, pageNo = 1, addedInCategory = 0;

    while (true) {
      const apiUrl = `${BASE_URL}/api/ProductList?categoryId=${cat.id}&categoryView=true&skip=${skip}&take=100`;
      let apiResponse;
      try {
        apiResponse = await page.evaluate(async (url, h) => {
          try {
            const r = await fetch(url, { headers: h });
            if (!r.ok) return { Error: `HTTP ${r.status}`, Status: r.status, Url: url };
            return await r.json();
          } catch (e) {
            return { Error: e.message, Url: url };
          }
        }, apiUrl, headers);
      } catch (e) {
        apiResponse = { Error: `Sayfa evaluate hatası: ${e.message}`, Url: apiUrl };
      }

      if (apiResponse.Error) {
        console.error(`[${accountConfig.type}]   ↳ API Hatası (Sayfa ${pageNo}, Kategori ${cat.name}, URL: ${apiResponse.Url}): ${apiResponse.Error}. Bu kategori için sonraki sayfa atlanıyor.`);
        break; 
      }
      
      const productList = (
        apiResponse.Data || apiResponse.Items || apiResponse.rows ||
        apiResponse.DataList || (apiResponse.Result && (apiResponse.Result.Data || apiResponse.Result.Items)) || []
      );

      console.log(`[${accountConfig.type}]   ↳ Sayfa ${pageNo} (${cat.name}): ${productList.length} ürün bulundu`);
      if (!productList.length) break;

      const processedProducts = productList.map(apiProduct => {
        const product = {
          ProductId: apiProduct.ProductId,
          ProductName: apiProduct.ProductName,
          ImageUrl: apiProduct.ProductImage || apiProduct.ImageUrl || null,
          ProductCode: apiProduct.ProductCode || apiProduct.DisplayProductCode || null, // Added DisplayProductCode as fallback
          description: apiProduct.Description || '',
          anaKategori: accountConfig.type, // This should be a MainCategory type from types.ts
        };

        if (accountConfig.type === 'Dermokozmetik') {
          product.brand = cat.name; 
          product.cat = cat.name;  // Store original API category name for Dermokozmetik
        } else if (accountConfig.type === 'Hayvan Sağlığı') {
          product.kategori = cat.name; // Store the broader B2B category as 'kategori'
          // If API provides a more specific 'brand' or 'producer' for animal health, map it too
          if (apiProduct.ProducerName) product.brand = apiProduct.ProducerName;
        }
        return product;
      }).filter(p => p.ProductId && p.ProductName); // Ensure essential fields exist
      
      allProductsForAccount.push(...processedProducts);
      addedInCategory += processedProducts.length;

      if (productList.length < 100) break; 
      skip += 100;
      pageNo++;
      await sleep(600); 
    }
    console.log(`[${accountConfig.type}] ✓ ${cat.name} kategorisinden ${addedInCategory} ürün eklendi.`);
  }
  
  await fs.ensureDir(OUTPUT_DIR); // Ensure directory exists
  const outputFilePath = path.join(OUTPUT_DIR, accountConfig.outputFile);
  fs.writeJsonSync(outputFilePath, allProductsForAccount, { spaces: 2 });
  console.log(`\n[${accountConfig.type}] 🎉 ${outputFilePath} dosyası yazıldı → ${allProductsForAccount.length} ürün`);
  console.log(`[${accountConfig.type}] ⌛ Toplam süre: ${((Date.now() - t0_account) / 1000).toFixed(1)} sn`);
  
  await page.close();
  return allProductsForAccount;
}


(async () => {
  const t0_total = Date.now();
  console.log("Serakıncı B2B Scraper Başlatılıyor...");

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
  } catch (error) {
    console.error("Scraper ana sürecinde bir hata oluştu:", error);
  } finally {
    await browser.close();
    console.log('Tarayıcı kapatıldı.');
  }

  console.log(`\n\n🎉 Tüm işlemler tamamlandı.`);
  console.log(`⏳ Toplam çalışma süresi: ${((Date.now() - t0_total) / 1000).toFixed(1)} sn`);
})();
