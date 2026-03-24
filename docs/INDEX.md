# NodCursor Documentation Index

Complete guide to all NodCursor documentation, organized by topic.

---

## Architecture & Design

### [DESIGN_PRINCIPLES.md](DESIGN_PRINCIPLES.md)
**Comprehensive guide to NodCursor's architectural principles and best practices**

- Single Responsibility Principle (SRP) explained with examples
- Component architecture (presentation, container, feature components)
- Hook organization and best practices
- State management patterns
- Current architecture health assessment
- Refactoring roadmap (3 phases)
- Guidelines for new code
- Testing guidelines

**Read this if:** You're contributing code, reviewing PRs, or trying to understand the codebase structure.

---

### [SRP_ANALYSIS.md](SRP_ANALYSIS.md)
**Quick reference for current SRP compliance across the codebase**

- Overview score: 70% compliant
- Component health report (Excellent/Moderate/Minor issues)
- Current violations and their solutions
- Red flags to avoid
- Migration path recommendations
- Code quality before/after assessment
- Quick assessment tool

**Read this if:** You want a quick summary of what needs refactoring, or want to audit new code.

---

### [SRP_REFACTORING_GUIDE.md](SRP_REFACTORING_GUIDE.md)
**Step-by-step refactoring instructions with code examples**

- Phase 1: Hook extraction (High-value, lower-risk)
  - Extract useMediaPipeModel
  - Extract useCameraStream
  - Extract useTrackingWorker
  - Refactor useFaceTracking
- Phase 2: Context refactoring (Medium-risk, long-term)
  - Create SettingsContext
  - Create CalibrationContext
  - Create DeviceContext
  - Create settingsPersistence service
- Phase 3: Component decomposition (Lower-priority)
  - Refactor SettingsPanel into sub-panels
- Testing strategy
- Migration checklist with progress tracking

**Read this if:** You're implementing the refactorings, or want to understand the "how" behind the changes.

---

## API & Types

### [API.md](API.md)
**Type definitions and API documentation for NodCursor modules**

- Type definitions for GestureState, FaceLandmarks, etc.
- Hook APIs and their return types
- Context provider APIs
- Utility function signatures

**Read this if:** You need to understand type signatures or integrate with NodCursor components.

---

## Accessibility

### [ACCESSIBILITY_GUIDE.md](ACCESSIBILITY_GUIDE.md)
**Guidelines for accessible feature development**

- Design principles for accessibility
- Testing considerations for different disabilities
- Performance optimization tips
- User testing recommendations

**Read this if:** You're developing new features or want to understand accessibility concerns.

---

## Why We Built This

### [WHY_WE_STARTED.md](WHY_WE_STARTED.md)
**Story and motivation behind NodCursor**

- Problem we're solving
- Vision for accessibility
- Design philosophy
- Community impact

**Read this if:** You want to understand the project's mission and values.

---

## Typing System

### [TYPING_SYSTEM.md](TYPING_SYSTEM.md)
**Mouth-based typing system documentation**

- How typing mode works
- Gesture mappings
- Configuration options
- User guide

**Read this if:** You're working on typing features or want to understand the mouth-typing controls.

---

## Contributing

### [../CONTRIBUTING.md](../CONTRIBUTING.md)
**Guidelines for contributing to NodCursor**

- Code of conduct
- Development setup
- Development workflow
- Coding standards (TypeScript, React, Architecture)
- Testing guidelines
- PR process
- Accessibility considerations

**New sections added:**
- Architecture: Single Responsibility Principle (SRP) section with examples

**Read this if:** You want to contribute code or documentation.

---

## Quick Start Paths

### *"I'm new and want to understand the codebase"*
1. Start: [WHY_WE_STARTED.md](WHY_WE_STARTED.md) — Understand the mission
2. Read: [DESIGN_PRINCIPLES.md](DESIGN_PRINCIPLES.md) — Learn the patterns
3. Reference: [SRP_ANALYSIS.md](SRP_ANALYSIS.md) — Know what to avoid
4. Contribute: [../CONTRIBUTING.md](../CONTRIBUTING.md) — Follow guidelines

---

### *"I'm implementing refactorings"*
1. Review: [SRP_ANALYSIS.md](SRP_ANALYSIS.md) — See what needs fixing
2. Follow: [SRP_REFACTORING_GUIDE.md](SRP_REFACTORING_GUIDE.md) — Step-by-step instructions
3. Reference: [DESIGN_PRINCIPLES.md](DESIGN_PRINCIPLES.md) — Understand rationale
4. Check: [../CONTRIBUTING.md](../CONTRIBUTING.md) — Follow coding standards

---

### *"I'm reviewing someone's code"*
1. Check: [SRP_ANALYSIS.md](SRP_ANALYSIS.md) — Red flags section
2. Reference: [DESIGN_PRINCIPLES.md](DESIGN_PRINCIPLES.md) — Best practices
3. Validate: [../CONTRIBUTING.md](../CONTRIBUTING.md) — Coding standards
4. Guide: Use quick assessment checklist in SRP_ANALYSIS.md

---

