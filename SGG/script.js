// =========================================
// BASE DE DATOS Y TRADUCCIONES
// =========================================
const usuarios = [
  { usuario: "admin", password: "1234" },
  { usuario: "Iznnk", password: "abcd" }
];

const textos = {
  es: { subtitulo: "Sistema de Gestión de Gastos", usuario: "Usuario", password: "Contraseña", login: "Ingresar", mostrar: "Mostrar contraseña", bienvenido: "Bienvenido", error: "Usuario o contraseña incorrectos" },
  en: { subtitulo: "Expense Management System", usuario: "Username", password: "Password", login: "Login", mostrar: "Show password", bienvenido: "Welcome", error: "Incorrect username or password" },
  pt: { subtitulo: "Sistema de Gestão de Despesas", usuario: "Usuário", password: "Senha", login: "Entrar", mostrar: "Mostrar senha", bienvenido: "Bem-vindo", error: "Usuário ou senha incorretos" },
  fr: { subtitulo: "Système de Gestion des Dépenses", usuario: "Utilisateur", password: "Mot de passe", login: "Connexion", mostrar: "Afficher le mot de passe", bienvenido: "Bienvenue", error: "Nom d'utilisateur ou mot de passe incorrect" },
  it: { subtitulo: "Sistema di Gestione delle Spese", usuario: "Utente", password: "Password", login: "Accedi", mostrar: "Mostra password", bienvenido: "Benvenuto", error: "Utente o password non validi" },
  de: { subtitulo: "Ausgabenverwaltungssystem", usuario: "Benutzer", password: "Passwort", login: "Anmelden", mostrar: "Passwort anzeigen", bienvenido: "Willkommen", error: "Benutzername oder Passwort falsch" },
  ru: { subtitulo: "Система управления расходами", usuario: "Пользователь", password: "Пароль", login: "Войти", mostrar: "Показать пароль", bienvenido: "Добро пожаловать", error: "Неверный логин или пароль" },
  zh: { subtitulo: "费用管理系统", usuario: "用户", password: "密码", login: "登录", mostrar: "显示密码", bienvenido: "欢迎", error: "用户名或密码错误" },
  ja: { subtitulo: "経費管理システム", usuario: "ユーザー", password: "パスワード", login: "ログイン", mostrar: "パスワードを表示", bienvenido: "ようこそ", error: "ユーザー名またはパスワードが違います" },
  ar: { subtitulo: "نظام إدارة المصروفات", usuario: "المستخدم", password: "كلمة المرور", login: "تسجيل الدخول", mostrar: "إظهار كلمة المرور", bienvenido: "مرحباً", error: "اسم المستخدم أو كلمة المرور غير صحيحة" }
};

// =========================================
// REFERENCIAS DOM
// =========================================
const mainContainer = document.getElementById("mainContainer");
const formLogin = document.getElementById("loginForm");
const mensaje = document.getElementById("mensaje");
const temaBtn = document.getElementById("temaBtn");
const idioma = document.getElementById("idioma");

const vistaLogin = document.getElementById("vistaLogin");
const vistaDashboard = document.getElementById("vistaDashboard");
const userNombre = document.getElementById("userNombre");
const btnCerrarSesion = document.getElementById("btnCerrarSesion");

// CRUD DOM
const formGasto = document.getElementById("formGasto");
const inputMonto = document.getElementById("monto");
const inputFecha = document.getElementById("fecha");
const selectCategoria = document.getElementById("categoria");
const inputDescripcion = document.getElementById("descripcion");
const inputGastoId = document.getElementById("gastoId");
const btnGuardarGasto = document.getElementById("btnGuardarGasto");
const btnCancelarEdicion = document.getElementById("btnCancelarEdicion");
const tablaGastosBody = document.getElementById("tablaGastosBody");
const totalGastadoEl = document.getElementById("totalGastado");

// Modal DOM
const modalEliminar = document.getElementById("modalEliminar");
const btnConfirmarEliminar = document.getElementById("btnConfirmarEliminar");
const btnCancelarEliminar = document.getElementById("btnCancelarEliminar");
let idAEliminar = null;

let usuarioActivo = null;

// =========================================
// CONFIGURACIÓN INICIAL Y TEMAS
// =========================================
if(localStorage.getItem("tema") === "oscuro"){
  document.body.classList.add("dark");
  temaBtn.textContent = "☀️";
}

temaBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const esOscuro = document.body.classList.contains("dark");
  localStorage.setItem("tema", esOscuro ? "oscuro" : "claro");
  temaBtn.textContent = esOscuro ? "☀️" : "🌙";
});

document.getElementById("mostrarPass").addEventListener("change", function(){
  document.getElementById("password").type = this.checked ? "text" : "password";
});

idioma.addEventListener("change", () => {
  localStorage.setItem("idioma", idioma.value);
  const t = textos[idioma.value];
  document.getElementById("subtitulo").textContent = t.subtitulo;
  document.getElementById("usuario").placeholder = t.usuario;
  document.getElementById("password").placeholder = t.password;
  document.getElementById("btnLogin").textContent = t.login;
  document.querySelector("label[for='mostrarPass']").textContent = t.mostrar;
});

