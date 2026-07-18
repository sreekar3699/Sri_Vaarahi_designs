import { Sparkles, Instagram, Facebook, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { Page } from '../types';

export default function Footer({ navigate }: { navigate: (page: Page, opts?: { categoryId?: number }) => void }) {
  return (
    <footer className="bg-forest-950 text-cream-100 mt-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-gold-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-forest-950" />
              </div>
              <div>
                <div className="font-serif text-2xl font-bold">Vaaraahi</div>
                <div className="text-[10px] tracking-[0.3em] text-gold-400 uppercase">Silks & Couture</div>
              </div>
            </div>
            <p className="text-sm text-cream-100/70 leading-relaxed">
              Crafting timeless Indian ethnic wear since 1985. Handwoven sarees, designer lehengas, and bespoke couture for the modern woman.
            </p>
          </div>

          <div>
            <h4 className="font-serif text-lg mb-4 text-gold-300">Shop</h4>
            <ul className="space-y-2 text-sm text-cream-100/70">
              {/* Using number IDs matching backend */}
              <li><button onClick={() => navigate('shop', { categoryId: 1 })} className="hover:text-gold-300 transition-colors">Sarees</button></li>
              <li><button onClick={() => navigate('shop', { categoryId: 2 })} className="hover:text-gold-300 transition-colors">Dresses</button></li>
              <li><button onClick={() => navigate('shop', { categoryId: 6 })} className="hover:text-gold-300 transition-colors">Lehengas</button></li>
              <li><button onClick={() => navigate('shop', { categoryId: 7 })} className="hover:text-gold-300 transition-colors">Jewellery</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-lg mb-4 text-gold-300">Help</h4>
            <ul className="space-y-2 text-sm text-cream-100/70">
              <li><span className="flex items-center gap-2"><Mail className="w-4 h-4" /> hello@vaaraahi.com</span></li>
              <li><span className="flex items-center gap-2"><Phone className="w-4 h-4" /> +91 98765 43210</span></li>
              <li><span className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Kanchipuram, Tamil Nadu</span></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-lg mb-4 text-gold-300">Follow Us</h4>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 rounded-full bg-forest-800 hover:bg-gold-500 hover:text-forest-950 flex items-center justify-center transition-colors"><Instagram className="w-5 h-5" /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-forest-800 hover:bg-gold-500 hover:text-forest-950 flex items-center justify-center transition-colors"><Facebook className="w-5 h-5" /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-forest-800 hover:bg-gold-500 hover:text-forest-950 flex items-center justify-center transition-colors"><Youtube className="w-5 h-5" /></a>
            </div>
            <p className="text-xs text-cream-100/50 mt-6">Sign up for exclusive offers & new arrivals.</p>
          </div>
        </div>

        <div className="border-t border-forest-800 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-cream-100/50">© 2026 Vaaraahi Silks & Couture. Crafted with care.</p>
          <div className="flex gap-6 text-xs text-cream-100/50">
            <a href="#" className="hover:text-gold-300">Privacy</a>
            <a href="#" className="hover:text-gold-300">Terms</a>
            <a href="#" className="hover:text-gold-300">Shipping</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
