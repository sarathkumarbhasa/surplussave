import { useState, useEffect } from 'react';
import { auth, db } from '../services/firebase';
import { onAuthStateChanged, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { User, Role } from '../types';
import { demoUsers } from '../data/demoData';

declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
  }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  
  // ASSUMPTION: Demo mode state is stored in localStorage and we listen to a custom event to sync across hooks
  const [isDemoMode, setIsDemoMode] = useState(localStorage.getItem('demoMode') === 'true');

  useEffect(() => {
    const handleDemoToggle = () => setIsDemoMode(localStorage.getItem('demoMode') === 'true');
    window.addEventListener('demoModeChanged', handleDemoToggle);
    return () => window.removeEventListener('demoModeChanged', handleDemoToggle);
  }, []);

  useEffect(() => {
    if (isDemoMode) {
      setUser(demoUsers[0]); // Default to first demo donor
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setUser(userDoc.data() as User);
          } else {
            // Partial user, needs profile completion
            setUser({ 
              uid: firebaseUser.uid, 
              phone: firebaseUser.phoneNumber || '', 
              name: '', 
              role: 'donor', 
              createdAt: Date.now() 
            });
          }
        } catch (error) {
          console.error("Error fetching user:", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isDemoMode]);

  const setupRecaptcha = (buttonId: string) => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, buttonId, {
        size: 'invisible',
      });
    }
  };

  const sendOtp = async (phoneNumber: string, buttonId: string) => {
    if (isDemoMode) {
      // Mock confirmation result for demo mode
      setConfirmationResult({ confirm: async () => ({ user: { uid: 'demo-new-user', phoneNumber } }) } as any);
      return;
    }
    setupRecaptcha(buttonId);
    const appVerifier = window.recaptchaVerifier;
    const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
    setConfirmationResult(confirmation);
  };

  const verifyOtp = async (otp: string) => {
    if (isDemoMode) {
      setUser(demoUsers[0]);
      return;
    }
    if (!confirmationResult) throw new Error("No OTP sent");
    await confirmationResult.confirm(otp);
  };

  const completeProfile = async (name: string, role: Role) => {
    if (isDemoMode) {
      setUser({ ...demoUsers[0], name, role });
      return;
    }
    if (!auth.currentUser) throw new Error("Not authenticated");
    const newUser: User = {
      uid: auth.currentUser.uid,
      name,
      phone: auth.currentUser.phoneNumber || '',
      role,
      createdAt: Date.now()
    };
    await setDoc(doc(db, 'users', newUser.uid), newUser);
    setUser(newUser);
  };

  const logout = async () => {
    if (isDemoMode) {
      setUser(null);
      return;
    }
    await signOut(auth);
  };

  return { 
    user, 
    loading, 
    sendOtp, 
    verifyOtp, 
    completeProfile, 
    logout, 
    isDemoMode 
  };
}
