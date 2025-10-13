document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("entryForm");
    const entriesList = document.getElementById("entriesList");
    const totalEl = document.getElementById("total");
    const refreshBtn = document.getElementById("refreshBtn");
    const clearBtn = document.getElementById("clearBtn");

    async function renderEntries(entries, total) {
        entriesList.innerHTML = "";
        entries.forEach(e => {
            const li = document.createElement("li");
            li.className = "list-group-item d-flex justify-content-between align-items-center";
            li.innerHTML = `
                ${e.date} — ${e.value}
                <button class="btn btn-sm btn-danger delete-btn" data-id="${e.id}">Delete</button>
            `;
            entriesList.appendChild(li);
        });
        totalEl.textContent = total;
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const date = document.getElementById("date").value;
        const value = document.getElementById("value").value;
        if (!date || !value) return alert("Please fill all fields");

        const res = await fetch("/add-entry", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ date, value })
        });
        const data = await res.json();
        if (data.success) {
            renderEntries(data.entries, data.total);
            form.reset();
        } else {
            alert(data.error || "Error adding entry");
        }
    });

    entriesList.addEventListener("click", async (e) => {
        if (e.target.classList.contains("delete-btn")) {
            const id = e.target.getAttribute("data-id");
            const res = await fetch(`/delete-entry/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                renderEntries(data.entries, data.total);
            } else {
                alert("Error deleting entry");
            }
        }
    });

    refreshBtn.addEventListener("click", async () => {
        const res = await fetch("/calculate");
        const data = await res.json();
        totalEl.textContent = data.total;
    });

    clearBtn.addEventListener("click", async () => {
        if (!confirm("Clear all entries?")) return;
        const res = await fetch("/clear", { method: "POST" });
        const data = await res.json();
        if (data.success) {
            renderEntries([], 0);
        }
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
