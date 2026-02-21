
import { Mission, Vehicle, Driver } from '../types';

export const syncMissionToGoogle = async (mission: Mission, vehicle: Vehicle, driver: Driver, scriptUrl: string) => {
  if (!scriptUrl) return;

  const payload = {
    ...mission,
    vehiclePlate: vehicle.plate,
    vehicleModel: vehicle.model,
    driverName: driver.name
  };

  try {
    // Note: Google Apps Script Web App requires 'no-cors' for simple POST or proper handling. 
    // Using fetch with 'cors' mode might trigger redirect issues, but we'll use a standard POST.
    await fetch(scriptUrl, {
      method: 'POST',
      mode: 'no-cors', // Apps Script usually redirects, no-cors is safest for simple appends
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    console.log("Mission synced to Google Sheets");
  } catch (error) {
    console.error("Failed to sync with Google Sheets:", error);
  }
};
