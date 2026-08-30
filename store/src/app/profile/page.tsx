'use client';

import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { storeApi } from '@/lib/store-api';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { useAuthStore } from '@/stores/auth-store';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { formatPhoneIndicator, getErrorMessage } from '@/lib/utils';
import { useToastStore } from '@/stores/toast-store';
import { useState } from 'react';
import {
  Heart,
  LogOut,
  MessageCircle,
  Package,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
  const { isAuthenticated, user, logout, setUser } = useAuthStore();
  const toast = useToastStore((s) => s.show);
  const qc = useQueryClient();
  const [name, setName] = useState('');
  const [editing, setEditing] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: storeApi.getProfile,
    enabled: isAuthenticated,
  });

  const updateProfile = useMutation({
    mutationFn: () => storeApi.updateProfile({ name }),
    onSuccess: (updated) => {
      setUser(updated);
      setEditing(false);
      toast('تم تحديث الملف الشخصي', 'success');
      qc.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (e) => toast(getErrorMessage(e), 'error'),
  });

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-10 text-center">
        <p className="mb-4">يرجى تسجيل الدخول</p>
        <Link href="/auth/login"><Button>تسجيل الدخول</Button></Link>
      </div>
    );
  }

  const phone = profile?.phoneNumber ?? user?.phoneNumber ?? '';
  const indicator = formatPhoneIndicator(phone);

  const links = [
    { href: '/orders', icon: Package, label: 'طلباتي' },
    { href: '/favorites', icon: Heart, label: 'المفضلة' },
    { href: '/support', icon: MessageCircle, label: 'الدعم' },
  ];

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-6 max-w-lg">
        <h1 className="text-2xl font-bold mb-6">حسابي</h1>
        <div className="card mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="w-7 h-7 text-primary-600" />
            </div>
            <div>
              <p className="font-medium">{profile?.name || user?.name || 'عميل'}</p>
              <p className="text-sm text-gray-500 ltr-input flex items-center gap-2" dir="ltr">
                {indicator && (
                  <span className={cn('w-2 h-2 rounded-full', indicator === 'green' ? 'bg-phone-green' : 'bg-phone-red')} />
                )}
                {phone}
              </p>
            </div>
          </div>
          {editing ? (
            <div className="space-y-2">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="الاسم" />
              <div className="flex gap-2">
                <Button size="sm" loading={updateProfile.isPending} onClick={() => updateProfile.mutate()}>حفظ</Button>
                <Button size="sm" variant="secondary" onClick={() => setEditing(false)}>إلغاء</Button>
              </div>
            </div>
          ) : (
            <Button size="sm" variant="outline" onClick={() => { setName(profile?.name ?? ''); setEditing(true); }}>
              تعديل الاسم
            </Button>
          )}
        </div>

        <div className="space-y-2 mb-6">
          {links.map(({ href, icon: Icon, label }) => (
            <Link key={href} href={href} className="card flex items-center gap-3 hover:shadow-card-hover py-3">
              <Icon className="w-5 h-5 text-primary-600" />
              <span>{label}</span>
            </Link>
          ))}
        </div>

        <Button
          variant="danger"
          className="w-full"
          onClick={() => {
            logout();
            toast('تم تسجيل الخروج', 'info');
          }}
        >
          <LogOut className="w-4 h-4 ml-2" />
          تسجيل الخروج
        </Button>
      </div>
    </AuthGuard>
  );
}
