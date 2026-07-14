import { Candidate, InterviewSlot, WorkflowStage, SecurityAuditLog, RecruitmentMetric, Vacancy } from '../types';

export const INITIAL_VACANCIES: Vacancy[] = [
  {
    id: 'vac-1',
    title: 'Consultor de Capital Humano Sr',
    department: 'Atracción de Talento',
    location: 'CDMX - Híbrido',
    description: 'Buscamos un Consultor de Capital Humano Senior para liderar proyectos de clima organizacional, planes de capacitación y evaluación de competencias. Responsable del cumplimiento normativo NOM-035.',
    requirements: ['recursos humanos', 'clima', 'capacitación', 'nom-035', 'psicología', 'selección', 'competencias'],
    experienceYears: 5,
    salaryRange: '$35,000 - $45,000 MXN',
    status: 'Open',
    minCompetenciesRequired: {
      'Liderazgo': 70,
      'Comunicación': 85,
      'Trabajo en Equipo': 80,
      'Habilidades Técnicas': 75,
      'Resolución de Problemas': 75
    }
  },
  {
    id: 'vac-2',
    title: 'Ingeniero Frontend React',
    department: 'EAS Tech Lab',
    location: 'Remoto (México)',
    description: 'Desarrollo de interfaces de usuario altamente interactivas y responsivas usando React 18, TypeScript, Tailwind CSS y Motion. Implementación de micro-animaciones y consumo de APIs.',
    requirements: ['react', 'typescript', 'tailwind', 'css', 'javascript', 'frontend', 'desarrollador', 'interfaces'],
    experienceYears: 3,
    salaryRange: '$45,000 - $60,000 MXN',
    status: 'Open',
    minCompetenciesRequired: {
      'Liderazgo': 60,
      'Comunicación': 75,
      'Trabajo en Equipo': 80,
      'Habilidades Técnicas': 85,
      'Resolución de Problemas': 80
    }
  },
  {
    id: 'vac-3',
    title: 'Analista de Datos y People Analytics',
    department: 'Inteligencia de Negocio',
    location: 'CDMX - Mitad Remoto',
    description: 'Modelado y análisis de datos de personal y desempeño. Creación de dashboards interactivos con SQL, Python (Pandas) y Power BI / Tableau para soportar decisiones estratégicas directivas.',
    requirements: ['sql', 'python', 'pandas', 'tableau', 'power bi', 'analytics', 'kpis', 'datos'],
    experienceYears: 4,
    salaryRange: '$38,000 - $48,000 MXN',
    status: 'Open',
    minCompetenciesRequired: {
      'Liderazgo': 65,
      'Comunicación': 80,
      'Trabajo en Equipo': 75,
      'Habilidades Técnicas': 85,
      'Resolución de Problemas': 80
    }
  },
  {
    id: 'vac-4',
    title: 'Project Manager Certificado PMP',
    department: 'Oficina de Proyectos (PMO)',
    location: 'CDMX - Presencial',
    description: 'Coordinación de proyectos complejos de transformación organizacional de TI y Capital Humano. Gestión presupuestaria, control de riesgos comerciales y metodologías Scrum/Agile.',
    requirements: ['pmp', 'scrum', 'riesgos', 'presupuesto', 'agile', 'coordinar', 'gerente', 'proyectos'],
    experienceYears: 8,
    salaryRange: '$55,000 - $75,000 MXN',
    status: 'Open',
    minCompetenciesRequired: {
      'Liderazgo': 90,
      'Comunicación': 90,
      'Trabajo en Equipo': 85,
      'Habilidades Técnicas': 70,
      'Resolución de Problemas': 85
    }
  }
];

