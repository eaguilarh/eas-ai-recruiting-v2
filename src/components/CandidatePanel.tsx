import React, { useState } from 'react';
import { 
  Plus, 
  Sparkles, 
  Filter, 
  Trash2, 
  SlidersHorizontal, 
  Award, 
  MessageSquare, 
  Check, 
  Eye, 
  ChevronRight, 
  ArrowRight,
  TrendingUp,
  Search,
  Shield,
  Briefcase,
  Layers,
  X,
  FileDown,
  Mail,
  Copy
} from 'lucide-react';
import { Candidate, WorkflowStage, Vacancy } from '../types';

interface CandidatePanelProps {
  candidates: Candidate[];
  setCandidates: React.Dispatch<React.SetStateAction<Candidate[]>>;
  vacancies: Vacancy[];
  stages: WorkflowStage[];
  setStages: React.Dispatch<React.SetStateAction<WorkflowStage[]>>;
  activeRole: string;
  onAutoSchedule: (candidate: Candidate) => void;
}

export default function CandidatePanel({ 
  candidates, 
  setCandidates, 
  vacancies,
  stages, 
  setStages,
  activeRole,
  onAutoSchedule
}: CandidatePanelProps) {
  
  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(candidates[0] || null);
  const [isAddingCandidate, setIsAddingCandidate] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState('');
  
  // Vacancy Matching States
  const [selectedFormVacancyId, setSelectedFormVacancyId] = useState<string>('auto');
  const [lastAIResult, setLastAIResult] = useState<Candidate | null>(null);
  const [isRefreshingAI, setIsRefreshingAI] = useState(false);
  
  // Form States
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState('Frontend Developer');
  const [newChannel, setNewChannel] = useState<'LinkedIn' | 'Glassdoor' | 'Referido' | 'EAS Consulting DB' | 'Otros'>('LinkedIn');
  const [newResumeText, setNewResumeText] = useState('');

  // Invitation Modal States
  const [showInvitationModal, setShowInvitationModal] = useState(false);
  const [invitationCandidate, setInvitationCandidate] = useState<Candidate | null>(null);
  const [copiedWa, setCopiedWa] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Match candidate text and title against all published vacancies to find the best vacancy match
  const findBestVacancyMatch = (text: string, titleRole: string) => {
    if (!text || vacancies.length === 0) return { vacancyId: vacancies[0]?.id || '', score: 50 };
    let bestId = vacancies[0].id;
    let maxSc = -1;
    const lowerText = text.toLowerCase();
    const lowerRole = titleRole ? titleRole.toLowerCase() : '';

    for (const vac of vacancies) {
      let score = 55; // baseline

      // Check title keywords
      const titleWords = vac.title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      for (const tWord of titleWords) {
        if (lowerRole.includes(tWord)) {
          score += 20;
        }
      }

      // Check requirements matches
      let reqCount = 0;
      for (const req of vac.requirements) {
        if (lowerText.includes(req.toLowerCase())) {
          reqCount++;
        }
      }
      if (vac.requirements.length > 0) {
        score += Math.round((reqCount / vac.requirements.length) * 20);
      }

      score = Math.min(score, 98);

      if (score > maxSc) {
        maxSc = score;
        bestId = vac.id;
      }
    }
    return { vacancyId: bestId, score: maxSc };
  };

  // CV Upload/Parsing States
  const [isParsingCv, setIsParsingCv] = useState(false);
  const [cvParseError, setCvParseError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  // Parse CV from File (PDF/Word/Text)
  const handleCvFileUpload = async (file: File) => {
    if (!file) return;
    setIsParsingCv(true);
    setCvParseError('');
    
    const formData = new FormData();
    formData.append('cv', file);

    try {
      const response = await fetch('/api/parse-cv', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let errMsg = 'Falló la extracción inteligente del CV';
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            errMsg = errorData.error || errMsg;
          } else {
            const rawText = await response.text();
            console.error("Server non-JSON error response:", rawText);
            const titleMatch = rawText.match(/<title>(.*?)<\/title>/);
            const preMatch = rawText.match(/<pre>(.*?)<\/pre>/s) || rawText.match(/<h1>(.*?)<\/h1>/);
            if (titleMatch && preMatch) {
              errMsg = `${titleMatch[1]}: ${preMatch[1].replace(/&lt;/g, '<').replace(/&gt;/g, '>')}`;
            } else if (titleMatch) {
              errMsg = titleMatch[1];
            } else {
              errMsg = `Error del servidor (${response.status}): ${rawText.substring(0, 100)}`;
            }
          }
        } catch (parseErr) {
          errMsg = `Error del servidor (${response.status})`;
        }
        throw new Error(errMsg);
      }

      let data;
      try {
        data = await response.json();
      } catch (jsonErr) {
        throw new Error("El servidor devolvió una respuesta que no es un JSON válido");
      }
      
      // Auto-fill form fields!
      if (data.name) setNewName(data.name);
      if (data.email) setNewEmail(data.email);
      if (data.phone) setNewPhone(data.phone);
      if (data.role) setNewRole(data.role);
      if (data.suggestedChannel) setNewChannel(data.suggestedChannel);
      if (data.text) {
        setNewResumeText(data.text);
        // Automatically perform smart match routing
        const bestMatch = findBestVacancyMatch(data.text, data.role || data.name || '');
        if (bestMatch && bestMatch.vacancyId) {
          setSelectedFormVacancyId(bestMatch.vacancyId);
          console.log("[EAS AutoMatch] Auto-routing candidate to best vacancy:", bestMatch.vacancyId, "affinity:", bestMatch.score);
        }
      }
      
    } catch (err: any) {
      console.error(err);
      setCvParseError(err.message || 'Error al decodificar y extraer información del archivo');
    } finally {
      setIsParsingCv(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleCvFileUpload(file);
    }
  };

  // Competency Filters state
  const [minLeadership, setMinLeadership] = useState(0);
  const [minTech, setMinTech] = useState(0);
  const [minComm, setMinComm] = useState(0);
  const [minWork, setMinWork] = useState(0);
  const [minProblem, setMinProblem] = useState(0);

  // Workflow Stage Customization states
  const [isEditingWorkflow, setIsEditingWorkflow] = useState(false);
  const [newStageName, setNewStageName] = useState('');

  // Pre-load a few mock resume examples to speed up recruiter's evaluation testing
  const SAMPLE_RESUMES = [
    {
      role: "Data Analyst",
      text: "Especialista en analítica de datos con 4 años de trayectoria usando SQL, Python (Pandas), Tableau e IA generativa para modelos predictivos. Experto en estructurar KPIs complejos de recursos humanos y tableros interactivos para toma de decisiones y control estratégico. Excelentes dotes para traducir datos técnicos a gerentes ejecutivos."
    },
    {
      role: "Consultor Senior de Capital Humano",
      text: "Líder consultor con 8 años de trayectoria especializado en reorganización organizacional, mejora del clima laboral, diseño de políticas de equidad salarial y coaching directivo. Amplia experiencia implementando estrategias de Atracción de Capital Humano para firmas multinacionales de servicios financieros."
    },
    {
      role: "Gerente de Recursos Humanos",
      text: "Directora de talento con 12 años liderando equipos corporativos. Experta en negociaciones sindicales, implementación de normativas NOM-035 vigentes de salud ocupacional, retención de capital intelectual y diseño de flujos ágiles de onboarding digital con estricto cumplimiento estético y operativo."
    }
  ];

  // Load a template resume
  const loadResumeTemplate = (index: number) => {
    const template = SAMPLE_RESUMES[index];
    setNewRole(template.role);
    setNewResumeText(template.text);
  };

  // Call Express Proxy Backend for real or fallback Gemini AI Analysis!
  const handleAIScreenCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newResumeText.trim()) return;

    setIsAnalyzing(true);
    setAnalysisStatus('Inicializando el motor EAS TalentCore...');
    
    setTimeout(() => setAnalysisStatus('Analizando incidencias conductuales con el modelo Gemini...'), 400);
    setTimeout(() => setAnalysisStatus('Calibrando competencias organizacionales (LFPDPPP Guard)...'), 900);

    try {
      // Determine final assigned vacancy ID (and corresponding details payload)
      let finalVacancyId = selectedFormVacancyId;
      if (finalVacancyId === 'auto') {
        const autoMatch = findBestVacancyMatch(newResumeText, newRole || newName);
        finalVacancyId = autoMatch.vacancyId;
      }
      
      const currentVac = vacancies.find(v => v.id === finalVacancyId);
      const targetVacancyPayload = currentVac ? {
        title: currentVac.title,
        department: currentVac.department,
        description: currentVac.description,
        requirements: currentVac.requirements,
        minCompetenciesRequired: currentVac.minCompetenciesRequired
      } : null;

      const response = await fetch('/api/analyze-candidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          resumeText: newResumeText,
          candidateRole: newRole,
          targetVacancy: targetVacancyPayload
        })
      });

      if (!response.ok) {
        throw new Error('La llamada al servidor de análisis falló.');
      }

      const result = await response.json();

      // Create new candidate
      const newCandidate: Candidate = {
        id: `cand-${Date.now()}`,
        name: newName,
        email: newEmail || `${newName.toLowerCase().replace(/\s+/g, '')}@eas-talento.com`,
        phone: newPhone || '+52 55 ' + Math.floor(10000000 + Math.random() * 90000000),
        resumeText: newResumeText,
        stage: 'screening',
        channel: newChannel,
        fitScore: result.fitScore || 85,
        competencies: result.competencies || {
          'Liderazgo': 70,
          'Comunicación': 80,
          'Trabajo en Equipo': 75,
          'Habilidades Técnicas': 85,
          'Resolución de Problemas': 80
        },
        summary: result.summary || 'Análisis finalizado con recomendaciones estándar para consultoría de capital humano.',
        strengths: result.strengths || ['Adaptabilidad', 'Comunicación asertiva'],
        growths: result.growths || ['Familiaridad con sistemas propietarios de control'],
        recommendedQuestions: result.recommendedQuestions || ['¿Cuáles son tus metas profesionales?'],
        suggestedTime: result.suggestedTime || 'Lunes por la tarde',
        createdAt: new Date().toISOString(),
        isEncrypted: true,
        vacancyId: finalVacancyId
      };

      setCandidates(prev => [newCandidate, ...prev]);
      setSelectedCandidate(newCandidate);
      setLastAIResult(newCandidate); // Triggers success overlay!
      
      // Reset Form fields
      setNewName('');
      setNewEmail('');
      setNewPhone('');
      setNewResumeText('');
      setSelectedFormVacancyId('auto');
      
    } catch (error) {
      console.error(error);
      alert('Error ejecutando el tamizaje de IA. Verifique consola o servidor logs.');
    } finally {
      setIsAnalyzing(false);
      setAnalysisStatus('');
    }
  };

  // Delete Candidate profile with compliance audits
  const handleDeleteCandidate = (id: string, name: string) => {
    if (confirm(`¿Confirma eliminar definitivamente a ${name}? Conforme a la normativa LFPDPPP, se purgará de forma permanente todo registro clínico y datos curriculares asociados.`)) {
      setCandidates(prev => prev.filter(c => c.id !== id));
      if (selectedCandidate?.id === id) {
        setSelectedCandidate(null);
      }
    }
  };

  // Re-run intelligence analysis for an existing candidate
  const handleReAnalyzeCandidate = async (candidateId: string) => {
    const cand = candidates.find(c => c.id === candidateId);
    if (!cand) return;

    setIsRefreshingAI(true);
    try {
      const currentVac = vacancies.find(v => v.id === cand.vacancyId);
      const targetVacancyPayload = currentVac ? {
        title: currentVac.title,
        department: currentVac.department,
        description: currentVac.description,
        requirements: currentVac.requirements,
        minCompetenciesRequired: currentVac.minCompetenciesRequired
      } : null;

      const candidateRoleName = currentVac ? currentVac.title : 'Consultor / Especialista General';

      const response = await fetch('/api/analyze-candidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cand.name,
          resumeText: cand.resumeText,
          candidateRole: candidateRoleName,
          targetVacancy: targetVacancyPayload
        })
      });

      if (!response.ok) {
        throw new Error('La llamada al servidor de re-análisis falló.');
      }

      const result = await response.json();

      const updatedCandidate = {
        ...cand,
        fitScore: result.fitScore || cand.fitScore,
        competencies: result.competencies || cand.competencies,
        summary: result.summary || cand.summary,
        strengths: result.strengths || cand.strengths,
        growths: result.growths || cand.growths,
        recommendedQuestions: result.recommendedQuestions || cand.recommendedQuestions,
        suggestedTime: result.suggestedTime || cand.suggestedTime
      };

      setCandidates(prev => prev.map(c => c.id === candidateId ? updatedCandidate : c));
      setSelectedCandidate(updatedCandidate);
      setLastAIResult(updatedCandidate); // Present the beautiful interactive report!
    } catch (err) {
      console.error(err);
      alert('Error ejecutando re-análisis inteligentes.');
    } finally {
      setIsRefreshingAI(false);
    }
  };

  // Change Candidate stage directly
  const handleStageChange = (candidateId: string, newStage: string) => {
    setCandidates(prev => prev.map(c => c.id === candidateId ? { ...c, stage: newStage } : c));
    if (selectedCandidate?.id === candidateId) {
      setSelectedCandidate(prev => prev ? { ...prev, stage: newStage } : null);
    }
  };

  // Move a Workflow Stage up or down in configuration
  const handleAddNewStage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStageName.trim()) return;
    
    // Choose color dynamically
    const colors = [
      'border-indigo-300 bg-indigo-50 text-indigo-700',
      'border-teal-300 bg-teal-50 text-teal-700',
      'border-amber-300 bg-amber-50 text-amber-700',
      'border-rose-300 bg-rose-50 text-rose-700'
    ];
    const color = colors[stages.length % colors.length];

    const newStage: WorkflowStage = {
      id: newStageName.toLowerCase().replace(/\s+/g, '_'),
      title: newStageName,
      description: 'Etapa personalizada añadida por el Administrador.',
      color
    };

    setStages(prev => [...prev, newStage]);
    setNewStageName('');
  };

  // Delete customize stage
  const handleDeleteStage = (id: string) => {
    // Avoid deleting core stages
    if (['application', 'hired', 'rejected'].includes(id)) {
      alert('Las etapas principales de Postulación, Contratación y Rechazo son de sistema y no pueden ser eliminadas.');
      return;
    }
    setStages(prev => prev.filter(s => s.id !== id));
    // Move candidates to application
    setCandidates(prev => prev.map(c => c.stage === id ? { ...c, stage: 'application' } : c));
  };

  // Filter candidates dynamically based on search & competency sliders
  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.resumeText.toLowerCase().includes(searchTerm.toLowerCase());
    
    const leadership = c.competencies['Liderazgo'] || 0;
    const tech = c.competencies['Habilidades Técnicas'] || 0;
    const communication = c.competencies['Comunicación'] || 0;
    const teamwork = c.competencies['Trabajo en Equipo'] || 0;
    const problemSolving = c.competencies['Resolución de Problemas'] || 0;

    const matchesCompetencies = 
      leadership >= minLeadership &&
      tech >= minTech &&
      communication >= minComm &&
      teamwork >= minWork &&
      problemSolving >= minProblem;

    return matchesSearch && matchesCompetencies;
  });

  return (
    <div className="space-y-6">
      
      {/* Search and Quick Filters bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-150 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar postulaciones por nombre, habilidades, o palabras en CV..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
          />
        </div>

        <div className="flex items-center gap-2shrink-0">
          <button
            onClick={() => setIsAddingCandidate(true)}
            className="flex items-center gap-1.5 px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-indigo-600/15 cursor-pointer"
          >
            <Plus className="h-4.5 w-4.5" />
            Nuevo Postulante (IA Screen)
          </button>

          {activeRole === 'ADMIN' && (
            <button
              onClick={() => setIsEditingWorkflow(!isEditingWorkflow)}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                isEditingWorkflow 
                  ? 'bg-amber-600 text-white border-amber-600' 
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              <Layers className="h-4 w-4" />
              {isEditingWorkflow ? 'Cerrar Plantilla' : 'Personalizar Flujos'}
            </button>
          )}
        </div>
      </div>

      {/* Customize flujos / Recruiter Pipeline stages section */}
      {isEditingWorkflow && activeRole === 'ADMIN' && (
        <div className="bg-gradient-to-r from-amber-500/5 to-amber-500/10 border border-amber-200 p-5 rounded-2xl space-y-4 animate-fadeIn">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-sans font-bold text-slate-800 text-sm flex items-center gap-2">
                <Layers className="h-4.5 w-4.5 text-amber-600" />
                Diseñador de Flujos de Trabajo Personalizados (EAS Builder)
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Crea, renombra o reorganiza las etapas de selección para moldear el embudo según las necesidades específicas de la empresa.
              </p>
            </div>
            <button 
              onClick={() => setIsEditingWorkflow(false)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Adding new pipeline stage form */}
            <form onSubmit={handleAddNewStage} className="space-y-3 bg-white p-4 rounded-xl border border-amber-100 shadow-sm">
              <span className="text-xs font-bold text-slate-700 block">Agregar Nueva Etapa de Selección</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newStageName}
                  onChange={(e) => setNewStageName(e.target.value)}
                  placeholder="Ej. Entrevista Panel Directivo"
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shrink-0 cursor-pointer"
                >
                  Añadir
                </button>
              </div>
            </form>

            {/* List current stages with delete option */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 block">Estructura del Embudo Actual</span>
              <div className="flex flex-wrap gap-2">
                {stages.map((stage) => {
                  const isCore = ['application', 'hired', 'rejected'].includes(stage.id);
                  return (
                    <div 
                      key={stage.id}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${stage.color}`}
                    >
                      <span>{stage.title}</span>
                      {!isCore && (
                        <button 
                          type="button"
                          onClick={() => handleDeleteStage(stage.id)}
                          className="hover:text-red-900 transition-colors p-0.5 rounded ml-1"
                          title="Eliminar Etapa"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MAIN TWO-COLUMN SPLIT: LEFT is Candidate List & Filters, RIGHT is AI Profile Screening Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Candidate Search, Slider Filters and Pipeline (size 5/12) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Real-time Competency sliders */}
          <div className="bg-white p-4 rounded-2xl border border-slate-150 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="font-sans font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <SlidersHorizontal className="h-4 w-4 text-indigo-500" />
                Filtrar por Competencia Estratégica
              </h3>
              <button 
                onClick={() => {
                  setMinLeadership(0);
                  setMinTech(0);
                  setMinComm(0);
                  setMinWork(0);
                  setMinProblem(0);
                }}
                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 uppercase"
              >
                Limpiar Filtros
              </button>
            </div>

            <div className="space-y-2.5 pt-1 text-xs font-semibold text-slate-600">
              
              {/* Slider 1: Leadership */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Liderazgo Directivo</span>
                  <span className="text-slate-900">{minLeadership}%</span>
                </div>
                <input
                  type="range"
                  min="0" max="100" step="5"
                  value={minLeadership}
                  onChange={(e) => setMinLeadership(Number(e.target.value))}
                  className="w-full accent-indigo-600 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
                />
              </div>

              {/* Slider 2: Technical */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Habilidades Técnicas</span>
                  <span className="text-slate-900">{minTech}%</span>
                </div>
                <input
                  type="range"
                  min="0" max="100" step="5"
                  value={minTech}
                  onChange={(e) => setMinTech(Number(e.target.value))}
                  className="w-full accent-indigo-600 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
                />
              </div>

              {/* Slider 3: Communication */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Comunicación Asertiva</span>
                  <span className="text-slate-900">{minComm}%</span>
                </div>
                <input
                  type="range"
                  min="0" max="100" step="5"
                  value={minComm}
                  onChange={(e) => setMinComm(Number(e.target.value))}
                  className="w-full accent-indigo-600 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
                />
              </div>

              {/* Slider 4: Teamwork */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Trabajo Colaborativo</span>
                  <span className="text-slate-900">{minWork}%</span>
                </div>
                <input
                  type="range"
                  min="0" max="100" step="5"
                  value={minWork}
                  onChange={(e) => setMinWork(Number(e.target.value))}
                  className="w-full accent-indigo-600 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
                />
              </div>

              {/* Slider 5: Problem solving */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Resolución de Problemas</span>
                  <span className="text-slate-900">{minProblem}%</span>
                </div>
                <input
                  type="range"
                  min="0" max="100" step="5"
                  value={minProblem}
                  onChange={(e) => setMinProblem(Number(e.target.value))}
                  className="w-full accent-indigo-600 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
                />
              </div>

            </div>
          </div>

          {/* List of filtered candidates */}
          <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1 block">
              Resultados Encontrados ({filteredCandidates.length})
            </span>
            
            {filteredCandidates.length === 0 ? (
              <div className="p-8 text-center bg-white border border-slate-150 rounded-2xl text-slate-400">
                <Search className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                <span className="text-xs font-semibold block">Ningún aspirante cumple los criterios.</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Modifique los filtros o el buscador superior.</span>
              </div>
            ) : (
              filteredCandidates.map((cand) => {
                const stageConfig = stages.find(s => s.id === cand.stage) || stages[0];
                const isSelected = selectedCandidate?.id === cand.id;

                return (
                  <div
                    key={cand.id}
                    onClick={() => setSelectedCandidate(cand)}
                    className={`p-4 bg-white border rounded-2xl transition cursor-pointer flex flex-col gap-3 relative ${
                      isSelected 
                        ? 'border-indigo-600 ring-2 ring-indigo-500/10' 
                        : 'border-slate-150 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <h4 className="font-sans font-bold text-slate-800 text-sm leading-tight truncate">
                          {cand.name}
                        </h4>
                        <span className="text-[11px] font-mono font-medium text-slate-400 block mt-0.5">
                          Filtro: {cand.channel}
                        </span>
                      </div>

                      {/* Overall Fit badge */}
                      <div className={`px-2.5 py-1 rounded-xl text-center shrink-0 ${
                        cand.fitScore >= 90 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        cand.fitScore >= 80 ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                        'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        <span className="text-xs font-black">{cand.fitScore}%</span>
                        <span className="text-[9px] block font-semibold uppercase tracking-widest text-[9px]">Ajuste</span>
                      </div>
                    </div>

                    {/* Progress representation or little tags */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-50 text-[10px] font-semibold">
                      <div className={`px-2 py-0.5 rounded-full border ${stageConfig.color}`}>
                        {stageConfig.title}
                      </div>
                      
                      <div className="flex items-center gap-1.5 text-slate-500 font-sans">
                        <span>Tec:</span>
                        <strong className="text-slate-800">{cand.competencies['Habilidades Técnicas'] || 0}</strong>
                        <div className="w-1 h-1 bg-slate-300 rounded-full" />
                        <span>Com:</span>
                        <strong className="text-slate-800">{cand.competencies['Comunicación'] || 0}</strong>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-indigo-600">
                        <ChevronRight className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: AI Selected Profile Screen Details / Card views (size 7/12) */}
        <div className="lg:col-span-7">
          
          {selectedCandidate ? (
            <div className="bg-white border border-slate-150 rounded-2xl shadow-sm p-6 space-y-6">
              
              {/* Profile Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                <div className="space-y-1.5">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-150 text-[10px] font-bold uppercase tracking-wider">
                    <Shield className="h-3 w-3" />
                     Evaluación Auditada LFPDPPP (EAS Core)
                  </span>
                  <h3 className="text-xl font-bold text-slate-850 font-sans leading-tight">
                    {selectedCandidate.name}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500 font-medium font-sans">
                    <span>{selectedCandidate.email}</span>
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
                    <span>{selectedCandidate.phone}</span>
                  </div>
                </div>

                {/* Operations dropdown / Actions */}
                <div className="flex items-center gap-2">
                  {/* Stage Dropdown select */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Pipeline Stage</span>
                    <select
                      value={selectedCandidate.stage}
                      onChange={(e) => handleStageChange(selectedCandidate.id, e.target.value)}
                      className="bg-slate-50 text-slate-800 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold leading-none focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      {stages.map((st) => (
                        <option key={st.id} value={st.id}>{st.title}</option>
                      ))}
                    </select>
                  </div>

                  {activeRole !== 'MANAGER' && (
                    <button
                      onClick={() => handleDeleteCandidate(selectedCandidate.id, selectedCandidate.name)}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-100 transition mt-4"
                      title="Eliminar Postulación permanentemente"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Vacancy Mapping & Pre-qualification Report */}
              {(() => {
                const assignedVac = vacancies.find(v => v.id === selectedCandidate.vacancyId);

                // Check requirements keyword match
                const lowercaseResume = (selectedCandidate.resumeText || "").toLowerCase();
                const matchedReqs = assignedVac?.requirements.filter(req => 
                  lowercaseResume.includes(req.toLowerCase())
                ) || [];
                const missingReqs = assignedVac?.requirements.filter(req => 
                  !lowercaseResume.includes(req.toLowerCase())
                ) || [];

                return (
                  <div className="p-5 bg-gradient-to-br from-slate-50 to-indigo-50/25 border border-indigo-100 rounded-2xl space-y-4 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
                          <Briefcase className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Vacante Vinculada</span>
                          {assignedVac ? (
                            <div>
                              <h4 className="font-bold text-slate-800 text-sm truncate">{assignedVac.title}</h4>
                              <span className="text-xs font-semibold text-slate-500">{assignedVac.department}</span>
                            </div>
                          ) : (
                            <span className="text-xs font-semibold text-rose-500 block">Falta asignar vacante de destino</span>
                          )}
                        </div>
                      </div>

                      {/* Dropdown for manual routing / redirection to other vacancies */}
                      <div className="space-y-1 self-start sm:self-center">
                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block">Asignar / Re-Direccionar</span>
                        <select
                          value={selectedCandidate.vacancyId || ''}
                          onChange={(e) => {
                            const destVacId = e.target.value;
                            setCandidates(prev => prev.map(c => c.id === selectedCandidate.id ? { ...c, vacancyId: destVacId } : c));
                            setSelectedCandidate(prev => prev && prev.id === selectedCandidate.id ? { ...prev, vacancyId: destVacId } : prev);
                          }}
                          className="bg-white text-slate-800 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold leading-none focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm cursor-pointer"
                        >
                          <option value="" disabled>Seleccionar vacante...</option>
                          {vacancies.map(v => (
                            <option key={v.id} value={v.id}>{v.title}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Candidate Pre-qualification Report */}
                    {assignedVac && (
                      <div className="pt-3.5 border-t border-indigo-100/50 space-y-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center justify-center h-5 w-5 bg-indigo-100 text-indigo-700 rounded-lg text-[10px] font-black">EAS</span>
                          <span className="text-[10.5px] font-black text-slate-700 uppercase tracking-wider">Ficha de Precalificación EAS Match™</span>
                        </div>

                        {/* Requirements Audit */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          <div className="p-3 bg-white/60 rounded-xl border border-slate-150 space-y-1.5">
                            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Requisitos Cubiertos ({matchedReqs.length})</span>
                            {matchedReqs.length === 0 ? (
                              <span className="text-[11px] text-slate-400 italic block">Ninguno detectado críticamente</span>
                            ) : (
                              <div className="flex flex-wrap gap-1">
                                {matchedReqs.map((req, i) => (
                                  <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-100 font-medium text-[9.5px]">
                                    ✓ {req}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="p-3 bg-white/60 rounded-xl border border-slate-150 space-y-1.5">
                            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">Habilidades No Encontradas ({missingReqs.length})</span>
                            {missingReqs.length === 0 ? (
                              <span className="text-[11px] text-emerald-600 block">✓ ¡Cumple con todas las palabras clave!</span>
                            ) : (
                              <div className="flex flex-wrap gap-1">
                                {missingReqs.map((req, i) => (
                                  <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-50/80 text-slate-500 border border-slate-150 font-medium text-[9.5px]">
                                    ? {req}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Gap-analysis comparing candidate actual competency values with required minimum thresholds */}
                        <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                          <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">Auditoría de Brechas contra Mínimo de Vacante</span>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                            {Object.entries(assignedVac.minCompetenciesRequired).map(([compKey, minVal]) => {
                              const actualVal = selectedCandidate.competencies[compKey] || 0;
                              const diff = actualVal - minVal;
                              const meet = diff >= 0;

                              return (
                                <div key={compKey} className="p-2 border border-slate-100 bg-slate-50/50 rounded-lg flex flex-col justify-between">
                                  <span className="text-[9px] font-bold text-slate-600 truncate">{compKey}</span>
                                  <div className="flex items-baseline justify-between mt-1">
                                    <span className="text-xs font-extrabold text-slate-800">{actualVal}%</span>
                                    <span className={`text-[8.5px] font-extrabold px-1 py-0.2 rounded ${
                                      meet ? 'text-emerald-700' : 'text-amber-700 font-black'
                                    }`}>
                                      {meet ? '✓' : `${diff}%`}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Engine AI assessment button */}
                        <button
                          onClick={() => handleReAnalyzeCandidate(selectedCandidate.id)}
                          disabled={isRefreshingAI}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 rounded-xl shadow-md hover:shadow-lg transition cursor-pointer"
                        >
                          {isRefreshingAI ? (
                            <>
                              <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                              <span>Calibrando Modelo EAS AI Engine...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4" />
                              <span>Ejecutar Análisis Inteligente con EAS Engine AI™</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Fit score & Competencies Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-4 border border-slate-100 rounded-2xl">
                
                {/* Fit meter explanation */}
                <div className="flex flex-col items-center justify-center space-y-2 border-r border-slate-200/60 p-2">
                  <div className="relative flex items-center justify-center">
                    {/* Circle indicators */}
                    <svg className="w-24 h-24 transform -rotate-90">
                      <circle cx="48" cy="48" r="40" stroke="#F1F5F9" strokeWidth="6.5" fill="transparent" />
                      <circle cx="48" cy="48" r="40" stroke="#4F46E5" strokeWidth="6.5" fill="transparent"
                        strokeDasharray={251.2}
                        strokeDashoffset={251.2 - (251.2 * selectedCandidate.fitScore) / 100}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute text-xl font-black text-slate-800 font-sans">{selectedCandidate.fitScore}%</span>
                  </div>
                  <div className="text-center">
                    <span className="text-xs font-extrabold text-slate-800 tracking-tight block">Score de Aptitud Global</span>
                    <span className="text-[10px] text-slate-400 block leading-tight font-medium">Predicción de permanencia y éxito conductual</span>
                  </div>
                </div>

                {/* Individual competencies */}
                <div className="space-y-3 font-sans text-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Clasificación Básica</span>
                  
                  {Object.entries(selectedCandidate.competencies).map(([name, score]) => (
                    <div key={name} className="space-y-1 font-semibold">
                      <div className="flex justify-between items-center text-slate-700">
                        <span>{name}</span>
                        <span>{score}/100</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${score}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Executive summary block from Gemini */}
              <div className="space-y-2">
                <h4 className="font-sans font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-indigo-500" />
                  Perfil Sintetizado (Asistente de Reclutamiento AI)
                </h4>
                <div className="p-4 bg-indigo-50/30 border border-indigo-100 rounded-2xl text-xs text-slate-700 leading-relaxed">
                  {selectedCandidate.summary}
                </div>
              </div>

              {/* Strengths and Growth Areas (Bento style) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Strengths */}
                <div className="p-4 bg-emerald-50/20 border border-emerald-100 rounded-2xl space-y-2">
                  <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">Fortalezas Destacadas</span>
                  <ul className="space-y-1.5 select-none">
                    {selectedCandidate.strengths.map((str, idx) => (
                      <li key={idx} className="text-xs text-slate-600 flex items-start gap-1.5">
                        <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Areas for Growth */}
                <div className="p-4 bg-amber-50/20 border border-amber-100 rounded-2xl space-y-2">
                  <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">Brechas Conductuales / Oportunidad</span>
                  <ul className="space-y-1.5 select-none">
                    {selectedCandidate.growths.map((gro, idx) => (
                      <li key={idx} className="text-xs text-slate-600 flex items-start gap-1.5">
                        <ArrowRight className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                        <span>{gro}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Suggestions / Questions block for interview preparation */}
              <div className="space-y-2 pt-4 border-t border-slate-100">
                <h4 className="font-sans font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="h-4 w-4 text-indigo-500" />
                  Banco de Preguntas sugerido por EAS Consulting
                </h4>
                <div className="space-y-2 select-none">
                  {selectedCandidate.recommendedQuestions.map((q, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 border border-slate-150 rounded-xl text-xs text-slate-700 font-medium leading-relaxed flex items-start gap-2.5">
                      <div className="h-5 w-5 bg-indigo-50 text-indigo-700 font-bold text-[10px] rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <span>{q}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Automated Slot Recommendation and actions */}
              <div className="p-4 bg-indigo-50/50 border border-indigo-150 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-sans text-xs">
                <div>
                  <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">Agendado de Entrevistas Automático</span>
                  <p className="text-slate-700 font-medium mt-1">
                    Slot óptimo sugerido por IA: <strong>{selectedCandidate.suggestedTime}</strong>
                  </p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      setInvitationCandidate(selectedCandidate);
                      setShowInvitationModal(true);
                      setCopiedWa(false);
                      setCopiedEmail(false);
                    }}
                    className="flex-1 sm:flex-initial px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl font-bold transition whitespace-nowrap cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <Mail className="h-4 w-4 text-slate-500" />
                    Enviar Invitación
                  </button>
                  <button
                    onClick={() => onAutoSchedule(selectedCandidate)}
                    className="flex-1 sm:flex-initial px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition whitespace-nowrap cursor-pointer shadow-sm"
                  >
                    Agendar en Agenda
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white border rounded-2xl p-12 text-center text-slate-400">
              <Plus className="h-12 w-12 mx-auto text-slate-300 mb-2" />
              <h3 className="font-bold text-slate-700">Ningún candidato seleccionado</h3>
              <p className="text-xs text-slate-500 mt-1">Seleccione un postulante del listado de la izquierda para desplegar el tamizaje completo.</p>
            </div>
          )}

        </div>
      </div>

      {/* CREATE NEW CANDIDATE SLIDE OVER / MODAL POPUP */}
      {isAddingCandidate && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all duration-250 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl shadow-xl overflow-hidden animate-slideUp font-sans">
            
            {/* Modal Header */}
            <div className="bg-slate-50 px-6 py-5 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-indigo-500 animate-pulse" />
                  EAS TalentCore AI™ - Tamizaje Automático de Candidatos
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Ingrese el perfil profesional o pegue el Currículum Vitae. El motor de IA evaluará competencias organizacionales y técnicas.
                </p>
              </div>
              <button 
                onClick={() => setIsAddingCandidate(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAIScreenCandidate} className="p-6 space-y-4">
              
              {/* PDF/Word File Uploader Dropzone */}
              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-2xl p-5 text-center transition-all duration-150 ${
                  dragActive 
                    ? 'border-eas-red-500 bg-eas-red-50/50 scale-[1.01]' 
                    : isParsingCv 
                      ? 'border-eas-blue-500 bg-slate-50 animate-pulse' 
                      : 'border-slate-300 hover:border-eas-blue-500 bg-slate-50/50'
                }`}
              >
                <input 
                  type="file"
                  id="cv-file-upload"
                  accept=".pdf,.docx,.doc,.txt"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleCvFileUpload(e.target.files[0]);
                    }
                  }}
                />
                
                <label 
                  htmlFor="cv-file-upload"
                  className="cursor-pointer flex flex-col items-center justify-center space-y-1.5"
                >
                  <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${
                    isParsingCv ? 'bg-eas-red-500 text-white animate-bounce' : 'bg-eas-blue-50 text-eas-blue-600'
                  }`}>
                    <FileDown className="h-5 w-5" />
                  </div>
                  
                  {isParsingCv ? (
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-eas-blue-950">EAS TalentCore AI™ extrayendo información estructurada...</p>
                      <p className="text-[10px] text-slate-500 animate-pulse">Analizando secciones de contacto, vacantes sugeridas, habilidades y trayectoria...</p>
                    </div>
                  ) : (
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-800">
                        Sube o arrastra el currículum del postulante aquí
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Formatos soportados: <strong className="text-slate-600">PDF (.pdf)</strong> o <strong className="text-slate-600">Word (.docx)</strong>
                      </p>
                    </div>
                  )}
                </label>

                {cvParseError && (
                  <div className="mt-2 text-[11px] font-semibold text-rose-600 bg-rose-50/80 border border-rose-100 py-1.5 px-3 rounded-lg">
                    {cvParseError}
                  </div>
                )}
                
                {isParsingCv && (
                  <div className="absolute inset-0 bg-white/40 rounded-2xl flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-eas-red-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              
              {/* Quick Template Picker */}
              <div className="bg-indigo-50/40 border border-indigo-100 p-3 rounded-xl">
                <span className="text-[11px] font-bold text-slate-600 block uppercase tracking-wide mb-1.5">
                  ¿Probar con una plantilla prefabricada?
                </span>
                <div className="flex gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      setNewName("Patricia Sandoval Guerrero");
                      setNewEmail("p.sandoval@example.com");
                      setNewPhone("+52 55 2211 4455");
                      loadResumeTemplate(0);
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-indigo-50 text-indigo-600 border border-indigo-150 rounded-lg text-[11px] font-bold transition cursor-pointer"
                  >
                    Template: Data Analyst
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewName("Dr. Javier Espinoza Prado");
                      setNewEmail("j.espinoza@example.com");
                      setNewPhone("+52 55 9988 7766");
                      loadResumeTemplate(1);
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-indigo-50 text-indigo-600 border border-indigo-150 rounded-lg text-[11px] font-bold transition cursor-pointer"
                  >
                    Template: HR Consultor Sr.
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewName("Ing. Verónica Martínez Ruiz");
                      setNewEmail("v.martinez@example.com");
                      setNewPhone("+52 55 3344 5566");
                      loadResumeTemplate(2);
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-indigo-50 text-indigo-600 border border-indigo-150 rounded-lg text-[11px] font-bold transition cursor-pointer"
                  >
                    Template: HR Manager NOM-035
                  </button>
                </div>
              </div>

              {/* Standard inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Nombre Completo del Aspirante</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Ej. Patricia Sandoval"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Canal de Prospección / Entrada</label>
                  <select
                    value={newChannel}
                    onChange={(e) => setNewChannel(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="EAS Consulting DB">EAS Consulting DB</option>
                    <option value="Referido">Red de Referidos</option>
                    <option value="Glassdoor">Glassdoor</option>
                    <option value="Otros">Otros Canales</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Correo Electrónico</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="ejemplo@patricia.com"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Teléfono Móvil</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+52 55..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Rol / Título del Candidato</label>
                  <input
                    type="text"
                    required
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    placeholder="Ej. DevOps Architect"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Vacancy selector supporting auto match */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block">Vincular a Vacante Activa</label>
                <select
                  value={selectedFormVacancyId}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedFormVacancyId(val);
                    if (val !== 'auto') {
                      const vac = vacancies.find(v => v.id === val);
                      if (vac) setNewRole(vac.title);
                    }
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="auto">✨ EAS Auto-Ruteo Analítico (Detectar Mejor Opción por CV)</option>
                  {vacancies.map(vac => (
                    <option key={vac.id} value={vac.id}>{vac.title} ({vac.department})</option>
                  ))}
                </select>
              </div>

              {/* CV Text Area */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Texto del CV / Perfil Profesional</label>
                <textarea
                  required
                  rows={4}
                  value={newResumeText}
                  onChange={(e) => setNewResumeText(e.target.value)}
                  placeholder="Pegue la biografía de LinkedIn, trayectoria del CV, logros destacados del candidato o resumen de habilidades..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
                />
              </div>

              {/* Submission buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isAnalyzing}
                  onClick={() => setIsAddingCandidate(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isAnalyzing}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer disabled:bg-indigo-400"
                >
                  {isAnalyzing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Procesando...</span>
                    </div>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Ejecutar Análisis Inteligente con EAS Engine AI™
                    </>
                  )}
                </button>
              </div>

              {/* Live Loading overlay */}
              {isAnalyzing && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex flex-col items-center justify-center space-y-3 z-25">
                  <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-bold text-indigo-950 font-sans tracking-wide animate-pulse">{analysisStatus}</p>
                </div>
              )}

            </form>
          </div>
        </div>
      )}

      {/* SUCCESS EAS MATCH AND COMPATIBILITY REPORT POPUP */}
      {lastAIResult && (() => {
        const matchingVacancy = vacancies.find(v => v.id === lastAIResult.vacancyId);
        
        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in font-sans overflow-y-auto">
            <div className="bg-white border border-slate-200 rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden animate-slide-up my-8 max-h-[90vh] flex flex-col">
              
              {/* Header Banner */}
              <div className="bg-gradient-to-r from-emerald-500 to-indigo-600 p-6 text-white relative shrink-0">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Sparkles className="h-28 w-28 text-white animate-pulse" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-white/20 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-widest leading-none">
                    EAS Engine AI™ Report
                  </span>
                  <span className="bg-emerald-400 text-slate-900 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-widest leading-none">
                    ¡Análisis Completado!
                  </span>
                </div>
                <h3 className="text-xl font-bold leading-tight">Tamizaje y Precalificación Exitosa</h3>
                <p className="text-xs text-white/80 mt-1">El currículum ha sido procesado de forma estructurada e inteligente.</p>
              </div>

              {/* Scrollable Report Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                
                {/* Candidate basic info and Match score header */}
                <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="min-w-0 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Aspirante Evaluado</span>
                    <h4 className="font-sans font-extrabold text-slate-800 text-lg leading-snug truncate">{lastAIResult.name}</h4>
                    {matchingVacancy ? (
                      <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                        <Briefcase className="h-3.5 w-3.5 text-indigo-500" />
                        Vacante: <strong>{matchingVacancy.title}</strong> ({matchingVacancy.department})
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-amber-600 italic block">General (Sin vacante directa)</span>
                    )}
                  </div>

                  <div className="flex flex-col items-center p-2 rounded-xl bg-white border border-slate-200 shadow-sm shrink-0">
                    <span className="text-2xl font-black text-indigo-600 font-mono leading-none">{lastAIResult.fitScore}%</span>
                    <span className="text-[9px] font-black uppercase text-slate-400 mt-1 tracking-widest">Score de Aptitud</span>
                  </div>
                </div>

                {/* AI Executive Summary */}
                <div className="space-y-1.5 text-xs text-slate-700 leading-relaxed">
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    Resumen Clínico EAS Consulting
                  </span>
                  <div className="p-4 bg-indigo-50/30 border border-indigo-100 rounded-2xl text-slate-700">
                    {lastAIResult.summary}
                  </div>
                </div>

                {/* Individual competencies bars */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Evaluación de Competencias Clave</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                    {Object.entries(lastAIResult.competencies).map(([name, score]) => (
                      <div key={name} className="space-y-1 font-semibold p-2 border border-slate-100 rounded-xl bg-slate-50/50">
                        <div className="flex justify-between items-center text-slate-700 font-sans">
                          <span>{name}</span>
                          <span>{score}/100</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${score}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Strengths and Opportunities */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-emerald-50/20 border border-emerald-100 rounded-2xl space-y-2">
                    <span className="text-[10.5px] font-bold text-emerald-800 uppercase tracking-wider block">Fortalezas Identificadas</span>
                    <ul className="space-y-1.5 text-xs text-slate-600 font-medium">
                      {lastAIResult.strengths.slice(0, 3).map((str, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 bg-amber-50/20 border border-amber-100 rounded-2xl space-y-2">
                    <span className="text-[10.5px] font-bold text-amber-800 uppercase tracking-wider block">Brechas / Oportunidad</span>
                    <ul className="space-y-1.5 text-xs text-slate-600 font-medium">
                      {lastAIResult.growths.slice(0, 2).map((gro, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <ArrowRight className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                          <span>{gro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Recommended questions */}
                <div className="space-y-2">
                  <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-widest block">Preguntas de Entrevista Recomendadas por IA</span>
                  <div className="space-y-1.5">
                    {lastAIResult.recommendedQuestions.map((q, idx) => (
                      <p key={idx} className="p-2.5 bg-slate-50 border border-slate-150 rounded-xl text-xs text-slate-700 leading-snug font-medium">
                        <strong className="text-indigo-600 mr-1">#{idx + 1}</strong> {q}
                      </p>
                    ))}
                  </div>
                </div>

              </div>

              {/* Action footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-150 flex items-center justify-between shrink-0">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider pl-1 font-mono">EAS Engine Core v4.1</span>
                <button
                  onClick={() => {
                    setLastAIResult(null);
                    setIsAddingCandidate(false);
                  }}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-md hover:shadow-lg cursor-pointer"
                >
                  Súper, Guardar y Ver en Pipeline
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* MODAL WINDOW: Auto-Scheduling Invitation Templates */}
      {showInvitationModal && invitationCandidate && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 text-left animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 shadow-xl relative overflow-hidden font-sans">
            <div className="pb-4 border-b border-slate-100 mb-5 flex justify-between items-start">
              <div>
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Mail className="h-5 w-5 text-indigo-650" />
                  Invitación al Candidato (Auto-Agendamiento n8n)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Copie los copys personalizados para enviar por WhatsApp o Correo. Incluye enlace para auto-agendarse.
                </p>
              </div>
              <button
                onClick={() => setShowInvitationModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              
              {/* WhatsApp Template */}
              <div className="p-4 bg-[#25D366]/10 border border-[#25D366]/25 rounded-2xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-extrabold text-emerald-800 uppercase tracking-wide">Mensaje para WhatsApp</span>
                  <button
                    onClick={() => {
                      const text = `Hola ${invitationCandidate.name}, te saludamos de Capital Humano de EAS Consulting. Hemos evaluado tu perfil y nos parece ideal para nuestra vacante activa de ${invitationCandidate.role || 'Especialista'}. Nos gustaría agendar una primera entrevista corta de validación. ¿Podrías elegir un horario conveniente en nuestra agenda aquí: https://eas-scheduling.n8n.cloud/agendar/${invitationCandidate.id}? ¡Mucho éxito!`;
                      navigator.clipboard.writeText(text);
                      setCopiedWa(true);
                      setTimeout(() => setCopiedWa(false), 2000);
                    }}
                    className="text-[10px] font-black text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {copiedWa ? '✓ Copiado' : 'Copiar Texto'}
                  </button>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-semibold bg-white p-3 rounded-xl border border-[#25D366]/10">
                  Hola <strong className="text-slate-900">{invitationCandidate.name}</strong>, te saludamos de Capital Humano de EAS Consulting. Hemos evaluado tu perfil y nos parece ideal para nuestra vacante activa de <strong className="text-slate-900">{invitationCandidate.role || 'Especialista'}</strong>. Nos gustaría agendar una primera entrevista corta de validación. ¿Podrías elegir un horario conveniente en nuestra agenda aquí: <span className="text-indigo-600 underline">https://eas-scheduling.n8n.cloud/agendar/{invitationCandidate.id}</span>? ¡Mucho éxito!
                </p>
              </div>

              {/* Email Template */}
              <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-extrabold text-indigo-850 uppercase tracking-wide">Mensaje para Correo Electrónico</span>
                  <button
                    onClick={() => {
                      const text = `Estimado/a ${invitationCandidate.name},\n\nEspero que se encuentre muy bien.\n\nLe escribo de parte del equipo de Atracción de Capital Humano de EAS Consulting. Hemos revisado su perfil profesional y encontramos una excelente compatibilidad con nuestra posición vacante activa de ${invitationCandidate.role || 'Especialista'}.\n\nNos gustaría coordinar una entrevista inicial breve para conocer más sobre su trayectoria y expectativas. Para facilitar el proceso, puede elegir el horario que mejor se adapte a su agenda a través del siguiente enlace de auto-agendamiento de EAS:\nhttps://eas-scheduling.n8n.cloud/agendar/${invitationCandidate.id}\n\nQuedamos a su entera disposición y le deseamos mucho éxito.\n\nAtentamente,\nEquipo de Capital Humano\nEAS Consulting`;
                      navigator.clipboard.writeText(text);
                      setCopiedEmail(true);
                      setTimeout(() => setCopiedEmail(false), 2000);
                    }}
                    className="text-[10px] font-black text-indigo-800 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {copiedEmail ? '✓ Copiado' : 'Copiar Texto'}
                  </button>
                </div>
                <div className="text-xs text-slate-700 leading-relaxed font-semibold bg-white p-3 rounded-xl border border-slate-150 space-y-1">
                  <p>Estimado/a <strong className="text-slate-900">{invitationCandidate.name}</strong>,</p>
                  <p>Espero que se encuentre muy bien.</p>
                  <p>Le escribo de parte del equipo de Atracción de Capital Humano de EAS Consulting. Hemos revisado su perfil profesional y encontramos una excelente compatibilidad con nuestra posición vacante activa de <strong className="text-slate-900">{invitationCandidate.role || 'Especialista'}</strong>.</p>
                  <p>Nos gustaría coordinar una entrevista inicial breve para conocer más sobre su trayectoria y expectativas. Para facilitar el proceso, puede elegir el horario que mejor se adapte a su agenda a través del siguiente enlace de auto-agendamiento de EAS:</p>
                  <p className="text-indigo-650 font-bold underline">https://eas-scheduling.n8n.cloud/agendar/{invitationCandidate.id}</p>
                  <p>Quedamos a su entera disposición y le deseamos mucho éxito.</p>
                  <p className="pt-2">Atentamente,<br/><strong>Equipo de Capital Humano</strong><br/>EAS Consulting</p>
                </div>
              </div>

            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowInvitationModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
