export type Specialty =
  | 'maternity' | 'emergency' | 'dental' | 'pediatric'
  | 'cardiology' | 'orthopedics' | 'oncology' | 'general';

export type OwnershipType = 'public' | 'private';

export interface Hospital {
  id: string;
  name: string;
  address: string;
  city: string;
  lga: string;
  state: string;
  phone: string;
  email?: string;
  specialties: Specialty[];
  ownership: OwnershipType;
  visiting_hours?: string;
  description?: string;
  image_url?: string;
  latitude: number;
  longitude: number;
  rating_avg: number;
  rating_count: number;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  hospital_id: string;
  user_id: string;
  rating: number;
  body?: string;
  status: 'pending' | 'approved' | 'hidden';
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  role: 'admin' | 'user';
  display_name?: string;
}

export interface SearchFilters {
  query?: string;
  city?: string;
  lga?: string;
  specialty?: Specialty;
  ownership?: OwnershipType;
  radius?: number;
  lat?: number;
  lng?: number;
}

export type ExportColumn = 'name' | 'address' | 'phone' | 'email' | 'specialties' | 'rating';

export interface ExportOptions {
  columns: ExportColumn[];
  filename?: string;
}
