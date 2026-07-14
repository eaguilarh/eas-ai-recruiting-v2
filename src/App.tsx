import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, 
  Wifi, 
  HelpCircle, 
  Clock, 
  FileCheck, 
  Database, 
  Lock
} from 'lucide-react';
import Sidebar from './components/Sidebar';
import DashboardPanel from './components/DashboardPanel';
import CandidatePanel from './components/CandidatePanel';
import CalendarPanel from './components/CalendarPanel';
import AdminPanel from './components/AdminPanel';
import VacanciesPanel from './components/VacanciesPanel';

import { Candidate, InterviewSlot, WorkflowStage, UserRole, Vacancy } from './types';
import { 
  INITIAL_STAGES, 
  INITIAL_CANDIDATES, 
  INITIAL_INTERVIEWS,
  INITIAL_VACANCIES
} from './data/samples';

export default function App() {
  // Shared States
  const [candidates, setCandidates] = useState<Candidate[]>(INITIAL_CANDIDATES);
  const [vacancies, setVacancies] = useState<Vacancy[]>(INITIAL_VACANCIES);
  const [interviews, setInterviews] = useState<InterviewSlot[]>(INITIAL_INTERVIEWS);
  const [stages, setStages] = useState<WorkflowStage[]>(INITIAL_STAGES);
  
  // Navigation & Permissions
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [activeRole, setActiveRole] = useState<UserRole>('RECRUITER');
  const [userEmail] = useState<string>('eaguilarh@gmail.com');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  
  // Dynamic intake trigger to pass a candidate from Candidate Screen direct to Calendar Scheduler
  const [schedulerIntake, setSchedulerIntake] = useState<Candidate | null>(null);

  // Server health state check
  const [serverOnline, setServerOnline] = useState<boolean>(true);
  const [geminiConfigured, setGeminiConfigured] = useState<boolean>(false);

  // Fetch server health on mount to verify fullstack route connection
  useEffect(() => {
    async function checkHealth() {
      try {
        const response = await fetch('/api/health');
        if (response.ok) {
          const data = await response.json();
          setServerOnline(data.status === 'ok');
          setGeminiConfigured(data.apiConfigured);
        } else {
          setServerOnline(false);
        }
      } catch (err) {
        console.warn("Connection to custom server health lost, falling back to simulated states.", err);
        setServerOnline(false);
      }
    }
    checkHealth();
  }, []);

  // Pass Candidate direct to scheduling tab
  const handlePassToScheduler = (candidate: Candidate) => {
    setSchedulerIntake(candidate);
    setActiveTab('calendar');
  };

  return (
    <div className="flex bg-slate-50 min-h-screen text-slate-700 w-full font-sans antialiased">
      
      {/* Lateral navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeRole={activeRole}
        setActiveRole={setActiveRole}
        userEmail={userEmail}
        isCollapsed={sidebarCollapsed}
        setIsCollapsed={setSidebarCollapsed}
      />

      {/* Main Container */}
      <main className="flex-1 flex flex-col min-w-0 overflow-x-hidden min-h-screen">
        
        {/* Dynamic Top Administration Banner */}
        <header className="bg-white border-b border-slate-200 px-8 py-5 flex justify-between items-center shrink-0 no-print">
          <div className="flex items-center gap-3">
            <div className="space-y-1">
              <span className={`text-[10px] font-mono font-bold tracking-widest uppercase px-2 py-0.5 rounded-md ${
                activeRole === 'ADMIN' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50' : 
                activeRole === 'RECRUITER' ? 'bg-eas-blue-50 text-eas-blue-800 border border-eas-blue-200/50' : 
                'bg-purple-50 text-purple-700 border border-purple-200/50'
              }`}>
                {activeRole === 'ADMIN' ? 'Sistemas Centrales' : 'Capital Humano'}
              </span>
              <h2 className="text-base font-bold text-slate-950 leading-none">
                {activeRole === 'ADMIN' && 'Gobernanza Administrativa y Plantillas'}
                {activeRole === 'RECRUITER' && 'Consola del Consultor de Selección'}
                {activeRole === 'MANAGER' && 'Dashboard Directivo de Evaluaciones'}
              </h2>
            </div>
          </div>

          {/* Network Connection status indicators */}
          <div className="flex items-center gap-3 text-xs font-semibold select-none">
            
            {/* Server connection */}
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs ${
              serverOnline 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              <Wifi className={`h-3.5 w-3.5 ${serverOnline ? 'text-emerald-500' : 'text-amber-500 animate-pulse'}`} />
              <span>{serverOnline ? 'EAS-Hub Online' : 'Local Sandbox Mode'}</span>
            </div>

            {/* Gemini API configuration state */}
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs ${
              geminiConfigured 
                ? 'bg-eas-blue-50 text-eas-blue-800 border-eas-blue-200' 
                : 'bg-slate-50 text-slate-600 border-slate-200'
            }`}>
              <Sparkles className={`h-3.5 w-3.5 ${geminiConfigured ? 'text-eas-red-500' : 'text-slate-400'}`} />
              <span>{geminiConfigured ? 'Gemini Activo' : 'EAS AI Simulation'}</span>
            </div>

            {/* Privacy Law GDPR stamp */}
            <div className="hidden md:inline-flex items-center gap-1.5 text-slate-500 px-3 py-1 border border-slate-200 rounded-full bg-slate-50/50">
              <Lock className="h-3.5 w-3.5 text-slate-400" />
              <span>Certificado LFPDPPP</span>
            </div>
          </div>
        </header>

        {/* Content canvas with elegant transition layouts */}
        <div className="flex-1 p-8 overflow-y-auto w-full max-w-7xl mx-auto space-y-6">
          
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="w-full"
          >
            {/* Tab routing container */}
            {activeTab === 'dashboard' && (
              <DashboardPanel 
                candidates={candidates}
                interviews={interviews}
                activeRole={activeRole}
              />
            )}

            {activeTab === 'vacancies' && (
              <VacanciesPanel 
                vacancies={vacancies}
                setVacancies={setVacancies}
                candidates={candidates}
                activeRole={activeRole}
              />
            )}

            {activeTab === 'candidates' && (
              <CandidatePanel 
                candidates={candidates}
                setCandidates={setCandidates}
                vacancies={vacancies}
                stages={stages}
                setStages={setStages}
                activeRole={activeRole}
                onAutoSchedule={handlePassToScheduler}
              />
            )}

            {activeTab === 'calendar' && (
              <CalendarPanel 
                interviews={interviews}
                setInterviews={setInterviews}
                candidates={candidates}
                activeRole={activeRole}
                schedulerIntake={schedulerIntake}
                setSchedulerIntake={setSchedulerIntake}
              />
            )}

            {activeTab === 'governance' && (
              <AdminPanel section="governance" />
            )}

            {activeTab === 'integrations' && (
              <AdminPanel section="integrations" />
            )}

          </motion.div>

        </div>

      </main>
    </div>
  );
}
