/**
 * Hayvan Sağlığı Ürünleri Yönetimi
 * SEO dostu statik sayfalar, kategoriler ve filtreleme
 */

// Sayfa açıldığında çalıştır
document.addEventListener('DOMContentLoaded', function() {
  initializeAnimalHealthProducts();
});

// Hayvan Sağlığı Ürünlerini Yükle ve İşle
async function initializeAnimalHealthProducts() {
  try {
    // Ürün verilerini çek
    const products = await fetchAnimalHealthProducts();
    
    // Kategori filtreleme sistemini kur
    setupCategoryFilters(products);
    
    // Ürünleri listele
    displayProducts(products);
    
    // URL parametrelerini kontrol et (filtreleme için)
    handleUrlParameters(products);
    
  } catch (error) {
    console.error('Hayvan Sağlığı ürünleri yüklenirken hata:', error);
    showErrorMessage('Ürünler yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.');
  }
}

// Hayvan Sağlığı Ürünlerini API'den Çek
async function fetchAnimalHealthProducts() {
  try {
    const response = await fetch('/urunler/api/hayvan-sagligi.json');
    if (!response.ok) {
      throw new Error(`HTTP hata: ${response.status}`);
    }
    const products = await response.json();
    return products;
  } catch (error) {
    console.error('Ürün verileri getirilemedi:', error);
    throw error;
  }
}

// Kategori Filtreleme Sistemini Kur
function setupCategoryFilters(products) {
  const categoryList = document.getElementById('categoryList');
  if (!categoryList) return;
  
  // Tüm kategorileri topla
  const categories = {};
  
  products.forEach(product => {
    // Kategori adını al
    let category = product.Category || (product.kategori || 'GENEL');
    
    // Kategori ismini standartlaştır (büyük harflerle)
    category = category.toUpperCase();
    
    if (!categories[category]) {
      categories[category] = {
        name: category,
        count: 1
      };
    } else {
      categories[category].count++;
    }
  });
  
  // Kategori listesini oluştur
  // İlk ürün zaten sayfada var, o yüzden sadece diğer kategorileri ekle
  let categoryHTML = '';
  
  // Kategorileri alfabetik sırala
  const sortedCategories = Object.values(categories).sort((a, b) => a.name.localeCompare(b.name));
  
  // Kategori linklerini oluştur
  sortedCategories.forEach(category => {
    // Ana kategori linkine ekleme yapma
    if (category.name === 'TÜM ÜRÜNLER') return;
    
    // Kategori adını URL için hazırla - Türkçe karakterleri işle
    const categorySlug = slugify(category.name);
    
    categoryHTML += `
      <li class="filter-item">
        <a href="/urunler/hayvan-sagligi?kategori=${encodeURIComponent(category.name)}" class="filter-link" data-category="${category.name}">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 8v8M8 12h8"></path>
          </svg>
          ${category.name}
          <span class="filter-count">${category.count}</span>
        </a>
      </li>
    `;
  });
  
  // İlk öğeden sonra ekle
  const firstItem = categoryList.querySelector('.filter-item');
  if (firstItem && categoryHTML) {
    firstItem.insertAdjacentHTML('afterend', categoryHTML);
  }
  
  // Filtre linklerine tıklama olayı ekle
  document.querySelectorAll('.filter-link').forEach(link => {
    link.addEventListener('click', function(e) {
      // URL özel parametre taşıyorsa normal davran (yönlendirme yap)
      if (link.getAttribute('href').includes('?')) {
        return; // Normal yönlendirmeye izin ver
      }
      
      // Yoksa sayfada filtreleme yap
      e.preventDefault();
      
      // Diğer aktif filtreleri kaldır
      document.querySelectorAll('.filter-link').forEach(l => {
        l.classList.remove('active');
      });
      
      // Bu filtreyi aktif yap
      this.classList.add('active');
      
      // Kategori filtrele
      const category = this.getAttribute('data-category');
      filterProductsByCategory(products, category);
      
      // URL'yi güncelle
      if (category) {
        history.pushState({}, '', `?kategori=${encodeURIComponent(category)}`);
      } else {
        history.pushState({}, '', '/urunler/hayvan-sagligi');
      }
    });
  });
}

// URL Parametrelerini İşle
function handleUrlParameters(products) {
  const urlParams = new URLSearchParams(window.location.search);
  const kategori = urlParams.get('kategori');
  
  if (kategori) {
    // Kategori filtresini aktifleştir
    const filterLinks = document.querySelectorAll('.filter-link');
    filterLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('data-category') === kategori || 
          link.textContent.trim().toLowerCase().includes(kategori.toLowerCase())) {
        link.classList.add('active');
      }
    });
    
    // Ürünleri kategoriye göre filtrele
    filterProductsByCategory(products, kategori);
  }
  
  // URL'de /antibiyotik, /vitamin gibi alt kategori yolu varsa
  const pathSegments = window.location.pathname.split('/');
  const lastSegment = pathSegments[pathSegments.length - 1];
  
  if (lastSegment && lastSegment !== 'hayvan-sagligi' && lastSegment !== 'index.html') {
    console.log("URL'de kategori segmenti bulundu:", lastSegment);
    
    // Türkçe karakter problemi olduğundan, tüm kategorileri kontrol et
    // ve benzerlik bul
    let bestMatch = null;
    let bestScore = 0;
    
    // Tüm ürünlerin kategorilerini topla
    const allCategories = {};
    products.forEach(product => {
      const cat = (product.Category || product.kategori || 'GENEL').toUpperCase();
      allCategories[cat] = true;
    });
    
    // Her kategori için bir slug oluştur ve URL ile karşılaştır
    Object.keys(allCategories).forEach(category => {
      const slug = slugify(category);
      
      // Tam eşleşme varsa
      if (slug === lastSegment.toLowerCase()) {
        bestMatch = category;
        bestScore = 100;
      } 
      // Ya da kısmi eşleşme varsa ve daha iyi bir skor ise
      else if (slug.includes(lastSegment.toLowerCase()) || lastSegment.toLowerCase().includes(slug)) {
        const score = Math.min(slug.length, lastSegment.length) / Math.max(slug.length, lastSegment.length) * 100;
        if (score > bestScore) {
          bestMatch = category;
          bestScore = score;
        }
      }
    });
    
    if (bestMatch && bestScore > 50) {
      console.log("Kategori eşleşmesi bulundu:", bestMatch, "skor:", bestScore);
      
      // Kategori filtresini aktifleştir
      const filterLinks = document.querySelectorAll('.filter-link');
      filterLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-category') === bestMatch || 
            link.textContent.trim().toUpperCase() === bestMatch) {
          link.classList.add('active');
        }
      });
      
      // Bu kategori adına göre ürünleri filtrele
      filterProductsByCategory(products, bestMatch);
    } else {
      console.log("Kategori eşleşmesi bulunamadı:", lastSegment);
    }
  }
}

