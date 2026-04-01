# Individual FRQ Interactive Learning & Homework Summary

**Student Name:** Aadi Bhat  
**Date Submitted:** March 29, 2026  
**Primary Data Structure:** ArrayLists, 2D Arrays, Edge Case Handling & Encapsulation  

---

## Part 1: FRQ Conceptual Knowledge & Interactive Learning

### My Data Structure Journey Through 4 Major FRQs

I completed **4 rigorous FRQ assignments** covering ArrayList collections, 2D array manipulation, edge case handling, and complex boolean logic. My progression wasn't linear—I learned most through *struggle and debugging*, which made the lessons stick.

#### 1. **ArrayList Operations & Edge Cases (2017 FRQ 1: Digits)**
- **What I Learned:** How to safely extract and store sequential data in ArrayLists, and why edge cases like `0` require special handling
- **Key Insight:** A simple `while (num > 0)` loop fails on the one case you forgot to test
- **Project Connection:** In **NodCursor**, event logging uses ArrayLists exactly like this—tracking cursor positions safely with null/boundary checks instead of letting bad data corrupt the log

#### 2. **ArrayList Filtering & String Manipulation (2024 FRQ 3: WordChecker)**  
- **What I Learned:** How to build new filtered collections without modifying the original, and when `contains()` vs `startsWith()` matter
- **Key Insight:** Post-conditions matter—I had to create a NEW ArrayList rather than mutate the input
- **Project Connection:** Settings filtering in AppContext uses this same pattern—filtering camera devices, gesture detectors, and voice commands without side effects

#### 3. **2D Arrays & Column Analysis (2019 FRQ 4: LightBoard)**
- **What I Learned:** Nested loops for 2D traversal, counting patterns within constraints, modulo arithmetic for state transitions  
- **Key Insight:** Counting `true` values in a column first, THEN applying logic, not the other way around
- **Project Connection:** Face landmark grid processing (468 points → organized structure) requires exactly this nested traversal pattern for detecting gestures

#### 4. **Object State & Encapsulation Under Uncertainty (2024 FRQ 1: Feeder)**
- **What I Learned:** Random probability, when state changes vs when an object reaches a terminal state, managing private fields correctly
- **Key Insight:** Sometimes the 5% case you ignored becomes the 95% failure mode in production
- **Project Connection:** Dwell detection uses similar state machine logic—accumulating time until threshold, then triggering, with clear preconditions

---

## Part 2: Interactive Learning Moments & How I Learned (Then Shared Informally)

Unlike Pranav's expert mastery from day 1, my FRQ journey was about **surviving edge cases and debugging my way to understanding**. I was not able to formally teach this FRQ to the class, so I focused on making my own process highly interactive and sharing those takeaways informally with teammates.

### Interactive Practice Using 2021 FRQ 3

