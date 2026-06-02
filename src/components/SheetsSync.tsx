/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Database, Link2, Copy, Check, Info, RefreshCw, ArrowUpRight, HelpCircle } from 'lucide-react';
import { APPS_SCRIPT_CODE, INSTRUCTIONS_ES } from '../appsScriptTemplate';
import { fetchFromSheets, saveToSheets } from '../sheetsService';
import { Student, Activity, Grade } from '../types';

interface SheetsSyncProps {
  webAppUrl: string;
  setWebAppUrl: (url: string) => void;
  lastSynced: string | null;
  setLastSynced: (time: string | null) => void;
  students: Student[];
  activities: Activity[];
  grades: Grade[];
  onSyncImport: (data: { students: Student[]; activities: Activity[]; grades: Grade[] }) => void;
}

export default function SheetsSync({
  webAppUrl,
  setWebAppUrl,
  lastSynced,
  setLastSynced,
  students,
  activities,
  grades,
  onSyncImport,
}: SheetsSyncProps) {
  const [inputUrl, setInputUrl] = useState(webAppUrl);
  const [copiedCode, setCopiedCode] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'testing' | 'importing' | 'exporting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSaveConnection = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    
    const trimmedUrl = inputUrl.trim();
    if (trimmedUrl && !trimmedUrl.startsWith('https://script.google.com/')) {
      setErrorMessage('La URL debe comenzar con "https://script.google.com/"');
      return;
    }

    setWebAppUrl(trimmedUrl);
    setSuccessMessage('URL de Apps Script guardada en el navegador.');
    
    // Auto-save to localStorage inside the parent state updater, but we show confirmation.
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_CODE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleImport = async () => {
    if (!webAppUrl) {
      setErrorMessage('Debes ingresar y guardar una URL válida de Apps Script.');
      return;
    }

    setSyncStatus('importing');
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const data = await fetchFromSheets(webAppUrl);
      if (data.students && data.activities) {
        onSyncImport(data);
        const now = new Date().toLocaleString();
        setLastSynced(now);
        setSuccessMessage(`¡Datos importados con éxito! Se cargaron ${data.students.length} alumnos, ${data.activities.length} actividades.`);
        setSyncStatus('success');
      } else {
        throw new Error('La respuesta de Sheets no contiene la estructura esperada.');
      }
    } catch (err: any) {
      setErrorMessage(`Error al importar: ${err.message || 'Error de conexión'}. Verifica tu URL y la publicación del script.`);
      setSyncStatus('error');
    }
  };

  const handleExport = async () => {
    if (!webAppUrl) {
      setErrorMessage('Debes ingresar y guardar una URL válida de Apps Script.');
      return;
    }

    setSyncStatus('exporting');
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const payload = { students, activities, grades };
      const response = await saveToSheets(webAppUrl, payload);
      
      if (response.success) {
        const now = new Date().toLocaleString();
        setLastSynced(now);
        setSuccessMessage(response.message || '¡Datos respaldados con éxito en Google Sheets!');
        setSyncStatus('success');
      } else {
        throw new Error('No se pudo verificar la escritura exitosa.');
      }
    } catch (err: any) {
      setErrorMessage(`Error al exportar: ${err.message || 'Error de red'}. Asegúrate de dar acceso "Cualquiera" al publicar en Apps Script.`);
      setSyncStatus('error');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in" id="sheets-sync-container">
      {/* Configuration Header Card */}
      <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl p-6" id="sheets-config-card">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-indigo-505 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl">
            <Database className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white font-display">Integración con Google Sheets</h2>
            <p className="text-xs sm:text-sm text-slate-350">Centraliza las planillas calificadoras del ciclo escolar de manera bidireccional mediante Google Apps Script.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Inputs Section */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <label htmlFor="sheets-url-input" className="block text-xs font-bold text-slate-405 uppercase tracking-widest mb-2">
                URL de Aplicación Web de Google Apps Script
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Link2 className="w-4 h-4" />
                  </div>
                  <input
                    id="sheets-url-input"
                    type="url"
                    placeholder="https://script.google.com/macros/s/.../exec"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm bg-white/5 border border-white/12 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white/10 text-white placeholder-slate-500 tracking-wide font-medium transition-all"
                  />
                </div>
                <button
                  id="save-conn-btn"
                  onClick={handleSaveConnection}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md transition-colors cursor-pointer"
                >
                  Guardar Link
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-1.5 italic">
                Asegúrate de ejecutar la implementación de Apps Script como "Yo" y dar acceso a "Cualquiera".
              </p>
            </div>

            {/* Sync States Warnings */}
            {errorMessage && (
              <div id="sync-error-box" className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-350 text-xs sm:text-sm rounded-xl flex items-start space-x-2">
                <Info className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div id="sync-success-box" className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-305 text-emerald-400 text-xs sm:text-sm rounded-xl flex items-start space-x-2">
                <Check className="w-4 h-4 mt-0.5 shrink-0 animate-bounce" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Sync buttons */}
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                id="sync-import-btn"
                onClick={handleImport}
                disabled={syncStatus === 'importing' || syncStatus === 'exporting'}
                className="flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/30 text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${syncStatus === 'importing' ? 'animate-spin' : ''}`} />
                <span>Cargar desde Sheets (Importar)</span>
              </button>
              <button
                id="sync-export-btn"
                onClick={handleExport}
                disabled={syncStatus === 'importing' || syncStatus === 'exporting'}
                className="flex items-center space-x-2 px-5 py-2.5 bg-[#1b154b] hover:bg-[#251e66] disabled:bg-slate-800 text-white font-bold text-sm rounded-xl shadow-md border border-white/10 transition-all cursor-pointer"
              >
                <ArrowUpRight className={`w-4 h-4 ${syncStatus === 'exporting' ? 'animate-pulse' : ''}`} />
                <span>Respaldar en Sheets (Sincronizar)</span>
              </button>
            </div>
          </div>

          {/* Connection Status Card */}
          <div className="bg-[#0c0827]/60 rounded-xl p-5 border border-white/10 shadow-lg flex flex-col justify-between" id="sync-status-card">
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-widest block">Estado de Sincronización</h3>
              <div className="flex items-center space-x-2">
                <span className={`w-3 h-3 rounded-full ${webAppUrl ? 'bg-emerald-405 bg-emerald-400' : 'bg-amber-400 animate-pulse'}`}></span>
                <span className="text-sm font-bold text-white">
                  {webAppUrl ? 'Servicio Configurado ✓' : 'Sin vincular ⚠'}
                </span>
              </div>
              <div className="text-xs text-slate-300 space-y-1 bg-slate-950/20 p-2.5 rounded-lg border border-white/5">
                <p className="truncate"><strong>Apps Script Key:</strong> {webAppUrl ? `${webAppUrl.substring(0, 36)}...` : 'Ninguna'}</p>
                <p><strong>Última Sincronización:</strong> {lastSynced || 'Nunca'}</p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 text-[10px] text-slate-400 flex items-center space-x-1.5 italic">
              <Info className="w-3.5 h-3.5 text-indigo-300 shrink-0" />
              <span>Sincronización en la nube & guardado local permanente.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Code and Steps Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8" id="sync-guides-grid">
        {/* Step-by-Step Instructions */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl p-6" id="sync-steps-card">
          <div className="flex items-center space-x-2 mb-4">
            <HelpCircle className="w-5 h-5 text-indigo-300" />
            <h3 className="text-base sm:text-lg font-bold text-white font-display">Para subir la web app a GitHub Pages y conectarla a Sheets, realiza los siguientes pasos</h3>
          </div>
          <div className="prose prose-sm max-w-none text-slate-300 space-y-4 max-h-[480px] overflow-y-auto pr-2 scrollbar-thin">
            {INSTRUCTIONS_ES.split('\n\n').map((paragraph, index) => {
              if (paragraph.startsWith('###')) {
                return (
                  <h4 key={index} className="text-sm sm:text-base font-bold text-indigo-300 pt-3 border-b border-white/10 pb-1 mr-2">
                    {paragraph.replace('###', '').trim()}
                  </h4>
                );
              } else if (paragraph.startsWith('####')) {
                return (
                  <h5 key={index} className="text-xs sm:text-sm font-bold text-slate-100 tracking-wide mt-3 mb-1">
                    {paragraph.replace('####', '').trim()}
                  </h5>
                );
              } else if (paragraph.match(/^\d+\./)) {
                return (
                  <div key={index} className="pl-2 space-y-1">
                    <p className="text-xs sm:text-sm text-slate-200">{paragraph}</p>
                  </div>
                );
              }
              return (
                <p key={index} className="text-xs sm:text-sm leading-relaxed text-slate-300">
                  {paragraph}
                </p>
              );
            })}
          </div>
        </div>

        {/* Copyable Script Code Box */}
        <div className="bg-[#0b0a22]/80 rounded-2xl border border-white/10 shadow-xl overflow-hidden flex flex-col h-[560px]" id="sync-code-card">
          <div className="bg-slate-950/80 px-4 py-3 flex items-center justify-between border-b border-white/10 shrink-0">
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
              <span className="text-slate-300 font-mono text-xs pl-2">Código.gs (Apps Script)</span>
            </div>
            <button
              onClick={handleCopyCode}
              id="copy-apps-script-btn"
              className="px-3.5 py-1.5 bg-indigo-650 hover:bg-slate-700 bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-md"
            >
              {copiedCode ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Código</span>
                </>
              )}
            </button>
          </div>
          
          <div className="p-4 overflow-y-auto flex-1 font-mono text-xs text-slate-300 tracking-wide bg-[#0c0a25]/50 leading-relaxed scrollbar-thin">
            <pre className="whitespace-pre-wrap">{APPS_SCRIPT_CODE}</pre>
          </div>
          
          <div className="bg-slate-950/60 px-4 py-3 border-t border-white/10 text-center text-[10px] text-slate-400 shrink-0 italic">
            Copia e inserta este código en el editor de Apps Script asociado a tu Google Sheets.
          </div>
        </div>
      </div>
    </div>
  );
}
