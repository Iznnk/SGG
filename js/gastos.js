/* =========================================
   MÓDULO DE GESTIÓN DE GASTOS (CRUD & LÓGICA)
========================================= */

let usuarioSesionActiva = null;
let idGastoAEliminar = null;

function verificarSesion() {
  const sesionJSON = localStorage.getItem("sesion_sgg");
  if (!sesionJSON) {
    window.location.href = "index.html";
    return null;
  }
  const user = JSON.parse(sesionJSON);
  const userNombre = document.getElementById("userNombre");
  if (userNombre) userNombre.textContent = `${user.nombre} ${user.apellido}`;
  return user;
}

function obtenerGastos() {
  return JSON.parse(localStorage.getItem('gastos_sgg')) || [];
}

function guardarGastosArray(gastos) {
  localStorage.setItem('gastos_sgg', JSON.stringify(gastos));
}

function renderizarCRUD() {
  if (!usuarioSesionActiva) return;

  const tablaBody = document.getElementById("tablaGastosBody");
  const totalGastadoEl = document.getElementById("totalGastado");
  if (!tablaBody || !totalGastadoEl) return;

  const todosGastos = obtenerGastos();
  const lang = localStorage.getItem("lang_sgg") || "es";
  const t = window.sggTranslations[lang] || window.sggTranslations.es;
  
  const gastosUsuarioActivos = todosGastos.filter(g => 
    g.email_usuario.trim().toLowerCase() === usuarioSesionActiva.usuario.trim().toLowerCase() && 
    g.estado_activo === true
  );

  tablaBody.innerHTML = '';
  let acumuladorTotal = 0;

  if (gastosUsuarioActivos.length === 0) {
    tablaBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color: var(--text-sec);">${t.sinMovimientos}</td></tr>`;
  } else {
    gastosUsuarioActivos.forEach(g => {
      acumuladorTotal += parseFloat(g.monto);
      
      let categoriaTraducida = g.categoria;
      const catKeyMap = {
        "Alimentación": t.catAlimentacion,
        "Transporte": t.catTransporte,
        "Servicios": t.catServicios,
        "Ocio": t.catOcio,
        "Salud": t.catSalud,
        "Otros": t.catOtros
      };
      if (catKeyMap[g.categoria]) {
        categoriaTraducida = catKeyMap[g.categoria];
      }

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${g.fecha}</td>
        <td><strong>${categoriaTraducida}</strong></td>
        <td>${g.descripcion}</td>
        <td>$${parseFloat(g.monto).toFixed(2)}</td>
        <td>
          <button class="btn-editar" onclick="prepararEdicionGasto('${g.id}')">${t.editBtn}</button>
          <button class="btn-eliminar" onclick="solicitarEliminacionGasto('${g.id}')">${t.deleteBtn}</button>
        </td>
      `;
      tablaBody.appendChild(tr);
    });
  }

  totalGastadoEl.textContent = `$${acumuladorTotal.toFixed(2)}`;
}

const gastoForm = document.getElementById("gastoForm");
const inputGastoId = document.getElementById("gastoId");
const inputMonto = document.getElementById("monto");
const inputFecha = document.getElementById("fecha");
const inputCategoria = document.getElementById("categoria");
const inputDescripcion = document.getElementById("descripcion");
const btnCancelarEdicion = document.getElementById("btnCancelarEdicion");
const mensajeGasto = document.getElementById("mensajeGasto");

if (gastoForm) {
  if (inputFecha) inputFecha.valueAsDate = new Date();

  gastoForm.addEventListener("submit", function(e) {
    e.preventDefault();

    const lang = localStorage.getItem("lang_sgg") || "es";
    const t = window.sggTranslations[lang] || window.sggTranslations.es;

    const montoVal = parseFloat(inputMonto.value);
    const fechaVal = inputFecha.value;
    const categoriaVal = inputCategoria.value;
    const descripcionVal = inputDescripcion.value.trim();

    if (isNaN(montoVal) || montoVal <= 0) {
      mensajeGasto.textContent = t.errMonto;
      mensajeGasto.className = "error";
      return;
    }

    if (!fechaVal || !categoriaVal || !descripcionVal) {
      mensajeGasto.textContent = t.errCampos;
      mensajeGasto.className = "error";
      return;
    }

    let gastos = obtenerGastos();
    const idEditando = inputGastoId.value;

    if (idEditando) {
      const index = gastos.findIndex(g => g.id === idEditando);
      if (index !== -1) {
        gastos[index].monto = montoVal;
        gastos[index].fecha = fechaVal;
        gastos[index].categoria = categoriaVal;
        gastos[index].descripcion = descripcionVal;
        mensajeGasto.textContent = t.msgExitoEdicion;
        mensajeGasto.className = "exito";
      }
    } else {
      const nuevoGasto = {
        id: "gasto_" + Date.now(),
        email_usuario: usuarioSesionActiva.usuario,
        monto: montoVal,
        fecha: fechaVal,
        categoria: categoriaVal,
        descripcion: descripcionVal,
        estado_activo: true
      };
      gastos.push(nuevoGasto);
      mensajeGasto.textContent = t.msgExitoGasto;
      mensajeGasto.className = "exito";
    }

    guardarGastosArray(gastos);
    limpiarFormularioGasto();
    renderizarCRUD();

    setTimeout(() => { if (mensajeGasto) mensajeGasto.textContent = ""; }, 3000);
  });
}

function prepararEdicionGasto(id) {
  const gastos = obtenerGastos();
  const gasto = gastos.find(g => g.id === id);
  if (!gasto) return;

  const lang = localStorage.getItem("lang_sgg") || "es";
  const t = window.sggTranslations[lang] || window.sggTranslations.es;

  inputGastoId.value = gasto.id;
  inputMonto.value = gasto.monto;
  inputFecha.value = gasto.fecha;
  inputCategoria.value = gasto.categoria;
  inputDescripcion.value = gasto.descripcion;

  document.getElementById("formTitulo").textContent = t.editBtn.toUpperCase() + " GASTO";
  if (btnCancelarEdicion) btnCancelarEdicion.style.display = "inline-block";
}

function limpiarFormularioGasto() {
  const lang = localStorage.getItem("lang_sgg") || "es";
  const t = window.sggTranslations[lang] || window.sggTranslations.es;

  inputGastoId.value = "";
  inputMonto.value = "";
  if (inputFecha) inputFecha.valueAsDate = new Date();
  inputCategoria.value = "";
  inputDescripcion.value = "";
  document.getElementById("formTitulo").textContent = t.lblCargarGasto;
  if (btnCancelarEdicion) btnCancelarEdicion.style.display = "none";
}

if (btnCancelarEdicion) {
  btnCancelarEdicion.addEventListener("click", limpiarFormularioGasto);
}

const confirmModal = document.getElementById("confirmModal");
const btnConfirmBorrar = document.getElementById("btnConfirmBorrar");
const btnCancelarBorrar = document.getElementById("btnCancelarBorrar");

function solicitarEliminacionGasto(id) {
  idGastoAEliminar = id;
  if (confirmModal) confirmModal.classList.add("active");
}

if (btnCancelarBorrar) {
  btnCancelarBorrar.addEventListener("click", () => {
    idGastoAEliminar = null;
    if (confirmModal) confirmModal.classList.remove("active");
  });
}

if (btnConfirmBorrar) {
  btnConfirmBorrar.addEventListener("click", () => {
    if (idGastoAEliminar) {
      let gastos = obtenerGastos();
      const index = gastos.findIndex(g => g.id === idGastoAEliminar);
      if (index !== -1) {
        gastos[index].estado_activo = false;
        guardarGastosArray(gastos);
        renderizarCRUD();
      }
    }
    idGastoAEliminar = null;
    if (confirmModal) confirmModal.classList.remove("active");
  });
}

const btnCerrarSesion = document.getElementById("btnCerrarSesion");
if (btnCerrarSesion) {
  btnCerrarSesion.addEventListener("click", () => {
    localStorage.removeItem("sesion_sgg");
    window.location.href = "index.html";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  usuarioSesionActiva = verificarSesion();
  if (usuarioSesionActiva) {
    renderizarCRUD();
  }
});