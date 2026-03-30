# Sprint 9 Checkpoint Issues & Milestones

**Sprint Duration:** Weeks 34-36 (Finals Week)  
**Date Created:** March 29, 2026  
**Version:** 1.0  
**Status:** Ready for implementation  

---

## Overview

Sprint 9 is the final capstone sprint where you will:

1.  Implement data backup/restore functionality
2.  Achieve >50% code coverage with automated testing
3.  Refine UI/UX for accessibility and usability
4.  Deploy to production with Docker and custom domain

This document provides the GitHub issues structure for tracking and managing Sprint 9 work.

---

## Issue Template

Each issue should follow this template:

```markdown
# [Issue Title]

## Description
[Clear problem statement or feature description]

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Technical Details
[Implementation approach, architecture decisions, etc.]

## Testing
- [ ] Unit tests (coverage target: X%)
- [ ] Integration tests
- [ ] Manual testing checklist

## Related
- Links to related issues
- Links to relevant documentation

## Complexity
Medium Medium (estimate: 8-16 hours)

## Labels
- scope: backend/frontend/devops
- priority: high/medium/low
- type: feature/bug/refactor/docs
```

---

## Checkpoint 1: Data Backup & Restore (Week 34)

### Issue #200: Implement Settings Export to JSON

```markdown
# [#200] Implement Settings Export to JSON

## Description
Users must be able to export their calibration data and settings to a JSON file 
for backup purposes and to transfer between devices.

## Acceptance Criteria
- [ ] Create "Export Settings" button in SettingsPanel
- [ ] Export includes: calibration points, all settings, voice profile
- [ ] Exported JSON is human-readable and well-formatted
- [ ] File downloads as `nodcursor-backup-2026-03-29.json`
- [ ] Include version number in export for future compatibility
- [ ] No sensitive data exported (no cookies, tokens, etc.)

## Technical Details

### Implementation Approach
1. Create utility function: `exportSettings(settings, calibration)`
2. Format as JSON with metadata
3. Create download link and trigger browser download
4. Add export button to SettingsPanel with loading state

### Export Format
\`\`\`json
{
  "version": "2.0",
  "exportDate": "2026-03-29T14:30:00Z",
  "settings": {
    "sensitivity": 1.0,
    "smoothing": 0.8,
    "blinkEnabled": true,
    ...
  },
  "calibration": {
    "points": [...],
    "mappingType": "bilinear",
    ...
  },
  "voiceProfile": {
    ...
  }
}
\`\`\`

### Files to Create/Modify
- `src/utils/settingsExport.ts` — Export logic
- `src/components/SettingsPanel/SettingsPanel.tsx` — Add export button
- `docs/SETTINGS_BACKUP_GUIDE.md` — User documentation

## Testing
- [ ] Unit test: `exportSettings` produces valid JSON
- [ ] Unit test: All required fields present
- [ ] Manual test: Browser downloads file correctly
- [ ] Manual test: File can be opened in text editor
- [ ] Manual test: Round-trip (export then import) preserves data

## Acceptance Criteria Verification
When all tests pass and manual testing complete:
- [ ] Settings export complete and tested
- [ ] User can download backup file
- [ ] File format documented

## Related
- #201 (Settings Import)
- docs/TESTING_COVERAGE_PLAN.md

## Complexity
Medium Medium (estimate: 6 hours)

## Labels
- scope: frontend
- priority: high
- type: feature
- component: SettingsPanel
```

### Issue #201: Implement Settings Import from JSON

