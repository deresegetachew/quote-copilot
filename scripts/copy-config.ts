import { copyFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';

const SOURCE = join(__dirname, '..', 'libs', 'config', 'local.config.yml');
const DEST1 = join(
  __dirname,
  '..',
  'dist',
  'libs',
  'config',
  'local.config.yml',
);
const DEST2 = join(
  __dirname,
  '..',
  'dist',
  'libs',
  'config',
  'src',
  'local.config.yml',
);

function copyTo(destination: string) {
  const dir = dirname(destination);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  copyFileSync(SOURCE, destination);
  console.log(`✅ Copied to ${destination}`);
}

if (existsSync(SOURCE)) {
  copyTo(DEST1);
  copyTo(DEST2);
} else {
  console.error('❌ local.config.yml not found in libs/config');
  process.exit(1);
}
