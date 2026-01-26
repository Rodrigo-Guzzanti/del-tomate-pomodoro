# Del Tomate – Design Direction (MVP)

## Dirección
Minimalista, alto contraste amable (sin saturar), con ilustración tipo **Untitled Goose Game** (formas simples, colores plenos, contorno/estilo “flat” limpio). Tomate “cool” sin cara.

## Paleta (propuesta inicial, ajustable)
Objetivo: 3–4 colores máximos, legibles, modernos.
- Tomato Red (primario): para acciones/estado work
- Leaf Green (secundario): acentos / confirmaciones
- Cream / Off-white (fondo): cálido, baja fatiga visual
- Charcoal (texto): alto contraste sin negro puro

Nota: la paleta exacta se define en tokens (ver “Design tokens”) y se puede iterar.

## Tipografía
Sans serif estilo Montserrat:
- Títulos: Montserrat SemiBold
- Texto: Montserrat Regular/Medium
Fallback: System UI

## Componentes UI
- AppBar simple
- Cards o bloques con borde suave (radius 12–16)
- Botones primarios grandes (start/pause)
- Chips para selector de período (Hoy/Semana/Mes)
- Selector de tarea tipo dropdown/modal

## Ilustración / Iconografía
- Tomate como ilustración plana (sin cara)
- Contornos/estética “Goose Game”: simple, casi vectorial
- Iconos lineales (si se usan) consistentes

## Microinteracciones (sutiles)
- Al completar un pomodoro: aparece un tomate nuevo con animación breve (scale/fade)
- Al mover el teléfono (giroscopio): los tomates se “desplazan” levemente (parallax) como detalle (no core)
- Feedback de botón: haptic corto al start/pause

## Estados visuales del timer
- Work: acento rojo + “energía”
- Break: acento verde + “descanso”
- Paused: neutral

## Referencias
- Focus Pomo (interacción / concepto)
- Untitled Goose Game (estética de color y forma)

## Assets (MVP)
- 1 ilustración de tomate base (SVG/PNG)
- 3 sonidos (mp3) “kitchen” (placeholder aceptable)
- Icono app (tomate minimal)

## Notas de implementación
- Definir tokens en `src/theme/tokens.ts`:
  - colors, spacing, radius, typography scale
- Mantener estilos centralizados (evitar estilos sueltos por pantalla)