export const INITIAL_STAGES: WorkflowStage[] = [
  { id: 'application', title: 'Postulación', description: 'Candidatos recién registrados en el portal.', color: 'border-slate-300 bg-slate-50 text-slate-700' },
  { id: 'screening', title: 'Filtro IA (EAS Engine)', description: 'Evaluación rápida de competencias clave vía Gemini.', color: 'border-amber-300 bg-amber-50 text-amber-700' },
  { id: 'test', title: 'Prueba Técnica', description: 'Evaluación práctica de habilidades profesionales.', color: 'border-blue-300 bg-blue-50 text-blue-700' },
  { id: 'interview', title: 'Entrevista', description: 'Reunión uno a uno con el equipo de Capital Humano.', color: 'border-indigo-300 bg-indigo-50 text-indigo-700' },
  { id: 'manager_review', title: 'Review Líder Área', description: 'Aprobación final por parte del Hiring Manager.', color: 'border-purple-300 bg-purple-50 text-purple-700' },
  { id: 'hired', title: 'Contratado', description: 'Proceso finalizado con éxito. Oferta aceptada.', color: 'border-green-300 bg-green-50/70 text-green-700' },
  { id: 'rejected', title: 'Nuevas Opciones', description: 'No avanza para esta posición específica.', color: 'border-rose-300 bg-rose-50 text-rose-700' },
];

