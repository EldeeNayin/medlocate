import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppShell }           from '@/components/layout/AppShell';
import { HomePage }           from '@/pages/HomePage';
import { SearchPage }         from '@/pages/SearchPage';
import { HospitalDetailPage } from '@/pages/HospitalDetailPage';
import { AdminPage }          from '@/pages/AdminPage';
import { LoginPage }          from '@/pages/LoginPage';
import { SignupPage }         from '@/pages/SignupPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index       element={<HomePage />} />
          <Route path="search"             element={<SearchPage />} />
          <Route path="hospital/:id"       element={<HospitalDetailPage />} />
          <Route path="admin"              element={<AdminPage />} />
          <Route path="login"              element={<LoginPage />} />
          <Route path="signup"             element={<SignupPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
