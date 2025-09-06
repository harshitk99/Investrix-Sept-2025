# Environment Variables Setup

## Required Environment Variables

Create a `.env.local` file in your project root with the following variables:

### Firebase Configuration (Required)
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here
```

### EdgeStore Configuration (Optional - for file uploads)
```bash
EDGE_STORE_ACCESS_KEY=your_edgestore_access_key_here
EDGE_STORE_SECRET_KEY=your_edgestore_secret_key_here
```

### Gemini AI Configuration (Required for AI insights)
```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

### Optional: Personal Finance Integration
```bash
YNAB_API_KEY=your_ynab_api_key_here
```

## How to Get These Values

### Firebase Configuration
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings (gear icon)
4. Scroll down to "Your apps" section
5. Click on your web app or create a new one
6. Copy the config values

### EdgeStore Configuration
1. Go to [EdgeStore Dashboard](https://edgestore.dev/)
2. Create a new project
3. Get your access key and secret key from the dashboard

### Gemini AI Configuration
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key

### YNAB Configuration (Optional)
1. Go to [YNAB Settings](https://app.youneedabudget.com/settings)
2. Go to Developer Settings
3. Create a new API token

## Quick Fix for Current Issues

To fix the current errors, you need to:

1. **Create `.env.local` file** in your project root
2. **Add at least the Firebase configuration** with your actual Firebase project credentials
3. **Restart the development server** (`npm run dev`)

The EdgeStore error will be resolved once you add the EdgeStore credentials or if you're not using file uploads, you can ignore it.

## Example .env.local file:
```bash
# Replace with your actual Firebase credentials
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef

# Optional: Add these if you want to use the features
GEMINI_API_KEY=your_gemini_key_here
EDGE_STORE_ACCESS_KEY=your_edgestore_key_here
EDGE_STORE_SECRET_KEY=your_edgestore_secret_here
```
