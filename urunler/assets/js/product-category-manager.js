/**
 * Ürün Kategori Yöneticisi - Serakıncı
 * Farklı ana kategori ürünlerini doğru şekilde işler ve görüntüler
 */

document.addEventListener('DOMContentLoaded', function() {
  initProductCategoryManager();
});

/**
 * Ürün kategori yöneticisini başlatır
 */
function initProductCategoryManager() {
  // Ana kategori bilgisini URL'den al
  const currentPath = window.location.pathname;
  const isHayvanSagligi = currentPath.includes('hayvan-sagligi');
  const isDermokozmetik = currentPath.includes('dermokozmetik');
  
  // Ana kategori sayfası ise, ilgili düzenlemeleri yap
  if (isHayvanSagligi) {
    setupHayvanSagligiCategory();
  } else if (isDermokozmetik) {
    setupDermokozmetikCategory();
  }
  
  // Ürün detay sayfasında, ana kategori bilgisini ürün verilerinden al
  const productDetailContainer = document.querySelector('.product-detail-container');
  if (productDetailContainer) {
    const mainCategoryElement = document.querySelector('[data-main-category]');
    if (mainCategoryElement) {
      const mainCategory = mainCategoryElement.getAttribute('data-main-category');
      if (mainCategory === 'Hayvan Sağlığı') {
        setupHayvanSagligiProductDetail();
      } else if (mainCategory === 'Dermokozmetik') {
        setupDermokozmetikProductDetail();
      }
    }
  }
}

/**
 * Hayvan Sağlığı kategorisi için düzenlemeler yapar
 */
function setupHayvanSagligiCategory() {
  // 1. Marka filtre ve logoları gizle
  const brandElements = document.querySelectorAll('.brand-filter, .brand-logos-container, [id*="brand"], [class*="brand"]');
  brandElements.forEach(element => {
    // Logolar için bir kontrolümüz olsun - tümünü gizlemek yerine sadece marka olanları gizleyelim
    if (element.classList.contains('brand-logos-container') || 
        element.id.includes('brand') || 
        element.classList.contains('brand-filter')) {
      element.style.display = 'none';
    }
  });
  
  // 2. Kategori bazlı filtreleme ve yönlendirmeyi aktifleştir
  enhanceCategoryNavigation('hayvan-sagligi');
  
  // 3. Kategori bazlı ürün listesini göster
  updateProductListByCategory();
}

/**
 * Dermokozmetik kategorisi için düzenlemeler yapar
 */
function setupDermokozmetikCategory() {
  // Normal marka bazlı yapılandırma zaten mevcut, ekstra düzenlemeye gerek yok
  enhanceBrandFilters();
}

/**
 * Hayvan Sağlığı ürün detay sayfası için düzenlemeler
 */
function setupHayvanSagligiProductDetail() {
  // Marka ile ilgili bilgileri gizle
  const brandInfoElements = document.querySelectorAll('.product-brand, .brand-info, [id*="brand"]');
  brandInfoElements.forEach(element => {
    element.style.display = 'none';
  });
  
  // Kategori bilgisini daha belirgin hale getir
  const categoryElements = document.querySelectorAll('.product-category, .category-info');
  categoryElements.forEach(element => {
    element.style.fontWeight = 'bold';
    element.style.fontSize = '1.1em';
  });
}

/**
 * Dermokozmetik ürün detay sayfası için düzenlemeler
 */
function setupDermokozmetikProductDetail() {
  // Normal marka bazlı görüntüleme zaten mevcut, ekstra düzenlemeye gerek yok
}

/**
 * Kategori bazlı navigasyonu geliştirir
 * @param {string} mainCategory - Ana kategori adı (URL parçası)
 */
function enhanceCategoryNavigation(mainCategory) {
  // Kategori linklarını güncelle
  document.querySelectorAll('.category-link, [href*="category="]').forEach(link => {
    const href = link.getAttribute('href');
    const categoryMatch = href.match(/category=([^&]+)/);
    
    if (categoryMatch && categoryMatch[1]) {
      const category = decodeURIComponent(categoryMatch[1]).toLowerCase();
      // Kategori URL'sini oluştur
      const newHref = `/${mainCategory}/${category.replace(/\s+/g, '-')}`;
      link.setAttribute('href', newHref);
    }
  });
  
  // Kategori başlıklarını güncelle
  document.querySelectorAll('.category-header, .section-title').forEach(header => {
    if (header.textContent.includes('Markalar')) {
      header.textContent = 'Kategoriler';
    }
  });
}

/**
 * Marka filtrelerini geliştirir (Dermokozmetik için)
 */
function enhanceBrandFilters() {
  // Marka filtreleri zaten mevcut, ekstra düzenlemeye gerek yok
}

/**
 * Kategori bazlı ürün listesini günceller
 */
function updateProductListByCategory() {
  // URL'den kategoriyi al
  const pathSegments = window.location.pathname.split('/');
  let categorySlug = '';
  
  // URL'de kategori var mı kontrol et
  if (pathSegments.length > 2 && pathSegments[1] === 'hayvan-sagligi') {
    categorySlug = pathSegments[2];
  }
  
  // Kategori slug'ını gerçek kategori adına dönüştür
  const category = categorySlug.replace(/-/g, ' ').toUpperCase();
  
  // Eğer belirli bir kategori seçilmişse, o kategorideki ürünleri göster
  if (category) {
    const allProducts = document.querySelectorAll('.product-item, .product-card');
    
    allProducts.forEach(product => {
      const productCategory = product.getAttribute('data-category');
      
      if (productCategory && productCategory.toUpperCase() === category) {
        product.style.display = 'block';
      } else {
        product.style.display = 'none';
      }
    });
    
    // Kategori başlığını güncelle
    const categoryTitle = document.querySelector('.category-title, .section-title');
    if (categoryTitle) {
      categoryTitle.textContent = `${category.charAt(0).toUpperCase() + category.slice(1).toLowerCase()} Ürünleri`;
    }
  }
}