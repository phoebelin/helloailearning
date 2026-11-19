# TTS Security Allowlist Verification

This document proves that the new TTS security allowlists will not reject any current lesson requests.

## Current TTS Usage Patterns

All TTS call sites were analyzed by searching for `useEnhancedTextToSpeech` across the codebase.

### Identified Call Sites

1. **Zhorai Lesson (Chapter 1: How Machines Learn)**
   - `components/activity/animal-selection-step.tsx`
   - `components/activity/knowledge-visualization-step.tsx`
   - `components/activity/prediction-step.tsx`
   - `components/activity/prediction-step-bert.tsx`
   - `components/activity/reflection-step.tsx`
   - `components/activity/sentence-input-step.tsx`

2. **Coda Lesson**
   - `components/activities/coda/meet-coda-step.tsx`

### Parameters Used

All call sites use consistent parameters:

```typescript
// Zhorai lesson pattern (most common)
useEnhancedTextToSpeech({
  rate: 0.9,
  pitch: 1.1,
  useGoogleCloud: true,
})

// Coda lesson pattern
useEnhancedTextToSpeech({
  rate: 0.88,
  pitch: 1.15,
  useGoogleCloud: true,
})
```

### Request Sent to API

When `speakWithGoogleCloud` is called, it sends:

```typescript
{
  text: string,
  options: {
    voice: {
      languageCode: 'en-US',  // Default from hook
      ssmlGender: 'FEMALE',   // Hardcoded in hook
    },
    audioConfig: {
      speakingRate: 0.88-0.9,  // From hook options
      pitch: 1.1-1.15,         // From hook options
      volumeGainDb: 0,         // Default (volume = 1.0)
    },
  },
}
```

## Allowlist Configuration

From `lib/utils/request-validator.ts`:

```typescript
ALLOWED_LANGUAGES = ['en-US']
ALLOWED_GENDERS = ['FEMALE', 'MALE', 'NEUTRAL']
ALLOWED_AUDIO_ENCODINGS = ['MP3', 'LINEAR16', 'OGG_OPUS']
SPEAKING_RATE_RANGE = { min: 0.5, max: 1.5 }
PITCH_RANGE = { min: 0.5, max: 2.0 }
VOLUME_RANGE = { min: -10, max: 10 }
```

## Verification Matrix

| Parameter | Current Value | Allowlist | Status |
|-----------|--------------|-----------|---------|
| `languageCode` | `'en-US'` | `['en-US']` | ✅ ALLOWED |
| `ssmlGender` | `'FEMALE'` | `['FEMALE', 'MALE', 'NEUTRAL']` | ✅ ALLOWED |
| `audioEncoding` | `'MP3'` (backend default) | `['MP3', 'LINEAR16', 'OGG_OPUS']` | ✅ ALLOWED |
| `speakingRate` | `0.88-0.9` | `0.5-1.5` | ✅ ALLOWED |
| `pitch` | `1.1-1.15` | `0.5-2.0` | ✅ ALLOWED |
| `volumeGainDb` | `0` | `-10 to 10` | ✅ ALLOWED |

## Conclusion

**All current lesson TTS requests will pass the new security allowlists.**

No existing functionality is affected by the security changes. The allowlists were built directly from actual usage patterns, with generous ranges that accommodate future adjustments without requiring code changes.

## Test Coverage

Unit tests verify that the exact patterns from both Zhorai and Coda lessons pass validation:

- `lib/utils/__tests__/request-validator.test.ts` line 140-175 tests actual lesson patterns
- All tests pass with current values

## Fallback Behavior

The `useEnhancedTextToSpeech` hook already includes automatic fallback to Web Speech API on any error (lines 227-233):

```typescript
catch (error) {
  console.error('Enhanced TTS: Google Cloud TTS failed:', error);
  // Fallback to Web Speech API
  console.log('Enhanced TTS: Falling back to Web Speech API');
  speakWithWebSpeechAPI(text, options);
}
```

This means:
- ✅ 403 (origin validation failure) → Falls back to Web Speech API
- ✅ 429 (rate limit exceeded) → Falls back to Web Speech API  
- ✅ 400 (invalid options) → Falls back to Web Speech API
- ✅ Any other error → Falls back to Web Speech API

The fallback is **already implemented** and requires no changes. Learners will never see a broken lesson.