I used the [2021 FRQ 3 prompt](https://pages.opencodingsociety.com/csa/frqs/2021/3) as an interactive drill resource:
- Broke the prompt into micro-steps and wrote expected outputs before coding
- Ran tiny test cases first, then scaled to full cases to catch edge conditions early
- Turned each bug into a quick "why did this fail?" checkpoint before moving on

This made the learning process feel like active simulation instead of passive reading, and it improved both my speed and accuracy on later FRQs.

### The Edge Case Lesson (From Digits → to Interactive Debugging)

**What Happened:**  
In 2017 FRQ 1, I submitted code that worked for 95% of inputs. Then I tested `Digits(0)` and got an empty ArrayList. My `while (num > 0)` never executed, crashing my whole solution.

**How I Made This Interactive:**
- "Always test your loop exit conditions with boundary values"
- "What happens when the input is the *smallest* valid value?"
- Built a repeatable fix checklist: simple `if (num == 0) { digitList.add(0); }` at the start

**Why This Matters for NodCursor:**
The same principle applies to face tracking—what if the camera never initializes? What if there are 0 landmarks detected? We prevent null pointer exceptions the same way: explicit boundary checks before loops.

### The String Mutation Pitfall (From WordChecker)

**What Happened:**  
In 2024 FRQ 3, I initially modified the original ArrayList during filtering. Then I read the postcondition: "returns a NEW ArrayList." I had to rewrite.

**How This Changed My Code:**
```typescript
// ❌ Mutating (what I learned not to do)
function filterSettings(settings) {
  settings.forEach(s => s.enabled = someCondition);
  return settings; // WRONG - side effects!
}

// ✅ Pure (applied FRQ lesson)
function filterSettings(settings) {
  return settings.filter(s => someCondition); // New array, original unchanged
}
```

**In NodCursor:** AppContext initialization follows this pattern—never mutate settings directly, always return new objects for React re-renders.

### The Counting-First Principle (From LightBoard)

**What Happened:**  
In 2019 FRQ 4, I spent 20 minutes debugging why my light state transitions were wrong. Then I realized: I was checking the light's state, THEN counting the column. Should be: count the column FIRST, THEN apply logic.

**How I Explain It Now:**
"Separate your data gathering phase from your decision phase. Count everything you need to know. THEN decide what to return."

**In NodCursor:**
[useGestureControls.ts](../src/hooks/useGestureControls.ts) - We gather all face landmarks first, compute distances, THEN fire gesture events. Not the other way around.

---

## Part 3: Critical Mistakes & How I Fixed Them

### Mistake #1: Misunderstanding Decimal Probability (2024 FRQ 1: Feeder)

**The Problem:**
```java
// ❌ WRONG - I thought Math.random() returns 0-100
double chance = Math.random();
if (chance >= 5) {  // This is ALWAYS true! (range 0-1)
    // process birds...
}
```

**What I Did Wrong:** I treated `Math.random()` like it returned a percentage (0-100) when it actually returns 0.0-1.0.

**The Fix:**
```java
// ✅ CORRECT
double chance = Math.random();
if (chance >= 0.05) {  // 5% threshold for bear
    // process birds (95% of the time)
} else {
    // bear visited (5% of the time)
}
```

**Why This Matters for NodCursor:** Settings use decimal ranges everywhere—sensitivity (0.0-1.0), smoothing factors, threshold ratios. Wrong ranges break calibration.

### Mistake #2: Checking State AFTER Mutation (2024 FRQ 1: Feeder Part B)

**The Problem:**
```java
// ❌ WRONG ORDER
for (int day = 0; day < numDays; day++) {
    simulateOneDay(numBirds);  // Can reduce food to 0
    if (currentFood > 0) {     // Check AFTER, too late!
        daysWithFood++;
    }
}
```

**What I Did Wrong:** I simulated the day first, THEN checked if food remained. But visitors need food available AT THE START of the day.

**The Fix:**
```java
// ✅ CORRECT - Check BEFORE consuming
for (int day = 0; day < numDays; day++) {
    if (currentFood > 0) {
        daysWithFood++;
        simulateOneDay(numBirds);  // Now safe to mutate
    } else {
        break;  // No food left, exit early
    }
}
```

**In NodCursor:** [useDwellClick.ts](../src/hooks/useDwellClick.ts) - We check if the cursor is stationary BEFORE accumulating dwell time. We validate preconditions before state changes.

### Mistake #3: Off-by-One in Loop Comparisons (2017 FRQ 1: Digits Part B)

**The Problem:**
```java
// ❌ WRONG - Will crash on last element
for (int i = 0; i < digitList.size(); i++) {
    if (digitList.get(i) >= digitList.get(i + 1)) {  // IndexOutOfBoundsException!
        return false;
    }
}
```

**The Fix:**
```java
// ✅ CORRECT - Loop stops one element early
for (int i = 0; i < digitList.size() - 1; i++) {
    if (digitList.get(i) >= digitList.get(i + 1)) {  // Safe: i+1 < size
        return false;
    }
}
```

**In NodCursor:** Array access throughout tracking code uses boundary checks. We validate `i < length - 1` before accessing neighbors.

---

## Part 4: Data Structure Mastery & My NodCursor Ownership

### My FRQ Mastery Timeline

| FRQ | Concept | Mastery | Status |
|---|---|---|---|
| **2017 FRQ 1** | ArrayList construction, edge cases, sequential data | 4/5 | Learned: boundaries were hard |
| **2024 FRQ 3** | ArrayList filtering, immutability, string ops | 5/5 | Mastered: clean functional patterns |
| **2019 FRQ 4** | 2D arrays, nested loops, column analysis | 4/5 | Learned: order of operations matters |
| **2024 FRQ 1** | State machines, encapsulation, probability | 4/5 | Learned: 5% edge cases crash production |

### What I Own in NodCursor: Event Logging & State Management

**I'm responsible for the event logging and settings management architecture.** Here's why:

- **Event Log** uses ArrayLists (like Digits) to safely store time-series cursor events without crashing
- **Settings** filters (like WordChecker) apply FRQ 3 principles—never mutate, always return new collections for React
- **Dwell Detection** uses state machines (like Feeder) to accumulate time until threshold, with preconditions checked first

**Files I've written or significantly contributed to:**
- [useDwellClick.ts](../src/hooks/useDwellClick.ts) - State management for click events
- [AppContext.tsx](../src/context/AppContext.tsx) - Settings encapsulation & filtering  
- [DemoPage.tsx](../src/pages/Demo/DemoPage.tsx) - Event log implementation (ArrayList pattern)

### My Code Quality Checklist (From FRQ Lessons)

**Boundary checks:** Tested with 0, 1, and max values  
**No side effects:** Filters return new arrays, data unchanged  
**Preconditions first:** Check state validity BEFORE mutations  
**Clear encapsulation:** Private fields with getter methods  
**Order matters:** Gather data → Transform → Decide → Act

---

## Part 5: From FRQs to Accessibility Impact

### How My Data Structure Expertise Enables NodCursor's Mission

**The Big Picture:**  
Every FRQ assignment taught me to handle *real constraints*: boundaries that crash, states that matter, precision that fails at scale. These lessons transform NodCursor from "a cool demo" into "a system users can trust."

**Specifically:**
- **Boundary checking** (from Digits edge case) prevents the event log from crashing when the app runs for hours
- **Functional filters** (from WordChecker) ensure settings changes propagate safely without corrupting app state
- **State machine logic** (from Feeder simulation) makes dwell detection reliable even with jittery head tracking
- **2D array traversal** (from LightBoard) underpins landmark analysis for accurate gesture recognition

**Why This Matters for Users with Disabilities:**  
A game can freeze and recover. An accessibility system that freezes has failed—the user loses control of their computer. My FRQ rigorous focus on boundaries, preconditions, and edge cases is what makes that difference. Every ArrayList boundary check, every "check before mutate" pattern, is a barrier against failure.

**Connecting to Pranav's Work:**  
When Pranav tracks 468 face landmarks efficiently (FRQ array mastery), he's passing perfect data. My event log captures and preserves that data safely. When Pranav optimizes for 60fps, I ensure the settings that tune that performance never corrupt mid-run. Together, we're building a system that doesn't just work—it *depends on itself*.

---

## Part 6: Achievement Summary & Growth Arc

**14+ weeks of FRQ instruction** → From "crash on edge cases" to "bulletproof boundary checks"  
**4 major FRQ assignments** → Each taught a different lesson I now apply daily in NodCursor  
**From struggle to mastery** → Decimal precision confusion (FRQ 1) → Clean decimal ranges (Final Settings)  
**State machine expertise** → Feeder simulation → Dwell detection accuracy  
**Functional programming habits** → WordChecker immutability → React-safe settings mutations  
**Real-world debugging** → Off-by-one errors → Rigorous boundary testing  

**Most Valuable Lesson:**  
*It's not about the elegance of your code. It's about what happens when someone runs your code at 3 AM with five features enabled and poor lighting. That's when boundaries matter.*

**Unique Contribution to Team:**  
While Pranav optimizes for performance and raw data processing, I obsess over correctness and reliability. We need both. Our system won't fail because Pranav ensured 468 landmarks process in 60fps, but it also won't fail because I ensured every event is logged safely and no state is mutated unexpectedly.

---

## Bonus: RPN Calculator Application (Proof of Continued Growth)

I built an [RPN Visual Calculator](https://aadibhat09.github.io/aadi_2025/2026/03/18/calculator.html) in March 2026 that applies Stack data structure concepts beyond the core FRQ curriculum. This shows continued independent learning and demonstrates how structures beyond arrays (Stacks for operator precedence) extend the toolkit I learned.

---

**Submission Status:** Complete  
**Submitted:** March 29, 2026  
**Focus:** Unique narrative style connecting struggle < interactive practice < mastery < impact  
**Differentiation:** Reflexive growth story vs. Pranav's performance optimizations; both approaches needed for team success

