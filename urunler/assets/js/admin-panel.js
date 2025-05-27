/**
 * Serakıncı Admin Panel Yönetimi
 * Admin paneli için etkileşimler ve veri yönetimi
 */

// Veritabanı Benzeri Veri Yapıları
let products = [
  {
    id: "KSNUXEAQU871",
    name: "AQUABELLA LOTION ESSENCE",
    brand: "Nuxe",
    category: "Dermokozmetik",
    description: "Cildi arındıran ve canlandıran esans, tüm cilt tipleri için uygundur.",
    status: "active",
    image: "/urunler/assets/logos/products/aquabella.jpg"
  },
  {
    id: "1002995851",
    name: "SEBIUM H2O 500ml İKİZ KOFRE",
    brand: "Bioderma",
    category: "Dermokozmetik",
    description: "Yağlı ciltler için derin temizlik solüsyonu",
    status: "active",
    image: "/urunler/assets/logos/products/sebium.jpg"
  },
  {
    id: "DMTMZ001",
    name: "PetActive Köpek Maması 15kg",
    brand: "PetActive",
    category: "Hayvan Sağlığı",
    description: "Tüm ırk köpekler için tam ve dengeli beslenme sağlar",
    status: "stock-low",
    image: "/urunler/assets/logos/products/petactive-dog.jpg"
  }
];

let brands = [
  {
    name: "Bioderma",
    category: "Dermokozmetik",
    productCount: 24,
    status: "active",
    logo: "/urunler/assets/logos/bioderma.png"
  },
  {
    name: "Nuxe",
    category: "Dermokozmetik",
    productCount: 18,
    status: "active",
    logo: "/urunler/assets/logos/nuxe.png"
  },
  {
    name: "Boehringer Ingelheim",
    category: "Hayvan Sağlığı",
    productCount: 12,
    status: "active",
    logo: "/urunler/assets/Boehringer_Ingelheim_Logo.svg.png"
  }
];

let categories = [
  {
    name: "Dermokozmetik",
    productCount: 85,
    brandCount: 6,
    status: "active"
  },
  {
    name: "Hayvan Sağlığı",
    productCount: 56,
    brandCount: 8,
    status: "active"
  }
];

// LocalStorage'dan verileri yükle
function loadData() {
  const savedProducts = localStorage.getItem('admin_products');
  if (savedProducts) {
    try {
      products = JSON.parse(savedProducts);
    } catch (e) {
      console.error('Ürünler yüklenirken hata oluştu:', e);
    }
  }
  
  const savedBrands = localStorage.getItem('admin_brands');
  if (savedBrands) {
    try {
      brands = JSON.parse(savedBrands);
    } catch (e) {
      console.error('Markalar yüklenirken hata oluştu:', e);
    }
  }
  
  const savedCategories = localStorage.getItem('admin_categories');
  if (savedCategories) {
    try {
      categories = JSON.parse(savedCategories);
    } catch (e) {
      console.error('Kategoriler yüklenirken hata oluştu:', e);
    }
  }
}

// LocalStorage'a verileri kaydet
function saveData() {
  localStorage.setItem('admin_products', JSON.stringify(products));
  localStorage.setItem('admin_brands', JSON.stringify(brands));
  localStorage.setItem('admin_categories', JSON.stringify(categories));
}

