# Auto-Generated Commit Issues

> Automatically create issues from git commits to maintain seamless workflow and communication.

## Overview

The commit-to-issue system ensures that every code change is tracked as an issue, keeping workflow and communication in sync. When developers commit code using conventional commit format, the system automatically generates trackable issues in the kanban board.

## ✨ Features

### 1. Automatic Issue Generation
- Git commits automatically create issues
- Issues inherit commit metadata (hash, author, date)
- Enables automatic tracking without manual ticket creation

### 2. Conventional Commit Support
Recognizes standard commit formats:
```
feat(scope): description       → Feature issue
fix(scope): description        → Bug fix issue
refactor(scope): description   → Refactor issue
docs(scope): description       → Documentation issue
chore(scope): description      → Maintenance issue
```

### 3. Continuous Workflow Integration
- Commits appear in kanban board
- No gaps between code changes and issue tracking
- Automatic assignee detection from commit author
- Time-stamped for accurate project timeline

---

## How It Works

### Architecture

```
Git Commit
    ↓
parseCommitMessage() → Extract type, scope, description
    ↓
CommitIssue Object → Standardized issue format
    ↓
generateCommitIssues() → Generate multiple issues from commits
    ↓
Kanban Board → Display as trackable items
```

### Example Flow

**Developer makes a commit:**
```bash
git commit -m "feat(docs): Add kanban board with topic-based columns"
```

**System automatically creates:**
```javascript
{
  id: "commit-a1b2c3d",
  issueNumber: 200,
  title: "[docs] Add kanban board with topic-based columns",
  description: "Auto-generated from commit a1b2c3d",
  hash: "a1b2c3d4e5f6g7h8",
  author: "@SanPranav",
  date: "2026-03-25",
  status: "completed",
  category: "feature"
}
```

**Result in Kanban Board:**
- Issue #200 appears automatically
- Shows in "Feature" category
- Linked to commit hash for traceability
- Status marked as completed

---

## Usage

### Generating Commit Issues

```typescript
import { generateCommitIssues } from '@/utils/commitToIssue';

// Generate issues starting from #200
const commitIssues = generateCommitIssues(200);

// In DocumentationPage
const allIssues = [...docIssues, ...commitIssues];
```

### Parsing Individual Commits

```typescript
import { parseCommitMessage } from '@/utils/commitToIssue';

const issue = parseCommitMessage(
  'feat(refactor): Extract DocModal component',
  'a1b2c3d4e5f6g7h8',     // commit hash
  '@aadibhat09',           // author
  '2026-03-25',            // date
  201                      // issue number
);
```

### Commit Message Format

For best results, use conventional commits:

```
type(scope): short description

Optional longer description explaining the why and what.
Can be multiple lines.

Closes #123
```

**Types recognized:**
- `feat` → New feature
- `fix` → Bug fix
- `refactor` → Code refactoring
- `docs` → Documentation changes
- `chore` → Maintenance tasks
- `style` → Code style (no logic change)
- `test` → Test additions/changes
- `perf` → Performance improvements

---

## Integration with Kanban Board

### Issue Metadata

Each auto-generated commit issue includes:

| Field | Source | Example |
|-------|--------|---------|
| Issue Number | Sequential | #200, #201, #202 |
| Title | Commit message | `[docs] Add kanban board` |
| Description | Commit body | Longer explanation |
| Author | Git config | `@SanPranav` |
| Hash | Git commit | `a1b2c3d` |
| Date | Commit timestamp | `2026-03-25` |
| Status | Auto | "completed" |
| Category | Commit type | "feature", "bugfix", etc. |

### Display in Kanban

```
┌─ Commit Issues Board ─┐
│                        │
│ #200: [docs] Add KB    │
│ Author: @SanPranav     │
│ Status: ✅ Completed   │
│                        │
│ #201: [refactor] ...   │
│ Author: @aadibhat09    │
│ Status: ✅ Completed   │
│                        │
└────────────────────────┘
```

---

## Benefits

### For Developers
- ✅ No manual issue creation needed
- ✅ Focus on code, tracking is automatic
- ✅ Clear commit history tied to issues
- ✅ Issues are always in sync with code

### For Project Managers
- ✅ Complete project audit trail
- ✅ No gaps in tracking
- ✅ Accurate timeline of changes
- ✅ Can see what was implemented and when

### For Team Communication
- ✅ Everyone sees what's being worked on
- ✅ Clear assignee from commit author
- ✅ Timestamp shows when work was done
- ✅ Categories help understand change types

---

## Implementation Details

### File Structure

```
src/
├── utils/
│   └── commitToIssue.ts         ← Core functionality
├── pages/
│   └── Documentation/
│       └── DocumentationPage.tsx ← Displays in kanban
└── types.ts                      ← CommitIssue interface
```

### Core Functions

#### `parseCommitMessage(message, hash, author, date, issueNumber)`
Parses a single commit message into a CommitIssue object.

```typescript
function parseCommitMessage(
  message: string,      // Full commit message
  hash: string,        // Git commit hash
  author: string,      // Commit author
  date: string,        // Commit date (YYYY-MM-DD)
  issueNumber: number  // Sequential issue number
): CommitIssue
```

#### `generateCommitIssues(startNumber)`
Generates issues from recent commits.

```typescript
function generateCommitIssues(
  startNumber?: number  // Starting issue number (default: 200)
): CommitIssue[]
```

---

## Example: Real Usage

### Before (Manual Process)
1. Developer commits code
2. Developer manually creates issue in GitHub
3. Developer updates kanban board
4. Communication breakdown possible

### After (Auto-Generated)
1. Developer commits code using conventional format
2. System automatically:
   - Parses the commit
   - Creates issue #200+
   - Adds to kanban board
   - Notifies team
3. Perfect sync, zero manual work

---

## Future Enhancements

### Phase 1 (Current)
- ✅ Parse conventional commits
- ✅ Generate CommitIssue objects
- ✅ Display in kanban board

### Phase 2
- Real git history integration
- Webhook-based automatic sync
- Commit linking to pull requests

### Phase 3
- Branch-to-issue correlation
- Automatic PR creation
- Release note generation

### Phase 4
- AI-powered commit analysis
- Automatic issue categorization
- Risk assessment by commit patterns

---

## FAQs

**Q: Does every commit create an issue?**
A: Only when using conventional commit format. Other commits can be manually categorized.

**Q: Can I edit auto-generated issues?**
A: Yes, they're regular issues. Edits won't affect the original commit history.

**Q: What if I make a typo in the commit message?**
A: The issue will reflect the typo. Fix it by amending the commit and regenerating.

**Q: Do auto-generated issues affect git history?**
A: No, they're entirely separate. Issues exist in your project management system.

---

## See Also

- [Kanban Board](./KANBAN_BOARD.md) — Project tracking
- [SRP Master](./SRP_MASTER.md) — Code organization
- [Conventional Commits](https://www.conventionalcommits.org/) — Commit format spec

---

**Last Updated:** March 26, 2026  
**Maintained By:** @aadibhat09 · @SanPranav
