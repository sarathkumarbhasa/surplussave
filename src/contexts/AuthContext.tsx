import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { useRole, Role } from '../hooks/useRole';

interface AuthContextType {
  user: User | null;
  userProfile: any | null;
  loading: boolean;
  signInWithGoogle: (role: Role) => Promise<Role>;
  logout: () => Promise<void>;
  updateRole: (role: Role) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const { setRole } = useRole();

  useEffect(() => {
    // Check for admin session first
    const adminSession = localStorage.getItem('adminSession');
    if (adminSession) {
      try {
        const adminProfile = JSON.parse(adminSession);
        setUserProfile(adminProfile);
        setLoading(false);
        return;
      } catch (error) {
        console.error('Error parsing admin session:', error);
        localStorage.removeItem('adminSession');
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch or create user profile
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const data = userSnap.data();
          setUserProfile(data);
          if (data.role) {
            setRole(data.role as Role);
          }
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [setRole]);

  const updateRole = async (newRole: Role) => {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, { role: newRole }, { merge: true });
      setUserProfile((prev: any) => ({ ...prev, role: newRole }));
      setRole(newRole);
    } catch (error) {
      console.error("Error updating role:", error);
      throw error;
    }
  };

  const signInWithGoogle = async (role: Role): Promise<Role> => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Check if user exists in Firestore
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        // Create new user profile
        const newProfile = {
          uid: user.uid,
          email: user.email,
          name: user.displayName || 'New User',
          role: role,
          photoURL: user.photoURL || '',
          isVerified: false,
          verificationStatus: 'none',
          createdAt: new Date().toISOString()
        };
        await setDoc(userRef, newProfile);
        setUserProfile(newProfile);
        return role;
      } else {
        // User exists, get their data
        const data = userSnap.data();
        console.log('AuthContext - Existing user data:', data, 'Requested role:', role);
        
        // Always update to the selected role for this session
        if (data.role !== role) {
          // Update the role in firestore to the newly selected role
          console.log('AuthContext - Updating user role from', data.role, 'to', role);
          await setDoc(userRef, { role: role }, { merge: true });
          setRole(role);
          setUserProfile({ ...data, role: role });
          console.log('AuthContext - Role updated and profile set to:', role);
          return role;
        } else {
          // Use existing role
          console.log('AuthContext - Using existing role:', data.role);
          setRole(data.role as Role);
          setUserProfile(data);
          console.log('AuthContext - Profile set with existing role:', data.role);
          return data.role as Role;
        }
      }
    } catch (error) {
      console.error("Error signing in with Google", error);
      throw error;
    }
  };

  const logout = async () => {
    // Clear admin session if exists
    localStorage.removeItem('adminSession');
    
    // Clear user profile immediately
    setUserProfile(null);
    setUser(null);
    
    // Sign out from Firebase if user is authenticated
    if (auth) {
      await signOut(auth);
    }
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, signInWithGoogle, logout, updateRole }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
