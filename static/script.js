document.addEventListener("DOMContentLoaded", () => {
  const entryForm = document.getElementById("entryForm");
  const entriesList = document.getElementById("entriesList");
  const totalSpan = document.getElementById("total");
  const refreshBtn = document.getElementById("refreshBtn");
  const clearBtn = document.getElementById("clearBtn");

  let entries = [];

  function formatCurrency(value) {
    return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  function formatDate(dateStr) {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  }

  function renderEntries() {
    entriesList.innerHTML = "";
    let total = 0;

    entries.forEach((e, index) => {
      total += parseFloat(e.value);

      const li = document.createElement("li");
      li.className = "list-group-item d-flex justify-content-between align-items-center";

      // ✅ Title — Date — Value
      li.innerHTML = `
        <span><strong>${e.title || "Sem título"}</strong> — ${formatDate(e.date)} — ${formatCurrency(e.value)}</span>
        <button class="btn btn-sm btn-danger delete-btn" data-index="${index}">Delete</button>
      `;

      entriesList.appendChild(li);
    });

    totalSpan.textContent = formatCurrency(total);
  }

  entryForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const title = document.getElementById("title").value.trim();
    const date = document.getElementById("date").value;
    const value = document.getElementById("value").value;

    if (!date || !value) return;

    entries.push({ title, date, value });
    renderEntries();

    // Clear fields
    document.getElementById("title").value = "";
    document.getElementById("date").value = "";
    document.getElementById("value").value = "";
  });

  entriesList.addEventListener("click", (e) => {
    if (e.target.classList.contains("delete-btn")) {
      const index = e.target.getAttribute("data-index");
      entries.splice(index, 1);
      renderEntries();
    }
  });

  refreshBtn.addEventListener("click", renderEntries);

  clearBtn.addEventListener("click", () => {
    entries = [];
    renderEntries();
  });
});

async function renderEntries(entries, total) {
    entriesList.innerHTML = "";
    entries.forEach(e => {
        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between align-items-center";
        li.innerHTML = `
            ${e.date} — R$ ${e.value.toFixed(2)}
            <button class="btn btn-sm btn-danger delete-btn" data-id="${e.id}">Delete</button>
        `;
        entriesList.appendChild(li);
    });
    totalEl.textContent = "R$ " + total.toFixed(2);
}


function formatDateBR(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d)) return "";
  const dd = String(d.getDate() + 1).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

// Attach listeners
[
  "delivery-date", "final-notice",
  "energia-ultimo", "energia-valor",
  "agua-ultimo", "agua-valor",
  "cond-ultimo", "cond-valor"
].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener("input", () => {
    calculateEnergia();
    calculateAgua();
    calculateCondominio();
  });
});
