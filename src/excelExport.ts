/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as XLSX from 'xlsx';
import { Student, Activity, Grade } from './types';

// Helper to calculate trimester average for a student
function calcTrimesterAvg(studentId: string, trimester: 1 | 2 | 3, activities: Activity[], grades: Grade[]) {
  const trimesterActs = activities.filter(a => a.trimester === trimester);
  if (trimesterActs.length === 0) return null;

  let totalPoints = 0;
  let gradedCount = 0;

  for (const act of trimesterActs) {
    const grade = grades.find(g => g.studentId === studentId && g.activityId === act.id);
    if (grade !== undefined && grade !== null) {
      totalPoints += grade.score;
      gradedCount++;
    }
  }

  return gradedCount > 0 ? Number((totalPoints / gradedCount).toFixed(2)) : null;
}

export function exportGradesToExcel(students: Student[], activities: Activity[], grades: Grade[]) {
  // Sort activities by trimester then by id
  const sortedActs = [...activities].sort((a, b) => {
    if (a.trimester !== b.trimester) return a.trimester - b.trimester;
    return a.id.localeCompare(b.id);
  });

  // Prepare table headers
  const headers = ['Matrícula', 'Nombre del Alumno', 'Correo Electrónico'];
  
  // Headers for activities
  sortedActs.forEach(act => {
    headers.push(`${act.name} (T${act.trimester})`);
  });

  // Headers for calculated averages
  headers.push('Promedio T1', 'Promedio T2', 'Promedio T3', 'Promedio Final General');

  // Prepare rows
  const rows = students.map(student => {
    const rowData: Record<string, any> = {
      'Matrícula': student.rollNumber,
      'Nombre del Alumno': student.name,
      'Correo Electrónico': student.email,
    };

    // Add activity grades
    sortedActs.forEach(act => {
      const grade = grades.find(g => g.studentId === student.id && g.activityId === act.id);
      rowData[`${act.name} (T${act.trimester})`] = grade !== undefined ? grade.score : '';
    });

    // Calculate Averages
    const t1 = calcTrimesterAvg(student.id, 1, activities, grades);
    const t2 = calcTrimesterAvg(student.id, 2, activities, grades);
    const t3 = calcTrimesterAvg(student.id, 3, activities, grades);

    rowData['Promedio T1'] = t1 !== null ? t1 : '-';
    rowData['Promedio T2'] = t2 !== null ? t2 : '-';
    rowData['Promedio T3'] = t3 !== null ? t3 : '-';

    // Overall average
    const validTerms = [t1, t2, t3].filter((t): t is number => t !== null);
    const finalGrade = validTerms.length > 0 
      ? Number((validTerms.reduce((sum, val) => sum + val, 0) / validTerms.length).toFixed(2))
      : '-';

    rowData['Promedio Final General'] = finalGrade;

    return rowData;
  });

  // Create workspace worksheet
  const ws = XLSX.utils.json_to_sheet(rows, { header: headers });

  // Stylistic setups (column formatting widths)
  const colsWidth = [
    { wch: 12 }, // Matricula
    { wch: 28 }, // Nombre
    { wch: 28 }, // Email
  ];
  sortedActs.forEach(() => {
    colsWidth.push({ wch: 16 }); // Activities
  });
  colsWidth.push({ wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 22 }); // Promedios

  ws['!cols'] = colsWidth;

  // Extra Sheet: Resumen de Estadísticas
  const summaryRows = [
    { 'Métrica': 'Total de Alumnos', 'Valor': students.length },
    { 'Métrica': 'Total de Actividades', 'Valor': activities.length },
    { 'Métrica': 'Actividades Trimestre 1', 'Valor': activities.filter(a => a.trimester === 1).length },
    { 'Métrica': 'Actividades Trimestre 2', 'Valor': activities.filter(a => a.trimester === 2).length },
    { 'Métrica': 'Actividades Trimestre 3', 'Valor': activities.filter(a => a.trimester === 3).length },
  ];

  // Calculate global averages
  const finalAvgs = students.map(s => {
    const t1 = calcTrimesterAvg(s.id, 1, activities, grades);
    const t2 = calcTrimesterAvg(s.id, 2, activities, grades);
    const t3 = calcTrimesterAvg(s.id, 3, activities, grades);
    const valid = [t1, t2, t3].filter((t): t is number => t !== null);
    return valid.length > 0 ? (valid.reduce((sum, val) => sum + val, 0) / valid.length) : null;
  }).filter((v): v is number => v !== null);

  if (finalAvgs.length > 0) {
    const classAvg = Number((finalAvgs.reduce((sum, v) => sum + v, 0) / finalAvgs.length).toFixed(2));
    const passCount = finalAvgs.filter(avg => avg >= 6.0).length;
    const passRate = Number(((passCount / finalAvgs.length) * 100).toFixed(1));

    summaryRows.push(
      { 'Métrica': 'Promedio General del Grupo', 'Valor': classAvg },
      { 'Métrica': 'Alumnos Aprobados (>= 6.0)', 'Valor': passCount },
      { 'Métrica': 'Tasa de Aprobación (%)', 'Valor': passRate }
    );
  }

  const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
  wsSummary['!cols'] = [{ wch: 32 }, { wch: 12 }];

  // Create workbook container
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Boleta General');
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Estadísticas del Grupo');

  // Write and Save
  XLSX.writeFile(wb, 'Control_Calificaciones_Alumnos.xlsx');
}
