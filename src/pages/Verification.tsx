import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Languages, ShieldCheck, Shield, ClipboardList, BadgeIcon, Camera, CheckCircle2, Fingerprint } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage, db, isFirebaseConfigured } from '../services/firebase';

export function Verification() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadTimeout, setUploadTimeout] = useState<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (uploadTimeout) {
        clearTimeout(uploadTimeout);
      }
    };
  }, [uploadTimeout]);

  const resetUpload = () => {
    if (uploadTimeout) {
      clearTimeout(uploadTimeout);
      setUploadTimeout(null);
    }
    setIsUploading(false);
    toast('Upload reset. Please try again.', 'info');
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('File selected:', file.name, file.size, file.type);

    if (file.size > 5 * 1024 * 1024) {
      toast('File size must be less than 5MB', 'error');
      return;
    }

    if (!storage) {
      console.error('Storage not initialized:', storage);
      toast('Storage not initialized', 'error');
      return;
    }

    if (!userProfile?.uid) {
      console.error('User profile not found:', userProfile);
      toast('User profile not found', 'error');
      return;
    }

    setIsUploading(true);
    
    // Set a timeout to reset if upload takes too long
    const timeout = setTimeout(() => {
      console.log('Upload timeout - resetting state');
      setIsUploading(false);
      toast('Upload timed out. Please try again.', 'error');
    }, 60000); // 60 second timeout
    
    setUploadTimeout(timeout);
    
    try {
      // Check if Firebase is properly configured
      if (!isFirebaseConfigured) {
        console.log('Demo mode: Firebase not configured, simulating upload...');
        
        // Simulate upload progress
        let progress = 0;
        const progressInterval = setInterval(() => {
          progress += 10;
          console.log('Demo upload progress:', progress);
          
          if (progress >= 100) {
            clearInterval(progressInterval);
            
            // Simulate successful upload with a demo URL
            const demoUrl = `https://demo-storage.example.com/verification_documents/${userProfile.uid}_${Date.now()}.jpg`;
            
            // Clear timeout
            if (uploadTimeout) {
              clearTimeout(uploadTimeout);
              setUploadTimeout(null);
            }
            
            // Update Firestore (if available) or just show success
            updateDoc(doc(db, 'users', userProfile.uid), {
              verificationStatus: 'pending',
              idPhotoUrl: demoUrl,
              idDocumentType: 'college_id',
              verificationSubmittedAt: new Date().toISOString()
            }).then(() => {
              console.log('Verification data saved to Firestore');
              toast('ID uploaded successfully! Awaiting admin approval.', 'success');
            }).catch((error) => {
              console.log('Demo mode: Firestore not available, but upload simulated');
              toast('ID uploaded successfully! (Demo mode - Admin approval simulated)', 'success');
            }).finally(() => {
              setIsUploading(false);
            });
          }
        }, 500);
        
        return;
      }
      
      // Real Firebase upload
      console.log('Production mode: Using real Firebase Storage...');
      const fileExtension = file.name.split('.').pop();
      const fileName = `verification_id_${userProfile.uid}_${Date.now()}.${fileExtension}`;
      const storageRef = ref(storage, `verification_documents/${fileName}`);
      
      console.log('Starting verification upload to:', storageRef);
      console.log('Storage bucket:', storage);
      
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          console.log('Verification upload progress:', progress, 'bytes:', snapshot.bytesTransferred, 'of:', snapshot.totalBytes);
        },
        (error) => {
          console.error('Verification upload error:', error);
          console.error('Error code:', error.code);
          console.error('Error message:', error.message);
          
          // Clear timeout
          if (uploadTimeout) {
            clearTimeout(uploadTimeout);
            setUploadTimeout(null);
          }
          
          toast(`Upload failed: ${error.message}`, 'error');
          setIsUploading(false);
        },
        async () => {
          try {
            console.log('Verification upload complete, getting download URL...');
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            console.log('Verification download URL:', downloadURL);
            
            await updateDoc(doc(db, 'users', userProfile.uid), {
              verificationStatus: 'pending',
              idPhotoUrl: downloadURL,
              idDocumentType: 'college_id',
              verificationSubmittedAt: new Date().toISOString()
            });
            console.log('Verification data saved to Firestore');
            toast('ID uploaded successfully! Awaiting admin approval.', 'success');
          } catch (error) {
            console.error('Error saving verification data:', error);
            toast('Failed to save verification data', 'error');
          } finally {
            // Clear timeout
            if (uploadTimeout) {
              clearTimeout(uploadTimeout);
              setUploadTimeout(null);
            }
            setIsUploading(false);
          }
        }
      );
    } catch (error) {
      console.error('Verification upload setup error:', error);
      
      // Clear timeout
      if (uploadTimeout) {
        clearTimeout(uploadTimeout);
        setUploadTimeout(null);
      }
      
      toast('Failed to start upload', 'error');
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 bg-gray-50 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-200 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-green-700" />
        </button>
        <span className="text-green-700 font-bold text-lg">Eco-Editorial</span>
        <div className="flex items-center gap-1 text-green-700 font-bold italic">
          <Languages className="w-5 h-5" />
          <span className="text-lg">SurplusSave</span>
        </div>
      </div>

      {/* Profile Section */}
      <div className="flex flex-col items-center mt-6">
        <div className="relative">
          <img 
            src={userProfile?.photoURL || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80"} 
            alt="Profile" 
            className="w-24 h-24 rounded-full border-4 border-white shadow-sm object-cover" 
            referrerPolicy="no-referrer"
          />
          <div className="absolute bottom-0 right-0 bg-green-500 rounded-full p-1.5 border-2 border-white">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mt-4">Volunteer Verification</h1>
        <p className="text-gray-600 text-sm mt-1">SurplusSave Tirupati Chapter</p>
      </div>

      {/* Secure Protocol Card */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm mx-4 mt-8 text-center border border-gray-100">
        <div className="w-12 h-12 bg-green-50 text-green-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-gray-900 mb-2 text-lg">Secure Protocol</h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          Your data is encrypted. We only use your ID to verify community trust for food donation handling.
        </p>
      </div>

      {/* Step 2 of 3 Card */}
      <div className="bg-gray-100/50 rounded-[2rem] p-6 mx-4 mt-4 text-center">
        <div className="w-12 h-12 bg-red-50 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <ClipboardList className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-gray-900 mb-2 text-lg">Step 2 of 3</h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          Complete your profile after ID approval to start claiming surplus food tasks in Tirupati.
        </p>
      </div>

      {/* College ID Upload Card */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm mx-4 mt-4 border border-gray-100">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="font-bold text-gray-900 text-lg mb-1">College ID Upload</h3>
            <p className="text-sm text-gray-600">Capture both sides of your institutional ID card.</p>
          </div>
          <BadgeIcon className="w-8 h-8 text-gray-400" />
        </div>
        
        <label className="block border-2 border-dashed border-gray-300 rounded-3xl p-8 text-center bg-gray-50 relative overflow-hidden group cursor-pointer hover:bg-gray-100 transition-colors">
          <input 
            type="file" 
            accept="image/jpeg,image/png" 
            className="hidden" 
            onChange={handleUpload}
            disabled={isUploading}
          />
          <Camera className="w-10 h-10 text-green-700 mx-auto mb-3" />
          <p className="font-bold text-gray-900 mb-1">
            {isUploading ? 'Uploading...' : 'Click to Upload Photo'}
          </p>
          <p className="text-xs text-gray-500">Supports JPG, PNG up to 5MB</p>
        </label>

        {isUploading && (
          <button
            onClick={resetUpload}
            className="w-full mt-4 bg-red-50 text-red-600 py-3 rounded-full font-medium text-sm hover:bg-red-100 transition-colors"
          >
            Reset Upload
          </button>
        )}

        <div className="mt-6 space-y-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-bold text-sm text-gray-900 mb-0.5">Full Name Visibility</p>
              <p className="text-xs text-gray-600">Ensure your name matches your registered profile.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-bold text-sm text-gray-900 mb-0.5">Validity Period</p>
              <p className="text-xs text-gray-600">ID must show current academic year or non-expired status.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Biometric-Grade Privacy Card */}
      <div className="bg-green-50/70 rounded-[2rem] p-6 mx-4 mt-4 mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Fingerprint className="w-5 h-5 text-green-700" />
          <h3 className="font-bold text-green-800 text-sm">Biometric-Grade Privacy</h3>
        </div>
        <p className="text-sm text-green-900/80 leading-relaxed">
          "SurplusSave Tirupati" maintains high-level security for all donor and volunteer interactions. Your ID photo is processed via an automated secure layer and is never shared with third-party restaurants or donors. This verification ensures a safe and accountable environment for food redirection.
        </p>
      </div>
    </div>
  );
}
