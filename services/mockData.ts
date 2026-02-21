
import { Vehicle, Driver, Mission } from '../types';

const VEHICLES_KEY = 'pc_vehicles';
const DRIVERS_KEY = 'pc_drivers';
const MISSIONS_KEY = 'pc_missions';
const SCRIPT_URL_KEY = 'pc_google_script_url';

const defaultVehicles: Vehicle[] = [
  { id: '1', plate: 'PC 123 AA', model: 'Land Rover Defender', type: 'Antincendio', insuranceExpiry: '2024-12-31', revisionExpiry: '2024-06-15', stampExpiry: '2025-01-20', maintenanceStatus: 'OK', lastKm: 12500 },
  { id: '2', plate: 'PC 456 BB', model: 'Fiat Ducato', type: 'Ambulanza', insuranceExpiry: '2023-11-30', revisionExpiry: '2025-02-10', stampExpiry: '2024-05-15', maintenanceStatus: 'Richiesta', lastKm: 45000 },
];

const defaultDrivers: Driver[] = [
  { id: '1', name: 'Mario Rossi', license: 'B, C', isAdmin: true, pin: '1234' },
  { id: '2', name: 'Luigi Bianchi', license: 'B', isAdmin: false, pin: '0000' },
];

export const storage = {
  getVehicles: (): Vehicle[] => {
    const data = localStorage.getItem(VEHICLES_KEY);
    return data ? JSON.parse(data) : defaultVehicles;
  },
  saveVehicles: (data: Vehicle[]) => localStorage.setItem(VEHICLES_KEY, JSON.stringify(data)),
  
  getDrivers: (): Driver[] => {
    const data = localStorage.getItem(DRIVERS_KEY);
    return data ? JSON.parse(data) : defaultDrivers;
  },
  saveDrivers: (data: Driver[]) => localStorage.setItem(DRIVERS_KEY, JSON.stringify(data)),

  getMissions: (): Mission[] => {
    const data = localStorage.getItem(MISSIONS_KEY);
    return data ? JSON.parse(data) : [];
  },
  saveMissions: (data: Mission[]) => localStorage.setItem(MISSIONS_KEY, JSON.stringify(data)),

  getScriptUrl: (): string => localStorage.getItem(SCRIPT_URL_KEY) || '',
  saveScriptUrl: (url: string) => localStorage.setItem(SCRIPT_URL_KEY, url),
};
