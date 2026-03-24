import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Download, Award, Share2 } from 'lucide-react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useRole } from '../hooks/useRole';

export function Certificate() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { role } = useRole();
  const [stats, setStats] = useState({
    meals: 0,
    co2: 0,
  });

  useEffect(() => {
    if (!userProfile?.uid) return;

    const q = query(
      collection(db, 'posts'),
      where(role === 'donor' ? 'donorId' : 'volunteerId', '==', userProfile.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let totalMeals = 0;
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const meals = parseInt(data.impact) || 10;
        totalMeals += meals;
      });

      setStats({
        meals: totalMeals,
        co2: Math.round(totalMeals * 0.5),
      });
    }, (error) => {
      console.error("Error fetching impact stats:", error);
    });

    return () => unsubscribe();
  }, [userProfile, role]);

  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="px-4 py-4 flex items-center justify-between text-white sticky top-0 z-10">
        <button onClick={() => navigate('/impact')} className="p-2 -ml-2 hover:bg-gray-800 rounded-full">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold">Your Certificate</h1>
        <button className="p-2 -mr-2 hover:bg-gray-800 rounded-full">
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Certificate Card */}
        <div className="bg-white w-full max-w-sm aspect-[3/4] rounded-sm p-6 relative shadow-2xl flex flex-col items-center text-center border-8 border-double border-gray-200">
          {/* Decorative Corners */}
          <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-green-800" />
          <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-green-800" />
          <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-green-800" />
          <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-green-800" />

          <div className="w-16 h-16 bg-green-100 text-green-800 rounded-full flex items-center justify-center mb-6 mt-4">
            <Award className="w-8 h-8" />
          </div>

          <h2 className="text-green-800 font-serif font-bold text-xl tracking-widest uppercase mb-2">Certificate</h2>
          <p className="text-gray-500 text-xs tracking-widest uppercase mb-8">of Appreciation</p>

          <p className="text-gray-600 text-sm mb-2">This is proudly presented to</p>
          <h3 className="text-2xl font-bold text-gray-900 mb-6 font-serif border-b border-gray-300 pb-2 w-full">
            {userProfile?.name || 'Valued Member'}
          </h3>

          <p className="text-gray-600 text-sm mb-8 px-4 leading-relaxed">
            For outstanding contribution to the community by {role === 'donor' ? 'donating' : 'rescuing'} <strong className="text-green-700">{stats.meals.toLocaleString()} meals</strong> and saving <strong className="text-green-700">{stats.co2.toLocaleString()} kg</strong> of CO2 emissions.
          </p>

          <div className="mt-auto w-full flex justify-between items-end px-4">
            <div className="text-center">
              <div className="w-24 border-b border-gray-400 mb-1"></div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">Date</p>
              <p className="text-xs font-bold text-gray-800 mt-1">{currentDate}</p>
            </div>
            <div className="w-12 h-12 bg-green-800 rounded-full flex items-center justify-center text-white text-[8px] font-bold text-center leading-tight shadow-md transform rotate-12">
              Food<br/>Rescue<br/>Seal
            </div>
          </div>
        </div>

        {/* Action */}
        <button 
          onClick={() => window.print()}
          className="w-full max-w-sm bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 mt-8"
        >
          <Download className="w-5 h-5" /> Save to Device
        </button>
      </div>
    </div>
  );
}
