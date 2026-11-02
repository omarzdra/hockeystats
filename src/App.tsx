import { useEffect, useState } from 'react';
import { NavLink, Navigate, Route, Routes } from 'react-router-dom';

import {
  translations,
  type Language,
} from './features/open-data/i18n';
import { OpenDataPage } from './pages/OpenDataPage';

export function App() {
  const [language, setLanguage] = useState<Language>('en');
  const copy = translations[language];

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <div className="app-shell">
      <header className="site-header">
        <NavLink className="brand" to="/open-data" aria-label="HockeyStats home">
          <span className="brand-mark" aria-hidden="true">HS</span>
          <span>Hockey<strong>Stats</strong></span>
        </NavLink>
        <nav aria-label={copy.mainNavigation}>
          <NavLink to="/open-data">{copy.openData}</NavLink>
          <a href="https://data.europa.eu/" target="_blank" rel="noreferrer">
            {copy.europeanPortal} <span aria-hidden="true">↗</span>
          </a>
          <label className="language-picker">
            <span>{copy.language}</span>
            <select
              aria-label={copy.language}
              value={language}
              onChange={(event) => setLanguage(event.target.value as Language)}
            >
              <option value="en">EN</option>
              <option value="es">ES</option>
            </select>
          </label>
        </nav>
      </header>
      <Routes>
        <Route
          path="/open-data"
          element={<OpenDataPage language={language} />}
        />
        <Route path="*" element={<Navigate replace to="/open-data" />} />
      </Routes>
      <footer>
        <span>{copy.footerModule}</span>
        <span>{copy.footerSource}</span>
      </footer>
    </div>
  );
}