export const INITIAL_CANDIDATES: Candidate[] = [
  {
    id: 'cand-1',
    name: 'Sofía Vergara Martínez',
    email: 'sofia.vergara@example.com',
    phone: '+52 55 4321 8765',
    resumeText: 'Ingeniera de Software Frontend con más de 5 años de experiencia liderando equipos en el desarrollo de SPA con React, TypeScript y Tailwind CSS. Apasionada por el diseño responsivo, accesibilidad web y optimización de rendimiento. Sólida experiencia en metodologías ágiles.',
    stage: 'interview',
    channel: 'LinkedIn',
    fitScore: 88,
    competencies: {
      'Liderazgo': 80,
      'Comunicación': 90,
      'Trabajo en Equipo': 85,
      'Habilidades Técnicas': 92,
      'Resolución de Problemas': 85
    },
    summary: 'Excelente perfil técnico con habilidades consolidadas de comunicación. Muestra fuerte orientación al usuario final y sólidas bases en desarrollo responsivo accesible. Capaz de liderar iniciativas técnicas complejas.',
    strengths: [
      'Dominio experto en React, TypeScript y optimización web.',
      'Excelente nivel de comunicación organizacional y gestión ágil.',
      'Fuerte enfoque en la arquitectura limpia y mejores prácticas de UI.'
    ],
    growths: [
      'Experiencia limitada en arquitecturas Cloud avanzadas (GCP/AWS backend).',
      'Oportunidad de profundizar en automatización de pruebas de integración.'
    ],
    recommendedQuestions: [
      '¿Cómo manejas la deuda técnica y las prioridades de rendimiento en un desarrollo ágil acelerado?',
      'Describe una situación donde tuviste un conflicto con un diseñador UX y cómo llegaron a un acuerdo.',
      'Explica cómo garantizas la accesibilidad (WCAG) en componentes de interfaz dinámicos.'
    ],
    suggestedTime: 'Lunes a Miércoles de 10:00 AM a 1:00 PM',
    createdAt: '2026-05-15T09:30:00Z',
    isEncrypted: true,
    vacancyId: 'vac-2'
  },
  {
    id: 'cand-2',
    name: 'Alejandro Ruiz Ortega',
    email: 'a.ruiz.ortega@example.com',
    phone: '+52 55 9876 5432',
    resumeText: 'Senior Project Manager certificado como PMP y Scrum Master con 10+ años coordinando proyectos de transformación digital y entrega de software empresarial de alto impacto. Experto en control presupuestario, gestión de riesgos en la nube y optimización de capital humano.',
    stage: 'manager_review',
    channel: 'Referido',
    fitScore: 94,
    competencies: {
      'Liderazgo': 96,
      'Comunicación': 92,
      'Trabajo en Equipo': 94,
      'Habilidades Técnicas': 78,
      'Resolución de Problemas': 95
    },
    summary: 'Project Manager senior altamente calificado por su destacada capacidad en liderazgo y gestión de crisis. Ideal para la coordinación de equipos multidisciplinarios e integración de sistemas organizacionales complejos.',
    strengths: [
      'Profunda experiencia en gobernanza de proyectos, control financiero y certificaciones.',
      'Dominio excepcional de habilidades blandas y relaciones con stakeholders de nivel C.',
      'Resolución estratégica de cuellos de botella operativos en capital humano.'
    ],
    growths: [
      'Habilidades de scripting o programación directa desactualizadas.',
      'Requiere adaptación a equipos híbridos autogestionados de desarrollo nativo.'
    ],
    recommendedQuestions: [
      '¿Qué estrategias utilizas para balancear la delegación de responsabilidades con el aseguramiento de la calidad en proyectos críticos?',
      'Comparte un ejemplo de un proyecto que estuvo a punto de fracasar y cómo lo recondujiste a tiempo.',
      '¿Cómo mides y optimizas el desempeño de tu personal a cargo sin caer en micromanagement?'
    ],
    suggestedTime: 'Jueves y Viernes de 2:00 PM a 5:00 PM',
    createdAt: '2026-05-18T14:15:00Z',
    isEncrypted: true,
    vacancyId: 'vac-4'
  },
  {
    id: 'cand-3',
    name: 'Mariana Flores Castro',
    email: 'mflores@example.com',
    phone: '+52 55 7654 3210',
    resumeText: 'Analista de Recursos Humanos y especialista en Clima Organizacional. Experta en diseño e implementación de programas de re-skilling, evaluación de perfiles por competencias, reducción de rotación y planes de comunicación interna estratégica. 4 años de trayectoria en el sector consultor.',
    stage: 'screening',
    channel: 'EAS Consulting DB',
    fitScore: 82,
    competencies: {
      'Liderazgo': 70,
      'Comunicación': 88,
      'Trabajo en Equipo': 82,
      'Habilidades Técnicas': 80,
      'Resolución de Problemas': 75
    },
    summary: 'Especialista en clima y retención de talento con enfoque empático y estructurado. Aporta metodologías de capacitación innovadoras alineadas con la visión estratégica de EAS Consulting.',
    strengths: [
      'Diseño exitoso de planes de retención y medición de clima organizacional.',
      'Facilidad natural para la comunicación multidireccional e inducción de personal.',
      'Conocimiento sólido de leyes y normativas de privacidad vigentes.'
    ],
    growths: [
      'Uso de plataformas analíticas avanzadas de Big Data aplicadas a People Analytics.',
      'Experiencia moderada en reclutamiento masivo de perfiles hiper-especializados de IA.'
    ],
    recommendedQuestions: [
      '¿Cómo aproximas el diseño de un programa de comunicación interna cuando la moral de la empresa es baja?',
      '¿Cuáles son tus indicadores clave de clima organizacional predilectos para predecir la fuga de talento?',
      '¿Qué medidas de protección de datos personales de candidatos consideras obligatorias en tu labor diaria?'
    ],
    suggestedTime: 'Cualquier día de 9:00 AM a 12:00 PM',
    createdAt: '2026-05-22T11:00:00Z',
    isEncrypted: true,
    vacancyId: 'vac-1'
  },
  {
    id: 'cand-4',
    name: 'Andrés Gómez Beltrán',
    email: 'andres.devops@example.com',
    phone: '+52 55 1234 5678',
    resumeText: 'Ingeniero DevOps enfocado en Kubernetes, Docker, Terraform y pipelines CI/CD integrados con GitHub Actions. Sólida experiencia asegurando arquitecturas tolerantes a fallas con altos índices de disponibilidad bajo estrictas normativas bancarias de seguridad de datos.',
    stage: 'test',
    channel: 'Glassdoor',
    fitScore: 85,
    competencies: {
      'Liderazgo': 65,
      'Comunicación': 75,
      'Trabajo en Equipo': 80,
      'Habilidades Técnicas': 95,
      'Resolución de Problemas': 90
    },
    summary: 'Excelente dominio del stack DevOps moderno y arquitecturas autogestionables. Muy orientado a la automatización del cumplimiento normativo de información y cifrado permanente de flujos logísticos.',
    strengths: [
      'Maestría en automatización de despliegues y contenedores elásticos.',
      'Sólido conocimiento en seguridad de la información crítica y cifrado en tránsito.',
      'Fuerte agilidad en resolución de incidentes de infraestructura crítica.'
    ],
    growths: [
      'Preferencia por trabajar de forma aislada; puede beneficiarse de mayor mentoría cruzada.',
      'Habilidades de exposición corporativa a clientes de negocio por desarrollar.'
    ],
    recommendedQuestions: [
      'Describe cómo estructurarías un pipeline CI/CD que valide automáticamente configuraciones de seguridad antes de producción.',
      '¿Cómo motivas e introduces mejores prácticas de cultura de confiabilidad SRE/DevOps en un equipo de desarrollo tradicional?',
      '¿Qué medidas implementas para asegurar que las variables de entorno y llaves secretas no sean nunca vulnerables?'
    ],
    suggestedTime: 'Martes o Jueves de 4:00 PM a 6:00 PM',
    createdAt: '2026-05-26T08:45:00Z',
    isEncrypted: true,
    vacancyId: 'vac-2'
  },
  {
    id: 'cand-5',
    name: 'Clara Domínguez Silva',
    email: 'clara.design@example.com',
    phone: '+52 55 5432 1098',
    resumeText: 'UX/UI Designer enfocada en el diseño de productos digitales centrados en el usuario. Especialista en flujos de reclutamiento intuitivos, mapas de empatía y diseño de tableros de control complejos. 3 años de experiencia en agencias creativas.',
    stage: 'hired',
    channel: 'LinkedIn',
    fitScore: 91,
    competencies: {
      'Liderazgo': 75,
      'Comunicación': 90,
      'Trabajo en Equipo': 88,
      'Habilidades Técnicas': 89,
      'Resolución de Problemas': 92
    },
    summary: 'Talento fresco e innovador enfocado en humanizar interfaces complejas. Presenta alta proactividad, fantástica recepción lingüística y una gran capacidad de estructuración visual modular.',
    strengths: [
      'Habilidad excepcional para trasladar requerimientos de software abstractos a layouts intuitivos.',
      'Dominio avanzado de prototipado interactivo de alta fidelidad.',
      'Excelentes habilidades de escucha activa y empatía con clientes finales.'
    ],
    growths: [
      'Comprensión intermedia de limitantes técnicas de CSS Grid / Flexbox de bajo nivel.',
      'Desearía trabajar más de cerca con pruebas directas de usabilidad cuantitativa.'
    ],
    recommendedQuestions: [
      '¿Cómo abordas el diseño de un tablero de métricas complejas para evitar la sobrecarga cognitiva del usuario?',
      'Dame un ejemplo de cómo cambiaste un diseño basándote estrictamente en el feedback de una prueba de usuarios.',
      '¿Cómo priorizas la consistencia de estilos frente a una fecha límite agresiva?'
    ],
    suggestedTime: 'Lunes a Viernes de 10:00 AM a 2:00 PM',
    createdAt: '2026-05-30T10:10:00Z',
    isEncrypted: true,
    vacancyId: 'vac-2'
  }
];

