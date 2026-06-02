/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Student, Activity, Grade } from './types';

export interface SheetSyncData {
  students: Student[];
  activities: Activity[];
  grades: Grade[];
}

export async function fetchFromSheets(webAppUrl: string): Promise<SheetSyncData> {
  if (!webAppUrl) {
    throw new Error('La URL de Google Apps Script no está configurada.');
  }

  // Las peticiones GET a Google Apps Script redirigen con un código 302 hacia un CDN de Google, 
  // por lo que usamos redirect: "follow" (comportamiento por defecto) y permitimos CORS.
  const response = await fetch(webAppUrl, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
    mode: 'cors',
  });

  if (!response.ok) {
    throw new Error(`Error en el servidor de Sheets: ${response.statusText}`);
  }

  const result = await response.json();
  
  if (result.status === 'error') {
    throw new Error(result.message || 'Error al recuperar datos del Google Sheet');
  }

  return result.data as SheetSyncData;
}

export async function saveToSheets(
  webAppUrl: string,
  data: SheetSyncData
): Promise<{ success: boolean; message: string; timestamp?: string }> {
  if (!webAppUrl) {
    throw new Error('La URL de Google Apps Script no está configurada.');
  }

  // Google Apps Script doPost maneja peticiones asíncronas perfectamente.
  // Enviamos los datos serializados en el cuerpo de la petición.
  const response = await fetch(webAppUrl, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'text/plain', // Usamos text/plain para evitar que los navegadores disparen la petición preflight de CORS compleja de Google
    },
    mode: 'cors',
  });

  if (!response.ok) {
    throw new Error(`Error en el servidor al enviar los datos: ${response.statusText}`);
  }

  const result = await response.json();

  if (result.status === 'error') {
    throw new Error(result.message || 'Error al persistir cambios en Google Sheets');
  }

  return {
    success: true,
    message: result.message || 'Sincronizado correctamente.',
    timestamp: result.timestamp,
  };
}
