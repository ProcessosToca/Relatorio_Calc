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

// ===== Adicionar Resultado (Água) =====
function setupAddResultAgua() {
  const btn = document.getElementById("agua-add-result");
  const total = document.getElementById("agua-total");
  const info = document.getElementById("agua-info");
  const div = document.getElementById("agua-divider");
  const box = document.getElementById("agua-previsao-container");

  if (!btn || !total || !info || !box) return;

  btn.addEventListener("click", () => {
    const raw = (total.value || total.textContent || "");
    const num = parseFloat(raw.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", "."));
    const text = (info.textContent || "").trim();

    if (!isFinite(num) || num <= 0 || !text) {
      alert("Nenhum resultado de água para adicionar.");
      return;
    }

    if (div) div.style.display = "block";

    box.insertAdjacentHTML(
      "beforeend",
      `<p class="text-muted mb-1">- ${text} <b style="color: red;">${num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</b><br></p>`
    );

    calculateTotalAgua();
    clearAguaInputs(); // limpa os campos após adicionar
  });
}

// ===== Soma Total (Água) =====
function calculateTotalAgua() {
  const list = document.getElementById("agua-list");
  const box = document.getElementById("agua-previsao-container");
  const tDiv = document.getElementById("agua-total-divider");
  const tOut = document.getElementById("agua-soma-container");

  let soma = 0;

  // 1️⃣ Somar itens da lista manual
  if (list) {
    list.querySelectorAll("li span").forEach(span => {
      const matches = span.textContent.matchAll(/R\$\s*([\d.,]+)/g);
      for (const m of matches) soma += parseFloat(m[1].replace(/\./g, "").replace(",", "."));
    });
  }

  // 2️⃣ Somar previsões (várias linhas)
  if (box) {
    const matches = box.innerText.matchAll(/R\$\s*([\d.,]+)/g);
    for (const m of matches) soma += parseFloat(m[1].replace(/\./g, "").replace(",", "."));
  }

  // 3️⃣ Atualizar UI
  if (tOut) {
    if (soma > 0) {
      if (tDiv) tDiv.style.display = "block";
      tOut.textContent = `Soma total: ${soma.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`;
    } else {
      if (tDiv) tDiv.style.display = "none";
      tOut.textContent = "";
    }
  }
}


document.addEventListener("DOMContentLoaded", () => {
  setupAddLineAgua();
  setupAddResultAgua();
});

// 🧼 Clear Água inputs after adding the result
function clearAguaInputs() {
  const fields = [
    "agua-ultimo",
    "agua-delivery",
    "agua-valor",
    "agua-total",
    "agua-info"
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
  const addBtn = document.getElementById("agua-add-result");
  if (!addBtn) return;

  addBtn.addEventListener("click", () => {
    // ⚡ After your previsao logic is executed
    clearAguaInputs();
  });
});