// =========================================
// LÓGICA DE LOGIN (AUTENTICACIÓN)
// =========================================
formLogin.addEventListener("submit", function(e){
  e.preventDefault();

  const usuarioIngresado = document.getElementById("usuario").value;
  const passwordIngresado = document.getElementById("password").value;

  const encontrado = usuarios.find(u => u.usuario === usuarioIngresado && u.password === passwordIngresado);
  const t = textos[idioma.value];

  if(encontrado){
    mensaje.innerHTML = `✅ ${t.bienvenido} ${usuarioIngresado}`;
    mensaje.className = "exito";
    usuarioActivo = usuarioIngresado;
    localStorage.setItem("usuario_logueado", JSON.stringify({ email: usuarioIngresado }));

    setTimeout(() => {
      iniciarDashboard();
    }, 800);
  } else {
    mensaje.innerHTML = `❌ ${t.error}`;
    mensaje.className = "error";
  }
});

function iniciarDashboard() {
  vistaLogin.style.display = "none";
  mensaje.style.display = "none";
  vistaDashboard.style.display = "block";
  mainContainer.classList.add("modo-dashboard");
  userNombre.textContent = usuarioActivo;
  inputFecha.valueAsDate = new Date();
  renderizarUI();
}

btnCerrarSesion.addEventListener("click", () => {
  usuarioActivo = null;
  localStorage.removeItem("usuario_logueado");
  vistaDashboard.style.display = "none";
  vistaLogin.style.display = "block";
  mensaje.style.display = "block";
  mensaje.innerHTML = "";
  mainContainer.classList.remove("modo-dashboard");
  formLogin.reset();
});

// =========================================
// LÓGICA DEL CRUD DE GASTOS (RF-05 AL RF-09)
// =========================================
function obtenerGastos() {
  return JSON.parse(localStorage.getItem('gastos_sgg')) || [];
}

function guardarGastos(gastos) {
  localStorage.setItem('gastos_sgg', JSON.stringify(gastos));
}

function renderizarUI() {
  const todos = obtenerGastos();
  // Filtrar por usuario activo Y estado_activo === true
  const activos = todos.filter(g => g.email_usuario === usuarioActivo && g.estado_activo === true);

  tablaGastosBody.innerHTML = '';
  let total = 0;

  if (activos.length === 0) {
    tablaGastosBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No hay gastos registrados.</td></tr>';
  } else {
    activos.forEach(gasto => {
      total += parseFloat(gasto.monto);
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${gasto.fecha}</td>
        <td>${gasto.categoria}</td>
        <td>${gasto.descripcion}</td>
        <td>$${parseFloat(gasto.monto).toFixed(2)}</td>
        <td>
          <button class="btn-editar" onclick="editarGasto('${gasto.id}')">✏️</button>
          <button class="btn-eliminar" onclick="abrirModal('${gasto.id}')">🗑️</button>
        </td>
      `;
      tablaGastosBody.appendChild(tr);
    });
  }

  totalGastadoEl.textContent = `$${total.toFixed(2)}`;
}

formGasto.addEventListener('submit', (e) => {
  e.preventDefault();

  const monto = parseFloat(inputMonto.value);
  const fecha = inputFecha.value;
  const categoria = selectCategoria.value;
  const descripcion = inputDescripcion.value.trim();
  const id = inputGastoId.value;

  if (isNaN(monto) || monto <= 0) {
    alert("El monto debe ser un número mayor a cero.");
    return;
  }

  let gastos = obtenerGastos();

  if (id) {
    // RF-07: Update (Edición)
    const idx = gastos.findIndex(g => g.id === id && g.email_usuario === usuarioActivo);
    if (idx !== -1) {
      gastos[idx] = { ...gastos[idx], monto, fecha, categoria, descripcion };
    }
  } else {
    // RF-05: Create (Carga)
    const nuevoGasto = {
      id: 'gasto_' + Date.now(),
      email_usuario: usuarioActivo,
      monto, fecha, categoria, descripcion,
      estado_activo: true // Baja lógica por defecto
    };
    gastos.push(nuevoGasto);
  }

  guardarGastos(gastos);
  limpiarFormulario();
  renderizarUI();
});

window.editarGasto = function(id) {
  const gasto = obtenerGastos().find(g => g.id === id);
  if (gasto) {
    inputGastoId.value = gasto.id;
    inputMonto.value = gasto.monto;
    inputFecha.value = gasto.fecha;
    selectCategoria.value = gasto.categoria;
    inputDescripcion.value = gasto.descripcion;

    btnGuardarGasto.textContent = 'Guardar Cambios';
    btnCancelarEdicion.style.display = 'inline-block';
  }
};

function limpiarFormulario() {
  inputGastoId.value = '';
  formGasto.reset();
  btnGuardarGasto.textContent = 'Agregar Gasto';
  btnCancelarEdicion.style.display = 'none';
  inputFecha.valueAsDate = new Date();
}

btnCancelarEdicion.addEventListener('click', limpiarFormulario);

// RF-08: Baja Lógica con Modal
window.abrirModal = function(id) {
  idAEliminar = id;
  modalEliminar.classList.add('active');
};

btnCancelarEliminar.addEventListener('click', () => {
  modalEliminar.classList.remove('active');
  idAEliminar = null;
});

btnConfirmarEliminar.addEventListener('click', () => {
  if (idAEliminar) {
    let gastos = obtenerGastos();
    // Prohibido splice(). Modificamos propiedad estado_activo
    gastos = gastos.map(g => g.id === idAEliminar ? { ...g, estado_activo: false } : g);
    guardarGastos(gastos);
    renderizarUI();
    modalEliminar.classList.remove('active');
    idAEliminar = null;
  }
});

// Inicializar idioma guardado al cargar
const idiomaGuardado = localStorage.getItem("idioma");
if(idiomaGuardado) idioma.value = idiomaGuardado;
idioma.dispatchEvent(new Event("change"));
