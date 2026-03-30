# DS #2: Wednesday Before-Break Checkpoint

**Due:** Wednesday, March 31, 2026 (before break)  
**Goal:** 1/3 complete (4-5 groups presenting)  
**Format:** Individual preparation + Group discussion  

---

## Individual Component: FRQ & Teaching Experience Summary

**Reference Guide:** https://pages.opencodingsociety.com/csa/sprint9/objectives

Each team member must complete **before group discussion**:

### [ ] Part 1: Formal FRQ Teaching & Homework Summary

Prepare a written summary documenting:

1. **FRQ Conceptual Knowledge**
   - How have you taught or practiced the 6 data structures in FRQ contexts?
   - Which FRQ categories apply to your project's DS implementations?
   - Example: "Arrays/Collections - Used in face landmark time-series tracking (FRQ 1.4 Collections)"

2. **Teaching Experiences**
   - What did you teach teammates about DS implementation?
   - Specific examples from code review or pair programming
   - How your individual expertise benefits team coordination

3. **Homework/Practice Insights**
   - Complexity analysis homework applied to your project
   - Performance optimization lessons learned
   - FRQ mistakes avoided (learning transfer)

4. **Personal Mastery Level**
   - Self-assessment: Which DS do you own/master?
   - Which need team support or peer learning?
   - Contribution clarity for capstone documentation

**Deliverable:** 1-page written summary per person  
**Storage:** `/home/pranav/ocs/NodCursor/docs/DS_2/INDIVIDUAL_ANSWERS/`

---

## Group Component: Project Feature Discussion & Capstone Update

**Critical:** All discussion STARTS from `/capstone` location

### [ ] Part 1: Identify Key PP/OCS Project Features Meeting DS Requirements

Your group discusses and documents:

1. **Which Data Structures Are You Actually Using?**
   - Pick 2-3 DS items your project implements
   - Describe the feature that uses each DS
   - Map to: https://pages.opencodingsociety.com/csa/sprint9/objectives

   **Example for NodCursor:**
   ```
   - Maps/Dictionaries: Settings management feature persists user calibration preferences
   - Arrays: Face landmark collection processes 468 landmarks per tracking frame
   - Queues: Smoothing buffer implements circular queue for real-time cursor smoothing
   ```

2. **How Does This Show Team Coordination?**
   - Each group member explains their individual DS contribution
   - How do individual implementations work together?
   - What integration testing shows they work as one system?

3. **Real-World Impact**
   - How do these DS choices solve your accessibility problem?
   - What would break if DS implementation failed?
   - Capstone relevance: Why this matters beyond the grade

### [ ] Part 2: Update `/capstone` with Group Consensus

**Location:** `/home/pranav/ocs/NodCursor/docs/DS_2/GROUP_CAPSTONE_UPDATES/`

Create/update a capstone summary that includes:

```markdown
## Group [#]: [Project Name] - Data Structures Implementation

### Individual Contributions
- [Person A]: Responsible for [DS Type #1] - [Feature Description]
- [Person B]: Responsible for [DS Type #2] - [Feature Description]  
- [Person C]: Responsible for [DS Type #3] - [Feature Description]

### DS → Feature Mapping
| Data Structure | Implementation | Feature Impact | Individual Owner |
|---|---|---|---|
| Example: Maps | Settings dict (30+ keys) | User preferences persist across sessions | [Name] |
| Example: Arrays | Landmark collection | Face detection pipeline processes 468 points | [Name] |
| Example: Queues | Circular buffer | Cursor smoothing reduces jitter 85% | [Name] |

### Team Sync Evidence
- All individual DS work integrates without errors
- Code review comments show cross-member verification
- [Link to GitHub PR with team feedback]

### Capstone Statement
[2-3 sentences on how this project demonstrates CS113 competency in DS + OOP + team collaboration]
```

---

## Wednesday Meeting Schedule

### Group Presentation Order (Self-Volunteer or Random Call)

Goal: 4-5 groups complete before break

**[ ] Group 1:** ___________________________________  
- Presenters: [Names]
- Primary DS: [Types]
- Time: 10 min presentation + 5 min questions

**[ ] Group 2:** ___________________________________  
- Presenters: [Names]
- Primary DS: [Types]
- Time: 10 min presentation + 5 min questions

**[ ] Group 3:** ___________________________________  
- Presenters: [Names]
- Primary DS: [Types]
- Time: 10 min presentation + 5 min questions

**[ ] Group 4:** ___________________________________  
- Presenters: [Names]
- Primary DS: [Types]
- Time: 10 min presentation + 5 min questions

**[ ] Group 5:** ___________________________________  
- Presenters: [Names]
- Primary DS: [Types]
- Time: 10 min presentation + 5 min questions

---

## How Individual + Group sync Saves Time

**Efficiency Strategy:**

1. **Individual Prep (15 min):**
   - Each person writes FRQ/teaching summary independently
   - Reduces meeting time, ensures depth

2. **Group Alignment (5 min):**
   - Compare individual answers
   - Spot overlaps and conflicts early
   - Verify team is "in sync"

3. **Group Discussion (10 min):**
   - Focus on features and capstone narrative
   - Skip basics already covered in individual work
   - Make integration decisions

4. **Capstone Consensus (5 min):**
   - Everyone agrees on feature-to-DS mapping
   - Clear individual attribution
   - Ready to move to documentation

**Total prep + discussion:** ~35 min per group  
**Result:** High-quality capstone section ready for finalization

---

## Acceptance Criteria

- [ ] Each team member completes individual FRQ summary
- [ ] Group identifies 2-3 core DS used in project
- [ ] Capstone update maps individual contributions to DS features
- [ ] Integration story: How individual work created team solution
- [ ] Presentation: 10-15 minutes with evidence links
- [ ] Documentation: Submitted to `/capstone` folder by Wednesday EOD

---

## Deliverables Structure

```
/home/pranav/ocs/NodCursor/docs/DS_2/
├── INDIVIDUAL_ANSWERS/
│   ├── [Person A]_FRQ_Summary.md
│   ├── [Person B]_FRQ_Summary.md
│   └── [Person C]_FRQ_Summary.md
├── GROUP_CAPSTONE_UPDATES/
│   ├── Group_1_Capstone_Section.md
│   ├── Group_2_Capstone_Section.md
│   ├── Group_3_Capstone_Section.md
│   ├── Group_4_Capstone_Section.md
│   └── Group_5_Capstone_Section.md
└── PRESENTATION_NOTES.md (compiled group order + times)
```

---

## Key References

- **Individual Objectives:** https://pages.opencodingsociety.com/csa/sprint9/objectives
- **CS113 Alignment:** [docs/CS113_ALIGNMENT.md](./CS113_ALIGNMENT.md)
- **Data Structures Evidence:** [docs/DATA_STRUCTURES_EVIDENCE.md](./DATA_STRUCTURES_EVIDENCE.md)
- **Current Project Capstone:** [docs/DESIGN_PRINCIPLES.md](./DESIGN_PRINCIPLES.md)

---

## Next Steps After Wednesday

1. Collect all individual + group responses
2. Compile unified capstone statement from all groups
3. Week 35: Final capstone review + integration testing
4. Week 36: Blog portfolio section on DS implementation complete

