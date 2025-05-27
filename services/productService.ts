
import { Product, MainCategory } from '../types';

// Files will be served from these paths relative to the domain root
const DERMOCOSMETICS_API_URL = '/urunler/api/products.json'; 
const ANIMAL_HEALTH_API_URL = '/urunler/api/hayvan-sagligi.json';

const fetchData = async (url: string, categoryName: MainCategory): Promise<Product[]> => {
  console.log(`productService: Fetching ${categoryName} products from path ${url}`);
  try {
    // Add a cache-busting query parameter
    const response = await fetch(`${url}?v=${new Date().getTime()}`, { 
      headers: { 
        'Accept': 'application/json',
        'Cache-Control': 'no-cache' 
      } 
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch ${categoryName} products from ${url}. HTTP status: ${response.status}`);
    }
    const rawData = await response.json();
    if (!Array.isArray(rawData)) {
      throw new Error(`Invalid data format for ${categoryName}: Expected an array from ${url}.`);
    }
    console.log(`productService: Received ${rawData.length} raw items for ${categoryName} from ${url}.`);
    if (rawData.length > 0) {
      console.log(`productService: First raw item for ${categoryName}:`, JSON.stringify(rawData[0], null, 2));
    }
    return rawData;
  } catch (error) {
    console.error(`productService: Error fetching or parsing data for ${categoryName} from ${url}:`, error);
    return []; 
  }
};

export const fetchProducts = async (): Promise<Product[]> => {
  let allProcessedProducts: Product[] = [];
  let totalExcludedCount = 0;

  // Fetch and process Dermokozmetik products
  const rawDermokozmetikProducts = await fetchData(DERMOCOSMETICS_API_URL, "Dermokozmetik");
  let dermokozmetikExcludedCount = 0;
  rawDermokozmetikProducts.forEach(item => {
    if (typeof item !== 'object' || item === null) {
      dermokozmetikExcludedCount++;
      return;
    }

    if (typeof item.ProductId !== 'number' || typeof item.ProductName !== 'string' || item.ProductName.trim() === '') {
      console.warn(`productService (Dermokozmetik): ProductID ${item.ProductId || 'N/A'} (${item.ProductName || 'N/A'}) missing essential fields. Excluding.`);
      dermokozmetikExcludedCount++;
      return;
    }

    const brand = typeof item.brand === 'string' && item.brand.trim() ? item.brand.trim() : (typeof item.cat === 'string' && item.cat.trim() ? item.cat.trim() : undefined);
    
    allProcessedProducts.push({
      ProductId: item.ProductId,
      ProductName: item.ProductName,
      ImageUrl: item.ImageUrl || undefined,
      anaKategori: "Dermokozmetik",
      brand: brand,
      cat: typeof item.cat === 'string' ? item.cat.trim() : undefined,
      description: typeof (item as any).description === 'string' ? (item as any).description.trim() : (typeof (item as any).Description === 'string' ? (item as any).Description.trim() : ''),
      ProductCode: typeof item.ProductCode === 'string' ? item.ProductCode.trim() : 'N/A',
      kategori: undefined,
    });
  });
  totalExcludedCount += dermokozmetikExcludedCount;

  // Fetch and process Hayvan Sağlığı products
  const rawAnimalHealthProducts = await fetchData(ANIMAL_HEALTH_API_URL, "Hayvan Sağlığı");
  let animalHealthExcludedCount = 0;
  rawAnimalHealthProducts.forEach(item => {
    if (typeof item !== 'object' || item === null) {
      animalHealthExcludedCount++;
      return;
    }

    if (typeof item.ProductId !== 'number' || typeof item.ProductName !== 'string' || item.ProductName.trim() === '') {
      console.warn(`productService (Hayvan Sağlığı): ProductID ${item.ProductId || 'N/A'} (${item.ProductName || 'N/A'}) missing essential fields. Excluding.`);
      animalHealthExcludedCount++;
      return;
    }
    
    const subCategory = typeof (item as any).kategori === 'string' && (item as any).kategori.trim() ? (item as any).kategori.trim() : undefined;

    allProcessedProducts.push({
      ProductId: item.ProductId,
      ProductName: item.ProductName,
      ImageUrl: item.ImageUrl || undefined,
      anaKategori: "Hayvan Sağlığı",
      kategori: subCategory,
      brand: typeof item.brand === 'string' && item.brand.trim() ? item.brand.trim() : undefined, // Keep brand if API provides it
      cat: undefined, 
      description: typeof (item as any).description === 'string' ? (item as any).description.trim() : (typeof (item as any).Description === 'string' ? (item as any).Description.trim() : ''),
      ProductCode: typeof item.ProductCode === 'string' ? item.ProductCode.trim() : 'N/A',
    });
  });
  totalExcludedCount += animalHealthExcludedCount;


  if (totalExcludedCount > 0) {
    console.warn(`productService: Total ${totalExcludedCount} items were excluded due to missing essential fields across all categories.`);
  }
  
  console.log("productService: Total processed valid products across all categories:", allProcessedProducts.length);
  return allProcessedProducts;
};
