import { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, doc } from 'firebase/firestore';
import { Surplus, Pickup } from '../types';
import { demoSurplus, demoPickups } from '../data/demoData';

export function useSurplus() {
  const [surplusList, setSurplusList] = useState<Surplus[]>([]);
  const [pickupsList, setPickupsList] = useState<Pickup[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isDemoMode, setIsDemoMode] = useState(localStorage.getItem('demoMode') === 'true');

  useEffect(() => {
    const handleDemoToggle = () => setIsDemoMode(localStorage.getItem('demoMode') === 'true');
    window.addEventListener('demoModeChanged', handleDemoToggle);
    return () => window.removeEventListener('demoModeChanged', handleDemoToggle);
  }, []);

  useEffect(() => {
    if (isDemoMode) {
      setSurplusList(demoSurplus);
      setPickupsList(demoPickups);
      setLoading(false);
      return;
    }

    const qSurplus = query(collection(db, 'surplus'), orderBy('timestamp', 'desc'));
    const unsubSurplus = onSnapshot(qSurplus, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Surplus));
      setSurplusList(data);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching surplus:", err);
      setLoading(false);
    });

    const qPickups = query(collection(db, 'pickups'), orderBy('pickupTime', 'desc'));
    const unsubPickups = onSnapshot(qPickups, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Pickup));
      setPickupsList(data);
    });

    return () => {
      unsubSurplus();
      unsubPickups();
    };
  }, [isDemoMode]);

  const addSurplus = async (data: Omit<Surplus, 'id'>) => {
    if (isDemoMode) {
      const newSurplus = { ...data, id: `demo-${Date.now()}` } as Surplus;
      setSurplusList([newSurplus, ...surplusList]);
      return;
    }
    await addDoc(collection(db, 'surplus'), data);
  };

  const requestPickup = async (surplusId: string, volunteerId: string) => {
    if (isDemoMode) {
      const newPickup: Pickup = {
        id: `demo-pickup-${Date.now()}`,
        surplusId,
        volunteerId,
        status: 'accepted',
        pickupTime: Date.now(),
        isDemoData: true
      };
      setPickupsList([newPickup, ...pickupsList]);
      setSurplusList(surplusList.map(s => s.id === surplusId ? { ...s, status: 'accepted' } : s));
      return;
    }
    
    await addDoc(collection(db, 'pickups'), {
      surplusId,
      volunteerId,
      status: 'accepted',
      pickupTime: Date.now(),
      isDemoData: false
    });
    await updateDoc(doc(db, 'surplus', surplusId), { status: 'accepted' });
  };

  const markCompleted = async (pickupId: string, surplusId: string) => {
    if (isDemoMode) {
      setPickupsList(pickupsList.map(p => p.id === pickupId ? { ...p, status: 'completed' } : p));
      setSurplusList(surplusList.map(s => s.id === surplusId ? { ...s, status: 'completed' } : s));
      return;
    }
    await updateDoc(doc(db, 'pickups', pickupId), { status: 'completed' });
    await updateDoc(doc(db, 'surplus', surplusId), { status: 'completed' });
  };

  return { 
    surplusList, 
    pickupsList, 
    loading, 
    addSurplus, 
    requestPickup, 
    markCompleted 
  };
}
