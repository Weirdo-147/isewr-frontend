const { execSync } = require('child_process');
const fs = require('fs');

// List of essential dependencies to check
const essentialDeps = [
  'axios',
  'react',
  'react-dom',
  'react-router-dom',
  'react-hot-toast'
];

console.log('Checking for missing dependencies...');

// Read package.json
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
const installedDeps = Object.keys(packageJson.dependencies || {});

// Find missing dependencies
const missingDeps = essentialDeps.filter(dep => !installedDeps.includes(dep));

if (missingDeps.length > 0) {
  console.log(`Installing missing dependencies: ${missingDeps.join(', ')}`);
  
  try {
    // Install missing dependencies
    execSync(`npm install --no-save ${missingDeps.join(' ')}`, { stdio: 'inherit' });
    console.log('Successfully installed missing dependencies.');
  } catch (error) {
    console.error('Error installing dependencies:', error.message);
    process.exit(1);
  }
} else {
  console.log('All essential dependencies are installed.');
}

// Make sure node_modules exists
if (!fs.existsSync('./node_modules')) {
  console.log('node_modules not found, running npm install');
  try {
    execSync('npm install', { stdio: 'inherit' });
  } catch (error) {
    console.error('Error installing dependencies:', error.message);
    process.exit(1);
  }
}

console.log('Dependency check complete.'); 