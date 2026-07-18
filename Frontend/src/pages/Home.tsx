// ─── Home Page ───
// SCHEMA: Updated to use backend field names.
// Best sellers & new arrivals computed from discount percentage (no backend flags).

import { ChevronRight, Sparkles, Award, Truck, ShieldCheck } from 'lucide-react';
import { Category, Product, Subcategory, Page, getCategoryImage } from '../types';
import ProductCard from '../components/ProductCard';

interface HomeProps {
  categories: Category[];
  subcategories: Subcategory[];
  products: Product[];
  navigate: (page: Page, opts?: { categoryId?: number; subcategoryId?: number; productId?: number }) => void;
}

export default function Home({ categories, subcategories, products, navigate }: HomeProps) {
  // Best sellers = products with highest discount
  const bestSellers = [...products]
    .sort((a, b) => (b.discount ?? 0) - (a.discount ?? 0))
    .slice(0, 4);

  // New arrivals = last 4 products (most recently added)
  const newArrivals = [...products].slice(-4).reverse();

  const openProduct = (id: number) => {
    const p = products.find(x => x.id === id);
    if (p) navigate('product', { productId: id, subcategoryId: p.subcategory?.id, categoryId: p.category?.id });
  };

  return (
    <div className="animate-fade-in">
      {/* HERO */}
      <section className="relative h-[88vh] min-h-[600px] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/8839882/pexels-photo-8839882.jpeg?auto=compress&cs=tinysrgb&w=1600"
            alt="Hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-forest-950/80 via-forest-950/40 to-transparent" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 h-full flex items-center">
          <div className="max-w-xl text-cream-50">
            <span className="inline-flex items-center gap-2 text-gold-300 text-sm tracking-[0.3em] uppercase mb-4 animate-slide-up">
              <Sparkles className="w-4 h-4" /> Festive Collection 2026
            </span>
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] mb-6 animate-slide-up text-balance">
              Where Heritage Meets <span className="text-gold-400">Modern Grace</span>
            </h1>
            <p className="text-lg text-cream-100/80 mb-8 leading-relaxed max-w-md">
              Handwoven Kanjivaram silks, designer lehengas, and bespoke couture crafted by master artisans of South India.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => navigate('shop', { categoryId: categories[0]?.id })}
                className="px-8 py-3.5 bg-gold-500 hover:bg-gold-400 text-forest-950 font-semibold rounded-full transition-all hover:scale-105 hover:shadow-xl"
              >
                Explore Sarees
              </button>
              <button
                onClick={() => navigate('shop', { categoryId: categories.find(c => c.name === 'Lehengas')?.id })}
                className="px-8 py-3.5 border-2 border-cream-100/40 hover:border-gold-300 hover:text-gold-300 text-cream-50 font-semibold rounded-full transition-all backdrop-blur-sm"
              >
                Bridal Edit
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="bg-forest-900 text-cream-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: Award, title: 'Handcrafted Heritage', sub: 'By master weavers' },
            { icon: Truck, title: 'Free Shipping', sub: 'On orders above ₹2,000' },
            { icon: ShieldCheck, title: 'Authentic Silk', sub: 'Silk Mark Certified' },
            { icon: Sparkles, title: 'Easy Returns', sub: '7-day return policy' },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-3">
              <f.icon className="w-8 h-8 text-gold-400 shrink-0" />
              <div>
                <p className="font-medium text-sm">{f.title}</p>
                <p className="text-xs text-cream-100/60">{f.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <span className="text-xs tracking-[0.3em] uppercase text-gold-600">Curated Collections</span>
          <h2 className="font-serif text-4xl font-bold text-forest-900 mt-2">Shop by Category</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {categories.map((cat, i) => (
            <button
              key={cat.id}
              onClick={() => navigate('shop', { categoryId: cat.id })}
              className={`group relative overflow-hidden rounded-2xl ${i === 0 ? 'col-span-2 md:col-span-1 lg:col-span-1 row-span-2 md:row-span-2' : ''}`}
            >
              <div className={`relative w-full ${i === 0 ? 'h-full min-h-[400px]' : 'aspect-square'} bg-cream-200`}>
                {/* Static fallback image for category (backend has no image field yet) */}
                <img src={getCategoryImage(cat.id)} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-forest-950/80 via-forest-950/20 to-transparent" />
                <div className="absolute bottom-0 left-0 p-5 text-left">
                  <h3 className="font-serif text-xl text-cream-50 font-semibold">{cat.name}</h3>
                  <span className="inline-flex items-center gap-1 text-xs text-gold-300 mt-1 group-hover:gap-2 transition-all">
                    Shop now <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Best sellers */}
      <section className="bg-cream-100 py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="text-xs tracking-[0.3em] uppercase text-gold-600">Loved by you</span>
              <h2 className="font-serif text-4xl font-bold text-forest-900 mt-2">Best Sellers</h2>
            </div>
            <button onClick={() => navigate('shop')} className="text-sm text-forest-700 hover:text-gold-600 flex items-center gap-1">
              View all <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {bestSellers.map(p => (
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

      {/* Promo banner */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.pexels.com/photos/8839870/pexels-photo-8839870.jpeg?auto=compress&cs=tinysrgb&w=1600" alt="Promo" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-forest-950/70" />
        </div>
        <div className="relative max-w-3xl mx-auto text-center px-6">
          <span className="text-gold-300 text-sm tracking-[0.3em] uppercase">Limited Time</span>
          <h2 className="font-serif text-4xl sm:text-5xl font-bold text-cream-50 mt-3 mb-4 text-balance">
            Bridal Couture Collection
          </h2>
          <p className="text-cream-100/80 mb-8 text-lg">
            Discover hand-embroidered lehengas and pattu sarees crafted for your special day. Book a virtual consultation today.
          </p>
          <button
            onClick={() => navigate('shop', { categoryId: categories.find(c => c.name === 'Lehengas')?.id })}
            className="px-8 py-3.5 bg-gold-500 hover:bg-gold-400 text-forest-950 font-semibold rounded-full transition-all hover:scale-105"
          >
            Shop Bridal Edit
          </button>
        </div>
      </section>

      {/* New arrivals */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="text-xs tracking-[0.3em] uppercase text-gold-600">Just landed</span>
            <h2 className="font-serif text-4xl font-bold text-forest-900 mt-2">New Arrivals</h2>
          </div>
          <button onClick={() => navigate('shop')} className="text-sm text-forest-700 hover:text-gold-600 flex items-center gap-1">
            View all <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {newArrivals.map(p => (
            <ProductCard
              key={p.id}
              product={p}
              category={p.category ?? categories.find(c => c.id === p.category?.id)}
              subcategory={p.subcategory ?? subcategories.find(s => s.id === p.subcategory?.id)}
              onClick={openProduct}
            />
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="max-w-4xl mx-auto px-6 lg:px-8 pb-20">
        <div className="bg-forest-900 rounded-3xl p-10 text-center">
          <h3 className="font-serif text-3xl text-cream-50 font-bold">Join the Vaaraahi Family</h3>
          <p className="text-cream-100/70 mt-2 mb-6">Get exclusive offers, early access to new collections, and styling tips.</p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Enter your email" className="flex-1 px-4 py-3 rounded-full bg-cream-50 text-forest-900 placeholder-forest-500 focus:outline-none focus:ring-2 focus:ring-gold-400" />
            <button className="px-6 py-3 bg-gold-500 hover:bg-gold-400 text-forest-950 font-semibold rounded-full transition-colors">Subscribe</button>
          </form>
        </div>
      </section>
    </div>
  );
}
