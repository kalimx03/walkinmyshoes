
import React, { useState, useEffect } from 'react';
import { AppView, EmpathyStats, ChatMessage } from './types';
import { SCENARIOS } from './constants';
import Layout from './components/Layout';
import VisualImpairmentScene from './components/VisualImpairmentScene';
import HearingLossScene from './components/HearingLossScene';
import MotorDisabilityScene from './components/MotorDisabilityScene';
import ColorBlindnessScene from './components/ColorBlindnessScene';
import ARAuditor from './components/ARAuditor';
import ImpactDashboard from './components/ImpactDashboard';
import Onboarding from './components/Onboarding';

const STORAGE_KEY = 'walkinmyshoes_stats';
const ONBOARDING_KEY = 'walkinmyshoes_onboarding_v1';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.LANDING);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return localStorage.getItem(ONBOARDING_KEY) !== 'true';
  });
  
  const [stats, setStats] = useState<EmpathyStats>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {
      scenariosCompleted: 0,
      empathyScore: 0,
      auditReportsGenerated: 0,
      timeSpentMinutes: 0,
      chatHistories: {}
    };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  }, [stats]);

  const handleOnboardingComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setShowOnboarding(false);
  };

  const completeScenario = (score: number) => {
    setStats(prev => ({
      ...prev,
      scenariosCompleted: prev.scenariosCompleted + 1,
      empathyScore: Math.round((prev.empathyScore + score) / (prev.scenariosCompleted ? 2 : 1)),
      timeSpentMinutes: prev.timeSpentMinutes + 8
    }));
    setCurrentView(AppView.DASHBOARD);
  };

  const updateChatHistory = (scenarioId: string, messages: ChatMessage[]) => {
    setStats(prev => ({
      ...prev,
      chatHistories: {
        ...prev.chatHistories,
        [scenarioId]: messages
      }
    }));
  };

  const renderContent = () => {
    switch (currentView) {
      case AppView.LANDING:
        return (
          <div className="relative h-full flex flex-col items-center justify-center p-6 text-center overflow-hidden bg-slate-950">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-indigo-600/5 rounded-full blur-[120px] -z-10 animate-pulse"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col items-center max-w-5xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-8 backdrop-blur-sm">
                 <span className="w-2 h-2 bg-indigo-400 rounded-full animate-ping"></span>
                 <span className="text-indigo-400 font-black uppercase tracking-[0.25em] text-[10px]">Immersive Experience v2.0</span>
              </div>

              <h1 className="text-6xl md:text-9xl font-black mb-8 leading-[0.9] tracking-tighter text-white">
                Empower through <br/> 
                <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-indigo-500 bg-clip-text text-transparent">perspective.</span>
              </h1>
              
              <p className="text-xl text-slate-400 max-w-2xl mb-12 leading-relaxed font-medium">
                Step into the shoes of others through interactive 3D simulations and analyze real-world barriers with high-precision AI.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6">
                <button 
                  onClick={() => setCurrentView(AppView.SIMULATION_SELECTOR)}
                  className="group relative bg-indigo-600 hover:bg-indigo-500 text-white px-12 py-6 rounded-[2rem] font-black text-lg shadow-2xl shadow-indigo-600/40 transition-all hover:-translate-y-2 active:scale-95 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  Start Training
                </button>
                <button 
                  onClick={() => setCurrentView(AppView.AR_AUDITOR)}
                  className="bg-slate-900 hover:bg-slate-800 text-white px-12 py-6 rounded-[2rem] font-black text-lg border border-slate-800 transition-all hover:-translate-y-2 active:scale-95 backdrop-blur-xl"
                >
                  AR Auditor
                </button>
              </div>

              <button 
                onClick={() => setShowOnboarding(true)}
                className="mt-12 text-[10px] font-black text-slate-600 uppercase tracking-widest hover:text-indigo-400 transition-colors"
              >
                // Re-Calibrate Neural HUD
              </button>
            </div>
          </div>
        );

      case AppView.SIMULATION_SELECTOR:
        return (
          <div className="p-12 max-w-7xl mx-auto min-h-full">
            <div className="mb-16 text-center">
              <h2 className="text-5xl font-black text-white tracking-tight">Select Simulation</h2>
              <p className="text-slate-400 mt-4 text-lg">Choose an immersive environment to begin your empathy journey.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-8">
              {SCENARIOS.map((scenario) => (
                <div 
                  key={scenario.id}
                  className="group bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-[2.5rem] p-8 hover:border-indigo-500/50 transition-all cursor-pointer relative overflow-hidden flex flex-col shadow-2xl"
                  onClick={() => setCurrentView(scenario.id as AppView)}
                >
                  {scenario.isNew && (
                    <div className="absolute top-6 right-6 px-3 py-1 bg-cyan-500 text-[8px] font-black text-white uppercase rounded-full shadow-lg z-20">New Experience</div>
                  )}
                  
                  <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center text-3xl mb-8 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-xl group-hover:shadow-indigo-600/20">
                    {scenario.icon}
                  </div>
                  
                  <h3 className="text-2xl font-black text-white mb-4 tracking-tight">{scenario.title}</h3>
                  <p className="text-slate-400 leading-relaxed mb-8 text-sm font-medium">{scenario.description}</p>
                  
                  <div className="mt-auto flex items-center gap-3 text-indigo-400 font-black text-[10px] uppercase tracking-widest group-hover:gap-6 transition-all">
                    Launch VR <span>→</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case AppView.VISION_SCENE:
        return <VisualImpairmentScene onComplete={completeScenario} history={stats.chatHistories[AppView.VISION_SCENE] || []} onUpdateHistory={(msgs) => updateChatHistory(AppView.VISION_SCENE, msgs)} />;
      
      case AppView.HEARING_SCENE:
        return <HearingLossScene onComplete={completeScenario} history={stats.chatHistories[AppView.HEARING_SCENE] || []} onUpdateHistory={(msgs) => updateChatHistory(AppView.HEARING_SCENE, msgs)} />;

      case AppView.MOTOR_SCENE:
        return <MotorDisabilityScene onComplete={completeScenario} history={stats.chatHistories[AppView.MOTOR_SCENE] || []} onUpdateHistory={(msgs) => updateChatHistory(AppView.MOTOR_SCENE, msgs)} />;

      case AppView.COLOR_BLIND_SCENE:
        return <ColorBlindnessScene onComplete={completeScenario} history={stats.chatHistories[AppView.COLOR_BLIND_SCENE] || []} onUpdateHistory={(msgs) => updateChatHistory(AppView.COLOR_BLIND_SCENE, msgs)} />;

      case AppView.AR_AUDITOR:
        return <ARAuditor history={stats.chatHistories[AppView.AR_AUDITOR] || []} onUpdateHistory={(msgs) => updateChatHistory(AppView.AR_AUDITOR, msgs)} onAuditComplete={() => setStats(s => ({...s, auditReportsGenerated: s.auditReportsGenerated + 1}))} />;

      case AppView.DASHBOARD:
        return <ImpactDashboard stats={stats} />;

      default:
        return null;
    }
  };

  return (
    <Layout currentView={currentView} onNavigate={setCurrentView}>
      {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}
      {renderContent()}
    </Layout>
  );
};

export default App;
