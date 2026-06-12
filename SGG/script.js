const usuarios = [
  {
    usuario: "admin",
    password: "1234"
  },
  {
    usuario: "Iznnk",
    password: "abcd"
  }
];

const form = document.getElementById("loginForm");
const mensaje = document.getElementById("mensaje");
const temaBtn = document.getElementById("temaBtn");
const idioma = document.getElementById("idioma");

const textos = {

  es:{
    subtitulo:"Sistema de Gestión de Gastos",
    usuario:"Usuario",
    password:"Contraseña",
    login:"Ingresar",
    mostrar:"Mostrar contraseña",
    bienvenido:"Bienvenido",
    error:"Usuario o contraseña incorrectos"
  },

  en:{
    subtitulo:"Expense Management System",
    usuario:"Username",
    password:"Password",
    login:"Login",
    mostrar:"Show password",
    bienvenido:"Welcome",
    error:"Incorrect username or password"
  },

  pt:{
    subtitulo:"Sistema de Gestão de Despesas",
    usuario:"Usuário",
    password:"Senha",
    login:"Entrar",
    mostrar:"Mostrar senha",
    bienvenido:"Bem-vindo",
    error:"Usuário ou senha incorretos"
  },

  fr:{
    subtitulo:"Système de Gestion des Dépenses",
    usuario:"Utilisateur",
    password:"Mot de passe",
    login:"Connexion",
    mostrar:"Afficher le mot de passe",
    bienvenido:"Bienvenue",
    error:"Nom d'utilisateur ou mot de passe incorrect"
  },

  it:{
    subtitulo:"Sistema di Gestione delle Spese",
    usuario:"Utente",
    password:"Password",
    login:"Accedi",
    mostrar:"Mostra password",
    bienvenido:"Benvenuto",
    error:"Utente o password non validi"
  },

  de:{
    subtitulo:"Ausgabenverwaltungssystem",
    usuario:"Benutzer",
    password:"Passwort",
    login:"Anmelden",
    mostrar:"Passwort anzeigen",
    bienvenido:"Willkommen",
    error:"Benutzername oder Passwort falsch"
  },

  ru:{
    subtitulo:"Система управления расходами",
    usuario:"Пользователь",
    password:"Пароль",
    login:"Войти",
    mostrar:"Показать пароль",
    bienvenido:"Добро пожаловать",
    error:"Неверный логин или пароль"
  },

  zh:{
    subtitulo:"费用管理系统",
    usuario:"用户",
    password:"密码",
    login:"登录",
    mostrar:"显示密码",
    bienvenido:"欢迎",
    error:"用户名或密码错误"
  },

  ja:{
    subtitulo:"経費管理システム",
    usuario:"ユーザー",
    password:"パスワード",
    login:"ログイン",
    mostrar:"パスワードを表示",
    bienvenido:"ようこそ",
    error:"ユーザー名またはパスワードが違います"
  },

  ar:{
    subtitulo:"نظام إدارة المصروفات",
    usuario:"المستخدم",
    password:"كلمة المرور",
    login:"تسجيل الدخول",
    mostrar:"إظهار كلمة المرور",
    bienvenido:"مرحباً",
    error:"اسم المستخدم أو كلمة المرور غير صحيحة"
  }

};

// Recuperar tema
if(localStorage.getItem("tema") === "oscuro"){
  document.body.classList.add("dark");
  temaBtn.textContent = "☀️";
}

// Recuperar idioma
const idiomaGuardado = localStorage.getItem("idioma");

if(idiomaGuardado){
  idioma.value = idiomaGuardado;
}

// Login
form.addEventListener("submit", function(e){

  e.preventDefault();

  const usuario = document.getElementById("usuario").value;
  const password = document.getElementById("password").value;

  const encontrado = usuarios.find(
    u => u.usuario === usuario && u.password === password
  );

  const t = textos[idioma.value];

  if(encontrado){
    mensaje.innerHTML = `✅ ${t.bienvenido} ${usuario}`;
    mensaje.className = "exito";
    localStorage.setItem("usuarioActivo", usuario);
  } else {
    mensaje.innerHTML = `❌ ${t.error}`;
    mensaje.className = "error";
  }

});

// Cambiar tema
temaBtn.addEventListener("click", () => {

  document.body.classList.toggle("dark");

  if(document.body.classList.contains("dark")){
    localStorage.setItem("tema", "oscuro");
    temaBtn.textContent = "☀️";
  } else {
    localStorage.setItem("tema", "claro");
    temaBtn.textContent = "🌙";
  }

});

// Mostrar contraseña
document.getElementById("mostrarPass").addEventListener("change", function(){
  document.getElementById("password").type = this.checked ? "text" : "password";
});

// Idiomas
idioma.addEventListener("change", () => {

  localStorage.setItem("idioma", idioma.value);
  const t = textos[idioma.value];

  document.getElementById("subtitulo").textContent = t.subtitulo;
  document.getElementById("usuario").placeholder = t.usuario;
  document.getElementById("password").placeholder = t.password;
  document.getElementById("btnLogin").textContent = t.login;
  document.querySelector("label[for='mostrarPass']").textContent = t.mostrar;

});

// Aplicar idioma al cargar
idioma.dispatchEvent(new Event("change"));