/**
 * Hayvan Sağlığı Ürünleri Yönetimi
 * Yeni düzenleme - Türkçe karakter sorunu çözümlü
 */

// Sayfa açıldığında çalıştır
document.addEventListener('DOMContentLoaded', function() {
  // Sayfa yüklendiğinde ürünleri getir
  fetchAllProducts();
});

// Tüm ürünleri getir
async function fetchAllProducts() {
  try {
    const response = await fetch('/urunler/api/hayvan-sagligi.json');
    if (!response.ok) {
      throw new Error(`API yanıt hatası: ${response.status}`);
    }
    
    const products = await response.json();
    console.log(`${products.length} adet ürün yüklendi`);
    
    // Ürünleri ve kategorileri işle
    setupProductsAndCategories(products);
    
    // URL'de kategori parametresi var mı kontrol et
    checkUrlForCategory(products);
  } catch (error) {
    console.error('Ürünler yüklenirken hata:', error);
    showErrorMessage('Ürünler yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.');
  }
}

// Ürünleri ve kategorileri ayarla
function setupProductsAndCategories(products) {
  // Önce kategorileri hazırla
  const categories = extractCategories(products);
  
  // Kategori menüsünü oluştur
  buildCategoryMenu(categories);
  
  // Ürünleri görüntüle
  displayProducts(products);
  
  // Kategori filtreleme olaylarını ekle
  setupCategoryEvents(products);
}

// Ürünlerden kategorileri çıkar
function extractCategories(products) {
  const categories = {};
  
  products.forEach(product => {
    // Kategori adını al (farklı alanlarda olabilir)
    const categoryName = (product.Category || product.kategori || 'GENEL').toUpperCase();
    
    if (!categories[categoryName]) {
      categories[categoryName] = {
        count: 1,
        slug: createSlug(categoryName)
      };
    } else {
      categories[categoryName].count++;
    }
  });
  
  return categories;
}

// Kategori menüsü oluştur
function buildCategoryMenu(categories) {
  const categoryList = document.getElementById('categoryList');
  if (!categoryList) {
    console.error('Kategori listesi bulunamadı');
    return;
  }
  
  // İlk madde zaten var (Tüm Ürünler), diğer kategorileri ekle
  const firstItem = categoryList.querySelector('.filter-item');
  if (!firstItem) {
    console.error('Kategori listesinde ilk madde bulunamadı');
    return;
  }
  
  // Kategorileri alfabetik sırala
  const sortedCategories = Object.keys(categories).sort();
  
  // Her kategori için bir liste maddesi oluştur
  let categoryHTML = '';
  
  sortedCategories.forEach(categoryName => {
    if (categoryName === 'TÜM ÜRÜNLER') return; // Ana kategoriyi atlıyoruz
    
    const categoryInfo = categories[categoryName];
    const categorySlug = categoryInfo.slug;
    
    // Kategori ikon seçimi
    let iconSvg = '';
    
    // Kategoriye göre farklı ikonlar
    if (categoryName.includes('ANTIBIYOTIK')) {
      iconSvg = '<circle cx="12" cy="12" r="10"></circle><path d="M12 8v8M8 12h8"></path>';
    } else if (categoryName.includes('ASI')) {
      iconSvg = '<path d="M19 2H5a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zM9 17V7"/><path d="M15 7v10"/>';
    } else if (categoryName.includes('VITAMIN')) {
      iconSvg = '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle>';
    } else if (categoryName.includes('DEZENFEKTAN')) {
      iconSvg = '<path d="M12 2v6"></path><path d="M5 4.27 6.5 9"></path><path d="m17.5 6.5-2.5 2.5"></path><path d="m3 14 4-1"></path><path d="m7 7-3 2"></path><path d="M9 17H3"></path><path d="m13 14 4 3"></path><path d="M21 12v3"></path><path d="m12 20 3-4"></path><path d="m5 18 5-3"></path><path d="M20 5c-2 2-2 4.5-1 7"></path>';
    } else {
      iconSvg = '<circle cx="12" cy="12" r="10"></circle><path d="M12 8v8M8 12h8"></path>';
    }
    
    categoryHTML += `
      <li class="filter-item">
        <a href="javascript:void(0)" class="filter-link" data-category="${categoryName}">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${iconSvg}</svg>
          ${categoryName}
          <span class="filter-count">${categoryInfo.count}</span>
        </a>
      </li>
    `;
  });
  
  // Kategori HTML'ini ekle
  firstItem.insertAdjacentHTML('afterend', categoryHTML);
}

