<?php
/**
 * Panel comercial de Aruesthetics — entrada, activación y aplicación.
 */

declare(strict_types=1);

const ARU_PANEL = true;
require __DIR__ . '/_lib.php';

cabeceras_seguras();
iniciar_sesion();

$aviso = '';
$error = '';
$vista = '';
$token = (string)($_GET['enlace'] ?? $_POST['enlace'] ?? '');
$accion = (string)($_POST['accion'] ?? '');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!csrf_valido($_POST['csrf'] ?? null)) {
        $error = 'La página había caducado. Vuelve a intentarlo.';
    } elseif ($accion === 'entrar') {
        if (!permitir('entrar', 6, 900)) {
            $error = 'Demasiados intentos. Espera 15 minutos y vuelve a probar.';
        } elseif (comprobar_contrasena((string)($_POST['clave'] ?? ''))) {
            abrir_sesion();
            header('Location: ./');
            exit;
        } else {
            $error = 'Contraseña incorrecta.';
        }
    } elseif ($accion === 'enviar_enlace') {
        $motivo = tiene_contrasena() ? 'cambiar' : 'activar';
        if (!permitir('enlace', 3, 3600)) {
            $error = 'Ya hemos enviado varios enlaces en la última hora. Revisa el correo (también el spam) o espera un poco.';
        } elseif (enviar_enlace($motivo)) {
            $aviso = 'Te hemos enviado un enlace a ' . email_oculto() . '. Ábrelo desde el correo para ' . ($motivo === 'activar' ? 'crear la contraseña' : 'crear una contraseña nueva') . '.';
        } else {
            $error = 'No hemos podido enviar el correo. Inténtalo de nuevo en unos minutos.';
        }
    } elseif ($accion === 'crear_clave') {
        $c1 = (string)($_POST['clave'] ?? '');
        $c2 = (string)($_POST['clave2'] ?? '');
        if (!enlace_valido($token)) {
            $error = 'El enlace ha caducado o ya se ha usado. Pide uno nuevo.';
            $token = '';
        } elseif (mb_strlen($c1) < 10) {
            $error = 'La contraseña debe tener al menos 10 caracteres.';
        } elseif ($c1 !== $c2) {
            $error = 'Las dos contraseñas no coinciden.';
        } else {
            guardar_contrasena($c1);
            abrir_sesion();
            header('Location: ./?bienvenida=1');
            exit;
        }
    }
}

if ($token !== '' && enlace_valido($token)) {
    $vista = 'crear';
} elseif ($token !== '' && $accion !== 'crear_clave') {
    $error = 'El enlace ha caducado o ya se ha usado. Pide uno nuevo.';
}
if ($vista === '') {
    if (autenticado()) {
        $vista = 'app';
    } elseif (!tiene_contrasena()) {
        $vista = 'activar';
    } elseif (isset($_GET['olvide'])) {
        $vista = 'olvide';
    } else {
        $vista = 'entrar';
    }
}

$e = fn(string $t): string => htmlspecialchars($t, ENT_QUOTES, 'UTF-8');
$csrf = csrf();
?>
<!doctype html>
<html lang="es-ES">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="robots" content="noindex, nofollow">
  <meta name="csrf" content="<?= $e($csrf) ?>">
  <title>Panel comercial · Aruesthetics</title>
  <link rel="icon" href="../img/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="panel.css?v=2">
</head>
<body class="<?= $vista === 'app' ? 'app' : 'acceso' ?>">
<?php if ($vista !== 'app'): ?>
  <main class="acceso__caja">
    <div class="marca">
      <svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="18.5" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="20" cy="20" r="11" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M1.5 20h37" stroke="currentColor" stroke-width="1.4"/><circle cx="20" cy="20" r="2.8" fill="#e5432d"/></svg>
      <span>ARUESTHETICS</span>
    </div>
    <h1>Panel comercial</h1>
    <?php if ($aviso): ?><p class="nota nota--ok" role="status"><?= $e($aviso) ?></p><?php endif; ?>
    <?php if ($error): ?><p class="nota nota--error" role="alert"><?= $e($error) ?></p><?php endif; ?>

    <?php if ($vista === 'activar'): ?>
      <p class="texto">El panel todavía no tiene contraseña. Para activarlo, te enviamos un enlace a <strong><?= $e(email_oculto()) ?></strong>: ábrelo desde ese buzón y crea la contraseña.</p>
      <form method="post">
        <input type="hidden" name="csrf" value="<?= $e($csrf) ?>">
        <input type="hidden" name="accion" value="enviar_enlace">
        <button class="boton" type="submit">Enviar enlace de activación</button>
      </form>

    <?php elseif ($vista === 'crear'): ?>
      <p class="texto">Crea la contraseña del panel. Usa al menos 10 caracteres; mejor una frase fácil de recordar.</p>
      <form method="post" class="form">
        <input type="hidden" name="csrf" value="<?= $e($csrf) ?>">
        <input type="hidden" name="accion" value="crear_clave">
        <input type="hidden" name="enlace" value="<?= $e($token) ?>">
        <input type="text" name="usuario" value="<?= $e(PANEL_EMAIL) ?>" autocomplete="username" hidden>
        <label class="campo"><span>Contraseña nueva</span><input type="password" name="clave" minlength="10" required autocomplete="new-password" autofocus></label>
        <label class="campo"><span>Repítela</span><input type="password" name="clave2" minlength="10" required autocomplete="new-password"></label>
        <button class="boton" type="submit">Guardar y entrar</button>
      </form>

    <?php elseif ($vista === 'olvide'): ?>
      <p class="texto">Te enviamos un enlace a <strong><?= $e(email_oculto()) ?></strong> para crear una contraseña nueva. La actual sigue valiendo hasta que la cambies.</p>
      <form method="post">
        <input type="hidden" name="csrf" value="<?= $e($csrf) ?>">
        <input type="hidden" name="accion" value="enviar_enlace">
        <button class="boton" type="submit">Enviar enlace</button>
      </form>
      <p class="pie"><a href="./">Volver a entrar</a></p>

    <?php else: ?>
      <form method="post" class="form">
        <input type="hidden" name="csrf" value="<?= $e($csrf) ?>">
        <input type="hidden" name="accion" value="entrar">
        <input type="text" name="usuario" value="<?= $e(PANEL_EMAIL) ?>" autocomplete="username" hidden>
        <label class="campo"><span>Contraseña</span><input type="password" name="clave" required autocomplete="current-password" autofocus></label>
        <button class="boton" type="submit">Entrar</button>
      </form>
      <p class="pie"><a href="?olvide=1">¿Has olvidado la contraseña?</a></p>
    <?php endif; ?>
  </main>

