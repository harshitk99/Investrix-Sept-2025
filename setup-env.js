#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Investrix Environment Setup\n');

const envPath = path.join(process.cwd(), '.env.local');

// Check if .env.local already exists
if (fs.existsSync(envPath)) {
  console.log('⚠️  .env.local file already exists!');
  console.log('Please check the ENVIRONMENT_SETUP.md file for the required variables.\n');
  process.exit(0);
}

// Create .env.local template
const envTemplate = `# Firebase Configuration (Required)
# Get these from Firebase Console > Project Settings > General > Your apps
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here

# EdgeStore Configuration (Optional - for file uploads)
# Get these from https://edgestore.dev/
EDGE_STORE_ACCESS_KEY=your_edgestore_access_key_here
EDGE_STORE_SECRET_KEY=your_edgestore_secret_key_here

# Gemini AI Configuration (Required for AI insights)
# Get this from https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Personal Finance Integration
# Get this from YNAB Settings > Developer Settings
YNAB_API_KEY=your_ynab_api_key_here
`;

try {
  fs.writeFileSync(envPath, envTemplate);
  console.log('✅ Created .env.local file with template');
  console.log('📝 Please edit .env.local and add your actual credentials');
  console.log('📖 See ENVIRONMENT_SETUP.md for detailed instructions\n');
  
  console.log('🚀 Next steps:');
  console.log('1. Edit .env.local with your Firebase credentials');
  console.log('2. Run: npm run dev');
  console.log('3. Visit: http://localhost:3000\n');
  
} catch (error) {
  console.error('❌ Error creating .env.local file:', error.message);
  process.exit(1);
}
