/**
 * Hayvan Sağlığı Ürünleri için Özel JavaScript Modülü
 * Türkçe karakter ve kategori desteği ile birlikte
 */

document.addEventListener('DOMContentLoaded', function() {
  // Ana modülü başlat
  initHayvanSagligi();
});

// Ana modül - tüm işlevleri koordine eden ana fonksiyon
async function initHayvanSagligi() {
  try {
    console.log('Hayvan Sağlığı modülü başlatılıyor...');
    
    // Ürün verilerini yükle
    const products = await fetchProducts();
    
    if (!products || products.length === 0) {
      showError('Ürün verileri yüklenemedi veya hiç ürün bulunamadı.');
      return;
    }
    
    console.log(`${products.length} adet ürün başarıyla yüklendi.`);
    
    // Kategorileri oluştur ve sayıları hesapla
    const categories = extractCategories(products);
    
    // Kategori filtreleme işlemlerini kur
    setupCategoryFilters(categories, products);
    
    // Tüm ürünleri göster (başlangıçta)
    displayProducts(products);
    
    // URL'den kategori parametresi varsa filtrele
    handleUrlParameters(categories, products);
    
  } catch (error) {
    console.error('Hayvan Sağlığı modülü başlatılırken hata:', error);
    showError('Sayfa başlatılırken beklenmeyen bir hata oluştu.');
  }
}