```markdown
# [#201] Implement Settings Import from JSON

## Description
Users must be able to import previously exported settings to restore their configuration.

## Acceptance Criteria
- [ ] Create "Import Settings" button in SettingsPanel
- [ ] File picker allows selecting JSON export file
- [ ] Validates JSON format before import
- [ ] Shows preview of what will be imported
- [ ] User confirms before overwriting current settings
- [ ] Imports all: settings, calibration, voice profile
- [ ] Graceful error handling for invalid files
- [ ] Success message shows what was imported

## Technical Details

### Implementation Approach
1. Create utility function: `importSettings(jsonFile)`
2. Validate JSON schema matches export format
3. Show preview dialog of imported data
4. On confirmation, update AppContext
5. Show success toast notification

### Import Validation
- Check version compatibility
- Validate all required fields present
- Check data types are correct
- Report which fields will be imported

### Error Handling
- Handle corrupted JSON (parse errors)
- Handle version mismatch (show warning)
- Handle missing required fields (show partial import warning)
- Handle file too large (max 1MB)

### Files to Create/Modify
- `src/utils/settingsImport.ts` — Import logic
- `src/utils/settingsValidation.ts` — JSON schema validation
- `src/components/SettingsPanel/SettingsPanel.tsx` — Add import button
- `src/components/ImportPreviewDialog.tsx` — New component
- `docs/SETTINGS_BACKUP_GUIDE.md` — Update documentation

## Testing
- [ ] Unit test: `importSettings` validates JSON schema
- [ ] Unit test: Version compatibility check
- [ ] Unit test: Data type validation
- [ ] Unit test: Handle corrupted JSON gracefully
- [ ] Manual test: Import valid export file
- [ ] Manual test: Reject invalid JSON
- [ ] Manual test: Preview shows correct data
- [ ] Manual test: Settings actually update after import
- [ ] Integration test: Export then import round-trip

## Acceptance Criteria Verification
When all tests pass:
- [ ] Settings import complete and tested
- [ ] User can upload backup file
- [ ] Invalid files handled gracefully
- [ ] Preview confirms data before import

## Related
- #200 (Settings Export)
- docs/TESTING_COVERAGE_PLAN.md

## Complexity
Medium Medium (estimate: 8 hours)

## Labels
- scope: frontend
- priority: high
- type: feature
- component: SettingsPanel
```

### Issue #202: Create Calibration Backup Functionality

```markdown
# [#202] Create Calibration Backup Functionality

## Description
Add automatic calibration data backup to localStorage on each calibration completion,
with ability to restore from backup on app startup.

## Acceptance Criteria
- [ ] After calibration completes, save to localStorage with timestamp
- [ ] Keep last 5 calibrations (circular buffer)
- [ ] On app startup, detect stale calibration (>7 days) and warn user
- [ ] User can restore previous calibration from list
- [ ] Deleted/corrupted calibration handled gracefully
- [ ] Show calibration history with timestamps

## Technical Details

### Implementation Approach
1. Create `CalibrationBackupManager` class
2. On calibration completion, call `backup.save(calibration)`
3. On AppContext init, check for stale calibrations
4. Add "Restore Previous" option to CalibrationUI

### Backup Format
\`\`\`typescript
interface CalibrationBackup {
  id: string; // UUID
  timestamp: number;
  calibrationData: CalibrationData;
  deviceInfo: {
    browserAgent: string;
    screenResolution: string;
  };
}
\`\`\`

### Storage Strategy
- Key: `nodcursor_calibrations` → Array<CalibrationBackup>
- Keep only last 5 (FIFO when full)
- Warn if calibration older than 7 days

### Files to Create/Modify
- `src/utils/calibration/backupManager.ts` — Backup logic
- `src/hooks/useCalibrationBackup.ts` — Custom hook
- `src/components/CalibrationUI/CalibrationUI.tsx` — Add restore UI
- `src/context/AppContext.tsx` — Check for stale calibrations

## Testing
- [ ] Unit test: Save and retrieve calibrations
- [ ] Unit test: FIFO eviction when >5 backups
- [ ] Unit test: Detect stale calibrations
- [ ] Unit test: Handle corrupted backup data
- [ ] Manual test: Calibration auto-saves
- [ ] Manual test: Restore from previous calibration
- [ ] Manual test: Stale warning shows after 7 days
- [ ] Integration test: Persist across browser reload

## Acceptance Criteria Verification
When all tests pass:
- [ ] Automatic backup implemented
- [ ] Historical calibrations available
- [ ] Stale data handled properly

## Related
- #200, #201 (Settings backup/restore)
- docs/TESTING_COVERAGE_PLAN.md

## Complexity
Medium Medium (estimate: 8 hours)

## Labels
- scope: frontend
- priority: high
- type: feature
- component: Calibration
```

---

## Checkpoint 2: Testing & Code Coverage (Week 35)

### Issue #203: Establish Test Infrastructure & Setup

