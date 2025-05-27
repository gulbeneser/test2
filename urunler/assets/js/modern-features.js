/**
 * Modern Features - Ürün Katalog Web Sitesi İçin Modern Özellikler
 * 
 * Bu dosya, ürün katalog web sitesinin modern özelliklerini içerir.
 * - Resim Büyütme (Lightbox)
 * - Lazy Loading
 * - Sayfa Başına Dön Butonu
 * - Yapışkan Başlık
 * - Kayan Markalar
 */

// Lightbox (Ürün Resmi Büyütme)
function initLightbox() {
  const productImages = document.querySelectorAll('.product-image, .product-detail-image, .product-main-image');
  const lightbox = document.querySelector('.lightbox');
  
  if (!lightbox) {
    // Lightbox yoksa oluştur
    const lightboxHTML = `
      <div class="lightbox">
        <div class="lightbox-content">
          <img class="lightbox-image" src="" alt="Ürün Fotoğrafı">
          <div class="lightbox-close">×</div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', lightboxHTML);
  }
  
  const updatedLightbox = document.querySelector('.lightbox');
  const lightboxImage = updatedLightbox.querySelector('.lightbox-image');
  const lightboxClose = updatedLightbox.querySelector('.lightbox-close');
  
  // Ürün resimlerine tıklama olayı ekle
  productImages.forEach(image => {
    // Cursor style güncelle
    image.style.cursor = 'zoom-in';
    
    // Tıklama olayı ekle
    image.addEventListener('click', function() {
      // Orjinal görsel URL'sini al
      const originalSrc = this.getAttribute('data-original') || this.src;
      lightboxImage.src = originalSrc;
      lightboxImage.alt = this.alt || 'Ürün Fotoğrafı';
      updatedLightbox.classList.add('active');
      document.body.style.overflow = 'hidden'; // Sayfa kaydırmayı devre dışı bırak
    });
    
    // Hover efektlerini kaldırıyoruz, sadece tıklama ile büyütme yapacağız
    image.addEventListener('mousemove', function(e) {
      // Hover efekti kaldırıldı
    });
    
    // Mouse ayrıldığında efekt kaldırıldı
    image.addEventListener('mouseleave', function() {
      // Hover efekti kaldırıldı
    });
  });
  
  // Lightbox'ı kapatma olayı
  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
  }
  
  // Lightbox dışına tıklayarak kapatma
  if (updatedLightbox) {
    updatedLightbox.addEventListener('click', function(e) {
      if (e.target === updatedLightbox) {
        closeLightbox();
      }
    });
  }
  
  // ESC tuşu ile kapatma
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeLightbox();
    }
  });
  
  function closeLightbox() {
    updatedLightbox.classList.remove('active');
    document.body.style.overflow = ''; // Sayfa kaydırmayı etkinleştir
  }
}

// Lazy Loading (Resimleri Gecikmeli Yükleme)
function initLazyLoading() {
  const lazyImages = document.querySelectorAll('.product-image[loading="lazy"]');
  
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver(function(entries, observer) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          const lazyImage = entry.target;
          lazyImage.src = lazyImage.getAttribute('data-src') || lazyImage.src;
          lazyImage.classList.remove('lazy');
          imageObserver.unobserve(lazyImage);
        }
      });
    });
    
    lazyImages.forEach(function(lazyImage) {
      imageObserver.observe(lazyImage);
    });
  } else {
    // Fallback - Intersection Observer desteklenmiyor
    let lazyImageTimeout;
    
    function lazyLoad() {
      if (lazyImageTimeout) {
        clearTimeout(lazyImageTimeout);
      }
      
      lazyImageTimeout = setTimeout(function() {
        const scrollTop = window.pageYOffset;
        
        lazyImages.forEach(function(lazyImage) {
          if (lazyImage.offsetTop < (window.innerHeight + scrollTop)) {
            lazyImage.src = lazyImage.getAttribute('data-src') || lazyImage.src;
            lazyImage.classList.remove('lazy');
          }
        });
        
        if (lazyImages.length === 0) {
          document.removeEventListener('scroll', lazyLoad);
          window.removeEventListener('resize', lazyLoad);
          window.removeEventListener('orientationChange', lazyLoad);
        }
      }, 20);
    }
    
    document.addEventListener('scroll', lazyLoad);
    window.addEventListener('resize', lazyLoad);
    window.addEventListener('orientationChange', lazyLoad);
  }
}

// Ürün Kartları Animasyonu
function enhanceProductCards() {
  const productCards = document.querySelectorAll('.product-card');
  
  productCards.forEach(card => {
    // Hover animasyonu için transition ekle
    card.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
    
    // Hover olayları
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-5px)';
      this.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
      this.style.boxShadow = '0 2px 5px rgba(0,0,0,0.05)';
    });
  });
}

// Sayfa Başına Dön Butonu
function addBackToTopButton() {
  // Eğer buton zaten eklenmişse ekleme
  if (document.querySelector('.back-to-top')) {
    return;
  }
  
  // Buton HTML'si
  const buttonHTML = `
    <button class="back-to-top">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="18 15 12 9 6 15"></polyline>
      </svg>
    </button>
  `;
  
  // Butonu sayfaya ekle
  document.body.insertAdjacentHTML('beforeend', buttonHTML);
  
  // Buton stil için CSS ekle
  const style = document.createElement('style');
  style.textContent = `
    .back-to-top {
      position: fixed;
      bottom: 30px;
      right: 30px;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background-color: var(--primary, #4f46e5);
      color: white;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
      opacity: 0;
      visibility: hidden;
      z-index: 100;
    }
    
    .back-to-top.show {
      opacity: 1;
      visibility: visible;
    }
    
    .back-to-top:hover {
      background-color: var(--primary-dark, #4338ca);
      transform: translateY(-3px);
      box-shadow: 0 6px 12px rgba(0,0,0,0.15);
    }
  `;
  document.head.appendChild(style);
  
  // Buton davranışını ayarla
  const button = document.querySelector('.back-to-top');
  
  window.addEventListener('scroll', function() {
    if (window.pageYOffset > 300) {
      button.classList.add('show');
    } else {
      button.classList.remove('show');
    }
  });
  
  button.addEventListener('click', function() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

// Yapışkan Başlık
function initStickyHeader() {
  const header = document.querySelector('.header');
  
  if (!header) return;
  
  const headerHeight = header.offsetHeight;
  let lastScrollTop = 0;
  
  window.addEventListener('scroll', function() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > headerHeight) {
      header.classList.add('sticky');
      
      // Aşağı doğru kaydırma - başlığı gizle
      if (scrollTop > lastScrollTop && scrollTop > headerHeight * 2) {
        header.style.transform = 'translateY(-100%)';
      } 
      // Yukarı doğru kaydırma - başlığı göster
      else {
        header.style.transform = 'translateY(0)';
      }
    } else {
      header.classList.remove('sticky');
    }
    
    lastScrollTop = scrollTop;
  });
}

// Eksik Ürün Görselleri İçin Hata İşleme
function handleImageErrors() {
  // Image error handling
  const productImages = document.querySelectorAll('.product-image, .product-detail-image, .product-main-image');
  
  productImages.forEach(image => {
    // Görsel yüklenmezse placeholder göster
    image.onerror = function() {
      this.onerror = null; // Sonsuz döngüyü önle
      
      // Ebeveyn container'a placeholder ekle
      const container = this.parentElement;
      if (container) {
        container.innerHTML = '<div class="no-image"></div>';
      }
    };
  });
  
  // No image styling
  const noImageStyle = document.createElement('style');
  noImageStyle.textContent = `
    .no-image {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      width: 100%;
      background-color: #f3f4f6;
      color: var(--text-medium, #4b5563);
      border-radius: 8px;
      text-align: center;
      padding: 2rem;
    }
    
    .no-image::before {
      content: "📷";
      font-size: 3rem;
      margin-bottom: 1rem;
    }
    
    .no-image::after {
      content: "Fotoğraf hazırlanıyor";
      font-size: 1rem;
    }
  `;
  document.head.appendChild(noImageStyle);
}

// Kayan Markalar
function initMarqueeBrands() {
  const brandGroups = document.querySelectorAll('.brands-group');
  
  brandGroups.forEach((group, index) => {
    const direction = index % 2 === 0 ? 'right' : 'left';
    const speed = 30 + (index * 5); // Farklı hızlar
    
    // Sonsuz hareket için clone'lar oluştur
    const brandItems = group.querySelectorAll('.brand-item');
    const originalWidth = Array.from(brandItems).reduce((total, item) => total + item.offsetWidth, 0);
    
    // Yeterli miktarda kopya ekle
    const cloneCount = Math.ceil(window.innerWidth / originalWidth) + 1;
    
    for (let i = 0; i < cloneCount; i++) {
      brandItems.forEach(item => {
        const clone = item.cloneNode(true);
        group.appendChild(clone);
      });
    }
    
    // CSS animation ekle
    group.style.animation = `marquee-${direction} ${speed}s linear infinite`;
    group.style.display = 'flex';
    
    // Hover durumunda durdur
    group.addEventListener('mouseenter', () => {
      group.style.animationPlayState = 'paused';
    });
    
    group.addEventListener('mouseleave', () => {
      group.style.animationPlayState = 'running';
    });
  });
  
  // CSS animasyonları için stil ekle
  const style = document.createElement('style');
  style.textContent = `
    @keyframes marquee-right {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    
    @keyframes marquee-left {
      0% { transform: translateX(-50%); }
      100% { transform: translateX(0); }
    }
    
    .brands-container {
      overflow: hidden;
      width: 100%;
      position: relative;
    }
    
    .brands-group {
      white-space: nowrap;
      display: flex;
      align-items: center;
    }
    
    .brand-item {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      margin: 0 1rem;
      min-width: 150px;
    }
    
    .brand-logo {
      max-width: 120px;
      max-height: 80px;
      transition: transform 0.3s ease, filter 0.3s ease;
      filter: grayscale(100%) opacity(70%);
    }
    
    .brand-logo:hover {
      transform: scale(1.1);
      filter: grayscale(0%) opacity(100%);
    }
  `;
  document.head.appendChild(style);
}

// Döküman hazır olduğunda çalıştır
document.addEventListener('DOMContentLoaded', function() {
  initLightbox();
  initLazyLoading();
  enhanceProductCards();
  addBackToTopButton();
  initStickyHeader();
  handleImageErrors();
  
  // Optional: Kayan markalar başlangıçta aktif değil
  if (document.querySelector('.brands-container')) {
    initMarqueeBrands();
  }
});