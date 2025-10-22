// ======================
// IPTU Section (final)

// ---- Helpers ----
function formatDateBR(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d)) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}
function parseBRL(s) {
  if (!s) return NaN;
  return Number(String(s).replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", "."));
}
function getDaysDiff(isoStart, isoEnd) {
  if (!isoStart || !isoEnd) return 0;
  const d1 = new Date(isoStart);
  const d2 = new Date(isoEnd);
  if (isNaN(d1) || isNaN(d2)) return 0;
  const diffMs = d2 - d1;
  return Math.abs(Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

// ---- Calc ----
function calculateIptu() {
  const ultimoISO   = document.getElementById("iptu-ultimo")?.value || "";
  const deliveryISO = document.getElementById("delivery-date")?.value || ""; // global header field
  const valor       = parseFloat(document.getElementById("iptu-value-input")?.value || 0);

  const resultField = document.getElementById("iptu-total");
  const info        = document.getElementById("iptu-info");

  // mirror delivery into the read-only field for visual context
  const iptuDelivery = document.getElementById("iptu-delivery");
  if (iptuDelivery) iptuDelivery.value = formatDateBR(deliveryISO);

  if (!ultimoISO || !deliveryISO || !valor) {
    if (resultField) resultField.value = "";
    if (info)        info.textContent = "";
    return;
  }

  if (ultimoISO === deliveryISO) {
    resultField.value = "R$ 0,00";
    info.textContent  = "Sem diferença de dias.";
    return;
  }

  const diffDays = getDaysDiff(ultimoISO, deliveryISO);
  const daily    = valor / 30;
  const total    = daily * diffDays;

  resultField.value = total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  info.textContent  = `Previsão referente a ${diffDays} dia(s) de IPTU (Período ${formatDateBR(ultimoISO)} à ${formatDateBR(deliveryISO)}).`;
}

// ---- Add manual items to list ----
function setupAddLineIptu() {
  const addBtn     = document.getElementById("iptu-add-btn");
  const descInput  = document.getElementById("iptu-desc");
  const dateInput  = document.getElementById("iptu-date");
  const valueInput = document.getElementById("iptu-value");
  const list       = document.getElementById("iptu-list");

  if (!addBtn || !descInput || !dateInput || !valueInput || !list) return;

  addBtn.disabled = true;
  let count = list.querySelectorAll("li").length + 1;

  [descInput, dateInput, valueInput].forEach(el => {
    el.addEventListener("input", () => {
      addBtn.disabled = !(descInput.value.trim() && dateInput.value && valueInput.value.trim());
    });
  });

  addBtn.addEventListener("click", () => {
    const date = dateInput.value;
    const val  = Number((valueInput.value || "").replace(",", "."));
    const li   = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";

    const span = document.createElement("span");
    span.textContent = `${count}. Vencimento ${formatDateBR(date)}. ${val.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}`;

    const del = document.createElement("button");
    del.className = "btn btn-sm btn-outline-danger ms-3";
    del.textContent = "❌";
    del.addEventListener("click", () => {
      li.remove();
      renumber();
      calculateTotalIptu();
    });

    li.appendChild(span);
    li.appendChild(del);
    list.appendChild(li);

    count++;
    descInput.value = "";
    dateInput.value = "";
    valueInput.value = "";
    addBtn.disabled = true;

    calculateTotalIptu();

    function renumber() {
      const items = list.querySelectorAll("li span");
      items.forEach((s, idx) => {
        const rest = s.textContent.replace(/^\d+\.\s*/, "");
        s.textContent = `${idx + 1}. ${rest}`;
      });
      count = items.length + 1;
    }
  });
}

// ---- Add calc result to preview block ----
function setupAddResultIptu() {
  const btn   = document.getElementById("iptu-add-result");
  const total = document.getElementById("iptu-total");
  const info  = document.getElementById("iptu-info");
  const div   = document.getElementById("iptu-divider");
  const box   = document.getElementById("iptu-previsao-container");

  if (!btn || !total || !info || !box) return;

  btn.addEventListener("click", () => {
    const raw  = (total.value || total.textContent || "");
    const num  = parseBRL(raw);
    const text = (info.textContent || "").trim();

    if (!isFinite(num) || num <= 0 || !text) {
      alert("Nenhum resultado de IPTU para adicionar.");
      return;
    }

    if (div) div.style.display = "block";

    // append one line, keep each on its own line
    box.insertAdjacentHTML(
      "beforeend",
      `<p class="text-muted mb-1">- ${text} <b>${num.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}</b><br></p>`
    );

    calculateTotalIptu();
    clearIptuInputs(); // clear after adding
  });
}

// ---- Sum list + all previsões ----
function calculateTotalIptu() {
  const list   = document.getElementById("iptu-list");
  const box    = document.getElementById("iptu-previsao-container");
  const tDiv   = document.getElementById("iptu-total-divider");
  const tOut   = document.getElementById("iptu-soma-container");

  let soma = 0;

  if (list) {
    list.querySelectorAll("li span").forEach(span => {
      const m = span.textContent.match(/R\$\s*([\d.,]+)/);
      if (m) soma += parseFloat(m[1].replace(/\./g,"").replace(",","."));
    });
  }

  if (box) {
    const matches = box.innerText.matchAll(/R\$\s*([\d.,]+)/g);
    for (const m of matches) soma += parseFloat(m[1].replace(/\./g,"").replace(",","."));
  }

  if (tOut) {
    if (soma > 0) {
      if (tDiv) tDiv.style.display = "block";
      tOut.textContent = `Soma total: ${soma.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}`;
    } else {
      if (tDiv) tDiv.style.display = "none";
      tOut.textContent = "";
    }
  }
}

// ---- Clear inputs after adding previsao ----
function clearIptuInputs() {
  [["iptu-ultimo","value"],["iptu-delivery","value"],["iptu-value-input","value"],["iptu-total","value"],["iptu-info","text"]]
    .forEach(([id,kind]) => {
      const el = document.getElementById(id);
      if (!el) return;
      if (kind === "value" && "value" in el) el.value = "";
      else el.textContent = "";
    });
}

// ---- Boot ----
document.addEventListener("DOMContentLoaded", () => {
  // compute whenever inputs change
  ["iptu-ultimo","iptu-value-input","delivery-date"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", calculateIptu);
  });

  // initial mirror + calc (if values already present from restore)
  calculateIptu();

  setupAddLineIptu();
  setupAddResultIptu();
});

