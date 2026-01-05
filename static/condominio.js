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
    // Quando as datas são iguais, conta 1 dia (incluindo o dia inicial)
    const daily = valor / 30;
    const total = daily * 1;
    const valorFormatado = total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    resultField.value = valorFormatado;
    info.textContent = `Previsão referente a 1 dia de condomínio (Período ${formatDateBR(ultimo)}). ${valorFormatado}`;
    return;
  }

  const diffDays = getDaysDiff(ultimo, delivery);
  const daily = valor / 30;
  const total = daily * diffDays;

  const valorFormatado = total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  resultField.value = valorFormatado;
  info.textContent = `Previsão referente a ${diffDays.toFixed(0)} dia(s) de condomínio (Período ${formatDateBR(
    ultimo
  )} à ${formatDateBR(delivery)}). ${valorFormatado}`;
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
    const desc = descInput.value.trim();
    const date = dateInput.value;
    const val = Number(valueInput.value.replace(",", "."));

    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";
    li.innerHTML = `
      <span>${count}. ${desc} ${formatDateBR(date)}. ${val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
      <button class="btn btn-sm btn-outline-danger ms-3">❌</button>
    `;

    li.querySelector("button").addEventListener("click", () => {
      li.remove();
      renumber();
      calculateTotalCondominio();
    });

    list.appendChild(li);
    count++;
    descInput.value = "Vencimento";
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

// ===== Adicionar Resultado (Condomínio) =====
function setupAddResultCondominio() {
  const btn   = document.getElementById("cond-add-result");
  const total = document.getElementById("cond-total");
  const info  = document.getElementById("cond-info");
  const div   = document.getElementById("cond-divider");
  const box   = document.getElementById("cond-previsao-container");

  if (!btn || !total || !info || !box) return;

  btn.addEventListener("click", () => {
    const raw  = (total.value || total.textContent || "");
    const num  = parseFloat(raw.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", "."));
    const text = (info.textContent || "").trim();

    if (!isFinite(num) || num <= 0 || !text) {
      alert("Nenhum resultado de condomínio para adicionar.");
      return;
    }

    if (div) div.style.display = "block";

    // Criar elemento <li> igual ao cond-list
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";
    li.innerHTML = `
      <span>- ${text}</span>
      <button class="btn btn-sm btn-outline-danger ms-3">❌</button>
    `;

    // Adicionar event listener ao botão de exclusão
    li.querySelector("button").addEventListener("click", () => {
      li.remove();
      calculateTotalCondominio();
      // Esconder o divider se não houver mais itens
      if (box.children.length === 0 && div) {
        div.style.display = "none";
      }
    });

    box.appendChild(li);

    calculateTotalCondominio();
    clearCondInputs(); // limpa campos após adicionar
  });
}

// ===== Soma Total (Condomínio) =====
function calculateTotalCondominio() {
  const list  = document.getElementById("cond-list");
  const box   = document.getElementById("cond-previsao-container");
  const tDiv  = document.getElementById("cond-total-divider");
  const tOut  = document.getElementById("cond-soma-container");

  let soma = 0;

  // 1️⃣ Somar itens manuais
  if (list) {
    list.querySelectorAll("li span").forEach(span => {
      const matches = span.textContent.matchAll(/R\$\s*([\d.,]+)/g);
      for (const m of matches) soma += parseFloat(m[1].replace(/\./g, "").replace(",", "."));
    });
  }

  // 2️⃣ Somar previsões (agora também é uma lista <ul> com <li>)
  if (box) {
    box.querySelectorAll("li span").forEach(span => {
      const matches = span.textContent.matchAll(/R\$\s*([\d.,]+)/g);
      for (const m of matches) soma += parseFloat(m[1].replace(/\./g, "").replace(",", "."));
    });
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
  setupAddLineCondominio();
  setupAddResultCondominio();
  const modal = document.getElementById("condModal");
  if (modal) modal.addEventListener("show.bs.modal", updateCondominioModal);
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

// === Modal: passos simples do Condomínio ===
function updateCondominioModal() {
  const ultimo = document.getElementById("cond-ultimo")?.value;
  const delivery = document.getElementById("delivery-date")?.value;
  const valor = parseFloat(document.getElementById("cond-valor")?.value || 0);

  const ctx = document.getElementById("cond-contexto");
  const box = document.getElementById("cond-steps");
  const out = document.getElementById("cond-resultado");
  if (!ctx || !box || !out) return;

  if (!ultimo || !delivery || !valor) {
    ctx.textContent = "Preencha 'Último Pagamento', 'Data de Entrega' e 'Valor do Condomínio'.";
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
      <p class="mb-1"><strong>Condomínio mensal ÷ 30 = R$ ${daily.toFixed(2)}</strong></p>
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
      <small>Este é o valor proporcional de condomínio</small>
    </div>
  `);

  box.innerHTML = steps.join("");
  out.textContent = `Resultado: ${total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`;
}