<?php else: ?>
  <header class="barra">
    <a class="barra__marca" href="./" aria-label="Panel comercial, inicio">
      <svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="18.5" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="20" cy="20" r="11" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M1.5 20h37" stroke="currentColor" stroke-width="1.4"/><circle cx="20" cy="20" r="2.8" fill="#e5432d"/></svg>
      <span class="barra__nombre">ARUESTHETICS</span><span class="barra__sub">Panel comercial</span>
    </a>
    <nav class="pestanas" aria-label="Secciones">
      <button type="button" class="pestana" data-vista="pedidos" aria-pressed="true">Pedidos</button>
      <button type="button" class="pestana" data-vista="suscriptores" aria-pressed="false">Suscriptores</button>
    </nav>
    <div class="barra__acciones">
      <span class="actualizado" id="actualizado" aria-live="polite"></span>
      <a class="enlace" href="../" target="_blank" rel="noopener">Ver la web</a>
      <button type="button" class="enlace" id="cambiar-clave">Contraseña</button>
      <button type="button" class="enlace" id="salir">Salir</button>
    </div>
  </header>

  <main class="contenido">
    <?php if (isset($_GET['bienvenida'])): ?><p class="nota nota--ok" id="bienvenida" role="status">Contraseña guardada. Ya estás dentro del panel.</p><?php endif; ?>

    <section id="vista-pedidos" aria-labelledby="t-pedidos">
      <div class="cabeza">
        <h1 id="t-pedidos">Pedidos</h1>
        <a class="boton boton--sec" id="exportar-pedidos" href="api.php?accion=exportar&amp;tipo=pedidos">Exportar a Excel</a>
      </div>
      <div class="kpis" id="kpis"></div>
      <div class="filtros">
        <div class="estados" id="estados" role="group" aria-label="Filtrar por estado"></div>
        <div class="filtros__fila">
          <label class="buscar"><span class="sr">Buscar</span><input type="search" id="buscar" placeholder="Buscar por nombre, provincia, email…" autocomplete="off"></label>
          <label class="sel"><span class="sr">Equipo</span><select id="f-equipo"><option value="">Todos los equipos</option></select></label>
          <label class="sel"><span class="sr">Canal</span><select id="f-canal">
            <option value="">Todos los canales</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="llamada">Llamada</option>
            <option value="email">Email</option>
            <option value="formulario">Formulario de la web</option>
          </select></label>
          <label class="check"><input type="checkbox" id="f-prioridad"> <span>Solo prioridad</span></label>
        </div>
      </div>
      <div class="lista" id="lista" aria-live="polite"></div>
    </section>

    <section id="vista-suscriptores" aria-labelledby="t-susc" hidden>
      <div class="cabeza">
        <h1 id="t-susc">Suscriptores de novedades</h1>
        <a class="boton boton--sec" href="api.php?accion=exportar&amp;tipo=suscriptores">Exportar a Excel</a>
      </div>
      <div class="lista" id="lista-susc"></div>
    </section>
  </main>

  <dialog class="ficha" id="ficha" aria-labelledby="ficha-t">
    <div class="ficha__cabeza">
      <div>
        <p class="ficha__fecha" id="ficha-fecha"></p>
        <h2 id="ficha-t"></h2>
        <p class="ficha__sub" id="ficha-sub"></p>
      </div>
      <button type="button" class="cerrar" data-cerrar aria-label="Cerrar">×</button>
    </div>
    <div class="ficha__cuerpo" id="ficha-cuerpo"></div>
  </dialog>

  <dialog class="ficha ficha--peq" id="dlg-clave" aria-labelledby="clave-t">
    <div class="ficha__cabeza">
      <h2 id="clave-t">Cambiar la contraseña</h2>
      <button type="button" class="cerrar" data-cerrar aria-label="Cerrar">×</button>
    </div>
    <form class="ficha__cuerpo form" id="form-clave">
      <input type="text" name="usuario" value="<?= $e(PANEL_EMAIL) ?>" autocomplete="username" hidden>
      <label class="campo"><span>Contraseña actual</span><input type="password" name="actual" required autocomplete="current-password"></label>
      <label class="campo"><span>Contraseña nueva (mínimo 10 caracteres)</span><input type="password" name="nueva" minlength="10" required autocomplete="new-password"></label>
      <p class="nota" id="clave-nota" role="status" hidden></p>
      <button class="boton" type="submit">Guardar</button>
    </form>
  </dialog>

  <script src="panel.js?v=1" defer></script>
<?php endif; ?>
</body>
</html>
