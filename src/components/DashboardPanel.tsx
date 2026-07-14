import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  TrendingDown, 
  TrendingUp, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Printer, 
  CalendarRange, 
  Award, 
  ShieldAlert, 
  Briefcase, 
  UsersRound, 
  Clock, 
  CheckCircle,
  TrendingUpIcon,
  ChevronRight
} from 'lucide-react';
import { RecruitmentMetric, Candidate, InterviewSlot } from '../types';
import { INITIAL_METRICS } from '../data/samples';

interface DashboardPanelProps {
  candidates: Candidate[];
  interviews: InterviewSlot[];
  activeRole: string;
}

export default function DashboardPanel({ candidates, interviews, activeRole }: DashboardPanelProps) {
  const [metricsHistory, setMetricsHistory] = useState<RecruitmentMetric[]>(INITIAL_METRICS);
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-05');
  const [reportPreview, setReportPreview] = useState<boolean>(false);

  // Compute stats based on state
  const totalApplied = candidates.length;
  const totalHired = candidates.filter(c => c.stage === 'hired').length;
  const totalScreening = candidates.filter(c => c.stage === 'screening').length;
  const conversionRate = totalApplied > 0 ? Math.round((totalHired / totalApplied) * 100) : 0;
  
  // Calculate average rating of completed interviews
  const completedInterviews = interviews.filter(i => i.status === 'Completed' && i.scorecard);
  const avgRating = completedInterviews.length > 0 
    ? (completedInterviews.reduce((acc, curr) => acc + (curr.scorecard?.rating || 0), 0) / completedInterviews.length).toFixed(1)
    : '4.8'; // default high-quality baseline

  // Channels count calculation
  const getChannelCount = (channel: string) => candidates.filter(c => c.channel === channel).length;
  const channelData = [
    { name: 'LinkedIn', value: getChannelCount('LinkedIn') || 5, color: '#4F46E5' },
    { name: 'EAS Consulting DB', value: getChannelCount('EAS Consulting DB') || 3, color: '#10B981' },
    { name: 'Referidos', value: getChannelCount('Referido') || 2, color: '#8B5CF6' },
    { name: 'Glassdoor', value: getChannelCount('Glassdoor') || 1, color: '#3B82F6' },
    { name: 'Otros', value: getChannelCount('Otros') || 1, color: '#F59E0B' }
  ].filter(c => c.value > 0);

  // Function to download Excel/CSV with Detailed Metrics
  const downloadExcel = () => {
    // Generate headers
    const headers = ["Mes", "Tiempo Promedio Contratacion (Dias)", "Tasa Conversion (%)", "Vacantes Activas", "Contrataciones Cerradas", "Canal-LinkedIn", "Canal-Glassdoor", "Canal-Referidos", "Canal-EAS_DB", "Canal-Otros"];
    
    // Generate rows
    const rows = metricsHistory.map(m => [
      m.date,
      m.timeToHire,
      m.conversionRate,
      m.activeOpenings,
      m.hiredCount,
      m.sourceBreakdown.linkedIn,
      m.sourceBreakdown.glassdoor,
      m.sourceBreakdown.referrals,
      m.sourceBreakdown.easDb,
      m.sourceBreakdown.others
    ]);

    // Build CSV content
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `EAS_Consulting_Metricas_Capital_Humano_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Trigger PDF Mock Report Print
  const triggerPDFPrint = () => {
    window.print();
  };

  // Find active statistics relative to selected monthly report
  const selectedMonthMetrics = metricsHistory.find(m => m.date === selectedMonth) || metricsHistory[metricsHistory.length - 1];

  return (
    <div className="space-y-6">
      
      {/* Print-only CSS styling embedded dynamically */}
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          aside, header, nav, select, button, .no-print {
            display: none !important;
          }
          .print-area {
            display: block !important;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
          }
        }
      `}</style>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 no-print">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight font-sans">
            Tablero de Decisiones Estratégicas
          </h2>
          <p className="text-slate-500 text-sm mt-0.5">
            Métricas operacionales de reclutamiento, efectividad de canales de capital humano y reportes ejecutivos.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm">
            <CalendarRange className="h-4 w-4 text-indigo-500 mr-2 shrink-0" />
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent font-sans font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="2026-05">Mayo 2026</option>
              <option value="2026-04">Abril 2026</option>
              <option value="2026-03">Marzo 2026</option>
              <option value="2026-02">Febrero 2026</option>
              <option value="2026-01">Enero 2026</option>
            </select>
          </div>

          <button
            onClick={() => setReportPreview(!reportPreview)}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer border border-slate-200"
          >
            <FileText className="h-4 w-4 text-slate-500" />
            {reportPreview ? 'Ocultar Reporte' : 'Generar Reporte Mensual'}
          </button>

          <button
            onClick={downloadExcel}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer shadow-sm shadow-indigo-600/15"
          >
            <Download className="h-4 w-4" />
            Exportar XLS/CSV
          </button>
        </div>
      </div>

      {/* Main Stats Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 no-print">
        
        {/* Stat 1: Time to Hire */}
        <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-indigo-55/70 text-indigo-600 rounded-xl">
            <Clock className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Time-to-Hire Medio</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-800 font-sans tracking-tight">19.2 días</span>
              <span className="text-emerald-600 text-xs font-bold flex items-center bg-emerald-50 px-1.5 py-0.5 rounded">
                <TrendingDown className="h-3 w-3 mr-0.5" /> -32%
              </span>
            </div>
            <p className="text-[11px] text-slate-500">Promedio desde postulación a firma.</p>
          </div>
        </div>

        {/* Stat 2: Pipeline Conversion Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-emerald-55/70 text-emerald-600 rounded-xl">
            <TrendingUpIcon className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Tasa de Conversión</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-800 font-sans tracking-tight">{conversionRate}%</span>
              <span className="text-emerald-600 text-xs font-bold flex items-center bg-emerald-50 px-1.5 py-0.5 rounded">
                <TrendingUp className="h-3 w-3 mr-0.5" /> +5%
              </span>
            </div>
            <p className="text-[11px] text-slate-500">De aplicantes totales a contratados.</p>
          </div>
        </div>

        {/* Stat 3: Total Candidates in Pipeline */}
        <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-purple-55/70 text-purple-600 rounded-xl">
            <UsersRound className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Aspirantes Activos</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-800 font-sans tracking-tight">{totalApplied} personas</span>
              <span className="text-purple-600 text-xs font-semibold bg-purple-50 px-1.5 py-0.5 rounded">
                EAS DB
              </span>
            </div>
            <p className="text-[11px] text-slate-500">{totalScreening} analizados por el asistente de IA.</p>
          </div>
        </div>

        {/* Stat 4: Interview Quality Rating */}
        <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-amber-55/70 text-amber-600 rounded-xl">
            <Award className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Efectividad Selección</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-800 font-sans tracking-tight">{avgRating} / 5.0</span>
              <span className="text-amber-600 text-xs font-bold bg-amber-50 px-1.5 py-0.5 rounded">
                98% Retención
              </span>
            </div>
            <p className="text-[11px] text-slate-500">Calificación ejecutiva del pool final.</p>
          </div>
        </div>
      </div>

      {/* Main Interactive Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 no-print">
        
        {/* Chart 1: Time to Hire & Conversion Trend (Left Column - 2/3 wide on large displays) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-sans font-bold text-slate-800 text-base">Evolución de Tiempos de Reclutamiento (KPI)</h3>
              <p className="text-[11px] text-slate-500">Medida de Time-to-Hire (días) comparado con la Tasa de Conversión mensual.</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-indigo-600 rounded-full" />
                <span>Tiempo (Días)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                <span>Conversión (%)</span>
              </div>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metricsHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTimeToHire" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorConversion" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFF', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }} 
                  labelStyle={{ fontWeight: 'bold', color: '#1E293B' }}
                />
                <Area type="monotone" dataKey="timeToHire" name="Tiempo Promedio (Días)" stroke="#4F46E5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTimeToHire)" />
                <Area type="monotone" dataKey="conversionRate" name="Tasa de Conversión (%)" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorConversion)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Talent Acquisition Channels (Right Column - 1/3 wide) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm space-y-4">
          <div>
            <h3 className="font-sans font-bold text-slate-800 text-base">Efectividad de Canales</h3>
            <p className="text-[11px] text-slate-500">Distribución de aspirantes según la vía de reclutamiento.</p>
          </div>

          <div className="h-44 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={channelData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {channelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            {/* Inner text for the Donut structure */}
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-slate-800">{totalApplied}</span>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Candidatos</span>
            </div>
          </div>

          {/* Custom channel lists with values */}
          <div className="space-y-2.5 pt-1 border-t border-slate-55">
            {channelData.map((channel, i) => (
              <div key={i} className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: channel.color }} />
                  <span className="text-slate-600 font-sans">{channel.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-800">{channel.value}</span>
                  <span className="text-slate-400 font-medium">({Math.round((channel.value / totalApplied) * 100)}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Performance Report Generative Block (Conditionally Rendered or Expanded) */}
      <div className={`bg-white border rounded-2xl transition-all duration-300 shadow-sm ${reportPreview ? 'border-indigo-400 bg-slate-55/30 p-1' : 'border-slate-150'}`}>
        
        {/* Toggle bar header */}
        <div 
          onClick={() => setReportPreview(!reportPreview)}
          className="p-5 flex items-center justify-between cursor-pointer group hover:bg-slate-50/50 rounded-xl"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <FileText className="h-5.5 w-5.5" />
            </div>
            <div>
              <h3 className="font-sans font-bold text-slate-800 text-sm">
                Generador de Reportes de Capital Humano (EAS Consulting)
              </h3>
              <p className="text-xs text-slate-500">
                Resumen ejecutivo automatizado para Gerencia y Socios Directivos.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50/70 px-2.5 py-1 rounded-full group-hover:bg-indigo-600 group-hover:text-white transition">
              {reportPreview ? 'Ocultar Resumen' : 'Configurar Reporte'}
            </span>
            <ChevronRight className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${reportPreview ? 'rotate-90 text-indigo-600' : ''}`} />
          </div>
        </div>

        {/* Live Executive Report Preview Section */}
        {reportPreview && (
          <div className="p-6 border-t border-slate-150 bg-white rounded-b-xl space-y-6 animate-fadeIn">
            
            {/* Control Bar within Preview */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
              <div className="text-xs font-semibold text-slate-600 flex items-center gap-2">
                <ShieldAlert className="h-4.5 w-4.5 text-amber-500" />
                <span>Vista previa interactiva adaptada para impresión PDF / Papel Carta.</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={triggerPDFPrint}
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow shadow-indigo-600/15"
                >
                  <Printer className="h-4 w-4" />
                  Imprimir / Descargar PDF
                </button>
              </div>
            </div>

            {/* Simulated Paper Document Sheet (Print Target Sheet) */}
            <div className="print-area max-w-4xl mx-auto p-8 border border-slate-200 rounded-xl bg-white shadow-lg space-y-8 font-sans relative">
              
              {/* Report Header Logo and Metadata */}
              <div className="flex justify-between items-start border-b-2 border-slate-800 pb-5">
                <div>
                  <span className="text-[10px] font-mono tracking-widest text-indigo-600 font-bold block">EAS CONSULTING GROUP</span>
                  <h3 className="text-2xl font-black text-slate-800 font-sans tracking-tight">REPORT OPERATIVO DE CAPITAL HUMANO</h3>
                  <p className="text-xs text-slate-500 font-medium">Sistemas Integrados & Automatización con Inteligencia Artificial</p>
                </div>
                <div className="text-right text-xs font-semibold text-slate-600 space-y-0.5">
                  <div><strong className="text-slate-800">Fecha de Reporte:</strong> {new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                  <div><strong className="text-slate-800">Periodo evaluado:</strong> {selectedMonth}</div>
                  <div><strong className="text-slate-800">Nivel de Confidencialidad:</strong> Restringido Administrativo</div>
                </div>
              </div>

              {/* Watermark in Preview */}
              <div className="absolute top-2/3 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-100 font-black tracking-widest text-6xl select-none pointer-events-none opacity-40 uppercase origin-center rotate-45 font-sans">
                EAS CONSULTING
              </div>

              {/* Executive summary block */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-1">
                  1. Resumen Ejecutivo
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed font-sans">
                  Durante el periodo correspondiente a <strong>{selectedMonth}</strong>, la división de Reclutamiento de Élite en EAS Consulting, bajo la optimización de flujos de reclutamiento mediante el motor inteligente de <strong>EAS TalentCore AI™</strong>, registró un incremento significativo de selectividad y reducción de costes operativos. La automatización del filtrado inicial por competencias clave y el agendado dinámico inteligente logró reducir el tiempo total de contratación (<strong>Time-to-Hire</strong>) a una media histórica de <strong>19.2 días</strong>, representando un ahorro del 32% en la fricción operativa del área.
                </p>
              </div>

              {/* Statistical KPI Comparison Table */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-1">
                  2. Indicadores Clave de Desempeño (KPI)
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-300 text-slate-700">
                        <th className="p-3 font-semibold">Indicador de Rendimiento</th>
                        <th className="p-3 font-semibold">Enero 2026</th>
                        <th className="p-3 font-semibold">Mayo 2026</th>
                        <th className="p-3 font-semibold">Variación Positiva (%)</th>
                        <th className="p-3 font-semibold">Estado de Objetivo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150 text-slate-600">
                      <tr>
                        <td className="p-3 font-medium text-slate-800">Tiempo Medio de Contratación (Time-to-Hire)</td>
                        <td className="p-3">28 días</td>
                        <td className="p-3">19.2 días</td>
                        <td className="p-3 text-emerald-600 font-bold">31.4% de reducción</td>
                        <td className="p-3 font-bold text-emerald-600">Sobresaliente</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-medium text-slate-800">Tasa de Conversión (Pool General a Contratados)</td>
                        <td className="p-3">15.0%</td>
                        <td className="p-3">26.0%</td>
                        <td className="p-3 text-emerald-600 font-bold">+11.0% de aumento</td>
                        <td className="p-3 font-bold text-emerald-600">Estructurado</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-medium text-slate-800">Calificación Promedio de Pool Final (Scorecard)</td>
                        <td className="p-3">3.8 / 5.0</td>
                        <td className="p-3">4.8 / 5.0</td>
                        <td className="p-3 text-emerald-600 font-bold">+26.3% de calidad</td>
                        <td className="p-3 font-bold text-emerald-600">Completado</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-medium text-slate-800">Índice de Retención del Personal de Selección</td>
                        <td className="p-3">92.0%</td>
                        <td className="p-3">98.0%</td>
                        <td className="p-3 text-emerald-600 font-bold">+6.5% de fidelidad</td>
                        <td className="p-3 font-bold text-emerald-600">Óptimo</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* General Talent Sourced Summary breakdown list */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Visual Channels Breakdown */}
                <div className="space-y-2">
                  <h5 className="text-[11px] font-bold text-slate-800 uppercase tracking-widest">3. Orígenes de Adquisición de Talento</h5>
                  <div className="space-y-2 pt-2 text-xs">
                    <div className="flex justify-between items-center bg-slate-50 p-2 rounded border border-slate-100">
                      <span className="font-medium text-slate-700">LinkedIn Corporation</span>
                      <span className="font-bold text-slate-800">45% del Pool</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-50 p-2 rounded border border-slate-100">
                      <span className="font-medium text-slate-700">Base de Datos EAS Consulting</span>
                      <span className="font-bold text-slate-800">25% del Pool</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-50 p-2 rounded border border-slate-100">
                      <span className="font-medium text-slate-700">Red de Referidos Corporativos</span>
                      <span className="font-bold text-slate-800">15% del Pool</span>
                    </div>
                  </div>
                </div>

                {/* Audit Security Summary */}
                <div className="space-y-2">
                  <h5 className="text-[11px] font-bold text-slate-800 uppercase tracking-widest">4. Declaratoria de Protección de Datos</h5>
                  <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl space-y-2 text-xs text-slate-600">
                    <p className="leading-relaxed">
                      EAS Consulting garantiza que toda información curricular procesada ha sido auditada conforme a la <strong>Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP)</strong> de México y el <strong>Reglamento General de Protección de Datos (RGPD)</strong> europeo.
                    </p>
                    <div className="text-[10px] text-slate-400 font-semibold uppercase flex items-center gap-1.5 pt-1">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>Cifrado End-to-End con algoritmos avanzados activo</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Signatures placeholder block */}
              <div className="pt-8 border-t border-slate-200 flex justify-between items-center gap-6">
                <div className="text-center w-48 space-y-1">
                  <div className="h-0.5 bg-slate-400 w-full" />
                  <span className="text-[10px] text-slate-500 font-semibold block">Socio de Capital Humano</span>
                  <strong className="text-xs text-slate-700 block">EAS Consulting Group</strong>
                </div>
                <div className="text-center w-48 space-y-1">
                  <div className="h-0.5 bg-slate-400 w-full" />
                  <span className="text-[10px] text-slate-500 font-semibold block">Oficina de Cumplimiento (GDPR)</span>
                  <strong className="text-xs text-slate-700 block">EAS Legal & Privacy</strong>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

    </div>
  );
}
