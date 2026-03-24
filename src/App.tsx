import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Auth } from './pages/Auth';
import { DonorDashboard } from './pages/DonorDashboard';
import { PostSurplus } from './pages/PostSurplus';
import { Success } from './pages/Success';
import { VolunteerMap } from './pages/VolunteerMap';
import { MyPickups } from './pages/MyPickups';
import { ImpactDashboard } from './pages/ImpactDashboard';
import { Certificate } from './pages/Certificate';
import { Verification } from './pages/Verification';
import { Admin } from './pages/Admin';
import { Settings } from './pages/Settings';
import { BottomNav } from './components/BottomNav';
import { useToast } from './hooks/useToast';
import { AuthProvider } from './contexts/AuthContext';

function ToastContainer() {
  const { toasts } = useToast();
  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 w-full max-w-sm px-4 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className={`px-4 py-3 rounded-xl shadow-lg font-medium text-sm text-white pointer-events-auto animate-fade-in ${
          t.type === 'error' ? 'bg-red-600' : t.type === 'success' ? 'bg-green-600' : 'bg-gray-800'
        }`}>
          {t.message}
        </div>
      ))}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="w-full min-h-screen bg-gray-50 flex justify-center font-sans text-gray-900">
          <div className="w-full max-w-[430px] bg-gray-50 min-h-screen relative shadow-2xl overflow-x-hidden">
            <ToastContainer />
            
            <Routes>
              <Route path="/" element={<Auth />} />
              <Route path="/dashboard" element={<DonorDashboard />} />
              <Route path="/post" element={<PostSurplus />} />
              <Route path="/success" element={<Success />} />
              <Route path="/map" element={<VolunteerMap />} />
              <Route path="/pickups" element={<MyPickups />} />
              <Route path="/impact" element={<ImpactDashboard />} />
              <Route path="/certificate" element={<Certificate />} />
              <Route path="/verify" element={<Verification />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            
            <BottomNav />
          </div>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
