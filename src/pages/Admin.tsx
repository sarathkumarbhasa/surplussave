import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Users, AlertTriangle, CheckCircle2, XCircle, Eye } from 'lucide-react';
import { collection, query, where, onSnapshot, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import { LogOut } from 'lucide-react';

export function Admin() {
  const navigate = useNavigate();
  const { userProfile, logout } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('Pending');
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [approvedUsers, setApprovedUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is admin
    if (!userProfile || userProfile.role !== 'admin') {
      console.log('Access denied: User is not admin', userProfile?.role);
      toast('Access denied. Admin privileges required.', 'error');
      navigate('/dashboard');
      return;
    }

    // Fetch users with pending verification
    const q = query(
      collection(db, 'users'),
      where('verificationStatus', '==', 'pending')
    );

    console.log('Setting up pending users query...');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log('Pending users snapshot received:', snapshot.docs.length);
      const users = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log('Pending users data:', users);
      setPendingUsers(users);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching pending users:", error);
      setLoading(false);
    });

    // Fetch approved users for the approved tab
    const approvedQuery = query(
      collection(db, 'users'),
      where('verificationStatus', '==', 'approved')
    );

    const unsubscribeApproved = onSnapshot(approvedQuery, (snapshot) => {
      const users = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setApprovedUsers(users);
    }, (error) => {
      console.error("Error fetching approved users:", error);
    });

    return () => {
      unsubscribe();
      unsubscribeApproved();
    };
  }, [userProfile, navigate]);

  const handleApprove = async (userId: string) => {
    try {
      console.log('Approving user:', userId);
      await updateDoc(doc(db, 'users', userId), {
        verificationStatus: 'approved',
        isVerified: true,
        verifiedAt: new Date().toISOString(),
        verifiedBy: userProfile?.uid
      });
      console.log('User approved successfully:', userId);
      toast('User approved successfully!', 'success');
    } catch (error) {
      console.error('Error approving user:', error);
      toast('Failed to approve user', 'error');
    }
  };

  const handleReject = async (userId: string) => {
    try {
      console.log('Rejecting user:', userId);
      await updateDoc(doc(db, 'users', userId), {
        verificationStatus: 'rejected',
        isVerified: false,
        rejectedAt: new Date().toISOString(),
        rejectedBy: userProfile?.uid
      });
      console.log('User rejected successfully:', userId);
      toast('User rejected', 'success');
    } catch (error) {
      console.error('Error rejecting user:', error);
      toast('Failed to reject user', 'error');
    }
  };

  const viewDocument = (docUrl: string) => {
    window.open(docUrl, '_blank');
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast('Logged out successfully', 'success');
      
      // Force page reload to ensure session is cleared
      setTimeout(() => {
        window.location.href = '/auth';
      }, 1000);
    } catch (error) {
      console.error('Logout error:', error);
      toast('Failed to logout', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gray-900 px-4 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10 text-white">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-800 rounded-full">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">Admin Panel</h1>
        </div>
        <button 
          onClick={handleLogout}
          className="p-2 hover:bg-gray-800 rounded-full transition-colors"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      {/* Stats */}
      <div className="bg-gray-900 px-4 pb-6 pt-2 rounded-b-3xl shadow-md">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-800 p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <Users className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Total Users</span>
            </div>
            <p className="text-2xl font-bold text-white">{approvedUsers.length + pendingUsers.length}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-orange-400 mb-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Pending</span>
            </div>
            <p className="text-2xl font-bold text-white">{pendingUsers.length}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white mt-4">
        {['Pending', 'Approved', 'Reports'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${
              activeTab === tab ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-4">
        {loading ? (
          <div className="text-center py-10 text-gray-500">
            <p>Loading...</p>
          </div>
        ) : activeTab === 'Pending' ? (
          pendingUsers.length > 0 ? pendingUsers.map(user => (
            <div key={user.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-gray-900">{user.name}</h3>
                  <p className="text-xs text-gray-500">{user.role} • Submitted {new Date(user.verificationSubmittedAt).toLocaleDateString()}</p>
                </div>
                <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                  Review
                </span>
              </div>
              
              {user.idPhotoUrl && (
                <div className="bg-gray-50 p-3 rounded-xl mb-4 border border-gray-100">
                  <p className="text-sm font-medium text-gray-700 flex items-center justify-between">
                    {user.idDocumentType || 'ID Document'}
                    <button 
                      onClick={() => viewDocument(user.idPhotoUrl)}
                      className="text-blue-600 text-xs font-bold hover:underline flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" /> View
                    </button>
                  </p>
                </div>
              )}
              
              <div className="flex gap-2">
                <button 
                  onClick={() => handleReject(user.id)}
                  className="flex-1 bg-red-50 text-red-700 font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
                >
                  <XCircle className="w-4 h-4" /> Reject
                </button>
                <button 
                  onClick={() => handleApprove(user.id)}
                  className="flex-1 bg-green-600 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-green-200 hover:bg-green-700 transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" /> Approve
                </button>
              </div>
            </div>
          )) : (
            <div className="text-center py-10 text-gray-500">
              <p>No pending verifications</p>
            </div>
          )
        ) : activeTab === 'Approved' ? (
          approvedUsers.length > 0 ? approvedUsers.map(user => (
            <div key={user.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-gray-900">{user.name}</h3>
                  <p className="text-xs text-gray-500">{user.role} • Approved {new Date(user.verifiedAt).toLocaleDateString()}</p>
                </div>
                <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                  Approved
                </span>
              </div>
            </div>
          )) : (
            <div className="text-center py-10 text-gray-500">
              <p>No approved users yet</p>
            </div>
          )
        ) : (
          <div className="text-center py-10 text-gray-500">
            <p>Reports coming soon</p>
          </div>
        )}
      </div>
    </div>
  );
}
