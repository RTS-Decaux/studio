# fal.ai SDK Integration Testing Guide

## Overview
Guide for testing the @fal-ai/client SDK integration in Studio features.

## Prerequisites
```bash
# Required environment variables
FAL_API_KEY=your-fal-api-key
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Unit Tests (TODO)

### FalClient Tests
Location: `lib/studio/fal/__tests__/client.test.ts`

**Test Cases:**
- [ ] `submit()` - Submit generation job
- [ ] `getStatus()` - Check generation status
- [ ] `getResult()` - Get generation result
- [ ] `run()` - End-to-end generation with polling
- [ ] `cancel()` - Cancel in-progress generation
- [ ] `uploadFile()` - Upload file to fal.ai storage
- [ ] Error handling - API errors, network errors, timeouts

### StudioService Tests
Location: `lib/studio/__tests__/service.test.ts`

**Test Cases:**
- [ ] `submitGeneration()` - Submit with Studio request format
- [ ] `runGeneration()` - Full generation flow with progress
- [ ] `checkStatus()` - Status checking
- [ ] `getResult()` - Result retrieval
- [ ] `cancelGeneration()` - Cancellation
- [ ] `uploadReferenceImage()` - Reference image upload
- [ ] `buildInput()` - Input construction for different model types
- [ ] `inferGenerationType()` - Generation type inference from model ID

## Integration Tests (TODO)

### Server Actions Tests
Location: `lib/studio/__tests__/actions.test.ts`

**Test Cases:**
- [ ] `generateAction()` - Create generation (authenticated user)
- [ ] `generateAction()` - Reject guest user
- [ ] `cancelGenerationAction()` - Cancel generation (owner)
- [ ] `cancelGenerationAction()` - Reject non-owner
- [ ] `retryGenerationAction()` - Retry failed generation
- [ ] `processGeneration()` - Background processing with DB updates

## Quick Testing Scripts

### Automated Integration Test
```bash
# Run all integration tests
tsx scripts/test-fal-integration.ts
```

**Tests:**
- FalClient: submit, getStatus, getResult, run, uploadFile
- StudioService: runGeneration with progress tracking
- Error handling: invalid models, request IDs

**Expected Output:**
- ✓ All FalClient methods work correctly
- ✓ Progress callbacks fire during generation
- ✓ Errors are handled gracefully

### Test Specific Models
```bash
# List available test models
tsx scripts/test-model.ts --list

# Test FLUX Schnell (fast, 5-10s)
tsx scripts/test-model.ts flux-schnell

# Test Veo 2 (video, 30-60s)
tsx scripts/test-model.ts veo-2
```

**Available Models:**
- `flux-schnell` - Fast image generation (5-10s)
- `flux-dev` - High quality images (15-30s)
- `flux-pro` - Best quality (20-40s)
- `veo-2` - Text-to-video (30-60s)
- `minimax-video` - Text-to-video (30-90s)

## Manual Testing

### 1. Text-to-Image Generation
**Model:** `fal-ai/flux/schnell`

**Steps:**
1. Navigate to Studio (`/studio`)
2. Select "FLUX Schnell" model
3. Enter prompt: "A serene mountain landscape at sunset"
4. Set parameters: `image_size: "landscape_16_9"`
5. Click "Generate"
6. Verify:
   - Generation status updates (pending → processing → completed)
   - Progress percentage displays
   - Final image displays in gallery
   - Generation saved to DB with correct status
   - Asset created in Supabase Storage

**Expected Behavior:**
- Generation completes in ~5-10 seconds
- Image URL is accessible
- Database record shows `status: "completed"`

### 2. Image-to-Video Generation
**Model:** `fal-ai/veo/v2`

**Steps:**
1. Navigate to Studio
2. Select "Veo 2" model
3. Upload reference image
4. Enter prompt: "Make the clouds move slowly"
5. Set parameters: `duration: 5, aspect_ratio: "16:9"`
6. Click "Generate"
7. Verify:
   - Reference image uploads successfully
   - Generation status updates
   - Final video displays
   - Asset stored with correct MIME type

**Expected Behavior:**
- Generation completes in ~30-60 seconds
- Video URL is accessible
- Database record shows `generationType: "image-to-video"`

### 3. Cancel Generation
**Model:** Any (use slow model like video generation)

**Steps:**
1. Start a generation (e.g., video)
2. Immediately click "Cancel" button
3. Verify:
   - Status changes to "cancelled"
   - fal.ai API receives cancel request
   - Database updated with `status: "cancelled"`
   - UI shows cancellation message

**Expected Behavior:**
- Cancellation happens within 1-2 seconds
- No final asset created
- Error message: "Cancelled by user"

### 4. Retry Failed Generation
**Model:** Any (simulate failure or use invalid parameters)

**Steps:**
1. Create a failed generation (or manually set status to "failed" in DB)
2. Click "Retry" button
3. Verify:
   - New generation created with same parameters
   - Original generation remains with `status: "failed"`
   - New generation processes normally

**Expected Behavior:**
- New generation ID generated
- All parameters copied correctly
- Retry button only shows for failed generations

### 5. Progress Tracking
**Model:** Any long-running model

**Steps:**
1. Start generation
2. Observe progress updates
3. Verify:
   - Progress percentage increases
   - Log messages display (if enabled)
   - Status transitions: pending → processing → completed
   - Queue position updates (if in queue)

**Expected Behavior:**
- Progress updates every 2 seconds (pollInterval)
- Smooth progression from 0% → 100%
- Logs show processing steps

### 6. File Upload
**Model:** Any model accepting reference images

**Steps:**
1. Select model requiring image input
2. Click "Upload" button
3. Select image file (PNG, JPEG, WebP)
4. Verify:
   - File uploads to fal.ai storage
   - Signed URL returned
   - Preview displays
   - Generation includes uploaded image URL

**Expected Behavior:**
- Upload completes in <3 seconds
- URL format: `https://v3.fal.media/files/...`
- Image accessible from URL