// Ürün tablosunu doldur
function populateProductsTable() {
  const tableBody = document.getElementById('products-table-body');
  if (!tableBody) return;
  
  tableBody.innerHTML = '';
  
  products.forEach(product => {
    const row = document.createElement('tr');
    
    // Status badge sınıfını belirle
    let statusClass = 'badge-success';
    let statusText = 'Aktif';
    
    if (product.status === 'stock-low') {
      statusClass = 'badge-warning';
      statusText = 'Stok Az';
    } else if (product.status === 'inactive') {
      statusClass = 'badge-danger';
      statusText = 'Pasif';
    }
    
    row.innerHTML = `
      <td>${product.id}</td>
      <td>${product.name}</td>
      <td>${product.brand}</td>
      <td>${product.category}</td>
      <td><span class="badge ${statusClass}">${statusText}</span></td>
      <td>
        <div style="display: flex; gap: 0.5rem;">
          <button class="btn-secondary btn-edit" data-id="${product.id}">Düzenle</button>
          <button class="btn-danger btn-delete" data-id="${product.id}">Sil</button>
        </div>
      </td>
    `;
    
    tableBody.appendChild(row);
  });
  
  // Düzenleme ve silme butonlarına event listener ekle
  document.querySelectorAll('.btn-edit').forEach(button => {
    button.addEventListener('click', function() {
      const productId = this.getAttribute('data-id');
      editProduct(productId);
    });
  });
  
  document.querySelectorAll('.btn-delete').forEach(button => {
    button.addEventListener('click', function() {
      const productId = this.getAttribute('data-id');
      deleteProduct(productId);
    });
  });
}

// Yeni ürün ekle
function addProduct(productData) {
  // ID kontrolü - eğer aynı ID'de ürün varsa rastgele ID oluştur
  const existingProduct = products.find(p => p.id === productData.id);
  if (existingProduct) {
    productData.id = 'P' + Math.random().toString(36).substr(2, 9).toUpperCase();
  }
  
  products.push(productData);
  
  // Marka ve kategori için ürün sayılarını güncelle
  updateBrandProductCount(productData.brand);
  updateCategoryProductCount(productData.category);
  
  saveData();
  populateProductsTable();
  
  // Başarı mesajını göster
  const alertElement = document.getElementById('product-added-alert');
  if (alertElement) {
    alertElement.style.display = 'flex';
    setTimeout(() => {
      alertElement.style.display = 'none';
    }, 3000);
  }
}

// Ürün düzenle
function editProduct(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;
  
  // Düzenleme formunu aç
  document.getElementById('product-code').value = product.id;
  document.getElementById('product-name').value = product.name;
  document.getElementById('product-brand').value = product.brand;
  document.getElementById('product-category').value = product.category;
  document.getElementById('product-description').value = product.description || '';
  
  // Fotoğraf önizleme
  if (product.image) {
    document.getElementById('preview-img').src = product.image;
    document.getElementById('image-preview').style.display = 'block';
  }
  
  // Formu göster
  document.querySelector('[data-tab="add-product-tab"]').click();
  
  // Form başlığını değiştir
  const formTitle = document.querySelector('#add-product-tab .admin-card-title');
  if (formTitle) {
    formTitle.textContent = 'Ürün Düzenle';
  }
  
  // Form gönderim işlemini değiştir
  const form = document.getElementById('add-product-form');
  form.setAttribute('data-edit-id', productId);
}

// Ürün sil
function deleteProduct(productId) {
  if (confirm('Bu ürünü silmek istediğinize emin misiniz?')) {
    const productIndex = products.findIndex(p => p.id === productId);
    if (productIndex !== -1) {
      const product = products[productIndex];
      products.splice(productIndex, 1);
      
      // Marka ve kategori için ürün sayılarını güncelle
      updateBrandProductCount(product.brand);
      updateCategoryProductCount(product.category);
      
      saveData();
      populateProductsTable();
    }
  }
}

// Marka ürün sayısını güncelle
function updateBrandProductCount(brandName) {
  const brand = brands.find(b => b.name === brandName);
  if (brand) {
    const count = products.filter(p => p.brand === brandName).length;
    brand.productCount = count;
  }
}

// Kategori ürün sayısını güncelle
function updateCategoryProductCount(categoryName) {
  const category = categories.find(c => c.name === categoryName);
  if (category) {
    const count = products.filter(p => p.category === categoryName).length;
    category.productCount = count;
  }
}

