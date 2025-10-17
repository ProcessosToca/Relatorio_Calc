// ===== Água =====
function calculateAgua() {
  const ultimo = document.getElementById("agua-ultimo")?.value;
  const delivery = document.getElementById("delivery-date")?.value;
  const valor = parseFloat(document.getElementById("agua-valor")?.value || 0);
  const resultField = document.getElementById("agua-total");
  const info = document.getElementById("agua-info");

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
  info.textContent = `Previsão referente a ${diffDays.toFixed(0)} dia(s) de água (Período ${formatDateBR(
    ultimo
  )} à ${formatDateBR(delivery)}).`;
}

// Helper format
function formatDateBR(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d)) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

// ===== Manual Items =====
function setupAddLineAgua() {
  const addBtn = document.getElementById("agua-add-btn");
  const descInput = document.getElementById("agua-desc");
  const dateInput = document.getElementById("agua-date");
  const valueInput = document.getElementById("agua-value");
  const list = document.getElementById("agua-list");

  if (!addBtn || !descInput || !dateInput || !valueInput || !list) return;

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
      calculateTotalAgua();
    });

    list.appendChild(li);
    count++;
    descInput.value = "";
    dateInput.value = "";
    valueInput.value = "";
    addBtn.disabled = true;
    calculateTotalAgua();

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

// ===== Adicionar Resultado =====
function setupAddResultAgua() {
  const resultBtn = document.getElementById("agua-add-result");
  const aguaTotal = document.getElementById("agua-total");
  const aguaInfo = document.getElementById("agua-info");
  const divider = document.getElementById("agua-divider");
  const previsaoContainer = document.getElementById("agua-previsao-container");

  if (!resultBtn) return;

  resultBtn.addEventListener("click", () => {
    const valor = aguaTotal.value.replace(/[^\d,.-]/g, "").replace(",", ".");
    const info = aguaInfo.textContent.trim();
    if (!valor || isNaN(parseFloat(valor))) {
      alert("Nenhum resultado de água para adicionar.");
      return;
    }

    divider.style.display = "block";
    previsaoContainer.innerHTML = `
      <p class="text-muted mb-1">- ${info}</p>
      <p class="fw-bold">${parseFloat(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
    `;
    calculateTotalAgua();
  });
}

// ===== Soma Total =====
function calculateTotalAgua() {
  const list = document.getElementById("agua-list");
  const previsaoContainer = document.getElementById("agua-previsao-container");
  const totalDivider = document.getElementById("agua-total-divider");
  const somaContainer = document.getElementById("agua-soma-container");

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
  setupAddLineAgua();
  setupAddResultAgua();
});