## Error Scenarios

### 1. Invalid API Key
**Setup:** Use incorrect `FAL_API_KEY`

**Expected:**
- Error message: "Authentication failed"
- Generation status: "failed"
- User sees error toast

### 2. Model Not Found
**Setup:** Use non-existent model ID

**Expected:**
- Error message: "Model not found"
- Generation not created in DB

### 3. Network Timeout
**Setup:** Simulate slow network or long-running generation

**Expected:**
- Timeout after 10 minutes (default)
- Status: "failed"
- Error message: "Generation timeout"

### 4. Invalid Parameters
**Setup:** Pass incompatible parameters to model

**Expected:**
- fal.ai validation error returned
- Error message displays parameter issues
- Generation status: "failed"

### 5. Guest User Restriction
**Setup:** Anonymous user attempts generation

**Expected:**
- Error message: "Authentication required"
- Redirect to login page
- No generation created

## Performance Benchmarks

### Expected Response Times
| Operation | Expected Time | Acceptable Range |
|-----------|---------------|------------------|
| Image (FLUX Schnell) | 5-10s | 3-15s |
| Image (FLUX Dev) | 15-30s | 10-45s |
| Video (5s, Veo 2) | 30-60s | 20-90s |
| File Upload (5MB) | 2-5s | 1-10s |
| Cancel Operation | 1-2s | <5s |
| Status Check | <500ms | <2s |

## Database Verification

### Check Generation Records
```sql
-- Recent generations
SELECT id, user_id, model_id, status, created_at, completed_at
FROM studio_generations
ORDER BY created_at DESC
LIMIT 10;

-- Failed generations
SELECT id, model_id, error, created_at
FROM studio_generations
WHERE status = 'failed'
ORDER BY created_at DESC;

-- Generation duration stats
SELECT 
  model_id,
  status,
  COUNT(*) as count,
  AVG(EXTRACT(EPOCH FROM (completed_at - created_at))) as avg_duration_seconds
FROM studio_generations
WHERE completed_at IS NOT NULL
GROUP BY model_id, status;
```

### Check Assets
```sql
-- Recent assets
SELECT id, user_id, type, storage_path, file_size, created_at
FROM studio_assets
ORDER BY created_at DESC
LIMIT 10;

-- Assets by type
SELECT type, COUNT(*) as count, SUM(file_size) as total_size_bytes
FROM studio_assets
GROUP BY type;
```

## Monitoring

### Key Metrics to Track
- **Generation Success Rate:** `(completed / total) * 100`
- **Average Generation Time:** by model type
- **Error Rate:** `(failed / total) * 100`
- **Cancellation Rate:** `(cancelled / total) * 100`
- **API Response Times:** p50, p95, p99

### Logging Checklist
- [ ] All fal.ai API calls logged (server-side only)
- [ ] Generation lifecycle events logged (pending, processing, completed, failed, cancelled)
- [ ] Errors include stack traces and context
- [ ] Performance metrics collected

### Error Monitoring
- [ ] Set up alerts for high error rates (>5%)
- [ ] Monitor timeout frequency
- [ ] Track authentication failures
- [ ] Alert on API rate limiting

## Rollout Strategy

### Phase 1: Development Testing ✅
- [x] Local testing with dev environment
- [x] TypeScript compilation check
- [x] Unit tests (TODO)
- [ ] Integration tests (TODO)

### Phase 2: Staging Testing
- [ ] Deploy to staging environment
- [ ] Run manual test scenarios
- [ ] Load testing (concurrent generations)
- [ ] Monitor for 24 hours

### Phase 3: Production Rollout
- [ ] Feature flag: Enable for 10% of users
- [ ] Monitor metrics for 48 hours
- [ ] Increase to 50% if no issues
- [ ] Full rollout after 1 week

### Rollback Plan
If critical issues detected:
1. Disable feature via feature flag
2. Revert to previous implementation
3. Investigate errors from logs
4. Fix and redeploy

## Known Issues

### ProseMirror Type Conflicts
**Status:** Pre-existing (not related to fal.ai migration)
**Impact:** None (TypeScript-only, no runtime errors)
**Action:** To be fixed separately

### @radix-ui React Types
**Status:** Pre-existing (React 18.3.18 bigint type issue)
**Impact:** None (TypeScript-only)
**Action:** To be fixed separately

## Support

### fal.ai Resources
- [Queue API Documentation](https://docs.fal.ai/api-reference/queue)
- [Model APIs](https://docs.fal.ai/model-apis)
- [@fal-ai/client SDK](https://github.com/fal-ai/fal-js)

### Internal Resources
- `FAL_SDK_MIGRATION.md` - Migration summary
- `.github/copilot-instructions.md` - Architecture overview
- `STUDIO_QUICKSTART.md` - Studio feature guide

---

**Last Updated:** [Current Date]
**SDK Version:** @fal-ai/client v1.7.2
