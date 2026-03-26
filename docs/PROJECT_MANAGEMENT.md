# Documentation: GitHub Projects & Calendar Views

> Enhanced project management with multiple visualization modes - Kanban, GitHub Projects, and Calendar views.

## Overview

The Documentation page has been transformed into a full-featured project management system, inspired by GitHub Projects but tailored for NodCursor. Switch between three powerful views to manage issues and documentation:

- **Kanban** — Topic-based columns
- **GitHub Projects** — Status-based workflow (Not Started → In Progress → In Review → Done)
- **Calendar** — Timeline visualization by issue date

---

## Features

### 1. View Switcher

Three complementary views, switch anytime:

```
[Kanban] [Projects] [Calendar]
```

| View | Best For | Display |
|------|----------|---------|
| **Kanban** | Organization by topic | Topic → Issues |
| **Projects** | Workflow & status | Status columns |
| **Calendar** | Timeline & planning | Monthly calendar |

---

## Kanban View

**Organized by topic/category:**

- ✓ Guides
- ✓ Architecture
- ✓ Code Quality
- ✓ Reference
- ✓ Project

**Each column shows:**
- Issue count badge
- Icon identifying doc/issue type
- Issue number (#101, #102, etc.)
- Title and summary
- Status badge (draft, review, published, archived)
- Assignee avatars

**Interaction:**
- Click any card to open details modal
- Search filters across all columns
- Horizontal scroll to see all topics

---

## GitHub Projects View

**Inspired by GitHub Projects — Status-based workflow:**

```
┌─ Not Started ─┬─ In Progress ─┬─ In Review ─┬─ Done ─┐
│      5        │       2       │      1      │   12   │
├───────────────┼──────────────┼────────────┼────────┤
│ #108: SRP...  │ #109: SRP... │ #104: ...  │ #100:  │
│ [draft]       │ [review]     │ [review]   │ [pub]  │
│ @SanPranav    │ @aadibhat09  │ @SanPranav │ @Both  │
│               │              │            │        │
│ #110: Type... │ #112: ...    │            │ #101:  │
│ [draft]       │              │            │ [pub]  │
└───────────────┴──────────────┴────────────┴────────┘
```

**Columns (from left → right):**
1. **Not Started** — draft issues, new ideas
2. **In Progress** — actively being worked on
3. **In Review** — pending feedback/approval
4. **Done** — published, completed

**Stats Bar:**
- Shows count for each status
- Quick visual on project progress

**Card Format:**
- Icon + Issue number
- Title (truncated)
- Status badge + category
- Assignee avatars with overflow counter

**Perfect For:**
- Sprint planning
- Workflow visualization
- Team coordination
- Progress tracking

---

## Calendar View

**Visual timeline of issues by date:**

```
        March 2026
Su  Mo  Tu  We  Th  Fr  Sa
                       1   2
 3   4   5   6   7   8   9
10  11  12  13  14  15  16
17  18  19  20  21  22  23
24  25  26  27  28  29  30
31

Each day shows:
- Date number
- Issues created/due that day (#101, #102, etc.)
- "+N more" if >3 issues
```

**Navigation:**
- ← Previous month
- → Next month
- Shows previous/next months' trailing days

**Features:**
- Active month days: bright color
- Past/future month days: muted color
- Click issue to view details
- Hover to see full issue title
- Legend showing color coding

**Use Cases:**
- Sprint timeline visualization
- Release planning
- Dependency tracking by date
- Historical project view

---

## Issue Metadata

Each issue includes:

| Property | Example | Used In |
|----------|---------|---------|
| Issue # | #114 | All views |
| Title | "SRP Master Guide" | All views |
| Category | "Code Quality" | Kanban, Projects |
| Status | "published" | Projects color |
| Date | "2026-03-26" | Calendar |
| Assignees | ["@SanPranav"] | All views |
| Icon | SVG | All views |

---

## Status Mapping

The Projects view automatically maps documentation status to workflow stages:

| Doc Status | Projects Column | Color |
|-----------|-----------------|-------|
| `draft` | Not Started | Blue |
| `review` | In Review | 🟡 Yellow |
| `published` | Done | 🟢 Green |
| (none) | Not Started | ⚫ Gray |

---

## Filtering & Search

**Common across all views:**

```
Search: [_________________] Filter by topic or keyword

{filteredSections.length} of {docSections.length} issues
```

**Supports searching:**
- Issue title
- Issue category
- Issue summary
- Issue path

**Results update all views instantly:**
- Kanban columns filter dynamically
- Projects columns show filtered items
- Calendar shows only matching issues

---

## Keyboard Shortcuts

| Shortcut | Action | View |
|----------|--------|------|
| `Escape` | Close modal | All |
| `←` / `→` | Previous/next month | Calendar |
| `Tab` | Switch view | All |

---

## File Structure

```
src/
├── pages/
│   └── Documentation/
│       └── DocumentationPage.tsx    ← Main component, view switcher
├── components/
│   ├── GitHubProjectsView.tsx       ← Status-based view
│   └── CalendarView.tsx            ← Timeline view
├── hooks/
│   └── useProjectView.ts           ← Data organization logic
└── utils/
    └── commitToIssue.ts            ← Auto-generate from commits
```

### DocumentationPage.tsx

**Responsibilities:**
- View mode switching (kanban | projects | calendar)
- Issue filtering & search
- Modal/detail view management
- Route to appropriate view component

### GitHubProjectsView.tsx

**Responsibilities:**
- Organize issues by status
- Display 4-column layout
- Status badge styling
- Stats bar component

### CalendarView.tsx

**Responsibilities:**
- Calendar grid rendering
- Date navigation (prev/next month)
- Issue grouping by date
- Day cell formatting

### useProjectView.ts

**Exported Functions:**
- `useCalendarView(issues)` — Generate calendar data
- `getIssuesByStatus(issues)` — Group by status
- `getIssuesByCategory(issues)` — Group by category

**Exported Types:**
- `DocSection` — Complete issue interface

---

## Integration Example

### Adding New Documentation with Dates

```typescript
const issueMetadata = {
  'my-new-doc': {
    issueNumber: 120,
    assignees: ['@username'],
    status: 'draft',
    date: '2026-04-01'  // ISO format: YYYY-MM-DD
  }
};
```

### How Documentation Flows

1. **GitHub Issue Template** created
   ↓
2. **Commit with conventional format**
   ```bash
   git commit -m "feat(docs): Document new feature"
   ```
   ↓
3. **Auto-parsed by commitToIssue.ts**
   ```javascript
   parseCommitMessage() → CommitIssue
   ```
   ↓
4. **Displays in all three views**
   - Kanban: Under "Project" category
   - Projects: "Not Started" column
   - Calendar: On commit date

---

## Benefits

### For Documentation
- ✅ Visual project status at a glance
- ✅ Timeline understanding
- ✅ Clear workflow state
- ✅ Organized by topic AND status

### For Project Management
- ✅ Sprint planning with calendar
- ✅ Workflow visualization
- ✅ Assignee tracking
- ✅ Progress metrics

### For Team Communication
- ✅ Everyone sees same view
- ✅ Clear status indicators
- ✅ Timeline transparency
- ✅ Multiple perspectives (topic, status, time)

---

## Example: Using All Three Views

### Scenario: Sprint Planning

1. **Open Calendar** → See all issues this sprint by date
   - Understand timeline
   - Identify bottlenecks

2. **Switch to Projects** → Check status distribution
   - How many in each stage?
   - What needs review?

3. **Use Kanban** → Organize by team responsibility
   - Who works on which topic?
   - Check category coverage

---

## Future Enhancements

- **Drag & Drop** — Move cards between columns (Projects view)
- **Filtering** — By assignee, status, date range
- **Export** — Generate reports from calendar/projects
- **Real-time** — Webhook sync with GitHub
- **Integrations** — Link PRs and commits

---

## See Also

- [SRP Master](./SRP_MASTER.md) — Understanding code organization
- [Auto-Generated Issues](./AUTO_GENERATED_ISSUES.md) — Commit-to-issue system
- [Kanban Board](./KANBAN_BOARD.md) — Sprint tracking

---

**Last Updated:** March 26, 2026  
**Maintained By:** @aadibhat09 · @SanPranav
