/* =========================================
   SGG - NÚCLEO DE AUTENTICACIÓN Y NEGOCIO
========================================= */

// Usuarios por defecto iniciales
const usuariosPredefinidos = [
  { nombre: "Administrador", apellido: "Sistema", fechaNac: "1990-01-01", usuario: "admin@empresa.com", password: "Admin@1234Password" },
  { nombre: "Iznnk", apellido: "Dev", fechaNac: "1995-05-15", usuario: "iznnk@empresa.com", password: "User@1234Password" }
];

// Obtención o inicialización de la clave 'usuarios_sgg' en localStorage
function obtenerUsuarios() {
  const guardados = localStorage.getItem('usuarios_sgg');
  if (!guardados) {
    localStorage.setItem('usuarios_sgg', JSON.stringify(usuariosPredefinidos));
    return usuariosPredefinidos;
  }
  return JSON.parse(guardados);
}

function guardarUsuarios(usuarios) {
  localStorage.setItem('usuarios_sgg', JSON.stringify(usuarios));
}

/* =========================================
   RF-02: CAMBIO DE TEMA Y PERSISTENCIA
========================================= */
const temaBtn = document.getElementById("temaBtn");

if (localStorage.getItem("tema_sgg") === "oscuro") {
  document.body.classList.add("dark");
  if (temaBtn) temaBtn.textContent = "☀️";
}

if (temaBtn) {
  temaBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    const esOscuro = document.body.classList.contains("dark");
    localStorage.setItem("tema_sgg", esOscuro ? "oscuro" : "claro");
    temaBtn.textContent = esOscuro ? "☀️" : "🌙";
  });
}

/* =========================================
   VER / OCULTAR CONTRASEÑA
========================================= */
document.querySelectorAll(".btn-toggle-pass").forEach(btn => {
  btn.addEventListener("click", function () {
    const targetId = this.getAttribute("data-target");
    const inputPass = document.getElementById(targetId);
    if (inputPass) {
      const esPassword = inputPass.type === "password";
      inputPass.type = esPassword ? "text" : "password";
      this.textContent = esPassword ? "🙈" : "👁️";
    }
  });
});

