# Image Generation Test Plan

## Function: `generateImage(prompt, sourceImageBase64?, mimeType?)`

### Purpose
Generate images using Gemini's imagen-3.0-generate-001 (gemini-3-pro-image-preview) model. Supports both text-to-image generation and image-to-image editing.

### Test Cases

#### 1. Text-to-Image Generation (No Source Image)
**Input:**
- `prompt`: "A futuristic city with flying cars at sunset"
- `sourceImageBase64`: undefined
- `mimeType`: undefined (defaults to 'image/png')

**Expected Output:**
- Returns a base64 data URL string starting with "data:image/"
- Should contain a valid base64-encoded image

**Manual Test Steps:**
1. Navigate to Image Editor tab
2. DO NOT upload a source image
3. Enter prompt: "A futuristic city with flying cars at sunset"
4. Click "Generate Image"
5. Verify image appears in result panel
6. Verify no errors in console

---

#### 2. Image-to-Image Editing (With Source Image)
**Input:**
- `prompt`: "Make this image look like a vintage poster from the 1950s"
- `sourceImageBase64`: Valid base64 image data
- `mimeType`: "image/jpeg"

**Expected Output:**
- Returns a base64 data URL of the edited image
- Should maintain similar composition to source but with vintage styling

**Manual Test Steps:**
1. Navigate to Image Editor tab
2. Upload a source image (JPEG format)
3. Enter prompt: "Make this image look like a vintage poster from the 1950s"
4. Click "Generate Image"
5. Verify edited image appears in result panel
6. Verify image shows vintage styling effects
7. Verify no errors in console

---

#### 3. Data URL Prefix Handling
**Input:**
- `sourceImageBase64`: "data:image/png;base64,iVBORw0KG..." (with prefix)
- OR: "iVBORw0KG..." (without prefix)

**Expected Behavior:**
- Function should correctly strip the prefix if present
- Should work with both formats

**Manual Test Steps:**
1. Test both with and without data URL prefix
2. Verify both cases work correctly

---

#### 4. Error Handling: Empty Prompt
**Input:**
- `prompt`: "" (empty string)

**Expected Output:**
- Throws error: "Prompt is required for image generation"

**Manual Test Steps:**
1. Try to generate with empty prompt
2. Verify error message is displayed
3. Verify generation does not proceed

---

#### 5. Error Handling: Invalid API Key
**Input:**
- Invalid or missing API key

**Expected Output:**
- Throws error: "Invalid API key. Please check your Gemini API key."

**Manual Test Steps:**
1. Clear API key in settings
2. Try to generate image
3. Verify appropriate error message

---

#### 6. Error Handling: Invalid Source Image
**Input:**
- `sourceImageBase64`: "invalid-base64-data"

**Expected Output:**
- Graceful error handling with clear message

---

#### 7. MIME Type Support
**Supported Types:**
- image/png
- image/jpeg
- image/webp
- image/gif

**Manual Test Steps:**
1. Test with each MIME type
2. Verify all work correctly

---

## Integration Points

### Used By:
1. `ImageEditor.svelte` - Main image editing interface
2. Future: `FixGenerationModal.svelte` - For policy violation fixes (when implemented)

### Dependencies:
- `@google/genai` package (GoogleGenAI client)
- `IMAGE_GEN_MODEL` constant = 'gemini-3-pro-image-preview'
- Initialized Gemini API client

---

## Performance Expectations

- **Text-to-Image**: ~10-30 seconds
- **Image-to-Image**: ~15-45 seconds
- **Timeout**: Should fail gracefully after reasonable timeout

---

## API Configuration

```typescript
{
  model: 'gemini-3-pro-image-preview',
  config: {
    temperature: 0.4,      // Lower = more consistent results
    topP: 0.9,             // Nucleus sampling threshold
    topK: 40,              // Token selection limit
    responseModalities: ['IMAGE']  // Specify we want image output
  }
}
```

---

## Known Limitations

1. Maximum image size: Based on Gemini API limits
2. Source image must be valid base64 data
3. Requires active internet connection
4. Subject to Gemini API rate limits and quotas
5. Safety filters may block certain content

---

## Success Criteria

✅ Function successfully generates images from text prompts
✅ Function successfully edits images based on source + prompt
✅ Proper error handling for all edge cases
✅ Returns valid base64 data URLs
✅ Works with multiple MIME types
✅ Integrates correctly with ImageEditor component
✅ Build completes without TypeScript errors
