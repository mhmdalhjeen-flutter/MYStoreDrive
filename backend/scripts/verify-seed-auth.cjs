const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");
const http = require("http");

function loadEnv() {
  const envPath = path.join(__dirname, "../.env");
  const content = fs.readFileSync(envPath, "utf8");
  const env = {};
  for (const line of content.split("\n")) {
    const m = line.match(/^([A-Z_]+)="?(.*?)"?\s*$/);
    if (m) env[m[1]] = m[2];
  }
  return env;
}

function postJson(url, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const u = new URL(url);
    const req = http.request(
      {
        hostname: u.hostname,
        port: u.port,
        path: u.pathname,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(data),
        },
      },
      (res) => {
        let raw = "";
        res.on("data", (c) => (raw += c));
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(raw) });
          } catch {
            resolve({ status: res.statusCode, body: raw });
          }
        });
      },
    );
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

function getJson(url, token) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = http.request(
      {
        hostname: u.hostname,
        port: u.port,
        path: u.pathname,
        method: "GET",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      },
      (res) => {
        let raw = "";
        res.on("data", (c) => (raw += c));
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(raw) });
          } catch {
            resolve({ status: res.statusCode, body: raw });
          }
        });
      },
    );
    req.on("error", reject);
    req.end();
  });
}

async function main() {
  const env = loadEnv();
  const email = env.SEED_ADMIN_EMAIL;
  const password = env.SEED_ADMIN_PASSWORD;
  if (!email || !password) {
    console.error("missing seed credentials in .env");
    process.exit(1);
  }

  const prisma = new PrismaClient();
  try {
    const admin = await prisma.user.findFirst({
      where: { email, role: "ADMIN" },
      select: { id: true, email: true, role: true, name: true },
    });
    console.log("admin_user:", admin ? "found" : "missing");
    if (admin) console.log("admin_email:", admin.email, "role:", admin.role);

    const [categories, areas, settings] = await Promise.all([
      prisma.category.count(),
      prisma.deliveryArea.count(),
      prisma.settings.count(),
    ]);
    console.log("seed_counts:", { categories, areas, settings });
  } finally {
    await prisma.$disconnect();
  }

  const login = await postJson("http://localhost:3001/api/auth/admin/login", {
    email,
    password,
  });
  console.log("admin_login_status:", login.status);
  const token = login.body?.data?.accessToken;
  console.log("admin_login_token:", token ? "received" : "missing");

  if (token) {
    const settingsRes = await getJson(
      "http://localhost:3001/api/admin/settings",
      token,
    );
    console.log("admin_settings_status:", settingsRes.status);
    const analyticsRes = await getJson(
      "http://localhost:3001/api/admin/analytics/overview",
      token,
    );
    console.log("admin_analytics_status:", analyticsRes.status);
  }
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
