'use client';

import { cn } from '@/lib/utils';
import { Truck } from 'lucide-react';
import type { FreeDeliverySummary } from '@/lib/types';

interface FreeDeliveryProgressProps {
  summary: Pick<
    FreeDeliverySummary,
    | 'displayedScore'
    | 'target'
    | 'progressPercentage'
    | 'remainingScore'
    | 'isFreeDelivery'
    | 'isPartialFreeDelivery'
    | 'partialDiscount'
    | 'deliveryFee'
    | 'deliveryDiscount'
  >;
  compact?: boolean;
  className?: string;
}

export function FreeDeliveryProgress({ summary, compact, className }: FreeDeliveryProgressProps) {
  const pct = Math.min(100, summary.progressPercentage);
  const achieved = summary.isFreeDelivery;

  return (
    <div className={cn('rounded-xl bg-primary-50 p-3 border border-primary-100', className)}>
      <div className="flex items-center gap-2 mb-2">
        <Truck className={cn('w-5 h-5', achieved ? 'text-success-600' : 'text-primary-600')} />
        <span className="text-sm font-medium">
          {achieved
            ? '🎉 توصيل مجاني!'
            : summary.isPartialFreeDelivery
              ? `خصم توصيل ${summary.partialDiscount}%`
              : 'تقدم التوصيل المجاني'}
        </span>
      </div>
      {!compact && (
        <>
          <div className="h-2.5 bg-white rounded-full overflow-hidden mb-1">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                achieved ? 'bg-success-500 animate-pulse' : 'bg-primary-500',
              )}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-600">
            <span>
              🚚 {summary.displayedScore} / {summary.target}
            </span>
            {!achieved && summary.remainingScore > 0 && (
              <span>متبقي {summary.remainingScore.toFixed(1)}</span>
            )}
          </div>
        </>
      )}
      {(summary.deliveryDiscount > 0 || summary.deliveryFee === 0) && !compact && (
        <p className="text-xs text-success-600 mt-1">
          {summary.deliveryFee === 0
            ? 'رسوم التوصيل: مجاني'
            : `خصم التوصيل: ${summary.deliveryDiscount.toFixed(2)} ₪`}
        </p>
      )}
    </div>
  );
}