```markdown
# [#203] Establish Test Infrastructure & Setup

## Description
Install and configure Vitest testing framework, create test utilities, 
and establish CI/CD pipeline for automated testing.

## Acceptance Criteria
- [ ] Vitest configured with jsdom environment
- [ ] Test setup file created with mocks for MediaPipe, TensorFlow
- [ ] npm scripts added: test, test:ui, test:run, test:coverage
- [ ] Coverage reporter configured (HTML + LCOV format)
- [ ] GitHub Actions workflow created for CI/CD
- [ ] Coverage badge added to README
- [ ] All developers can run tests locally
- [ ] CI passes on every push

## Technical Details

### Installation
- `npm install --save-dev vitest @vitest/ui vitest-coverage-v8`
- `npm install --save-dev @testing-library/react @testing-library/jest-dom`
- `npm install --save-dev jsdom jest-canvas-mock`

### Configuration Files to Create
- `vitest.config.ts` — Main config
- `vitest.setup.ts` — Global setup
- `.github/workflows/test.yml` — GitHub Actions

### Test Scripts
\`\`\`json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
\`\`\`

## Testing
- [ ] Can run `npm test` locally
- [ ] Tests execute without errors
- [ ] Coverage report generates
- [ ] GitHub Actions workflow runs on push
- [ ] Coverage badge displays

## Documentation
- [ ] Create TESTING_SETUP_GUIDE.md
- [ ] Document how to run tests locally
- [ ] Document how to write new tests

## Acceptance Criteria Verification
When complete:
- [ ] Developers can write and run tests
- [ ] Coverage infrastructure ready
- [ ] CI/CD pipeline functional

## Related
- #204-#215 (Test implementation issues)
- docs/TESTING_COVERAGE_PLAN.md

## Complexity
Medium Medium (estimate: 6 hours)

## Labels
- scope: devops
- priority: high
- type: chore
```

### Issue #204: Write Unit Tests for Calibration Utils

```markdown
# [#204] Write Unit Tests for Calibration Utils

**Target Coverage:** 90%

## Description
Create comprehensive unit tests for calibration mapping functions.

## Acceptance Criteria
- [ ] Test boundary conditions (min, max, out-of-bounds)
- [ ] Test interpolation accuracy
- [ ] Test coordinate clamping
- [ ] Test edge cases (single point, collinear points)
- [ ] 90% line coverage for `src/utils/calibration/`
- [ ] All tests pass
- [ ] Performance verified (<5ms per map operation)

## Test File
Create: `tests/utils/calibration/mapToViewport.test.ts`

## Test Cases
- `should map raw coordinates to viewport output`
- `should handle out-of-bounds coordinates with clamping`
- `should interpolate smoothly between calibration points`
- `should maintain accuracy within 5px tolerance`
- `should handle edge case: single calibration point`
- `should handle edge case: collinear points`

## Related
- #203 (Test infrastructure)
- docs/TESTING_COVERAGE_PLAN.md

## Complexity
Medium Medium (estimate: 8 hours)

## Labels
- scope: frontend
- priority: high
- type: test
```

### Issue #205: Write Unit Tests for Smoothing Algorithms

```markdown
# [#205] Write Unit Tests for Smoothing Algorithms

**Target Coverage:** 85%

## Description
Create unit tests for Kalman filter and smoothing pipeline.

## Acceptance Criteria
- [ ] Test Kalman filter noise reduction
- [ ] Test exponential smoothing accuracy
- [ ] Test advanced pipeline composition
- [ ] Test parameter sensitivity
- [ ] 85% coverage for smoothing utils
- [ ] Verify latency <100ms
- [ ] Benchmark noise reduction effectiveness

## Test Files
- `tests/utils/smoothing/kalmanFilter.test.ts`
- `tests/utils/smoothing/exponentialSmoothing.test.ts`
- `tests/utils/smoothing/advancedSmoothing.test.ts`

## Key Test Cases
- Noise reduction verification
- Lag measurement
- State initialization
- Parameter validation

## Related
- #203 (Test infrastructure)
- docs/TESTING_COVERAGE_PLAN.md

## Complexity
Medium Medium (estimate: 10 hours)

## Labels
- scope: frontend
- priority: high
- type: test
```

### Issue #206: Write Unit Tests for Gesture Detection

