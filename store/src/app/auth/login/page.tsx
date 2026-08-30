'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { storeApi } from '@/lib/store-api';
import { useAuthStore } from '@/stores/auth-store';
import { useToastStore } from '@/stores/toast-store';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { getErrorMessage } from '@/lib/utils';

export default function LoginPage() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const setAuth = useAuthStore((s) => s.setAuth);
  const toast = useToastStore((s) => s.show);
  const router = useRouter();

  const validatePhone = () => {
    if (!/^(059|056)\d{7}$/.test(phone)) {
      setPhoneError('رقم الهاتف غير صحيح');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const sendOtp = async () => {
    if (!validatePhone()) return;
    setLoading(true);
    try {
      await storeApi.sendOtp(phone);
      setStep('otp');
      toast('تم إرسال رمز التحقق', 'success');
    } catch (e) {
      toast(getErrorMessage(e), 'error');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (otp.length !== 6) {
      toast('أدخل رمز مكون من 6 أرقام', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await storeApi.verifyOtp(phone, otp);
      setAuth(res.user, res.accessToken, res.refreshToken);
      toast('تم تسجيل الدخول بنجاح', 'success');
      router.push('/');
    } catch (e) {
      toast(getErrorMessage(e), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-md">
      <div className="card">
        <h1 className="text-2xl font-bold text-center mb-6">تسجيل الدخول</h1>
        {step === 'phone' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">رقم الهاتف</label>
              <PhoneInput value={phone} onChange={setPhone} error={phoneError} disabled={loading} />
            </div>
            <Button className="w-full" loading={loading} onClick={sendOtp}>
              إرسال رمز التحقق
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 text-center">تم الإرسال إلى {phone}</p>
            <div>
              <label className="block text-sm font-medium mb-2">رمز التحقق</label>
              <Input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="ltr-input text-center text-xl tracking-widest"
                dir="ltr"
                disabled={loading}
              />
            </div>
            <Button className="w-full" loading={loading} onClick={verifyOtp}>
              تأكيد
            </Button>
            <button type="button" className="w-full text-sm text-primary-600" onClick={() => setStep('phone')}>
              تغيير رقم الهاتف
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
