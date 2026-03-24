export type Role = 'donor' | 'volunteer';

export interface User {
  uid: string;
  name: string;
  phone: string;
  role: Role;
  createdAt: number; // Unix timestamp
}

export interface Location {
  lat: number;
  lng: number;
  label: string;
}

export type SurplusStatus = 'available' | 'accepted' | 'completed';

export interface Surplus {
  id: string;
  donorId: string;
  photoUrl?: string;
  items: string;
  quantity: number; // in kg
  expiryMinutes: number;
  location: Location;
  status: SurplusStatus;
  timestamp: number; // Unix timestamp
  isDemoData: boolean;
}

export type PickupStatus = 'accepted' | 'completed';

export interface Pickup {
  id: string;
  surplusId: string;
  volunteerId: string;
  status: PickupStatus;
  pickupTime: number; // Unix timestamp
  isDemoData: boolean;
}
