import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, MapPin, Clock, CheckCircle2, Phone } from 'lucide-react';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import confetti from 'canvas-confetti';

export function MyPickups() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('Active');
  const [activePickups, setActivePickups] = useState<any[]>([]);
  const [completedPickups, setCompletedPickups] = useState<any[]>([]);

  useEffect(() => {
    if (!userProfile?.uid) return;

    const q = query(
      collection(db, 'posts'),
      where('volunteerId', '==', userProfile.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const posts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as any));
      
      setActivePickups(posts.filter(p => p.status === 'claimed').sort((a: any, b: any) => new Date(b.claimedAt).getTime() - new Date(a.claimedAt).getTime()));
      setCompletedPickups(posts.filter(p => p.status === 'completed').sort((a: any, b: any) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()));
    }, (error) => {
      console.error("Error fetching pickups:", error);
    });

    return () => unsubscribe();
  }, [userProfile]);

  const handleMarkDone = async (pickup: any) => {
    try {
      const postRef = doc(db, 'posts', pickup.id);
      await updateDoc(postRef, {
        status: 'completed',
        completedAt: new Date().toISOString()
      });
      
      // Show celebration
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#16a34a', '#22c55e', '#4ade80']
      });
      
      toast('Pickup completed! Thank you for your service.', 'success');
      setActiveTab('Completed');
    } catch (error) {
      console.error('Error marking pickup as done:', error);
      toast('Failed to mark pickup as done', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center gap-3 shadow-sm sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
          <ChevronLeft className="w-6 h-6 text-gray-800" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">My Pickups</h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white">
        {['Active', 'Completed'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${
              activeTab === tab ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-4">
        {activeTab === 'Active' ? (
          activePickups.length > 0 ? activePickups.map(pickup => (
            <div key={pickup.id} className="bg-white p-4 rounded-2xl shadow-sm border border-green-100">
              <div className="flex justify-between items-start mb-3">
                <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-md animate-pulse">
                  On the way
                </span>
                <span className="text-xs font-medium text-orange-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {pickup.time}
                </span>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{pickup.title}</h3>
              <p className="text-sm text-gray-500 flex items-center gap-1 mb-4">
                <MapPin className="w-4 h-4" /> {pickup.location}
              </p>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => window.location.href = `tel:${pickup.donorPhone}`}
                  className="flex-1 bg-green-50 text-green-700 font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-green-100 transition-colors"
                >
                  <Phone className="w-4 h-4" /> Call Donor
                </button>
                <button 
                  onClick={() => handleMarkDone(pickup)}
                  className="flex-1 bg-green-600 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-green-200 hover:bg-green-700 transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" /> Mark Done
                </button>
              </div>
            </div>
          )) : (
            <div className="text-center py-10 text-gray-500">
              <p>No active pickups.</p>
            </div>
          )
        ) : (
          completedPickups.length > 0 ? completedPickups.map(pickup => (
            <div key={pickup.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 opacity-75">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-gray-900">{pickup.title}</h3>
                <span className="text-xs font-medium text-gray-500">{new Date(pickup.completedAt).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-gray-500 flex items-center gap-1 mb-3">
                <MapPin className="w-4 h-4" /> {pickup.location}
              </p>
              <div className="bg-green-50 text-green-700 text-xs font-bold px-3 py-2 rounded-lg inline-block">
                Impact: {pickup.impact}
              </div>
            </div>
          )) : (
            <div className="text-center py-10 text-gray-500">
              <p>No completed pickups yet.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
