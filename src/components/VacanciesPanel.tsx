import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  DollarSign, 
  Plus, 
  Trash2, 
  Users, 
  ChevronRight, 
  CheckCircle,
  AlertCircle,
  FileCheck,
  ShieldAlert,
  Sparkles,
  Mail,
  Copy,
  X
} from 'lucide-react';
import { Vacancy, Candidate, UserRole } from '../types';

interface VacanciesPanelProps {
  vacancies: Vacancy[];
  setVacancies: React.Dispatch<React.SetStateAction<Vacancy[]>>;
  candidates: Candidate[];
  activeRole: UserRole;
}

export default function VacanciesPanel({ 
  vacancies, 
  setVacancies, 
  candidates, 
  activeRole 
}: VacanciesPanelProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [selectedVacancyId, setSelectedVacancyId] = useState<string | null>(null);
  
  // Email Template Modal States
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [generatedEmailBody, setGeneratedEmailBody] = useState('');
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  const handleGenerateEmailTemplate = (vacancy: Vacancy, vacancyCandidates: Candidate[]) => {
    let email = `Estimado Líder Solicitante,\n\n`;
    email += `Espero que se encuentre muy bien. A continuación, presento la propuesta de candidatos recomendados para la vacante de "${vacancy.title}" (Departamento de ${vacancy.department}), evaluados por nuestro sistema inteligente de competencias en EAS Consulting:\n\n`;

    vacancyCandidates.forEach((cand, index) => {
      email += `${index + 1}. CANDIDATO: ${cand.name}\n`;
      email += `   - Ajuste al puesto: ${cand.fitScore}%\n`;
      email += `   - Resumen Ejecutivo: ${cand.summary || 'Perfil idóneo precalificado por competencias.'}\n`;
      email += `   - Fortalezas Clave:\n`;
      if (cand.strengths && cand.strengths.length > 0) {
        cand.strengths.slice(0, 3).forEach(str => {
          email += `     • ${str}\n`;
        });
      } else {
        email += `     • Alta orientación al logro y competencias técnicas sólidas.\n`;
      }
      email += `   - Áreas de Oportunidad:\n`;
      if (cand.growths && cand.growths.length > 0) {
        cand.growths.slice(0, 2).forEach(gro => {
          email += `     • ${gro}\n`;
        });
      } else {
        email += `     • Adaptación progresiva al ritmo acelerado de la organización.\n`;
      }
      email += `\n`;
    });

    email += `Quedo a su entera disposición para agendar las entrevistas con los candidatos de su agrado. ¿Cuál de ellos considera adecuado para avanzar a la siguiente fase?\n\n`;
    email += `Atentamente,\n`;
    email += `Equipo de Atracción de Capital Humano\n`;
    email += `EAS Consulting`;

    setGeneratedEmailBody(email);
    setShowEmailModal(true);
    setCopiedSuccess(false);
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(generatedEmailBody);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2000);
  };

  // Form States

  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Atracción de Talento');
  const [location, setLocation] = useState('CDMX - Híbrido');
  const [description, setDescription] = useState('');
  const [requirementsInput, setRequirementsInput] = useState('');
  const [experienceYears, setExperienceYears] = useState(3);
  const [salaryRange, setSalaryRange] = useState('');
  const [englishLevel, setEnglishLevel] = useState<'Básico' | 'Medio' | 'Avanzado'>('Avanzado');
  const [modalidad, setModalidad] = useState<'Presencial' | 'Remoto' | 'Híbrido'>('Híbrido');
  
  // Competency targets states
  const [minLid, setMinLid] = useState(70);
  const [minCom, setMinCom] = useState(70);
  const [minTrab, setMinTrab] = useState(70);
  const [minTec, setMinTec] = useState(70);
  const [minRes, setMinRes] = useState(70);

  const getAssignedCandidates = (vacId: string) => {
    return candidates.filter(cand => cand.vacancyId === vacId);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const requirements = requirementsInput
      .split(',')
      .map(req => req.trim().toLowerCase())
      .filter(req => req.length > 0);

    const newVacancy: Vacancy = {
      id: `vac-${Date.now()}`,
      title,
      department,
      location,
      description,
      requirements: requirements.length > 0 ? requirements : ['general'],
      experienceYears,
      salaryRange: salaryRange.trim() || 'No especificado',
      status: 'Open',
      minCompetenciesRequired: {
        'Liderazgo': minLid,
        'Comunicación': minCom,
        'Trabajo en Equipo': minTrab,
        'Habilidades Técnicas': minTec,
        'Resolución de Problemas': minRes
      },
      englishLevel,
      modalidad
    };

    setVacancies(prev => [newVacancy, ...prev]);
    
    // Reset Form
    setTitle('');
    setDescription('');
    setRequirementsInput('');
    setExperienceYears(3);
    setSalaryRange('');
    setEnglishLevel('Avanzado');
    setModalidad('Híbrido');
    setMinLid(70);
    setMinCom(70);
    setMinTrab(70);
    setMinTec(70);
    setMinRes(70);
    setIsAdding(false);
  };

  const handleDeleteVacancy = (vacId: string, vacTitle: string) => {
    if (confirm(`¿Estás seguro de eliminar la vacante "${vacTitle}"? Los candidatos asignados permanecerán en el sistema sin vacante vinculada.`)) {
      setVacancies(prev => prev.filter(v => v.id !== vacId));
      if (selectedVacancyId === vacId) setSelectedVacancyId(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header and Add button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 font-sans tracking-tight">
            Vacantes Corporativas Publicadas
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Administración analítica de perfiles y emparejamiento inteligente de CVs.
          </p>
        </div>

        {activeRole !== 'MANAGER' && (
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm hover:shadow-md transition duration-150 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Publicar Nueva Vacante
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* LEFT & CENTER COLUMNS: Vacancy card grid (size 2/3) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vacancies.map((vac) => {
              const assigned = getAssignedCandidates(vac.id);
              const isSelected = selectedVacancyId === vac.id;

              return (
                <div
                  key={vac.id}
                  onClick={() => setSelectedVacancyId(isSelected ? null : vac.id)}
                  className={`bg-white border text-left p-5 rounded-2xl cursor-pointer hover:shadow-xs transition duration-150 flex flex-col justify-between h-full relative ${
                    isSelected 
                      ? 'border-indigo-600 ring-2 ring-indigo-500/10' 
                      : 'border-slate-150 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                        {vac.department}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        vac.status === 'Open' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {vac.status === 'Open' ? 'Activa' : 'Cerrada'}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-bold text-slate-850 text-sm leading-tight group-hover:text-indigo-600">
                        {vac.title}
                      </h3>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500 font-medium">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {vac.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {vac.experienceYears}+ años exp
                        </span>
                        {vac.salaryRange && (
                          <span className="flex items-center gap-0.5">
                            <DollarSign className="h-3 w-3" />
                            {vac.salaryRange}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2">
                      {vac.description}
                    </p>

                    {/* Requirements Tags */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {vac.requirements.slice(0, 4).map((req, idx) => (
                        <span key={idx} className="bg-indigo-50 text-indigo-700 text-[10px] px-2 py-0.5 rounded-md font-semibold">
                          {req}
                        </span>
                      ))}
                      {vac.requirements.length > 4 && (
                        <span className="bg-slate-100 text-slate-500 text-[10px] px-1.5 py-0.5 rounded-md">
                          +{vac.requirements.length - 4} más
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700">
                      <Users className="h-3.5 w-3.5 text-slate-400" />
                      <span>{assigned.length} Candidato{assigned.length !== 1 ? 's' : ''}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {activeRole !== 'MANAGER' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteVacancy(vac.id, vac.title);
                          }}
                          className="p-1.5 hover:bg-rose-50 rounded-lg text-rose-500 hover:text-rose-700 transition"
                          title="Eliminar Vacante"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <ChevronRight className={`h-4 w-4 text-slate-400 transition-transform ${isSelected ? 'rotate-90 text-indigo-600' : ''}`} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Detail / Assigned Candidates List (size 1/3) */}
        <div className="space-y-4">
          {selectedVacancyId ? (
            (() => {
              const selectedVac = vacancies.find(v => v.id === selectedVacancyId);
              if (!selectedVac) return null;
              const assigned = getAssignedCandidates(selectedVacancyId);

              return (
                <div className="bg-white border border-slate-150 rounded-2xl p-5 space-y-5 text-left">
                  <div className="space-y-2 border-b border-slate-100 pb-4">
                    <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-wider block">Inspección de Vacante</span>
                    <h3 className="text-base font-bold text-slate-900 leading-tight">
                      {selectedVac.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                      {selectedVac.description}
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider border border-indigo-100">
                        {selectedVac.modalidad || 'Híbrido'}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[10px] font-bold uppercase tracking-wider border border-amber-100">
                        Inglés: {selectedVac.englishLevel || 'Avanzado'}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider border border-emerald-100">
                        Sueldo: {selectedVac.salaryRange || 'Tope SR'}
                      </span>
                    </div>
                  </div>

                  {/* Competency thresholds targets */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Ubrales Esperados (IA Pre-calificación)</span>
                    <div className="grid grid-cols-1 gap-2 font-semibold text-xs">
                      {Object.entries(selectedVac.minCompetenciesRequired).map(([compName, val]) => (
                        <div key={compName} className="space-y-1">
                          <div className="flex justify-between items-center text-slate-600 text-[11px]">
                            <span>{compName}</span>
                            <span>Min: {val}/100</span>
                          </div>
                          <div className="w-full h-1 bg-slate-100 rounded-full">
                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${val}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Requirements List */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Palabras Clave Críticas</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedVac.requirements.map((req, idx) => (
                        <span key={idx} className="bg-slate-50 border border-slate-200 text-slate-700 text-xs px-2.5 py-1 rounded-lg font-bold">
                          {req}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Assigned Candidates list inside the vacancy */}
                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Talentos Vinculados ({assigned.length})</span>
                      {assigned.length > 0 && (
                        <button
                          onClick={() => handleGenerateEmailTemplate(selectedVac, assigned)}
                          className="flex items-center gap-1 px-2.5 py-1 bg-indigo-50 border border-indigo-150 text-indigo-700 hover:bg-indigo-100/70 transition rounded-lg text-[10px] font-bold cursor-pointer"
                        >
                          <Mail className="h-3.5 w-3.5 text-indigo-650" />
                          Generar Correo
                        </button>
                      )}
                    </div>


                    {assigned.length > 0 ? (
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {assigned.map((cand) => (
                          <div 
                            key={cand.id}
                            className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between hover:border-indigo-200 transition"
                          >
                            <div className="space-y-0.5 text-xs">
                              <h4 className="font-bold text-slate-900 leading-tight block">{cand.name}</h4>
                              <p className="text-[10px] text-slate-500 block leading-tight font-medium">Clasificación: <strong className="text-slate-700 font-bold">{cand.stage}</strong></p>
                            </div>
                            <div className="px-2 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100 text-right shrink-0">
                              <span className="text-xs font-black block">{cand.fitScore}%</span>
                              <span className="text-[8px] block tracking-wide uppercase font-black text-[8px]">Ajuste</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-4 text-center rounded-xl border border-dashed border-slate-200">
                        <AlertCircle className="h-5 w-5 text-slate-400 mx-auto mb-1.5" />
                        <p className="text-xs text-slate-500">Ningún candidato asignado a esta vacante.</p>
                        <p className="text-[10px] text-slate-400">Vincula talentos desde el Pipeline.</p>
                      </div>
                    )}
                  </div>

                </div>
              );
            })()
          ) : (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center text-slate-500">
              <Sparkles className="h-7 w-7 text-indigo-500 mx-auto mb-2 animate-pulse" />
              <h3 className="text-xs font-bold text-slate-700">Analizador Inteligente</h3>
              <p className="text-[11px] text-slate-400 leading-normal max-w-xs mx-auto mt-1">
                Selecciona una vacante corporativa a la izquierda para inspeccionar requerimientos clave, umbrales de pre-selección u observar los candidatos asignados por inteligencia de coincidencia.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* MODAL WINDOW: Add Vacancy */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 text-left">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-xl relative overflow-hidden"
            >
              <div className="pb-4 border-b border-slate-100 mb-5">
                <h3 className="text-base font-bold text-slate-900">
                  Publicar Vacante Corporativa
                </h3>
                <p className="text-xs text-slate-500 font-medium">Define los requerimientos básicos que usará el motor de precalificación de EAS Engine AI™.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 col-span-1 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700">Título del Puesto</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Líder de Selección en Atracción de Talento"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Área / Departamento</label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white transition"
                    >
                      <option value="Atracción de Talento">Atracción de Talento</option>
                      <option value="EAS Tech Lab">EAS Tech Lab</option>
                      <option value="Inteligencia de Negocio">Inteligencia de Negocio</option>
                      <option value="Oficina de Proyectos (PMO)">Oficina de Proyectos (PMO)</option>
                      <option value="Consultoría Organizacional">Consultoría Organizacional</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Región / Ubicación</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. CDMX - Presencial"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Experiencia Mínima (Años)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Oferta Salarial Mensual (Opcional)</label>
                    <input
                      type="text"
                      placeholder="Ej. $40,000 MXN Neto"
                      value={salaryRange}
                      onChange={(e) => setSalaryRange(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Nivel de Inglés (Requisito SR)</label>
                    <select
                      value={englishLevel}
                      onChange={(e) => setEnglishLevel(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white transition"
                    >
                      <option value="Básico">Básico</option>
                      <option value="Medio">Medio</option>
                      <option value="Avanzado">Avanzado</option>
                    </select>
                  </div>

                  <div className="space-y-1.5 col-span-1 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700">Modalidad de Trabajo (Requisito SR)</label>
                    <select
                      value={modalidad}
                      onChange={(e) => setModalidad(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white transition"
                    >
                      <option value="Presencial">Presencial</option>
                      <option value="Remoto">Remoto</option>
                      <option value="Híbrido">Híbrido</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Descripción Breve de la Vacante</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Describe las responsabilidades centrales del puesto de forma atractiva..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white transition resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-700">Habilidades Clave Exigidas (Separadas por comas)</label>
                    <span className="text-[10px] text-slate-400 font-bold">Crítico para EAS Match Engine™</span>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Ejemp: react, typescript, tailwind, frontend, css"
                    value={requirementsInput}
                    onChange={(e) => setRequirementsInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white transition"
                  />
                </div>

                {/* Expected Thresholds setup */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">Umbrales de Competencias Mínimas (1-100)</span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex justify-between font-bold text-slate-600">
                        <span>Liderazgo</span>
                        <span>{minLid}</span>
                      </div>
                      <input type="range" min="10" max="100" value={minLid} onChange={e => setMinLid(Number(e.target.value))} className="w-full accent-indigo-600" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between font-bold text-slate-600">
                        <span>Comunicación</span>
                        <span>{minCom}</span>
                      </div>
                      <input type="range" min="10" max="100" value={minCom} onChange={e => setMinCom(Number(e.target.value))} className="w-full accent-indigo-600" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between font-bold text-slate-600">
                        <span>Trabajo en Equipo</span>
                        <span>{minTrab}</span>
                      </div>
                      <input type="range" min="10" max="100" value={minTrab} onChange={e => setMinTrab(Number(e.target.value))} className="w-full accent-indigo-600" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between font-bold text-slate-600">
                        <span>Habilidades Técnicas</span>
                        <span>{minTec}</span>
                      </div>
                      <input type="range" min="10" max="100" value={minTec} onChange={e => setMinTec(Number(e.target.value))} className="w-full accent-indigo-600" />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <div className="flex justify-between font-bold text-slate-600">
                        <span>Resolución de Problemas</span>
                        <span>{minRes}</span>
                      </div>
                      <input type="range" min="10" max="100" value={minRes} onChange={e => setMinRes(Number(e.target.value))} className="w-full accent-indigo-600" />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition"
                  >
                    Publicar Vacante
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL WINDOW: Email Template Preview */}
      <AnimatePresence>
        {showEmailModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 text-left animate-fadeIn">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 shadow-xl relative overflow-hidden"
            >
              <div className="pb-4 border-b border-slate-100 mb-5 flex justify-between items-start">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                    <Mail className="h-5 w-5 text-indigo-650" />
                    Propuesta de Candidatos por Correo
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Copia esta plantilla optimizada con resúmenes, fortalezas y áreas de oportunidad.</p>
                </div>
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <textarea
                  readOnly
                  rows={14}
                  value={generatedEmailBody}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[11px] font-mono text-slate-800 focus:outline-none resize-none font-semibold leading-relaxed"
                />

                <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowEmailModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    Cerrar
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyToClipboard}
                    className={`px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      copiedSuccess 
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    {copiedSuccess ? (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        ¡Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copiar Correo
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
