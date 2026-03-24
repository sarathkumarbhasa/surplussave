import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation, Search, Clock, ChevronRight, Crosshair } from 'lucide-react';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Component to dynamically center map
function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

export function VolunteerMap() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('Map');
  const [pickups, setPickups] = useState<any[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number]>([13.6288, 79.4192]); // Default to Tirupati

  useEffect(() => {
    // Try to get user's actual location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        },
        (err) => {
          console.log("Geolocation error or denied", err);
        }
      );
    }

    const q = query(
      collection(db, 'posts'),
      where('status', '==', 'active')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const activePosts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setPickups(activePosts);
    }, (error) => {
      console.error("Error fetching active posts:", error);
    });

    return () => unsubscribe();
  }, []);

  const handleClaim = async (postId: string) => {
    if (!userProfile?.uid) {
      toast('Please log in to claim pickups', 'error');
      return;
    }

    if (!userProfile?.isVerified || userProfile?.verificationStatus !== 'approved') {
      toast('Please complete verification to claim pickups', 'error');
      navigate('/verify');
      return;
    }

    try {
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        status: 'claimed',
        volunteerId: userProfile.uid,
        volunteerName: userProfile.name,
        claimedAt: new Date().toISOString()
      });
      toast('Pickup claimed successfully!', 'success');
      navigate('/success');
    } catch (error) {
      console.error('Error claiming pickup:', error);
      toast('Failed to claim pickup', 'error');
    }
  };

  const handleRecenter = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation([pos.coords.latitude, pos.coords.longitude]);
          toast('Location updated', 'success');
        },
        () => {
          toast('Failed to get current location', 'error');
        }
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20">
      {/* Header */}
      <div className="bg-white px-4 pt-4 pb-2 shadow-sm z-20">
        <h1 className="text-xl font-bold text-gray-900 mb-4">Find Pickups</h1>
        
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search location or food type"
            className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none text-sm"
          />
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-lg">
          {['Map', 'List'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 relative z-0">
        {activeTab === 'Map' ? (
          <div className="absolute inset-0">
            <MapContainer 
              center={userLocation} 
              zoom={13} 
              style={{ height: '100%', width: '100%' }}
              zoomControl={false}
            >
              <ChangeView center={userLocation} zoom={13} />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {/* Current User Location Marker */}
              <Marker 
                position={userLocation}
                icon={L.divIcon({
                  className: 'custom-user-marker',
                  html: `<div style="background-color: #3b82f6; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3);"></div>`,
                  iconSize: [16, 16],
                  iconAnchor: [8, 8]
                })}
              >
                <Popup>You are here</Popup>
              </Marker>

              {/* Pickup Markers */}
              {pickups.map((pickup) => {
                // Use pickup lat/lng if available, otherwise fallback to a slightly offset user location for demo purposes
                const lat = pickup.lat || userLocation[0] + (Math.random() - 0.5) * 0.05;
                const lng = pickup.lng || userLocation[1] + (Math.random() - 0.5) * 0.05;
                
                return (
                  <Marker 
                    key={pickup.id} 
                    position={[lat, lng]}
                  >
                    <Popup className="pickup-popup">
                      <div className="p-1 min-w-[200px]">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-orange-100 text-orange-700">
                            Food
                          </span>
                        </div>
                        <h3 className="font-bold text-gray-900 text-sm mb-1">{pickup.title}</h3>
                        <p className="text-xs text-gray-500 mb-2 truncate">{pickup.location}</p>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                          <span className="text-[10px] font-medium text-red-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {pickup.time}
                          </span>
                          <button 
                            onClick={() => handleClaim(pickup.id)}
                            className="bg-green-600 text-white text-xs font-bold py-1 px-3 rounded-md hover:bg-green-700"
                          >
                            Claim
                          </button>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>

            {/* Floating Action */}
            <button 
              onClick={handleRecenter}
              className="absolute bottom-6 right-4 bg-white p-3 rounded-full shadow-lg text-gray-700 hover:text-green-600 z-[400]"
            >
              <Crosshair className="w-6 h-6" />
            </button>
          </div>
        ) : (
          <div className="p-4 space-y-3 overflow-y-auto h-full pb-24">
            {pickups.length > 0 ? pickups.map((pickup) => (
              <div key={pickup.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 active:scale-[0.98] transition-transform cursor-pointer">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold px-2 py-1 rounded-md bg-orange-100 text-orange-700">
                    Food
                  </span>
                  <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {pickup.location}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{pickup.title}</h3>
                <p className="text-sm text-gray-500 mb-3">{pickup.description}</p>
                
                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                  <span className="text-xs font-medium text-red-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {pickup.time}
                  </span>
                  <button 
                    onClick={() => handleClaim(pickup.id)}
                    className="text-sm font-bold text-green-600 flex items-center gap-1 hover:text-green-700"
                  >
                    Claim <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-500 bg-white rounded-2xl border border-gray-100">
                <p>No active pickups available right now.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
