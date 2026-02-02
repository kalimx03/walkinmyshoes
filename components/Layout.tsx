
import React from 'react';
import { AppView } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentView: AppView;
  onNavigate: (view: AppView) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, onNavigate }) => {
  return (
    <div className="flex flex-col h-full bg-slate-950 overflow-hidden">
      {/* Persistent Navigation Header */}
      <header className="flex-none h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-6 z-50">
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => onNavigate(AppView.LANDING)}
        >
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white">W</div>
          <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            WalkInMyShoes
          </h1>
        </div>
        
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          <button 
            onClick={() => onNavigate(AppView.SIMULATION_SELECTOR)}
            className={`hover:text-white transition-colors ${currentView === AppView.SIMULATION_SELECTOR ? 'text-white' : ''}`}
          >
            Simulations
          </button>
          <button 
            onClick={() => onNavigate(AppView.AR_AUDITOR)}
            className={`hover:text-white transition-colors ${currentView === AppView.AR_AUDITOR ? 'text-white' : ''}`}
          >
            AR Auditor
          </button>
          <button 
            onClick={() => onNavigate(AppView.DASHBOARD)}
            className={`hover:text-white transition-colors ${currentView === AppView.DASHBOARD ? 'text-white' : ''}`}
          >
            My Impact
          </button>
        </nav>

        <div className="flex items-center gap-4">
           <button 
            className="md:hidden p-2 text-slate-400"
            onClick={() => onNavigate(AppView.DASHBOARD)}
           >
             📊
           </button>
        </div>
      </header>

      <main className="flex-1 relative overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;
