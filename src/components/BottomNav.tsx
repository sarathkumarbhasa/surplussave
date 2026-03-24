import { NavLink, useLocation } from 'react-router-dom';
import { Home, Map as MapIcon, FileText, BarChart2, Settings, List, Shield } from 'lucide-react';
import { useRole } from '../hooks/useRole';

export function BottomNav() {
  const location = useLocation();
  const { role } = useRole();
  const hideNavPaths = ['/', '/success', '/certificate', '/admin'];
  
  if (hideNavPaths.includes(location.pathname)) return null;

  const donorItems = [
    { to: '/dashboard', icon: Home, label: 'HOME' },
    { to: '/post', icon: FileText, label: 'POST' },
    { to: '/impact', icon: BarChart2, label: 'IMPACT' },
    { to: '/settings', icon: Settings, label: 'SETTINGS' },
  ];

  const volunteerItems = [
    { to: '/map', icon: MapIcon, label: 'MAP' },
    { to: '/pickups', icon: List, label: 'PICKUPS' },
    { to: '/verify', icon: Shield, label: 'ID' },
    { to: '/settings', icon: Settings, label: 'SETTINGS' },
  ];

  const adminItems = [
    { to: '/admin', icon: Shield, label: 'ADMIN' },
    { to: '/settings', icon: Settings, label: 'SETTINGS' },
  ];

  const navItems = role === 'donor' ? donorItems : role === 'admin' ? adminItems : volunteerItems;

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-gray-100 pb-safe z-50 rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <div className="flex justify-around items-center h-20 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                isActive ? 'text-green-600' : 'text-gray-400 hover:text-green-500'
              }`}
            >
              <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-bold tracking-wider">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
