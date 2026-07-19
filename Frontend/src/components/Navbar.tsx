// ─── Navbar Component ───
// FEATURE: Added functional search overlay with debounced API search.
// BUG FIX: Search icon now triggers a search modal instead of being a dead button.

import { ShoppingCart, Menu, X, Search, User, ChevronRight, Sparkles } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Page, Category, Subcategory, Product, discountedPrice } from '../types';
import { AuthUser } from '../services/authService';

interface NavbarProps {
  cartCount: number;
  currentPage: Page;
  navigate: (page: Page, opts?: { categoryId?: number; subcategoryId?: number; productId?: number }) => void;
  categories: Category[];
  subcategories: Subcategory[];
  isAuthenticated: boolean;
  authUser: AuthUser | null;
  onSearch: (query: string) => Promise<Product[]>;
}

export default function Navbar({ cartCount, navigate, categories, subcategories, isAuthenticated, authUser, onSearch }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoveredCat, setHoveredCat] = useState<string | null>(null);

  // ─── Search state ───
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-focus search input when overlay opens
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    } else {
      setSearchQuery('');
      setSearchResults([]);
    }
  }, [searchOpen]);

  // Debounced search — calls API 300ms after user stops typing
  const handleSearchInput = useCallback((value: string) => {
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!value.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await onSearch(value);
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  }, [onSearch]);

  const handleCat = (catId: number) => {
    navigate('shop', { categoryId: catId });
    setMobileOpen(false);
    setHoveredCat(null);
  };

  const handleSub = (subId: number, catId: number) => {
    navigate('shop', { categoryId: catId, subcategoryId: subId });
    setMobileOpen(false);
    setHoveredCat(null);
  };

  const openSearchResult = (product: Product) => {
    navigate('product', {
      productId: product.id,
      categoryId: product.category?.id,
      subcategoryId: product.subcategory?.id,
    });
    setSearchOpen(false);
  };

  return (
    <>
      {/* Announcement ticker */}
      <div className="bg-forest-950 text-gold-300 py-2 overflow-hidden">
        <div className="flex animate-ticker whitespace-nowrap">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center gap-12 px-6 text-sm tracking-wide">
              <span className="flex items-center gap-2"><Sparkles className="w-3.5 h-3.5" /> Festive Sale — Up to 50% OFF on Silk Sarees</span>
              <span>Free Shipping on orders above ₹2,000</span>
              <span className="flex items-center gap-2"><Sparkles className="w-3.5 h-3.5" /> New Arrivals Dropped — Kanjivaram Collection</span>
              <span>Use code SAVE20 for extra 20% off</span>
            </div>
          ))}
        </div>
      </div>

      <nav className="sticky top-0 z-50 bg-cream-50/95 backdrop-blur-md border-b border-forest-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <button onClick={() => navigate('home')} className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-full bg-forest-800 flex items-center justify-center group-hover:bg-forest-700 transition-colors">
                <Sparkles className="w-5 h-5 text-gold-400" />
              </div>
              <div className="text-left">
                <div className="font-serif text-2xl font-bold text-forest-900 leading-none">Vaaraahi</div>
                <div className="text-[10px] tracking-[0.3em] text-gold-600 uppercase">Silks & Couture</div>
              </div>
            </button>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-8">
              <button onClick={() => navigate('home')} className="text-sm font-medium text-forest-700 hover:text-gold-600 transition-colors">Home</button>

              <div className="relative" onMouseEnter={() => setHoveredCat('shop')} onMouseLeave={() => setHoveredCat(null)}>
                <button className="text-sm font-medium text-forest-700 hover:text-gold-600 transition-colors flex items-center gap-1">
                  Shop <ChevronRight className={`w-3.5 h-3.5 transition-transform ${hoveredCat === 'shop' ? 'rotate-90' : ''}`} />
                </button>
                {hoveredCat === 'shop' && (
                  <div className="absolute left-1/2 -translate-x-1/2 top-full pt-4 w-[680px]">
                    <div className="bg-white rounded-2xl shadow-2xl border border-forest-100 p-6 grid grid-cols-3 gap-6">
                      {categories.slice(0, 6).map((cat) => (
                        <div key={cat.id}>
                          <button onClick={() => handleCat(cat.id)} className="font-serif font-semibold text-forest-900 hover:text-gold-600 text-sm block mb-2">
                            {cat.name}
                          </button>
                          <div className="space-y-1">
                            {subcategories.filter(s => s.category?.id === cat.id).slice(0, 4).map(sub => (
                              <button key={sub.id} onClick={() => handleSub(sub.id, cat.id)} className="block text-xs text-forest-600 hover:text-gold-600 transition-colors">
                                {sub.scName}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button onClick={() => navigate('shop')} className="text-sm font-medium text-forest-700 hover:text-gold-600 transition-colors">Best Sellers</button>
              <button onClick={() => navigate('shop')} className="text-sm font-medium text-forest-700 hover:text-gold-600 transition-colors">New Arrivals</button>
              {authUser?.role === 'ADMIN' && (
                <button onClick={() => navigate('admin')} className="text-sm font-medium text-forest-700 hover:text-gold-600 transition-colors">Admin</button>
              )}
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              {/* BUG FIX: Search button now opens the search overlay */}
              <button
                onClick={() => setSearchOpen(true)}
                className="hidden sm:flex w-9 h-9 items-center justify-center rounded-full hover:bg-cream-200 text-forest-700 transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
              {/* Profile / Auth icon */}
              <button
                onClick={() => navigate(isAuthenticated ? 'profile' : 'auth')}
                className="hidden sm:flex w-9 h-9 items-center justify-center rounded-full hover:bg-cream-200 text-forest-700 transition-colors overflow-hidden"
                title={isAuthenticated ? authUser?.name : 'Sign in'}
              >
                {isAuthenticated && authUser?.picture ? (
                  <img src={authUser.picture} alt={authUser.name} className="w-9 h-9 rounded-full object-cover" />
                ) : (
                  <User className="w-5 h-5" />
                )}
              </button>
              {isAuthenticated && authUser && (
                <span className="hidden sm:inline text-xs text-forest-600 max-w-[80px] truncate">
                  {authUser.name.split(' ')[0]}
                </span>
              )}
              <button onClick={() => navigate('cart')} className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-cream-200 text-forest-700 transition-colors">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gold-500 text-forest-950 text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
              <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden w-9 h-9 flex items-center justify-center rounded-full hover:bg-cream-200 text-forest-700">
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-forest-100 bg-cream-50 px-4 py-4 space-y-3 animate-slide-up">
            {/* Mobile search */}
            <button
              onClick={() => { setSearchOpen(true); setMobileOpen(false); }}
              className="flex items-center gap-2 w-full text-left py-2 text-forest-800 font-medium"
            >
              <Search className="w-4 h-4" /> Search Products
            </button>
            <button onClick={() => { navigate('home'); setMobileOpen(false); }} className="block w-full text-left py-2 text-forest-800 font-medium">Home</button>
            <div className="py-1">
              <p className="text-xs uppercase tracking-wider text-forest-500 mb-2">Categories</p>
              {categories.map(cat => (
                <div key={cat.id} className="pl-2 mb-2">
                  <button onClick={() => handleCat(cat.id)} className="text-sm text-forest-800 font-medium">{cat.name}</button>
                  <div className="pl-3 mt-1 space-y-1">
                    {subcategories.filter(s => s.category?.id === cat.id).map(sub => (
                      <button key={sub.id} onClick={() => handleSub(sub.id, cat.id)} className="block text-xs text-forest-600">— {sub.scName}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {authUser?.role === 'ADMIN' && (
              <button onClick={() => { navigate('admin'); setMobileOpen(false); }} className="block w-full text-left py-2 text-forest-800 font-medium">Admin</button>
            )}
            <button
              onClick={() => { navigate(isAuthenticated ? 'profile' : 'auth'); setMobileOpen(false); }}
              className="flex items-center gap-2 w-full text-left py-2 text-forest-800 font-medium"
            >
              {isAuthenticated && authUser?.picture ? (
                <img src={authUser.picture} alt="" className="w-6 h-6 rounded-full object-cover" />
              ) : (
                <User className="w-4 h-4" />
              )}
              {isAuthenticated ? (authUser?.name.split(' ')[0] || 'Profile') : 'Sign In'}
            </button>
          </div>
        )}
      </nav>

      {/* ─── Search Overlay ─── */}
      {searchOpen && (
        <div className="fixed inset-0 z-[60]">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-forest-950/60 backdrop-blur-sm" onClick={() => setSearchOpen(false)} />

          {/* Search panel */}
          <div className="relative max-w-2xl mx-auto mt-24 mx-4 sm:mx-auto animate-slide-up">
            <div className="bg-white rounded-2xl shadow-2xl border border-forest-100 overflow-hidden">
              {/* Search input */}
              <div className="flex items-center gap-3 p-4 border-b border-forest-100">
                <Search className="w-5 h-5 text-forest-500 shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchInput(e.target.value)}
                  placeholder="Search sarees, dresses, jewellery..."
                  className="flex-1 text-lg text-forest-900 placeholder-forest-400 bg-transparent focus:outline-none"
                />
                <button onClick={() => setSearchOpen(false)} className="text-forest-400 hover:text-forest-800 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search results */}
              <div className="max-h-[60vh] overflow-y-auto">
                {isSearching && (
                  <div className="p-6 text-center">
                    <div className="w-6 h-6 border-2 border-forest-200 border-t-gold-500 rounded-full animate-spin mx-auto" />
                    <p className="text-sm text-forest-500 mt-2">Searching...</p>
                  </div>
                )}

                {!isSearching && searchQuery && searchResults.length === 0 && (
                  <div className="p-6 text-center">
                    <p className="text-forest-500">No products found for "{searchQuery}"</p>
                    <p className="text-xs text-forest-400 mt-1">Try a different search term</p>
                  </div>
                )}

                {!isSearching && searchResults.length > 0 && (
                  <div className="divide-y divide-forest-50">
                    {searchResults.slice(0, 8).map(product => (
                      <button
                        key={product.id}
                        onClick={() => openSearchResult(product)}
                        className="flex items-center gap-4 w-full p-4 hover:bg-cream-50 transition-colors text-left"
                      >
                        <img
                          src={product.images?.[0] || 'https://images.pexels.com/photos/8839882/pexels-photo-8839882.jpeg?auto=compress&cs=tinysrgb&w=100'}
                          alt={product.title}
                          className="w-14 h-14 rounded-lg object-cover shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-forest-900 truncate">{product.title}</p>
                          <p className="text-xs text-forest-500">{product.category?.name} · {product.subcategory?.scName}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-semibold text-forest-900">₹{discountedPrice(product).toLocaleString('en-IN')}</p>
                          {product.discount > 0 && (
                            <p className="text-xs text-gold-600">-{product.discount}%</p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {!searchQuery && (
                  <div className="p-6 text-center">
                    <p className="text-sm text-forest-400">Start typing to search products...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
