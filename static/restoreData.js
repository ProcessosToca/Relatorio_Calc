// restoreData.js — unified, conflict-free restore of inputs, lists, previsões, and totals
document.addEventListener("DOMContentLoaded", () => {
    const saved = localStorage.getItem("relatorioData");
    if (!saved) return;
    const data = JSON.parse(saved);

    // ---------- helpers ----------
    const exists = (id) => document.getElementById(id);
    const setVal = (id, val = "") => { const el = exists(id); if (el) el.value = val; };
    const setText = (id, val = "") => { const el = exists(id); if (el) el.textContent = val; };

    function rebuildList(section, items) {
        const list = exists(`${section}-list`);
        if (!list) return;
        list.innerHTML = "";
        (items || []).forEach(text => {
            const li = document.createElement("li");
            li.className = "list-group-item d-flex justify-content-between align-items-center";
            const span = document.createElement("span");
            span.textContent = text;
            const del = document.createElement("button");
            del.className = "btn btn-sm btn-outline-danger ms-3";
            del.textContent = "❌";
            del.addEventListener("click", () => {
                li.remove();
                recalcSectionTotal(section);
            });
            li.appendChild(span);
            li.appendChild(del);
            list.appendChild(li);
        });
    }

    function recalcSectionTotal(section) {
        const list = exists(`${section}-list`);
        const previsao = exists(`${section}-previsao-container`);
        const somaContainer = exists(`${section}-soma-container`);
        const totalDivider = exists(`${section}-total-divider`);
        if (!list || !somaContainer) return;

        let soma = 0;
        list.querySelectorAll("li span").forEach(span => {
            const m = span.textContent.match(/R\$\s*([\d.,]+)/);
            if (m) soma += parseFloat(m[1].replace(/\./g, "").replace(",", "."));
        });

        if (previsao) {
            const pm = previsao.textContent.match(/R\$\s*([\d.,]+)/);
            if (pm) soma += parseFloat(pm[1].replace(/\./g, "").replace(",", "."));
        }

        if (soma > 0) {
            if (totalDivider) totalDivider.style.display = "block";
            somaContainer.textContent = `Soma total: ${soma.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`;
        } else {
            if (totalDivider) totalDivider.style.display = "none";
            somaContainer.textContent = "";
        }
    }

    function recalcTaxasTotal() {
        const list = exists("entriesList");
        const totalSpan = exists("total");
        if (!list || !totalSpan) return;

        let soma = 0;
        list.querySelectorAll("li span").forEach(span => {
            const m = span.textContent.match(/R\$\s*([\d.,]+)/);
            if (m) soma += parseFloat(m[1].replace(/\./g, "").replace(",", "."));
        });
        totalSpan.textContent = soma.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    }

    // Safely call a calc function if it exists (won’t throw if missing)
    function tryCalc(name) {
        if (typeof window[name] === "function") {
            try { window[name](); } catch (e) { }
        }
    }

    // === Restore Informações do Contrato ===
    if (data.contractInfo) {
        document.getElementById("address-info").value = data.contractInfo.address || "";
        document.getElementById("tenant-name").value = data.contractInfo.tenantName || "";
        document.getElementById("contract-number").value = data.contractInfo.contractNumber || "";
        document.getElementById("rent-value").value = data.contractInfo.rentValue || "";
        document.getElementById("last-rent").value = data.contractInfo.lastRent || "";
        document.getElementById("delivery-date").value = data.contractInfo.deliveryDate || "";
        document.getElementById("notice-date").value = data.contractInfo.noticeDate || "";
        document.getElementById("final-notice").value = data.contractInfo.finalNotice || "";
    }


    // ---------- Acerto de Dias ----------
    if (data.acerto) {
        setText("acerto-info", data.acerto.info);
        // Your project used "acerto-total" in restore; keep it:
        setVal("acerto-total", data.acerto.valor);
        if (data.acerto.inputs) {
            setVal("acertoDias-ultimo-display", data.acerto.inputs.lastRent);
            setVal("final-notice-display", data.acerto.inputs.noticeDate);
            setVal("delivery-date-display", data.acerto.inputs.deliveryDate);
            setVal("rent-value-display", data.acerto.inputs.rentValue);
            // Try to recalc if function exists in your codebase
            tryCalc("calculateAcertoDias");
            tryCalc("calculateAcerto"); // in case this is your function name
        }
    }

    // ---------- IPTU ----------
    if (data.iptu) {
        setText("iptu-info", data.iptu.info);
        setVal("iptu-total", data.iptu.valor);
        if (data.iptu.inputs) {
            setVal("iptu-ultimo", data.iptu.inputs.ultimo);
            // iptu-delivery is readonly text (dd/mm/yyyy) in many builds; set as saved:
            const iptuDeliveryEl = exists("iptu-delivery");
            if (iptuDeliveryEl) iptuDeliveryEl.value = data.iptu.inputs.delivery || "";
            setVal("iptu-valor", data.iptu.inputs.valor);
            tryCalc("calculateIptu");
        }
    }

    // ---------- Multa ----------
    if (data.multa) {
        setText("multa-contratual-info", data.multa.info);
        setVal("multa-contratual", data.multa.valor);
        if (data.multa.inputs) {
            setVal("finish-date", data.multa.inputs.finishDate);
            setVal("contract-time", data.multa.inputs.contractTime);
            setVal("delivery-date-multa", data.multa.inputs.delivery);
            setVal("rent-value-multa", data.multa.inputs.rentValue);
            tryCalc("calculateMulta");
        }
    }

    // ---------- Energia ----------
    if (data.energia) {
        if (data.energia.inputs) {
            setVal("energia-ultimo", data.energia.inputs.ultimo);
            // energia-delivery is a readonly text field showing dd/mm/yyyy in many builds
            const ed = exists("energia-delivery");
            if (ed) ed.value = data.energia.inputs.delivery || ed.value;
            setVal("energia-valor", data.energia.inputs.valor);
            tryCalc("calculateEnergia");
        }
        rebuildList("energia", data.energia.list);
        const energiaPrev = exists("energia-previsao-container");
        const energiaDivider = exists("energia-divider");
        if (energiaPrev) {
            energiaPrev.textContent = data.energia.previsao || "";
            if (energiaDivider) energiaDivider.style.display = data.energia.previsao ? "block" : "none";
        }
        // If you store a formatted "Soma total:" in data.energia.total, we recalc to keep consistent with list+previsão
        recalcSectionTotal("energia");
    }

    // ---------- Água ----------
    if (data.agua) {
        if (data.agua.inputs) {
            setVal("agua-ultimo", data.agua.inputs.ultimo);
            const ad = exists("agua-delivery");
            if (ad) ad.value = data.agua.inputs.delivery || ad.value;
            setVal("agua-valor", data.agua.inputs.valor);
            tryCalc("calculateAgua");
        }
        rebuildList("agua", data.agua.list);
        const aguaPrev = exists("agua-previsao-container");
        const aguaDivider = exists("agua-divider");
        if (aguaPrev) {
            aguaPrev.textContent = data.agua.previsao || "";
            if (aguaDivider) aguaDivider.style.display = data.agua.previsao ? "block" : "none";
        }
        recalcSectionTotal("agua");
    }

    // ---------- Condomínio ----------
    if (data.condominio) {
        if (data.condominio.inputs) {
            setVal("cond-ultimo", data.condominio.inputs.ultimo);
            const cd = exists("cond-delivery");
            if (cd) cd.value = data.condominio.inputs.delivery || cd.value;
            setVal("cond-valor", data.condominio.inputs.valor);
            tryCalc("calculateCondominio");
        }
        rebuildList("cond", data.condominio.list);
        const condPrev = exists("cond-previsao-container");
        const condDivider = exists("cond-divider");
        if (condPrev) {
            condPrev.textContent = data.condominio.previsao || "";
            if (condDivider) condDivider.style.display = data.condominio.previsao ? "block" : "none";
        }
        recalcSectionTotal("cond");
    }

    // ---------- Taxas Extras (Entries) ----------
    if (data.taxas) {
        const entriesList = exists("entriesList");
        if (entriesList) {
            entriesList.innerHTML = "";
            (data.taxas.list || []).forEach(text => {
                const li = document.createElement("li");
                li.className = "list-group-item d-flex justify-content-between align-items-center";
                const span = document.createElement("span");
                span.textContent = text;

                const delBtn = document.createElement("button");
                delBtn.className = "btn btn-sm btn-danger";
                delBtn.textContent = "Delete";
                delBtn.addEventListener("click", () => {
                    li.remove();
                    recalcTaxasTotal();
                });

                li.appendChild(span);
                li.appendChild(delBtn);
                entriesList.appendChild(li);
            });
        }
        const total = exists("total");
        if (total) {
            // Recalculate from list to ensure consistency
            recalcTaxasTotal();
        }
    }
});


function formatCurrencyBRL(value) {
  if (isNaN(value) || value === null) return "";
  return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function parseBRL(str) {
  if (!str) return NaN;
  const cleaned = String(str).replace(/\s/g, "").replace(/R\$/i, "").replace(/\./g, "").replace(",", ".");
  return cleaned === "" ? NaN : Number(cleaned);
}

function formatDateBR(dateStr) {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
}