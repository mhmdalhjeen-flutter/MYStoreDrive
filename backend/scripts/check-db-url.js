const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
  console.log('NO_ENV_FILE');
  process.exit(0);
}

const content = fs.readFileSync(envPath, 'utf8');
const match = content.match(/^DATABASE_URL=(.+)$/m);
if (!match) {
  console.log('NO_DATABASE_URL');
  process.exit(0);
}

let value = match[1].trim();
if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
  value = value.slice(1, -1);
}

try {
  const url = new URL(value);
  console.log('DB_HOST=' + url.hostname);
  console.log('DB_SSL=' + (url.searchParams.get('sslmode') || 'default'));
  console.log('IS_LOCAL=' + (url.hostname === 'localhost' || url.hostname === '127.0.0.1'));
} catch {
  console.log('DB_URL_INVALID');
}
