// ─── Profile Page ───
// Shows logged-in user's details. Accessible by clicking the profile icon in Navbar.

import { User, Phone, Mail, LogOut, Sparkles } from 'lucide-react';
import { Page } from '../types';
import { AuthUser, logout } from '../services/authService';

interface ProfileProps {
  navigate: (page: Page) => void;
  authUser: AuthUser;
  onLogout: () => void;
}

export default function Profile({ navigate, authUser, onLogout }: ProfileProps) {
  const handleLogout = async () => {
    await logout();
    onLogout();
    navigate('home');
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-6 py-16 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl border border-forest-100 p-8">
          {/* Avatar & Name */}
          <div className="text-center mb-8">
            {authUser.picture ? (
              <img
                src={authUser.picture}
                alt={authUser.name}
                className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-gold-200 shadow-md object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-forest-800 flex items-center justify-center mx-auto mb-4">
                <User className="w-10 h-10 text-gold-400" />
              </div>
            )}
            <h1 className="font-serif text-2xl font-bold text-forest-900">{authUser.name}</h1>
            <p className="text-xs text-gold-600 uppercase tracking-widest mt-1 flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3" /> Vaaraahi Member
            </p>
          </div>

          {/* Details card */}
          <div className="space-y-3 mb-8">
            <div className="flex items-center gap-3 p-4 bg-cream-50 rounded-xl border border-forest-100">
              <Mail className="w-5 h-5 text-forest-500 shrink-0" />
              <div>
                <p className="text-xs text-forest-400 uppercase tracking-wide">Email</p>
                <p className="text-sm font-medium text-forest-900">{authUser.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-cream-50 rounded-xl border border-forest-100">
              <Phone className="w-5 h-5 text-forest-500 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-forest-400 uppercase tracking-wide">Mobile</p>
                {authUser.phone ? (
                  <p className="text-sm font-medium text-forest-900">+91 {authUser.phone}</p>
                ) : (
                  <button
                    onClick={() => navigate('phone-registration')}
                    className="text-sm font-medium text-gold-600 hover:text-gold-700 transition-colors"
                  >
                    Add mobile number →
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full py-3.5 border-2 border-red-200 hover:border-red-400 hover:bg-red-50 rounded-xl font-medium text-red-600 flex items-center justify-center gap-2 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
