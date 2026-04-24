# CLAUDE.md

Guía para Claude Code sobre este proyecto.

---

## Concepto del Juego

**Besos en la Oscuridad** — plataformas 2D de sigilo romántico.

Un chico debe llegar hasta su novia para darle un beso, pero hay un **haz de luz** (farol/cámara) que los vigila. Si la luz lo atrapa mientras avanza, pierde una vida. Con 3 vidas.

**Referencia visual completa:** `referencias/concepto.png` — esta imagen contiene todos los elementos visuales y de UI del juego. **Léela antes de implementar cualquier cosa.**

---

## Visión Visual (muy importante)

- **Plataformas 2D vista lateral** (NO top-down)
- Estilo **pixel art** con personajes tipo stick figure
- **Ambiente nocturno**: cielo oscuro azulado, estrellas, nubes, luna
- **Piso con tierra y pasto**, arbustos de fondo
- Personajes: chico (stick figure negro), chica (stick figure rosa)
- **Haz de luz amarillo** que baja desde arriba en diagonal — es el enemigo
- HUD con pixel-art boxes: objetivo (arriba-izq), indicador de luz (arriba-der), corazones (abajo-izq), nivel (abajo-der)

**Lo que NO queremos:**
- Círculos de colores como placeholders — usar sprites o formas que al menos sugieran personajes
- Vista top-down/cenital
- Cámaras rotando 360°
- Colores chillones que rompan la atmósfera nocturna

---

## Mecánicas

### Controles
- `A` / `D` — moverse izquierda/derecha
- `SPACE` / `↓` — agacharse (para pasar bajo el haz de luz)
- `↑` — saltar

### Haz de luz
- Proyectado desde arriba a la derecha, en diagonal hacia el suelo
- Se mueve lateralmente de forma predecible (patrón barrido)
- Puede parpadear o tener patrones por nivel
- Si toca al jugador **de pie** → pierde vida
- Si jugador está **agachado** y la luz pasa por arriba → seguro

### Objetivo
- Llegar hasta la novia (lado derecho) sin ser visto 3 veces
- Al llegar: animación/efecto de beso + pasar al siguiente nivel

### Vidas
- 3 corazones al inicio
- Cada impacto del haz de luz: -1 corazón
- Game over a 0 corazones con opción de reiniciar (R)

---

## Stack Técnico

- **Phaser 3** (v3.70.0) desde CDN
- **JavaScript vanilla** ES6+
- **Sin build step, sin npm**
- **Un solo archivo `game.js`** hasta que supere 500 líneas
- Deploy: **GitHub Pages**

### Estructura
```
besos-oscuridad-v2/
├── CLAUDE.md
├── index.html
├── game.js
├── referencias/
│   └── concepto.png   ← LEE ESTO PRIMERO
└── assets/            ← (por crear)
    ├── sprites/
    └── sounds/
```

---

## Instrucciones de Trabajo

### Modo velocidad
- **Prioridad: juego jugable > juego perfecto**
- Soluciones simples sobre elegantes
- No escribir comentarios educativos largos
- Si una técnica no funciona en 2 intentos, cambiar de técnica

### Assets
- Para la versión inicial, generar sprites simples con Graphics o rectángulos que al menos **se vean como personajes** (cabeza redonda, cuerpo, piernas)
- Cuando el desarrollador pida "sprites reales", sugerir sitios como itch.io o OpenGameArt con búsquedas específicas
- El fondo puede ser un degradado + formas simples (nubes como elipses, estrellas como puntos) antes de usar tilesets

### Testing
- Después de cada cambio significativo, pedir al desarrollador que recargue con `Ctrl+Shift+R` y describa qué ve
- Iterar rápido en base al feedback visual

### Git
```bash
git add .
git commit -m "descripción breve"
git push
```

---

## Roadmap

### Fase 1 — Setup base plataformero
- HTML + Phaser cargado
- Mundo con gravedad
- Suelo (plataforma estática)
- Chico controlable con A/D y salto con ↑
- Fondo degradado nocturno

### Fase 2 — Agachado + chica en el nivel
- Animación/estado de agacharse con SPACE
- Chica sprite estática en posición final del nivel
- Detección de colisión con ella (por ahora solo log)

### Fase 3 — Haz de luz como enemigo
- Haz de luz visual (polígono o graphics) bajando en diagonal
- Movimiento lateral del haz con patrón
- Detección: si jugador está de pie DENTRO del haz → pierde vida
- Si está agachado → la luz pasa por arriba sin detectarlo

### Fase 4 — UI y game feel
- HUD con 3 corazones, contador nivel, indicador de luz
- Pantalla de game over con reinicio (R)
- Animación/efecto cuando llegas a la chica (beso)
- Feedback visual al perder vida (flash rojo, screen shake)

### Fase 5 — Sprites y polish
- Reemplazar formas simples con pixel art real (el desarrollador busca sprites o los genera)
- Animaciones de caminar, agacharse, saltar, besar
- Sonidos básicos
- Fondo parallax con nubes y estrellas como la imagen

### Fase 6 — Niveles
- 3 niveles con dificultad creciente
- Diferentes patrones de luz
- Obstáculos adicionales

### Fase 7 — Soporte móvil
- Touch events para dispositivos táctiles
- Botones virtuales en pantalla (izq, der, agachar, saltar)
- Layout adaptable: canvas centrado, botones en la zona inferior
- No interrumpir el gameplay en escritorio

---

## Preferencias del Desarrollador

- Estudiante de software, primer año
- Prefiere código legible sobre ultra-optimizado
- Quiere avanzar rápido — **no dar clase, solo implementar**
- Comentarios en español cuando sean útiles
- Variables en inglés camelCase

---

## Referencias Internas

**Lee antes de empezar:**
1. `referencias/concepto.png` — imagen objetivo del juego
2. Este archivo completo

**Si no hay `game.js` aún:** empezar desde cero con Fase 1.
**Si ya existe:** preguntar al desarrollador si quiere continuar o reescribir.
