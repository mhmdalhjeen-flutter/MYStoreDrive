import { Suspense } from 'react';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <section className="bg-gradient-to-b from-primary-50 to-white py-12 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            متجر إلكتروني حديث
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            تسوق بسهولة واطلب منتجاتك المفضلة مع توصيل سريع لمنطقتك
          </p>
          <button className="btn-primary text-lg px-8 py-4">
            تصفح المنتجات
          </button>
        </div>
      </section>

      <Suspense fallback={<StoreClosedState />}>
        <StoreStatusSection />
      </Suspense>
    </main>
  );
}

function StoreClosedState() {
  return (
    <div className="skeleton h-16 w-full max-w-4xl mx-auto my-8" />
  );
}

async function StoreStatusSection() {
  // Placeholder for store status fetch
  // In real implementation, fetch from API
  return null;
}