/* =========================================
   RF-03 & RF-04: LA REGLA DE LOS 5 REQUISITOS
========================================= */
function evaluarRegla5Requisitos(password) {
  return {
    len: password.length >= 8,
    mayus: /[A-Z]/.test(password),
    minus: /[a-z]/.test(password),
    num: /[0-9]/.test(password),
    symbol: /[!@#\$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  };
}

function actualizarFeedbackUI(reqs, prefix = "") {
  const map = {
    len: document.getElementById(`reqLen${prefix}`),
    mayus: document.getElementById(`reqMayus${prefix}`),
    minus: document.getElementById(`reqMinus${prefix}`),
    num: document.getElementById(`reqNum${prefix}`),
    symbol: document.getElementById(`reqSymbol${prefix}`)
  };

  let todoValido = true;
  for (const key in reqs) {
    const el = map[key];
    const valido = reqs[key];
    if (el) {
      if (valido) {
        el.className = "valid";
        el.textContent = el.textContent.replace("❌", "✔");
      } else {
        el.className = "invalid";
        el.textContent = el.textContent.replace("✔", "❌");
        todoValido = false;
      }
    } else {
      if (!valido) todoValido = false;
    }
  }
  return todoValido;
}

/* =========================================
   RF-01: LOGIN Y BLOQUEO POR INTENTOS
========================================= */
const formLogin = document.getElementById("loginForm");
const btnLogin = document.getElementById("btnLogin");
const mensaje = document.getElementById("mensaje");

let intentosFallidos = 0;
let tiempoBloqueo = 0;
let intervaloBloqueo = null;

if (formLogin) {
  formLogin.addEventListener("submit", function (e) {
    e.preventDefault();
    if (tiempoBloqueo > 0) return;

    const email = document.getElementById("usuario").value.trim().toLowerCase();
    const password = document.getElementById("password").value.trim();

    const usuarios = obtenerUsuarios();
    const usuarioEncontrado = usuarios.find(u => u.usuario.trim().toLowerCase() === email && u.password === password);

    if (usuarioEncontrado) {
      intentosFallidos = 0;
      mensaje.textContent = "Autenticación exitosa. Redirigiendo...";
      mensaje.className = "exito";
      setTimeout(() => {
        iniciarDashboard(usuarioEncontrado);
      }, 800);
    } else {
      intentosFallidos++;
      if (intentosFallidos >= 3) {
        tiempoBloqueo = 30;
        btnLogin.disabled = true;
        mensaje.className = "error";
        mensaje.textContent = `Sistema bloqueado por ${tiempoBloqueo}s tras 3 intentos fallidos.`;

        intervaloBloqueo = setInterval(() => {
          tiempoBloqueo--;
          if (tiempoBloqueo > 0) {
            mensaje.textContent = `Sistema bloqueado por ${tiempoBloqueo}s tras 3 intentos fallidos.`;
          } else {
            clearInterval(intervaloBloqueo);
            intentosFallidos = 0;
            btnLogin.disabled = false;
            mensaje.textContent = "";
          }
        }, 1000);
      } else {
        mensaje.textContent = `Credenciales inválidas. Intentos fallidos: ${intentosFallidos}/3`;
        mensaje.className = "error";
      }
    }
  });
}

function iniciarDashboard(user) {
  const vistaLogin = document.getElementById("vistaLogin");
  const vistaDashboard = document.getElementById("vistaDashboard");
  const mainContainer = document.getElementById("mainContainer");
  const userNombre = document.getElementById("userNombre");

  if (vistaLogin) vistaLogin.style.display = "none";
  if (mensaje) mensaje.textContent = "";
  if (vistaDashboard) vistaDashboard.style.display = "block";
  if (mainContainer) mainContainer.classList.add("modo-dashboard");
  if (userNombre) userNombre.textContent = `${user.nombre} ${user.apellido}`;

  const inputFechaGasto = document.getElementById("fecha");
  if (inputFechaGasto) inputFechaGasto.valueAsDate = new Date();
  renderizarUI(user.usuario);
}

const btnCerrarSesion = document.getElementById("btnCerrarSesion");
if (btnCerrarSesion) {
  btnCerrarSesion.addEventListener("click", () => {
    window.location.reload();
  });
}

/* =========================================
   RF-03: REGISTRO DE USUARIO Y VALIDACIONES
========================================= */
const formRegister = document.getElementById("registerForm");
const inputRegNombre = document.getElementById("regNombre");
const inputRegApellido = document.getElementById("regApellido");
const inputRegFechaNac = document.getElementById("regFechaNac");
const inputRegEmail = document.getElementById("regEmail");
const inputRegPass = document.getElementById("regPassword");
const inputRegPassConfirm = document.getElementById("regPasswordConfirm");
const btnRegister = document.getElementById("btnRegister");

if (formRegister) {
  // Evaluación en tiempo real de contraseña
  inputRegPass.addEventListener("input", () => {
    const reqs = evaluarRegla5Requisitos(inputRegPass.value);
    const passValida = actualizarFeedbackUI(reqs, "");
    btnRegister.disabled = !passValida;
  });

  formRegister.addEventListener("submit", function (e) {
    e.preventDefault();

    // 1. Validar Nombres y Apellidos (Trim, sin números ni caracteres especiales)
    const nombre = inputRegNombre.value.trim();
    const apellido = inputRegApellido.value.trim();
    const regexLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+\$/;

    if (!regexLetras.test(nombre) || !regexLetras.test(apellido)) {
      mensaje.textContent = "El nombre y apellido solo deben contener letras.";
      mensaje.className = "error";
      return;
    }

    // 2. Validar Restricción de Edad Mínima (>= 14 años)
    const fechaNac = new Date(inputRegFechaNac.value);
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mes = hoy.getMonth() - fechaNac.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }

    if (isNaN(edad) || edad < 14) {
      mensaje.textContent = "El registro está denegado para menores de 14 años.";
      mensaje.className = "error";
      return;
    }

    // 3. RegEx Estricta de Email Corporativo
    const email = inputRegEmail.value.trim().toLowerCase();
    const regexEmailEstricto = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\$/;

    if (!regexEmailEstricto.test(email) || email.includes(" ")) {
      mensaje.textContent = "Formato de correo corporativo inválido.";
      mensaje.className = "error";
      return;
    }

    // Verificar duplicado de email
    const usuarios = obtenerUsuarios();
    if (usuarios.some(u => u.usuario.trim().toLowerCase() === email)) {
      mensaje.textContent = "El correo electrónico ya se encuentra registrado.";
      mensaje.className = "error";
      return;
    }

    // 4. Doble Match de Contraseña
    const pass = inputRegPass.value;
    const passConfirm = inputRegPassConfirm.value;

    if (pass !== passConfirm) {
      mensaje.textContent = "Las contraseñas no coinciden.";
      mensaje.className = "error";
      return;
    }

    // Guardar nuevo usuario registrado
    usuarios.push({
      nombre: nombre,
      apellido: apellido,
      fechaNac: inputRegFechaNac.value,
      usuario: email,
      password: pass
    });
    guardarUsuarios(usuarios);

    mensaje.textContent = "¡Registro exitoso! Redirigiendo al inicio de sesión...";
    mensaje.className = "exito";

    setTimeout(() => {
      window.location.href = "index.html";
    }, 1500);
  });
}

/* =========================================
   RF-04: RECUPERACIÓN / CAMBIO DE CONTRASEÑA
========================================= */
const formRecuperar = document.getElementById("recuperarForm");
const inputRecEmail = document.getElementById("recEmail");
const inputRecPass = document.getElementById("recPassword");
const inputRecPassConfirm = document.getElementById("recPasswordConfirm");
const btnRecuperar = document.getElementById("btnRecuperar");

if (formRecuperar) {
  inputRecPass.addEventListener("input", () => {
    const reqs = evaluarRegla5Requisitos(inputRecPass.value);
    const passValida = actualizarFeedbackUI(reqs, "Rec");
    btnRecuperar.disabled = !passValida;
  });

  formRecuperar.addEventListener("submit", function (e) {
    e.preventDefault();

    const email = inputRecEmail.value.trim().toLowerCase();
    const passNueva = inputRecPass.value;
    const passConfirm = inputRecPassConfirm.value;

    if (passNueva !== passConfirm) {
      mensaje.textContent = "Las contraseñas no coinciden.";
      mensaje.className = "error";
      return;
    }

    const usuarios = obtenerUsuarios();
    const index = usuarios.findIndex(u => u.usuario.trim().toLowerCase() === email);

    if (index === -1) {
      mensaje.textContent = "El correo corporativo no está registrado en el sistema.";
      mensaje.className = "error";
      return;
    }

    // Regla de Negocio: No repetir la contraseña actual
    if (usuarios[index].password === passNueva) {
      mensaje.textContent = "La nueva contraseña no puede ser idéntica a la contraseña actual.";
      mensaje.className = "error";
      return;
    }

    // Actualizar clave en localStorage
    usuarios[index].password = passNueva;
    guardarUsuarios(usuarios);

    mensaje.textContent = "Contraseña actualizada exitosamente. Redirigiendo al inicio de sesión...";
    mensaje.className = "exito";

    setTimeout(() => {
      window.location.href = "index.html";
    }, 1500);
  });
}

/* =========================================
   MÓDULO DE GESTIÓN DE GASTOS (DASHBOARD)
========================================= */
function obtenerGastos() { return JSON.parse(localStorage.getItem('gastos_sgg')) || []; }
function guardarGastos(gastos) { localStorage.setItem('gastos_sgg', JSON.stringify(gastos)); }

function renderizarUI(usuarioActivo) {
  const tablaGastosBody = document.getElementById("tablaGastosBody");
  const totalGastadoEl = document.getElementById("totalGastado");
  if (!tablaGastosBody || !totalGastadoEl) return;

  const todos = obtenerGastos();
  const activos = todos.filter(g => g.email_usuario === usuarioActivo && g.estado_activo !== false);
  tablaGastosBody.innerHTML = '';
  let total = 0;

  if (activos.length === 0) {
    tablaGastosBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color: var(--text-sec);">No hay movimientos registrados.</td></tr>`;
  } else {
    activos.forEach(gasto => {
      total += parseFloat(gasto.monto);
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${gasto.fecha}</td>
        <td><strong>${gasto.categoria}</strong></td>
        <td>${gasto.descripcion}</td>
        <td>$${parseFloat(gasto.monto).toFixed(2)}</td>
        <td>
          <button class="btn-editar" onclick="editarGasto('${gasto.id}')">Editar</button>
          <button class="btn-eliminar" onclick="abrirModal('${gasto.id}')">Borrar</button>
        </td>
      `;
      tablaGastosBody.appendChild(tr);
    });
  }
  totalGastadoEl.textContent = `$${total.toFixed(2)}`;
}

/* =========================================
   CANVAS ANIMADO FINANCIERO SGG DE FONDO
========================================= */
const canvas = document.getElementById("bgCanvas");
if (canvas) {
  const ctx = canvas.getContext("2d");
  let currencySymbols = [];
  let cards = [];
  let waveOffset = 0;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initSggElements();
  }
  window.addEventListener("resize", resizeCanvas);

  class CurrencySymbol {
    constructor() { this.reset(); }
    reset() {
      const symbols = ["\$", "€", "¥", "£", "%", "+", "-"];
      this.text = symbols[Math.floor(Math.random() * symbols.length)];
      this.x = Math.random() * canvas.width;
      this.y = canvas.height + Math.random() * 50;
      this.speed = Math.random() * 0.8 + 0.3;
      this.size = Math.floor(Math.random() * 16) + 14;
      this.opacity = Math.random() * 0.5 + 0.2;
    }
    update() {
      this.y -= this.speed;
      if (this.y < -30) this.reset();
    }
    draw(color) {
      ctx.font = `600 ${this.size}px 'Segoe UI', sans-serif`;
      ctx.fillStyle = color;
      ctx.globalAlpha = this.opacity;
      ctx.fillText(this.text, this.x, this.y);
      ctx.globalAlpha = 1.0;
    }
  }

  class FloatingCard {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.width = 60;
      this.height = 38;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = (Math.random() - 0.5) * 0.5;
      this.angle = Math.random() * Math.PI * 2;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.angle += 0.005;
      if (this.x < -100) this.x = canvas.width + 50;
      if (this.x > canvas.width + 100) this.x = -50;
      if (this.y < -100) this.y = canvas.height + 50;
      if (this.y > canvas.height + 100) this.y = -50;
    }
    draw(strokeColor, fillColor) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(Math.sin(this.angle) * 0.15);
      ctx.fillStyle = fillColor;
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.rect(-this.width / 2, -this.height / 2, this.width, this.height);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = strokeColor;
      ctx.fillRect(-this.width / 2 + 6, -this.height / 2 + 8, 10, 8);
      ctx.fillRect(-this.width / 2 + 6, -this.height / 2 + 22, 28, 3);
      ctx.restore();
    }
  }

  function initSggElements() {
    currencySymbols = [];
    cards = [];
    const countSymbols = Math.floor(canvas.width / 35);
    for (let i = 0; i < countSymbols; i++) currencySymbols.push(new CurrencySymbol());
    const countCards = Math.floor(canvas.width / 220);
    for (let i = 0; i < countCards; i++) cards.push(new FloatingCard());
  }

  resizeCanvas();

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const isDark = document.body.classList.contains("dark");
    const mainColor = isDark ? "#d900ff" : "#8b5cf6";
    const waveColor = isDark ? "rgba(217, 0, 255, 0.12)" : "rgba(139, 92, 246, 0.12)";
    const cardFill = isDark ? "rgba(20, 8, 33, 0.6)" : "rgba(255, 255, 255, 0.6)";

    waveOffset += 0.01;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    for (let x = 0; x <= canvas.width; x += 20) {
      const y = Math.sin(x * 0.003 + waveOffset) * 40 + Math.cos(x * 0.001 + waveOffset) * 20 + (canvas.height * 0.7);
      ctx.lineTo(x, y);
    }
    ctx.lineTo(canvas.width, canvas.height);
    ctx.fillStyle = waveColor;
    ctx.fill();

    cards.forEach(card => { card.update(); card.draw(mainColor, cardFill); });
    currencySymbols.forEach(symbol => { symbol.update(); symbol.draw(mainColor); });

    requestAnimationFrame(animate);
  }

  animate();
}