export const INITIAL_INTERVIEWS: InterviewSlot[] = [
  {
    id: 'int-1',
    candidateId: 'cand-1',
    candidateName: 'Sofía Vergara Martínez',
    interviewer: 'Ing. Eduardo Aguilar',
    interviewerRole: 'Socio de Capital Humano, EAS',
    date: '2026-06-08',
    time: '11:00',
    duration: 45,
    status: 'Scheduled',
    meetingLink: 'https://teams.microsoft.com/l/meetup-join/19%3ameeting_EAS_Sofia_Vergara%40thread.v2/0',
    notes: 'Entrevista de validación de competencias de liderazgo y enfoque arquitectónico en Frontend.',
    scorecard: null
  },
  {
    id: 'int-2',
    candidateId: 'cand-5',
    candidateName: 'Clara Domínguez Silva',
    interviewer: 'Lic. Laura Montes de Oca',
    interviewerRole: 'Gerente de Atracción de Talento, EAS',
    date: '2026-06-03',
    time: '12:30',
    duration: 60,
    status: 'Completed',
    meetingLink: 'https://teams.microsoft.com/l/meetup-join/19%3ameeting_EAS_Clara_Dominguez%40thread.v2/0',
    notes: 'Examen de portafolio UI/UX y diseño de tableros de control complejos.',
    scorecard: {
      rating: 5,
      recommendation: 'hired',
      feedback: 'Candidata brillante. Su portafolio es sumamente profesional y demostró excelente dominio en usabilidad de sistemas de software para Recursos Humanos. Recomendada para contratación inmediata para coordinar interfaces de Capital Humano.',
      evaluatedCompetencies: {
        'Liderazgo': 80,
        'Comunicación': 95,
        'Trabajo en Equipo': 90,
        'Habilidades Técnicas': 90,
        'Resolución de Problemas': 95
      }
    }
  }
];

