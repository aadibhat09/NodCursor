# NodCursor Accessibility Guide

**Comprehensive guide for users, caregivers, and accessibility professionals**

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [System Requirements](#system-requirements)
3. [Initial Setup](#initial-setup)
4. [Calibration Tutorial](#calibration-tutorial)
5. [Interaction Methods](#interaction-methods)
6. [Advanced Usage](#advanced-usage)
7. [Troubleshooting](#troubleshooting)
8. [Tips for Specific Conditions](#tips-for-specific-conditions)
9. [Caregiver Guide](#caregiver-guide)
10. [Accessibility Features](#accessibility-features)

---

## Related Documentation

- In-app documentation blog: `/documentation/overview`
- Product motivation: `docs/WHY_WE_STARTED.md`
- Developer reference: `docs/API.md`
- Typing behavior and tuning: `docs/TYPING_SYSTEM.md`

---

## Getting Started

### What is NodCursor?

NodCursor is a browser-based assistive technology that enables computer control through head movements and facial gestures. It's designed for individuals who have limited or no hand mobility.

### Who Can Benefit?

- Individuals with spinal cord injuries
- People with ALS, MS, or muscular dystrophy  
- Those with cerebral palsy or arthritis
- Amputees or those with limb differences
- Anyone experiencing temporary hand mobility limitations
- Users exploring alternative input methods

### First Time User Checklist

- [ ] Webcam working and positioned correctly
- [ ] Good lighting (face clearly visible)
- [ ] Comfortable seated position
- [ ] Chrome or Edge browser (recommended)
- [ ] 15-20 minutes for initial setup and practice

---

## System Requirements

### Minimum Hardware
- **Webcam**: 720p resolution, 30fps
- **Computer**: 4GB RAM, dual-core processor
- **Internet**: Required for initial MediaPipe model download

### Recommended Hardware
- **Webcam**: 1080p resolution, 60fps
- **Computer**: 8GB+ RAM, quad-core processor
- **Monitor**: 1920x1080 or higher
- **Lighting**: Desk lamp or natural light facing you

### Software Requirements
- **Browser**: Chrome 90+, Edge 90+, Firefox 88+, or Safari 14+
- **Operating System**: Windows 10+, macOS 10.15+, or Linux
- **Permissions**: Camera access (microphone for voice commands)

---

## Initial Setup

### Step 1: Hardware Positioning

**Webcam Placement:**
1. Position camera at eye level (tripod or monitor mount)
2. Center yourself in the frame (shoulders and head visible)
3. Distance: 18-24 inches from camera
4. Angle: Slightly tilted down toward your face

**Lighting Setup:**
1. Face a window or light source (not backlit)
2. Avoid shadows on your face
3. Consistent, diffuse lighting works best
4. Avoid strong overhead lights creating shadows

**Seating Position:**
1. Sit upright with head centered
2. Comfortable, sustainable posture
3. Armrests for stability if available
4. Back support to minimize fatigue

### Step 2: Browser Configuration

1. Open Chrome or Edge browser
2. Navigate to NodCursor URL
3. Allow camera permissions when prompted:
   - Click "Allow" on permission dialog
   - Check "Remember this decision"
4. (Optional) Allow microphone for voice commands

### Step 3: Test Camera

1. Go to the `/demo` page
2. Verify your face appears in the "Camera View" panel
3. Check that face mesh overlays appear (if visible)
4. Confirm "Source: camera" label shows in the video panel

---

## Calibration Tutorial

**Why Calibrate?**  
Calibration maps your personal head movement range to screen space, improving accuracy and reducing fatigue.

### 5-Step Calibration Process

**Before Starting:**
- Settle into your comfortable working position
- Ensure good lighting and clear camera view
- Take a moment to relax your neck and shoulders

#### Step 1: Center Position
1. Navigate to `/calibration` page
2. Look straight ahead at the camera
3. Keep head level and centered
4. Click "Capture Position" button (blink or voice command)
5. Hold position until confirmation appears

#### Step 2: Look Left
1. Turn head slowly to your comfortable left limit
2. Don't force or strain
3. Keep eyes on monitor if possible
4. Click "Capture Position"

#### Step 3: Look Right
1. Return to center, then turn right
2. Match the effort used for left position
3. Maintain comfortable range
4. Click "Capture Position"

#### Step 4: Look Up
1. Return to center
2. Tilt head upward comfortably
3. Don't extend past comfortable range
4. Click "Capture Position"

#### Step 5: Look Down
1. Return to center
2. Tilt head downward
3. Match the up position range
4. Click "Capture Position"

**After Calibration:**
- Progress bar shows 100%
- Message confirms "Calibration complete"
- Test cursor movement in demo page
- Re-calibrate anytime if position changes

### Calibration Best Practices

- **Consistency**: Keep same seating position
- **Comfort**: Never force painful movements
- **Lighting**: Maintain same lighting conditions
- **Fatigue**: Take breaks and re-calibrate when refreshed
- **Changes**: Re-calibrate if you adjust chair, camera, or lighting

---

## Interaction Methods

### Head Tracking Cursor

**How it Works:**
Your nose position controls cursor location. Move your head to move the cursor across the screen.

**Movement Tips:**
- Start with slow, deliberate movements
- Use small head tilts for precision
- RAdvanced Usage

### Virtual Buttons Panel

Located on right side of Demo page:
- **Left Click**: Force left click at cursor
- **Right Click**: Force right click
- **Scroll**: Scroll page down
- **Drag Toggle**: Enter/exit drag mode

**When to Use:**
- Testing specific actions
- Gesture not working
- Quick access to functions
- Learning the system

### Settings Optimization

**For Precision Work (CAD, Design):**
```
Cursor Speed: 0.7
Smoothing: 0.8
Deadzone: 0.05
Dwell Time: 1200ms
```

**For Fast Browsing:**
```
Cursor Speed: 1.5
Smoothing: 0.5
Deadzone: 0.02
Dwell Time: 600ms
```

**For Tremor/Spasticity:**
```
Cursor Speed: 0.8
Smoothing: 0.9
Deadzone: 0.08-0.12
Dwell Time: 1400ms
```

### Multi-Camera Setup

If you have multiple webcams:
1. Go to Settings page
2. Find "Camera Selection" dropdown
3. Choose your preferred camera
4. Settings persist across sessions

**Camera Recommendations:**
- **Built-in**: Convenient, usually sufficient
- **External HD**: Better quality, flexibility
- **Wide Angle**: Captures more movement range
- **High FPS**: Smoother tracking (60fps ideal)

### Profile Management

Settings are saved automatically to browser localStorage:
- Sensitivity, smoothing, deadzone
- Gesture enable/disable states
- Dwell timing
- Camera selection

**To Reset:**
1. Clear browser data for site
2. Or manually adjust all settings to defaults

---

## Troubleshooting

### Camera Issues

**Problem: No camera feed shows**
- **Check**: Camera is plugged in and powered on
- **Check**: Browser has camera permission (Settings > Privacy)
- **Check**: No other app using camera (Zoom, Skype, etc.)
- **Try**: Refresh the page
- **Try**: Restart browser
- **Try**: Restart computer

**Problem: "Camera is unavailable" error**
- **Check**: Camera drivers installed and updated
- **Check**: Camera works in other apps (test with native camera app)
- **Try**: Different USB port (external webcams)
- **Try**: Different browser (Chrome → Edge)

**Problem: Camera feed is dark/blurry**
- Improve lighting (add desk lamp)
- Clean camera lens
- Adjust camera focus if manual
- Move closer to light source

### Tracking Issues

**Problem: Cursor jittery or jumpy**
- **Increase**: Smoothing to 0.8 or higher
- **Increase**: Deadzone to 0.05-0.08
- **Check**: Stable seating position (no wobbling chair)
- **Check**: Camera firmly mounted (not shaking)

**Problem: Cursor too slow**
- **Increase**: Cursor speed to 1.3-1.8
- **Decrease**: Smoothing to 0.5-0.6
- **Check**: Re-calibrate with wider movement range

**Problem: Cursor doesn't reach edges**
- **Re-calibrate**: Use maximum comfortable movement range
- **Increase**: Sensitivity setting
- **Try**: Multi-monitor mode disabled (if applicable)

**Problem: Cursor drifts when head still**
- **Increase**: Deadzone to 0.04-0.08
- **Check**: Consistent lighting (avoid flickering lights)
- **Check**: Head fully stillness (minimize breathing motion)

### Gesture Detection Issues

**Problem: Blinks not detected**
- **Lower**: Click sensitivity to 0.15-0.18
- **Check**: Eyes clearly visible to camera
- **Check**: Lighting not creating shadows over eyes
- **Try**: More deliberate, complete eye closures
- **Alternative**: Use dwell click or mouth gestures

**Problem: Too many false blinks**
- **Raise**: Click sensitivity to 0.28-0.35
- **Avoid**: Quick head movements during tracking
- **Check**: Stable camera position (not wobbling)

**PTips for Specific Conditions

### Spinal Cord Injury (SCI)

**Considerations:**
- Head control may be primary input method
- Sitting tolerance and positioning critical
- May benefit from higher smoothing for stability

**Recommended Settings:**
- Smoothing: 0.75-0.85
- Dwell click: Primary method if blinks fatiguing
- Voice commands: Excellent supplement
- Head tilt scroll: Only if comfortable

**Tips:**
- Work with OT for optimal seating/positioning
- Take frequent breaks (15min every hour)
- Consider mounting camera on wheelchair
- Use dwell for consistent, predictable interaction

### ALS / MND

**Considerations:**
- Progressive condition requiring adaptability
- Fatigue management crucial
- Eye movements may be preserved longer

**Recommended Settings:**
- Start conservative, adjust as needed
- Heavy smoothing (0.85+) as condition progresses
- Dwell click to reduce physical effort
- Voice when speech still strong

**Tips:**
- Bookmark settings that work (screenshot)
- Re-calibrate frequently as range changes
- Plan for eye-tracking mode (future feature)
- Communicate preferences to caregivers

### Tremor / Parkinson's

**Considerations:**
- Involuntary movements require heavy filtering
- On/off periods throughout day
- Consistent positioning helps

**Recommended Settings:**
- Smoothing: 0.9 (maximum)
- Deadzone: 0.10-0.15 (larger than default)
- Dwell time: 1400-1800ms (slower)
- Disable blink if tremor affects eyelids

**Tips:**
- Use during "on" medication periods
- Mount camera/monitor securely (reduce vibration)
- Consider voice as primary method
- Adjust settings daily as needed

### Cerebral Palsy

**Considerations:**
- Spasticity may cause sudden movements
- Range and speed vary greatly
- May have excellent head control

**Recommended Settings:**
- Highly individual - test extensively
- May need high smoothing OR low smoothing
- Dwell vs gestures based on control type
- Experiment with all methods

**Tips:**
- Work with experienced therapist
- Try different calibration ranges
- Video yourself to see movement patterns
- What works may surprise you

### Temporary Injury / RSI

**Considerations:**
- Short-term use during recovery
- May have full head mobility
- Learning curve tolerance

**Recommended Settings:**
- Lower smoothing (0.5-0.6) for responsiveness
- Higher sensitivity (1.3-1.6)
- Gestures + voice for efficiency
- Minimize dwell time (600-800ms)

**Tips:**
- Practice makes perfect
- Combine with keyboard shortcuts
- Use during pain flares only
- Consider ergonomic setup improvements

---

## Caregiver Guide

### Supporting First-Time Users

**Your Role:**
1. Assist with physical positioning
2. Provide encouragement during learning
3. Adjust settings per user feedback
4. Document what works

**Setup Assistance:**
1. Position camera and lighting
2. Help with calibration clicks
3. Verify comfortable posture
4. Test camera permissions

**Teaching Tips:**
- Go slow, one feature at a time
- Celebrate small wins
- Don't rush the learning process
- Let them explore and make mistakes

### Settings Management

**Taking Notes:**
Document successful configurations:
```
User: [Name]
Date: [Date]
Sensitivity: 1.2
Smoothing: 0.8
Deadzone: 0.04
Dwell: 900ms
Gestures: Blink only
Notes: Works best in morning, re-calibrate after lunch
```

**Profile Backup:**
- Screenshot settings panel
- Save to file/folder per user
- Note environmental factors (lighting, position)

### Troubleshooting Support

**When User Struggles:**
1. Stay calm and patient
2. Check obvious things first (camera, lighting)
3. Try one setting change at a time
4. Return to last-known-working state if needed
5. Take breaks to prevent fatigue and frustration

**Communication:**
- Ask what they're experiencing
- Observe their attempts
- Try suggestions methodically
- Document what doesn't work too

### Safety & Comfort

**Monitor For:**
- Neck strain or pain
- Eye fatigue from blink overuse
- Frustration or stress
- Overall posture and positioning

**Encourage Breaks:**
- 15 minutes per hour minimum
- Longer for intensive tasks
- Stretching between sessions
- Hydration and comfort

---

## Accessibility Features

### Built-In Features

**Visual:**
- High contrast dark theme (black background)
- Large touch targets (minimum 44x44px)
- Clear visual feedback for all actions
- Dwell countdown indicator
- Gesture status indicators

**Motor:**
- Multiple input methods (redundancy)
- Adjustable timing for all gestures
- Deadzone prevents micro-movements
- Smoothing reduces precision requirements
- No time-limited actions

**Cognitive:**
- Simple, predictable interface
- Visual confirmation of actions
- Clear labeling and instructions
- Event log shows what happened
- In-app documentation available

**Customization:**
- Every gesture independently toggleable
- Wide range of sensitivity settings
- Persistent preferences
- No forced interaction methods

### Screen Reader Compatibility

Current status:
- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation support (fallback)
- Focus management

**Note:** Primary target users may not use screen readers, but we maintain compatibility.

### Keyboard Fallback

For users who retain some hand function:
- All buttons keyboard accessible
- Tab navigation supported
- Enter/Space to activate
- Escape to close dialogs

---

## Getting Help

### Resources

- **Documentation**: This guide, README, API docs
- **In-App Help**: `/documentation` route
- **Video Tutorials**: (coming soon)
- **GitHub Issues**: Bug reports and feature requests

### Reporting Issues

When reporting bugs, include:
1. Browser and version
2. Operating system
3. Webcam model
4. Settings being used
5. Steps to reproduce
6. What you expected vs what happened

### Feature Requests

We welcome suggestions:
- Accessibility improvements
- New gesture types
- UI/UX enhancements
- Integration with other tools

---

**Remember:** Everyone's abilities are unique. What works for one person may not work for another. Be patient with yourself during the learning process, and don't hesitate to experiment with different settings and methods.

**This is assistive technology designed around you. Make it yours.**
**Problem: Long blink not working**
- Must hold eyes closed > 900ms
- **Practice**: Count to one-thousand-one while closed
- Visual indicator shows when drag mode activated

### Voice Command Issues

**Problem: Voice commands not working**
- **Check**: Using Chrome or Edge (required)
- **Check**: Microphone permission granted
- **Check**: Enabled in Settings panel
- **Test**: Browser microphone works (other sites/apps)
- **Try**: Speaking louder or clearer

**Problem: Wrong commands recognized**
- Speak slowly and clearly
- Pause 1-2 seconds between commands
- Reduce background noise
- Use exact command phrases

### Keyboard Typing Issues

**Problem: Keys advance too fast**
- Close mouth completely between gestures
- Pause 300-500ms between actions
- Practice rhythm: "Open... close... open... close"

**Problem: Smile not selecting key**
- **Make**: Wider, more exaggerated smile
- **Check**: Mouth gesture enabled in Settings
- **Alternative**: Use blink instead

**Problem: Hard to hit specific keys**
- **Practice**: Let it cycle multiple times
- **Slow Down**: Wait for highlight, don't rush
- **Restart**: Use "Start Mouth Typing" to reset position

### Performance Issues

**Problem: Lag or low framerate**
- **Close**: Unnecessary browser tabs
- **Check**: CPU usage (Task Manager)
- **Update**: Graphics drivers
- **Try**: Lower webcam resolution in OS settings
- **Hardware**: May need more powerful computer

**Problem: Page scrolling unexpectedly**
- **Disable**: Head tilt scroll in Settings (default: off)
- **Adjust**: Tilt threshold if re-enabled
- **Maintain**: Neutral head position

---

### Blink-Based Clicking

**Single Blink** = Left Click
- Close both eyes briefly (< 300ms)
- Opens menus, follows links, selects text
- Practice: Try clicking a button repeatedly

**Double Blink** = Right Click
- Two quick blinks within 450ms
- Opens context menus
- Alternative: Long press/dwell
- Practice: Right-click desktop icons

**Long Blink** (hold > 900ms) = Drag Mode Toggle
- Hold eyes closed to enter drag mode
- Move head to drag object
- Blink again to release
- Practice: Drag desktop icons

**Troubleshooting Blinks:**
- **Not Detecting**: Lower click sensitivity (0.15-0.20)
- **Too Sensitive**: Raise click sensitivity (0.25-0.30)
- **Accidental Triggers**: Close eyes more deliberately
- **Hard to Double Blink**: Increase time window in settings

### Dwell Click

**What is Dwell?**
Hover cursor over target for set duration to trigger click automatically.

**How to Use:**
1. Move cursor over button or link
2. Hold position steady
3. Watch countdown indicator
4. Click triggers when filled

**Dwell Settings:**
- **Fast**: 400-600ms (quick actions)
- **Medium**: 800-1000ms (general use)
- **Slow**: 1200-1800ms (precision work)

**When to Use Dwell:**
- Blink detection unreliable
- Eye fatigue from blinking
- Precision clicking needed
- Consistent, predictable action

### Mouth Gestures

**Mouth Open** = Click (optional)
- Open mouth wide briefly
- Alternative to blinking
- Enable in settings if preferred
- 700ms cooldown prevents accidental repeats

**Smile** = Double Click (optional)
- Wide smile triggers action
- Alternative interaction method
- 900ms cooldown
- Practice: Try on folder icons

**Configuration:**
- Toggle on/off in Settings panel
- Adjust cooldown if too sensitive
- Combine with other methods
- Test in Demo playground

### Voice Commands

**Available Commands:**
- "click" → Left click at cursor
- "right click" → Context menu
- "drag" → Toggle drag mode
- "scroll up" → Move page up
- "scroll down" → Move page down

**Setup Requirements:**
1. Chrome or Edge browser
2. Enable in Settings panel
3. Allow microphone permission
4. Speak clearly and naturally

**Tips:**
- Pause between commands
- Consistent tone and pace
- Avoid background noise
- Test in quiet environment first

### On-Screen Keyboard

**Activating Keyboard:**
1. Go to Demo page
2. Click "Show Keyboard" button
3. Click "Start Mouth Typing"

**Typing Process:**
1. **Mouth Open**: Advances to next key (green highlight)
2. **Smile**: Selects the highlighted key
3. **Double Blink**: Backspace last character

**Keys Available:**
- Full alphabet (a-z)
- Numbers (0-9)
- SPACE, BACKSPACE, CLEAR, ENTER

**Tips:**
- Pace yourself (1-2 keys per second)
- Watch text area for confirmation
- Use CLEAR to start over
- Practice with short words first

---

## Troubleshooting

- No camera feed: verify browser permission and camera availability.
- Jittery cursor: increase smoothing and deadzone.
- Missed blinks: raise click sensitivity threshold.
- Voice commands missing: use Chrome/Edge and ensure microphone permissions.
- Page scrolling unexpectedly: keep head-tilt scroll disabled in Settings unless needed.
- Keyboard gesture typing too fast: pause mouth-open motion between key steps.

## Accessibility Considerations

- Large controls and high contrast styling are default.
- Most controls are keyboard reachable.
- Debug mode is visible in Settings for caregiver support.
