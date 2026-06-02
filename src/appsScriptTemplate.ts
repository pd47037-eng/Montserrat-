/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const APPS_SCRIPT_CODE = `/**
 * Código para Google Apps Script - Gestor de Calificaciones
 * 
 * Este script actúa como una base de datos API para centralizar y respaldar
 * las alumnos, actividades y calificaciones de tu aplicación.
 * Permite realizar lecturas (GET) y escrituras completas (POST).
 */

// Nombre de las hojas que se crearán en tu documento de Google Sheets
const SHEET_ALUMNOS = "Alumnos";
const SHEET_ACTIVIDADES = "Actividades";
const SHEET_CALIFICACIONES = "Calificaciones";

/**
 * Configuración de cabeceras CORS para permitir peticiones desde cualquier origen (GitHub Pages, localhost, etc.)
 */
function handleResponse(data) {
  const jsonString = JSON.stringify(data);
  return ContentService.createTextOutput(jsonString)
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Método GET: Lee todos los datos de las hojas y los devuelve en formato JSON.
 */
function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Obtener u organizar las hojas de cálculo
    const sheetAlumnos = getOrCreateSheet(ss, SHEET_ALUMNOS, ["ID", "Nombre", "Matricula", "Email"]);
    const sheetActividades = getOrCreateSheet(ss, SHEET_ACTIVIDADES, ["ID", "Nombre", "Trimestre", "Puntos Maximos", "Peso %"]);
    const sheetCalificaciones = getOrCreateSheet(ss, SHEET_CALIFICACIONES, ["ID Alumno", "ID Actividad", "Calificacion"]);
    
    // Leer datos
    const students = readSheetData(sheetAlumnos, ["id", "name", "rollNumber", "email"]);
    const activities = readSheetData(sheetActividades, ["id", "name", "trimester", "maxPoints", "weight"], {
      trimester: Number,
      maxPoints: Number,
      weight: Number
    });
    const grades = readSheetData(sheetCalificaciones, ["studentId", "activityId", "score"], {
      score: Number
    });
    
    return handleResponse({
      status: "success",
      data: { students, activities, grades }
    });
  } catch (err) {
    return handleResponse({
      status: "error",
      message: err.toString()
    });
  }
}

/**
 * Método POST: Recibe datos en formato JSON y los sobrescribe en las hojas correspondientes.
 */
function doPost(e) {
  try {
    const postData = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Validar datos de entrada
    const students = postData.students || [];
    const activities = postData.activities || [];
    const grades = postData.grades || [];
    
    // Obtener u organizar las hojas
    const sheetAlumnos = getOrCreateSheet(ss, SHEET_ALUMNOS, ["ID", "Nombre", "Matricula", "Email"]);
    const sheetActividades = getOrCreateSheet(ss, SHEET_ACTIVIDADES, ["ID", "Nombre", "Trimestre", "Puntos Maximos", "Peso %"]);
    const sheetCalificaciones = getOrCreateSheet(ss, SHEET_CALIFICACIONES, ["ID Alumno", "ID Actividad", "Calificacion"]);
    
    // Escribir Alumnos
    writeSheetData(sheetAlumnos, ["ID", "Nombre", "Matricula", "Email"], students, function(s) {
      return [s.id, s.name, s.rollNumber, s.email];
    });
    
    // Escribir Actividades
    writeSheetData(sheetActividades, ["ID", "Nombre", "Trimestre", "Puntos Maximos", "Peso %"], activities, function(a) {
      return [a.id, a.name, a.trimester, a.maxPoints, a.weight];
    });
    
    // Escribir Calificaciones
    writeSheetData(sheetCalificaciones, ["ID Alumno", "ID Actividad", "Calificacion"], grades, function(g) {
      return [g.studentId, g.activityId, g.score];
    });
    
    return handleResponse({
      status: "success",
      message: "Datos sincronizados correctamente con Google Sheets.",
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return handleResponse({
      status: "error",
      message: err.toString()
    });
  }
}

/**
 * Utilidad: Lee datos de una hoja omitiendo la cabecera e interpretándola de forma relacional.
 */
function readSheetData(sheet, headers, types = {}) {
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return []; // Solo cabecera
  
  const data = [];
  for (let r = 1; r < values.length; r++) {
    const row = values[r];
    const item = {};
    let emptyRow = true;
    
    for (let c = 0; c < headers.length; c++) {
      let val = row[c];
      if (val !== "") emptyRow = false;
      
      const key = headers[c];
      if (types[key]) {
        val = types[key](val);
      }
      item[key] = val;
    }
    
    if (!emptyRow) {
      data.push(item);
    }
  }
  return data;
}

/**
 * Utilidad: Escribe datos limpiando previamente la hoja e insertando de nuevo las cabeceras y filas.
 */
function writeSheetData(sheet, headers, items, mapFn) {
  sheet.clearContents();
  
  // Escribir cabecera
  sheet.appendRow(headers);
  
  if (items.length === 0) return;
  
  // Agrupar filas para inserción eficiente
  const rows = items.map(mapFn);
  
  // Insertar por rango para mejorar el rendimiento
  const range = sheet.getRange(2, 1, rows.length, headers.length);
  range.setValues(rows);
}

/**
 * Utilidad: Busca o crea una hoja con las cabeceras dadas si no existe.
 */
function getOrCreateSheet(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    // Dar un formato básico a la cabecera
    const range = sheet.getRange(1, 1, 1, headers.length);
    range.setBackground("#2b3e50");
    range.setFontColor("#ffffff");
    range.setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
  return sheet;
}
`;

