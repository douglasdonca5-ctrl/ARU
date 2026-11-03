<?php
/**
 * Panel comercial de Aruesthetics — API (JSON) y exportación a Excel (CSV).
 */

declare(strict_types=1);

const ARU_PANEL = true;
require __DIR__ . '/_lib.php';

cabeceras_seguras();

function json_salida(array $d, int $code = 200): void
{
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($d, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

if (!autenticado()) {
    json_salida(['ok' => false, 'error' => 'La sesión ha caducado. Vuelve a entrar.', 'salir' => true], 401);
}

$accion = (string)($_GET['accion'] ?? $_POST['accion'] ?? '');

/* ---------- Lectura ---------- */
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($accion === 'datos') {
        json_salida([
            'ok' => true,
            'ahora' => date('c'),
            'estados' => ESTADOS,
            'pedidos' => leer_pedidos(),
            'suscriptores' => leer_suscriptores(),
        ]);
    }
    if ($accion === 'exportar') {
        $tipo = (string)($_GET['tipo'] ?? 'pedidos');
        $nombre = 'aruesthetics-' . ($tipo === 'suscriptores' ? 'suscriptores' : 'pedidos') . '-' . date('Y-m-d') . '.csv';
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="' . $nombre . '"');
        $out = fopen('php://output', 'w');
        fwrite($out, "\xEF\xBB\xBF");   // BOM: Excel abre bien los acentos
        // Excel en español usa «;» como separador
        $fila = function (array $c) use ($out) {
            fputcsv($out, array_map(fn($v) => preg_match('/^[=+\-@]/', (string)$v) ? "'" . $v : $v, $c), ';', '"', '\\');
        };
        if ($tipo === 'suscriptores') {
            $fila(['Fecha', 'Email']);
            foreach (leer_suscriptores() as $s) {
                $fila([substr($s['fecha'], 0, 16), $s['email']]);
            }
        } else {
            $fila(['Fecha', 'Estado', 'Origen', 'Qué pide', 'Equipo', 'Nombre', 'Teléfono', 'Email', 'Contacto preferido', 'Mejor hora', 'Tipo de centro', 'Provincia', 'Equipos que ya tiene', 'Plazo', 'Financiación', 'Mensaje', 'Notas']);
            foreach (leer_pedidos() as $p) {
                $fila([
                    substr($p['fecha'], 0, 16), ESTADOS[$p['estado']], $p['origen'] === 'formulario' ? 'Formulario' : 'Asistente',
                    $p['motivo'], $p['equipo'], $p['nombre'], $p['telefono'], $p['email'], $p['canal'], $p['franja'],
                    $p['centro'], $p['provincia'], $p['experiencia'], $p['plazo'], $p['financiacion'], $p['mensaje'],
                    implode(' | ', array_map(fn($n) => substr($n['fecha'], 0, 10) . ': ' . $n['texto'], $p['notas'])),
                ]);
            }
        }
        fclose($out);
        exit;
    }
    json_salida(['ok' => false, 'error' => 'Acción desconocida.'], 400);
}

/* ---------- Escritura ---------- */
$entrada = json_decode((string)file_get_contents('php://input'), true);
if (!is_array($entrada)) {
    $entrada = $_POST;
}
if (!csrf_valido($_SERVER['HTTP_X_CSRF'] ?? null)) {
    json_salida(['ok' => false, 'error' => 'La página había caducado. Recárgala.'], 403);
}
$accion = (string)($entrada['accion'] ?? $accion);
$id = preg_replace('/[^a-f0-9]/', '', (string)($entrada['id'] ?? '')) ?? '';

switch ($accion) {
    case 'estado':
        $nuevo = (string)($entrada['estado'] ?? '');
        if (!isset(ESTADOS[$nuevo]) || !existe_pedido($id)) {
            json_salida(['ok' => false, 'error' => 'Pedido o estado no válido.'], 422);
        }
        $r = con_bloqueo('estado.json', function (array &$e) use ($id, $nuevo) {
            $antes = $e[$id]['estado'] ?? 'nuevo';
            if ($antes !== $nuevo) {
                $e[$id]['estado'] = $nuevo;
                $e[$id]['historial'][] = ['fecha' => date('c'), 'de' => $antes, 'a' => $nuevo];
                $e[$id]['actualizado'] = date('c');
            }
            return $e[$id] ?? [];
        });
        json_salida(['ok' => true, 'registro' => $r]);

    case 'nota':
        $txt = trim((string)($entrada['texto'] ?? ''));
        if ($txt === '' || !existe_pedido($id)) {
            json_salida(['ok' => false, 'error' => 'Escribe la nota.'], 422);
        }
        $txt = mb_substr($txt, 0, 2000);
        $r = con_bloqueo('estado.json', function (array &$e) use ($id, $txt) {
            $e[$id]['notas'][] = ['fecha' => date('c'), 'texto' => $txt];
            $e[$id]['actualizado'] = date('c');
            return $e[$id];
        });
        json_salida(['ok' => true, 'registro' => $r]);

    case 'eliminar':
        $ok = eliminar_registro($id, ARCHIVOS_PEDIDOS);
        json_salida($ok ? ['ok' => true] : ['ok' => false, 'error' => 'No se ha encontrado el pedido.'], $ok ? 200 : 404);

    case 'eliminar_suscriptor':
        $ok = eliminar_registro($id, ['newsletter']);
        json_salida($ok ? ['ok' => true] : ['ok' => false, 'error' => 'No se ha encontrado el suscriptor.'], $ok ? 200 : 404);

    case 'contrasena':
        if (!permitir('cambiar', 6, 900)) {
            json_salida(['ok' => false, 'error' => 'Demasiados intentos. Espera 15 minutos.'], 429);
        }
        $actual = (string)($entrada['actual'] ?? '');
        $nueva = (string)($entrada['nueva'] ?? '');
        if (!comprobar_contrasena($actual)) {
            json_salida(['ok' => false, 'error' => 'La contraseña actual no es correcta.'], 422);
        }
        if (mb_strlen($nueva) < 10) {
            json_salida(['ok' => false, 'error' => 'La contraseña nueva debe tener al menos 10 caracteres.'], 422);
        }
        guardar_contrasena($nueva);
        abrir_sesion();
        json_salida(['ok' => true, 'csrf' => csrf()]);

    case 'salir':
        $_SESSION = [];
        session_destroy();
        json_salida(['ok' => true]);
}

json_salida(['ok' => false, 'error' => 'Acción desconocida.'], 400);
