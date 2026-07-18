// ─── Admin Page ───
// BACKEND: Form submissions now POST to the backend API.
// SCHEMA: Updated all field references to match backend entity names.

import { useState } from 'react';
import { LayoutDashboard, FolderPlus, Layers, Package, Plus, Check, X, Image as ImageIcon, RefreshCw } from 'lucide-react';
import { Category, Subcategory, Product, discountedPrice } from '../types';

interface AdminProps {
  categories: Category[];
  subcategories: Subcategory[];
  products: Product[];
  addCategory: (data: { name: string }) => Promise<boolean>;
  addSubcategory: (data: { scName: string; categoryId: number }) => Promise<boolean>;
  addProduct: (p: Omit<Product, 'id'>) => Promise<boolean>;
  refreshData: () => Promise<void>;
}

type Tab = 'overview' | 'category' | 'subcategory' | 'product';

export default function Admin({ categories, subcategories, products, addCategory, addSubcategory, addProduct, refreshData }: AdminProps) {
  const [tab, setTab] = useState<Tab>('overview');
  const [toast, setToast] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Category form
  const [catForm, setCatForm] = useState({ name: '' });
  // Subcategory form
  const [subForm, setSubForm] = useState({ name: '', categoryId: '' });
  // Product form
  const [prodForm, setProdForm] = useState({
    name: '', description: '', subcategoryId: '', price: '', discount: '', stock: '', images: ''
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const submitCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catForm.name.trim() || isSubmitting) return;
    setIsSubmitting(true);
    const success = await addCategory({ name: catForm.name.trim() });
    setCatForm({ name: '' });
    showToast(success ? 'Category added to backend!' : 'Category added locally (backend offline)');
    setIsSubmitting(false);
  };

  const submitSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subForm.name.trim() || !subForm.categoryId || isSubmitting) return;
    setIsSubmitting(true);
    const success = await addSubcategory({
      scName: subForm.name.trim(),
      categoryId: Number(subForm.categoryId),
    });
    setSubForm({ name: '', categoryId: '' });
    showToast(success ? 'Subcategory added to backend!' : 'Subcategory added locally (backend offline)');
    setIsSubmitting(false);
  };

  const submitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodForm.name.trim() || !prodForm.subcategoryId || isSubmitting) return;
    const sub = subcategories.find(s => s.id === Number(prodForm.subcategoryId));
    if (!sub) return;
    setIsSubmitting(true);

    const images = prodForm.images.split(',').map(s => s.trim()).filter(Boolean);
    const success = await addProduct({
      title: prodForm.name.trim(),
      description: prodForm.description.trim(),
      subcategory: sub,
      category: sub.category ?? { id: 0, name: '' },
      price: Number(prodForm.price) || 0,
      discount: Number(prodForm.discount) || 0,
      availableStock: Number(prodForm.stock) || 0,
      images: images.length ? images : ['https://images.pexels.com/photos/8839882/pexels-photo-8839882.jpeg?auto=compress&cs=tinysrgb&w=800'],
    });
    setProdForm({ name: '', description: '', subcategoryId: '', price: '', discount: '', stock: '', images: '' });
    showToast(success ? 'Product added to catalog!' : 'Product added locally (backend offline)');
    setIsSubmitting(false);
  };

  const handleRefresh = async () => {
    showToast('Refreshing data from backend...');
    await refreshData();
    showToast('Data refreshed!');
  };

  const inputCls = "w-full px-4 py-2.5 rounded-xl border border-forest-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 transition-all";
  const labelCls = "block text-xs font-medium text-forest-700 mb-1.5";

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'category', label: 'Categories', icon: FolderPlus },
    { id: 'subcategory', label: 'Subcategories', icon: Layers },
    { id: 'product', label: 'Products', icon: Package },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-4xl font-bold text-forest-900">Admin Dashboard</h1>
          <p className="text-forest-600 text-sm mt-1">Manage your store catalog — changes sync with the backend API.</p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 border border-forest-200 rounded-xl text-sm text-forest-700 hover:bg-cream-100 transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
        {/* Sidebar tabs */}
        <aside>
          <nav className="bg-white rounded-2xl border border-forest-100 p-3 space-y-1 sticky top-28">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${tab === t.id ? 'bg-forest-800 text-cream-50' : 'text-forest-700 hover:bg-cream-100'}`}
              >
                <t.icon className="w-4 h-4" /> {t.label}
              </button>
            ))}
          </nav>
        </aside>

        <div className="min-w-0">
          {/* Overview */}
          {tab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Categories', value: categories.length, icon: FolderPlus },
                  { label: 'Subcategories', value: subcategories.length, icon: Layers },
                  { label: 'Products', value: products.length, icon: Package },
                ].map(s => (
                  <div key={s.label} className="bg-white rounded-2xl border border-forest-100 p-6">
                    <div className="flex items-center justify-between mb-3">
                      <s.icon className="w-6 h-6 text-gold-600" />
                      <span className="text-3xl font-bold text-forest-900 font-serif">{s.value}</span>
                    </div>
                    <p className="text-sm text-forest-600">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-2xl border border-forest-100 p-6">
                <h3 className="font-serif font-semibold text-forest-900 mb-4">Recent Products</h3>
                <div className="space-y-3">
                  {products.slice(-5).reverse().map(p => (
                    <div key={p.id} className="flex items-center gap-3 py-2">
                      <img src={p.images?.[0] || ''} alt={p.title} className="w-12 h-12 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-forest-900 truncate">{p.title}</p>
                        <p className="text-xs text-forest-500">₹{discountedPrice(p).toLocaleString('en-IN')} · Stock: {p.availableStock}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Add Category */}
          {tab === 'category' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <form onSubmit={submitCategory} className="bg-white rounded-2xl border border-forest-100 p-6">
                <h3 className="font-serif font-semibold text-forest-900 mb-4 flex items-center gap-2"><Plus className="w-5 h-5 text-gold-600" /> Add New Category</h3>
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>Category Name</label>
                    <input value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} placeholder="e.g. Kurtis" className={inputCls} required />
                  </div>
                  <button type="submit" disabled={isSubmitting} className="w-full py-2.5 bg-forest-800 hover:bg-forest-700 disabled:opacity-50 text-cream-50 font-medium rounded-xl transition-colors">
                    {isSubmitting ? 'Adding...' : 'Add Category'}
                  </button>
                </div>
              </form>

              <div className="bg-white rounded-2xl border border-forest-100 p-6">
                <h3 className="font-serif font-semibold text-forest-900 mb-4">Existing Categories</h3>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {categories.map(c => (
                    <div key={c.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-cream-100">
                      <div className="w-10 h-10 rounded-lg bg-cream-200 flex items-center justify-center text-forest-600">
                        <FolderPlus className="w-5 h-5" />
                      </div>
                      <span className="text-sm text-forest-800">{c.name}</span>
                      <span className="ml-auto text-xs text-forest-400">{subcategories.filter(s => s.category?.id === c.id).length} sub</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Add Subcategory */}
          {tab === 'subcategory' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <form onSubmit={submitSubcategory} className="bg-white rounded-2xl border border-forest-100 p-6">
                <h3 className="font-serif font-semibold text-forest-900 mb-4 flex items-center gap-2"><Plus className="w-5 h-5 text-gold-600" /> Add New Subcategory</h3>
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>Parent Category</label>
                    <select value={subForm.categoryId} onChange={(e) => setSubForm({ ...subForm, categoryId: e.target.value })} className={inputCls} required>
                      <option value="">Select a category…</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Subcategory Name</label>
                    <input value={subForm.name} onChange={(e) => setSubForm({ ...subForm, name: e.target.value })} placeholder="e.g. Chiffon Sarees" className={inputCls} required />
                  </div>
                  <button type="submit" disabled={isSubmitting} className="w-full py-2.5 bg-forest-800 hover:bg-forest-700 disabled:opacity-50 text-cream-50 font-medium rounded-xl transition-colors">
                    {isSubmitting ? 'Adding...' : 'Add Subcategory'}
                  </button>
                </div>
              </form>

              <div className="bg-white rounded-2xl border border-forest-100 p-6">
                <h3 className="font-serif font-semibold text-forest-900 mb-4">Existing Subcategories</h3>
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {categories.map(c => (
                    <div key={c.id}>
                      <p className="text-xs font-semibold text-gold-600 uppercase tracking-wider mb-1">{c.name}</p>
                      <div className="space-y-1 pl-3">
                        {subcategories.filter(s => s.category?.id === c.id).map(s => (
                          <div key={s.id} className="text-sm text-forest-700 py-1 flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-forest-400" /> {s.scName}
                          </div>
                        ))}
                        {subcategories.filter(s => s.category?.id === c.id).length === 0 && (
                          <p className="text-xs text-forest-400 pl-3">No subcategories yet</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Add Product */}
          {tab === 'product' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <form onSubmit={submitProduct} className="bg-white rounded-2xl border border-forest-100 p-6">
                <h3 className="font-serif font-semibold text-forest-900 mb-4 flex items-center gap-2"><Plus className="w-5 h-5 text-gold-600" /> Add New Product</h3>
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>Product Name (Title)</label>
                    <input value={prodForm.name} onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })} placeholder="e.g. Tussar Silk Saree" className={inputCls} required />
                  </div>
                  <div>
                    <label className={labelCls}>Description</label>
                    <textarea value={prodForm.description} onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })} placeholder="Product details…" rows={3} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Subcategory</label>
                    <select value={prodForm.subcategoryId} onChange={(e) => setProdForm({ ...prodForm, subcategoryId: e.target.value })} className={inputCls} required>
                      <option value="">Select a subcategory…</option>
                      {categories.map(c => (
                        <optgroup key={c.id} label={c.name}>
                          {subcategories.filter(s => s.category?.id === c.id).map(s => (
                            <option key={s.id} value={s.id}>{s.scName}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Price (₹)</label>
                      <input type="number" value={prodForm.price} onChange={(e) => setProdForm({ ...prodForm, price: e.target.value })} placeholder="5000" className={inputCls} required />
                    </div>
                    <div>
                      <label className={labelCls}>Discount (%)</label>
                      <input type="number" value={prodForm.discount} onChange={(e) => setProdForm({ ...prodForm, discount: e.target.value })} placeholder="20" className={inputCls} />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Stock Count</label>
                    <input type="number" value={prodForm.stock} onChange={(e) => setProdForm({ ...prodForm, stock: e.target.value })} placeholder="20" className={inputCls} required />
                  </div>
                  <div>
                    <label className={labelCls}>Image URLs <span className="text-forest-400 font-normal">(comma separated)</span></label>
                    <input value={prodForm.images} onChange={(e) => setProdForm({ ...prodForm, images: e.target.value })} placeholder="https://..., https://..." className={inputCls} />
                  </div>
                  <button type="submit" disabled={isSubmitting} className="w-full py-2.5 bg-forest-800 hover:bg-forest-700 disabled:opacity-50 text-cream-50 font-medium rounded-xl transition-colors">
                    {isSubmitting ? 'Adding...' : 'Add Product'}
                  </button>
                </div>
              </form>

              <div className="bg-white rounded-2xl border border-forest-100 p-6">
                <h3 className="font-serif font-semibold text-forest-900 mb-4">Catalog Preview</h3>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {products.slice().reverse().map(p => (
                    <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-cream-100">
                      <img src={p.images?.[0] || ''} alt={p.title} className="w-12 h-12 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-forest-900 truncate">{p.title}</p>
                        <p className="text-xs text-forest-500">₹{discountedPrice(p).toLocaleString('en-IN')} · Stock: {p.availableStock}</p>
                      </div>
                      {p.images?.[0] && <ImageIcon className="w-4 h-4 text-forest-300" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-forest-800 text-cream-50 px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-slide-up">
          <Check className="w-4 h-4 text-gold-400" /> {toast}
          <button onClick={() => setToast(null)} className="ml-2 text-cream-100/60 hover:text-cream-50"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}
    </div>
  );
}