// Ürün arama fonksiyonu
function searchProducts(query) {
  if (!query) {
    populateProductsTable();
    return;
  }
  
  query = query.toLowerCase();
  const filteredProducts = products.filter(product => 
    product.id.toLowerCase().includes(query) || 
    product.name.toLowerCase().includes(query) ||
    product.brand.toLowerCase().includes(query) ||
    product.category.toLowerCase().includes(query)
  );
  
  const tableBody = document.getElementById('products-table-body');
  if (!tableBody) return;
  
  tableBody.innerHTML = '';
  
  if (filteredProducts.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = '<td colspan="6" class="text-center">Eşleşen ürün bulunamadı.</td>';
    tableBody.appendChild(row);
    return;
  }
  
  filteredProducts.forEach(product => {
    const row = document.createElement('tr');
    
    let statusClass = 'badge-success';
    let statusText = 'Aktif';
    
    if (product.status === 'stock-low') {
      statusClass = 'badge-warning';
      statusText = 'Stok Az';
    } else if (product.status === 'inactive') {
      statusClass = 'badge-danger';
      statusText = 'Pasif';
    }
    
    row.innerHTML = `
      <td>${product.id}</td>
      <td>${product.name}</td>
      <td>${product.brand}</td>
      <td>${product.category}</td>
      <td><span class="badge ${statusClass}">${statusText}</span></td>
      <td>
        <div style="display: flex; gap: 0.5rem;">
          <button class="btn-secondary btn-edit" data-id="${product.id}">Düzenle</button>
          <button class="btn-danger btn-delete" data-id="${product.id}">Sil</button>
        </div>
      </td>
    `;
    
    tableBody.appendChild(row);
  });
  
  // Düzenleme ve silme butonlarına event listener ekle
  document.querySelectorAll('.btn-edit').forEach(button => {
    button.addEventListener('click', function() {
      const productId = this.getAttribute('data-id');
      editProduct(productId);
    });
  });
  
  document.querySelectorAll('.btn-delete').forEach(button => {
    button.addEventListener('click', function() {
      const productId = this.getAttribute('data-id');
      deleteProduct(productId);
    });
  });
}