// Kategori filtreleme olaylarını ayarla
function setupCategoryEvents(products) {
  // Tüm kategori linklerine tıklama olayı ekle
  document.querySelectorAll('.filter-link').forEach(link => {
    link.addEventListener('click', function() {
      // Aktif filtreyi güncelle
      document.querySelectorAll('.filter-link').forEach(l => l.classList.remove('active'));
      this.classList.add('active');
      
      // Kategoriyi al
      const category = this.getAttribute('data-category');
      
      // Ürünleri filtrele
      filterProductsByCategory(products, category);
      
      // URL'yi güncelle (SEO için)
      if (category === 'ALL') {
        history.pushState({}, '', '/urunler/hayvan-sagligi/');
      } else {
        const slug = createSlug(category);
        history.pushState({}, '', `/urunler/hayvan-sagligi/?kategori=${encodeURIComponent(category)}`);
      }
    });
  });
}

// URL'deki kategori parametresini kontrol et
function checkUrlForCategory(products) {
  const urlParams = new URLSearchParams(window.location.search);
  const kategoriParam = urlParams.get('kategori');
  
  if (kategoriParam) {
    // Kategori linkini bul ve tıkla
    const links = document.querySelectorAll('.filter-link');
    let found = false;
    
    links.forEach(link => {
      const category = link.getAttribute('data-category');
      if (kategoriParam.toUpperCase() === category) {
        link.click();
        found = true;
      }
    });
    
    // Bulunamadıysa tüm ürünleri göster
    if (!found) {
      const allProductsLink = document.querySelector('.filter-link[data-category="ALL"]');
      if (allProductsLink) {
        allProductsLink.click();
      }
    }
  } else {
    // URL'de /some-category/ formatı varsa
    const pathSegments = window.location.pathname.split('/');
    const lastSegment = pathSegments[pathSegments.length - 1];
    
    if (lastSegment && lastSegment !== 'hayvan-sagligi' && lastSegment !== 'index.html' && lastSegment !== '') {
      // Slug'dan kategoriyi bulma
      const slug = lastSegment.toLowerCase();
      const links = document.querySelectorAll('.filter-link');
      let found = false;
      
      links.forEach(link => {
        const category = link.getAttribute('data-category');
        if (category && createSlug(category) === slug) {
          link.click();
          found = true;
        }
      });
      
      // Bulunamadıysa tüm ürünleri göster
      if (!found) {
        const allProductsLink = document.querySelector('.filter-link[data-category="ALL"]');
        if (allProductsLink) {
          allProductsLink.click();
        }
      }
    }
  }
}

// Ürünleri kategoriye göre filtrele
function filterProductsByCategory(products, category) {
  let filteredProducts;
  
  if (category === 'ALL') {
    // Tüm ürünleri göster
    filteredProducts = products;
  } else {
    // Kategori filtresi uygula
    filteredProducts = products.filter(product => {
      const productCategory = (product.Category || product.kategori || '').toUpperCase();
      return productCategory === category;
    });
  }
  
  // Filtrelenmiş ürünleri göster
  displayProducts(filteredProducts);
  
  // Ürün sayısını güncelle
  updateProductCount(filteredProducts.length);
}

// Ürünleri görüntüle
function displayProducts(products) {
  const productsGrid = document.querySelector('.products-grid');
  if (!productsGrid) {
    console.error('Ürün grid elementi bulunamadı');
    return;
  }
  
  // Ürün yok ise
  if (!products || products.length === 0) {
    productsGrid.innerHTML = '<div class="no-results">Seçilen kategoride ürün bulunamadı.</div>';
    return;
  }
  
  // HTML oluştur
  let productsHTML = '';
  
  products.forEach(product => {
    // Ürün slug'ı oluştur
    const slug = createSlug(product.ProductName);
    
    // Kategori adını al
    const category = (product.Category || product.kategori || 'GENEL').toUpperCase();
    
    // Ürün görselini al
    const imageUrl = product.ImageUrl || (product.ProductImages && product.ProductImages.length > 0 ? product.ProductImages[0].ImageUrl : '');
    
    // Ürün kartı HTML'i
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
          <a href="/urunler/hayvan-sagligi/product/${slug}" class="product-link">
            <span>Ürünü İncele</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
          </a>
        </div>
      </div>
    `;
  });
  
  // Ürünleri sayfaya ekle
  productsGrid.innerHTML = productsHTML;
}

// Ürün sayısını güncelle
function updateProductCount(count) {
  const countElement = document.getElementById('productCount');
  if (countElement) {
    countElement.textContent = `${count} ürün`;
  }
}

// Hata mesajı göster
function showErrorMessage(message) {
  const productsGrid = document.querySelector('.products-grid');
  if (productsGrid) {
    productsGrid.innerHTML = `<div class="error">${message}</div>`;
  }
}

// SEO dostu slug oluştur (Türkçe karakter desteği)
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