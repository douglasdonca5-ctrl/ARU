/* ==========================================================
   Aruesthetics — catálogo de equipos
   Fuente: catálogo del fabricante «2025 new product catalog» (SANHE).
   Solo datos que figuran en el catálogo; sin promesas de resultados.
   ========================================================== */
window.CATEGORIAS = {
  depilacion: 'Depilación',
  laser: 'Láser de piel',
  rf: 'Radiofrecuencia',
  corporal: 'Corporal',
  confort: 'Confort en cabina',
};

window.EQUIPOS = {
  hidl: {
    no: 'No. 01', name: 'HIDL-3000', cat: 'depilacion', img: 'img/eq-hidl.webp?v=3',
    tech: 'Diodo · 755/808/1064 nm', techLong: 'Láser de diodo · 755 + 808 + 1064 nm',
    desc: 'Láser de diodo con tres longitudes de onda en un mismo equipo para depilación en todas las zonas, con sistema Android, análisis del vello y refrigeración por contacto de 360°.',
    ventajas: ['Tecnología de colimación FAC (eje rápido)', 'Sistema Android con gestión de clientes (CRM)', 'Sistema de análisis del vello', 'Refrigeración por contacto de 360°'],
    ficha: [
      ['Longitud de onda', '755 + 808 + 1064 nm'], ['Fluencia', '5–80 J/cm²'], ['Ancho de pulso', '5–100 ms'],
      ['Spot', '12,5×14,5 · 13,5×28,5 · 13,5×38,5 mm · redondo 8,25 mm'], ['Frecuencia', '1–10 Hz'],
      ['Potencia de la pieza de mano', '3000 W'], ['Potencia del equipo', '6900 W'],
      ['Refrigeración', 'TEC + aire + agua + semiconductor'], ['Frío en la pieza de mano', '−16 °C'],
      ['Pantalla', 'Táctil a color de 12"'], ['Medidas', '39 × 43 × 110 cm'], ['Peso neto', '53 kg'],
    ],
    aplicadores: 'Cuatro puntas intercambiables: 12,5×14,5 mm, 13,5×28,5 mm, 13,5×38,5 mm y redonda de 8,25 mm.',
  },
  dpl: {
    no: 'No. 02', name: 'Spectrum DPL Plus', cat: 'depilacion', img: 'img/eq-dpl.webp?v=3',
    tech: 'DPL · 420–1200 nm', techLong: 'Luz DPL · depilación + filtros de cuidado de la piel',
    desc: 'Plataforma DPL para depilación (560–950 nm) y cuidado de la piel con filtros (420–1200 nm), con lámpara importada de Alemania y técnica en movimiento.',
    ventajas: ['Adaptadores de spot de cambio rápido', 'Núcleo de luz importado de Alemania', 'Fuente de alimentación OPT', 'Varias longitudes de onda para todo tipo de pieles', 'Tecnología in-motion'],
    ficha: [
      ['Longitud de onda', '420–1200 nm (filtros) · 560–950 nm (depilación)'], ['Filtros', '420, 515, 530, 560, 590, 615, 640, 695 y 755 nm'],
      ['Fluencia', '5–25 J/cm²'], ['Potencia', '4000 W'], ['Cristal', 'Zafiro'], ['Lámpara', 'Importada de Alemania'],
      ['Spot', '15 × 50 mm'], ['Frío por contacto', '−4 °C a 20 °C, ajustable'], ['Refrigeración', 'Agua + semiconductor + aire'],
      ['Pantalla', 'Táctil a color de 10,4"'], ['Peso', '87 kg'],
    ],
    aplicadores: 'Pieza de mano DPL con nueve filtros intercambiables.',
  },
  pico3: {
    no: 'No. 03', name: 'Pico 3 en 1', cat: 'laser', img: 'img/eq-pico3.webp?v=3',
    tech: 'Nd:YAG · 3 modos', techLong: 'Picosegundo + pulso largo + Genesis · 1064 / 532 nm',
    desc: 'Tres modos en un mismo equipo Nd:YAG: picosegundo para tatuajes y pigmento, pulso largo para depilación y lesiones vasculares, y Genesis para el rejuvenecimiento de la piel.',
    ventajas: ['Depilación', 'Lesiones vasculares', 'Rejuvenecimiento de la piel', 'Eliminación de tatuajes', 'Doble sistema de refrigeración'],
    ficha: [
      ['Picosegundo', '1064 / 532 nm · 2000 ps · hasta 10 Hz'], ['Pulso largo', '1064 nm · 500–5000 µs (simple) · 100–300 µs (múltiple)'],
      ['Genesis', '1064 / 532 nm · 2000 ps × 3 · hasta 10 Hz'], ['Spot', '2–10 mm'],
      ['Energía picosegundo', '1064 nm: 100–800 mJ (simple), 100–1600 mJ (doble) · 532 nm: 100–400 mJ (simple), 100–800 mJ (doble)'],
      ['Energía pulso largo', 'Simple 1–30 J · múltiple 200–3000 mJ'], ['Energía Genesis', '80–2400 mJ'],
      ['Haz guía', 'Láser rojo de 650 nm'], ['Alimentación', '220 V, 10 A, 50/60 Hz'], ['Medidas', '82 × 30 × 170 cm'], ['Peso neto', '80 kg'],
    ],
    aplicadores: 'Piezas de mano de 650 nm (tinta verde) y 585 nm (tinta roja), colimada y celular.',
  },
  pico500: {
    no: 'No. 04', name: 'Picosecond 500 ps', cat: 'laser', img: 'img/eq-pico500.webp?v=3',
    tech: 'Picosegundo · 500 ps', techLong: 'Láser de picosegundos · 1064 / 532 nm · brazo coreano',
    desc: 'Láser de picosegundos con brazo de 7 articulaciones importado de Corea, para eliminación de tatuajes, cloasma (melasma) y tratamiento de «muñeca negra» (carbon peel).',
    ventajas: ['Pulso corto de 500 ps', 'Alta frecuencia: 1–10 Hz', 'Alta precisión: spot ajustable de 2 a 10 mm', 'Brazo de 7 articulaciones importado de Corea'],
    ficha: [
      ['Potencia', '2500 W'], ['Longitud de onda', '1064 nm y 532 nm (650 y 585 nm opcionales)'],
      ['Energía', '1064 nm: 80–800 mJ · 532 nm: 40–400 mJ'], ['Frecuencia', '1–10 Hz'], ['Spot', 'Ø 2–10 mm'],
      ['Refrigeración', 'Aire + agua + semiconductor'], ['Alimentación', 'AC 220 V ±10 % 50 Hz · AC 110 V ±10 % 60 Hz'],
      ['Medidas', '95 × 40 × 185 cm'], ['Peso neto', '109,3 kg'],
    ],
    aplicadores: 'Piezas de mano de 650 nm y 585 nm, focal (1064 y 532 nm), celular y fraccional.',
  },
  co2: {
    no: 'No. 05', name: 'CO₂ Fraccional Metal RF', cat: 'laser', img: 'img/eq-co2.webp?v=3',
    tech: 'CO₂ · 10,6 µm', techLong: 'Láser de CO₂ fraccional · tubo metálico de RF · 40 W',
    desc: 'Láser de CO₂ fraccional con tubo metálico de radiofrecuencia para rejuvenecimiento de la piel, con modos continuo, fraccional y ultra, y cabezales para tratamiento ginecológico.',
    ventajas: ['Alta potencia: 40 W', 'Modo continuo (CW)', 'Modo fraccional', 'Modo ultra'],
    ficha: [
      ['Tipo de láser', 'CO₂ · 10,6 µm'], ['Potencia de salida', '40 W'], ['Distancia focal', 'F = 75 mm'],
      ['Haz guía', 'Diodo rojo de 650 nm, ≤5 mW'], ['Transmisión', 'Brazo de 7 articulaciones con muelle'],
      ['Extracción de humo', 'Soplado de aire integrado'], ['Refrigeración', 'Por aire'],
      ['Alimentación', '~220 V ±22 V, 50 Hz'], ['Medidas', '44 × 46 × 183 cm'], ['Peso neto', '46 kg'],
    ],
    aplicadores: 'Cabezal de corte, cabezal fraccional, piezas de 50 y 100 mm, cabezal vaginal y endoscopio digital.',
  },
  erbio: {
    no: 'No. 06', name: 'Er:YAG 2940', cat: 'laser', img: 'img/eq-erbio.webp?v=3',
    tech: 'Er:YAG · 2940 nm', techLong: 'Láser de erbio:YAG · 2940 nm',
    desc: 'Láser de erbio para resurfacing de la piel, ligero o completo, y tratamiento de lesiones epidérmicas, dérmicas y pigmentadas benignas.',
    ventajas: ['Resurfacing ligero o completo', 'Lesiones epidérmicas y dérmicas', 'Lesiones pigmentadas benignas'],
    ficha: [
      ['Tipo de láser', 'Er:YAG'], ['Longitud de onda', '2940 nm'], ['Duración de pulso', '100–1500 µs'],
      ['Energía', '200–3000 mJ'], ['Frecuencia', '1–10 Hz'], ['Spot', '2–7 mm, ajustable'], ['Vida útil', '10.000.000 disparos'],
    ],
    aplicadores: 'Piezas de mano R11 (2–3 mm), R12 (4–5 mm) y R13 (6–7 mm); pieza fraccional opcional.',
  },
  tulio: {
    no: 'No. 07', name: 'Thulium 1927', cat: 'laser', img: 'img/eq-tulio.webp?v=3', tag: 'Nuevo',
    tech: 'Tulio · 1927 nm', techLong: 'Láser de tulio · 1927 nm',
    desc: 'Láser de tulio de 1927 nm, ablativo y no ablativo, indicado para luminosidad y unificación del tono, melasma, arrugas finas, poros dilatados y textura de la piel.',
    ventajas: ['Fibra de tulio de larga duración y sin consumibles: bajo coste de mantenimiento', 'Funciones ablativa y no ablativa', 'Puntas de distintos tamaños y rodillos que ayudan a absorber el producto tras crear las zonas microtérmicas (MTZ)'],
    ficha: [
      ['Longitud de onda', '1927 nm'], ['Potencia', '15 W / 30 W, ajustable'], ['Duración de pulso', '0,1–10 ms'],
      ['Piezas de mano', 'Fraccional (6×6, 12×12 y 20×20 mm), rodillo y vaginal'], ['Pantalla', 'Android de 13,3"'],
      ['Tensión', '110 / 220 V'], ['Potencia total', '600 W'], ['Medidas', '50 × 40 × 100 cm'], ['Peso neto', '35 kg'],
    ],
    aplicadores: 'Pieza fraccional con puntas de 6×6, 12×12 y 20×20 mm, rodillo y pieza vaginal.',
  },
  patrixr: {
    no: 'No. 08', name: 'PatrixR', cat: 'rf', img: 'img/eq-patrixr.webp?v=3',
    tech: 'RF · 2 MHz', techLong: 'Radiofrecuencia multidimensional con microagujas · 2 MHz',
    desc: 'Equipo de radiofrecuencia multidimensional: varias profundidades y niveles de energía en una sola pasada, con control de impedancia y reconocimiento automático de puntas.',
    ventajas: ['Varias profundidades y energías en una sola pasada', 'Monitorización inteligente de la impedancia', 'Reconocimiento automático de puntas', 'Sistema Android'],
    ficha: [
      ['Potencia', '500 W'], ['Pantalla', 'Android de 13,3"'], ['Frecuencia', '2 MHz'], ['Energía RF', '50 W'],
      ['Duración de pulso', '10–900 ms'], ['Impedancia', '20–120 Ω'], ['Puntas', 'Aisladas y no aisladas (R-25, R-49, R-81)'],
      ['Profundidad de aguja', '0,1–4 mm'], ['Tensión', 'AC 220 V, 50–60 Hz (110 V opcional)'], ['Medidas', '45 × 34,5 × 103,5 cm'], ['Peso', '40 kg'],
    ],
    aplicadores: 'PatrixR (resurfacing), FractionalR (corrección de la piel) e IceR (mantenimiento de la piel).',
  },
  pinxel: {
    no: 'No. 09', name: 'Pinxel-V', cat: 'rf', img: 'img/eq-pinxel.webp?v=3',
    tech: 'Microagujas RF', techLong: 'Microagujas con radiofrecuencia · 2 MHz',
    desc: 'Microagujas con radiofrecuencia monopolar y bipolar, con profundidad ajustable de 0,4 a 4 mm y vacío automático, que ayuda a que los activos lleguen a la dermis.',
    ventajas: ['Sistema Android con gestión de clientes (CRM)', 'Monopolar y bipolar', 'Agujas ajustables de 0,4 a 4 mm', 'Puntas aisladas y no aisladas', 'Sistema de vacío automático'],
    ficha: [
      ['Potencia', 'Máx. 50 W'], ['Frecuencia', '2 MHz'], ['Energía', '1–10 niveles'], ['Duración de pulso', '10–900 ms'],
      ['Profundidad de aguja', '0,4–4 mm, ajustable'], ['Presión', '0–4 niveles'], ['Modo de trabajo', 'Simple / automático'],
      ['Modo', 'Monopolar y bipolar'], ['Refrigeración', '1–3 niveles'], ['Puntas invasivas', 'M-18, M-25, M-49, M-81'],
      ['Puntas no invasivas', 'F-3×3, F-5×5, F-9×9'], ['Medidas', '47 × 59 × 120 cm'], ['Peso neto', '36 kg'],
    ],
    aplicadores: 'Aplicador de microagujas RF, aplicador fraccional RF, mango negativo (para monopolar) y mango de frío.',
  },
  magshape: {
    no: 'No. 10', name: 'HI-EMT Magshape', cat: 'corporal', img: 'img/eq-magshape.webp?v=3',
    extra: { img: 'img/eq-magshape-silla.webp?v=3', label: 'Silla Magshape (2 en 1)' },
    tech: 'HI-EMT + RF', techLong: 'Campo electromagnético de alta intensidad + radiofrecuencia · hasta 7 T',
    desc: 'Equipo HI-EMT con radiofrecuencia para tonificar el músculo y trabajar la grasa en la misma sesión, sin anestesia ni cirugía. Se combina con la silla Magshape para suelo pélvico.',
    ventajas: ['Sin anestesia ni cirugía', 'Trabaja músculo y grasa en la misma sesión', 'Tres modos: deportivo, suave y profesional', '4 aplicadores'],
    ficha: [
      ['Campo magnético', '0–7 T'], ['Potencia', '4700 W'], ['Salida RF', '400 W'], ['Frecuencia', 'F1: 1–10 Hz · F2: 1–100 Hz'],
      ['Ancho de pulso', '300 µs'], ['Modos', 'Deportivo, suave y profesional'], ['Pantalla', '10,4"'], ['Aplicadores', '4'],
      ['Tensión', '220 V'], ['Medidas', '55 × 42 × 156 cm'], ['Peso neto', '75 kg'],
    ],
    aplicadores: 'Abdomen, glúteos y muslos · muslos, brazos y piernas · silla para suelo pélvico (urología, ginecología y recuperación posparto).',
  },
  megashape: {
    no: 'No. 11', name: 'Megashape Pro', cat: 'corporal', img: 'img/eq-megashape.webp?v=3', tag: 'Nuevo',
    tech: 'Vacío · RF · cavitación', techLong: 'Vacío + radiofrecuencia + cavitación + 940 nm',
    desc: 'Plataforma corporal que combina vacío con rodillos, radiofrecuencia multipolar y bipolar, cavitación y luz infrarroja de 940 nm para trabajar el contorno.',
    ventajas: ['Presión negativa (vacío)', 'Estimulación mecánica con rodillos', 'Lifting por radiofrecuencia', 'Cavitación para la reducción de grasa', 'Luz infrarroja de 940 nm que activa el metabolismo'],
    ficha: [
      ['Aplicadores', 'Rodillo de vacío, RF multipolar, RF bipolar y cavitación'], ['Pantalla', 'Android de 13,3"'], ['RF', '1 MHz'],
      ['Cavitación', '40 kHz'], ['Vacío', '80 kPa'], ['LED 940 nm', '12 W'], ['Tensión', '110 / 220 V'],
      ['Potencia', '800 W'], ['Medidas', '64,5 × 36 × 110 cm'],
    ],
    aplicadores: 'Rodillo de vacío, RF multipolar, RF bipolar y cavitación.',
  },
  cryo: {
    no: 'No. 12', name: 'Cryocool 360°', cat: 'corporal', img: 'img/eq-cryo.webp?v=3',
    tech: 'Criolipólisis · −12 °C', techLong: 'Criolipólisis 360° · cinco aplicadores',
    desc: 'Criolipólisis de 360° con cinco aplicadores de distintos tamaños, silicona de grado médico y pantalla orientable.',
    ventajas: ['5 aplicadores', 'Pantalla táctil intuitiva', 'Superenfriamiento hasta −12 °C', 'Silicona médica segura y cómoda', 'Ángulo de pantalla ajustable', 'Filtro de algodón médico que retiene impurezas'],
    ficha: [
      ['Potencia', '1200 W'], ['Presión del cabezal', '0–60 kPa'], ['Temperatura', '−12 °C a −1 °C'],
      ['Aplicadores', '5 de distintos tamaños'], ['Pantalla', '15,6", abatible de 30° a 73°'],
      ['Refrigeración', 'Semiconductor + agua + aire'], ['Medidas', '41 × 53 × 147 cm'], ['Peso neto', '70 kg'],
    ],
    aplicadores: 'Cinco cabezales intercambiables (de 76×36×27 a 204×73×81 mm) con pantalla de 3,5" que muestra temperatura, vacío y tiempo.',
  },
  aircool: {
    no: 'No. 13', name: 'Skin Air Cooling', cat: 'confort', img: 'img/eq-aircool.webp?v=3',
    tech: 'Aire frío · −30 °C', techLong: 'Enfriador de piel por aire frío',
    desc: 'Enfriador de piel por aire frío para acompañar los tratamientos láser: más confort para la clienta durante la sesión.',
    ventajas: ['Compresores importados de Alemania', 'Refrigeración a muy baja temperatura, hasta −30 °C', 'Sistema independiente de reducción de ruido', 'Soplador de alta velocidad'],
    ficha: [
      ['Pantalla', 'Táctil a color de 5"'], ['Potencia', '1500 W'], ['Temperatura', '−4 °C a −30 °C, ajustable'],
      ['Velocidad del aire', '1–6, ajustable'], ['Desescarche', '15 s'], ['Alimentación', '110 V / 220 V, 50 Hz, 3 A'],
      ['Manguera de tratamiento', '2 m'], ['Soporte', '3 articulaciones'], ['Medidas', '81 × 40 × 84,5 cm'], ['Peso neto', '62 kg'],
    ],
    aplicadores: 'Adaptadores redondo pequeño, cuadrado mediano y cuadrado grande.',
  },
};
