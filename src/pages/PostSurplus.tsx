import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Camera, MapPin, Clock, Package, X, Loader2, Crosshair } from 'lucide-react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, doc, setDoc } from 'firebase/firestore';
import { storage, db, isFirebaseConfigured } from '../services/firebase';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../contexts/AuthContext';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function LocationMarker({ position, setPosition }: { position: L.LatLng | null, setPosition: (pos: L.LatLng) => void }) {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom());
    }
  }, [position, map]);

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

export function PostSurplus() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userProfile } = useAuth();
  
  const [foodType, setFoodType] = useState('Cooked');
  const [quantity, setQuantity] = useState('');
  const [expiryTime, setExpiryTime] = useState('');
  const [location, setLocation] = useState('');
  const [position, setPosition] = useState<L.LatLng | null>(null);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Default to a central location (e.g., Tirupati) if geolocation fails or before it loads
    setPosition(new L.LatLng(13.6288, 79.4192));
  }, []);

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition(new L.LatLng(pos.coords.latitude, pos.coords.longitude));
          setLocation('Current Location');
          toast('Location updated', 'success');
        },
        () => {
          toast('Failed to get current location', 'error');
        }
      );
    } else {
      toast('Geolocation is not supported by this browser', 'error');
    }
  };

  const handleImageClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast('Please select an image file', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast('Image must be less than 5MB', 'error');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    // Small delay to ensure UI is ready
    setTimeout(() => {
      uploadImage(file);
    }, 100);
  };

  const uploadImage = async (file: File) => {
    if (!storage) {
      toast('Storage not initialized', 'error');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Check if Firebase is properly configured
      if (!isFirebaseConfigured) {
        console.log('Demo mode: Firebase not configured, simulating food image upload...');
        
        // Simulate upload progress
        let progress = 0;
        const progressInterval = setInterval(() => {
          progress += 10;
          console.log('Demo food upload progress:', progress);
          setUploadProgress(progress);
          
          if (progress >= 100) {
            clearInterval(progressInterval);
            
            // Simulate successful upload with a demo URL
            const demoUrl = `https://demo-storage.example.com/food_images/food_${Date.now()}.jpg`;
            
            setImageUrl(demoUrl);
            setIsUploading(false);
            setUploadProgress(100);
            toast('Image uploaded successfully! (Demo mode)', 'success');
          }
        }, 300);
        
        return;
      }
      
      // Real Firebase upload
      const fileExtension = file.name.split('.').pop();
      const fileName = `surplus_food_${Date.now()}.${fileExtension}`;
      const storageRef = ref(storage, `food_images/${fileName}`);
      
      console.log('Starting upload to:', storageRef);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          console.log('Upload progress:', progress, 'bytes:', snapshot.bytesTransferred, 'of:', snapshot.totalBytes);
          setUploadProgress(progress);
        },
        (error) => {
          console.error('Upload error:', error);
          toast(`Upload failed: ${error.message}`, 'error');
          setIsUploading(false);
          setImagePreview(null);
          setUploadProgress(0);
        },
        async () => {
          try {
            console.log('Upload complete, getting download URL...');
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            console.log('Download URL:', downloadURL);
            setImageUrl(downloadURL);
            setIsUploading(false);
            setUploadProgress(100);
            toast('Image uploaded successfully', 'success');
          } catch (error) {
            console.error('Error getting download URL:', error);
            toast('Failed to complete upload', 'error');
            setIsUploading(false);
            setImagePreview(null);
            setUploadProgress(0);
          }
        }
      );
    } catch (error) {
      console.error('Upload setup error:', error);
      toast('Failed to start upload', 'error');
      setIsUploading(false);
      setImagePreview(null);
      setUploadProgress(0);
    }
  };

  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImagePreview(null);
    setImageUrl(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!quantity || !expiryTime || !location) {
      toast('Please fill in all fields', 'error');
      return;
    }
    
    if (!userProfile) {
      toast('You must be logged in to post', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const docRef = doc(collection(db, 'posts'));
      const newPost = {
        id: docRef.id,
        donorId: userProfile.uid,
        donorName: userProfile.name,
        donorPhone: userProfile.phone || '',
        title: `${quantity} of ${foodType} Food`,
        description: `Available for pickup. Type: ${foodType}`,
        location: location,
        lat: position?.lat || 13.6288,
        lng: position?.lng || 79.4192,
        time: `Pickup by ${expiryTime}`,
        photoUrl: imageUrl || '',
        status: 'active',
        impact: `${parseInt(quantity) || 10} Meals`,
        createdAt: new Date().toISOString()
      };

      await setDoc(docRef, newPost);
      
      toast('Food posted successfully!', 'success');
      navigate('/success');
    } catch (error) {
      console.error('Error posting food:', error);
      toast('Failed to post food', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center gap-3 shadow-sm sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
          <ChevronLeft className="w-6 h-6 text-gray-800" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Post Surplus Food</h1>
      </div>

      <div className="p-4 space-y-6">
        {/* Photo Upload */}
        <div 
          onClick={handleImageClick}
          className={`w-full h-40 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-colors relative overflow-hidden ${
            imagePreview 
              ? 'border-transparent bg-gray-100' 
              : 'border-dashed border-green-200 bg-green-50 text-green-600 hover:bg-green-100 cursor-pointer'
          }`}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageChange} 
            accept="image/*" 
            className="hidden" 
          />
          
          {imagePreview ? (
            <>
              <img 
                src={imagePreview} 
                alt="Food preview" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              {isUploading ? (
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white">
                  <Loader2 className="w-8 h-8 animate-spin mb-2" />
                  <span className="font-medium text-sm">{Math.round(uploadProgress)}%</span>
                </div>
              ) : (
                <button 
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </>
          ) : (
            <>
              <Camera className="w-8 h-8" />
              <span className="font-medium">Add Food Photo</span>
            </>
          )}
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Food Type</label>
            <div className="grid grid-cols-3 gap-2">
              {['Cooked', 'Raw', 'Packaged'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFoodType(type)}
                  className={`py-2 px-3 rounded-xl text-sm font-medium border transition-colors ${
                    foodType === type
                      ? 'bg-green-600 text-white border-green-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-green-600'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quantity (Servings/Kg)</label>
            <div className="relative">
              <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g., 50 servings"
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Time</label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="time"
                value={expiryTime}
                onChange={(e) => setExpiryTime(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Location</label>
            <div className="relative mb-2">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter address or tap on map"
                className="w-full pl-10 pr-12 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none"
              />
              <button 
                onClick={handleGetCurrentLocation}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-green-600 hover:bg-green-50 rounded-md"
                title="Get current location"
              >
                <Crosshair className="w-5 h-5" />
              </button>
            </div>
            
            <div className="h-48 rounded-xl overflow-hidden border border-gray-200 z-0 relative">
              {position && (
                <MapContainer 
                  center={position} 
                  zoom={13} 
                  style={{ height: '100%', width: '100%', zIndex: 0 }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LocationMarker position={position} setPosition={setPosition} />
                </MapContainer>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">Tap on the map to set exact location</p>
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-200 hover:bg-green-700 transition-colors active:scale-[0.98] disabled:opacity-50"
        >
          {isSubmitting ? 'Posting...' : 'Post for Rescue'}
        </button>
      </div>
    </div>
  );
}
