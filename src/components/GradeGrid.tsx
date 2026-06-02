/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Edit2, Save, X, Search, Filter, Info, Award, HelpCircle, CheckCircle2 } from 'lucide-react';
import { Student, Activity, Grade } from '../types';

interface GradeGridProps {
  students: Student[];
  activities: Activity[];
  grades: Grade[];
  onUpdateGrade: (studentId: string, activityId: string, score: number) => void;
}

export default function GradeGrid({
  students,
  activities,
  grades,
  onUpdateGrade,
}: GradeGridProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTrimesterTab, setActiveTrimesterTab] = useState<'all' | 1 | 2 | 3>('all');
  
  // Cell Inline Editing States
  // key: "studentId:activityId"
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  // Helpers to calculate Trimester Average for a student
  const calcTrimesterAverage = (studentId: string, trimester: 1 | 2 | 3) => {
    const trimesterActivities = activities.filter(a => a.trimester === trimester);
    if (trimesterActivities.length === 0) return null;

    let totalPoints = 0;
    let totalGraded = 0;

    for (const act of trimesterActivities) {
      const grade = grades.find(g => g.studentId === studentId && g.activityId === act.id);
      if (grade !== undefined && grade !== null) {
        totalPoints += grade.score;
        totalGraded++;
      }
    }

    return totalGraded > 0 ? Number((totalPoints / totalGraded).toFixed(2)) : null;
  };

  const calcFinalAverage = (studentId: string) => {
    const t1 = calcTrimesterAverage(studentId, 1);
    const t2 = calcTrimesterAverage(studentId, 2);
    const t3 = calcTrimesterAverage(studentId, 3);

    const validTerms = [t1, t2, t3].filter((t): t is number => t !== null);
    if (validTerms.length === 0) return null;

    const sum = validTerms.reduce((acc, score) => acc + score, 0);
    return Number((sum / validTerms.length).toFixed(2));
  };

  // Inline edit handlers
  const handleStartEdit = (studentId: string, activityId: string, currentScore?: number) => {
    setEditingCell(`${studentId}:${activityId}`);
    setEditValue(currentScore !== undefined ? String(currentScore) : '');
  };

  const handleSaveEdit = (studentId: string, activityId: string) => {
    const numValue = parseFloat(editValue);
    
    if (editValue.trim() === '') {
      // Treat empty as removing or set to 0, let's allow removing or setting to 0. 
      // Setting to 0 or keeping empty is fine. We will save as 0 or delete grade.
      // Let's standardise saving it as 0 or checking bounds:
      onUpdateGrade(studentId, activityId, 0);
    } else if (!isNaN(numValue)) {
      // Validate bounds (Mexican grading scale is typically 0 to 10)
      if (numValue < 0 || numValue > 10) {
        alert('Por favor introduce una calificación válida entre 0.0 y 10.0');
        return;
      }
      onUpdateGrade(studentId, activityId, Number(numValue.toFixed(1)));
    }
    setEditingCell(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, studentId: string, activityId: string) => {
    if (e.key === 'Enter') {
      handleSaveEdit(studentId, activityId);
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  };

  // Filters
  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayedActivities = activities.filter(a =>
    activeTrimesterTab === 'all' || a.trimester === activeTrimesterTab
  );

  // Status Styling Helper
  const getGradeStyle = (score: number | undefined | null) => {
    if (score === undefined || score === null) return 'text-slate-500 font-normal';
    if (score < 6.0) return 'text-rose-400 bg-rose-500/10 font-bold';
    if (score >= 9.0) return 'text-emerald-400 bg-emerald-500/10 font-bold';
    return 'text-slate-200 font-medium bg-white/5';
  };

  const getAverageStyle = (score: number | null) => {
    if (score === null) return 'text-slate-500';
    if (score < 6.0) return 'text-rose-400 font-bold';
    if (score >= 9.0) return 'text-emerald-400 font-bold';
    return 'text-slate-300 font-semibold';
  };

  return (
    <div className="space-y-6" id="grades-grid-wrapper">
      {/* Search and Filters Header */}
      <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-xl shadow-black/10" id="grades-filters-box">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar por nombre o matrícula de alumno..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            id="grade-student-search"
            className="w-full pl-9 pr-4 py-2 text-sm bg-white/5 border border-white/12 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white/10 text-white placeholder-slate-400 transition-all font-medium"
          />
        </div>

        {/* Tab-like switcher for Trimesters */}
        <div className="flex bg-slate-950/40 p-1 rounded-xl border border-white/10 self-start md:self-auto" id="trimester-tabs-group">
          <button
            onClick={() => setActiveTrimesterTab('all')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTrimesterTab === 'all'
                ? 'bg-white/15 text-white border border-white/15 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setActiveTrimesterTab(1)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTrimesterTab === 1
                ? 'bg-white/15 text-white border border-white/15 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Trimestre 1
          </button>
          <button
            onClick={() => setActiveTrimesterTab(2)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTrimesterTab === 2
                ? 'bg-white/15 text-white border border-white/15 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Trimestre 2
          </button>
          <button
            onClick={() => setActiveTrimesterTab(3)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTrimesterTab === 3
                ? 'bg-white/15 text-white border border-white/15 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Trimestre 3
          </button>
        </div>
      </div>

      {/* Grid Instruction Box */}
      <div className="p-3.5 bg-indigo-500/10 border border-indigo-500/25 text-indigo-200 text-xs rounded-xl flex items-center space-x-2.5 shadow-md" id="grades-info-banner">
        <Info className="w-4.5 h-4.5 text-indigo-400 shrink-0" />
        <span>
          <strong>Instrucción de captura rápida:</strong> Haz doble clic en cualquier celda para activar la edición inline. Escribe la calificación (escala <strong>0.0 a 10.0</strong>) y presiona <strong>Enter</strong> para guardarla de inmediato.
        </span>
      </div>

      {/* Multi-Column Grade Spreadsheet Spreadsheet */}
      <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl overflow-hidden" id="grades-spreadsheet-card">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left" id="grades-sheet-table">
            <thead>
              {/* Header block with headers */}
              <tr className="bg-white/5 border-b border-white/10">
                <th className="px-5 py-4 text-xs font-bold text-slate-300 uppercase tracking-wider sticky left-0 bg-[#0d0a27] z-10 w-36 border-r border-white/10">Matrícula</th>
                <th className="px-5 py-4 text-xs font-bold text-slate-300 uppercase tracking-wider sticky left-36 bg-[#0d0a27] z-10 w-64 border-r border-white/15 shadow-[2px_0_5px_rgba(0,0,0,0.15)]">Alumno</th>
                
                {/* Dynamically created activities as columns */}
                {displayedActivities.length > 0 ? (
                  displayedActivities.map((act) => (
                    <th key={act.id} className="px-4 py-4 text-xs font-bold text-slate-300 text-center uppercase tracking-wider min-w-44 border-r border-white/10">
                      <div className="space-y-1">
                        <span className="font-mono text-[9px] text-indigo-300 bg-indigo-500/10 border border-indigo-400/25 px-2 py-0.5 rounded-full uppercase tracking-widest block w-max mx-auto mb-1">
                          T{act.trimester} - {act.weight}%
                        </span>
                        <span className="truncate block max-w-44 font-medium" title={act.name}>
                          {act.name}
                        </span>
                      </div>
                    </th>
                  ))
                ) : (
                  <th className="px-4 py-4 text-xs text-slate-500 italic text-center min-w-40 border-r border-white/10">Sin actividades</th>
                )}

                {/* Promedios Column Blocks */}
                <th className="px-4 py-4 text-xs font-bold text-indigo-300 text-center uppercase bg-indigo-500/10 border-r border-white/10 w-28">Prom T1</th>
                <th className="px-4 py-4 text-xs font-bold text-indigo-300 text-center uppercase bg-indigo-500/10 border-r border-white/10 w-28">Prom T2</th>
                <th className="px-4 py-4 text-xs font-bold text-indigo-300 text-center uppercase bg-indigo-500/10 border-r border-white/15 w-28">Prom T3</th>
                <th className="px-5 py-4 text-xs font-bold text-teal-300 text-center uppercase bg-teal-500/10 w-32 font-semibold">Prom Final</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-white/5 text-sm">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => {
                  const t1 = calcTrimesterAverage(student.id, 1);
                  const t2 = calcTrimesterAverage(student.id, 2);
                  const t3 = calcTrimesterAverage(student.id, 3);
                  const finalAvg = calcFinalAverage(student.id);

                  return (
                    <tr key={student.id} className="hover:bg-white/5 transition-colors border-b border-white/5" id={`row-${student.id}`}>
                      {/* Matrícula column */}
                      <td className="px-5 py-3 font-mono text-xs font-medium text-slate-400 sticky left-0 bg-[#0d0a27] z-10 border-r border-white/10">{student.rollNumber}</td>
                      
                      {/* Name column */}
                      <td className="px-5 py-3 font-bold text-slate-100 sticky left-36 bg-[#0d0a27] z-10 border-r border-white/15 shadow-[2px_0_5px_rgba(0,0,0,0.15)]">
                        <div className="truncate max-w-[200px]" title={student.name}>
                          {student.name}
                        </div>
                      </td>

                      {/* Grade values columns */}
                      {displayedActivities.map((act) => {
                        const cellKey = `${student.id}:${act.id}`;
                        const isEditing = editingCell === cellKey;
                        const gradeObj = grades.find(g => g.studentId === student.id && g.activityId === act.id);
                        const score = gradeObj?.score;

                        return (
                          <td
                            key={act.id}
                            onDoubleClick={() => handleStartEdit(student.id, act.id, score)}
                            className={`px-4 py-2 text-center text-xs font-medium border-r border-white/10 transition-colors select-none ${getGradeStyle(score)} ${
                              isEditing ? 'bg-indigo-500/20 p-1' : 'cursor-pointer hover:bg-white/5'
                            }`}
                            id={`cell-${student.id}-${act.id}`}
                            title="Haz doble clic para cambiar"
                          >
                            {isEditing ? (
                              <div className="flex items-center justify-center">
                                <input
                                  type="text"
                                  autoFocus
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onBlur={() => handleSaveEdit(student.id, act.id)}
                                  onKeyDown={(e) => handleKeyDown(e, student.id, act.id)}
                                  pattern="^[0-9]+(\.[0-9]+)?$"
                                  placeholder="-"
                                  className="w-16 px-1.5 py-1 text-xs bg-slate-950 border border-indigo-400 rounded-lg shadow-inner text-center font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500 tracking-wide text-white"
                                />
                              </div>
                            ) : (
                              <span className="block px-2 py-1 rounded-sm w-full font-mono text-sm tracking-tight text-center">
                                {score !== undefined ? score.toFixed(1) : '-'}
                              </span>
                            )}
                          </td>
                        );
                      })}

                      {/* Display empty cell if no activities displayed */}
                      {displayedActivities.length === 0 && (
                        <td className="px-4 py-3 text-center text-slate-500 italic">No hay columnas</td>
                      )}

                      {/* Averages */}
                      <td className="px-4 py-3 text-center bg-white/3 border-r border-white/10 font-mono text-sm">
                        <span className={`px-2 py-0.5 rounded-sm ${getAverageStyle(t1)}`}>
                          {t1 !== null ? t1.toFixed(2) : '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center bg-white/3 border-r border-white/10 font-mono text-sm">
                        <span className={`px-2 py-0.5 rounded-sm ${getAverageStyle(t2)}`}>
                          {t2 !== null ? t2.toFixed(2) : '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center bg-white/3 border-r border-white/15 font-mono text-sm">
                        <span className={`px-2 py-0.5 rounded-sm ${getAverageStyle(t3)}`}>
                          {t3 !== null ? t3.toFixed(2) : '-'}
                        </span>
                      </td>

                      {/* Overall average */}
                      <td className="px-5 py-3 text-center bg-teal-500/5 font-bold font-mono text-sm">
                        <div className="flex items-center justify-center space-x-1.5">
                          {finalAvg !== null && finalAvg >= 9.0 && (
                            <Award className="w-4 h-4 text-amber-400 shrink-0 inline animate-pulse" />
                          )}
                          <span className={getAverageStyle(finalAvg)}>
                            {finalAvg !== null ? finalAvg.toFixed(2) : '-'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={displayedActivities.length + 6} className="text-center py-12 text-slate-400 italic bg-white/5">
                    Sin alumnos cargados en la lista de calificaciones. Realiza agregados o importa de Sheets.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
