
import React, { useState, useEffect } from 'react';
import { apiService } from './services/apiService';
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await apiService.getAllData();
        setVehicles(data.vehicles || []);
        setDrivers(data.drivers || []);
        setMissions(data.missions || []);
        setScriptUrl(data.scriptUrl || '');
        console.log("Database sincronizzato. Utenti caricati:", (data.drivers || []).map((d: any) => d.name));
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSaveVehicles = async (newVehicles: Vehicle[]) => {
    setVehicles(newVehicles);
    try {
      await apiService.saveVehicles(newVehicles);
    } catch (error) {
      console.error("Error saving vehicles:", error);
    }
  };

  const handleSaveDrivers = async (newDrivers: Driver[]) => {
    setDrivers(newDrivers);
    try {
      await apiService.saveDrivers(newDrivers);
    } catch (error) {
      console.error("Error saving drivers:", error);
    }
  };

  const handleSaveMissions = async (newMissions: Mission[]) => {
    setMissions(newMissions);
    try {
      await apiService.saveMissions(newMissions);
    } catch (error) {
      console.error("Error saving missions:", error);
    }
  };

  const handleSaveScriptUrl = async (url: string) => {
    setScriptUrl(url);
    try {
      await apiService.saveScriptUrl(url);
    } catch (error) {
      console.error("Error saving script URL:", error);
    }
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
    if (isLoading) {
      alert('Caricamento dati in corso... Attendi un secondo.');
      return;
    }
    
    if (drivers.length === 0) {
      alert('Errore: Nessun utente trovato nel database. Contatta l\'assistenza.');
      return;
    }

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
      alert('PIN Amministratore Errato. Riprova.');
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
            <h1 className="font-bold text-lg">PC Leini Fleet Sync</h1>
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

      <main className="flex-grow max-w-7xl mx-auto w-full p-4 md:p-6 pb-24 relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-70 z-30 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800 mb-2"></div>
              <p className="text-blue-800 font-bold">Sincronizzazione Database...</p>
            </div>
          </div>
        )}
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
                      }}
                    />
                    <button 
                      onClick={() => handleSaveScriptUrl(scriptUrl)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold"
                    >
                      Salva URL
                    </button>
                  </div>
                </div>
                <AdminVehicles vehicles={vehicles} onSave={handleSaveVehicles} />
              </>
            )}
            {currentView === 'admin-drivers' && (
              <div className="space-y-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-purple-200">
                  <h3 className="font-bold text-purple-900 mb-4 flex items-center">
                    <i className="fas fa-key mr-2 text-purple-600"></i> Sicurezza Admin
                  </h3>
                  <p className="text-xs text-gray-500 mb-4">Modifica il PIN di accesso per gli amministratori. Assicurati di comunicarlo solo ai responsabili.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {drivers.filter(d => d.isAdmin).map(admin => (
                      <div key={admin.id} className="flex items-center justify-between p-3 bg-purple-50 rounded-xl border border-purple-100">
                        <span className="font-bold text-purple-900">{admin.name}</span>
                        <div className="flex items-center space-x-2">
                          <input 
                            type="password" 
                            maxLength={4} 
                            className="w-16 text-center border rounded p-1 font-mono"
                            defaultValue={admin.pin}
                            onBlur={async (e) => {
                              if (e.target.value.length === 4) {
                                const updated = drivers.map(d => d.id === admin.id ? { ...d, pin: e.target.value } : d);
                                await handleSaveDrivers(updated);
                              }
                            }}
                          />
                          <span className="text-[10px] text-purple-400 uppercase font-bold">PIN (4 cifre)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <AdminDrivers drivers={drivers} onSave={handleSaveDrivers} />
              </div>
            )}
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
            <p className="mt-4 text-[10px] text-gray-400 italic">PIN predefinito: 1234 (Mario Rossi)</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
