import { useState, useCallback, useEffect } from 'react';
import { Page, Category, Subcategory, Product, CartItem } from './types';
import { fallbackCategories, fallbackSubcategories, fallbackProducts } from './data/mockData';
import { getCurrentUser, AuthUser } from './services/authService';
import {
  fetchCategories,
  fetchSubcategories,
  fetchProducts,
  searchProducts as apiSearchProducts,
  createCategory as apiCreateCategory,
  updateCategory as apiUpdateCategory,
  deleteCategory as apiDeleteCategory,
  createSubcategory as apiCreateSubcategory,
  updateSubcategory as apiUpdateSubcategory,
  deleteSubcategory as apiDeleteSubcategory,
  createProduct as apiCreateProduct,
  updateProduct as apiUpdateProduct,
  deleteProduct as apiDeleteProduct,
} from './services/api';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Auth from './pages/Auth';
import Admin from './pages/Admin';
import Profile from './pages/Profile';
import PhoneRegistration from './pages/PhoneRegistration';

export default function App() {
  // ─── Navigation state ───
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<number | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);

  // ─── Data state (fetched from API or fallback) ───
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem('cart_data');
      if (stored) {
        const { items, expiry } = JSON.parse(stored);
        if (Date.now() < expiry) return items;
        localStorage.removeItem('cart_data');
      }
    } catch { /* ignore parsing errors */ }
    return [];
  });

  useEffect(() => {
    const expiry = Date.now() + 4 * 7 * 24 * 60 * 60 * 1000; // 4 weeks
    localStorage.setItem('cart_data', JSON.stringify({ items: cart, expiry }));
  }, [cart]);
  // ─── Loading & error states ───
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ─── Restore session & fetch initial data on mount ───
  useEffect(() => {
    async function init() {
      setIsLoading(true);
      setError(null);

      // 1. Always try to restore the backend session (persists across page refreshes)
      const sessionUser = await getCurrentUser();
      if (sessionUser) {
        setAuthUser(sessionUser);
        setIsAuthenticated(true);
      }

      // 2. Check if this is a fresh OAuth2 redirect from Google
      const params = new URLSearchParams(window.location.search);
      if (params.get('oauth2') === 'success') {
        // Fetch user in case session check above didn't catch it yet
        const oauthUser = sessionUser || await getCurrentUser();
        if (oauthUser) {
          setAuthUser(oauthUser);
          setIsAuthenticated(true);
          // If no phone number, prompt for registration
          if (!oauthUser.phone) {
            setCurrentPage('phone-registration');
          }
        }
        window.history.replaceState({}, document.title, '/');
      }

      // 3. Fetch product/category data
      try {
        const [cats, subs, prods] = await Promise.all([
          fetchCategories(),
          fetchSubcategories(),
          fetchProducts(),
        ]);
        setCategories(cats);
        setSubcategories(subs);
        setProducts(prods);
      } catch (err) {
        console.warn('Backend unreachable, using fallback data:', err);
        setCategories(fallbackCategories);
        setSubcategories(fallbackSubcategories);
        setProducts(fallbackProducts);
        setError('Using offline data — backend is not available');
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, []);

  // ─── Navigation (with admin route guard) ───
  const navigate = useCallback((page: Page, opts?: { categoryId?: number; subcategoryId?: number; productId?: number }) => {
    // Block direct navigation to admin for non-admin users
    if (page === 'admin' && authUser?.role !== 'ADMIN') {
      setCurrentPage('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setCurrentPage(page);
    if (opts) {
      if (opts.categoryId !== undefined) setSelectedCategoryId(opts.categoryId);
      if (opts.subcategoryId !== undefined) setSelectedSubcategoryId(opts.subcategoryId);
      if (opts.productId !== undefined) setSelectedProductId(opts.productId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [authUser]);

  // ─── Cart operations ───
  const addToCart = useCallback((item: CartItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === item.product.id);
      if (existing) {
        return prev.map(i =>
          i.product.id === item.product.id
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prev, item];
    });
  }, []);

  const updateQty = useCallback((productId: number, qty: number) => {
    if (qty < 1) return;
    setCart(prev => prev.map(i => (i.product.id === productId ? { ...i, quantity: qty } : i)));
  }, []);

  const removeItem = useCallback((productId: number) => {
    setCart(prev => prev.filter(i => i.product.id !== productId));
  }, []);

  // ─── Admin: create category (API + local state) ───
  const addCategory = useCallback(async (data: { name: string }) => {
    try {
      const created = await apiCreateCategory(data);
      setCategories(prev => [...prev, created]);
      return true;
    } catch {
      // Fallback: add locally with a temporary ID
      const tempCat: Category = { id: Date.now(), name: data.name };
      setCategories(prev => [...prev, tempCat]);
      return false;
    }
  }, []);

  // ─── Admin: create subcategory (API + local state) ───
  const addSubcategory = useCallback(async (data: { scName: string; categoryId: number }) => {
    try {
      const created = await apiCreateSubcategory({
        scName: data.scName,
        category: { id: data.categoryId },
      });
      setSubcategories(prev => [...prev, created]);
      return true;
    } catch {
      const parentCat = categories.find(c => c.id === data.categoryId);
      const tempSub: Subcategory = {
        id: Date.now(),
        scName: data.scName,
        category: parentCat || { id: data.categoryId, name: 'Unknown' },
      };
      setSubcategories(prev => [...prev, tempSub]);
      return false;
    }
  }, [categories]);

  // ─── Admin: create product (API + local state) ───
  const addProduct = useCallback(async (data: Omit<Product, 'id'>) => {
    try {
      const created = await apiCreateProduct(data);
      setProducts(prev => [...prev, created]);
      return true;
    } catch {
      const tempProd: Product = { id: Date.now(), ...data };
      setProducts(prev => [...prev, tempProd]);
      return false;
    }
  }, []);

  // ─── Admin: update product ───
  const editProduct = useCallback(async (id: number, data: Omit<Product, 'id'>) => {
    try {
      const updated = await apiUpdateProduct(id, data);
      setProducts(prev => prev.map(p => p.id === id ? updated : p));
      return true;
    } catch {
      setProducts(prev => prev.map(p => p.id === id ? { id, ...data } : p));
      return false;
    }
  }, []);

  // ─── Admin: delete product ───
  const removeProduct = useCallback(async (id: number) => {
    try {
      await apiDeleteProduct(id);
    } catch { /* ignore */ }
    setProducts(prev => prev.filter(p => p.id !== id));
  }, []);

  // ─── Admin: update category ───
  const editCategory = useCallback(async (id: number, data: { name: string }) => {
    try {
      const updated = await apiUpdateCategory(id, data);
      setCategories(prev => prev.map(c => c.id === id ? updated : c));
      return true;
    } catch {
      setCategories(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
      return false;
    }
  }, []);

  // ─── Admin: delete category ───
  const removeCategory = useCallback(async (id: number) => {
    try {
      await apiDeleteCategory(id);
    } catch { /* ignore */ }
    setCategories(prev => prev.filter(c => c.id !== id));
    setSubcategories(prev => prev.filter(s => s.category?.id !== id));
  }, []);

  // ─── Admin: update subcategory ───
  const editSubcategory = useCallback(async (id: number, data: { scName: string; categoryId: number }) => {
    try {
      const updated = await apiUpdateSubcategory(id, { scName: data.scName, category: { id: data.categoryId } });
      setSubcategories(prev => prev.map(s => s.id === id ? updated : s));
      return true;
    } catch {
      const parentCat = categories.find(c => c.id === data.categoryId);
      setSubcategories(prev => prev.map(s => s.id === id ? { ...s, scName: data.scName, category: parentCat || s.category } : s));
      return false;
    }
  }, [categories]);

  // ─── Admin: delete subcategory ───
  const removeSubcategory = useCallback(async (id: number) => {
    try {
      await apiDeleteSubcategory(id);
    } catch { /* ignore */ }
    setSubcategories(prev => prev.filter(s => s.id !== id));
  }, []);

  // ─── Search handler (calls backend API) ───
  const handleSearch = useCallback(async (query: string): Promise<Product[]> => {
    if (!query.trim()) return [];
    try {
      return await apiSearchProducts(query);
    } catch {
      // Fallback: client-side search on loaded products
      const q = query.toLowerCase();
      return products.filter(p => p.title.toLowerCase().includes(q));
    }
  }, [products]);

  // ─── Refresh data (used after admin operations) ───
  const refreshData = useCallback(async () => {
    try {
      const [cats, subs, prods] = await Promise.all([
        fetchCategories(),
        fetchSubcategories(),
        fetchProducts(),
      ]);
      setCategories(cats);
      setSubcategories(subs);
      setProducts(prods);
    } catch {
      // Silently fail — existing data stays
    }
  }, []);

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const selectedProduct = products.find(p => p.id === selectedProductId);

  // ─── Global loading screen ───
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-forest-200 border-t-gold-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-forest-600 font-medium">Loading Vaaraahi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-cream-50">
      {/* ─── Offline warning banner ─── */}
      {error && (
        <div className="bg-gold-500/20 border-b border-gold-500/30 px-4 py-2 text-center">
          <p className="text-xs text-forest-800">{error}</p>
        </div>
      )}

      <Navbar
        cartCount={cartCount}
        currentPage={currentPage}
        navigate={navigate}
        categories={categories}
        subcategories={subcategories}
        isAuthenticated={isAuthenticated}
        authUser={authUser}
        onSearch={handleSearch}
      />

      <main className="flex-1">
        {currentPage === 'home' && (
          <Home categories={categories} subcategories={subcategories} products={products} navigate={navigate} />
        )}

        {currentPage === 'shop' && (
          <Shop
            categories={categories}
            subcategories={subcategories}
            products={products}
            navigate={navigate}
            selectedCategoryId={selectedCategoryId}
            selectedSubcategoryId={selectedSubcategoryId}
            onSearch={handleSearch}
          />
        )}

        {currentPage === 'product' && selectedProduct && (
          <ProductDetail
            key={selectedProduct.id}
            product={selectedProduct}
            categories={categories}
            subcategories={subcategories}
            products={products}
            navigate={navigate}
            addToCart={addToCart}
          />
        )}

        {currentPage === 'cart' && (
          <Cart
            cart={cart}
            navigate={navigate}
            updateQty={updateQty}
            removeItem={removeItem}
            isAuthenticated={isAuthenticated}
          />
        )}

        {currentPage === 'auth' && (
          <Auth navigate={navigate} onSignIn={() => setIsAuthenticated(true)} />
        )}

        {currentPage === 'profile' && authUser && (
          <Profile
            navigate={navigate}
            authUser={authUser}
            onLogout={() => { setIsAuthenticated(false); setAuthUser(null); }}
          />
        )}

        {currentPage === 'phone-registration' && authUser && (
          <PhoneRegistration
            navigate={navigate}
            userName={authUser.name}
            onPhoneSaved={(phone) => setAuthUser(prev => prev ? { ...prev, phone } : prev)}
          />
        )}

        {/* Admin page — only renders for ADMIN role */}
        {currentPage === 'admin' && authUser?.role === 'ADMIN' && (
          <Admin
            categories={categories}
            subcategories={subcategories}
            products={products}
            addCategory={addCategory}
            editCategory={editCategory}
            removeCategory={removeCategory}
            addSubcategory={addSubcategory}
            editSubcategory={editSubcategory}
            removeSubcategory={removeSubcategory}
            addProduct={addProduct}
            editProduct={editProduct}
            removeProduct={removeProduct}
            refreshData={refreshData}
          />
        )}
      </main>

      <Footer navigate={navigate} />
    </div>
  );
}
