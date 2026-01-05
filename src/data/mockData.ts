import { User, Lead, Task, Project, Leave, ActivityLog, Announcement } from '@/types';

// Helper to generate user ID from name
export const generateUserId = (name: string, existingIds: string[] = []): string => {
  const baseId = name.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
  let counter = 1;
  let newId = `${baseId}_${String(counter).padStart(3, '0')}`;
  
  while (existingIds.includes(newId)) {
    counter++;
    newId = `${baseId}_${String(counter).padStart(3, '0')}`;
  }
  
  return newId;
};

export const mockUsers: User[] = [
  {
    id: '1',
    userId: 'john_admin_001',
    email: 'admin@realestate.com',
    name: 'John Admin',
    phone: '+1234567890',
    address: '123 Admin Street',
    role: 'admin',
    status: 'active',
    password: 'admin123',
    permissions: [
      { module: 'leads', actions: ['view', 'create', 'edit', 'delete'] },
      { module: 'tasks', actions: ['view', 'create', 'edit', 'delete'] },
      { module: 'projects', actions: ['view', 'create', 'edit', 'delete'] },
      { module: 'leaves', actions: ['view', 'approve'] },
      { module: 'reports', actions: ['view'] },
      { module: 'users', actions: ['view', 'create', 'edit', 'delete'] },
    ],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    userId: 'sarah_manager_001',
    email: 'manager@realestate.com',
    name: 'Sarah Manager',
    phone: '+1234567891',
    address: '456 Manager Ave',
    role: 'manager',
    status: 'active',
    password: 'manager123',
    permissions: [
      { module: 'leads', actions: ['view', 'create', 'edit'] },
      { module: 'tasks', actions: ['view', 'create', 'edit'] },
      { module: 'projects', actions: ['view'] },
      { module: 'leaves', actions: ['view', 'approve'] },
      { module: 'reports', actions: ['view'] },
    ],
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '3',
    userId: 'mike_staff_001',
    email: 'staff@realestate.com',
    name: 'Mike Staff',
    phone: '+1234567892',
    address: '789 Staff Blvd',
    role: 'staff',
    status: 'active',
    managerId: '2',
    password: 'staff123',
    permissions: [
      { module: 'leads', actions: ['view', 'create', 'edit'] },
      { module: 'tasks', actions: ['view', 'create', 'edit'] },
      { module: 'leaves', actions: ['view', 'create'] },
    ],
    createdAt: new Date('2024-02-01'),
  },
  {
    id: '4',
    userId: 'emma_wilson_001',
    email: 'staff2@realestate.com',
    name: 'Emma Wilson',
    phone: '+1234567893',
    address: '321 Staff Lane',
    role: 'staff',
    status: 'active',
    managerId: '2',
    password: 'staff123',
    permissions: [
      { module: 'leads', actions: ['view', 'create', 'edit'] },
      { module: 'tasks', actions: ['view', 'create', 'edit'] },
      { module: 'leaves', actions: ['view', 'create'] },
    ],
    createdAt: new Date('2024-02-15'),
  },
];

// Helper to get dynamic dates relative to today
const today = new Date();
const addDays = (days: number) => {
  const date = new Date(today);
  date.setDate(date.getDate() + days);
  return date;
};

export const mockLeads: Lead[] = [];

export const mockTasks: Task[] = [];

