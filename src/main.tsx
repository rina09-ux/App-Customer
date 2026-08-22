import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './design-system.css';
import './typography-system.css';
import './theme-qa-overrides.css';
import './theme-elements.css';
import './theme-dark-atoms.css';
import './theme-view-variants.css';
import './theme-account-view-variants.css';
import './theme-final-contract.css';
import './webapp-aligned.css';
import './theme-dark-micro-cleanup.css';
import './theme-attack-alert.css';
import './mobile-ui.css';
import './mobile-filter-exact.css';
import './mobile-filter-exact.ts';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
