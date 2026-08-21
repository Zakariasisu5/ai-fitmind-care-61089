
export interface Provider {
  id: string;
  name: string;
  provider_type: 'doctor' | 'hospital';
  phone_number: string;
  latitude: number;
  longitude: number;
  does_home_service: boolean;
  specialization?: string;
  address?: string;
}

export interface MapComponentProps {
  onClose: () => void;
}

