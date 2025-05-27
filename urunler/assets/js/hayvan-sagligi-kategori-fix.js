/**
 * Hayvan Sağlığı Kategorilerine Özel JavaScript Kodu
 * - Kategori bilgilerini "kategori" alanından çeker
 * - Türkçe karakter sorunlarını giderir
 * - Filtreleme sistemini sorunsuz çalıştırır
 */

// Sayfa yüklendiğinde çalıştır
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
});

// Tüm ürünleri tutacak değişken
let allProducts = [];

// Uygulama başlatma
async function initializeApp() {
  try {
    // Hayvan Sağlığı ürünlerini yükle
    console.log("Ürünler yükleniyor...");
    allProducts = await fetchProducts();
    
    console.log(`${allProducts.length} adet ürün başarıyla yüklendi.`);
    
    if (!allProducts || allProducts.length === 0) {
      showError("Ürün verisi bulunamadı.");
      return;
    }
    
    // Kategorileri oluştur
    buildCategoryFilters();
    
    // Tüm ürünleri göster (başlangıçta)
    displayProducts(allProducts);
    
    // URL parametrelerini kontrol et
    handleUrlParameters();
    
    // Back to Top butonunu aktifleştir
    initBackToTop();
    
  } catch (error) {
    console.error("Uygulama başlatılırken hata:", error);
    showError("Sayfayı yüklerken bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
  }
}

// Ürünleri getir
async function fetchProducts() {
  try {
    const response = await fetch('/urunler/api/hayvan-sagligi.json');
    
    if (!response.ok) {
      throw new Error(`API yanıt hatası: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Ürün verisi çekilirken hata:", error);
    showError("Ürün verileri yüklenemedi. Lütfen daha sonra tekrar deneyin.");
    return [];
  }
}

// Kategorileri çıkar ve filtreleri oluştur
function buildCategoryFilters() {
  // Önce kategorileri ürünlerden çıkar
  const categories = extractCategories();
  
  // Kategorileri alfabetik sıraya diz
  const sortedCategories = Object.keys(categories)
    .filter(cat => cat !== "ALL")
    .sort((a, b) => a.localeCompare(b));
  
  // Kategori listesini oluştur
  const categoryList = document.getElementById('categoryList');
  if (!categoryList) {
    console.error("Kategori listesi bulunamadı");
    return;
  }
  
  // Tüm ürünler kategorisinin sayısını güncelle
  const allProductsCounter = categoryList.querySelector('.filter-link[data-category="ALL"] .filter-count');
  if (allProductsCounter) {
    allProductsCounter.textContent = allProducts.length;
  }
  
  // Her kategori için liste öğesi oluştur
  sortedCategories.forEach(category => {
    const categoryItem = createCategoryItem(category, categories[category]);
    categoryList.appendChild(categoryItem);
  });
  
  // Tüm filtreleme linklerine olay dinleyicisi ekle
  addCategoryFilterEvents();
}

// Kategorileri JSON veri modelinden çıkar
function extractCategories() {
  const categories = {
    "ALL": allProducts.length
  };
  
  // Her ürünün kategorisini kontrol et ve say
  allProducts.forEach(product => {
    // Kategori adını "kategori" alanından al (JSON dosyasında bu şekilde)
    let categoryName = product.kategori || "DİĞER";
    
    // Eğer kategori yoksa veya boşsa, ürün kategorize edilmemiş
    if (!categoryName || categoryName.trim() === '') {
      categoryName = "DİĞER";
    }
    
    // Kategori sayacını artır
    if (categories[categoryName]) {
      categories[categoryName]++;
    } else {
      categories[categoryName] = 1;
    }
  });
  
  return categories;
}

// Kategori öğesi oluştur
function createCategoryItem(category, count) {
  const li = document.createElement('li');
  li.className = 'filter-item';
  
  // Kategori için uygun ikon seç
  const iconSvg = getCategoryIcon(category);
  
  li.innerHTML = `
    <a href="#" class="filter-link" data-category="${category}">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${iconSvg}</svg>
      ${category}
      <span class="filter-count">${count}</span>
    </a>
  `;
  
  return li;
}

// Kategori ikonunu belirle
function getCategoryIcon(category) {
  // Kategori adına göre özel ikon seç
  const categoryLC = category.toLowerCase();
  
  if (categoryLC.includes('antibiyotik') || categoryLC.includes('antibiotik')) {
    return '<circle cx="12" cy="12" r="10"></circle><path d="M12 8v8M8 12h8"></path>';
  } else if (categoryLC.includes('aşı') || categoryLC.includes('asi')) {
    return '<path d="M19 2H5a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zM9 17V7"/><path d="M15 7v10"/>';
  } else if (categoryLC.includes('anestezik')) {
    return '<path d="M7 16H3a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h4"></path><path d="M14 2h4a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-4"></path><path d="M7 22V2"></path><path d="M14 22V2"></path>';
  } else if (categoryLC.includes('vitamin')) {
    return '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle>';
  } else if (categoryLC.includes('dezenfektan')) {
    return '<path d="M12 2v6"></path><path d="M5 4.27 6.5 9"></path><path d="m17.5 6.5-2.5 2.5"></path><path d="m3 14 4-1"></path><path d="m7 7-3 2"></path><path d="M9 17H3"></path><path d="m13 14 4 3"></path><path d="M21 12v3"></path><path d="m12 20 3-4"></path><path d="m5 18 5-3"></path><path d="M20 5c-2 2-2 4.5-1 7"></path>';
  } else if (categoryLC.includes('hormon')) {
    return '<circle cx="8" cy="18" r="4"></circle><path d="M14 18a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z"></path><path d="M18 10a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z"></path><path d="M6 10a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z"></path>';
  } else if (categoryLC.includes('antiseptik')) {
    return '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>';
  }
  
  // Varsayılan ikon
  return '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line>';
}

// Kategori filtreleme olayları ekle
function addCategoryFilterEvents() {
  document.querySelectorAll('.filter-link').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Tüm filtrelerin aktif sınıfını kaldır
      document.querySelectorAll('.filter-link').forEach(l => {
        l.classList.remove('active');
      });
      
      // Bu filtreyi aktif yap
      this.classList.add('active');
      
      // Kategori adını al
      const category = this.getAttribute('data-category');
      
      // Ürünleri filtrele
      filterByCategory(category);
      
      // URL'yi güncelle
      updateURL(category);
    });
  });
}

// Kategoriye göre ürünleri filtrele
function filterByCategory(category) {
  // Filtrelenmiş ürünleri hazırla
  let filteredProducts;
  
  if (category === 'ALL') {
    // Tüm ürünleri göster
    filteredProducts = allProducts;
  } else {
    // Seçilen kategorideki ürünleri filtrele
    filteredProducts = allProducts.filter(product => {
      return product.kategori === category;
    });
  }
  
  // Filtrelenmiş ürünleri göster
  displayProducts(filteredProducts);
}

// Ürünleri ekranda göster
function displayProducts(products) {
  const productsGrid = document.querySelector('.products-grid');
  
  if (!productsGrid) {
    console.error("Ürün konteyneri bulunamadı");
    return;
  }
  
  // Ürün sayısını güncelle
  updateProductCount(products.length);
  
  // Eğer ürün yoksa, hata mesajı göster
  if (!products || products.length === 0) {
    productsGrid.innerHTML = '<div class="no-results">Bu kategoride ürün bulunamadı.</div>';
    return;
  }
  
  // Ürünleri HTML olarak hazırla
  let productsHTML = '';
  
  products.forEach(product => {
    // Ürün adından URL dostu slug oluştur
    const slug = createSlug(product.ProductName);
    
    // Ürün kategorisini al
    const category = product.kategori || "DİĞER";
    
    // Ürün görselini kontrol et
    let imageUrl = product.ImageUrl || '';
    
    // Alternatif görsel varsa kullan
    if (!imageUrl && product.ProductImages && product.ProductImages.length > 0) {
      imageUrl = product.ProductImages[0].ImageUrl;
    }
    
    // Ürün kartını oluştur
    productsHTML += `
      <div class="product-card" data-category="${category}">
        <div class="product-image-container">
          ${imageUrl 
            ? `<img src="${imageUrl}" alt="${product.ProductName}" class="product-image" loading="lazy" onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'no-image\\'><span>Fotoğraf hazırlanıyor</span></div>';">`
            : `<div class="no-image"><span>Fotoğraf hazırlanıyor</span></div>`
          }
        </div>
        <div class="product-content">
          <span class="product-category">${category}</span>
          <h3 class="product-name">${product.ProductName}</h3>
          <a href="/urunler/hayvan-sagligi/product" onclick="return showProductDetail('${slug}')" class="product-link">
            <span>Ürünü İncele</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
          </a>
        </div>
      </div>
    `;
  });
  
  // Ürünleri ekrana bas
  productsGrid.innerHTML = productsHTML;
}

// Ürün sayısını güncelle
function updateProductCount(count) {
  const productCount = document.getElementById('productCount');
  if (productCount) {
    productCount.textContent = `${count} ürün`;
  }
}

// URL parametrelerini kontrol et
function handleUrlParameters() {
  const urlParams = new URLSearchParams(window.location.search);
  const kategoriParam = urlParams.get('kategori');
  
  if (kategoriParam) {
    // URL'de kategori parametresi varsa, o kategoriye tıkla
    const filterLinks = document.querySelectorAll('.filter-link');
    let found = false;
    
    filterLinks.forEach(link => {
      const linkCategory = link.getAttribute('data-category');
      if (linkCategory && linkCategory === kategoriParam) {
        link.click();
        found = true;
      }
    });
    
    // Eğer kategori bulunamazsa, tüm ürünleri göster
    if (!found) {
      const allProductsLink = document.querySelector('.filter-link[data-category="ALL"]');
      if (allProductsLink) {
        allProductsLink.click();
      }
    }
  }
}

// URL'yi güncelle
function updateURL(category) {
  const url = new URL(window.location.href);
  
  if (category === 'ALL') {
    // Kategori parametresini kaldır
    url.searchParams.delete('kategori');
  } else {
    // Kategori parametresini ekle
    url.searchParams.set('kategori', category);
  }
  
  // URL'yi güncelle (sayfa yüklenmeden)
  window.history.pushState({}, '', url);
}

// Hata mesajı göster
function showError(message) {
  const productsGrid = document.querySelector('.products-grid');
  if (productsGrid) {
    productsGrid.innerHTML = `<div class="error">${message}</div>`;
  }
  console.error(message);
}

// Sayfa yukarı çıkma butonunu etkinleştir
function initBackToTop() {
  const backToTopButton = document.getElementById('backToTop');
  if (!backToTopButton) return;
  
  // Scroll event
  window.addEventListener('scroll', function() {
    if (window.scrollY > 300) {
      backToTopButton.classList.add('visible');
    } else {
      backToTopButton.classList.remove('visible');
    }
  });
  
  // Click event
  backToTopButton.addEventListener('click', function() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

// URL dostu slug oluştur (Türkçe karakter desteği)
function createSlug(text) {
  if (!text) return '';
  
  return text
    .toString()
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

// Ürün detay sayfasına git
function showProductDetail(productSlug) {
  // Ürün bilgisini LocalStorage'e kaydet
  localStorage.setItem('selectedProductSlug', productSlug);
  
  // Ürün detay sayfasına yönlendir
  window.location.href = `/urunler/hayvan-sagligi/product`;
  
  return false;
}