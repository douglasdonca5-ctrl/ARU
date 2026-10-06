<?php
/**
 * Arulaser — recepción de formularios (demostración y newsletter).
 *
 * Guarda cada envío en ../arulaser-datos/ (fuera de public_html, para que un
 * nuevo despliegue no lo borre ni sea accesible desde la web) y, si se
 * configura DESTINO, envía además un aviso por email.
 */

declare(strict_types=1);

// Email que recibe los avisos. Vacío = solo se guardan en el servidor.
const DESTINO = '';
const REMITENTE = 'no-responder@cornflowerblue-goose-885481.hostingersite.com';

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

function responder(bool $ok, string $error = '', int $code = 200): void
{
    http_response_code($code);
    echo json_encode($ok ? ['ok' => true] : ['ok' => false, 'error' => $error], JSON_UNESCAPED_UNICODE);
    exit;
}

function campo(string $nombre, int $max = 300): string
{
    $v = trim((string)($_POST[$nombre] ?? ''));
    $v = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $v) ?? '';
    return mb_substr($v, 0, $max);
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    responder(false, 'Método no permitido.', 405);
}

// Trampa para bots: el campo oculto «web» debe llegar vacío
if (campo('web') !== '') {
    responder(true);
}

$tipo = campo('tipo', 20) === 'newsletter' ? 'newsletter' : 'demostracion';
$email = campo('email', 160);
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    responder(false, 'Introduce un email válido.', 422);
}
if (campo('privacidad', 5) === '') {
    responder(false, 'Debes aceptar la política de privacidad.', 422);
}

$datos = [
    'fecha' => date('c'),
    'tipo' => $tipo,
    'email' => $email,
];
if ($tipo === 'demostracion') {
    $datos += [
        'nombre' => campo('nombre', 120),
        'centro' => campo('centro', 160),
        'telefono' => campo('telefono', 40),
        'provincia' => campo('provincia', 80),
        'equipo' => campo('equipo', 80),
        'mensaje' => campo('mensaje', 3000),
    ];
    if ($datos['nombre'] === '') {
        responder(false, 'Indica tu nombre.', 422);
    }
}

// Carpeta de datos fuera de la raíz pública
$dir = dirname(__DIR__) . '/arulaser-datos';
if (!is_dir($dir) && !@mkdir($dir, 0700, true)) {
    error_log('Arulaser: no se pudo crear ' . $dir);
    responder(false, 'No se ha podido enviar. Inténtalo de nuevo en unos minutos.', 500);
}

// Límite sencillo: 6 envíos por IP cada 10 minutos
$ipHash = hash('sha256', ($_SERVER['REMOTE_ADDR'] ?? '') . '|arulaser');
$limiteFile = $dir . '/limite.json';
$ahora = time();
$limites = is_file($limiteFile) ? (json_decode((string)file_get_contents($limiteFile), true) ?: []) : [];
$limites = array_filter($limites, static fn($t) => is_array($t) && max($t) > $ahora - 600);
$mios = array_values(array_filter($limites[$ipHash] ?? [], static fn($t) => $t > $ahora - 600));
if (count($mios) >= 6) {
    responder(false, 'Has enviado varias solicitudes seguidas. Espera unos minutos.', 429);
}
$mios[] = $ahora;
$limites[$ipHash] = $mios;
@file_put_contents($limiteFile, json_encode($limites), LOCK_EX);

$linea = json_encode($datos, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . "\n";
if (@file_put_contents($dir . '/' . $tipo . '.jsonl', $linea, FILE_APPEND | LOCK_EX) === false) {
    error_log('Arulaser: no se pudo guardar el envío');
    responder(false, 'No se ha podido enviar. Inténtalo de nuevo en unos minutos.', 500);
}

if (DESTINO !== '') {
    $asunto = $tipo === 'newsletter' ? 'Arulaser · nueva suscripción' : 'Arulaser · solicitud de demostración';
    $cuerpo = '';
    foreach ($datos as $k => $v) {
        $cuerpo .= ucfirst($k) . ': ' . $v . "\n";
    }
    $cabeceras = [
        'From: Arulaser <' . REMITENTE . '>',
        'Reply-To: ' . $email,
        'Content-Type: text/plain; charset=utf-8',
    ];
    @mail(DESTINO, '=?UTF-8?B?' . base64_encode($asunto) . '?=', $cuerpo, implode("\r\n", $cabeceras));
}

responder(true);
