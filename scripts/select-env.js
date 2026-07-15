const fs = require('fs');
const path = require('path');

const variant = process.argv[2];

const ENV_FILES = {
  simulator: 'env.simulator.local',
  device: 'env.device.local',
};

if (!variant || !ENV_FILES[variant]) {
  console.error(
    `Usage: node ./scripts/select-env.js <${Object.keys(ENV_FILES).join('|')}>`,
  );
  process.exit(1);
}

const projectRoot = path.resolve(__dirname, '..');
const sourcePath = path.join(projectRoot, ENV_FILES[variant]);
const targetPath = path.join(projectRoot, '.env.local');

if (!fs.existsSync(sourcePath)) {
  console.error(
    `Missing ${ENV_FILES[variant]}. Create it first before selecting the ${variant} environment.`,
  );
  process.exit(1);
}

fs.copyFileSync(sourcePath, targetPath);
console.log(`Using ${ENV_FILES[variant]} -> .env.local`);
