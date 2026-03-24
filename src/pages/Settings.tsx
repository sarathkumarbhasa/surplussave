import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Globe, User, LogOut, Bell, Shield, HelpCircle } from 'lucide-react';
import { useRole, Role } from '../hooks/useRole';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../contexts/AuthContext';

export function Settings() {
  const navigate = useNavigate();
  const { role } = useRole();
  const { updateRole, logout } = useAuth();
  const { toast } = useToast();
  const [language, setLanguage] = useState('English');

  const handleRoleSwitch = async (newRole: Role) => {
    try {
      await updateRole(newRole);
      toast(`Switched to ${newRole === 'donor' ? 'Donor' : 'Volunteer'} mode`, 'success');
      if (newRole === 'donor') {
        navigate('/dashboard');
      } else {
        navigate('/map');
      }
    } catch (error) {
      toast('Failed to update role', 'error');
    }
  };

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    toast(`Language changed to ${lang}`, 'success');
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      toast('Failed to log out', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white px-4 py-4 flex items-center gap-3 shadow-sm sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
          <ChevronLeft className="w-6 h-6 text-gray-800" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Settings</h1>
      </div>

      <div className="p-4 space-y-6">
        {/* Role Switcher */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg text-green-600">
              <User className="w-5 h-5" />
            </div>
            <h2 className="font-bold text-gray-900">Current Role</h2>
          </div>
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => handleRoleSwitch('donor')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${
                role === 'donor' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Donor
            </button>
            <button
              onClick={() => handleRoleSwitch('volunteer')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${
                role === 'volunteer' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Volunteer
            </button>
          </div>
        </div>

        {/* Language Selection */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <Globe className="w-5 h-5" />
            </div>
            <h2 className="font-bold text-gray-900">Language</h2>
          </div>
          <div className="space-y-2">
            {['English', 'Telugu', 'Hindi'].map((lang) => (
              <button
                key={lang}
                onClick={() => handleLanguageChange(lang)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-colors ${
                  language === lang
                    ? 'border-green-500 bg-green-50 text-green-700 font-bold'
                    : 'border-gray-100 hover:bg-gray-50 text-gray-700'
                }`}
              >
                {lang}
                {language === lang && <div className="w-2 h-2 rounded-full bg-green-500" />}
              </button>
            ))}
          </div>
        </div>

        {/* Other Settings */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <button className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors border-b border-gray-50">
            <Bell className="w-5 h-5 text-gray-400" />
            <span className="font-medium text-gray-700">Notifications</span>
          </button>
          <button className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors border-b border-gray-50">
            <Shield className="w-5 h-5 text-gray-400" />
            <span className="font-medium text-gray-700">Privacy & Security</span>
          </button>
          <button className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors">
            <HelpCircle className="w-5 h-5 text-gray-400" />
            <span className="font-medium text-gray-700">Help & Support</span>
          </button>
        </div>

        {/* Logout */}
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 p-4 text-red-600 font-bold bg-red-50 rounded-2xl hover:bg-red-100 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Log Out
        </button>
      </div>
    </div>
  );
}