### *"I want to add a new feature"*
1. Read: [DESIGN_PRINCIPLES.md](DESIGN_PRINCIPLES.md) — Guidelines for new code
2. Check: [API.md](API.md) — Existing APIs you can use
3. Test: [../CONTRIBUTING.md](../CONTRIBUTING.md#testing-guidelines) — Testing checklist
4. Verify: [ACCESSIBILITY_GUIDE.md](ACCESSIBILITY_GUIDE.md) — Accessibility requirements

---

## Document Relationships

```
Contributing 
├─ References: Coding Standards
│  └─ Links to: DESIGN_PRINCIPLES.md (SRP section)
└─ Testing Guidelines
   └─ References: ACCESSIBILITY_GUIDE.md

DESIGN_PRINCIPLES.md 
├─ Core architecture guide
├─ References: SRP concept
└─ Links to: SRP_ANALYSIS.md, SRP_REFACTORING_GUIDE.md

SRP_ANALYSIS.md 
├─ Quick reference summary
├─ References: DESIGN_PRINCIPLES.md (deep dive)
└─ Links to: SRP_REFACTORING_GUIDE.md (implementation)

SRP_REFACTORING_GUIDE.md 
├─ Step-by-step implementation
├─ References: SRP_ANALYSIS.md (why refactor)
├─ References: DESIGN_PRINCIPLES.md (guidelines)
└─ Code examples and testing patterns

API.md 
├─ Reference documentation
└─ Used by: All contributing developers

ACCESSIBILITY_GUIDE.md 
├─ Feature design requirements
├─ Testing guidelines
└─ User-centered considerations

WHY_WE_STARTED.md 
└─ Mission and values context
```

---

## Key Concepts

### Single Responsibility Principle (SRP)
See: [DESIGN_PRINCIPLES.md](DESIGN_PRINCIPLES.md#single-responsibility-principle-srp)

**Definition:** Every module, component, or hook should have a single reason to change.

**In practice:**
- One component = one visual responsibility
- One hook = one logic concern
- One service = one I/O responsibility

---

### Component Architecture
See: [DESIGN_PRINCIPLES.md](DESIGN_PRINCIPLES.md#component-architecture)

Three types of components:
1. **Presentation** — Pure render functions, no state
2. **Container** — Orchestrates logic and components
3. **Feature** — Self-contained feature logic

---

### State Management
See: [DESIGN_PRINCIPLES.md](DESIGN_PRINCIPLES.md#state-management)

Current approach (being refactored):
- `SettingsContext` — Cursor settings
- `CalibrationContext` — Calibration data
- `DeviceContext` — Device detection
- `settingsPersistence` service — Persistence I/O

---

## Common Questions

**Q: Where do I find the architecture guidelines?**
A: [DESIGN_PRINCIPLES.md](DESIGN_PRINCIPLES.md) — Read the "Guidelines for New Code" section.

**Q: What needs refactoring?**
A: [SRP_ANALYSIS.md](SRP_ANALYSIS.md) — See the "Component Health Report" section.

**Q: How do I refactor X?**
A: [SRP_REFACTORING_GUIDE.md](SRP_REFACTORING_GUIDE.md) — Find the specific task.

**Q: What are the coding standards?**
A: [../CONTRIBUTING.md](../CONTRIBUTING.md#coding-standards) — Full checklist and examples.

**Q: Is my feature accessible?**
A: [ACCESSIBILITY_GUIDE.md](ACCESSIBILITY_GUIDE.md) — Review the testing checklist.

**Q: How do I type the types?**
A: [API.md](API.md) — Type reference for all public APIs.

---

## Updates & Maintenance

### Last Updated
**March 2026**

### Document Status
-  [DESIGN_PRINCIPLES.md](DESIGN_PRINCIPLES.md) — Current, comprehensive
-  [SRP_ANALYSIS.md](SRP_ANALYSIS.md) — Current, generated from analysis
-  [SRP_REFACTORING_GUIDE.md](SRP_REFACTORING_GUIDE.md) — Current, actionable
-  [../CONTRIBUTING.md](../CONTRIBUTING.md) — Updated with SRP guidelines
- ⏳ [API.md](API.md) — May need updates as code evolves
- ⏳ [ACCESSIBILITY_GUIDE.md](ACCESSIBILITY_GUIDE.md) — Best practices, evergreen

### How to Update These Docs
- **Architecture changes:** Update [DESIGN_PRINCIPLES.md](DESIGN_PRINCIPLES.md)
- **New violations found:** Update [SRP_ANALYSIS.md](SRP_ANALYSIS.md)
- **Refactoring completed:** Mark as "Done" in [SRP_REFACTORING_GUIDE.md](SRP_REFACTORING_GUIDE.md)
- **Coding standards change:** Update [../CONTRIBUTING.md](../CONTRIBUTING.md)

---

## Getting Started This Moment

1. **If you haven't read anything:** Start with [WHY_WE_STARTED.md](WHY_WE_STARTED.md)
2. **If you're about to code:** Read [DESIGN_PRINCIPLES.md](DESIGN_PRINCIPLES.md)
3. **If you're reviewing code:** Check [SRP_ANALYSIS.md](SRP_ANALYSIS.md) red flags
4. **If you're refactoring:** Follow [SRP_REFACTORING_GUIDE.md](SRP_REFACTORING_GUIDE.md)

---

**For questions or suggestions, open a GitHub issue or discussion!**
