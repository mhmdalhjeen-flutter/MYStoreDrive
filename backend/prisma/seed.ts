import { PrismaClient, Prisma, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create default admin user
  const adminPassword = await bcrypt.hash('admin123456', 12);

  await prisma.user.upsert({
    where: { email: 'admin@store.com' },
    update: {},
    create: {
      phoneNumber: '0590000000',
      email: 'admin@store.com',
      name: 'مدير النظام',
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
      isPhoneVerified: true,
    },
  });

  // Create default settings
  const existingSettings = await prisma.settings.findFirst();
  await prisma.settings.upsert({
    where: { id: existingSettings?.id ?? 'default' },
    update: {},
    create: {
      id: 'default',
      storeName: 'متجر إلكتروني',
      storeNameEn: 'Online Store',
      isStoreOpen: true,
      freeDeliveryTarget: new Prisma.Decimal(10),
      partialFreeDeliveryEnabled: false,
      partialFreeDeliveryThreshold: new Prisma.Decimal(5),
      partialFreeDeliveryDiscount: 50,
      paymentInstructions: 'يرجى التحويل إلى الحساب التالي وإرسال صورة الإيصال',
      paymentAccountDetails: 'بنك فلسطين - حساب رقم: 1234567890',
    },
  });

  // Create sample delivery areas
  const deliveryAreas = [
    { name: 'رفديا', deliveryFee: 15, eligibleForFreeDelivery: true },
    { name: 'المنطقة الجنوبية', deliveryFee: 20, eligibleForFreeDelivery: true },
    { name: 'المنطقة الشمالية', deliveryFee: 10, eligibleForFreeDelivery: true },
    { name: 'منطقة بعيدة', deliveryFee: 25, eligibleForFreeDelivery: false },
  ];

  for (const area of deliveryAreas) {
    const id = `area-${area.name}`;
    await prisma.deliveryArea.upsert({
      where: { id },
      update: {},
      create: {
        id,
        name: area.name,
        deliveryFee: new Prisma.Decimal(area.deliveryFee),
        eligibleForFreeDelivery: area.eligibleForFreeDelivery,
        isActive: true,
      },
    });
  }

  // Create sample categories
  const categories = [
    { name: 'إلكترونيات', slug: 'electronics', description: 'منتجات إلكترونية' },
    { name: 'ملابس', slug: 'clothing', description: 'ملابس رجالية ونسائية' },
    { name: 'منزل', slug: 'home', description: 'منتجات منزلية' },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: {
        name: category.name,
        nameEn: category.name,
        slug: category.slug,
        description: category.description,
        isActive: true,
      },
    });
  }

  console.log('✅ Database seed completed successfully');
}

main()
  .catch((error) => {
    console.error('❌ Database seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
