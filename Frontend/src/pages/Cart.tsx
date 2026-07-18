// ─── Cart Page ───
// BUG FIX: Line 141 subtitle was repeating product name → now shows subcategory name.
// BUG FIX: placeOrder `setTouched` in forEach was stale → now uses single setState call.
// SCHEMA: Updated all field references to match backend schema.

import { useMemo, useState } from 'react';
import { Minus, Plus, X, ShoppingBag, ArrowRight, Tag, Check, CreditCard } from 'lucide-react';
import { CartItem, Page, discountedPrice } from '../types';
import RollingNumber from '../components/RollingNumber';
import { getDirectDriveLink } from '../utils/imageUtils';

interface CartProps {
  cart: CartItem[];
  navigate: (page: Page, opts?: { categoryId?: number; subcategoryId?: number; productId?: number }) => void;
  updateQty: (productId: number, qty: number) => void;
  removeItem: (productId: number) => void;
}

interface FormErrors { [k: string]: string }

export default function Cart({ cart, navigate, updateQty, removeItem }: CartProps) {
  const [coupon, setCoupon] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; pct: number } | null>(null);
  const [couponMsg, setCouponMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [form, setForm] = useState({ fullName: '', email: '', address: '', city: '', postal: '', phone: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ [k: string]: boolean }>({});
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const subtotal = useMemo(() => cart.reduce((s, i) => s + discountedPrice(i.product) * i.quantity, 0), [cart]);
  const discount = appliedCoupon ? Math.round(subtotal * appliedCoupon.pct / 100) : 0;
  const shipping = subtotal > 2000 ? 0 : 99;
  const total = Math.max(0, subtotal - discount + (cart.length ? shipping : 0));

  const applyCoupon = () => {
    const code = coupon.trim().toUpperCase();
    if (code === 'SAVE20') {
      setAppliedCoupon({ code, pct: 20 });
      setCouponMsg({ type: 'success', text: '20% discount applied!' });
    } else if (code === 'FESTIVE10') {
      setAppliedCoupon({ code, pct: 10 });
      setCouponMsg({ type: 'success', text: '10% festive discount applied!' });
    } else if (code === 'WELCOME5') {
      setAppliedCoupon({ code, pct: 5 });
      setCouponMsg({ type: 'success', text: '5% welcome discount applied!' });
    } else {
      setAppliedCoupon(null);
      setCouponMsg({ type: 'error', text: 'Invalid coupon code' });
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCoupon('');
    setCouponMsg(null);
  };

  const validate = (name: string, value: string): string => {
    switch (name) {
      case 'fullName': return value.trim().length < 2 ? 'Name is required' : '';
      case 'email': return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'Valid email required' : '';
      case 'address': return value.trim().length < 8 ? 'Full address required' : '';
      case 'city': return value.trim().length < 2 ? 'City required' : '';
      case 'postal': return !/^\d{6}$/.test(value) ? '6-digit PIN required' : '';
      case 'phone': return !/^\d{10}$/.test(value.replace(/\D/g, '')) ? '10-digit phone required' : '';
      default: return '';
    }
  };

  const onChange = (name: string, value: string) => {
    setForm({ ...form, [name]: value });
    if (touched[name]) {
      setErrors({ ...errors, [name]: validate(name, value) });
    }
  };

  const onBlur = (name: string) => {
    setTouched({ ...touched, [name]: true });
    setErrors({ ...errors, [name]: validate(name, form[name as keyof typeof form]) });
  };

  const isValid = () => Object.keys({ fullName: '', email: '', address: '', city: '', postal: '', phone: '' }).every(
    k => validate(k, form[k as keyof typeof form]) === ''
  );

  const placeOrder = () => {
    // BUG FIX: Set all fields as touched in a single call (was using forEach with stale state)
    const allTouched: { [k: string]: boolean } = {};
    const newErrors: FormErrors = {};
    Object.keys(form).forEach(k => {
      allTouched[k] = true;
      newErrors[k] = validate(k, form[k as keyof typeof form]);
    });
    setTouched(allTouched);
    setErrors(newErrors);

    if (Object.values(newErrors).some(v => v) || cart.length === 0) return;

    setPlacingOrder(true);
    setTimeout(() => {
      setPlacingOrder(false);
      setOrderPlaced(true);
    }, 1500);
  };

  if (orderPlaced) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-forest-600 flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-cream-50" />
        </div>
        <h1 className="font-serif text-4xl font-bold text-forest-900">Order Confirmed!</h1>
        <p className="text-forest-600 mt-3 mb-8">Thank you, {form.fullName.split(' ')[0]}! Your order of ₹{total.toLocaleString('en-IN')} has been placed. A confirmation has been sent to {form.email}.</p>
        <button onClick={() => navigate('home')} className="px-8 py-3 bg-forest-800 hover:bg-forest-700 text-cream-50 rounded-full font-semibold transition-colors">Continue Shopping</button>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-cream-200 flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-10 h-10 text-forest-500" />
        </div>
        <h1 className="font-serif text-4xl font-bold text-forest-900">Your Cart is Empty</h1>
        <p className="text-forest-600 mt-3 mb-8">Discover timeless pieces crafted by master artisans.</p>
        <button onClick={() => navigate('shop')} className="px-8 py-3 bg-forest-800 hover:bg-forest-700 text-cream-50 rounded-full font-semibold transition-colors">Browse Collections</button>
      </div>
    );
  }

  const inputCls = (name: string) => `w-full px-4 py-3 rounded-xl border bg-white focus:outline-none focus:ring-2 transition-all ${errors[name] && touched[name] ? 'border-red-400 focus:ring-red-300' : !errors[name] && touched[name] ? 'border-forest-500 focus:ring-forest-300' : 'border-forest-200 focus:ring-gold-400'}`;

  return (
    <div className="animate-fade-in">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        <h1 className="font-serif text-4xl font-bold text-forest-900 mb-2">Your Cart</h1>
        <p className="text-forest-600 mb-10 text-sm">{cart.length} {cart.length === 1 ? 'item' : 'items'} in your bag</p>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10">
          {/* Line items */}
          <div className="space-y-4">
            {cart.map((item) => {
              const itemPrice = discountedPrice(item.product);
              return (
                <div key={item.product.id} className="bg-white rounded-2xl border border-forest-100 p-4 flex gap-4 group hover:shadow-md transition-shadow">
                  <div className="w-24 h-32 rounded-xl overflow-hidden bg-cream-100 shrink-0">
                    <img src={getDirectDriveLink(item.product.images?.[0]) || ''} alt={item.product.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-serif font-semibold text-forest-900 truncate">{item.product.title}</h3>
                        {/* BUG FIX: Was showing product name again; now shows subcategory */}
                        <p className="text-xs text-forest-500 mt-0.5">{item.product.subcategory?.scName ?? item.product.category?.name ?? ''}</p>
                        {item.customDesign && (
                          <p className="text-xs text-gold-600 mt-1 flex items-center gap-1"><Check className="w-3 h-3" /> Custom design attached</p>
                        )}
                      </div>
                      <button onClick={() => removeItem(item.product.id)} className="text-forest-400 hover:text-red-500 transition-colors p-1">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-end justify-between mt-3">
                      <div className="flex items-center border-2 border-forest-200 rounded-full">
                        <button onClick={() => updateQty(item.product.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center text-forest-700 hover:text-gold-600"><Minus className="w-3.5 h-3.5" /></button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button onClick={() => updateQty(item.product.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center text-forest-700 hover:text-gold-600"><Plus className="w-3.5 h-3.5" /></button>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-forest-900">₹{(itemPrice * item.quantity).toLocaleString('en-IN')}</p>
                        {item.product.discount > 0 && (
                          <p className="text-xs text-forest-400 line-through">₹{(item.product.price * item.quantity).toLocaleString('en-IN')}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            <button onClick={() => navigate('shop')} className="text-sm text-forest-700 hover:text-gold-600 flex items-center gap-1 mt-4">
              <ArrowRight className="w-4 h-4 rotate-180" /> Continue shopping
            </button>
          </div>

          {/* Checkout */}
          <div className="space-y-6">
            {/* Coupon */}
            <div className="bg-white rounded-2xl border border-forest-100 p-5">
              <h3 className="font-serif font-semibold text-forest-900 mb-3 flex items-center gap-2"><Tag className="w-4 h-4 text-gold-600" /> Coupon Code</h3>
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-forest-50 border border-forest-200 rounded-xl px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-forest-600" />
                    <span className="text-sm font-medium text-forest-800">{appliedCoupon.code}</span>
                    <span className="text-xs text-forest-600">−{appliedCoupon.pct}%</span>
                  </div>
                  <button onClick={removeCoupon} className="text-forest-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                </div>
              ) : (
                <>
                  <div className="flex gap-2">
                    <input
                      value={coupon}
                      onChange={(e) => { setCoupon(e.target.value); setCouponMsg(null); }}
                      placeholder="Try SAVE20"
                      className="flex-1 px-4 py-2.5 rounded-xl border border-forest-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gold-400"
                    />
                    <button onClick={applyCoupon} className="px-4 py-2.5 bg-forest-800 hover:bg-forest-700 text-cream-50 text-sm font-medium rounded-xl transition-colors">Apply</button>
                  </div>
                  {couponMsg && (
                    <p className={`text-xs mt-2 ${couponMsg.type === 'success' ? 'text-forest-600' : 'text-red-500'}`}>{couponMsg.text}</p>
                  )}
                  <p className="text-xs text-forest-400 mt-2">Try: SAVE20, FESTIVE10, WELCOME5</p>
                </>
              )}
            </div>

            {/* Checkout form */}
            <div className="bg-white rounded-2xl border border-forest-100 p-6">
              <h3 className="font-serif font-semibold text-forest-900 mb-4">Checkout Details</h3>
              <div className="space-y-3">
                <div>
                  <input placeholder="Full Name" value={form.fullName} onChange={(e) => onChange('fullName', e.target.value)} onBlur={() => onBlur('fullName')} className={inputCls('fullName')} />
                  {errors.fullName && touched.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
                </div>
                <div>
                  <input placeholder="Email" type="email" value={form.email} onChange={(e) => onChange('email', e.target.value)} onBlur={() => onBlur('email')} className={inputCls('email')} />
                  {errors.email && touched.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>
                <div>
                  <input placeholder="Shipping Address" value={form.address} onChange={(e) => onChange('address', e.target.value)} onBlur={() => onBlur('address')} className={inputCls('address')} />
                  {errors.address && touched.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input placeholder="City" value={form.city} onChange={(e) => onChange('city', e.target.value)} onBlur={() => onBlur('city')} className={inputCls('city')} />
                    {errors.city && touched.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
                  </div>
                  <div>
                    <input placeholder="PIN Code" value={form.postal} onChange={(e) => onChange('postal', e.target.value)} onBlur={() => onBlur('postal')} className={inputCls('postal')} />
                    {errors.postal && touched.postal && <p className="text-xs text-red-500 mt-1">{errors.postal}</p>}
                  </div>
                </div>
                <div>
                  <input placeholder="Phone Number" value={form.phone} onChange={(e) => onChange('phone', e.target.value)} onBlur={() => onBlur('phone')} className={inputCls('phone')} />
                  {errors.phone && touched.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-forest-900 text-cream-50 rounded-2xl p-6">
              <h3 className="font-serif font-semibold mb-4 text-gold-300">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-cream-100/70">Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
                {discount > 0 && (
                  <div className="flex justify-between text-gold-300"><span>Discount ({appliedCoupon?.code})</span><span>−₹{discount.toLocaleString('en-IN')}</span></div>
                )}
                <div className="flex justify-between"><span className="text-cream-100/70">Shipping</span><span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
              </div>
              <div className="border-t border-forest-700 mt-4 pt-4 flex justify-between items-baseline">
                <span className="font-serif text-lg">Total</span>
                <RollingNumber value={total} className="font-serif text-3xl font-bold" />
              </div>
              <button
                onClick={placeOrder}
                disabled={placingOrder || !isValid()}
                className="w-full mt-5 py-4 bg-gold-500 hover:bg-gold-400 disabled:opacity-50 disabled:cursor-not-allowed text-forest-950 font-semibold rounded-full transition-all flex items-center justify-center gap-2"
              >
                {placingOrder ? 'Placing order...' : (<><CreditCard className="w-5 h-5" /> Place Order</>)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
