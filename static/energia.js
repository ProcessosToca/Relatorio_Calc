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
    // Quando as datas são iguais, conta 1 dia (incluindo o dia inicial)
    const daily = valor / 30;
    const total = daily * 1;
    const valorFormatado = total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    resultField.value = valorFormatado;
    info.textContent = `Previsão referente a 1 dia de energia (Período ${formatDateBR(ultimo)}). ${valorFormatado}`;
    return;
  }

  const diffDays = getDaysDiff(ultimo, delivery);
  const daily = valor / 30;
  const total = daily * diffDays;

  const valorFormatado = total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  resultField.value = valorFormatado;
  info.textContent = `Previsão referente a ${diffDays.toFixed(0)} dia(s) de energia (Período ${formatDateBR(
    ultimo
  )} à ${formatDateBR(delivery)}). ${valorFormatado}`;
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

// Helper para calcular diferença de dias - inclui o dia inicial
function getDaysDiff(date1, date2) {
  if (!date1 || !date2) return 0;
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  if (isNaN(d1) || isNaN(d2)) return 0;
  const diffMs = d2 - d1;
  // Inclui o dia inicial no cálculo
  return Math.abs(Math.ceil(diffMs / (1000 * 60 * 60 * 24))) + 1;
}

// =============== ADICIONAR RESULTADO (Energia) ===============
function setupAddResultEnergia() {
  const btn = document.getElementById("energia-add-result");
  const total = document.getElementById("energia-total");
  const info = document.getElementById("energia-info");
  const div = document.getElementById("energia-divider");
  const box = document.getElementById("energia-previsao-container");

  if (!btn || !total || !info || !box) return;

  btn.addEventListener("click", () => {
    const raw = (total.value || total.textContent || "");
    const num = parseFloat(raw.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", "."));
    const text = (info.textContent || "").trim();

    if (!isFinite(num) || num <= 0 || !text) {
      alert("Nenhum resultado de energia para adicionar.");
      return;
    }

    if (div) div.style.display = "block";

    // ✅ append one previsão per line
    box.insertAdjacentHTML(
      "beforeend",
      `<p class="text-muted mb-1">- ${text}<br></p>`
    );

    calculateTotalEnergia();
    clearEnergiaInputs(); // clear after adding (same as IPTU logic)
  });
}

// =============== CALCULAR SOMA TOTAL (Energia) ===============
function calculateTotalEnergia() {
  const list = document.getElementById("energia-list");
  const box = document.getElementById("energia-previsao-container");
  const tDiv = document.getElementById("energia-total-divider");
  const tOut = document.getElementById("energia-soma-container");

  let soma = 0;

  // 1️⃣ Somar todos os itens da lista manual
  if (list) {
    list.querySelectorAll("li span").forEach(span => {
      const matches = span.textContent.matchAll(/R\$\s*([\d.,]+)/g);
      for (const m of matches) soma += parseFloat(m[1].replace(/\./g, "").replace(",", "."));
    });
  }

  // 2️⃣ Somar todas as previsões (múltiplas linhas)
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
    leftText.textContent = `${count}. ${desc} ${formatDateBR(date)}. ${brl}`;

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

  // Atualiza modal Energia ao abrir
  const modal = document.getElementById("energiaModal");
  if (modal) {
    modal.addEventListener("show.bs.modal", updateEnergiaModal);
  }
});


// 🧼 Clear Energia inputs after adding the result
function clearEnergiaInputs() {
  const fields = [
    "energia-ultimo",
    "energia-delivery",
    "energia-valor",
    "energia-total",
    "energia-info"
  ];

  fields.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      if (el.tagName === "INPUT") el.value = "";
      else el.textContent = "";
    }
  });
}

// 🧭 Attach to button click (AFTER your add result logic)
document.addEventListener("DOMContentLoaded", () => {
  const addBtn = document.getElementById("energia-add-result");
  if (!addBtn) return;

  addBtn.addEventListener("click", () => {
    // ✅ First run your existing logic (which adds previsao)
    // 👇 If it's already added above, just append this after
    clearEnergiaInputs();
  });
});

// === Modal: passos simples da Energia ===
function updateEnergiaModal() {
  const ultimo = document.getElementById("energia-ultimo")?.value;
  const delivery = document.getElementById("delivery-date")?.value;
  const valor = parseFloat(document.getElementById("energia-valor")?.value || 0);

  const ctx = document.getElementById("energia-contexto");
  const box = document.getElementById("energia-steps");
  const out = document.getElementById("energia-resultado");
  if (!ctx || !box || !out) return;

  if (!ultimo || !delivery || !valor) {
    ctx.textContent = "Preencha 'Último Pagamento', 'Data de Entrega' e 'Valor da Energia'.";
    box.innerHTML = "";
    out.textContent = "";
    return;
  }

  const diffDays = getDaysDiff(ultimo, delivery);
  const daily = valor / 30;
  const total = daily * diffDays;

  ctx.textContent = `Período considerado: ${formatDateBR(ultimo)} até ${formatDateBR(delivery)}.`;

  const steps = [];
  steps.push(`
    <div class="mb-3 p-3 border rounded bg-light">
      <h6 class="text-primary mb-2">Passo 1: Valor por dia</h6>
      <p class="mb-1"><strong>Energia mensal ÷ 30 = R$ ${daily.toFixed(2)}</strong></p>
      <small class="text-muted">(R$ ${valor.toFixed(2)} ÷ 30)</small>
    </div>
  `);
  steps.push(`
    <div class="mb-3 p-3 border rounded bg-light">
      <h6 class="text-primary mb-2">Passo 2: Quantidade de dias</h6>
      <p class="mb-1"><strong>${diffDays} dia(s)</strong></p>
      <small class="text-muted">Entre ${formatDateBR(ultimo)} e ${formatDateBR(delivery)}</small>
    </div>
  `);
  steps.push(`
    <div class="mb-3 p-3 border rounded bg-success text-white">
      <h6 class="mb-2">Passo 3: Resultado</h6>
      <p class="mb-1"><strong>R$ ${daily.toFixed(2)} × ${diffDays} = R$ ${total.toFixed(2)}</strong></p>
      <small>Este é o valor proporcional de energia</small>
    </div>
  `);

  box.innerHTML = steps.join("");
  out.textContent = `Resultado: ${total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`;
}
