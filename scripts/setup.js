#!/usr/bin/env node

/**
 * Setup script for DocxTemplater Report Generator
 * This script helps initialize the application and create necessary directories
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 DocxTemplater Report Generator Setup');
console.log('=====================================\n');

// Create necessary directories
const directories = [
  'uploads/templates',
  'temp',
  'logs'
];

console.log('Creating directories...');
directories.forEach(dir => {
  const fullPath = path.join(__dirname, '..', dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`✅ Created: ${dir}`);
  } else {
    console.log(`ℹ️  Already exists: ${dir}`);
  }
});

// Check if .env file exists
const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
  console.log('\n⚠️  .env file not found!');
  console.log('Please copy env.example to .env and configure your settings:');
  console.log('cp env.example .env');
  console.log('\nRequired environment variables:');
  console.log('- ORACLE_HOST: Your Oracle database host');
  console.log('- ORACLE_PORT: Your Oracle database port (default: 1521)');
  console.log('- ORACLE_SERVICE: Your Oracle service name');
  console.log('- ORACLE_USER: Your Oracle username');
  console.log('- ORACLE_PASSWORD: Your Oracle password');
} else {
  console.log('\n✅ .env file found');
}

// Check Node.js version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
if (majorVersion < 18) {
  console.log('\n❌ Node.js version too old!');
  console.log(`Current version: ${nodeVersion}`);
  console.log('Required version: Node.js 18 or higher');
  console.log('Please upgrade Node.js to use OracleDB thin mode');
} else {
  console.log(`\n✅ Node.js version: ${nodeVersion} (compatible with thin mode)`);
}

// Check if Oracle client package is available
console.log('\n🔍 Checking Oracle client package...');
try {
  require('oracledb');
  console.log('✅ Oracle client package found');
  console.log('ℹ️  The application will use thin mode (no Oracle Client installation required)');
} catch (error) {
  console.log('❌ Oracle client package not found');
  console.log('Please install dependencies: npm install');
}

// Check if LibreOffice is available
console.log('\n🔍 Checking LibreOffice availability...');
const { exec } = require('child_process');
exec('libreoffice --version', (error, stdout, stderr) => {
  if (error) {
    console.log('❌ LibreOffice not found or not accessible');
    console.log('Please install LibreOffice for PDF conversion');
    console.log('Windows: Download from libreoffice.org');
    console.log('Linux: sudo apt-get install libreoffice');
    console.log('macOS: brew install --cask libreoffice');
  } else {
    console.log(`✅ LibreOffice found: ${stdout.trim()}`);
  }
});

console.log('\n📋 Next steps:');
console.log('1. Configure your .env file with Oracle database credentials');
console.log('2. Install dependencies: npm install');
console.log('3. Start the server: npm run dev');
console.log('4. Upload a template using POST /upload-template');
console.log('5. Generate reports using GET /generate?report=yourType');

console.log('\n💡 Benefits of thin mode:');
console.log('- No Oracle Client installation required');
console.log('- Easier deployment and setup');
console.log('- Better portability across environments');
console.log('- Direct network connection to Oracle database');

console.log('\n📚 For more information, see README.md');
console.log('🎉 Setup complete!\n'); 