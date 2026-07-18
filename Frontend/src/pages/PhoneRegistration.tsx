// ─── Phone Registration Page ───
// Shown immediately after successful Google OAuth2 login if user has no phone number.

import { useState } from 'react';
import { Phone, ArrowRight, Sparkles } from 'lucide-react';
import { Page } from '../types';
import { savePhoneNumber } from '../services/authService';

interface PhoneRegistrationProps {
  navigate: (page: Page) => void;
  onPhoneSaved: (phone: string) => void;
  userName: string;
}

export default function PhoneRegistration({ navigate, onPhoneSaved, userName }: PhoneRegistrationProps) {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validate = (value: string) => {
    if (!/^\d{10}$/.test(value)) return 'Enter a valid 10-digit mobile number';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate(phone);
    if (err) { setError(err); return; }

    setIsLoading(true);
    const success = await savePhoneNumber(phone);
    setIsLoading(false);

    if (success) {
      onPhoneSaved(phone);
      navigate('home');
    } else {
      // Even if save fails, let them through — backend can be retried later
      onPhoneSaved(phone);
      navigate('home');
    }
  };

  const skip = () => {
    navigate('home');
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-6 py-16 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl border border-forest-100 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-forest-800 flex items-center justify-center mx-auto mb-4">
              <Phone className="w-8 h-8 text-gold-400" />
            </div>
            <h1 className="font-serif text-3xl font-bold text-forest-900">
              Welcome, {userName.split(' ')[0]}! 🎉
            </h1>
            <p className="text-sm text-forest-500 mt-2">
              Add your mobile number to track orders and get exclusive offers
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Phone input */}
            <div>
              <label className="block text-sm font-medium text-forest-700 mb-1.5">
                Mobile Number
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-forest-500 font-medium">+91</span>
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={phone}
                  onChange={e => { setPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); setError(''); }}
                  className={`w-full pl-14 pr-4 py-3.5 rounded-xl border bg-cream-50 focus:outline-none focus:ring-2 transition-all text-forest-900 tracking-widest ${
                    error ? 'border-red-400 focus:ring-red-300' : 'border-forest-200 focus:ring-gold-400 focus:bg-white'
                  }`}
                />
              </div>
              {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-forest-800 hover:bg-forest-700 disabled:opacity-50 text-cream-50 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 group"
            >
              {isLoading ? 'Saving...' : 'Continue'}
              {!isLoading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </button>

            {/* Skip */}
            <button
              type="button"
              onClick={skip}
              className="w-full py-2 text-sm text-forest-500 hover:text-forest-700 transition-colors"
            >
              Skip for now
            </button>
          </form>

          <p className="flex items-center justify-center gap-1.5 text-xs text-forest-400 mt-6">
            <Sparkles className="w-3.5 h-3.5" /> Your number is used only for order updates
          </p>
        </div>
      </div>
    </div>
  );
}
