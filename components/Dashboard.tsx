
import React, { useState } from 'react';
import { Vehicle, Mission, View } from '../types';
import { analyzeFleetStatus } from '../services/geminiService';

interface DashboardProps {
  vehicles: Vehicle[];
  missions: Mission[];
  onNavigate: (view: View) => void;
  activeMission?: Mission;
}

const Dashboard: React.FC<DashboardProps> = ({ vehicles, missions, onNavigate, activeMission }) => {
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const getUrgentVehicles = () => {
    const today = new Date();
    return vehicles.filter(v => {
      const ins = new Date(v.insuranceExpiry);
      const rev = new Date(v.revisionExpiry);
      const sta = new Date(v.stampExpiry);
      return ins < today || rev < today || sta < today || v.maintenanceStatus === 'Urgente';
    });
  };

  const urgentList = getUrgentVehicles();

  const handleAiAnalysis = async () => {
    setIsAnalyzing(true);
    const report = await analyzeFleetStatus(missions, vehicles);
    setAiReport(report);
    setIsAnalyzing(false);
  };

  return (
    <div className="space-y-6">
      {/* Active Mission Banner */}
      {activeMission && (
        <div className="bg-orange-100 border-l-4 border-orange-500 p-4 rounded-xl shadow-md flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="animate-pulse bg-orange-500 w-4 h-4 rounded-full"></div>
            <div>
              <p className="font-bold text-orange-900">ATTENZIONE: Missione Aperta</p>
              <p className="text-sm text-orange-800">Il mezzo <b>{vehicles.find(v => v.id === activeMission.vehicleId)?.plate}</b> è attualmente in uso.</p>
            </div>
          </div>
          <button 
            onClick={() => onNavigate('new-mission')}
            className="bg-orange-600 text-white px-5 py-2 rounded-lg text-sm font-bold shadow hover:bg-orange-700 transition"
          >
            Chiudi Missione
          </button>
        </div>
      )}

      {/* Main Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {!activeMission && (
          <button 
            onClick={() => onNavigate('new-mission')}
            className="flex flex-col items-center justify-center p-8 bg-green-600 text-white rounded-2xl shadow-xl hover:bg-green-700 transition transform hover:-translate-y-1 group"
          >
            <i className="fas fa-play-circle text-5xl mb-3 group-hover:scale-110 transition"></i>
            <span className="text-xl font-black uppercase tracking-wider">Inizia Nuova Missione</span>
            <span className="text-xs opacity-80 mt-1 uppercase">Aperto a tutti i volontari</span>
          </button>
        )}
        <button 
          onClick={() => onNavigate('missions')}
          className="flex flex-col items-center justify-center p-8 bg-white text-gray-800 rounded-2xl shadow-lg border border-gray-200 hover:bg-gray-50 transition transform hover:-translate-y-1"
        >
          <i className="fas fa-clipboard-list text-5xl mb-3 text-blue-600"></i>
          <span className="text-xl font-bold uppercase tracking-wider">Archivio Missioni</span>
          <span className="text-xs text-gray-400 mt-1 uppercase">Visualizza storico e report</span>
        </button>
      </div>

      {/* Admin & Tools Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-gray-400 font-bold uppercase text-xs tracking-widest mb-4">Strumenti Gestionali</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button 
            onClick={() => onNavigate('admin-vehicles')}
            className="flex items-center space-x-3 p-4 rounded-xl bg-blue-50 text-blue-800 hover:bg-blue-100 transition border border-blue-100"
          >
            <i className="fas fa-truck-monster text-xl"></i>
            <div className="text-left">
              <span className="block font-bold">Database Mezzi</span>
              <span className="text-[10px] uppercase opacity-70 flex items-center">
                <i className="fas fa-lock mr-1 text-[8px]"></i> Scadenze e KM
              </span>
            </div>
          </button>
          
          <button 
            onClick={() => onNavigate('admin-drivers')}
            className="flex items-center space-x-3 p-4 rounded-xl bg-purple-50 text-purple-800 hover:bg-purple-100 transition border border-purple-100"
          >
            <i className="fas fa-users text-xl"></i>
            <div className="text-left">
              <span className="block font-bold">Gestione Autisti</span>
              <span className="text-[10px] uppercase opacity-70 flex items-center">
                <i className="fas fa-lock mr-1 text-[8px]"></i> Database Volontari
              </span>
            </div>
          </button>

          <button 
            onClick={handleAiAnalysis}
            disabled={isAnalyzing}
            className="flex items-center space-x-3 p-4 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition disabled:opacity-50"
          >
            <i className={`fas ${isAnalyzing ? 'fa-spinner fa-spin' : 'fa-brain'} text-xl`}></i>
            <div className="text-left">
              <span className="block font-bold">Smart Report IA</span>
              <span className="text-[10px] uppercase opacity-70">Analisi Flotta</span>
            </div>
          </button>
        </div>
      </div>

      {/* AI Report Card */}
      {aiReport && (
        <div className="bg-indigo-900 p-6 rounded-2xl shadow-2xl text-white animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold flex items-center">
              <i className="fas fa-robot mr-2 text-yellow-400"></i> Rapporto Strategico IA
            </h3>
            <button onClick={() => setAiReport(null)} className="text-indigo-300 hover:text-white">
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="prose prose-invert max-w-none text-sm leading-relaxed">
            {aiReport.split('\n').map((line, i) => <p key={i} className="mb-2">{line}</p>)}
          </div>
        </div>
      )}

      {/* Urgent Table Preview (Publicly visible to alert everyone) */}
      {urgentList.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-red-200 overflow-hidden">
          <div className="bg-red-600 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center">
              <i className="fas fa-bell text-white mr-3 animate-bounce"></i>
              <h3 className="text-white font-black uppercase tracking-tighter">Criticità Mezzi</h3>
            </div>
            <span className="bg-white text-red-600 px-2 py-0.5 rounded text-xs font-bold">{urgentList.length} AVVISI</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 font-bold text-gray-500 uppercase">Mezzo / Targa</th>
                  <th className="px-6 py-3 font-bold text-gray-500 uppercase">Alert</th>
                  <th className="px-6 py-3 font-bold text-gray-500 uppercase text-right">Data Scadenza</th>
                </tr>
              </thead>
              <tbody>
                {urgentList.map(v => {
                  const today = new Date();
                  const ins = new Date(v.insuranceExpiry);
                  const rev = new Date(v.revisionExpiry);
                  const isInsExp = ins < today;
                  const isRevExp = rev < today;

                  return (
                    <tr key={v.id} className="border-b last:border-0 hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{v.model}</div>
                        <div className="text-blue-600 font-mono text-xs">{v.plate}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {isInsExp && <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[10px] font-bold">ASSICURAZIONE</span>}
                          {isRevExp && <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-[10px] font-bold">REVISIONE</span>}
                          {v.maintenanceStatus === 'Urgente' && <span className="bg-red-800 text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase">Manutenzione</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-medium text-gray-500">
                        {isInsExp ? v.insuranceExpiry : v.revisionExpiry}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
