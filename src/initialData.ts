/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Student, Activity, Grade } from './types';

export const initialStudents: Student[] = [
  { id: 'st-01', name: 'Sofía Rodríguez Luna', rollNumber: 'AL-202601', email: 'sofia.rodriguez@escuela.edu' },
  { id: 'st-02', name: 'Mateo García Mendoza', rollNumber: 'AL-202602', email: 'mateo.garcia@escuela.edu' },
  { id: 'st-03', name: 'Valentina Gómez Estrada', rollNumber: 'AL-202603', email: 'valentina.gomez@escuela.edu' },
  { id: 'st-04', name: 'Santiago Pérez Delgado', rollNumber: 'AL-202604', email: 'santiago.perez@escuela.edu' },
  { id: 'st-05', name: 'Camila Juárez Torres', rollNumber: 'AL-202605', email: 'camila.juarez@escuela.edu' },
  { id: 'st-06', name: 'Diego Ramírez Martínez', rollNumber: 'AL-202606', email: 'diego.ramirez@escuela.edu' },
];

export const initialActivities: Activity[] = [
  // Trimestre 1
  { id: 'act-101', name: 'Examen de Lectura', trimester: 1, maxPoints: 10, weight: 30 },
  { id: 'act-102', name: 'Maqueta del Átomo', trimester: 1, maxPoints: 10, weight: 40 },
  { id: 'act-103', name: 'Tareas de Álgebra', trimester: 1, maxPoints: 10, weight: 30 },

  // Trimestre 2
  { id: 'act-201', name: 'Examen de Fracciones', trimester: 2, maxPoints: 10, weight: 30 },
  { id: 'act-202', name: 'Ensayo de Historia de México', trimester: 2, maxPoints: 10, weight: 40 },
  { id: 'act-203', name: 'Presentación Escrita', trimester: 2, maxPoints: 10, weight: 30 },

  // Trimestre 3
  { id: 'act-301', name: 'Examen de Ciencias', trimester: 3, maxPoints: 10, weight: 30 },
  { id: 'act-302', name: 'Proyecto Científico', trimester: 3, maxPoints: 10, weight: 40 },
  { id: 'act-303', name: 'Exposición Temática', trimester: 3, maxPoints: 10, weight: 30 },
];

export const initialGrades: Grade[] = [
  // Sofía Rodríguez (Excelente estudiante)
  { studentId: 'st-01', activityId: 'act-101', score: 9.5 },
  { studentId: 'st-01', activityId: 'act-102', score: 10 },
  { studentId: 'st-01', activityId: 'act-103', score: 9.8 },
  { studentId: 'st-01', activityId: 'act-201', score: 9.0 },
  { studentId: 'st-01', activityId: 'act-202', score: 9.5 },
  { studentId: 'st-01', activityId: 'act-203', score: 10 },
  { studentId: 'st-01', activityId: 'act-301', score: 9.7 },
  { studentId: 'st-01', activityId: 'act-302', score: 9.8 },
  { studentId: 'st-01', activityId: 'act-303', score: 9.5 },

  // Mateo García (Crecimiento constante)
  { studentId: 'st-02', activityId: 'act-101', score: 7.0 },
  { studentId: 'st-02', activityId: 'act-102', score: 8.0 },
  { studentId: 'st-02', activityId: 'act-103', score: 7.5 },
  { studentId: 'st-02', activityId: 'act-201', score: 8.5 },
  { studentId: 'st-02', activityId: 'act-202', score: 8.0 },
  { studentId: 'st-02', activityId: 'act-203', score: 9.0 },
  { studentId: 'st-02', activityId: 'act-301', score: 9.5 },
  { studentId: 'st-02', activityId: 'act-302', score: 9.0 },
  { studentId: 'st-02', activityId: 'act-303', score: 9.0 },

  // Valentina Gómez (Destacada)
  { studentId: 'st-03', activityId: 'act-101', score: 8.8 },
  { studentId: 'st-03', activityId: 'act-102', score: 9.5 },
  { studentId: 'st-03', activityId: 'act-103', score: 9.0 },
  { studentId: 'st-03', activityId: 'act-201', score: 8.5 },
  { studentId: 'st-03', activityId: 'act-202', score: 9.2 },
  { studentId: 'st-03', activityId: 'act-203', score: 9.5 },
  { studentId: 'st-03', activityId: 'act-301', score: 9.0 },
  { studentId: 'st-03', activityId: 'act-302', score: 9.5 },
  { studentId: 'st-03', activityId: 'act-303', score: 9.8 },

  // Santiago Pérez (Regular, dificultades Matemáticas en T2)
  { studentId: 'st-04', activityId: 'act-101', score: 6.5 },
  { studentId: 'st-04', activityId: 'act-102', score: 7.5 },
  { studentId: 'st-04', activityId: 'act-103', score: 6.0 },
  { studentId: 'st-04', activityId: 'act-201', score: 5.5 },
  { studentId: 'st-04', activityId: 'act-202', score: 7.0 },
  { studentId: 'st-04', activityId: 'act-203', score: 6.8 },
  { studentId: 'st-04', activityId: 'act-301', score: 7.2 },
  { studentId: 'st-04', activityId: 'act-302', score: 8.0 },
  { studentId: 'st-04', activityId: 'act-303', score: 7.5 },

  // Camila Juárez (Muy constante)
  { studentId: 'st-05', activityId: 'act-101', score: 8.5 },
  { studentId: 'st-05', activityId: 'act-102', score: 8.0 },
  { studentId: 'st-05', activityId: 'act-103', score: 8.5 },
  { studentId: 'st-05', activityId: 'act-201', score: 8.2 },
  { studentId: 'st-05', activityId: 'act-202', score: 8.5 },
  { studentId: 'st-05', activityId: 'act-203', score: 8.0 },
  { studentId: 'st-05', activityId: 'act-301', score: 8.8 },
  { studentId: 'st-05', activityId: 'act-302', score: 9.0 },
  { studentId: 'st-05', activityId: 'act-303', score: 8.5 },

  // Diego Ramírez (Habilidoso en proyectos, regular en exámenes)
  { studentId: 'st-06', activityId: 'act-101', score: 6.0 },
  { studentId: 'st-06', activityId: 'act-102', score: 9.0 },
  { studentId: 'st-06', activityId: 'act-103', score: 7.0 },
  { studentId: 'st-06', activityId: 'act-201', score: 5.8 },
  { studentId: 'st-06', activityId: 'act-202', score: 8.5 },
  { studentId: 'st-06', activityId: 'act-203', score: 7.5 },
  { studentId: 'st-06', activityId: 'act-301', score: 6.2 },
  { studentId: 'st-06', activityId: 'act-302', score: 8.8 },
  { studentId: 'st-06', activityId: 'act-303', score: 8.0 },
];