```markdown
# [#206] Write Unit Tests for Gesture Detection

**Target Coverage:** 88%

## Description
Create tests for eye aspect ratio, blink detection, and gesture recognition.

## Acceptance Criteria
- [ ] Test EAR calculation for open/closed eyes
- [ ] Test eye state transitions
- [ ] Test gesture threshold detection
- [ ] Test confidence scoring
- [ ] 88% coverage for gesture detection
- [ ] Verify 95% detection accuracy on synthetic data

## Test Files
- `tests/utils/gestureDetection/eyeAspectRatio.test.ts`
- `tests/utils/gestureDetection/blinkDetection.test.ts`

## Test Cases
- Open eye detection (high EAR)
- Closed eye detection (low EAR)
- Eye orientation robustness
- Hysteresis behavior

## Related
- #203 (Test infrastructure)
- docs/TESTING_COVERAGE_PLAN.md

## Complexity
Medium Medium (estimate: 8 hours)

## Labels
- scope: frontend
- priority: high
- type: test
```

### Issue #207: Write Integration Tests for Gesture Controls Hook

```markdown
# [#207] Write Integration Tests for useGestureControls

**Target Coverage:** 75%

## Description
Create integration tests for gesture control hook including debouncing, handler invocation.

## Acceptance Criteria
- [ ] Test gesture detection and handler invocation
- [ ] Test debouncing prevents rapid gestures
- [ ] Test different gesture types
- [ ] Test settings integration
- [ ] 75% coverage for useGestureControls
- [ ] Verify debouncing window (100-300ms)

## Test File
Create: `tests/hooks/useGestureControls.test.ts`

## Test Cases
- Single blink → left click
- Double blink → right click
- Long blink → drag mode
- Debouncing effectiveness
- Settings effect on gesture detection

## Related
- #203 (Test infrastructure)
- docs/TESTING_COVERAGE_PLAN.md

## Complexity
Medium Medium (estimate: 10 hours)

## Labels
- scope: frontend
- priority: high
- type: test
```

### Issue #208: Write Integration Tests for Face Tracking Hook

```markdown
# [#208] Write Integration Tests for useFaceTracking

**Target Coverage:** 70%

## Description
Create integration tests for face tracking initialization, detection, and error handling.

## Acceptance Criteria
- [ ] Test MediaPipe initialization
- [ ] Test face detection flow
- [ ] Test error handling (no camera, permission denied)
- [ ] Test state transitions
- [ ] 70% coverage for useFaceTracking
- [ ] Verify graceful degradation

## Test File
Create: `tests/hooks/useFaceTracking.test.ts`

## Test Cases
- Initialization success
- Face detection updates
- Camera access denied
- Worker initialization
- Error recovery

## Related
- #203 (Test infrastructure)
- docs/TESTING_COVERAGE_PLAN.md

## Complexity
Medium Medium (estimate: 12 hours)

## Labels
- scope: frontend
- priority: high
- type: test
```

### Issue #209: Write Component Tests for CursorOverlay

```markdown
# [#209] Write Component Tests for CursorOverlay

**Target Coverage:** 80%

## Description
Create React component tests for cursor overlay rendering and interactions.

## Acceptance Criteria
- [ ] Test cursor position rendering
- [ ] Test click indicator visibility
- [ ] Test inactive state opacity
- [ ] Test drag state visual
- [ ] 80% coverage for CursorOverlay
- [ ] Responsive design verification

## Test File
Create: `tests/components/CursorOverlay/CursorOverlay.test.tsx`

## Test Cases
- Position rendering with percentages
- Click indicator appears/disappears
- Inactive state opacity
- Drag mode styling
- Responsive layout

## Related
- #203 (Test infrastructure)
- docs/TESTING_COVERAGE_PLAN.md

## Complexity
Medium Medium (estimate: 8 hours)

## Labels
- scope: frontend
- priority: medium
- type: test
```

### Issue #210: Write Component Tests for Settings Panel

```markdown
# [#210] Write Component Tests for SettingsPanel

**Target Coverage:** 70%

## Description
Create tests for settings panel controls, value updates, and persistence.

## Acceptance Criteria
- [ ] Test all settings controls render
- [ ] Test value change callbacks
- [ ] Test settings persistence
- [ ] Test form validation
- [ ] 70% coverage for SettingsPanel
- [ ] Test accessibility (keyboard nav, labels)

## Test File
Create: `tests/components/SettingsPanel/SettingsPanel.test.tsx`

## Test Cases
- All controls render
- Value changes invoke callbacks
- Sensitive settings protection
- Form validation
- Keyboard accessibility

## Related
- #203 (Test infrastructure)
- docs/TESTING_COVERAGE_PLAN.md

## Complexity
Medium Medium (estimate: 10 hours)

## Labels
- scope: frontend
- priority: medium
- type: test
```

### Issue #211: Achieve >50% Code Coverage

