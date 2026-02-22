import { Vehicle, Driver, Mission } from '../types';

export const apiService = {
  async getAllData() {
    const response = await fetch('/api/data');
    if (!response.ok) throw new Error('Failed to fetch data');
    return response.json();
  },

  async saveVehicles(vehicles: Vehicle[]) {
    const response = await fetch('/api/vehicles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vehicles),
    });
    if (!response.ok) throw new Error('Failed to save vehicles');
    return response.json();
  },

  async saveDrivers(drivers: Driver[]) {
    const response = await fetch('/api/drivers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(drivers),
    });
    if (!response.ok) throw new Error('Failed to save drivers');
    return response.json();
  },

  async saveMissions(missions: Mission[]) {
    const response = await fetch('/api/missions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(missions),
    });
    if (!response.ok) throw new Error('Failed to save missions');
    return response.json();
  },

  async saveScriptUrl(url: string) {
    const response = await fetch('/api/script-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    if (!response.ok) throw new Error('Failed to save script URL');
    return response.json();
  }
};
