# NodCursor Documentation Index

Complete guide to all NodCursor documentation, organized by topic.

**Last Updated:** March 29, 2026  
**Sprint:** 9 (Finals Week)  
**Status:** CS113 Alignment Complete

---

## Quick Links for CS113 Capstone

### CS113 Competency Evidence** (START HERE)
- [**CS113_ALIGNMENT.md**](CS113_ALIGNMENT.md) —Complete alignment of project to CS113 learning objectives
- [**TESTING_COVERAGE_PLAN.md**](TESTING_COVERAGE_PLAN.md) — Testing strategy and code coverage goals (>50% target)
- [**BLOG_PORTFOLIO_GUIDE.md**](BLOG_PORTFOLIO_GUIDE.md) — Blog portfolio requirements and templates
- [**SPRINT9_CHECKPOINTS.md**](SPRINT9_CHECKPOINTS.md) — Sprint 9 milestone issues and deliverables

### For Interviews & Portfolios**
- Blog Portfolio Guide: Design documents, code explanations, testing evidence
- GitHub Profile: Organized repos, detailed commit history, clear PRs
- LinkedIn Profile Setup: Featured project description and accomplishments

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

## CS113 Capstone: Learning Objectives & Evidence

### [CS113_ALIGNMENT.md](CS113_ALIGNMENT.md)
**Complete CS113 learning objective alignment and evidence**

- Data Structures: 6 structures implemented (Arrays, Maps, Sets, Stacks, Trees, Graphs)
- Algorithms: Search, Sort, Hash, Custom Algorithms with Big-O analysis
- OOP Design: Abstraction, Encapsulation, Inheritance, Polymorphism with examples
- Software Development: Version control, testing, debugging, documentation
- Object-Oriented Design: Design patterns (Strategy, Factory, Observer, Adapter)
- Real-world problem statement and accessibility impact
- Ethical considerations and social relevance

**Coverage:** 
-  6 data structures with evidence and complexity analysis
-  4 algorithm categories implemented with O() notation
- CompleteOOP principles demonstrated
-  Deployment strategy documented
-  Blog requirements included

**Read this if:** You need to understand how NodCursor meets CS113 requirements or need evidence for college credit articulation.

---

### [TESTING_COVERAGE_PLAN.md](TESTING_COVERAGE_PLAN.md)
**Comprehensive testing strategy and code coverage goals**

- Test infrastructure setup (Vitest configuration)
- Unit test targets: 60% coverage on utils/
- Integration tests: 45% coverage on hooks
- Component tests: 40% coverage on React components
- Critical path testing (Priority 1, 2, 3)
- Coverage goals by module
- Manual testing checklists
- CI/CD integration with GitHub Actions
- Known testing challenges and solutions

**Sprint 9 Goals:**
- [ ] Achieve >50% code coverage (target: 55%+)
- [ ] Unit tests for critical functions
- [ ] Integration tests for hook behaviors
- [ ] Component tests for UI
- [ ] CI/CD pipeline verifying every commit

**Read this if:** You're implementing the testing strategy or need to know code coverage targets.

---

### [BLOG_PORTFOLIO_GUIDE.md](BLOG_PORTFOLIO_GUIDE.md)
**Blog portfolio requirements and content templates**

**10 Required Sections:**
1. Project Overview — Problem + Solution narrative
2. Design & Architecture — System diagrams and patterns
3. Data Structures & Algorithms Deep-Dive — With Big-O analysis
4. Object-Oriented Design — Patterns and principles
5. Testing & Code Coverage — Strategy and results
6. Deployment, DevOps & Release Process — Docker, DNS, CI/CD
7. Contributions & Git History — Your individual PRs and commits
8. Challenges & How I Overcame Them — Growth and problem-solving
9. Personal/Social Impact — Real-world accessibility story
10. Conclusion & Looking Forward — Reflection and future

**Blog Requirements:**
- 50+ pages of content (combined)
- 1000-1500 words per major post
- Architecture diagrams with visual assets
- Code examples with syntax highlighting
- Performance graphs and metrics
- Interview-ready professional presentation
- GitHub Pages, Medium, or personal blog

**Publishing Plan:**
- Post 1-2 articles per week during Sprint 9
- Deadline: Week 36 (Finals Week)
- Link from LinkedIn profile

**Read this if:** You're writing your blog portfolio or need templates for documentation.

---

### [SPRINT9_CHECKPOINTS.md](SPRINT9_CHECKPOINTS.md)
**Sprint 9 milestone tracking and GitHub issue templates**

**4 Checkpoints:**
1. **Data Backup & Restore** (Week 34) — 3 issues, 22 hours
   - Settings export to JSON
   - Settings import from JSON
   - Calibration backup/restore

2. **Testing & Coverage** (Week 35) — 9 issues, 80+ hours
   - Test infrastructure setup
   - Unit tests for critical functions
   - Integration tests for hooks
   - Achieve >50% code coverage

3. **UI/UX Improvements** (Week 35-36) — 4 issues, 42 hours
   - Accessibility & keyboard navigation
   - Gesture indicator improvements
   - Interactive tutorial/walkthrough
   - Mobile responsiveness optimization

4. **Deployment** (Week 36) — 4 issues, 30-36 hours
   - Docker containerization
   - nginx reverse proxy setup
   - DNS configuration & production deploy
   - GitHub Actions CI/CD pipeline

**Weekly Schedule:**
- Week 34: Checkpoint 1 + begin Checkpoint 2
- Week 35: Continue Checkpoint 2, implement Checkpoint 3
- Week 36: Checkpoint 4 + finalization

**Deliverables:**
-  Working application with smooth gesture control
-  >50% code coverage
-  WCAG AA accessibility compliance
-  Live deployment at custom domain
-  Blog portfolio published
-  GitHub clean commit history
-  LinkedIn profile complete
-  Individual demo to instructor

**Read this if:** You need to know Sprint 9 milestones, GitHub issue templates, or project timeline.

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

### *"I'm a student submitting for CS113 credit"*
1. **Start:** [CS113_ALIGNMENT.md](CS113_ALIGNMENT.md) — Understand competency evidence
2. **Follow:** [TESTING_COVERAGE_PLAN.md](TESTING_COVERAGE_PLAN.md) — Implement testing
3. **Execute:** [SPRINT9_CHECKPOINTS.md](SPRINT9_CHECKPOINTS.md) — Track sprint milestones
4. **Write:** [BLOG_PORTFOLIO_GUIDE.md](BLOG_PORTFOLIO_GUIDE.md) — Create blog portfolio
5. **Deploy:** [CS113_ALIGNMENT.md#deployment-strategy](CS113_ALIGNMENT.md#deployment-strategy) — Live deployment

**Deliverables Checklist:**
- [ ] Data structures (6+) documented with complexity analysis
- [ ] Algorithms (4 categories) implemented with Big-O notation
- [ ] OOP principles (4) demonstrated in code
- [ ] >50% code coverage achieved
- [ ] Blog portfolio published (10 sections)
- [ ] Live deployment at custom domain
- [ ] LinkedIn profile completed
- [ ] Individual demo prepared

---

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

### *"I'm implementing testing"*
1. Review: [TESTING_COVERAGE_PLAN.md](TESTING_COVERAGE_PLAN.md) — Testing strategy
2. Setup: Test infrastructure and mocks
3. Implement: Unit → Integration → Component tests
4. Track: Coverage goals by module
5. Verify: >50% coverage achieved

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