```markdown
# [#211] Achieve >50% Code Coverage - Final Push

## Description
Complete remaining tests to achieve overall >50% code coverage target.

## Acceptance Criteria
- [ ] Overall coverage: >50% (target: 55%+)
- [ ] Critical paths: >70% (calibration, smoothing, gestures)
- [ ] Coverage report generated and published
- [ ] GitHub Actions reports coverage on every PR
- [ ] Coverage trend improving week-over-week

## Coverage Target Breakdown
- Lines: >50%
- Functions: >50%
- Branches: >45%
- Statements: >50%

## Coverage Report
- [ ] Generate HTML coverage report
- [ ] Publish to GitHub Pages
- [ ] Add badge to README
- [ ] Create trend graph

## Verification
- [ ] `npm run test:coverage` shows >50%
- [ ] No decrease from current baseline
- [ ] Critical functions have >70% coverage

## Related
- #204-#210 (Individual test issues)
- docs/TESTING_COVERAGE_PLAN.md

## Complexity
High High (estimate: 40+ cumulative hours from #204-#210)

## Labels
- scope: frontend
- priority: high
- type: test
- milestone: Sprint9Checkpoint2
```

---

## Checkpoint 3: UI/UX Improvements (Week 35-36)

### Issue #212: Refine Accessibility & Keyboard Navigation

```markdown
# [#212] Refine Accessibility & Keyboard Navigation

## Description
Improve app accessibility to reach WCAG AA compliance and ensure keyboard navigation works for all critical flows.

## Acceptance Criteria
- [ ] All buttons/links keyboard accessible (Tab, Enter, Space)
- [ ] Focus indicators visible (outline or highlight)
- [ ] All images have alt text
- [ ] Form labels properly associated (for attribute)
- [ ] Reading order logical (semantic HTML)
- [ ] Color contrast meets WCAG AA (4.5:1 for text)
- [ ] ARIA labels where needed
- [ ] Keyboard shortcuts documented
- [ ] Screen reader tested (NVDA/JAWS)

## Testing
- [ ] Manual keyboard navigation test
- [ ] axe DevTools accessibility audit (0 errors)
- [ ] Color contrast validator
- [ ] Screen reader manual test
- [ ] WAVE Chrome extension verification

## Accessibility Checklist
- [ ] High contrast mode supported
- [ ] Font size customizable
- [ ] No keyboard traps
- [ ] Focus visible default
- [ ] Sufficient color not only indicator
- [ ] Accessible forms (labels, validation)

## Documentation
- [ ] Update ACCESSIBILITY_GUIDE.md
- [ ] Add keyboard navigation reference

## Related
- docs/ACCESSIBILITY_GUIDE.md
- WCAG 2.1 standards

## Complexity
Medium Medium (estimate: 12 hours)

## Labels
- scope: frontend
- priority: high
- type: feature
- a11y
```

### Issue #213: Improve Gesture Indicators Visibility

```markdown
# [#213] Improve Gesture Indicators Visibility

## Description
Enhance visual feedback for detected gestures with clearer animations and indicators.

## Acceptance Criteria
- [ ] Blink indicator more visible (pulse animation)
- [ ] Gesture confidence shown as percentage
- [ ] Multiple simultaneous gestures displayed without overlap
- [ ] Indicators don't obstruct main UI
- [ ] Smooth animations (no stuttering)
- [ ] Customizable indicator size/position
- [ ] Settings panel controls for visibility

## Implementation
- [ ] Add pulse/glow animation for gestures
- [ ] Show confidence percentage (0-100)
- [ ] Reposition indicators if overlapping
- [ ] Add settings: show/hide indicators, size, opacity

## Testing
- [ ] Visual regression tests (Playwright)
- [ ] Animation performance verified
- [ ] No accessibility issues introduced
- [ ] Manual testing across devices

## Visual Design
- [ ] Sketch improvements before coding
- [ ] User feedback on mockups
- [ ] Ensure doesn't distract from cursor

## Related
- GestureIndicators component
- Issue #212 (Accessibility)

## Complexity
Medium Medium (estimate: 10 hours)

## Labels
- scope: frontend
- priority: medium
- type: feature
- component: GestureIndicators
```

### Issue #214: Create Interactive Tutorial/Walkthrough