export const INSTRUCTIONS_ES = `### Paso a Paso: Conexión de tu Web App con Google Sheets

Sigue estas sencillas instrucciones para conectar esta Web App a una hoja de Google Sheets en tiempo real. Esto permitirá que todos los datos se sincronicen directamente a un archivo centralizado tuyo.

#### 1. Crear tu Hoja de Cálculo
1. Ve a [Google Sheets](https://sheets.google.com/) y crea una hoja de cálculo nueva en blanco.
2. Asígnale un nombre descriptivo (por ejemplo, \`Control de Calificaciones - Primaria\`).
3. Guarda o copia el **ID de tu hoja de cálculo** (está en la barra de direcciones de tu navegador, entre \`/d/\` y \`/edit\`).

#### 2. Abrir Google Apps Script
1. En el menú superior de tu archivo de Google Sheets, dirígete a **Extensiones** -> **Apps Script**.
2. Se abrirá una ventana de edición de código con un archivo llamado \`Código.gs\`.
3. Borra todo el código que aparezca por defecto en este archivo.

#### 3. Copiar e Insertar el Código
1. Haz clic en el botón de la sección de abajo para copiar el **Código de Apps Script**.
2. Pega el código copiado dentro del editor de Apps Script.
3. Guarda el proyecto haciendo clic en el icono del **Disco** (Guardar proyecto) o presionando \`Ctrl + S\` (\`Cmd + S\` en Mac). Estás listo para publicar.

#### 4. Implementar como Aplicación Web (¡Paso Crucial!)
1. En la esquina superior derecha del editor de Apps Script, haz clic en el botón azul **Implementar** (Deploy) y selecciona **Nueva implementación** (New deployment).
2. Haz clic en el icono de **Engrane** (Tipo de implementación) al lado de "Seleccionar tipo" y elige **Aplicación web** (Web app).
3. Configura los siguientes parámetros (¡muy importante para que funcione externamente!):
   - **Descripción**: \`API Gestor de Calificaciones\`
   - **Ejecutar como** (Execute as): Selecciona **Tu cuenta de Google (Tu correo electrónico)**.
   - **Quién tiene acceso** (Who has access): Selecciona **Cualquiera** (Anyone) o *Cualquiera, incluso anónimo*. Esto es seguro ya que el script solo responderá de forma privada a tu aplicación.
4. Haz clic en el botón **Implementar** (Deploy).
5. **Autorizar accesos**: Google te solicitará otorgar permisos al script para modificar tu hoja de cálculo. 
   - Haz clic en *Autorizar acceso*.
   - Elige tu cuenta de Google.
   - Haz clic en el enlace pequeño que dice **Avanzado** (o Advanced) en la parte inferior izquierda de la advertencia.
   - Haz clic en **Ir a Proyecto sin nombre (no seguro)** (Go to Untitled, safe/continue).
   - Haz clic en **Permitir** (Allow).
6. Una vez completado, verás una ventana que indica que la implementación fue exitosa. Copia la **URL de la aplicación web** completa (esta URL termina en \`/exec\`).

#### 5. Configurar la URL en esta Web App
1. Regresa a esta aplicación web y dirígete a la pestaña o modal de **Conexión Google Sheets**.
2. Pega la URL que copiaste (debe verse similar a \`https://script.google.com/macros/s/.../exec\`) en el campo correspondiente.
3. Haz clic en **Guardar Conexión**.
4. ¡Listo! Ahora podrás usar los botones **"Cargar datos de Sheets"** (para recuperar registros) y **"Sincronizar a Sheets"** (para respaldar o subir los cambios actuales).

---

### Paso a Paso para Alojar tu Web App en GitHub Pages (Servicio 100% Gratis)

Esta Web App ha sido estructurada de forma modular, lo que la hace 100% compatible con sitios estáticos como **GitHub Pages**. Para publicarla gratis:

1. **Descarga el código del proyecto**: Abre la pestaña de opciones o exportación en AI Studio y selecciona "Exportar a GitHub" o presiona descargar ZIP.
2. **Crear repositorio en GitHub**: Abre tu cuenta de [GitHub](https://github.com/), crea un repositorio nuevo llamado \`gestor-calificaciones\` (puedes ponerlo público).
3. **Subir archivos**:
   - Si descargas el ZIP: descomprímelo en tu computadora. Puedes subir todo el código mediante comandos de git o subiendo los archivos directamente desde el navegador en GitHub presionando "Upload files".
4. **Configurar GitHub Pages**:
   - En tu repositorio de GitHub, haz clic en la pestaña **Settings** (Configuración) en el menú superior.
   - Busca la sección **Pages** (Páginas) en el menú lateral de la izquierda.
   - Bajo **Build and deployment**, selecciona la pestaña Branch y elige \`main\` (o \`master\`) y la carpeta \`/ (root)\`, luego dale clic a **Save** (Guardar).
5. **¡Listo!** En unos minutos, GitHub te dará la URL pública final (ej. \`https://tu-usuario.github.io/gestor-calificaciones/\`) donde tú o tus colegas docentes podrán acceder al panel desde cualquier dispositivo móvil o computadora de forma permanente.
`;
