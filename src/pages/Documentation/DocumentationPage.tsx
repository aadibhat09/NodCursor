import { useNavigate } from 'react-router-dom';
import { Panel } from '../../components/common';
import { useAppContext } from '../../context/AppContext';
import { useVoiceCommands } from '../../hooks/useVoiceCommands';

export function DocumentationPage() {
  const { settings } = useAppContext();
  const navigate = useNavigate();

  useVoiceCommands(settings.voiceEnabled, {
    scrollUp:   () => window.scrollBy({ top: -200, behavior: 'smooth' }),
    scrollDown: () => window.scrollBy({ top:  200, behavior: 'smooth' }),
    navigate:   (path) => navigate(path)
  });

  return (
    <div className="grid gap-4">
      <Panel title="NodCursor Documentation" className="animate-float-in">
        <div className="space-y-4 text-sm text-app-subtle">
          <p className="text-base">
            <strong>NodCursor</strong> is a browser-based assistive technology that enables computer control through head movements and facial gestures. This comprehensive guide covers everything from getting started to advanced usage.
          </p>
          <div className="rounded-lg border border-app-accent/20 bg-app-panelAlt p-4">
            <h3 className="mb-2 font-semibold text-app-text">Quick Navigation</h3>
            <ul className="grid grid-cols-2 gap-2 text-xs">
              <li>• Getting Started</li>
              <li>• Interaction Methods</li>
              <li>• Configuration Guide</li>
              <li>• Troubleshooting</li>
              <li>• Accessibility Tips</li>
              <li>• Developer API</li>
            </ul>
          </div>
        </div>
      </Panel>

      <Panel title="Getting Started" className="animate-float-in">
        <div className="space-y-4 text-sm text-app-subtle">
          <div>
            <h3 className="mb-2 font-semibold text-app-text">System Requirements</h3>
            <ul className="space-y-1 text-xs">
              <li><strong>Webcam:</strong> 720p minimum, 1080p recommended</li>
              <li><strong>Browser:</strong> Chrome 90+, Edge 90+, Firefox 88+, or Safari 14+</li>
              <li><strong>Memory:</strong> 4GB RAM minimum, 8GB+ recommended</li>
              <li><strong>Lighting:</strong> Face clearly visible, no backlighting</li>
            </ul>
          </div>
          
          <div>
            <h3 className="mb-2 font-semibold text-app-text">First-Time Setup (4 Steps)</h3>
            <ol className="space-y-2 text-xs">
              <li><strong>1. Camera Permission:</strong> Click "Allow" when prompted by your browser</li>
              <li><strong>2. Calibration:</strong> Visit the Calibration page and capture 5 positions (center, left, right, up, down)</li>
              <li><strong>3. Test:</strong> Try the Demo page to test cursor control and gestures</li>
              <li><strong>4. Adjust:</strong> Fine-tune settings to match your comfort and range</li>
            </ol>
          </div>

          <div className="rounded-lg border border-app-accent/20 bg-app-panelAlt p-3">
            <p className="text-xs">
              <strong>Tip:</strong> Position your webcam at eye level, 18-24 inches away. Ensure your face is well-lit from the front, not backlit by a window.
            </p>
          </div>
        </div>
      </Panel>

      <Panel title="Interaction Methods" className="animate-float-in">
        <div className="space-y-4 text-sm text-app-subtle">
          <div>
            <h3 className="mb-2 font-semibold text-app-text">Head Tracking Cursor</h3>
            <p className="mb-2 text-xs">Control cursor position by moving your head. Your nose position directly maps to cursor location.</p>
            <ul className="space-y-1 text-xs">
              <li>• Start with slow, deliberate movements</li>
              <li>• Use small head tilts for precision work</li>
              <li>• Adjust sensitivity: 0.7 for precision, 1.5 for speed</li>
              <li>• Increase smoothing (0.8-0.9) to reduce jitter</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-2 font-semibold text-app-text">Blink-Based Clicking</h3>
            <div className="space-y-2 text-xs">
              <div className="rounded border border-app-accent/20 bg-app-panelAlt p-2">
                <strong>Single Blink:</strong> Left Click (under 300ms)
                <p className="text-app-subtle/80">Opens menus, follows links, selects text</p>
              </div>
              <div className="rounded border border-app-accent/20 bg-app-panelAlt p-2">
                <strong>Double Blink:</strong> Right Click (two blinks within 450ms)
                <p className="text-app-subtle/80">Opens context menus</p>
              </div>
              <div className="rounded border border-app-accent/20 bg-app-panelAlt p-2">
                <strong>Long Blink:</strong> Drag Mode Toggle (over 900ms)
                <p className="text-app-subtle/80">Hold eyes closed to enter drag, blink again to release</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-2 font-semibold text-app-text">Dwell Click</h3>
            <p className="mb-2 text-xs">Hover cursor over target for set duration to trigger click automatically.</p>
            <ul className="space-y-1 text-xs">
              <li>• Fast: 400-600ms (quick actions)</li>
              <li>• Medium: 800-1000ms (general use)</li>
              <li>• Slow: 1200-1800ms (precision work)</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-2 font-semibold text-app-text">Voice Commands</h3>
            <p className="mb-2 text-xs">Speak commands to trigger actions (Chrome/Edge only):</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>"click" → Left click</div>
              <div>"right click" → Context menu</div>
              <div>"drag" → Toggle drag mode</div>
              <div>"scroll up/down" → Page scroll</div>
            </div>
          </div>

          <div>
            <h3 className="mb-2 font-semibold text-app-text">On-Screen Keyboard</h3>
            <p className="mb-2 text-xs">Type using facial gestures:</p>
            <ul className="space-y-1 text-xs">
              <li><strong>Mouth Open:</strong> Advance to next key (green highlight)</li>
              <li><strong>Smile:</strong> Select the highlighted key</li>
              <li><strong>Double Blink:</strong> Backspace last character</li>
            </ul>
          </div>
        </div>
      </Panel>

      <Panel title="Configuration Guide" className="animate-float-in">
        <div className="space-y-4 text-sm text-app-subtle">
          <div>
            <h3 className="mb-2 font-semibold text-app-text">Core Settings</h3>
            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-3 gap-2 rounded-lg border border-app-accent/20 bg-app-panelAlt p-2">
                <div><strong>Cursor Speed</strong></div>
                <div>0.1 - 3.0</div>
                <div>Default: 1.0</div>
              </div>
              <div className="grid grid-cols-3 gap-2 rounded-lg border border-app-accent/20 bg-app-panelAlt p-2">
                <div><strong>Smoothing</strong></div>
                <div>0.0 - 0.95</div>
                <div>Default: 0.7</div>
              </div>
              <div className="grid grid-cols-3 gap-2 rounded-lg border border-app-accent/20 bg-app-panelAlt p-2">
                <div><strong>Deadzone</strong></div>
                <div>0.0 - 0.2</div>
                <div>Default: 0.02</div>
              </div>
              <div className="grid grid-cols-3 gap-2 rounded-lg border border-app-accent/20 bg-app-panelAlt p-2">
                <div><strong>Dwell Time</strong></div>
                <div>400 - 2200ms</div>
                <div>Default: 800ms</div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-2 font-semibold text-app-text">Recommended Presets</h3>
            <div className="space-y-3 text-xs">
              <div className="rounded-lg border border-app-accent/20 bg-app-panelAlt p-3">
                <h4 className="mb-1 font-semibold text-app-text">Precision Work (CAD, Design)</h4>
                <div className="grid grid-cols-2 gap-1 text-app-subtle/90">
                  <div>Speed: 0.7</div>
                  <div>Dwell: 1200ms</div>
                  <div>Smoothing: 0.8</div>
                  <div>Deadzone: 0.05</div>
                </div>
              </div>
              <div className="rounded-lg border border-app-accent/20 bg-app-panelAlt p-3">
                <h4 className="mb-1 font-semibold text-app-text">Fast Browsing</h4>
                <div className="grid grid-cols-2 gap-1 text-app-subtle/90">
                  <div>Speed: 1.5</div>
                  <div>Dwell: 600ms</div>
                  <div>Smoothing: 0.5</div>
                  <div>Deadzone: 0.02</div>
                </div>
              </div>
              <div className="rounded-lg border border-app-accent/20 bg-app-panelAlt p-3">
                <h4 className="mb-1 font-semibold text-app-text">Tremor Compensation</h4>
                <div className="grid grid-cols-2 gap-1 text-app-subtle/90">
                  <div>Speed: 0.8</div>
                  <div>Dwell: 1400ms</div>
                  <div>Smoothing: 0.9</div>
                  <div>Deadzone: 0.10-0.15</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Panel>

      <Panel title="Troubleshooting Common Issues" className="animate-float-in">
        <div className="space-y-4 text-sm text-app-subtle">
          <div>
            <h3 className="mb-2 font-semibold text-app-text">Camera Problems</h3>
            <div className="space-y-2 text-xs">
              <div>
                <strong>No camera feed:</strong>
                <ul className="ml-4 mt-1 space-y-1">
                  <li>• Check browser has camera permission</li>
                  <li>• Close other apps using camera (Zoom, Skype)</li>
                  <li>• Try refreshing the page</li>
                  <li>• Restart browser or computer</li>
                </ul>
              </div>
              <div>
                <strong>Dark or blurry feed:</strong>
                <ul className="ml-4 mt-1 space-y-1">
                  <li>• Add desk lamp or move toward light source</li>
                  <li>• Clean camera lens</li>
                  <li>• Adjust camera focus if manual</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-2 font-semibold text-app-text">Tracking Problems</h3>
            <div className="space-y-2 text-xs">
              <div>
                <strong>Cursor jittery:</strong> Increase smoothing to 0.8+ and deadzone to 0.05-0.08
              </div>
              <div>
                <strong>Cursor too slow:</strong> Increase speed to 1.3-1.8, decrease smoothing to 0.5-0.6
              </div>
              <div>
                <strong>Cursor drifts:</strong> Increase deadzone to 0.04-0.08, check lighting consistency
              </div>
              <div>
                <strong>Cannot reach edges:</strong> Re-calibrate with wider movement range, increase sensitivity
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-2 font-semibold text-app-text">Gesture Detection</h3>
            <div className="space-y-2 text-xs">
              <div>
                <strong>Blinks not detected:</strong> Lower click sensitivity to 0.15-0.18, ensure eyes visible
              </div>
              <div>
                <strong>Too many false blinks:</strong> Raise click sensitivity to 0.28-0.35
              </div>
              <div>
                <strong>Cannot double blink:</strong> Practice timing (two blinks within 450ms), use voice command instead
              </div>
              <div>
                <strong>Keyboard typing too fast:</strong> Close mouth completely between gestures, pause 300-500ms
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-2 font-semibold text-app-text">Performance Issues</h3>
            <div className="space-y-2 text-xs">
              <div>
                <strong>Lag or low framerate:</strong> Close unnecessary tabs, update graphics drivers, may need more powerful hardware
              </div>
              <div>
                <strong>Page scrolling unexpectedly:</strong> Disable head tilt scroll in Settings (default: off)
              </div>
            </div>
          </div>
        </div>
      </Panel>

      <Panel title="Tips for Specific Conditions" className="animate-float-in">
        <div className="space-y-4 text-sm text-app-subtle">
          <div className="rounded-lg border border-app-accent/20 bg-app-panelAlt p-3">
            <h3 className="mb-2 font-semibold text-app-text">Spinal Cord Injury (SCI)</h3>
            <p className="mb-2 text-xs">
              <strong>Best settings:</strong> Smoothing 0.75-0.85, dwell click primary method
            </p>
            <ul className="space-y-1 text-xs">
              <li>• Work with OT for optimal seating/positioning</li>
              <li>• Take frequent breaks (15min/hour)</li>
              <li>• Consider mounting camera on wheelchair</li>
              <li>• Voice commands excellent supplement</li>
            </ul>
          </div>

          <div className="rounded-lg border border-app-accent/20 bg-app-panelAlt p-3">
            <h3 className="mb-2 font-semibold text-app-text">Tremor / Parkinson's</h3>
            <p className="mb-2 text-xs">
              <strong>Best settings:</strong> Smoothing 0.9 (maximum), deadzone 0.10-0.15, dwell 1400-1800ms
            </p>
            <ul className="space-y-1 text-xs">
              <li>• Use during "on" medication periods</li>
              <li>• Disable blink if tremor affects eyelids</li>
              <li>• Consider voice as primary method</li>
              <li>• Adjust settings daily as needed</li>
            </ul>
          </div>

          <div className="rounded-lg border border-app-accent/20 bg-app-panelAlt p-3">
            <h3 className="mb-2 font-semibold text-app-text">ALS / MND</h3>
            <p className="mb-2 text-xs">
              <strong>Best settings:</strong> Adjust as condition progresses, heavy smoothing (0.85+), dwell to reduce effort
            </p>
            <ul className="space-y-1 text-xs">
              <li>• Re-calibrate frequently as range changes</li>
              <li>• Voice commands while speech still strong</li>
              <li>• Plan for eye-tracking mode (future feature)</li>
              <li>• Communicate preferences to caregivers</li>
            </ul>
          </div>

          <div className="rounded-lg border border-app-accent/20 bg-app-panelAlt p-3">
            <h3 className="mb-2 font-semibold text-app-text">Temporary Injury / RSI</h3>
            <p className="mb-2 text-xs">
              <strong>Best settings:</strong> Lower smoothing (0.5-0.6), higher sensitivity (1.3-1.6), minimize dwell time (600-800ms)
            </p>
            <ul className="space-y-1 text-xs">
              <li>• Full head mobility allows faster settings</li>
              <li>• Combine gestures + voice for efficiency</li>
              <li>• Practice makes perfect</li>
              <li>• Consider ergonomic setup improvements</li>
            </ul>
          </div>
        </div>
      </Panel>

      <Panel title="Technical Architecture" className="animate-float-in">
        <div className="space-y-4 text-sm text-app-subtle">
          <div>
            <h3 className="mb-2 font-semibold text-app-text">Technology Stack</h3>
            <ul className="grid grid-cols-2 gap-2 text-xs">
              <li>• React 18 + TypeScript</li>
              <li>• Vite build system</li>
              <li>• MediaPipe Face Landmarker</li>
              <li>• Tailwind CSS</li>
              <li>• Web Workers</li>
              <li>• Web Speech API</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-2 font-semibold text-app-text">How It Works</h3>
            <pre className="overflow-auto rounded-xl border border-app-accent/20 bg-app-panelAlt p-3 text-xs">
{`1. Camera → Capture video stream via WebRTC
2. MediaPipe → Detect 478 facial landmarks
3. Worker → Smooth data and detect gestures
4. Cursor → Map nose position to screen
5. Gestures → Dispatch mouse events`}
            </pre>
          </div>

          <div>
            <h3 className="mb-2 font-semibold text-app-text">Performance Metrics</h3>
            <ul className="space-y-1 text-xs">
              <li>• Tracking: 30+ FPS (60 FPS on high-end hardware)</li>
              <li>• Latency: Less than 50ms cursor update</li>
              <li>• Memory: Approximately 150MB active use</li>
              <li>• CPU: Less than 30% on modern processors</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-2 font-semibold text-app-text">Project Structure</h3>
            <pre className="overflow-auto rounded-xl border border-app-accent/20 bg-app-panelAlt p-3 text-xs">
{`src/
├── components/   UI building blocks
├── hooks/        Tracking, gestures, dwell, voice
├── workers/      Off-thread processing
├── pages/        Home, Demo, Calibration, Settings
├── context/      Global state management
└── utils/        Helper functions`}
            </pre>
          </div>

          <div>
            <h3 className="mb-2 font-semibold text-app-text">Privacy & Security</h3>
            <ul className="space-y-1 text-xs">
              <li><strong>No data sent to servers:</strong> All processing happens locally in your browser</li>
              <li><strong>No tracking:</strong> We don't collect analytics or personal information</li>
              <li><strong>Camera only:</strong> Video never leaves your device</li>
              <li><strong>Open source:</strong> Code is transparent and auditable</li>
            </ul>
          </div>
        </div>
      </Panel>

      <Panel title="Developer API Overview" className="animate-float-in">
        <div className="space-y-4 text-sm text-app-subtle">
          <div>
            <h3 className="mb-2 font-semibold text-app-text">Core Hooks</h3>
            <div className="space-y-2 text-xs">
              <div className="rounded border border-app-accent/20 bg-app-panelAlt p-2">
                <strong>useFaceTracking:</strong> MediaPipe integration, camera management
              </div>
              <div className="rounded border border-app-accent/20 bg-app-panelAlt p-2">
                <strong>useCursorMapping:</strong> Transform landmarks to viewport coordinates
              </div>
              <div className="rounded border border-app-accent/20 bg-app-panelAlt p-2">
                <strong>useBlinkDetection:</strong> Single/double/long blink events
              </div>
              <div className="rounded border border-app-accent/20 bg-app-panelAlt p-2">
                <strong>useGestureControls:</strong> Convert gestures to DOM mouse events
              </div>
              <div className="rounded border border-app-accent/20 bg-app-panelAlt p-2">
                <strong>useMouthTypingControls:</strong> Keyboard navigation via facial gestures
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-2 font-semibold text-app-text">Key Components</h3>
            <div className="space-y-2 text-xs">
              <div className="rounded border border-app-accent/20 bg-app-panelAlt p-2">
                <strong>CursorOverlay:</strong> Visual cursor indicator with drag state
              </div>
              <div className="rounded border border-app-accent/20 bg-app-panelAlt p-2">
                <strong>CalibrationUI:</strong> 5-step calibration flow guide
              </div>
              <div className="rounded border border-app-accent/20 bg-app-panelAlt p-2">
                <strong>SettingsPanel:</strong> Configuration for all parameters
              </div>
              <div className="rounded border border-app-accent/20 bg-app-panelAlt p-2">
                <strong>OnScreenKeyboard:</strong> Virtual keyboard with gesture typing
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-app-accent/20 bg-app-panelAlt p-3">
            <p className="text-xs">
              <strong>Full API documentation available in:</strong> docs/API.md
            </p>
          </div>
        </div>
      </Panel>

      <Panel title="Contributing & Support" className="animate-float-in">
        <div className="space-y-4 text-sm text-app-subtle">
          <div>
            <h3 className="mb-2 font-semibold text-app-text">Ways to Contribute</h3>
            <ul className="space-y-1 text-xs">
              <li>• Report bugs or accessibility issues on GitHub</li>
              <li>• Share your usage experience and settings that work</li>
              <li>• Improve documentation or add translations</li>
              <li>• Contribute code improvements or new features</li>
              <li>• Test on different hardware and browsers</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-2 font-semibold text-app-text">Roadmap (Planned Features)</h3>
            <ul className="space-y-1 text-xs">
              <li>• Eye-tracking mode (pupil-based cursor)</li>
              <li>• Custom gesture builder</li>
              <li>• User profiles with settings presets</li>
              <li>• Multi-monitor support</li>
              <li>• Mobile device support</li>
              <li>• Platform assistive technology integration</li>
              <li>• Machine learning gesture customization</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-2 font-semibold text-app-text">Documentation Resources</h3>
            <ul className="space-y-1 text-xs">
              <li>• README.md - Project overview and quick start</li>
              <li>• docs/ACCESSIBILITY_GUIDE.md - Comprehensive user guide</li>
              <li>• docs/API.md - Developer technical reference</li>
              <li>• CONTRIBUTING.md - Contribution guidelines</li>
              <li>• LICENSE - MIT License terms</li>
            </ul>
          </div>

          <div className="rounded-lg border border-app-accent/20 bg-app-panelAlt p-3">
            <p className="text-xs">
              <strong>NodCursor is open source and community driven.</strong> Your feedback and contributions help make the web more accessible for everyone.
            </p>
          </div>
        </div>
      </Panel>

      <Panel title="Acknowledgments" className="animate-float-in">
        <div className="space-y-3 text-sm text-app-subtle">
          <div className="text-xs">
            <strong>Built with:</strong>
            <ul className="ml-4 mt-1 space-y-1">
              <li>• MediaPipe by Google - Face detection and landmark tracking</li>
              <li>• React - UI framework</li>
              <li>• TypeScript - Type-safe development</li>
              <li>• Tailwind CSS - Styling system</li>
              <li>• Vite - Build tooling</li>
            </ul>
          </div>

          <div className="rounded-lg border border-app-accent/20 bg-app-panelAlt p-3 text-xs">
            <p>
              <strong>License:</strong> MIT License - See LICENSE file for details
            </p>
            <p className="mt-2">
              <strong>Version:</strong> 0.1.0 (March 2026)
            </p>
          </div>
        </div>
      </Panel>
    </div>
  );
}
