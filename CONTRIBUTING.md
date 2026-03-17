# Contributing to NodCursor

Thank you for your interest in contributing to NodCursor! This document provides guidelines and instructions for contributing to the project.

---

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Testing Guidelines](#testing-guidelines)
6. [Submitting Changes](#submitting-changes)
7. [Accessibility Considerations](#accessibility-considerations)

---

## Code of Conduct

### Our Pledge

NodCursor is an accessibility-focused project. We are committed to providing a welcoming and supportive environment for all contributors, especially those with disabilities.

### Expected Behavior

- Be respectful and inclusive
- Welcome newcomers and first-time contributors
- Prioritize accessibility in all contributions
- Provide constructive feedback
- Focus on what is best for the community

### Unacceptable Behavior

- Harassment or discrimination of any kind
- Trolling or inflammatory comments
- Publishing others' private information
- Any conduct that could reasonably be considered inappropriate

---

## Getting Started

### Prerequisites

- Node.js 18.x or 20.x
- npm 9.x or later
- Git
- A webcam for testing tracking features
- Chrome or Edge browser (recommended for development)

### Initial Setup

1. **Fork the Repository**
   ```bash
   # On GitHub, click "Fork" button
   # Then clone your fork:
   git clone https://github.com/YOUR_USERNAME/NodCursor.git
   cd NodCursor
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Verify Setup**
   - Open http://localhost:5173
   - Navigate to `/calibration`
   - Ensure camera feed appears
   - Complete calibration
   - Test in `/demo` page

### Project Structure

```
NodCursor/
├── src/
│   ├── components/      # React components
│   ├── context/         # React context providers
│   ├── hooks/           # Custom React hooks
│   ├── pages/           # Page components
│   ├── styles/          # Global styles
│   ├── types.ts         # TypeScript types
│   ├── utils/           # Utility functions
│   └── workers/         # Web Workers
├── docs/                # Documentation
├── public/              # Static assets
└── tests/               # Test files (future)
```

---

## Development Workflow

### Branching Strategy

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/feature-name` - New features
- `fix/bug-name` - Bug fixes
- `docs/topic-name` - Documentation updates

### Creating a Feature Branch

```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
```

### Making Changes

1. Make your changes in focused, logical commits
2. Test your changes thoroughly
3. Update documentation if needed
4. Run type checking: `npm run type-check`
5. Build to verify: `npm run build`

### Commit Messages

Use clear, descriptive commit messages:

```
feat: add eye-tracking mode toggle
fix: prevent cursor drift during long sessions
docs: update calibration tutorial in accessibility guide
refactor: extract gesture state machine to hook
perf: optimize MediaPipe landmark processing
```

**Commit Message Format:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

---

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define explicit types for function parameters and return values
- Avoid `any` - use `unknown` or proper types instead
- Use interfaces for object shapes

**Example:**
```typescript
// Good
interface GestureState {
  blinking: boolean;
  mouthOpen: boolean;
  smiling: boolean;
}

function processGesture(state: GestureState): void {
  // ...
}

// Bad
function processGesture(state: any) {
  // ...
}
```

### React

- Use functional components with hooks
- Use custom hooks for reusable logic
- Memoize expensive computations with `useMemo`
- Use `useCallback` for event handlers passed as props
- Keep components focused and single-purpose

**Example:**
```typescript
// Good
const MyComponent: React.FC<Props> = ({ data }) => {
  const processedData = useMemo(
    () => expensiveComputation(data),
    [data]
  );

  return <div>{processedData}</div>;
};

// Bad
const MyComponent = (props: any) => {
  const processedData = expensiveComputation(props.data); // Runs every render
  return <div>{processedData}</div>;
};
```

### Styling

- Use Tailwind CSS utility classes
- Avoid inline styles (except for dynamic transforms)
- Use semantic color tokens from `tailwind.config.ts`
- Maintain high contrast for accessibility

**Example:**
```tsx
// Good
<button className="bg-app-primary text-white px-4 py-2 rounded-lg">
  Click Me
</button>

// Bad
<button style={{ backgroundColor: '#0ea5e9' }}>
  Click Me
</button>
```

### File Organization

- One component per file
- Co-locate related utilities with components
- Use `index.ts` for barrel exports when appropriate
- Keep files under 300 lines when possible

### Performance

- Use Web Workers for intensive computations
- Prefer CSS transforms over layout properties (left/top)
- Debounce rapid events (voice commands, gestures)
- Use `will-change` for animated elements

---

## Testing Guidelines

### Manual Testing Checklist

Before submitting a PR, test the following:

**Camera & Tracking:**
- [ ] Camera feed displays correctly
- [ ] Face mesh overlays appear (if visible)
- [ ] Multiple camera devices selectable
- [ ] Tracking continues after camera switch

**Calibration:**
- [ ] All 5 calibration steps complete
- [ ] Progress bar updates correctly
- [ ] Settings persist after refresh
- [ ] Re-calibration works without page reload

**Gestures:**
- [ ] Single blink triggers click
- [ ] Double blink triggers right-click
- [ ] Long blink toggles drag mode
- [ ] Mouth gestures work (if enabled)
- [ ] Voice commands work (Chrome/Edge)

**Keyboard Typing:**
- [ ] Keyboard appears/disappears
- [ ] Mouth open advances keys
- [ ] Smile selects key
- [ ] Double blink backspaces
- [ ] Text area shows typed characters

**Settings:**
- [ ] All sliders update values
- [ ] Toggles enable/disable features
- [ ] Settings persist to localStorage
- [ ] Camera selection updates globally

**Performance:**
- [ ] Maintains 30+ FPS
- [ ] No significant memory leaks (check DevTools)
- [ ] CPU usage reasonable (<30% on modern hardware)
- [ ] No console errors or warnings

### Automated Testing (Future)

We plan to add:
- Unit tests for hooks and utilities
- Integration tests for gesture detection
- E2E tests for full workflows
- Accessibility testing with axe-core

---

## Submitting Changes

### Pull Request Process

1. **Update Documentation**
   - Add/update relevant docs in `docs/`
   - Update README if adding major features
   - Include inline code comments for complex logic

2. **Create Pull Request**
   ```bash
   git push origin feature/your-feature-name
   # Then open PR on GitHub
   ```

3. **PR Description Template**
   ```markdown
   ## Description
   Brief summary of changes

   ## Motivation
   Why is this change needed?

   ## Changes
   - List of specific changes
   - Include screenshots/videos for UI changes

   ## Testing
   How did you test this?

   ## Accessibility Impact
   How does this affect accessibility?

   ## Checklist
   - [ ] Code builds without errors
   - [ ] TypeScript types are correct
   - [ ] Documentation updated
   - [ ] Works in Chrome/Edge
   - [ ] Manually tested all affected features
   - [ ] No new console warnings/errors
   ```

4. **Code Review**
   - Address reviewer feedback promptly
   - Make requested changes in new commits
   - Re-test after making changes
   - Update PR description if scope changes

5. **Merging**
   - PRs require at least one approval
   - CI checks must pass
   - Squash commits when merging to `develop`

---

## Accessibility Considerations

**NodCursor is assistive technology. Accessibility is not optional.**

### Design Principles

1. **Multiple Input Methods**
   - Always provide alternatives (gestures + voice + dwell)
   - Never rely on a single interaction method
   - Make all methods independently toggleable

2. **Adjustability**
   - Provide wide ranges for all settings
   - No time-limited actions
   - Allow users to find what works for them

3. **Visual Feedback**
   - High contrast (minimum 4.5:1)
   - Clear state indicators
   - Visual confirmation of actions
   - Large touch targets (44x44px minimum)

4. **Performance**
   - Maintain 30+ FPS minimum
   - Keep latency under 100ms
   - Optimize for low-end hardware
   - Progressive enhancement

### Accessibility Testing

When adding features, consider:

**Motor Disabilities:**
- Can this be controlled with head movement only?
- Are there alternatives to precise movements?
- Is there enough time for actions?

**Visual Impairments:**
- Is contrast sufficient?
- Are text sizes readable?
- Do colors convey meaning alone?

**Cognitive Load:**
- Is the interface predictable?
- Are instructions clear?
- Is feedback immediate and understandable?

**Fatigue:**
- Can users take breaks easily?
- Are there shortcuts for common actions?
- Can settings reduce physical effort?

---

## Quick Contribution Ideas

Don't know where to start? Here are some ideas:

**Easy:**
- Fix typos in documentation
- Improve error messages
- Add code comments
- Update screenshots/videos
- Test on different hardware

**Medium:**
- Add new calibration presets
- Improve gesture detection thresholds
- Enhance visual feedback
- Optimize performance
- Add keyboard shortcuts

**Hard:**
- Implement eye-tracking mode
- Add custom gesture builder
- Multi-monitor support
- Mobile device support
- Integration with platform AT

---

## Getting Help

- **Questions**: Open a GitHub Discussion
- **Bugs**: Create a GitHub Issue with template
- **Features**: Discuss in Issues before implementing
- **Accessibility Feedback**: Highly valued - share your experience!

---

## Recognition

All contributors are recognized in:
- GitHub contributors page
- README acknowledgments section
- Release notes for significant contributions

### Current Named Contributors

- aadibhat09 (aadibhat09@gmail.com)
- SanPranav (pranavs22638@gmail.com)

---

## License

By contributing to NodCursor, you agree that your contributions will be licensed under the MIT License (see [LICENSE](LICENSE) file).

---

**Thank you for helping make the web more accessible!**
