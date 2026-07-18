// ─── Admin Page ───
// Full CRUD: add, edit, delete for categories, subcategories, products.

import { useState, useEffect } from 'react';
import {
  LayoutDashboard, FolderPlus, Layers, Package, Plus, Check, X,
  Image as ImageIcon, RefreshCw, ClipboardList, Pencil, Trash2, Save
} from 'lucide-react';
import { Category, Subcategory, Product, discountedPrice } from '../types';
import { fetchOrders } from '../services/api';

interface AdminProps {
  categories: Category[];
  subcategories: Subcategory[];
  products: Product[];
  addCategory: (data: { name: string }) => Promise<boolean>;
  editCategory: (id: number, data: { name: string }) => Promise<boolean>;
  removeCategory: (id: number) => Promise<void>;
  addSubcategory: (data: { scName: string; categoryId: number }) => Promise<boolean>;
  editSubcategory: (id: number, data: { scName: string; categoryId: number }) => Promise<boolean>;
  removeSubcategory: (id: number) => Promise<void>;
  addProduct: (p: Omit<Product, 'id'>) => Promise<boolean>;
  editProduct: (id: number, p: Omit<Product, 'id'>) => Promise<boolean>;
  removeProduct: (id: number) => Promise<void>;
  refreshData: () => Promise<void>;
}

type Tab = 'overview' | 'category' | 'subcategory' | 'product' | 'order';

