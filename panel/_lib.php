<?php
/**
 * Panel comercial de Aruesthetics — utilidades compartidas.
 *
 * Datos en ../aruesthetics-datos (fuera de public_html, igual que enviar.php):
 *   asistente.jsonl, demostracion.jsonl, llamada.jsonl  → pedidos (solo se añaden líneas)
 *   newsletter.jsonl                                     → suscriptores
 *   estado.json                                          → estado, notas e historial de cada pedido
 *   panel.json                                           → contraseña (hash), enlace de activación y límites
 */

declare(strict_types=1);

if (!defined('ARU_PANEL')) {
    http_response_code(404);
    exit;
}

date_default_timezone_set('Europe/Madrid');

const PANEL_EMAIL = 'comercial@aruesthetics.es';
const PANEL_REMITENTE = 'comercial@aruesthetics.es';
const SESION_HORAS = 12;
const ENLACE_MINUTOS = 120;

const ESTADOS = [
    'nuevo' => 'Nuevo',
    'contactado' => 'Contactado',
    'demo' => 'Demostración',
    'propuesta' => 'Propuesta enviada',
    'ganado' => 'Venta cerrada',
    'perdido' => 'Perdido',
];

function dir_datos(): string
{
    $dir = dirname(__DIR__, 2) . '/aruesthetics-datos';
    if (!is_dir($dir)) {
        @mkdir($dir, 0700, true);
    }
    return $dir;
}

function es_https(): bool
{
    return (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || strtolower($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https'
        || ($_SERVER['SERVER_PORT'] ?? '') === '443';
}

function cabeceras_seguras(): void
{
    header('X-Robots-Tag: noindex, nofollow');
    header('Cache-Control: no-store, private');
    header('X-Frame-Options: DENY');
    header('X-Content-Type-Options: nosniff');
    header('Referrer-Policy: same-origin');
    header("Content-Security-Policy: default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; connect-src 'self'; font-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
}

function iniciar_sesion(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }
    session_name('aru_panel');
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/panel/',
        'secure' => es_https(),
        'httponly' => true,
        'samesite' => 'Strict',
    ]);
    session_start();
}

/* ---------- Ficheros JSON con bloqueo ---------- */

function leer_json(string $nombre, array $porDefecto = []): array
{
    $f = dir_datos() . '/' . $nombre;
    if (!is_file($f)) {
        return $porDefecto;
    }
    $d = json_decode((string)file_get_contents($f), true);
    return is_array($d) ? $d : $porDefecto;
}

function escribir_json(string $nombre, array $datos): void
{
    $f = dir_datos() . '/' . $nombre;
    $tmp = $f . '.' . bin2hex(random_bytes(4)) . '.tmp';
    file_put_contents($tmp, json_encode($datos, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT), LOCK_EX);
    @chmod($tmp, 0600);
    rename($tmp, $f);
}

/** Modifica un JSON dentro de un bloqueo exclusivo (evita perder cambios simultáneos). */
function con_bloqueo(string $nombre, callable $cambio)
{
    $lock = fopen(dir_datos() . '/.' . $nombre . '.lock', 'c');
    flock($lock, LOCK_EX);
    try {
        $datos = leer_json($nombre);
        $resultado = $cambio($datos);
        escribir_json($nombre, $datos);
        return $resultado;
    } finally {
        flock($lock, LOCK_UN);
        fclose($lock);
    }
}

/* ---------- Acceso ---------- */

function config(): array
{
    return leer_json('panel.json');
}

function tiene_contrasena(): bool
{
    return !empty(config()['hash']);
}

function ip_hash(): string
{
    return hash('sha256', ($_SERVER['REMOTE_ADDR'] ?? '') . '|aruesthetics-panel');
}

/** true si la clave aún tiene intentos; registra el intento. */
function permitir(string $clave, int $max, int $segundos): bool
{
    return con_bloqueo('panel.json', function (array &$c) use ($clave, $max, $segundos) {
        $ahora = time();
        $k = $clave . ':' . ip_hash();
        $lista = array_values(array_filter($c['limites'][$k] ?? [], fn($t) => $t > $ahora - $segundos));
        // limpiar claves viejas
        foreach ($c['limites'] ?? [] as $kk => $ts) {
            if (!array_filter($ts, fn($t) => $t > $ahora - 86400)) {
                unset($c['limites'][$kk]);
            }
        }
        if (count($lista) >= $max) {
            $c['limites'][$k] = $lista;
            return false;
        }
        $lista[] = $ahora;
        $c['limites'][$k] = $lista;
        return true;
    });
}

