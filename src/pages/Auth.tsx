import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Leaf, Check, Utensils, HandHeart, Shield } from 'lucide-react';
import { useRole, Role } from '../hooks/useRole';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';

export function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { role } = useRole();
  const { signInWithGoogle, userProfile } = useAuth();
  const { toast } = useToast();
  
  // Get role from navigation state first, then fallback to donor
  const initialRole = (location.state as any)?.role || 'donor';
  console.log('Auth page - Initial role from navigation:', (location.state as any)?.role, 'fallback to:', initialRole);
  
  // Clear localStorage and useRole state if coming from Landing page with a specific role
  useEffect(() => {
    if ((location.state as any)?.role) {
      localStorage.removeItem('userRole');
      // Also trigger a role change event to clear useRole state
      window.dispatchEvent(new Event('role-changed'));
    }
  }, [location.state]);
  
  const [selectedRole, setSelectedRole] = useState<Role>(initialRole);
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Update the role in useRole when selection changes
  useEffect(() => {
    console.log('Role selection - selectedRole:', selectedRole, 'current role from useRole:', role);
    if (selectedRole !== role) {
      // We'll set the role after successful sign in
      console.log('Role mismatch detected, will update after sign in');
    }
  }, [selectedRole, role]);

  useEffect(() => {
    if (userProfile) {
      console.log('User profile loaded, redirecting based on role:', userProfile.role, userProfile);
      if (userProfile.role === 'admin') {
        console.log('Redirecting to admin panel');
        navigate('/admin');
      } else if (userProfile.role === 'donor') {
        console.log('Redirecting to donor dashboard');
        navigate('/dashboard');
      } else {
        console.log('Redirecting volunteer to verification/map');
        if (userProfile.isVerified) {
          navigate('/map');
        } else {
          navigate('/verify');
        }
      }
    }
  }, [userProfile, navigate]);

  const handleLogin = async () => {
    setIsSigningIn(true);
    console.log('Attempting login with selected role:', selectedRole);
    try {
      const signedInRole = await signInWithGoogle(selectedRole);
      console.log('Successfully signed in with role:', signedInRole);
      // Navigation is handled by the useEffect watching userProfile
    } catch (error) {
      console.error('Sign in error:', error);
      toast('Failed to sign in with Google', 'error');
      setIsSigningIn(false);
    }
  };

  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const handleAdminLogin = async () => {
    setIsSigningIn(true);
    try {
      // Check if credentials match predefined admin credentials
      const predefinedEmail = 'arya3001@gmail.com';
      const predefinedPassword = 'arya@3001';
      
      if (adminEmail === predefinedEmail && adminPassword === predefinedPassword) {
        // Credentials match, create admin session directly
        toast('Admin credentials verified! Access granted...', 'success');
        
        // Create admin user profile directly without Google auth
        const adminProfile = {
          uid: 'admin-user-123',
          email: predefinedEmail,
          name: 'Admin User',
          role: 'admin',
          photoURL: '',
          isVerified: true,
          verificationStatus: 'approved',
          createdAt: new Date().toISOString()
        };
        
        // Set admin profile in auth context
        // Note: This bypasses Firebase Auth for demo purposes
        // In production, use proper Firebase Auth
        if (typeof window !== 'undefined') {
          localStorage.setItem('adminSession', JSON.stringify(adminProfile));
          // Force page reload to trigger auth context update
          window.location.href = '/admin';
        }
      } else {
        toast('Invalid admin credentials', 'error');
        setIsSigningIn(false);
      }
    } catch (error) {
      console.error('Admin login error:', error);
      toast('Failed to sign in as admin', 'error');
      setIsSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex flex-col relative">
      <div className="p-6 pt-12 flex-1 z-10">
        <div className="flex items-center justify-center w-12 h-12 bg-green-500 rounded-full mb-6 shadow-md">
          <Leaf className="text-white" size={24} />
        </div>
        <h1 className="text-3xl font-bold text-green-900 mb-1">SurplusSave</h1>
        <p className="text-gray-600 mb-8">Tirupati Editorial Edition</p>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h2>
        <p className="text-gray-500 text-sm mb-8">Join the movement to reduce food waste in the spiritual capital.</p>

        <div className="space-y-6">
          <div>
            <label className="text-[10px] font-bold tracking-wider text-gray-500 uppercase mb-3 block">Select Your Role</label>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setSelectedRole('donor')}
                className={`p-4 rounded-2xl border-2 text-left relative transition-all ${selectedRole === 'donor' ? 'border-green-600 bg-white shadow-sm' : 'border-transparent bg-gray-50'}`}
              >
                {selectedRole === 'donor' && <div className="absolute top-3 right-3 bg-green-600 rounded-full p-0.5"><Check size={12} className="text-white" strokeWidth={3} /></div>}
                <Utensils className="text-green-700 mb-2" size={24} />
                <div className="font-bold text-gray-900">Donor</div>
                <div className="text-xs text-gray-500 mt-1 leading-tight">Share surplus food items</div>
              </button>
              <button 
                onClick={() => setSelectedRole('volunteer')}
                className={`p-4 rounded-2xl border-2 text-left relative transition-all ${selectedRole === 'volunteer' ? 'border-green-600 bg-white shadow-sm' : 'border-transparent bg-gray-50'}`}
              >
                {selectedRole === 'volunteer' && <div className="absolute top-3 right-3 bg-green-600 rounded-full p-0.5"><Check size={12} className="text-white" strokeWidth={3} /></div>}
                <HandHeart className="text-gray-700 mb-2" size={24} />
                <div className="font-bold text-gray-900">Volunteer</div>
                <div className="text-xs text-gray-500 mt-1 leading-tight">Pick up food for those in need</div>
              </button>
            </div>
          </div>

          <button 
            disabled={isSigningIn}
            onClick={handleLogin} 
            className="w-full bg-white border border-gray-200 text-gray-700 py-4 rounded-full font-bold text-lg shadow-sm flex items-center justify-center gap-3 mt-4 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
            {isSigningIn ? 'Signing in...' : 'Sign in with Google'}
          </button>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
            <div className="relative flex justify-center"><span className="bg-green-50 px-4 text-[10px] font-bold tracking-widest text-gray-400 uppercase">Admin Access</span></div>
          </div>

          <button 
            disabled={isSigningIn}
            onClick={() => setShowAdminLogin(!showAdminLogin)} 
            className="w-full bg-gray-900 text-white py-4 rounded-full font-bold text-lg shadow-sm flex items-center justify-center gap-3 hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <Shield className="w-6 h-6" />
            {showAdminLogin ? 'Cancel' : 'Admin Login'}
          </button>

          {showAdminLogin && (
            <div className="mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-200">
              <h4 className="font-bold text-gray-900 mb-3 text-center">Admin Credentials</h4>
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="Email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900"
                  disabled={isSigningIn}
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900"
                  disabled={isSigningIn}
                />
                <button
                  onClick={handleAdminLogin}
                  disabled={isSigningIn || !adminEmail || !adminPassword}
                  className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {isSigningIn ? 'Signing in...' : 'Sign In as Admin'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-3 text-center">
                Use: arya3001@gmail.com / arya@3001
              </p>
            </div>
          )}

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
            <div className="relative flex justify-center"><span className="bg-green-50 px-4 text-[10px] font-bold tracking-widest text-gray-400 uppercase">Community Policy</span></div>
          </div>

          <p className="text-center text-xs text-gray-500 px-4 leading-relaxed">
            By joining SurplusSave, you agree to our <span className="underline cursor-pointer">Terms of Service</span> and <span className="underline cursor-pointer">Health Safety Guidelines</span> specifically tailored for the Tirupati region.
          </p>
        </div>
      </div>
    </div>
  );
}
