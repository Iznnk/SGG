/* =========================================
   SISTEMA DE TRADUCCIÓN Y PERSISTENCIA GLOBAL
========================================= */
function aplicarTraduccion(lang) {
  const diccionario = window.sggTranslations || {};
  const t = diccionario[lang] || diccionario.es;
  if (!t) return;

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (t[key]) {
      const tieneIcono = el.textContent.includes("❌") || el.textContent.includes("✔");
      if (tieneIcono) {
        const icono = el.textContent.includes("✔") ? "✔ " : "❌ ";
        el.textContent = icono + t[key];
      } else {
        el.textContent = t[key];
      }
    }
  });

  const inputs = {
    usuario: t.phUsuario,
    password: t.phPassword,
    recEmail: t.phRecEmail,
    recPassword: t.phNewPass,
    recPasswordConfirm: t.phConfirmPass,
    regEmail: t.phUsuario
  };

  for (const [id, ph] of Object.entries(inputs)) {
    const el = document.getElementById(id);
    if (el && ph) el.placeholder = ph;
  }

  document.querySelectorAll("[data-i18n-ph]").forEach(el => {
    const key = el.getAttribute("data-i18n-ph");
    if (t[key]) el.placeholder = t[key];
  });

  localStorage.setItem("lang_sgg", lang);
}

document.addEventListener("DOMContentLoaded", () => {
  const langSelect = document.getElementById("langSelect");
  const langGuardado = localStorage.getItem("lang_sgg") || "es";

  if (langSelect) {
    langSelect.value = langGuardado;
    langSelect.addEventListener("change", (e) => {
      aplicarTraduccion(e.target.value);
    });
  }
  aplicarTraduccion(langGuardado);
});

/* =========================================
   GESTIÓN DE USUARIOS Y AUTENTICACIÓN
========================================= */
const usuariosPredefinidos = [
  { nombre: "Administrador", apellido: "Sistema", fechaNac: "1990-01-01", usuario: "admin@empresa.com", password: "Admin@1234Password" },
  { nombre: "Iznnk", apellido: "Dev", fechaNac: "1995-05-15", usuario: "iznnk@empresa.com", password: "User@1234Password" }
];

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
   TEMA NOCHE/DÍA Y VISIBILIDAD DE CONTRASEÑA
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
   REGLA DE LOS 5 REQUISITOS (VALIDACIÓN)
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

function actualizarFeedbackUI(reqs, prefix = "Reg") {
  const diccionario = window.sggTranslations || {};
  const lang = localStorage.getItem("lang_sgg") || "es";
  const t = diccionario[lang] || diccionario.es;

  const map = {
    len: { el: document.getElementById(`reqLen${prefix}`), key: "reqLen" },
    mayus: { el: document.getElementById(`reqMayus${prefix}`), key: "reqMayus" },
    minus: { el: document.getElementById(`reqMinus${prefix}`), key: "reqMinus" },
    num: { el: document.getElementById(`reqNum${prefix}`), key: "reqNum" },
    symbol: { el: document.getElementById(`reqSymbol${prefix}`), key: "reqSymbol" }
  };

  let todoValido = true;
  for (const key in reqs) {
    const item = map[key];
    if (item && item.el) {
      const valido = reqs[key];
      if (valido) {
        item.el.className = "valid";
        item.el.textContent = "✔ " + (t ? t[item.key] : "");
      } else {
        item.el.className = "invalid";
        item.el.textContent = "❌ " + (t ? t[item.key] : "");
        todoValido = false;
      }
    }
  }
  return todoValido;
}

const inputRegPass = document.getElementById("regPassword");
const btnRegister = document.getElementById("btnRegister");
if (inputRegPass && btnRegister) {
  inputRegPass.addEventListener("input", () => {
    const reqs = evaluarRegla5Requisitos(inputRegPass.value);
    const passValida = actualizarFeedbackUI(reqs, "Reg");
    btnRegister.disabled = !passValida;
  });
}

