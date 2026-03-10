import { Link, Route, Routes } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { HomePage } from './pages/Home/HomePage';
import { DemoPage } from './pages/Demo/DemoPage';
import { CalibrationPage } from './pages/Calibration/CalibrationPage';
import { SettingsPage } from './pages/Settings/SettingsPage';
import { DocumentationPage } from './pages/Documentation/DocumentationPage';

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/demo', label: 'Demo Playground' },
  { to: '/calibration', label: 'Calibration' },
  { to: '/settings', label: 'Settings' },
  { to: '/documentation', label: 'Documentation Blog' }
];

export default function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-app-bg text-app-text font-body">
        <header className="sticky top-0 z-40 border-b border-app-accent/20 bg-app-bg/90 backdrop-blur">
          <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
            <p className="font-display text-lg tracking-wide text-app-accent">NodCursor</p>
            <ul className="flex flex-wrap gap-2">
              {navItems.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="rounded-full border border-app-accent/30 px-4 py-2 text-sm text-app-text transition hover:border-app-accent hover:bg-app-accent/10"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/demo" element={<DemoPage />} />
            <Route path="/calibration" element={<CalibrationPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/documentation" element={<DocumentationPage />} />
          </Routes>
        </main>
      </div>
    </AppProvider>
  );
}