export const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Skyline Towers',
    location: 'Downtown Financial District',
    type: 'apartment',
    priceMin: 450000,
    priceMax: 1200000,
    launchDate: new Date('2024-03-01'),
    possessionDate: new Date('2026-06-01'),
    amenities: ['Swimming Pool', 'Gym', 'Clubhouse', 'Garden', '24/7 Security', 'Parking'],
    description: 'Luxury high-rise apartments with panoramic city views. Modern architecture with world-class amenities.',
    towerDetails: '3 Towers, 45 floors each',
    nearbyLandmarks: ['Central Mall', 'Metro Station', 'International School'],
    photos: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
    ],
    coverImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
    status: 'ongoing',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    name: 'Green Valley Villas',
    location: 'Suburban Hills',
    type: 'villa',
    priceMin: 800000,
    priceMax: 2500000,
    launchDate: new Date('2024-01-15'),
    possessionDate: new Date('2025-12-01'),
    amenities: ['Private Pool', 'Garden', 'Home Automation', 'Solar Panels', 'EV Charging'],
    description: 'Exclusive gated community with premium villas surrounded by nature. Sustainable living at its finest.',
    nearbyLandmarks: ['Golf Course', 'Nature Reserve', 'Organic Market'],
    photos: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
    ],
    coverImage: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
    status: 'ongoing',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '3',
    name: 'Metro Heights',
    location: 'Tech Corridor',
    type: 'apartment',
    priceMin: 280000,
    priceMax: 650000,
    launchDate: new Date('2024-08-01'),
    possessionDate: new Date('2027-03-01'),
    amenities: ['Co-working Space', 'Rooftop Lounge', 'Fitness Center', 'Smart Home Features'],
    description: 'Contemporary apartments designed for modern professionals. Walking distance to tech parks.',
    towerDetails: '2 Towers, 30 floors each',
    nearbyLandmarks: ['Tech Park', 'Metro Station', 'Shopping Complex'],
    photos: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
    ],
    coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
    status: 'upcoming',
    createdAt: new Date('2024-05-01'),
  },
];

export const mockLeaves: Leave[] = [
  {
    id: '1',
    userId: '3',
    userName: 'Mike Staff',
    userRole: 'staff',
    type: 'casual',
    startDate: new Date('2024-06-20'),
    endDate: new Date('2024-06-21'),
    reason: 'Personal work',
    status: 'pending',
    createdAt: new Date('2024-06-15'),
  },
  {
    id: '2',
    userId: '4',
    userName: 'Emma Wilson',
    userRole: 'staff',
    type: 'sick',
    startDate: new Date('2024-06-10'),
    endDate: new Date('2024-06-11'),
    reason: 'Medical appointment',
    status: 'approved',
    approvedBy: '2',
    createdAt: new Date('2024-06-08'),
  },
  {
    id: '3',
    userId: '2',
    userName: 'Sarah Manager',
    userRole: 'manager',
    type: 'annual',
    startDate: new Date('2024-07-01'),
    endDate: new Date('2024-07-05'),
    reason: 'Family vacation',
    status: 'pending',
    createdAt: new Date('2024-06-10'),
  },
];

export const mockActivities: ActivityLog[] = [
  {
    id: '1',
    userId: '3',
    userName: 'Mike Staff',
    action: 'created',
    module: 'leads',
    details: 'Created new lead: Robert Johnson',
    createdAt: new Date('2024-06-01T10:30:00'),
  },
  {
    id: '2',
    userId: '3',
    userName: 'Mike Staff',
    action: 'updated',
    module: 'leads',
    details: 'Updated lead status to Interested: Robert Johnson',
    createdAt: new Date('2024-06-03T14:15:00'),
  },
  {
    id: '3',
    userId: '3',
    userName: 'Mike Staff',
    action: 'converted',
    module: 'tasks',
    details: 'Converted lead to task: Robert Johnson',
    createdAt: new Date('2024-06-10T09:00:00'),
  },
  {
    id: '4',
    userId: '1',
    userName: 'John Admin',
    action: 'created',
    module: 'projects',
    details: 'Added new project: Metro Heights',
    createdAt: new Date('2024-05-01T11:00:00'),
  },
  {
    id: '5',
    userId: '2',
    userName: 'Sarah Manager',
    action: 'approved',
    module: 'leaves',
    details: 'Approved leave request for Emma Wilson',
    createdAt: new Date('2024-06-09T16:30:00'),
  },
];

export const demoCredentials = {
  admin: { userId: 'john_admin_001', password: 'admin123' },
  manager: { userId: 'sarah_manager_001', password: 'manager123' },
  staff: { userId: 'mike_staff_001', password: 'staff123' },
};

export const mockAnnouncements: Announcement[] = [];