const inputRecPass = document.getElementById("recPassword");
const btnRecuperar = document.getElementById("btnRecuperar");
if (inputRecPass && btnRecuperar) {
  inputRecPass.addEventListener("input", () => {
    const reqs = evaluarRegla5Requisitos(inputRecPass.value);
    const passValida = actualizarFeedbackUI(reqs, "Rec");
    btnRecuperar.disabled = !passValida;
  });
}

/* =========================================
   FORMULARIOS (LOGIN, REGISTRO, RECUPERACIÓN)
========================================= */
const mensaje = document.getElementById("mensaje");

function obtenerTraduccionActual() {
  const diccionario = window.sggTranslations || {};
  const lang = localStorage.getItem("lang_sgg") || "es";
  return diccionario[lang] || diccionario.es;
}

const formRegister = document.getElementById("registerForm");
if (formRegister) {
  formRegister.addEventListener("submit", function (e) {
    e.preventDefault();
    const t = obtenerTraduccionActual();

    const nombre = document.getElementById("regNombre").value.trim();
    const apellido = document.getElementById("regApellido").value.trim();
    const fechaNacInput = document.getElementById("regFechaNac").value;
    const email = document.getElementById("regEmail").value.trim().toLowerCase();
    const pass = document.getElementById("regPassword").value;
    const passConfirm = document.getElementById("regPasswordConfirm").value;

    const regexLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!regexLetras.test(nombre) || !regexLetras.test(apellido)) {
      if (mensaje) {
        mensaje.textContent = t.errSoloLetras || "El nombre y apellido solo deben contener letras.";
        mensaje.className = "error";
      }
      return;
    }

    const fechaNac = new Date(fechaNacInput);
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mes = hoy.getMonth() - fechaNac.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) edad--;

    if (isNaN(edad) || edad < 14) {
      if (mensaje) {
        mensaje.textContent = t.errMenorEdad || "El registro está denegado para menores de 14 años.";
        mensaje.className = "error";
      }
      return;
    }

    const regexEmailEstricto = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!regexEmailEstricto.test(email)) {
      if (mensaje) {
        mensaje.textContent = t.errEmailInvalido || "Formato de correo corporativo inválido.";
        mensaje.className = "error";
      }
      return;
    }

    const usuarios = obtenerUsuarios();
    if (usuarios.some(u => u.usuario.trim().toLowerCase() === email)) {
      if (mensaje) {
        mensaje.textContent = t.errEmailRegistrado || "El correo electrónico ya se encuentra registrado.";
        mensaje.className = "error";
      }
      return;
    }

    if (pass !== passConfirm) {
      if (mensaje) {
        mensaje.textContent = t.errPassNoCoinciden || "Las contraseñas no coinciden.";
        mensaje.className = "error";
      }
      return;
    }

    usuarios.push({ nombre, apellido, fechaNac: fechaNacInput, usuario: email, password: pass });
    guardarUsuarios(usuarios);

    if (mensaje) {
      mensaje.textContent = t.msgExitoRegistro || "¡Registro exitoso! Redirigiendo al inicio de sesión...";
      mensaje.className = "exito";
    }

    setTimeout(() => {
      window.location.href = "index.html";
    }, 1500);
  });
}

const formLogin = document.getElementById("loginForm");
if (formLogin) {
  formLogin.addEventListener("submit", function (e) {
    e.preventDefault();
    const t = obtenerTraduccionActual();

    const email = document.getElementById("usuario").value.trim().toLowerCase();
    const password = document.getElementById("password").value.trim();

    const usuarios = obtenerUsuarios();
    const usuarioEncontrado = usuarios.find(u => u.usuario.trim().toLowerCase() === email && u.password === password);

    if (usuarioEncontrado) {
      localStorage.setItem("sesion_sgg", JSON.stringify(usuarioEncontrado));
      if (mensaje) {
        const msg = (t.msgExitoLogin || "¡Bienvenido {nombre}! Redirigiendo...").replace("{nombre}", usuarioEncontrado.nombre);
        mensaje.textContent = msg;
        mensaje.className = "exito";
      }
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 1000);
    } else {
      if (mensaje) {
        mensaje.textContent = t.errCredenciales || "Credenciales inválidas.";
        mensaje.className = "error";
      }
    }
  });
}

