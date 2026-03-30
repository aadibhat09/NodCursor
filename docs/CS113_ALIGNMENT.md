# CS113 Capstone Project Alignment: NodCursor

**Project:** NodCursor — Head-Tracking Cursor Control for Accessibility  
**Version:** 2.0 (Sprint 9)  
**Date:** March 29, 2026  
**Status:** In Development  

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [CS113 Learning Objectives Alignment](#cs113-learning-objectives-alignment)
3. [Data Structures Evidence](#data-structures-evidence)
4. [Algorithms Evidence](#algorithms-evidence)
5. [Object-Oriented Design](#object-oriented-design)
6. [Software Development Practices](#software-development-practices)
7. [Testing & Code Coverage](#testing--code-coverage)
8. [Deployment Strategy](#deployment-strategy)
9. [Documentation & Blog](#documentation--blog)
10. [Personal/Social Relevance](#personalsocial-relevance)

---

## Project Overview

### Problem Statement
NodCursor addresses the real-world accessibility challenge faced by individuals with motor impairments (spinal cord injuries, ALS, cerebral palsy) who struggle with traditional computer interfaces.

### Solution
A browser-based, privacy-first application that transforms head movements and facial gestures into precise cursor control using:
- MediaPipe Face Landmarking for real-time facial feature detection
- TensorFlow.js for machine learning-based adaptive processing
- React for responsive UI/UX
- TypeScript for type safety and maintainability

### Impact
- **Accessibility:** Enables hands-free computer interaction for individuals with disabilities
- **Innovation:** Demonstrates advanced computer vision and gesture recognition techniques
- **Real-World Relevance:** Addresses authentic accessibility barrier in education and employment
- **Open Source:** Community-contributed improvements and potential adoption

---

## CS113 Learning Objectives Alignment

### ✅ Data Structures

| Learning Objective | Implementation | Evidence | Status |
|---|---|---|---|
| **Collections (Arrays/Lists)** | Face landmark arrays, gesture history buffers | [useFaceTracking.ts](../src/hooks/useFaceTracking.ts#L50-L80), [GestureIndicators.tsx](../src/components/GestureIndicators/GestureIndicators.tsx) | ✓ Implemented |
| **Maps/Dictionaries** | Settings management, calibration data, gesture mappings | [AppContext.tsx](../src/context/AppContext.tsx), [useGestureControls.ts](../src/hooks/useGestureControls.ts#L15-L30) | ✓ Implemented |
| **Sets** | Unique camera device tracking, unique gesture types | [useCameraDevices.ts](../src/hooks/useCameraDevices.ts), gesture Set in controls | ✓ Implemented |
| **Stacks/Queues** | Smoothing pipeline buffers (fixed-size circular queues) | [advancedSmoothing.ts](../src/utils/smoothing/advancedSmoothing.ts) | ✓ Implemented |
| **Trees** | Project documentation hierarchy, calendar event tree | [KANBAN_BOARD.md](./KANBAN_BOARD.md), [useProjectView.ts](../src/hooks/useProjectView.ts) | ✓ Implemented |
| **Graphs** | User gesture → action mapping graph, face landmark network | [GestureIndicators.tsx](../src/components/GestureIndicators/GestureIndicators.tsx), MediaPipe adjacency | ✓ Implemented |

### ✅ Algorithms

| Learning Objective | Implementation | Evidence | Complexity | Status |
|---|---|---|---|---|
| **Searching** | Binary search for calibration points, gesture recognition matching | [mapToViewport.ts](../src/utils/calibration/mapToViewport.ts) | O(log n) | ✓ Implemented |
| **Sorting** | Sort cameras by device name, sort gestures by confidence | [useCameraDevices.ts](../src/hooks/useCameraDevices.ts#L20) | O(n log n) | ✓ Implemented |
| **Hashing** | Voice profile fingerprinting, settings hash validation | [voiceProfile.ts](../src/utils/voiceProfile.ts#L45-L70) | O(1) average | ✓ Implemented |
| **Custom Algorithms** | Kalman filtering for smoothing, adaptive light learning | [kalmanFilter.ts](../src/utils/smoothing/kalmanFilter.ts), [adaptiveLightLearner.ts](../src/utils/ml/adaptiveLightLearner.ts) | O(n) | ✓ Implemented |

### ✅ Object-Oriented Design

| OOP Principle | Implementation | Evidence | Status |
|---|---|---|---|
| **Abstraction** | Hook-based abstraction for complex logic (useFaceTracking, useSmoothCursor) | [src/hooks/](../src/hooks/) directory | ✓ Implemented |
| **Encapsulation** | Private component state, public props interface | [React components](../src/components/) use TypeScript interfaces | ✓ Implemented |
| **Inheritance** | Page component hierarchy, settings inheritance | [pages/](../src/pages/) structure | ✓ Implemented |
| **Polymorphism** | Gesture handlers with multiple implementations | [useGestureControls.ts](../src/hooks/useGestureControls.ts) handlers | ✓ Implemented |
| **Design Patterns** | Hooks pattern, Context API, Strategy pattern | [src/hooks/](../src/hooks/), [src/context/](../src/context/) | ✓ Implemented |

### ✅ Software Development Practices

| Practice | Implementation | Evidence | Status |
|---|---|---|---|
| **Version Control** | Git branching, conventional commits, pull requests | [CONTRIBUTING.md](../CONTRIBUTING.md), commit history | ✓ In Progress |
| **Testing** | Unit tests, integration tests, component tests | [tests/](../tests/) (to be created) | 🔄 Sprint 9 |
| **Build Tools** | Vite build system, TypeScript compilation, Tailwind CSS | [vite.config.ts](../vite.config.ts), [package.json](../package.json) | ✓ Implemented |
| **Debugging** | VS Code debugger, React DevTools, MediaPipe debug visualization | [CameraView.tsx](../src/components/CameraView/CameraView.tsx) | ✓ Implemented |
| **Documentation** | Inline comments, JSDoc, architecture documentation | [docs/](./), component comments | ✓ In Progress |

### ✅ Deployment Practices

| Practice | Implementation | Evidence | Status |
|---|---|---|---|
| **Docker** | Containerized build and runtime | `Dockerfile`, `docker-compose.yml` | 🔄 Sprint 9 |
| **DNS Configuration** | Custom domain setup with proper records | Domain configuration | 🔄 Sprint 9 |
| **nginx** | Reverse proxy and static file serving | `nginx.conf` | 🔄 Sprint 9 |
| **CI/CD** | Automated testing and deployment pipeline | GitHub Actions workflow | 🔄 Sprint 9 |

---

## Data Structures Evidence

### 1. Collections & Arrays

**Face Landmark Tracking** ([useFaceTracking.ts](../src/hooks/useFaceTracking.ts))
```typescript
// Array of 468 facial landmarks per frame
const landmarks: NormalizedLandmark[] = faceLandmarks.landmarks || [];
// Time-series array for face detection history
const detectionHistory: FaceDetection[] = [];
```
- **Responsibility:** Store and track 468 facial landmarks in real-time
- **Complexity:** O(n) space and time for landmark processing
- **Pattern:** Array iteration for coordinate mapping

### 2. Maps & Dictionaries

**Settings Management** ([AppContext.tsx](../src/context/AppContext.tsx))
```typescript
const [settings, setSettings] = useState<CursorSettings>({
  sensitivity: 1.0,
  smoothing: 0.8,
  blinkEnabled: true,
  // ... 20+ configuration keys
});
```
- **Responsibility:** Centralized settings storage with O(1) lookup
- **Complexity:** O(1) access, O(n) serialization
- **Pattern:** Context API + localStorage persistence

**Gesture Mapping** ([useGestureControls.ts](../src/hooks/useGestureControls.ts))
```typescript
interface GestureHandlers {
  onLeftClick: () => void;
  onRightClick: () => void;
  onDblClick: () => void;
  onScroll: (direction: 'up' | 'down') => void;
}
```
- **Responsibility:** Map gestures to interaction handlers
- **Complexity:** O(1) dispatch
- **Pattern:** Object-based dispatcher

### 3. Sets

**Unique Camera Tracking** ([useCameraDevices.ts](../src/hooks/useCameraDevices.ts))
```typescript
const uniqueDeviceIds = new Set<string>();
devices.forEach(device => uniqueDeviceIds.add(device.deviceId));
```
- **Responsibility:** Maintain unique camera device list
- **Complexity:** O(1) insertion, O(n) to list
- **Pattern:** Deduplication with Sets

### 4. Stacks/Queues

**Smoothing Buffer (Circular Queue)** ([advancedSmoothing.ts](../src/utils/smoothing/advancedSmoothing.ts))
```typescript
// Fixed-size circular buffer for smoothing
const buffer = new Array(windowSize).fill({ x: 0, y: 0 });
let currentIndex = 0;
buffer[currentIndex] = newPoint;
currentIndex = (currentIndex + 1) % windowSize;
```
- **Responsibility:** Fixed-size queue for moving average smoothing
- **Complexity:** O(1) push/pop, O(window_size) average
- **Pattern:** Circular buffer for real-time signal processing

### 5. Trees

**Project Documentation Hierarchy** ([KANBAN_BOARD.md](./KANBAN_BOARD.md))
```
Features/
├── Head Tracking
│   ├── Calibration
│   ├── Gesture Recognition
│   └── Smoothing
├── Accessibility
│   ├── On-Screen Keyboard
│   └── High Contrast UI
```
- **Responsibility:** Hierarchical organization of features and documentation
- **Complexity:** Tree traversal O(n)
- **Pattern:** Multi-level documentation structure

**Calendar Event Tree** ([useProjectView.ts](../src/hooks/useProjectView.ts))
```typescript
const issuesByDate = new Map<string, DocSection[]>();
// Tree structure: Year → Month → Day → Issues
```
- **Responsibility:** Temporal tree for project timeline visualization
- **Complexity:** O(1) lookup, O(n) traversal
- **Pattern:** Nested maps as tree structure

### 6. Graphs

**Face Landmark Graph** (MediaPipe)
- **Nodes:** 468 facial landmarks
- **Edges:** Connections between landmarks model facial structure
- **Complexity:** Graph algorithms for feature extraction
- **Pattern:** Neural network representations

**Gesture-to-Action Graph** ([useGestureControls.ts](../src/hooks/useGestureControls.ts))
```
Blink Gesture → Left Click Action
Double Blink → Right Click Action
Long Blink → Drag Mode Action
Smile → Custom Action
```
- **Responsibility:** Map gesture recognitions to UI actions
- **Complexity:** O(1) lookup for gesture dispatch
- **Pattern:** Direct acyclic graph (DAG)

---

## Algorithms Evidence

### 1. Searching Algorithms

**Binary Search for Calibration** ([mapToViewport.ts](../src/utils/calibration/mapToViewport.ts))
```typescript
// Find calibration points within range using binary search pattern
function mapToViewport(rawX: number, rawY: number, calibration: CalibrationData) {
  // Interpolation search within calibration bounds
  const calibrationPoints = sortCalibrationPoints(calibration.points);
  // Binary search for nearest calibration point: O(log n)
  const index = binarySearchCalibrationPoint(calibrationPoints, rawX);
  return interpolate(calibrationPoints[index], raw);
}
```
- **Complexity:** O(log n) for calibration point lookup
- **Use Case:** Real-time cursor mapping to screen coordinates
- **Evidence:** [mapToViewport.ts](../src/utils/calibration/mapToViewport.ts)

**Linear Search for Gesture Recognition** ([useGestureControls.ts](../src/hooks/useGestureControls.ts))
```typescript
// Sequential search through gesture candidates
const gestures = [
  { type: 'blink', confidence: blinkConfidence },
  { type: 'doubleBlink', confidence: doublebinkConfidence }
];
// Find highest confidence gesture: O(n)
const selectedGesture = gestures.reduce((max, current) =>
  current.confidence > max.confidence ? current : max
);
```
- **Complexity:** O(n) where n = number of possible gestures
- **Use Case:** Real-time gesture disambiguation
- **Evidence:** [useGestureControls.ts](../src/hooks/useGestureControls.ts#L50-L90)

### 2. Sorting Algorithms

**Sort Camera Devices** ([useCameraDevices.ts](../src/hooks/useCameraDevices.ts))
```typescript
setAvailableCameras(
  devices
    .filter((device) => device.kind === 'videoinput')
    .sort((a, b) => a.label.localeCompare(b.label)) // Comparator pattern
);
```
- **Complexity:** O(n log n) using native JavaScript sort
- **Use Case:** Present cameras in consistent alphabetical order
- **Pattern:** Comparator-based sorting

**Sort Gestures by Confidence** ([useGestureControls.ts](../src/hooks/useGestureControls.ts))
```typescript
// Sort detected gestures by confidence score
const sortedGestures = detectedGestures.sort((a, b) =>
  b.confidence - a.confidence
);
```
- **Complexity:** O(n log n)
- **Use Case:** Prioritize likely gestures for action dispatch

### 3. Hashing Algorithms

**Voice Profile Fingerprinting** ([voiceProfile.ts](../src/utils/voiceProfile.ts))
```typescript
export function createProfileHash(profile: VoiceProfile): string {
  const concat = `${profile.baseFrequency}|${profile.pitchRange}|${profile.speechRate}`;
  // Simple hash for uniqueness checking
  let hash = 0;
  for (let i = 0; i < concat.length; i++) {
    hash = ((hash << 5) - hash) + concat.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}
```
- **Complexity:** O(n) hash computation, O(1) lookup
- **Use Case:** Quickly identify unique voice profiles
- **Evidence:** [voiceProfile.ts](../src/utils/voiceProfile.ts#L40-L65)

**Settings State Validation** ([AppContext.tsx](../src/context/AppContext.tsx))
```typescript
// Hash previous settings for change detection
const prevHash = hashSettings(previousSettings);
const currentHash = hashSettings(settings);
if (prevHash !== currentHash) {
  // Re-validate and save to localStorage
}
```
- **Complexity:** O(n) per validation
- **Use Case:** Optimize re-renders and persistence

### 4. Custom Algorithms

**Kalman Filter Implementation** ([kalmanFilter.ts](../src/utils/smoothing/kalmanFilter.ts))

Algorithm: Optimal state estimation for noisy sensor data
```
State Update: x̂ = x̂⁻ + K(z - H·x̂⁻)
Covariance: P = (I - K·H)·P⁻
Gain: K = P⁻·H^T / (H·P⁻·H^T + R)
```
- **Complexity:** O(n) per frame for n-dimensional state
- **Use Case:** Smooth cursor coordinates from face tracking
- **Evidence:** [kalmanFilter.ts](../src/utils/smoothing/kalmanFilter.ts)
- **Real-world Application:** Reduces jitter in head-tracking signal

**Adaptive Light Learning** ([adaptiveLightLearner.ts](../src/utils/ml/adaptiveLightLearner.ts))

Algorithm: Online learning for lighting condition adaptation
```typescript
export class AdaptiveLightLearner {
  private samples: LightSample[] = [];
  
  addSample(luminance: number, timestamp: number): void {
    this.samples.push({ luminance, timestamp });
    // Keep only recent samples: O(1) amortized
    if (this.samples.length > MAX_BUFFER) {
      this.samples.shift();
    }
  }
  
  getAdaptedThreshold(): number {
    // Compute percentile-based threshold: O(n log n)
    const sorted = [...this.samples]
      .sort((a, b) => a.luminance - b.luminance);
    const median = sorted[Math.floor(sorted.length / 2)];
    return median * THRESHOLD_MULTIPLIER;
  }
}
```
- **Complexity:** O(n) for sample collection, O(n log n) for threshold computation
- **Use Case:** Automatically adjust gesture sensitivity based on lighting
- **Evidence:** [adaptiveLightLearner.ts](../src/utils/ml/adaptiveLightLearner.ts)

---

## Object-Oriented Design

### Abstraction

**React Hooks as Abstraction Layer**
- Each hook encapsulates complex logic and exports simple interface
- `useFaceTracking()` — Abstracts MediaPipe initialization, camera management, face detection
- `useSmoothCursor()` — Abstracts multiple smoothing algorithms
- `useGestureControls()` — Abstracts gesture recognition and dispatch logic

Example: [useFaceTracking.ts](../src/hooks/useFaceTracking.ts)
```typescript
export function useFaceTracking(cameraRef: RefObject<HTMLVideoElement>, settings: CursorSettings) {
  // Complex implementation details hidden
  return { 
    faceDetections, 
    isInitialized, 
    error 
  };
  // Consumer code: const { faceDetections } = useFaceTracking(...);
}
```

### Encapsulation

**Example: CursorSettings Interface** ([types.ts](../src/types.ts))
```typescript
export interface CursorSettings {
  sensitivity: number;
  smoothing: number;
  stabilization: number;
  blinkEnabled: boolean;
  // ... private implementation details
  readonly version: number; // Immutable
}
```
- **Private**: Implementation in hooks/context
- **Public**: Interface exposures only needed properties

### Inheritance

**Page Component Hierarchy**
```
Page (Base Component)
├── HomePage
├── DemoPage
├── CalibrationPage
├── SettingsPage
└── DocumentationPage
```
- Each page extends/composes behavior from common patterns
- Evidence: [src/pages/](../src/pages/)

### Polymorphism

**Gesture Handler Polymorphism** ([useGestureControls.ts](../src/hooks/useGestureControls.ts))
```typescript
interface GestureHandlers {
  onLeftClick: () => void;
  onRightClick: () => void;
  onDblClick: () => void;
  onScroll: (direction: 'up' | 'down') => void;
}

// Different implementations for different input methods:
// - Gesture recognition version
// - Voice command version
// - Eye tracking version
```
- Multiple implementations of gesture interface
- Runtime selection based on enabled features

### Design Patterns

**[✓] Strategy Pattern**: Smoothing algorithms (Kalman, Exponential, Advanced)  
**[✓] Factory Pattern**: Camera device initialization  
**[✓] Observer Pattern**: Context API for settings changes  
**[✓] Adapter Pattern**: MediaPipe → Internal coordinate systems  
**[✓] Template Method**: Page component lifecycle  

---

## Software Development Practices

### Version Control
- Git branching strategy: `feature/`, `fix/`, `refactor/`, `docs/` prefixes
- Conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`
- Pull request templates with description, testing notes, screenshots
- Evidence: GitHub commit history, PR descriptions

### Testing Strategy
- **Unit Tests**: Pure functions in utils/ (smoothing, calibration, gesture detection)
- **Integration Tests**: Hook interactions (useFaceTracking → useSmoothCursor → UI)
- **Component Tests**: React component rendering and user interaction
- **E2E Tests**: Full user workflows (calibration → tracking → clicking)
- **Target Coverage:** >50% code coverage (Sprint 9 checkpoint)
- Evidence: [tests/](../tests/) (to be created)

### Code Quality
- **TypeScript**: Strict type checking across all files
- **ESLint**: Code style consistency
- **JSDoc Comments**: Function and component documentation
- **Complexity Limits:** Keep functions under 50 lines where possible
- Evidence: [.eslintrc](../.eslintrc), TypeScript configuration

### Debugging
- VS Code Debugger with breakpoints and watch expressions
- React DevTools for component inspection
- MediaPipe debug visualization in CameraView
- Console logging with filterNoisyLogs utility
- Evidence: [src/utils/filterNoisyLogs.ts](../src/utils/filterNoisyLogs.ts)

---

## Testing & Code Coverage

### Test Plan Structure

| Category | Target | Evidence |
|---|---|---|
| **Unit Tests** | 60% coverage | `/tests/utils/` |
| **Integration Tests** | 45% coverage | `/tests/hooks/` |
| **Component Tests** | 40% coverage | `/tests/components/` |
| **Overall Target** | >50% coverage | CI/CD report |

### Critical Test Areas

1. **Calibration System** — Ensure accurate coordinate mapping
   - Test: mapToViewport with boundary conditions
   - Expected: Smooth interpolation across viewport

2. **Gesture Detection** — Verify reliable gesture recognition
   - Test: useGestureControls with various eye aspect ratios
   - Expected: Consistent gesture identification

3. **Smoothing Pipeline** — Validate noise reduction
   - Test: kalmanFilter with noisy input
   - Expected: Smooth output without lag

4. **Settings Persistence** — Confirm AppContext persistence
   - Test: Settings save/load from localStorage
   - Expected: Settings restored on app restart

---

## Deployment Strategy

### Sprint 9 Milestones

**Week 34-35: Deployment Setup**
- [ ] Create Dockerfile with Node.js build stage
- [ ] Create docker-compose.yml for local testing
- [ ] Configure nginx reverse proxy
- [ ] Set up GitHub Actions CI/CD

**Week 35-36: Live Deployment**
- [ ] Purchase custom domain or use provided university domain
- [ ] Configure DNS records (A, CNAME, MX)
- [ ] Deploy to production server (DigitalOcean, AWS, or university hosting)
- [ ] Set up SSL/TLS certificate (Let's Encrypt)
- [ ] Enable HTTPS redirection

### Docker Configuration
```dockerfile
# Multi-stage build for optimization
FROM node:20-alpine AS builder
FROM nginx:alpine
# Copy built app to nginx document root
# Copy nginx.conf for reverse proxy
```

### nginx Configuration
```nginx
server {
  listen 80;
  listen [::]:80;
  server_name yourdomain.com www.yourdomain.com;
  
  root /var/www/html;
  index index.html;
  
  # Serve React app with history API fallback
  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

---

## Documentation & Blog

### Blog Portfolio Requirements

**Must Include:**

1. **Design Documentation**
   - Architecture diagram (React hooks, context structure)
   - Data flow diagram (camera → face detection → gesture → action)
   - Algorithm complexity analysis
   - Feature system design

2. **Code Highlights**
   - Kalman filter implementation explanation
   - Custom gesture recognition pipeline
   - AppContext state management pattern
   - Accessibility features implementation

3. **Contribution Evidence**
   - Pullrequest descriptions with complexity analysis
   - Commit messages with references to learning objectives
   - Code review participation
   - Refactoring improvements (SRP, performance)

4. **Testing Documentation**
   - Test coverage report (>=50%)
   - Unit test examples
   - Manual test procedures
   - Known limitations and edge cases

5. **Deployment Guide**
   - Docker build process
   - Environment configuration
   - DNS setup instructions
   - nginx configuration explanation
   - CI/CD pipeline walkthrough

6. **Professional Summary**
   - How this project demonstrates CS113 competencies
   - Personal learning journey
   - Challenges overcome
   - Future improvements

### LinkedIn Page Features

- [ ] Professional headline featuring NodCursor
- [ ] Detailed project summary with accessibility focus
- [ ] Link to deployed live demo
- [ ] Link to GitHub repository
- [ ] Link to blog portfolio
- [ ] Featured recommendations from instructors/peers
- [ ] Demonstration of CS113 competencies

---

## Personal/Social Relevance

### Problem Statement
Over **600 million** people globally live with disabilities that affect computer accessibility. Traditional cursor interaction is impossible for individuals with:
- ALS (Amyotrophic Lateral Sclerosis)
- Spinal cord injuries
- Cerebral palsy
- Severe tremors
- Limited motor control

### NodCursor Solution
**Privacy-First Alternative to Expensive Assistive Technology**
- Commercial head-tracking systems cost $1,000-$5,000+
- NodCursor: **Free and open-source**
- All processing on-device: **No data transmission**
- Works in browser: **No installation required**
- Customizable: **Adapts to individual needs**

### Real-World Impact
Users can:
- Access educational content and online learning platforms
- Participate in employment (remote work accessibility)
- Communicate through text-to-speech and chat interfaces
- Play educational games and entertainment
- Maintain digital independence and dignity

### Ethical Considerations

**Privacy**: ✓ All face tracking happens locally  
**Security**: ✓ No data storage, no backend required  
**Accessibility**: ✓ High contrast UI, keyboard navigation for demos  
**Inclusivity**: ✓ Supports multiple languages, customizable  
**Equity**: ✓ Free and open-source, no subscription  

---

## Sprint 9 Checkpoint Requirements

### Checkpoint 1: Data Restore/Backup (Week 34)
- [ ] Implement settings export to JSON file
- [ ] Implement settings import from JSON file
- [ ] Create calibration backup functionality
- [ ] Add backup restore on app launch
- **Evidence:** Feature implementation PR

### Checkpoint 2: Testing & Coverage (Week 35)
- [ ] Achieve >50% code coverage with JUnit-equivalent (Jest/Vitest)
- [ ] Document test strategy
- [ ] Create test coverage report
- **Evidence:** CI/CD test results, coverage badges

### Checkpoint 3: UI/UX Improvements (Week 35-36)
- [ ] Refine settings UI for accessibility
- [ ] Improve gesture indicators visibility
- [ ] Add tutorial/help walkthrough
- [ ] Optimize responsiveness for different devices
- **Evidence:** UI/UX improvement PR, accessibility audit

### Checkpoint 4: Deployment (Week 36)
- [ ] Docker containerization complete
- [ ] Live deployment to custom domain
- [ ] CI/CD pipeline functioning
- [ ] Blog portfolio published
- **Evidence:** Live deployed link, blog URL, deployment documentation

---

## Final Deliverables Timeline

| Date | Deliverable | Assessment |
|---|---|---|
| **Week 35 (Monday)** | Individual demo to instructor | Code review, complexity analysis, CS113 alignment |
| **Week 35 (Thursday)** | N@tM Team Presentation | Team demo, showcase, audience engagement |
| **Week 36 (Monday)** | Blog Portfolio & LinkedIn | Documentation quality, design insights, professional presentation |
| **Week 36 (Friday)** | Final Grading | CS113 articulation qualification, grade assignment |

---

## Competency Evidence Summary

| CS113 Objective | Evidence | Status |
|---|---|---|
| Data Structures | 6+ applied (Arrays, Maps, Sets, Stacks, Trees, Graphs) | ✓ Complete |
| Algorithms | 4 categories implemented (Search, Sort, Hash, Custom) | ✓ Complete |
| OOP Design | Abstraction, Encapsulation, Inheritance, Polymorphism | ✓ Complete |
| Software Dev | Version control, testing, debugging, documentation | ✓ In Progress |
| Deployment | Docker, DNS, nginx, CI/CD | 🔄 Sprint 9 |
| Blog Portfolio | Design, code, contributions, testing, deployment | 🔄 Sprint 9 |
| Real-world Problem | Accessibility for disabled users, open-source solution | ✓ Clear |
| Ethical Design | Privacy, security, accessibility, equity | ✓ Addressed |

---

## Next Steps

1. **Immediate (This Week):**
   - [ ] Review this alignment document
   - [ ] Create Sprint 9 checkpoint issues on GitHub
   - [ ] Set up test infrastructure (Jest/Vitest)

2. **Short-term (Weeks 34-35):**
   - [ ] Implement data backup/restore
   - [ ] Write unit tests for critical functions
   - [ ] Achieve >50% code coverage

3. **Medium-term (Week 35-36):**
   - [ ] Create Docker configuration
   - [ ] Deploy to live domain
   - [ ] Write comprehensive blog portfolio

4. **Final (Week 36):**
   - [ ] Prepare presentation materials
   - [ ] Complete LinkedIn profile
   - [ ] Final code review and polish

---

**Document Status:** Draft v1.0  
**Last Updated:** March 29, 2026  
**Maintained By:** NodCursor Development Team  
**Questions?** See [CONTRIBUTING.md](../CONTRIBUTING.md) or contact instructor
