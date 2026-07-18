// ─── ProductCard Component ───
// BUG FIX: Replaced `Link` icon (chain-link) with `Eye` icon for "View Details".
// SCHEMA: Updated to use backend field names (title, price, discount, availableStock).

import { Eye } from 'lucide-react';
import { Product, Category, Subcategory, discountedPrice } from '../types';
import { getDirectDriveLink } from '../utils/imageUtils';

interface ProductCardProps {
  product: Product;
  category?: Category;
  subcategory?: Subcategory;
  onClick: (id: number) => void;
}

export default function ProductCard({ product, category, subcategory, onClick }: ProductCardProps) {
  const finalPrice = discountedPrice(product);
  const discountPct = product.discount ?? 0;

  return (
    <div
      onClick={() => onClick(product.id)}
      className="product-card group cursor-pointer bg-white rounded-2xl overflow-hidden border border-forest-100 hover:shadow-xl hover:border-gold-300 transition-all duration-300"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-cream-100">
        <img
          src={getDirectDriveLink(product.images?.[0]) || 'https://images.pexels.com/photos/8839882/pexels-photo-8839882.jpeg?auto=compress&cs=tinysrgb&w=400'}
          alt={product.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {discountPct > 0 && (
            <span className="bg-gold-500 text-forest-950 text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full">-{discountPct}%</span>
          )}
        </div>
        {product.availableStock <= 5 && product.availableStock > 0 && (
          <span className="absolute bottom-3 left-3 bg-white/90 backdrop-blur text-forest-800 text-[10px] font-medium px-2 py-1 rounded-full">
            Only {product.availableStock} left
          </span>
        )}
      </div>
      <div className="p-4">
        {subcategory && <p className="text-[10px] uppercase tracking-wider text-gold-600 mb-1">{subcategory.scName}</p>}
        <h3 className="font-serif text-base font-semibold text-forest-900 group-hover:text-gold-700 transition-colors line-clamp-1">{product.title}</h3>
        <p className="text-xs text-forest-500 mt-0.5 line-clamp-1">{category?.name}</p>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="font-semibold text-forest-900">₹{finalPrice.toLocaleString('en-IN')}</span>
          {discountPct > 0 && (
            <span className="text-xs text-forest-400 line-through">₹{product.price.toLocaleString('en-IN')}</span>
          )}
        </div>
        {/* BUG FIX: Was using `Link` icon (chain-link); now uses `Eye` for semantics */}
        <div className="mt-3 flex items-center gap-1 text-xs text-forest-600 group-hover:text-gold-600 transition-colors">
          <Eye className="w-3.5 h-3.5" />
          <span>View Details</span>
        </div>
      </div>
    </div>
  );
}