```markdown
# [#214] Create Interactive Tutorial/Walkthrough

## Description
Build guided walkthrough for new users covering calibration, gesture setup, and basic usage.

## Acceptance Criteria
- [ ] First-run detection (localStorage check)
- [ ] Step-by-step calibration guide
- [ ] Gesture explanation with video/animation
- [ ] Settings overview with tooltips
- [ ] Skip/replay tutorial available
- [ ] Completion confirmation
- [ ] Tutorial can be accessed from help menu

## Tutorial Flow
1. Welcome screen (explain purpose)
2. Calibration walkthrough (3-5 points)
3. Gesture explanation (blink, smile, etc.)
4. Test gestures with visual feedback
5. Settings overview
6. Ready to use!

## Components
- [ ] TutorialOverlay component
- [ ] TutorialStep sub-component
- [ ] Tutorial state management

## Accessibility
- [ ] Keyboard operable
- [ ] Screen reader compatible
- [ ] High contrast text
- [ ] Captions on any videos

## Testing
- [ ] Manual walkthrough as new user
- [ ] Skip feature works
- [ ] Replay feature works
- [ ] State persists correctly

## Related
- Issue #212 (Accessibility)

## Complexity
Medium Medium (estimate: 12 hours)

## Labels
- scope: frontend
- priority: medium
- type: feature
- component: UI
```

### Issue #215: Optimize Mobile Responsiveness

```markdown
# [#215] Optimize Mobile Responsiveness

## Description
Ensure app works well on mobile and tablet devices (5" to 12" screens).

## Acceptance Criteria
- [ ] Settings panel fits viewport without scrolling (or scrolls smoothly)
- [ ] Buttons minimum 44px touch target
- [ ] Text readable without zooming on mobile
- [ ] No horizontal scroll
- [ ] Camera preview fitted to screen
- [ ] Controls accessible on portrait and landscape
- [ ] Tested on actual mobile devices (not just browser emulation)

## Responsive Breakpoints
- Mobile: <768px
- Tablet: 768-1024px
- Desktop: >1024px

## Testing
- [ ] Manual testing on phone (5-6.5")
- [ ] Manual testing on tablet (9-12")
- [ ] Chrome DevTools responsive design mode
- [ ] Actual device testing (iPhone, Android)
- [ ] Landscape and portrait modes

## Performance
- [ ] Layout shift minimized (CLS <0.1)
- [ ] No layout thrashing
- [ ] Smooth scrolling on mobile

## Related
- Issue #212 (Accessibility)

## Complexity
Medium Medium (estimate: 8 hours)

## Labels
- scope: frontend
- priority: medium
- type: feature
- responsive
```

---

## Checkpoint 4: Deployment (Week 36)

### Issue #216: Create Docker Containerization

```markdown
# [#216] Create Docker Containerization

## Description
Create Dockerfile and docker-compose configuration for local and production deployment.

## Acceptance Criteria
- [ ] Dockerfile created with multi-stage build
- [ ] docker-compose.yml created for local development
- [ ] Build succeeds without errors
- [ ] Image size optimized (<100MB)
- [ ] Can run locally: `docker-compose up`
- [ ] Health check endpoint works
- [ ] Environment variables configurable
- [ ] Documented build process

## Implementation

### Dockerfile
\`\`\`dockerfile
FROM node:20-alpine AS builder
# Build stage: install deps, run tests, build
FROM nginx:alpine
# Production stage: serve with nginx
\`\`\`

### docker-compose.yml
\`\`\`yaml
version: '3.8'
services:
  nodcursor:
    build: .
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
\`\`\`

## Testing
- [ ] Docker build completes
- [ ] Image can run without errors
- [ ] localhost:80 serves app correctly
- [ ] Health endpoint returns 200

## Documentation
- [ ] Create DOCKER_SETUP_GUIDE.md
- [ ] Add Dockerfile comments
- [ ] Document environment variables

## Related
- Issue #218 (DNS deployment)
- docs/CS113_ALIGNMENT.md

## Complexity
Medium Medium (estimate: 8 hours)

## Labels
- scope: devops
- priority: high
- type: feature
```

### Issue #217: Setup nginx Reverse Proxy Configuration

