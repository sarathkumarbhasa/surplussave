import { User, Surplus, Pickup } from '../types';

const NOW = Date.now();
const HOUR = 60 * 60 * 1000;

export const demoUsers: User[] = [
  { uid: 'demo-donor-1', name: 'Ramesh (Sri Balaji Bhavan)', phone: '+919876543210', role: 'donor', createdAt: NOW - 10 * HOUR },
  { uid: 'demo-donor-2', name: 'Priya Weddings & Events', phone: '+919876543211', role: 'donor', createdAt: NOW - 20 * HOUR },
  { uid: 'demo-vol-1', name: 'Karthik (Robin Hood Army)', phone: '+919876543212', role: 'volunteer', createdAt: NOW - 30 * HOUR },
  { uid: 'demo-vol-2', name: 'Anitha', phone: '+919876543213', role: 'volunteer', createdAt: NOW - 40 * HOUR },
];

export const demoSurplus: Surplus[] = [
  {
    id: 'surplus-1',
    donorId: 'demo-donor-1',
    items: 'Rice, Sambar, Mixed Veg Curry',
    quantity: 15,
    expiryMinutes: 120,
    location: { lat: 13.6288, lng: 79.4192, label: 'RTC Busstand Area' },
    status: 'available',
    timestamp: NOW - 15 * 60 * 1000, // 15 mins ago
    isDemoData: true,
  },
  {
    id: 'surplus-2',
    donorId: 'demo-donor-2',
    items: 'Chapati, Paneer Butter Masala',
    quantity: 8,
    expiryMinutes: 60,
    location: { lat: 13.6333, lng: 79.4167, label: 'Balaji Nagar' },
    status: 'accepted',
    timestamp: NOW - 45 * 60 * 1000,
    isDemoData: true,
  },
  {
    id: 'surplus-3',
    donorId: 'demo-donor-1',
    items: 'Idli, Vada, Chutney',
    quantity: 5,
    expiryMinutes: 30,
    location: { lat: 13.6250, lng: 79.4200, label: 'Tilak Nagar' },
    status: 'available',
    timestamp: NOW - 5 * 60 * 1000,
    isDemoData: true,
  },
  {
    id: 'surplus-4',
    donorId: 'demo-donor-2',
    items: 'Veg Biryani, Raita',
    quantity: 25,
    expiryMinutes: 180,
    location: { lat: 13.6350, lng: 79.4250, label: 'Alipiri Road' },
    status: 'completed',
    timestamp: NOW - 4 * HOUR,
    isDemoData: true,
  },
  {
    id: 'surplus-5',
    donorId: 'demo-donor-1',
    items: 'Sweet Pongal',
    quantity: 3,
    expiryMinutes: 60,
    location: { lat: 13.6288, lng: 79.4192, label: 'RTC Busstand Area' },
    status: 'accepted',
    timestamp: NOW - 2 * HOUR,
    isDemoData: true,
  },
];

export const demoPickups: Pickup[] = [
  {
    id: 'pickup-1',
    surplusId: 'surplus-2',
    volunteerId: 'demo-vol-1',
    status: 'accepted',
    pickupTime: NOW - 30 * 60 * 1000,
    isDemoData: true,
  },
  {
    id: 'pickup-2',
    surplusId: 'surplus-4',
    volunteerId: 'demo-vol-2',
    status: 'completed',
    pickupTime: NOW - 3 * HOUR,
    isDemoData: true,
  },
  {
    id: 'pickup-3',
    surplusId: 'surplus-5',
    volunteerId: 'demo-vol-1',
    status: 'accepted',
    pickupTime: NOW - 1 * HOUR,
    isDemoData: true,
  },
];
