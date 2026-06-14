export type UserRole = 'tourist' | 'driver' | 'admin';

export type TripStatus = 'pending' | 'searching' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';

export type VehicleType = 'sedan' | 'suv' | 'minivan' | 'bus' | 'taxi';

export type DriverStatus = 'pending' | 'approved' | 'suspended' | 'rejected';

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  whatsapp: string;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Driver {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  whatsapp: string;
  vehicle_type: VehicleType;
  vehicle_registration: string;
  vehicle_photo_url: string | null;
  license_url: string | null;
  areas_covered: string[];
  status: DriverStatus;
  availability_status: 'online' | 'offline' | 'busy';
  is_verified: boolean;
  rating: number;
  total_trips: number;
  total_earnings: number;
  created_at: string;
  updated_at: string;
}

export interface TransferRequest {
  id: string;
  tourist_id: string;
  tourist_name: string;
  tourist_whatsapp: string;
  tourist_email: string;
  pickup_location: string;
  destination: string;
  pickup_date: string;
  pickup_time: string;
  passengers: number;
  special_notes: string | null;
  price_quoted: number | null;
  status: TripStatus;
  created_at: string;
  updated_at: string;
}

export interface TripAssignment {
  id: string;
  request_id: string;
  driver_id: string;
  driver_name: string;
  driver_phone: string;
  driver_whatsapp: string;
  vehicle_type: VehicleType;
  vehicle_registration: string;
  status: TripStatus;
  accepted_at: string;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface Review {
  id: string;
  trip_id: string;
  tourist_id: string;
  driver_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'request' | 'assignment' | 'approval' | 'reminder' | 'system';
  read: boolean;
  created_at: string;
}

export interface PopularRoute {
  from: string;
  to: string;
  price: string;
  price_usd: number;
  duration: string;
  distance: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  avatar: string;
  content: string;
  rating: number;
}

export interface SiteSettings {
  id: string;
  site_name: string;
  tagline: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  whatsapp_number: string;
  email: string;
  phone: string;
  address: string;
  facebook_url: string | null;
  instagram_url: string | null;
  twitter_url: string | null;
  commission_rate: number;
  currency: string;
  exchange_rate: number;
}

export interface Season {
  id: string;
  name: string;
  multiplier: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SeasonalPrice {
  base_price_usd: number;
  season_multiplier: number;
  season_name: string;
  final_price_usd: number;
  adjustment_usd: number;
  base_price_tzs: number;
  final_price_tzs: number;
  adjustment_tzs: number;
}
