import { copyFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { glob } from 'glob';

async function copyAssets() {
  try {
    const files = await glob('**/*.hbs', {
      ignore: ['node_modules/**', 'dist/**'],
    });
    console.log('ℹ️ Matched files:', files);

    // Copy .hbs files
    files.forEach((file) => {
      const destination = join('dist', file);
      const destinationDir = dirname(destination);

      if (!existsSync(destinationDir)) {
        mkdirSync(destinationDir, { recursive: true });
      }

      copyFileSync(file, destination);
      console.log(`✅ Copied ${file} to ${destination}`);
    });

    // Copy local.config.yml
    const configFile = join('libs', 'config', 'local.config.yml');
    if (existsSync(configFile)) {
      const configDestination = join('dist', configFile);
      const configDestinationDir = dirname(configDestination);

      if (!existsSync(configDestinationDir)) {
        mkdirSync(configDestinationDir, { recursive: true });
      }

      copyFileSync(configFile, configDestination);
      console.log(`✅ Copied ${configFile} to ${configDestination}`);
    } else {
      console.warn(`⚠️ ${configFile} does not exist.`);
    }
  } catch (error) {
    console.error('❌ Error finding files:', error);
  }
}

copyAssets();
