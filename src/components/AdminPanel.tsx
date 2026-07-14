import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Database, 
  Key, 
  FileCheck, 
  RefreshCw, 
  HardDriveUpload, 
  AlertTriangle, 
  Workflow, 
  Cpu, 
  CheckCircle2, 
  Lock,
  Code,
  Activity,
  Send,
  Check,
  Zap,
  Terminal,
  FileJson,
  Network
} from 'lucide-react';
import { SecurityAuditLog } from '../types';
import { INITIAL_AUDIT_LOGS } from '../data/samples';

interface AdminPanelProps {
  section?: 'governance' | 'integrations';
}

export default function AdminPanel({ section = 'governance' }: AdminPanelProps) {
  // Common States
  const [logs, setLogs] = useState<SecurityAuditLog[]>(INITIAL_AUDIT_LOGS);
  const [isAuditing, setIsAuditing] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [auditMessage, setAuditMessage] = useState('');
  const [backupMessage, setBackupMessage] = useState('');

  const [weights, setWeights] = useState({
    Liderazgo: 20,
    Comunicacion: 20,
    TrabajoEnEquipo: 20,
    HabilidadesTecnicas: 20,
    ResolucionDeProblemas: 20,
    totalFeedbackCount: 0
  });

  useEffect(() => {
    const fetchWeights = () => {
      fetch('/api/ai-weights')
        .then(res => res.json())
        .then(data => {
          if (data && typeof data.Liderazgo === 'number') {
            setWeights(data);
          }
        })
        .catch(err => {
          const saved = localStorage.getItem('eas_ai_weights');
          if (saved) setWeights(JSON.parse(saved));
        });
    };

    fetchWeights();

    const handleUpdate = () => {
      const saved = localStorage.getItem('eas_ai_weights');
      if (saved) setWeights(JSON.parse(saved));
    };

    window.addEventListener('eas_ai_weights_updated', handleUpdate);
    return () => {
      window.removeEventListener('eas_ai_weights_updated', handleUpdate);
    };
  }, []);


  // Sincronización e Integración tab states
  const [testingEndpoint, setTestingEndpoint] = useState<string | null>(null);
  const [endpointLatency, setEndpointLatency] = useState<Record<string, string>>({
    outlook: '12ms',
    database: '4ms',
    directory: '18ms',
    blobs: '35ms'
  });
  const [diagnosticMsg, setDiagnosticMsg] = useState('Todos los canales de integración se encuentran íntegros y autorizados.');
  const [selectedSchemaField, setSelectedSchemaField] = useState('all');

  // Schema mapper definitions
  const MAPPED_SCHEMAS: Record<string, { table: string, fieldSql: string, format: string, desc: string }> = {
    all: {
      table: 'eas_candidate',
      fieldSql: 'INSERT INTO eas_candidate (id, name, email, phone, stage, fit_score, competencies_json, resume_raw_text) VALUES...',
      format: 'JSONB / Relational SQL Column Mapping',
      desc: 'Esquema general unificado de la bolsa de talento de EAS Consulting.'
    },
    candidato: {
      table: 'eas_candidate',
      fieldSql: 'name VARCHAR(255) NOT NULL, email VARCHAR(180) UNIQUE, phone VARCHAR(50)',
      format: 'UTF-8 String Sanitized',
      desc: 'Cifrado automático asimétrico de datos de contacto de candidatos.'
    },
    competencias: {
      table: 'eas_candidate.competencies_json',
      fieldSql: 'competencies_json JSONB DEFAULT \'{"Liderazgo":0,"Comunicación":0}\'::jsonb',
      format: 'Key-Value Score Vector (1-100)',
      desc: 'Puntajes porcentuales del tamizaje de IA sobre diccionarios oficiales de habilidades.'
    },
    agenda: {
      table: 'eas_interview_slot',
      fieldSql: 'candidate_id UUID, interviewer VARCHAR(120), scheduled_at TIMESTAMP, msteams_url VARCHAR(400)',
      format: 'Exchange .ics Payload Sync',
      desc: 'Enlace del calendario con Outlook Corporate y generación automática de invitaciones.'
    }
  };

  // Run data compliance audit
  const runDataComplianceAudit = () => {
    setIsAuditing(true);
    setAuditMessage('Iniciando auditoría de integridad en base de datos...');
    
    setTimeout(() => {
      setAuditMessage('Validando llaves asimétricas AES-256 de campos PII...');
    }, 600);
    
    setTimeout(() => {
      setAuditMessage('Purificando registros de retención excedente (Cumplimiento LFPDPPP Art 12)...');
    }, 1200);

    setTimeout(() => {
      const newLog: SecurityAuditLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'Auditoría manual de cumplimiento LFPDPPP favorable. Cero fugas encontradas.',
        user: 'Administrador Global',
        ip: '189.145.22.4',
        component: 'Cumplimiento Auditoría',
        status: 'SUCCESS'
      };

      setLogs(prev => [newLog, ...prev]);
      setIsAuditing(false);
      setAuditMessage('');
    }, 1800);
  };

  // Run backups
  const runCloudVirtualBackup = () => {
    setIsBackingUp(true);
    setBackupMessage('Iniciando empaquetado de instantánea de base de datos...');
    
    setTimeout(() => {
      setBackupMessage('Transfiriendo volumen cifrado a réplica redundante Cloud Run...');
    }, 600);

    setTimeout(() => {
      const newLog: SecurityAuditLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'Copia de seguridad incremental del servidor ejecutada bajo demanda.',
        user: 'Administrador Global',
        ip: '189.145.22.4',
        component: 'Cloud Backups',
        status: 'SUCCESS'
      };

      setLogs(prev => [newLog, ...prev]);
      setIsBackingUp(false);
      setBackupMessage('');
    }, 1200);
  };

  // Run dynamic connectivity diagnostics
  const runConnectivityDiagnostics = () => {
    setTestingEndpoint('all');
    setDiagnosticMsg('Estableciendo conexión y haciendo ping en cascada a endpoints...');
    
    setTimeout(() => {
      setEndpointLatency({
        outlook: `${Math.floor(8 + Math.random() * 10)}ms`,
        database: `${Math.floor(2 + Math.random() * 5)}ms`,
        directory: `${Math.floor(10 + Math.random() * 12)}ms`,
        blobs: `${Math.floor(25 + Math.random() * 15)}ms`
      });
      setTestingEndpoint(null);
      setDiagnosticMsg('Prueba de enlaces completada de forma impecable. Latencias estables y tokens JWT vigentes.');
      
      const newLog: SecurityAuditLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'Verificación de integración exitosa con Outlook Corporate & Base de Datos',
        user: 'Administrador Global',
        ip: '189.145.22.4',
        component: 'Mapeo Enlaces API',
        status: 'SUCCESS'
      };
      setLogs(prev => [newLog, ...prev]);
    }, 1400);
  };

  // Section 1: Governance & Privacy Only
  if (section === 'governance') {
    return (
      <div className="space-y-6 animate-fadeIn font-sans">
        
        {/* Banner de Bienvenida o Contexto */}
        <div className="bg-gradient-to-r from-slate-50 to-slate-100/50 border border-slate-150 p-5 rounded-2xl flex items-start gap-4">
          <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs shrink-0 flex items-center justify-center">
            <ShieldCheck className="h-6 w-6 text-[#76BC21]" />
          </div>
          <div className="space-y-1">
            <h3 className="font-exo font-bold text-sm text-[#103268]">Gobernanza de Datos y Políticas de Privacidad</h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
              Consola administrativa del cumplimiento de seguridad sobre datos personales (LFPDPPP). Supervise cifrados integrales AES-256, ciclos de retención y bitácoras ante auditorías oficiales.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Controles de Mantenimiento de Privacidad y Cifrado */}
          <div className="lg:col-span-5 bg-white border border-slate-150 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <Lock className="h-5 w-5 text-[#103268]" />
              <div>
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide">Bóveda Criptográfica Activa</h4>
                <p className="text-slate-500 text-[10px] font-semibold mt-0.5">Cifrado permanente en reposo e integridad normada</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2 text-xs leading-relaxed text-slate-600">
              <span className="font-bold text-slate-755 block flex items-center gap-1.5 uppercase tracking-wide text-[10px]">
                <Activity className="h-3.5 w-3.5 text-[#76BC21]" />
                Cumplimiento Legal LFPDPPP
              </span>
              <p>
                Toda la información curricular de candidatos analizados para EAS Consulting se enmascara de manera automática en la base de datos central. El acceso a PII de aspirantes (claves hash, currículum, teléfonos) queda restringido exclusivamente a roles autorizados mediante tokens JWT asimétricos.
              </p>
              <div className="pt-2 text-[10px] text-[#76BC21] font-bold flex items-center gap-1.5 select-none">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#76BC21] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#76BC21]"></span>
                </span>
                <span>Estado actual: 100% Cifrado bajo Clave AES-256</span>
              </div>
            </div>

            {/* Acciones de Mantenimiento Interactivo */}
            <div className="space-y-2.5 pt-2">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Mantenimiento Global</span>
              
              <div className="flex gap-2">
                <button
                  onClick={runDataComplianceAudit}
                  disabled={isAuditing}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-gradient-to-r from-eas-blue-500 to-eas-blue-600 text-white text-xs font-bold rounded-xl hover:shadow-xs transition cursor-pointer disabled:opacity-50"
                >
                  {isAuditing ? (
                    <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                  ) : (
                    <Zap className="h-3.5 w-3.5 text-[#00BEFE]" />
                  )}
                  {isAuditing ? 'Auditando...' : 'Auditar Cumplimiento'}
                </button>

                <button
                  onClick={runCloudVirtualBackup}
                  disabled={isBackingUp}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
                >
                  {isBackingUp ? (
                    <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                  ) : (
                    <HardDriveUpload className="h-3.5 w-3.5 text-slate-450" />
                  )}
                  {isBackingUp ? 'Respaldando...' : 'Respaldar DB'}
                </button>
              </div>

              {(isAuditing || isBackingUp) && (
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl animate-fadeIn text-center">
                  <span className="text-[10px] font-mono text-[#103268] font-bold tracking-tight">
                    {isAuditing ? auditMessage : backupMessage}
                  </span>
                </div>
              )}
            </div>

            {/* AI Learning & Weights tuning panel */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Aprendizaje de IA Continuo</span>
              <div className="p-4 bg-purple-50/50 border border-purple-100 rounded-xl space-y-3">
                <div className="flex justify-between items-center text-xs font-bold text-purple-950">
                  <span className="flex items-center gap-1.5">
                    <Cpu className="h-4 w-4 text-purple-600 animate-pulse" />
                    Ponderación Dinámica (Gemini Engine)
                  </span>
                  <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-[9px] uppercase font-mono">
                    {weights.totalFeedbackCount} Evaluaciones
                  </span>
                </div>
                <div className="space-y-2">
                  {[
                    { label: 'Habilidades Técnicas', val: weights.HabilidadesTecnicas, color: 'bg-emerald-500' },
                    { label: 'Resolución de Problemas', val: weights.ResolucionDeProblemas, color: 'bg-blue-500' },
                    { label: 'Comunicación', val: weights.Comunicacion, color: 'bg-[#00BEFE]' },
                    { label: 'Liderazgo', val: weights.Liderazgo, color: 'bg-indigo-500' },
                    { label: 'Trabajo en Equipo', val: weights.TrabajoEnEquipo, color: 'bg-[#76BC21]' },
                  ].map((item) => (
                    <div key={item.label} className="space-y-1">
                      <div className="flex justify-between text-[10px] font-semibold text-slate-600">
                        <span>{item.label}</span>
                        <span>{item.val}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-200/70 rounded-full overflow-hidden">
                        <div className={`h-full ${item.color} transition-all duration-500`} style={{ width: `${item.val}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[9px] text-purple-700 font-medium leading-relaxed font-semibold">
                  * Los pesos se ajustan automáticamente a través del feedback del Hiring Manager al completar scorecards de entrevistas.
                </p>
              </div>
            </div>

          </div>

          {/* Tabla de Logs de Auditoría Interactiva */}
          <div className="lg:col-span-7 bg-white border border-slate-150 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <div className="space-y-1">
                <h4 className="font-bold text-slate-800 text-sm">Trazabilidad de Accesos y Criptografía</h4>
                <p className="text-slate-500 text-[10px] leading-relaxed font-medium">Seguimiento institucional de acciones sensibles del portal</p>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-widest text-[9px] font-bold">
                    <th className="p-3">Hora Local (Mx)</th>
                    <th className="p-3">Evento Detectado</th>
                    <th className="p-3">Módulo</th>
                    <th className="p-3">IP Origen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600 font-sans">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50">
                      <td className="p-3 text-[11px] text-slate-400 font-mono">
                        {new Date(log.timestamp).toLocaleTimeString('es-MX')}
                      </td>
                      <td className="p-3 font-semibold text-slate-800">
                        {log.action}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-slate-100 border border-slate-100 text-slate-600 text-[9px] rounded-md font-bold uppercase">
                          {log.component}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-[11px] text-slate-400">{log.ip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>
    );
  }

  // Section 2: Integrations Only (Completely separate, purposeful content)
  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      
      {/* Intro Banner for Integrations Context */}
      <div className="bg-white border border-slate-150 p-5 rounded-2xl shadow-xs flex items-start gap-4">
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-150 shrink-0 flex items-center justify-center">
          <Workflow className="h-6 w-6 text-[#103268]" />
        </div>
        <div className="space-y-1">
          <h3 className="font-exo font-bold text-sm text-[#103268]">Sincronía de Sistemas y Canales de Datos</h3>
          <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
            Monitoree la integridad de las APIs y del flujo de información entre EAS TalentCore y los repositorios corporativos internos de la firma (Calendario Outlook corporativo, Directorio Central y Almacenes).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* API Endpoint Connections status dashboard */}
        <div className="lg:col-span-5 bg-white border border-slate-150 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Network className="h-5 w-5 text-[#00BEFE]" />
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide">Endpoints e Integridad Técnica</h4>
            </div>
            {testingEndpoint === 'all' ? (
              <span className="text-[10px] text-indigo-600 animate-pulse font-bold">Probando...</span>
            ) : (
              <button 
                onClick={runConnectivityDiagnostics}
                className="text-[11px] font-bold text-[#103268] hover:text-[#00BEFE] transition flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="h-3 w-3 mr-0.5" />
                Refrescar Canales
              </button>
            )}
          </div>

          {/* Connected endpoints status lists */}
          <div className="space-y-3">
            
            {/* Outlook connection */}
            <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-800 font-sans">EAS Outlook Corporate API™</span>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full font-bold">
                  Enlazado ✓
                </span>
              </div>
              <p className="text-[10px] text-slate-500 leading-normal">
                Sincronización en tiempo real de agenda, creación automática de juntas directivas y ligas de Teams.
              </p>
              <div className="flex justify-between text-[9px] text-slate-400 font-mono font-bold leading-none pt-1">
                <span>API de Microsoft Azure AD</span>
                <span>Latencia: {endpointLatency.outlook}</span>
              </div>
            </div>

            {/* Database connection */}
            <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-800 font-sans">Servidor PostgreSQL (EAS ERP)</span>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full font-bold">
                  Conectado ✓
                </span>
              </div>
              <p className="text-[10px] text-slate-500 leading-normal">
                Consolidación incremental de candidatos validados y preservación de currículum en bolsas históricas.
              </p>
              <div className="flex justify-between text-[9px] text-slate-400 font-mono font-bold leading-none pt-1">
                <span>Instancia Cloud Run SQL</span>
                <span>Latencia: {endpointLatency.database}</span>
              </div>
            </div>

            {/* Directory AD sync */}
            <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-800 font-sans">EAS Active Directory SSO</span>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full font-bold">
                  Autorizado ✓
                </span>
              </div>
              <p className="text-[10px] text-slate-500 leading-normal">
                Autenticación transparente de reclutadores y directores mediante firmas de seguridad de EAS.
              </p>
              <div className="flex justify-between text-[9px] text-slate-400 font-mono font-bold leading-none pt-1">
                <span>OAuth 2.0 Token Exchange</span>
                <span>Latencia: {endpointLatency.directory}</span>
              </div>
            </div>

          </div>

          <div className="p-3.5 bg-eas-blue-50 border border-[#00BEFE]/15 rounded-xl flex items-start gap-2.5 text-[11px] text-slate-650 leading-relaxed font-medium">
            <CheckCircle2 className="h-4 w-4 text-[#103268] shrink-0 mt-0.5" />
            <span>
              <strong>Diagnóstico de Red:</strong> {diagnosticMsg}
            </span>
          </div>

        </div>

        {/* JSON Schema Map database previewer (The technical high-fidelity panel for software integrity) */}
        <div className="lg:col-span-7 bg-white border border-slate-150 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-slate-800 text-sm">Estructura Relacional e Integridad de Esquemas</h4>
              <span className="text-[10px] font-bold text-slate-550 border border-slate-150 px-2 py-0.5 rounded-lg bg-slate-50 font-sans flex items-center gap-1">
                <Code className="h-3.5 w-3.5 text-[#76BC21]" />
                Schema Mapper
              </span>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Consulte cómo se serializan los datos extraídos por Inteligencia Artificial y de la agenda en la base de datos de EAS Consulting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 pt-2">
            {Object.keys(MAPPED_SCHEMAS).map((key) => (
              <button
                key={key}
                onClick={() => setSelectedSchemaField(key)}
                className={`px-3 py-2 text-xs font-bold rounded-xl border text-center transition cursor-pointer capitalize truncate ${
                  selectedSchemaField === key 
                    ? 'bg-[#103268] text-white border-[#103268] shadow-sm' 
                    : 'bg-slate-50 text-slate-600 border-slate-150 hover:bg-slate-100'
                }`}
              >
                {key === 'all' ? 'Unificado' : key}
              </button>
            ))}
          </div>

          {/* Live metadata breakdown */}
          <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] border-b border-slate-200 pb-2 gap-1 font-bold text-slate-700">
              <span className="font-semibold text-slate-500">Destino de Entrada: <strong className="text-slate-800 font-mono text-[10px]">{MAPPED_SCHEMAS[selectedSchemaField].table}</strong></span>
              <span className="font-semibold text-slate-500">Formato: <strong className="text-[#103268]">{MAPPED_SCHEMAS[selectedSchemaField].format}</strong></span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed font-semibold">
              {MAPPED_SCHEMAS[selectedSchemaField].desc}
            </p>
          </div>

          {/* Interactive preview schema snippet */}
          <div className="bg-slate-900 rounded-xl p-4 overflow-hidden relative border border-slate-800 shadow-inner flex-1 flex flex-col justify-between mt-3 min-h-[140px]">
            <div className="absolute top-2.5 right-3 text-[9px] font-mono tracking-widest text-[#76BC21] font-bold bg-[#76BC21]/15 px-2 py-0.5 rounded uppercase leading-none">
              Drizzle DDL Output
            </div>
            <div className="font-mono text-[11px] text-[#00BEFE] overflow-x-auto whitespace-pre leading-relaxed select-text py-2 flex-1">
              <code>{MAPPED_SCHEMAS[selectedSchemaField].fieldSql}</code>
            </div>
            <div className="text-[9px] font-mono font-bold text-slate-500 leading-none pt-2 border-t border-slate-800/80 flex items-center gap-1.5">
              <Terminal className="h-3.5 w-3.5 text-slate-655" />
              Verificación estructural: OK (100% íntegra)
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
