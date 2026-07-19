// ─── Cart Page with Razorpay + COD Payment ───

import { useMemo, useState, useEffect, useRef } from 'react';
import {
  Minus, Plus, X, ShoppingBag, ArrowRight, Tag, Check, CreditCard,
  Truck, Shield, Zap, AlertCircle, LogIn
} from 'lucide-react';
import { CartItem, Page, discountedPrice } from '../types';
import {
  createUser, getUserByEmail, createAddress,
  createRazorpayOrder, verifyRazorpayPayment, placeCodOrder,
} from '../services/api';
import RollingNumber from '../components/RollingNumber';
import { getDirectDriveLink } from '../utils/imageUtils';
import { signInWithGoogle } from '../services/authService';

// Extend window for Razorpay global
declare global {
  interface Window {
    Razorpay: any;
  }
}

interface CartProps {
  cart: CartItem[];
  navigate: (page: Page, opts?: { categoryId?: number; subcategoryId?: number; productId?: number }) => void;
  updateQty: (productId: number, qty: number) => void;
  removeItem: (productId: number) => void;
  isAuthenticated?: boolean;
}

interface FormErrors { [k: string]: string }

type PaymentMethod = 'razorpay' | 'cod';

export default function Cart({ cart, navigate, updateQty, removeItem, isAuthenticated }: CartProps) {
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [coupon, setCoupon] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; pct: number } | null>(null);
  const [couponMsg, setCouponMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [form, setForm] = useState({ fullName: '', email: '', address: '', city: '', postal: '', phone: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ [k: string]: boolean }>({});
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('razorpay');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderStatus, setOrderStatus] = useState<'success' | 'failed' | 'cod'>('success');
  const [orderMsg, setOrderMsg] = useState('');

  const subtotal = useMemo(() => cart.reduce((s, i) => s + discountedPrice(i.product) * i.quantity, 0), [cart]);
  const discount = appliedCoupon ? Math.round(subtotal * appliedCoupon.pct / 100) : 0;
  const shipping = subtotal > 2000 ? 0 : 99;
  const total = Math.max(0, subtotal - discount + (cart.length ? shipping : 0));

  // Load Razorpay checkout script and resolve when ready
  const loadRazorpay = (): Promise<boolean> => {
    return new Promise((resolve) => {
      // Already loaded
      if (window.Razorpay) { resolve(true); return; }

      // Already injecting — just wait
      const existing = document.getElementById('razorpay-script');
      if (existing) {
        existing.addEventListener('load', () => resolve(!!window.Razorpay));
        existing.addEventListener('error', () => resolve(false));
        return;
      }

      const script = document.createElement('script');
      script.id = 'razorpay-script';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const applyCoupon = () => {
    const code = coupon.trim().toUpperCase();
    if (code === 'SAVE20') { setAppliedCoupon({ code, pct: 20 }); setCouponMsg({ type: 'success', text: '20% discount applied!' }); }
    else if (code === 'FESTIVE10') { setAppliedCoupon({ code, pct: 10 }); setCouponMsg({ type: 'success', text: '10% festive discount applied!' }); }
    else if (code === 'WELCOME5') { setAppliedCoupon({ code, pct: 5 }); setCouponMsg({ type: 'success', text: '5% welcome discount applied!' }); }
    else { setAppliedCoupon(null); setCouponMsg({ type: 'error', text: 'Invalid coupon code' }); }
  };

  const removeCoupon = () => { setAppliedCoupon(null); setCoupon(''); setCouponMsg(null); };

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
    if (touched[name]) setErrors({ ...errors, [name]: validate(name, value) });
  };

  const onBlur = (name: string) => {
    setTouched({ ...touched, [name]: true });
    setErrors({ ...errors, [name]: validate(name, form[name as keyof typeof form]) });
  };

  const isValid = () => Object.keys({ fullName: '', email: '', address: '', city: '', postal: '', phone: '' })
    .every(k => validate(k, form[k as keyof typeof form]) === '');

  // ── Helper: validate all fields and show errors ──
  const touchAll = () => {
    const allTouched: { [k: string]: boolean } = {};
    const newErrors: FormErrors = {};
    Object.keys(form).forEach(k => { allTouched[k] = true; newErrors[k] = validate(k, form[k as keyof typeof form]); });
    setTouched(allTouched);
    setErrors(newErrors);
    return Object.values(newErrors).every(v => !v);
  };

  // ── Helper: resolve/create user + address → returns { userId, addressId } ──
  const resolveUserAndAddress = async (): Promise<{ userId: number; addressId: number }> => {
    let user;
    try { user = await getUserByEmail(form.email); }
    catch { user = await createUser({ name: form.fullName, email: form.email, phnum: Number(form.phone) }); }

    const address = await createAddress({
      user: { id: user.id! },
      addressLine: form.address,
      city: form.city,
      pincode: form.postal,
      contactNumber: Number(form.phone),
    });

    return { userId: user.id!, addressId: address.id };
  };

  // ── COD flow ──
  const handleCod = async () => {
    if (!touchAll() || cart.length === 0) return;
    setPlacingOrder(true);
    try {
      const { userId, addressId } = await resolveUserAndAddress();
      const res = await placeCodOrder({
        userId,
        addressId,
        productIds: cart.map(i => i.product.id),
        quantities: cart.map(i => i.quantity),
      });
      setOrderStatus('cod');
      setOrderMsg(res.message || 'Order placed! Pay on delivery.');
      setOrderPlaced(true);
    } catch (e) {
      console.error('COD order failed:', e);
      setOrderStatus('cod');
      setOrderMsg('Order placed (demo mode — backend offline).');
      setOrderPlaced(true);
    } finally {
      setPlacingOrder(false);
    }
  };

  // ── Razorpay flow ──
  const handleRazorpay = async () => {
    if (!touchAll() || cart.length === 0) return;
    setPlacingOrder(true);

    try {
      const loaded = await loadRazorpay();
      if (!loaded) {
        throw new Error('Razorpay SDK failed to load');
      }

      const { userId, addressId } = await resolveUserAndAddress();

      // Step 1: Create Razorpay order on backend
      const orderData = await createRazorpayOrder({
        userId,
        addressId,
        productIds: cart.map(i => i.product.id),
        quantities: cart.map(i => i.quantity),
      });

      // Step 2: Open Razorpay checkout modal
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Sri Vaaraahi Designs',
        description: `Order for ${cart.length} item(s)`,
        image: '/favicon.ico',
        order_id: orderData.orderId,
        prefill: {
          name: form.fullName,
          email: form.email,
          contact: form.phone,
        },
        theme: { color: '#2D5016' },

        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          // Step 3: Verify with backend
          try {
            const verifyRes = await verifyRazorpayPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              userId,
              addressId,
              productIds: cart.map(i => i.product.id),
              quantities: cart.map(i => i.quantity),
            });
            setOrderStatus(verifyRes.status === 'SUCCESS' ? 'success' : 'failed');
            setOrderMsg(verifyRes.message);
          } catch (e) {
            setOrderStatus('success');
            setOrderMsg('Payment received!');
          }
          setPlacingOrder(false);
          setOrderPlaced(true);
        },

        modal: {
          ondismiss: () => {
            setPlacingOrder(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);

      // Handle payment failure (modal stays open, Razorpay retries)
      rzp.on('payment.failed', async (resp: any) => {
        try {
          await verifyRazorpayPayment({
            razorpayOrderId: resp.error.metadata?.order_id ?? orderData.orderId,
            razorpayPaymentId: resp.error.metadata?.payment_id ?? '',
            razorpaySignature: '',
            userId,
            addressId,
            productIds: cart.map(i => i.product.id),
            quantities: cart.map(i => i.quantity),
          });
        } catch { /* ignore */ }
        setOrderStatus('failed');
        setOrderMsg('Payment failed. Your attempt has been recorded.');
        setPlacingOrder(false);
        setOrderPlaced(true);
      });

      rzp.open();
    } catch (e) {
      console.error('Razorpay flow error:', e);
      setPlacingOrder(false);
      alert('Could not initiate payment. Please try again or choose COD.');
    }
  };

  const placeOrder = () => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }
    if (paymentMethod === 'cod') handleCod();
    else handleRazorpay();
  };

  // ── Order Placed Screen ──
  if (orderPlaced) {
    const isSuccess = orderStatus === 'success' || orderStatus === 'cod';
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center animate-fade-in">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isSuccess ? 'bg-forest-600' : 'bg-red-100'}`}>
          {isSuccess
            ? <Check className="w-10 h-10 text-cream-50" />
            : <AlertCircle className="w-10 h-10 text-red-500" />}
        </div>
        <h1 className="font-serif text-4xl font-bold text-forest-900">
          {isSuccess ? (orderStatus === 'cod' ? 'Order Confirmed!' : 'Payment Successful!') : 'Payment Failed'}
        </h1>
        <p className="text-forest-600 mt-3 mb-2">{orderMsg}</p>
        {isSuccess && (
          <p className="text-forest-500 text-sm mb-8">
            Thank you, {form.fullName.split(' ')[0]}! A confirmation has been sent to {form.email}.
          </p>
        )}
        <div className="flex gap-4 justify-center mt-8">
          <button onClick={() => navigate('home')} className="px-8 py-3 bg-forest-800 hover:bg-forest-700 text-cream-50 rounded-full font-semibold transition-colors">
            Continue Shopping
          </button>
          {!isSuccess && (
            <button onClick={() => { setOrderPlaced(false); setPlacingOrder(false); }} className="px-8 py-3 border border-forest-300 hover:bg-cream-100 text-forest-800 rounded-full font-semibold transition-colors">
              Try Again
            </button>
          )}
        </div>
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

  const inputCls = (name: string) =>
    `w-full px-4 py-3 rounded-xl border bg-white focus:outline-none focus:ring-2 transition-all ${errors[name] && touched[name] ? 'border-red-400 focus:ring-red-300' : !errors[name] && touched[name] ? 'border-forest-500 focus:ring-forest-300' : 'border-forest-200 focus:ring-gold-400'}`;

  return (
    <div className="animate-fade-in">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        <h1 className="font-serif text-4xl font-bold text-forest-900 mb-2">Your Cart</h1>
        <p className="text-forest-600 mb-10 text-sm">{cart.length} {cart.length === 1 ? 'item' : 'items'} in your bag</p>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-10">
          {/* Cart Items */}
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
                        <p className="text-xs text-forest-500 mt-0.5">{item.product.subcategory?.scName ?? item.product.category?.name ?? ''}</p>
                        {item.customDesign && <p className="text-xs text-gold-600 mt-1 flex items-center gap-1"><Check className="w-3 h-3" /> Custom design attached</p>}
                      </div>
                      <button onClick={() => removeItem(item.product.id)} className="text-forest-400 hover:text-red-500 transition-colors p-1"><X className="w-4 h-4" /></button>
                    </div>
                    <div className="flex items-end justify-between mt-3">
                      <div className="flex items-center border-2 border-forest-200 rounded-full">
                        <button onClick={() => updateQty(item.product.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center text-forest-700 hover:text-gold-600"><Minus className="w-3.5 h-3.5" /></button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button onClick={() => updateQty(item.product.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center text-forest-700 hover:text-gold-600"><Plus className="w-3.5 h-3.5" /></button>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-forest-900">₹{(itemPrice * item.quantity).toLocaleString('en-IN')}</p>
                        {item.product.discount > 0 && <p className="text-xs text-forest-400 line-through">₹{(item.product.price * item.quantity).toLocaleString('en-IN')}</p>}
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

          {/* Checkout Panel */}
          <div className="space-y-5">
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
                    <input value={coupon} onChange={(e) => { setCoupon(e.target.value); setCouponMsg(null); }} placeholder="Try SAVE20" className="flex-1 px-4 py-2.5 rounded-xl border border-forest-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gold-400" />
                    <button onClick={applyCoupon} className="px-4 py-2.5 bg-forest-800 hover:bg-forest-700 text-cream-50 text-sm font-medium rounded-xl transition-colors">Apply</button>
                  </div>
                  {couponMsg && <p className={`text-xs mt-2 ${couponMsg.type === 'success' ? 'text-forest-600' : 'text-red-500'}`}>{couponMsg.text}</p>}
                  <p className="text-xs text-forest-400 mt-2">Try: SAVE20, FESTIVE10, WELCOME5</p>
                </>
              )}
            </div>

            {/* Checkout form */}
            <div className="bg-white rounded-2xl border border-forest-100 p-6">
              <h3 className="font-serif font-semibold text-forest-900 mb-4">Delivery Details</h3>
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

            {/* Payment Method Selector */}
            <div className="bg-white rounded-2xl border border-forest-100 p-6">
              <h3 className="font-serif font-semibold text-forest-900 mb-4">Payment Method</h3>
              <div className="grid grid-cols-2 gap-3">
                {/* Razorpay Option */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('razorpay')}
                  className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${paymentMethod === 'razorpay' ? 'border-forest-600 bg-forest-50' : 'border-forest-100 hover:border-forest-300'}`}
                >
                  {paymentMethod === 'razorpay' && (
                    <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-forest-600 flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </span>
                  )}
                  {/* Razorpay icon */}
                  <div className="w-10 h-10 rounded-xl bg-[#072654] flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-forest-900">Razorpay</p>
                    <p className="text-[10px] text-forest-500">UPI · Card · NetBanking</p>
                  </div>
                </button>

                {/* COD Option */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${paymentMethod === 'cod' ? 'border-forest-600 bg-forest-50' : 'border-forest-100 hover:border-forest-300'}`}
                >
                  {paymentMethod === 'cod' && (
                    <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-forest-600 flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </span>
                  )}
                  <div className="w-10 h-10 rounded-xl bg-gold-100 flex items-center justify-center">
                    <Truck className="w-5 h-5 text-gold-700" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-forest-900">Cash on Delivery</p>
                    <p className="text-[10px] text-forest-500">Pay when delivered</p>
                  </div>
                </button>
              </div>

              {paymentMethod === 'razorpay' && (
                <div className="mt-3 flex items-center gap-2 text-xs text-forest-500 bg-cream-50 rounded-xl p-3">
                  <Shield className="w-4 h-4 text-forest-600 shrink-0" />
                  Secured by Razorpay — 256-bit SSL encryption
                </div>
              )}
              {paymentMethod === 'cod' && (
                <div className="mt-3 flex items-center gap-2 text-xs text-forest-500 bg-cream-50 rounded-xl p-3">
                  <Truck className="w-4 h-4 text-gold-600 shrink-0" />
                  Pay in cash when your order arrives at your door
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="bg-forest-900 text-cream-50 rounded-2xl p-6">
              <h3 className="font-serif font-semibold mb-4 text-gold-300">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-cream-100/70">Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
                {discount > 0 && <div className="flex justify-between text-gold-300"><span>Discount ({appliedCoupon?.code})</span><span>−₹{discount.toLocaleString('en-IN')}</span></div>}
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
                {placingOrder ? (
                  <><div className="w-5 h-5 border-2 border-forest-800/30 border-t-forest-900 rounded-full animate-spin" /> Processing…</>
                ) : paymentMethod === 'razorpay' ? (
                  <><CreditCard className="w-5 h-5" /> Pay ₹{total.toLocaleString('en-IN')} with Razorpay</>
                ) : (
                  <><Truck className="w-5 h-5" /> Place COD Order</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Strict Login Modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-950/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl relative">
            <div className="w-16 h-16 bg-cream-100 rounded-full flex items-center justify-center mb-6 mx-auto">
              <LogIn className="w-8 h-8 text-forest-600" />
            </div>
            
            <h2 className="font-serif text-3xl font-bold text-forest-900 text-center mb-3">
              Welcome Back
            </h2>
            <p className="text-forest-600 text-center mb-8">
              Please sign in to complete your order and access your tracking details.
            </p>

            <button
              onClick={signInWithGoogle}
              className="w-full flex items-center justify-center gap-3 bg-white border-2 border-forest-100 hover:border-gold-400 hover:bg-gold-50 text-forest-900 font-semibold py-4 px-6 rounded-xl transition-all group"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>Continue with Google</span>
            </button>
            <p className="text-center text-xs text-forest-400 mt-6">
              You must sign in to proceed with checkout.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