export const INITIAL_METRICS: RecruitmentMetric[] = [
  {
    date: '2026-01',
    timeToHire: 28,
    conversionRate: 15,
    activeOpenings: 8,
    hiredCount: 3,
    sourceBreakdown: { linkedIn: 20, glassdoor: 10, referrals: 15, easDb: 10, others: 5 }
  },
  {
    date: '2026-02',
    timeToHire: 25,
    conversionRate: 18,
    activeOpenings: 10,
    hiredCount: 4,
    sourceBreakdown: { linkedIn: 25, glassdoor: 12, referrals: 20, easDb: 12, others: 4 }
  },
  {
    date: '2026-03',
    timeToHire: 24,
    conversionRate: 21,
    activeOpenings: 12,
    hiredCount: 5,
    sourceBreakdown: { linkedIn: 32, glassdoor: 15, referrals: 24, easDb: 18, others: 8 }
  },
  {
    date: '2026-04',
    timeToHire: 21,
    conversionRate: 24,
    activeOpenings: 15,
    hiredCount: 7,
    sourceBreakdown: { linkedIn: 40, glassdoor: 18, referrals: 28, easDb: 22, others: 10 }
  },
  {
    date: '2026-05',
    timeToHire: 19,
    conversionRate: 26,
    activeOpenings: 18,
    hiredCount: 8,
    sourceBreakdown: { linkedIn: 45, glassdoor: 22, referrals: 35, easDb: 25, others: 12 }
  }
];

export const INITIAL_AUDIT_LOGS: SecurityAuditLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-06-04T05:22:15Z',
    action: 'Cifrado automático AES-256 de base de datos de aspirantes',
    user: 'Sistema Automático',
    ip: '127.0.0.1',
    component: 'Base de Datos Gral',
    status: 'SUCCESS'
  },
  {
    id: 'log-2',
    timestamp: '2026-06-04T05:25:30Z',
    action: 'Auditoría de privacidad de PII (Integridad LFPDPPP / RGPD)',
    user: 'Compliance Auditor',
    ip: '189.145.22.4',
    component: 'Privacidad Engine',
    status: 'SUCCESS'
  },
  {
    id: 'log-3',
    timestamp: '2026-06-04T05:30:11Z',
    action: 'Copia de seguridad incremental del servidor de EAS Consulting',
    user: 'CronJob Backup',
    ip: '10.0.4.15',
    component: 'Cloud Backups',
    status: 'SUCCESS'
  },
  {
    id: 'log-4',
    timestamp: '2026-06-04T05:40:00Z',
    action: 'Inicio de sesión - Rol de Reclutador asignado a eaguilarh@gmail.com',
    user: 'eaguilarh@gmail.com',
    ip: '189.145.22.4',
    component: 'Manejo de Permisos Acceso',
    status: 'SUCCESS'
  }
];
