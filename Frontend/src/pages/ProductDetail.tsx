// ─── ProductDetail Page ───
// SCHEMA: Updated all field references to match backend entity names.

import { useMemo, useState } from 'react';
import { ChevronRight, Minus, Plus, ShoppingCart, Truck, ShieldCheck, RefreshCw, Check, Heart, Share2, Zap } from 'lucide-react';
import { Category, Product, Subcategory, Page, CartItem, discountedPrice } from '../types';
import { getDirectDriveLink } from '../utils/imageUtils';
import DesignUpload from '../components/DesignUpload';
import ProductCard from '../components/ProductCard';

interface ProductDetailProps {
  product: Product;
  categories: Category[];
  subcategories: Subcategory[];
  products: Product[];
  navigate: (page: Page, opts?: { categoryId?: number; subcategoryId?: number; productId?: number }) => void;
  addToCart: (item: CartItem) => void;
}

export default function ProductDetail({ product, categories, subcategories, products, navigate, addToCart }: ProductDetailProps) {
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState('M');
  const [customDesign, setCustomDesign] = useState<string | undefined>(undefined);
  const [added, setAdded] = useState(false);

  const category = product.category ?? categories.find(c => c.id === product.category?.id);
  const subcategory = product.subcategory ?? subcategories.find(s => s.id === product.subcategory?.id);
  const finalPrice = discountedPrice(product);
  const discountPct = product.discount ?? 0;

  // Smart Recommendation Engine
  const recommendations = useMemo(() => {
    const result: Product[] = [];
    const exclude = product.id;
    // 1. Exact subcategory match
    const subMatches = products.filter(p => p.id !== exclude && p.subcategory?.id === product.subcategory?.id);
    result.push(...subMatches);
    // 2. Fill from broader parent category, excluding already added
    if (result.length < 4) {
      const catMatches = products.filter(p =>
        p.id !== exclude &&
        p.category?.id === product.category?.id &&
        p.subcategory?.id !== product.subcategory?.id &&
        !result.find(r => r.id === p.id)
      );
      result.push(...catMatches);
    }
    return result.slice(0, 4);
  }, [product, products]);

  const handleAddToCart = () => {
    addToCart({ product, quantity: qty, customDesign });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart({ product, quantity: qty, customDesign });
    navigate('cart');
  };

  const whatsappText = encodeURIComponent(
    `Hi Vaaraahi Silks! I'm interested in the ${product.title} (₹${finalPrice.toLocaleString('en-IN')}). Could you share more details?`
  );
  const whatsappUrl = `https://wa.me/919876543210?text=${whatsappText}`;

  const openProduct = (id: number) => {
    const p = products.find(x => x.id === id);
    if (p) navigate('product', { productId: id, subcategoryId: p.subcategory?.id, categoryId: p.category?.id });
  };

  return (
    <div className="animate-fade-in">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-6">
        <div className="flex items-center gap-2 text-xs text-forest-500">
          <button onClick={() => navigate('home')} className="hover:text-gold-600">Home</button>
          <ChevronRight className="w-3 h-3" />
          <button onClick={() => navigate('shop', { categoryId: product.category?.id })} className="hover:text-gold-600">{category?.name}</button>
          <ChevronRight className="w-3 h-3" />
          <button onClick={() => navigate('shop', { categoryId: product.category?.id, subcategoryId: product.subcategory?.id })} className="hover:text-gold-600">{subcategory?.scName}</button>
          <ChevronRight className="w-3 h-3" />
          <span className="text-forest-700 truncate">{product.title}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Gallery */}
        <div>
          <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-cream-100 mb-4">
            <img
              src={getDirectDriveLink(product.images?.[activeImg]) || 'https://images.pexels.com/photos/8839882/pexels-photo-8839882.jpeg?auto=compress&cs=tinysrgb&w=800'}
              alt={product.title}
              className="w-full h-full object-cover"
            />
            {discountPct > 0 && (
              <span className="absolute top-4 left-4 bg-gold-500 text-forest-950 text-xs font-bold tracking-wider uppercase px-3 py-1.5 rounded-full">-{discountPct}% OFF</span>
            )}
          </div>
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`w-20 h-24 rounded-xl overflow-hidden border-2 transition-colors ${activeImg === i ? 'border-gold-500' : 'border-forest-100 hover:border-forest-300'}`}
                >
                  <img src={getDirectDriveLink(img)} alt={`${product.title} ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {subcategory && <p className="text-xs uppercase tracking-[0.25em] text-gold-600 mb-2">{subcategory.scName}</p>}
          <h1 className="font-serif text-4xl font-bold text-forest-900 leading-tight">{product.title}</h1>

          <div className="flex items-baseline gap-3 mt-5">
            <span className="text-3xl font-bold text-forest-900">₹{finalPrice.toLocaleString('en-IN')}</span>
            {discountPct > 0 && (
              <span className="text-lg text-forest-400 line-through">₹{product.price.toLocaleString('en-IN')}</span>
            )}
            {discountPct > 0 && <span className="text-sm font-semibold text-gold-600">Save {discountPct}%</span>}
          </div>

          <p className="text-forest-600 mt-5 leading-relaxed">{product.description}</p>

          {/* Size */}
          <div className="mt-6">
            <p className="text-sm font-medium text-forest-800 mb-2">Select Size</p>
            <div className="flex gap-2">
              {['S', 'M', 'L', 'XL'].map(s => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`w-12 h-12 rounded-full border-2 font-medium text-sm transition-all ${size === s ? 'border-gold-500 bg-gold-500 text-forest-950' : 'border-forest-200 text-forest-700 hover:border-forest-400'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="mt-6">
            <p className="text-sm font-medium text-forest-800 mb-2">Quantity</p>
            <div className="flex items-center gap-3">
              <div className="flex items-center border-2 border-forest-200 rounded-full">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 flex items-center justify-center text-forest-700 hover:text-gold-600"><Minus className="w-4 h-4" /></button>
                <span className="w-10 text-center font-medium">{qty}</span>
                <button onClick={() => setQty(Math.min(product.availableStock, qty + 1))} className="w-10 h-10 flex items-center justify-center text-forest-700 hover:text-gold-600"><Plus className="w-4 h-4" /></button>
              </div>
              <span className="text-xs text-forest-500">{product.availableStock} in stock</span>
            </div>
          </div>

          {/* Custom design upload */}
          <div className="mt-6">
            <p className="text-sm font-medium text-forest-800 mb-2">Upload your custom design <span className="text-forest-400 font-normal">(optional)</span></p>
            <DesignUpload onUpload={(d) => setCustomDesign(d)} />
          </div>

          {/* CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleAddToCart}
              className={`flex-1 py-4 rounded-full font-semibold transition-all flex items-center justify-center gap-2 ${added ? 'bg-forest-600 text-cream-50' : 'border-2 border-forest-800 text-forest-800 hover:bg-forest-50 hover:scale-[1.02]'}`}
            >
              {added ? (<><Check className="w-5 h-5" /> Added!</>) : (<><ShoppingCart className="w-5 h-5" /> Add to Cart</>)}
            </button>
            <button
              onClick={handleBuyNow}
              className="flex-1 py-4 rounded-full font-semibold bg-gold-500 hover:bg-gold-400 text-forest-950 transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
            >
              <Zap className="w-5 h-5" /> Buy Now
            </button>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-4 rounded-full font-semibold bg-[#25D366] hover:bg-[#1da851] text-white transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.001-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
              Enquire Now
            </a>
          </div>

          <div className="flex gap-3 mt-4">
            <button className="flex items-center gap-1.5 text-sm text-forest-600 hover:text-gold-600 transition-colors"><Heart className="w-4 h-4" /> Wishlist</button>
            <button className="flex items-center gap-1.5 text-sm text-forest-600 hover:text-gold-600 transition-colors"><Share2 className="w-4 h-4" /> Share</button>
          </div>

          {/* Trust badges */}
          <div className="mt-8 grid grid-cols-3 gap-3 pt-6 border-t border-forest-100">
            {[
              { icon: Truck, label: 'Free Shipping' },
              { icon: ShieldCheck, label: 'Authentic Silk' },
              { icon: RefreshCw, label: 'Easy Returns' },
            ].map((b, i) => (
              <div key={i} className="flex flex-col items-center text-center gap-1">
                <b.icon className="w-6 h-6 text-forest-600" />
                <span className="text-xs text-forest-600">{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* You May Also Like */}
      <section className="bg-cream-100 py-20 mt-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mb-10">
            <span className="text-xs tracking-[0.3em] uppercase text-gold-600">Curated for you</span>
            <h2 className="font-serif text-4xl font-bold text-forest-900 mt-2">You May Also Like</h2>
            <p className="text-sm text-forest-600 mt-1">More from {subcategory?.scName} & {category?.name}</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {recommendations.map(p => (
              <ProductCard
                key={p.id}
                product={p}
                category={p.category ?? categories.find(c => c.id === p.category?.id)}
                subcategory={p.subcategory ?? subcategories.find(s => s.id === p.subcategory?.id)}
                onClick={openProduct}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
