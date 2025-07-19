import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AutoRefreshProvider } from './components/AutoRefreshProvider';
import { OfflineHandler } from './components/OfflineHandler';
import { AuthProvider } from './hooks/useAuth';

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <OfflineHandler>
      <App />
    </OfflineHandler>
  </AuthProvider>
);
