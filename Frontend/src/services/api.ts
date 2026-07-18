// ─── Centralized API Service ───
// All backend communication goes through this module.
// Falls back gracefully when the backend is unreachable.

import type { Product, Category, Subcategory } from '../types';

// Vite proxy forwards /api/* → http://localhost:8000/api/*
const API_BASE = '/api';

// ─── Generic fetch helper with error handling ───
async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const errorText = await res.text().catch(() => 'Unknown error');
    throw new Error(`API ${res.status}: ${errorText}`);
  }
  // Handle 204 No Content (e.g. delete responses)
  if (res.status === 204) return undefined as T;
  return res.json();
}

// ═══════════════════════════════════════
// Products
// ═══════════════════════════════════════

/** Fetch all products */
export async function fetchProducts(): Promise<Product[]> {
  return fetchJSON<Product[]>(`${API_BASE}/products`);
}

/** Fetch a single product by ID */
export async function fetchProductById(id: number): Promise<Product> {
  return fetchJSON<Product>(`${API_BASE}/products/${id}`);
}

/** Search products by title (partial, case-insensitive) */
export async function searchProducts(title: string): Promise<Product[]> {
  return fetchJSON<Product[]>(`${API_BASE}/products/search?title=${encodeURIComponent(title)}`);
}

/** Fetch products by category ID */
export async function fetchProductsByCategory(categoryId: number): Promise<Product[]> {
  return fetchJSON<Product[]>(`${API_BASE}/products/category/${categoryId}`);
}

/** Fetch products by subcategory ID */
export async function fetchProductsBySubcategory(subcategoryId: number): Promise<Product[]> {
  return fetchJSON<Product[]>(`${API_BASE}/products/subcategory/${subcategoryId}`);
}

/** Create a new product */
export async function createProduct(product: Omit<Product, 'id'>): Promise<Product> {
  return fetchJSON<Product>(`${API_BASE}/products`, {
    method: 'POST',
    body: JSON.stringify(product),
  });
}

/** Update a product */
export async function updateProduct(id: number, product: Partial<Omit<Product, 'id'>>): Promise<Product> {
  return fetchJSON<Product>(`${API_BASE}/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(product),
  });
}

/** Delete a product */
export async function deleteProduct(id: number): Promise<void> {
  return fetchJSON<void>(`${API_BASE}/products/${id}`, { method: 'DELETE' });
}

// ═══════════════════════════════════════
// Categories
// ═══════════════════════════════════════

/** Fetch all categories */
export async function fetchCategories(): Promise<Category[]> {
  return fetchJSON<Category[]>(`${API_BASE}/categories`);
}

/** Create a new category */
export async function createCategory(data: { name: string }): Promise<Category> {
  return fetchJSON<Category>(`${API_BASE}/categories`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/** Update a category */
export async function updateCategory(id: number, data: { name: string }): Promise<Category> {
  return fetchJSON<Category>(`${API_BASE}/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/** Delete a category */
export async function deleteCategory(id: number): Promise<void> {
  return fetchJSON<void>(`${API_BASE}/categories/${id}`, { method: 'DELETE' });
}

// ═══════════════════════════════════════
// Subcategories
// ═══════════════════════════════════════

/** Fetch all subcategories */
export async function fetchSubcategories(): Promise<Subcategory[]> {
  return fetchJSON<Subcategory[]>(`${API_BASE}/subcategories`);
}

/** Fetch subcategories by category ID */
export async function fetchSubcategoriesByCategory(categoryId: number): Promise<Subcategory[]> {
  return fetchJSON<Subcategory[]>(`${API_BASE}/subcategories/category/${categoryId}`);
}

/** Create a new subcategory */
export async function createSubcategory(data: { scName: string; category: { id: number } }): Promise<Subcategory> {
  return fetchJSON<Subcategory>(`${API_BASE}/subcategories`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/** Update a subcategory */
export async function updateSubcategory(id: number, data: { scName: string; category: { id: number } }): Promise<Subcategory> {
  return fetchJSON<Subcategory>(`${API_BASE}/subcategories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/** Delete a subcategory */
export async function deleteSubcategory(id: number): Promise<void> {
  return fetchJSON<void>(`${API_BASE}/subcategories/${id}`, { method: 'DELETE' });
}

// ═══════════════════════════════════════
// Users
// ═══════════════════════════════════════

interface User {
  id?: number;
  name: string;
  email: string;
  phnum?: number;
}

/** Create a new user (sign-up) */
export async function createUser(data: { name: string; email: string; phnum?: number }): Promise<User> {
  return fetchJSON<User>(`${API_BASE}/users`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/** Find user by email (sign-in check) */
export async function getUserByEmail(email: string): Promise<User> {
  return fetchJSON<User>(`${API_BASE}/users/email/${encodeURIComponent(email)}`);
}

// ═══════════════════════════════════════
// Orders
// ═══════════════════════════════════════

interface OrderPayload {
  user: { id: number };
  product: { id: number };
  address: { id: number };
  paymentMethod: string;
}

/** Create a new order */
export async function createOrder(data: OrderPayload): Promise<unknown> {
  return fetchJSON(`${API_BASE}/orders`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/** Fetch all orders */
export async function fetchOrders(): Promise<any[]> {
  return fetchJSON<any[]>(`${API_BASE}/orders`);
}

// ═══════════════════════════════════════
// Addresses
// ═══════════════════════════════════════

interface AddressPayload {
  user: { id: number };
  addressLine: string;
  city: string;
  pincode: string;
  contactNumber: number;
}

export async function createAddress(data: AddressPayload): Promise<{ id: number }> {
  return fetchJSON<{ id: number }>(`${API_BASE}/addresses`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ═══════════════════════════════════════
// Reviews
// ═══════════════════════════════════════

interface ReviewPayload {
  user: { id: number };
  product: { id: number };
  productReview: string;
  ratingStars: number;
}

/** Create a new review */
export async function createReview(data: ReviewPayload): Promise<unknown> {
  return fetchJSON(`${API_BASE}/reviews`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ═══════════════════════════════════════
// Razorpay
// ═══════════════════════════════════════

export interface RazorpayOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

export interface RazorpayCreateRequest {
  userId: number;
  addressId: number;
  productIds: number[];
  quantities: number[];
}

/** Create a Razorpay order on the backend */
export async function createRazorpayOrder(data: RazorpayCreateRequest): Promise<RazorpayOrderResponse> {
  return fetchJSON<RazorpayOrderResponse>(`${API_BASE}/razorpay/create-order`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export interface RazorpayVerifyRequest {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  userId: number;
  addressId: number;
  productIds: number[];
  quantities: number[];
}

/** Verify Razorpay payment signature + persist orders */
export async function verifyRazorpayPayment(data: RazorpayVerifyRequest): Promise<{ status: string; message: string }> {
  return fetchJSON<{ status: string; message: string }>(`${API_BASE}/razorpay/verify`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export interface CodOrderRequest {
  userId: number;
  addressId: number;
  productIds: number[];
  quantities: number[];
}

/** Place a Cash-on-Delivery order */
export async function placeCodOrder(data: CodOrderRequest): Promise<{ status: string; message: string }> {
  return fetchJSON<{ status: string; message: string }>(`${API_BASE}/razorpay/cod`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
