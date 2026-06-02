/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FileDown, Printer, Award, FileSpreadsheet, FileText, Check, AlertCircle, Info } from 'lucide-react';
import { Student, Activity, Grade } from '../types';
import { exportGradesToExcel } from '../excelExport';

interface PDFExportModalProps {
  students: Student[];
  activities: Activity[];
  grades: Grade[];
}

export default function PDFExportModal({ students, activities, grades }: PDFExportModalProps) {
  const [reportType, setReportType] = useState<'individual' | 'group'>('individual');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [isExportingExcel, setIsExportingExcel] = useState(false);

  // Helper trimester average
  const calcTrimesterAvg = (studentId: string, trimester: 1 | 2 | 3) => {
    const termActs = activities.filter(a => a.trimester === trimester);
    if (termActs.length === 0) return null;

    let sum = 0;
    let count = 0;
    for (const act of termActs) {
      const g = grades.find(grade => grade.studentId === studentId && grade.activityId === act.id);
      if (g !== undefined && g !== null) {
        sum += g.score;
        count++;
      }
    }
    return count > 0 ? Number((sum / count).toFixed(2)) : null;
  };

  const calcFinalAvg = (studentId: string) => {
    const t1 = calcTrimesterAvg(studentId, 1);
    const t2 = calcTrimesterAvg(studentId, 2);
    const t3 = calcTrimesterAvg(studentId, 3);
    const valid = [t1, t2, t3].filter((t): t is number => t !== null);
    if (valid.length === 0) return null;
    return Number((valid.reduce((sum, v) => sum + v, 0) / valid.length).toFixed(2));
  };

  const handleExportExcel = () => {
    setIsExportingExcel(true);
    try {
      exportGradesToExcel(students, activities, grades);
    } catch (err) {
      console.error(err);
      alert('Ocurrió un error al generar la descarga de Excel.');
    } finally {
      setIsExportingExcel(false);
    }
  };

  const triggerBrowserPrint = () => {
    // We can trigger standard window.print(). 
    // We will instruct the browser using print-specific CSS styles.
    window.print();
  };

  const currentStudent = students.find(s => s.id === selectedStudentId);

  return (
    <div className="space-y-8 animate-fade-in" id="export-center-wrapper">
      {/* Selection Center Card */}
      <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl p-6" id="exports-control-card">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl">
            <FileDown className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white font-display">Centro de Informes y Descargas</h2>
            <p className="text-xs sm:text-sm text-slate-350">Exporta actas grupales y boletas de calificaciones individuales para control oficial de docentes.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="download-cards-choices">
          {/* Excel Choice */}
          <div className="border border-white/10 bg-white/5 p-5 rounded-2xl hover:border-emerald-500/20 hover:bg-emerald-500/5 transition-all flex flex-col justify-between" id="excel-choice-card">
            <div className="space-y-2">
              <div className="p-2 sm:p-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl w-max mb-1">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white">Planilla Completa Microsoft Excel</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Descarga el acta general consolidada con todas las actividades evaluadas, promedios parciales por trimestre y promedio anual general. Ideal para registros administrativos del centro educativo.
              </p>
            </div>
            <button
              id="export-excel-action-btn"
              onClick={handleExportExcel}
              disabled={isExportingExcel}
              className="mt-5 w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>{isExportingExcel ? 'Generando archivo...' : 'Descargar Planilla General (.xlsx)'}</span>
            </button>
          </div>

          {/* PDF Choice */}
          <div className="border border-white/10 bg-white/5 p-5 rounded-2xl hover:border-indigo-500/20 hover:bg-indigo-500/5 transition-all flex flex-col justify-between" id="pdf-choice-card">
            <div className="space-y-2">
              <div className="p-2 sm:p-2.5 bg-indigo-505 bg-indigo-500/10 text-indigo-405 text-indigo-400 border border-indigo-500/20 rounded-xl w-max mb-1">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white">Generador de Boletas PDF / Impresión</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Genera vistas de impresión de alta resolución optimizadas para guardarlas como PDF o imprimirlas en papel tamaño carta. Incluye membrete oficial y campos para firma docente.
              </p>
            </div>
            <div className="flex gap-2.5 mt-5">
              <button
                id="select-pdf-indiv-btn"
                onClick={() => setReportType('individual')}
                className={`flex-1 px-3 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                  reportType === 'individual'
                    ? 'bg-indigo-600 text-white border-indigo-650 shadow-md'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                }`}
              >
                Boleta Individual
              </button>
              <button
                id="select-pdf-group-btn"
                onClick={() => setReportType('group')}
                className={`flex-1 px-3 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                  reportType === 'group'
                    ? 'bg-indigo-600 text-white border-indigo-650 shadow-md'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                }`}
              >
                Acta de Grupo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Printable Area Preview */}
      <div className="bg-white/5 border border-white/10 rounded-2xl shadow-xl overflow-hidden print:shadow-none print:border-none" id="exports-preview-workspace">
        {/* Workspace banner for preview and trigger print */}
        <div className="bg-slate-950/85 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 shrink-0 print:hidden">
          <div className="text-white space-y-0.5">
            <h3 className="text-sm sm:text-base font-bold tracking-wide text-white">Vista Previa de Documento Oficial</h3>
            <p className="text-[11px] text-slate-400">Este formato se ajusta automáticamente en tamaño carta oficial para guardar como archivo para firmas docentes.</p>
          </div>
          
          <div className="flex items-center gap-3">
            {reportType === 'individual' && (
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                id="pdf-individual-selection-dropdown"
                className="px-3.5 py-1.5 text-xs bg-[#0c0827] border border-white/10 text-white rounded-xl focus:outline-none focus:border-indigo-400 transition-colors cursor-pointer font-bold"
              >
                {students.map(s => (
                  <option key={s.id} value={s.id} className="bg-[#0c0827] text-white">{s.name}</option>
                ))}
              </select>
            )}

            <button
               id="trigger-browser-print-btn"
               onClick={triggerBrowserPrint}
               className="flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir o Guardar PDF</span>
            </button>
          </div>
        </div>

        {/* Printable Section Box (Render with Print Specific Style Layouts) */}
        <div className="p-8 sm:p-12 font-sans text-slate-800 max-w-4xl mx-auto" id="printable-report-card">
          {/* Printable Layout CSS overrides injected here for reliability */}
          <style dangerouslySetInnerHTML={{ __html: `
            @media print {
              html, body {
                background: #ffffff !important;
                color: #000000 !important;
                font-size: 11pt !important;
                margin: 0 !important;
                padding: 0 !important;
              }
              /* Strip sidebar navigation options and export header completely */
              aside, select, button, .print\\:hidden, #app-navigation, #exports-control-card, #sheets-config-card, #sync-guides-grid, #dashboard-tabs-group, #stats-cards-grid, #grades-filters-box, #grades-info-banner, #metadata-tabs-header {
                display: none !important;
              }
              #printable-report-card {
                padding: 0 !important;
                margin: 0 !important;
                width: 100% !important;
                max-width: 100% !important;
                display: block !important;
              }
              .no-print {
                display: none !important;
              }
              .print-card-border {
                border: 2px solid #e2e8f0 !important;
                border-radius: 8px !important;
                padding: 1.5rem !important;
              }
              table {
                width: 100% !important;
                border: 1px solid #cbd5e1 !important;
                border-collapse: collapse !important;
              }
              th, td {
                border: 1px solid #cbd5e1 !important;
                padding: 6px 10px !important;
                font-size: 10px !important;
              }
              th {
                background-color: #f1f5f9 !important;
                color: #000000 !important;
              }
            }
          `}} />

          {reportType === 'individual' && currentStudent ? (
            // INDIVIDUAL PRINT CARD LAYOUT
            <div className="border border-slate-200 rounded-xl p-8 space-y-8 bg-white print-card-border" id="individual-report-sheet">
              {/* Report Header block */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-6 border-slate-100 gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest block">Educación Básica Oficial</span>
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950 uppercase">Boleta de Calificaciones</h1>
                  <p className="text-xs text-slate-500 font-medium">Ciclo Escolar Activo: 2025 - 2026</p>
                </div>
                <div className="text-left sm:text-right space-y-0.5">
                  <div className="h-10 w-36 bg-slate-900 text-white font-black text-xs flex items-center justify-center tracking-widest rounded-md border border-slate-950 border-double uppercase select-none">
                    GESTORTRAKER
                  </div>
                  <p className="text-[10px] text-slate-400 pt-1 font-mono">Generado el: {new Date().toLocaleDateString()}</p>
                </div>
              </div>

              {/* Student Meta parameters Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 bg-slate-50 p-4 border border-slate-100 rounded-lg text-xs" id="pdf-meta-students">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Alumno</span>
                  <p className="font-bold text-slate-800 text-sm">{currentStudent.name}</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Matrícula Escolar</span>
                  <p className="font-mono font-bold text-slate-700 text-sm">{currentStudent.rollNumber}</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Correo Electrónico</span>
                  <p className="text-slate-600 text-sm truncate">{currentStudent.email}</p>
                </div>
              </div>

              {/* Individual Table of Activities grades */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Desglose Colectivo de Calificaciones</h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse border border-slate-200 rounded-lg overflow-hidden text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                        <th className="px-4 py-2.5">Actividad Académica</th>
                        <th className="px-4 py-2.5 text-center">Trimestre</th>
                        <th className="px-4 py-2.5 text-center">Ponderación (%)</th>
                        <th className="px-4 py-2.5 text-center">Puntaje Máx</th>
                        <th className="px-4 py-2.5 text-right font-bold w-36">Calificación</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {activities.map(act => {
                        const gradeObj = grades.find(g => g.studentId === currentStudent.id && g.activityId === act.id);
                        const score = gradeObj?.score;

                        return (
                          <tr key={act.id} className="hover:bg-slate-50/20">
                            <td className="px-4 py-2.5 font-medium">{act.name}</td>
                            <td className="px-4 py-2.5 text-center">Trimestre {act.trimester}</td>
                            <td className="px-4 py-2.5 text-center">{act.weight}%</td>
                            <td className="px-4 py-2.5 text-center">{act.maxPoints} pts</td>
                            <td className={`px-4 py-2.5 text-right font-mono font-bold ${score !== undefined && score < 6.0 ? 'text-red-600' : 'text-slate-800'}`}>
                              {score !== undefined ? score.toFixed(1) : '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Calculated Trimester Summaries Block */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100" id="trimester-summaries-pdf-grid">
                {[1, 2, 3].map(t => {
                  const score = calcTrimesterAvg(currentStudent.id, t as 1 | 2 | 3);
                  return (
                    <div key={t} className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-center space-y-0.5">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Promedio T{t}</span>
                      <span className={`text-base font-bold font-mono ${score !== null && score < 6.0 ? 'text-rose-600' : 'text-indigo-600'}`}>
                        {score !== null ? score.toFixed(2) : '-'}
                      </span>
                    </div>
                  );
                })}

                <div className="p-3 bg-teal-50 border border-teal-100 rounded-lg text-center space-y-0.5">
                  <span className="text-[10px] text-teal-600 font-bold uppercase tracking-wider block">Calificación Final</span>
                  <span className={`text-base font-black font-mono ${calcFinalAvg(currentStudent.id) !== null && (calcFinalAvg(currentStudent.id) || 0) < 6.0 ? 'text-rose-600' : 'text-teal-700'}`}>
                    {calcFinalAvg(currentStudent.id)?.toFixed(2) || '-'}
                  </span>
                </div>
              </div>

              {/* Form elements for physical teacher signatures */}
              <div className="grid grid-cols-2 gap-8 pt-12" id="pdf-signatures-section">
                <div className="text-center space-y-1">
                  <div className="border-b border-slate-300 h-10 w-44 mx-auto"></div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Firma del Docente</span>
                  <p className="text-xs font-semibold text-slate-600">Profesor Encargado</p>
                </div>
                <div className="text-center space-y-1">
                  <div className="border-b border-slate-300 h-10 w-44 mx-auto"></div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Sello Institucional</span>
                  <p className="text-xs font-semibold text-slate-600">Dirección Académica</p>
                </div>
              </div>
            </div>
          ) : (
            // CLASSROOM GROUP MASTER CARD LAYOUT
            <div className="border border-slate-200 rounded-xl p-8 space-y-8 bg-white print-card-border" id="group-report-sheet">
              {/* Report Header block */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-6 border-slate-100 gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest block">Educación Básica Oficial</span>
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950 uppercase">Acta de Calificaciones General</h1>
                  <p className="text-xs text-slate-500 font-medium font-mono">Consolidado del Grupo Escolar Activo - Ciclo: 2025 - 2026</p>
                </div>
                <div className="text-left sm:text-right space-y-0.5">
                  <div className="h-10 w-36 bg-slate-900 text-white font-black text-xs flex items-center justify-center tracking-widest rounded-md border border-slate-950 border-double uppercase select-none">
                    GESTORTRAKER
                  </div>
                  <p className="text-[10px] text-slate-400 pt-1 font-mono">Generado el: {new Date().toLocaleDateString()}</p>
                </div>
              </div>

              {/* Group summaries info */}
              <div className="grid grid-cols-3 gap-6 bg-slate-50 p-4 border border-slate-100 rounded-lg text-xs" id="group-pdf-meta">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Total de Alumnos</span>
                  <p className="font-bold text-slate-800 text-sm mt-0.5">{students.length} Inscritos</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Promedio Consolidado</span>
                  <p className="font-bold text-slate-800 text-sm mt-0.5 font-mono">
                    {(() => {
                      const avgs = students.map(s => calcFinalAvg(s.id)).filter((a): a is number => a !== null);
                      return avgs.length > 0 ? (avgs.reduce((sum, v) => sum+v, 0)/avgs.length).toFixed(2) : '-';
                    })()}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Tasa de Aprobados</span>
                  <p className="font-bold text-slate-800 text-sm mt-0.5">
                    {(() => {
                      const avgs = students.map(s => calcFinalAvg(s.id)).filter((a): a is number => a !== null);
                      const passed = avgs.filter(v => v >= 6.0).length;
                      return avgs.length > 0 ? `${((passed / avgs.length) * 100).toFixed(1)}%` : '-';
                    })()}
                  </p>
                </div>
              </div>

              {/* Structured Student Summary table */}
              <div className="space-y-3">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse border border-slate-200 rounded-lg overflow-hidden text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                        <th className="px-4 py-2.5">Matrícula</th>
                        <th className="px-4 py-2.5">Alumno</th>
                        <th className="px-4 py-2.5 text-center">Prom T1</th>
                        <th className="px-4 py-2.5 text-center">Prom T2</th>
                        <th className="px-4 py-2.5 text-center">Prom T3</th>
                        <th className="px-4 py-2.5 text-right font-bold w-32">Prom Final General</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {students.map(s => {
                        const t1 = calcTrimesterAvg(s.id, 1);
                        const t2 = calcTrimesterAvg(s.id, 2);
                        const t3 = calcTrimesterAvg(s.id, 3);
                        const f = calcFinalAvg(s.id);

                        return (
                          <tr key={s.id} className="hover:bg-slate-50/20">
                            <td className="px-4 py-3 font-mono text-slate-500 font-medium">{s.rollNumber}</td>
                            <td className="px-4 py-3 font-semibold text-slate-900">{s.name}</td>
                            <td className="px-4 py-2.5 text-center font-mono">{t1 !== null ? t1.toFixed(1) : '-'}</td>
                            <td className="px-4 py-2.5 text-center font-mono">{t2 !== null ? t2.toFixed(1) : '-'}</td>
                            <td className="px-4 py-2.5 text-center font-mono">{t3 !== null ? t3.toFixed(1) : '-'}</td>
                            <td className={`px-4 py-3 text-right font-mono font-bold ${f !== null && f < 6.0 ? 'text-red-600' : 'text-slate-800'}`}>
                              {f !== null ? f.toFixed(2) : '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Form elements for physical teacher signatures */}
              <div className="grid grid-cols-2 gap-8 pt-14" id="pdf-signatures-section-group">
                <div className="text-center space-y-1">
                  <div className="border-b border-slate-300 h-10 w-44 mx-auto"></div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Firma del Docente</span>
                  <p className="text-xs font-semibold text-slate-600">Profesor de Grupo</p>
                </div>
                <div className="text-center space-y-1">
                  <div className="border-b border-slate-300 h-10 w-44 mx-auto"></div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Sello del Plantel</span>
                  <p className="text-xs font-semibold text-slate-600">Dirección Coordinadora</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
