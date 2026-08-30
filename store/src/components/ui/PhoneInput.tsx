'use client';

import { cn, formatPhoneIndicator } from '@/lib/utils';
import { Input } from './Input';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export function PhoneInput({ value, onChange, error, disabled }: PhoneInputProps) {
  const indicator = formatPhoneIndicator(value);

  return (
    <div>
      <div className="relative">
        <Input
          type="tel"
          inputMode="numeric"
          placeholder="0591234567"
          value={value}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, '').slice(0, 10);
            onChange(v);
          }}
          className="ltr-input pl-10"
          disabled={disabled}
          dir="ltr"
        />
        {indicator && (
          <span
            className={cn(
              'absolute left-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full',
              indicator === 'green' ? 'bg-phone-green' : 'bg-phone-red',
            )}
            title={indicator === 'green' ? '059' : '056'}
          />
        )}
      </div>
      {error && <p className="text-error-600 text-sm mt-1">{error}</p>}
      <p className="text-xs text-gray-500 mt-1">يجب أن يبدأ الرقم بـ 059 أو 056</p>
    </div>
  );
}
