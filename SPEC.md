# Del Tomate – Pomodoro (MVP Spec)

## Objetivo
App móvil Pomodoro para iOS/Android, offline-first, con tareas organizadas por categorías editables, conteo de “tomates” por tarea, sonidos + vibración, y estadísticas básicas.

## Plataforma / Stack (MVP)
- Expo (managed) + React Native + TypeScript
- Persistencia local (SQLite)
- Notificaciones locales (Expo Notifications)
- Audio local (Expo AV)
- Haptics/Vibración (Expo Haptics / Vibration)
- Offline-first (sin backend, sin cuentas)

## Reglas Pomodoro (default)
- Work: 25 min
- Short break: 5 min
- Long break: 15 min
- Long break cada 4 pomodoros completados
- Auto-start (work/break): disponible como setting, **por defecto desactivado**
- Skip: permitido **solo para saltear descansos** (short/long). No se puede “skip” de work.
- Pause: permitido sin límite; se debe persistir el estado pausado para reanudar tal cual.
- Cada sesión de work completada suma **+1 tomate** a la tarea asignada.
- No se permite sumar tomates manualmente.

## Background / Pantalla bloqueada (requisito MVP)
- El timer debe “funcionar” con pantalla bloqueada y en background:
  - Usar timestamps persistidos (startAt, endAt) + notificación local para fin de tramo.
  - Al volver a la app, recalcular el estado real según el reloj (evitar drift).
  - Si el OS pausa la app, la fuente de verdad es el timestamp + notificación programada.

## Estructura de organización
### Categorías (tipo “proyecto”)
- Categorías por defecto: **Laburo**, **Estudio**, **Proyecto**
- El usuario puede **renombrarlas**.
- El usuario puede crear/gestionar **hasta 5 categorías en total** (incluyendo las 3 iniciales).

### Vistas por período (filtros)
- Vistas: **Hoy**, **Semana**, **Mes**
- Son filtros para ver stats y/o sesiones por rango de tiempo (no son categorías).

### Tareas
Campos:
- `title` (obligatorio)
- `categoryId` (obligatorio)
- `tomatoGoal` (opcional, entero > 0)
- `tomatoesCompleted` (derivado de sesiones completadas)
- Estado: activa / archivada

Formato UI de objetivo:
- Ejemplo: `1/5` tomates (completados/objetivo)

## Sonidos y vibración
### Sonidos (estilo “Kitchen”, cortos)
- Inicio de Work: sonido corto “arranque”
- Inicio de Break: sonido corto “completado/alegre”
- Fin de Break (volver a work): sonido un poco más largo “retomar”

Los sonidos deben ser archivos locales (ej. mp3) y reemplazables a futuro.

### Vibración / Haptics
- Si el dispositivo está en modo vibración (o haptics habilitado):
  - Inicio de Work: **2 vibraciones cortas**
  - Transición a Break (fin work): **1 vibración larga**
  - Fin de Break (volver a work): **1 vibración larga** (o patrón definido en settings)

## Estadísticas (MVP)
- Tomates cosechados:
  - Total del día / semana / mes
  - Por tarea (ranking simple)
- Tiempo enfocado:
  - minutos de work completados por día / semana / mes
- No incluir rachas (streak) en MVP.

## Pantallas (MVP)
1. **Home / Timer**
   - Selector de tarea activa (obligatorio para iniciar work)
   - Estado actual: work / break / paused
   - Control: start / pause / resume / reset
   - Skip break (solo cuando está en break)
   - Progreso visual de tomates de la tarea (tomates acumulados + objetivo)
2. **Tareas**
   - Listado por categoría
   - Crear/editar/archivar tarea
   - Setear objetivo de tomates
3. **Categorías**
   - Listar categorías (máx 5)
   - Renombrar
   - Crear nueva / eliminar (con reglas: no borrar si tiene tareas; o mover tareas)
4. **Stats**
   - Selector: Hoy / Semana / Mes
   - Totales + listado por tarea
5. **Settings**
   - Duraciones editables (work/short/long)
   - Auto-start toggles (default OFF)
   - Sonidos on/off + selección de set (placeholder)
   - Haptics on/off

## Fuera de alcance
- Sync en la nube / cuentas
- Colaboración
- Widgets
- Notificaciones avanzadas (más allá de local schedule)
- Personaje con cara / gamificación compleja
