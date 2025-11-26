# Testing Guide for Mobile Search Suggestions Fix (PR #3)

This guide provides comprehensive testing instructions for the mobile search suggestions layout fix.

## Quick Testing Methods

### Option 1: Browser DevTools (Easiest - No Setup Required)

1. **Open the Application**
   - Start the development server: `npm run dev`
   - Open the application in your browser

2. **Enable Mobile View in DevTools**
   - Press `F12` or `Ctrl+Shift+I` (Windows/Linux) / `Cmd+Option+I` (Mac)
   - Click the device toolbar icon (or press `Ctrl+Shift+M` / `Cmd+Shift+M`)
   - Select a mobile device preset (e.g., "iPhone 12 Pro", "Galaxy S20")
   - Or set custom dimensions: 375x667 for mobile testing

3. **Test Search Functionality**
   - Click on any event input field
   - Start typing to trigger search suggestions
   - **Expected behavior on mobile (≤768px width):**
     - Search results appear BELOW the input field
     - Results take full width of the container
     - Results are readable and clickable
     - Max height is 50vh (doesn't overflow screen)
   - Hover over a search result to see the tooltip
   - **Expected tooltip behavior on mobile:**
     - Tooltip appears at bottom of screen
     - Positioned within viewport (1rem from edges)

4. **Test Desktop Layout**
   - Resize viewport to >768px width (e.g., 1920x1080)
   - Start typing in search field
   - **Expected behavior on desktop:**
     - Search results appear to the SIDE of the event boxes
     - Results maintain original side-by-side layout
     - Tooltip appears next to cursor position

5. **Test Breakpoint Transition**
   - Slowly resize browser window from mobile to desktop
   - Watch layout transition at 768px breakpoint
   - Verify smooth transition without visual glitches

### Option 2: Mobile Device Emulation with Specific Devices

Test with these common device presets in DevTools:

**Small Phones (< 400px width):**
- iPhone SE (375x667)
- Galaxy S8 (360x740)

**Medium Phones (400-450px width):**
- iPhone 12 Pro (390x844)
- Pixel 5 (393x851)

**Large Phones (> 450px width):**
- iPhone 14 Pro Max (430x932)
- Galaxy S20+ (412x915)

**Tablets:**
- iPad Mini (768x1024) - Test breakpoint boundary!
- iPad Air (820x1180)

### Option 3: Real Device Testing (Recommended Before Merge)

1. **Using Same Network**
   - Find your local IP: `ipconfig` (Windows) / `ifconfig` (Mac/Linux)
   - Start dev server: `npm run dev -- --host`
   - Access from mobile device: `http://[YOUR_IP]:5173`

2. **Using ngrok (For Remote Testing)**
   ```bash
   # Install ngrok if needed
   npm install -g ngrok

   # Start your dev server
   npm run dev

   # In another terminal, create tunnel
   ngrok http 5173

   # Access the HTTPS URL from any mobile device
   ```

3. **What to Test on Real Devices**
   - Touch interaction with search results
   - Scrolling within search results dropdown
   - Tooltip appearance and positioning
   - Performance and responsiveness
   - Different orientations (portrait/landscape)

## Detailed Test Cases

### Test Case 1: Mobile Search Results Positioning
**Steps:**
1. Set viewport to 375x667 (mobile)
2. Click on "Title" input field in any event box
3. Type "battle" to trigger search

**Expected:**
- Search results dropdown appears directly below input field
- Dropdown positioned with `top: calc(100% + 0.5rem)`
- Full width of container (`width: 100%`)
- No horizontal overflow

**Pass/Fail:** ___

### Test Case 2: Mobile Search Results Scrolling
**Steps:**
1. Set viewport to 375x667 (mobile)
2. Trigger search with many results (type common term)
3. Scroll within results dropdown

**Expected:**
- Dropdown max-height is 50vh
- Vertical scrolling works smoothly
- Results remain readable while scrolling
- No content cutoff

**Pass/Fail:** ___

### Test Case 3: Mobile Tooltip Positioning
**Steps:**
1. Set viewport to 375x667 (mobile)
2. Trigger search results
3. Hover over (or tap on desktop) a search result

**Expected:**
- Tooltip appears at bottom of screen
- Positioned 1rem from left and right edges
- Fully visible within viewport
- Not obscured by keyboard (on real devices)

**Pass/Fail:** ___

### Test Case 4: Desktop Layout Unchanged
**Steps:**
1. Set viewport to 1920x1080 (desktop)
2. Trigger search in left column event
3. Trigger search in right column event

**Expected:**
- Left column: results appear to the left
- Right column: results appear to the right
- Original positioning maintained (`top: -10rem`)
- Original width maintained (`calc(50vw - 4rem)`)

**Pass/Fail:** ___

### Test Case 5: Breakpoint Transition
**Steps:**
1. Set viewport to 760px width
2. Trigger search results (keep them open)
3. Slowly resize to 776px width

**Expected:**
- Layout switches from mobile to desktop at 768px/769px
- No visual glitches during transition
- Search results remain functional after resize

**Pass/Fail:** ___

### Test Case 6: Multiple Event Boxes
**Steps:**
1. Test on mobile viewport (375x667)
2. Add multiple events to both columns
3. Test search in different event boxes

**Expected:**
- Each event box's search works independently
- Tooltips don't overlap with other elements
- z-index properly stacks (tooltip 1001, results 1000)

**Pass/Fail:** ___

## Browser Compatibility Testing

Test in these browsers:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (Mac/iOS)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

## Known Issues to Watch For

1. **Keyboard Overlap on Mobile**: On real mobile devices, the on-screen keyboard may cover the search results. This is expected OS behavior.
2. **Landscape Mode**: In landscape orientation on small phones, vertical space is limited. Results should still be scrollable.
3. **iPad at 768px**: iPads at portrait 768px width should show desktop layout (>768px logic).

## Regression Testing

Ensure existing functionality still works:
- [ ] Search functionality returns correct results
- [ ] Event creation/editing works normally
- [ ] Calendar navigation functions properly
- [ ] Dark/light theme switching works
- [ ] All other UI elements render correctly

## Performance Testing

- [ ] No console errors or warnings
- [ ] Smooth scrolling in search results
- [ ] No layout shift when search results appear
- [ ] Responsive to rapid typing in search field

## Accessibility Testing

- [ ] Search results are keyboard navigable
- [ ] Screen readers can access search results
- [ ] Focus management works correctly
- [ ] Touch targets are adequate size (min 44x44px)

---

## Quick Checklist Before Merge

- [ ] Tested in Chrome DevTools mobile view (multiple devices)
- [ ] Tested desktop layout (>768px) - no regression
- [ ] Tested breakpoint transition (768px boundary)
- [ ] Tested on at least one real mobile device
- [ ] No console errors
- [ ] Search results are readable and clickable on mobile
- [ ] Tooltips appear within viewport on mobile
- [ ] Original desktop functionality preserved

## Automated Testing Suggestions (Future Enhancement)

Consider adding these tests:
```typescript
// Cypress or Playwright test examples
describe('Mobile Search Layout', () => {
  it('should display search results below input on mobile', () => {
    cy.viewport(375, 667);
    cy.get('input[placeholder*="Title"]').type('battle');
    cy.get('.search-results').should('have.css', 'top', 'calc(100% + 0.5rem)');
  });

  it('should display search results beside input on desktop', () => {
    cy.viewport(1920, 1080);
    cy.get('input[placeholder*="Title"]').type('battle');
    cy.get('.search-results').should('have.css', 'top', '-10rem');
  });
});
```
