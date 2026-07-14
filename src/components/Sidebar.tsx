import React from 'react';
import { 
  Users, 
  LayoutDashboard, 
  Calendar, 
  ShieldCheck, 
  Database, 
  Settings, 
  LogOut, 
  Sparkles,
  ChevronDown,
  UserCheck,
  PanelLeftClose,
  PanelLeftOpen,
  Lock,
  Briefcase
} from 'lucide-react';
import { UserRole } from '../types';
import { EasLogo } from './EasLogo';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  userEmail: string;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  activeRole, 
  setActiveRole,
  userEmail,
  isCollapsed,
  setIsCollapsed
}: SidebarProps) {
  
  const menuItems = [
    { 
      id: 'dashboard', 
      label: 'Tablero de Control', 
      icon: LayoutDashboard,
      allowedRoles: ['ADMIN', 'RECRUITER', 'MANAGER']
    },
    { 
      id: 'vacancies', 
      label: 'Vacantes Activas', 
      icon: Briefcase,
      allowedRoles: ['ADMIN', 'RECRUITER', 'MANAGER']
    },
    { 
      id: 'candidates', 
      label: 'Pipeline de Talento', 
      icon: Users,
      allowedRoles: ['ADMIN', 'RECRUITER', 'MANAGER']
    },
    { 
      id: 'calendar', 
      label: 'Agenda Corporativa', 
      icon: Calendar,
      allowedRoles: ['ADMIN', 'RECRUITER', 'MANAGER']
    },
    { 
      id: 'governance', 
      label: 'Gobernanza y Privacidad', 
      icon: ShieldCheck,
      allowedRoles: ['ADMIN', 'RECRUITER']
    },
    { 
      id: 'integrations', 
      label: 'Integración e Integridad', 
      icon: Database,
      allowedRoles: ['ADMIN']
    }
  ];
  // Map roles to gorgeous high-contrast badges for improved readability!
  const roleBadges: Record<UserRole, { label: string, color: string, ring: string }> = {
    ADMIN: { label: 'Administrador Global', color: 'bg-emerald-50 text-[#0f5132] border-[#a3cfbb]', ring: 'ring-emerald-500/10' },
    RECRUITER: { label: 'Consultor Reclutamiento', color: 'bg-eas-blue-50 text-[#103268] border-eas-blue-200', ring: 'ring-eas-blue-500/10' },
    MANAGER: { label: 'Hiring Manager (Área)', color: 'bg-purple-50 text-[#410c6a] border-purple-200', ring: 'ring-purple-500/10' }
  };

  return (
    <aside className={`${isCollapsed ? 'w-20' : 'w-72'} bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 shrink-0 select-none text-slate-700 shadow-xs transition-all duration-300 ease-in-out`}>
      {/* Brand Header */}
      <div className={`border-b border-slate-100 ${isCollapsed ? 'p-4 flex flex-col items-center justify-center' : 'p-6'}`}>
        <div className={`flex items-center ${isCollapsed ? 'flex-col gap-4' : 'justify-between w-full'}`}>
          <EasLogo 
            showText={!isCollapsed} 
            className="h-11" 
            iconClassName="h-11 w-11 shrink-0" 
            textClassName="text-[#103268]" 
          />
          
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`p-1.5 text-slate-400 hover:text-eas-blue-500 hover:bg-slate-50 border border-slate-200 rounded-xl transition-all duration-150 cursor-pointer ${isCollapsed ? 'mt-1' : ''}`}
            title={isCollapsed ? "Expandir menú de navegación" : "Contraer menú de navegación"}
          >
            {isCollapsed ? <PanelLeftOpen className="h-4.5 w-4.5" /> : <PanelLeftClose className="h-4.5 w-4.5" />}
          </button>
        </div>
        
        {/* EAS AI Banner - Under elegant light palette, hidden when collapsed */}
        {!isCollapsed && (
          <div className="mt-4 p-2 rounded-xl bg-gradient-to-r from-eas-blue-50 to-eas-blue-100/30 border border-eas-blue-100/80 flex items-center gap-2 animate-fadeIn">
            <Sparkles className="h-4 w-4 text-[#76BC21] animate-pulse shrink-0" strokeWidth={2.5} />
            <span className="text-[11px] font-extrabold text-[#103268] font-sans">EAS TalentCore AI™</span>
          </div>
        )}
      </div>

      {/* Navigation section */}
      <nav className={`flex-1 space-y-1.5 overflow-y-auto ${isCollapsed ? 'p-2 flex flex-col items-center' : 'p-4'}`}>
        {!isCollapsed && (
          <div className="px-3 mb-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">
            Menú de Herramientas
          </div>
        )}
        
        {menuItems.map((item) => {
          const isAllowed = item.allowedRoles.includes(activeRole);
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          if (!isAllowed) return null;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center rounded-xl text-sm font-bold transition-all duration-150 cursor-pointer ${
                isCollapsed 
                  ? 'justify-center p-3 w-12 h-12' 
                  : 'w-full gap-3 px-3.5 py-2.5'
              } ${
                isActive 
                  ? 'bg-eas-red-500 text-white shadow-md shadow-eas-red-500/20 border border-eas-red-600/10' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-eas-blue-500'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className={`h-4.5 w-4.5 shrink-0 transition-colors duration-150 ${isActive ? 'text-white' : 'text-slate-405'}`} />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
              {!isCollapsed && isActive && (
                <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Role Manager Toggle Panel */}
      <div className={`border-t border-slate-100 bg-slate-50/50 ${isCollapsed ? 'p-2 flex flex-col items-center gap-4' : 'p-4 space-y-3'}`}>
        
        {/* Dynamic drop-down / avatar representation */}
        {!isCollapsed ? (
          <div className="space-y-1 animate-fadeIn">
            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block px-1 leading-none">
              Perspectiva Multi-Rol
            </span>
            <div className="relative group">
              <select
                value={activeRole}
                onChange={(e) => {
                  const newRole = e.target.value as UserRole;
                  setActiveRole(newRole);
                  // Reset tab if the active tab is not allowed for the new role
                  const allowedTabs = menuItems
                    .filter(m => m.allowedRoles.includes(newRole))
                    .map(m => m.id);
                  if (!allowedTabs.includes(activeTab)) {
                    setActiveTab('dashboard');
                  }
                }}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 shadow-xs focus:outline-none focus:ring-2 focus:ring-eas-red-500/15 focus:border-eas-red-500 cursor-pointer appearance-none pr-9 transition-all duration-150 font-sans"
              >
                <option value="ADMIN">Administrador (TI & Config)</option>
                <option value="RECRUITER">Reclutador Especialista</option>
                <option value="MANAGER">Gerente Directivo (Hiring)</option>
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
          </div>
        ) : (
          /* Small compact selector icon mapping */
          <div className="relative group" title={`Rol activo: ${roleBadges[activeRole].label}. Modifica este rol expandiendo el menú de navegación.`}>
            <div className="h-10 w-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center cursor-help">
              <Settings className="h-4.5 w-4.5 text-indigo-600 animate-pulse" />
            </div>
          </div>
        )}

        {/* User Identity Info */}
        <div 
          className={`bg-white border rounded-xl flex items-center shadow-2xs ${
            isCollapsed 
              ? 'p-2 justify-center w-12 h-12 border-slate-100' 
              : 'p-3 gap-3 border-slate-150'
          }`}
          title={isCollapsed ? `${userEmail} - ${roleBadges[activeRole].label}` : undefined}
        >
          <div className="h-8 w-8 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center shrink-0">
            <UserCheck className="h-4 text-[#103268]" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0 flex-1 animate-fadeIn">
              <div className="truncate text-xs font-bold text-slate-800" title={userEmail}>
                {userEmail}
              </div>
              <div className={`mt-0.5 inline-flex items-center text-[9px] font-extrabold px-1.5 py-0.5 rounded-full border ${roleBadges[activeRole].color}`}>
                {roleBadges[activeRole].label}
              </div>
            </div>
          )}
        </div>

        {/* Security / Compliance seal */}
        {!isCollapsed ? (
          <div className="text-[10px] text-slate-400 font-bold text-center space-y-0.5 pt-1 uppercase tracking-wider leading-none animate-fadeIn">
            <span className="block text-[8px]">Cumplimiento LFPDPPP Art 12</span>
            <span className="block text-[8px] text-[#76BC21]">Cifrado de PII Activo 🔐</span>
          </div>
        ) : (
          <div 
            className="text-center cursor-help py-1" 
            title="Cumplimiento reglamento LFPDPPP Artículo 12: Cifrado y resguardo de datos personales activo 🔐"
          >
            <Lock className="h-4 w-4 text-[#76BC21] mx-auto" />
          </div>
        )}
      </div>
    </aside>
  );
}
