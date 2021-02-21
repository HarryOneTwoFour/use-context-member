const fs = require('fs');

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
const { scripts, devDependencies, ...releasePackageJson } = packageJson;
fs.mkdirSync('./dist', { recursive: true });
fs.writeFileSync('./dist/package.json', JSON.stringify(releasePackageJson, null, 2));

const dts = fs.readFileSync('index.d.ts', 'utf-8');
fs.writeFileSync('./dist/cjs/index.d.ts', dts);

const readme = fs.readFileSync('README.md', 'utf-8');
fs.writeFileSync('./dist/README.md', readme);