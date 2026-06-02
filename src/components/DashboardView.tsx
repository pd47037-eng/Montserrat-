/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Users,
  Award,
  BookOpen,
  TrendingUp,
  LineChart as LineIcon,
  BarChart4,
  CheckCircle,
  AlertTriangle,
  User,
  ChevronDown,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  ReferenceLine,
} from 'recharts';
import { Student, Activity, Grade } from '../types';

interface DashboardViewProps {
  students: Student[];
  activities: Activity[];
  grades: Grade[];
}

export default function DashboardView({ students, activities, grades }: DashboardViewProps) {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [dashboardTab, setDashboardTab] = useState<'individual' | 'group'>('group');

  // helper calculate student trimester averages
  const getStudentTrimesterAvg = (studentId: string, trimester: 1 | 2 | 3) => {
    const trimesterActivities = activities.filter((a) => a.trimester === trimester);
    if (trimesterActivities.length === 0) return null;

    let sum = 0;
    let count = 0;
    for (const act of trimesterActivities) {
      const grade = grades.find((g) => g.studentId === studentId && g.activityId === act.id);
      if (grade !== undefined && grade !== null) {
        sum += grade.score;
        count++;
      }
    }
    return count > 0 ? Number((sum / count).toFixed(2)) : null;
  };

  const getStudentFinalAvg = (studentId: string) => {
    const t1 = getStudentTrimesterAvg(studentId, 1);
    const t2 = getStudentTrimesterAvg(studentId, 2);
    const t3 = getStudentTrimesterAvg(studentId, 3);
    const valid = [t1, t2, t3].filter((t): t is number => t !== null);
    if (valid.length === 0) return 0;
    return Number((valid.reduce((sum, v) => sum + v, 0) / valid.length).toFixed(2));
  };

  // Group stats calculations
  const totalStudents = students.length;
  const totalActivities = activities.length;

  // Class Final Grades list
  const classFinalGrades = students
    .map((s) => getStudentFinalAvg(s.id))
    .filter((g) => g > 0);

  const groupAverage =
    classFinalGrades.length > 0
      ? Number((classFinalGrades.reduce((sum, v) => sum + v, 0) / classFinalGrades.length).toFixed(2))
      : 0;

  const passedCount = classFinalGrades.filter((g) => g >= 6.0).length;
  const passingRate =
    totalStudents > 0 ? Number(((passedCount / totalStudents) * 100).toFixed(1)) : 0;

  // Grade Categories Distribution Data for Group Chart
  // Mexican grading ranges: Insuficiente (<6.0), Suficiente (6.0 - 6.9), Satisfactorio (7.0 - 8.4), Sobresaliente (8.5 - 10.0)
  const getGradeCategoryCount = () => {
    let insuficiente = 0;
    let suficiente = 0;
    let satisfactorio = 0;
    let sobresaliente = 0;

    classFinalGrades.forEach((score) => {
      if (score < 6.0) insuficiente++;
      else if (score < 7.0) suficiente++;
      else if (score < 8.5) satisfactorio++;
      else sobresaliente++;
    });

    return [
      { name: 'Insuficiente (<6.0)', count: insuficiente, color: '#f43f5e' },
      { name: 'Suficiente (6.0-6.9)', count: suficiente, color: '#f59e0b' },
      { name: 'Satisfactorio (7.0-8.4)', color: '#3b82f6', count: satisfactorio },
      { name: 'Sobresaliente (8.5-10)', color: '#10b981', count: sobresaliente },
    ];
  };

  const distributionData = getGradeCategoryCount();

  // Progress trend data (averages per activity) for Line Chart
  const getActivityAverages = () => {
    return activities
      .map((act) => {
        const actGrades = grades.filter((g) => g.activityId === act.id);
        const sum = actGrades.reduce((acc, g) => acc + g.score, 0);
        const avg = actGrades.length > 0 ? Number((sum / actGrades.length).toFixed(2)) : 0;
        return {
          id: act.id,
          name: act.name,
          trimester: `Trimestre ${act.trimester}`,
          shortName: act.name.length > 15 ? `${act.name.substring(0, 15)}...` : act.name,
          promedio: avg,
        };
      })
      .sort((a, b) => a.id.localeCompare(b.id));
  };

  const activityAveragesData = getActivityAverages();

  // Selected student individual data
  const currentStudent = students.find((s) => s.id === selectedStudentId);
  const studentFinalGrade = currentStudent ? getStudentFinalAvg(currentStudent.id) : 0;

  const getIndividualGradesTrend = () => {
    if (!selectedStudentId) return [];
    return activities
      .map((act) => {
        const gradeObj = grades.find(
          (g) => g.studentId === selectedStudentId && g.activityId === act.id
        );
        // Get class average for comparison
        const actGrades = grades.filter((g) => g.activityId === act.id);
        const classAvg =
          actGrades.length > 0
            ? Number((actGrades.reduce((sum, g) => sum + g.score, 0) / actGrades.length).toFixed(2))
            : 0;

        return {
          name: act.name,
          shortName: act.name.length > 15 ? `${act.name.substring(0, 15)}...` : act.name,
          trimester: `T${act.trimester}`,
          calificacion: gradeObj !== undefined ? gradeObj.score : 0,
          promedioGrupal: classAvg,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  const individualGradesData = getIndividualGradesTrend();

  // Comparison in term averages: Individual vs Group
  const getTrimesterComparisonData = () => {
    if (!selectedStudentId) return [];
    return [1, 2, 3].map((t) => {
      // Individual
      const individualAvg = getStudentTrimesterAvg(selectedStudentId, t as 1 | 2 | 3);

      // Group
      const termActs = activities.filter((a) => a.trimester === t);
      const termActIds = termActs.map((a) => a.id);
      const termGrades = grades.filter((g) => termActIds.includes(g.activityId));
      const groupAvg =
        termGrades.length > 0
          ? Number((termGrades.reduce((sum, g) => sum + g.score, 0) / termGrades.length).toFixed(2))
          : 0;

      return {
        name: `Trimestre ${t}`,
        alumno: individualAvg !== null ? individualAvg : 0,
        grupo: groupAvg,
      };
    });
  };

  const trimesterComparisonData = getTrimesterComparisonData();

  // Text diagnostics
  const getStudentCritique = () => {
    if (!selectedStudentId) return null;
    const studentGrades = grades.filter((g) => g.studentId === selectedStudentId);
    if (studentGrades.length === 0) {
      return 'No hay suficientes calificaciones registradas para evaluar el progreso académico de esta persona aún.';
    }

    const maxGrade = [...studentGrades].sort((a, b) => b.score - a.score)[0];
    const minGrade = [...studentGrades].sort((a, b) => a.score - b.score)[0];

    const maxAct = activities.find((a) => a.id === maxGrade.activityId);
    const minAct = activities.find((a) => a.id === minGrade.activityId);

    const isPassing = studentFinalGrade >= 6.0;

    let analysisText = `**${currentStudent?.name}** tiene un promedio general de **${studentFinalGrade.toFixed(
      2
    )}**, lo cual se clasifica como académico **${isPassing ? 'APROBADO' : 'REPROBADO'}**. `;

    if (maxAct && maxGrade.score >= 8.5) {
      analysisText += `Su mayor fortaleza se destaca en la actividad **"${maxAct.name}"** del Trimestre ${maxAct.trimester}, donde obtuvo un excelente **${maxGrade.score}**. `;
    }

    if (minAct && minGrade.score < 7.0) {
      analysisText += `No obstante, presenta un área de oportunidad importante en **"${minAct.name}"** del Trimestre ${minAct.trimester}, obteniendo una calificación baja de **${minGrade.score}**. `;
      if (minGrade.score < 6.0) {
        analysisText += `Se aconseja al docente organizar círculos escolares de regularización interactiva o tareas de apoyo complementario inmediato para mitigar el rezago académico en esta competencia cognitiva.`;
      }
    } else {
      analysisText += `Mantiene un desempeño equilibrado y constante en todas las evaluaciones realizadas hasta el momento. ¡Buen progreso continuo!`;
    }

    return analysisText;
  };

  return (
    <div className="space-y-6 animate-fade-in" id="dashboard-main-container">
      {/* Visual Analytics Quick Stats Widgets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="stats-cards-grid">
        {/* Card Avg */}
        <div className="bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 shadow-xl flex items-center space-x-4">
          <div className="p-3 bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded-xl">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Promedio General</p>
            <h3 className="text-lg sm:text-xl font-bold text-white font-mono mt-0.5">{groupAverage.toFixed(2)} / 10</h3>
            <p className="text-xs text-slate-400">Promedio general del grupo</p>
          </div>
        </div>

        {/* Card Pass Rate */}
        <div className="bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 shadow-xl flex items-center space-x-4">
          <div className={`p-3 rounded-xl border ${passingRate >= 70 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
            <Award className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tasa de Aprobación</p>
            <h3 className="text-lg sm:text-xl font-bold text-white font-mono mt-0.5">{passingRate}%</h3>
            <p className="text-xs text-slate-400">Alumnos aprobados (Cal. &gt;= 6.0)</p>
          </div>
        </div>

        {/* Card Students count */}
        <div className="bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 shadow-xl flex items-center space-x-4">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl">
            <Users className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Matrícula Escolar</p>
            <h3 className="text-lg sm:text-xl font-bold text-white font-mono mt-0.5">{totalStudents}</h3>
            <p className="text-xs text-slate-400">Alumnos activos inscritos</p>
          </div>
        </div>

        {/* Card Projects/Activities */}
        <div className="bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 shadow-xl flex items-center space-x-4">
          <div className="p-3 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl">
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Evaluaciones</p>
            <h3 className="text-lg sm:text-xl font-bold text-white font-mono mt-0.5">{totalActivities}</h3>
            <p className="text-xs text-slate-400">Tareas y exámenes creados</p>
          </div>
        </div>
      </div>

      {/* Selector of Dashboard view level: Group vs Individual */}
      <div className="flex bg-[#0a0724]/60 p-1 rounded-xl border border-white/10 w-max" id="dashboard-tabs-group">
        <button
          onClick={() => setDashboardTab('group')}
          id="dashboard-tab-group-btn"
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            dashboardTab === 'group'
              ? 'bg-white/15 text-white border border-white/15 shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="flex items-center space-x-1.5">
            <Users className="w-4 h-4 text-indigo-450" />
            <span>Métricas del Grupo Colectivo</span>
          </div>
        </button>
        <button
          onClick={() => setDashboardTab('individual')}
          id="dashboard-tab-indiv-btn"
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            dashboardTab === 'individual'
              ? 'bg-white/15 text-white border border-white/15 shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="flex items-center space-x-1.5">
            <User className="w-4 h-4 text-indigo-455" />
            <span>Seguimiento Académico Individual</span>
          </div>
        </button>
      </div>

      {dashboardTab === 'group' ? (
        // GROUP COLLECTIVE STATS VIEW
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6" id="group-charts-grid">
          {/* Chart 1: Distribution of Grades */}
          <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-xl flex flex-col h-[400px]">
            <div className="mb-4">
              <h3 className="text-sm sm:text-base font-semibold text-slate-100 font-display">Distribución de Aprovechamiento Académico</h3>
              <p className="text-xs text-slate-400">Distribución de estudiantes del salón por categoría de calificaciones.</p>
            </div>
            
            <div className="flex-1 min-h-0 w-full" id="group-dist-chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distributionData} margin={{ top: 20, right: 10, left: -25, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.08)" />
                  <XAxis dataKey="name" tick={{ fill: '#cbd5e1', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#cbd5e1', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0d0a27', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', color: '#fff' }}
                    labelStyle={{ fontWeight: 'bold', color: '#e2e8f0' }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={50}>
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Average Per Activity */}
          <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-xl flex flex-col h-[400px]">
            <div className="mb-4">
              <h3 className="text-sm sm:text-base font-semibold text-slate-100 font-display">Promedio General por Actividad Evaluada</h3>
              <p className="text-xs text-slate-400">Evolución de calificaciones medias del grupo a lo largo del programa.</p>
            </div>

            <div className="flex-1 min-h-0 w-full" id="group-averages-chart">
              {activityAveragesData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={activityAveragesData} margin={{ top: 15, right: 20, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.08)" />
                    <XAxis dataKey="shortName" tick={{ fill: '#cbd5e1', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 10]} tick={{ fill: '#cbd5e1', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0d0a27', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', color: '#fff' }}
                    />
                    <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: 11, color: '#e2e8f0' }} />
                    <ReferenceLine y={6.0} stroke="#f43f5e" strokeDasharray="4 4" label={{ value: 'Mínimo Aprobatorio', fill: '#f43f5e', fontSize: 10, position: 'insideBottomRight' }} />
                    <Line
                      type="monotone"
                      dataKey="promedio"
                      name="Promedio Grupo"
                      stroke="#818cf8"
                      strokeWidth={3}
                      activeDot={{ r: 6 }}
                      dot={{ r: 4, strokeWidth: 1 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm italic">
                  No hay suficientes actividades registradas para mostrar la tendencia.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        // INDIVIDUAL TRACKING VIEW
        <div className="space-y-6" id="indiv-charts-card">
          {/* Quick Select Student */}
          <div className="bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 sm:p-2.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl">
                <User className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Alumno Seleccionado</span>
                <div className="relative inline-block text-left glass-dropdown" id="student-dropdown">
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    id="student-dashboard-selector"
                    className="pr-10 pl-3 py-1.5 font-bold text-white text-md border border-white/10 focus:border-indigo-500 focus:outline-none transition-all cursor-pointer rounded-xl bg-[#0d0a27]"
                  >
                    {students.map((st) => (
                      <option key={st.id} value={st.id} className="bg-[#0d0a27] text-white">
                        {st.name} ({st.rollNumber})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Promedio Final General</span>
              <span className={`text-2xl font-black font-mono tracking-tight ${studentFinalGrade >= 6.0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {studentFinalGrade.toFixed(2)}
              </span>
              <span className="text-xs text-slate-300 block">
                {studentFinalGrade >= 6.0 ? '✓ Alumno Aprobado' : '⚠ Semáforo de Rezago'}
              </span>
            </div>
          </div>

          {/* Individual Dashboard Charts Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6" id="individual-charts-dashboard-row">
            {/* Chart 1: Progress Timeline over activities */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-xl flex flex-col h-[380px] xl:col-span-2">
              <div className="mb-4">
                <h3 className="text-sm sm:text-base font-semibold text-slate-100 font-display">Línea de Progreso por Actividad</h3>
                <p className="text-xs text-slate-400">Historial completo comparando la calificación del alumno con la media de la clase.</p>
              </div>

              <div className="flex-1 min-h-0 w-full" id="indiv-progress-chart">
                {individualGradesData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={individualGradesData} margin={{ top: 15, right: 20, left: -25, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.08)" />
                      <XAxis dataKey="shortName" tick={{ fill: '#cbd5e1', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 10]} tick={{ fill: '#cbd5e1', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0d0a27', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', color: '#fff' }}
                      />
                      <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: 11, color: '#e2e8f0' }} />
                      <ReferenceLine y={6.0} stroke="#f43f5e" strokeDasharray="3 3" label={{ value: 'Aprobación', fill: '#f43f5e', fontSize: 9, position: 'insideBottomRight' }} />
                      <Line
                        type="monotone"
                        dataKey="calificacion"
                        name={currentStudent?.name || 'Alumno'}
                        stroke="#2dd4bf"
                        strokeWidth={3}
                        activeDot={{ r: 6 }}
                        dot={{ r: 4, strokeWidth: 1 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="promedioGrupal"
                        name="Promedio Clase"
                        stroke="#64748b"
                        strokeWidth={1.5}
                        strokeDasharray="4 4"
                        dot={{ r: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 text-sm italic">
                    No hay calificaciones cargadas para esta persona.
                  </div>
                )}
              </div>
            </div>

            {/* Chart 2: Trimester Comparison (Individual vs Group) */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-xl flex flex-col h-[380px]">
              <div className="mb-4">
                <h3 className="text-sm sm:text-base font-semibold text-slate-100 font-display">Cierre Académico por Trimestre</h3>
                <p className="text-xs text-slate-400">Comparativa trimestral del promedio académico.</p>
              </div>

              <div className="flex-1 min-h-0 w-full" id="indiv-term-charts">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trimesterComparisonData} margin={{ top: 15, right: 10, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.08)" />
                    <XAxis dataKey="name" tick={{ fill: '#cbd5e1', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 10]} tick={{ fill: '#cbd5e1', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0d0a27', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', color: '#fff' }}
                    />
                    <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: 11, color: '#e2e8f0' }} />
                    <Bar dataKey="alumno" name={currentStudent?.name.split(' ')[0] || 'Alumno'} fill="#2dd4bf" radius={[4, 4, 0, 0]} maxBarSize={30} />
                    <Bar dataKey="grupo" name="Clase" fill="#475569" radius={[4, 4, 0, 0]} maxBarSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Diagnostic Box Description */}
          <div className="bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 shadow-xl space-y-3" id="indiv-critique-card">
            <h4 className="text-sm font-semibold text-slate-100 flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <span className="font-display text-base">Diagnóstico de Desempeño Escolar</span>
            </h4>
            
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal italic">
              {getStudentCritique() ? (
                getStudentCritique()?.split('**').map((chunk, i) => {
                  return i % 2 === 1 ? <strong key={i} className="text-indigo-300 font-semibold">{chunk}</strong> : chunk;
                })
              ) : (
                'Sin reporte disponible.'
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
