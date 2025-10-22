// ===== Condomínio =====
function calculateCondominio() {
  const ultimo = document.getElementById("cond-ultimo")?.value;
  const delivery = document.getElementById("delivery-date")?.value;
  const valor = parseFloat(document.getElementById("cond-valor")?.value || 0);
  const resultField = document.getElementById("cond-total");
  const info = document.getElementById("cond-info");

  if (!ultimo || !delivery || !valor) {
    resultField.value = "";
    info.textContent = "";
    return;
  }

  if (ultimo === delivery) {
    resultField.value = "R$ 0,00";
    info.textContent = "Sem diferença de dias.";
    return;
  }

  const diffDays = getDaysDiff(ultimo, delivery);
  const daily = valor / 30;
  const total = daily * diffDays;

  resultField.value = total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  info.textContent = `Previsão referente a ${diffDays.toFixed(0)} dia(s) de condomínio (Período ${formatDateBR(
    ultimo
  )} à ${formatDateBR(delivery)}).`;
}

function formatDateBR(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d)) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

// Manual items, previsão and soma follow the same pattern as agua
function setupAddLineCondominio() {
  const addBtn = document.getElementById("cond-add-btn");
  const descInput = document.getElementById("cond-desc");
  const dateInput = document.getElementById("cond-date");
  const valueInput = document.getElementById("cond-value");
  const list = document.getElementById("cond-list");

  if (!addBtn) return;
  addBtn.disabled = true;
  let count = 1;

  [descInput, dateInput, valueInput].forEach(input => {
    input.addEventListener("input", () => {
      addBtn.disabled = !(descInput.value.trim() && dateInput.value && valueInput.value.trim());
    });
  });

  addBtn.addEventListener("click", () => {
    const date = dateInput.value;
    const val = Number(valueInput.value.replace(",", "."));

    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";
    li.innerHTML = `
      <span>${count}. Vencimento ${formatDateBR(date)}. ${val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
      <button class="btn btn-sm btn-outline-danger ms-3">❌</button>
    `;

    li.querySelector("button").addEventListener("click", () => {
      li.remove();
      renumber();
      calculateTotalCondominio();
    });

    list.appendChild(li);
    count++;
    descInput.value = "";
    dateInput.value = "";
    valueInput.value = "";
    addBtn.disabled = true;
    calculateTotalCondominio();

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

function setupAddResultCondominio() {
  const resultBtn = document.getElementById("cond-add-result");
  const totalField = document.getElementById("cond-total");
  const infoField = document.getElementById("cond-info");
  const divider = document.getElementById("cond-divider");
  const previsaoContainer = document.getElementById("cond-previsao-container");

  if (!resultBtn) return;

  resultBtn.addEventListener("click", () => {
    const valor = totalField.value.replace(/[^\d,.-]/g, "").replace(",", ".");
    const info = infoField.textContent.trim();
    if (!valor || isNaN(parseFloat(valor))) {
      alert("Nenhum resultado de condomínio para adicionar.");
      return;
    }

    divider.style.display = "block";
    previsaoContainer.innerHTML += `
      <p class="text-muted mb-1">- ${info} <b>${parseFloat(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</b> <br /></p>
    `;
    calculateTotalCondominio();
  });
}

function calculateTotalCondominio() {
  const list = document.getElementById("cond-list");
  const previsaoContainer = document.getElementById("cond-previsao-container");
  const totalDivider = document.getElementById("cond-total-divider");
  const somaContainer = document.getElementById("cond-soma-container");

  let soma = 0;
  list.querySelectorAll("li span").forEach(span => {
    const match = span.textContent.match(/R\$\s*([\d.,]+)/);
    if (match) soma += parseFloat(match[1].replace(/\./g, "").replace(",", "."));
  });

  const previsaoMatch = previsaoContainer.textContent.match(/R\$\s*([\d.,]+)/);
  if (previsaoMatch) soma += parseFloat(previsaoMatch[1].replace(/\./g, "").replace(",", "."));

  if (soma > 0) {
    totalDivider.style.display = "block";
    somaContainer.textContent = `Soma total: ${soma.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`;
  } else {
    totalDivider.style.display = "none";
    somaContainer.textContent = "";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  setupAddLineCondominio();
  setupAddResultCondominio();
});

// 🧼 Clear Condomínio inputs after adding the result
function clearCondInputs() {
  const fields = [
    "cond-ultimo",
    "cond-delivery",
    "cond-valor",
    "cond-total",
    "cond-info"
  ];

  fields.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      if (el.tagName === "INPUT") el.value = "";
      else el.textContent = "";
    }
  });
}

// 🧭 Attach to button click
document.addEventListener("DOMContentLoaded", () => {
  const addBtn = document.getElementById("cond-add-result");
  if (!addBtn) return;

  addBtn.addEventListener("click", () => {
    // ⚡ After previsao logic is executed
    clearCondInputs();
  });
});