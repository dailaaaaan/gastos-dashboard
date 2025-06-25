let transacciones = JSON.parse(localStorage.getItem("transacciones")) || [];
let chartInstance = null;

const form = document.getElementById("gasto-form");
const descripcion = document.getElementById("descripcion");
const cantidad = document.getElementById("cantidad");
const tipo = document.getElementById("tipo");
const historial = document.getElementById("historial");
const totalIngresos = document.getElementById("totalIngresos");
const totalGastos = document.getElementById("totalGastos");
const balance = document.getElementById("balance");
const grafico = document.getElementById("grafico");

// FORMULARIO
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const transaccion = {
    descripcion: descripcion.value,
    cantidad: parseFloat(cantidad.value),
    tipo: tipo.value,
    fecha: new Date().toLocaleDateString("es-ES")
  };
  transacciones.push(transaccion);
  localStorage.setItem("transacciones", JSON.stringify(transacciones));
  descripcion.value = "";
  cantidad.value = "";
  renderizar();
});

// RENDERIZADO COMPLETO
function renderizar() {
  historial.innerHTML = "";
  let ingresos = 0, gastos = 0;

  transacciones.forEach((t, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${t.fecha} - ${t.descripcion}: ${t.cantidad} € (${t.tipo})
      <button class="eliminar" data-index="${index}">Eliminar</button>
    `;
    historial.appendChild(li);

    if (t.tipo === "ingreso") ingresos += t.cantidad;
    else gastos += t.cantidad;
  });

  totalIngresos.textContent = ingresos.toFixed(2) + " €";
  totalGastos.textContent = gastos.toFixed(2) + " €";
  balance.textContent = (ingresos - gastos).toFixed(2) + " €";

  document.querySelectorAll(".eliminar").forEach(btn => {
    btn.addEventListener("click", () => {
      const index = btn.getAttribute("data-index");
      transacciones.splice(index, 1);
      localStorage.setItem("transacciones", JSON.stringify(transacciones));
      renderizar();
    });
  });

  renderGrafico(ingresos, gastos);
}

// GRAFICO
function renderGrafico(ingresos, gastos) {
  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(grafico, {
    type: "doughnut",
    data: {
      labels: ["Ingresos", "Gastos"],
      datasets: [{
        data: [ingresos, gastos],
        backgroundColor: ["#28a745", "#dc3545"]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

// FILTRADO POR FECHAS
document.getElementById("aplicarFiltro")?.addEventListener("click", () => {
  const desde = document.getElementById("desde").value;
  const hasta = document.getElementById("hasta").value;

  const filtradas = transacciones.filter(t => {
    const fechaT = new Date(t.fecha.split("/").reverse().join("-"));
    const desdeDate = desde ? new Date(desde) : null;
    const hastaDate = hasta ? new Date(hasta) : null;
    return (!desdeDate || fechaT >= desdeDate) && (!hastaDate || fechaT <= hastaDate);
  });

  renderizarFiltradas(filtradas);
});

function renderizarFiltradas(lista) {
  historial.innerHTML = "";
  let ingresos = 0, gastos = 0;

  lista.forEach(t => {
    const li = document.createElement("li");
    li.textContent = `${t.fecha} - ${t.descripcion}: ${t.cantidad} € (${t.tipo})`;
    historial.appendChild(li);
    if (t.tipo === "ingreso") ingresos += t.cantidad;
    else gastos += t.cantidad;
  });

  totalIngresos.textContent = ingresos.toFixed(2) + " €";
  totalGastos.textContent = gastos.toFixed(2) + " €";
  balance.textContent = (ingresos - gastos).toFixed(2) + " €";
  renderGrafico(ingresos, gastos);
}

// EXPORTAR A CSV
document.getElementById("exportarCSV")?.addEventListener("click", () => {
  if (transacciones.length === 0) return alert("No hay datos para exportar.");

  const encabezado = "Fecha,Descripción,Cantidad,Tipo\n";
  const filas = transacciones.map(t =>
    [t.fecha, t.descripcion, t.cantidad, t.tipo].join(",")
  ).join("\n");

  const blob = new Blob([encabezado + filas], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = "gastos.csv";
  enlace.click();
});

// RESETEAR DATOS
document.getElementById("resetearDatos")?.addEventListener("click", () => {
  if (confirm("¿Estás seguro de que quieres borrar todos los datos?")) {
    transacciones = [];
    localStorage.removeItem("transacciones");
    renderizar();
  }
});

// Inicial
renderizar();