function autenticado(): bool
{
    iniciar_sesion();
    $ok = !empty($_SESSION['ok']) && ($_SESSION['caduca'] ?? 0) > time()
        && ($_SESSION['version'] ?? '') === (config()['version'] ?? '');
    if (!$ok && !empty($_SESSION['ok'])) {
        $_SESSION = [];
    }
    return $ok;
}

function abrir_sesion(): void
{
    iniciar_sesion();
    session_regenerate_id(true);
    $_SESSION['ok'] = true;
    $_SESSION['caduca'] = time() + SESION_HORAS * 3600;
    $_SESSION['version'] = config()['version'] ?? '';
    $_SESSION['csrf'] = bin2hex(random_bytes(16));
}

function csrf(): string
{
    iniciar_sesion();
    if (empty($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(16));
    }
    return $_SESSION['csrf'];
}

function csrf_valido(?string $token): bool
{
    iniciar_sesion();
    return is_string($token) && !empty($_SESSION['csrf']) && hash_equals($_SESSION['csrf'], $token);
}

function guardar_contrasena(string $clave): void
{
    con_bloqueo('panel.json', function (array &$c) use ($clave) {
        $c['hash'] = password_hash($clave, PASSWORD_DEFAULT);
        $c['version'] = bin2hex(random_bytes(6));   // cierra las demás sesiones abiertas
        $c['cambiada'] = date('c');
        unset($c['enlace']);
    });
}

function comprobar_contrasena(string $clave): bool
{
    $hash = config()['hash'] ?? '';
    return $hash !== '' && password_verify($clave, $hash);
}

/** Crea un enlace de un solo uso y lo envía a PANEL_EMAIL. */
function enviar_enlace(string $motivo): bool
{
    $token = bin2hex(random_bytes(24));
    con_bloqueo('panel.json', function (array &$c) use ($token) {
        $c['enlace'] = ['hash' => hash('sha256', $token), 'caduca' => time() + ENLACE_MINUTOS * 60];
    });
    $host = $_SERVER['HTTP_HOST'] ?? 'aruesthetics.es';
    $url = (es_https() ? 'https' : 'http') . '://' . $host . '/panel/?enlace=' . $token;
    $asunto = $motivo === 'activar' ? 'Activa el panel comercial de Aruesthetics' : 'Nueva contraseña del panel comercial de Aruesthetics';
    $cuerpo = ($motivo === 'activar'
            ? "Para activar el panel comercial y crear la contraseña, abre este enlace:\n\n"
            : "Has pedido cambiar la contraseña del panel comercial. Para crear una nueva, abre este enlace:\n\n")
        . $url . "\n\nEl enlace sirve una sola vez y caduca en " . ENLACE_MINUTOS / 60 . " horas.\n"
        . "Si no lo has pedido tú, ignora este mensaje: no cambia nada.\n";
    $cabeceras = ['From: Aruesthetics <' . PANEL_REMITENTE . '>', 'Content-Type: text/plain; charset=utf-8'];
    return @mail(PANEL_EMAIL, '=?UTF-8?B?' . base64_encode($asunto) . '?=', $cuerpo, implode("\r\n", $cabeceras));
}

function enlace_valido(string $token): bool
{
    $e = config()['enlace'] ?? null;
    return is_array($e) && ($e['caduca'] ?? 0) > time() && hash_equals((string)$e['hash'], hash('sha256', $token));
}

function email_oculto(): string
{
    [$u, $d] = explode('@', PANEL_EMAIL);
    return substr($u, 0, 2) . str_repeat('•', max(3, strlen($u) - 2)) . '@' . $d;
}

/* ---------- Pedidos ---------- */

const ARCHIVOS_PEDIDOS = ['asistente', 'demostracion', 'llamada'];

