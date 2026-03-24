import { useEffect, useState } from 'react';
import { NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { HomePage } from './pages/Home/HomePage';
import { DemoPage } from './pages/Demo/DemoPage';
import { CalibrationPage } from './pages/Calibration/CalibrationPage';
import { SettingsPage } from './pages/Settings/SettingsPage';
import { DocumentationPage } from './pages/Documentation/DocumentationPage';
import { GamesPage } from './pages/Games/GamesPage';
import { VoicePersonalizationPage } from './pages/VoicePersonalization/VoicePersonalizationPage';

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/demo', label: 'Demo Playground' },
  { to: '/games', label: 'Games' },
  { to: '/calibration', label: 'Calibration' },
  { to: '/settings', label: 'Settings' },
  { to: '/voice-personalization', label: 'Voice Personalization' },
  { to: '/documentation', label: 'Documentation Blog' }
];

const assetBase = import.meta.env.BASE_URL;

export default function App() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  return (
    <AppProvider>
      <div className="relative min-h-screen overflow-x-clip bg-app-bg text-app-text font-body">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-app-accent/10 blur-3xl" />
          <div className="absolute right-0 top-20 h-80 w-80 rounded-full bg-app-success/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-app-accentStrong/10 blur-3xl" />
        </div>

        <header className="sticky top-0 z-40 border-b border-app-accent/20 bg-app-bg/80 backdrop-blur-xl">
          <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div className="flex items-center gap-2">
              <img src={`${assetBase}logo-mark.svg`} alt="NodCursor logo" className="h-8 w-8 rounded-lg border border-app-accent/25 bg-app-panelAlt" />
              <p className="font-display text-lg tracking-wide text-app-accent drop-shadow-sm">NodCursor</p>
            </div>

            <button
              type="button"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileNavOpen}
              aria-controls="main-nav-mobile"
              className="group rounded-lg border border-app-accent/30 bg-app-panelAlt p-2.5 text-app-text transition hover:border-app-accent hover:bg-app-accent/10 md:hidden"
              onClick={() => setMobileNavOpen((prev) => !prev)}
            >
              <span className="sr-only">Menu</span>
              <span className="relative block h-5 w-5">
                <span
                  className={[
                    'absolute left-0 top-0 h-0.5 w-5 rounded bg-app-accent transition-all duration-200',
                    mobileNavOpen ? 'top-2 rotate-45' : ''
                  ].join(' ')}
                />
                <span
                  className={[
                    'absolute left-0 top-2 h-0.5 w-5 rounded bg-app-accent transition-all duration-200',
                    mobileNavOpen ? 'opacity-0' : 'opacity-100'
                  ].join(' ')}
                />
                <span
                  className={[
                    'absolute left-0 top-4 h-0.5 w-5 rounded bg-app-accent transition-all duration-200',
                    mobileNavOpen ? 'top-2 -rotate-45' : ''
                  ].join(' ')}
                />
              </span>
            </button>

            <ul className="hidden flex-wrap gap-2 md:flex">
              {navItems.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      [
                        'rounded-full border px-4 py-2 text-sm transition duration-200',
                        isActive
                          ? 'border-app-accent bg-app-accent/20 text-app-text shadow-glow'
                          : 'border-app-accent/30 text-app-text hover:border-app-accent hover:bg-app-accent/10'
                      ].join(' ')
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>

            {mobileNavOpen ? (
              <ul id="main-nav-mobile" className="mt-2 grid w-full gap-2 border-t border-app-accent/20 pt-3 md:hidden">
                {navItems.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      className={({ isActive }) =>
                        [
                          'block rounded-lg border px-4 py-2 text-sm transition duration-200',
                          isActive
                            ? 'border-app-accent bg-app-accent/20 text-app-text shadow-glow'
                            : 'border-app-accent/30 text-app-text hover:border-app-accent hover:bg-app-accent/10'
                        ].join(' ')
                      }
                      onClick={() => setMobileNavOpen(false)}
                    >
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            ) : null}
          </nav>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-8 md:py-10">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/demo" element={<DemoPage />} />
            <Route path="/games" element={<GamesPage />} />
            <Route path="/calibration" element={<CalibrationPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/voice-personalization" element={<VoicePersonalizationPage />} />
            <Route path="/documentation" element={<DocumentationPage />} />
            <Route path="/documentation/:section" element={<DocumentationPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </AppProvider>
  );
}
