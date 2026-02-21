
import React from 'react';
import { Mission, Vehicle, Driver } from '../types';

interface MissionListProps {
  missions: Mission[];
  vehicles: Vehicle[];
  drivers: Driver[];
}

const MissionList: React.FC<MissionListProps> = ({ missions, vehicles, drivers }) => {
  const sortedMissions = [...missions].sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Archivio Rapporti Missione</h2>
      
      <div className="space-y-4">
        {sortedMissions.map(m => {
          const vehicle = vehicles.find(v => v.id === m.vehicleId);
          const driver = drivers.find(d => d.id === m.driverId);
          
          return (
            <div key={m.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:border-blue-300 transition-colors">
              <div className="flex flex-col md:flex-row justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${m.status === 'In Corso' ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-600'}`}>
                    <i className="fas fa-calendar-alt"></i>
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{new Date(m.startTime).toLocaleDateString()} - {m.destination}</p>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">{m.status}</p>
                  </div>
                </div>
                <div className="mt-2 md:mt-0 text-right">
                  <p className="font-semibold text-blue-900">{vehicle?.plate} ({vehicle?.model})</p>
                  <p className="text-sm text-gray-600">Autista: {driver?.name}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-3 rounded-lg text-sm">
                <div>
                  <span className="text-gray-500 block">KM Partenza</span>
                  <span className="font-bold">{m.startKm}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">KM Arrivo</span>
                  <span className="font-bold">{m.endKm || '--'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Distanza</span>
                  <span className="font-bold">{m.endKm ? m.endKm - m.startKm : 0} KM</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Rifornimento</span>
                  <span className={`font-bold ${m.fuelRefill ? 'text-green-600' : 'text-gray-400'}`}>
                    {m.fuelRefill ? 'SI' : 'NO'}
                  </span>
                </div>
              </div>
              
              <div className="mt-4 flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <span className="text-xs font-bold text-gray-400 uppercase">Motivo</span>
                  <p className="text-sm text-gray-700">{m.reason}</p>
                </div>
                {m.anomalies && (
                  <div className="flex-1 bg-red-50 p-2 rounded border border-red-100">
                    <span className="text-xs font-bold text-red-400 uppercase">Anomalie</span>
                    <p className="text-sm text-red-700 italic">"{m.anomalies}"</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {missions.length === 0 && (
          <div className="text-center py-12 text-gray-400 bg-white rounded-xl border-2 border-dashed">
            <i className="fas fa-folder-open text-4xl mb-2"></i>
            <p>Nessuna missione in archivio.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MissionList;
