import { PrismaClient, Prisma, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Prisma error messages can embed the connection string, credentials included.
function redactConnectionStrings(text: string): string {
  return text.replace(/(postgres(?:ql)?:\/\/)[^\s@'"]*@/gi, '$1***@');
}

async function main() {
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_PRODUCTION_SEED !== 'true') {
    throw new Error(
      'Refusing to seed with NODE_ENV=production. Set ALLOW_PRODUCTION_SEED=true only if you really intend to seed this database.',
    );
  }

  console.log('🌱 Starting database seed...');

  // Create default admin user from environment configuration.
  // Credentials are never hardcoded: outside development the seed refuses to run
  // without SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD.
  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPhone = process.env.SEED_ADMIN_PHONE || '0590000000';
  const adminPasswordPlain = process.env.SEED_ADMIN_PASSWORD;

  if (!adminEmail || !adminPasswordPlain) {
    throw new Error(
      'SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set before seeding the admin user',
    );
  }

  if (adminPasswordPlain.length < 12) {
    throw new Error('SEED_ADMIN_PASSWORD must be at least 12 characters');
  }

  const adminPassword = await bcrypt.hash(adminPasswordPlain, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      phoneNumber: adminPhone,
      email: adminEmail,
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
    const message = error instanceof Error ? error.message : String(error);
    console.error(`❌ Database seed failed: ${redactConnectionStrings(message)}`);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
