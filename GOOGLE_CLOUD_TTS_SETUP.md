# Google Cloud Text-to-Speech Setup

This project now includes Google Cloud Text-to-Speech integration to provide reliable audio across all browsers, especially Chrome.

## Setup Steps

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your Project ID

### 2. Enable Text-to-Speech API

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Text-to-Speech API"
3. Click on it and press "Enable"

### 3. Create Service Account

1. Go to "IAM & Admin" > "Service Accounts"
2. Click "Create Service Account"
3. Give it a name like "tts-service"
4. Grant it the "Text-to-Speech API User" role
5. Click "Done"

### 4. Generate Credentials

1. Click on your service account
2. Go to "Keys" tab
3. Click "Add Key" > "Create new key"
4. Choose "JSON" format
5. Download the JSON file

### 5. Set Environment Variables

Create a `.env.local` file in your project root with:

```bash
# Google Cloud Project ID
GOOGLE_CLOUD_PROJECT_ID=your-project-id

# Google Cloud Service Account Email
GOOGLE_CLOUD_CLIENT_EMAIL=your-service-account@your-project-id.iam.gserviceaccount.com

# Google Cloud Service Account Private Key
GOOGLE_CLOUD_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
```

**Important**: Replace `\n` with actual newlines in the private key.

### 6. Test the Setup

1. Restart your development server
2. Navigate to the knowledge visualization step
3. Check the console logs - you should see "Google Cloud TTS" as the TTS method
4. You should hear audio in Chrome!

## Pricing

- **Free Tier**: 4 million characters per month
- **After Free Tier**: $4 per 1 million characters
- For a typical learning app, you'll likely stay within the free tier

## Fallback Behavior

If Google Cloud TTS is not available or fails, the app automatically falls back to the Web Speech API, ensuring audio works on all browsers.

## Files Added

- `lib/services/google-cloud-tts.ts` - Google Cloud TTS service
- `app/api/tts/route.ts` - API endpoint for TTS requests
- `hooks/use-enhanced-text-to-speech.ts` - Enhanced TTS hook with fallback
- Updated `components/activity/knowledge-visualization-step.tsx` to use enhanced TTS
