// ─── Backend-aligned type definitions ───
// These types match the Spring Boot entity JSON responses exactly.

export interface Category {
  id: number;
  name: string;
}

export interface Subcategory {
  id: number;
  scName: string;
  category?: Category | null;
}

export interface Review {
  id: number;
  user?: { id: number; name: string } | null;
  productReview: string;
  ratingStars: number;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;       // base price (backend: Float)
  discount: number;    // discount percentage (backend: Integer)
  availableStock: number;
  images: string[];
  category?: Category | null;
  subcategory?: Subcategory | null;
  reviews?: Review[];
}

// ─── Helper: compute discounted price from price & discount % ───
export function discountedPrice(product: Product): number {
  if (!product.discount || product.discount <= 0) return product.price;
  return Math.round(product.price * (1 - product.discount / 100));
}

// ─── Frontend-only types ───

export interface CartItem {
  product: Product;
  quantity: number;
  customDesign?: string;
}

export type Page =
  | 'home'
  | 'shop'
  | 'product'
  | 'cart'
  | 'auth'
  | 'admin';

// Static category images fallback (backend Category has no image field yet)
export const CATEGORY_IMAGES: Record<number, string> = {
  1: 'https://images.pexels.com/photos/8839882/pexels-photo-8839882.jpeg?auto=compress&cs=tinysrgb&w=400',
  2: 'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=400',
  3: 'https://images.pexels.com/photos/6311392/pexels-photo-6311392.jpeg?auto=compress&cs=tinysrgb&w=400',
  4: 'https://images.pexels.com/photos/7691066/pexels-photo-7691066.jpeg?auto=compress&cs=tinysrgb&w=400',
  5: 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=400',
  6: 'https://images.pexels.com/photos/8839870/pexels-photo-8839870.jpeg?auto=compress&cs=tinysrgb&w=400',
  7: 'https://images.pexels.com/photos/1458867/pexels-photo-1458867.jpeg?auto=compress&cs=tinysrgb&w=400',
};

// Default fallback image when no category image is mapped
export const DEFAULT_CATEGORY_IMAGE = 'https://images.pexels.com/photos/8839882/pexels-photo-8839882.jpeg?auto=compress&cs=tinysrgb&w=400';

// Helper to get category image
export function getCategoryImage(categoryId: number): string {
  return CATEGORY_IMAGES[categoryId] || DEFAULT_CATEGORY_IMAGE;
}
