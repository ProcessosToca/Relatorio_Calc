// ======================
// IPTU Section
// ======================

document.addEventListener("DOMContentLoaded", () => {
  const yesDueDate = document.getElementById("yesDueDate");
  const noDueDate = document.getElementById("noDueDate");
  const dueDateInput = document.getElementById("iptu-value");

  function toggleDueDate() {
    if (yesDueDate.checked) {
      dueDateInput.style.display = "inline-block";
    } else {
      dueDateInput.style.display = "none";
    }
  }

  yesDueDate.addEventListener("change", toggleDueDate);
  noDueDate.addEventListener("change", toggleDueDate);
});

// ✅ Format BRL
function formatCurrencyBRL(value) {
  if (isNaN(value) || value === null) return "";
  return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// ✅ Format ISO date to dd/mm/yyyy
function formatDateBR(dateStr) {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  if (!year || !month || !day) return "";
  return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
}

// ✅ Convert dd/mm/yyyy to ISO (for calculation)
function formatDateISO(brDateStr) {
  if (!brDateStr) return "";
  const [day, month, year] = brDateStr.split("/");
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

// ✅ Get difference in days between 2 dates
function getDaysDiff(start, end) {
  const d1 = new Date(start);
  const d2 = new Date(end);
  const diffTime = d2.getTime() - d1.getTime();
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
}

// ✅ Show/hide IPTU section based on radio
function toggleIptuSection() {
  const yes = document.getElementById("yesDueDate");
  const container = document.getElementById("iptu-container");

  if (yes.checked) {
    container.style.display = "block";
    container.classList.add("animate__animated", "animate__fadeIn");
  } else {
    container.style.display = "none";
    document.getElementById("iptu-ultimo").value = "";
    document.getElementById("iptu-value-input").value = "";
    document.getElementById("iptu-total").value = "";
    document.getElementById("iptu-info").textContent = "";
  }
}

// ✅ Mirror "Data de Entrega" from main delivery-date
function mirrorIptuDelivery() {
  const mainDelivery = document.getElementById("delivery-date");
  const iptuDelivery = document.getElementById("iptu-delivery");

  if (mainDelivery && iptuDelivery) {
    mainDelivery.addEventListener("input", () => {
      iptuDelivery.value = formatDateBR(mainDelivery.value);
      calculateIptu();
    });
    iptuDelivery.value = formatDateBR(mainDelivery.value);
  }
}

// ✅ IPTU calculation
function calculateIptu() {
  const ultimoPagamento = document.getElementById("iptu-ultimo")?.value;
  const entregaBr = document.getElementById("iptu-delivery")?.value;
  const valor = parseFloat(document.getElementById("iptu-value-input")?.value || 0);
  const resultField = document.getElementById("iptu-total");
  const infoField = document.getElementById("iptu-info");

  if (!ultimoPagamento || !entregaBr || isNaN(valor) || valor <= 0) {
    resultField.value = "";
    infoField.textContent = "";
    return;
  }

  const entregaISO = formatDateISO(entregaBr);
  const daysDiff = getDaysDiff(ultimoPagamento, entregaISO);

  const dailyValue = valor / 30;
  const total = dailyValue * daysDiff;

  resultField.value = formatCurrencyBRL(total);
  infoField.textContent = `(${formatCurrencyBRL(valor)} ÷ 30) × ${daysDiff} dia(s)`;
}

// ✅ Init
document.addEventListener("DOMContentLoaded", () => {
  // Toggle section
  document.getElementById("yesDueDate").addEventListener("change", toggleIptuSection);
  document.getElementById("noDueDate").addEventListener("change", toggleIptuSection);

  // Mirror delivery
  mirrorIptuDelivery();

  // Calculation listeners
  ["iptu-ultimo", "iptu-value-input"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", calculateIptu);
  });
});