// Ürünleri Kategoriye Göre Filtrele
function filterProductsByCategory(products, category) {
  let filteredProducts;
  
  if (!category || category === 'TÜM ÜRÜNLER') {
    // Tüm ürünleri göster
    filteredProducts = products;
  } else {
    // Belirli kategorideki ürünleri göster
    filteredProducts = products.filter(product => {
      // Kategori adını kontrol et (farklı alanlarda olabilir)
      const productCategory = (product.Category || product.kategori || '').toUpperCase();
      return productCategory === category.toUpperCase();
    });
  }
  
  // Ürün sayısını güncelle
  updateProductCount(filteredProducts.length);
  
  // Filtrelenmiş ürünleri göster
  displayProducts(filteredProducts);
}

// Ürün Sayısını Güncelle
function updateProductCount(count) {
  const countElement = document.querySelector('.product-count');
  if (countElement) {
    countElement.textContent = count;
  }
}

// Ürünleri Göster
function displayProducts(products) {
  const productsGrid = document.querySelector('.products-grid');
  
  if (!productsGrid) {
    console.error('Ürün grid elementi bulunamadı');
    return;
  }
  
  // Eğer ürün yoksa
  if (!products || products.length === 0) {
    productsGrid.innerHTML = '<div class="no-results">Ürün bulunamadı.</div>';
    return;
  }
  
  // Ürün sayısını güncelle
  updateProductCount(products.length);
  
  // Ürünleri HTML olarak hazırla
  let productsHTML = '';
  
  products.forEach(product => {
    // URL dostu slug oluştur
    const slug = slugify(product.ProductName);
    
    // Kategori adını al (bu alanda verileri standartlaştırıyoruz)
    let category = product.Category || product.kategori || 'GENEL';
    
    // Boş kategori kontrolü
    if (!category || category.trim() === '') {
      category = 'GENEL';
    }
    
    // Kategori isimlerini standartlaştır (büyük harflerle)
    category = category.toUpperCase();
    
    // Ürün görseli
    let image = product.ImageUrl || '';
    
    // Eğer ürün resmini bulamadıysak ProductImages içinden bakalım
    if (!image && product.ProductImages && product.ProductImages.length > 0) {
      image = product.ProductImages[0].ImageUrl;
    }
    
    // Ürün HTML
    productsHTML += `
      <div class="product-card" data-category="${category}" data-main-category="Hayvan Sağlığı">
        <div class="product-image-container">
          ${image 
            ? `<img src="${image}" alt="${product.ProductName}" class="product-image" loading="lazy" onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'no-image\\'></div>';">`
            : `<div class="no-image"></div>`
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
  
  // Ürün kartlarını geliştir (hover efektleri vb.)
  if (typeof enhanceProductCards === 'function') {
    enhanceProductCards();
  }
}

// Hata Mesajı Göster
function showErrorMessage(message) {
  const productsGrid = document.querySelector('.products-grid');
  if (productsGrid) {
    productsGrid.innerHTML = `<div class="error-message">${message}</div>`;
  }
}

// URL dostu slug oluştur
function slugify(text) {
  // Önce Turkish karakterleri değiştir, sonra diğer işlemleri yap
  return text
    .toString()
    .toLowerCase()
    .replace(/ğ/g, 'g')             // Türkçe karakterleri İngilizce karşılıklarına çevir
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/Ğ/g, 'g')
    .replace(/Ü/g, 'u')
    .replace(/Ş/g, 's')
    .replace(/İ/g, 'i')
    .replace(/Ö/g, 'o')
    .replace(/Ç/g, 'c')
    .replace(/\s+/g, '-')           // Boşlukları tireye çevir
    .replace(/[^\w\-]+/g, '')       // Alfanümerik olmayan karakterleri kaldır
    .replace(/\-\-+/g, '-')         // Çoklu tireleri tek tireye indir
    .replace(/^-+/, '')             // Baştaki tireleri kaldır
    .replace(/-+$/, '');            // Sondaki tireleri kaldır
}

// Ürün detay sayfaları için yapılan özelleştirmeler
if (document.body.classList.contains('product-detail-page')) {
  document.addEventListener('DOMContentLoaded', function() {
    // Lightbox aktivasyonu
    if (typeof initLightbox === 'function') {
      initLightbox();
    }

    // Diğer modern özellikler
    if (typeof addBackToTopButton === 'function') {
      addBackToTopButton();
    }
  });
}