// Ürün verilerini API'den getir
async function fetchProducts() {
  try {
    const response = await fetch('/urunler/api/hayvan-sagligi.json');
    
    if (!response.ok) {
      throw new Error(`API yanıt hatası: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Ürünler yüklenirken hata:', error);
    showError('Ürün verileri alınamadı. Lütfen daha sonra tekrar deneyin.');
    return [];
  }
}

// Kategorileri çıkar ve sayılarını hesapla
function extractCategories(products) {
  const categories = {
    'ALL': { name: 'Tüm Ürünler', count: products.length, icon: 'home' }
  };
  
  products.forEach(product => {
    let category = (product.Category || product.kategori || 'GENEL').toUpperCase();
    
    if (!categories[category]) {
      categories[category] = {
        name: category,
        count: 1,
        icon: getCategoryIcon(category)
      };
    } else {
      categories[category].count++;
    }
  });
  
  return categories;
}

// Kategoriye uygun ikon belirleme
function getCategoryIcon(category) {
  const categoryLower = category.toLowerCase();
  
  if (categoryLower.includes('antibiyotik')) return 'pill';
  if (categoryLower.includes('asi') || categoryLower.includes('aşı')) return 'vaccine';
  if (categoryLower.includes('vitamin')) return 'heart';
  if (categoryLower.includes('dezenfektan')) return 'shield';
  if (categoryLower.includes('antiseptik')) return 'drop';
  if (categoryLower.includes('hormon')) return 'activity';
  
  // Varsayılan ikon
  return 'box';
}

// Kategori filtrelerini oluştur
function setupCategoryFilters(categories, products) {
  const categoryList = document.getElementById('categoryList');
  if (!categoryList) {
    console.error('Kategori listesi bulunamadı (ID: categoryList)');
    return;
  }
  
  // Listenin içeriğini temizle
  categoryList.innerHTML = '';
  
  // Ana "Tüm Ürünler" kategorisini ekle
  const allCategoryHtml = createCategoryItem('ALL', categories.ALL, true);
  categoryList.insertAdjacentHTML('beforeend', allCategoryHtml);
  
  // Diğer kategorileri ekle (ALL dışındakiler)
  const sortedCategories = Object.keys(categories)
    .filter(key => key !== 'ALL')
    .sort();
  
  sortedCategories.forEach(key => {
    const category = categories[key];
    const categoryHtml = createCategoryItem(key, category);
    categoryList.insertAdjacentHTML('beforeend', categoryHtml);
  });
  
  // Kategori link tıklama olaylarını ekle
  document.querySelectorAll('.filter-link').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Tüm linklerin aktif durumlarını kaldır
      document.querySelectorAll('.filter-link').forEach(l => {
        l.classList.remove('active');
      });
      
      // Bu linki aktif yap
      this.classList.add('active');
      
      // Kategori değerini al
      const categoryKey = this.getAttribute('data-category');
      
      // Ürünleri filtrele
      if (categoryKey === 'ALL') {
        displayProducts(products);
      } else {
        const filteredProducts = products.filter(product => {
          const productCategory = (product.Category || product.kategori || '').toUpperCase();
          return productCategory === categoryKey;
        });
        
        displayProducts(filteredProducts);
      }
      
      // URL'yi güncelle (opsiyonel)
      updateUrlParameter(categoryKey);
    });
  });
}

// Kategori öğesi HTML'i oluştur
function createCategoryItem(key, category, isActive = false) {
  const iconSvg = getCategoryIconSvg(category.icon);
  
  return `
    <li class="filter-item">
      <a href="#" class="filter-link ${isActive ? 'active' : ''}" data-category="${key}">
        ${iconSvg}
        ${category.name}
        <span class="filter-count">${category.count}</span>
      </a>
    </li>
  `;
}

// Kategori ikonu için SVG kodu
function getCategoryIconSvg(iconName) {
  const icons = {
    'home': '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline>',
    'pill': '<circle cx="12" cy="12" r="10"></circle><path d="M12 8v8M8 12h8"></path>',
    'vaccine': '<path d="M19 2H5a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zM9 17V7"/><path d="M15 7v10"/>',
    'heart': '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle>',
    'shield': '<path d="M12 2v6"></path><path d="M5 4.27 6.5 9"></path><path d="m17.5 6.5-2.5 2.5"></path><path d="m3 14 4-1"></path><path d="m7 7-3 2"></path><path d="M9 17H3"></path><path d="m13 14 4 3"></path><path d="M21 12v3"></path><path d="m12 20 3-4"></path><path d="m5 18 5-3"></path><path d="M20 5c-2 2-2 4.5-1 7"></path>',
    'drop': '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>',
    'activity': '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
    'box': '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line>'
  };
  
  return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${icons[iconName] || icons.box}</svg>`;
}

// Ürünleri görüntüle
function displayProducts(products) {
  const productsGrid = document.querySelector('.products-grid');
  if (!productsGrid) {
    console.error('Ürün grid elementi bulunamadı');
    return;
  }
  
  // Ürün sayısını güncelle
  updateProductCount(products.length);
  
  if (products.length === 0) {
    productsGrid.innerHTML = '<div class="no-results">Bu kategoride ürün bulunamadı.</div>';
    return;
  }
  
  let productsHtml = '';
  
  products.forEach(product => {
    const slug = createSlug(product.ProductName);
    const category = (product.Category || product.kategori || 'GENEL').toUpperCase();
    let imageUrl = product.ImageUrl || '';
    
    // Alternatif ürün görseli kontrolü
    if (!imageUrl && product.ProductImages && product.ProductImages.length > 0) {
      imageUrl = product.ProductImages[0].ImageUrl;
    }
    
    productsHtml += `
      <div class="product-card" data-category="${category}" data-id="${product.ProductId}">
        <div class="product-image-container">
          ${imageUrl 
            ? `<img src="${imageUrl}" alt="${product.ProductName}" class="product-image" loading="lazy" onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'no-image\\'><span>Fotoğraf hazırlanıyor</span></div>';">`
            : `<div class="no-image"><span>Fotoğraf hazırlanıyor</span></div>`
          }
        </div>
        <div class="product-content">
          <span class="product-category">${category}</span>
          <h3 class="product-name">${product.ProductName}</h3>
          <a href="/urunler/hayvan-sagligi/product" onclick="return storeAndNavigate('${slug}')" class="product-link">
            <span>Ürünü İncele</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
          </a>
        </div>
      </div>
    `;
  });
  
  productsGrid.innerHTML = productsHtml;
}

// URL parametrelerini işle
function handleUrlParameters(categories, products) {
  const urlParams = new URLSearchParams(window.location.search);
  const kategori = urlParams.get('kategori');
  
  if (kategori) {
    // Kategori bağlantısını bul
    const categoryKey = Object.keys(categories).find(key => 
      key.toUpperCase() === kategori.toUpperCase()
    );
    
    if (categoryKey) {
      // İlgili filtreye tıkla
      const filterLink = document.querySelector(`.filter-link[data-category="${categoryKey}"]`);
      if (filterLink) {
        filterLink.click();
      }
    }
  }
}

// URL parametresini güncelleme
function updateUrlParameter(categoryKey) {
  const url = new URL(window.location.href);
  
  if (categoryKey === 'ALL') {
    url.searchParams.delete('kategori');
  } else {
    url.searchParams.set('kategori', categoryKey);
  }
  
  window.history.replaceState({}, '', url);
}

// Ürün sayısını güncelleme
function updateProductCount(count) {
  const countElement = document.getElementById('productCount');
  if (countElement) {
    countElement.textContent = count === 1 ? '1 ürün' : `${count} ürün`;
  }
}

// Hata mesajı gösterme
function showError(message) {
  const productsGrid = document.querySelector('.products-grid');
  if (productsGrid) {
    productsGrid.innerHTML = `<div class="error">${message}</div>`;
  }
  console.error(message);
}

// SEO dostu URL oluşturma
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

// Ürün detayına yönlendirme için
function storeAndNavigate(slug) {
  localStorage.setItem('selectedProductSlug', slug);
  window.location.href = `/urunler/hayvan-sagligi/product`;
  return false;
}

// Global olarak erişilebilir olması için fonksiyonu tanımla
window.storeAndNavigate = storeAndNavigate;