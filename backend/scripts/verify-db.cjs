const { PrismaClient } = require("@prisma/client");

async function main() {
  const prisma = new PrismaClient();
  try {
    await prisma.$queryRaw`SELECT 1 as ok`;
    const tables = await prisma.$queryRaw`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename
    `;
    console.log("connection: ok");
    console.log("tables:", tables.map((t) => t.tablename).join(", "));
    const users = await prisma.user.count();
    const migrations = await prisma.$queryRaw`
      SELECT migration_name, finished_at FROM _prisma_migrations ORDER BY finished_at
    `;
    console.log("user_count:", users);
    console.log("migrations:", JSON.stringify(migrations));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
