import type { Product, ProductInsert, ProductUpdate } from '../lib/database.types';

let mockProducts: Product[] = [
  {
    id: '1',
    user_id: 'demo-user-id',
    name: 'Wireless Bluetooth Headphones',
    description: 'Premium noise-canceling headphones with 30-hour battery life',
    sku: 'WBH-001',
    category: 'Electronics',
    price: 149.99,
    cost: 75.00,
    stock_quantity: 45,
    low_stock_threshold: 10,
    supplier: 'AudioTech Solutions',
    brand: 'SoundWave',
    status: 'active',
    image_url: 'https://images.pexels.com/photos/3825517/pexels-photo-3825517.jpeg',
    tags: ['electronics', 'audio', 'wireless', 'bluetooth'],
    metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    user_id: 'demo-user-id',
    name: 'Organic Cotton T-Shirt',
    description: 'Comfortable, eco-friendly t-shirt made from 100% organic cotton',
    sku: 'OCT-002',
    category: 'Clothing',
    price: 29.99,
    cost: 12.00,
    stock_quantity: 120,
    low_stock_threshold: 20,
    supplier: 'EcoFabrics Inc',
    brand: 'GreenWear',
    status: 'active',
    image_url: 'https://images.pexels.com/photos/1192609/pexels-photo-1192609.jpeg',
    tags: ['clothing', 'organic', 'cotton', 'casual'],
    metadata: { sizes: ['S', 'M', 'L', 'XL'] },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    user_id: 'demo-user-id',
    name: 'Stainless Steel Water Bottle',
    description: 'Insulated water bottle keeps drinks cold for 24 hours',
    sku: 'SSWB-003',
    category: 'Home & Kitchen',
    price: 34.99,
    cost: 15.00,
    stock_quantity: 8,
    low_stock_threshold: 15,
    supplier: 'HomeGoods Wholesale',
    brand: 'HydroLife',
    status: 'active',
    image_url: 'https://images.pexels.com/photos/4318801/pexels-photo-4318801.jpeg',
    tags: ['kitchen', 'bottle', 'insulated', 'eco-friendly'],
    metadata: { capacity: '750ml' },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    user_id: 'demo-user-id',
    name: 'Leather Laptop Bag',
    description: 'Premium leather laptop bag with multiple compartments',
    sku: 'LLB-004',
    category: 'Accessories',
    price: 89.99,
    cost: 45.00,
    stock_quantity: 25,
    low_stock_threshold: 10,
    supplier: 'Leather Goods Co',
    brand: 'UrbanCarry',
    status: 'active',
    image_url: 'https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg',
    tags: ['accessories', 'leather', 'bag', 'laptop'],
    metadata: { fits: 'up to 15 inch laptops' },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '5',
    user_id: 'demo-user-id',
    name: 'Yoga Mat Premium',
    description: 'Non-slip, eco-friendly yoga mat with carrying strap',
    sku: 'YMP-005',
    category: 'Sports & Fitness',
    price: 49.99,
    cost: 20.00,
    stock_quantity: 60,
    low_stock_threshold: 15,
    supplier: 'Fitness Supplies Ltd',
    brand: 'ZenFlow',
    status: 'active',
    image_url: 'https://images.pexels.com/photos/4056723/pexels-photo-4056723.jpeg',
    tags: ['fitness', 'yoga', 'mat', 'exercise'],
    metadata: { thickness: '6mm' },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '6',
    user_id: 'demo-user-id',
    name: 'Smart Watch Series 5',
    description: 'Feature-packed smartwatch with health tracking and notifications',
    sku: 'SW5-006',
    category: 'Electronics',
    price: 299.99,
    cost: 150.00,
    stock_quantity: 15,
    low_stock_threshold: 8,
    supplier: 'Tech Distributors Inc',
    brand: 'TechPulse',
    status: 'active',
    image_url: 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg',
    tags: ['electronics', 'smartwatch', 'wearable', 'fitness'],
    metadata: { connectivity: ['Bluetooth', 'WiFi'] },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '7',
    user_id: 'demo-user-id',
    name: 'Ceramic Coffee Mug Set',
    description: 'Set of 4 handcrafted ceramic coffee mugs',
    sku: 'CCM-007',
    category: 'Home & Kitchen',
    price: 39.99,
    cost: 18.00,
    stock_quantity: 0,
    low_stock_threshold: 10,
    supplier: 'HomeGoods Wholesale',
    brand: 'Artisan Home',
    status: 'active',
    image_url: 'https://images.pexels.com/photos/1251175/pexels-photo-1251175.jpeg',
    tags: ['kitchen', 'mug', 'ceramic', 'coffee'],
    metadata: { set_size: 4 },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '8',
    user_id: 'demo-user-id',
    name: 'Vintage Denim Jacket',
    description: 'Classic denim jacket with vintage wash',
    sku: 'VDJ-008',
    category: 'Clothing',
    price: 79.99,
    cost: 35.00,
    stock_quantity: 30,
    low_stock_threshold: 12,
    supplier: 'Fashion Wholesale Co',
    brand: 'RetroStyle',
    status: 'inactive',
    image_url: 'https://images.pexels.com/photos/1124468/pexels-photo-1124468.jpeg',
    tags: ['clothing', 'denim', 'jacket', 'vintage'],
    metadata: { sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export async function getAllProducts(): Promise<Product[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...mockProducts]);
    }, 300);
  });
}

export async function getProductById(id: string): Promise<Product | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const product = mockProducts.find(p => p.id === id);
      resolve(product || null);
    }, 300);
  });
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const filtered = mockProducts.filter(p => p.category === category);
      resolve(filtered);
    }, 300);
  });
}

export async function searchProducts(query: string): Promise<Product[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const lowerQuery = query.toLowerCase();
      const filtered = mockProducts.filter(p =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery) ||
        p.sku.toLowerCase().includes(lowerQuery) ||
        p.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
      resolve(filtered);
    }, 300);
  });
}

export async function createProduct(product: ProductInsert): Promise<Product | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newProduct: Product = {
        ...product,
        id: Math.random().toString(36).substr(2, 9),
        description: product.description || '',
        category: product.category || 'Uncategorized',
        cost: product.cost || 0,
        stock_quantity: product.stock_quantity || 0,
        low_stock_threshold: product.low_stock_threshold || 10,
        supplier: product.supplier || '',
        brand: product.brand || '',
        status: product.status || 'active',
        image_url: product.image_url || '',
        tags: product.tags || [],
        metadata: product.metadata || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockProducts.push(newProduct);
      resolve(newProduct);
    }, 300);
  });
}

export async function updateProduct(
  id: string,
  updates: ProductUpdate
): Promise<Product | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockProducts.findIndex(p => p.id === id);
      if (index !== -1) {
        mockProducts[index] = {
          ...mockProducts[index],
          ...updates,
          updated_at: new Date().toISOString(),
        };
        resolve(mockProducts[index]);
      } else {
        resolve(null);
      }
    }, 300);
  });
}

export async function deleteProduct(id: string): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockProducts.findIndex(p => p.id === id);
      if (index !== -1) {
        mockProducts.splice(index, 1);
        resolve(true);
      } else {
        resolve(false);
      }
    }, 300);
  });
}

export async function getLowStockProducts(): Promise<Product[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const lowStock = mockProducts.filter(p => p.stock_quantity <= p.low_stock_threshold);
      resolve(lowStock);
    }, 300);
  });
}

export async function getProductsByStatus(status: 'active' | 'inactive' | 'discontinued'): Promise<Product[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const filtered = mockProducts.filter(p => p.status === status);
      resolve(filtered);
    }, 300);
  });
}
