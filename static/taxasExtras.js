document.addEventListener("DOMContentLoaded", () => {
  const entryForm   = document.getElementById("entryForm");
  const titleInput  = document.getElementById("title");
  const dateInput   = document.getElementById("date");
  const valueInput  = document.getElementById("value");

  const entriesList = document.getElementById("entriesList");
  const totalSpan   = document.getElementById("total");
  const refreshBtn  = document.getElementById("refreshBtn");
  const clearBtn    = document.getElementById("clearBtn");

  // In-memory entries
  let entries = [];

  // ---------- Helpers ----------
  function formatCurrencyBRL(n) {
    const num = Number(n);
    return isNaN(num)
      ? "R$ 0,00"
      : num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  function parseNumberBR(raw) {
    if (raw == null) return NaN;
    // accept "240,45" or "240.45"
    return Number(String(raw).replace(/\./g, "").replace(",", "."));
  }

  function formatDateBRFromISO(iso) {
    if (!iso) return "";
    const [y, m, d] = iso.split("-");
    if (!y || !m || !d) return "";
    return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
  }

  function recalcTotal() {
    const sum = entries.reduce((acc, e) => acc + Number(e.value || 0), 0);
    totalSpan.textContent = formatCurrencyBRL(sum);
  }

  function renderEntries() {
    entriesList.innerHTML = "";
    entries.forEach((e, index) => {
      const li = document.createElement("li");
      li.className = "list-group-item d-flex justify-content-between align-items-center";

      // Title — Date — Value
      const left = document.createElement("span");
      const title = e.title?.trim() ? e.title.trim() : "Sem título";
      left.textContent = `${title} — ${formatDateBRFromISO(e.date)} — ${formatCurrencyBRL(e.value)}`;

      const delBtn = document.createElement("button");
      delBtn.className = "btn btn-sm btn-danger delete-btn";
      delBtn.textContent = "Delete";
      delBtn.addEventListener("click", () => {
        entries.splice(index, 1);
        renderEntries();
        recalcTotal();
      });

      li.appendChild(left);
      li.appendChild(delBtn);
      entriesList.appendChild(li);
    });

    recalcTotal();
  }

  // ---------- Events ----------
  entryForm.addEventListener("submit", (ev) => {
    ev.preventDefault();

    const title = titleInput.value.trim();
    const date  = dateInput.value; // ISO yyyy-mm-dd
    const val   = parseNumberBR(valueInput.value);

    if (!date || isNaN(val)) {
      // HTML "required" handles most cases; this is a safety net.
      return;
    }

    entries.push({ title, date, value: val });

    // reset inputs
    titleInput.value = "";
    dateInput.value  = "";
    valueInput.value = "";

    renderEntries();
  });

  refreshBtn.addEventListener("click", () => {
    // Re-renders and recomputes total (useful if you ever mutate entries programmatically)
    renderEntries();
  });

  clearBtn.addEventListener("click", () => {
    entries = [];
    renderEntries();
  });

  // Initial
  renderEntries();
});