```markdown
# [#217] Setup nginx Reverse Proxy Configuration

## Description
Create nginx configuration for serving app, caching, compression, and security headers.

## Acceptance Criteria
- [ ] nginx.conf created with proper directives
- [ ] Static assets cached (1 year for versioned)
- [ ] Gzip compression enabled
- [ ] Security headers present (HSTS, CSP, X-Frame-Options)
- [ ] HTTPS redirect configured
- [ ] React history API fallback for SPA routing
- [ ] Performance headers optimized
- [ ] Tested with ab (ApacheBench)

## nginx Configuration Features
- [ ] Server block for custom domain
- [ ] SSL/TLS certificate ready
- [ ] Static file handling with cache headers
- [ ] Gzip compression
- [ ] Security headers
- [ ] Proper MIME types
- [ ] Error page handling

## Performance Targets
- [ ] Load time <2s on 3G
- [ ] Gzip compression ratio >50%
- [ ] Cache hit rate >90%

## Testing
- [ ] Manual browser test
- [ ] Performance benchmark: ab -n 1000
- [ ] Security headers validation
- [ ] SSL certificate verification

## Documentation
- [ ] Document nginx configuration
- [ ] Security considerations noted
- [ ] Performance tuning guides

## Related
- Issue #216 (Docker)
- Issue #218 (DNS)

## Complexity
Medium Medium (estimate: 8 hours)

## Labels
- scope: devops
- priority: high
- type: feature
```

### Issue #218: Configure DNS and Deploy to Production

```markdown
# [#218] Configure DNS & Deploy to Production

## Description
Set up custom domain with DNS records, SSL/TLS certificate, and deploy application to live server.

## Acceptance Criteria
- [ ] Custom domain purchased or allocated
- [ ] DNS A record points to server IP
- [ ] DNS CNAME records configured
- [ ] SSL/TLS certificate installed (Let's Encrypt)
- [ ] HTTPS working (green lock in browser)
- [ ] HTTP redirects to HTTPS
- [ ] App accessible at https://example.com
- [ ] Health check passes on live server

## DNS Configuration
\`\`\`
A record: example.com → xxx.xxx.xxx.xxx (server IP)
CNAME: www.example.com → example.com
TXT: Verification records (if needed)
\`\`\`

## SSL/TLS Setup
- [ ] Certificate from Let's Encrypt (free)
- [ ] Auto-renewal configured (certbot)
- [ ] Certificate valid for domain
- [ ] Chain includes intermediate CAs

## Deployment Steps
1. SSH to production server
2. Clone repository
3. Run `docker-compose up`
4. Verify app accessible
5. Run health checks
6. Monitor logs

## Verification Checklist
- [ ] Site accessible via domain name
- [ ] HTTPS working (no security warnings)
- [ ] Application functions correctly
- [ ] No console errors in browser
- [ ] All assets load correctly
- [ ] Responsive design works on mobile

## Monitoring
- [ ] Check server uptime (99%+)
- [ ] Monitor error logs
- [ ] Performance tracking

## Documentation
- [ ] Create DEPLOYMENT_GUIDE.md
- [ ] Document deployment process
- [ ] Emergency rollback procedure

## Related
- Issue #216 (Docker)
- Issue #217 (nginx)
- Issue #219 (CI/CD Pipeline)

## Complexity
Medium Medium (estimate: 6-8 hours depending on host)

## Labels
- scope: devops
- priority: high
- type: chore
- milestone: Sprint9Checkpoint4
```

### Issue #219: Setup GitHub Actions CI/CD Pipeline

```markdown
# [#219] Setup GitHub Actions CI/CD Pipeline

## Description
Create automated testing, building, and deployment pipeline using GitHub Actions.

## Acceptance Criteria
- [ ] Workflow file created: .github/workflows/deploy.yml
- [ ] Tests run automatically on every push
- [ ] Tests must pass before deployment
- [ ] Docker image builds on merge to main
- [ ] Image pushed to Docker registry
- [ ] Production deploy on successful build
- [ ] Deployment notifications sent
- [ ] Rollback trigger available

## CI/CD Pipeline Steps
1. **Trigger**: Push to repository
2. **Test**: Run test suite (npm run test:run)
3. **Build**: Build distribution (npm run build)
4. **Docker**: Build Docker image
5. **Deploy**: SSH to server and pull new image
6. **Verify**: Health check endpoint
7. **Notify**: Slack/email notification

## Workflow Configuration
\`\`\`yaml
name: CI/CD Pipeline
on: [push, pull_request]
jobs:
  test:
    # Run tests
  build:
    # Build Docker image
  deploy:
    # Deploy to production
\`\`\`

## Testing
- [ ] Workflow triggers on push
- [ ] Tests execute
- [ ] Build succeeds
- [ ] Docker image created
- [ ] Deployment to staging completes
- [ ] Manual production approval

## Monitoring
- [ ] GitHub Actions logs visible
- [ ] Deployment notifications working
- [ ] Rollback tested manually

## Documentation
- [ ] Document CI/CD flow
- [ ] GitHub Actions configuration documented
- [ ] Troubleshooting guide

## Related
- Issue #216-218 (Deployment)
- docs/CS113_ALIGNMENT.md

## Complexity
Medium Medium (estimate: 8-10 hours)

## Labels
- scope: devops
- priority: high
- type: feature
```

