
import React, { useState } from 'react';
import { Driver } from '../types';

interface AdminDriversProps {
  drivers: Driver[];
  onSave: (drivers: Driver[]) => void;
}

const AdminDrivers: React.FC<AdminDriversProps> = ({ drivers, onSave }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Driver>>({});

  const startEdit = (d: Driver) => {
    setEditingId(d.id);
    setFormData(d);
  };

  const handleUpdate = () => {
    if (editingId) {
      const updated = drivers.map(d => d.id === editingId ? { ...d, ...formData } as Driver : d);
      onSave(updated);
      setEditingId(null);
    }
  };

  const addNew = () => {
    const newDriver: Driver = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'Nuovo Volontario',
      license: 'B',
      isAdmin: false,
      pin: '0000',
    };
    onSave([...drivers, newDriver]);
    startEdit(newDriver);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Registro Volontari</h2>
        <button 
          onClick={addNew}
          className="bg-blue-700 text-white px-4 py-2 rounded-lg font-bold shadow hover:bg-blue-800 transition"
        >
          <i className="fas fa-user-plus mr-2"></i> Aggiungi Volontario
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 font-semibold text-gray-600">Nome</th>
              <th className="px-6 py-3 font-semibold text-gray-600">Patenti</th>
              <th className="px-6 py-3 font-semibold text-gray-600">Ruolo</th>
              <th className="px-6 py-3 font-semibold text-gray-600">PIN</th>
              <th className="px-6 py-3 font-semibold text-gray-600">Azioni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {drivers.map(d => (
              <tr key={d.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  {editingId === d.id ? (
                    <input className="border rounded p-1" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  ) : d.name}
                </td>
                <td className="px-6 py-4">
                  {editingId === d.id ? (
                    <input className="border rounded p-1 w-20" value={formData.license} onChange={e => setFormData({...formData, license: e.target.value})} />
                  ) : d.license}
                </td>
                <td className="px-6 py-4">
                  {editingId === d.id ? (
                    <select className="border rounded p-1" value={String(formData.isAdmin)} onChange={e => setFormData({...formData, isAdmin: e.target.value === 'true'})}>
                      <option value="true">Amministratore</option>
                      <option value="false">Volontario</option>
                    </select>
                  ) : (
                    <span className={`text-xs px-2 py-1 rounded-full font-bold ${d.isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {d.isAdmin ? 'ADMIN' : 'VOLONTARIO'}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 font-mono">
                  {editingId === d.id ? (
                    <input className="border rounded p-1 w-16" maxLength={4} value={formData.pin} onChange={e => setFormData({...formData, pin: e.target.value})} />
                  ) : '****'}
                </td>
                <td className="px-6 py-4">
                  {editingId === d.id ? (
                    <button onClick={handleUpdate} className="text-green-600 font-bold hover:underline">Salva</button>
                  ) : (
                    <button onClick={() => startEdit(d)} className="text-blue-600 hover:underline">Modifica</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDrivers;
