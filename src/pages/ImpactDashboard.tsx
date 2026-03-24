import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Award, Heart, Leaf, TrendingUp, Download } from 'lucide-react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useRole } from '../hooks/useRole';

export function ImpactDashboard() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { role } = useRole();
  const [stats, setStats] = useState({
    meals: 0,
    co2: 0,
    people: 0,
    recentActivity: [] as any[]
  });

  useEffect(() => {
    if (!userProfile?.uid) return;

    const q = query(
      collection(db, 'posts'),
      where(role === 'donor' ? 'donorId' : 'volunteerId', '==', userProfile.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let totalMeals = 0;
      const recent: any[] = [];
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const meals = parseInt(data.impact) || 10;
        totalMeals += meals;
        recent.push({
          id: doc.id,
          title: data.title,
          meals: meals,
          date: data.completedAt || data.claimedAt || data.createdAt
        });
      });

      recent.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setStats({
        meals: totalMeals,
        co2: Math.round(totalMeals * 0.5), // Estimate: 0.5kg CO2 per meal
        people: Math.round(totalMeals * 0.8), // Estimate: 1 meal feeds 0.8 people on average
        recentActivity: recent.slice(0, 5) // Top 5 recent
      });
    }, (error) => {
      console.error("Error fetching impact stats:", error);
    });

    return () => unsubscribe();
  }, [userProfile, role]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center gap-3 shadow-sm sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
          <ChevronLeft className="w-6 h-6 text-gray-800" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">My Impact</h1>
      </div>

      <div className="p-4 space-y-6">
        {/* Hero Stats */}
        <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-3xl p-6 text-white shadow-lg shadow-green-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10 transform translate-x-4 -translate-y-4">
            <Heart className="w-32 h-32" />
          </div>
          <p className="text-green-100 font-medium mb-1 relative z-10">Total Meals {role === 'donor' ? 'Donated' : 'Rescued'}</p>
          <h2 className="text-5xl font-black mb-4 relative z-10">{stats.meals.toLocaleString()}</h2>
          
          <div className="grid grid-cols-2 gap-4 relative z-10">
            <div>
              <p className="text-green-200 text-xs font-medium mb-1">CO2 Saved</p>
              <p className="text-xl font-bold flex items-center gap-1"><Leaf className="w-4 h-4" /> {stats.co2} kg</p>
            </div>
            <div>
              <p className="text-green-200 text-xs font-medium mb-1">People Fed</p>
              <p className="text-xl font-bold flex items-center gap-1"><TrendingUp className="w-4 h-4" /> {stats.people}+</p>
            </div>
          </div>
        </div>

        {/* Level & Certificate */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center shrink-0">
            <Award className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900">
              {stats.meals > 500 ? `Platinum ${role === 'donor' ? 'Donor' : 'Rescuer'}` : stats.meals > 100 ? `Gold ${role === 'donor' ? 'Donor' : 'Rescuer'}` : `Silver ${role === 'donor' ? 'Donor' : 'Rescuer'}`}
            </h3>
            <p className="text-xs text-gray-500 mb-2">Top contributor in your city</p>
            <div className="w-full bg-gray-100 rounded-full h-2 mb-1">
              <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${Math.min(100, (stats.meals / 500) * 100)}%` }}></div>
            </div>
            <p className="text-[10px] text-gray-400 text-right">
              {stats.meals > 500 ? 'Max Level Reached!' : `${500 - stats.meals} meals to Platinum`}
            </p>
          </div>
        </div>

        {/* Certificate Action */}
        <button 
          onClick={() => navigate('/certificate')}
          className="w-full bg-white border-2 border-green-600 text-green-700 font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-green-50 transition-colors"
        >
          <Download className="w-5 h-5" /> Download Impact Certificate
        </button>

        {/* Recent Activity */}
        <div>
          <h3 className="font-bold text-gray-900 mb-3 px-1">Recent Activity</h3>
          <div className="space-y-3">
            {stats.recentActivity.length > 0 ? stats.recentActivity.map((activity) => (
              <div key={activity.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center shrink-0">
                  <Heart className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 text-sm">{role === 'donor' ? 'Donated' : 'Rescued'} {activity.meals} Meals</h4>
                  <p className="text-xs text-gray-500">{activity.title} • {new Date(activity.date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <span className="text-green-600 font-bold text-sm">+{activity.meals} pts</span>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-500 bg-white rounded-2xl border border-gray-100">
                <p>No recent activity yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
