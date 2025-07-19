import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AutoRefreshProvider } from './components/AutoRefreshProvider';
import { OfflineHandler } from './components/OfflineHandler';
import { AuthProvider } from './hooks/useAuth';
import { StaffAuthProvider } from './hooks/useStaffAuth';

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <StaffAuthProvider>
      <OfflineHandler>
        <App />
      </OfflineHandler>
    </StaffAuthProvider>
  </AuthProvider>
);
