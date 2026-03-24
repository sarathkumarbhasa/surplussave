import { useState, useEffect, useCallback } from 'react';

export type Role = 'donor' | 'volunteer' | 'admin';

export function useRole() {
  const [role, setRoleState] = useState<Role>(() => {
    return (localStorage.getItem('userRole') as Role) || 'donor';
  });

  const setRole = useCallback((newRole: Role) => {
    localStorage.setItem('userRole', newRole);
    setRoleState(newRole);
    window.dispatchEvent(new Event('role-changed'));
  }, []);

  useEffect(() => {
    const handleRoleChange = () => {
      setRoleState((localStorage.getItem('userRole') as Role) || 'donor');
    };

    window.addEventListener('role-changed', handleRoleChange);
    return () => window.removeEventListener('role-changed', handleRoleChange);
  }, []);

  return { role, setRole };
}