---

## Milestone Summary

### Checkpoint 1 - Data Backup/Restore (3 issues)
- #200: Settings Export to JSON
- #201: Settings Import from JSON
- #202: Calibration Backup
**Effort:** 22 hours  
**Target Date:** Friday, Week 34

### Checkpoint 2 - Testing & Coverage (9 issues)
- #203: Test Infrastructure
- #204-210: Individual test implementations
- #211: Achieve >50% coverage
**Effort:** 80+ hours  
**Target Date:** Friday, Week 35

### Checkpoint 3 - UI/UX Improvements (4 issues)
- #212: Accessibility & Keyboard Nav
- #213: Gesture Indicators
- #214: Tutorial/Walkthrough
- #215: Mobile Responsiveness
**Effort:** 42 hours  
**Target Date:** Thursday, Week 35

### Checkpoint 4 - Deployment (4 issues)
- #216: Docker Containerization
- #217: nginx Configuration
- #218: DNS & Production Deploy
- #219: CI/CD Pipeline
**Effort:** 30-36 hours  
**Target Date:** Sunday, Week 36

---

## Weekly Schedule

### Week 34 (Sprint Start)
**Mon-Wed**: Checkpoint 1 (Backup/Restore)  
**Thu-Fri**: Begin Checkpoint 2 testing setup  
**Checkpoint 1 Demo**: Friday EOD

### Week 35 (Main Development)
**Mon-Wed**: Continue Checkpoint 2 (Test Implementation)  
**Wed-Thu**: Checkpoint 3 (UI/UX Improvements)  
**Thu**: Achieve >50% coverage target  
**Friday**: UI/UX Polish + Documentation  
**N@tM Demo**: Thursday 6pm (Team)

### Week 36 (Finals & Deployment)
**Mon**: Individual demo to instructor (9am)  
**Mon-Tue**: Checkpoint 4 (Deploy to Production)  
**Wed**: Blog Portfolio finalization  
**Thu**: Presentation preparation  
**Fri**: Final checklist, grade assignment  

---

## Success Criteria for Sprint 9

 **Checkpoint 1**: Data backup/restore complete and tested  
 **Checkpoint 2**: >50% code coverage achieved  
 **Checkpoint 3**: Accessibility audit passed, UI/UX polished  
 **Checkpoint 4**: Live deployment working at custom domain  
 **Blog Portfolio**: All sections published, 5000+ words  
 **GitHub**: Clean commit history, organized PRs  
 **LinkedIn**: Profile complete, project featured  
 **Demo**: Working application with smooth gesture control  

---

## Burndown Chart Template

```
Sprint 9 Velocity Tracking

Week 34: [████░░░░░░] 22/200 hours complete
Week 35: [████████░░░░] 102/200 hours complete  
Week 36: [████████️████] 200/200 hours complete (target)
```

---

## GitHub Labels

Apply these labels to issues for organization:

- `scope: frontend` / `scope: backend` / `scope: devops`
- `priority: high` / `priority: medium` / `priority: low`
- `type: feature` / `type: bug` / `type: refactor` / `type: test` / `type: docs`
- `component: SettingsPanel` / `component: CursorOverlay` / etc.
- `a11y` (accessibility)
- `responsive` (mobile/responsive design)
- `milestone: Sprint9Checkpoint1/2/3/4`

---

## Communication Plan

- **Daily Standups**: 9am each day (15 minutes)
- **Sprint Review**: Friday 3pm (show checkpoint completion)
- **N@tM Presentation**: Thursday Week 35, 6pm
- **Final Demo**: Monday Week 36, 9am
- **Blog Post Reminders**: Publish 1-2 posts per week

---

**Document Status:** v1.0 - Ready for implementation  
**Last Updated:** March 29, 2026  
**Next Step:** Create GitHub issues from this template and assign to team members

