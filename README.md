# Aruesthetics — web

Web estática de Aruesthetics (aparatología estética profesional para centros). Español de España, sin precios.

## Publicación

La raíz de este repositorio **es** la web. La Hostinger tiene activado el despliegue automático
desde GitHub (rama `main` → raíz de `public_html` de aruesthetics.es): **cada `git push` a `main`
publica la web**. Por eso los ficheros de la web van en la raíz y no en una subcarpeta.

- `index.html`, `css/`, `js/`, `img/`, `video/`, `frames/`, `fonts/`, `enviar.php`, `robots.txt`, `sitemap.xml`.
- `README.md`, `.gitignore` y `.git` quedan bloqueados por el `.htaccess`.
- `src/` (originales de imágenes y vídeos) no se versiona.

## Panel comercial (`/panel`)

Panel privado para el equipo: todos los pedidos del asistente y del formulario, estados
(Nuevo → Contactado → Demostración → Propuesta → Venta cerrada / Perdido), notas, historial,
filtros, botones de WhatsApp/llamada/email y exportación a Excel; también los suscriptores.

- Activación y cambio de contraseña por enlace de un solo uso enviado a comercial@aruesthetics.es.
- Datos en `../aruesthetics-datos/` (fuera de `public_html`): `*.jsonl` + `estado.json` + `panel.json` (hash de la contraseña).
- Seguridad: sesión `SameSite=Strict`, CSRF, límite de intentos, CSP estricta, `noindex`; `panel/_lib.php` no se sirve.
- Probar en local: `php -d "sendmail_path=tee -a /tmp/correo.txt" -S 127.0.0.1:8794 -t .` y abrir `/panel/` (el enlace de activación queda en el fichero).

## Contenido

- **Equipos**: los 13 del catálogo del fabricante «2025 new product catalog» (SANHE). Datos en `js/equipos.js` (solo lo que figura en el catálogo, sin promesas de resultados ni certificados). Fotos en `img/eq-*.webp`: Spectrum DPL Plus y Picosecond 500 ps vienen de la web de SANHE; el resto son recortes del PDF (baja resolución, conviene pedir al fabricante las fotos en alta).
- Imágenes de ambiente y vídeos generados con Higgsfield (GPT Image 2.5 y Kling 3.0).
- **Vídeo scroll** (`#tratamiento`): 151 fotogramas en `frames/d` (escritorio) y `frames/m` (móvil, recorte 3:4) dibujados en un canvas según el scroll. `data-frames` en el `<section>` debe coincidir con el número de fotogramas.
- **Formularios**: `enviar.php` guarda los envíos en `../aruesthetics-datos/*.jsonl` (fuera de `public_html`). Para recibir avisos por email, rellenar `DESTINO` en `enviar.php`.
- **HTTPS**: lo fuerza la Hostinger («Force HTTPS»); el `.htaccess` no redirige.
- **Buscadores**: indexable (`robots.txt` + `sitemap.xml` + canonical).

Previsualizar en local: `python3 -m http.server 8790` en esta carpeta (el formulario necesita PHP, solo funciona en el servidor).
