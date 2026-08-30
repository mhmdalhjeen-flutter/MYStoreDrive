'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Grid3X3,
  ShoppingCart,
  Heart,
  User,
  Search,
  Menu,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { useState } from 'react';

const navItems = [
  { href: '/', label: 'الرئيسية', icon: Home },
  { href: '/categories', label: 'التصنيفات', icon: Grid3X3 },
  { href: '/search', label: 'بحث', icon: Search },
  { href: '/cart', label: 'السلة', icon: ShoppingCart },
  { href: '/profile', label: 'حسابي', icon: User },
];

export function Header() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between gap-3">
        <Link href="/" className="font-bold text-lg text-primary-700 shrink-0">
          متجرنا
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors',
                pathname === href ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50',
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
          {isAuthenticated && (
            <Link
              href="/favorites"
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm',
                pathname === '/favorites' ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50',
              )}
            >
              <Heart className="w-4 h-4" />
              المفضلة
            </Link>
          )}
        </nav>
        <button
          type="button"
          className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="القائمة"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>
      {menuOpen && (
        <div className="md:hidden border-t bg-white px-4 py-2 space-y-1">
          {[...navItems, ...(isAuthenticated ? [{ href: '/favorites', label: 'المفضلة', icon: Heart }] : [])].map(
            ({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-gray-50"
              >
                <Icon className="w-5 h-5" />
                {label}
              </Link>
            ),
          )}
        </div>
      )}
    </header>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  const items = [
    { href: '/', icon: Home, label: 'الرئيسية' },
    { href: '/categories', icon: Grid3X3, label: 'التصنيفات' },
    { href: '/cart', icon: ShoppingCart, label: 'السلة' },
    { href: '/profile', icon: User, label: 'حسابي' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 safe-area-pb">
      <div className="flex justify-around items-center h-16">
        {items.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-col items-center gap-0.5 text-xs px-2 py-1',
              pathname === href ? 'text-primary-600' : 'text-gray-500',
            )}
          >
            <Icon className="w-5 h-5" />
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto py-8 mb-16 md:mb-0">
      <div className="container mx-auto px-4 text-center text-sm space-y-2">
        <p className="font-medium text-white">متجرنا الإلكتروني</p>
        <p>توصيل سريع لمنطقتك في غزة</p>
        <div className="flex justify-center gap-4 pt-2">
          <Link href="/support" className="hover:text-white">الدعم</Link>
          <Link href="/announcements" className="hover:text-white">الإعلانات</Link>
          <Link href="/orders" className="hover:text-white">طلباتي</Link>
        </div>
      </div>
    </footer>
  );
}

export function StoreShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <Footer />
      <MobileNav />
    </div>
  );
}
