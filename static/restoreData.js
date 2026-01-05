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
                updateStorageSection(section);
            });
            li.appendChild(span);
            li.appendChild(del);
            list.appendChild(li);
        });
    }

    function recalcSectionTotal(section) {
        const list = document.getElementById(`${section}-list`);
        const previsaoEl = document.getElementById(`${section}-previsao-container`);
        const somaContainer = document.getElementById(`${section}-soma-container`);
        const totalDivider = document.getElementById(`${section}-total-divider`);
        if (!list || !somaContainer) return;

        // helper: sum all “R$ 1.234,56” occurrences inside a string
        const sumAllBRL = (text) => {
            if (!text) return 0;
            let sum = 0;
            const re = /R\$\s*([\d\.,]+)/g;              // global: find ALL money values
            for (const m of text.matchAll(re)) {
                const num = parseFloat(m[1].replace(/\./g, "").replace(",", "."));
                if (!isNaN(num)) sum += num;
            }
            return sum;
        };

        // 1) items manually adicionados (li)
        let soma = 0;
        list.querySelectorAll("li span").forEach(span => {
            const re = /R\$\s*([\d\.,]+)/g;
            for (const m of span.textContent.matchAll(re)) {
                const num = parseFloat(m[1].replace(/\./g, "").replace(",", "."));
                if (!isNaN(num)) soma += num;
            }
        });

        // 2) previsões (agora também é uma lista <ul> com <li>)
        if (previsaoEl) {
            previsaoEl.querySelectorAll("li span").forEach(span => {
                const re = /R\$\s*([\d\.,]+)/g;
                for (const m of span.textContent.matchAll(re)) {
                    const num = parseFloat(m[1].replace(/\./g, "").replace(",", "."));
                    if (!isNaN(num)) soma += num;
                }
            });
        }

        // UI
        if (soma > 0) {
            if (totalDivider) totalDivider.style.display = "block";
            somaContainer.textContent = `Soma total: ${soma.toLocaleString("pt-BR", {
                style: "currency", currency: "BRL"
            })}`;
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

        // 🔁 Update localStorage immediately when recalculating total
        updateStorageTaxas();
    }

    function updateStorageSection(section) {
        const list = exists(`${section}-list`);
        if (!list) return;

        const currentItems = Array.from(list.querySelectorAll("li span")).map(el => el.textContent);
        const previsao = exists(`${section}-previsao-container`)?.innerText.trim() || "";
        const total = exists(`${section}-soma-container`)?.textContent.trim() || "";

        const stored = JSON.parse(localStorage.getItem("relatorioData") || "{}");
        if (currentItems.length > 0 || previsao) {
            stored[section] = {
                list: currentItems,
                previsao,
                total
            };
        } else {
            delete stored[section];
        }
        localStorage.setItem("relatorioData", JSON.stringify(stored));
    }

    // 🔁 Update localStorage when taxas list changes
    function updateStorageTaxas() {
        const list = exists("entriesList");
        const total = exists("total")?.textContent || "";
        const stored = JSON.parse(localStorage.getItem("relatorioData") || "{}");

        if (list && list.children.length > 0) {
            const currentList = Array.from(list.querySelectorAll("li span")).map(el => el.textContent);
            stored.taxas = { list: currentList, total };
        } else {
            delete stored.taxas;
        }
        localStorage.setItem("relatorioData", JSON.stringify(stored));
    }

    function tryCalc(name) {
        if (typeof window[name] === "function") {
            try { window[name](); } catch (e) { }
        }
    }

    // === Restore Informações do Contrato ===
    if (data.contractInfo) {
        setVal("address-info", data.contractInfo.address);
        setVal("tenant-name", data.contractInfo.tenantName);
        setVal("contract-number", data.contractInfo.contractNumber);
        setVal("rent-value", data.contractInfo.rentValue);
        setVal("last-rent", data.contractInfo.lastRent);
        setVal("delivery-date", data.contractInfo.deliveryDate);
        setVal("notice-date", data.contractInfo.noticeDate);
        setVal("final-notice", data.contractInfo.finalNotice);
    }

    // ---------- Acerto de Dias ----------
    if (data.acerto) {
        setText("acerto-info", data.acerto.info);
        setVal("acerto-dias", data.acerto.valor);
        if (data.acerto.inputs) {
            setVal("acertoDias-ultimo-display", data.acerto.inputs.lastRent);
            setVal("final-notice-display", data.acerto.inputs.noticeDate);
            setVal("delivery-date-display", data.acerto.inputs.deliveryDate);
            setVal("rent-value-display", data.acerto.inputs.rentValue);
            tryCalc("calculateAcertoDias");
            tryCalc("calculateAcerto");
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

    // ---------- IPTU ----------
    if (data.iptu) {
        if (data.iptu.inputs) {
            setVal("iptu-ultimo", data.iptu.inputs.ultimo || "");
            const iptuDeliveryEl = exists("iptu-delivery");
            if (iptuDeliveryEl) iptuDeliveryEl.value = data.iptu.inputs.delivery || iptuDeliveryEl.value;
            setVal("iptu-value-input", data.iptu.inputs.valor);
            tryCalc("calculateIptu");
        }

        rebuildList("iptu", data.iptu.list);
        const iptuPrev = exists("iptu-previsao-container");
        const iptuDivider = exists("iptu-divider");

        if (iptuPrev) {
            let previsaoText = data.iptu.previsao || [];
            if (Array.isArray(data.iptu.previsao)) {
                previsaoText = data.iptu.previsao;
            } else if (typeof data.iptu.previsao === "string") {
                previsaoText = data.iptu.previsao
                    .split(/\n+|\s*-\s*/g)
                    .map(s => s.trim())
                    .filter(Boolean);
            }

            // Reconstruir lista de previsão igual ao rebuildList
            iptuPrev.innerHTML = "";
            (previsaoText || []).forEach(text => {
                const li = document.createElement("li");
                li.className = "list-group-item d-flex justify-content-between align-items-center";
                const span = document.createElement("span");
                span.textContent = text;
                const del = document.createElement("button");
                del.className = "btn btn-sm btn-outline-danger ms-3";
                del.textContent = "❌";
                del.addEventListener("click", () => {
                    li.remove();
                    recalcSectionTotal("iptu");
                });
                li.appendChild(span);
                li.appendChild(del);
                iptuPrev.appendChild(li);
            });
            iptuDivider.style.display = previsaoText.length ? "block" : "none";
        }

        recalcSectionTotal("iptu");
    }


    // ---------- Energia ----------
    if (data.energia) {
        if (data.energia.inputs) {
            setVal("energia-ultimo", data.energia.inputs.ultimo || "");
            const ed = exists("energia-delivery");
            if (ed) ed.value = data.energia.inputs.delivery || ed.value;
            setVal("energia-valor", data.energia.inputs.valor);
            tryCalc("calculateEnergia");
        }
        rebuildList("energia", data.energia.list);
        const energiaPrev = exists("energia-previsao-container");
        const energiaDivider = exists("energia-divider");

        if (energiaPrev) {
            let previsaoText = data.energia.previsao || [];
            if (Array.isArray(data.energia.previsao)) {
                previsaoText = data.energia.previsao;
            } else if (typeof data.energia.previsao === "string") {
                previsaoText = data.energia.previsao
                    .split(/\n+|\s*-\s*/g)
                    .map(s => s.trim())
                    .filter(Boolean);
            }

            // Reconstruir lista de previsão igual ao rebuildList
            energiaPrev.innerHTML = "";
            (previsaoText || []).forEach(text => {
                const li = document.createElement("li");
                li.className = "list-group-item d-flex justify-content-between align-items-center";
                const span = document.createElement("span");
                span.textContent = text;
                const del = document.createElement("button");
                del.className = "btn btn-sm btn-outline-danger ms-3";
                del.textContent = "❌";
                del.addEventListener("click", () => {
                    li.remove();
                    recalcSectionTotal("energia");
                });
                li.appendChild(span);
                li.appendChild(del);
                energiaPrev.appendChild(li);
            });
            energiaDivider.style.display = previsaoText.length ? "block" : "none";
        }
        recalcSectionTotal("energia");
    }

    // ---------- Água ----------
    if (data.agua) {
        if (data.agua.inputs) {
            setVal("agua-ultimo", data.agua.inputs.ultimo || "");
            const ad = exists("agua-delivery");
            if (ad) ad.value = data.agua.inputs.delivery || ad.value;
            setVal("agua-valor", data.agua.inputs.valor);
            tryCalc("calculateAgua");
        }

        rebuildList("agua", data.agua.list);
        const aguaPrev = exists("agua-previsao-container");
        const aguaDivider = exists("agua-divider");

        if (aguaPrev) {
            let previsaoText = data.agua.previsao || [];
            if (Array.isArray(data.agua.previsao)) {
                previsaoText = data.agua.previsao;
            } else if (typeof data.agua.previsao === "string") {
                previsaoText = data.agua.previsao
                    .split(/\n+|\s*-\s*/g)
                    .map(s => s.trim())
                    .filter(Boolean);
            }

            // Reconstruir lista de previsão igual ao rebuildList
            aguaPrev.innerHTML = "";
            (previsaoText || []).forEach(text => {
                const li = document.createElement("li");
                li.className = "list-group-item d-flex justify-content-between align-items-center";
                const span = document.createElement("span");
                span.textContent = text;
                const del = document.createElement("button");
                del.className = "btn btn-sm btn-outline-danger ms-3";
                del.textContent = "❌";
                del.addEventListener("click", () => {
                    li.remove();
                    recalcSectionTotal("agua");
                });
                li.appendChild(span);
                li.appendChild(del);
                aguaPrev.appendChild(li);
            });
            aguaDivider.style.display = previsaoText.length ? "block" : "none";
        }

        recalcSectionTotal("agua");
    }

    // ---------- Condomínio ----------
    if (data.condominio) {
        if (data.condominio.inputs) {
            setVal("cond-ultimo", data.condominio.inputs.ultimo || "");
            const cd = exists("cond-delivery");
            if (cd) cd.value = data.condominio.inputs.delivery || cd.value;
            setVal("cond-valor", data.condominio.inputs.valor);
            tryCalc("calculateCondominio");
        }

        rebuildList("cond", data.condominio.list);
        const condPrev = exists("cond-previsao-container");
        const condDivider = exists("cond-divider");

        if (condPrev) {
            let previsaoText = data.condominio.previsao || [];
            if (Array.isArray(data.condominio.previsao)) {
                previsaoText = data.condominio.previsao;
            } else if (typeof data.condominio.previsao === "string") {
                previsaoText = data.condominio.previsao
                    .split(/\n+|\s*-\s*/g)
                    .map(s => s.trim())
                    .filter(Boolean);
            }

            // Reconstruir lista de previsão igual ao rebuildList
            condPrev.innerHTML = "";
            (previsaoText || []).forEach(text => {
                const li = document.createElement("li");
                li.className = "list-group-item d-flex justify-content-between align-items-center";
                const span = document.createElement("span");
                span.textContent = text;
                const del = document.createElement("button");
                del.className = "btn btn-sm btn-outline-danger ms-3";
                del.textContent = "❌";
                del.addEventListener("click", () => {
                    li.remove();
                    recalcSectionTotal("cond");
                });
                li.appendChild(span);
                li.appendChild(del);
                condPrev.appendChild(li);
            });
            condDivider.style.display = previsaoText.length ? "block" : "none";
        }

        recalcSectionTotal("cond");
    }


    // ---------- Taxas Extras ----------
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
        recalcTaxasTotal();
    }
});

// ========== Helpers outside ==========
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
