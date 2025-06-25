
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

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const transaccion = {
    descripcion: descripcion.value,
    cantidad: parseFloat(cantidad.value),
    tipo: tipo.value,
    fecha: new Date().toLocaleDateString()
  };
  transacciones.push(transaccion);
  localStorage.setItem("transacciones", JSON.stringify(transacciones));
  descripcion.value = "";
  cantidad.value = "";
  renderizar();
});

function renderizar() {
  historial.innerHTML = "";
  let ingresos = 0, gastos = 0;

  transacciones.forEach(t => {
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

renderizar();
