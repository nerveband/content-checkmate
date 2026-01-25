# Markdown Component Test Cases

This document serves as manual test cases for the Markdown component since we don't have an automated testing framework set up yet.

## Test Case 1: Bold Text Rendering
**Input:** `**bold text**`
**Expected:** Text should render with `font-weight: 700` (NOT yellow background)
**CSS:** Should apply `.font-bold` class with `font-weight: 700; color: rgb(17 24 39);`

## Test Case 2: Headers
**Input:**
```
# Header 1
## Header 2
### Header 3
```
**Expected:**
- H1: text-2xl, font-bold, mt-8, mb-4
- H2: text-xl, font-semibold, mt-6, mb-3
- H3: text-lg, font-semibold, mt-4, mb-2

## Test Case 3: Lists
**Input:**
```
- Item 1
- Item 2
- Item 3
```
**Expected:** Unordered list with disc bullets, proper spacing

## Test Case 4: Inline Code
**Input:** `` `code here` ``
**Expected:** Gray background, monospace font, slight padding, rounded corners

## Test Case 5: Code Blocks
**Input:**
````
```
code block
multiple lines
```
````
**Expected:** Gray background box, monospace font, scrollable if needed

## Test Case 6: Links
**Input:** `[Link Text](https://example.com)`
**Expected:** Clickable link, accent color, hover effect, opens in new tab

## Test Case 7: Mixed Content
**Input:**
```
## Section Header

This is a paragraph with **bold text** and `inline code`.

- List item 1
- List item 2

Another paragraph.
```
**Expected:** All markdown features should render correctly together

## Test Case 8: XSS Prevention
**Input:** `<script>alert('xss')</script>`
**Expected:** HTML should be escaped, script should not execute

## Test Case 9: POLICY_GUIDE Content
**Input:** The actual POLICY_GUIDE from policies.ts
**Expected:** All **bold text** in policy sections should render with font-weight: 700, NO yellow background

## Manual Testing Steps

1. Navigate to the Policy Guide tab
2. Click "View Full Policy Guide (Markdown Demo)" at the bottom
3. Verify that:
   - All **bold text** appears in bold font (not yellow highlight)
   - Headers have proper hierarchy and spacing
   - Lists are formatted correctly
   - Overall readability is good

## Known Issues
None - component should render all markdown correctly with proper styling.
