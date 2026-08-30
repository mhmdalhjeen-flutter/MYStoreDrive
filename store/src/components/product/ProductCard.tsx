'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart } from 'lucide-react';
import type { Product } from '@/lib/types';
import { cn, formatPrice, availabilityLabel } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onToggleFavorite?: (product: Product) => void;
  isFavorite?: boolean;
  showAddButton?: boolean;
}

export function ProductCard({
  product,
  onAddToCart,
  onToggleFavorite,
  isFavorite,
  showAddButton = true,
}: ProductCardProps) {
  const image = product.images?.[0];
  const canPurchase = product.availability !== 'UNAVAILABLE' && product.isAvailable;

  return (
    <div className="card p-0 overflow-hidden flex flex-col h-full">
      <Link href={`/products/${product.id}`} className="block relative aspect-square bg-gray-100">
        {image ? (
          <Image src={image} alt={product.name} fill className="object-cover" sizes="(max-width:768px) 50vw, 25vw" />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">بدون صورة</div>
        )}
        {product.hasOffer && (
          <span className="absolute top-2 right-2 bg-error-500 text-white text-xs px-2 py-0.5 rounded-lg">عرض</span>
        )}
      </Link>
      <div className="p-3 flex flex-col flex-1 gap-2">
        <Link href={`/products/${product.id}`}>
          <h3 className="font-medium text-sm line-clamp-2 hover:text-primary-600">{product.name}</h3>
        </Link>
        <div className="flex items-center justify-between gap-2 mt-auto">
          <span className="font-bold text-primary-700">{formatPrice(product.price)} ₪</span>
          <span className="text-xs text-gray-500">{availabilityLabel(product.availability)}</span>
        </div>
        <div className="flex gap-2">
          {onToggleFavorite && (
            <button
              type="button"
              onClick={() => onToggleFavorite(product)}
              className={cn('p-2 rounded-xl border', isFavorite ? 'text-error-500 border-error-200 bg-error-50' : 'border-gray-200')}
              aria-label="مفضلة"
            >
              <Heart className={cn('w-4 h-4', isFavorite && 'fill-current')} />
            </button>
          )}
          {showAddButton && canPurchase && onAddToCart && (
            <Button
              size="sm"
              className="flex-1 text-sm"
              onClick={() => onAddToCart(product)}
              disabled={product.variants && product.variants.length > 0}
            >
              <ShoppingCart className="w-4 h-4 ml-1" />
              {product.variants && product.variants.length > 0 ? 'اختر خيار' : 'أضف'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
