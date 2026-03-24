import { MapPin, Clock, Scale } from 'lucide-react';
import { Surplus } from '../types';

interface SurplusCardProps {
  surplus: Surplus;
  actionText?: string;
  onAction?: () => void;
  disabled?: boolean;
  showStatus?: boolean;
}

export function SurplusCard({ surplus, actionText, onAction, disabled, showStatus = true }: SurplusCardProps) {
  const isExpired = Date.now() > surplus.timestamp + surplus.expiryMinutes * 60 * 1000;
  
  const getStatusBadge = () => {
    if (surplus.status === 'completed') return <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">Completed</span>;
    if (surplus.status === 'accepted') return <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-medium">Accepted</span>;
    if (isExpired) return <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-medium">Expired</span>;
    return <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">Available</span>;
  };

  const timeRemaining = Math.max(0, Math.floor(((surplus.timestamp + surplus.expiryMinutes * 60 * 1000) - Date.now()) / 60000));

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-green-50 p-4 mb-4 flex flex-col gap-3">
      <div className="flex justify-between items-start">
        <h3 className="font-semibold text-green-950 text-lg leading-tight">{surplus.items}</h3>
        {showStatus && getStatusBadge()}
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
        <div className="flex items-center gap-1.5">
          <Scale size={16} className="text-green-600" />
          <span>{surplus.quantity} kg</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock size={16} className={timeRemaining < 30 ? 'text-orange-500' : 'text-green-600'} />
          <span>{timeRemaining > 0 ? `${timeRemaining} mins left` : 'Expired'}</span>
        </div>
        <div className="flex items-center gap-1.5 col-span-2">
          <MapPin size={16} className="text-green-600 shrink-0" />
          <span className="truncate">{surplus.location.label}</span>
        </div>
      </div>

      {actionText && onAction && (
        <button
          onClick={onAction}
          disabled={disabled || isExpired}
          className={`mt-2 w-full py-2.5 rounded-xl font-medium transition-colors ${
            disabled || isExpired
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800'
          }`}
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
