# Aruesthetics — web

Web estática de Aruesthetics (maquinaria láser para centros estéticos). Español de España, sin precios.

- `site/` — lo que se publica: `index.html`, `css/`, `js/`, `img/`, `video/`, `frames/`, `fonts/`, `enviar.php`.
- Imágenes y vídeos generados con Higgsfield (GPT Image 2.5 y Kling 3.0); los originales quedan en `src/` (no versionados).
- **Vídeo scroll** (`#tratamiento`): secuencia de 151 fotogramas en `site/frames/d` (escritorio, 1600 px) y `site/frames/m` (móvil, recorte 3:4) dibujada en un canvas según el scroll. `data-frames` en el `<section>` debe coincidir con el número de fotogramas.
- **Formularios**: `enviar.php` guarda los envíos en `../aruesthetics-datos/*.jsonl` (fuera de `public_html`). Para recibir avisos por email, rellenar `DESTINO` en `enviar.php`.
- **Dominio temporal**: la web lleva `noindex` (meta, cabecera `X-Robots-Tag` y `robots.txt`). Quitarlo al pasar al dominio definitivo.

Previsualizar en local: `python3 -m http.server 8791 --directory site` (el formulario necesita PHP, solo funciona en el servidor).
