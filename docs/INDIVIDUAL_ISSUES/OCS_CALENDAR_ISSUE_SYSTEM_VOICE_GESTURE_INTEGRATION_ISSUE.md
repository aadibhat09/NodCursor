# DS-IND-02: Calendar Issue System + Game Runner Voice/Gesture Integration for NodCursor

## Context and Goal

NodCursor already provides core accessibility controls (head tracking, dwell click, gesture signals, and voice command hooks). However, the calendar experience currently lacks a dedicated issue management workflow, and the gamification runner still needs a unified voice/gesture command contract.

This issue introduces a first-class **Calendar Issue System** for planning/traceability and integrates **voice command** and **gesture control** into the **gamification game runner** for real-time gameplay actions.

Primary objective: deliver an end-to-end accessible issue lifecycle in the calendar while enabling game-runner actions (start/pause/resume/select/confirm/reset) through voice and gesture with consistent behavior across desktop and assistive modes.

## Problem Definition

Current gaps create friction for accessibility-first workflows:

- No unified issue entity attached to calendar dates/events
- No clear state machine for issue lifecycle (open, in-progress, blocked, done)
- No voice-native command set for game runner control actions
- No gesture-to-game-runner action mapping for quick gameplay control
- Risk of mode inconsistency between standard UI controls and assistive inputs

Without this system, users can track calendar tasks but still depend heavily on manual controls during gamified sessions, reducing accessibility parity in the actual runner experience.

## Scope

### In Scope

- Add calendar issue data model and status lifecycle
- Add issue CRUD workflows inside calendar UI
- Add voice command intents for game runner control and gameplay actions
- Add gesture mappings for common runner actions
- Add conflict handling and confirmation UX for destructive actions
- Add telemetry hooks for command success/failure rates

### Out of Scope

- External ticket sync (GitHub/Jira/Linear) in this phase
- Multi-user realtime collaboration
- Full natural-language understanding beyond bounded command grammar

## Design Principles

- Accessibility-first parity: all key runner actions available through keyboard, voice, and gestures
- Predictable interaction: same command should always produce same result in same context
- Safety over speed: confirmations for deletes and irreversible transitions
- Progressive enhancement: baseline keyboard flow remains unchanged
- Observable behavior: log and measure command/gesture outcomes for refinement

## Architecture Proposal

### A) Calendar Issue Domain Model

Add an issue model linked to calendar date/event context.

```typescript
type CalendarIssueStatus = 'open' | 'in-progress' | 'blocked' | 'done';
type CalendarIssuePriority = 'low' | 'medium' | 'high';

interface CalendarIssue {
  id: string;
  title: string;
  description?: string;
  status: CalendarIssueStatus;
  priority: CalendarIssuePriority;
  dueDate: string; // ISO date (YYYY-MM-DD)
  eventId?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}
```

### B) Input Intent Layer (Voice + Gesture for Game Runner)

Introduce a shared command intent contract so voice and gesture both dispatch into the same game-runner action pipeline.

```typescript
type GameRunnerIntent =
  | { type: 'RUNNER_START' }
  | { type: 'RUNNER_PAUSE' }
  | { type: 'RUNNER_RESUME' }
  | { type: 'RUNNER_RESET' }
  | { type: 'RUNNER_SELECT_NEXT' }
  | { type: 'RUNNER_SELECT_PREV' }
  | { type: 'RUNNER_CONFIRM' }
  | { type: 'RUNNER_BACK' };
```

This avoids fragmented logic and keeps runner voice/gesture behavior consistent.

### C) Suggested Command Mapping

Voice command examples (game runner):

- "Start game"
- "Pause game"
- "Resume game"
- "Reset level"
- "Select next"
- "Confirm action"

Gesture mapping examples (game runner):

- `blink-double` -> confirm selected action
- `mouth-open-hold` -> pause/resume toggle
- `nod-right` -> select next interactive element/option
- `nod-left` -> select previous interactive element/option

## Integration Touchpoints (Current Codebase)

- Calendar view rendering and interaction:
  - src/components/CalendarView.tsx
- Game runner view and orchestration:
  - src/components/GitHubProjectsView.tsx
- Voice control hook:
  - src/hooks/useVoiceCommands.ts
- Gesture control hook:
  - src/hooks/useGestureControls.ts
- Global app state/context:
  - src/context/AppContext.tsx

## UX and Safety Requirements

- Inline confirmation for destructive runner actions (reset/exit)
- Command feedback toast for each voice/gesture action (success/failure)
- Undo support for reset when safe and technically feasible (time-boxed)
- Fallback controls visible for users who temporarily disable camera/mic
- Error prompts should suggest retry phrasing for failed voice intents

## Implementation Plan

Phase 1: Domain + Storage

- Define `CalendarIssue` types and validation
- Add state management for issues in app context
- Add persistence strategy (local/session storage or existing store)

Phase 2: Calendar UI

- Add issue badges on calendar dates
- Add issue panel/drawer for create/edit/status updates
- Add filters by status and priority

Phase 3: Game Runner Voice + Gesture Integration

- Implement runner command parser updates in `useVoiceCommands`
- Implement runner gesture routing in `useGestureControls`
- Route both into shared game-runner intent dispatcher

Phase 4: Reliability + QA

- Add command disambiguation and confirmations
- Add telemetry events and failure diagnostics
- Run accessibility and regression verification checklist

## Verification Strategy

### Unit Tests

- Runner voice command parser for bounded grammar
- Gesture-to-runner-intent mapping correctness
- Issue reducer transitions and validation

### Integration Tests

- Create/update/delete issue from calendar UI
- Runner voice intent -> game state transition path
- Runner gesture intent -> game state transition path
- Reset confirmation and pause/resume reliability behavior

### Manual QA

- Calendar flow: create -> prioritize -> mark done issue
- Game-runner voice-only flow: start -> pause -> resume -> confirm
- Game-runner gesture-only flow: select prev/next -> confirm -> reset
- Mixed-mode flow: keyboard + voice + gesture in same session
- Camera/mic failure simulation with graceful fallback

## Acceptance Criteria

- [ ] User can create, edit, and delete calendar issues from calendar UI
- [ ] Each issue can be linked to a date and optional event
- [ ] Voice commands can control game runner actions reliably
- [ ] Gesture controls can trigger game runner actions with confirmations
- [ ] Command outcomes are visible via feedback and can be undone where applicable
- [ ] Keyboard-only workflows remain fully functional (no regressions)
- [ ] Accessibility QA passes for game-runner voice-only and gesture-only usage paths

## Risks and Mitigations

- Misrecognized voice commands cause wrong runner actions
  - Mitigation: require confirmation on destructive runner actions; add intent confidence threshold
- Gesture noise causes unintended actions
  - Mitigation: cooldown windows, confidence gating, and explicit runner focus context
- UI clutter in calendar cells
  - Mitigation: compact issue indicators + expandable issue drawer
- State divergence between input modes
  - Mitigation: single shared runner intent dispatcher and reducer

## Ownership and Traceability

Owner: Pranav Santhosh

Milestone: Sprint 9

Suggested Labels:

- `calendar`
- `issue-tracking`
- `voice-commands`
- `gesture-controls`
- `gamification`
- `game-runner`
- `accessibility`
- `individual-issue`

Related Existing Docs:

- ../DATA_STRUCTURES/DS_2_CALENDAR.md
- ../PROJECT_MANAGEMENT/KANBAN_BOARD.md
- ../PROJECT_MANAGEMENT/PROJECT_MANAGEMENT.md
