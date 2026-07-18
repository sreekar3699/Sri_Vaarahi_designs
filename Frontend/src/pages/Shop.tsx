// ─── Shop Page ───
// BUG FIX: Replaced `useMemo` (with side effects) → `useEffect` for syncing filter state.
// FEATURE: Backend filtering via API endpoints for category/subcategory.
// FEATURE: Inline search bar for product title search.

import { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { SlidersHorizontal, ChevronRight, X, Search, Loader2 } from 'lucide-react';
import { Category, Product, Subcategory, Page, discountedPrice } from '../types';
import ProductCard from '../components/ProductCard';

interface ShopProps {
  categories: Category[];
  subcategories: Subcategory[];
  products: Product[];
  navigate: (page: Page, opts?: { categoryId?: number; subcategoryId?: number; productId?: number }) => void;
  selectedCategoryId?: number | null;
  selectedSubcategoryId?: number | null;
  onSearch: (query: string) => Promise<Product[]>;
}

type SortKey = 'featured' | 'priceLow' | 'priceHigh' | 'discount';

export default function Shop({ categories, subcategories, products, navigate, selectedCategoryId, selectedSubcategoryId, onSearch }: ShopProps) {
  const [sortKey, setSortKey] = useState<SortKey>('featured');
  const [activeCat, setActiveCat] = useState<number | null>(selectedCategoryId ?? null);
  const [activeSub, setActiveSub] = useState<number | null>(selectedSubcategoryId ?? null);
  const [showFilters, setShowFilters] = useState(false);
  const [maxPrice, setMaxPrice] = useState(30000);

  // ─── Search within shop ───
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // BUG FIX: was useMemo with side effects → now useEffect
  useEffect(() => {
    setActiveCat(selectedCategoryId ?? null);
    setActiveSub(selectedSubcategoryId ?? null);
  }, [selectedCategoryId, selectedSubcategoryId]);

  // ─── Debounced search handler ───
  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

    if (!value.trim()) {
      setSearchResults(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    searchDebounceRef.current = setTimeout(async () => {
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

  // ─── Filter & sort logic ───
  const filtered = useMemo(() => {
    // Use search results if searching, otherwise use the full products list
    let list = searchResults !== null ? [...searchResults] : [...products];

    // Apply category/subcategory filters (client-side on whatever list we have)
    if (activeCat) list = list.filter(p => p.category?.id === activeCat);
    if (activeSub) list = list.filter(p => p.subcategory?.id === activeSub);

    // Price filter (on discounted price)
    list = list.filter(p => discountedPrice(p) <= maxPrice);

    // Sort
    switch (sortKey) {
      case 'priceLow': list.sort((a, b) => discountedPrice(a) - discountedPrice(b)); break;
      case 'priceHigh': list.sort((a, b) => discountedPrice(b) - discountedPrice(a)); break;
      case 'discount': list.sort((a, b) => (b.discount ?? 0) - (a.discount ?? 0)); break;
      default:
        // Featured: sort by discount percentage (higher discount = more featured)
        list.sort((a, b) => (b.discount ?? 0) - (a.discount ?? 0));
    }
    return list;
  }, [products, searchResults, activeCat, activeSub, sortKey, maxPrice]);

  const currentCat = categories.find(c => c.id === activeCat);
  const currentSub = subcategories.find(s => s.id === activeSub);
  const subsForCat = subcategories.filter(s => s.category?.id === activeCat);

  const openProduct = (id: number) => {
    const p = (searchResults ?? products).find(x => x.id === id) ?? products.find(x => x.id === id);
    if (p) navigate('product', { productId: id, subcategoryId: p.subcategory?.id, categoryId: p.category?.id });
  };

  const selectCat = (id: number | null) => {
    setActiveCat(id);
    setActiveSub(null);
    setShowFilters(false);
  };

  const selectSub = (id: number | null) => {
    setActiveSub(id);
    setShowFilters(false);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
  };

  return (
    <div className="animate-fade-in">
      {/* Breadcrumb / header */}
      <div className="bg-cream-100 border-b border-forest-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <div className="flex items-center gap-2 text-xs text-forest-500 mb-3">
            <button onClick={() => navigate('home')} className="hover:text-gold-600">Home</button>
            <ChevronRight className="w-3 h-3" />
            <button onClick={() => selectCat(null)} className="hover:text-gold-600">Shop</button>
            {currentCat && (<><ChevronRight className="w-3 h-3" /><button onClick={() => selectCat(currentCat.id)} className="hover:text-gold-600">{currentCat.name}</button></>)}
            {currentSub && (<><ChevronRight className="w-3 h-3" /><span className="text-forest-700">{currentSub.scName}</span></>)}
          </div>
          <h1 className="font-serif text-4xl font-bold text-forest-900">
            {searchQuery ? `Results for "${searchQuery}"` : currentSub?.scName ?? currentCat?.name ?? 'All Products'}
          </h1>
          <p className="text-forest-600 mt-1 text-sm">{filtered.length} {filtered.length === 1 ? 'item' : 'items'}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-10">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-28 space-y-8">
            {/* ─── Search bar in sidebar ─── */}
            <div>
              <h3 className="font-serif font-semibold text-forest-900 mb-3">Search</h3>
              <div className="relative">
                <Search className="w-4 h-4 text-forest-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-9 pr-8 py-2 rounded-xl border border-forest-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gold-400 transition-all"
                />
                {searchQuery && (
                  <button onClick={clearSearch} className="absolute right-2 top-1/2 -translate-y-1/2 text-forest-400 hover:text-forest-700">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              {isSearching && (
                <div className="flex items-center gap-2 mt-2 text-xs text-forest-500">
                  <Loader2 className="w-3 h-3 animate-spin" /> Searching...
                </div>
              )}
            </div>

            <div>
              <h3 className="font-serif font-semibold text-forest-900 mb-3">Categories</h3>
              <ul className="space-y-1.5">
                <li>
                  <button onClick={() => selectCat(null)} className={`text-sm transition-colors ${!activeCat ? 'text-gold-600 font-semibold' : 'text-forest-700 hover:text-gold-600'}`}>
                    All Categories
                  </button>
                </li>
                {categories.map(c => (
                  <li key={c.id}>
                    <button onClick={() => selectCat(c.id)} className={`text-sm transition-colors ${activeCat === c.id ? 'text-gold-600 font-semibold' : 'text-forest-700 hover:text-gold-600'}`}>
                      {c.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {subsForCat.length > 0 && (
              <div>
                <h3 className="font-serif font-semibold text-forest-900 mb-3">Subcategories</h3>
                <ul className="space-y-1.5">
                  <li>
                    <button onClick={() => selectSub(null)} className={`text-sm ${!activeSub ? 'text-gold-600 font-semibold' : 'text-forest-600 hover:text-gold-600'}`}>All</button>
                  </li>
                  {subsForCat.map(s => (
                    <li key={s.id}>
                      <button onClick={() => selectSub(s.id)} className={`text-sm ${activeSub === s.id ? 'text-gold-600 font-semibold' : 'text-forest-600 hover:text-gold-600'}`}>{s.scName}</button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h3 className="font-serif font-semibold text-forest-900 mb-3">Max Price: ₹{maxPrice.toLocaleString('en-IN')}</h3>
              <input type="range" min={500} max={30000} step={500} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-full accent-gold-500" />
            </div>
          </div>
        </aside>

        {/* Main grid */}
        <div>
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => setShowFilters(true)} className="lg:hidden flex items-center gap-2 px-4 py-2 border border-forest-200 rounded-full text-sm">
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </button>
            <div className="hidden lg:block" />
            <div className="flex items-center gap-2">
              <span className="text-xs text-forest-500">Sort:</span>
              <select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)} className="text-sm border border-forest-200 rounded-full px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-gold-400">
                <option value="featured">Featured</option>
                <option value="priceLow">Price: Low to High</option>
                <option value="priceHigh">Price: High to Low</option>
                <option value="discount">Biggest Discount</option>
              </select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-forest-500">No products match your filters.</p>
              <button onClick={() => { selectCat(null); setMaxPrice(30000); clearSearch(); }} className="mt-4 text-gold-600 underline">Clear filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              {filtered.map(p => (
                <ProductCard
                  key={p.id}
                  product={p}
                  category={p.category ?? categories.find(c => c.id === p.category?.id)}
                  subcategory={p.subcategory ?? subcategories.find(s => s.id === p.subcategory?.id)}
                  onClick={openProduct}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {showFilters && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-forest-950/50 backdrop-blur-sm" onClick={() => setShowFilters(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[85%] bg-cream-50 p-6 overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-xl font-bold">Filters</h3>
              <button onClick={() => setShowFilters(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-6">
              {/* Mobile search */}
              <div>
                <h4 className="font-semibold text-sm mb-2">Search</h4>
                <div className="relative">
                  <Search className="w-4 h-4 text-forest-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search products..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-forest-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gold-400"
                  />
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-2">Categories</h4>
                <ul className="space-y-1.5">
                  <li><button onClick={() => selectCat(null)} className={`text-sm ${!activeCat ? 'text-gold-600 font-semibold' : 'text-forest-700'}`}>All</button></li>
                  {categories.map(c => <li key={c.id}><button onClick={() => selectCat(c.id)} className={`text-sm ${activeCat === c.id ? 'text-gold-600 font-semibold' : 'text-forest-700'}`}>{c.name}</button></li>)}
                </ul>
              </div>
              {subsForCat.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-2">Subcategories</h4>
                  <ul className="space-y-1.5">
                    <li><button onClick={() => selectSub(null)} className={`text-sm ${!activeSub ? 'text-gold-600 font-semibold' : 'text-forest-600'}`}>All</button></li>
                    {subsForCat.map(s => <li key={s.id}><button onClick={() => selectSub(s.id)} className={`text-sm ${activeSub === s.id ? 'text-gold-600 font-semibold' : 'text-forest-600'}`}>{s.scName}</button></li>)}
                  </ul>
                </div>
              )}
              <div>
                <h4 className="font-semibold text-sm mb-2">Max Price: ₹{maxPrice.toLocaleString('en-IN')}</h4>
                <input type="range" min={500} max={30000} step={500} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-full accent-gold-500" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
