import { useEffect, useState } from 'react';
import SortingVisualizer from './components/SortingVisualizer';
import PathfindingVisualizer from './components/PathfindingVisualizer';
import './App.css';

const TABS = [
  { key: 'sorting', label: 'Sorting' },
  { key: 'pathfinding', label: 'Pathfinding' },
];

function getInitialTheme() {
  let saved = null;
  try {
    saved = localStorage.getItem('theme');
  } catch {
    // localStorage unavailable — fall back to system preference
  }
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return saved || (prefersDark ? 'dark' : 'light');
}

export default function App() {
  const [tab, setTab] = useState('sorting');
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    try {
      localStorage.setItem('theme', next);
    } catch {
      // ignore if storage is unavailable
    }
  };

  return (
    <div className="app">
      <header className="app-nav">
        <div className="app-nav-inner">
          <span className="app-brand">Algorithm Visualizer</span>
          <nav className="app-tabs">
            {TABS.map(({ key, label }) => (
              <button
                key={key}
                className={`app-tab ${tab === key ? 'active' : ''}`}
                onClick={() => setTab(key)}
              >
                {label}
              </button>
            ))}
          </nav>
          <div className="app-nav-links">
            <a href="https://github.com/mahamedmuhumed9100-bit/algo-visualizer" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            <a href="https://mahamedmuhumed9100-bit.github.io/mahamed-portfolio/" target="_blank" rel="noopener noreferrer">
              Portfolio
            </a>
            <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle dark mode">
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        {tab === 'sorting' ? <SortingVisualizer /> : <PathfindingVisualizer />}
      </main>

      <footer className="app-footer">
        <p>Built by Mahamed-Aamin Muhumed with React &amp; Vite.</p>
      </footer>
    </div>
  );
}
