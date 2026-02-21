
import React, { useState } from 'react';
import { Vehicle, Driver, Mission } from '../types';

interface MissionFormProps {
  vehicles: Vehicle[];
  drivers: Driver[];
  activeMission?: Mission;
  onSave: (mission: Mission) => void;
}

const MissionForm: React.FC<MissionFormProps> = ({ vehicles, drivers, activeMission, onSave }) => {
  const [driverId, setDriverId] = useState(activeMission?.driverId || '');
  const [vehicleId, setVehicleId] = useState(activeMission?.vehicleId || '');
  const [destination, setDestination] = useState(activeMission?.destination || '');
  const [reason, setReason] = useState(activeMission?.reason || '');
  const [startKm, setStartKm] = useState<number>(activeMission?.startKm || 0);
  const [endKm, setEndKm] = useState<number | ''>('');
  const [fuelRefill, setFuelRefill] = useState(false);
  const [anomalies, setAnomalies] = useState('');

  const isEnding = !!activeMission;

  const handleStart = () => {
    if (!driverId || !vehicleId || !destination || !reason || startKm <= 0) {
      alert("Compila tutti i campi obbligatori per iniziare la missione.");
      return;
    }

    const newMission: Mission = {
      id: Math.random().toString(36).substr(2, 9),
      vehicleId,
      driverId,
      startTime: new Date().toISOString(),
      startKm,
      destination,
      reason,
      status: 'In Corso',
      fuelRefill: false,
    };

    onSave(newMission);
  };

  const handleEnd = () => {
    if (!activeMission || !endKm || endKm < activeMission.startKm) {
      alert("Inserisci un chilometraggio finale valido superiore a quello di partenza.");
      return;
    }

    const completedMission: Mission = {
      ...activeMission,
      endTime: new Date().toISOString(),
      endKm: Number(endKm),
      status: 'Completata',
      fuelRefill,
      anomalies,
    };

    onSave(completedMission);
  };

  const selectedVehicle = vehicles.find(v => v.id === vehicleId);
  const selectedDriver = drivers.find(d => d.id === driverId);

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 animate-fade-in">
      <div className={`p-6 text-white ${isEnding ? 'bg-orange-600' : 'bg-green-600'}`}>
        <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center">
          <i className={`fas ${isEnding ? 'fa-flag-checkered' : 'fa-play-circle'} mr-3`}></i>
          {isEnding ? 'Chiusura Missione' : 'Apertura Rapporto Missione'}
        </h2>
        <p className="opacity-80 text-sm mt-1 uppercase font-bold tracking-widest">Compila i dati per il registro ufficiale</p>
      </div>

      <div className="p-6 space-y-6">
        {!isEnding ? (
          <>
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Seleziona Autista</label>
              <select 
                value={driverId}
                onChange={(e) => setDriverId(e.target.value)}
                className="w-full border-2 border-gray-100 rounded-xl p-3 focus:border-green-500 outline-none transition bg-gray-50 font-bold"
              >
                <option value="">Chi guida?</option>
                {drivers.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.license})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Mezzo Utilizzato</label>
                <select 
                  value={vehicleId}
                  onChange={(e) => {
                    const vId = e.target.value;
                    setVehicleId(vId);
                    const v = vehicles.find(item => item.id === vId);
                    if (v) setStartKm(v.lastKm);
                  }}
                  className="w-full border-2 border-gray-100 rounded-xl p-3 focus:border-green-500 outline-none transition bg-gray-50 font-bold"
                >
                  <option value="">Quale mezzo?</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.plate} - {v.model}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">KM Partenza</label>
                <input 
                  type="number"
                  value={startKm}
                  onChange={(e) => setStartKm(Number(e.target.value))}
                  className="w-full border-2 border-gray-100 rounded-xl p-3 focus:border-green-500 outline-none transition bg-gray-50 font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Destinazione</label>
              <input 
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Es. Sede Provinciale, Magazzino..."
                className="w-full border-2 border-gray-100 rounded-xl p-3 focus:border-green-500 outline-none transition bg-gray-50 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Motivazione Servizio</label>
              <textarea 
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Indica il motivo dell'uscita..."
                className="w-full border-2 border-gray-100 rounded-xl p-3 focus:border-green-500 outline-none transition bg-gray-50 font-bold"
              ></textarea>
            </div>

            <button 
              onClick={handleStart}
              className="w-full bg-green-600 text-white font-black py-5 rounded-2xl hover:bg-green-700 transition shadow-xl flex items-center justify-center space-x-3 transform active:scale-95"
            >
              <i className="fas fa-paper-plane"></i>
              <span className="tracking-widest uppercase">Registra Partenza</span>
            </button>
          </>
        ) : (
          <>
            <div className="bg-gray-100 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4 border border-gray-200">
              <div className="text-center sm:text-left">
                <p className="text-xs font-black text-gray-400 uppercase tracking-tighter">In missione con</p>
                <p className="font-black text-blue-900 text-lg">{selectedVehicle?.plate}</p>
                <p className="text-xs text-gray-600 font-bold uppercase">{selectedDriver?.name}</p>
              </div>
              <div className="bg-white px-6 py-2 rounded-xl border border-gray-200 text-center">
                <p className="text-[10px] font-black text-gray-400 uppercase">Partenza</p>
                <p className="text-2xl font-black text-blue-600">{activeMission.startKm}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase">KM</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Lettura Chilometri Arrivo</label>
              <input 
                type="number"
                value={endKm}
                onChange={(e) => setEndKm(Number(e.target.value))}
                placeholder="Valore finale contachilometri"
                className="w-full border-4 border-orange-100 rounded-2xl p-4 focus:border-orange-500 outline-none transition bg-orange-50 text-3xl font-black text-center text-orange-900"
              />
            </div>

            <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <input 
                type="checkbox"
                id="fuel"
                checked={fuelRefill}
                onChange={(e) => setFuelRefill(e.target.checked)}
                className="w-6 h-6 rounded-md text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="fuel" className="text-sm font-black text-blue-900 uppercase cursor-pointer flex-grow">Rifornimento Carburante Effettuato</label>
              <i className="fas fa-gas-pump text-blue-400 text-xl"></i>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Note / Anomalie Riscontrate</label>
              <textarea 
                rows={3}
                value={anomalies}
                onChange={(e) => setAnomalies(e.target.value)}
                placeholder="Segnala eventuali problemi tecnici o note sul servizio..."
                className="w-full border-2 border-gray-100 rounded-xl p-3 focus:border-orange-500 outline-none transition bg-gray-50 font-bold"
              ></textarea>
            </div>

            <button 
              onClick={handleEnd}
              className="w-full bg-orange-600 text-white font-black py-5 rounded-2xl hover:bg-orange-700 transition shadow-xl flex items-center justify-center space-x-3 transform active:scale-95"
            >
              <i className="fas fa-save"></i>
              <span className="tracking-widest uppercase">Archivia Fine Missione</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default MissionForm;
