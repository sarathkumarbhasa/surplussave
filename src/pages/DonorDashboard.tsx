import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Leaf, Users, ChevronRight, CheckCircle2 } from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';

export function DonorDashboard() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [stats, setStats] = useState({ meals: 0, co2: 0, people: 0 });

  useEffect(() => {
    if (!userProfile?.uid) return;

    const q = query(
      collection(db, 'posts'),
      where('donorId', '==', userProfile.uid),
      // orderBy('createdAt', 'desc') // Requires an index, so we'll sort client-side for now to avoid index errors
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const posts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setRecentPosts(posts);

      let totalMeals = 0;
      posts.forEach((post: any) => {
        totalMeals += parseInt(post.impact) || 10;
      });

      setStats({
        meals: totalMeals,
        co2: Math.round(totalMeals * 0.5),
        people: Math.round(totalMeals * 0.8)
      });
    }, (error) => {
      console.error("Error fetching posts:", error);
    });

    return () => unsubscribe();
  }, [userProfile]);

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <div className="p-4 pt-8">
        <div className="bg-[#1DB954] text-white rounded-[2rem] p-6 relative overflow-hidden shadow-lg mb-8">
          <div className="absolute right-0 top-0 opacity-10 text-9xl -mt-4 -mr-4 pointer-events-none">🍴</div>
          <div className="relative z-10">
            <p className="text-[10px] font-bold tracking-wider uppercase mb-2 opacity-90">Welcome Back,</p>
            <h1 className="text-3xl font-extrabold mb-4 leading-tight">{userProfile?.name || 'SurplusSave'}</h1>
            <p className="text-sm opacity-90 mb-6 max-w-[80%] leading-relaxed">Your contributions have fed {stats.people} people this week. Ready to save more delicious meals today?</p>
            <button onClick={() => navigate('/post')} className="bg-[#0A4A25] text-white px-5 py-3 rounded-full font-bold text-sm flex items-center gap-2 hover:bg-[#063319] transition-colors shadow-md">
              Post Surplus Food <span className="bg-white text-[#0A4A25] rounded-full w-5 h-5 flex items-center justify-center text-lg leading-none pb-0.5">+</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4 px-2">
          <h2 className="text-xl font-bold text-gray-900">Impact summary</h2>
          <button onClick={() => navigate('/impact')} className="text-[10px] font-bold text-green-700 tracking-wider uppercase">View Details</button>
        </div>

        <div className="space-y-4 mb-8">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col relative overflow-hidden">
            <Heart className="text-red-500 mb-4" size={24} fill="currentColor" />
            <div className="absolute top-6 right-6 text-xs font-bold text-gray-900">+12%</div>
            <div className="text-4xl font-extrabold text-gray-900 mb-1">{stats.meals}</div>
            <div className="text-[10px] font-bold text-gray-500 tracking-wider uppercase">Meals Shared</div>
          </div>

          <div className="bg-[#98F5B1] rounded-3xl p-6 shadow-sm flex flex-col relative overflow-hidden">
            <Leaf className="text-[#0A4A25] mb-4" size={24} fill="currentColor" />
            <div className="absolute top-6 right-6 text-xs font-bold text-[#0A4A25]">Top 5%</div>
            <div className="text-4xl font-extrabold text-[#0A4A25] mb-1">{stats.co2}</div>
            <div className="text-[10px] font-bold text-[#0A4A25] tracking-wider uppercase opacity-80">KG Carbon Saved</div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col relative overflow-hidden">
            <Users className="text-green-700 mb-4" size={24} />
            <div className="absolute top-6 right-6 text-xs font-bold text-gray-900">LEVEL {Math.floor(stats.meals / 100) + 1}</div>
            <div className="text-4xl font-extrabold text-gray-900 mb-1">{stats.people}</div>
            <div className="text-[10px] font-bold text-gray-500 tracking-wider uppercase">People Fed</div>
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-4 px-2">Recent Donations</h2>
        <div className="space-y-3 mb-8">
          {recentPosts.length > 0 ? recentPosts.map(post => (
            <div key={post.id} className="bg-white rounded-3xl p-4 flex items-center gap-4 shadow-sm border border-gray-100">
              <img src={post.photoUrl || "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=100&q=80"} alt="Food" className="w-16 h-16 rounded-2xl object-cover" />
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-gray-900 leading-tight">{post.title}</h3>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${
                    post.status === 'completed' ? 'bg-[#98F5B1] text-[#0A4A25]' : 
                    post.status === 'claimed' ? 'bg-blue-100 text-blue-700' : 
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {post.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{post.description}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase mt-2">
                  {new Date(post.createdAt).toLocaleDateString()}
                </p>
              </div>
              <ChevronRight className="text-gray-300" size={20} />
            </div>
          )) : (
            <div className="text-center py-8 text-gray-500 bg-white rounded-3xl border border-gray-100">
              <p>No recent donations.</p>
            </div>
          )}
        </div>

        <div className="bg-gray-200/50 rounded-3xl p-6 text-center relative overflow-hidden">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <CheckCircle2 className="text-green-700" size={24} fill="currentColor" stroke="white" />
          </div>
          <h3 className="font-bold text-gray-900 text-lg mb-2">Identity Verified</h3>
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">Your restaurant is now a Verified Eco-Donor. You can now issue tax-deductible receipts for all contributions.</p>
          <button className="bg-transparent border border-gray-400 text-gray-900 font-bold py-2 px-6 rounded-full text-sm hover:bg-gray-200 transition-colors">
            Setup Receipts
          </button>
        </div>
      </div>
      
      <button onClick={() => navigate('/post')} className="fixed bottom-28 right-6 w-14 h-14 bg-[#0A4A25] text-white rounded-full flex items-center justify-center shadow-xl hover:bg-[#063319] transition-colors z-40">
        <span className="text-3xl font-light mb-1">+</span>
      </button>
    </div>
  );
}