const formRecuperar = document.getElementById("recuperarForm");
if (formRecuperar) {
  formRecuperar.addEventListener("submit", function (e) {
    e.preventDefault();
    const t = obtenerTraduccionActual();

    const email = document.getElementById("recEmail").value.trim().toLowerCase();
    const passNueva = document.getElementById("recPassword").value;
    const passConfirm = document.getElementById("recPasswordConfirm").value;

    if (passNueva !== passConfirm) {
      if (mensaje) {
        mensaje.textContent = t.errPassNoCoinciden || "Las contraseñas no coinciden.";
        mensaje.className = "error";
      }
      return;
    }

    const usuarios = obtenerUsuarios();
    const index = usuarios.findIndex(u => u.usuario.trim().toLowerCase() === email);

    if (index === -1) {
      if (mensaje) {
        mensaje.textContent = t.errEmailNoRegistrado || "El correo corporativo no está registrado.";
        mensaje.className = "error";
      }
      return;
    }

    if (usuarios[index].password === passNueva) {
      if (mensaje) {
        mensaje.textContent = t.errPassIdentica || "La nueva contraseña no puede ser idéntica a la actual.";
        mensaje.className = "error";
      }
      return;
    }

    usuarios[index].password = passNueva;
    guardarUsuarios(usuarios);

    if (mensaje) {
      mensaje.textContent = t.msgExitoPass || "Contraseña actualizada con éxito. Redirigiendo...";
      mensaje.className = "exito";
    }

    setTimeout(() => {
      window.location.href = "index.html";
    }, 1500);
  });
}

/* =========================================
   CANVAS ANIMADO DE FONDO (TARJETAS)
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
      const symbols = ["$", "€", "¥", "£", "%", "+", "-"];
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
      this.width = 75;
      this.height = 48;
      this.vx = (Math.random() - 0.5) * 0.6;
      this.vy = (Math.random() - 0.5) * 0.6;
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
      ctx.rotate(Math.sin(this.angle) * 0.2);

      ctx.fillStyle = fillColor;
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.roundRect(-this.width / 2, -this.height / 2, this.width, this.height, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#fbbf24";
      ctx.fillRect(-this.width / 2 + 8, -this.height / 2 + 12, 12, 10);

      ctx.fillStyle = strokeColor;
      ctx.fillRect(-this.width / 2 + 8, -this.height / 2 + 28, 45, 3);
      ctx.fillRect(-this.width / 2 + 8, -this.height / 2 + 35, 25, 2);

      ctx.beginPath();
      ctx.arc(this.width / 2 - 12, this.height / 2 - 10, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  function initSggElements() {
    currencySymbols = [];
    cards = [];
    const countSymbols = Math.floor(canvas.width / 35);
    for (let i = 0; i < countSymbols; i++) currencySymbols.push(new CurrencySymbol());
    const countCards = Math.floor(canvas.width / 180);
    for (let i = 0; i < countCards; i++) cards.push(new FloatingCard());
  }

  resizeCanvas();

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const isDark = document.body.classList.contains("dark");
    const mainColor = isDark ? "#d900ff" : "#8b5cf6";
    const waveColor = isDark ? "rgba(217, 0, 255, 0.12)" : "rgba(139, 92, 246, 0.12)";
    const cardFill = isDark ? "rgba(20, 8, 33, 0.85)" : "rgba(255, 255, 255, 0.85)";

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