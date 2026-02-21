
export interface Vehicle {
  id: string;
  plate: string;
  model: string;
  type: 'Ambulanza' | 'Antincendio' | 'Logistica' | 'Trasporto';
  insuranceExpiry: string;
  revisionExpiry: string;
  stampExpiry: string; // Bollo
  maintenanceStatus: 'OK' | 'Richiesta' | 'Urgente';
  lastKm: number;
}

export interface Driver {
  id: string;
  name: string;
  license: string;
  isAdmin: boolean;
  pin: string; // Simple PIN for authentication
}

export interface Mission {
  id: string;
  vehicleId: string;
  driverId: string;
  startTime: string;
  endTime?: string;
  startKm: number;
  endKm?: number;
  destination: string;
  reason: string;
  status: 'In Corso' | 'Completata';
  fuelRefill: boolean;
  anomalies?: string;
}

export type View = 'dashboard' | 'missions' | 'admin-vehicles' | 'admin-drivers' | 'new-mission';
