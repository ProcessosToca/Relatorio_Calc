// taxasExtras.js — DOM-first, no desync with localStorage
document.addEventListener("DOMContentLoaded", () => {
  const entryForm   = document.getElementById("entryForm");
  const titleInput  = document.getElementById("title");
  const dateInput   = document.getElementById("date");
  const valueInput  = document.getElementById("value");

  const entriesList = document.getElementById("entriesList");
  const totalSpan   = document.getElementById("total");
  const refreshBtn  = document.getElementById("refreshBtn");
  const clearBtn    = document.getElementById("clearBtn");

  // ---------- Helpers ----------
  const formatCurrencyBRL = (n) =>
    Number(n).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const parseNumberBR = (raw) =>
    Number(String(raw ?? "").replace(/\./g, "").replace(",", "."));

  const formatDateBRFromISO = (iso) => {
    if (!iso) return "";
    const [y, m, d] = iso.split("-");
    return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
  };

  // Read all current items in DOM -> array of strings "Title — dd/mm/yyyy — R$ X"
  function readDomItems() {
    return Array.from(entriesList.querySelectorAll("li span")).map(el => el.textContent);
  }

  // Recalculate total from DOM (reads currency from the strings)
  function recalcTotalFromDOM() {
    const items = readDomItems();
    let sum = 0;
    for (const text of items) {
      const m = text.match(/R\$\s*([\d.,]+)/);
      if (m) sum += Number(m[1].replace(/\./g, "").replace(",", "."));
    }
    totalSpan.textContent = formatCurrencyBRL(sum);
  }

  // Persist current DOM list + total to localStorage
  function saveDomToLocalStorage() {
    const saved = localStorage.getItem("relatorioData");
    const data = saved ? JSON.parse(saved) : {};
    data.taxas = {
      list: readDomItems(),
      total: totalSpan.textContent || "R$ 0,00",
    };
    localStorage.setItem("relatorioData", JSON.stringify(data));
  }

  // Build one <li> with delete button
  function makeListItem(text) {
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";

    const span = document.createElement("span");
    span.textContent = text;

    const delBtn = document.createElement("button");
    delBtn.className = "btn btn-sm btn-danger delete-btn";
    delBtn.textContent = "Excluir";
    delBtn.addEventListener("click", () => {
      li.remove();
      recalcTotalFromDOM();
      saveDomToLocalStorage();
    });

    li.appendChild(span);
    li.appendChild(delBtn);
    return li;
  }

  // Render list fresh from localStorage (used on initial load or manual refresh)
  function renderFromStorageOnce() {
    const saved = localStorage.getItem("relatorioData");
    if (!saved) {
      // nothing saved yet: ensure clean state
      entriesList.innerHTML = "";
      totalSpan.textContent = "R$ 0,00";
      return;
    }
    try {
      const data = JSON.parse(saved);
      const list = data?.taxas?.list ?? [];
      entriesList.innerHTML = "";
      list.forEach(text => entriesList.appendChild(makeListItem(text)));
      // if storage had a total, we can trust it — but also recompute to stay consistent
      recalcTotalFromDOM();
    } catch (e) {
      console.error("Erro ao ler localStorage (taxas):", e);
    }
  }

  // ---------- Events ----------
  entryForm.addEventListener("submit", (ev) => {
    ev.preventDefault();

    const title = titleInput.value.trim() || "Sem título";
    const date  = dateInput.value; // ISO
    const val   = parseNumberBR(valueInput.value);
    if (!date || isNaN(val)) return;

    // Build display string from input values (no array state!)
    const text = `${title} — ${formatDateBRFromISO(date)} — <b style="color: red;"> ${formatCurrencyBRL(val)} </b>`;

    // Append to DOM
    entriesList.appendChild(makeListItem(text));

    // Reset form
    titleInput.value = "";
    dateInput.value  = "";
    valueInput.value = "";

    // Update total + persist
    recalcTotalFromDOM();
    saveDomToLocalStorage();
  });

  refreshBtn.addEventListener("click", () => {
    // Re-render strictly from localStorage (useful after coming back from preview)
    renderFromStorageOnce();
  });

  clearBtn.addEventListener("click", () => {
    entriesList.innerHTML = "";
    recalcTotalFromDOM();
    saveDomToLocalStorage();
  });

  // ---------- Initial: build from storage (does NOT write back) ----------
  renderFromStorageOnce();
});
