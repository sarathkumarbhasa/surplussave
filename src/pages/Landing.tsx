import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Leaf } from 'lucide-react';

export function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Floating background elements */}
      <motion.div 
        animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }} 
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute top-20 left-10 text-4xl opacity-20"
      >🥬</motion.div>
      <motion.div 
        animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }} 
        transition={{ duration: 5, repeat: Infinity }}
        className="absolute bottom-40 right-10 text-4xl opacity-20"
      >🍲</motion.div>

      <div className="z-10 flex flex-col items-center text-center space-y-8 w-full">
        <div className="bg-white p-4 rounded-full shadow-md">
          <Leaf size={48} className="text-green-600" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold text-green-950 tracking-tight">SurplusSave</h1>
          <h2 className="text-xl font-medium text-green-800">Tirupati</h2>
          <p className="text-gray-600 mt-4 max-w-xs mx-auto">Rescue food. Feed the hungry. Zero waste.</p>
        </div>

        <div className="w-full space-y-4 mt-8">
          <button 
            onClick={() => navigate('/auth', { state: { role: 'donor' } })}
            className="w-full bg-green-600 text-white py-4 rounded-2xl font-semibold text-lg shadow-lg hover:bg-green-700 active:scale-95 transition-all"
          >
            I'm a Donor
          </button>
          <button 
            onClick={() => navigate('/auth', { state: { role: 'volunteer' } })}
            className="w-full bg-white text-green-700 border-2 border-green-200 py-4 rounded-2xl font-semibold text-lg shadow-sm hover:bg-green-50 active:scale-95 transition-all"
          >
            I'm a Volunteer / NGO
          </button>
        </div>
      </div>
    </div>
  );
}
