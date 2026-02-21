
import React, { useState, useEffect } from 'react';
import { storage } from './services/mockData';
import { syncMissionToGoogle } from './services/googleSync';
import { View, Vehicle, Driver, Mission } from './types';
import Dashboard from './components/Dashboard';
import MissionForm from './components/MissionForm';
import AdminVehicles from './components/AdminVehicles';
import AdminDrivers from './components/AdminDrivers';
import MissionList from './components/MissionList';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [scriptUrl, setScriptUrl] = useState('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pendingView, setPendingView] = useState<View | null>(null);

  useEffect(() => {
    setVehicles(storage.getVehicles());
    setDrivers(storage.getDrivers());
    setMissions(storage.getMissions());
    setScriptUrl(storage.getScriptUrl());
  }, []);

  const handleSaveVehicles = (newVehicles: Vehicle[]) => {
    setVehicles(newVehicles);
    storage.saveVehicles(newVehicles);
  };

  const handleSaveDrivers = (newDrivers: Driver[]) => {
    setDrivers(newDrivers);
    storage.saveDrivers(newDrivers);
  };

  const handleSaveMissions = (newMissions: Mission[]) => {
    setMissions(newMissions);
    storage.saveMissions(newMissions);
  };

  const requestAdminAccess = (targetView: View) => {
    if (isAdminAuthenticated) {
      setCurrentView(targetView);
    } else {
      setPendingView(targetView);
      setIsAuthModalOpen(true);
    }
  };

  const authenticate = () => {
    const admin = drivers.find(d => d.isAdmin && d.pin === pinInput);
    if (admin) {
      setIsAdminAuthenticated(true);
      setIsAuthModalOpen(false);
      setPinInput('');
      if (pendingView) {
        setCurrentView(pendingView);
        setPendingView(null);
      }
    } else {
      alert('PIN Amministratore Errato');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-blue-800 text-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentView('dashboard')}>
            <div className="bg-yellow-400 p-2 rounded-full">
              <i className="fas fa-shield-alt text-blue-900 text-xl"></i>
            </div>
            <h1 className="font-bold text-lg">PC Vercelli Fleet Sync</h1>
          </div>
          <div className="flex items-center space-x-4">
            {isAdminAuthenticated ? (
              <button onClick={() => setIsAdminAuthenticated(false)} className="bg-blue-700 px-3 py-1 rounded text-sm">Esci Admin</button>
            ) : (
              <button onClick={() => requestAdminAccess('admin-vehicles')} className="text-white hover:text-yellow-400"><i className="fas fa-lock"></i></button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto w-full p-4 md:p-6 pb-24">
        {currentView === 'dashboard' && (
          <Dashboard 
            vehicles={vehicles} 
            missions={missions} 
            onNavigate={(v) => (v.startsWith('admin') ? requestAdminAccess(v as View) : setCurrentView(v as View))} 
            activeMission={missions.find(m => m.status === 'In Corso')}
          />
        )}
        
        {currentView === 'new-mission' && (
          <MissionForm 
            vehicles={vehicles} 
            drivers={drivers}
            activeMission={missions.find(m => m.status === 'In Corso')}
            onSave={(mission) => {
              const updated = mission.status === 'Completata' 
                ? missions.map(m => m.id === mission.id ? mission : m)
                : [...missions, mission];
              handleSaveMissions(updated);
              
              const vehicle = vehicles.find(v => v.id === mission.vehicleId);
              const driver = drivers.find(d => d.id === mission.driverId);

              if (mission.status === 'Completata') {
                if (mission.endKm) {
                  const updatedVehicles = vehicles.map(v => v.id === mission.vehicleId ? { ...v, lastKm: mission.endKm! } : v);
                  handleSaveVehicles(updatedVehicles);
                }
                // Sync to Google Sheets if completion
                if (vehicle && driver && scriptUrl) {
                  syncMissionToGoogle(mission, vehicle, driver, scriptUrl);
                }
              }
              setCurrentView('dashboard');
            }}
          />
        )}

        {currentView === 'missions' && <MissionList missions={missions} vehicles={vehicles} drivers={drivers} />}
        
        {isAdminAuthenticated && (
          <div className="space-y-8">
            {currentView === 'admin-vehicles' && (
              <>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-200">
                  <h3 className="font-bold text-blue-900 mb-4 flex items-center">
                    <i className="fab fa-google mr-2 text-green-600"></i> Impostazioni Google Sheets
                  </h3>
                  <p className="text-xs text-gray-500 mb-4">Incolla qui l'URL della Web App generata da Google Apps Script per sincronizzare i report delle missioni.</p>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      className="flex-grow border rounded-lg p-2 text-sm" 
                      placeholder="https://script.google.com/macros/s/.../exec"
                      value={scriptUrl}
                      onChange={(e) => {
                        setScriptUrl(e.target.value);
                        storage.saveScriptUrl(e.target.value);
                      }}
                    />
                    <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold">Salva URL</button>
                  </div>
                </div>
                <AdminVehicles vehicles={vehicles} onSave={handleSaveVehicles} />
              </>
            )}
            {currentView === 'admin-drivers' && <AdminDrivers drivers={drivers} onSave={handleSaveDrivers} />}
          </div>
        )}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 w-full bg-white border-t flex justify-around p-3 md:hidden z-40">
        <button onClick={() => setCurrentView('dashboard')} className="flex flex-col items-center text-gray-500"><i className="fas fa-home"></i></button>
        <button onClick={() => setCurrentView('new-mission')} className="flex flex-col items-center text-gray-500"><i className="fas fa-play"></i></button>
        <button onClick={() => requestAdminAccess('admin-vehicles')} className="flex flex-col items-center text-gray-500"><i className="fas fa-cog"></i></button>
      </nav>

      {/* Auth Modal */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm text-center">
            <h2 className="text-xl font-bold text-blue-900 mb-4">Accesso Admin</h2>
            <input 
              type="password" maxLength={4} value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="••••"
              className="w-full text-center text-3xl tracking-widest border rounded-lg p-3 mb-4"
              onKeyPress={(e) => e.key === 'Enter' && authenticate()}
            />
            <button onClick={authenticate} className="w-full bg-blue-800 text-white font-bold py-3 rounded-lg uppercase">Sblocca Database</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
