// ===== Água =====
function calculateAgua() {
  updateSharedDates();
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
    info.textContent = "Sem diferença de dias entre a entrega e o aviso.";
    return;
  }

  const diffDays = getDaysDiff(ultimo, delivery);
  const daily = valor / 30;
  const total = daily * diffDays;

  resultField.value = total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  info.textContent = `Diferença de ${diffDays.toFixed(0)} dia(s) × R$ ${daily.toFixed(2)} por dia.`;
}

// Always format date as dd/mm/yyyy for display
function formatDateBR(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d)) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

// ✅ New function: Enable button only when fields are filled
function setupAddLine(section) {
  const addBtn = document.getElementById(`${section}-add-btn`);
  const descInput = document.getElementById(`${section}-desc`);
  const dateInput = document.getElementById(`${section}-date`);
  const valueInput = document.getElementById(`${section}-value`);
  const list = document.getElementById(`${section}-list`);

  if (!addBtn || !descInput || !dateInput || !valueInput || !list) return;

  addBtn.disabled = true; // button starts disabled
  let count = 1;

  // 🧠 Enable button only when all fields are filled
  [descInput, dateInput, valueInput].forEach(input => {
    input.addEventListener("input", () => {
      if (descInput.value.trim() && dateInput.value && valueInput.value.trim()) {
        addBtn.disabled = false;
      } else {
        addBtn.disabled = true;
      }
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
    });

    li.appendChild(leftText);
    li.appendChild(del);
    list.appendChild(li);

    count++;
    descInput.value = "";
    dateInput.value = "";
    valueInput.value = "";
    addBtn.disabled = true; // disable button again after adding

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

// Init for Energia, Água, Condomínio
document.addEventListener("DOMContentLoaded", () => {
  ["agua"].forEach(setupAddLine);
});