// DOM yüklendiğinde çalışacak kodlar
document.addEventListener('DOMContentLoaded', function() {
  // Verileri yükle
  loadData();
  
  // Admin panel login işlemi
  const loginForm = document.getElementById('login-form');
  const loginPage = document.getElementById('login-page');
  const adminPanel = document.getElementById('admin-panel');
  const loginError = document.getElementById('login-error');
  const logoutBtn = document.getElementById('logout-btn');
  
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      
      // Basit doğrulama (gerçek bir uygulamada serverda yapılmalıdır)
      if (username === 'admin' && password === 'serakinci123') {
        loginPage.style.display = 'none';
        adminPanel.style.display = 'block';
        loginError.style.display = 'none';
        
        // Ürün tablosunu doldur
        populateProductsTable();
      } else {
        loginError.style.display = 'flex';
      }
    });
  }
  
  // Logout işlemi
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      loginPage.style.display = 'block';
      adminPanel.style.display = 'none';
      if (loginForm) loginForm.reset();
    });
  }
  
  // Tab değiştirme fonksiyonu
  const navLinks = document.querySelectorAll('.admin-nav-link');
  const tabs = document.querySelectorAll('.admin-tab');
  
  navLinks.forEach(link => {
    if (link.id !== 'logout-btn') {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Aktif tab class'ını kaldır
        navLinks.forEach(l => l.classList.remove('active'));
        
        // Tıklanan linke aktif class'ı ekle
        this.classList.add('active');
        
        // Tüm tabları gizle
        tabs.forEach(tab => tab.style.display = 'none');
        
        // Seçilen tabı göster
        const tabId = this.getAttribute('data-tab');
        document.getElementById(tabId).style.display = 'block';
      });
    }
  });
  
  // Fotoğraf önizleme
  const productImage = document.getElementById('product-image');
  const imagePreview = document.getElementById('image-preview');
  const previewImg = document.getElementById('preview-img');
  
  if (productImage) {
    productImage.addEventListener('change', function() {
      const file = this.files[0];
      
      if (file) {
        const reader = new FileReader();
        
        reader.addEventListener('load', function() {
          previewImg.src = reader.result;
          imagePreview.style.display = 'block';
        });
        
        reader.readAsDataURL(file);
      }
    });
  }
  
  // Ürün ekleme formu
  const addProductForm = document.getElementById('add-product-form');
  
  if (addProductForm) {
    addProductForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Formdan verileri al
      const productCode = document.getElementById('product-code').value;
      const productName = document.getElementById('product-name').value;
      const productBrand = document.getElementById('product-brand').value;
      const productCategory = document.getElementById('product-category').value;
      const productDescription = document.getElementById('product-description').value;
      const productStatus = "active"; // Varsayılan durum
      
      // Fotoğraf verisi
      let productImage = '';
      if (previewImg && previewImg.src) {
        productImage = previewImg.src;
      }
      
      // Düzenleme mi yoksa yeni ekleme mi kontrol et
      const editId = this.getAttribute('data-edit-id');
      
      if (editId) {
        // Ürünü güncelle
        const productIndex = products.findIndex(p => p.id === editId);
        if (productIndex !== -1) {
          const oldBrand = products[productIndex].brand;
          const oldCategory = products[productIndex].category;
          
          products[productIndex] = {
            id: productCode,
            name: productName,
            brand: productBrand,
            category: productCategory,
            description: productDescription,
            status: products[productIndex].status,
            image: productImage || products[productIndex].image
          };
          
          // Eski ve yeni kategori/marka ürün sayılarını güncelle
          if (oldBrand !== productBrand) {
            updateBrandProductCount(oldBrand);
            updateBrandProductCount(productBrand);
          }
          
          if (oldCategory !== productCategory) {
            updateCategoryProductCount(oldCategory);
            updateCategoryProductCount(productCategory);
          }
          
          saveData();
          populateProductsTable();
          
          // Formu sıfırla
          this.reset();
          this.removeAttribute('data-edit-id');
          imagePreview.style.display = 'none';
          
          // Başlığı düzelt
          const formTitle = document.querySelector('#add-product-tab .admin-card-title');
          if (formTitle) {
            formTitle.textContent = 'Yeni Ürün Ekle';
          }
          
          // Başarı mesajını göster
          const alertElement = document.getElementById('product-added-alert');
          if (alertElement) {
            alertElement.style.display = 'flex';
            setTimeout(() => {
              alertElement.style.display = 'none';
            }, 3000);
          }
        }
      } else {
        // Yeni ürün ekle
        const newProduct = {
          id: productCode,
          name: productName,
          brand: productBrand,
          category: productCategory,
          description: productDescription,
          status: productStatus,
          image: productImage
        };
        
        addProduct(newProduct);
        
        // Formu sıfırla
        this.reset();
        imagePreview.style.display = 'none';
      }
      
      // Ürünler tab'ına dön
      document.querySelector('[data-tab="products-tab"]').click();
    });
  }
  
  // Ürün arama
  const productSearch = document.getElementById('product-search');
  if (productSearch) {
    productSearch.addEventListener('input', function() {
      searchProducts(this.value.trim());
    });
  }
  
  // Kategori filtresi
  const brandFilter = document.getElementById('brand-filter');
  if (brandFilter) {
    brandFilter.addEventListener('change', function() {
      const selectedCategory = this.value;
      
      // Markaları filtrele
      const filteredBrands = selectedCategory === 'all' 
        ? brands 
        : brands.filter(brand => brand.category === selectedCategory);
      
      // Marka tablosunu güncelle
      const brandsTableBody = document.querySelector('#brands-tab table tbody');
      if (brandsTableBody) {
        brandsTableBody.innerHTML = '';
        
        filteredBrands.forEach(brand => {
          const row = document.createElement('tr');
          
          let statusClass = 'badge-success';
          let statusText = 'Aktif';
          
          if (brand.status === 'inactive') {
            statusClass = 'badge-danger';
            statusText = 'Pasif';
          }
          
          row.innerHTML = `
            <td>${brand.name}</td>
            <td>${brand.category}</td>
            <td>${brand.productCount}</td>
            <td><span class="badge ${statusClass}">${statusText}</span></td>
            <td><img src="${brand.logo}" alt="${brand.name}" height="30"></td>
            <td>
              <button class="btn-secondary">Düzenle</button>
            </td>
          `;
          
          brandsTableBody.appendChild(row);
        });
      }
    });
  }
});