export default function Admin({
  categories, subcategories, products,
  addCategory, editCategory, removeCategory,
  addSubcategory, editSubcategory, removeSubcategory,
  addProduct, editProduct, removeProduct,
  refreshData,
}: AdminProps) {
  const [tab, setTab] = useState<Tab>('overview');
  const [toast, setToast] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<{ type: string; id: number } | null>(null);

  // ── Category inline edit state ──
  const [editingCatId, setEditingCatId] = useState<number | null>(null);
  const [editingCatName, setEditingCatName] = useState('');

  // ── Subcategory inline edit state ──
  const [editingSubId, setEditingSubId] = useState<number | null>(null);
  const [editingSubName, setEditingSubName] = useState('');
  const [editingSubCatId, setEditingSubCatId] = useState('');

  // ── Product inline edit state ──
  const [editingProdId, setEditingProdId] = useState<number | null>(null);
  const [editingProd, setEditingProd] = useState({
    name: '', description: '', categoryId: '', subcategoryId: '', price: '', discount: '', stock: '', images: ''
  });

  // ── Add forms ──
  const [catForm, setCatForm] = useState({ name: '' });
  const [subForm, setSubForm] = useState({ name: '', categoryId: '' });
  const [prodForm, setProdForm] = useState({
    name: '', description: '', categoryId: '', subcategoryId: '', price: '', discount: '', stock: '', images: ''
  });

  useEffect(() => {
    fetchOrders().then(setOrders).catch(console.error);
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  // ──────────────── SUBMIT ADD HANDLERS ────────────────
  const submitCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catForm.name.trim() || isSubmitting) return;
    setIsSubmitting(true);
    const ok = await addCategory({ name: catForm.name.trim() });
    setCatForm({ name: '' });
    showToast(ok ? 'Category added!' : 'Category added locally (backend offline)');
    setIsSubmitting(false);
  };

  const submitSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subForm.name.trim() || !subForm.categoryId || isSubmitting) return;
    setIsSubmitting(true);
    const ok = await addSubcategory({ scName: subForm.name.trim(), categoryId: Number(subForm.categoryId) });
    setSubForm({ name: '', categoryId: '' });
    showToast(ok ? 'Subcategory added!' : 'Subcategory added locally (backend offline)');
    setIsSubmitting(false);
  };

  const submitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodForm.name.trim() || !prodForm.subcategoryId || isSubmitting) return;
    const sub = subcategories.find(s => s.id === Number(prodForm.subcategoryId));
    if (!sub) return;
    setIsSubmitting(true);
    const images = prodForm.images.split(',').map(s => s.trim()).filter(Boolean);
    const ok = await addProduct({
      title: prodForm.name.trim(),
      description: prodForm.description.trim(),
      subcategory: sub,
      category: sub.category ?? { id: 0, name: '' },
      price: Number(prodForm.price) || 0,
      discount: Number(prodForm.discount) || 0,
      availableStock: Number(prodForm.stock) || 0,
      images: images.length ? images : ['https://images.pexels.com/photos/8839882/pexels-photo-8839882.jpeg?auto=compress&cs=tinysrgb&w=800'],
    });
    setProdForm({ name: '', description: '', categoryId: '', subcategoryId: '', price: '', discount: '', stock: '', images: '' });
    showToast(ok ? 'Product added!' : 'Product added locally (backend offline)');
    setIsSubmitting(false);
  };

  // ──────────────── SAVE EDIT HANDLERS ────────────────
  const saveEditCategory = async (id: number) => {
    if (!editingCatName.trim()) return;
    setIsSubmitting(true);
    await editCategory(id, { name: editingCatName.trim() });
    setEditingCatId(null);
    showToast('Category updated!');
    setIsSubmitting(false);
  };

  const saveEditSubcategory = async (id: number) => {
    if (!editingSubName.trim() || !editingSubCatId) return;
    setIsSubmitting(true);
    await editSubcategory(id, { scName: editingSubName.trim(), categoryId: Number(editingSubCatId) });
    setEditingSubId(null);
    showToast('Subcategory updated!');
    setIsSubmitting(false);
  };

  const saveEditProduct = async (id: number) => {
    if (!editingProd.name.trim() || !editingProd.subcategoryId) return;
    const sub = subcategories.find(s => s.id === Number(editingProd.subcategoryId));
    if (!sub) return;
    setIsSubmitting(true);
    const images = editingProd.images.split(',').map(s => s.trim()).filter(Boolean);
    await editProduct(id, {
      title: editingProd.name.trim(),
      description: editingProd.description.trim(),
      subcategory: sub,
      category: sub.category ?? { id: 0, name: '' },
      price: Number(editingProd.price) || 0,
      discount: Number(editingProd.discount) || 0,
      availableStock: Number(editingProd.stock) || 0,
      images: images.length ? images : ['https://images.pexels.com/photos/8839882/pexels-photo-8839882.jpeg?auto=compress&cs=tinysrgb&w=800'],
    });
    setEditingProdId(null);
    showToast('Product updated!');
    setIsSubmitting(false);
  };

  // ──────────────── DELETE HANDLER ────────────────
  const handleDelete = async () => {
    if (!confirmDelete) return;
    setIsSubmitting(true);
    if (confirmDelete.type === 'category') await removeCategory(confirmDelete.id);
    else if (confirmDelete.type === 'subcategory') await removeSubcategory(confirmDelete.id);
    else if (confirmDelete.type === 'product') await removeProduct(confirmDelete.id);
    setConfirmDelete(null);
    showToast('Deleted successfully!');
    setIsSubmitting(false);
  };

  const handleRefresh = async () => {
    showToast('Refreshing data from backend...');
    await refreshData();
    const newOrders = await fetchOrders().catch(() => []);
    if (newOrders.length) setOrders(newOrders);
    showToast('Data refreshed!');
  };

  const inputCls = "w-full px-4 py-2.5 rounded-xl border border-forest-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 transition-all";
  const labelCls = "block text-xs font-medium text-forest-700 mb-1.5";
  const iconBtnCls = "p-1.5 rounded-lg transition-colors";

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'order', label: 'Orders', icon: ClipboardList },
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
        <button onClick={handleRefresh} className="flex items-center gap-2 px-4 py-2 border border-forest-200 rounded-xl text-sm text-forest-700 hover:bg-cream-100 transition-colors">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
        {/* Sidebar */}
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
          {/* ── Overview ── */}
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

          {/* ── Orders ── */}
          {tab === 'order' && (
            <div className="bg-white rounded-2xl border border-forest-100 p-6">
              <h3 className="font-serif font-semibold text-forest-900 mb-4">Customer Orders</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-forest-700">
                  <thead className="bg-cream-100 text-forest-800 uppercase text-xs">
                    <tr>
                      <th className="px-4 py-3 rounded-tl-lg">Order ID</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Product</th>
                      <th className="px-4 py-3">Address</th>
                      <th className="px-4 py-3 rounded-tr-lg">Payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 ? (
                      <tr><td colSpan={5} className="text-center py-8 text-forest-400">No orders found.</td></tr>
                    ) : orders.map(order => (
                      <tr key={order.id} className="border-b border-forest-50 hover:bg-cream-50 transition-colors">
                        <td className="px-4 py-3 font-medium">#{order.id}</td>
                        <td className="px-4 py-3">
                          <p>{order.user?.name || 'N/A'}</p>
                          <p className="text-xs text-forest-400">{order.user?.email}</p>
                        </td>
                        <td className="px-4 py-3">{order.product?.title || 'Unknown'}</td>
                        <td className="px-4 py-3">
                          <p className="truncate max-w-[180px]">{order.address?.addressLine}</p>
                          <p className="text-xs text-forest-400">{order.address?.city} - {order.address?.pincode}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-gold-100 text-gold-800 rounded-lg text-xs font-medium">{order.paymentMethod || 'COD'}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Categories ── */}
          {tab === 'category' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Add form */}
              <form onSubmit={submitCategory} className="bg-white rounded-2xl border border-forest-100 p-6">
                <h3 className="font-serif font-semibold text-forest-900 mb-4 flex items-center gap-2"><Plus className="w-5 h-5 text-gold-600" /> Add New Category</h3>
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>Category Name</label>
                    <input value={catForm.name} onChange={(e) => setCatForm({ name: e.target.value })} placeholder="e.g. Kurtis" className={inputCls} required />
                  </div>
                  <button type="submit" disabled={isSubmitting} className="w-full py-2.5 bg-forest-800 hover:bg-forest-700 disabled:opacity-50 text-cream-50 font-medium rounded-xl transition-colors">
                    {isSubmitting ? 'Saving...' : 'Add Category'}
                  </button>
                </div>
              </form>

              {/* List with edit/delete */}
              <div className="bg-white rounded-2xl border border-forest-100 p-6">
                <h3 className="font-serif font-semibold text-forest-900 mb-4">Existing Categories</h3>
                <div className="space-y-2 max-h-[420px] overflow-y-auto">
                  {categories.map(c => (
                    <div key={c.id} className="flex items-center gap-2 p-2 rounded-xl border border-transparent hover:border-forest-100 hover:bg-cream-50 group">
                      {editingCatId === c.id ? (
                        <>
                          <input
                            value={editingCatName}
                            onChange={e => setEditingCatName(e.target.value)}
                            className="flex-1 px-3 py-1.5 rounded-lg border border-gold-400 text-sm focus:outline-none focus:ring-2 focus:ring-gold-300"
                            autoFocus
                            onKeyDown={e => { if (e.key === 'Enter') saveEditCategory(c.id); if (e.key === 'Escape') setEditingCatId(null); }}
                          />
                          <button onClick={() => saveEditCategory(c.id)} disabled={isSubmitting} className={`${iconBtnCls} bg-forest-100 text-forest-700 hover:bg-forest-200`}><Save className="w-4 h-4" /></button>
                          <button onClick={() => setEditingCatId(null)} className={`${iconBtnCls} bg-red-50 text-red-400 hover:bg-red-100`}><X className="w-4 h-4" /></button>
                        </>
                      ) : (
                        <>
                          <div className="w-9 h-9 rounded-lg bg-cream-200 flex items-center justify-center text-forest-600 shrink-0">
                            <FolderPlus className="w-4 h-4" />
                          </div>
                          <span className="text-sm text-forest-800 flex-1">{c.name}</span>
                          <span className="text-xs text-forest-400">{subcategories.filter(s => s.category?.id === c.id).length} sub</span>
                          <button onClick={() => { setEditingCatId(c.id); setEditingCatName(c.name); }} className={`${iconBtnCls} text-forest-400 hover:bg-cream-200 hover:text-forest-700 opacity-0 group-hover:opacity-100`}><Pencil className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setConfirmDelete({ type: 'category', id: c.id })} className={`${iconBtnCls} text-red-400 hover:bg-red-50 hover:text-red-600 opacity-0 group-hover:opacity-100`}><Trash2 className="w-3.5 h-3.5" /></button>
                        </>
                      )}
                    </div>
                  ))}
                  {categories.length === 0 && <p className="text-sm text-forest-400 text-center py-4">No categories yet.</p>}
                </div>
              </div>
            </div>
          )}

          {/* ── Subcategories ── */}
          {tab === 'subcategory' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Add form */}
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
                    {isSubmitting ? 'Saving...' : 'Add Subcategory'}
                  </button>
                </div>
              </form>

              {/* List grouped by category with edit/delete */}
              <div className="bg-white rounded-2xl border border-forest-100 p-6">
                <h3 className="font-serif font-semibold text-forest-900 mb-4">Existing Subcategories</h3>
                <div className="space-y-4 max-h-[480px] overflow-y-auto">
                  {categories.map(c => (
                    <div key={c.id}>
                      <p className="text-xs font-semibold text-gold-600 uppercase tracking-wider mb-2">{c.name}</p>
                      <div className="space-y-1 pl-2">
                        {subcategories.filter(s => s.category?.id === c.id).map(s => (
                          <div key={s.id} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-cream-50 group">
                            {editingSubId === s.id ? (
                              <div className="flex-1 flex gap-2 flex-wrap">
                                <input
                                  value={editingSubName}
                                  onChange={e => setEditingSubName(e.target.value)}
                                  className="flex-1 px-3 py-1.5 rounded-lg border border-gold-400 text-sm focus:outline-none focus:ring-2 focus:ring-gold-300 min-w-[120px]"
                                  autoFocus
                                />
                                <select value={editingSubCatId} onChange={e => setEditingSubCatId(e.target.value)} className="px-2 py-1.5 rounded-lg border border-gold-400 text-sm focus:outline-none">
                                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                </select>
                                <button onClick={() => saveEditSubcategory(s.id)} disabled={isSubmitting} className={`${iconBtnCls} bg-forest-100 text-forest-700 hover:bg-forest-200`}><Save className="w-4 h-4" /></button>
                                <button onClick={() => setEditingSubId(null)} className={`${iconBtnCls} bg-red-50 text-red-400 hover:bg-red-100`}><X className="w-4 h-4" /></button>
                              </div>
                            ) : (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-forest-400 shrink-0" />
                                <span className="text-sm text-forest-700 flex-1">{s.scName}</span>
                                <button onClick={() => { setEditingSubId(s.id); setEditingSubName(s.scName); setEditingSubCatId(String(s.category?.id ?? c.id)); }} className={`${iconBtnCls} text-forest-400 hover:bg-cream-200 hover:text-forest-700 opacity-0 group-hover:opacity-100`}><Pencil className="w-3.5 h-3.5" /></button>
                                <button onClick={() => setConfirmDelete({ type: 'subcategory', id: s.id })} className={`${iconBtnCls} text-red-400 hover:bg-red-50 hover:text-red-600 opacity-0 group-hover:opacity-100`}><Trash2 className="w-3.5 h-3.5" /></button>
                              </>
                            )}
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

          {/* ── Products ── */}
          {tab === 'product' && (
            <div className="space-y-6">
              {/* Add form */}
              <form onSubmit={submitProduct} className="bg-white rounded-2xl border border-forest-100 p-6">
                <h3 className="font-serif font-semibold text-forest-900 mb-4 flex items-center gap-2"><Plus className="w-5 h-5 text-gold-600" /> Add New Product</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className={labelCls}>Product Name</label>
                    <input value={prodForm.name} onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })} placeholder="e.g. Tussar Silk Saree" className={inputCls} required />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelCls}>Description</label>
                    <textarea value={prodForm.description} onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })} placeholder="Product details…" rows={2} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Category</label>
                    <select value={prodForm.categoryId} onChange={(e) => setProdForm({ ...prodForm, categoryId: e.target.value, subcategoryId: '' })} className={inputCls} required>
                      <option value="">Select a category…</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Subcategory</label>
                    <select value={prodForm.subcategoryId} onChange={(e) => setProdForm({ ...prodForm, subcategoryId: e.target.value })} className={inputCls} required disabled={!prodForm.categoryId}>
                      <option value="">Select a subcategory…</option>
                      {subcategories.filter(s => s.category?.id === Number(prodForm.categoryId)).map(s => (
                        <option key={s.id} value={s.id}>{s.scName}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Price (₹)</label>
                    <input type="number" value={prodForm.price} onChange={(e) => setProdForm({ ...prodForm, price: e.target.value })} placeholder="5000" className={inputCls} required />
                  </div>
                  <div>
                    <label className={labelCls}>Discount (%)</label>
                    <input type="number" value={prodForm.discount} onChange={(e) => setProdForm({ ...prodForm, discount: e.target.value })} placeholder="20" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Stock Count</label>
                    <input type="number" value={prodForm.stock} onChange={(e) => setProdForm({ ...prodForm, stock: e.target.value })} placeholder="20" className={inputCls} required />
                  </div>
                  <div>
                    <label className={labelCls}>Image URLs <span className="text-forest-400 font-normal">(comma separated)</span></label>
                    <input value={prodForm.images} onChange={(e) => setProdForm({ ...prodForm, images: e.target.value })} placeholder="https://..." className={inputCls} />
                  </div>
                  <div className="md:col-span-2">
                    <button type="submit" disabled={isSubmitting} className="w-full py-2.5 bg-forest-800 hover:bg-forest-700 disabled:opacity-50 text-cream-50 font-medium rounded-xl transition-colors">
                      {isSubmitting ? 'Saving...' : 'Add Product'}
                    </button>
                  </div>
                </div>
              </form>

              {/* Product list with inline edit/delete */}
              <div className="bg-white rounded-2xl border border-forest-100 overflow-hidden">
                <div className="p-5 border-b border-forest-100">
                  <h3 className="font-serif font-semibold text-forest-900">Catalog ({products.length} products)</h3>
                </div>
                <div className="divide-y divide-forest-50 max-h-[600px] overflow-y-auto">
                  {products.slice().reverse().map(p => (
                    <div key={p.id}>
                      {editingProdId === p.id ? (
                        /* ── Inline edit row ── */
                        <div className="p-4 bg-cream-50 space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="md:col-span-2">
                              <label className={labelCls}>Product Name</label>
                              <input value={editingProd.name} onChange={e => setEditingProd({ ...editingProd, name: e.target.value })} className={inputCls} />
                            </div>
                            <div className="md:col-span-2">
                              <label className={labelCls}>Description</label>
                              <textarea value={editingProd.description} onChange={e => setEditingProd({ ...editingProd, description: e.target.value })} rows={2} className={inputCls} />
                            </div>
                            <div>
                              <label className={labelCls}>Category</label>
                              <select value={editingProd.categoryId} onChange={e => setEditingProd({ ...editingProd, categoryId: e.target.value, subcategoryId: '' })} className={inputCls}>
                                <option value="">Select category…</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className={labelCls}>Subcategory</label>
                              <select value={editingProd.subcategoryId} onChange={e => setEditingProd({ ...editingProd, subcategoryId: e.target.value })} className={inputCls} disabled={!editingProd.categoryId}>
                                <option value="">Select subcategory…</option>
                                {subcategories.filter(s => s.category?.id === Number(editingProd.categoryId)).map(s => (
                                  <option key={s.id} value={s.id}>{s.scName}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className={labelCls}>Price (₹)</label>
                              <input type="number" value={editingProd.price} onChange={e => setEditingProd({ ...editingProd, price: e.target.value })} className={inputCls} />
                            </div>
                            <div>
                              <label className={labelCls}>Discount (%)</label>
                              <input type="number" value={editingProd.discount} onChange={e => setEditingProd({ ...editingProd, discount: e.target.value })} className={inputCls} />
                            </div>
                            <div>
                              <label className={labelCls}>Stock</label>
                              <input type="number" value={editingProd.stock} onChange={e => setEditingProd({ ...editingProd, stock: e.target.value })} className={inputCls} />
                            </div>
                            <div>
                              <label className={labelCls}>Images (comma sep)</label>
                              <input value={editingProd.images} onChange={e => setEditingProd({ ...editingProd, images: e.target.value })} className={inputCls} />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => saveEditProduct(p.id)} disabled={isSubmitting} className="flex items-center gap-1.5 px-4 py-2 bg-forest-800 hover:bg-forest-700 disabled:opacity-50 text-cream-50 text-sm font-medium rounded-xl transition-colors">
                              <Save className="w-4 h-4" /> Save Changes
                            </button>
                            <button onClick={() => setEditingProdId(null)} className="flex items-center gap-1.5 px-4 py-2 border border-forest-200 hover:bg-cream-100 text-forest-700 text-sm font-medium rounded-xl transition-colors">
                              <X className="w-4 h-4" /> Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* ── Normal row ── */
                        <div className="flex items-center gap-3 p-4 hover:bg-cream-50 group transition-colors">
                          <img src={p.images?.[0] || ''} alt={p.title} className="w-14 h-14 rounded-xl object-cover bg-cream-100 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-forest-900 truncate">{p.title}</p>
                            <p className="text-xs text-forest-500">₹{discountedPrice(p).toLocaleString('en-IN')} · Stock: {p.availableStock} · {p.subcategory?.scName}</p>
                          </div>
                          {p.images?.[0] && <ImageIcon className="w-4 h-4 text-forest-300 shrink-0" />}
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            <button
                              onClick={() => {
                                setEditingProdId(p.id);
                                setEditingProd({
                                  name: p.title,
                                  description: p.description ?? '',
                                  categoryId: String(p.category?.id ?? ''),
                                  subcategoryId: String(p.subcategory?.id ?? ''),
                                  price: String(p.price),
                                  discount: String(p.discount ?? 0),
                                  stock: String(p.availableStock),
                                  images: (p.images ?? []).join(', '),
                                });
                              }}
                              className={`${iconBtnCls} text-forest-400 hover:bg-cream-200 hover:text-forest-700`}
                            ><Pencil className="w-4 h-4" /></button>
                            <button onClick={() => setConfirmDelete({ type: 'product', id: p.id })} className={`${iconBtnCls} text-red-400 hover:bg-red-50 hover:text-red-600`}><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {products.length === 0 && <p className="text-sm text-forest-400 text-center py-8">No products yet.</p>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Delete Confirmation Modal ── */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="font-serif font-semibold text-forest-900">Confirm Delete</h3>
                <p className="text-xs text-forest-500">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-forest-700 mb-6">
              Are you sure you want to delete this <span className="font-medium">{confirmDelete.type}</span>?
              {confirmDelete.type === 'category' && ' All associated subcategories will also be removed.'}
            </p>
            <div className="flex gap-3">
              <button onClick={handleDelete} disabled={isSubmitting} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-medium rounded-xl transition-colors text-sm">
                {isSubmitting ? 'Deleting...' : 'Delete'}
              </button>
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 border border-forest-200 hover:bg-cream-100 text-forest-700 font-medium rounded-xl transition-colors text-sm">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-forest-800 text-cream-50 px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-slide-up">
          <Check className="w-4 h-4 text-gold-400" /> {toast}
          <button onClick={() => setToast(null)} className="ml-2 text-cream-100/60 hover:text-cream-50"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}
    </div>
  );
}
