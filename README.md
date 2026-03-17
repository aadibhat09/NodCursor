# NodCursor

<div align="center">

**Browser-based head-tracking cursor control for accessibility**

*Empowering users with motor impairments through gesture-driven computer interaction*

[Live Demo](#) • [Documentation](docs/) • [Report Bug](../../issues) • [Request Feature](../../issues)

</div>

---

## Table of Contents

- [About](#about)
- [Key Features](#key-features)
- [Quick Start](#quick-start)
- [How It Works](#how-it-works)
- [Usage Guide](#usage-guide)
- [Configuration](#configuration)
- [Browser Compatibility](#browser-compatibility)
- [Privacy & Security](#privacy--security)
- [Architecture](#architecture)
- [Contributing](#contributing)
- [License](#license)

---

## About

NodCursor transforms head movements and facial gestures into precise cursor control, enabling hands-free computer interaction for individuals with motor impairments, spinal cord injuries, ALS, cerebral palsy, or anyone who benefits from alternative input methods.

**Why NodCursor?**

- **Zero Installation**: Runs entirely in the browser with no software to install
- **Privacy First**: All processing happens locally on your device
- **Accessible by Default**: High contrast UI, large controls, screen-reader friendly
- **Customizable**: Extensive settings for sensitivity, gestures, and interaction methods
- **Free & Open Source**: MIT licensed, community-driven development

## Key Features

### Core Interaction Methods

#### Head Tracking
- Real-time face landmark detection via MediaPipe
- Smooth cursor movement with customizable sensitivity
- Calibration system for personalized range mapping
- Deadzone and acceleration controls for precision

#### Gesture Controls
- **Blink Detection**: Single blink → left click
- **Double Blink**: Quick double blink → right click  
- **Long Blink**: Hold blink → toggle drag mode
- **Mouth Open**: Optional click trigger
- **Smile**: Optional double-click action
- **Head Tilt**: Optional scroll control (disabled by default)

#### Dwell Click
- Hover-to-click with configurable dwell time
- Visual countdown indicator
- Adjustable sensitivity (400ms - 2200ms)

#### Voice Commands
- "click" → left click
- "right click" → contextual menu
- "drag" → toggle drag mode
- "scroll up" / "scroll down" → page navigation
- Chrome/Edge recommended for best speech recognition

### On-Screen Keyboard

Revolutionary mouth-gesture typing system:
- **Mouth Open**: Cycle through keys
- **Smile**: Select highlighted key
- **Double Blink**: Backspace
- Full alphanumeric keyboard with space, enter, and clear
- Real-time text preview

### Additional Features

- Virtual action buttons for quick access
- Live gesture indicator panel
- Camera selection for multi-camera setups
- Fallback mouse mode when camera unavailable
- Event logging for debugging and learning
- Dark mode optimized for reduced eye strain

## How It Works

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Webcam    │────▶│  MediaPipe   │────▶│   Cursor    │
│   Stream    │     │ Face Tracker │     │  Position   │
└─────────────┘     └──────────────┘     └─────────────┘
                           │                      │
                           ▼                      ▼
                    ┌──────────────┐     ┌─────────────┐
                    │ Web Worker   │────▶│   Gesture   │
                    │  Smoothing   │     │   Actions   │
                    └──────────────┘     └─────────────┘
```

1. **Camera Input**: WebRTC captures video stream from your webcam
2. **Face Detection**: MediaPipe identifies 478 facial landmarks in real-time
3. **Position Mapping**: Nose position is mapped to screen coordinates
4. **Smoothing**: Exponential smoothing filters out jitter (Web Worker)
5. **Gesture Recognition**: Blink ratios and mouth movements detected
6. **Action Dispatch**: Gestures trigger mouse events at cursor position

## Browser Compatibility
### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/NodCursor.git
cd NodCursor

# Install dependencies
npm install

# Start development server
npm run dev
```

### First-Time Setup

1. **Grant Camera Permission**: Browser will prompt for webcam access
2. **Navigate to Calibration** (`/calibration`): 
   - Follow the 5-step guided setup
   - Look center, left, right, up, down when prompted
   - Click "Capture Position" at each step
3. **Test in Demo** (`/demo`):
   - See your cursor move with head motion
   - Try blinking to click buttons
   - Experiment with the on-screen keyboard
4. **Adjust Settings** (`/settings`):
   - Fine-tune sensitivity and smoothing
   - Enable/disable gesture types
   - Configure dwell click timing

### Production Build

```bash
npm run build
npm run preview
```

### Docker (Optional)

```bash
docker build -t nodcursor .
docker run -p 5173:5173 nodcursor
```

## Usage Guide

### Basic Cursor Control

1. **Position your face** in the center of the camera view
2. **Move your head** slowly to move the cursor
3. **Blink** to click on elements
4. **Double blink** quickly for right-click

### Calibration Tips

- Sit comfortably at your usual distance from the screen
- Ensure good lighting (avoid backlighting)
- Keep head movements smooth and deliberate
- Re-calibrate if you change seating position or camera angle

### Using the On-Screen Keyboard

1. Click "Show Keyboard" in the Demo page
2. Click "Start Mouth Typing"
3. **Open your mouth** to advance to the next key (highlighted in green)
4. **Smile** to select the highlighted key
5. **Double blink** to backspace
6. Type your message in the text area above

### Advanced Features

- **Dwell Click**: Hover over element and wait for countdown
- **Virtual Buttons**: Use right-side overlay for quick actions
- **Voice Commands**: Enable in settings and speak commands
- **Drag Mode**: Long blink to toggle, move cursor while holding

## Configuration

### Sensitivity Settings

| Setting | Range | Default | Description |
|---------|-------|---------|-------------|
| Cursor Speed | 0.5 - 2.0 | 1.0 | Movement sensitivity multiplier |
| Smoothing | 0.1 - 0.9 | 0.7 | Higher = smoother but slower response |
| Deadzone | 0.01 - 0.2 | 0.03 | Center area with no movement |
| Acceleration | 0.5 - 2.0 | 1.2 | Speed increase for larger movements |
| Dwell Time | 400 - 2200ms | 900ms | Hover duration before click |
| Click Sensitivity | 0.1 - 0.5 | 0.22 | Blink detection threshold |

### Gesture Toggles

All gestures can be independently enabled/disabled:
- Blink detection (click/right-click/drag)
- Mouth gestures (click/double-click)
- Head tilt scrolling
- Voice commands

###Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS (accessibility-focused design tokens)
- **ML/Vision**: MediaPipe Tasks Vision, TensorFlow.js
- **Camera**: WebRTC getUserMedia API
- **Performance**: Web Workers for off-thread processing
- **Voice**: Web Speech API
- **State**: React Context + localStorage persistence

## Performance

- **30+ FPS** head tracking on modern hardware
- **< 50ms** input latency from movement to cursor update
- **Web Worker** offloads smoothing calculations from UI thread
- **RequestAnimationFrame** for smooth rendering
- **Lazy loading** of MediaPipe models
- **Fallback mode** when camera unavailable

## Contributing

We welcome contributions from everyone! See [CONTRIBUTING.md](docs/CONTRIBUTING.md) for:
- Code of conduct
- Development setup
- Pull request process
- Coding standards
- Accessibility guidelines

**Quick Contribution Ideas:**
- Improve gesture detection accuracy
- Add new interaction methods
- Enhance UI/UX for specific disabilities
- Write tutorials or documentation
- Translate to other languages
- Report bugs or suggest features

## Documentation

- **[Accessibility Guide](docs/ACCESSIBILITY_GUIDE.md)**: Setup, usage, and troubleshooting
- **[API Documentation](docs/API.md)**: Internal module reference
- **[Getting Started](docs/GETTING_STARTED.md)**: Detailed first-time setup
- **[Architecture](docs/ARCHITECTURE.md)**: Technical deep-dive
- In-app docs at `/documentation` route

## Roadmap

- [ ] Eye-tracking mode for users with limited head mobility
- [ ] Custom gesture builder
- [ ] Profile system for multiple users
- [ ] Multi-monitor support
- [ ] Mobile/tablet support
- [ ] Integration with assistive technology APIs
- [ ] Machine learning-based gesture customization

## Acknowledgments

Built with:
- [MediaPipe](https://google.github.io/mediapipe/) by Google
- [React](https://react.dev/) by Meta
- [Tailwind CSS](https://tailwindcss.com/)
- Accessibility feedback from users and occupational therapists

Contributors:
- aadibhat09 (aadibhat09@gmail.com)

## License

MIT License - see [LICENSE](LICENSE) for details

## Support

- **Issues**: [GitHub Issues](../../issues)
- **Discussions**: [GitHub Discussions](../../discussions)
- **Email**: accessibility@nodcursor.org (coming soon)

---

**Made with ❤️ for accessibility**
- 4GB RAM minimum

## Privacy & Security

### What We Track
- **Nothing.** All processing happens in your browser's memory.

### What We Store
- User preferences in browser's localStorage (sensitivity settings, etc.)
- No video frames are saved, transmitted, or analyzed outside your device

### Permissions Required
- **Camera**: Required for head tracking
- **Microphone** (optional): Only if voice commands enabled
- You can revoke permissions anytime through browser settings

### Security Best Practices
- Camera stream never leaves your device
- No analytics or telemetry
- No external API calls for tracking (MediaPipe WASM loads from CDN)
- Open source code for full transparency

## Quick Start

```bash
npm install
npm run dev
```

Open the local URL in your browser and grant camera access when prompted.

## CI/CD

This project uses GitHub Actions workflows:

- **CI Workflow**: Validates builds and type safety on push/PR to main and develop branches (Node 18.x and 20.x)
- **Deploy Workflow**: Automatically deploys to GitHub Pages on push to main

To enable GitHub Pages deployment:
1. Go to repository Settings > Pages
2. Set Source to "GitHub Actions"
3. If deploying to a repository path (not root domain), update `vite.config.ts` with `base: '/your-repo-name/'`
4. Push to main branch to trigger deployment

## App Pages

- `/` Home overview and privacy explanation
- `/demo` full interactive test playground
- `/calibration` guided range capture
- `/settings` controls, toggles, camera selection, debug mode
- `/documentation` in-app development and accessibility blog

## Architecture

```text
src/
  components/
    CameraView/
    CursorOverlay/
    CalibrationUI/
    SettingsPanel/
    GestureIndicators/
  hooks/
    useFaceTracking.ts
    useCursorMapping.ts
    useBlinkDetection.ts
    useDwellClick.ts
    useVoiceCommands.ts
    useGestureControls.ts
    useMouthTypingControls.ts
  utils/
    smoothing/
    calibration/
    gestureDetection/
  workers/
    trackingWorker.ts
  pages/
    Home/
    Demo/
    Calibration/
    Settings/
  context/
    AppContext.tsx
```

## Performance Notes

- Landmark post-processing runs in a Web Worker.
- UI thread remains responsive with requestAnimationFrame loops.
- Fallback pointer mode is provided when camera access fails.

## Contribution Guide

1. Fork or clone.
2. Create a feature branch.
3. Keep accessibility and keyboard usability first.
4. Run `npm run build` before opening a PR.

## Documentation Checklist

See `docs/ACCESSIBILITY_GUIDE.md` and `.github/ISSUE_TEMPLATE/documentation-setup-usage-accessibility-guide.md`.
