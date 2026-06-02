/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  TableProperties,
  LayoutDashboard,
  Users,
  Database,
  FileDown,
  Menu,
  X,
  Mail,
  ListRestart
} from 'lucide-react';

import { Student, Activity, Grade } from './types';
import { initialStudents, initialActivities, initialGrades } from './initialData';

// Import our modular custom components
import GradeGrid from './components/GradeGrid';
import DashboardView from './components/DashboardView';
import StudentActivityManagers from './components/StudentActivityManagers';
import SheetsSync from './components/SheetsSync';
import PDFExportModal from './components/PDFExportModal';

export default function App() {
  // --- STATE PERSISTENCE IN LOCAL STORAGE ---
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('gradebook_students');
    return saved ? JSON.parse(saved) : initialStudents;
  });

  const [activities, setActivities] = useState<Activity[]>(() => {
    const saved = localStorage.getItem('gradebook_activities');
    return saved ? JSON.parse(saved) : initialActivities;
  });

  const [grades, setGrades] = useState<Grade[]>(() => {
    const saved = localStorage.getItem('gradebook_grades');
    return saved ? JSON.parse(saved) : initialGrades;
  });

  const [webAppUrl, setWebAppUrl] = useState<string>(() => {
    return localStorage.getItem('gradebook_webapp_url') || '';
  });

  const [lastSynced, setLastSynced] = useState<string | null>(() => {
    return localStorage.getItem('gradebook_last_synced') || null;
  });

  // Navigation Panel Controls
  const [activeTab, setActiveTab] = useState<'grid' | 'dashboard' | 'managers' | 'sync' | 'exports'>('grid');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sync state modifications to Local Storage on updates
  useEffect(() => {
    localStorage.setItem('gradebook_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('gradebook_activities', JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem('gradebook_grades', JSON.stringify(grades));
  }, [grades]);

  useEffect(() => {
    localStorage.setItem('gradebook_webapp_url', webAppUrl);
  }, [webAppUrl]);

  useEffect(() => {
    localStorage.setItem('gradebook_last_synced', lastSynced || '');
  }, [lastSynced]);

  // --- STATE HANDLERS ---
  
  // Grade matrix update
  const handleUpdateGrade = (studentId: string, activityId: string, score: number) => {
    setGrades((prev) => {
      const filtered = prev.filter((g) => !(g.studentId === studentId && g.activityId === activityId));
      return [...filtered, { studentId, activityId, score }];
    });
  };

  // Student management
  const handleAddStudent = (studentData: Omit<Student, 'id'>) => {
    const newStudent: Student = {
      ...studentData,
      id: `st-${Date.now()}`,
    };
    setStudents((prev) => [...prev, newStudent]);
  };

  const handleUpdateStudent = (id: string, updatedData: Omit<Student, 'id'>) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updatedData } : s))
    );
  };

  const handleDeleteStudent = (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
    // Cascade delete any corresponding grades
    setGrades((prev) => prev.filter((g) => g.studentId !== id));
  };

  // Activity management
  const handleAddActivity = (activityData: Omit<Activity, 'id'>) => {
    const newActivity: Activity = {
      ...activityData,
      id: `act-${Date.now()}`,
    };
    setActivities((prev) => [...prev, newActivity]);
  };

  const handleUpdateActivity = (id: string, updatedData: Omit<Activity, 'id'>) => {
    setActivities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updatedData } : a))
    );
  };

  const handleDeleteActivity = (id: string) => {
    setActivities((prev) => prev.filter((a) => a.id !== id));
    // Cascade delete grades associated with this evaluation
    setGrades((prev) => prev.filter((g) => g.activityId !== id));
  };

  // Sync Import data override
  const handleSyncImport = (imported: { students: Student[]; activities: Activity[]; grades: Grade[] }) => {
    if (imported.students) setStudents(imported.students);
    if (imported.activities) setActivities(imported.activities);
    if (imported.grades) setGrades(imported.grades);
  };

  // Restore factory sample data
  const handleRestoreInitialData = () => {
    if (window.confirm('¿Deseas restaurar la base de datos a los valores de demostración iniciales? Esto sobrescribirá tus cambios locales no guardados en Sheets.')) {
      setStudents(initialStudents);
      setActivities(initialActivities);
      setGrades(initialGrades);
      setLastSynced(null);
      alert('Se han restaurado los datos iniciales de demostración con éxito.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#110e30] to-[#24215c] flex flex-col md:flex-row font-sans text-slate-100" id="app-wrapper">
      
      {/* --- RESPONSIVE MOBILE NAVIGATION BAR --- */}
      <header className="md:hidden bg-white/5 backdrop-blur-xl text-white px-5 py-3.5 flex items-center justify-between border-b border-white/10 sticky top-0 z-40" id="mobile-header">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-indigo-600/30 border border-indigo-400/30 rounded-lg text-white">
            <GraduationCap className="w-5 h-5" />
          </div>
          <span className="font-bold text-sm font-display tracking-tight text-white uppercase">Gestor de Notas</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          id="mobile-hamburg-toggle"
          className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-slate-200 transition-colors cursor-pointer"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Slide-out Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0a0724]/95 backdrop-blur-xl border-b border-white/10 p-4 space-y-2 sticky top-[53px] z-40" id="mobile-menu-drawer">
          <button
            onClick={() => { setActiveTab('grid'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center space-x-2 p-2.5 rounded-lg text-sm font-semibold transition-all border ${activeTab === 'grid' ? 'bg-white/15 text-white border-white/20' : 'text-slate-300 hover:bg-white/5 border-transparent'}`}
          >
            <TableProperties className="w-4 h-4 text-indigo-400" />
            <span>Planilla de Notas</span>
          </button>
          <button
            onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center space-x-2 p-2.5 rounded-lg text-sm font-semibold transition-all border ${activeTab === 'dashboard' ? 'bg-white/15 text-white border-white/20' : 'text-slate-300 hover:bg-white/5 border-transparent'}`}
          >
            <LayoutDashboard className="w-4 h-4 text-indigo-400" />
            <span>Dashboard Escolar</span>
          </button>
          <button
            onClick={() => { setActiveTab('managers'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center space-x-2 p-2.5 rounded-lg text-sm font-semibold transition-all border ${activeTab === 'managers' ? 'bg-white/15 text-white border-white/20' : 'text-slate-300 hover:bg-white/5 border-transparent'}`}
          >
            <Users className="w-4 h-4 text-indigo-400" />
            <span>Alumnos y Actividades</span>
          </button>
          <button
            onClick={() => { setActiveTab('exports'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center space-x-2 p-2.5 rounded-lg text-sm font-semibold transition-all border ${activeTab === 'exports' ? 'bg-white/15 text-white border-white/20' : 'text-slate-300 hover:bg-white/5 border-transparent'}`}
          >
            <FileDown className="w-4 h-4 text-indigo-400" />
            <span>Descarga de Informes</span>
          </button>
          <button
            onClick={() => { setActiveTab('sync'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center space-x-2 p-2.5 rounded-lg text-sm font-semibold transition-all border ${activeTab === 'sync' ? 'bg-white/15 text-white border-white/20' : 'text-slate-300 hover:bg-white/5 border-transparent'}`}
          >
            <Database className="w-4 h-4 text-indigo-400" />
            <span>Google Sheets Cloud</span>
          </button>

          <div className="pt-3 border-t border-white/10">
            <button
              onClick={() => { handleRestoreInitialData(); setMobileMenuOpen(false); }}
              className="w-full flex items-center justify-center space-x-2 p-2 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-lg text-xs font-semibold hover:bg-rose-500/20 transition-all cursor-pointer"
            >
              <ListRestart className="w-3.5 h-3.5" />
              <span>Restaurar Datos Demo</span>
            </button>
          </div>
        </div>
      )}

      {/* --- SIDEBAR DESKTOP NAVIGATION --- */}
      <aside className="hidden md:flex flex-col w-64 bg-white/5 backdrop-blur-2xl text-slate-100 border-r border-white/10 sticky top-0 h-screen shrink-0 justify-between" id="desktop-sidebar">
        <div>
          {/* Logo Brand Header */}
          <div className="px-6 py-5 border-b border-white/10 flex items-center space-x-3">
            <div className="p-2 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div className="space-y-0.5">
              <h1 className="font-bold text-sm leading-none tracking-tight uppercase font-display text-white">Calificaciones</h1>
              <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest leading-none">Control Docente</p>
            </div>
          </div>

          {/* Navigation Items menu */}
          <nav className="p-4 space-y-1.5" id="app-navigation">
            <button
              onClick={() => setActiveTab('grid')}
              id="sidebar-nav-grid"
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                activeTab === 'grid'
                  ? 'bg-white/10 text-white border-white/15 shadow-md shadow-indigo-500/5'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border-transparent'
              }`}
            >
              <TableProperties className="w-4 h-4 shrink-0 text-indigo-400" />
              <span>Planilla Calificadora</span>
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              id="sidebar-nav-dashboard"
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-white/10 text-white border-white/15 shadow-md shadow-indigo-500/5'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border-transparent'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0 text-indigo-400" />
              <span>Dashboard Académico</span>
            </button>

            <button
              onClick={() => setActiveTab('managers')}
              id="sidebar-nav-managers"
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                activeTab === 'managers'
                  ? 'bg-white/10 text-white border-white/15 shadow-md shadow-indigo-500/5'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border-transparent'
              }`}
            >
              <Users className="w-4 h-4 shrink-0 text-indigo-400" />
              <span>Alumnos y Evaluaciones</span>
            </button>

            <button
              onClick={() => setActiveTab('exports')}
              id="sidebar-nav-exports"
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                activeTab === 'exports'
                  ? 'bg-white/10 text-white border-white/15 shadow-md shadow-indigo-500/5'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border-transparent'
              }`}
            >
              <FileDown className="w-4 h-4 shrink-0 text-indigo-400" />
              <span>Exportar PDF & Excel</span>
            </button>

            <button
              onClick={() => setActiveTab('sync')}
              id="sidebar-nav-sync"
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                activeTab === 'sync'
                  ? 'bg-white/10 text-white border-white/15 shadow-md shadow-indigo-500/5'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border-transparent'
              }`}
            >
              <Database className="w-4 h-4 shrink-0 text-indigo-400" />
              <span>Google Sheets Sync</span>
            </button>
          </nav>
        </div>

        {/* Footer actions of sidebar */}
        <div className="p-4 border-t border-white/10 space-y-3.5">
          {/* Cloud Info Summary panel */}
          <div className="bg-white/5 p-3 rounded-xl border border-white/10 space-y-2">
            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">Nube de Datos</span>
            <div className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${webAppUrl ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`}></span>
              <span className="text-[10px] text-slate-300 font-medium truncate">
                {webAppUrl ? 'Sheets Conectado' : 'Almacenamiento Local'}
              </span>
            </div>
            {lastSynced && (
              <p className="text-[8px] text-slate-400 font-mono italic">Sinc: {lastSynced.substring(0, 16)}</p>
            )}
          </div>

          <button
            onClick={handleRestoreInitialData}
            id="restore-initial-data-btn"
            className="w-full inline-flex items-center justify-center space-x-1.5 px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/25 rounded-xl text-xs font-semibold select-none transition-all cursor-pointer"
          >
            <ListRestart className="w-3.5 h-3.5 shrink-0" />
            <span>Restaurar Datos Demo</span>
          </button>
        </div>
      </aside>

      {/* --- MAIN PAGE CONTENT CONTAINER --- */}
      <main className="flex-1 p-5 md:p-8 overflow-y-auto w-full max-w-7xl mx-auto" id="app-content-body">
        {/* Tab Page router */}
        {activeTab === 'grid' && (
          <GradeGrid
            students={students}
            activities={activities}
            grades={grades}
            onUpdateGrade={handleUpdateGrade}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardView
            students={students}
            activities={activities}
            grades={grades}
          />
        )}

        {activeTab === 'managers' && (
          <StudentActivityManagers
            students={students}
            activities={activities}
            onAddStudent={handleAddStudent}
            onUpdateStudent={handleUpdateStudent}
            onDeleteStudent={handleDeleteStudent}
            onAddActivity={handleAddActivity}
            onUpdateActivity={handleUpdateActivity}
            onDeleteActivity={handleDeleteActivity}
          />
        )}

        {activeTab === 'sync' && (
          <SheetsSync
            webAppUrl={webAppUrl}
            setWebAppUrl={setWebAppUrl}
            lastSynced={lastSynced}
            setLastSynced={setLastSynced}
            students={students}
            activities={activities}
            grades={grades}
            onSyncImport={handleSyncImport}
          />
        )}

        {activeTab === 'exports' && (
          <PDFExportModal
            students={students}
            activities={activities}
            grades={grades}
          />
        )}
      </main>
    </div>
  );
}
