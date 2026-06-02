/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Student {
  id: string;
  name: string;
  rollNumber: string; // Matrícula / Registro
  email: string;
}

export interface Activity {
  id: string;
  name: string;
  trimester: 1 | 2 | 3;
  maxPoints: number; // e.g., 10 o 100
  weight: number; // porcentaje (0-100) para el cálculo ponderado, o por defecto peso igual si es promedio simple
}

export interface Grade {
  studentId: string;
  activityId: string;
  score: number; // calificación obtenida
}

export interface SheetsConfig {
  webAppUrl: string;
  lastSynced: string | null;
}
