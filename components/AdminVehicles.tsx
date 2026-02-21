
import React, { useState } from 'react';
import { Vehicle } from '../types';

interface AdminVehiclesProps {
  vehicles: Vehicle[];
  onSave: (vehicles: Vehicle[]) => void;
}

const AdminVehicles: React.FC<AdminVehiclesProps> = ({ vehicles, onSave }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Vehicle>>({});

  const startEdit = (v: Vehicle) => {
    setEditingId(v.id);
    setFormData(v);
  };

  const handleUpdate = () => {
    if (editingId) {
      const updated = vehicles.map(v => v.id === editingId ? { ...v, ...formData } as Vehicle : v);
      onSave(updated);
      setEditingId(null);
    }
  };

  const addNew = () => {
    const newVehicle: Vehicle = {
      id: Math.random().toString(36).substr(2, 9),
      plate: 'NUOVA',
      model: 'Modello',
      type: 'Logistica',
      insuranceExpiry: '2025-01-01',
      revisionExpiry: '2025-01-01',
      stampExpiry: '2025-01-01',
      maintenanceStatus: 'OK',
      lastKm: 0,
    };
    onSave([...vehicles, newVehicle]);
    startEdit(newVehicle);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Database Mezzi</h2>
        <button 
          onClick={addNew}
          className="bg-blue-700 text-white px-4 py-2 rounded-lg font-bold shadow hover:bg-blue-800 transition"
        >
          <i className="fas fa-plus mr-2"></i> Aggiungi Mezzo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map(v => (
          <div key={v.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative group">
            {editingId === v.id ? (
              <div className="p-4 space-y-3">
                <input 
                  className="w-full border p-2 rounded" 
                  value={formData.plate} 
                  onChange={e => setFormData({...formData, plate: e.target.value})} 
                  placeholder="Targa"
                />
                <input 
                  className="w-full border p-2 rounded" 
                  value={formData.model} 
                  onChange={e => setFormData({...formData, model: e.target.value})} 
                  placeholder="Modello"
                />
                <div className="text-xs font-bold text-gray-500 uppercase">Scadenze</div>
                <input 
                  type="date"
                  className="w-full border p-2 rounded text-sm" 
                  value={formData.insuranceExpiry} 
                  onChange={e => setFormData({...formData, insuranceExpiry: e.target.value})} 
                />
                <div className="flex space-x-2">
                  <button onClick={handleUpdate} className="flex-1 bg-green-600 text-white py-2 rounded text-sm font-bold">Salva</button>
                  <button onClick={() => setEditingId(null)} className="flex-1 bg-gray-200 py-2 rounded text-sm">Annulla</button>
                </div>
              </div>
            ) : (
              <>
                <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
                  <span className="font-bold text-blue-900">{v.plate}</span>
                  <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                    v.maintenanceStatus === 'OK' ? 'bg-green-100 text-green-700' : 
                    v.maintenanceStatus === 'Richiesta' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {v.maintenanceStatus}
                  </span>
                </div>
                <div className="p-4">
                  <p className="font-bold text-lg mb-4">{v.model}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Assicurazione:</span>
                      <span className="font-medium">{v.insuranceExpiry}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Revisione:</span>
                      <span className="font-medium">{v.revisionExpiry}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Chilometraggio:</span>
                      <span className="font-bold">{v.lastKm} KM</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => startEdit(v)}
                    className="mt-4 w-full border border-blue-700 text-blue-700 py-2 rounded-lg text-sm font-bold hover:bg-blue-50 transition"
                  >
                    Modifica Dati
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminVehicles;