/** Lee un .jsonl y devuelve [id => [datos, línea original]] */
function leer_jsonl(string $nombre): array
{
    $f = dir_datos() . '/' . $nombre . '.jsonl';
    if (!is_file($f)) {
        return [];
    }
    $out = [];
    foreach (file($f, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [] as $linea) {
        $d = json_decode($linea, true);
        if (!is_array($d)) {
            continue;
        }
        $id = (string)($d['id'] ?? substr(sha1($linea), 0, 16));
        $out[$id] = [$d, $linea];
    }
    return $out;
}

function texto($v): string
{
    return trim((string)($v ?? ''));
}

function normalizar(string $id, array $d, string $archivo): array
{
    $formulario = $archivo === 'demostracion';
    return [
        'id' => $id,
        'fecha' => texto($d['fecha'] ?? ''),
        'origen' => $formulario ? 'formulario' : 'asistente',
        'canal' => texto($d['canal'] ?? ($archivo === 'llamada' ? 'llamada' : ($formulario ? 'formulario' : ''))),
        'motivo' => texto($d['motivo'] ?? ($formulario ? 'Demostración' : '')),
        'equipo' => texto($d['equipo'] ?? ''),
        'centro' => texto($d['centro'] ?? ''),
        'experiencia' => texto($d['experiencia'] ?? ''),
        'plazo' => texto($d['plazo'] ?? ''),
        'financiacion' => texto($d['financiacion'] ?? ''),
        'provincia' => texto($d['provincia'] ?? ''),
        'nombre' => texto($d['nombre'] ?? ''),
        'telefono' => texto($d['telefono'] ?? ''),
        'franja' => texto($d['franja'] ?? ''),
        'email' => texto($d['email'] ?? ''),
        'mensaje' => texto($d['mensaje'] ?? ''),
    ];
}

function leer_pedidos(): array
{
    $estado = leer_json('estado.json');
    $pedidos = [];
    foreach (ARCHIVOS_PEDIDOS as $archivo) {
        foreach (leer_jsonl($archivo) as $id => [$d]) {
            $p = normalizar($id, $d, $archivo);
            $e = $estado[$id] ?? [];
            $p['estado'] = isset(ESTADOS[$e['estado'] ?? '']) ? $e['estado'] : 'nuevo';
            $p['notas'] = $e['notas'] ?? [];
            $p['historial'] = $e['historial'] ?? [];
            $p['actualizado'] = $e['actualizado'] ?? '';
            $pedidos[] = $p;
        }
    }
    usort($pedidos, fn($a, $b) => strcmp($b['fecha'], $a['fecha']));
    return $pedidos;
}

function leer_suscriptores(): array
{
    $out = [];
    foreach (leer_jsonl('newsletter') as $id => [$d]) {
        $out[] = ['id' => $id, 'fecha' => texto($d['fecha'] ?? ''), 'email' => texto($d['email'] ?? '')];
    }
    usort($out, fn($a, $b) => strcmp($b['fecha'], $a['fecha']));
    return $out;
}

function existe_pedido(string $id): bool
{
    foreach (ARCHIVOS_PEDIDOS as $archivo) {
        if (isset(leer_jsonl($archivo)[$id])) {
            return true;
        }
    }
    return false;
}

/** Elimina definitivamente un registro de los .jsonl indicados (derecho de supresión). */
function eliminar_registro(string $id, array $archivos): bool
{
    $hecho = false;
    foreach ($archivos as $archivo) {
        $f = dir_datos() . '/' . $archivo . '.jsonl';
        if (!is_file($f)) {
            continue;
        }
        $h = fopen($f, 'c+');
        flock($h, LOCK_EX);
        $lineas = [];
        while (($l = fgets($h)) !== false) {
            $lineas[] = rtrim($l, "\n");
        }
        $quedan = array_filter($lineas, function ($l) use ($id) {
            $d = json_decode($l, true);
            if (!is_array($d)) {
                return $l !== '';
            }
            return (string)($d['id'] ?? substr(sha1($l), 0, 16)) !== $id;
        });
        if (count($quedan) !== count(array_filter($lineas, fn($l) => $l !== ''))) {
            ftruncate($h, 0);
            rewind($h);
            fwrite($h, $quedan ? implode("\n", $quedan) . "\n" : '');
            $hecho = true;
        }
        flock($h, LOCK_UN);
        fclose($h);
    }
    if ($hecho) {
        con_bloqueo('estado.json', function (array &$e) use ($id) {
            unset($e[$id]);
        });
    }
    return $hecho;
}
