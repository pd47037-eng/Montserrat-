/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserPlus, Plus, Search, Edit2, Trash2, Calendar, Mail, FileText, Percent, ShieldCheck, HelpCircle } from 'lucide-react';
import { Student, Activity } from '../types';

interface StudentActivityManagersProps {
  students: Student[];
  activities: Activity[];
  onAddStudent: (student: Omit<Student, 'id'>) => void;
  onUpdateStudent: (id: string, student: Omit<Student, 'id'>) => void;
  onDeleteStudent: (id: string) => void;
  onAddActivity: (activity: Omit<Activity, 'id'>) => void;
  onUpdateActivity: (id: string, activity: Omit<Activity, 'id'>) => void;
  onDeleteActivity: (id: string) => void;
}

export default function StudentActivityManagers({
  students,
  activities,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onAddActivity,
  onUpdateActivity,
  onDeleteActivity,
}: StudentActivityManagersProps) {
  const [activeTab, setActiveTab] = useState<'students' | 'activities'>('students');

  // Student States
  const [studentSearch, setStudentSearch] = useState('');
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentName, setStudentName] = useState('');
  const [studentRoll, setStudentRoll] = useState('');
  const [studentEmail, setStudentEmail] = useState('');

  // Activity States
  const [activitySearch, setActivitySearch] = useState('');
  const [selectedTrimesterFilter, setSelectedTrimesterFilter] = useState<0 | 1 | 2 | 3>(0); // 0 means All
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [activityName, setActivityName] = useState('');
  const [activityTrimester, setActivityTrimester] = useState<1 | 2 | 3>(1);
  const [activityMaxPoints] = useState<number>(10); // Standardizing to 10 points
  const [activityWeight, setActivityWeight] = useState<number>(30);

  // Form Handlers - Students
  const openStudentModal = (student?: Student) => {
    if (student) {
      setSelectedStudent(student);
      setStudentName(student.name);
      setStudentRoll(student.rollNumber);
      setStudentEmail(student.email);
    } else {
      setSelectedStudent(null);
      setStudentName('');
      // Autogenerate realistic Roll Number based on total count
      const numStr = String(students.length + 1).padStart(2, '0');
      setStudentRoll(`AL-2026${numStr}`);
      setStudentEmail('');
    }
    setStudentModalOpen(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !studentRoll.trim()) return;

    const emailField = studentEmail.trim() || `${studentName.toLowerCase().replace(/\s+/g, '.')}@escuela.edu`;

    if (selectedStudent) {
      onUpdateStudent(selectedStudent.id, {
        name: studentName.trim(),
        rollNumber: studentRoll.trim(),
        email: emailField,
      });
    } else {
      onAddStudent({
        name: studentName.trim(),
        rollNumber: studentRoll.trim(),
        email: emailField,
      });
    }
    setStudentModalOpen(false);
  };

  // Form Handlers - Activities
  const openActivityModal = (activity?: Activity) => {
    if (activity) {
      setSelectedActivity(activity);
      setActivityName(activity.name);
      setActivityTrimester(activity.trimester);
      setActivityWeight(activity.weight);
    } else {
      setSelectedActivity(null);
      setActivityName('');
      setActivityTrimester(1);
      setActivityWeight(30);
    }
    setActivityModalOpen(true);
  };

  const handleSaveActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityName.trim()) return;

    if (selectedActivity) {
      onUpdateActivity(selectedActivity.id, {
        name: activityName.trim(),
        trimester: activityTrimester,
        maxPoints: activityMaxPoints,
        weight: Number(activityWeight),
      });
    } else {
      onAddActivity({
        name: activityName.trim(),
        trimester: activityTrimester,
        maxPoints: activityMaxPoints,
        weight: Number(activityWeight),
      });
    }
    setActivityModalOpen(false);
  };

  // Filters
  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.rollNumber.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const filteredActivities = activities.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(activitySearch.toLowerCase());
    const matchesTrimester = selectedTrimesterFilter === 0 || a.trimester === selectedTrimesterFilter;
    return matchesSearch && matchesTrimester;
  });

  // Calculate sum of weights for trimesters to display warnings if total weights are mismatched
  const getTrimesterWeightsSum = (t: 1 | 2 | 3) => {
    return activities.filter(a => a.trimester === t).reduce((sum, a) => sum + a.weight, 0);
  };

  return (
    <div className="space-y-6" id="managers-view-wrapper">
      {/* Tab Switcher Headers */}
      <div className="flex border-b border-white/10" id="metadata-tabs-header">
        <button
          onClick={() => setActiveTab('students')}
          id="tab-students-btn"
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'students'
              ? 'border-indigo-400 text-indigo-300'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Directorio de Alumnos ({students.length})
        </button>
        <button
          onClick={() => setActiveTab('activities')}
          id="tab-activities-btn"
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'activities'
              ? 'border-indigo-400 text-indigo-300'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Planeación de Actividades ({activities.length})
        </button>
      </div>

      {activeTab === 'students' ? (
        // ALUMNOS MANAGEMENT VIEW
        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl p-6" id="students-manager-panel">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-450">
                <Search className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar alumno por nombre o matrícula..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                id="student-search-input"
                className="w-full pl-9 pr-4 py-2 text-sm bg-white/5 border border-white/12 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white/10 text-white placeholder-slate-400 transition-all font-medium"
              />
            </div>
            <button
              onClick={() => openStudentModal()}
              id="open-add-student-modal-btn"
              className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md transition-colors cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Inscribir Alumno</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-white/10 rounded-xl bg-slate-950/20">
            <table className="w-full text-left border-collapse" id="students-table">
              <thead>
                <tr className="bg-white/5 border-b border-white/10 text-slate-300 uppercase tracking-wider text-[11px] font-bold">
                  <th className="px-6 py-3">Matrícula</th>
                  <th className="px-6 py-3">Nombre Completo</th>
                  <th className="px-6 py-3">Correo Electrónico</th>
                  <th className="px-6 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300 text-sm">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((s) => (
                    <tr key={s.id} className="hover:bg-white/5 transition-colors border-b border-white/5" id={`student-row-${s.id}`}>
                      <td className="px-6 py-3.5 font-mono text-xs font-bold text-indigo-300">{s.rollNumber}</td>
                      <td className="px-6 py-3.5 font-semibold text-white">{s.name}</td>
                      <td className="px-6 py-3.5 text-slate-300">
                        <span className="flex items-center space-x-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>{s.email}</span>
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right space-x-2">
                        <button
                          onClick={() => openStudentModal(s)}
                          id={`edit-student-btn-${s.id}`}
                          className="inline-flex items-center justify-center p-2 bg-white/5 text-slate-300 hover:bg-indigo-500/20 hover:text-white border border-white/10 rounded-lg transition-all cursor-pointer"
                          title="Editar información"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`¿Estás seguro de dar de baja a ${s.name}? Se perderán todas sus calificaciones.`)) {
                              onDeleteStudent(s.id);
                            }
                          }}
                          id={`delete-student-btn-${s.id}`}
                          className="inline-flex items-center justify-center p-2 bg-white/5 text-rose-300 hover:bg-rose-500/20 hover:text-white border border-rose-500/15 rounded-lg transition-all cursor-pointer"
                          title="Eliminar Alumno"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-slate-450 italic text-sm">
                      Ningún alumno coincide con los criterios de búsqueda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        // ACTIVITIES MANAGEMENT VIEW
        <div className="space-y-6" id="activities-manager-panel">
          {/* Trimester Info Weights Tracker */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="trimester-weights-summary-grid">
            {[1, 2, 3].map((t) => {
              const weightSum = getTrimesterWeightsSum(t as 1 | 2 | 3);
              const totalActivities = activities.filter(a => a.trimester === t).length;
              return (
                <div key={t} className="bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 shadow-xl flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">Actividades</span>
                    <h4 className="text-base font-bold text-white">Trimestre {t}</h4>
                    <p className="text-xs text-slate-300">{totalActivities} Evaluaciones creadas</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">Peso Total</span>
                    <div className="flex items-center space-x-1.5 mt-0.5 justify-end">
                      <Percent className="w-4 h-4 text-slate-300" />
                      <span className={`text-lg font-black ${weightSum === 100 ? 'text-emerald-400' : 'text-indigo-300'}`}>
                        {weightSum}%
                      </span>
                    </div>
                    <span className="text-[9px] text-slate-400 block mt-0.5 italic">
                      {weightSum === 100 ? '✓ Ponderado de 100%' : 'Promedio configurable'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Activities List Card */}
          <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl p-6" id="activities-card-body">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-3 flex-1 max-w-xl">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Search className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar actividad..."
                    value={activitySearch}
                    onChange={(e) => setActivitySearch(e.target.value)}
                    id="activity-search-input"
                    className="w-full pl-9 pr-4 py-2 text-sm bg-white/5 border border-white/12 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white/10 text-white placeholder-slate-400 transition-all font-medium"
                  />
                </div>
                
                {/* Trimestres Quick Filters */}
                <select
                  value={selectedTrimesterFilter}
                  onChange={(e) => setSelectedTrimesterFilter(Number(e.target.value) as 0 | 1 | 2 | 3)}
                  id="activity-trimester-filter-select"
                  className="px-3 py-2 text-sm border border-white/10 bg-[#0d0a27] text-white rounded-xl focus:outline-none focus:border-indigo-500 transition-all font-bold cursor-pointer"
                >
                  <option value={0}>Todos los Trimestres</option>
                  <option value={1}>Trimestre 1</option>
                  <option value={2}>Trimestre 2</option>
                  <option value={3}>Trimestre 3</option>
                </select>
              </div>

              <button
                onClick={() => openActivityModal()}
                id="open-add-activity-modal-btn"
                className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar Actividad</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-white/10 rounded-xl bg-slate-950/20">
              <table className="w-full text-left border-collapse" id="activities-table">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10 text-slate-300 uppercase tracking-wider text-[11px] font-bold">
                    <th className="px-6 py-3">Actividad / Evaluación</th>
                    <th className="px-6 py-3">Trimestre</th>
                    <th className="px-6 py-3">Puntuación de Escala</th>
                    <th className="px-6 py-3">Peso en Trimestre (%)</th>
                    <th className="px-6 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300 text-sm">
                  {filteredActivities.length > 0 ? (
                    filteredActivities.map((a) => (
                      <tr key={a.id} className="hover:bg-white/5 transition-colors border-b border-white/5" id={`activity-row-${a.id}`}>
                        <td className="px-6 py-3.5 font-semibold text-white flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-indigo-400" />
                          <span>{a.name}</span>
                        </td>
                        <td className="px-6 py-3.5 text-slate-300">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/5 text-indigo-300 border border-white/10">
                            Trimestre {a.trimester}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-slate-400 font-mono text-xs">Escala {a.maxPoints || 10} pts</td>
                        <td className="px-6 py-3.5 font-bold text-slate-100">
                          <span className="flex items-center space-x-1">
                            <span>{a.weight}%</span>
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-right space-x-2">
                          <button
                            onClick={() => openActivityModal(a)}
                            id={`edit-activity-btn-${a.id}`}
                            className="inline-flex items-center justify-center p-2 bg-white/5 text-slate-300 hover:bg-indigo-500/20 hover:text-white border border-white/10 rounded-lg transition-all cursor-pointer"
                            title="Editar actividad"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`¿Estás seguro de eliminar "${a.name}"? Se borrarán de forma irreversible todas las calificaciones asociadas a esta tarea.`)) {
                                onDeleteActivity(a.id);
                              }
                            }}
                            id={`delete-activity-btn-${a.id}`}
                            className="inline-flex items-center justify-center p-2 bg-white/5 text-rose-300 hover:bg-rose-500/20 hover:text-white border border-rose-500/15 rounded-lg transition-all cursor-pointer"
                            title="Eliminar actividad"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-450 italic text-sm">
                        Ninguna actividad coincide con los filtros aplicados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* STUDENT FORM MODAL */}
      {studentModalOpen && (
        <div id="student-modal" className="fixed inset-0 z-50 bg-[#030214]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#111030] rounded-2xl shadow-2xl border border-white/12 w-full max-w-md overflow-hidden relative">
            <div className="px-6 py-4 bg-slate-950/80 border-b border-white/10 text-white flex justify-between items-center">
              <h3 className="text-base font-bold tracking-wide font-display text-white">
                {selectedStudent ? 'Editar Alumno' : 'Inscribir Nuevo Alumno'}
              </h3>
              <button
                onClick={() => setStudentModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="p-6 space-y-4">
              <div>
                <label htmlFor="student-name-input" className="block text-xs font-bold text-slate-405 uppercase tracking-widest mb-1.5">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  id="student-name-input"
                  required
                  placeholder="Ej. Sofía Rodríguez Luna"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 focus:bg-white/10"
                />
              </div>

              <div>
                <label htmlFor="student-roll-input" className="block text-xs font-bold text-slate-405 uppercase tracking-widest mb-1.5">
                  Matrícula / Identificador Escolar
                </label>
                <input
                  type="text"
                  id="student-roll-input"
                  required
                  placeholder="Ej. AL-202601"
                  value={studentRoll}
                  onChange={(e) => setStudentRoll(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-505 focus:bg-white/10 font-mono font-semibold"
                />
              </div>

              <div>
                <label htmlFor="student-email-input" className="block text-xs font-bold text-slate-405 uppercase tracking-widest mb-1.5">
                  Correo Electrónico (Opcional)
                </label>
                <input
                  type="email"
                  id="student-email-input"
                  placeholder="Ej. sofia.rodriguez@escuela.edu"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 focus:bg-white/10"
                />
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setStudentModalOpen(false)}
                  className="px-4 py-2 border border-white/10 rounded-xl text-sm text-slate-300 hover:bg-white/5 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  id="save-student-btn"
                  className="px-4 py-2 bg-indigo-650 hover:bg-indigo-700 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-md transition-colors"
                >
                  Guardar Alumno
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ACTIVITY FORM MODAL */}
      {activityModalOpen && (
        <div id="activity-modal" className="fixed inset-0 z-50 bg-[#030214]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#111030] rounded-2xl shadow-2xl border border-white/12 w-full max-w-md overflow-hidden relative">
            <div className="px-6 py-4 bg-slate-950/80 border-b border-white/10 text-white flex justify-between items-center">
              <h3 className="text-base font-bold tracking-wide font-display text-white">
                {selectedActivity ? 'Editar Actividad' : 'Agregar Nueva Actividad'}
              </h3>
              <button
                onClick={() => setActivityModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveActivity} className="p-6 space-y-4">
              <div>
                <label htmlFor="activity-name-input" className="block text-xs font-bold text-slate-405 uppercase tracking-widest mb-1.5">
                  Nombre de la Actividad
                </label>
                <input
                  type="text"
                  id="activity-name-input"
                  required
                  placeholder="Ej. Examen de Lectura"
                  value={activityName}
                  onChange={(e) => setActivityName(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 focus:bg-white/10"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="activity-trimester-select" className="block text-xs font-bold text-slate-405 uppercase tracking-widest mb-1.5">
                    Trimestre
                  </label>
                  <select
                    id="activity-trimester-select"
                    value={activityTrimester}
                    onChange={(e) => setActivityTrimester(Number(e.target.value) as 1 | 2 | 3)}
                    className="w-full px-3 py-2 bg-[#0d0a27] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value={1}>Trimestre 1</option>
                    <option value={2}>Trimestre 2</option>
                    <option value={3}>Trimestre 3</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="activity-weight-input" className="block text-xs font-bold text-slate-405 uppercase tracking-widest mb-1.5">
                    Peso (%)
                  </label>
                  <input
                    type="number"
                    id="activity-weight-input"
                    required
                    min={0}
                    max={100}
                    value={activityWeight}
                    onChange={(e) => setActivityWeight(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 focus:bg-white/10"
                  />
                </div>
              </div>

              <div className="bg-indigo-500/10 rounded-xl p-3.5 border border-indigo-500/20 flex items-start space-x-2 text-xs text-indigo-200">
                <ShieldCheck className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                <span>
                  <strong>Nota sobre escalas:</strong> Las calificaciones se evalúan de <strong>0 a 10</strong> por simplicidad y compatibilidad con Google Sheets.
                </span>
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setActivityModalOpen(false)}
                  className="px-4 py-2 border border-white/10 rounded-xl text-sm text-slate-300 hover:bg-white/5 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  id="save-activity-btn"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md transition-colors"
                >
                  Guardar Actividad
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
