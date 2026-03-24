import { Marker } from 'react-leaflet';
import L from 'leaflet';
import { Surplus } from '../types';

// Custom green marker for surplus items
const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface MapPinProps {
  surplus: Surplus;
  onClick: (surplus: Surplus) => void;
}

export function MapPin({ surplus, onClick }: MapPinProps) {
  return (
    <Marker 
      position={[surplus.location.lat, surplus.location.lng]} 
      icon={greenIcon}
      eventHandlers={{
        click: () => onClick(surplus),
      }}
    />
  );
}
