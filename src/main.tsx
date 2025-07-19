import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AutoRefreshProvider } from './components/AutoRefreshProvider';
import { OfflineHandler } from './components/OfflineHandler';

createRoot(document.getElementById("root")!).render(
  <OfflineHandler>
    <App />
  </OfflineHandler>
);
