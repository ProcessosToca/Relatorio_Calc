// ===== Energia =====
function calculateEnergia() {
  updateSharedDates();
  const ultimo = document.getElementById("energia-ultimo")?.value;
  const delivery = document.getElementById("delivery-date")?.value;
  const valor = parseFloat(document.getElementById("energia-valor")?.value || 0);
  const resultField = document.getElementById("energia-total");
  const info = document.getElementById("energia-info");

  if (!ultimo || !delivery || !valor) {
    resultField.value = "";
    info.textContent = "";
    return;
  }

  if (ultimo === delivery) {
    resultField.value = "R$ 0,00";
    info.textContent = "Sem diferença de dias entre a entrega e o aviso.";
    return;
  }

  const diffDays = getDaysDiff(ultimo, delivery);
  const daily = valor / 30;
  const total = daily * diffDays;

  resultField.value = total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  info.textContent = `Previsão referente a ${diffDays.toFixed(0)} dia(s) de energia (Período ${formatDateBR(
    ultimo
  )} à ${formatDateBR(delivery)}).`;
}

// Format date
function formatDateBR(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d)) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

// =============== ADICIONAR RESULTADO ===============
function setupAddResultEnergia() {
  const resultBtn = document.getElementById("energia-add-result");
  const list = document.getElementById("energia-list");
  const energiaTotal = document.getElementById("energia-total");
  const energiaInfo = document.getElementById("energia-info");
  const divider = document.getElementById("energia-divider");
  const previsaoContainer = document.getElementById("energia-previsao-container");

  if (!resultBtn || !energiaTotal || !energiaInfo || !list) return;

  resultBtn.addEventListener("click", () => {
    const valor = energiaTotal.value.replace(/[^\d,.-]/g, "").replace(",", ".");
    const info = energiaInfo.textContent.trim();

    if (!valor || isNaN(parseFloat(valor))) {
      alert("Nenhum resultado de energia para adicionar.");
      return;
    }

    divider.style.display = "block";

    previsaoContainer.innerHTML = `
      <p class="text-muted mb-1">- ${info}</p>
      <p class="fw-bold">${parseFloat(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
    `;

    calculateTotalEnergia();
  });
}

// =============== CALCULAR SOMA TOTAL ===============
function calculateTotalEnergia() {
  const list = document.getElementById("energia-list");
  const previsaoContainer = document.getElementById("energia-previsao-container");
  const totalDivider = document.getElementById("energia-total-divider");
  const somaContainer = document.getElementById("energia-soma-container");

  let soma = 0;

  // Somar todos os itens da lista
  list.querySelectorAll("li span").forEach(span => {
    const match = span.textContent.match(/R\$\s*([\d.,]+)/);
    if (match) {
      const val = parseFloat(match[1].replace(/\./g, "").replace(",", "."));
      soma += val;
    }
  });

  // Somar previsão se existir
  const previsaoText = previsaoContainer.textContent;
  const previsaoMatch = previsaoText.match(/R\$\s*([\d.,]+)/);
  if (previsaoMatch) {
    const previsaoVal = parseFloat(previsaoMatch[1].replace(/\./g, "").replace(",", "."));
    soma += previsaoVal;
  }

  if (soma > 0) {
    totalDivider.style.display = "block";
    somaContainer.textContent = `Soma total: ${soma.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`;
  } else {
    totalDivider.style.display = "none";
    somaContainer.textContent = "";
  }
}

// =============== LISTA DE ITENS =================
function setupAddLine(section) {
  const addBtn = document.getElementById(`${section}-add-btn`);
  const descInput = document.getElementById(`${section}-desc`);
  const dateInput = document.getElementById(`${section}-date`);
  const valueInput = document.getElementById(`${section}-value`);
  const list = document.getElementById(`${section}-list`);

  if (!addBtn || !descInput || !dateInput || !valueInput || !list) return;

  addBtn.disabled = true;
  let count = 1;

  [descInput, dateInput, valueInput].forEach(input => {
    input.addEventListener("input", () => {
      addBtn.disabled = !(descInput.value.trim() && dateInput.value && valueInput.value.trim());
    });
  });

  addBtn.addEventListener("click", () => {
    const desc = descInput.value.trim();
    const date = dateInput.value;
    const val = Number(valueInput.value.replace(",", "."));

    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";

    const leftText = document.createElement("span");
    const brl = val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    leftText.textContent = `${count}. Vencimento ${formatDateBR(date)}. ${brl}`;

    const del = document.createElement("button");
    del.className = "btn btn-sm btn-outline-danger ms-3";
    del.textContent = "❌";
    del.addEventListener("click", () => {
      li.remove();
      renumber();
      calculateTotalEnergia();
    });

    li.appendChild(leftText);
    li.appendChild(del);
    list.appendChild(li);

    count++;
    descInput.value = "";
    dateInput.value = "";
    valueInput.value = "";
    addBtn.disabled = true;

    calculateTotalEnergia();

    function renumber() {
      const items = list.querySelectorAll("li span");
      items.forEach((span, idx) => {
        const rest = span.textContent.replace(/^\d+\.\s*/, "");
        span.textContent = `${idx + 1}. ${rest}`;
      });
      count = items.length + 1;
    }
  });
}

// Init for Energia
document.addEventListener("DOMContentLoaded", () => {
  ["energia"].forEach(setupAddLine);
  setupAddResultEnergia();
});